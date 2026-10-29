import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// base: './' にすると、GitHub Pages（https://ユーザー名.github.io/リポジトリ名/）でもそのまま動く。
export default defineConfig({
  base: './',
  plugins: [react()],
})
