import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// Kontrast-Stufen (WCAG AA): Text ≥ 4,5:1, Rahmen/Icons ≥ 3:1 — auch auf älteren, kontrastarmen
// Laptop-Displays lesbar. Aura nimmt sonst Primär 500 (Weiß darauf 2,85:1) und für gedämpften
// Text Surface 500 (2,88:1 auf Weiß); hier je zwei Stufen dunkler.
// Die App läuft nur hell (`darkModeSelector: false`), daher feste Werte statt `light-dark()`.
export const IndustryPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef6ff', 100: '#eef6ff', 200: '#d6ebff', 300: '#b5d9fd', 400: '#94bce3',
      500: '#749dc4', 600: '#597ea3', 700: '#416180', 800: '#2c455d', 900: '#1d2d3d', 950: '#1d2d3d',
      color: '{primary.700}', // Weiß darauf 6,5:1
      contrastColor: '#ffffff',
      hoverColor: '{primary.800}',
      activeColor: '{primary.900}',
    },
    surface: {
      0: '#ffffff', 50: '#f5f5f8', 100: '#f5f5f8', 200: '#e7e7ea', 300: '#d4d4d7',
      400: '#b7b7ba', 500: '#98989b', 600: '#7a7a7d', 700: '#5d5d60', 800: '#424244', 900: '#2b2b2d', 950: '#2b2b2d',
    },
    focusRing: {
      width: '2px',
    },
    text: {
      color: '{surface.900}', // 14:1 auf Weiß
      hoverColor: '{surface.950}',
      mutedColor: '{surface.700}', // 6,6:1 auf Weiß
      hoverMutedColor: '{surface.800}',
    },
    formField: {
      borderColor: '{surface.600}', // 4,3:1 — Feldgrenze bleibt sichtbar
      hoverBorderColor: '{surface.700}',
      color: '{surface.900}',
      disabledColor: '{surface.600}',
      placeholderColor: '{surface.600}',
      floatLabelColor: '{surface.700}',
      floatLabelActiveColor: '{surface.700}',
      floatLabelFocusColor: '{primary.700}',
      iconColor: '{surface.600}',
    },
    content: {
      borderColor: '{surface.300}',
    },
    navigation: {
      item: {
        icon: {
          color: '{surface.700}',
          focusColor: '{surface.800}',
          activeColor: '{surface.800}',
        },
      },
    },
  },
  components: {
    // Sekundäre Buttons haben bei Aura Text in Surface 500/600 (2,9:1 bzw. 4,3:1) und kaum
    // sichtbare Rahmen (Surface 100/200).
    button: {
      root: {
        secondary: {
          color: '{surface.800}',
          hoverColor: '{surface.900}',
          activeColor: '{surface.950}',
          background: '{surface.200}',
          hoverBackground: '{surface.300}',
          activeBackground: '{surface.400}',
          borderColor: '{surface.200}',
          hoverBorderColor: '{surface.300}',
          activeBorderColor: '{surface.400}',
        },
      },
      outlined: {
        secondary: {
          color: '{surface.800}',
          borderColor: '{surface.500}',
        },
      },
      text: {
        secondary: {
          color: '{surface.800}',
        },
      },
    },
  },
});
