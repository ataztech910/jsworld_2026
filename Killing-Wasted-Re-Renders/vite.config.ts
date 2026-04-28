import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createReactHooksInstrumentationPlugin } from './babel-plugin-react-hooks-instrumentation/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    createReactHooksInstrumentationPlugin({
      // Babel plugin can be enabled with VITE_ENABLE_BABEL_INSTRUMENTATION=true
      // For now, we use manual instrumentation hooks as the production approach
      // enabled: process.env.VITE_ENABLE_BABEL_INSTRUMENTATION === 'true',
      exclude: /node_modules/,
    }),
    react(),
  ],
})
