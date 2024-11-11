import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  Paper,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WineGlassSlider from './WineGlassSlider';
import WineCard from './WineCard';
import { wineApi } from '../services/api';

const CharacteristicCard = styled(Card)(({ theme }) => ({
  maxWidth: 600,
  margin: 'auto',
  marginTop: theme.spacing(3),
  padding: theme.spacing(3),
  textAlign: 'center'
}));

const steps = [
  {
    label: '카리스마를 두 스푼 넣고',
    description: '와인의 떫은맛(타닌)을 선택해주세요'
  },
  {
    label: '허세도 조금!',
    description: '와인의 무게감(바디)을 선택해주세요'
  },
  {
    label: '그리고 달콤도 넣어..',
    description: '와인의 단맛(당도)을 선택해주세요'
  },
  {
    label: '상큼함도 필요해!',
    description: '와인의 신맛(산도)을 선택해주세요'
  },
  {
    label: '마지막으로 예산도 고려해볼까?',
    description: '원하시는 가격대를 선택해주세요'
  }
];

const RecommendationTest = () => {
  // ... 이전 코드와 동일한 내용 ...
};

export default RecommendationTest;