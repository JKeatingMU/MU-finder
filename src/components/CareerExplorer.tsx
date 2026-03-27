import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { courses } from '../data/courses';
import { ArrowLeft, ExternalLink, Briefcase, Search, Lightbulb } from 'lucide-react';

interface CareerExplorerProps {
  onBack: () => void;
}

export default function CareerExplorer({ onBack }: CareerExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'careers' | 'skills'>('all');

  // Extract all unique careers and skills from database
  const allItems = useMemo(() => {
    const careers = new Set<string>();
    const skills = new Set<string>();

    courses.forEach(c => {
      c.careers?.forEach(career => careers.add(career));
      c.skills?.forEach(skill => skills.add(skill));
    });

    return {
      careers: Array.from(careers).sort(),
      skills: Array.from(skills).sort()
    };
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return [];

    const lowerTerm = searchTerm.toLowerCase();
    
    return courses.filter(course => {
      const matchesCareer = course.careers?.some(c => c.toLowerCase().includes(lowerTerm));
      const matchesSkill = course.skills?.some(s => s.toLowerCase().includes(lowerTerm));
      const matchesTitle = course.title.toLowerCase().includes(lowerTerm);

      if (selectedFilter === 'careers') return matchesCareer;
      if (selectedFilter === 'skills') return matchesSkill;
      return matchesCareer || matchesSkill || matchesTitle;
    });
  }, [searchTerm, selectedFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 w-full">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </button>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Explore by Career & Skills</h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Know what you want to be or what skills you want to learn? Search below to find the perfect course.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search for a career (e.g. 'Teacher') or skill (e.g. 'Coding')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-red-700 focus:border-transparent text-lg"
          />
        </div>
        
        {/* Quick Tags */}
        {!searchTerm && (
          <div className="mt-6">
            <p className="text-sm text-slate-500 mb-3 text-center">Popular Searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Software Engineer', 'Teacher', 'Psychologist', 'Data Analysis', 'Management', 'Design'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-red-300 hover:text-red-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {searchTerm && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              {filteredCourses.length} Courses Found
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map(course => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase mb-1 block">{course.code}</span>
                    <h4 className="text-xl font-bold text-slate-900">{course.title}</h4>
                  </div>
                  <a 
                    href={course.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-red-700"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Matched Careers */}
                  {course.careers?.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) && (
                    <div className="flex items-start gap-2">
                      <Briefcase size={16} className="text-slate-400 mt-1 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {course.careers.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                          <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Skills */}
                  {course.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) && (
                    <div className="flex items-start gap-2">
                      <Lightbulb size={16} className="text-slate-400 mt-1 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {course.skills.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                          <span key={s} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>No courses found matching "{searchTerm}". Try a different keyword.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
