import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Course, StrengthCategory, Faculty } from '../types';
import { courses } from '../data/courses';
import { ExternalLink, Heart } from 'lucide-react';

interface ResultsProps {
  answers: Record<number, number>;
  questions: { id: number; category: StrengthCategory }[];
  faculty: Faculty | null;
  onRestart: () => void;
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
}

const CAT_COLORS: Record<StrengthCategory, string> = {
  Creative:    '#ea580c',
  Humanities:  '#92400e',
  Language:    '#b45309',
  Scientific:  '#059669',
  Quantitative:'#2563eb',
  Computing:   '#7c3aed',
  Social:      '#be123c',
  Business:    '#334155',
};

const CAT_DESCRIPTIONS: Record<StrengthCategory, string> = {
  Creative:     'You think through imagination and making — drawn to design, art, media, music, and original expression.',
  Humanities:   'You are curious about culture, history, philosophy, and how human societies develop and make meaning.',
  Language:     'You communicate with clarity and confidence — through writing, debate, storytelling, or cross-cultural exchange.',
  Scientific:   'You want to understand how the natural world works — from living systems to matter, energy, and the environment.',
  Quantitative: 'You are comfortable with numbers, data, and formal logic — finding patterns and building rigorous models.',
  Computing:    'You are drawn to software, algorithms, and digital systems — building, automating, and solving with code.',
  Social:       'You are motivated by people — their wellbeing, rights, development, and place in communities and society.',
  Business:     'You think in terms of strategy, markets, and organisations — interested in how enterprises create and deliver value.',
};

const FACULTY_LABELS: Record<Faculty, string> = {
  arts:    'Arts and Humanities',
  science: 'Science & Engineering',
  social:  'Social Sciences',
};

export default function Results({ answers, questions, faculty, onRestart, favourites, onToggleFavourite }: ResultsProps) {
  const [favsOnly, setFavsOnly] = useState(false);
  const scores = useMemo(() => {
    const raw: Record<string, number> = {};
    questions.forEach(q => {
      raw[q.category] = (raw[q.category] || 0) + (answers[q.id] || 0);
    });
    return Object.entries(raw)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [answers, questions]);

  // Only declare a category a "strength" if it's meaningfully above the next one.
  // With 3 questions per category on a 1–5 scale, a gap of ≥2 points means at least
  // one extra "Agree" vs "Neutral" answer — a genuine signal.
  const GAP = 2;
  const topCategories: StrengthCategory[] = [];
  if (scores.length > 0) {
    const first = scores[0];
    const secondVal = scores[1]?.value ?? 0;
    if (first.value - secondVal >= GAP) {
      topCategories.push(first.name as StrengthCategory);
      // Only add second if it too clears the bar above the third
      if (scores[1] && scores[1].value - (scores[2]?.value ?? 0) >= GAP) {
        topCategories.push(scores[1].name as StrengthCategory);
      }
    }
  }
  const isBalanced = topCategories.length === 0;

  // Questions per category (for max score)
  const qPerCat = useMemo(() => {
    const m: Record<string, number> = {};
    questions.forEach(q => { m[q.category] = (m[q.category] || 0) + 1; });
    return m;
  }, [questions]);

  const getMatchScore = (course: Course) => {
    const primaryQ  = qPerCat[course.primaryCategory]  || 3;
    const secondaryQ = course.secondaryCategory ? (qPerCat[course.secondaryCategory] || 3) : 0;
    const primaryScore   = scores.find(s => s.name === course.primaryCategory)?.value   || 0;
    const secondaryScore = course.secondaryCategory
      ? (scores.find(s => s.name === course.secondaryCategory)?.value || 0)
      : 0;
    const maxScore = (primaryQ + secondaryQ) * 5;
    return maxScore > 0 ? Math.round(((primaryScore + secondaryScore) / maxScore) * 100) : 0;
  };

  const recommendedCourses = useMemo(() => {
    return courses
      .filter(c => faculty === null || c.faculty === faculty)
      .filter(c => !favsOnly || favourites.has(c.id))
      .sort((a, b) => getMatchScore(b) - getMatchScore(a));
  }, [faculty, scores, favsOnly, favourites]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Your Interests &amp; Strengths Profile</h2>
        {isBalanced ? (
          <p className="text-slate-600 max-w-2xl mx-auto">
            Your responses are broadly balanced across all areas — no single strength stands out yet.
            Browse all the programmes below or try a different pathway to explore further.
          </p>
        ) : (
          <p className="text-slate-600 max-w-2xl mx-auto">
            Based on your answers, your strongest {topCategories.length === 1 ? 'area is' : 'areas are'}{' '}
            <span className="font-semibold" style={{ color: CAT_COLORS[topCategories[0]] }}>
              {topCategories[0]}
            </span>
            {topCategories[1] && (
              <>
                {' '}and{' '}
                <span className="font-semibold" style={{ color: CAT_COLORS[topCategories[1]] }}>
                  {topCategories[1]}
                </span>
              </>
            )}.
          </p>
        )}
      </motion.div>

      {/* Profile chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={scores} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#64748b', fontSize: 13 }} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
              {scores.map((entry) => (
                <Cell key={entry.name} fill={CAT_COLORS[entry.name as StrengthCategory] || '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top category descriptions — only shown when there's a genuine signal */}
      {!isBalanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {topCategories.map(cat => (
            <div key={cat} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: CAT_COLORS[cat] }}
                />
                <span className="font-bold text-slate-900">{cat}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{CAT_DESCRIPTIONS[cat]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Course cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
            {faculty ? `Programmes — ${FACULTY_LABELS[faculty]}` : 'Matching Programmes'}
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {recommendedCourses.length} programmes
            </span>
          </h3>
          {(favourites.size > 0 || favsOnly) && (
            <button
              onClick={() => setFavsOnly(f => !f)}
              className="ml-auto flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: favsOnly ? '#6b1a2b' : 'white',
                color: favsOnly ? 'white' : '#6b1a2b',
                borderColor: '#6b1a2b',
              }}
            >
              <Heart className={`w-4 h-4 ${favsOnly ? 'fill-current' : ''}`} />
              Saved ({favourites.size})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendedCourses.map((course, index) => {
            const matchScore = getMatchScore(course);
            const isTopMatch = course.primaryCategory === topCategories[0];
            const primaryColor = CAT_COLORS[course.primaryCategory] || '#6b1a2b';
            const isFav = favourites.has(course.id);

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col"
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ background: isTopMatch ? primaryColor : '#e2e8f0' }}
                />

                <div className="flex justify-between items-start pt-5 pb-3 px-5 pl-6">
                  <div className="flex-grow min-w-0">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                      {course.subCode ? `${course.code} ${course.subCode}` : course.code}
                      {course.points && /\d/.test(course.points)
                        ? ` · ${course.points.replace(/\(MH\d+\)/,'').trim()} pts`
                        : course.points ? ` · ${course.points}` : ''}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-[#6b1a2b] transition-colors">
                      {course.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0 flex-wrap justify-end">
                    {faculty === null && (
                      <span className="text-xs px-2 py-1 rounded-full font-semibold bg-slate-100 text-slate-500">
                        {FACULTY_LABELS[course.faculty]}
                      </span>
                    )}
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ background: `${primaryColor}18`, color: primaryColor }}
                    >
                      {course.primaryCategory}
                    </span>
                    <button
                      onClick={() => onToggleFavourite(course.id)}
                      title={isFav ? 'Remove from saved' : 'Save programme'}
                      className="transition-colors hover:scale-110 active:scale-95"
                      style={{ color: isFav ? '#6b1a2b' : '#cbd5e1' }}
                    >
                      <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="px-5 pl-6 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-700">Match</span>
                    <span className="text-xs font-semibold" style={{ color: '#6b1a2b' }}>{matchScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${matchScore}%`, background: '#6b1a2b' }}
                    />
                  </div>
                </div>

                <p className="text-slate-600 px-5 pl-6 pb-4 text-sm leading-relaxed flex-grow">
                  {course.description}
                  {course.aiSummary && (
                    <span className="ml-1 text-xs text-amber-600 font-medium">[AI summary]</span>
                  )}
                </p>

                <div className="px-5 pl-6 pb-4 mt-auto">
                  {course.url ? (
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-semibold transition-colors hover:opacity-80"
                      style={{ color: '#6b1a2b' }}
                    >
                      View Course Details <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-16 text-center">
        <button
          onClick={onRestart}
          className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          Retake the quiz
        </button>
      </div>
    </div>
  );
}
