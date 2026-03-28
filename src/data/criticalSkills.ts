export interface CriticalSkill {
  id: string;
  code: string;
  category: string;
  short: string;
  text: string;
}

export const CRITICAL_SKILLS: CriticalSkill[] = [
  { id: 'cs1.1', code: 'CS1.1', category: 'Critical Thinking and Analysis', short: 'Critical thinking', text: 'The ability to analyse complex arguments, evaluate evidence, and make balanced judgments.' },
  { id: 'cs1.2', code: 'CS1.2', category: 'Critical Thinking and Analysis', short: 'Analytical thinking', text: 'Breaking down complex information to understand its component parts.' },
  { id: 'cs1.3', code: 'CS1.3', category: 'Critical Thinking and Analysis', short: 'Data analysis', text: 'The skill of interpreting and presenting both qualitative and statistical data.' },
  { id: 'cs2.1', code: 'CS2.1', category: 'Communication', short: 'Verbal communication', text: 'Clearly articulating complex ideas in presentations and discussions.' },
  { id: 'cs2.2', code: 'CS2.2', category: 'Communication', short: 'Written communication', text: 'Crafting clear, concise, and persuasive documents, reports, and essays.' },
  { id: 'cs3.1', code: 'CS3.1', category: 'Collaboration', short: 'Teamwork', text: 'Working effectively in a group to achieve a common goal.' },
  { id: 'cs3.2', code: 'CS3.2', category: 'Collaboration', short: 'Project management', text: 'Organising tasks, managing time, and coordinating with others.' },
  { id: 'cs4.1', code: 'CS4.1', category: 'Creativity and Innovation', short: 'Problem-solving', text: 'Developing novel solutions to complex, non-linear problems.' },
  { id: 'cs4.2', code: 'CS4.2', category: 'Creativity and Innovation', short: 'Design thinking', text: 'Applying user-centric methods to innovate and iterate on solutions.' },
  { id: 'cs4.3', code: 'CS4.3', category: 'Creativity and Innovation', short: 'Ethical reasoning', text: 'Applying ethical principles to decision-making and innovation.' },
];

export const CS_BY_ID: Record<string, CriticalSkill> = Object.fromEntries(
  CRITICAL_SKILLS.map(s => [s.id, s])
);
