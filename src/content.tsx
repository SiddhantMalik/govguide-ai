import React from 'react';
import { createRoot } from 'react-dom/client';
import GovGuideApp from './GovGuideApp';
import './index.css';

// In a real extension, this would be injected into the page.
const injectGovGuide = () => {
  const container = document.createElement('div');
  container.id = 'govguide-extension-root';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<GovGuideApp />);
};

if (typeof window !== 'undefined') {
  window.addEventListener('load', injectGovGuide);
}
