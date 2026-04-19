import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FilterBar from './components/FilterBar';
import MainPanel from './components/MainPanel';
import StatsPanel from './components/StatsPanel';
import HelpModal from './components/HelpModal';
import InfoModal from './components/InfoModal';
import ResourcesModal from './components/ResourcesModal';

export type Institution = {
  code: string;
  fullName: string;
  sector: string;
  loCount: number;
  moduleCount: number;
  d1Mean: number;
  tier0Pct: number;
  corpusStatus: string;
  notes?: string;
  assessmentData?: string;
  act?: string | null;
  akari?: boolean;
};

export type DimScore = { score: number; rationale?: string };

export type LO = {
  loId: string;
  institution: string;
  moduleCode: string;
  moduleName: string | null;
  moduleContent: string | null;
  nfqLevel: number | null;
  credits: number | null;
  loIndex: number;
  loText: string;
  language?: string;
  akariId?: number | null;
  programme?: string | null;
  d1: { score: number; verb: string; tier: number; rationale?: string };
  d2: DimScore;
  d3: DimScore;
  compositeScore: number;
  facultyName?: string | null;
  departmentName?: string | null;
  // AI evaluation stream (D1_verify for IRR, D4–D6)
  llm?: {
    d1_verify?: { score: number; verb?: string | null; rationale?: string };
    d4?: DimScore;
    d5?: DimScore;
    d6?: DimScore;
    model?: string;
  };
  // Human evaluation stream
  human?: {
    d1?: DimScore;
    d4?: DimScore;
    d5?: DimScore;
    d6?: DimScore;
    rater?: string;
  };
};

export default function App() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [activeInst, setActiveInst] = useState<string | null>(null);
  const [loData, setLoData] = useState<LO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [nfqFilter, setNfqFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('Default');

  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/institution-registry.json`);
        if (!res.ok || res.headers.get('content-type')?.includes('text/html')) throw new Error('Not found');
        const data = await res.json();
        const records = Array.isArray(data) ? data : (data.institutions ?? data);
        // Filter to complete institutions with scored data only, deduplicate by code
        const seen = new Set();
        const filtered = records.filter((i: any) => {
          if (seen.has(i.code)) return false;
          seen.add(i.code);
          return i.loCount && i.loCount > 0;
        });
        setInstitutions(filtered);
      } catch (e) {
        console.log('Falling back to sample registry');
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}data/institution-registry-sample.json`);
          if (!res.ok || res.headers.get('content-type')?.includes('text/html')) throw new Error('Not found');
          const data = await res.json();
          const records = Array.isArray(data) ? data : (data.institutions ?? data);
          setInstitutions(records);
        } catch (err) {
          console.error('Failed to load institutions', err);
        }
      }
    };
    fetchRegistry();
  }, []);

  useEffect(() => {
    if (!activeInst) {
      setLoData([]);
      return;
    }
    
    setLoading(true);

    const fetchScoredData = async (code: string) => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/scored/${code}.json`);
        if (!res.ok || res.headers.get('content-type')?.includes('text/html')) throw new Error('Not found');
        return await res.json();
      } catch (e) {
        console.log(`Falling back to sample data for ${code}`);
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}data/scored/${code}-sample.json`);
          if (!res.ok || res.headers.get('content-type')?.includes('text/html')) throw new Error('Not found');
          return await res.json();
        } catch (err) {
          console.error(`Failed to load LOs for ${code}`, err);
          return [];
        }
      }
    };

    const fetchLlmData = async (code: string): Promise<Record<string, any>> => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}data/scored-llm-v2/${code}.json`);
        if (!res.ok || res.headers.get('content-type')?.includes('text/html')) return {};
        const data = await res.json();
        const records = Array.isArray(data) ? data : (data.records ?? []);
        const map: Record<string, any> = {};
        for (const r of records) if (r.loId) map[r.loId] = r;
        return map;
      } catch { return {}; }
    };

    const mergeLlm = (los: LO[], llmMap: Record<string, any>): LO[] =>
      los.map(lo => {
        const r = llmMap[lo.loId];
        if (!r) return lo;
        return {
          ...lo,
          llm: {
            d1_verify: r.d1_verify ?? undefined,
            d4: r.d4 ?? undefined,
            d5: r.d5 ?? undefined,
            d6: r.d6 ?? undefined,
            model: r.model ?? undefined,
          },
        };
      });

    if (activeInst === 'ALL') {
      Promise.all(instList.map(inst =>
        Promise.all([fetchScoredData(inst.code), fetchLlmData(inst.code)])
          .then(([los, llm]) => mergeLlm(los, llm))
      )).then(results => {
        setLoData(results.flat());
        setLoading(false);
      });
    } else {
      Promise.all([fetchScoredData(activeInst), fetchLlmData(activeInst)])
        .then(([los, llm]) => {
          setLoData(mergeLlm(los, llm));
          setLoading(false);
        });
    }
  }, [activeInst, institutions]);

  const instList = Array.isArray(institutions) ? institutions : [];
  const activeInstData = activeInst === 'ALL'
    ? {
        code: 'ALL',
        fullName: 'All Institutions',
        sector: 'ALL',
        loCount: loData.length,
        moduleCount: new Set(loData.map(lo => lo.moduleCode)).size,
        d1Mean: loData.length ? loData.reduce((acc, lo) => acc + lo.d1.score, 0) / loData.length : 0,
        tier0Pct: loData.length ? (loData.filter(lo => lo.d1.tier === 0).length / loData.length) * 100 : 0,
        corpusStatus: 'complete'
      }
    : instList.find(i => i.code === activeInst);

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] overflow-hidden font-sans text-gray-800">
      <TopBar
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenResources={() => setIsResourcesOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
      <Sidebar
        institutions={instList}
        activeInst={activeInst}
        setActiveInst={setActiveInst}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeInst && activeInstData && (
          <div className="shrink-0 border-b border-gray-200 bg-white">
            <StatsPanel institution={activeInstData} loData={loData} onOpenInfo={() => setIsInfoOpen(true)} />
            <FilterBar 
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              tierFilter={tierFilter} setTierFilter={setTierFilter}
              nfqFilter={nfqFilter} setNfqFilter={setNfqFilter}
              sortOption={sortOption} setSortOption={setSortOption}
              totalResults={loData.length}
            />
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          {!activeInst ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an institution from the sidebar to view Learning Outcomes.
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading data...
            </div>
          ) : (
            <MainPanel 
              loData={loData}
              searchQuery={searchQuery}
              tierFilter={tierFilter}
              nfqFilter={nfqFilter}
              sortOption={sortOption}
            />
          )}
        </div>
      </div>
      </div>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      {activeInstData && <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} institution={activeInstData} />}
      <ResourcesModal isOpen={isResourcesOpen} onClose={() => setIsResourcesOpen(false)} />
    </div>
  );
}
