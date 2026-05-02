import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createReactHooksInstrumentationPlugin } from './babel-plugin-react-hooks-instrumentation/vite-plugin'

export default defineConfig({
  plugins: [
    tailwindcss(),
    createReactHooksInstrumentationPlugin({
      enabled: process.env.VITE_ENABLE_BABEL_INSTRUMENTATION === 'true',
      exclude: /node_modules|presentation\/|ast-demo\//,
    }),
    react(),
  ],
})
