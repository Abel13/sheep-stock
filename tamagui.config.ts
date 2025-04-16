import { createAnimations } from '@tamagui/animations-moti';
import { createTamagui, createTokens } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { themes as defaultThemes, tokens } from '@tamagui/themes';

const palette = {
  white: '#F4F4F4',
  sage: '#A8AF8D',
  olive: '#5B6B3C',
  lavender: '#B9AACB',
  purple: '#6A4F82',
} as const;

const customTokens = createTokens({
  ...tokens,
  color: {
    ...tokens.color,
    white: palette.white,
    sage: palette.sage,
    olive: palette.olive,
    lavender: palette.lavender,
    purple: palette.purple,
  },
});

const customThemes = {
  ...defaultThemes,
  light: {
    ...defaultThemes.light,
    background: palette.white,
    color: palette.olive,
    borderColor: palette.sage,
    borderColorHover: palette.olive,
  },
  dark: {
    ...defaultThemes.dark,
    background: palette.olive,
    color: palette.white,
    borderColor: palette.sage,
    borderColorHover: palette.lavender,
  },
  active: {
    background: palette.purple,
    color: palette.white,
  },
  gray_active: {
    background: palette.sage,
    color: palette.white,
  },
};

const config = createTamagui({
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: createInterFont(),
    body: createInterFont(),
  },
  themes: customThemes,
  tokens: customTokens,
  animations: createAnimations({
    fast: {
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    medium: {
      damping: 10,
      mass: 0.9,
      stiffness: 100,
    },
    slow: {
      damping: 20,
      stiffness: 60,
    },
  }),
});

export type AppConfig = typeof config;
export default config;
