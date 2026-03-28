import React from 'react';
import { motion } from 'motion/react';
import { Faculty } from '../types';

interface FacultyPickerProps {
  onSelect: (faculty: Faculty) => void;
}

const faculties: { id: Faculty; name: string; shortName: string; desc: string; count: number; color: string; icon: React.ReactNode }[] = [
  {
    id: 'arts',
    name: 'Arts, Celtic Studies & Philosophy',
    shortName: 'Arts',
    desc: 'Literature, music, media, creative writing and humanities. Degrees that develop creativity, critical thinking and communication.',
    count: 5,
    color: '#7c3aed',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M5 22l2-7L19 4l5 5L8 21z" />
        <line x1="15" y1="7" x2="21" y2="13" />
        <circle cx="4.5" cy="22.5" r="1.5" fill="white" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'science',
    name: 'Science & Engineering',
    shortName: 'Science & Eng',
    desc: 'Biology, chemistry, physics, computing, engineering, robotics, nursing and data science. Analytical and technology-focused degrees.',
    count: 23,
    color: '#0369a1',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M11 4v10L4 23h20L17 14V4" />
        <line x1="11" y1="4" x2="17" y2="4" />
        <circle cx="9" cy="19" r="1.2" fill="white" stroke="none" />
        <circle cx="15" cy="21" r="1" fill="white" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'social',
    name: 'Social Sciences',
    shortName: 'Social Sciences',
    desc: 'Business, law, education, psychology, economics, social work and nursing. People-centred and professionally oriented degrees.',
    count: 27,
    color: '#15803d',
    icon: (
      <svg viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="w-7 h-7">
        <circle cx="10" cy="8" r="3.5" />
        <circle cx="19" cy="8" r="3.5" />
        <path d="M3 24c0-4.5 3.1-8 7-8" />
        <path d="M25 24c0-4.5-3.1-8-7-8" />
        <path d="M10 16c1.2-.6 2.5-1 4.5-1s3.3.4 4.5 1" />
      </svg>
    ),
  },
];

export default function FacultyPicker({ onSelect }: FacultyPickerProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Which faculty interests you?</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Choose the broad area that appeals to you most — we'll ask more specific questions from there.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {faculties.map((f, i) => (
          <motion.button
            key={f.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            onClick={() => onSelect(f.id)}
            className="text-left bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ '--focus-color': f.color } as React.CSSProperties}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              style={{ background: f.color }}
            >
              {f.icon}
            </div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 group-hover:transition-colors" style={{ color: undefined }}>
              <span className="group-hover:text-inherit" style={{ '--hover-color': f.color } as React.CSSProperties}>
                {f.name}
              </span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.desc}</p>
            <span className="text-xs font-semibold" style={{ color: f.color }}>
              {f.count} programmes →
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
