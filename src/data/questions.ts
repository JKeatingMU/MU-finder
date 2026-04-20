import { Question, Faculty } from '../types';

export type FacultyQuestions = Record<Faculty, Question[]>;

const artsQuestions: Question[] = [
  { id: 1,  text: "I enjoy expressing ideas through creative writing, music, media or visual arts.", category: "Creative" },
  { id: 2,  text: "I enjoy reading, analysing texts and exploring complex ideas in depth.", category: "Humanities" },
  { id: 3,  text: "I enjoy writing, debating, presenting or storytelling.", category: "Language" },
  { id: 4,  text: "I am drawn to careers in the creative industries — film, journalism, publishing or the arts.", category: "Creative" },
  { id: 5,  text: "I am fascinated by history, philosophy, culture or how human societies develop.", category: "Humanities" },
  { id: 6,  text: "I am interested in how language, literature or media shapes our understanding of the world.", category: "Language" },
  { id: 7,  text: "I feel energised when I have the freedom to create something original.", category: "Creative" },
  { id: 8,  text: "I prefer subjects where critical thinking and interpretation matter more than a single right answer.", category: "Humanities" },
  { id: 9,  text: "I would be suited to a career where strong communication and critical analysis are essential.", category: "Language" },
];

const scienceQuestions: Question[] = [
  { id: 1,  text: "I enjoy finding out how biological, chemical or physical systems work.", category: "Scientific" },
  { id: 2,  text: "I enjoy working with numbers, equations and mathematical problem-solving.", category: "Quantitative" },
  { id: 3,  text: "I enjoy programming, building software or thinking about how computer systems work.", category: "Computing" },
  { id: 4,  text: "I am excited by combining technical knowledge with hands-on design and innovation.", category: "Creative" },
  { id: 5,  text: "I am curious about the natural world — living things, matter, energy or the environment.", category: "Scientific" },
  { id: 6,  text: "I like finding patterns in data and using logic or maths to model how things work.", category: "Quantitative" },
  { id: 7,  text: "I like solving logical problems in systematic, structured ways.", category: "Computing" },
  { id: 8,  text: "I enjoy thinking about how to design or engineer new products, devices or systems.", category: "Creative" },
  { id: 9,  text: "I would be interested in a career in research, healthcare, biotechnology or environmental science.", category: "Scientific" },
  { id: 10, text: "I am drawn to areas like mathematics, physics, statistics or financial modelling.", category: "Quantitative" },
  { id: 11, text: "I would be excited to work in software engineering, data science, AI or cybersecurity.", category: "Computing" },
  { id: 12, text: "I would be drawn to roles in product design, robotics, electronic engineering or multimedia.", category: "Creative" },
];

const socialQuestions: Question[] = [
  { id: 1,  text: "I want to make a real difference in people's lives and in my community.", category: "Social" },
  { id: 2,  text: "I am interested in how organisations work — strategy, management, marketing or entrepreneurship.", category: "Business" },
  { id: 3,  text: "I have a strong interest in law, justice, rights or how societies are governed.", category: "Language" },
  { id: 4,  text: "I enjoy applying mathematics or statistics to understand economic or financial systems.", category: "Quantitative" },
  { id: 5,  text: "I am interested in psychology, education, social justice or community development.", category: "Social" },
  { id: 6,  text: "I enjoy analysing real-world problems and making evidence-based decisions.", category: "Business" },
  { id: 7,  text: "I am interested in international affairs, global business or working across different cultures.", category: "Language" },
  { id: 8,  text: "I am drawn to understanding how financial markets, economies or accounting systems work.", category: "Quantitative" },
  { id: 9,  text: "I would enjoy a career in teaching, social work, nursing, counselling or youth work.", category: "Social" },
  { id: 10, text: "I would be excited to run my own venture, work in management or pursue a business career.", category: "Business" },
  { id: 11, text: "Strong argumentation, critical thinking and communication skills are important to me.", category: "Language" },
  { id: 12, text: "I would be interested in a career in finance, economics, quantitative analysis or accounting.", category: "Quantitative" },
];

export const facultyQuestions: FacultyQuestions = {
  arts:    artsQuestions,
  science: scienceQuestions,
  social:  socialQuestions,
};

export const generalQuestions: Question[] = [
  { id: 1,  text: "I enjoy expressing ideas through design, music, creative writing or the visual arts.", category: "Creative" },
  { id: 2,  text: "I am fascinated by history, philosophy, culture or how human societies develop over time.", category: "Humanities" },
  { id: 3,  text: "I enjoy writing, debating, presenting or communicating ideas clearly and persuasively.", category: "Language" },
  { id: 4,  text: "I enjoy finding out how biological, chemical or physical systems work.", category: "Scientific" },
  { id: 5,  text: "I enjoy working with numbers, equations or mathematical reasoning.", category: "Quantitative" },
  { id: 6,  text: "I enjoy programming, building software or working out how digital systems work.", category: "Computing" },
  { id: 7,  text: "I am motivated by helping others and making a positive difference in my community.", category: "Social" },
  { id: 8,  text: "I am interested in how organisations work — strategy, management, marketing or entrepreneurship.", category: "Business" },
  { id: 9,  text: "I feel energised when I can create something original — a design, performance, piece of writing or product.", category: "Creative" },
  { id: 10, text: "I am curious about the natural world — living things, matter, energy or the environment.", category: "Scientific" },
  { id: 11, text: "I am drawn to a career in teaching, healthcare, social work or community development.", category: "Social" },
  { id: 12, text: "I prefer subjects where critical thinking and interpretation matter more than a single correct answer.", category: "Humanities" },
];
