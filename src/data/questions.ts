import { Question } from '../types';

export type QuestionSetId = 'activity' | 'role' | 'challenge';

export interface QuestionSet {
  id: QuestionSetId;
  name: string;
  description: string;
  questions: Question[];
}

const activityQuestions: Question[] = [
  { id: 1, text: "I enjoy using mathematics and logic to solve complex problems.", category: "Analytical" },
  { id: 2, text: "I am interested in leading technical projects or managing engineering teams.", category: "Leadership" },
  { id: 3, text: "I love designing new software, systems, or innovative solutions.", category: "Creative" },
  { id: 4, text: "I want to use science and technology to improve human health and society.", category: "Social" },
  { id: 5, text: "I enjoy hands-on work, such as building circuits, conducting lab experiments, or coding.", category: "Practical" },
  { id: 6, text: "I am fascinated by the fundamental laws of the universe (Physics) or how life works (Biology).", category: "Analytical" },
  { id: 7, text: "I enjoy explaining complex scientific concepts to others.", category: "Leadership" },
  { id: 8, text: "I like thinking outside the box to find novel engineering solutions.", category: "Creative" },
  { id: 9, text: "I am interested in the ethical implications of technology and AI.", category: "Social" },
  { id: 10, text: "I prefer working with machines, tools, or computer hardware.", category: "Practical" },
  { id: 11, text: "I enjoy analyzing data and statistics to find patterns.", category: "Analytical" },
  { id: 12, text: "I see myself starting a technology business or startup.", category: "Leadership" },
  { id: 13, text: "I enjoy the creative aspect of coding and user interface design.", category: "Creative" },
  { id: 14, text: "I want to work in a team to solve global challenges like climate change.", category: "Social" },
  { id: 15, text: "I like understanding how software and operating systems work under the hood.", category: "Practical" }
];

const roleQuestions: Question[] = [
  { id: 1, text: "I see myself as a researcher discovering new scientific truths.", category: "Analytical" },
  { id: 2, text: "I want to be a project manager leading a team of developers.", category: "Leadership" },
  { id: 3, text: "I want to be the person who invents the next big app or gadget.", category: "Creative" },
  { id: 4, text: "I want a career where I interact with patients or clients daily to help them.", category: "Social" },
  { id: 5, text: "I want to be a field engineer working with equipment on site.", category: "Practical" },
  { id: 6, text: "I see myself working in a lab analyzing samples and data.", category: "Analytical" },
  { id: 7, text: "I want to be a CEO or founder of a tech company.", category: "Leadership" },
  { id: 8, text: "I want to be a designer creating beautiful and functional products.", category: "Creative" },
  { id: 9, text: "I want to be a teacher or lecturer inspiring the next generation of scientists.", category: "Social" },
  { id: 10, text: "I want to be a hardware engineer building computer components.", category: "Practical" },
  { id: 11, text: "I see myself as a data scientist predicting future trends.", category: "Analytical" },
  { id: 12, text: "I want to be a consultant advising companies on technical strategy.", category: "Leadership" },
  { id: 13, text: "I want to be an architect or UX designer shaping how people interact with technology.", category: "Creative" },
  { id: 14, text: "I want to work for a non-profit using tech for social good.", category: "Social" },
  { id: 15, text: "I want to be a systems administrator keeping critical infrastructure running.", category: "Practical" }
];

const challengeQuestions: Question[] = [
  { id: 1, text: "I want to figure out how to model climate change patterns mathematically.", category: "Analytical" },
  { id: 2, text: "I want to lead the team that lands the first humans on Mars.", category: "Leadership" },
  { id: 3, text: "I want to design a completely new way for humans to interact with computers.", category: "Creative" },
  { id: 4, text: "I want to solve the problem of unequal access to healthcare using technology.", category: "Social" },
  { id: 5, text: "I want to build the robots that will explore hazardous environments.", category: "Practical" },
  { id: 6, text: "I want to decode the human genome to cure genetic diseases.", category: "Analytical" },
  { id: 7, text: "I want to convince investors to fund a risky but revolutionary energy project.", category: "Leadership" },
  { id: 8, text: "I want to create sustainable cities that blend nature and technology.", category: "Creative" },
  { id: 9, text: "I want to ensure artificial intelligence is developed safely and ethically.", category: "Social" },
  { id: 10, text: "I want to construct the next generation of renewable energy infrastructure.", category: "Practical" },
  { id: 11, text: "I want to solve the mystery of dark matter and the origins of the universe.", category: "Analytical" },
  { id: 12, text: "I want to organize global cooperation to fight cybercrime.", category: "Leadership" },
  { id: 13, text: "I want to visualize complex data in a way that changes how people see the world.", category: "Creative" },
  { id: 14, text: "I want to develop technologies that help people with disabilities live independently.", category: "Social" },
  { id: 15, text: "I want to optimize the performance of supercomputers to solve massive calculations.", category: "Practical" }
];

export const questionSets: Record<QuestionSetId, QuestionSet> = {
  activity: {
    id: 'activity',
    name: 'Activity Based',
    description: 'Focuses on daily activities and what you enjoy doing. Best for general exploration.',
    questions: activityQuestions
  },
  role: {
    id: 'role',
    name: 'Future Role',
    description: 'Focuses on professional identities and who you want to become. Best for students with career ambitions.',
    questions: roleQuestions
  },
  challenge: {
    id: 'challenge',
    name: 'Global Challenges',
    description: 'Focuses on the types of problems you want to solve. Best for inspiring STEM students.',
    questions: challengeQuestions
  }
};

// Default export for backward compatibility if needed, though we will update usages
export const questions = activityQuestions;
