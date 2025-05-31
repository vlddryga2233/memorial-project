import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';
import { API_URL } from '../config';
import QRCode from 'qrcode.react';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const MemorialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [memorial, setMemorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        console.log('Fetching memorial with ID:', id); // Debug log
        const res = await axiosInstance.get(`/api/memorials/${id}`);
        console.log('Memorial data received:', res.data); // Debug log
        setMemorial(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching memorial:', err);
        console.error('Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          config: err.config
        });
        setError(err.response?.data?.msg || 'Failed to load memorial');
        setLoading(false);
      }
    };

    if (id) {
      fetchMemorial();
    } else {
      setError('No memorial ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this memorial?')) {
      try {
        await axiosInstance.delete(`/api/memorials/${id}`);
        navigate('/');
      } catch (err) {
        console.error('Error deleting memorial:', err);
        setError('Failed to delete memorial');
      }
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await axiosInstance.post(`/api/memorials/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMemorial(res.data);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
    }
  };

  const handleSetMainPhoto = async (photoId) => {
    try {
      const res = await axiosInstance.put(`/api/memorials/${id}/photos/${photoId}/main`);
      setMemorial(res.data);
    } catch (err) {
      console.error('Error setting main photo:', err);
      setError('Failed to set main photo');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      const res = await axiosInstance.delete(`/api/memorials/${id}/photos/${photoId}`);
      setMemorial(res.data);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!memorial) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Memorial not found
        </Alert>
      </Container>
    );
  }

  const isCreator = memorial.createdBy === user?.id;
  const mainPhoto = memorial.photos?.find(photo => photo.isMain) || memorial.photos?.[0];
  const memorialUrl = `${window.location.origin}/memorial/${id}`;

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {memorial.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {new Date(memorial.birthDate).toLocaleDateString()} - {new Date(memorial.deathDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body1" paragraph>
              {memorial.biography}
            </Typography>

            {/* Admin Controls */}
            {isCreator && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/edit/${id}`)}
                  sx={{ mr: 2 }}
                >
                  Edit Memorial
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Delete Memorial
                </Button>
              </Box>
            )}

            {/* Photo Gallery */}
            {memorial.photos && memorial.photos.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Photos
                </Typography>
                <Grid container spacing={2}>
                  {memorial.photos.map((photo) => (
                    <Grid item xs={12} sm={6} md={4} key={photo._id}>
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={photo.url.startsWith('http') ? photo.url : `${API_URL}${photo.url}`}
                          alt="Memorial"
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                        {isCreator && (
                          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                            {!photo.isMain && (
                              <IconButton
                                size="small"
                                onClick={() => handleSetMainPhoto(photo._id)}
                                sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', mr: 1 }}
                              >
                                <PhotoCameraIcon />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePhoto(photo._id)}
                              sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* QR Code Section */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setQrDialogOpen(true)}
                sx={{ mb: 2 }}
              >
                Show QR Code
              </Button>
            </Box>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            {mainPhoto && (
              <Box sx={{ position: 'sticky', top: 24 }}>
                <img
                  src={mainPhoto.url.startsWith('http') ? mainPhoto.url : `${API_URL}${mainPhoto.url}`}
                  alt={memorial.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                />
                {isCreator && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="photo-upload"
                      type="file"
                      onChange={handlePhotoUpload}
                    />
                    <label htmlFor="photo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCameraIcon />}
                      >
                        Upload Photo
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Memorial QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <QRCode
              value={memorialUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" align="center">
            Scan this QR code to visit this memorial
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MemorialDetail; 