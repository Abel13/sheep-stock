export const colors = {
  white: '#F4F4F4', // R: 244 G: 244 B: 244
  sage: '#A8AF8D', // R: 168 G: 175 B: 141
  olive: '#5B6B3C', // R: 91  G: 107 B: 60
  lavender: '#B9AACB', // R: 185 G: 170 B: 203
  purple: '#6A4F82', // R: 106 G: 79  B: 130
} as const;

export type ColorName = keyof typeof colors;
