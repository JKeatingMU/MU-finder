import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { X, BookOpen, ChevronDown, ExternalLink, GraduationCap, AlertCircle } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProgrammeModule {
  moduleCode: string;
  credits?: number;
  semester?: number | null;
  yearLong?: boolean;
  compulsory?: boolean;
  international?: boolean;
}

interface ProgrammeStream {
  qualCode: string;
  title: string;
  moduleCount: number;
  years: Record<string, ProgrammeModule[]>;
}

interface Programme {
  caoCode: string;
  title: string;
  faculty: string;
  points2025: string;
  url: string;
  categories: string[];
  streams: ProgrammeStream[];
}

interface ProgrammeData {
  generated: string;
  totalProgrammes: number;
  programmes: Programme[];
}

interface ModuleAppearance {
  qualCode: string;
  caoCode: string;
  programmeYear: number;
  compulsory: boolean;
  programmeTitle?: string;
}

// Module shape from modules.json (subset we need)
interface ModuleInfo {
  moduleCode: string;
  moduleName: string;
  data?: boolean;
  digital?: boolean;
  credits?: number;
  semester?: number | null;
  yearLong?: boolean;
  international?: boolean;
}

interface Props {
  moduleMap: Record<string, ModuleInfo>;   // from modules.json, keyed by code
  onViewModuleDetails: (code: string) => void;
  moduleAppearances: Record<string, ModuleAppearance[]> | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const FAC_CONFIG: Record<string, { abbr: string; colour: string; bg: string; border: string }> = {
  'Faculty of Arts, Celtic Studies and Philosophy': { abbr: 'FAH', colour: '#7c3aed', bg: '#faf7ff', border: '#ddd6fe' },
  'Faculty of Science and Engineering':             { abbr: 'FSE', colour: '#0369a1', bg: '#f0f7ff', border: '#bfdbfe' },
  'Faculty of Social Sciences':                     { abbr: 'FSS', colour: '#15803d', bg: '#f0fdf6', border: '#bbf7d0' },
};

function facConfig(faculty: string) {
  return FAC_CONFIG[faculty] ?? { abbr: '?', colour: '#6b1a2b', bg: '#fdf2f4', border: '#f5c6ce' };
}

function semLabel(mod: ProgrammeModule): string {
  if (mod.yearLong) return 'Year-Long';
  if (mod.semester === 1) return 'Sem 1';
  if (mod.semester === 2) return 'Sem 2';
  return '—';
}

// ── Section heading ──────────────────────────────────────────────────────────

function SH({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 mt-5 first:mt-0">
      {children}
    </h3>
  );
}

// ── Programme Modal ──────────────────────────────────────────────────────────

function ProgrammeModal({
  programme,
  moduleMap,
  onClose,
  onViewModule,
}: {
  programme: Programme;
  moduleMap: Record<string, ModuleInfo>;
  onClose: () => void;
  onViewModule: (code: string) => void;
}) {
  const [streamIdx, setStreamIdx] = useState(0);
  const [activeYear, setActiveYear] = useState('1');

  const stream = programme.streams[streamIdx];
  const years = Object.keys(stream.years).sort((a, b) => Number(a) - Number(b));

  // Reset year tab when stream changes
  function changeStream(idx: number) {
    setStreamIdx(idx);
    setActiveYear(Object.keys(programme.streams[idx].years).sort((a, b) => Number(a) - Number(b))[0] ?? '1');
  }

  useEffect(() => {
    setActiveYear(years[0] ?? '1');
  }, [streamIdx]); // eslint-disable-line

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const fc = facConfig(programme.faculty);
  const yearModules = stream.years[activeYear] ?? [];
  const compulsory  = yearModules.filter(m => m.compulsory);
  const optional    = yearModules.filter(m => !m.compulsory);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="rounded-t-2xl px-6 py-5" style={{ background: fc.bg, borderBottom: `2px solid ${fc.border}` }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: fc.colour, color: 'white' }}
                >
                  {programme.caoCode}
                </span>
                <span className="text-xs font-semibold" style={{ color: fc.colour }}>{fc.abbr}</span>
                {programme.points2025 && (
                  <span className="text-xs text-slate-400 ml-1">{programme.points2025} pts</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{programme.title}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{programme.faculty}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {programme.url && (
                <a
                  href={programme.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  MU page
                </a>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/70 text-slate-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stream selector */}
          {programme.streams.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Stream:</span>
              <div className="relative">
                <select
                  value={streamIdx}
                  onChange={e => changeStream(Number(e.target.value))}
                  className="text-sm rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 appearance-none font-medium text-slate-700 focus:outline-none focus:ring-2"
                  style={{ minWidth: '260px' }}
                >
                  {programme.streams.map((s, i) => (
                    <option key={s.qualCode} value={i}>
                      {s.title || s.qualCode} ({s.moduleCount} modules)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Year tabs */}
        <div className="px-6 pt-4 pb-0 border-b border-slate-100">
          <div className="flex gap-1 flex-wrap">
            {years.map(yr => (
              <button
                key={yr}
                onClick={() => setActiveYear(yr)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                  activeYear === yr
                    ? 'border-b-2 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                style={activeYear === yr ? { borderBottomColor: fc.colour, backgroundColor: fc.colour } : {}}
              >
                Year {yr}
                <span className={`ml-1.5 text-xs ${activeYear === yr ? 'text-white/70' : 'text-slate-400'}`}>
                  ({(stream.years[yr] ?? []).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Module table */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {yearModules.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No modules listed for this year.</p>
          ) : (
            <>
              {compulsory.length > 0 && (
                <>
                  <SH>Compulsory ({compulsory.length})</SH>
                  <ModuleTable mods={compulsory} moduleMap={moduleMap} facColour={fc.colour} onView={onViewModule} />
                </>
              )}
              {optional.length > 0 && (
                <>
                  <SH>Optional ({optional.length})</SH>
                  <ModuleTable mods={optional} moduleMap={moduleMap} facColour={fc.colour} onView={onViewModule} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Module Table ─────────────────────────────────────────────────────────────

function ModuleTable({
  mods,
  moduleMap,
  facColour,
  onView,
}: {
  mods: ProgrammeModule[];
  moduleMap: Record<string, ModuleInfo>;
  facColour: string;
  onView: (code: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden mb-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs text-slate-500 font-semibold">
            <th className="text-left px-3 py-2 w-24">Code</th>
            <th className="text-left px-3 py-2">Module</th>
            <th className="text-center px-3 py-2 w-14">ECTS</th>
            <th className="text-center px-3 py-2 w-20">Sem</th>
            <th className="text-center px-3 py-2 w-16">Skills</th>
            <th className="px-3 py-2 w-20"></th>
          </tr>
        </thead>
        <tbody>
          {mods.map((mod, i) => {
            const info = moduleMap[mod.moduleCode];
            return (
              <tr key={mod.moduleCode} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-3 py-2">
                  <span
                    className="font-mono text-xs font-bold cursor-pointer hover:underline"
                    style={{ color: facColour }}
                    onClick={() => onView(mod.moduleCode)}
                  >
                    {mod.moduleCode}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className="text-slate-700 cursor-pointer hover:text-slate-900 hover:underline"
                    onClick={() => onView(mod.moduleCode)}
                  >
                    {info?.moduleName ?? mod.moduleCode}
                  </span>
                  {mod.international && (
                    <span
                      className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: '#e0f2fe', color: '#0369a1' }}
                      title="Available to international students"
                    >
                      Intl
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-center text-slate-500">
                  {mod.credits ?? info?.credits ?? '—'}
                </td>
                <td className="px-3 py-2 text-center text-slate-500 text-xs">
                  {semLabel(mod)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="flex items-center justify-center gap-1">
                    {info?.data && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" title="Data skills" />
                    )}
                    {info?.digital && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500" title="Digital skills" />
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  {info ? (
                    <button
                      onClick={() => onView(mod.moduleCode)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Details
                    </button>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Programme Card ───────────────────────────────────────────────────────────

function ProgrammeCard({ prog, onClick }: { prog: Programme; onClick: () => void }) {
  const fc = facConfig(prog.faculty);
  const totalModules = prog.streams.reduce((n, s) => n + s.moduleCount, 0);
  const streamCount  = prog.streams.length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border p-4 hover:shadow-md transition-all hover:-translate-y-0.5"
      style={{ background: fc.bg, borderColor: fc.border }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
          style={{ background: fc.colour, color: 'white' }}
        >
          {prog.caoCode}
        </span>
        <span className="text-xs font-semibold" style={{ color: fc.colour }}>{fc.abbr}</span>
      </div>
      <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1">{prog.title}</h3>
      <p className="text-xs text-slate-500">
        {streamCount > 1 ? `${streamCount} streams · ` : ''}
        {totalModules.toLocaleString()} modules
        {prog.points2025 && ` · ${prog.points2025} pts`}
      </p>
    </button>
  );
}

// ── Main ProgrammeBrowser ─────────────────────────────────────────────────────

export default function ProgrammeBrowser({ moduleMap, onViewModuleDetails, moduleAppearances }: Props) {
  const [progData, setProgData]           = useState<ProgrammeData | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);
  const [selectedProg, setSelectedProg]   = useState<Programme | null>(null);
  const [facFilter, setFacFilter]         = useState('');

  // Load programme-data.json on mount
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/programme-data.json`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(d => { setProgData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const faculties = useMemo(() => {
    if (!progData) return [];
    return [...new Set(progData.programmes.map(p => p.faculty))].sort();
  }, [progData]);

  const visible = useMemo(() => {
    if (!progData) return [];
    return facFilter
      ? progData.programmes.filter(p => p.faculty === facFilter)
      : progData.programmes;
  }, [progData, facFilter]);

  // Handler: open module details from within a programme modal
  function handleViewModule(code: string) {
    onViewModuleDetails(code);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-slate-400 text-sm">Loading programme data…</p>
      </div>
    );
  }

  if (error || !progData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Programme data not available</h2>
        <p className="text-sm text-slate-500">Run <code className="bg-slate-100 px-1 rounded">node scripts/build-programme-data.js</code> and commit the output.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5" style={{ color: '#6b1a2b' }} />
            <h2 className="text-2xl font-bold text-slate-900">Programme Browser</h2>
          </div>
          <p className="text-slate-500 text-sm">
            {progData.totalProgrammes} undergraduate programmes · {progData.programmes.reduce((n, p) => n + p.streams.length, 0)} degree streams · Academic Year 2026
          </p>
        </div>

        {/* Faculty filter */}
        <select
          value={facFilter}
          onChange={e => setFacFilter(e.target.value)}
          className="text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 text-slate-700"
        >
          <option value="">All Faculties</option>
          {faculties.map(f => {
            const fc = facConfig(f);
            return <option key={f} value={f}>{fc.abbr} — {f}</option>;
          })}
        </select>
      </div>

      {/* Programme grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(prog => (
          <ProgrammeCard
            key={prog.caoCode}
            prog={prog}
            onClick={() => setSelectedProg(prog)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">No programmes found.</div>
      )}

      {/* Programme modal */}
      {selectedProg && (
        <ProgrammeModal
          programme={selectedProg}
          moduleMap={moduleMap}
          onClose={() => setSelectedProg(null)}
          onViewModule={handleViewModule}
        />
      )}
    </>
  );
}
