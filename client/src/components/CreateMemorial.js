import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const CreateMemorial = () => {
  console.log('CreateMemorial component rendering'); // Mount check

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  console.log('isAuthenticated:', isAuthenticated); // Auth state check

  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    birthDate: '',
    deathDate: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('CreateMemorial useEffect running'); // Effect check
    const token = localStorage.getItem('token');
    console.log('Token in CreateMemorial:', token); // Log actual token
    
    if (!token || !isAuthenticated) {
      console.log('No token or not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { name, biography, birthDate, deathDate } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started'); // Form submission check
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    console.log('Token before submit:', token); // Log actual token

    if (!token) {
      console.log('No token found, showing error');
      setError('Authentication token is missing. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      // First create the memorial
      const memorialResponse = await axiosInstance.post('/api/memorials', formData);
      console.log('Memorial created successfully:', memorialResponse.data);

      // If there's a photo, upload it
      if (photo) {
        const formData = new FormData();
        formData.append('photo', photo);

        await axiosInstance.post(`/api/memorials/${memorialResponse.data._id}/photos`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      navigate('/');
    } catch (err) {
      console.error('Error creating memorial:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.msg || 'Failed to create memorial');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    console.log('Not authenticated, returning null');
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create Memorial
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={name}
            onChange={onChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Biography"
            name="biography"
            value={biography}
            onChange={onChange}
            required
            multiline
            rows={4}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Birth Date"
            name="birthDate"
            type="date"
            value={birthDate}
            onChange={onChange}
            required
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            label="Death Date"
            name="deathDate"
            type="date"
            value={deathDate}
            onChange={onChange}
            required
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handlePhotoChange}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCameraIcon />}
                sx={{ mb: 2 }}
              >
                Upload Photo
              </Button>
            </label>
            {photoPreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Memorial'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateMemorial; 