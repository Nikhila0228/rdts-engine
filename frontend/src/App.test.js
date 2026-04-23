import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * Basic UI verification tests for the RDTS Dashboard.
 * These tests ensure that the core components are rendered correctly.
 */

test('renders dashboard header and engine title', () => {
  render(<App />);
  
  // Checking if the main application title is present
  const headerElement = screen.getByText(/RDTS/i);
  const engineSubtitle = screen.getByText(/Engine/i);
  
  expect(headerElement).toBeInTheDocument();
  expect(engineSubtitle).toBeInTheDocument();
});

test('verifies presence of the dispatch control panel', () => {
  render(<App />);
  
  // Checking for the 'Dispatch' button to confirm control panel rendering
  const dispatchButton = screen.getByRole('button', { name: /dispatch/i });
  expect(dispatchButton).toBeInTheDocument();
});

test('renders task queue status label', () => {
  render(<App />);
  
  // Ensuring the system status section is visible
  const statusLabel = screen.getByText(/System Status/i);
  expect(statusLabel).toBeInTheDocument();
});