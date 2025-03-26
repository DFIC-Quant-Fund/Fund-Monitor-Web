import { createTheme } from '@mui/material/styles';
// theme file for dfic colours 
const theme = createTheme({
  palette: {
    primary: {
      main: '#800000', //dfic red 
      contrastText: '#ffffff', //white 
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
    // Summary box colors
    summaryBox: {
      background: '#f8f8f8',
      border: '#e0e0e0',
      header: '#800000',
      text: '#333333',
    },
  },
  typography: {
    fontFamily: 'Poppins, "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 700,
    },
    body2: {
      color: '#5c5c5c',
    },
    // Typography for summary boxes
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
  spacing: 8, // Adding a custom spacing scale
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#800000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#a00000',
          },
          '&:disabled': {
            backgroundColor: '#d3d3d3',
            color: '#ffffff',
          },
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
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          padding: 0,
        }
      }
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
  },
});

export default theme;
