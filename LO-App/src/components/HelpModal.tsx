import { useEffect } from 'react';

type HelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1e2d40] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold">Help / About</h2>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-gray-800 space-y-8">
          
          <section>
            <h3 className="text-lg font-bold text-[#4a90d9] mb-3">About This App</h3>
            <p className="mb-3">
              LO Browser is a research tool for browsing and analysing Student Learning Outcomes (LOs) from sixteen Irish higher education institutions. It was developed as part of the study "Measuring What We Promise: A Cross-Institutional Analysis of Learning Outcome Quality in Irish Higher Education" by researchers at Maynooth University.
            </p>
            <p>
              The corpus contains 233,005 LOs across 51,190 modules spanning six public universities, three technological universities, two institutes of technology, one college of education, and three private/specialised colleges.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#4a90d9] mb-3">Institutions and Sectors</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Code</th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Institution</th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Sector</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-4 py-2">MU</td><td className="border border-gray-300 px-4 py-2">Maynooth University</td><td className="border border-gray-300 px-4 py-2">Public University (PU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">DCU</td><td className="border border-gray-300 px-4 py-2">Dublin City University</td><td className="border border-gray-300 px-4 py-2">Public University (PU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">Galway</td><td className="border border-gray-300 px-4 py-2">University of Galway</td><td className="border border-gray-300 px-4 py-2">Public University (PU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">UCC</td><td className="border border-gray-300 px-4 py-2">University College Cork</td><td className="border border-gray-300 px-4 py-2">Public University (PU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">UCD</td><td className="border border-gray-300 px-4 py-2">University College Dublin</td><td className="border border-gray-300 px-4 py-2">Public University (PU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">UL</td><td className="border border-gray-300 px-4 py-2">University of Limerick</td><td className="border border-gray-300 px-4 py-2">Public University (PU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">ATU</td><td className="border border-gray-300 px-4 py-2">Atlantic Technological University</td><td className="border border-gray-300 px-4 py-2">Technological University (TU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">SETU</td><td className="border border-gray-300 px-4 py-2">South East Technological University</td><td className="border border-gray-300 px-4 py-2">Technological University (TU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">MTU</td><td className="border border-gray-300 px-4 py-2">Munster Technological University</td><td className="border border-gray-300 px-4 py-2">Technological University (TU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">TUD</td><td className="border border-gray-300 px-4 py-2">TU Dublin</td><td className="border border-gray-300 px-4 py-2">Technological University (TU)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">DkIT</td><td className="border border-gray-300 px-4 py-2">Dundalk Institute of Technology</td><td className="border border-gray-300 px-4 py-2">Institute of Technology (IT)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">IADT</td><td className="border border-gray-300 px-4 py-2">Dún Laoghaire Institute of Art, Design and Technology</td><td className="border border-gray-300 px-4 py-2">Institute of Technology (IT)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">MIE</td><td className="border border-gray-300 px-4 py-2">Marino Institute of Education</td><td className="border border-gray-300 px-4 py-2">College of Education (CE)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">NCI</td><td className="border border-gray-300 px-4 py-2">National College of Ireland</td><td className="border border-gray-300 px-4 py-2">Private/Specialised (PS)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">NCAD</td><td className="border border-gray-300 px-4 py-2">National College of Art and Design</td><td className="border border-gray-300 px-4 py-2">Private/Specialised (PS)</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2">GC</td><td className="border border-gray-300 px-4 py-2">Griffith College Dublin</td><td className="border border-gray-300 px-4 py-2">Private/Specialised (PS)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#4a90d9] mb-3">The Evaluation Rubric: D1–D3</h3>
            <p className="mb-4">Each LO is automatically scored on three dimensions using rule-based analysis:</p>
            
            <h4 className="font-bold text-gray-900 mb-2">D1 — Verb Observability</h4>
            <p className="mb-3">Measures whether the action verb in the LO specifies an observable, assessable student behaviour. Based on Bloom's Revised Taxonomy (Anderson & Krathwohl, 2001).</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Tier</th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Label</th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Score</th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Example verbs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center font-medium text-[#dc3545]">0</td><td className="border border-gray-300 px-4 py-2">Unobservable</td><td className="border border-gray-300 px-4 py-2 text-center">0</td><td className="border border-gray-300 px-4 py-2">understand, know, appreciate, be aware of</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center font-medium text-[#fd7e14]">1</td><td className="border border-gray-300 px-4 py-2">Weak</td><td className="border border-gray-300 px-4 py-2 text-center">1</td><td className="border border-gray-300 px-4 py-2">describe, identify, list, outline</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center font-medium text-[#28a745]">2</td><td className="border border-gray-300 px-4 py-2">Clear</td><td className="border border-gray-300 px-4 py-2 text-center">2</td><td className="border border-gray-300 px-4 py-2">analyse, evaluate, apply, demonstrate</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center font-medium text-[#007bff]">3</td><td className="border border-gray-300 px-4 py-2">Precise</td><td className="border border-gray-300 px-4 py-2 text-center">3</td><td className="border border-gray-300 px-4 py-2">design, critique, synthesise, construct</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mb-6">A high D1 score means the LO specifies what the student must do in a way that can be directly observed and assessed. Tier 0 verbs describe internal mental states that cannot be measured.</p>

            <h4 className="font-bold text-gray-900 mb-2">D2 — Behavioural Singularity</h4>
            <p className="mb-3">Measures whether the LO specifies a single behaviour or conflates multiple behaviours in one statement. A well-written LO should contain one observable verb and one outcome.</p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Score</th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">3</td><td className="border border-gray-300 px-4 py-2">Single behaviour — clear and assessable</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">2</td><td className="border border-gray-300 px-4 py-2">Two behaviours — compound but manageable</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">1</td><td className="border border-gray-300 px-4 py-2">Three or more behaviours — should be split</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-bold text-gray-900 mb-2">D3 — Student-Centredness</h4>
            <p className="mb-3">Measures whether the LO is written in student-centred format — starting with an action verb that places the student's performance at the centre. This is the standard format recommended by QQI and the Bologna Process.</p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Score</th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">3</td><td className="border border-gray-300 px-4 py-2">Verb-first (e.g. "Analyse the impact of...")</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">2</td><td className="border border-gray-300 px-4 py-2">Student-subject with verb (e.g. "Students will be able to...")</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">1</td><td className="border border-gray-300 px-4 py-2">Passive or aims-format (e.g. "To introduce students to...")</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-bold text-gray-900 mb-2">Composite Score</h4>
            <p>The sum of D1 + D2 + D3, ranging from 0 to 9. A score of 9 represents a single, verb-first, precisely observable LO. A score of 0 represents an unobservable, multi-behaviour, aims-format statement.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#4a90d9] mb-3">Constructive Alignment</h3>
            <p className="mb-3">Where assessment data is available, the app flags modules against the constructive alignment framework (Biggs, 1996). A well-aligned module has its assessment instrument matched to the cognitive demand of its LOs.</p>
            <ul className="list-disc pl-5 mb-3 space-y-1">
              <li><strong>Type A (Misaligned):</strong> High-demand LOs (D1 ≥ 2) paired with examination-only assessment. The exam cannot elicit the performance the LO specifies.</li>
              <li><strong>Partially Rescued:</strong> High-demand LOs but at least one continuous assessment component also targets those LOs.</li>
              <li><strong>Type B:</strong> Low-demand LOs (D1 &lt; 2) with continuous assessment only.</li>
            </ul>
            <p>Assessment data is available for: MTU, SETU, DkIT, NCI (via Akari system), and MU (CA/exam weight proxy).</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#4a90d9] mb-3">NFQ Levels</h3>
            <p className="mb-3">Irish qualifications are mapped to the National Framework of Qualifications (NFQ). The levels relevant to this corpus are:</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">NFQ Level</th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">Typical award</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">6</td><td className="border border-gray-300 px-4 py-2">Higher Certificate</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">7</td><td className="border border-gray-300 px-4 py-2">Ordinary Bachelor Degree</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">8</td><td className="border border-gray-300 px-4 py-2">Honours Bachelor Degree</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">9</td><td className="border border-gray-300 px-4 py-2">Master's Degree</td></tr>
                  <tr><td className="border border-gray-300 px-4 py-2 text-center">10</td><td className="border border-gray-300 px-4 py-2">Doctoral Degree</td></tr>
                </tbody>
              </table>
            </div>
            <p>A well-written LO at NFQ Level 8 should use verbs reflecting the complexity expected at Honours Bachelor level — analysis, evaluation, design, synthesis.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#4a90d9] mb-3">How to Use the App</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Select an institution from the left sidebar to load its LOs.</li>
              <li>Filter by D1 Tier, NFQ Level, or keyword search to narrow results.</li>
              <li>Sort by D1 score, composite score, or module code.</li>
              <li>Click any LO card to expand it and see full scoring rationale.</li>
              <li>The stats bar shows a summary of the selected institution including a tier distribution chart.</li>
            </ol>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#4a90d9] mb-3">Research Context</h3>
            <p className="mb-3">This tool is part of an ongoing research programme at Maynooth University investigating LO quality, constructive alignment, and curriculum design across Irish higher education. Findings inform national policy discussions on quality assurance, UDL, graduate skills, and the HEA Data and Digital Skills agenda.</p>
            <p>For queries contact: <a href="mailto:john.keating@mu.ie" className="text-[#4a90d9] hover:underline">john.keating@mu.ie</a></p>
          </section>

        </div>
      </div>
    </div>
  );
}
