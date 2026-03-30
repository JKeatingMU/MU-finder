import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ExternalLink, X, Heart } from 'lucide-react';
import { courses } from '../data/courses';
import { lcSubjects, lcSubjectGroups, gradeToPoints, hasMathsBonus, MATHS_BONUS, H_POINTS, O_POINTS, F_POINTS } from '../data/lcSubjects';
import { Faculty } from '../types';

const H_GRADES = ['H1','H2','H3','H4','H5','H6','H7'];
const O_GRADES = ['O1','O2','O3','O4','O5','O6'];
const F_GRADES = ['F1','F2'];

const FACULTY_COLORS: Record<Faculty, string> = {
  arts:    '#7c3aed',
  science: '#0369a1',
  social:  '#15803d',
};

const FACULTY_LABELS: Record<Faculty, string> = {
  arts:    'Arts and Humanities',
  science: 'Science & Engineering',
  social:  'Social Sciences',
};

function parseCoursePoints(pts: string | undefined): number | null {
  if (!pts) return null;
  const m = pts.match(/^\d+/);
  return m ? parseInt(m[0]) : null;
}

function calcPoints(grades: Record<string, string>) {
  const all = Object.entries(grades)
    .filter(([, g]) => g)
    .map(([, g]) => gradeToPoints(g))
    .sort((a, b) => b - a);
  const best6 = all.slice(0, 6);
  const base = best6.reduce((a, b) => a + b, 0);
  const bonus = grades['Mathematics'] && hasMathsBonus(grades['Mathematics']) ? MATHS_BONUS : 0;
  return { base, bonus, total: base + bonus };
}

type Status = 'achievable' | 'close' | 'stretch' | 'open';

function getStatus(studentPts: number, coursePts: number | null): Status {
  if (coursePts === null) return 'open';
  if (studentPts >= coursePts) return 'achievable';
  if (coursePts - studentPts <= 40) return 'close';
  return 'stretch';
}

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string }> = {
  achievable: { label: 'You qualify',  bg: '#dcfce7', color: '#15803d' },
  close:      { label: 'Close',        bg: '#fef9c3', color: '#a16207' },
  stretch:    { label: 'Aim higher',   bg: '#f1f5f9', color: '#475569' },
  open:       { label: 'Open entry',   bg: '#eff6ff', color: '#1d4ed8' },
};

function suggestFaculty(grades: Record<string, string>): Faculty | null {
  const counts: Record<Faculty, number> = { arts: 0, science: 0, social: 0 };
  Object.keys(grades).forEach(name => {
    const s = lcSubjects.find(ls => ls.name === name);
    if (s?.facultyHint) counts[s.facultyHint]++;
  });
  const sorted = (Object.entries(counts) as [Faculty, number][]).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] : null;
}

interface SubjectExplorerProps {
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
}

export default function SubjectExplorer({ favourites, onToggleFavourite }: SubjectExplorerProps) {
  const [step, setStep] = useState<'pick' | 'results'>('pick');
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [facultyFilter, setFacultyFilter] = useState<Faculty | 'all'>('all');
  const [favsOnly, setFavsOnly] = useState(false);

  const selectedSubjects = Object.keys(grades);
  const { base, bonus, total } = useMemo(() => calcPoints(grades), [grades]);
  const allGradesFilled = selectedSubjects.length >= 3 && selectedSubjects.every(s => grades[s]);

  const toggleSubject = (name: string) => {
    setGrades(prev => {
      if (name in prev) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      if (selectedSubjects.length >= 7) return prev;
      return { ...prev, [name]: '' };
    });
  };

  const setGrade = (name: string, grade: string) => {
    setGrades(prev => ({ ...prev, [name]: grade }));
  };

  const suggested = useMemo(() => suggestFaculty(grades), [grades]);

  const rankedCourses = useMemo(() => {
    return courses
      .map(c => {
        const reqPts = parseCoursePoints(c.points);
        const status = getStatus(total, reqPts);
        const gap = reqPts !== null ? reqPts - total : 0;
        return { ...c, reqPts, status, gap };
      })
      .filter(c => facultyFilter === 'all' || c.faculty === facultyFilter)
      .filter(c => !favsOnly || favourites.has(c.id))
      .sort((a, b) => {
        const order: Record<Status, number> = { achievable: 0, close: 1, stretch: 2, open: 3 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        if (a.status === 'achievable') return (b.reqPts ?? 0) - (a.reqPts ?? 0);
        return a.gap - b.gap;
      });
  }, [total, facultyFilter]);

  if (step === 'results') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => setStep('pick')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium transition-colors"
          >
            ← Edit subjects
          </button>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <span className="text-5xl font-bold" style={{ color: '#6b1a2b' }}>{total}</span>
                <span className="text-lg text-slate-500 ml-2">estimated CAO points</span>
              </div>
              {bonus > 0 && (
                <span className="text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">
                  incl. +{bonus} Higher Maths bonus
                </span>
              )}
              {suggested && (
                <span className="text-sm text-slate-500">
                  Suggested faculty:{' '}
                  <span className="font-semibold" style={{ color: FACULTY_COLORS[suggested] }}>
                    {FACULTY_LABELS[suggested].split(',')[0]}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">Based on best 6 subjects. Points shown are 2025 Round 1 figures and may vary.</p>
          </div>

          <div className="flex gap-2 flex-wrap items-center mb-6">
            {(['all', 'arts', 'science', 'social'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFacultyFilter(f)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
                style={{
                  background: facultyFilter === f ? (f === 'all' ? '#6b1a2b' : FACULTY_COLORS[f]) : 'white',
                  color: facultyFilter === f ? 'white' : '#64748b',
                  borderColor: facultyFilter === f ? 'transparent' : '#e2e8f0',
                }}
              >
                {f === 'all' ? 'All faculties' : FACULTY_LABELS[f].split(',')[0]}
              </button>
            ))}
            {(favourites.size > 0 || favsOnly) && (
              <button
                onClick={() => setFavsOnly(f => !f)}
                className="ml-auto flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-all"
                style={{ background: favsOnly ? '#6b1a2b' : 'white', color: favsOnly ? 'white' : '#6b1a2b', borderColor: '#6b1a2b' }}
              >
                <Heart className={`w-4 h-4 ${favsOnly ? 'fill-current' : ''}`} />
                Saved ({favourites.size})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedCourses.map(course => {
              const sc = STATUS_CONFIG[course.status];
              const fc = FACULTY_COLORS[course.faculty];
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative"
                >
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ background: fc }} />
                  <div className="px-5 pl-6 pt-4 pb-2 flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        {course.subCode ? `${course.code} ${course.subCode}` : course.code}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 leading-snug">{course.title}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                        style={{ background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                        style={{ background: `${fc}18`, color: fc }}>
                        {FACULTY_LABELS[course.faculty].split(',')[0]}
                      </span>
                    </div>
                  </div>
                  <div className="px-5 pl-6 pb-2">
                    <span className="text-xs text-slate-500">
                      {course.reqPts !== null
                        ? course.status === 'achievable'
                          ? `Required: ${course.reqPts} pts · You have ${total}`
                          : `Required: ${course.reqPts} pts · You need ${course.gap} more`
                        : course.points || 'Entry requirements vary'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 px-5 pl-6 pb-3 flex-grow line-clamp-2">{course.description}</p>
                  <div className="px-5 pl-6 pb-4 flex items-center justify-between">
                    {course.url ? (
                      <a href={course.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-semibold gap-1 hover:opacity-80 transition-opacity"
                        style={{ color: '#6b1a2b' }}>
                        View Course <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span />}
                    <button
                      onClick={() => onToggleFavourite(course.id)}
                      title={favourites.has(course.id) ? 'Remove from saved' : 'Save programme'}
                      className="transition-colors"
                      style={{ color: favourites.has(course.id) ? '#6b1a2b' : '#cbd5e1' }}
                    >
                      <Heart className={`w-4 h-4 ${favourites.has(course.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Subject Explorer</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Select your Leaving Cert subjects and expected grades. We'll calculate your CAO points and show matching MU programmes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Click to add a subject (max 7)
          </p>
          <div className="space-y-5">
            {lcSubjectGroups.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.subjects.map(s => {
                    const selected = s.name in grades;
                    const disabled = !selected && selectedSubjects.length >= 7;
                    return (
                      <button
                        key={s.name}
                        onClick={() => toggleSubject(s.name)}
                        disabled={disabled}
                        className="px-3 py-1.5 rounded-lg border text-sm font-medium transition-all"
                        style={{
                          background:  selected ? '#6b1a2b' : 'white',
                          color:       selected ? 'white' : '#334155',
                          borderColor: selected ? '#6b1a2b' : '#e2e8f0',
                          opacity:     disabled ? 0.4 : 1,
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Your subjects ({selectedSubjects.length}/7)
          </p>

          {selectedSubjects.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-400 text-sm border border-dashed border-slate-200">
              Select subjects from the list
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSubjects.map(name => {
                const subj = lcSubjects.find(s => s.name === name);
                return (
                  <div key={name} className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800 flex-grow truncate">{name}</span>
                    <select
                      value={grades[name]}
                      onChange={e => setGrade(name, e.target.value)}
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 flex-shrink-0"
                    >
                      <option value="">Grade</option>
                      <optgroup label="Higher Level">
                        {H_GRADES.map((g, i) => <option key={g} value={g}>{g} · {H_POINTS[i]} pts</option>)}
                      </optgroup>
                      <optgroup label="Ordinary Level">
                        {O_GRADES.map((g, i) => <option key={g} value={g}>{g} · {O_POINTS[i]} pts</option>)}
                      </optgroup>
                      {subj?.hasFoundation && (
                        <optgroup label="Foundation Level">
                          {F_GRADES.map((g, i) => <option key={g} value={g}>{g} · {F_POINTS[i]} pts</option>)}
                        </optgroup>
                      )}
                    </select>
                    <button onClick={() => toggleSubject(name)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {selectedSubjects.length >= 2 && (
            <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Best 6 subjects</span>
                <span className="font-bold text-slate-900">{base} pts</span>
              </div>
              {bonus > 0 && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Higher Maths bonus</span>
                  <span className="font-bold text-amber-600">+{bonus} pts</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 mt-1">
                <span style={{ color: '#6b1a2b' }}>Estimated total</span>
                <span style={{ color: '#6b1a2b' }}>{total} pts</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setStep('results')}
            disabled={!allGradesFilled}
            className="w-full mt-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
            style={{ background: '#6b1a2b', opacity: allGradesFilled ? 1 : 0.4 }}
          >
            See Matching Courses <ArrowRight className="w-5 h-5" />
          </button>
          {!allGradesFilled && selectedSubjects.length > 0 && (
            <p className="text-xs text-slate-400 text-center mt-2">
              {selectedSubjects.length < 3
                ? 'Select at least 3 subjects'
                : 'Add grades to all subjects first'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
