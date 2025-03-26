import '@mui/material/Paper';

// declaration file for types used in MUI 
declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    summary: true;
  }
}