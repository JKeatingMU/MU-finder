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
  'Law, Policy & Public Affairs',
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
  { id: 'tech-project-mgr',   title: 'Technology Project Manager',      group: 'Technology & Computing', primaryCategory: 'Computing',    secondaryCategory: 'Business' },
  // Science & Research
  { id: 'research-scientist', title: 'Research Scientist',              group: 'Science & Research',     primaryCategory: 'Scientific' },
  { id: 'biologist',          title: 'Biologist / Ecologist',           group: 'Science & Research',     primaryCategory: 'Scientific' },
  { id: 'chemist',            title: 'Chemist',                         group: 'Science & Research',     primaryCategory: 'Scientific',   secondaryCategory: 'Quantitative' },
  { id: 'env-scientist',      title: 'Environmental Scientist',         group: 'Science & Research',     primaryCategory: 'Scientific' },
  { id: 'physicist',          title: 'Physicist / Mathematician',       group: 'Science & Research',     primaryCategory: 'Quantitative', secondaryCategory: 'Scientific' },
  { id: 'pharmacist',         title: 'Pharmacist / Pharmaceutical Scientist', group: 'Science & Research', primaryCategory: 'Scientific', secondaryCategory: 'Quantitative' },
  { id: 'food-scientist',     title: 'Food Scientist / Nutritionist',   group: 'Science & Research',     primaryCategory: 'Scientific' },
  { id: 'sports-scientist',   title: 'Sports Scientist / Exercise Physiologist', group: 'Science & Research', primaryCategory: 'Scientific', secondaryCategory: 'Social' },
  { id: 'geographer',         title: 'Geographer / Town Planner',       group: 'Science & Research',     primaryCategory: 'Scientific',   secondaryCategory: 'Social' },
  // Healthcare & Wellbeing
  { id: 'nurse',              title: 'Nurse / Midwife',                 group: 'Healthcare & Wellbeing', primaryCategory: 'Social',       secondaryCategory: 'Scientific' },
  { id: 'psychologist',       title: 'Psychologist / Counsellor',       group: 'Healthcare & Wellbeing', primaryCategory: 'Social' },
  { id: 'occ-therapist',      title: 'Occupational Therapist',          group: 'Healthcare & Wellbeing', primaryCategory: 'Social',       secondaryCategory: 'Scientific' },
  { id: 'public-health',      title: 'Public Health Worker',            group: 'Healthcare & Wellbeing', primaryCategory: 'Social',       secondaryCategory: 'Scientific' },
  { id: 'health-service-mgr', title: 'Health Service Manager',          group: 'Healthcare & Wellbeing', primaryCategory: 'Social',       secondaryCategory: 'Business' },
  { id: 'careers-guidance',   title: 'Careers Guidance Counsellor',     group: 'Healthcare & Wellbeing', primaryCategory: 'Social' },
  // Business & Finance
  { id: 'business-manager',   title: 'Business Manager',                group: 'Business & Finance',     primaryCategory: 'Business' },
  { id: 'accountant',         title: 'Accountant / Auditor',            group: 'Business & Finance',     primaryCategory: 'Business',     secondaryCategory: 'Quantitative' },
  { id: 'entrepreneur',       title: 'Entrepreneur / Startup Founder',  group: 'Business & Finance',     primaryCategory: 'Business',     secondaryCategory: 'Creative' },
  { id: 'marketing-manager',  title: 'Marketing Manager',               group: 'Business & Finance',     primaryCategory: 'Business',     secondaryCategory: 'Creative' },
  { id: 'financial-analyst',  title: 'Financial Analyst / Actuary',     group: 'Business & Finance',     primaryCategory: 'Quantitative', secondaryCategory: 'Business' },
  { id: 'economist',          title: 'Economist',                       group: 'Business & Finance',     primaryCategory: 'Quantitative', secondaryCategory: 'Business' },
  { id: 'hr-manager',         title: 'Human Resources Manager',         group: 'Business & Finance',     primaryCategory: 'Business',     secondaryCategory: 'Social' },
  // Law, Policy & Public Affairs
  { id: 'solicitor',          title: 'Solicitor / Barrister',           group: 'Law, Policy & Public Affairs', primaryCategory: 'Humanities', secondaryCategory: 'Social' },
  { id: 'policy-analyst',     title: 'Policy Analyst / Civil Servant',  group: 'Law, Policy & Public Affairs', primaryCategory: 'Social',     secondaryCategory: 'Quantitative' },
  { id: 'diplomat',           title: 'Diplomat / International Affairs', group: 'Law, Policy & Public Affairs', primaryCategory: 'Language',   secondaryCategory: 'Social' },
  { id: 'human-rights',       title: 'Human Rights / NGO Worker',       group: 'Law, Policy & Public Affairs', primaryCategory: 'Social',     secondaryCategory: 'Humanities' },
  { id: 'politician',         title: 'Politician / Public Representative', group: 'Law, Policy & Public Affairs', primaryCategory: 'Social',   secondaryCategory: 'Humanities' },
  { id: 'criminologist',      title: 'Criminologist / Probation Officer', group: 'Law, Policy & Public Affairs', primaryCategory: 'Social' },
  // Education & Social Work
  { id: 'teacher',            title: 'Primary / Secondary Teacher',     group: 'Education & Social Work', primaryCategory: 'Social',      secondaryCategory: 'Humanities' },
  { id: 'special-education',  title: 'Special Needs Educator',          group: 'Education & Social Work', primaryCategory: 'Social' },
  { id: 'social-worker',      title: 'Social Worker',                   group: 'Education & Social Work', primaryCategory: 'Social' },
  { id: 'community-worker',   title: 'Community Development Worker',    group: 'Education & Social Work', primaryCategory: 'Social' },
  { id: 'youth-worker',       title: 'Youth Worker / Youth Justice',    group: 'Education & Social Work', primaryCategory: 'Social' },
  { id: 'lecturer',           title: 'Lecturer / Academic Researcher',  group: 'Education & Social Work', primaryCategory: 'Humanities',   secondaryCategory: 'Social' },
  // Arts, Media & Communication
  { id: 'journalist',         title: 'Journalist / Writer',             group: 'Arts, Media & Communication', primaryCategory: 'Language',  secondaryCategory: 'Creative' },
  { id: 'film-producer',      title: 'Film / TV / Media Producer',      group: 'Arts, Media & Communication', primaryCategory: 'Creative' },
  { id: 'pr-comms',           title: 'Public Relations / Communications', group: 'Arts, Media & Communication', primaryCategory: 'Language', secondaryCategory: 'Creative' },
  { id: 'designer',           title: 'Graphic / UX Designer',           group: 'Arts, Media & Communication', primaryCategory: 'Creative' },
  { id: 'musician',           title: 'Musician / Performer',            group: 'Arts, Media & Communication', primaryCategory: 'Creative',  secondaryCategory: 'Humanities' },
  { id: 'arts-administrator', title: 'Arts Administrator / Producer',   group: 'Arts, Media & Communication', primaryCategory: 'Creative',  secondaryCategory: 'Humanities' },
  { id: 'content-creator',    title: 'Content Creator / Digital Media', group: 'Arts, Media & Communication', primaryCategory: 'Creative',  secondaryCategory: 'Language' },
  // Humanities & Culture
  { id: 'historian',          title: 'Historian / Archivist',           group: 'Humanities & Culture',   primaryCategory: 'Humanities' },
  { id: 'philosopher',        title: 'Philosopher / Ethicist',          group: 'Humanities & Culture',   primaryCategory: 'Humanities' },
  { id: 'linguist',           title: 'Linguist / Translator',           group: 'Humanities & Culture',   primaryCategory: 'Language',     secondaryCategory: 'Humanities' },
  { id: 'heritage',           title: 'Museum / Heritage Professional',  group: 'Humanities & Culture',   primaryCategory: 'Humanities',   secondaryCategory: 'Creative' },
  { id: 'theologian',         title: 'Theologian / Chaplain',           group: 'Humanities & Culture',   primaryCategory: 'Humanities' },
  // Engineering & Design
  { id: 'civil-engineer',     title: 'Civil / Structural Engineer',     group: 'Engineering & Design',   primaryCategory: 'Scientific',   secondaryCategory: 'Quantitative' },
  { id: 'elec-engineer',      title: 'Electronic / Electrical Engineer', group: 'Engineering & Design',  primaryCategory: 'Scientific',   secondaryCategory: 'Computing' },
  { id: 'product-designer',   title: 'Product / Industrial Designer',   group: 'Engineering & Design',   primaryCategory: 'Creative',     secondaryCategory: 'Scientific' },
  { id: 'robotics',           title: 'Robotics Engineer',               group: 'Engineering & Design',   primaryCategory: 'Computing',    secondaryCategory: 'Scientific' },
];
