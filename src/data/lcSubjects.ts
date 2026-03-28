import { Faculty } from '../types';

export interface LCSubject {
  name: string;
  hasFoundation?: boolean;
  facultyHint?: Faculty;
}

export const H_POINTS = [100, 88, 77, 66, 56, 46, 37]; // H1–H7
export const O_POINTS = [56, 46, 37, 28, 20, 12, 0];   // O1–O7 (O7=0, omitted from picker)
export const F_POINTS = [28, 20];                        // F1–F2

export function gradeToPoints(grade: string): number {
  const level = grade[0];
  const idx = parseInt(grade[1]) - 1;
  if (level === 'H') return H_POINTS[idx] ?? 0;
  if (level === 'O') return O_POINTS[idx] ?? 0;
  if (level === 'F') return F_POINTS[idx] ?? 0;
  return 0;
}

export function hasMathsBonus(grade: string): boolean {
  return grade.startsWith('H') && parseInt(grade[1]) <= 6;
}

export const MATHS_BONUS = 25;

export interface LCSubjectGroup {
  label: string;
  subjects: LCSubject[];
}

export const lcSubjectGroups: LCSubjectGroup[] = [
  {
    label: 'Languages',
    subjects: [
      { name: 'English' },
      { name: 'Irish', hasFoundation: true },
      { name: 'French',           facultyHint: 'arts' },
      { name: 'German',           facultyHint: 'arts' },
      { name: 'Spanish',          facultyHint: 'arts' },
      { name: 'Italian',          facultyHint: 'arts' },
      { name: 'Japanese',         facultyHint: 'arts' },
      { name: 'Chinese (Mandarin)', facultyHint: 'arts' },
    ],
  },
  {
    label: 'Mathematics',
    subjects: [
      { name: 'Mathematics',         hasFoundation: true },
      { name: 'Applied Mathematics', facultyHint: 'science' },
    ],
  },
  {
    label: 'Sciences',
    subjects: [
      { name: 'Biology',             facultyHint: 'science' },
      { name: 'Chemistry',           facultyHint: 'science' },
      { name: 'Physics',             facultyHint: 'science' },
      { name: 'Physics & Chemistry', facultyHint: 'science' },
      { name: 'Agricultural Science', facultyHint: 'science' },
      { name: 'Computer Science',    facultyHint: 'science' },
    ],
  },
  {
    label: 'Technology & Design',
    subjects: [
      { name: 'Design & Communication Graphics', facultyHint: 'science' },
      { name: 'Engineering',         facultyHint: 'science' },
      { name: 'Construction Studies', facultyHint: 'science' },
    ],
  },
  {
    label: 'Business & Social',
    subjects: [
      { name: 'Business',            facultyHint: 'social' },
      { name: 'Economics',           facultyHint: 'social' },
      { name: 'Accounting',          facultyHint: 'social' },
      { name: 'Home Economics',      facultyHint: 'social' },
      { name: 'Politics & Society',  facultyHint: 'social' },
    ],
  },
  {
    label: 'Humanities & Other',
    subjects: [
      { name: 'History',             facultyHint: 'arts' },
      { name: 'Geography' },
      { name: 'Art',                 facultyHint: 'arts' },
      { name: 'Music',               facultyHint: 'arts' },
      { name: 'Classical Studies',   facultyHint: 'arts' },
      { name: 'Ancient Greek',       facultyHint: 'arts' },
      { name: 'Latin',               facultyHint: 'arts' },
      { name: 'Religious Education' },
      { name: 'Physical Education' },
    ],
  },
];

export const lcSubjects: LCSubject[] = lcSubjectGroups.flatMap(g => g.subjects);
