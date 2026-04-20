import { useState } from 'react';
import { LO } from '../App';
import RatingModal from './RatingModal';

type LOCardProps = {
  lo: LO;
};

const TIER_COLORS: Record<number, string> = {
  0: 'bg-[#dc3545] text-white',
  1: 'bg-[#fd7e14] text-white',
  2: 'bg-[#28a745] text-white',
  3: 'bg-[#007bff] text-white',
};

const getD1Tooltip = (tier: number) => {
  switch (tier) {
    case 0: return "D1 Tier 0: Unobservable (e.g. understand, know, appreciate)";
    case 1: return "D1 Tier 1: Weak (e.g. describe, identify, list)";
    case 2: return "D1 Tier 2: Clear (e.g. analyse, evaluate, apply)";
    case 3: return "D1 Tier 3: Precise (e.g. design, critique, synthesise)";
    default: return "D1: Verb Observability";
  }
};

const getD2Tooltip = (score: number) => {
  switch (score) {
    case 3: return "D2 Score 3: Single behaviour — clear and assessable";
    case 2: return "D2 Score 2: Two behaviours — compound but manageable";
    case 1: return "D2 Score 1: Three or more behaviours — should be split";
    default: return "D2: Behavioural Singularity";
  }
};

const getD3Tooltip = (score: number) => {
  switch (score) {
    case 3: return "D3 Score 3: Verb-first format";
    case 2: return "D3 Score 2: Student-subject with verb";
    case 1: return "D3 Score 1: Passive or aims-format";
    default: return "D3: Student-Centredness";
  }
};

const getD4Tooltip = (score: number) => {
  switch (score) {
    case 3: return "D4 Score 3: Appropriately scoped";
    case 2: return "D4 Score 2: Slightly broad or narrow";
    case 1: return "D4 Score 1: Too broad or too narrow";
    default: return "D4: Scope (AI)";
  }
};

const getD5Tooltip = (score: number) => {
  switch (score) {
    case 3: return "D5 Score 3: Clearly assessable";
    case 2: return "D5 Score 2: Assessable with effort";
    case 1: return "D5 Score 1: Not directly assessable";
    default: return "D5: Assessability (AI)";
  }
};

const getD6Tooltip = (score: number) => {
  switch (score) {
    case 3: return "D6 Score 3: Well-calibrated to NFQ level";
    case 2: return "D6 Score 2: Partial NFQ alignment";
    case 1: return "D6 Score 1: Poor NFQ calibration";
    default: return "D6: NFQ Calibration (AI)";
  }
};

type CellData = { score: number; note?: string; rationale?: string } | null;

const SCORE_COLORS: Record<number, string> = {
  0: 'bg-red-100 text-red-700',
  1: 'bg-orange-100 text-orange-700',
  2: 'bg-green-100 text-green-700',
  3: 'bg-blue-100 text-blue-700',
};

function ScoreCell({ data }: { data: CellData }) {
  if (!data) return <td className="py-1.5 px-3 text-center text-gray-300 border-l border-gray-200">—</td>;
  return (
    <td className="py-1.5 px-3 border-l border-gray-200">
      <div className="flex flex-col items-center gap-0.5">
        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${SCORE_COLORS[data.score] ?? 'bg-gray-100 text-gray-600'}`}>
          {data.score}/3{data.note ? ` · ${data.note}` : ''}
        </span>
        {data.rationale && (
          <span className="text-gray-500 text-center leading-tight">{data.rationale}</span>
        )}
      </div>
    </td>
  );
}

function StreamRow({ label, nlp, ai, human }: {
  label: string;
  nlp: CellData;
  ai: CellData;
  human: CellData;
}) {
  return (
    <tr>
      <td className="py-1.5 pr-3 text-gray-600 font-medium">{label}</td>
      <ScoreCell data={nlp} />
      <ScoreCell data={ai} />
      <ScoreCell data={human} />
    </tr>
  );
}

const SCORE_LABEL: Record<number, string> = { 0: '0', 1: '1', 2: '2', 3: '3' };
const TIER_LABEL: Record<number, string> = { 0: 'Tier 0 — Unobservable', 1: 'Tier 1 — Weak', 2: 'Tier 2 — Clear', 3: 'Tier 3 — Precise' };

function scoreChip(score: number, note?: string): string {
  const colors: Record<number, string> = { 0: '#dc3545', 1: '#fd7e14', 2: '#28a745', 3: '#007bff' };
  const bg = colors[score] ?? '#888';
  const label = note ? `${SCORE_LABEL[score]} · ${note}` : SCORE_LABEL[score];
  return `<span style="background:${bg};color:#fff;padding:1px 6px;border-radius:3px;font-weight:bold;font-size:11px">${label}</span>`;
}

function tableRow(label: string, nlp: string, ai: string, human: string): string {
  return `<tr style="border-top:1px solid #e5e7eb">
    <td style="padding:5px 10px 5px 0;font-weight:600;color:#4b5563;white-space:nowrap">${label}</td>
    <td style="padding:5px 10px;text-align:center;border-left:1px solid #e5e7eb">${nlp}</td>
    <td style="padding:5px 10px;text-align:center;border-left:1px solid #e5e7eb">${ai}</td>
    <td style="padding:5px 10px;text-align:center;border-left:1px solid #e5e7eb">${human}</td>
  </tr>`;
}

function cellHtml(data: { score: number; note?: string; rationale?: string } | null): string {
  if (!data) return '<span style="color:#d1d5db">—</span>';
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
    ${scoreChip(data.score, data.note)}
    ${data.rationale ? `<span style="font-size:10px;color:#6b7280;text-align:center">${data.rationale}</span>` : ''}
  </div>`;
}

function printLO(lo: import('../App').LO) {
  const d1nlp = cellHtml({ score: lo.d1.tier, note: lo.d1.verb, rationale: lo.d1.rationale });
  const d1ai = lo.llm?.d1_verify ? cellHtml({ score: lo.llm.d1_verify.score, note: lo.llm.d1_verify.verb ?? undefined, rationale: lo.llm.d1_verify.rationale }) : cellHtml(null);
  const d1h = lo.human?.d1 ? cellHtml(lo.human.d1) : cellHtml(null);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${lo.moduleCode} LO${lo.loIndex + 1} — Irish HE LO Quality Browser</title>
<style>
  @page { size: A4; margin: 1.5cm; }
  body { font-family: system-ui, sans-serif; font-size: 13px; color: #1f2937; margin: 32px; max-width: 800px; }
  h1 { font-size: 15px; font-weight: 700; margin: 0 0 2px; }
  .meta { font-size: 11px; color: #6b7280; margin-bottom: 16px; }
  .lo-text { font-size: 16px; line-height: 1.6; margin: 12px 0 16px; padding: 12px; background: #f9fafb; border-left: 3px solid #1e2d40; border-radius: 3px; }
  .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin: 14px 0 6px; }
  .table-wrap { border: 1px solid #d1d5db; border-radius: 4px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { padding: 6px 10px; font-weight: 700; color: #4b5563; background: #f9fafb; border-bottom: 1px solid #d1d5db; }
  th:not(:first-child) { border-left: 1px solid #d1d5db; text-align: center; }
  .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  .print-btn { display: inline-block; margin-bottom: 20px; padding: 6px 14px; background: #1e2d40; color: #fff; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; }
  @media print { .print-btn { display: none; } body { margin: 0; } }
</style>
</head><body>
<button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
<h1>${lo.moduleCode}${lo.moduleName ? ` — ${lo.moduleName}` : ''}</h1>
<div class="meta">
  ${[lo.departmentName, lo.facultyName].filter(Boolean).join(' · ')}
  ${lo.nfqLevel != null ? ` &nbsp;·&nbsp; NFQ ${lo.nfqLevel}` : ''}
  ${lo.credits != null ? ` &nbsp;·&nbsp; ${lo.credits} credits` : ''}
  &nbsp;·&nbsp; LO ${lo.loIndex + 1} of module &nbsp;·&nbsp; ${lo.institution}
</div>

<div class="lo-text">${lo.loText}</div>

${lo.moduleContent ? `<div class="section-label">Module Descriptor</div>
<p style="color:#374151;line-height:1.5;margin:0 0 12px">${lo.moduleContent}</p>` : ''}

<div class="section-label">Evaluation Streams</div>
<div class="table-wrap">
<table>
  <thead><tr>
    <th style="text-align:left;width:140px">Dimension</th>
    <th>NLP <span style="font-weight:400;color:#9ca3af">(measured)</span></th>
    <th>AI <span style="font-weight:400;color:#9ca3af">(evaluated)</span></th>
    <th>Human <span style="font-weight:400;color:#9ca3af">(evaluated)</span></th>
  </tr></thead>
  <tbody>
    ${tableRow('D1 Verb observability', d1nlp, d1ai, d1h)}
    ${tableRow('D2 Singularity', cellHtml({ score: lo.d2.score, rationale: lo.d2.rationale }), cellHtml(null), cellHtml(null))}
    ${tableRow('D3 Student-centred', cellHtml({ score: lo.d3.score, rationale: lo.d3.rationale }), cellHtml(null), cellHtml(null))}
    ${tableRow('D4 Scope', cellHtml(null), lo.llm?.d4 ? cellHtml(lo.llm.d4) : cellHtml(null), lo.human?.d4 ? cellHtml(lo.human.d4) : cellHtml(null))}
    ${tableRow('D5 Assessability', cellHtml(null), lo.llm?.d5 ? cellHtml(lo.llm.d5) : cellHtml(null), lo.human?.d5 ? cellHtml(lo.human.d5) : cellHtml(null))}
    ${tableRow('D6 NFQ calibration', cellHtml(null), lo.llm?.d6 ? cellHtml(lo.llm.d6) : cellHtml(null), lo.human?.d6 ? cellHtml(lo.human.d6) : cellHtml(null))}
  </tbody>
</table>
</div>
${lo.llm?.model ? `<div style="margin-top:4px;font-size:10px;color:#9ca3af">AI model: ${lo.llm.model}</div>` : ''}

<div class="footer">Irish HE Learning Outcomes Quality Study · jkeatingmu.github.io/MU-finder/slo-study/ · Keating, J. (2025)</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

const RATED_KEY = 'lo-rated-ids';

function getRated(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(RATED_KEY) ?? '[]')); }
  catch { return new Set(); }
}
function markRated(loId: string) {
  const rated = getRated();
  rated.add(loId);
  localStorage.setItem(RATED_KEY, JSON.stringify([...rated]));
}

export default function LOCard({ lo }: LOCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [previouslyRated, setPreviouslyRated] = useState(() => getRated().has(lo.loId));

  const handleRateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRating(true);
  };

  const handleSubmitted = () => {
    markRated(lo.loId);
    setPreviouslyRated(true);
    setShowRating(false);
  };

  const tierColor = TIER_COLORS[lo.d1.tier] || 'bg-gray-500 text-white';

  return (
    <div 
      className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="font-bold text-gray-900">{lo.moduleCode}</span>
            {lo.moduleName && (
              <span className="font-normal text-gray-700"> — {lo.moduleName}</span>
            )}
            {(lo.facultyName || lo.departmentName) && (
              <div className="text-xs text-gray-400 mt-0.5">
                {[lo.departmentName, lo.facultyName].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
          <div className="flex gap-2 text-xs font-medium shrink-0 ml-4">
            {lo.nfqLevel != null && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200">
                NFQ {lo.nfqLevel}
              </span>
            )}
            {lo.credits != null && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200">
                {lo.credits} Credits
              </span>
            )}
          </div>
        </div>

        {/* LO Text */}
        <div className="text-lg text-gray-800 mb-4 leading-relaxed">
          {lo.loText}
        </div>

        {/* Score Row */}
        <div className="flex flex-wrap items-center gap-3 text-sm mt-3">
          <div 
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-2 cursor-help ${tierColor}`}
            title={getD1Tooltip(lo.d1.tier)}
          >
            <span>D1 · Tier {lo.d1.tier}</span>
            <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
            <span className="capitalize">{lo.d1.verb}</span>
          </div>
          
          <div 
            className="px-3 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 cursor-help"
            title={getD2Tooltip(lo.d2.score)}
          >
            D2: <span className="font-bold">{lo.d2.score}</span>
          </div>
          
          <div
            className="px-3 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 cursor-help"
            title={getD3Tooltip(lo.d3.score)}
          >
            D3: <span className="font-bold">{lo.d3.score}</span>
          </div>

          {lo.llm?.d4 && (
            <div
              className="px-3 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 cursor-help"
              title={getD4Tooltip(lo.llm.d4.score)}
            >
              D4: <span className="font-bold">{lo.llm.d4.score}</span>
              <span className="text-gray-400 font-normal text-xs ml-1">AI</span>
            </div>
          )}
          {lo.llm?.d5 && (
            <div
              className="px-3 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 cursor-help"
              title={getD5Tooltip(lo.llm.d5.score)}
            >
              D5: <span className="font-bold">{lo.llm.d5.score}</span>
              <span className="text-gray-400 font-normal text-xs ml-1">AI</span>
            </div>
          )}
          {lo.llm?.d6 && (
            <div
              className="px-3 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200 cursor-help"
              title={getD6Tooltip(lo.llm.d6.score)}
            >
              D6: <span className="font-bold">{lo.llm.d6.score}</span>
              <span className="text-gray-400 font-normal text-xs ml-1">AI</span>
            </div>
          )}

          <div
            className="ml-auto px-3 py-1 bg-[#1e2d40] text-white rounded font-bold cursor-help"
            title="Composite Score: Sum of D1+D2+D3 (0-9). 9 = single, verb-first, precisely observable."
          >
            Composite: {lo.compositeScore}
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            {expanded ? '▲ less' : '▼ details'}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-700 space-y-4">

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleRateClick}
              className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                previouslyRated
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-[#1e2d40] text-white border-transparent hover:bg-[#2a3f58]'
              }`}
            >
              {previouslyRated ? '✓ Rated — rate again?' : 'Rate this LO'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); printLO(lo); }}
              className="px-3 py-1 text-xs text-gray-500 border border-gray-300 rounded hover:bg-white hover:text-gray-700 transition-colors"
            >
              Print / Export PDF
            </button>
          </div>

          {/* Module Descriptor */}
          {lo.moduleContent && (
            <div>
              <div className="font-semibold text-gray-500 uppercase tracking-wider text-xs mb-1">Module Descriptor</div>
              <p className="text-gray-700 leading-relaxed">{lo.moduleContent}</p>
            </div>
          )}

          {/* Evaluation Streams */}
          <div className={lo.moduleContent ? 'pt-2 border-t border-gray-200' : ''}>
            <div className="font-semibold text-gray-500 uppercase tracking-wider text-xs mb-2">Evaluation Streams</div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="py-1 pr-3 text-gray-500 font-semibold w-36">Dimension</th>
                  <th className="py-1 px-3 text-center text-gray-700 font-semibold border-l border-gray-200">
                    NLP <span className="text-gray-400 font-normal">(measured)</span>
                  </th>
                  <th className="py-1 px-3 text-center text-gray-700 font-semibold border-l border-gray-200">
                    AI <span className="text-gray-400 font-normal">(evaluated)</span>
                  </th>
                  <th className="py-1 px-3 text-center text-gray-700 font-semibold border-l border-gray-200">
                    Human <span className="text-gray-400 font-normal">(evaluated)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <StreamRow
                  label="D1 Verb observability"
                  nlp={{ score: lo.d1.tier, note: lo.d1.verb, rationale: lo.d1.rationale }}
                  ai={lo.llm?.d1_verify ? { score: lo.llm.d1_verify.score, note: lo.llm.d1_verify.verb ?? undefined, rationale: lo.llm.d1_verify.rationale } : null}
                  human={lo.human?.d1 ? { score: lo.human.d1.score, rationale: lo.human.d1.rationale } : null}
                />
                <StreamRow
                  label="D2 Singularity"
                  nlp={{ score: lo.d2.score, rationale: lo.d2.rationale }}
                  ai={null}
                  human={null}
                />
                <StreamRow
                  label="D3 Student-centred"
                  nlp={{ score: lo.d3.score, rationale: lo.d3.rationale }}
                  ai={null}
                  human={null}
                />
                <StreamRow
                  label="D4 Scope"
                  nlp={null}
                  ai={lo.llm?.d4 ? { score: lo.llm.d4.score, rationale: lo.llm.d4.rationale } : null}
                  human={lo.human?.d4 ? { score: lo.human.d4.score, rationale: lo.human.d4.rationale } : null}
                />
                <StreamRow
                  label="D5 Assessability"
                  nlp={null}
                  ai={lo.llm?.d5 ? { score: lo.llm.d5.score, rationale: lo.llm.d5.rationale } : null}
                  human={lo.human?.d5 ? { score: lo.human.d5.score, rationale: lo.human.d5.rationale } : null}
                />
                <StreamRow
                  label="D6 NFQ calibration"
                  nlp={null}
                  ai={lo.llm?.d6 ? { score: lo.llm.d6.score, rationale: lo.llm.d6.rationale } : null}
                  human={lo.human?.d6 ? { score: lo.human.d6.score, rationale: lo.human.d6.rationale } : null}
                />
              </tbody>
            </table>
            {lo.llm?.model && (
              <div className="mt-1 text-gray-400 text-xs">AI model: {lo.llm.model}</div>
            )}
          </div>

        </div>
      )}

      {/* Rating modal */}
      {showRating && (
        <RatingModal
          lo={lo}
          previouslyRated={previouslyRated}
          onClose={() => setShowRating(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </div>
  );
}
