// src/theme.ts
export const theme = {
  colors: {
    background: '#FFFFFF',      // [cite: 13]
    secondaryBG: '#F2F0F1',     // [cite: 14]
    userBubble: '#FFE3EE',      // [cite: 15]
    primaryAction: '#FF5C8A',   // [cite: 15]
    textPrimary: '#111111',     // [cite: 16]
    textSecondary: '#666666',   // [cite: 17]
    textTertiary: '#999999',    // [cite: 17]
    border: '#EAEAEA',          // [cite: 18]
  },
  typography: {
    fontFamily: 'Apple SD Gothic Neo', // [cite: 3]
    lineHeight: 1.45,                 // [cite: 3]
    headerTitle: { size: 20, weight: '700' as const }, // [cite: 5]
    sectionTitle: { size: 16, weight: '600' as const }, // [cite: 5]
    body: { size: 14, weight: '400' as const },         // [cite: 6]
    caption: { size: 12, weight: '400' as const },      // [cite: 6]
    tag: { size: 12, weight: '500' as const },          // [cite: 7]
  },
  spacing: {
    xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, // [cite: 8, 9]
    screenPadding: 16, // [cite: 9]
    cardGap: 12,       // [cite: 9]
  },
  radius: {
    chatBubble: 20,     // [cite: 10]
    card: 16,           // [cite: 10]
    button: 12,         // [cite: 11]
    bottomSheet: 20,    // [cite: 11]
  }
};