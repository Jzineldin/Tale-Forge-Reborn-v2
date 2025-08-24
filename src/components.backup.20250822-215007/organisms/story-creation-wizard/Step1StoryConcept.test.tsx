import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step1StoryConcept from './Step1StoryConcept';

describe('Step1StoryConcept Component', () => {
  const mockStoryData = {
    childName: '',
    ageGroup: '',
    genre: '',
    theme: ''
  };

  const mockHandleInputChange = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrevious = vi.fn();

  const defaultProps = {
    storyData: mockStoryData,
    handleInputChange: mockHandleInputChange,
    onNext: mockOnNext,
    onPrevious: mockOnPrevious
  };

  beforeEach(() => {
    mockHandleInputChange.mockClear();
    mockOnNext.mockClear();
    mockOnPrevious.mockClear();
  });

  test('renders correctly with initial state', () => {
    render(<Step1StoryConcept {...defaultProps} />);
    
    expect(screen.getByText('Step 1: Story Concept')).toBeInTheDocument();
    expect(screen.getByLabelText('Child\'s Name (optional)')).toBeInTheDocument();
    expect(screen.getByText('Child\'s Age Group')).toBeInTheDocument();
    expect(screen.getByText('Story Genre')).toBeInTheDocument();
    expect(screen.getByLabelText('Story Theme/Idea (optional)')).toBeInTheDocument();
    
    // Check that all age group options are present
    expect(screen.getByText('4-6 years (Bedtime stories)')).toBeInTheDocument();
    expect(screen.getByText('7-9 years (Adventures)')).toBeInTheDocument();
    expect(screen.getByText('10-12 years (Complex narratives)')).toBeInTheDocument();
    
    // Check that all genre options are present
    expect(screen.getByText('Bedtime Stories 🌙')).toBeInTheDocument();
    expect(screen.getByText('Fantasy & Magic 🧙‍♂️')).toBeInTheDocument();
    expect(screen.getByText('Adventure & Exploration 🗺️')).toBeInTheDocument();
    expect(screen.getByText('Mystery & Detective 🔍')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction & Space 🚀')).toBeInTheDocument();
    expect(screen.getByText('Educational Stories 📚')).toBeInTheDocument();
    expect(screen.getByText('Values & Life Lessons 💎')).toBeInTheDocument();
    expect(screen.getByText('Silly & Humorous Stories 😄')).toBeInTheDocument();
  });

  test('calls handleInputChange when child name input changes', async () => {
    const user = userEvent.setup();
    render(<Step1StoryConcept {...defaultProps} />);
    
    const input = screen.getByLabelText('Child\'s Name (optional)');
    await user.type(input, 'Emma');
    
    expect(mockHandleInputChange).toHaveBeenCalledWith('childName', 'Emma');
  });

  test('calls handleInputChange when age group is selected', async () => {
    const user = userEvent.setup();
    render(<Step1StoryConcept {...defaultProps} />);
    
    const ageGroupButton = screen.getByText('4-6 years (Bedtime stories)');
    await user.click(ageGroupButton);
    
    expect(mockHandleInputChange).toHaveBeenCalledWith('ageGroup', '4-6');
  });

  test('calls handleInputChange when genre is selected', async () => {
    const user = userEvent.setup();
    render(<Step1StoryConcept {...defaultProps} />);
    
    const genreButton = screen.getByText('Fantasy & Magic 🧙‍♂️');
    await user.click(genreButton);
    
    expect(mockHandleInputChange).toHaveBeenCalledWith('genre', 'fantasy');
  });

  test('calls handleInputChange when theme input changes', async () => {
    const user = userEvent.setup();
    render(<Step1StoryConcept {...defaultProps} />);
    
    const input = screen.getByLabelText('Story Theme/Idea (optional)');
    await user.type(input, 'Magic Adventure');
    
    expect(mockHandleInputChange).toHaveBeenCalledWith('theme', 'Magic Adventure');
  });

  test('calls onNext when Next button is clicked', async () => {
    const user = userEvent.setup();
    render(<Step1StoryConcept {...defaultProps} />);
    
    const nextButton = screen.getByText('Next: Character Creation');
    await user.click(nextButton);
    
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  test('shows selected age group with correct styling', async () => {
    const user = userEvent.setup();
    const storyDataWithAgeGroup = {
      ...mockStoryData,
      ageGroup: '4-6'
    };
    
    render(<Step1StoryConcept {...defaultProps} storyData={storyDataWithAgeGroup} />);
    
    const selectedButton = screen.getByText('4-6 years (Bedtime stories)');
    expect(selectedButton).toHaveClass('bg-indigo-50');
    expect(selectedButton).toHaveClass('border-indigo-500');
  });

  test('shows selected genre with correct styling', async () => {
    const user = userEvent.setup();
    const storyDataWithGenre = {
      ...mockStoryData,
      genre: 'fantasy'
    };
    
    render(<Step1StoryConcept {...defaultProps} storyData={storyDataWithGenre} />);
    
    const selectedButton = screen.getByText('Fantasy & Magic 🧙‍♂️');
    expect(selectedButton).toHaveClass('bg-indigo-50');
    expect(selectedButton).toHaveClass('border-indigo-500');
  });
});