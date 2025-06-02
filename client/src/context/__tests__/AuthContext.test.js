import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Test component that uses the auth context
const TestComponent = () => {
  const { isAuthenticated, user, login, logout, register } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'authenticated' : 'not authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? JSON.stringify(user) : 'no user'}
      </div>
      <button onClick={() => login('test@example.com', 'password123')}>
        Login
      </button>
      <button onClick={() => register('Test User', 'test@example.com', 'password123')}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com'
  };

  const mockToken = 'fake-token';

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  const renderWithAuth = () => {
    return render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
  };

  it('provides initial unauthenticated state', () => {
    renderWithAuth();

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('no user');
  });

  it('handles successful login', async () => {
    const mockResponse = {
      data: {
        token: mockToken,
        user: mockUser
      }
    };

    axios.post.mockResolvedValueOnce(mockResponse);

    renderWithAuth();

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent(JSON.stringify(mockUser));
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
  });

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    axios.post.mockRejectedValueOnce({
      response: {
        data: { msg: errorMessage }
      }
    });

    renderWithAuth();

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
    });
  });

  it('handles successful registration', async () => {
    const mockResponse = {
      data: {
        token: mockToken,
        user: mockUser
      }
    };

    axios.post.mockResolvedValueOnce(mockResponse);

    renderWithAuth();

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent(JSON.stringify(mockUser));
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
  });

  it('handles registration error', async () => {
    const errorMessage = 'Email already exists';
    axios.post.mockRejectedValueOnce({
      response: {
        data: { msg: errorMessage }
      }
    });

    renderWithAuth();

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
    });
  });

  it('handles logout', async () => {
    // Set initial authenticated state
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithAuth();

    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('no user');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('loads user from localStorage on mount', () => {
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithAuth();

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent(JSON.stringify(mockUser));
  });

  it('handles invalid token in localStorage', () => {
    localStorage.setItem('token', 'invalid-token');
    localStorage.setItem('user', 'invalid-json');

    renderWithAuth();

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('no user');
  });
}); 