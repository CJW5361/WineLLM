import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  LinearProgress,
  Grid
} from '@mui/material';

const WineCharacteristic = ({ label, value, color }) => (
  <Box sx={{ mb: 1 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {value}/5
      </Typography>
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={value * 20} 
      sx={{ 
        height: 8, 
        borderRadius: 4,
        backgroundColor: `${color}40`,
        '& .MuiLinearProgress-bar': {
          backgroundColor: color,
        }
      }} 
    />
  </Box>
);

const WineCard = ({ wine }) => {
  const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";
  
  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  return (
    <Card sx={{ maxWidth: 345, mb: 2 }}>
      <CardMedia
        component="img"
        height="200"
        image={wine.image_url || fallbackImage}
        onError={handleImageError}
        alt={wine.name_ko}
        sx={{ 
          objectFit: 'contain', 
          bgcolor: '#f5f5f5',
          cursor: 'pointer'
        }}
        onClick={() => wine.detail_url && window.open(wine.detail_url, '_blank')}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {wine.name_ko}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {wine.name_en}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {wine.winery} | {wine.country} | {wine.region}
          </Typography>
          {wine.price && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              가격: {wine.price.toLocaleString()}원
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <WineCharacteristic label="당도" value={wine.sweetness} color="#FF6B6B" />
          <WineCharacteristic label="산도" value={wine.acidity} color="#4ECDC4" />
          <WineCharacteristic label="바디" value={wine.body} color="#45B7D1" />
          <WineCharacteristic label="타닌" value={wine.tannin} color="#96CEB4" />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            아로마: {wine.aroma}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            음식 페어링: {wine.food_matching}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WineCard;