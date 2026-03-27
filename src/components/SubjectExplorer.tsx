import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { courses } from '../data/courses';
import { ArrowLeft, ExternalLink, Calculator, BookOpen, Check } from 'lucide-react';

interface SubjectExplorerProps {
  onBack: () => void;
}

type Grade = 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'H7' | 'H8' | 'O1' | 'O2' | 'O3' | 'O4' | 'O5' | 'O6' | 'O7' | 'O8';

const GRADES: Record<Grade, number> = {
  'H1': 100, 'H2': 88, 'H3': 77, 'H4': 66, 'H5': 56, 'H6': 46, 'H7': 37, 'H8': 0,
  'O1': 56, 'O2': 46, 'O3': 37, 'O4': 28, 'O5': 20, 'O6': 12, 'O7': 0, 'O8': 0
};

const SUBJECTS = [
  'Maths', 'Applied Maths', 'Physics', 'Chemistry', 'Biology', 'Agricultural Science',
  'Computer Science', 'Engineering', 'Technology', 'DCG', 'Construction Studies',
  'English', 'Irish', 'French', 'German', 'Spanish', 'History', 'Geography',
  'Business', 'Economics', 'Accounting', 'Art', 'Music', 'Home Economics'
];

export default function SubjectExplorer({ onBack }: SubjectExplorerProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<Array<{ subject: string; grade: Grade }>>([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentGrade, setCurrentGrade] = useState<Grade>('H1');

  const addSubject = () => {
    if (currentSubject && selectedSubjects.length < 7) {
      if (selectedSubjects.some(s => s.subject === currentSubject)) return;
      setSelectedSubjects([...selectedSubjects, { subject: currentSubject, grade: currentGrade }]);
      setCurrentSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.subject !== subject));
  };

  const totalPoints = useMemo(() => {
    // Sort grades descending
    const points = selectedSubjects.map(s => {
      let score = GRADES[s.grade];
      // Maths Bonus: +25 for H6 or above
      if (s.subject === 'Maths' && ['H1','H2','H3','H4','H5','H6'].includes(s.grade)) {
        score += 25;
      }
      return score;
    });
    
    // Sum top 6
    points.sort((a, b) => b - a);
    return points.slice(0, 6).reduce((sum, p) => sum + p, 0);
  }, [selectedSubjects]);

  const recommendedCourses = useMemo(() => {
    if (selectedSubjects.length === 0) return [];

    const userSubjects = selectedSubjects.map(s => s.subject);

    return courses.map(course => {
      // Calculate relevance score based on subject overlap
      const related = course.relatedSubjects || [];
      const matchCount = related.filter(s => userSubjects.includes(s)).length;
      
      // Calculate points feasibility
      const pointsDiff = totalPoints - (course.points || 0);
      const isFeasible = pointsDiff >= -50; // Show courses slightly above current points for aspiration

      return {
        ...course,
        matchCount,
        isFeasible,
        pointsDiff
      };
    })
    .filter(c => c.matchCount > 0) // Only show courses with at least one subject match
    .sort((a, b) => {
      // Sort by match count first, then by points feasibility
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return b.pointsDiff - a.pointsDiff;
    });
  }, [selectedSubjects, totalPoints]);

  return (
    <div className="max-w-4xl mx-auto px-4 w-full">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Calculator */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-red-700">
              <Calculator size={24} />
              <h2 className="text-xl font-bold text-slate-900">Points Calculator</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
                <select 
                  value={currentSubject}
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                >
                  <option value="">Select Subject...</option>
                  {SUBJECTS.map(s => (
                    <option key={s} value={s} disabled={selectedSubjects.some(sel => sel.subject === s)}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Grade</label>
                <select 
                  value={currentGrade}
                  onChange={(e) => setCurrentGrade(e.target.value as Grade)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent"
                >
                  {Object.keys(GRADES).map(g => (
                    <option key={g} value={g}>{g} ({GRADES[g as Grade]})</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={addSubject}
                disabled={!currentSubject || selectedSubjects.length >= 7}
                className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Subject
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end mb-4">
                <span className="text-slate-600 font-medium">Total Points</span>
                <span className="text-3xl font-bold text-red-700">{totalPoints}</span>
              </div>
              
              <ul className="space-y-2">
                {selectedSubjects.map((s, idx) => (
                  <li key={idx} className="flex justify-between text-sm bg-slate-50 p-2 rounded">
                    <span>{s.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500">{s.grade}</span>
                      <button onClick={() => removeSubject(s.subject)} className="text-red-500 hover:text-red-700">
                        <X size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Recommended Courses</h2>
            <p className="text-slate-600">
              Based on your subjects ({selectedSubjects.map(s => s.subject).join(', ') || 'none selected'})
            </p>
          </div>

          {selectedSubjects.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Add your Leaving Cert subjects to see course recommendations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendedCourses.map(course => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase">{course.code}</span>
                        {course.points && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            course.points <= totalPoints ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {course.points} Points
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{course.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {course.relatedSubjects?.filter(s => selectedSubjects.some(sel => sel.subject === s)).map(s => (
                          <span key={s} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 flex items-center gap-1">
                            <Check size={10} /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a 
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-red-700 transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
