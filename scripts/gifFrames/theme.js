// Mirror of constants/theme.ts for use in Node.js GIF generator
const UI = {
  hudBg:       '#1A1A2E',
  hudText:     '#F5ECD7',
  panelBg:     '#FFF0F5',
  panelBorder: '#E8B4C0',
  btnActive:   '#E8748A',
  btnDisabled: '#F0A0B0',
  btnText:     '#FFFFFF',
  textPrimary: '#3D2B1F',
  textSecondary:'#7A5C4F',
  textMuted:   '#B09080',
  success:     '#4CAF50',
  warning:     '#FFC107',
  danger:      '#F44336',
  gold:        '#D4A017',
  bg:          '#FAF3E0',
};

const FONT = {
  xs: 10, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24,
};

const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 32,
};

const RADIUS = {
  sm: 6, md: 10, lg: 16,
};

// Screen dims (iPhone 14 logical)
const W = 390;
const H = 844;

module.exports = { UI, FONT, SPACING, RADIUS, W, H };
