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

const DIM_META: Record<string, { label: string; question: string; scores: string[] }> = {
  d1: {
    label: 'D1 — Verb Observability',
    question: 'How observable and measurable is the action verb?',
    scores: [
      'Unobservable — verb cannot be assessed (e.g. understand, know, appreciate)',
      'Weak — low-demand observable verb (e.g. describe, identify, list)',
      'Clear — mid-demand observable verb (e.g. analyse, apply, explain)',
      'Precise — high-demand observable verb (e.g. evaluate, design, synthesise)',
    ],
  },
  d4: {
    label: 'D4 — Scope',
    question: 'Is the LO appropriately scoped for a single module outcome?',
    scores: [
      'Wrong scope — either a micro-task or a programme-level goal',
      'Imprecise — plausible scope but too vague or too narrow',
      'Module-appropriate — single assessable outcome at the right granularity',
      'Precisely calibrated — matches module content and credit weight exactly',
    ],
  },
  d5: {
    label: 'D5 — Assessability',
    question: 'Can a specific, valid assessment be pictured for this outcome?',
    scores: [
      'No plausible assessment — describes a state, not a performance',
      'Requires significant reinterpretation to assess',
      'Clear assessment method implied (exam, report, presentation, portfolio)',
      'LO directly signals a specific assessment approach or artefact',
    ],
  },
  d6: {
    label: 'D6 — NFQ Calibration',
    question: 'Is the cognitive demand appropriate for the stated NFQ level?',
    scores: [
      'Substantial mismatch — e.g. recall-only verb at NFQ 8/9',
      'Mild mismatch — one level below or above expected demand',
      'Consistent with NFQ level — cognitive demand is appropriate',
      'Precisely calibrated — verb and content complexity match NFQ level exactly',
    ],
  },
};

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Not confident — I am uncertain about this rating',
  2: 'Somewhat uncertain — some doubt remains',
  3: 'Moderately confident — reasonable basis for this rating',
  4: 'Confident — clear application of the rubric',
  5: 'Very confident — unambiguous case',
};

const SLIDER_TRACK_COLORS: Record<number, string> = {
  0: '#dc3545',
  1: '#fd7e14',
  2: '#28a745',
  3: '#007bff',
};

function DimSlider({ dimKey, value, onChange }: {
  dimKey: string;
  value: DimState;
  onChange: (v: DimState) => void;
}) {
  const meta = DIM_META[dimKey];
  const score = value.score;
  const trackColor = score !== null ? SLIDER_TRACK_COLORS[score] : '#d1d5db';

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="font-semibold text-gray-800 text-sm mb-0.5">{meta.label}</div>
      <div className="text-xs text-gray-500 mb-3">{meta.question}</div>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs text-gray-400 w-4 text-center shrink-0">0</span>
        <input
          type="range"
          min={0}
          max={3}
          step={1}
          value={score ?? 0}
          onChange={e => onChange({ ...value, score: Number(e.target.value) })}
          onClick={() => { if (score === null) onChange({ ...value, score: 0 }); }}
          className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: trackColor }}
        />
        <span className="text-xs text-gray-400 w-4 text-center shrink-0">3</span>
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 transition-colors"
          style={{ background: score !== null ? trackColor : '#d1d5db' }}
        >
          {score !== null ? score : '·'}
        </span>
      </div>

      <div
        className="text-xs rounded px-3 py-2 mb-2 min-h-[32px] transition-all"
        style={{
          background: score !== null ? `${trackColor}15` : '#f9fafb',
          borderLeft: `3px solid ${score !== null ? trackColor : '#e5e7eb'}`,
          color: score !== null ? '#374151' : '#9ca3af',
        }}
      >
        {score !== null ? meta.scores[score] : 'Move the slider to select a score'}
      </div>

      <textarea
        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400 mt-1"
        rows={2}
        placeholder="Rationale (optional) — do not include personal information"
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
  const [confidence, setConfidence] = useState<number>(3);
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
        confidence,
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
                <div className="text-xs text-gray-400 mt-0.5">NFQ {lo.nfqLevel} · Anonymous submission</div>
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
            <DimSlider
              key={key}
              dimKey={key}
              value={dims[key]}
              onChange={v => setDims(prev => ({ ...prev, [key]: v }))}
            />
          ))}

          {/* Confidence */}
          <div className="py-4">
            <div className="font-semibold text-gray-800 text-sm mb-0.5">Confidence in these ratings</div>
            <div className="text-xs text-gray-500 mb-3">
              How confident are you in the scores you have given above? This is methodological metadata — it is not personal information.
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-400 w-4 text-center shrink-0">1</span>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={confidence}
                onChange={e => setConfidence(Number(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: '#1e2d40' }}
              />
              <span className="text-xs text-gray-400 w-4 text-center shrink-0">5</span>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-[#1e2d40]">
                {confidence}
              </span>
            </div>
            <div className="text-xs rounded px-3 py-2 bg-gray-50 border-l-3 border-gray-300 text-gray-600"
              style={{ borderLeft: '3px solid #1e2d40' }}>
              {CONFIDENCE_LABELS[confidence]}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 shrink-0 flex items-center justify-between gap-3">
          {error && <div className="text-xs text-red-600">{error}</div>}
          {!allScored && !error && (
            <div className="text-xs text-gray-400">Move all four dimension sliders to submit.</div>
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
