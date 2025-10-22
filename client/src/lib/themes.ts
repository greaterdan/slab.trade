export type Theme = 'standard' | 'ocean' | 'forest' | 'sunset';

export interface ThemeConfig {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    border: string;
    text: string;
    muted: string;
    success: string;
    warning: string;
    destructive: string;
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  standard: {
    name: 'Standard',
    description: 'Warm beige theme',
    colors: {
      primary: '28 96% 44%', // warm amber
      secondary: '166 76% 34%', // teal green
      accent: '258 90% 58%', // purple
      background: '43 30% 97%', // soft warm white
      card: '0 0% 100%', // pure white
      border: '30 20% 88%', // soft beige border
      text: '20 10% 9%', // almost black, warm tone
      muted: '20 6% 45%', // medium gray
      success: '166 76% 34%', // teal green
      warning: '38 92% 50%', // amber
      destructive: '0 72% 51%', // red
    }
  },
  ocean: {
    name: 'Ocean',
    description: 'Deep blue ocean theme',
    colors: {
      primary: '188 94% 43%', // cyan-500
      secondary: '188 85% 35%', // cyan-600
      accent: '199 89% 48%', // sky-500
      background: '200 100% 22%', // sky-900
      card: '200 100% 28%', // sky-800
      border: '200 100% 32%', // sky-700
      text: '204 100% 97%', // sky-50
      muted: '199 89% 70%', // sky-300
      success: '188 94% 60%', // cyan-400
      warning: '38 92% 50%', // amber-500
      destructive: '0 84% 60%', // red-500
    }
  },
  forest: {
    name: 'Forest',
    description: 'Natural green forest theme',
    colors: {
      primary: '142 76% 36%', // emerald-500
      secondary: '142 76% 28%', // emerald-600
      accent: '142 76% 50%', // emerald-400
      background: '142 100% 15%', // emerald-900
      card: '142 100% 18%', // emerald-800
      border: '142 100% 22%', // emerald-700
      text: '138 100% 97%', // emerald-50
      muted: '142 76% 70%', // emerald-300
      success: '142 76% 36%', // green-500
      warning: '45 93% 47%', // yellow-500
      destructive: '0 84% 60%', // red-500
    }
  },
  sunset: {
    name: 'Sunset',
    description: 'Warm orange sunset theme',
    colors: {
      primary: '25 95% 53%', // orange-500
      secondary: '25 95% 45%', // orange-600
      accent: '25 95% 65%', // orange-400
      background: '25 100% 25%', // orange-900
      card: '25 100% 30%', // orange-800
      border: '25 100% 38%', // orange-700
      text: '25 100% 97%', // orange-50
      muted: '25 95% 85%', // orange-200
      success: '142 76% 36%', // green-500
      warning: '38 92% 50%', // amber-500
      destructive: '0 84% 60%', // red-500
    }
  }
};

export function getThemeCSSVariables(theme: Theme): string {
  const themeConfig = themes[theme];
  return `
    --primary: ${themeConfig.colors.primary};
    --secondary: ${themeConfig.colors.secondary};
    --accent: ${themeConfig.colors.accent};
    --background: ${themeConfig.colors.background};
    --card: ${themeConfig.colors.card};
    --border: ${themeConfig.colors.border};
    --text: ${themeConfig.colors.text};
    --muted: ${themeConfig.colors.muted};
    --success: ${themeConfig.colors.success};
    --warning: ${themeConfig.colors.warning};
    --destructive: ${themeConfig.colors.destructive};
  `;
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const themeConfig = themes[theme];
  
  // Apply HSL values directly to CSS variables
  root.style.setProperty('--primary', themeConfig.colors.primary);
  root.style.setProperty('--secondary', themeConfig.colors.secondary);
  root.style.setProperty('--accent', themeConfig.colors.accent);
  root.style.setProperty('--background', themeConfig.colors.background);
  root.style.setProperty('--card', themeConfig.colors.card);
  root.style.setProperty('--border', themeConfig.colors.border);
  root.style.setProperty('--foreground', themeConfig.colors.text);
  root.style.setProperty('--muted', themeConfig.colors.muted);
  root.style.setProperty('--success', themeConfig.colors.success);
  root.style.setProperty('--warning', themeConfig.colors.warning);
  root.style.setProperty('--destructive', themeConfig.colors.destructive);
  
  // Save to localStorage
  localStorage.setItem('slab-theme', theme);
}

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem('slab-theme');
  return (stored as Theme) || 'standard';
}

export function initializeTheme() {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}
