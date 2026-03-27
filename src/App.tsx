/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Welcome from './components/Welcome';
import Quiz from './components/Quiz';
import Results from './components/Results';
import AboutModal from './components/AboutModal';
import SubjectExplorer from './components/SubjectExplorer';
import CareerExplorer from './components/CareerExplorer';
import { questionSets, QuestionSetId } from './data/questions';
import { Info, ChevronDown } from 'lucide-react';

type Screen = 'welcome' | 'quiz' | 'results' | 'subjects' | 'careers';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<QuestionSetId>('activity');

  const handleStartQuiz = () => {
    setScreen('quiz');
  };

  const handleStartSubjects = () => {
    setScreen('subjects');
  };

  const handleStartCareers = () => {
    setScreen('careers');
  };

  const handleQuizComplete = (finalAnswers: Record<number, number>) => {
    setAnswers(finalAnswers);
    setScreen('results');
  };

  const handleRestart = () => {
    setAnswers({});
    setScreen('welcome');
  };

  const currentQuestions = questionSets[selectedSetId].questions;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setScreen('welcome')}
          >
            <img 
              src="https://www.maynoothuniversity.ie/sites/all/themes/nuim_themes/nuim/logo_old_2.png" 
              alt="Maynooth University Logo" 
              className="h-12 w-auto"
              referrerPolicy="no-referrer"
            />
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 hidden sm:block">
              Your Future with Maynooth University
            </span>
          </div>
          <nav className="flex gap-4 text-sm font-medium text-slate-600 items-center">
            {/* Assessment Type Dropdown */}
            <div className="relative hidden md:block">
              <select
                value={selectedSetId}
                onChange={(e) => setSelectedSetId(e.target.value as QuestionSetId)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent cursor-pointer hover:bg-slate-100 transition-colors"
                aria-label="Select Assessment Type"
              >
                {Object.values(questionSets).map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown size={14} />
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

            <button 
              onClick={() => setIsAboutOpen(true)}
              className="flex items-center gap-2 hover:text-red-700 transition-colors"
            >
              <Info size={18} />
              <span className="hidden md:inline">Methodology</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-12">
        <AnimatePresence mode="wait">
          {screen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Welcome 
                onStartQuiz={handleStartQuiz}
                onStartSubjects={handleStartSubjects}
                onStartCareers={handleStartCareers}
              />
            </motion.div>
          )}

          {screen === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Quiz questions={currentQuestions} onComplete={handleQuizComplete} />
            </motion.div>
          )}

          {screen === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Results 
                answers={answers} 
                questions={currentQuestions} 
                onRestart={handleRestart} 
              />
            </motion.div>
          )}

          {screen === 'subjects' && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <SubjectExplorer onBack={handleRestart} />
            </motion.div>
          )}

          {screen === 'careers' && (
            <motion.div
              key="careers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <CareerExplorer onBack={handleRestart} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p className="mb-2">© {new Date().getFullYear()} Maynooth University. All rights reserved.</p>
          <p>Your Future with Maynooth University — Designed to help students explore their potential.</p>
        </div>
      </footer>
    </div>
  );
}

