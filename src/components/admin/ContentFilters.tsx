import React from 'react';

interface ContentFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  selectedCount: number;
  onBulkAction: (action: 'approve' | 'remove' | 'warn') => void;
  onRefresh: () => void;
  loading: boolean;
}

const ContentFilters: React.FC<ContentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  selectedCount,
  onBulkAction,
  onRefresh,
  loading
}) => {
  return (
    <div className="glass-enhanced bg-black/20 border border-white/20 rounded-2xl p-6 mb-6">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search content..."
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="reported">Reported</option>
            <option value="pending">Pending</option>
            <option value="removed">Removed</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
          >
            <option value="reports">Reports</option>
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="views">Views</option>
            <option value="likes">Likes</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">
            {selectedCount > 0 ? `${selectedCount} selected` : 'No items selected'}
          </span>
          
          {selectedCount > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => onBulkAction('approve')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                ✅ Approve All
              </button>
              <button
                onClick={() => onBulkAction('warn')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm transition-colors"
              >
                ⚠️ Warn All
              </button>
              <button
                onClick={() => onBulkAction('remove')}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                🗑️ Remove All
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="fantasy-btn bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
              <span>Loading...</span>
            </div>
          ) : (
            '🔄 Refresh'
          )}
        </button>
      </div>
    </div>
  );
};

export default ContentFilters;