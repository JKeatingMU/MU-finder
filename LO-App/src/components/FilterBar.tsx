import { useEffect, useState } from 'react';

type FilterBarProps = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tierFilter: string;
  setTierFilter: (t: string) => void;
  nfqFilter: string;
  setNfqFilter: (n: string) => void;
  sortOption: string;
  setSortOption: (s: string) => void;
  totalResults: number;
};

export default function FilterBar({
  searchQuery, setSearchQuery,
  tierFilter, setTierFilter,
  nfqFilter, setNfqFilter,
  sortOption, setSortOption,
  totalResults
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  return (
    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center gap-4 text-sm">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search LO text..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-[#4a90d9] focus:ring-1 focus:ring-[#4a90d9]"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-gray-600 font-medium">D1 Tier:</label>
        <select 
          value={tierFilter} 
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-2 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-[#4a90d9]"
        >
          <option value="All">All</option>
          <option value="0">Tier 0</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-gray-600 font-medium">NFQ Level:</label>
        <select 
          value={nfqFilter} 
          onChange={(e) => setNfqFilter(e.target.value)}
          className="px-2 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-[#4a90d9]"
        >
          <option value="All">All</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-gray-600 font-medium">Sort:</label>
        <select 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)}
          className="px-2 py-1.5 border border-gray-300 rounded bg-white focus:outline-none focus:border-[#4a90d9]"
        >
          <option value="Default">Default</option>
          <option value="D1 Score ↑">D1 Score ↑</option>
          <option value="D1 Score ↓">D1 Score ↓</option>
          <option value="Composite ↑">Composite ↑</option>
          <option value="Composite ↓">Composite ↓</option>
          <option value="Module Code A-Z">Module Code A-Z</option>
        </select>
      </div>

      <div className="text-gray-500 font-medium ml-auto">
        Showing {totalResults.toLocaleString()} LOs
      </div>
    </div>
  );
}
