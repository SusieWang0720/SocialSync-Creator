import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    // Set base to the repository name for GitHub Pages deployment
    base: '/SocialSync-Creator/',
    define: {
      // Shim process.env.API_KEY for the code to work as written
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});