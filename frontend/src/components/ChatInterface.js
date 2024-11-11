import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Avatar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import { wineApi } from '../services/api';
import WineCard from './WineCard';
import { useTaste } from '../context/TasteContext';

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
  const { tasteProfile } = useTaste();
  const [lastRecommendations, setLastRecommendations] = useState(null);

  // 컴포넌트 마운트 시 초기 메시지 설정
  useEffect(() => {
    if (tasteProfile) {
      const getPreferenceDescription = (value) => {
        if (value >= 4) return '높은';
        if (value >= 3) return '중간';
        return '낮은';
      };

      const wineTypes = tasteProfile.preferred_types.map(type => {
        switch(type) {
          case '레드': return '🍷 레드와인';
          case '화이트': return '🥂 화이트와인';
          case '스파클링': return '✨ 스파클링와인';
          case '로제': return '🌸 로제와인';
          default: return type;
        }
      }).join(', ');

      const priceRange = tasteProfile.price_range;
      const formatPrice = (price) => price.toLocaleString('ko-KR');

      const welcomeMessage = {
        type: 'bot',
        parsedData: {
          type: 'text',
          text: `안녕하세요! 고객님의 와인 취향 프로필을 분석해보았습니다.

${wineTypes}를 선호하시는군요! 

고객님은 다음과 같은 특징의 와인을 좋아하실 것 같습니다:
• ${getPreferenceDescription(tasteProfile.preferred_sweetness)} 당도
• ${getPreferenceDescription(tasteProfile.preferred_acidity)} 산도
• ${getPreferenceDescription(tasteProfile.preferred_body)} 바디감
• ${getPreferenceDescription(tasteProfile.preferred_tannin)} 타닌

가격대는 ${formatPrice(priceRange[0])}원 ~ ${formatPrice(priceRange[1])}원 사이를 선호하시네요.

어떤 와인을 추천해드릴까요? 
다음과 같이 물어보실 수 있습니다:
🍷 "오늘 스테이크랑 먹을 와인 추천해주세요"
🍷 "가벼운 화이트와인 추천해주세요"
🍷 "3만원대 와인 추천해주세요"
🍷 "타닌이 적은 레드와인 알려주세요"

또는 와인에 대해 궁금한 점을 자유롭게 물어보세요!`
        }
      };

      setMessages([welcomeMessage]);
    }
  }, [tasteProfile]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await wineApi.chat({
        message: input,
        taste_profile: tasteProfile,
        last_recommendations: lastRecommendations
      });

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response.response);
      } catch (e) {
        console.error('Error parsing response:', e);
        parsedResponse = {
          type: 'text',
          text: response.response || '응답을 처리하는 중 오류가 발생했습니다.'
        };
      }

      const botMessage = { 
        type: 'bot', 
        parsedData: parsedResponse
      };

      // 추천 응답인 경우 마지막 추천 와인 저장
      if (botMessage.parsedData.type === 'recommendation') {
        setLastRecommendations(botMessage.parsedData.wines);
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.detail || '죄송합니다. 오류가 발생했습니다.';
      setMessages(prev => [...prev, {
        type: 'bot',
        parsedData: {
          type: 'error',
          text: errorMessage
        }
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (message) => {
    if (message.type === 'bot' && message.parsedData) {
      const data = message.parsedData;
      
      // 추천 응답일 경우
      if (data.type === 'recommendation') {
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
              <Grid 
                container 
                spacing={3} 
                justifyContent="center"
                sx={{ mt: 1 }}
              >
                {data.wines.map((wine, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        '& > *': { // WineCard에 최대 너비 설정
                          maxWidth: '100%',
                          width: '100%'
                        }
                      }}
                    >
                      <WineCard 
                        wine={wine}
                        isFirst={index === 0}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );
      }
      
      // 일반 텍스트 응답일 경우
      return (
        <Typography 
          sx={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {data.text}
        </Typography>
      );
    }
    
    // 사용자 메시지일 경우
    return <Typography>{message.content}</Typography>;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box 
      sx={{ 
        maxWidth: 1200, 
        margin: 'auto', 
        mt: 4, 
        p: 2,
        position: 'relative',
      }}
    >
      {/* 상단 타이틀 추가 */}
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
          color: 'primary.main',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '2px',
            backgroundColor: 'primary.main',
          }
        }}
      >
        Wine Sommelier
      </Typography>

      {/* 채팅 영역 */}
      <Paper 
        elevation={0}
        sx={{ 
          height: 600, 
          overflow: 'auto', 
          p: 3, 
          mb: 2,
          backgroundColor: 'background.paper',
          borderRadius: 4,
          border: '1px solid rgba(114, 47, 55, 0.1)',
          position: 'relative',
          zIndex: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#722F37',
            borderRadius: '4px',
          },
        }}
      >
        {messages.map((msg, idx) => (
          <Box 
            key={idx} 
            sx={{ 
              mb: 2,
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              opacity: 0,
              animation: 'fadeIn 0.5s ease forwards',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              animationDelay: `${idx * 0.1}s`,
            }}
          >
            {/* 봇 메시지일 경우 아이콘 추가 */}
            {msg.type === 'bot' && (
              <Avatar 
                sx={{ 
                  mr: 1, 
                  bgcolor: 'primary.main',
                  width: 32,
                  height: 32
                }}
              >
                <LocalBarIcon sx={{ fontSize: 18 }} />
              </Avatar>
            )}
            
            <Paper
              elevation={0}
              sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor: msg.type === 'user' ? 'primary.main' : 'background.paper',
                color: msg.type === 'user' ? 'white' : 'text.primary',
                borderRadius: msg.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                border: msg.type === 'user' ? 'none' : '1px solid rgba(114, 47, 55, 0.1)',
              }}
            >
              {renderMessageContent(msg)}
            </Paper>
          </Box>
        ))}
      </Paper>
      
      {/* 입력 영역 */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="와인에 대해 물어보세요..."
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
              '& fieldset': {
                borderColor: 'rgba(114, 47, 55, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'primary.light',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading}
          sx={{
            minWidth: '120px',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              전송
              <SendIcon sx={{ ml: 1 }} />
            </>
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;