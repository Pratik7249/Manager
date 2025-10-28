// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Dedupe ensures only one React copy is used by Vite
    dedupe: ['react', 'react-dom']
  }
});
