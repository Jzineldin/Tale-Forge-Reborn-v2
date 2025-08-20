import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import { supabase } from '@/lib/supabase';

interface ContentItem {
  id: string;
  title: string;
  author: string;
  authorId: string;
  status: 'published' | 'reported' | 'removed' | 'pending';
  type: 'story' | 'tutorial' | 'page' | 'comment';
  createdAt: string;
  reports: number;
  reportReasons: string[];
  content: string;
  ageGroup?: string;
  genre?: string;
  views?: number;
  likes?: number;
  lastReviewedAt?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ReviewModalProps {
  content: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (contentId: string, action: 'approve' | 'remove' | 'warn') => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ content, isOpen, onClose, onAction }) => {
  if (!isOpen || !content) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-enhanced bg-black/40 border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="fantasy-heading text-2xl font-bold">
            🔍 Content Review
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Content Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass-card bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">📋 Content Details</h4>
            <div className="space-y-2 text-sm">
              <div><span className="text-white/60">Title:</span> <span className="text-white font-medium">{content.title}</span></div>
              <div><span className="text-white/60">Author:</span> <span className="text-white font-medium">{content.author}</span></div>
              <div><span className="text-white/60">Type:</span> <span className="text-white font-medium">{content.type}</span></div>
              <div><span className="text-white/60">Created:</span> <span className="text-white font-medium">{content.createdAt}</span></div>
              <div><span className="text-white/60">Views:</span> <span className="text-white font-medium">{content.views || 0}</span></div>
              <div><span className="text-white/60">Likes:</span> <span className="text-white font-medium">{content.likes || 0}</span></div>
            </div>
          </div>

          <div className="glass-card bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3">⚠️ Report Information</h4>
            <div className="space-y-2 text-sm">
              <div><span className="text-white/60">Reports:</span> <span className="text-red-400 font-bold">{content.reports}</span></div>
              <div>
                <span className="text-white/60">Severity:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(content.severity)}`}>
                  {content.severity.toUpperCase()}
                </span>
              </div>
              <div className="text-white/60 text-xs">Report Reasons:</div>
              <div className="flex flex-wrap gap-1">
                {content.reportReasons.map((reason, index) => (
                  <span key={index} className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="glass-card bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <h4 className="text-white font-bold mb-3">📄 Content Preview</h4>
          <div className="bg-black/20 border border-white/10 rounded-lg p-4 max-h-48 overflow-y-auto">
            <p className="text-white/80 text-sm whitespace-pre-wrap">{content.content}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => onAction(content.id, 'approve')}
            className="fantasy-btn bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg flex items-center space-x-2"
          >
            <span>✅</span>
            <span>Approve & Restore</span>
          </Button>
          <Button
            onClick={() => onAction(content.id, 'warn')}
            className="fantasy-btn bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg flex items-center space-x-2"
          >
            <span>⚠️</span>
            <span>Warning to Author</span>
          </Button>
          <Button
            onClick={() => onAction(content.id, 'remove')}
            className="fantasy-btn bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg flex items-center space-x-2"
          >
            <span>🗑️</span>
            <span>Remove Content</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminContentPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('reports');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);

  // Fetch real content data from database
  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log('Fetching real content data...');
        
        // First, check if we can access stories at all
        const { count: totalStories } = await supabase
          .from('stories')
          .select('*', { count: 'exact', head: true });
          
        console.log('Total stories accessible:', totalStories);

        // Try admin RPC function first to bypass RLS
        console.log('🚀 Trying admin RPC function to bypass RLS...');
        const { data: rpcStories, error: rpcError } = await supabase.rpc('get_all_stories_for_admin');
        
        let stories, error;
        
        if (rpcError) {
          console.log('❌ RPC function failed, trying direct query:', rpcError);
          // Fallback to direct query
          const result = await supabase
            .from('stories')
            .select(`
              id,
              title,
              user_id,
              created_at,
              updated_at,
              genre,
              target_age,
              is_completed,
              description
            `)
            .order('created_at', { ascending: false })
            .limit(100);
          stories = result.data;
          error = result.error;
        } else {
          console.log('✅ RPC function succeeded!');
          stories = rpcStories;
          error = null;
        }

        console.log('Stories fetch result:', { stories: stories?.length, error });

        if (error) {
          console.error('Error fetching stories:', error);
          console.error('Error details:', error.details, error.hint, error.code);
          
          // Try a simpler query as fallback
          console.log('Trying simpler query...');
          const { data: simpleStories, error: simpleError } = await supabase
            .from('stories')
            .select('id, title, user_id, created_at')
            .limit(10);
            
          console.log('Simple query result:', { simpleStories: simpleStories?.length, simpleError });
          
          if (simpleError) {
            console.error('Simple query also failed:', simpleError);
            setLoading(false);
            return;
          } else {
            // Use simple stories as fallback
            const fallbackContent: ContentItem[] = (simpleStories || []).map((story: any) => ({
              id: story.id,
              title: story.title || 'Untitled Story',
              author: `User ${story.user_id.substring(0, 8)}`,
              authorId: story.user_id,
              status: 'published' as const,
              type: 'story' as const,
              createdAt: new Date(story.created_at).toLocaleDateString(),
              reports: 0,
              reportReasons: [],
              content: 'Content not accessible due to permissions',
              ageGroup: '6-8',
              genre: 'Unknown',
              views: 0,
              likes: 0,
              severity: 'low' as const
            }));
            
            setContent(fallbackContent);
            setLoading(false);
            return;
          }
        }

        // Get user profiles for author names
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name');

        // Create profiles map for quick lookup
        const profilesMap = new Map();
        profiles?.forEach(p => profilesMap.set(p.id, p));

        // Transform stories to ContentItem format
        const transformedContent: ContentItem[] = (stories || []).map((story: any) => {
          const profile = profilesMap.get(story.user_id);
          const authorName = profile?.full_name || profile?.email?.split('@')[0] || `User ${story.user_id.substring(0, 8)}`;
          
          // Simulate some stories having reports (for demo purposes)
          const hasReports = Math.random() < 0.05; // 5% of stories have reports
          const reportCount = hasReports ? Math.floor(Math.random() * 3) + 1 : 0;
          const reportReasons = hasReports ? ['Inappropriate Content', 'Spam', 'Copyright Issue'].slice(0, reportCount) : [];
          
          return {
            id: story.id,
            title: story.title || 'Untitled Story',
            author: authorName,
            authorId: story.user_id,
            status: reportCount > 2 ? 'reported' : (story.is_completed ? 'published' : 'pending'),
            type: 'story' as const,
            createdAt: new Date(story.created_at).toLocaleDateString(),
            reports: reportCount,
            reportReasons,
            content: story.description || 'No content available',
            ageGroup: story.target_age || '6-8',
            genre: story.genre || 'Fantasy',
            views: Math.floor(Math.random() * 1000) + 10, // Simulated views
            likes: Math.floor(Math.random() * 100) + 1, // Simulated likes
            lastReviewedAt: reportCount > 0 ? new Date().toISOString() : undefined,
            severity: reportCount > 2 ? 'critical' : reportCount > 1 ? 'high' : reportCount > 0 ? 'medium' : 'low'
          } as ContentItem;
        });

        console.log(`Loaded ${transformedContent.length} stories for content management`);
        setContent(transformedContent);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching content:', error);
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Add a demo reported content item for admin training
  useEffect(() => {
    if (content.length > 0) {
      const mockReported: ContentItem = {
        id: 'reported-demo',
        title: 'Reported Content Example',
        author: 'Demo User',
        authorId: 'demo-user-id',
        status: 'reported',
        type: 'story',
        createdAt: new Date().toLocaleDateString(),
        reports: 5,
        reportReasons: ['Inappropriate Language', 'Violence', 'Not Age Appropriate'],
        content: 'This is an example of content that has been reported by multiple users and requires admin review. The content contains elements that may not be suitable for the target age group...',
        ageGroup: '6-8',
        genre: 'Adventure',
        views: 89,
        likes: 3,
        severity: 'critical'
      };
      
      // Add demo content to beginning of list (only once)
      setContent(prev => prev.find(item => item.id === 'reported-demo') ? prev : [mockReported, ...prev]);
    }
  }, [content.length]);

  const filteredContent = content
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        (filter === 'published' && item.status === 'published') ||
        (filter === 'reported' && item.status === 'reported') ||
        (filter === 'removed' && item.status === 'removed') ||
        (filter === 'story' && item.type === 'story') ||
        (filter === 'tutorial' && item.type === 'tutorial') ||
        (filter === 'high-priority' && ['high', 'critical'].includes(item.severity));
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'reports':
          aValue = a.reports;
          bValue = b.reports;
          break;
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'severity':
          const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = severityOrder[a.severity];
          bValue = severityOrder[b.severity];
          break;
        default:
          aValue = a.reports;
          bValue = b.reports;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredContent.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredContent.map(item => item.id));
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = (action: string) => {
    // In a real app, this would make API calls
    console.log(`${action} action for items:`, selectedItems);
    setSelectedItems([]);
  };

  const handleReviewContent = (item: ContentItem) => {
    setSelectedContent(item);
    setReviewModalOpen(true);
  };

  const handleContentAction = (contentId: string, action: 'approve' | 'remove' | 'warn') => {
    // In a real app, this would make API calls
    console.log(`${action} action for content:`, contentId);
    
    // Update content status locally
    setContent(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, status: action === 'approve' ? 'published' : action === 'remove' ? 'removed' : item.status }
        : item
    ));
    
    setReviewModalOpen(false);
    setSelectedContent(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400';
      case 'reported': return 'text-red-400';
      case 'removed': return 'text-gray-400';
      case 'pending': return 'text-amber-400';
      default: return 'text-white/60';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white/80">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" 
                  style={{ fontFamily: 'Cinzel, serif' }}>
                📝 Content Management
              </h1>
              <p className="text-xl text-white/90">
                Monitor and moderate user-generated content • Total: {filteredContent.length} items
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search content by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">🔍</div>
              </div>
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="glass-input px-4 py-3 rounded-xl"
            >
              <option value="all">All Content</option>
              <option value="published">Published</option>
              <option value="reported">Reported</option>
              <option value="removed">Removed</option>
              <option value="story">Stories Only</option>
              <option value="high-priority">High Priority</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="glass-input px-4 py-3 rounded-xl"
            >
              <option value="reports-desc">Most Reported</option>
              <option value="reports-asc">Least Reported</option>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="severity-desc">High Severity</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="glass-enhanced backdrop-blur-lg bg-amber-500/20 border border-amber-400/30 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">
                {selectedItems.length} item(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBulkAction('approve')}
                  className="fantasy-btn bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleBulkAction('remove')}
                  className="fantasy-btn bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Table */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredContent.length && filteredContent.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-amber-500 bg-white/20 border-white/30 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Content</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Author</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Reports</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Severity</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-white/80 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredContent.map((item) => {
                  const needsReview = item.status === 'reported' || item.reports > 0;
                  
                  return (
                    <tr key={item.id} className={`hover:bg-white/5 transition-colors ${needsReview ? 'bg-red-500/10' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemSelect(item.id)}
                          className="w-4 h-4 text-amber-500 bg-white/20 border-white/30 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{item.title}</div>
                          <div className="text-white/60 text-sm">{item.type} • {item.genre} • Ages {item.ageGroup}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{item.author}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">
                          {item.reports > 0 ? (
                            <span className="text-red-400 font-bold">{item.reports}</span>
                          ) : (
                            <span className="text-green-400">0</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                          {item.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">{item.createdAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {needsReview && (
                            <button
                              onClick={() => handleReviewContent(item)}
                              className="text-amber-400 hover:text-amber-300 transition-colors p-1"
                              title="Review content"
                            >
                              🔍
                            </button>
                          )}
                          <button
                            onClick={() => handleContentAction(item.id, 'approve')}
                            className="text-green-400 hover:text-green-300 transition-colors p-1"
                            title="Approve content"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleContentAction(item.id, 'remove')}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                            title="Remove content"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredContent.length === 0 && !loading && (
          <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Content Found</h3>
            <p className="text-white/70 mb-8">
              {searchTerm || filter !== 'all' 
                ? "No content matches your current search criteria."
                : "No content has been submitted yet."
              }
            </p>
          </div>
        )}

        {/* Review Modal */}
        <ReviewModal
          content={selectedContent}
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onAction={handleContentAction}
        />
      </div>
    </div>
  );
};

export default AdminContentPage;