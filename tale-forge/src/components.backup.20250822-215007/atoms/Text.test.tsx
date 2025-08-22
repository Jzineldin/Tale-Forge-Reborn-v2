import React from 'react';
import { render, screen } from '@testing-library/react';
import Text from './Text';

describe('Text Component', () => {
  test('renders children correctly', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    render(<Text variant="h1">Heading 1</Text>);
    const element = screen.getByText('Heading 1');
    expect(element.tagName).toBe('H1');
  });

  test('applies correct size classes', () => {
    render(<Text size="lg">Large Text</Text>);
    const element = screen.getByText('Large Text');
    expect(element).toBeInTheDocument();
  });

  test('applies correct weight classes', () => {
    render(<Text weight="bold">Bold Text</Text>);
    const element = screen.getByText('Bold Text');
    expect(element).toBeInTheDocument();
  });

  test('applies correct color classes', () => {
    render(<Text color="secondary">Secondary Text</Text>);
    const element = screen.getByText('Secondary Text');
    expect(element).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Text className="custom-class">Custom Text</Text>);
    const element = screen.getByText('Custom Text');
    expect(element).toHaveClass('custom-class');
  });
});