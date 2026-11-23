import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Actions(Pages公開)のときだけ、リポジトリ名のサブパスを使う
const isPagesBuild = process.env.GITHUB_ACTIONS === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isPagesBuild ? '/Game-rakugaki-kitsune/' : '/',
})
