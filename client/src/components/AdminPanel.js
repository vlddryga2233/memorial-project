import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axiosInstance from '../utils/axios';
import { jwtDecode } from 'jwt-decode';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [memorials, setMemorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openMemorialDialog, setOpenMemorialDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', isAdmin: false });
  const [newMemorial, setNewMemorial] = useState({ name: '', birthDate: '', deathDate: '', biography: '', createdBy: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded); // Debug log
        if (!decoded.user?.isAdmin) {
          setError('You must be an admin to access this page');
          setLoading(false);
          return;
        }

        setLoading(true);
        const [usersRes, memorialsRes] = await Promise.all([
          axiosInstance.get('/api/admin/users'),
          axiosInstance.get('/api/admin/memorials')
        ]);
        setUsers(usersRes.data);
        setMemorials(memorialsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  const handleDeleteMemorial = async (memorialId) => {
    if (window.confirm('Are you sure you want to delete this memorial?')) {
      try {
        await axiosInstance.delete(`/api/memorials/${memorialId}`);
        setMemorials(memorials.filter(memorial => memorial._id !== memorialId));
      } catch (err) {
        console.error('Error deleting memorial:', err);
        setError('Failed to delete memorial');
      }
    }
  };

  const handleToggleVisibility = async (memorialId) => {
    try {
      const res = await axiosInstance.put(`/api/memorials/${memorialId}/toggle-visibility`);
      setMemorials(memorials.map(memorial => 
        memorial._id === memorialId ? res.data : memorial
      ));
    } catch (err) {
      console.error('Error toggling memorial visibility:', err);
      setError('Failed to toggle memorial visibility');
    }
  };

  const handleAddUser = async () => {
    try {
      const res = await axiosInstance.post('/api/admin/users', newUser);
      setUsers([...users, res.data]);
      setOpenUserDialog(false);
      setNewUser({ name: '', email: '', password: '', isAdmin: false });
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Error adding user');
    }
  };

  const handleAddMemorial = async () => {
    try {
      const res = await axiosInstance.post('/api/admin/memorials', newMemorial);
      setMemorials([...memorials, res.data]);
      setOpenMemorialDialog(false);
      setNewMemorial({ name: '', birthDate: '', deathDate: '', biography: '', createdBy: '' });
    } catch (err) {
      console.error('Error adding memorial:', err);
      setError('Error adding memorial');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Users" />
          <Tab label="Memorials" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setOpenUserDialog(true)} sx={{ mb: 2 }}>
              Add User
            </Button>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.isAdmin ? 'Admin' : 'User'}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user._id === user.id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setOpenMemorialDialog(true)} sx={{ mb: 2 }}>
              Add Memorial
            </Button>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memorials.map((memorial) => (
                    <TableRow key={memorial._id}>
                      <TableCell>{memorial.name}</TableCell>
                      <TableCell>{memorial.createdBy?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {memorial.isHidden ? 'Hidden' : 'Visible'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={memorial.isHidden ? "Click to show memorial" : "Click to hide memorial"}>
                          <IconButton
                            color={memorial.isHidden ? "error" : "success"}
                            onClick={() => handleToggleVisibility(memorial._id)}
                            sx={{ mr: 1 }}
                          >
                            {memorial.isHidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteMemorial(memorial._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Is Admin"
            type="checkbox"
            checked={newUser.isAdmin}
            onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained" color="primary">
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Memorial Dialog */}
      <Dialog open={openMemorialDialog} onClose={() => setOpenMemorialDialog(false)}>
        <DialogTitle>Add New Memorial</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newMemorial.name}
            onChange={(e) => setNewMemorial({ ...newMemorial, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Birth Date"
            type="date"
            value={newMemorial.birthDate}
            onChange={(e) => setNewMemorial({ ...newMemorial, birthDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Death Date"
            type="date"
            value={newMemorial.deathDate}
            onChange={(e) => setNewMemorial({ ...newMemorial, deathDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Biography"
            multiline
            rows={4}
            value={newMemorial.biography}
            onChange={(e) => setNewMemorial({ ...newMemorial, biography: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Created By (User ID)"
            value={newMemorial.createdBy}
            onChange={(e) => setNewMemorial({ ...newMemorial, createdBy: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMemorialDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMemorial} variant="contained" color="primary">
            Add Memorial
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel; 