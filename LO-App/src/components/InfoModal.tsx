import { Institution } from '../App';

const SECTORS: Record<string, string> = {
  PU: 'Public University',
  TU: 'Technological University',
  IT: 'Institute of Technology',
  CE: 'College of Education',
  PS: 'Private / Specialised',
};

const RETRIEVAL_METHODS: Record<string, string> = {
  MU:     'Institutional data export (module catalogue JSON, 2025).',
  DCU:    'Scraped from modspec.dcu.ie (legacy endpoint) and dcu.akarisoftware.com (Coursebuilder/Akari). Includes DCU Institute of Education (incorporating former Church of Ireland College of Education, St Patrick\'s College Drumcondra, and Mater Dei Institute).',
  Galway: 'Scraped from nuigalway.ie T4 CMS module catalogue pages.',
  UCC:    'Scraped using Selenium with headless Chrome (CourseLeaf JS-rendered catalogue). ~500 page batches with automatic browser restart.',
  UCD:    'Scraped from hub.ucd.ie. SSL certificate bypass required (GÉANT chain). 31.2% of module records contain no LO text — treated as genuine quality data rather than scraping artefact.',
  UL:     'Scraped from bookofmodules.ul.ie. Includes modules validated under UL\'s degree-awarding authority for Mary Immaculate College, Limerick.',
  ATU:    'Scraped from programme pages on atu.ie. Modules appear across multiple programmes; raw 69,532 LOs deduplicated to 33,770 unique records (51.4% reduction) using module code × LO index × normalised text key.',
  SETU:   'Akari curriculum management system — sequential module ID sweep (IDs 1–20,000) via setu.akarisoftware.com.',
  MTU:    'Akari curriculum management system — sequential module ID sweep (IDs 1–25,000) via mtu.akarisoftware.com.',
  TUD:    'Two-route retrieval. (1) TU Dublin Vault system: 5,449 module catalogue pages — modules use an aims format rather than student-centred LOs. (2) PDF module catalogues discovered for six programmes (TU835 Architecture, TU874 Mathematical Sciences, TU078, TU079, TU248, TU5294) via systematic URL probing of 26 school media directories. PDF records parsed using pdfplumber targeting Akari M1 and Coursebuilder (M2) template formats.',
  DkIT:   'Akari curriculum management system — sequential module ID sweep (IDs 50,000–73,000) via courses.dkit.ie.',
  IADT:   'Single publicly accessible PDF module catalogue (Erasmus ECTS Information Package), parsed using pdfplumber.',
  NCI:    'Akari curriculum management system — scraped from nci.akarisoftware.com.',
  NCAD:   'Individual PDF module descriptor files downloaded from ncad.ie. Parsed using pdfplumber targeting the "1. Introduction" section.',
  GC:     '74 PDF module descriptor documents retrieved from programme pages on griffith.ie. 63 of 74 PDFs contained parseable numbered LO lists. Parsed using pdfplumber targeting the "Module Objectives" / "Module aims and objectives" section. No module codes are published; records are identified by module title.',
  MIE:    'Four programme handbooks (B.Ed. Primary, B.Sc. ECE, B.Sc. Education Studies, B.Oid.) parsed using pdfplumber. Only 14 of 163 modules (8.6%) contain student-centred LOs; the remainder provide description text only. The B.Oid. handbook is in Irish (Gaeilge) and is excluded from D1 scoring.',
};

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  institution: Institution;
};

export default function InfoModal({ isOpen, onClose, institution }: InfoModalProps) {
  if (!isOpen) return null;

  const retrieval = RETRIEVAL_METHODS[institution.code] ?? 'No retrieval details recorded.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{institution.fullName}</h2>
            <p className="text-sm text-gray-500">{SECTORS[institution.sector] ?? institution.sector}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Data Retrieval</h3>
            <p className="leading-relaxed">{retrieval}</p>
          </div>

          {institution.assessmentData && institution.assessmentData !== 'TBC' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Assessment Data</h3>
              <p>{institution.assessmentData}</p>
            </div>
          )}

          {institution.act && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Governing Legislation</h3>
              <p>{institution.act}</p>
            </div>
          )}

          {institution.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Notes</h3>
              <p>{institution.notes}</p>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 flex gap-6 text-xs text-gray-500">
            <span>Corpus status: <span className="font-medium text-gray-700">{institution.corpusStatus}</span></span>
            <span>{institution.loCount.toLocaleString()} LOs in corpus</span>
            {institution.d1Mean != null && <span>D1 mean: {institution.d1Mean.toFixed(3)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
