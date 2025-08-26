import React, { useState, useEffect } from 'react';
import { UserStoryTemplate, templateService } from '../../services/templateService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Heart, 
  BookOpen, 
  Star, 
  TrendingUp,
  Search,
  Users,
  Eye,
  Bookmark,
  Plus
} from 'lucide-react';
import { useAuth } from '../../providers/AuthContext';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface TemplateMarketplaceProps {
  onCreateTemplate?: () => void;
  onUseTemplate?: (templateId: string) => void;
}

const genres = [
  'All Genres',
  'Adventure', 'Fantasy', 'Mystery', 'Science Fiction', 'Fairy Tale',
  'Friendship', 'Family', 'Educational', 'Comedy', 'Drama'
];

const ageGroups = [
  { value: 'all', label: 'All Ages' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-8', label: '6-8 years' },
  { value: '9-12', label: '9-12 years' },
  { value: '13+', label: '13+ years' }
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'liked', label: 'Most Liked' },
  { value: 'used', label: 'Most Used' },
  { value: 'rating', label: 'Highest Rated' }
];

interface TemplateCardProps {
  template: UserStoryTemplate;
  onUse?: (templateId: string) => void;
  onLike?: (templateId: string) => void;
  onSave?: (templateId: string) => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUse,
  onLike,
  onSave,
  isLiked = false,
  isSaved = false
}) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {template.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              by {template.creator?.full_name || 'Anonymous'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <Badge variant="outline" className="text-xs">
              {template.genre}
            </Badge>
            {template.is_featured && (
              <Badge className="bg-yellow-500 text-yellow-900 text-xs">
                Featured
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {template.age_group}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {template.estimated_chapters} chapters
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {template.rating_average?.toFixed(1) || 'N/A'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className={cn('w-4 h-4', isLiked && 'text-red-500 fill-red-500')} />
              {template.likes_count}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {template.usage_count}
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className={cn('w-4 h-4', isSaved && 'text-blue-500 fill-blue-500')} />
              {template.saves_count}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {new Date(template.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onUse?.(template.id)}
            className="flex-1"
            size="sm"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Use Template
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLike?.(template.id)}
            className={cn(isLiked && 'text-red-500 border-red-200')}
          >
            <Heart className={cn('w-4 h-4', isLiked && 'fill-red-500')} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSave?.(template.id)}
            className={cn(isSaved && 'text-blue-500 border-blue-200')}
          >
            <Bookmark className={cn('w-4 h-4', isSaved && 'fill-blue-500')} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  onCreateTemplate,
  onUseTemplate
}) => {
  const { user, userProfile } = useAuth();
  const [templates, setTemplates] = useState<UserStoryTemplate[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<UserStoryTemplate[]>([]);
  const [myTemplates, setMyTemplates] = useState<UserStoryTemplate[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<UserStoryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [likedTemplates, setLikedTemplates] = useState<Set<string>>(new Set());
  const [savedTemplateIds, setSavedTemplateIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const [allTemplates, featured, myOwn, saved] = await Promise.all([
        templateService.getPublicTemplates({ 
          limit: 50,
          genre: selectedGenre !== 'All Genres' ? selectedGenre : undefined,
          age_group: selectedAgeGroup !== 'all' ? selectedAgeGroup as '3-5' | '6-8' | '9-12' | '13+' : undefined,
          sort_by: sortBy === 'popular' ? 'popular' : 
                   sortBy === 'liked' ? 'highly_rated' :
                   sortBy === 'rating' ? 'highly_rated' :
                   sortBy === 'used' ? 'most_used' :
                   'recent',
          search: searchTerm || undefined
        }),
        templateService.getFeaturedTemplates(),
        user?.id ? templateService.getUserTemplates(user.id) : Promise.resolve([]),
        user?.id ? templateService.getUserSavedTemplates(user.id) : Promise.resolve([])
      ]);

      setTemplates(allTemplates);
      setFeaturedTemplates(featured);
      setMyTemplates(myOwn);
      setSavedTemplates(saved);
      setSavedTemplateIds(new Set(saved.map(t => t.id)));
      
      // Load liked templates for current user
      if (user?.id) {
        try {
          // Note: getUserLikedTemplates method doesn't exist yet
          // For now, we'll set empty set and implement this later
          setLikedTemplates(new Set());
        } catch (error) {
          console.warn('Failed to load liked templates:', error);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    if (!user?.id) {
      toast.error('Please log in to use templates');
      return;
    }

    try {
      const success = await templateService.useTemplate(user.id, templateId);
      if (success) {
        toast.success('Template ready to use!');
        onUseTemplate?.(templateId);
        loadTemplates(); // Refresh to update usage counts
      } else {
        toast.error('Failed to use template');
      }
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to use template');
    }
  };

  const handleLikeTemplate = async (templateId: string) => {
    if (!user?.id) {
      toast.error('Please log in to like templates');
      return;
    }

    try {
      const result = await templateService.toggleTemplateLike(user.id, templateId);
      
      if (result.liked) {
        setLikedTemplates(prev => new Set([...prev, templateId]));
        toast.success('Template liked!');
      } else {
        setLikedTemplates(prev => {
          const newSet = new Set(prev);
          newSet.delete(templateId);
          return newSet;
        });
        toast.success('Template unliked');
      }
      
      loadTemplates(); // Refresh to update like counts
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleSaveTemplate = async (templateId: string) => {
    if (!user?.id) {
      toast.error('Please log in to save templates');
      return;
    }

    try {
      const result = await templateService.toggleTemplateSave(user.id, templateId);
      
      if (result.saved) {
        setSavedTemplateIds(prev => new Set([...prev, templateId]));
        toast.success('Template saved!');
      } else {
        setSavedTemplateIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(templateId);
          return newSet;
        });
        toast.success('Template removed from saved');
      }
      
      loadTemplates(); // Refresh to update save counts
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update save status');
    }
  };

  useEffect(() => {
    const delayedLoad = setTimeout(loadTemplates, 300);
    return () => clearTimeout(delayedLoad);
  }, [searchTerm, selectedGenre, selectedAgeGroup, sortBy]);

  const canCreateTemplates = userProfile?.subscription_tier !== 'free';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Template Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and use story templates created by the community
          </p>
        </div>
        
        {canCreateTemplates && onCreateTemplate && (
          <Button onClick={onCreateTemplate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {genres.map(genre => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ageGroups.map(group => (
              <SelectItem key={group.value} value={group.value}>
                {group.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Template Tabs */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">
            Browse ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="featured">
            Featured ({featuredTemplates.length})
          </TabsTrigger>
          {user && (
            <>
              <TabsTrigger value="my-templates">
                My Templates ({myTemplates.length})
              </TabsTrigger>
              <TabsTrigger value="saved">
                Saved ({savedTemplates.length})
              </TabsTrigger>
            </>
          )}
        </TabsList>
        
        {/* Browse Tab */}
        <TabsContent value="browse" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                  onLike={handleLikeTemplate}
                  onSave={handleSaveTemplate}
                  isLiked={likedTemplates.has(template.id)}
                  isSaved={savedTemplateIds.has(template.id)}
                />
              ))}
            </div>
          )}
          
          {!loading && templates.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No templates found matching your criteria</p>
            </div>
          )}
        </TabsContent>
        
        {/* Featured Tab */}
        <TabsContent value="featured" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                onLike={handleLikeTemplate}
                onSave={handleSaveTemplate}
                isLiked={likedTemplates.has(template.id)}
                isSaved={savedTemplateIds.has(template.id)}
              />
            ))}
          </div>
          
          {featuredTemplates.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No featured templates at the moment</p>
            </div>
          )}
        </TabsContent>
        
        {/* My Templates Tab */}
        {user && (
          <TabsContent value="my-templates" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                  onLike={handleLikeTemplate}
                  onSave={handleSaveTemplate}
                  isLiked={likedTemplates.has(template.id)}
                  isSaved={savedTemplateIds.has(template.id)}
                />
              ))}
            </div>
            
            {myTemplates.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">You haven't created any templates yet</p>
                {canCreateTemplates && onCreateTemplate && (
                  <Button onClick={onCreateTemplate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Template
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        )}
        
        {/* Saved Tab */}
        {user && (
          <TabsContent value="saved" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                  onLike={handleLikeTemplate}
                  onSave={handleSaveTemplate}
                  isLiked={likedTemplates.has(template.id)}
                  isSaved={savedTemplateIds.has(template.id)}
                />
              ))}
            </div>
            
            {savedTemplates.length === 0 && (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No saved templates yet</p>
                <p className="text-sm text-muted-foreground">Save templates you like to use them later</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};