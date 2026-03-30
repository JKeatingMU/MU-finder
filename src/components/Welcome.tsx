import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Brain, BookOpen, Compass, X, HelpCircle } from 'lucide-react';

interface WelcomeProps {
  onStartQuiz: () => void;
  onStartSubjects: () => void;
  onStartCareers: () => void;
  onOpenDirectory: () => void;
  onOpenModules: () => void;
}

const pathways = [
  {
    icon: Brain,
    title: 'Personality Profile',
    description: 'Answer a short quiz about your interests and strengths. We match you with the programmes that suit you best.',
    cta: 'Start Assessment',
    color: '#6b1a2b',
    bg: '#fdf2f4',
    key: 'quiz' as const,
  },
  {
    icon: BookOpen,
    title: 'Leaving Certificate Subject Explorer',
    description: 'Enter your Leaving Cert subjects and expected grades. We calculate your CAO points and show all programmes you can achieve.',
    cta: 'Enter My Subjects',
    color: '#0369a1',
    bg: '#eff6ff',
    key: 'subjects' as const,
  },
  {
    icon: Compass,
    title: 'Career Finder',
    description: 'Know what you want to become? Browse by career path and discover the MU degree that will get you there.',
    cta: 'Find My Career',
    color: '#15803d',
    bg: '#f0fdf4',
    key: 'careers' as const,
  },
];

function useFirstVisitTip() {
  const key = 'mu-help-seen';
  const [visible, setVisible] = useState(() => !localStorage.getItem(key));
  const dismiss = () => { localStorage.setItem(key, '1'); setVisible(false); };
  return { visible, dismiss };
}

export default function Welcome({ onStartQuiz, onStartSubjects, onStartCareers, onOpenDirectory, onOpenModules }: WelcomeProps) {
  const handlers = { quiz: onStartQuiz, subjects: onStartSubjects, careers: onStartCareers };
  const tip = useFirstVisitTip();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
          Find your place at{' '}
          <span style={{ color: '#6b1a2b' }}>Maynooth University</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Three ways to explore 55 undergraduate programmes across all faculties.
        </p>
      </motion.div>

      <AnimatePresence>
        {tip.visible && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-6 text-sm"
            style={{ background: '#fdf2f4', border: '1px solid #f5c6ce' }}
          >
            <div className="flex items-center gap-2 text-slate-700">
              <HelpCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#6b1a2b' }} />
              <span>First time here? The <strong>Help</strong> button at the top right explains everything.</span>
            </div>
            <button onClick={tip.dismiss} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0" title="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {pathways.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.5 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group flex flex-col"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:scale-110 transition-transform"
                style={{ background: p.bg }}
              >
                <Icon size={28} style={{ color: p.color }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{p.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{p.description}</p>
              <button
                onClick={handlers[p.key]}
                className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: p.color }}
              >
                {p.cta} <ArrowRight size={18} />
              </button>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 text-sm text-slate-400"
      >
        Or jump right into{' '}
        <button
          onClick={onOpenDirectory}
          className="font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
          style={{ color: '#6b1a2b' }}
        >
          our Programmes Directory
        </button>
        {' '}or browse{' '}
        <button
          onClick={onOpenModules}
          className="font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
          style={{ color: '#6b1a2b' }}
        >
          our Module Catalogue
        </button>
      </motion.p>
    </div>
  );
}
