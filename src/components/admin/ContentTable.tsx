import React from 'react';
import { ContentItem } from '@/hooks/useContentManagement';

interface ContentTableProps {
  content: ContentItem[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onItemSelect: (item: ContentItem) => void;
  loading: boolean;
}

const ContentTable: React.FC<ContentTableProps> = ({
  content,
  selectedItems,
  onSelectionChange,
  onItemSelect,
  loading
}) => {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectionChange(content.map(item => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleItemToggle = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'published':
        return `${baseClasses} bg-green-500/20 text-green-300`;
      case 'reported':
        return `${baseClasses} bg-red-500/20 text-red-300`;
      case 'pending':
        return `${baseClasses} bg-amber-500/20 text-amber-300`;
      case 'removed':
        return `${baseClasses} bg-gray-500/20 text-gray-300`;
      default:
        return `${baseClasses} bg-purple-500/20 text-purple-300`;
    }
  };

  if (loading) {
    return (
      <div className="glass-enhanced bg-black/20 border border-white/20 rounded-2xl p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading content...</p>
        </div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="glass-enhanced bg-black/20 border border-white/20 rounded-2xl p-8">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">📝</p>
          <p>No content found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-enhanced bg-black/20 border border-white/20 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/20 border-b border-white/10">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={content.length > 0 && selectedItems.length === content.length}
                  onChange={handleSelectAll}
                  className="rounded bg-black/20 border border-white/20 text-purple-500 focus:ring-purple-500"
                />
              </th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">Title</th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">Author</th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">Reports</th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">Severity</th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">Created</th>
              <th className="p-4 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {content.map((item) => (
              <tr
                key={item.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                    className="rounded bg-black/20 border border-white/20 text-purple-500 focus:ring-purple-500"
                  />
                </td>
                <td className="p-4">
                  <div className="text-white font-medium truncate max-w-xs" title={item.title}>
                    {item.title}
                  </div>
                  {item.genre && (
                    <div className="text-xs text-gray-400 mt-1">{item.genre}</div>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-white">{item.author}</div>
                  {item.ageGroup && (
                    <div className="text-xs text-gray-400 mt-1">{item.ageGroup}</div>
                  )}
                </td>
                <td className="p-4">
                  <span className={getStatusBadge(item.status)}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`font-bold ${item.reports > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {item.reports}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`font-medium ${getSeverityColor(item.severity)}`}>
                    {item.severity}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-white text-sm">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onItemSelect(item)}
                    className="fantasy-btn bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentTable;