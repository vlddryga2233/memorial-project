import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import MemorialCard from './MemorialCard';
import axiosInstance from '../utils/axios';

const Home = () => {
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemorials = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/memorials');
        setMemorials(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching memorials:', err);
        setError('Failed to load memorials');
      } finally {
        setLoading(false);
      }
    };

    fetchMemorials();
  }, []);

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Memorials
      </Typography>
      <Grid container spacing={3}>
        {memorials.map((memorial) => (
          <Grid item xs={12} sm={6} md={4} key={memorial._id}>
            <MemorialCard memorial={memorial} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 