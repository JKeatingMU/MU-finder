import { Institution, LO } from '../App';

const SECTORS: Record<string, string> = {
  PU: 'Public University',
  TU: 'Technological University',
  IT: 'Institute of Technology',
  CE: 'College of Education',
  PS: 'Private / Specialised',
  ALL: 'All Institutions',
};

type StatsPanelProps = {
  institution: Institution;
  loData: LO[];
  onOpenInfo: () => void;
};

export default function StatsPanel({ institution, loData, onOpenInfo }: StatsPanelProps) {
  // Calculate real-time tier distribution from loaded data
  const tierCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  loData.forEach(lo => {
    if (lo.d1.tier >= 0 && lo.d1.tier <= 3) {
      tierCounts[lo.d1.tier as keyof typeof tierCounts]++;
    }
  });
  
  const total = loData.length || 1; // prevent div by zero
  const p0 = (tierCounts[0] / total) * 100;
  const p1 = (tierCounts[1] / total) * 100;
  const p2 = (tierCounts[2] / total) * 100;
  const p3 = (tierCounts[3] / total) * 100;

  return (
    <div className="px-6 py-4 flex items-center justify-between bg-white">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">{institution.fullName}</h2>
          {institution.code !== 'ALL' && (
            <button
              onClick={onOpenInfo}
              title="Data collection information"
              className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 text-gray-400 hover:border-gray-600 hover:text-gray-600 text-xs leading-none shrink-0"
            >
              ?
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500">{SECTORS[institution.sector] ?? institution.sector}</p>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{loData.length.toLocaleString()}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Total LOs</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {(institution.moduleCount ?? new Set(loData.map(lo => lo.moduleCode)).size).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Modules</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {institution.d1Mean != null ? institution.d1Mean.toFixed(2) : (loData.length ? (loData.reduce((a, lo) => a + (lo.d1?.score ?? 0), 0) / loData.length).toFixed(2) : '—')}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">D1 Mean</div>
        </div>

        <div className="w-48">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>D1 Tier Distribution</span>
            <span>{p0.toFixed(1)}% Tier 0</span>
          </div>
          <div className="h-2 w-full flex rounded overflow-hidden bg-gray-100">
            <div style={{ width: `${p0}%` }} className="bg-[#dc3545]" title={`Tier 0: ${p0.toFixed(1)}%`} />
            <div style={{ width: `${p1}%` }} className="bg-[#fd7e14]" title={`Tier 1: ${p1.toFixed(1)}%`} />
            <div style={{ width: `${p2}%` }} className="bg-[#28a745]" title={`Tier 2: ${p2.toFixed(1)}%`} />
            <div style={{ width: `${p3}%` }} className="bg-[#007bff]" title={`Tier 3: ${p3.toFixed(1)}%`} />
          </div>
        </div>
      </div>
    </div>
  );
}
