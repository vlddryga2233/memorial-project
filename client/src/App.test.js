import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

test('renders Memorial Project in the navbar', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const navbarTitle = screen.getByText(/Memorial Project/i);
  expect(navbarTitle).toBeInTheDocument();
});
