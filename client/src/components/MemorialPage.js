import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { QRCodeSVG } from 'qrcode.react';
import axiosInstance from '../utils/axios';
import { API_URL } from '../config';

const MemorialPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        const response = await axiosInstance.get(`/api/memorials/${id}`);
        setMemorial(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching memorial:', err);
        setError('Error loading memorial');
      } finally {
        setLoading(false);
      }
    };

    fetchMemorial();
  }, [id]);

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${API_URL}${photo}`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!memorial) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Memorial not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {memorial.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {new Date(memorial.birthDate).toLocaleDateString()} - {new Date(memorial.deathDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" paragraph>
                {memorial.biography}
              </Typography>
              {memorial.location && (
                <Typography variant="body2" color="text.secondary">
                  Location: {memorial.location}
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Photos
              </Typography>
              {memorial.photos && Array.isArray(memorial.photos) && memorial.photos.length > 0 ? (
                <Grid container spacing={2}>
                  {memorial.photos.map((photo, index) => (
                    <Grid item xs={12} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="200"
                          image={getPhotoUrl(photo.url)}
                          alt={`Photo ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No photos available
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom>
          Videos
        </Typography>
        <Grid container spacing={2}>
          {memorial.videos && Array.isArray(memorial.videos) && memorial.videos.length > 0 ? (
            memorial.videos.map((video, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <video
                    controls
                    style={{ width: '100%', height: '200px' }}
                    src={getPhotoUrl(video.url)}
                  />
                  {video.caption && (
                    <CardContent>
                      <Typography variant="body2">{video.caption}</Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography color="text.secondary">
                No videos available
              </Typography>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Share this Memorial
            </Typography>
            <QRCodeSVG value={window.location.href} size={200} />
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default MemorialPage; 