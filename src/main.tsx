import { createRoot } from 'react-dom/client'
import '@fontsource/dm-serif-display/400.css'
import '@fontsource/work-sans/300.css'
import '@fontsource/work-sans/400.css'
import '@fontsource/work-sans/500.css'
import '@fontsource/work-sans/600.css'
import '@fontsource/work-sans/700.css'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
