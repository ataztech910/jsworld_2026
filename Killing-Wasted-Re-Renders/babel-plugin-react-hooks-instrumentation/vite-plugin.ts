import { transformSync } from '@babel/core'
import type { Plugin } from 'vite'
import babelPlugin from './index.js'

/**
 * Vite plugin that integrates the React hooks instrumentation Babel plugin.
 * Applies automatic instrumentation to .tsx files during development and build.
 */
export function createReactHooksInstrumentationPlugin(options?: {
  enabled?: boolean
  exclude?: RegExp
}): Plugin {
  const enabled = options?.enabled === true
  const exclude = options?.exclude || /node_modules/

  return {
    name: 'vite-plugin-react-hooks-instrumentation',
    enforce: 'pre',
    apply: 'serve',

    transform(code: string, id: string) {
      if (!enabled) {
        return null
      }

      // Only process TypeScript React files
      if (!id.endsWith('.tsx')) {
        return null
      }

      // Skip excluded files
      if (exclude.test(id)) {
        return null
      }

      // Skip instrumentation files themselves to avoid circular dependencies
      if (id.includes('instrumentation/') || id.includes('babel-plugin-')) {
        return null
      }

      try {
        const result = transformSync(code, {
          filename: id,
          parserOpts: {
            sourceType: 'module',
            allowImportExportEverywhere: true,
            allowReturnOutsideFunction: true,
            plugins: [
              'jsx',
              'typescript',
              ['decorators', { decoratorsBeforeExport: false }],
            ],
          },
          plugins: [babelPlugin],
          babelrc: false,
          configFile: false,
        })

        if (result?.code) {
          return {
            code: result.code,
            map: result.map,
          }
        }
      } catch (error) {
        // Log transformation errors but don't break the build
        console.warn(`[react-hooks-instrumentation] Transform error in ${id}:`, (error as any).message)
      }

      return null
    },
  }
}

export default createReactHooksInstrumentationPlugin
