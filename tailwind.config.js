/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  corePlugins: {
    // Evita el reset global de Tailwind para no alterar el tema oscuro
    // existente (CSS Modules) usado por el resto del sitio.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        'ucr-primary': 'var(--ucr-primary)',
        'ucr-celeste': 'var(--ucr-celeste)',
        'ucr-naranja': 'var(--ucr-naranja)',
        'ucr-secondary': 'var(--ucr-secondary)',
        'ucr-secondary-container': 'var(--ucr-secondary-container)',
        'ucr-esmeralda': 'var(--ucr-esmeralda)',
        'ucr-surface': 'var(--ucr-surface)',
        'ucr-surface-container': 'var(--ucr-surface-container)',
        'ucr-surface-variant': 'var(--ucr-surface-variant)',
        'ucr-on-surface': 'var(--ucr-on-surface)',
        'ucr-on-surface-variant': 'var(--ucr-on-surface-variant)',
        'ucr-outline': 'var(--ucr-outline)',
        'ucr-outline-variant': 'var(--ucr-outline-variant)',
        'brand-esmeralda': 'var(--brand-esmeralda)',
        'brand-celeste': 'var(--brand-celeste)',
        'brand-naranja': 'var(--brand-naranja)',
        'brand-amarillo': 'var(--brand-amarillo)',
        'brand-azul': 'var(--brand-azul)',
        'brand-beige': 'var(--brand-beige)',
        'brand-rosa': 'var(--brand-rosa)',
        'brand-gris': 'var(--brand-gris)',
      },
      fontFamily: {
        'brand-heading': 'var(--font-brand-heading)',
        'brand-body': 'var(--font-brand-body)',
        'ucr-display': 'var(--font-ucr-display)',
      },
    },
  },
  plugins: [],
};
