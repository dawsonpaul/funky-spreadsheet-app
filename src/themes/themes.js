import { createTheme } from "@mui/material";

// Material Design 3 color tokens
const md3Colors = {
  light: {
    primary: '#006495',
    onPrimary: '#ffffff',
    primaryContainer: '#cce5ff',
    onPrimaryContainer: '#001e31',
    secondary: '#4f616e',
    onSecondary: '#ffffff',
    secondaryContainer: '#d2e5f5',
    onSecondaryContainer: '#0b1d29',
    tertiary: '#63597c',
    onTertiary: '#ffffff',
    tertiaryContainer: '#e9ddff',
    onTertiaryContainer: '#1f1635',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#410002',
    background: '#fcfcff',
    onBackground: '#1a1c1e',
    surface: '#fcfcff',
    onSurface: '#1a1c1e',
    surfaceVariant: '#dee3eb',
    onSurfaceVariant: '#42474e',
    outline: '#72777f',
  },
  dark: {
    primary: '#8bcdff',
    onPrimary: '#003351',
    primaryContainer: '#004b73',
    onPrimaryContainer: '#cce5ff',
    secondary: '#b6c9d8',
    onSecondary: '#21323f',
    secondaryContainer: '#374956',
    onSecondaryContainer: '#d2e5f5',
    tertiary: '#cdc1e9',
    onTertiary: '#342b4b',
    tertiaryContainer: '#4b4163',
    onTertiaryContainer: '#e9ddff',
    error: '#ffb4ab',
    onError: '#690005',
    errorContainer: '#93000a',
    onErrorContainer: '#ffdad6',
    background: '#1a1c1e',
    onBackground: '#e2e2e5',
    surface: '#1a1c1e',
    onSurface: '#e2e2e5',
    surfaceVariant: '#42474e',
    onSurfaceVariant: '#c2c7cf',
    outline: '#8c9198',
  },
};

const createMd3Theme = (mode) => {
  const colors = mode === 'dark' ? md3Colors.dark : md3Colors.light;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: colors.primaryContainer,
        dark: colors.onPrimaryContainer,
        contrastText: colors.onPrimary,
      },
      secondary: {
        main: colors.secondary,
        light: colors.secondaryContainer,
        dark: colors.onSecondaryContainer,
        contrastText: colors.onSecondary,
      },
      error: {
        main: colors.error,
        light: colors.errorContainer,
        dark: colors.onErrorContainer,
        contrastText: colors.onError,
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.onSurface,
        secondary: colors.onSurfaceVariant,
      },
      divider: colors.outline,
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '20px',
            textTransform: 'none',
            padding: '8px 24px',
            fontWeight: 500,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '24px',
          },
          elevation1: {
            boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '24px',
            padding: '16px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.outline}`,
          },
          head: {
            fontWeight: 600,
            backgroundColor: colors.surfaceVariant,
            color: colors.onSurfaceVariant,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: `${colors.surfaceVariant}20`,
            },
          },
        },
      },
    },
  });
};

export const lightTheme = createMd3Theme('light');
export const darkTheme = createMd3Theme('dark');