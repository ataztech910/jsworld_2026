#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';

const traverse = traverseModule.default;
const generate = generateModule.default;

const HEAVY_METHODS = new Set(['reduce', 'sort']);
const MISSING_MEMO_METHODS = new Set(['map', 'filter', 'reduce']);
const EXPENSIVE_MATH_METHODS = new Set(['pow', 'sqrt', 'sin', 'cos', 'tan', 'log', 'exp']);

const GOAL_BY_TYPE = {
  'inline-handler-in-map': 'stabilize handler reference to reduce rerenders',
  'heavy-computation-in-render': 'avoid recomputation during render',
  'missing-memoization': 'memoize derived data to prevent unnecessary recalculation',
};

function isUpperCaseStart(value) {
  return typeof value === 'string' && value.length > 0 && value[0] === value[0].toUpperCase();
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value, maxLength = 260) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function nodeToCode(node, maxLength = null) {
  if (!node) {
    return '';
  }

  const raw = generate(node, {
    comments: false,
    concise: true,
    retainLines: false,
    compact: false,
  }).code;

  const normalized = normalizeWhitespace(raw);
  if (typeof maxLength === 'number') {
    return truncate(normalized, maxLength);
  }

  return normalized;
}

function getComponentNameFromFunctionPath(functionPath) {
  if (functionPath.isFunctionDeclaration()) {
    const name = functionPath.node.id?.name;
    if (isUpperCaseStart(name)) {
      return name;
    }
  }

  if (functionPath.isFunctionExpression() || functionPath.isArrowFunctionExpression()) {
    const parentPath = functionPath.parentPath;
    if (parentPath?.isVariableDeclarator() && parentPath.node.id.type === 'Identifier') {
      const name = parentPath.node.id.name;
      if (isUpperCaseStart(name)) {
        return name;
      }
    }
  }

  return null;
}

function isUseMemoCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee?.type === 'Identifier' &&
    node.callee.name === 'useMemo'
  );
}

function getCalledMethodName(node) {
  if (!node || node.type !== 'CallExpression') {
    return null;
  }

  if (node.callee.type === 'MemberExpression') {
    if (!node.callee.computed && node.callee.property.type === 'Identifier') {
      return node.callee.property.name;
    }

    if (node.callee.computed && node.callee.property.type === 'StringLiteral') {
      return node.callee.property.value;
    }
  }

  return null;
}

function isLoopPath(pathToCheck) {
  return (
    pathToCheck.isForStatement() ||
    pathToCheck.isForInStatement() ||
    pathToCheck.isForOfStatement() ||
    pathToCheck.isWhileStatement() ||
    pathToCheck.isDoWhileStatement()
  );
}

function callbackReturnsJSX(callbackPath) {
  if (callbackPath.isArrowFunctionExpression()) {
    const bodyPath = callbackPath.get('body');
    if (bodyPath.isJSXElement() || bodyPath.isJSXFragment()) {
      return true;
    }
  }

  let found = false;
  callbackPath.traverse({
    ReturnStatement(returnPath) {
      const argument = returnPath.node.argument;
      if (argument && (argument.type === 'JSXElement' || argument.type === 'JSXFragment')) {
        found = true;
        returnPath.stop();
      }
    },
  });

  return found;
}

function getJSXReturnPath(callbackPath) {
  if (callbackPath.isArrowFunctionExpression()) {
    const bodyPath = callbackPath.get('body');
    if (bodyPath.isJSXElement() || bodyPath.isJSXFragment()) {
      return bodyPath;
    }
  }

  let foundPath = null;
  callbackPath.traverse({
    ReturnStatement(returnPath) {
      const argPath = returnPath.get('argument');
      if (argPath.isJSXElement() || argPath.isJSXFragment()) {
        foundPath = argPath;
        returnPath.stop();
      }
    },
  });

  return foundPath;
}

function getShortJSXTagName(jsxPath) {
  if (!jsxPath) {
    return 'JSX';
  }

  if (jsxPath.isJSXFragment()) {
    return '<>...</>';
  }

  const opening = jsxPath.node.openingElement;
  const nameNode = opening.name;

  if (nameNode.type === 'JSXIdentifier') {
    return `<${nameNode.name} ... />`;
  }

  return `<${nodeToCode(nameNode, 40)} ... />`;
}

function buildInlineMapContext(mapCallPath, callbackPath) {
  const objectNode =
    mapCallPath.node.callee.type === 'MemberExpression' ? mapCallPath.node.callee.object : null;
  const collectionCode = objectNode ? nodeToCode(objectNode, 90) : 'items';

  let itemName = 'item';
  const firstParam = callbackPath.node.params[0];
  if (firstParam?.type === 'Identifier') {
    itemName = firstParam.name;
  }

  const jsxReturnPath = getJSXReturnPath(callbackPath);
  const renderedPart = getShortJSXTagName(jsxReturnPath);

  return truncate(`${collectionCode}.map(${itemName} => ${renderedPart})`, 220);
}

function isInsideUseMemo(pathToCheck, componentPath) {
  let cursor = pathToCheck;

  while (cursor && cursor !== componentPath) {
    if (cursor.isCallExpression() && isUseMemoCall(cursor.node)) {
      return true;
    }
    cursor = cursor.parentPath;
  }

  return false;
}

function buildLocalContext(pathToCheck) {
  let cursor = pathToCheck.parentPath;
  let steps = 0;

  while (cursor && steps < 1) {
    const parent = cursor.parentPath;

    if (!parent) {
      break;
    }

    if (
      parent.isProgram() ||
      parent.isFunctionDeclaration() ||
      parent.isFunctionExpression() ||
      parent.isArrowFunctionExpression()
    ) {
      break;
    }

    cursor = parent;
    steps += 1;
  }

  if (!cursor || cursor.isProgram()) {
    return '';
  }

  return nodeToCode(cursor.node, 220);
}

function shouldIncludeIdentifier(node, parent, key) {
  if (!parent) {
    return true;
  }

  if ((parent.type === 'MemberExpression' || parent.type === 'OptionalMemberExpression') && key === 'property') {
    return !!parent.computed;
  }

  if ((parent.type === 'ObjectProperty' || parent.type === 'ObjectMethod') && key === 'key') {
    return !!parent.computed;
  }

  if (parent.type === 'VariableDeclarator' && key === 'id') {
    return false;
  }

  if (
    (parent.type === 'FunctionDeclaration' ||
      parent.type === 'FunctionExpression' ||
      parent.type === 'ArrowFunctionExpression') &&
    (key === 'id' || key === 'params')
  ) {
    return false;
  }

  if (parent.type === 'AssignmentPattern' && key === 'left') {
    return false;
  }

  if (
    parent.type === 'ImportSpecifier' ||
    parent.type === 'ImportDefaultSpecifier' ||
    parent.type === 'ImportNamespaceSpecifier' ||
    parent.type === 'LabeledStatement'
  ) {
    return false;
  }

  if (parent.type === 'CatchClause' && key === 'param') {
    return false;
  }

  if (parent.type === 'JSXAttribute' && key === 'name') {
    return false;
  }

  if (parent.type === 'ObjectPattern' && key === 'key') {
    return false;
  }

  return node.type === 'Identifier';
}

function collectIdentifiers(node) {
  const values = new Set();

  function walk(current, parent = null, key = null) {
    if (!current) {
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item) => walk(item, parent, key));
      return;
    }

    if (typeof current !== 'object') {
      return;
    }

    if (current.type === 'Identifier' && shouldIncludeIdentifier(current, parent, key)) {
      values.add(current.name);
    }

    for (const [childKey, childValue] of Object.entries(current)) {
      if (childKey === 'loc' || childKey === 'start' || childKey === 'end' || childKey === 'extra') {
        continue;
      }

      if (Array.isArray(childValue)) {
        childValue.forEach((item) => walk(item, current, childKey));
      } else if (childValue && typeof childValue === 'object') {
        walk(childValue, current, childKey);
      }
    }
  }

  walk(node);
  return Array.from(values).sort();
}

function formatLocation(filePath, node) {
  const line = node?.loc?.start?.line ?? '?';
  return `${path.basename(filePath)}:${line}`;
}

function addFinding(findings, seen, { componentName, type, filePath, codeNode, context, contextPath }) {
  if (!codeNode?.loc?.start) {
    return;
  }

  const code = nodeToCode(codeNode);
  const location = formatLocation(filePath, codeNode);
  const effectiveContext = context ?? buildLocalContext(contextPath);
  const variables = collectIdentifiers(codeNode);
  const goal = GOAL_BY_TYPE[type] ?? '';

  const uniqueKey = `${componentName}|${type}|${location}|${code}`;
  if (seen.has(uniqueKey)) {
    return;
  }

  seen.add(uniqueKey);
  findings.push({
    componentName,
    type,
    location,
    code,
    context: effectiveContext,
    variables,
    goal,
  });
}

function isExpensiveMathCall(node) {
  if (node.type !== 'CallExpression') {
    return false;
  }

  if (node.callee.type !== 'MemberExpression') {
    return false;
  }

  if (node.callee.object.type !== 'Identifier' || node.callee.object.name !== 'Math') {
    return false;
  }

  if (node.callee.property.type !== 'Identifier') {
    return false;
  }

  return EXPENSIVE_MATH_METHODS.has(node.callee.property.name);
}

function analyzeComponent(componentPath, componentName, filePath, findings) {
  const seen = new Set();

  componentPath.traverse({
    CallExpression(callPath) {
      const ownerFunction = callPath.getFunctionParent();
      if (ownerFunction !== componentPath) {
        return;
      }

      const node = callPath.node;
      const methodName = getCalledMethodName(node);

      if (methodName === 'map') {
        const callbackArgPath = callPath
          .get('arguments')
          .find((argPath) => argPath.isArrowFunctionExpression() || argPath.isFunctionExpression());

        if (callbackArgPath && callbackReturnsJSX(callbackArgPath)) {
          callbackArgPath.traverse({
            JSXAttribute(attributePath) {
              const valuePath = attributePath.get('value');
              if (!valuePath.isJSXExpressionContainer()) {
                return;
              }

              const expressionPath = valuePath.get('expression');
              if (!expressionPath.isArrowFunctionExpression()) {
                return;
              }

              addFinding(findings, seen, {
                componentName,
                type: 'inline-handler-in-map',
                filePath,
                codeNode: attributePath.node,
                context: buildInlineMapContext(callPath, callbackArgPath),
                contextPath: attributePath,
              });
            },
          });
        }
      }

      if (
        (HEAVY_METHODS.has(methodName ?? '') || isExpensiveMathCall(node)) &&
        !isInsideUseMemo(callPath, componentPath)
      ) {
        addFinding(findings, seen, {
          componentName,
          type: 'heavy-computation-in-render',
          filePath,
          codeNode: node,
          contextPath: callPath,
        });
      }
    },

    ForStatement(loopPath) {
      const ownerFunction = loopPath.getFunctionParent();
      if (ownerFunction !== componentPath || isInsideUseMemo(loopPath, componentPath)) {
        return;
      }

      const parentLoop = loopPath.findParent((parentPath) => {
        return parentPath !== loopPath && isLoopPath(parentPath) && parentPath.getFunctionParent() === componentPath;
      });

      if (!parentLoop) {
        return;
      }

      addFinding(findings, seen, {
        componentName,
        type: 'heavy-computation-in-render',
        filePath,
        codeNode: loopPath.node,
        contextPath: loopPath,
      });
    },

    WhileStatement(loopPath) {
      const ownerFunction = loopPath.getFunctionParent();
      if (ownerFunction !== componentPath || isInsideUseMemo(loopPath, componentPath)) {
        return;
      }

      const parentLoop = loopPath.findParent((parentPath) => {
        return parentPath !== loopPath && isLoopPath(parentPath) && parentPath.getFunctionParent() === componentPath;
      });

      if (!parentLoop) {
        return;
      }

      addFinding(findings, seen, {
        componentName,
        type: 'heavy-computation-in-render',
        filePath,
        codeNode: loopPath.node,
        contextPath: loopPath,
      });
    },

    ForOfStatement(loopPath) {
      const ownerFunction = loopPath.getFunctionParent();
      if (ownerFunction !== componentPath || isInsideUseMemo(loopPath, componentPath)) {
        return;
      }

      const parentLoop = loopPath.findParent((parentPath) => {
        return parentPath !== loopPath && isLoopPath(parentPath) && parentPath.getFunctionParent() === componentPath;
      });

      if (!parentLoop) {
        return;
      }

      addFinding(findings, seen, {
        componentName,
        type: 'heavy-computation-in-render',
        filePath,
        codeNode: loopPath.node,
        contextPath: loopPath,
      });
    },

    ForInStatement(loopPath) {
      const ownerFunction = loopPath.getFunctionParent();
      if (ownerFunction !== componentPath || isInsideUseMemo(loopPath, componentPath)) {
        return;
      }

      const parentLoop = loopPath.findParent((parentPath) => {
        return parentPath !== loopPath && isLoopPath(parentPath) && parentPath.getFunctionParent() === componentPath;
      });

      if (!parentLoop) {
        return;
      }

      addFinding(findings, seen, {
        componentName,
        type: 'heavy-computation-in-render',
        filePath,
        codeNode: loopPath.node,
        contextPath: loopPath,
      });
    },

    DoWhileStatement(loopPath) {
      const ownerFunction = loopPath.getFunctionParent();
      if (ownerFunction !== componentPath || isInsideUseMemo(loopPath, componentPath)) {
        return;
      }

      const parentLoop = loopPath.findParent((parentPath) => {
        return parentPath !== loopPath && isLoopPath(parentPath) && parentPath.getFunctionParent() === componentPath;
      });

      if (!parentLoop) {
        return;
      }

      addFinding(findings, seen, {
        componentName,
        type: 'heavy-computation-in-render',
        filePath,
        codeNode: loopPath.node,
        contextPath: loopPath,
      });
    },

    VariableDeclarator(variablePath) {
      const ownerFunction = variablePath.getFunctionParent();
      if (ownerFunction !== componentPath) {
        return;
      }

      const initPath = variablePath.get('init');
      if (!initPath.isCallExpression() || isUseMemoCall(initPath.node)) {
        return;
      }

      const methodName = getCalledMethodName(initPath.node);
      if (!MISSING_MEMO_METHODS.has(methodName ?? '')) {
        return;
      }

      const declarationNode = variablePath.parentPath.isVariableDeclaration()
        ? variablePath.parentPath.node
        : variablePath.node;

      addFinding(findings, seen, {
        componentName,
        type: 'missing-memoization',
        filePath,
        codeNode: declarationNode,
        contextPath: variablePath,
      });
    },
  });
}

function collectComponentCandidates(ast) {
  const candidates = [];

  traverse(ast, {
    FunctionDeclaration(functionPath) {
      const name = getComponentNameFromFunctionPath(functionPath);
      if (name) {
        candidates.push({ name, path: functionPath });
      }
    },

    VariableDeclarator(variablePath) {
      const initPath = variablePath.get('init');
      if (!initPath.isArrowFunctionExpression() && !initPath.isFunctionExpression()) {
        return;
      }

      const name = getComponentNameFromFunctionPath(initPath);
      if (name) {
        candidates.push({ name, path: initPath });
      }
    },
  });

  return candidates;
}

function pickPrimaryComponent(componentCandidates, findings) {
  if (findings.length === 0) {
    return componentCandidates[0]?.name ?? 'UnknownComponent';
  }

  const counts = new Map();
  findings.forEach((finding) => {
    counts.set(finding.componentName, (counts.get(finding.componentName) ?? 0) + 1);
  });

  let bestName = findings[0].componentName;
  let bestCount = counts.get(bestName) ?? 0;

  counts.forEach((count, name) => {
    if (count > bestCount) {
      bestCount = count;
      bestName = name;
    }
  });

  return bestName;
}

function printReadableFindings(componentName, findings) {
  console.log(`Component: ${componentName}`);

  if (findings.length === 0) {
    console.log('No findings.');
    return;
  }

  console.log(`Findings: ${findings.length}`);
  findings.forEach((finding, index) => {
    console.log(`\n${index + 1}. [${finding.type}] ${finding.location}`);
    console.log(`   code: ${finding.code}`);
    console.log(`   context: ${finding.context}`);
    console.log(`   variables: ${JSON.stringify(finding.variables)}`);
    console.log(`   goal: ${finding.goal}`);
  });
}

function main() {
  const inputFile = process.argv[2];

  if (!inputFile) {
    console.error('Usage: node scripts/analyze-react-perf.mjs <path-to-react-file>');
    process.exit(1);
  }

  const absoluteFilePath = path.resolve(process.cwd(), inputFile);

  if (!fs.existsSync(absoluteFilePath)) {
    console.error(`File not found: ${absoluteFilePath}`);
    process.exit(1);
  }

  const source = fs.readFileSync(absoluteFilePath, 'utf8');

  const ast = parse(source, {
    sourceType: 'unambiguous',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  });

  const componentCandidates = collectComponentCandidates(ast);
  const allFindings = [];

  componentCandidates.forEach((candidate) => {
    analyzeComponent(candidate.path, candidate.name, absoluteFilePath, allFindings);
  });

  const outputComponentName = pickPrimaryComponent(componentCandidates, allFindings);

  const findings = allFindings
    .filter((finding) => finding.componentName === outputComponentName)
    .map(({ type, location, code, context, variables, goal }) => ({
      type,
      location,
      code,
      context,
      variables,
      goal,
    }));

  printReadableFindings(outputComponentName, findings);

  const jsonOutput = {
    component: outputComponentName,
    findings,
  };

  console.log('\nJSON Output:');
  console.log(JSON.stringify(jsonOutput, null, 2));
}

main();
