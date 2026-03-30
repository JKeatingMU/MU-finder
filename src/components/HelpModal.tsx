import { motion, AnimatePresence } from 'motion/react';
import { X, Brain, BookOpen, Compass, Heart, GitCompareArrows, LayoutGrid } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const sections = [
  {
    icon: Brain,
    color: '#6b1a2b',
    bg: '#fdf2f4',
    title: 'Personality Profile',
    steps: [
      'Choose a faculty — Arts, Science & Engineering, or Social Sciences.',
      'Answer 9–12 short statements about what you enjoy and how you think.',
      'Get a personalised strength profile and a ranked list of matching programmes.',
    ],
  },
  {
    icon: BookOpen,
    color: '#0369a1',
    bg: '#eff6ff',
    title: 'Leaving Certificate Subject Explorer',
    steps: [
      'Select the Leaving Cert subjects you are taking (or expect to take).',
      'Choose a grade for each — Higher, Ordinary, or Foundation where available.',
      'See your estimated CAO points and all 55 MU programmes sorted by achievability.',
    ],
  },
  {
    icon: Compass,
    color: '#15803d',
    bg: '#f0fdf4',
    title: 'Career Finder',
    steps: [
      'Browse or search 37 career paths across 8 groups.',
      'Select a career to see every MU programme relevant to it.',
      'Results are sorted by how closely each programme aligns with that career.',
    ],
  },
  {
    icon: LayoutGrid,
    color: '#334155',
    bg: '#f8fafc',
    title: 'Programme Directory',
    steps: [
      'Browse, search, and filter all 55 MU 2026 undergraduate programmes.',
      'Sort by CAO code, title, or points. Expand any card to read the full prospectus description.',
      'Use the faculty filter pills to narrow to one faculty, or search by title, code, or keyword.',
    ],
  },
  {
    icon: Heart,
    color: '#6b1a2b',
    bg: '#fdf2f4',
    title: 'Saving & Comparing',
    steps: [
      'Tap the ♥ on any programme card to save it. Your saved programmes are remembered even if you close the app.',
      'Click "Saved (N)" in the header or on any results screen to filter to your saved list.',
      'In the Saved view, tap the compare icon (⇄) on 2 or 3 cards, then hit "Compare →" for a side-by-side breakdown — points, strengths, related careers, and your quiz match if you took the Personality Profile.',
    ],
  },
];

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxWidth: 560, width: '100%', maxHeight: '90vh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-900">How to use MU Programme Finder</h2>
              <p className="text-xs text-slate-500 mt-0.5">Three ways to explore — pick whichever suits you</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors ml-4 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-grow px-6 py-5 space-y-5">
            {sections.map(({ icon: Icon, color, bg, title, steps }) => (
              <div key={title} className="flex gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{title}</h3>
                  <ol className="space-y-1">
                    {steps.map((step, i) => (
                      <li key={i} className="text-xs text-slate-600 leading-relaxed flex gap-2">
                        <span className="font-bold flex-shrink-0" style={{ color }}>{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}

            <div className="rounded-xl px-4 py-3 text-xs text-slate-600 leading-relaxed" style={{ background: '#f8fafc', borderLeft: '3px solid #e2e8f0' }}>
              <span className="font-semibold text-slate-700">No account needed.</span> Everything runs in your browser — no login, no personal data collected. Your saved programmes are stored on this device only.
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors text-white"
              style={{ background: '#6b1a2b' }}
            >
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
