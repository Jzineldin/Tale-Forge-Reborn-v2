import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StoryCard from './StoryCard';

describe('StoryCard Component', () => {
  const defaultProps = {
    title: 'Test Story',
    description: 'This is a test story description',
    genre: 'Fantasy',
    ageGroup: '6-8',
    imageUrl: 'https://example.com/image.jpg'
  };

  test('renders story information correctly', () => {
    render(<StoryCard {...defaultProps} />);
    
    expect(screen.getByText('Test Story')).toBeInTheDocument();
    expect(screen.getByText('This is a test story description')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.getByText('Age 6-8')).toBeInTheDocument();
  });

  test('renders image when imageUrl is provided', () => {
    render(<StoryCard {...defaultProps} />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('alt', 'Test Story');
  });

  test('does not render image when imageUrl is not provided', () => {
    render(<StoryCard {...defaultProps} imageUrl={undefined} />);
    
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('handles Read Story button click', async () => {
    const user = userEvent.setup();
    const onRead = vi.fn();
    
    render(<StoryCard {...defaultProps} onRead={onRead} />);
    
    await user.click(screen.getByText('Read Story'));
    expect(onRead).toHaveBeenCalledTimes(1);
  });

  test('handles Edit button click', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    
    render(<StoryCard {...defaultProps} onEdit={onEdit} />);
    
    await user.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test('renders buttons with correct text', () => {
    render(<StoryCard {...defaultProps} />);
    
    expect(screen.getByText('Read Story')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});