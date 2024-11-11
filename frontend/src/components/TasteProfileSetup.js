import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  Button,
  Paper,
  Tooltip,
  InfoIcon,
  Stack,
  Divider
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTaste } from '../context/TasteContext';

const TasteProfileSetup = () => {
  const { setTasteProfile } = useTaste();
  const [preferences, setPreferences] = useState({
    preferred_sweetness: 3,
    preferred_acidity: 3,
    preferred_body: 3,
    preferred_tannin: 3,
    preferred_types: [],
    price_range: [10000, 100000] // 기본 가격 범위 설정
  });

  const handleTypeChange = (type, checked) => {
    setPreferences(prev => ({
      ...prev,
      preferred_types: checked 
        ? [...prev.preferred_types, type]
        : prev.preferred_types.filter(t => t !== type)
    }));
  };

  const formatPrice = (value) => {
    return `${value.toLocaleString()}원`;
  };

  const handleSavePreferences = async () => {
    try {
      setTasteProfile(preferences);
    } catch (error) {
      console.error('취향 저장 실패:', error);
    }
  };

  const characteristics = [
    {
      name: '당도',
      key: 'preferred_sweetness',
      description: '와인의 단맛 정도를 나타냅니다.',
      levels: [
        '매우 드라이 (1): 단맛이 거의 없음',
        '드라이 (2): 약간의 단맛',
        '미디엄 (3): 적당한 단맛',
        '스위트 (4): 달콤한 맛',
        '매우 스위트 (5): 매우 달콤한 맛'
      ]
    },
    {
      name: '산도',
      key: 'preferred_acidity',
      description: '와인의 신맛과 상쾌함을 나타냅니다.',
      levels: [
        '매우 낮음 (1): 부드럽고 둥근 맛',
        '낮음 (2): 약간의 신맛',
        '중간 (3): 적당한 신맛',
        '높음 (4): 상쾌한 신맛',
        '매우 높음 (5): 매우 상쾌하고 날카로운 신맛'
      ]
    },
    {
      name: '바디감',
      key: 'preferred_body',
      description: '와인이 입안에서 느껴지는 무게감을 나타냅니다.',
      levels: [
        '매우 가벼움 (1): 물과 같이 가벼운 느낌',
        '가벼움 (2): 스키머밀크와 같은 가벼운 질감',
        '미디엄 (3): 온전한 우유와 같은 질감',
        '무거움 (4): 저지방 크림과 같은 질감',
        '매우 무거움 (5): 진한 크림과 같은 질감'
      ]
    },
    {
      name: '타닌',
      key: 'preferred_tannin',
      description: '입안이 떫고 건조해지는 느낌의 정도를 나타냅니다.',
      levels: [
        '매우 부드러움 (1): 거의 느껴지지 않는 타닌',
        '부드러움 (2): 약한 타닌',
        '중간 (3): 적당한 타닌',
        '강함 (4): 뚜렷한 타닌',
        '매우 강함 (5): 매우 강한 타닌'
      ]
    }
  ];

  const CharacteristicSlider = ({ characteristic }) => (
    <Box sx={{ my: 4 }}>
      <Stack 
        direction="row" 
        spacing={1} 
        alignItems="center" 
        sx={{ mb: 1 }}
      >
        <Typography variant="h6" color="primary.main">
          {characteristic.name}
        </Typography>
        <Tooltip 
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                {characteristic.description}
              </Typography>
              <Divider sx={{ my: 1 }} />
              {characteristic.levels.map((level, index) => (
                <Box key={index} sx={{ 
                  mb: 0.5, 
                  p: 0.5,
                  borderRadius: 1,
                  bgcolor: preferences[characteristic.key] === index + 1 ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}>
                  {level}
                </Box>
              ))}
            </Box>
          }
          arrow
          placement="right"
          sx={{
            tooltip: {
              maxWidth: 'none',
              bgcolor: 'primary.main',
            }
          }}
        >
          <InfoOutlinedIcon 
            sx={{ 
              color: 'primary.main',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }} 
          />
        </Tooltip>
      </Stack>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {characteristic.description}
      </Typography>
      
      <Slider
        value={preferences[characteristic.key]}
        onChange={(e, value) => 
          setPreferences(prev => ({...prev, [characteristic.key]: value}))
        }
        min={1}
        max={5}
        marks={[
          { value: 1, label: '매우 낮음' },
          { value: 2, label: '낮음' },
          { value: 3, label: '중간' },
          { value: 4, label: '높음' },
          { value: 5, label: '매우 높음' }
        ]}
        valueLabelDisplay="auto"
        sx={{
          color: 'primary.main',
          '& .MuiSlider-mark': {
            backgroundColor: 'primary.light',
          },
          '& .MuiSlider-valueLabel': {
            backgroundColor: 'primary.main',
          }
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4, mt: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(114, 47, 55, 0.1)' }}>
        <Typography variant="h4" gutterBottom sx={{ /* 기존 스타일 */ }}>
          취향 프로필 설정
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            와인 특성 선호도
          </Typography>
          
          {characteristics.map((characteristic) => (
            <CharacteristicSlider 
              key={characteristic.key} 
              characteristic={characteristic} 
            />
          ))}
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            선호하는 와인 종류
          </Typography>
          <FormGroup>
            {[
              { type: '레드', description: '탄닌과 바디감이 특징인 붉은 와인' },
              { type: '화이트', description: '산뜻하고 과일향이 풍부한 흰 와인' },
              { type: '스파클링', description: '기포가 있는 청량감 있는 와인' },
              { type: '로제', description: '붉은 포도로 만든 연한 분홍빛 와인' }
            ].map(({ type, description }) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox 
                    sx={{
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography>{type}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                  </Box>
                }
                onChange={e => handleTypeChange(type, e.target.checked)}
              />
            ))}
          </FormGroup>
        </Box>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            선호하는 가격대
          </Typography>
          <Slider
            value={preferences.price_range}
            onChange={(e, value) => 
              setPreferences(prev => ({...prev, price_range: value}))
            }
            min={10000}
            max={100000}
            step={5000}
            marks={[
              { value: 10000, label: '1만원' },
              { value: 50000, label: '5만원' },
              { value: 100000, label: '10만원' },
              // { value: 300000, label: '30만원' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={formatPrice}
          />
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}>
            {formatPrice(preferences.price_range[0])} ~ {formatPrice(preferences.price_range[1])}
          </Typography>
        </Box>

        <Button variant="contained" fullWidth onClick={handleSavePreferences} sx={{ mt: 4 }}>
          프로필 저장하기
        </Button>
      </Paper>
    </Box>
  );
};

export default TasteProfileSetup;