import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@mocks': path.resolve(__dirname, 'src/mocks'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@app-types': path.resolve(__dirname, 'src/types'),
      '@colors': path.resolve(__dirname, 'src/colors'),
      '@redux': path.resolve(__dirname, 'src/redux-toolkit'),
      '@root': path.resolve(__dirname, 'src')
    }
  }
});
