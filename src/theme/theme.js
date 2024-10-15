import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgb(151, 147, 235)',
      light: '#FFF9FF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: 'rgb(235, 147, 151)',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#121215',
      paper: '#1E1E23',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgb(200, 200, 200)',
    },
    error: {
      main: 'rgb(235, 87, 87)',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: 'rgb(235, 187, 87)',
    },
    success: {
      main: 'rgb(87, 235, 151)',
    },
    info: {
      main: 'rgb(66, 165, 245)',
    },
    divider: 'rgba(255, 255, 255, 0.1)',
    // ... existing code ...
  },
  // Custom properties
  customColors: {
    surface: '#1E1E23',
    disabledBackground: 'rgb(50, 50, 50)',
    disabledLight: 'rgb(70, 70, 70)',
    disabled: 'rgb(100, 100, 100)',
  },
});

export default darkTheme;

