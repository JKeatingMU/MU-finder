import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import { Course, StrengthCategory, Faculty } from '../types';
import { careers } from '../data/careers';

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

function pointsLabel(pts: string | undefined): string {
  if (!pts) return 'See MU website';
  return pts.replace(/\(MH\d+\)/, '').trim();
}

function relatedCareers(course: Course): string[] {
  const cats = [course.primaryCategory, course.secondaryCategory].filter(Boolean) as StrengthCategory[];
  return careers
    .filter(c => cats.includes(c.primaryCategory) || (c.secondaryCategory && cats.includes(c.secondaryCategory)))
    .slice(0, 5)
    .map(c => c.title);
}

function matchScore(
  course: Course,
  answers: Record<number, number>,
  questions: { id: number; category: StrengthCategory }[],
  faculty: Faculty | null,
): number | null {
  if (!faculty || Object.keys(answers).length === 0) return null;

  const qPerCat: Record<string, number> = {};
  questions.forEach(q => { qPerCat[q.category] = (qPerCat[q.category] || 0) + 1; });

  const scores: Record<string, number> = {};
  questions.forEach(q => { scores[q.category] = (scores[q.category] || 0) + (answers[q.id] || 0); });

  const primaryQ   = qPerCat[course.primaryCategory] || 3;
  const secondaryQ = course.secondaryCategory ? (qPerCat[course.secondaryCategory] || 3) : 0;
  const primaryS   = scores[course.primaryCategory] || 0;
  const secondaryS = course.secondaryCategory ? (scores[course.secondaryCategory] || 0) : 0;
  const maxScore   = (primaryQ + secondaryQ) * 5;
  return maxScore > 0 ? Math.round(((primaryS + secondaryS) / maxScore) * 100) : 0;
}

interface CompareModalProps {
  courses: Course[];
  onClose: () => void;
  answers: Record<number, number>;
  questions: { id: number; category: StrengthCategory }[];
  quizFaculty: Faculty | null;
}

interface RowProps {
  label: string;
  children: React.ReactNode;
}

function Row({ label, children }: RowProps) {
  return (
    <div className="contents">
      <div className="py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100 flex items-center">
        {label}
      </div>
      {children}
    </div>
  );
}

export default function CompareModal({ courses, onClose, answers, questions, quizFaculty }: CompareModalProps) {
  const cols = courses.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxWidth: cols === 3 ? 900 : cols === 2 ? 680 : 480, width: '100%', maxHeight: '92vh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-shrink-0 bg-white">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Programme Comparison</h2>
              <p className="text-xs text-slate-500 mt-0.5">Comparing {cols} saved programme{cols > 1 ? 's' : ''}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-grow">
            {/* Grid: label col + N course cols */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `140px repeat(${cols}, 1fr)`,
              }}
            >
              {/* ── Programme name row (sticky top) ── */}
              <div className="py-3 px-3 bg-white border-b border-slate-200 sticky top-0 z-10" />
              {courses.map(course => {
                const fc = FACULTY_COLORS[course.faculty];
                return (
                  <div
                    key={course.id}
                    className="py-3 px-4 border-b border-slate-200 bg-white sticky top-0 z-10"
                    style={{ borderTop: `3px solid ${fc}` }}
                  >
                    <p className="text-xs font-bold font-mono" style={{ color: fc }}>{course.code}</p>
                    <p className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{course.title}</p>
                  </div>
                );
              })}

              {/* ── Faculty ── */}
              <Row label="Faculty">
                {courses.map(course => (
                  <div key={course.id} className="py-3 px-4 border-b border-slate-100 text-xs font-medium" style={{ color: FACULTY_COLORS[course.faculty] }}>
                    {FACULTY_LABELS[course.faculty]}
                  </div>
                ))}
              </Row>

              {/* ── CAO Points ── */}
              <Row label="CAO Points">
                {courses.map(course => (
                  <div key={course.id} className="py-3 px-4 border-b border-slate-100">
                    <span className="text-lg font-bold" style={{ color: FACULTY_COLORS[course.faculty] }}>
                      {pointsLabel(course.points)}
                    </span>
                    {course.points && /\d/.test(course.points) && (
                      <span className="text-xs text-slate-400 block mt-0.5">2025 Round 1</span>
                    )}
                  </div>
                ))}
              </Row>

              {/* ── Strength areas ── */}
              <Row label="Strength Areas">
                {courses.map(course => {
                  const cats = [course.primaryCategory, course.secondaryCategory].filter(Boolean) as StrengthCategory[];
                  return (
                    <div key={course.id} className="py-3 px-4 border-b border-slate-100 flex flex-wrap gap-1">
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
                  );
                })}
              </Row>

              {/* ── Personality match (only if quiz taken) ── */}
              {(Object.keys(answers).length > 0) && (
                <Row label="Your Match">
                  {courses.map(course => {
                    const score = matchScore(course, answers, questions, quizFaculty);
                    if (score === null) {
                      return (
                        <div key={course.id} className="py-3 px-4 border-b border-slate-100 text-xs text-slate-400 italic">
                          Take the quiz to see your match
                        </div>
                      );
                    }
                    return (
                      <div key={course.id} className="py-3 px-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-lg font-bold" style={{ color: '#6b1a2b' }}>{score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${score}%`, background: '#6b1a2b' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </Row>
              )}

              {/* ── Related careers ── */}
              <Row label="Related Careers">
                {courses.map(course => {
                  const rc = relatedCareers(course);
                  return (
                    <div key={course.id} className="py-3 px-4 border-b border-slate-100">
                      {rc.length === 0
                        ? <span className="text-xs text-slate-400">—</span>
                        : <ul className="space-y-0.5">
                            {rc.map(c => (
                              <li key={c} className="text-xs text-slate-700 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                      }
                    </div>
                  );
                })}
              </Row>

              {/* ── Description ── */}
              <Row label="About">
                {courses.map(course => (
                  <div key={course.id} className="py-3 px-4 border-b border-slate-100 text-xs text-slate-600 leading-relaxed">
                    {course.fullSummary || course.description}
                    {course.aiSummary && (
                      <span className="ml-1 text-amber-600 font-medium">[AI summary]</span>
                    )}
                  </div>
                ))}
              </Row>

              {/* ── Links ── */}
              <Row label="MU Page">
                {courses.map(course => (
                  <div key={course.id} className="py-3 px-4 border-b border-slate-100">
                    {course.url
                      ? (
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
                          style={{ color: FACULTY_COLORS[course.faculty] }}
                        >
                          View on MU website <ExternalLink className="w-3 h-3" />
                        </a>
                      )
                      : <span className="text-xs text-slate-400">—</span>
                    }
                  </div>
                ))}
              </Row>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-white flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
