import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography,
  CircularProgress,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { wineApi } from '../services/api';
import WineCard from './WineCard';

const CharacteristicsBox = ({ characteristics }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" gutterBottom>와인 특성</Typography>
    <Grid container spacing={2}>
      {Object.entries(characteristics).map(([key, value]) => (
        <Grid item xs={6} key={key}>
          <Chip
            label={`${key}: ${value}`}
            sx={{ 
              width: '100%', 
              height: 'auto', 
              padding: '8px 0',
              '& .MuiChip-label': {
                whiteSpace: 'normal',
                display: 'block',
                padding: '8px'
              }
            }}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await wineApi.chatWithBot(input);
      console.log('API Response:', response); // 디버깅용
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response.response);
        console.log('Parsed Response:', parsedResponse); // 디버깅용
      } catch (e) {
        console.error('JSON Parse Error:', e);
        parsedResponse = { text: response.response };
      }
      
      const botMessage = { 
        type: 'bot', 
        content: response.response,
        parsedData: parsedResponse
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        type: 'bot', 
        content: '죄송합니다. 오류가 발생했습니다.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const renderMessageContent = (message) => {
    if (message.type === 'bot' && message.parsedData) {
      const data = message.parsedData;
      return (
        <Box>
          <Typography sx={{ mb: 2 }}>{data.text}</Typography>
          
          {data.characteristics && (
            <>
              <CharacteristicsBox characteristics={data.characteristics} />
              <Divider sx={{ my: 2 }} />
            </>
          )}
          
          {data.wines && (
            <Grid container spacing={2}>
              {data.wines.map((wine, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <WineCard wine={wine} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      );
    }
    return <Typography>{message.content}</Typography>;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', mt: 4, p: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          height: 600, 
          overflow: 'auto', 
          p: 2, 
          mb: 2,
          backgroundColor: '#f5f5f5'
        }}
      >
        {messages.map((msg, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              mb: 2,
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: msg.wines ? '90%' : '70%',
                backgroundColor: msg.type === 'user' ? '#1976d2' : 'white',
                color: msg.type === 'user' ? 'white' : 'black'
              }}
            >
              {renderMessageContent(msg)}
            </Paper>
          </Box>
        ))}
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="와인에 대해 물어보세요..."
          disabled={loading}
          sx={{ backgroundColor: 'white' }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading}
          endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          전송
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;