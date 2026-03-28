import { StrengthCategory } from '../types';

export interface CareerOption {
  id: string;
  title: string;
  group: string;
  primaryCategory: StrengthCategory;
  secondaryCategory?: StrengthCategory;
}

export const careerGroups: string[] = [
  'Technology & Computing',
  'Science & Research',
  'Healthcare & Wellbeing',
  'Business & Finance',
  'Education & Social Work',
  'Arts, Media & Communication',
  'Humanities & Culture',
  'Engineering & Design',
];

export const careers: CareerOption[] = [
  // Technology & Computing
  { id: 'software-engineer',  title: 'Software Engineer',               group: 'Technology & Computing', primaryCategory: 'Computing',    secondaryCategory: 'Quantitative' },
  { id: 'cybersecurity',      title: 'Cybersecurity Analyst',           group: 'Technology & Computing', primaryCategory: 'Computing' },
  { id: 'data-scientist',     title: 'Data Scientist',                  group: 'Technology & Computing', primaryCategory: 'Computing',    secondaryCategory: 'Quantitative' },
  { id: 'ai-engineer',        title: 'AI / Machine Learning Engineer',  group: 'Technology & Computing', primaryCategory: 'Computing',    secondaryCategory: 'Quantitative' },
  { id: 'web-developer',      title: 'Web Developer',                   group: 'Technology & Computing', primaryCategory: 'Computing',    secondaryCategory: 'Creative' },
  // Science & Research
  { id: 'research-scientist', title: 'Research Scientist',              group: 'Science & Research',     primaryCategory: 'Scientific' },
  { id: 'biologist',          title: 'Biologist / Ecologist',           group: 'Science & Research',     primaryCategory: 'Scientific' },
  { id: 'chemist',            title: 'Chemist',                         group: 'Science & Research',     primaryCategory: 'Scientific',   secondaryCategory: 'Quantitative' },
  { id: 'env-scientist',      title: 'Environmental Scientist',         group: 'Science & Research',     primaryCategory: 'Scientific' },
  { id: 'physicist',          title: 'Physicist / Mathematician',       group: 'Science & Research',     primaryCategory: 'Quantitative', secondaryCategory: 'Scientific' },
  // Healthcare & Wellbeing
  { id: 'nurse',              title: 'Nurse / Midwife',                 group: 'Healthcare & Wellbeing', primaryCategory: 'Social',       secondaryCategory: 'Scientific' },
  { id: 'psychologist',       title: 'Psychologist / Counsellor',       group: 'Healthcare & Wellbeing', primaryCategory: 'Social' },
  { id: 'occ-therapist',      title: 'Occupational Therapist',          group: 'Healthcare & Wellbeing', primaryCategory: 'Social',       secondaryCategory: 'Scientific' },
  { id: 'public-health',      title: 'Public Health Worker',            group: 'Healthcare & Wellbeing', primaryCategory: 'Social',       secondaryCategory: 'Scientific' },
  // Business & Finance
  { id: 'business-manager',   title: 'Business Manager',                group: 'Business & Finance',     primaryCategory: 'Business' },
  { id: 'accountant',         title: 'Accountant / Auditor',            group: 'Business & Finance',     primaryCategory: 'Business',     secondaryCategory: 'Quantitative' },
  { id: 'entrepreneur',       title: 'Entrepreneur / Startup Founder',  group: 'Business & Finance',     primaryCategory: 'Business',     secondaryCategory: 'Creative' },
  { id: 'marketing-manager',  title: 'Marketing Manager',               group: 'Business & Finance',     primaryCategory: 'Business',     secondaryCategory: 'Creative' },
  { id: 'financial-analyst',  title: 'Financial Analyst / Actuary',     group: 'Business & Finance',     primaryCategory: 'Quantitative', secondaryCategory: 'Business' },
  { id: 'economist',          title: 'Economist',                       group: 'Business & Finance',     primaryCategory: 'Quantitative', secondaryCategory: 'Business' },
  // Education & Social Work
  { id: 'teacher',            title: 'Primary / Secondary Teacher',     group: 'Education & Social Work', primaryCategory: 'Social',      secondaryCategory: 'Humanities' },
  { id: 'special-education',  title: 'Special Needs Educator',          group: 'Education & Social Work', primaryCategory: 'Social' },
  { id: 'social-worker',      title: 'Social Worker',                   group: 'Education & Social Work', primaryCategory: 'Social' },
  { id: 'community-worker',   title: 'Community Development Worker',    group: 'Education & Social Work', primaryCategory: 'Social' },
  // Arts, Media & Communication
  { id: 'journalist',         title: 'Journalist / Writer',             group: 'Arts, Media & Communication', primaryCategory: 'Language',  secondaryCategory: 'Creative' },
  { id: 'film-producer',      title: 'Film / TV / Media Producer',      group: 'Arts, Media & Communication', primaryCategory: 'Creative' },
  { id: 'pr-comms',           title: 'Public Relations / Communications', group: 'Arts, Media & Communication', primaryCategory: 'Language', secondaryCategory: 'Creative' },
  { id: 'designer',           title: 'Graphic / UX Designer',           group: 'Arts, Media & Communication', primaryCategory: 'Creative' },
  { id: 'musician',           title: 'Musician / Performer',            group: 'Arts, Media & Communication', primaryCategory: 'Creative',  secondaryCategory: 'Humanities' },
  // Humanities & Culture
  { id: 'historian',          title: 'Historian / Archivist',           group: 'Humanities & Culture',   primaryCategory: 'Humanities' },
  { id: 'philosopher',        title: 'Philosopher / Ethicist',          group: 'Humanities & Culture',   primaryCategory: 'Humanities' },
  { id: 'linguist',           title: 'Linguist / Translator',           group: 'Humanities & Culture',   primaryCategory: 'Language',     secondaryCategory: 'Humanities' },
  { id: 'heritage',           title: 'Museum / Heritage Professional',  group: 'Humanities & Culture',   primaryCategory: 'Humanities',   secondaryCategory: 'Creative' },
  // Engineering & Design
  { id: 'civil-engineer',     title: 'Civil / Structural Engineer',     group: 'Engineering & Design',   primaryCategory: 'Scientific',   secondaryCategory: 'Quantitative' },
  { id: 'elec-engineer',      title: 'Electronic / Electrical Engineer', group: 'Engineering & Design',  primaryCategory: 'Scientific',   secondaryCategory: 'Computing' },
  { id: 'product-designer',   title: 'Product / Industrial Designer',   group: 'Engineering & Design',   primaryCategory: 'Creative',     secondaryCategory: 'Scientific' },
  { id: 'robotics',           title: 'Robotics Engineer',               group: 'Engineering & Design',   primaryCategory: 'Computing',    secondaryCategory: 'Scientific' },
];
