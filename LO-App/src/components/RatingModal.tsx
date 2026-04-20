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

type DimMeta = {
  label: string;
  question: string;
  min: number;
  max: number;
  scores: Record<number, string>;
};

const DIM_META: Record<string, DimMeta> = {
  d1: {
    label: 'D1 — Verb Observability',
    question: 'How observable and measurable is the action verb?',
    min: 0, max: 3,
    scores: {
      0: 'Unobservable — verb cannot be assessed (e.g. understand, know, appreciate)',
      1: 'Weak — low-demand observable verb (e.g. describe, identify, list)',
      2: 'Clear — mid-demand observable verb (e.g. analyse, apply, explain)',
      3: 'Precise — high-demand observable verb (e.g. evaluate, design, synthesise)',
    },
  },
  d2: {
    label: 'D2 — Behavioural Singularity',
    question: 'How many distinct behaviours does this LO require?',
    min: 1, max: 3,
    scores: {
      1: 'Three or more behaviours — LO should be split',
      2: 'Two behaviours — compound but manageable',
      3: 'Single behaviour — clear and independently assessable',
    },
  },
  d3: {
    label: 'D3 — Student-Centredness',
    question: 'Is the LO written in a student-centred, verb-led format?',
    min: 1, max: 3,
    scores: {
      1: 'Passive or aims-format — e.g. "Students will be introduced to…"',
      2: 'Student-subject with verb — e.g. "Students will describe…"',
      3: 'Verb-first format — e.g. "Describe and evaluate…"',
    },
  },
  d4: {
    label: 'D4 — Scope',
    question: 'Is the LO appropriately scoped for a single module outcome?',
    min: 0, max: 3,
    scores: {
      0: 'Wrong scope — either a micro-task or a programme-level goal',
      1: 'Imprecise — plausible scope but too vague or too narrow',
      2: 'Module-appropriate — single assessable outcome at the right granularity',
      3: 'Precisely calibrated — matches module content and credit weight exactly',
    },
  },
  d5: {
    label: 'D5 — Assessability',
    question: 'Can a specific, valid assessment be pictured for this outcome?',
    min: 0, max: 3,
    scores: {
      0: 'No plausible assessment — describes a state, not a performance',
      1: 'Requires significant reinterpretation to assess',
      2: 'Clear assessment method implied (exam, report, presentation, portfolio)',
      3: 'LO directly signals a specific assessment approach or artefact',
    },
  },
  d6: {
    label: 'D6 — NFQ Calibration',
    question: 'Is the cognitive demand appropriate for the stated NFQ level?',
    min: 0, max: 3,
    scores: {
      0: 'Substantial mismatch — e.g. recall-only verb at NFQ 8/9',
      1: 'Mild mismatch — one level below or above expected demand',
      2: 'Consistent with NFQ level — cognitive demand is appropriate',
      3: 'Precisely calibrated — verb and content complexity match NFQ level exactly',
    },
  },
};

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Not confident — I am uncertain about this rating',
  2: 'Somewhat uncertain — some doubt remains',
  3: 'Moderately confident — reasonable basis for this rating',
  4: 'Confident — clear application of the rubric',
  5: 'Very confident — unambiguous case',
};

const SCORE_COLORS: Record<number, string> = {
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
  const thumbColor = score !== null ? (SCORE_COLORS[score] ?? SCORE_COLORS[1]) : '#d1d5db';

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="font-semibold text-gray-800 text-sm mb-0.5">{meta.label}</div>
      <div className="text-xs text-gray-500 mb-3">{meta.question}</div>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs text-gray-400 w-4 text-center shrink-0">{meta.min}</span>
        <input
          type="range"
          min={meta.min}
          max={meta.max}
          step={1}
          value={score ?? meta.min}
          onChange={e => onChange({ ...value, score: Number(e.target.value) })}
          onClick={() => { if (score === null) onChange({ ...value, score: meta.min }); }}
          className="flex-1"
          style={{ '--slider-color': thumbColor } as React.CSSProperties}
        />
        <span className="text-xs text-gray-400 w-4 text-center shrink-0">{meta.max}</span>
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 transition-colors"
          style={{ background: thumbColor }}
        >
          {score !== null ? score : '·'}
        </span>
      </div>

      <div
        className="text-xs rounded px-3 py-2 mb-2 min-h-[32px] transition-all"
        style={{
          background: score !== null ? `${thumbColor}18` : '#f9fafb',
          borderLeft: `3px solid ${score !== null ? thumbColor : '#e5e7eb'}`,
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

const DIM_ORDER = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];

export default function RatingModal({ lo, previouslyRated, onClose, onSubmitted }: Props) {
  const [dims, setDims] = useState<Record<string, DimState>>(
    Object.fromEntries(DIM_ORDER.map(k => [k, { score: null, rationale: '' }]))
  );
  const [confidence, setConfidence] = useState<number>(3);
  const [descriptorOpen, setDescriptorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allScored = DIM_ORDER.every(k => dims[k].score !== null);

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
        d1: dims.d1.score!, d1_rationale: dims.d1.rationale,
        d2: dims.d2.score!, d2_rationale: dims.d2.rationale,
        d3: dims.d3.score!, d3_rationale: dims.d3.rationale,
        d4: dims.d4.score!, d4_rationale: dims.d4.rationale,
        d5: dims.d5.score!, d5_rationale: dims.d5.rationale,
        d6: dims.d6.score!, d6_rationale: dims.d6.rationale,
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
              <div className="text-xs text-gray-400 mt-0.5">
                {lo.nfqLevel != null ? `NFQ ${lo.nfqLevel} · ` : ''}Anonymous submission
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0">✕</button>
          </div>

          {/* LO text */}
          <div className="mt-3 text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 leading-relaxed border-l-2 border-[#1e2d40]">
            {lo.loText}
          </div>

          {/* Collapsible module descriptor */}
          {lo.moduleContent && (
            <div className="mt-2">
              <button
                onClick={() => setDescriptorOpen(o => !o)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <span>{descriptorOpen ? '▲' : '▼'}</span>
                <span>{descriptorOpen ? 'Hide' : 'Show'} module descriptor</span>
              </button>
              {descriptorOpen && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2 leading-relaxed max-h-32 overflow-y-auto">
                  {lo.moduleContent}
                </div>
              )}
            </div>
          )}

          {previouslyRated && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
              You have already rated this LO in this browser. Submitting will add a second rating.
            </div>
          )}
        </div>

        {/* Dimensions */}
        <div className="px-5 overflow-y-auto flex-1">
          {DIM_ORDER.map(key => (
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
              How confident are you in the scores above? This is methodological metadata — not personal information.
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
                className="flex-1"
                style={{ '--slider-color': '#1e2d40' } as React.CSSProperties}
              />
              <span className="text-xs text-gray-400 w-4 text-center shrink-0">5</span>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 bg-[#1e2d40]">
                {confidence}
              </span>
            </div>
            <div className="text-xs rounded px-3 py-2 text-gray-600" style={{ borderLeft: '3px solid #1e2d40', background: '#1e2d4010' }}>
              {CONFIDENCE_LABELS[confidence]}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 shrink-0 flex items-center justify-between gap-3">
          {error && <div className="text-xs text-red-600">{error}</div>}
          {!allScored && !error && (
            <div className="text-xs text-gray-400">Score all six dimensions to submit.</div>
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
