import { useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Course, StrengthCategory } from '../types';
import { courses } from '../data/courses';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface ResultsProps {
  answers: Record<number, number>;
  questions: { id: number; category: StrengthCategory }[];
  onRestart: () => void;
}

const COLORS = {
  Analytical: '#3b82f6',
  Creative: '#ec4899',
  Social: '#10b981',
  Practical: '#f59e0b',
  Leadership: '#8b5cf6'
};

export default function Results({ answers, questions, onRestart }: ResultsProps) {
  const scores = useMemo(() => {
    const categoryScores: Record<string, number> = {
      Analytical: 0,
      Creative: 0,
      Social: 0,
      Practical: 0,
      Leadership: 0
    };

    questions.forEach(q => {
      const score = answers[q.id] || 0;
      categoryScores[q.category] += score;
    });

    return Object.entries(categoryScores).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [answers, questions]);

  const topCategories = scores.slice(0, 2).map(s => s.name as StrengthCategory);

  const getMatchScore = (course: Course) => {
    const primaryScore = scores.find(s => s.name === course.primaryCategory)?.value || 0;
    const secondaryScore = course.secondaryCategory 
      ? (scores.find(s => s.name === course.secondaryCategory)?.value || 0)
      : 0;
    
    // Max possible score per category is 15 (3 questions * 5 points)
    // We weight primary category slightly higher
    const maxScore = course.secondaryCategory ? 30 : 15;
    const totalScore = primaryScore + secondaryScore;
    
    return Math.round((totalScore / maxScore) * 100);
  };

  const recommendedCourses = useMemo(() => {
    return courses.filter(course => 
      topCategories.includes(course.primaryCategory) || 
      (course.secondaryCategory && topCategories.includes(course.secondaryCategory))
    ).sort((a, b) => {
      // Sort by match score descending
      return getMatchScore(b) - getMatchScore(a);
    });
  }, [topCategories, scores]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Your Strength Profile</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Based on your answers, here is a breakdown of your identified key strengths. 
          Your top strengths are <span className="font-semibold text-red-700">{topCategories.join(' & ')}</span>.
        </p>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-12 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={scores} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 14 }} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
              {scores.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          Recommended Courses at Maynooth
          <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {recommendedCourses.length} matches found
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedCourses.map((course, index) => {
            const matchScore = getMatchScore(course);
            
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col"
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  course.primaryCategory === topCategories[0] ? 'bg-red-600' : 'bg-slate-200'
                }`} />
                
                <div className="flex justify-between items-start mb-4 pl-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                      {course.code} • {course.points ? `~${course.points} Points` : 'Points Varies'}
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                      {course.title}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium bg-slate-100 text-slate-600`}>
                      {course.primaryCategory}
                    </span>
                  </div>
                </div>
                
                <div className="pl-4 mb-4">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-700">Match Strength</span>
                      <span className="text-xs font-medium text-red-700">{matchScore}%</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-red-600 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${matchScore}%` }}
                      />
                   </div>
                </div>

                <p className="text-slate-600 mb-6 pl-4 text-sm leading-relaxed flex-grow">
                  {course.description}
                </p>

                <div className="pl-4 mt-auto">
                  <a 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
                  >
                    View Course Details <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
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
          Retake Self Assessment
        </button>
      </div>
    </div>
  );
}
