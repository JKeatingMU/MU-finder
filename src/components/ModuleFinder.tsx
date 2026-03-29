import { useState, useEffect, useMemo, useCallback, type ReactNode, type CSSProperties } from 'react';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ChevronDown, ChevronUp, Database, Layers, AlertCircle, Heart, ExternalLink, Maximize2 } from 'lucide-react';
import { CS_BY_ID } from '../data/criticalSkills';

interface TLBreakdown {
  lectures?: number;
  labsPracticals?: number;
  tutorials?: number;
  plannedLearning?: number;
  independentStudy?: number;
  total?: number;
}

interface AssessmentComponent {
  type: string;
  options?: string;
  weighting: number;
  duration?: string;
}

interface Assessment {
  graded?: boolean;
  components?: AssessmentComponent[];
  passStandard?: string;
  capped?: boolean;
}

interface Supplementals {
  permitted?: boolean;
  details?: string[];
}

interface Module {
  moduleCode: string;
  moduleName: string;
  departmentName: string;
  facultyName: string;
  moduleContent: string;
  learningOutcomes: unknown;
  data: boolean;
  digital: boolean;
  dataDescription: boolean;
  digitalDescription: boolean;
  dataLearningOutcomes: boolean;
  digitalLearningOutcomes: boolean;
  UG_PG: string;
  yearOfStudy: string;
  notes: string;
  criticalSkills?: string[];
  hidden?: boolean;
  credits?: number;
  semester?: number | null;
  yearLong?: boolean;
  international?: boolean;
  teachingAndLearning?: TLBreakdown;
  assessment?: Assessment;
  supplementals?: Supplementals;
  timetableUrl?: string;
}

interface IndexedModule extends Module {
  _loText: string;
}

interface ExportData {
  generated: string | null;
  totalModules: number;
  faculties: string[];
  index: Array<{ department: string; faculty: string; total: number; data: number; digital: number }>;
  modules: Module[];
}

const FONT_SIZES = [
  { label: 'A', size: '13px', title: 'Small text' },
  { label: 'A', size: '15px', title: 'Normal text' },
  { label: 'A', size: '18px', title: 'Large text' },
];

const SNIPPET_LEN = 160;

function normalizeLOs(los: unknown): string {
  if (!los) return '';
  if (typeof los === 'string') return los;
  if (Array.isArray(los)) return (los as string[]).filter(Boolean).join(' ');
  if (typeof los === 'object') return Object.values(los as Record<string, string>).filter(Boolean).join(' ');
  return String(los);
}

function formatLOs(los: unknown): string[] {
  if (!los) return [];
  if (Array.isArray(los)) return (los as string[]).filter((s: string) => s && s.trim());
  if (typeof los === 'string' && los.trim()) return [los];
  if (typeof los === 'object') return Object.values(los as Record<string, string>).filter(s => s && s.trim());
  return [];
}

function shortFaculty(name: string): string {
  if (!name) return '';
  const n = name.toLowerCase();
  if (n.includes('social'))  return 'Social Sciences';
  if (n.includes('science')) return 'Science & Eng.';
  if (n.includes('arts'))    return 'Arts & Humanities';
  return name;
}

function facultyColor(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('social'))  return '#15803d';
  if (n.includes('science')) return '#0369a1';
  if (n.includes('arts'))    return '#7c3aed';
  return '#6b1a2b';
}

function facultyAbbr(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('social'))   return 'FSS';
  if (n.includes('science'))  return 'FSE';
  if (n.includes('arts'))     return 'FAH';
  if (n.includes('cross'))    return 'CIF';
  if (n.includes('vp') || n.includes('students')) return 'VPSL';
  return '';
}

function facultyCardBg(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('social'))  return '#f0fdf6';
  if (n.includes('science')) return '#f0f7ff';
  if (n.includes('arts'))    return '#faf7ff';
  return '#fafafa';
}

const PAGE_SIZE = 48;

const primaryTags = [
  {
    key: 'data' as const,
    label: 'Data',
    color: '#0369a1',
    bg: '#dbeafe',
    tooltip: 'This module has been tagged as containing Data skills content',
  },
  {
    key: 'digital' as const,
    label: 'Digital',
    color: '#0e7490',
    bg: '#cffafe',
    tooltip: 'This module has been tagged as containing Digital skills content',
  },
];

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
      {children}
    </p>
  );
}

function ModuleDetailModal({ mod, onClose, isSaved, onToggleSave }: {
  mod: IndexedModule;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (code: string) => void;
}) {
  const los = formatLOs(mod.learningOutcomes);
  const fc = facultyColor(mod.facultyName);
  const activePrimaryTags = primaryTags.filter(t => mod[t.key]);
  const tl = mod.teachingAndLearning;
  const ass = mod.assessment;
  const sup = mod.supplementals;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const tlRows = tl ? [
    { label: 'Lectures', value: tl.lectures },
    { label: 'Labs / Practicals', value: tl.labsPracticals },
    { label: 'Tutorials', value: tl.tutorials },
    { label: 'Planned Learning', value: tl.plannedLearning },
    { label: 'Independent Study', value: tl.independentStudy },
  ].filter(r => r.value != null && r.value > 0) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200" style={{ background: facultyCardBg(mod.facultyName) }}>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg"
                style={{ background: fc + '18', color: fc }}
              >
                {mod.moduleCode}
              </span>
              {facultyAbbr(mod.facultyName) && (
                <span
                  className="font-bold text-sm px-2.5 py-1 rounded-lg"
                  style={{ background: fc + '12', color: fc }}
                  title={mod.facultyName}
                >
                  {facultyAbbr(mod.facultyName)}
                </span>
              )}
              {mod.credits != null && mod.credits > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium cursor-default"
                  title="European Credit Transfer and Accumulation System (ECTS) — a standard measure of student workload across European higher education"
                >
                  {mod.credits} ECTS
                </span>
              )}
              {mod.yearLong ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">Year-Long</span>
              ) : mod.semester != null && mod.semester > 0 ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">Sem {mod.semester}</span>
              ) : null}
              {mod.UG_PG && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 font-medium">
                  {mod.UG_PG}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{mod.moduleName}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {mod.departmentName}
              {mod.facultyName && (
                <> · <span style={{ color: fc }}>{shortFaculty(mod.facultyName)}</span></>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggleSave(mod.moduleCode)}
              title={isSaved ? 'Remove from saved' : 'Save this module'}
              className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"
            >
              <Heart
                className="w-5 h-5 transition-colors"
                style={{ color: isSaved ? '#6b1a2b' : '#cbd5e1' }}
                fill={isSaved ? '#6b1a2b' : 'none'}
              />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Tag badges */}
          {(activePrimaryTags.length > 0 || mod.international || (mod.criticalSkills && mod.criticalSkills.length > 0)) && (
            <div className="flex flex-wrap gap-2">
              {activePrimaryTags.map(t => (
                <span
                  key={t.key}
                  title={t.tooltip}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: t.bg, color: t.color }}
                >
                  {t.label}
                </span>
              ))}
              {mod.international && (
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full cursor-default"
                  style={{ background: '#e0f2fe', color: '#0369a1' }}
                  title="An international module is a module available to short term, visiting international students registered with Maynooth University for either one semester or one academic year but who are not taking the full degree programme of study with Maynooth University."
                >
                  International
                </span>
              )}
              {mod.criticalSkills && mod.criticalSkills.length > 0 && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                  Critical Skills
                </span>
              )}
              {ass?.capped && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#fef9c3', color: '#854d0e' }}>
                  Capped
                </span>
              )}
            </div>
          )}

          {/* Module content */}
          {mod.moduleContent && (
            <div>
              <SectionHeading>Module Content</SectionHeading>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{mod.moduleContent}</p>
            </div>
          )}

          {/* Learning outcomes */}
          {los.length > 0 && (
            <div>
              <SectionHeading>Learning Outcomes</SectionHeading>
              <ul className="space-y-2">
                {los.map((lo, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="font-mono font-semibold text-slate-400 flex-shrink-0 text-xs mt-0.5">LO{i + 1}</span>
                    <span className="leading-relaxed">{lo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical skills */}
          {mod.criticalSkills && mod.criticalSkills.length > 0 && (
            <div>
              <SectionHeading>Critical Skills</SectionHeading>
              <ul className="space-y-2">
                {mod.criticalSkills.map(id => {
                  const skill = CS_BY_ID[id];
                  return skill ? (
                    <li key={id} className="text-sm text-slate-700 flex gap-2">
                      <span className="font-mono font-semibold flex-shrink-0 text-xs mt-0.5" style={{ color: '#7e22ce' }}>{skill.code}</span>
                      <span className="leading-relaxed">
                        <span className="font-medium">{skill.short}</span>
                        <span className="text-slate-500"> — {skill.text}</span>
                      </span>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}

          {/* T&L breakdown */}
          {tlRows.length > 0 && (
            <div>
              <SectionHeading>Teaching &amp; Learning</SectionHeading>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {tlRows.map(r => (
                    <tr key={r.label} className="border-b border-slate-100 last:border-0">
                      <td className="py-1.5 text-slate-500 w-48">{r.label}</td>
                      <td className="py-1.5 text-slate-700 font-medium">{r.value} hrs</td>
                    </tr>
                  ))}
                  {tl?.total != null && tl.total > 0 && (
                    <tr className="border-t-2 border-slate-200">
                      <td className="py-1.5 text-slate-700 font-semibold">Total</td>
                      <td className="py-1.5 text-slate-700 font-semibold">{tl.total} hrs</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Assessment */}
          {ass && ass.components && ass.components.length > 0 && (
            <div>
              <SectionHeading>Assessment</SectionHeading>
              {ass.graded != null && (
                <p className="text-xs text-slate-500 mb-2">
                  {ass.graded ? 'Graded module' : 'Ungraded module'}
                  {ass.passStandard && ` · Pass standard: ${ass.passStandard}`}
                  {ass.capped && ' · Capped assessment'}
                </p>
              )}
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-1.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                    <th className="py-1.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Details</th>
                    <th className="py-1.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {ass.components.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-1.5 text-slate-700 font-medium pr-4">{c.type}</td>
                      <td className="py-1.5 text-slate-500 text-xs">
                        {[c.options, c.duration].filter(Boolean).join(' · ')}
                      </td>
                      <td className="py-1.5 text-slate-700 font-medium text-right">{c.weighting}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Supplementals */}
          {sup && sup.permitted != null && (
            <div>
              <SectionHeading>Supplemental Examinations</SectionHeading>
              <p className="text-sm text-slate-700">
                {sup.permitted ? 'Permitted' : 'Not permitted'}
              </p>
              {sup.permitted && sup.details && sup.details.length > 0 && (
                <ul className="mt-1.5 space-y-1">
                  {sup.details.map((d, i) => (
                    <li key={i} className="text-sm text-slate-500">· {d}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Timetable */}
          {mod.timetableUrl && (
            <div>
              <SectionHeading>Timetable</SectionHeading>
              <a
                href={mod.timetableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                style={{ color: '#6b1a2b' }}
              >
                View timetable <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ mod, isSaved, onToggleSave, onViewDetails }: {
  mod: IndexedModule;
  isSaved: boolean;
  onToggleSave: (code: string) => void;
  onViewDetails: (mod: IndexedModule) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const los = formatLOs(mod.learningOutcomes);
  const fc = facultyColor(mod.facultyName);
  const cardBg = facultyCardBg(mod.facultyName);

  const snippet = mod.moduleContent
    ? mod.moduleContent.length > SNIPPET_LEN
      ? mod.moduleContent.slice(0, SNIPPET_LEN).trimEnd() + '…'
      : mod.moduleContent
    : null;

  const activePrimaryTags = primaryTags.filter(t => mod[t.key]);

  return (
    <div
      className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
      style={{ background: cardBg }}
    >
      <div className="p-5 flex flex-col gap-2.5 flex-grow">

        {/* Module code — prominent */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-bold font-mono tracking-wide px-2.5 py-1 rounded-lg"
              style={{ background: fc + '18', color: fc }}
            >
              {mod.moduleCode}
            </span>
            {facultyAbbr(mod.facultyName) && (
              <span
                className="text-sm font-bold tracking-wide px-2.5 py-1 rounded-lg"
                style={{ background: fc + '12', color: fc }}
                title={mod.facultyName}
              >
                {facultyAbbr(mod.facultyName)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {mod.UG_PG && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 font-medium">
                {mod.UG_PG}
              </span>
            )}
            <button
              onClick={() => onToggleSave(mod.moduleCode)}
              title={isSaved ? 'Remove from saved' : 'Save this module'}
              className="p-1 rounded-lg transition-colors hover:bg-white/60"
            >
              <Heart
                className="w-4 h-4 transition-colors"
                style={{ color: isSaved ? '#6b1a2b' : '#cbd5e1' }}
                fill={isSaved ? '#6b1a2b' : 'none'}
              />
            </button>
          </div>
        </div>

        {/* Module name */}
        <h3 className="text-base font-semibold text-slate-900 leading-snug">
          {mod.moduleName}
        </h3>

        {/* Dept / Faculty */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: fc }} />
          <span>{mod.departmentName}</span>
          <span className="text-slate-300">·</span>
          <span style={{ color: fc }}>{shortFaculty(mod.facultyName)}</span>
        </div>

        {/* Intro snippet — hidden when expanded to avoid duplication */}
        {snippet && !expanded && (
          <p className="text-sm text-slate-600 leading-relaxed">
            {snippet}
          </p>
        )}

        {/* Primary tags + Skills pill */}
        {(activePrimaryTags.length > 0 || (mod.criticalSkills && mod.criticalSkills.length > 0)) && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {activePrimaryTags.map(t => (
              <span
                key={t.key}
                title={t.tooltip}
                className="text-xs font-semibold px-2.5 py-1 rounded-full cursor-default"
                style={{ background: t.bg, color: t.color }}
              >
                {t.label}
              </span>
            ))}
            {mod.criticalSkills && mod.criticalSkills.length > 0 && (
              <span
                title="This module has Critical Skills mapped to it — expand for details"
                className="text-xs font-semibold px-2.5 py-1 rounded-full cursor-default"
                style={{ background: '#f3e8ff', color: '#7e22ce' }}
              >
                Skills
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card footer: expand toggle + full details button */}
      <div className="flex border-t border-slate-200 rounded-b-2xl overflow-hidden">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors hover:bg-white/60"
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Hide</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Content &amp; LOs</>
          )}
        </button>
        <div className="w-px bg-slate-200" />
        <button
          onClick={() => onViewDetails(mod)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors hover:bg-white/60"
          title="View full module details"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Full details
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 border-t border-slate-200 space-y-4">
              {mod.moduleContent && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Module Content
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {mod.moduleContent}
                  </p>
                </div>
              )}
              {los.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Learning Outcomes
                  </p>
                  <ul className="space-y-1.5">
                    {los.map((lo, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2">
                        <span className="font-mono font-semibold text-slate-400 flex-shrink-0 mt-0.5 text-xs">LO{i + 1}</span>
                        <span className="leading-relaxed">{lo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {mod.criticalSkills && mod.criticalSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Critical Skills
                  </p>
                  <ul className="space-y-1.5">
                    {mod.criticalSkills.map(id => {
                      const skill = CS_BY_ID[id];
                      return skill ? (
                        <li key={id} className="text-sm text-slate-700 flex gap-2">
                          <span className="font-mono font-semibold flex-shrink-0 mt-0.5 text-xs" style={{ color: '#7e22ce' }}>{skill.code}</span>
                          <span className="leading-relaxed">
                            <span className="font-medium">{skill.short}</span>
                            <span className="text-slate-500"> — {skill.text}</span>
                          </span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ModuleFinder() {
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [query, setQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [tagFilter, setTagFilter] = useState<'data' | 'digital' | ''>('');
  const [ugpgFilter, setUgpgFilter] = useState('Undergraduate');
  const [favsOnly, setFavsOnly] = useState(false);
  const [savedCodes, setSavedCodes] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('mu-module-favs') || '[]')); }
    catch { return new Set(); }
  });

  const [modalModule, setModalModule] = useState<IndexedModule | null>(null);

  const toggleSave = useCallback((code: string) => {
    setSavedCodes(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      localStorage.setItem('mu-module-favs', JSON.stringify([...next]));
      return next;
    });
  }, []);
  const [showCount, setShowCount] = useState(PAGE_SIZE);

  const [fontSize, setFontSize] = useState<string>(
    () => localStorage.getItem('mu-dir-font') || '15px'
  );

  const applyFont = (size: string) => {
    setFontSize(size);
    localStorage.setItem('mu-dir-font', size);
    document.documentElement.style.fontSize = size;
  };

  useMemo(() => { document.documentElement.style.fontSize = fontSize; }, []);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/modules.json`;
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json() as Promise<ExportData>;
      })
      .then(data => {
        setExportData(data);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, []);

  const indexedModules = useMemo<IndexedModule[]>(() => {
    if (!exportData?.modules) return [];
    return exportData.modules.map(m => ({
      ...m,
      _loText: normalizeLOs(m.learningOutcomes),
    }));
  }, [exportData]);

  // Unique UG/PG values from data
  const ugpgOptions = useMemo(() => {
    if (!indexedModules.length) return [];
    return [...new Set(indexedModules.map(m => m.UG_PG).filter(Boolean))].sort();
  }, [indexedModules]);

  const fuse = useMemo(() => {
    if (!indexedModules.length) return null;
    return new Fuse(indexedModules, {
      keys: [
        { name: 'moduleCode', weight: 3 },
        { name: 'moduleName', weight: 2 },
        { name: 'departmentName', weight: 1 },
        { name: 'moduleContent', weight: 0.5 },
        { name: '_loText', weight: 0.3 },
      ],
      threshold: 0.3,
      minMatchCharLength: 2,
      includeScore: true,
    });
  }, [indexedModules]);

  const departments = useMemo(() => {
    if (!indexedModules.length) return [];
    const filtered = facultyFilter
      ? indexedModules.filter(m => m.facultyName === facultyFilter)
      : indexedModules;
    return [...new Set(filtered.map(m => m.departmentName).filter(Boolean))].sort();
  }, [indexedModules, facultyFilter]);

  const handleFacultyChange = useCallback((f: string) => {
    setFacultyFilter(f);
    setDeptFilter('');
    setShowCount(PAGE_SIZE);
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setFacultyFilter('');
    setDeptFilter('');
    setTagFilter('');
    setUgpgFilter('');
    setFavsOnly(false);
    setShowCount(PAGE_SIZE);
  }, []);

  const filtersActive = query || facultyFilter || deptFilter || tagFilter || ugpgFilter || favsOnly;

  const results = useMemo<IndexedModule[]>(() => {
    let pool: IndexedModule[] = indexedModules;
    const searching = query.trim().length >= 2;

    // Hidden modules only appear when searching by code
    if (!searching) pool = pool.filter(m => !m.hidden);

    if (favsOnly) pool = pool.filter(m => savedCodes.has(m.moduleCode));
    if (facultyFilter) pool = pool.filter(m => m.facultyName === facultyFilter);
    if (deptFilter) pool = pool.filter(m => m.departmentName === deptFilter);
    if (tagFilter === 'data') pool = pool.filter(m => m.data);
    if (tagFilter === 'digital') pool = pool.filter(m => m.digital);
    if (ugpgFilter) pool = pool.filter(m => m.UG_PG === ugpgFilter);

    if (searching) {
      const searchPool = new Fuse(pool, {
        keys: [
          { name: 'moduleCode', weight: 3 },
          { name: 'moduleName', weight: 2 },
          { name: 'departmentName', weight: 1 },
          { name: 'moduleContent', weight: 0.5 },
          { name: '_loText', weight: 0.3 },
        ],
        threshold: 0.3,
        minMatchCharLength: 2,
      });
      return searchPool.search(query.trim()).map(r => r.item);
    } else {
      return [...pool].sort((a, b) => {
        const dc = a.departmentName.localeCompare(b.departmentName);
        return dc !== 0 ? dc : a.moduleCode.localeCompare(b.moduleCode);
      });
    }
  }, [indexedModules, fuse, query, facultyFilter, deptFilter, tagFilter, ugpgFilter, favsOnly, savedCodes]);

  // Summary stats for saved modules
  const savedModules = useMemo(
    () => indexedModules.filter(m => savedCodes.has(m.moduleCode)),
    [indexedModules, savedCodes]
  );
  const savedSummary = useMemo(() => {
    if (!savedModules.length) return null;
    const dataCount    = savedModules.filter(m => m.data).length;
    const digitalCount = savedModules.filter(m => m.digital).length;
    const faculties    = [...new Set(savedModules.map(m => facultyAbbr(m.facultyName)).filter(Boolean))];
    const depts        = [...new Set(savedModules.map(m => m.departmentName).filter(Boolean))].sort();
    return { dataCount, digitalCount, faculties, depts };
  }, [savedModules]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 text-sm">Loading module catalogue…</div>
      </div>
    );
  }

  if (fetchError || !exportData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Module data not available</h2>
        <p className="text-sm text-slate-500">
          The module catalogue has not been published yet. An administrator needs to use{' '}
          <strong>Export for Public Finder</strong> in the module management app, then commit the
          resulting file to <code className="bg-slate-100 px-1 rounded">public/data/modules.json</code>.
        </p>
      </div>
    );
  }

  if (exportData.totalModules === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Database className="w-10 h-10 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Module catalogue is empty</h2>
        <p className="text-sm text-slate-500">
          No modules have been exported yet. Use <strong>Export for Public Finder</strong> in the
          module management app and commit the file to{' '}
          <code className="bg-slate-100 px-1 rounded">public/data/modules.json</code>.
        </p>
      </div>
    );
  }

  const visible = results.slice(0, showCount);
  const hasMore = results.length > showCount;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page heading */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5" style={{ color: '#6b1a2b' }} />
            <h2 className="text-2xl font-bold text-slate-900">Module Catalogue</h2>
          </div>
          <p className="text-slate-500 text-sm">
            {(exportData.totalModules ?? exportData.modules?.length ?? 0).toLocaleString()} modules across 3 faculties
            {exportData.generated && (
              <> · Updated {new Date(exportData.generated).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}</>
            )}
          </p>
        </div>

        {/* Saved toggle */}
        <div className="flex items-center gap-2 self-start">
          {(savedCodes.size > 0 || favsOnly) && (
            <button
              onClick={() => { setFavsOnly(f => !f); setShowCount(PAGE_SIZE); }}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-all"
              style={
                favsOnly
                  ? { background: '#6b1a2b', color: '#fff', borderColor: 'transparent' }
                  : { background: 'white', color: '#6b1a2b', borderColor: '#e2e8f0' }
              }
            >
              <Heart className="w-4 h-4" fill={favsOnly ? '#fff' : '#6b1a2b'} />
              Saved ({savedCodes.size})
            </button>
          )}

          {/* Font size widget */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 bg-white self-start">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Text size</span>
          {FONT_SIZES.map((fs, i) => (
            <button
              key={fs.size}
              onClick={() => applyFont(fs.size)}
              title={fs.title}
              className="rounded px-2 py-0.5 font-bold transition-colors"
              style={{
                fontSize: `${11 + i * 3}px`,
                background: fontSize === fs.size ? '#6b1a2b' : 'transparent',
                color: fontSize === fs.size ? '#fff' : '#6b7280',
              }}
            >
              {fs.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Saved summary panel */}
      <AnimatePresence initial={false}>
        {favsOnly && savedSummary && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border p-4 mb-4 text-sm"
            style={{ background: '#fdf2f4', borderColor: '#f5c6ce' }}
          >
            <p className="font-semibold text-slate-800 mb-2">
              {savedCodes.size} saved module{savedCodes.size !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-4 text-slate-600">
              <span>
                <span className="font-medium" style={{ color: '#0369a1' }}>Data tagged:</span>{' '}
                {savedSummary.dataCount}
              </span>
              <span>
                <span className="font-medium" style={{ color: '#0e7490' }}>Digital tagged:</span>{' '}
                {savedSummary.digitalCount}
              </span>
              {savedSummary.faculties.length > 0 && (
                <span>
                  <span className="font-medium text-slate-700">Faculties:</span>{' '}
                  {savedSummary.faculties.join(', ')}
                </span>
              )}
            </div>
            {savedSummary.depts.length > 0 && (
              <p className="mt-2 text-slate-500">
                <span className="font-medium text-slate-600">Departments:</span>{' '}
                {savedSummary.depts.join(' · ')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowCount(PAGE_SIZE); }}
            placeholder="Search by code, name, content or learning outcomes…"
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:border-transparent bg-slate-50"
            style={{ '--tw-ring-color': '#6b1a2b' } as CSSProperties}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setShowCount(PAGE_SIZE); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Faculty */}
          <select
            value={facultyFilter}
            onChange={e => handleFacultyChange(e.target.value)}
            className="text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 text-slate-700"
          >
            <option value="">All Faculties</option>
            {exportData.faculties.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Department */}
          <select
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setShowCount(PAGE_SIZE); }}
            className="text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 text-slate-700"
            disabled={departments.length === 0}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* UG / PG */}
          {ugpgOptions.length > 1 && (
            <select
              value={ugpgFilter}
              onChange={e => { setUgpgFilter(e.target.value); setShowCount(PAGE_SIZE); }}
              className="text-sm rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 text-slate-700"
            >
              <option value="">All Modules</option>
              {ugpgOptions.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          )}

          {/* Tag toggles */}
          <div className="flex gap-1.5">
            {primaryTags.map(t => (
              <button
                key={t.key}
                onClick={() => { setTagFilter(prev => prev === t.key ? '' : t.key); setShowCount(PAGE_SIZE); }}
                title={t.tooltip}
                className="text-xs font-semibold px-3 py-2 rounded-lg border transition-all"
                style={
                  tagFilter === t.key
                    ? { background: t.color, color: '#fff', borderColor: 'transparent' }
                    : { background: 'white', color: '#475569', borderColor: '#e2e8f0' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {filtersActive && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center gap-1 ml-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-sm text-slate-500">
          {results.length === 0
            ? 'No modules found'
            : results.length === exportData.totalModules
            ? `All ${results.length.toLocaleString()} modules`
            : `${results.length.toLocaleString()} of ${(exportData.totalModules ?? exportData.modules?.length ?? 0).toLocaleString()} modules`}
        </p>
        {results.length > showCount && (
          <p className="text-xs text-slate-400">Showing {showCount.toLocaleString()}</p>
        )}
      </div>

      {/* Empty state */}
      {results.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No modules match your search.</p>
          <button onClick={clearAll} className="mt-3 text-sm underline text-slate-400 hover:text-slate-600">
            Clear filters
          </button>
        </div>
      )}

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(mod => (
          <ModuleCard
            key={mod.moduleCode}
            mod={mod}
            isSaved={savedCodes.has(mod.moduleCode)}
            onToggleSave={toggleSave}
            onViewDetails={setModalModule}
          />
        ))}
      </div>

      {/* Show more */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowCount(c => c + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            Show {Math.min(PAGE_SIZE, results.length - showCount)} more
            <span className="text-slate-400 ml-1.5">({(results.length - showCount).toLocaleString()} remaining)</span>
          </button>
        </div>
      )}

      {/* Detail modal */}
      {modalModule && (
        <ModuleDetailModal
          mod={modalModule}
          onClose={() => setModalModule(null)}
          isSaved={savedCodes.has(modalModule.moduleCode)}
          onToggleSave={toggleSave}
        />
      )}
    </div>
  );
}
