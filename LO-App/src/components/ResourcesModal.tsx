import { useEffect } from 'react';

type ResourcesModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Resource = {
  citation: string;
  title: string;
  year: string;
  annotation: string;
  url?: string;
};

const POLICY: Resource[] = [
  {
    citation: 'QQI (2024)',
    title: 'Core Policies and Criteria for the Inclusion of Awards within the Framework (QP 24)',
    year: '2024',
    annotation: 'The foundational Irish policy document governing how awards and their learning outcomes are defined, expressed, and referenced to the NFQ. Requires LOs to be explicitly specified, appropriate to credit volume, and consistent with NFQ level descriptors.',
    url: 'https://www.qqi.ie/sites/default/files/2024-08/qp-24-core-policies-and-criteria-for-the-inclusion-of-awards-within-the-framework.pdf',
  },
  {
    citation: 'QQI (2022)',
    title: 'Assessment and Standards (Revised 2022)',
    year: '2022',
    annotation: 'QQI\'s assessment policy. Requires that assessment procedures are criterion-referenced against stated learning outcomes, that LOs are plainly written, and that assessment is consistent with, supportive of, and derived from the LOs. The core policy basis for the constructive alignment analysis in this corpus.',
    url: 'https://www.qqi.ie/sites/default/files/2022-09/assessment_and_standards-revised-2022.pdf',
  },
  {
    citation: 'QQI (2017)',
    title: 'Policies and Criteria for the Validation of Programmes of Education and Training (QP.17-V1.03)',
    year: '2017',
    annotation: 'Current operative validation policy. Requires that minimum intended module learning outcomes (MIMLOs) are explicitly specified and not vague, ambiguous, or generalised. The anti-vagueness requirement directly grounds the D1 Tier 0 classification.',
    url: 'https://www.qqi.ie/sites/default/files/2021-11/qp-17-policies-and-criteria-for-the-validation-of-programmes-of-education-and-training.pdf',
  },
  {
    citation: 'QQI (2020)',
    title: 'National Framework of Qualifications (NFQ)',
    year: '2020',
    annotation: 'The Irish qualifications framework defining award levels 1–10. Level descriptors specify the knowledge, know-how/skill, and competence expected at each level — the normative reference for D6 (NFQ level calibration) in the evaluation rubric.',
    url: 'https://www.qqi.ie/what-we-do/the-qualifications-system/national-framework-of-qualifications',
  },
  {
    citation: 'European Commission (2015)',
    title: 'ECTS Users\' Guide 2015',
    year: '2015',
    annotation: 'The Bologna Process standard for learning outcomes and credit allocation. Requires LOs to describe what the learner will be able to demonstrate — not what the module covers. Explicitly discourages verbs such as "understand" and "know" as unobservable. One ECTS credit corresponds to 25–30 hours of student workload, informing scope calibration (D4).',
    url: 'https://education.ec.europa.eu/resources/ects-users-guide',
  },
  {
    citation: 'ENQA (2015)',
    title: 'Standards and Guidelines for Quality Assurance in the European Higher Education Area (ESG)',
    year: '2015',
    annotation: 'The pan-European QA framework. Standard 1.2 requires institutions to ensure that programmes are designed to ensure that students achieve the stated outcomes. Referenced by QQI Assessment and Standards (2022) as a co-binding requirement for Irish HEIs.',
    url: 'https://www.enqa.eu/wp-content/uploads/2015/11/ESG_2015.pdf',
  },
  {
    citation: 'Cedefop (2017)',
    title: 'Defining, Writing and Applying Learning Outcomes: A European Handbook',
    year: '2017',
    annotation: 'QQI\'s stated normative reference for LO writing guidance (cited in QP 24, footnote 20). Provides detailed guidance on active verb selection, specificity, measurability, and student-centredness. The practical companion to the Bologna policy framework.',
    url: 'http://dx.doi.org/10.2801/566770',
  },
];

const ACADEMIC: Resource[] = [
  {
    citation: 'Biggs, J. & Tang, C. (2011)',
    title: 'Teaching for Quality Learning at University (4th ed.)',
    year: '2011',
    annotation: 'The canonical text on constructive alignment — the principle that learning outcomes, teaching and learning activities, and assessment tasks should all be aligned to the same cognitive demand. The theoretical basis for the Type A/B misalignment classification in this corpus.',
    url: 'https://doi.org/10.1007/978-94-010-2162-1',
  },
  {
    citation: 'Anderson, L.W. & Krathwohl, D.R. (Eds.) (2001)',
    title: 'A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom\'s Taxonomy of Educational Objectives',
    year: '2001',
    annotation: 'The revised Bloom\'s taxonomy underpinning the D1 tier structure. Replaces Bloom\'s original nouns (Knowledge, Comprehension…) with action verbs (Remember, Understand, Apply, Analyse, Evaluate, Create), providing a cognitive demand hierarchy directly applicable to LO verb classification.',
  },
  {
    citation: 'Bloom, B.S. et al. (1956)',
    title: 'Taxonomy of Educational Objectives: The Classification of Educational Goals. Handbook I: Cognitive Domain',
    year: '1956',
    annotation: 'The original taxonomy of cognitive educational objectives. The six-level hierarchy (Knowledge → Comprehension → Application → Analysis → Synthesis → Evaluation) is the forerunner of the revised taxonomy and remains the standard reference in educational research on LO verb observability.',
  },
  {
    citation: 'Mager, R.F. (1962)',
    title: 'Preparing Instructional Objectives',
    year: '1962',
    annotation: 'The foundational text on behavioural objectives. Established the principle that instructional objectives must specify observable, measurable student performance — the origin of the distinction between "fuzzy" verbs (understand, know, appreciate) and "action" verbs. Directly grounds the D1 Tier 0 classification.',
  },
  {
    citation: 'Kennedy, D., Hyland, Á. & Ryan, N. (2006)',
    title: 'Writing and Using Learning Outcomes: A Practical Guide',
    year: '2006',
    annotation: 'A widely used practical guide to LO writing, developed at University College Cork and disseminated across Irish and European HE. Provides verb lists organised by Bloom\'s taxonomy level and guidance on scope, student-centredness, and assessability — a key reference for Irish LO practice.',
    url: 'https://cora.ucc.ie/handle/10468/1613',
  },
  {
    citation: 'Biggs, J.B. (1996)',
    title: 'Enhancing teaching through constructive alignment',
    year: '1996',
    annotation: 'The original paper introducing constructive alignment as a framework for curriculum design. Defines the alignment between intended outcomes, teaching activities, and assessment as the central quality criterion for higher education teaching.',
  },
  {
    citation: 'Adam, S. (2004)',
    title: 'Using Learning Outcomes: A consideration of the nature, role, application and implications for European education of employing learning outcomes at the local, national and international levels',
    year: '2004',
    annotation: 'Report commissioned for the Bologna Process. Examines how learning outcomes function across European HE systems and argues for their centrality to qualification recognition, quality assurance, and student mobility. Contextualises the Irish LO quality agenda within the European HE reform framework.',
  },
];

function ResourceEntry({ r }: { r: Resource }) {
  return (
    <div className="border-l-2 border-gray-200 pl-4 py-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{r.citation}</p>
          <p className="text-sm text-gray-700 italic mt-0.5">{r.title}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{r.annotation}</p>
        </div>
        {r.url && (
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs px-2 py-1 bg-[#4a90d9] text-white rounded hover:bg-[#3a7bc8] transition-colors"
          >
            Open ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default function ResourcesModal({ isOpen, onClose }: ResourcesModalProps) {
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
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1e2d40] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold">References & Resources</h2>
            <p className="text-xs text-gray-400 mt-0.5">Policy documents, standards, and academic sources</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8 text-gray-800">

          {/* Policy section */}
          <section>
            <h3 className="text-base font-bold text-[#4a90d9] uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-[#4a90d9] rounded"></span>
              Policy &amp; Standards
            </h3>
            <div className="space-y-4">
              {POLICY.map((r, i) => <ResourceEntry key={i} r={r} />)}
            </div>
          </section>

          {/* Academic section */}
          <section>
            <h3 className="text-base font-bold text-[#4a90d9] uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-[#4a90d9] rounded"></span>
              Academic References
            </h3>
            <div className="space-y-4">
              {ACADEMIC.map((r, i) => <ResourceEntry key={i} r={r} />)}
            </div>
          </section>

          <section className="text-xs text-gray-400 border-t border-gray-100 pt-4">
            This browser is part of the research programme{' '}
            <em>Measuring What We Promise: A Cross-Institutional Analysis of Learning Outcome Quality in Irish Higher Education</em>,
            Maynooth University, 2024–2026. Contact:{' '}
            <a href="mailto:john.keating@mu.ie" className="text-[#4a90d9] hover:underline">
              john.keating@mu.ie
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
