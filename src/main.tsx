import { ViteReactSSG } from 'vite-react-ssg/single-page'
import '@fontsource-variable/manrope/index.css'
import './styles/global.scss'
import App from './App'

// vite-react-ssg пре-рендерит страницу в dist/index.html и гидрирует её на клиенте.
export const createRoot = ViteReactSSG(<App />)
