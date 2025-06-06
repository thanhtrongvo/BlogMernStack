import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from './ThemeContext';

// Helper component to consume the theme context
const TestComponent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-name">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage and reset html class before each test
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  test('initializes with light theme by default', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('initializes with theme from localStorage if available', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  test('toggles theme from light to dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const toggleButton = screen.getByText('Toggle Theme');

    act(() => {
      toggleButton.click();
    });

    expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('toggles theme from dark to light', () => {
    localStorage.setItem('theme', 'dark'); // Start with dark theme
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const toggleButton = screen.getByText('Toggle Theme');

    act(() => {
      toggleButton.click();
    });

    expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('throws error if useTheme is used outside of ThemeProvider', () => {
    // Suppress console.error for this test as React will log an error
    const originalError = console.error;
    console.error = jest.fn();

    const ErrorComponent = () => {
      useTheme();
      return null;
    };
    expect(() => render(<ErrorComponent />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
    console.error = originalError; // Restore console.error
  });
});
