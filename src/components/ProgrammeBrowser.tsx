import { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, ChevronDown, ChevronUp, ExternalLink, GraduationCap, AlertCircle, Info } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProgrammeModule {
  moduleCode: string;
  credits?: number;
  semester?: number | null;
  yearLong?: boolean;
  compulsory?: boolean;
  international?: boolean;
}

interface Subject {
  subjectCode: string;
  subjectName: string;
  credits: number;
  compulsory: boolean;
  overview?: string;
  modules: ProgrammeModule[];
}

interface Group {
  label: string;
  subjects: Subject[];
}

interface Pathway {
  id: string;
  name: string;
  notes?: string[];
  groups: Group[];
}

interface YearData {
  notes?: string[];
  groups?: Group[];      // years without pathway tabs
  pathways?: Pathway[];  // years with pathway tabs (e.g. Double Major)
}

interface ProgrammeStream {
  qualCode: string;
  title: string;
  moduleCount: number;
  years: Record<string, YearData>;
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
  moduleMap: Record<string, ModuleInfo>;
  onViewModuleDetails: (code: string) => void;
  moduleAppearances: Record<string, { qualCode: string; caoCode: string; programmeYear: number; compulsory: boolean; programmeTitle?: string }[]> | null;
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

function countGroupModules(groups: Group[]): number {
  return groups.reduce((n, g) => n + g.subjects.reduce((m, s) => m + s.modules.length, 0), 0);
}

function yearModuleCount(yd: YearData): number {
  if (yd.pathways) return yd.pathways.reduce((n, p) => n + countGroupModules(p.groups), 0);
  return countGroupModules(yd.groups ?? []);
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
    <div className="rounded-xl border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs text-slate-500 font-semibold">
            <th className="text-left px-3 py-2 w-24">Code</th>
            <th className="text-left px-3 py-2">Module</th>
            <th className="text-center px-3 py-2 w-14">ECTS</th>
            <th className="text-center px-3 py-2 w-20">Sem</th>
            <th className="text-center px-3 py-2 w-16">Tags</th>
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
                  {mod.compulsory && (
                    <span
                      className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: '#fef3c7', color: '#b45309' }}
                      title="Required module — must be passed without compensation"
                    >
                      Req
                    </span>
                  )}
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
                    {info?.data && <span className="w-2 h-2 rounded-full bg-blue-500" title="Data skills" />}
                    {info?.digital && <span className="w-2 h-2 rounded-full bg-cyan-500" title="Digital skills" />}
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

// ── Text rendering helpers ────────────────────────────────────────────────────

// Render a paragraph that may contain inline " -item" bullet sequences
function TextPara({ text, className }: { text: string; className?: string }) {
  // Detect inline dash-bullets: "intro text: -item1. -item2."
  const dashIdx = text.indexOf(' -');
  if (dashIdx !== -1 && (text.match(/ -/g) ?? []).length >= 2) {
    const intro = text.slice(0, dashIdx).trimEnd();
    const bullets = text.slice(dashIdx)
      .split(/ -/)
      .map(s => s.trim().replace(/\.$/, ''))
      .filter(Boolean);
    return (
      <div className={className}>
        {intro && <p className="mb-1">{intro}</p>}
        <ul className="list-disc pl-5 space-y-0.5">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>
    );
  }
  return <p className={className}>{text}</p>;
}

// ── Overview Panel ───────────────────────────────────────────────────────────

function OverviewPanel({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const paras = text.split('\n\n');
  const preview = paras[0];
  const hasMore = paras.length > 1 || preview.length > 100;
  const previewText = preview.length > 100 ? preview.slice(0, 100).trimEnd() + '…' : preview;

  return (
    <div className="px-4 py-4 bg-white border-b border-slate-100 text-sm text-slate-600" style={{ lineHeight: '1.8' }}>
      {expanded ? (
        paras.map((para, i) => (
          <TextPara key={i} text={para} className={i > 0 ? 'mt-4' : undefined} />
        ))
      ) : (
        <p>{previewText}</p>
      )}
      {hasMore && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-2 text-xs font-semibold"
          style={{ color: '#6b1a2b' }}
        >
          {expanded ? 'Less' : 'More'}
        </button>
      )}
    </div>
  );
}

// ── Subject Block ─────────────────────────────────────────────────────────────

function SubjectBlock({
  subject,
  moduleMap,
  facColour,
  onView,
}: {
  subject: Subject;
  moduleMap: Record<string, ModuleInfo>;
  facColour: string;
  onView: (code: string) => void;
}) {
  const [overviewOpen, setOverviewOpen] = useState(false);

  return (
    <div className="mb-5 rounded-xl border border-slate-200 overflow-hidden">
      {/* Subject header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-slate-800 text-sm">{subject.subjectName}</span>
          {subject.subjectCode && (
            <span className="font-mono text-xs text-slate-400">{subject.subjectCode}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {subject.credits > 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${facColour}18`, color: facColour }}
            >
              {subject.credits} ECTS
            </span>
          )}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={
              subject.compulsory
                ? { background: '#fef3c7', color: '#b45309' }
                : { background: '#f1f5f9', color: '#64748b' }
            }
          >
            {subject.compulsory ? 'Compulsory' : 'Optional'}
          </span>
          {subject.overview && (
            <button
              onClick={() => setOverviewOpen(o => !o)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 bg-white"
              title="Subject overview"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {overviewOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Subject overview */}
      {overviewOpen && subject.overview && (
        <OverviewPanel text={subject.overview} />
      )}

      {/* Module table */}
      <div className="p-3">
        {subject.modules.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">No modules listed.</p>
        ) : (
          <ModuleTable
            mods={subject.modules}
            moduleMap={moduleMap}
            facColour={facColour}
            onView={onView}
          />
        )}
      </div>
    </div>
  );
}

// ── Note Box ─────────────────────────────────────────────────────────────────

function NoteBox({ title, notes }: { title: string; notes: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 3;
  const hasMore = notes.length > LIMIT;
  const visible = expanded ? notes : notes.slice(0, LIMIT);

  return (
    <div className="mb-4 rounded-xl border px-4 py-3 text-sm" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#b45309' }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-amber-800 mb-1">{title}</p>
          <ul className="space-y-1">
            {visible.map((note, i) => (
              <li key={i} className="text-amber-900">
                <TextPara text={note} />
              </li>
            ))}
          </ul>
          {hasMore && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-2 text-xs font-semibold"
              style={{ color: '#b45309' }}
            >
              {expanded ? 'Less' : 'More'}
            </button>
          )}
        </div>
      </div>
    </div>
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

  const stream = programme.streams[streamIdx];
  const years = Object.keys(stream.years).sort((a, b) => Number(a) - Number(b));

  const [activeYear, setActiveYear] = useState(() => years[0] ?? '1');

  useEffect(() => {
    setActiveYear(years[0] ?? '1');
  }, [streamIdx]); // eslint-disable-line

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const [activePathway, setActivePathway] = useState<string>('');

  // Reset pathway when year changes
  useEffect(() => {
    const yd = stream.years[activeYear];
    setActivePathway(yd?.pathways?.[0]?.id ?? '');
  }, [activeYear, streamIdx]); // eslint-disable-line

  const fc = facConfig(programme.faculty);
  const yearData   = stream.years[activeYear];
  const yearNotes  = yearData?.notes ?? [];
  const hasPathways = !!yearData?.pathways?.length;
  const currentPathway = hasPathways
    ? (yearData.pathways!.find(p => p.id === activePathway) ?? yearData.pathways![0])
    : null;
  const groups = hasPathways ? (currentPathway?.groups ?? []) : (yearData?.groups ?? []);

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
              <a
                href={`https://apps.maynoothuniversity.ie/courses/?TARGET=QS&MODE=VIEW&QUALIFICATION_CODE=${stream.qualCode}&YEAR=2026&TARGET_SOURCE=CS`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                MU course finder
              </a>
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
                  onChange={e => setStreamIdx(Number(e.target.value))}
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
            {years.map(yr => {
              const count = yearModuleCount(stream.years[yr]);
              return (
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
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pathway sub-tabs (Double Major / Major with Minor / etc.) */}
        {hasPathways && yearData?.pathways && (
          <div className="px-6 pt-3 pb-0 border-b border-slate-100 bg-slate-50/50">
            <div className="flex gap-1 flex-wrap">
              {yearData.pathways.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePathway(p.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                    (activePathway || yearData.pathways![0].id) === p.id
                      ? 'text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white'
                  }`}
                  style={(activePathway || yearData.pathways![0].id) === p.id
                    ? { borderBottomColor: fc.colour, backgroundColor: fc.colour }
                    : {}}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year / pathway content */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {/* Year-level notes */}
          {yearNotes.length > 0 && (
            <NoteBox title={`Year ${activeYear} notes`} notes={yearNotes} />
          )}

          {/* Pathway-level notes */}
          {hasPathways && currentPathway?.notes && currentPathway.notes.length > 0 && (
            <NoteBox title={currentPathway.name} notes={currentPathway.notes} />
          )}

          {/* Groups → Subjects */}
          {groups.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No modules listed for this year.</p>
          ) : (
            groups.map((group, gi) => (
              <div key={group.label || gi}>
                {group.label && (
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 mt-5 first:mt-0">
                    Timetable group {group.label}
                  </p>
                )}
                {group.subjects.map((subj, si) => (
                  <SubjectBlock
                    key={subj.subjectCode || `${group.label}-${subj.subjectName}-${si}`}
                    subject={subj}
                    moduleMap={moduleMap}
                    facColour={fc.colour}
                    onView={onViewModule}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
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

export default function ProgrammeBrowser({ moduleMap, onViewModuleDetails }: Props) {
  const [progData, setProgData]         = useState<ProgrammeData | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const [selectedProg, setSelectedProg] = useState<Programme | null>(null);
  const [facFilter, setFacFilter]       = useState('');

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

      {selectedProg && (
        <ProgrammeModal
          programme={selectedProg}
          moduleMap={moduleMap}
          onClose={() => setSelectedProg(null)}
          onViewModule={onViewModuleDetails}
        />
      )}
    </>
  );
}
