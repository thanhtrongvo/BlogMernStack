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
    document.documentElement.className = ''; // Clear all classes
    // Remove any style tags added by tests
    const existingStyles = document.head.querySelectorAll('style[data-testid="test-style"]');
    existingStyles.forEach(s => s.remove());
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

  // Existing tests for class toggling and localStorage are good.
  // New test for CSS variable value:

  test('correctly sets --background CSS variable via .dark class on html element', () => {
    // Define the CSS variables in the test environment
    const style = document.createElement('style');
    style.setAttribute('data-testid', 'test-style'); // To help clean up
    style.innerHTML = `
      :root {
        --background: oklch(1 0 0); /* Light background from App.css */
      }
      .dark {
        --background: oklch(0.13 0.028 261.692); /* Dark background from App.css */
      }
      body {
        background-color: var(--background); /* Ensure body uses it */
      }
    `;
    document.head.appendChild(style);

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initial (light theme)
    // JSDOM might not compute oklch directly to rgb for getComputedStyle(document.body).backgroundColor
    // So, we check the variable value on the element where the class is applied (documentElement)
    expect(getComputedStyle(document.documentElement).getPropertyValue('--background').trim()).toBe('oklch(1 0 0)');

    const toggleButton = screen.getByText('Toggle Theme');
    act(() => {
      toggleButton.click(); // Switch to dark
    });

    expect(document.documentElement).toHaveClass('dark');
    // Check the variable value when .dark class is active on html
    // Note: getPropertyValue will return the *defined* value, not necessarily the *computed* final color of the body
    expect(getComputedStyle(document.documentElement).getPropertyValue('--background').trim()).toBe('oklch(0.13 0.028 261.692)');

    act(() => {
      toggleButton.click(); // Switch back to light
    });

    expect(document.documentElement).not.toHaveClass('dark');
    expect(getComputedStyle(document.documentElement).getPropertyValue('--background').trim()).toBe('oklch(1 0 0)');

    // Cleanup the style tag
    style.remove();
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
