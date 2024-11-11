import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  LinearProgress,
  Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const WineCharacteristic = ({ label, value, color, size }) => (
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

const WineCard = ({ wine, isFirst }) => {
  const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";
  
  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 400,
        mb: 2,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
        border: isFirst ? '2px solid #722F37' : '1px solid rgba(0,0,0,0.12)',
        position: 'relative',
      }}
    >
      {isFirst && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'primary.main',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            zIndex: 1,
          }}
        >
          Best Pick
        </Box>
      )}
      
      <CardMedia
        component="img"
        height="240"
        image={wine.image_url || fallbackImage}
        onError={handleImageError}
        alt={wine.name_ko}
        sx={{ 
          objectFit: 'contain', 
          bgcolor: '#f9f9f9',
          p: 2,
        }}
      />
      <CardContent>
        <Typography 
          variant="h6" 
          component="div"
          sx={{ 
            fontFamily: "'Playfair Display', serif",
            color: 'primary.main',
            mb: 1,
            fontSize: isFirst ? '1.5rem' : '1.25rem',
          }}
        >
          {wine.name_ko}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontStyle: 'italic',
            mb: 2,
          }}
        >
          {wine.name_en}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
            }}
          >
            <LocationOnIcon fontSize="small" />
            {wine.winery} | {wine.country} | {wine.region}
          </Typography>
          {wine.price && (
            <Typography 
              variant="body1" 
              color="primary.main"
              sx={{ 
                fontWeight: 600,
                mb: 2,
                fontSize: isFirst ? '1.25rem' : '1rem',
              }}
            >
              ₩ {wine.price.toLocaleString()}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <WineCharacteristic 
            label="당도" 
            value={wine.sweetness} 
            color="#FF6B6B"
            size={isFirst ? 'large' : 'medium'}
          />
          <WineCharacteristic 
            label="산도" 
            value={wine.acidity} 
            color="#4ECDC4"
            size={isFirst ? 'large' : 'medium'}
          />
          <WineCharacteristic 
            label="바디" 
            value={wine.body} 
            color="#45B7D1"
            size={isFirst ? 'large' : 'medium'}
          />
          <WineCharacteristic 
            label="타닌" 
            value={wine.tannin} 
            color="#96CEB4"
            size={isFirst ? 'large' : 'medium'}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>아로마:</strong> {wine.aroma}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>음식 페어링:</strong> {wine.food_matching}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WineCard;