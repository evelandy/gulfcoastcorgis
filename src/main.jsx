import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/bowlby-one/400.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './styles/tokens.css';
import './styles/site.css';
import './styles/admin.css';
import App from './App';
import { applySeo } from './lib/seo';

applySeo();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
