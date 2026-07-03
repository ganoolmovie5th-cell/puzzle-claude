export interface Theme {
  bg: string;
  surface: string;
  surfaceBorder: string;
  card: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  textDim: string;
  overlay: string;
}

export const darkTheme: Theme = {
  bg: '#0f0f1a',
  surface: '#1a1a2e',
  surfaceBorder: '#2a2a4a',
  card: '#1a1a2e',
  accent: '#e94560',
  accentSoft: 'rgba(233,69,96,0.15)',
  text: '#ffffff',
  textMuted: '#8888a0',
  textDim: '#6a6a8a',
  overlay: 'rgba(0,0,0,0.85)',
};

export const lightTheme: Theme = {
  bg: '#f5f5f8',
  surface: '#ffffff',
  surfaceBorder: '#e0e0e8',
  card: '#ffffff',
  accent: '#e94560',
  accentSoft: 'rgba(233,69,96,0.1)',
  text: '#1a1a2e',
  textMuted: '#6a6a8a',
  textDim: '#9999aa',
  overlay: 'rgba(0,0,0,0.6)',
};
