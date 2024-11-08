import React from 'react';
import { CssBaseline, Container, ThemeProvider, createTheme } from '@mui/material';
import ChatInterface from './components/ChatInterface';

const theme = createTheme({
  palette: {
    background: {
      default: '#f0f2f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <ChatInterface />
      </Container>
    </ThemeProvider>
  );
}

export default App;