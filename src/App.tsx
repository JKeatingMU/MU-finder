import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, HelpCircle } from 'lucide-react';
import Welcome from './components/Welcome';
import FacultyPicker from './components/FacultyPicker';
import Quiz from './components/Quiz';
import Results from './components/Results';
import SubjectExplorer from './components/SubjectExplorer';
import CareerFinder from './components/CareerFinder';
import ProgrammeDirectory from './components/ProgrammeDirectory';
import ModuleFinder from './components/ModuleFinder';
import HelpModal from './components/HelpModal';
import { facultyQuestions } from './data/questions';
import { Faculty } from './types';

type Screen = 'welcome' | 'faculty' | 'quiz' | 'results' | 'subjects' | 'careers' | 'directory' | 'modules';

function loadFavourites(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem('mu-favourites') || '[]')); }
  catch { return new Set(); }
}

export default function App() {
  const [screen, setScreen]       = useState<Screen>('welcome');
  const [faculty, setFaculty]     = useState<Faculty | null>(null);
  const [answers, setAnswers]     = useState<Record<number, number>>({});
  const [favourites, setFavourites] = useState<Set<string>>(loadFavourites);
  const [showHelp, setShowHelp]   = useState(false);

  const toggleFavourite = (id: string) => {
    setFavourites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('mu-favourites', JSON.stringify([...next]));
      return next;
    });
  };

  const handleStartQuiz      = () => setScreen('faculty');
  const handleStartSubjects  = () => setScreen('subjects');
  const handleStartCareers   = () => setScreen('careers');
  const handleOpenDirectory  = () => setScreen('directory');
  const handleOpenModules    = () => setScreen('modules');

  const handleFacultySelect = (f: Faculty) => {
    setFaculty(f);
    setAnswers({});
    setScreen('quiz');
  };

  const handleQuizComplete = (finalAnswers: Record<number, number>) => {
    setAnswers(finalAnswers);
    setScreen('results');
  };

  const handleRestart = () => {
    setAnswers({});
    setFaculty(null);
    setScreen('welcome');
  };

  const handleBackToFaculty = () => {
    setAnswers({});
    setScreen('faculty');
  };

  const currentQuestions = faculty ? facultyQuestions[faculty] : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="https://www.mu.ie" target="_blank" rel="noopener noreferrer">
              <img
                src="https://www.maynoothuniversity.ie/sites/all/themes/nuim_themes/nuim/logo_old_2.png"
                alt="Maynooth University"
                className="h-16 w-auto bg-white rounded p-1 hover:opacity-80 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </a>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />
            <button
              onClick={handleRestart}
              className="font-bold text-lg md:text-xl tracking-tight text-slate-900 hidden sm:block hover:text-[#6b1a2b] transition-colors"
            >
              MU Programme Finder 2026
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Help button — always visible */}
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Help</span>
            </button>

            {/* Favourites badge — always visible when there are favourites */}
            {favourites.size > 0 && (
              <button
                onClick={handleOpenDirectory}
                className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: '#6b1a2b' }}
                title="View saved programmes in the directory"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>{favourites.size} saved</span>
              </button>
            )}

            {(screen === 'quiz' || screen === 'results') && faculty && (
              <button
                onClick={handleBackToFaculty}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Change faculty
              </button>
            )}
            {(screen === 'subjects' || screen === 'careers' || screen === 'directory' || screen === 'modules') && (
              <button
                onClick={handleRestart}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Home
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center py-12">
        <AnimatePresence mode="wait">
          {screen === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <Welcome onStartQuiz={handleStartQuiz} onStartSubjects={handleStartSubjects} onStartCareers={handleStartCareers} onOpenDirectory={handleOpenDirectory} onOpenModules={handleOpenModules} />
            </motion.div>
          )}
          {screen === 'faculty' && (
            <motion.div key="faculty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <FacultyPicker onSelect={handleFacultySelect} />
            </motion.div>
          )}
          {screen === 'quiz' && faculty && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <Quiz questions={currentQuestions} onComplete={handleQuizComplete} />
            </motion.div>
          )}
          {screen === 'results' && faculty && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <Results
                answers={answers}
                questions={currentQuestions}
                faculty={faculty}
                onRestart={handleRestart}
                favourites={favourites}
                onToggleFavourite={toggleFavourite}
              />
            </motion.div>
          )}
          {screen === 'subjects' && (
            <motion.div key="subjects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <SubjectExplorer favourites={favourites} onToggleFavourite={toggleFavourite} />
            </motion.div>
          )}
          {screen === 'careers' && (
            <motion.div key="careers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <CareerFinder favourites={favourites} onToggleFavourite={toggleFavourite} />
            </motion.div>
          )}
          {screen === 'directory' && (
            <motion.div key="directory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <ProgrammeDirectory
                favourites={favourites}
                onToggleFavourite={toggleFavourite}
                quizAnswers={answers}
                quizQuestions={currentQuestions}
                quizFaculty={faculty}
              />
            </motion.div>
          )}
          {screen === 'modules' && (
            <motion.div key="modules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <ModuleFinder />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p className="mb-1">© {new Date().getFullYear()} Maynooth University. All rights reserved.</p>
          <p>MU Programme Finder — helping students explore their potential.</p>
        </div>
      </footer>
    </div>
  );
}
