import '@testing-library/jest-dom/vitest';

// jsdom no implementa matchMedia; se simula una pantalla de escritorio para useMediaQuery.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: /min-width/.test(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
