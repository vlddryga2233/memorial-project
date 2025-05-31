import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Link,
  Divider,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';

const About = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            About Memorial Project
          </Typography>
          
          <Typography variant="body1" paragraph>
            The Memorial Project is a digital platform dedicated to preserving and sharing memories of loved ones. 
            Our mission is to provide a respectful and meaningful way to commemorate those who have passed away, 
            allowing their stories and legacies to live on.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Features
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Digital Memorials
                </Typography>
                <Typography variant="body2">
                  Create beautiful digital memorials with photos, biographies, and important dates to honor your loved ones.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Photo Gallery
                </Typography>
                <Typography variant="body2">
                  Share and preserve precious memories through our photo gallery feature.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  QR Code Sharing
                </Typography>
                <Typography variant="body2">
                  Easily share memorials with friends and family through QR codes.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" gutterBottom>
            Contact Us
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmailIcon sx={{ mr: 1 }} />
            <Link href="mailto:contact@memorialproject.com" color="inherit">
              contact@memorialproject.com
            </Link>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GitHubIcon sx={{ mr: 1 }} />
            <Link href="https://github.com/yourusername/memorial-project" target="_blank" rel="noopener noreferrer" color="inherit">
              GitHub Repository
            </Link>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            © {new Date().getFullYear()} Memorial Project. All rights reserved.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default About; 