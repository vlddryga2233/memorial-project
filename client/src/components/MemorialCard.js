import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { API_URL } from '../config';

const MemorialCard = ({ memorial }) => {
  const getMainPhoto = (photos) => {
    if (!photos || photos.length === 0) return null;
    const mainPhoto = photos.find(photo => photo.isMain);
    return mainPhoto ? mainPhoto.url : photos[0].url;
  };

  const mainPhoto = getMainPhoto(memorial.photos);

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3
        }
      }}
    >
      {mainPhoto ? (
        <CardMedia
          component="img"
          height="200"
          image={mainPhoto.startsWith('http') ? mainPhoto : `${API_URL}${mainPhoto}`}
          alt={memorial.name}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="text.secondary">No photo</Typography>
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h5" component="h2">
          {memorial.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {new Date(memorial.birthDate).toLocaleDateString()} - {new Date(memorial.deathDate).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
          {memorial.biography.length > 150 
            ? `${memorial.biography.substring(0, 150)}...` 
            : memorial.biography}
        </Typography>
        <Button 
          component={Link} 
          to={`/memorial/${memorial._id}`}
          variant="contained" 
          color="primary"
          fullWidth
        >
          View Memorial
        </Button>
      </CardContent>
    </Card>
  );
};

export default MemorialCard; 