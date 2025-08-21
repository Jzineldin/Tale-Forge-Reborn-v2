# Story Service Documentation

## Overview

The Story Service provides a comprehensive set of utility functions for managing stories, story segments, and story choices in the Tale Forge application. It includes both the core service functions and React Query hooks for data fetching and mutation.

## StoryService Functions

### CRUD Operations

#### Stories

- `createStory(userId: string, storyData: Omit<Story, 'id' | 'created_at' | 'updated_at'>): Promise<Story>`
  Creates a new story with the provided data and associates it with the specified user.

- `getStories(userId: string): Promise<Story[]>`
  Retrieves all stories associated with the specified user.

- `getStoryById(userId: string, storyId: string): Promise<Story | null>`
  Retrieves a specific story by its ID, ensuring it belongs to the specified user.

- `updateStory(userId: string, storyId: string, storyData: Partial<Story>): Promise<Story>`
  Updates a story with the provided data, ensuring it belongs to the specified user.

- `deleteStory(userId: string, storyId: string): Promise<void>`
  Deletes a story, ensuring it belongs to the specified user.

#### Story Segments

- `createStorySegment(userId: string, segmentData: Omit<StorySegment, 'id' | 'created_at'>): Promise<StorySegment>`
  Creates a new story segment with the provided data and associates it with the specified user.

- `getStorySegments(userId: string, storyId: string): Promise<StorySegment[]>`
  Retrieves all segments for a specific story, ensuring they belong to the specified user.

- `getStorySegmentById(userId: string, segmentId: string): Promise<StorySegment | null>`
  Retrieves a specific story segment by its ID, ensuring it belongs to the specified user.

- `updateStorySegment(userId: string, segmentId: string, segmentData: Partial<StorySegment>): Promise<StorySegment>`
  Updates a story segment with the provided data, ensuring it belongs to the specified user.

- `deleteStorySegment(userId: string, segmentId: string): Promise<void>`
  Deletes a story segment, ensuring it belongs to the specified user.

#### Story Choices

- `createStoryChoice(userId: string, choiceData: Omit<StoryChoice, 'id'>): Promise<StoryChoice>`
  Creates a new story choice with the provided data and associates it with the specified user.

- `getStoryChoices(userId: string, segmentId: string): Promise<StoryChoice[]>`
  Retrieves all choices for a specific story segment, ensuring they belong to the specified user.

- `updateStoryChoice(userId: string, choiceId: string, choiceData: Partial<StoryChoice>): Promise<StoryChoice>`
  Updates a story choice with the provided data, ensuring it belongs to the specified user.

- `deleteStoryChoice(userId: string, choiceId: string): Promise<void>`
  Deletes a story choice, ensuring it belongs to the specified user.

### Optimized Queries

- `getStoriesPaginated(userId: string, page: number = 1, limit: number = 10): Promise<{ stories: Story[], totalCount: number }>`
  Retrieves stories with pagination support.

- `getStoriesByStatus(userId: string, status: Story['status']): Promise<Story[]>`
  Retrieves stories filtered by their status.

- `getStoriesByGenre(userId: string, genre: string): Promise<Story[]>`
  Retrieves stories filtered by their genre.

- `searchStories(userId: string, searchTerm: string): Promise<Story[]>`
  Searches stories by title or description.

- `getRecentStories(userId: string, limit: number = 5): Promise<Story[]>`
  Retrieves the most recently created stories.

## Story Hooks

### Story Hooks

- `useStories()`
  React Query hook to fetch all stories for the authenticated user.

- `useStory(storyId: string | null)`
  React Query hook to fetch a specific story by ID for the authenticated user.

- `useCreateStory()`
  React Query hook to create a new story for the authenticated user.

- `useUpdateStory()`
  React Query hook to update an existing story for the authenticated user.

- `useDeleteStory()`
  React Query hook to delete a story for the authenticated user.

### Story Segment Hooks

- `useStorySegments(storyId: string | null)`
  React Query hook to fetch all segments for a specific story for the authenticated user.

- `useStorySegment(segmentId: string | null)`
  React Query hook to fetch a specific story segment by ID for the authenticated user.

- `useCreateStorySegment()`
  React Query hook to create a new story segment for the authenticated user.

- `useUpdateStorySegment()`
  React Query hook to update an existing story segment for the authenticated user.

- `useDeleteStorySegment()`
  React Query hook to delete a story segment for the authenticated user.

### Story Choice Hooks

- `useStoryChoices(segmentId: string | null)`
  React Query hook to fetch all choices for a specific story segment for the authenticated user.

- `useCreateStoryChoice()`
  React Query hook to create a new story choice for the authenticated user.

- `useUpdateStoryChoice()`
  React Query hook to update an existing story choice for the authenticated user.

- `useDeleteStoryChoice()`
  React Query hook to delete a story choice for the authenticated user.

### Optimized Query Hooks

- `useStoriesPaginated(page: number, limit: number = 10)`
  React Query hook to fetch stories with pagination for the authenticated user.

- `useStoriesByStatus(status: Story['status'])`
  React Query hook to fetch stories filtered by status for the authenticated user.

- `useStoriesByGenre(genre: string)`
  React Query hook to fetch stories filtered by genre for the authenticated user.

- `useSearchStories(searchTerm: string)`
  React Query hook to search stories for the authenticated user.

- `useRecentStories(limit: number = 5)`
  React Query hook to fetch recent stories for the authenticated user.

## Error Handling

All functions throw `StoryServiceError` with a descriptive message and error code when operations fail. The error codes include:

- `VALIDATION_ERROR`: Data validation failed
- `CREATE_STORY_ERROR`: Failed to create a story
- `FETCH_STORIES_ERROR`: Failed to fetch stories
- `STORY_NOT_FOUND`: Story not found or unauthorized
- `UPDATE_STORY_ERROR`: Failed to update a story
- `DELETE_STORY_ERROR`: Failed to delete a story
- `CREATE_SEGMENT_ERROR`: Failed to create a story segment
- `FETCH_SEGMENTS_ERROR`: Failed to fetch story segments
- `SEGMENT_NOT_FOUND`: Story segment not found or unauthorized
- `UPDATE_SEGMENT_ERROR`: Failed to update a story segment
- `DELETE_SEGMENT_ERROR`: Failed to delete a story segment
- `CREATE_CHOICE_ERROR`: Failed to create a story choice
- `FETCH_CHOICES_ERROR`: Failed to fetch story choices
- `CHOICE_NOT_FOUND`: Story choice not found or unauthorized
- `UPDATE_CHOICE_ERROR`: Failed to update a story choice
- `DELETE_CHOICE_ERROR`: Failed to delete a story choice
- `NOT_AUTHENTICATED`: User is not authenticated
- `MISSING_STORY_ID`: Story ID is required
- `MISSING_SEGMENT_ID`: Segment ID is required
- `MISSING_USER_ID`: User ID is required

## Authentication Integration

All functions require a user ID parameter to ensure that users can only access and modify their own data. The React Query hooks automatically obtain the user ID from the authentication context using the `useAuth` hook.

## Data Validation

All create and update functions include data validation to ensure that:

- Stories have a title, genre, and age group
- Story segments have content and a valid position
- Story choices have text
- All data is properly sanitized before being processed

## Usage Examples

### Creating a Story

```typescript
const { mutate: createStory } = useCreateStory();

const handleCreateStory = () => {
  createStory({
    title: "My Adventure",
    description: "An exciting adventure story",
    genre: "Adventure",
    age_group: "7-9",
    status: "draft"
  });
};
```

### Fetching Stories

```typescript
const { data: stories, isLoading } = useStories();
```

### Updating a Story

```typescript
const { mutate: updateStory } = useUpdateStory();

const handleUpdateStory = (storyId: string) => {
  updateStory({ 
    storyId, 
    storyData: { 
      title: "Updated Adventure",
      status: "published"
    } 
  });
};
```

### Deleting a Story

```typescript
const { mutate: deleteStory } = useDeleteStory();

const handleDeleteStory = (storyId: string) => {
  deleteStory(storyId);
};