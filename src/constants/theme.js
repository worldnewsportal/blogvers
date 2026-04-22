// src/constants/theme.js
// ==========================================
// BlogVerse Design System
// ==========================================

export const COLORS = {
  // Brand Colors
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A42CC',
  secondary: '#FF6B6B',
  secondaryLight: '#FF8E8E',
  accent: '#4ECDC4',
  gold: '#FFD700',

  // Dark Theme
  dark: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceElevated: '#16213E',
    card: '#1E1E30',
    cardBorder: '#2A2A40',
    text: '#FFFFFF',
    textSecondary: '#A8A8B3',
    textMuted: '#6B6B80',
    divider: '#2A2A40',
    overlay: 'rgba(0,0,0,0.7)',
    inputBg: '#252538',
    badge: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Light Theme
  light: {
    background: '#F8F9FC',
    surface: '#FFFFFF',
    surfaceElevated: '#F0F2F8',
    card: '#FFFFFF',
    cardBorder: '#E8EAF0',
    text: '#1A1A2E',
    textSecondary: '#5A5A70',
    textMuted: '#9A9AB0',
    divider: '#E8EAF0',
    overlay: 'rgba(0,0,0,0.5)',
    inputBg: '#F0F2F8',
    badge: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Category Colors
  categories: [
    '#6C63FF', '#FF6B6B', '#4ECDC4', '#FFE66D',
    '#95E1D3', '#F38181', '#FCE38A', '#EAFFD0',
    '#FF9A3C', '#B8F0E6', '#C3A6FF', '#FF8FA3',
  ],
};

export const FONTS = {
  arabic: {
    regular: 'Cairo-Regular',
    medium: 'Cairo-Medium',
    semiBold: 'Cairo-SemiBold',
    bold: 'Cairo-Bold',
    extraBold: 'Cairo-ExtraBold',
    black: 'Cairo-Black',
  },
  english: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
    extraBold: 'Poppins-ExtraBold',
    black: 'Poppins-Black',
  },
  mono: 'FiraCode-Regular',
};

export const FONT_SIZES = {
  small: {
    xs: 10, sm: 12, base: 14, md: 15, lg: 16, xl: 18, '2xl': 20, '3xl': 24, '4xl': 28,
  },
  medium: {
    xs: 11, sm: 13, base: 15, md: 16, lg: 18, xl: 20, '2xl': 22, '3xl': 26, '4xl': 32,
  },
  large: {
    xs: 12, sm: 14, base: 16, md: 17, lg: 20, xl: 22, '2xl': 24, '3xl': 28, '4xl': 36,
  },
  xl: {
    xs: 13, sm: 15, base: 17, md: 18, lg: 22, xl: 24, '2xl': 26, '3xl': 30, '4xl': 40,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  xl: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const GRADIENTS = {
  primary: ['#6C63FF', '#4A42CC'],
  secondary: ['#FF6B6B', '#FF4757'],
  sunset: ['#FF6B6B', '#FFE66D'],
  ocean: ['#4ECDC4', '#6C63FF'],
  dark: ['#0F0F1A', '#1A1A2E'],
  card: ['#1A1A2E', '#16213E'],
  overlay: ['transparent', 'rgba(15,15,26,0.9)'],
  gold: ['#FFD700', '#FFA500'],
};

export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

export const SCREEN_PADDING = 16;
export const HEADER_HEIGHT = 60;
export const TAB_BAR_HEIGHT = 70;
export const CARD_HEIGHT = 280;
export const CARD_HEIGHT_HORIZONTAL = 120;
