import { useState } from 'react';
import { LO } from '../App';

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

export default function LOCard({ lo }: LOCardProps) {
  const [expanded, setExpanded] = useState(false);

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
            <span>Tier {lo.d1.tier}</span>
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
    </div>
  );
}
