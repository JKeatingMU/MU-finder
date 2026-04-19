import { Institution } from '../App';

type SidebarProps = {
  institutions: Institution[];
  activeInst: string | null;
  setActiveInst: (code: string) => void;
};

const SECTORS: Record<string, string> = {
  PU: 'Public University',
  TU: 'Technological University',
  IT: 'Institute of Technology',
  CE: 'College of Education',
  PS: 'Private/Specialised',
};

export default function Sidebar({ institutions, activeInst, setActiveInst }: SidebarProps) {
  // Group institutions by sector
  const grouped = institutions.reduce((acc, inst) => {
    if (!acc[inst.sector]) acc[inst.sector] = [];
    acc[inst.sector].push(inst);
    return acc;
  }, {} as Record<string, Institution[]>);

  return (
    <div className="w-[240px] bg-[#1e2d40] text-white h-full flex flex-col shrink-0 overflow-hidden border-r border-[#162030]">
      <div className="sidebar-scroll flex-1 overflow-y-auto py-3">
        <div className="px-3 mb-6">
          <button
            onClick={() => {
              if (window.confirm('Warning: Loading all institutions will load ~232,034 records and may be slow. Continue?')) {
                setActiveInst('ALL');
              }
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
              activeInst === 'ALL' ? 'bg-[#4a90d9] text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            All Institutions
          </button>
        </div>

        {Object.entries(grouped).map(([sectorCode, insts]) => (
          <div key={sectorCode} className="mb-6">
            <h2 className="px-4 text-xs font-bold text-gray-200 uppercase tracking-wider mb-2 border-l-2 border-[#4a90d9] ml-2">
              {SECTORS[sectorCode] || sectorCode}
            </h2>
            <ul>
              {insts.map(inst => (
                <li key={inst.code}>
                  <button
                    onClick={() => setActiveInst(inst.code)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      activeInst === inst.code 
                        ? 'bg-[#4a90d9] text-white border-l-4 border-white' 
                        : 'text-gray-300 hover:bg-gray-800 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="font-medium truncate">{inst.fullName}</div>
                    <div className="text-xs opacity-70 flex justify-between mt-1">
                      <span>{inst.loCount.toLocaleString()} LOs</span>
                      <span>D1: {inst.d1Mean.toFixed(2)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  );
}
