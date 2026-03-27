import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Brain, Target, ListChecks, ChevronDown, ChevronUp } from 'lucide-react';
import { questionSets, QuestionSetId } from '../data/questions';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'framework' | 'questions';

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('framework');
  const [expandedSet, setExpandedSet] = useState<QuestionSetId | null>(null);

  const toggleSet = (id: QuestionSetId) => {
    setExpandedSet(expandedSet === id ? null : id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto flex flex-col"
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Methodology</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-slate-100 shrink-0">
              <button
                onClick={() => setActiveTab('framework')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'framework' 
                    ? 'border-red-700 text-red-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Psychometric Framework
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'questions' 
                    ? 'border-red-700 text-red-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Question Sets
              </button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto">
              {activeTab === 'framework' ? (
                <>
                  <section>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <Brain size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Psychometric Framework</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      This tool utilizes a simplified adaptation of the <strong>Holland Codes (RIASEC)</strong> model, 
                      one of the most widely established theories in vocational psychology. We have tailored these 
                      dimensions specifically for the Irish Leaving Certificate context:
                    </p>
                    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                        <span><strong>Analytical</strong> (Investigative): Focus on logic, research, and complex problem-solving.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 mt-2 rounded-full bg-pink-500 shrink-0" />
                        <span><strong>Creative</strong> (Artistic): Focus on expression, design, and innovation.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                        <span><strong>Social</strong> (Social): Focus on helping, teaching, and understanding people.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 mt-2 rounded-full bg-amber-500 shrink-0" />
                        <span><strong>Practical</strong> (Realistic): Focus on hands-on work, technology, and tangible results.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 mt-2 rounded-full bg-violet-500 shrink-0" />
                        <span><strong>Leadership</strong> (Enterprising): Focus on persuasion, management, and decision-making.</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                        <Target size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Matching Algorithm</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Our algorithm calculates a weighted score for each of the 5 dimensions based on your responses. 
                      It then identifies your <strong>Dominant Pair</strong> (your top two traits).
                    </p>
                    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700">
                      <p className="font-medium mb-2">Example:</p>
                      <p>If you score high in <strong>Analytical</strong> and <strong>Practical</strong>, the system prioritizes courses like <em>Computer Science</em> or <em>Science</em> that require this specific combination of logical reasoning and hands-on application.</p>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                        <BookOpen size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Course Database</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Each Maynooth University course in our database has been tagged with a <strong>Primary</strong> and 
                      <strong>Secondary</strong> attribute profile. The recommendation engine filters for courses where 
                      your dominant strengths align with the course's core requirements.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <section>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <ListChecks size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Question Sets</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      We offer different sets of questions to suit different student needs and motivations. 
                      Click on a set below to view the full list of questions.
                    </p>

                    <div className="space-y-4">
                      {Object.values(questionSets).map((set) => (
                        <div 
                          key={set.id} 
                          className={`bg-white border rounded-xl overflow-hidden transition-all ${
                            expandedSet === set.id ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200 hover:border-red-200'
                          }`}
                        >
                          <button
                            onClick={() => toggleSet(set.id)}
                            className="w-full text-left p-4 flex items-start justify-between gap-4"
                          >
                            <div>
                              <h4 className="font-bold text-slate-900 mb-1">{set.name}</h4>
                              <p className="text-sm text-slate-600">{set.description}</p>
                            </div>
                            <div className={`p-1 rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 ${
                              expandedSet === set.id ? 'rotate-180' : ''
                            }`}>
                              <ChevronDown size={20} />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {expandedSet === set.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-slate-50 border-t border-slate-100"
                              >
                                <div className="p-4 space-y-2">
                                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Full Question List</h5>
                                  <ul className="space-y-3">
                                    {set.questions.map((q, idx) => (
                                      <li key={q.id} className="text-sm text-slate-700 flex gap-3">
                                        <span className="font-mono text-slate-400 text-xs shrink-0 w-5 pt-0.5">{idx + 1}.</span>
                                        <span>{q.text} <span className="text-xs text-slate-400 ml-1">({q.category})</span></span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center shrink-0">
              <p className="text-xs text-slate-500">
                Note: This tool is designed for exploratory purposes and should be used alongside 
                guidance counselor advice and official university prospectuses.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
