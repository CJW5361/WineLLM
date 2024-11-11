import React from 'react';
import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import ChatInterface from './components/ChatInterface';
import TasteProfileSetup from './components/TasteProfileSetup';
import { TasteProvider, useTaste } from './context/TasteContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#722F37',
      light: '#9C4B54',
      dark: '#4A1F24',
    },
    secondary: {
      main: '#9C2740',
      light: '#B85468',
      dark: '#6B1B2C',
    },
    background: {
      default: '#F8F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C1810',
      secondary: '#5C4033',
    },
  },
  typography: {
    fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const MainContent = () => {
  const { tasteProfile } = useTaste();

  return (
    <Container maxWidth="lg">
      {!tasteProfile ? <TasteProfileSetup /> : <ChatInterface />}
    </Container>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TasteProvider>
        <MainContent />
      </TasteProvider>
    </ThemeProvider>
  );
}

export default App;