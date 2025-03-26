import { createTheme } from '@mui/material/styles';
import { Components, PaletteOptions, ThemeOptions } from '@mui/material/styles';
// theme file for dfic colours 

// Extending PaletteOptions for custom colors
interface CustomPalette extends PaletteOptions {
  summaryBox?: {
    background: string;
    border: string;
    header: string;
    text: string;
  };
}

// Extending ThemeOptions to include custom palette
interface CustomThemeOptions extends ThemeOptions {
  palette?: CustomPalette;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#800000', // DFIC red
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d32f2f',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#5c5c5c',
    },
    error: {
      main: '#ff4d4d',
    },
    success: {
      main: '#28a745',
    },
    summaryBox: {
      background: '#f8f8f8',
      border: '#e0e0e0',
      header: '#800000',
      text: '#333333',
    },
  } as CustomPalette,
  typography: {
    fontFamily: 'Poppins, "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 700,
    },
    body2: {
      color: '#5c5c5c',
    },
    summaryHeader: {
      fontSize: '1.1rem',
      fontWeight: 600,
      color: '#800000',
      marginBottom: '0.5rem',
    },
    summaryValue: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#333333',
    },
    summaryNote: {
      fontSize: '0.8rem',
      color: '#5c5c5c',
      fontStyle: 'italic',
    },
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#800000',
          color: '#ffffff',
          padding: '10px 24px',
          fontSize: '1.125rem',
          fontWeight: 600,
          borderRadius: '8px',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#600000',
          },
          '&:disabled': {
            backgroundColor: '#a8a7a7',
            color: '#ffffff',
          },
          transition: 'background-color 0.3s',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: '#f0f0f0',
          color: '#800000',
        },
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          padding: '12px',
          width: '150px',
          maxWidth: '150px',
          wordWrap: 'break-word',
          whiteSpace: 'normal',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      },
    },
    MuiBox: {
      variants: [
        {
          props: { variant: 'summaryBox' },
          style: {
            backgroundColor: '#f8f8f8',
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            '& .summary-header': {
              color: '#800000',
              fontWeight: 600,
              fontSize: '1.1rem',
              marginBottom: '8px',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px',
            },
            '& .summary-value': {
              fontSize: '1rem',
              fontWeight: 500,
              margin: '4px 0',
            },
            '& .summary-note': {
              fontSize: '0.8rem',
              color: '#5c5c5c',
              fontStyle: 'italic',
            },
          },
        },
      ],
    },
  } as Components,
} as CustomThemeOptions);

export default theme;
