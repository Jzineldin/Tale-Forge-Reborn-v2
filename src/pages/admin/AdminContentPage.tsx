import React, { useState } from 'react';
import { useContentManagement, ContentItem } from '@/hooks/useContentManagement';
import ContentReviewModal from '@/components/admin/ContentReviewModal';
import ContentFilters from '@/components/admin/ContentFilters';
import ContentTable from '@/components/admin/ContentTable';

const AdminContentPage: React.FC = () => {
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('reports');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Selection and modal state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  // Content management hook
  const {
    content,
    loading,
    error,
    totalCount,
    refreshContent,
    takeContentAction,
    bulkAction
  } = useContentManagement({
    searchTerm,
    filter,
    sortBy,
    sortOrder
  });

  const handleContentAction = async (contentId: string, action: 'approve' | 'remove' | 'warn') => {
    try {
      await takeContentAction(contentId, action);
      setReviewModalOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error(`Failed to ${action} content:`, error);
      // You could add toast notification here
    }
  };

  const handleBulkAction = async (action: 'approve' | 'remove' | 'warn') => {
    if (selectedItems.length === 0) return;
    
    try {
      await bulkAction(selectedItems, action);
      setSelectedItems([]);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
      // You could add toast notification here
    }
  };

  const handleItemSelect = (item: ContentItem) => {
    setSelectedContent(item);
    setReviewModalOpen(true);
  };

  const filteredContent = React.useMemo(() => {
    let filtered = [...content];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.status === filter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'reports':
          aValue = a.reports;
          bValue = b.reports;
          break;
        case 'createdAt':
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
        case 'views':
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        case 'likes':
          aValue = a.likes || 0;
          bValue = b.likes || 0;
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

    return filtered;
  }, [content, searchTerm, filter, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="fantasy-heading text-4xl font-bold mb-4 text-center">
            🛡️ Content Moderation Portal
          </h1>
          <div className="text-center text-gray-300">
            <p className="mb-2">Monitor and moderate user-generated content</p>
            <div className="flex justify-center gap-6 text-sm">
              <span>Total Stories: <strong className="text-white">{totalCount}</strong></span>
              <span>Filtered Results: <strong className="text-white">{filteredContent.length}</strong></span>
              {selectedItems.length > 0 && (
                <span>Selected: <strong className="text-purple-300">{selectedItems.length}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-300">❌ Error: {error}</p>
          </div>
        )}

        {/* Filters */}
        <ContentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          selectedCount={selectedItems.length}
          onBulkAction={handleBulkAction}
          onRefresh={refreshContent}
          loading={loading}
        />

        {/* Content Table */}
        <ContentTable
          content={filteredContent}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onItemSelect={handleItemSelect}
          loading={loading}
        />

        {/* Review Modal */}
        <ContentReviewModal
          content={selectedContent}
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedContent(null);
          }}
          onAction={handleContentAction}
        />
      </div>
    </div>
  );
};

export default AdminContentPage;