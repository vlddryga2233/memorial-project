import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Alert,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [memorials, setMemorials] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchUserMemorials = async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/memorials/user/${userId}`);
      setMemorials(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching memorials:', err);
      setMemorials([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/api/users/me');
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      fetchUserMemorials(user._id);
    }
  }, [user]);

  const handlePhotoUpload = async (memorialId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const response = await axiosInstance.post(`/api/memorials/${memorialId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update the memorial in the list with the new photo
      setMemorials(memorials.map(memorial => 
        memorial._id === memorialId 
          ? { ...memorial, photo: response.data.photos[0].url }
          : memorial
      ));
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${API_URL}${photo}`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {user && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Name: {user.name}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Email: {user.email}
              </Typography>
              {user.isAdmin && (
                <Typography variant="h6" color="primary" gutterBottom>
                  Admin User
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        <Typography variant="h5" component="h2" gutterBottom>
          My Memorials
        </Typography>
        {loading ? (
          <Typography>Loading memorials...</Typography>
        ) : memorials.length > 0 ? (
          <Grid container spacing={3}>
            {memorials.map((memorial) => (
              <Grid item xs={12} sm={6} md={4} key={memorial._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative' }}>
                    {memorial.photo ? (
                      <CardMedia
                        component="img"
                        height="140"
                        image={getPhotoUrl(memorial.photo)}
                        alt={memorial.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 140,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography color="text.secondary">No photo</Typography>
                      </Box>
                    )}
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id={`photo-upload-${memorial._id}`}
                      type="file"
                      onChange={(e) => handlePhotoUpload(memorial._id, e)}
                      disabled={uploading}
                    />
                    <label htmlFor={`photo-upload-${memorial._id}`}>
                      <IconButton
                        color="primary"
                        component="span"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'background.paper' },
                        }}
                        disabled={uploading}
                      >
                        <PhotoCameraIcon />
                      </IconButton>
                    </label>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {memorial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {memorial.biography.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/memorial/${memorial._id}`)}
                        fullWidth
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No memorials yet
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => navigate('/create')}
            >
              Create Your First Memorial
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Profile; 