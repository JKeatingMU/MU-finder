import { motion } from 'motion/react';
import { ArrowRight, Calculator, Briefcase, Brain } from 'lucide-react';

interface WelcomeProps {
  onStartQuiz: () => void;
  onStartSubjects: () => void;
  onStartCareers: () => void;
}

export default function Welcome({ 
  onStartQuiz, 
  onStartSubjects, 
  onStartCareers
}: WelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
          Your Science and Engineering Future begins with <span className="text-red-700">Maynooth University</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
          Explore your potential through three unique pathways. Whether you follow your heart, your grades, or your ambition — we have a course for you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Pathway 1: Personality Quiz */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-red-100 transition-all group flex flex-col"
        >
          <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 text-red-700 mx-auto group-hover:scale-110 transition-transform">
            <Brain size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Personality Profile</h3>
          <p className="text-slate-600 mb-6 flex-grow">
            Take our psychometric assessment to find courses that match your natural strengths and interests.
          </p>
          
          <button
            onClick={onStartQuiz}
            className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 mt-auto min-h-[64px] leading-tight"
          >
            Start Assessment <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* Pathway 2: Subject Explorer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-700 mx-auto group-hover:scale-110 transition-transform">
            <Calculator size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Subject Explorer</h3>
          <p className="text-slate-600 mb-6 flex-grow">
            Enter your Leaving Cert subjects and expected grades to calculate your points and find matching courses.
          </p>
          <div className="mt-auto">
            <button
              onClick={onStartSubjects}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[64px] leading-tight"
            >
              Calculate Points <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Pathway 3: Career Explorer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all group flex flex-col"
        >
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-700 mx-auto group-hover:scale-110 transition-transform">
            <Briefcase size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Career Finder</h3>
          <p className="text-slate-600 mb-6 flex-grow">
            Know what you want to be? Search for specific careers or skills to discover the degree that gets you there.
          </p>
          <div className="mt-auto">
            <button
              onClick={onStartCareers}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[64px] leading-tight"
            >
              Search Careers <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
