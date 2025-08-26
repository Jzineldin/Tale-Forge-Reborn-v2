import React, { useState, useEffect } from 'react';
import { AchievementProgress, UserAchievement, achievementService } from '../../services/achievementService';
import { AchievementCard } from './AchievementCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Trophy, Star, Crown, Zap } from 'lucide-react';
import { useAuth } from '../../providers/AuthContext';
import { toast } from 'react-hot-toast';

interface AchievementListProps {
  showCompleted?: boolean;
  compact?: boolean;
}

const categoryFilters = [
  { value: 'all', label: 'All Categories' },
  { value: 'story_creation', label: 'Story Creation' },
  { value: 'template_creation', label: 'Template Creation' },
  { value: 'social_engagement', label: 'Social Engagement' },
  { value: 'special_events', label: 'Special Events' },
  { value: 'milestones', label: 'Milestones' }
];

const tierFilters = [
  { value: 'all', label: 'All Tiers' },
  { value: 'novice', label: 'Novice', icon: Star },
  { value: 'intermediate', label: 'Intermediate', icon: Badge },
  { value: 'advanced', label: 'Advanced', icon: Crown },
  { value: 'master', label: 'Master', icon: Trophy },
  { value: 'legendary', label: 'Legendary', icon: Zap }
];

export const AchievementList: React.FC<AchievementListProps> = ({
  showCompleted = true,
  compact = false
}) => {
  const { user } = useAuth();
  const [availableAchievements, setAvailableAchievements] = useState<AchievementProgress[]>([]);
  const [unclaimedAchievements, setUnclaimedAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    if (user?.id) {
      loadAchievements();
    }
  }, [user?.id]);

  const loadAchievements = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const [available, unclaimed] = await Promise.all([
        achievementService.getAvailableAchievements(user.id),
        achievementService.getUnclaimedAchievements(user.id)
      ]);
      
      setAvailableAchievements(available);
      setUnclaimedAchievements(unclaimed);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAchievement = async (achievementId: string) => {
    if (!user?.id) return;
    
    try {
      const success = await achievementService.claimAchievement(user.id, achievementId);
      if (success) {
        toast.success('Achievement claimed successfully!');
        loadAchievements(); // Refresh data
      } else {
        toast.error('Failed to claim achievement');
      }
    } catch (error) {
      console.error('Error claiming achievement:', error);
      toast.error('Failed to claim achievement');
    }
  };

  const filterAchievements = (achievements: AchievementProgress[]) => {
    return achievements.filter(achievement => {
      const matchesSearch = achievement.achievement_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        achievement.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        achievement.category === selectedCategory;
      
      const matchesTier = selectedTier === 'all' || 
        achievement.tier === selectedTier;
      
      const matchesCompleted = showCompleted || !achievement.is_completed;
      
      return matchesSearch && matchesCategory && matchesTier && matchesCompleted;
    });
  };

  const completedCount = availableAchievements.filter(a => a.is_completed).length;
  const inProgressCount = availableAchievements.filter(a => !a.is_completed && a.current_progress > 0).length;
  const unclaimedCount = unclaimedAchievements.length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex flex-wrap gap-4">
        <Badge variant="secondary" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          {completedCount} Completed
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          {inProgressCount} In Progress
        </Badge>
        {unclaimedCount > 0 && (
          <Badge className="bg-yellow-500 text-yellow-900 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {unclaimedCount} To Claim
          </Badge>
        )}
      </div>

      {/* Filters */}
      {!compact && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              {tierFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  <div className="flex items-center gap-2">
                    {filter.icon && <filter.icon className="w-4 h-4" />}
                    {filter.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Achievement Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            Available ({availableAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="unclaimed">
            Unclaimed ({unclaimedCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4 mt-6">
          {filterAchievements(availableAchievements).map(achievement => (
            <AchievementCard
              key={achievement.achievement_id}
              achievement={achievement}
              isCompleted={achievement.is_completed}
              showProgress={true}
              compact={compact}
            />
          ))}
          
          {filterAchievements(availableAchievements).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No achievements match your filters</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="unclaimed" className="space-y-4 mt-6">
          {unclaimedAchievements.map(userAchievement => (
            <AchievementCard
              key={userAchievement.id}
              achievement={userAchievement.achievement!}
              isCompleted={true}
              canClaim={true}
              onClaim={() => handleClaimAchievement(userAchievement.achievement_id)}
              showProgress={false}
              compact={compact}
            />
          ))}
          
          {unclaimedAchievements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No unclaimed achievements</p>
              <p className="text-sm">Complete achievements to earn rewards!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};