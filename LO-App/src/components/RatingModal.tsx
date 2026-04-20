import { useState } from 'react';
import { LO } from '../App';
import { submitRating } from '../lib/supabase';

type Props = {
  lo: LO;
  previouslyRated: boolean;
  onClose: () => void;
  onSubmitted: () => void;
};

type DimState = { score: number | null; rationale: string };

const DIM_LABELS: Record<string, { label: string; description: string; scores: string[] }> = {
  d1: {
    label: 'D1 — Verb Observability',
    description: 'How observable/measurable is the action verb?',
    scores: ['0 — Unobservable (understand, know)', '1 — Weak (describe, identify)', '2 — Clear (analyse, apply)', '3 — Precise (design, critique, synthesise)'],
  },
  d4: {
    label: 'D4 — Scope',
    description: 'Is the LO appropriately scoped for a single module outcome?',
    scores: ['0 — N/A', '1 — Too broad or too narrow', '2 — Slightly broad or narrow', '3 — Appropriately scoped'],
  },
  d5: {
    label: 'D5 — Assessability',
    description: 'Can this LO be directly and fairly assessed?',
    scores: ['0 — N/A', '1 — Not directly assessable', '2 — Assessable with effort', '3 — Clearly assessable'],
  },
  d6: {
    label: 'D6 — NFQ Calibration',
    description: 'Is the cognitive demand appropriate for the NFQ level?',
    scores: ['0 — N/A', '1 — Poor NFQ calibration', '2 — Partial alignment', '3 — Well-calibrated to NFQ level'],
  },
};

const SCORE_COLORS: Record<number, string> = {
  0: 'bg-red-100 text-red-700 border-red-300',
  1: 'bg-orange-100 text-orange-700 border-orange-300',
  2: 'bg-green-100 text-green-700 border-green-300',
  3: 'bg-blue-100 text-blue-700 border-blue-300',
};

function DimRow({ dimKey, value, onChange }: {
  dimKey: string;
  value: DimState;
  onChange: (v: DimState) => void;
}) {
  const meta = DIM_LABELS[dimKey];
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="font-semibold text-gray-800 text-sm mb-0.5">{meta.label}</div>
      <div className="text-xs text-gray-500 mb-2">{meta.description}</div>
      <div className="flex flex-wrap gap-2 mb-2">
        {[0, 1, 2, 3].map(s => (
          <button
            key={s}
            onClick={() => onChange({ ...value, score: s })}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${
              value.score === s
                ? SCORE_COLORS[s]
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            {s} — {meta.scores[s].split(' — ')[1]}
          </button>
        ))}
      </div>
      <textarea
        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:border-gray-400"
        rows={2}
        placeholder="Brief rationale (optional)"
        value={value.rationale}
        onChange={e => onChange({ ...value, rationale: e.target.value })}
      />
    </div>
  );
}

export default function RatingModal({ lo, previouslyRated, onClose, onSubmitted }: Props) {
  const [dims, setDims] = useState<Record<string, DimState>>({
    d1: { score: null, rationale: '' },
    d4: { score: null, rationale: '' },
    d5: { score: null, rationale: '' },
    d6: { score: null, rationale: '' },
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allScored = Object.values(dims).every(d => d.score !== null);

  const handleSubmit = async () => {
    if (!allScored) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitRating({
        lo_id: lo.loId,
        institution: lo.institution,
        module_code: lo.moduleCode,
        lo_text: lo.loText,
        nfq_level: lo.nfqLevel,
        rater: 'anonymous',
        d1: dims.d1.score!,
        d1_rationale: dims.d1.rationale,
        d4: dims.d4.score!,
        d4_rationale: dims.d4.rationale,
        d5: dims.d5.score!,
        d5_rationale: dims.d5.rationale,
        d6: dims.d6.score!,
        d6_rationale: dims.d6.rationale,
      });
      onSubmitted();
    } catch (e: any) {
      setError(e.message ?? 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-bold text-gray-900 text-sm">
                {lo.moduleCode}{lo.moduleName ? ` — ${lo.moduleName}` : ''}
              </div>
              {lo.nfqLevel != null && (
                <div className="text-xs text-gray-400 mt-0.5">NFQ {lo.nfqLevel}</div>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0">✕</button>
          </div>
          <div className="mt-3 text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 leading-relaxed border-l-2 border-[#1e2d40]">
            {lo.loText}
          </div>
          {previouslyRated && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
              You have already rated this LO in this browser. Submitting will add a second rating.
            </div>
          )}
        </div>

        {/* Dimensions */}
        <div className="px-5 overflow-y-auto flex-1">
          {Object.keys(dims).map(key => (
            <DimRow
              key={key}
              dimKey={key}
              value={dims[key]}
              onChange={v => setDims(prev => ({ ...prev, [key]: v }))}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 shrink-0 flex items-center justify-between gap-3">
          {error && <div className="text-xs text-red-600">{error}</div>}
          {!allScored && !error && (
            <div className="text-xs text-gray-400">Score all four dimensions to submit.</div>
          )}
          {allScored && !error && <div className="flex-1" />}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!allScored || submitting}
              className="px-4 py-1.5 text-sm bg-[#1e2d40] text-white rounded font-medium disabled:opacity-40 hover:bg-[#2a3f58] transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
