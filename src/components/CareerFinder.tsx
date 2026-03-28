import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, ExternalLink, Heart } from 'lucide-react';
import { courses } from '../data/courses';
import { careers, careerGroups, CareerOption } from '../data/careers';
import { Course, StrengthCategory } from '../types';

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

function getMatchScore(course: Course, career: CareerOption): number {
  let score = 0;
  if (course.primaryCategory === career.primaryCategory)         score += 70;
  else if (course.secondaryCategory === career.primaryCategory)  score += 40;
  if (career.secondaryCategory) {
    if (course.primaryCategory === career.secondaryCategory)     score += 30;
    else if (course.secondaryCategory === career.secondaryCategory) score += 15;
  }
  return Math.min(score, 100);
}

interface CareerFinderProps {
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
}

export default function CareerFinder({ favourites, onToggleFavourite }: CareerFinderProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CareerOption | null>(null);
  const [favsOnly, setFavsOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return careers.filter(c =>
      c.title.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [search]);

  const matchedCourses = useMemo(() => {
    if (!selected) return [];
    return courses
      .map(c => ({ ...c, score: getMatchScore(c, selected) }))
      .filter(c => c.score > 0)
      .filter(c => !favsOnly || favourites.has(c.id))
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }, [selected]);

  if (selected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm font-medium transition-colors"
          >
            ← Back to careers
          </button>

          <div className="mb-8 flex flex-wrap items-start gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Programmes for: <span style={{ color: '#6b1a2b' }}>{selected.title}</span>
              </h2>
              <p className="text-slate-500 text-sm">
                {matchedCourses.length} matching {matchedCourses.length === 1 ? 'programme' : 'programmes'} · sorted by relevance
              </p>
            </div>
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
            {matchedCourses.map((course, index) => {
              const primaryColor = CAT_COLORS[course.primaryCategory] || '#6b1a2b';
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index }}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative"
                >
                  <div className="absolute top-0 left-0 w-1 h-full" style={{ background: primaryColor }} />
                  <div className="px-5 pl-6 pt-4 pb-2 flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        {course.subCode ? `${course.code} ${course.subCode}` : course.code}
                        {course.points && /\d/.test(course.points)
                          ? ` · ${course.points.replace(/\(MH\d+\)/,'').trim()} pts`
                          : ''}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 leading-snug">{course.title}</h4>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{ background: `${primaryColor}18`, color: primaryColor }}>
                      {course.primaryCategory}
                    </span>
                  </div>

                  <div className="px-5 pl-6 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-700">Match</span>
                      <span className="text-xs font-semibold" style={{ color: '#6b1a2b' }}>{course.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${course.score}%`, background: '#6b1a2b' }} />
                    </div>
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
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Career Finder</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Know what you want to become? Select a career and we'll show the MU programmes that can get you there.
        </p>
      </motion.div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search careers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b1a2b] focus:border-transparent"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-400 py-8">No careers match your search.</p>
      )}

      {careerGroups.map(group => {
        const groupCareers = filtered.filter(c => c.group === group);
        if (groupCareers.length === 0) return null;
        return (
          <motion.div key={group} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{group}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {groupCareers.map(career => (
                <button
                  key={career.id}
                  onClick={() => setSelected(career)}
                  className="text-left bg-white border border-slate-200 rounded-xl px-4 py-3 hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 block leading-snug">
                    {career.title}
                  </span>
                  <span className="text-xs mt-1 font-medium block" style={{ color: CAT_COLORS[career.primaryCategory] }}>
                    {career.primaryCategory}
                    {career.secondaryCategory ? ` · ${career.secondaryCategory}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
