import { useState, useMemo } from 'react';
import { LO } from '../App';
import LOCard from './LOCard';

type MainPanelProps = {
  loData: LO[];
  searchQuery: string;
  tierFilter: string;
  nfqFilter: string;
  sortOption: string;
};

const ITEMS_PER_PAGE = 50;

export default function MainPanel({ loData, searchQuery, tierFilter, nfqFilter, sortOption }: MainPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSorted = useMemo(() => {
    let result = loData;

    // Filter by search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(lo => lo.loText.toLowerCase().includes(lowerQ));
    }

    // Filter by tier
    if (tierFilter !== 'All') {
      const tierNum = parseInt(tierFilter, 10);
      result = result.filter(lo => lo.d1.tier === tierNum);
    }

    // Filter by NFQ
    if (nfqFilter !== 'All') {
      const nfqNum = parseInt(nfqFilter, 10);
      result = result.filter(lo => lo.nfqLevel === nfqNum);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'D1 Score ↑': return a.d1.score - b.d1.score;
        case 'D1 Score ↓': return b.d1.score - a.d1.score;
        case 'Composite ↑': return a.compositeScore - b.compositeScore;
        case 'Composite ↓': return b.compositeScore - a.compositeScore;
        case 'Module Code A-Z': return a.moduleCode.localeCompare(b.moduleCode);
        default: return 0; // Default order
      }
    });

    return result;
  }, [loData, searchQuery, tierFilter, nfqFilter, sortOption]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, tierFilter, nfqFilter, sortOption]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (filteredAndSorted.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No Learning Outcomes match your filters.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="space-y-4">
        {paginatedData.map(lo => (
          <LOCard key={lo.loId} lo={lo} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
