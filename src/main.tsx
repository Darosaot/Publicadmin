import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initialLocale, loadLocale } from './i18n';
import './styles/app.css';
// After app.css, deliberately: the sprite layer overrides v1's radii, blurs and gradients
// at equal specificity, so it has to be the later of the two.
import './styles/pixel.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container #root not found');

// A returning Spanish reader's dictionary has to be in memory before the first paint, or the
// title screen would flash in English. The default language costs nothing to wait for.
void loadLocale(initialLocale()).finally(() => {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
