import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, ExternalLink, X, Heart, GitCompareArrows } from 'lucide-react';
import { courses } from '../data/courses';
import { Course, Faculty, StrengthCategory } from '../types';
import CompareModal from './CompareModal';

const FACULTY_COLORS: Record<Faculty, string> = {
  arts:    '#7c3aed',
  science: '#0369a1',
  social:  '#15803d',
};

const FACULTY_SHORT: Record<Faculty, string> = {
  arts:    'Arts and Humanities',
  science: 'Science & Engineering',
  social:  'Social Sciences',
};

const FACULTY_BG: Record<Faculty, string> = {
  arts:    '#f3f0fd',
  science: '#e8f4fb',
  social:  '#e8f5ee',
};

const CAT_COLORS: Record<StrengthCategory, string> = {
  Creative:     '#ea580c',
  Humanities:   '#92400e',
  Language:     '#b45309',
  Scientific:   '#059669',
  Quantitative: '#2563eb',
  Computing:    '#7c3aed',
  Social:       '#be123c',
  Business:     '#334155',
};

type SortKey = 'code' | 'title' | 'points-desc' | 'points-asc';

function parsePts(pts: string | undefined): number {
  if (!pts) return -1;
  const m = pts.match(/^\d+/);
  return m ? parseInt(m[0]) : -1;
}

function pointsLabel(pts: string | undefined): string {
  if (!pts) return 'See MU website';
  return pts.replace(/\(MH\d+\)/, '').trim();
}

const FONT_SIZES = [
  { label: 'A', size: '13px', title: 'Small text' },
  { label: 'A', size: '15px', title: 'Normal text' },
  { label: 'A', size: '18px', title: 'Large text' },
];

interface ProgrammeDirectoryProps {
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  quizAnswers: Record<number, number>;
  quizQuestions: { id: number; category: StrengthCategory }[];
  quizFaculty: Faculty | null;
  onViewProgrammeDetail: (caoCode: string) => void;
}

export default function ProgrammeDirectory({ favourites, onToggleFavourite, quizAnswers, quizQuestions, quizFaculty, onViewProgrammeDetail }: ProgrammeDirectoryProps) {
  const [facultyFilter, setFacultyFilter] = useState<Faculty | 'all'>('all');
  const [favsOnly, setFavsOnly]           = useState(false);
  const [compareSet, setCompareSet]       = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare]     = useState(false);
  const [search, setSearch]               = useState('');
  const [sort, setSort]                   = useState<SortKey>('code');
  const [expanded, setExpanded]           = useState<Set<string>>(new Set());
  const [modalCourse, setModalCourse]     = useState<Course | null>(null);
  const [fontSize, setFontSize]           = useState<string>(
    () => localStorage.getItem('mu-dir-font') || '15px'
  );

  const applyFont = (size: string) => {
    setFontSize(size);
    localStorage.setItem('mu-dir-font', size);
    document.documentElement.style.fontSize = size;
  };

  // Apply on mount
  useMemo(() => { document.documentElement.style.fontSize = fontSize; }, []);

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCompare = (id: string) => {
    setCompareSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return courses
      .filter(c => {
        const matchFaculty = facultyFilter === 'all' || c.faculty === facultyFilter;
        const matchSearch  = !q
          || c.title.toLowerCase().includes(q)
          || c.code.toLowerCase().includes(q)
          || (c.description || '').toLowerCase().includes(q);
        const matchFavs = !favsOnly || favourites.has(c.id);
        return matchFaculty && matchSearch && matchFavs;
      })
      .sort((a, b) => {
        if (sort === 'title')       return a.title.localeCompare(b.title);
        if (sort === 'points-desc') return parsePts(b.points) - parsePts(a.points);
        if (sort === 'points-asc') {
          const pa = parsePts(a.points), pb = parsePts(b.points);
          if (pa === -1 && pb === -1) return 0;
          if (pa === -1) return 1;
          if (pb === -1) return -1;
          return pa - pb;
        }
        // default: code
        return a.code.localeCompare(b.code);
      });
  }, [facultyFilter, favsOnly, favourites, search, sort]);

  const counts = useMemo(() => ({
    arts:    courses.filter(c => c.faculty === 'arts').length,
    science: courses.filter(c => c.faculty === 'science').length,
    social:  courses.filter(c => c.faculty === 'social').length,
  }), []);

  return (
    <div className="w-full">

      {/* Controls bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative" style={{ flex: '1 1 200px', maxWidth: 360 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, code, keyword…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#6b1a2b] focus:ring-1 focus:ring-[#6b1a2b]"
          />
        </div>

        {/* Faculty filters */}
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'arts', 'science', 'social'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFacultyFilter(f); setFavsOnly(false); }}
              className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
              style={{
                background:  facultyFilter === f ? (f === 'all' ? '#6b1a2b' : FACULTY_COLORS[f]) : '#fff',
                color:       facultyFilter === f ? '#fff' : '#374151',
                borderColor: facultyFilter === f ? 'transparent' : '#d1d5db',
              }}
            >
              {f === 'all' ? `All faculties` : FACULTY_SHORT[f].split(',')[0]}
            </button>
          ))}
        </div>

        {/* Favourites filter */}
        {(favourites.size > 0 || favsOnly) && (
          <button
            onClick={() => setFavsOnly(f => !f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
            style={{
              background:  favsOnly ? '#6b1a2b' : 'white',
              color:       favsOnly ? 'white' : '#6b1a2b',
              borderColor: favsOnly ? 'transparent' : '#6b1a2b',
            }}
          >
            <Heart className={`w-3.5 h-3.5 ${favsOnly ? 'fill-current' : ''}`} />
            Saved ({favourites.size})
          </button>
        )}

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          className="ml-auto text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-[#6b1a2b]"
        >
          <option value="code">Sort: CAO code</option>
          <option value="title">Sort: title A–Z</option>
          <option value="points-desc">Sort: points high–low</option>
          <option value="points-asc">Sort: points low–high</option>
        </select>

        {/* Font size */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-1.5 py-1">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Text size</span>
          {FONT_SIZES.map((fs, i) => (
            <button
              key={fs.size}
              onClick={() => applyFont(fs.size)}
              title={fs.title}
              className="rounded px-2 py-0.5 font-bold transition-colors"
              style={{
                fontSize:   `${11 + i * 3}px`,
                background: fontSize === fs.size ? '#6b1a2b' : 'transparent',
                color:      fontSize === fs.size ? '#fff' : '#6b7280',
              }}
            >
              {fs.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 sm:px-6 py-2 text-xs text-slate-500 flex flex-wrap gap-4 bg-slate-50 border-b border-slate-200">
        <span>Showing <b className="text-slate-800">{filtered.length}</b> of <b className="text-slate-800">{courses.length}</b></span>
        <span style={{ color: FACULTY_COLORS.arts }}>Arts: <b>{counts.arts}</b></span>
        <span style={{ color: FACULTY_COLORS.science }}>Science: <b>{counts.science}</b></span>
        <span style={{ color: FACULTY_COLORS.social }}>Social: <b>{counts.social}</b></span>
      </div>

      {/* Grid */}
      <div
        className="p-4 sm:p-6"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}
      >
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <p className="text-lg font-medium text-slate-600 mb-1">No programmes found</p>
            <p className="text-sm">Try a different search or filter.</p>
          </div>
        )}

        {filtered.map(course => {
          const fc = FACULTY_COLORS[course.faculty];
          const fbg = FACULTY_BG[course.faculty];
          const isExpanded = expanded.has(course.id);
          const hasMore = !!(course.fullSummary && course.fullSummary !== course.description);
          const cats = [course.primaryCategory, course.secondaryCategory].filter(Boolean) as StrengthCategory[];
          const isComparing = compareSet.has(course.id);
          const compareDisabled = !isComparing && compareSet.size >= 3;

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden transition-shadow hover:-translate-y-px"
              style={{ borderLeft: `4px solid ${fc}`, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,26,43,.12)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)')}
            >
              {/* Card header */}
              <div className="px-4 pt-3.5 pb-2.5 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded font-mono tracking-wide"
                      style={{ background: fc, color: '#fff' }}
                    >
                      {course.code}
                    </span>
                    {course.subCode && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-600">
                        {course.subCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {favsOnly && (
                      <button
                        onClick={() => toggleCompare(course.id)}
                        title={isComparing ? 'Remove from comparison' : compareDisabled ? 'Maximum 3 programmes' : 'Add to comparison'}
                        disabled={compareDisabled}
                        className="transition-all"
                        style={{ color: isComparing ? '#2563eb' : compareDisabled ? '#e2e8f0' : '#cbd5e1' }}
                      >
                        <GitCompareArrows className={`w-4 h-4 ${isComparing ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleFavourite(course.id)}
                      title={favourites.has(course.id) ? 'Remove from saved' : 'Save programme'}
                      className="transition-colors hover:scale-110 active:scale-95"
                      style={{ color: favourites.has(course.id) ? '#6b1a2b' : '#cbd5e1' }}
                    >
                      <Heart className={`w-5 h-5 ${favourites.has(course.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {course.title}
                  {course.aiSummary && (
                    <span
                      className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded border align-middle"
                      style={{ color: '#92400e', background: '#fef3c7', borderColor: '#fcd34d' }}
                      title="Summary written by AI — prospectus text not parseable for this programme"
                    >
                      AI summary
                    </span>
                  )}
                </p>
                <p className="text-xs font-medium" style={{ color: fc }}>{FACULTY_SHORT[course.faculty]}</p>
              </div>

              {/* Card body */}
              <div className="px-4 pb-3 flex-grow flex flex-col gap-2">
                {/* Summary with clip + fade */}
                <div className="relative overflow-hidden" style={{
                  maxHeight: isExpanded ? '40em' : '3.6em',
                  transition: 'max-height 0.3s ease',
                }}>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {course.description}
                  </p>
                  {!isExpanded && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-5 pointer-events-none"
                      style={{ background: 'linear-gradient(transparent, white)' }}
                    />
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {hasMore && (
                    <button
                      onClick={() => toggleExpanded(course.id)}
                      className="text-xs font-semibold transition-opacity hover:opacity-70"
                      style={{ color: fc }}
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                  {hasMore && (
                    <button
                      onClick={() => setModalCourse(course)}
                      className="text-xs font-semibold transition-opacity hover:opacity-70"
                      style={{ color: fc }}
                    >
                      Full summary ›
                    </button>
                  )}
                </div>

                {/* Category pills */}
                {cats.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-1">
                    {cats.map(cat => (
                      <span
                        key={cat}
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${CAT_COLORS[cat]}18`, color: CAT_COLORS[cat] }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div
                className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
                style={{ background: '#faf9f8' }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded cursor-default"
                  style={{ color: fc, background: fbg }}
                  title="CAO points — 2025 Round 1 (last round)"
                >
                  {pointsLabel(course.points)}
                </span>

                {course.url && (
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
                    style={{ color: fc }}
                  >
                    MU page <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setModalCourse(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl shadow-2xl flex flex-col"
              style={{ maxWidth: 640, width: '100%', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header — sticky */}
              <div className="px-6 pt-5 pb-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {modalCourse.subCode ? `${modalCourse.code} – ${modalCourse.subCode}` : modalCourse.code}
                </p>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{modalCourse.title}</h3>
                    <p className="text-sm mt-0.5" style={{ color: FACULTY_COLORS[modalCourse.faculty] }}>
                      {FACULTY_SHORT[modalCourse.faculty]}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalCourse(null)}
                    className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0 mt-0.5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 overflow-y-auto flex-grow">
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                  {modalCourse.fullSummary || modalCourse.description}
                </p>
                {modalCourse.aiSummary && (
                  <p className="mt-4 text-xs italic text-amber-700">AI-generated summary — prospectus text not directly parseable for this programme.</p>
                )}
              </div>

              {/* Modal footer */}
              <div
                className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 rounded-b-2xl"
                style={{ background: '#faf9f8' }}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {modalCourse.url && (
                    <a
                      href={modalCourse.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-opacity"
                      style={{ color: FACULTY_COLORS[modalCourse.faculty] }}
                    >
                      View on MU website <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => { setModalCourse(null); onViewProgrammeDetail(modalCourse.code); }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: FACULTY_COLORS[modalCourse.faculty] }}
                  >
                    Module detail ↗
                  </button>
                </div>
                <button
                  onClick={() => setModalCourse(null)}
                  className="px-4 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky comparison bar */}
      <AnimatePresence>
        {favsOnly && compareSet.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
            style={{ background: '#1e293b', color: 'white', minWidth: 280 }}
          >
            <GitCompareArrows className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span className="text-sm font-semibold flex-grow">
              {compareSet.size} of 3 selected
            </span>
            {compareSet.size >= 2 && (
              <button
                onClick={() => setShowCompare(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                style={{ background: '#6b1a2b', color: 'white' }}
              >
                Compare →
              </button>
            )}
            <button
              onClick={() => setCompareSet(new Set())}
              className="text-slate-400 hover:text-white transition-colors ml-1"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare modal */}
      {showCompare && compareSet.size >= 2 && (
        <CompareModal
          courses={courses.filter(c => compareSet.has(c.id))}
          onClose={() => setShowCompare(false)}
          answers={quizAnswers}
          questions={quizQuestions}
          quizFaculty={quizFaculty}
        />
      )}
    </div>
  );
}
