/**
 * 主题
 */
export const THEME = {
  DARK: 'dark',
  LIGHT: 'light',
} as const;

/**
 * 主题类型
 */
export type THEME_TYPE = (typeof THEME)[keyof typeof THEME];
