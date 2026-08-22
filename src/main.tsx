import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/app.css';
// After app.css, deliberately: the sprite layer overrides v1's radii, blurs and gradients
// at equal specificity, so it has to be the later of the two.
import './styles/pixel.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
