/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PluginObj, NodePath } from '@babel/core'
import * as BabelTypes from '@babel/types'

interface PluginStateData {
  componentName: string | null
  importsReact: boolean
  instrumentationImports: Set<string>
  hookCounter: number
  renderTrackerInserted: boolean
  filename: string
}

const HOOK_MAPPING: Record<string, string> = {
  useEffect: 'useTrackedEffect',
  useMemo: 'useTrackedMemo',
  useCallback: 'useTrackedCallback',
}

const REACT_HOOKS = new Set([
  'useEffect',
  'useMemo',
  'useCallback',
  'useState',
  'useReducer',
  'useContext',
  'useRef',
])

/**
 * Production-ready Babel plugin for automatic React hooks instrumentation.
 * Transforms useEffect, useMemo, useCallback calls to their tracked equivalents.
 */
function babelPluginReactHooksInstrumentation(): PluginObj {
  const stateMap = new WeakMap<Record<string, any>, PluginStateData>()

  return {
    name: 'babel-plugin-react-hooks-instrumentation',

    pre(file: any): void {
      stateMap.set(file, {
        componentName: null,
        importsReact: false,
        instrumentationImports: new Set(),
        hookCounter: 0,
        renderTrackerInserted: false,
        filename: file.opts?.filename || 'unknown',
      })
    },

    visitor: {
      ImportDeclaration(path: NodePath<any>, state: any) {
        const data = stateMap.get(state.file)
        if (!data) return

        const source = path.node.source.value

        if (source === 'react') {
          data.importsReact = true
          path.node.specifiers.forEach((spec: any) => {
            if (BabelTypes.isImportSpecifier(spec) && BabelTypes.isIdentifier(spec.imported)) {
              const imported = spec.imported.name
              if (REACT_HOOKS.has(imported)) {
                data.instrumentationImports.add(imported)
              }
            }
          })
        }
      },

      FunctionDeclaration(path: NodePath<any>, state: any) {
        const data = stateMap.get(state.file)
        if (!data) return

        const name = path.node.id?.name
        if (name && isReactComponent(name, path)) {
          data.componentName = name
          data.hookCounter = 0
          data.renderTrackerInserted = false
        }
      },

      ArrowFunctionExpression(path: NodePath<any>, state: any) {
        const data = stateMap.get(state.file)
        if (!data) return

        const parent = path.parent as any
        if (BabelTypes.isVariableDeclarator(parent) && BabelTypes.isIdentifier(parent.id)) {
          const name = parent.id.name
          if (isReactComponent(name, path)) {
            data.componentName = name
            data.hookCounter = 0
            data.renderTrackerInserted = false
          }
        }
      },

      CallExpression(path: NodePath<any>, state: any) {
        const data = stateMap.get(state.file)
        if (!data || !data.componentName || !data.importsReact) return

        const callee = path.node.callee
        const hookName = getCalleeIdentifierName(callee)

        if (hookName && HOOK_MAPPING[hookName]) {
          const trackedHookName = HOOK_MAPPING[hookName]
          const hookId = `${hookName}_${data.hookCounter++}`

          transformHookCall(path, trackedHookName, hookId, data.componentName)
          data.instrumentationImports.add(trackedHookName)
        }
      },

      BlockStatement(_path: NodePath<any>, _state: any) {
        // Skip auto-insertion of useRenderTracker - it's already in the code manually
        // Only transform existing hook calls (useEffect, useMemo, useCallback)
      },

      Program: {
        exit(path: NodePath<any>, state: any) {
          const data = stateMap.get(state.file)
          if (!data || data.instrumentationImports.size === 0) return

          // Check if instrumentation import already exists
          const hasInstrumentationImport = path.node.body.some(
            (node: any) =>
              BabelTypes.isImportDeclaration(node) &&
              node.source.value === './instrumentation/hookTrackers',
          )

          if (hasInstrumentationImport) {
            return // Already imported, don't add duplicate
          }

          // Find React import to insert after it
          const reactImportIndex = path.node.body.findIndex(
            (node: any) =>
              BabelTypes.isImportDeclaration(node) && node.source.value === 'react',
          )

          const imports = Array.from(data.instrumentationImports).sort()
          const instrumentationImport = BabelTypes.importDeclaration(
            imports.map((name: string) =>
              BabelTypes.importSpecifier(BabelTypes.identifier(name), BabelTypes.identifier(name)),
            ),
            BabelTypes.stringLiteral('./instrumentation/hookTrackers'),
          )

          const insertIndex = reactImportIndex >= 0 ? reactImportIndex + 1 : 0
          path.node.body.splice(insertIndex, 0, instrumentationImport)
        },
      },
    },
  }
}

function isReactComponent(name: string, path: NodePath<any>): boolean {
  if (!/^[A-Z]/.test(name)) return false

  const node = path.node as any
  const body = node.body

  if (BabelTypes.isBlockStatement(body)) {
    let hasReturn = false
    path.traverse({
      ReturnStatement(_node: any) {
        hasReturn = true
      },
    })
    return hasReturn
  }

  return true
}

function getCalleeIdentifierName(callee: any): string | null {
  if (BabelTypes.isIdentifier(callee)) {
    return callee.name
  }
  if (
    BabelTypes.isMemberExpression(callee) &&
    BabelTypes.isIdentifier(callee.property)
  ) {
    return callee.property.name
  }
  return null
}

function transformHookCall(
  path: NodePath<BabelTypes.CallExpression>,
  trackedHookName: string,
  hookId: string,
  componentName: string,
): void {
  const args = path.node.arguments

  if (args.length >= 1) {
    const callback = args[0]
    const deps = args[1] || BabelTypes.identifier('undefined')

    const newArgs = [
      BabelTypes.stringLiteral(componentName),
      BabelTypes.stringLiteral(hookId),
      callback,
      deps,
    ] as any

    path.node.callee = BabelTypes.identifier(trackedHookName)
    path.node.arguments = newArgs
  }
}

export default babelPluginReactHooksInstrumentation
