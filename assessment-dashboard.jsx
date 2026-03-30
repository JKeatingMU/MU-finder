import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged 
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    onSnapshot, 
    collection, 
    query,
    arrayUnion,
    arrayRemove,
    writeBatch
} from "firebase/firestore";

// --- Firebase Config (MUST be populated by the environment) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : { apiKey: "YOUR_FALLBACK_API_KEY", authDomain: "...", projectId: "..." };

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ECTS Standard: Using 22.5 hours as the midpoint of the 20-25 hours per ECTS credit
const HOURS_PER_ECTS = 22.5;

// --- Predefined Critical Skills ---
const CRITICAL_SKILLS_LIST = [
    {
        category: 'Critical Thinking and Analysis',
        skills: [
            { id: 'cs1.1', short: 'CS1.1', text: 'Critical thinking: The ability to analyze complex arguments, evaluate evidence, and make balanced judgments.' },
            { id: 'cs1.2', short: 'CS1.2', text: 'Analytical thinking: Breaking down complex information to understand its component parts.' },
            { id: 'cs1.3', short: 'CS1.3', text: 'Data analysis: The skill of interpreting and presenting both qualitative and statistical data.' }
        ]
    },
    {
        category: 'Communication',
        skills: [
            { id: 'cs2.1', short: 'CS2.1', text: 'Verbal communication: Clearly articulating complex ideas in presentations and discussions.' },
            { id: 'cs2.2', short: 'CS2.2', text: 'Written communication: Crafting clear, concise, and persuasive documents, reports, and essays.' }
        ]
    },
    {
        category: 'Collaboration',
        skills: [
            { id: 'cs3.1', short: 'CS3.1', text: 'Teamwork: Working effectively in a group to achieve a common goal.' },
            { id: 'cs3.2', short: 'CS3.2', text: 'Project management: Organizing tasks, managing time, and coordinating with others.' }
        ]
    },
    {
        category: 'Creativity and Innovation',
        skills: [
            { id: 'cs4.1', short: 'CS4.1', text: 'Problem-solving: Developing novel solutions to complex, non-linear problems.' },
            { id: 'cs4.2', short: 'CS4.2', text: 'Design thinking: Applying user-centric methods to innovate and iterate on solutions.' },
            { id: 'cs4.3', short: 'CS4.3', text: 'Ethical reasoning: Applying ethical principles to decision-making and innovation.' }
        ]
    }
];

// Helper to generate relative dates to prevent a "sea of overdues"
const getRelDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
};

// --- Mock Module Data (Public) ---
const MOCK_MODULES_DATA = [
    {
        code: 'COMP101',
        name: 'Introduction to Programming',
        descriptor: 'Learn the fundamentals of programming using Python. This module covers variables, data types, control structures, functions, and basic data structures. No prior programming experience is assumed.',
        ectsCredits: 10,
        formalInstructionHours: 60,
        lecturer: { name: 'Dr. Evelyn Carter', email: 'e.carter@university.edu' },
        learningOutcomes: [
            { id: 'COMP101-lo1', text: 'Understand and apply fundamental programming constructs.' },
            { id: 'COMP101-lo2', text: 'Design, implement, and debug small to medium-sized programs.' },
            { id: 'COMP101-lo3', text: 'Apply problem-solving skills to computational problems.' }
        ],
        criticalSkills: ['cs1.1', 'cs1.2', 'cs4.1'],
        assignments: [
            {
                id: 'COMP101-01',
                title: 'Lab 1: Variables & Operators',
                description: 'Complete a series of short exercises on variables and basic arithmetic operators.',
                assignment_type: 'Lab Exercise',
                weight: 5,
                estimatedCompletionHours: 3,
                release_date: getRelDate(-20),
                dueDate: getRelDate(-10),
                feedback_date: getRelDate(-3),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['COMP101-lo1'],
                coveredCss: ['cs1.1']
            },
            {
                id: 'COMP101-02',
                title: 'Project 1: Text Adventure Game',
                description: 'Create a simple text-based adventure game using conditional logic and functions.',
                assignment_type: 'Individual',
                weight: 20,
                estimatedCompletionHours: 15,
                release_date: getRelDate(-5),
                dueDate: getRelDate(5),
                feedback_date: getRelDate(12),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['COMP101-lo1', 'COMP101-lo2', 'COMP101-lo3'],
                coveredCss: ['cs1.1', 'cs1.2', 'cs4.1']
            },
            {
                id: 'COMP101-03',
                title: 'Mid-term Exam (MCQ)',
                description: 'In-class multiple-choice exam covering all topics from weeks 1-6.',
                assignment_type: 'Exam',
                weight: 25,
                estimatedCompletionHours: 8,
                release_date: getRelDate(2),
                dueDate: getRelDate(10),
                feedback_date: getRelDate(17),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['COMP101-lo1'],
                coveredCss: ['cs1.1']
            },
            {
                id: 'COMP101-04',
                title: 'Project 2: Data Analyzer',
                description: 'Write a program that reads data from a file, performs calculations, and outputs a summary.',
                assignment_type: 'Individual',
                weight: 25,
                estimatedCompletionHours: 20,
                release_date: getRelDate(15),
                dueDate: getRelDate(25),
                feedback_date: getRelDate(32),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['COMP101-lo2', 'COMP101-lo3'],
                coveredCss: ['cs1.2', 'cs4.1']
            }
        ]
    },
    {
        code: 'MATH101',
        name: 'Calculus I',
        descriptor: 'Introduction to differential and integral calculus. Topics include limits, derivatives, and integrals of single-variable functions.',
        ectsCredits: 10,
        formalInstructionHours: 60,
        lecturer: { name: 'Dr. Evelyn Carter', email: 'e.carter@university.edu' },
        learningOutcomes: [
            { id: 'MATH101-lo1', text: 'Compute limits and derivatives of functions.' },
            { id: 'MATH101-lo2', text: 'Apply differentiation to solve optimization and related rates problems.' },
            { id: 'MATH101-lo3', text: 'Compute basic indefinite and definite integrals.' }
        ],
        criticalSkills: ['cs1.1', 'cs1.2'],
        assignments: [
            {
                id: 'MATH101-01',
                title: 'Problem Set 1: Limits',
                description: 'A set of problems on computing limits and understanding continuity.',
                assignment_type: 'Individual',
                weight: 10,
                estimatedCompletionHours: 10,
                release_date: getRelDate(-15),
                dueDate: getRelDate(-2),
                feedback_date: getRelDate(5),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['MATH101-lo1'],
                coveredCss: ['cs1.2']
            },
            {
                id: 'MATH101-02',
                title: 'Mid-term Exam 1',
                description: 'In-class exam covering limits and derivatives.',
                assignment_type: 'Exam',
                weight: 30,
                estimatedCompletionHours: 15,
                release_date: getRelDate(-2),
                dueDate: getRelDate(12),
                feedback_date: getRelDate(19),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['MATH101-lo1', 'MATH101-lo2'],
                coveredCss: ['cs1.1', 'cs1.2']
            }
        ]
    },
    {
        code: 'DESN101',
        name: 'Design Thinking',
        descriptor: 'An introduction to the human-centered design thinking process. Students will work in teams to empathize with users, define problems, ideate solutions, and build low-fidelity prototypes.',
        ectsCredits: 5,
        formalInstructionHours: 36,
        lecturer: { name: 'Dr. Ian Malcolm', email: 'i.malcolm@university.edu' },
        learningOutcomes: [
            { id: 'DESN101-lo1', text: 'Apply the design thinking process (Empathize, Define, Ideate, Prototype, Test) to a real-world problem.' },
            { id: 'DESN101-lo2', text: 'Conduct user research and synthesize findings to define a problem statement.' },
            { id: 'DESN101-lo3', text: 'Create and test low-fidelity prototypes to gather user feedback.' }
        ],
        criticalSkills: ['cs1.1', 'cs2.1', 'cs3.1', 'cs4.1', 'cs4.2'],
        assignments: [
            {
                id: 'DESN101-01',
                title: 'Phase 1: Empathize & Define',
                description: 'Conduct user interviews and observations. Synthesize findings into personas and a clear problem statement.',
                assignment_type: 'Group',
                weight: 30,
                estimatedCompletionHours: 20,
                release_date: getRelDate(-10),
                dueDate: getRelDate(4),
                feedback_date: getRelDate(10),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['DESN101-lo1', 'DESN101-lo2'],
                coveredCss: ['cs1.1', 'cs2.1', 'cs3.1']
            },
            {
                id: 'DESN101-02',
                title: 'Phase 2: Ideate & Prototype',
                description: 'Brainstorm a wide range of solutions. Create a low-fidelity paper prototype for your chosen concept.',
                assignment_type: 'Group',
                weight: 30,
                estimatedCompletionHours: 20,
                release_date: getRelDate(5),
                dueDate: getRelDate(18),
                feedback_date: getRelDate(25),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['DESN101-lo1', 'DESN101-lo3'],
                coveredCss: ['cs3.1', 'cs4.1', 'cs4.2']
            }
        ]
    },
    {
        code: 'MGMT201',
        name: 'Organizational Behaviour',
        descriptor: 'Examines the impact of individuals, groups, and structures on behavior within organizations.',
        ectsCredits: 5,
        formalInstructionHours: 24,
        lecturer: { name: 'Dr. Sarah Connor', email: 's.connor@university.edu' },
        learningOutcomes: [
            { id: 'MGMT201-lo1', text: 'Analyze how individual and group dynamics affect organizational performance.' }
        ],
        criticalSkills: ['cs1.1', 'cs2.1', 'cs2.2', 'cs3.1'],
        assignments: [
            {
                id: 'MGMT201-01',
                title: 'Case Study Analysis 1',
                description: 'Analyze a case study on team dynamics and write a 1500-word report.',
                assignment_type: 'Individual',
                weight: 25,
                estimatedCompletionHours: 15,
                release_date: getRelDate(-1),
                dueDate: getRelDate(14),
                feedback_date: getRelDate(21),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['MGMT201-lo1'],
                coveredCss: ['cs1.1', 'cs2.2']
            }
        ]
    },
    {
        code: 'PHIL301',
        name: 'Ethics of AI',
        descriptor: 'An exploration of the ethical dilemmas presented by artificial intelligence.',
        ectsCredits: 5,
        formalInstructionHours: 24,
        lecturer: { name: 'Dr. Kenji Tanaka', email: 'k.tanaka@university.edu' },
        learningOutcomes: [
            { id: 'PHIL301-lo1', text: 'Identify and articulate key ethical frameworks.' }
        ],
        criticalSkills: ['cs1.1', 'cs2.1', 'cs4.3'],
        assignments: [
            {
                id: 'PHIL301-01',
                title: 'Reflective Essay: Algorithmic Bias',
                description: 'Write a 2000-word essay on a real-world example of algorithmic bias.',
                assignment_type: 'Essay',
                weight: 100,
                estimatedCompletionHours: 25,
                release_date: getRelDate(10),
                dueDate: getRelDate(30),
                feedback_date: getRelDate(45),
                pdf_descriptor: '#',
                pdf_rubric: '#',
                feedback_pdf: null,
                coveredLos: ['PHIL301-lo1'],
                coveredCss: ['cs1.1', 'cs2.1', 'cs4.3']
            }
        ]
    }
];

// --- All Lecturers ---
const LECTURERS_LIST = [
    { name: 'Dr. Evelyn Carter', email: 'e.carter@university.edu' },
    { name: 'Prof. Ben Zhao', email: 'b.zhao@university.edu' },
    { name: 'Dr. Ian Malcolm', email: 'i.malcolm@university.edu' },
    { name: 'Dr. Sarah Connor', email: 's.connor@university.edu' },
    { name: 'Dr. Kenji Tanaka', email: 'k.tanaka@university.edu' }
];

// --- Student Profiles (for prototyping) ---
const STUDENTS_LIST = [
    { name: 'Alex Johnson (Default User)', id: 'default' },
    { name: 'Maria Garcia', id: 'student-profile-2' },
    { name: 'Chen Wei', id: 'student-profile-3' },
    { name: 'Sarah O\'Brien', id: 'student-profile-4' }
];

// --- Utility Functions ---

const getCriticalSkillById = (id) => {
    for (const category of CRITICAL_SKILLS_LIST) {
        const skill = category.skills.find(s => s.id === id);
        if (skill) return skill;
    }
    return null;
};

const getAssignmentStatus = (dueDate, isCompleted) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (isCompleted) {
        return { text: 'Complete', color: 'bg-teal-600', hex: '#0d9488', icon: 'M5 13l4 4L19 7', days: -9999, isUrgent: false };
    }
    if (daysUntilDue < 0) {
        return { text: 'Overdue', color: 'bg-red-500', hex: '#ef4444', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', days: daysUntilDue, isUrgent: true };
    }
    if (daysUntilDue === 0) {
        return { text: 'Due Today', color: 'bg-orange-500', hex: '#f97316', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', days: 0, isUrgent: true };
    }
    if (daysUntilDue <= 7) {
        return { text: `Due in ${daysUntilDue} days`, color: 'bg-yellow-500', hex: '#f59e0b', icon: 'M12 8v4l3 3', days: daysUntilDue, isUrgent: true };
    }
    return { text: `Due in ${daysUntilDue} days`, color: 'bg-indigo-500', hex: '#6366f1', icon: 'M12 8v4l3 3', days: daysUntilDue, isUrgent: false };
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const dateToInputFormat = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// --- SHARED SUB-COMPONENTS ---

const SkillTag = ({ id, text, type }) => {
    const color = type === 'lo' 
        ? 'bg-indigo-100 text-indigo-800' 
        : 'bg-teal-100 text-teal-800';
    const shortText = type === 'lo' 
        ? id.split('-')[1].toUpperCase()
        : getCriticalSkillById(id)?.short || 'CS?';
        
    return (
        <span 
            className={`px-2 py-0.5 text-xs font-semibold rounded-full cursor-pointer ${color} whitespace-nowrap`}
            title={text || 'Unknown'}
        >
            {shortText}
        </span>
    );
};

const DetailItem = ({ label, value, highlight = false, className = '' }) => (
    <div>
        <span className="block text-xs font-medium text-gray-500">{label}</span>
        <span className={`block font-semibold ${highlight ? 'text-indigo-600 text-lg' : 'text-gray-800'} ${className}`}>{value}</span>
    </div>
);

const MetricCard = ({ title, value, icon, color, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white p-5 rounded-xl shadow-lg flex items-center space-x-4 cursor-pointer hover:shadow-xl transition-shadow"
    >
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20`, color: color }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AssignmentRow = ({ moduleCode, assignment, onToggleCompleted, onClick }) => {
    const { id, title, moduleName, dueDate, weight, estimatedCompletionHours, completed } = assignment;
    const status = getAssignmentStatus(dueDate, completed);

    return (
        <div className="flex items-center p-4 hover:bg-gray-50 rounded-lg">
            <div className="w-5 mr-4 ml-1.5">
                <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => {
                        e.stopPropagation();
                        onToggleCompleted(moduleCode, id);
                    }}
                    className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
            </div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onClick(assignment, moduleCode)}>
                <p className="font-semibold text-gray-800 truncate">{title}</p>
                <p className="text-sm text-gray-500 truncate">{moduleCode} - {moduleName}</p>
            </div>
            <div className="hidden sm:block w-24 text-center text-sm text-gray-600">
                {weight}% / {estimatedCompletionHours}h
            </div>
            <div className="hidden sm:block w-24 text-center text-sm text-gray-600">{formatDate(dueDate)}</div>
            <div className="w-40 ml-4 flex items-center">
                <span className={`w-3 h-3 rounded-full ${status.color} mr-2`}></span>
                <span className="text-sm font-medium text-gray-700">{status.text}</span>
            </div>
            <div className="w-5 ml-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </div>
        </div>
    );
};

const WeeklyTimeline = ({ groupedAssignments, onOpenAssignmentDetail }) => {
    const weekKeys = Object.keys(groupedAssignments).sort((a, b) => a - b);
    if (weekKeys.length === 0) {
        return (
             <div className="mt-10 bg-white rounded-xl shadow-2xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Pressure View</h2>
                <p className="text-gray-500 italic text-center">No upcoming assignments to display in the timeline.</p>
            </div>
        );
    }

    const PRESSURE_LEVELS = { MODERATE: 40, EXCEPTIONAL: 60 };

    const getPressureInfo = (totalHours) => {
        if (totalHours >= PRESSURE_LEVELS.EXCEPTIONAL) {
            return {
                level: 'Exceptional Pressure',
                color: 'text-red-700',
                bg: 'bg-red-50 border-red-200',
                alertBg: 'bg-red-100 border-red-500',
                alertText: 'text-red-800',
                icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            };
        }
        if (totalHours >= PRESSURE_LEVELS.MODERATE) {
            return {
                level: 'Moderate Pressure',
                color: 'text-yellow-700',
                bg: 'bg-yellow-50 border-yellow-200',
                alertBg: 'bg-yellow-100 border-yellow-500',
                alertText: 'text-yellow-800',
                icon: 'M12 9v2m0 4h.01'
            };
        }
        return {
            level: 'Low Pressure',
            color: 'text-green-700',
            bg: 'bg-gray-50 border-gray-200',
            alertBg: null, alertText: null, icon: null
        };
    };

    return (
        <div className="mt-10 bg-white rounded-xl shadow-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Pressure View</h2>
            <div className="flex space-x-6 overflow-x-auto pb-4">
                {weekKeys.map(week => {
                    const weeklyAssignments = groupedAssignments[week];
                    const totalHours = weeklyAssignments.reduce((sum, a) => sum + a.estimatedCompletionHours, 0);
                    const pressureInfo = getPressureInfo(totalHours);
                    
                    return (
                        <div key={week} className={`w-80 flex-shrink-0 p-4 rounded-lg border ${pressureInfo.bg}`}>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-gray-700">Week {week}</h3>
                                <span className={`text-xs font-bold ${pressureInfo.color}`}>{pressureInfo.level}</span>
                            </div>

                            {pressureInfo.alertBg && (
                                <div className={`p-3 rounded-lg border-l-4 ${pressureInfo.alertBg} ${pressureInfo.alertText} mb-3`} role="alert">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d={pressureInfo.icon} clipRule="evenodd" /></svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-semibold">{pressureInfo.level} Alert</p>
                                            <p className="text-xs mt-1">Total estimated time is <b>{totalHours} hours</b>.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {weeklyAssignments.map(a => {
                                    const status = getAssignmentStatus(a.dueDate, a.completed);
                                    return (
                                        <div 
                                            key={a.id} 
                                            onClick={() => onOpenAssignmentDetail(a, a.moduleCode)} 
                                            className="p-3 bg-white rounded-md shadow-sm border-l-4 cursor-pointer hover:shadow-lg transition-shadow" 
                                            style={{ borderColor: status.hex }}
                                            title={`Click to view details for "${a.title}"`}
                                        >
                                            <p className="font-semibold text-sm text-gray-800 truncate">{a.title}</p>
                                            <p className="text-xs text-gray-500">{a.moduleCode} | {status.text}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-1">{a.estimatedCompletionHours} Estimated Hours</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ModuleSummaryCard = ({ module, onClick }) => {
    const totalWeight = (module.assignments || []).reduce((sum, a) => sum + a.weight, 0);
    const totalWorkloadHours = (module.ectsCredits || 0) * HOURS_PER_ECTS;
    const formalHours = module.formalInstructionHours || 0;
    const totalAssignmentHours = (module.assignments || []).reduce((sum, a) => sum + (a.estimatedCompletionHours || 0), 0);
    const availableAssignmentHours = totalWorkloadHours - formalHours;
    const timeBudgetSurplus = availableAssignmentHours - totalAssignmentHours;

    let progressColor = '#4f46e5';
    if (totalWeight > 100) { progressColor = '#ef4444'; } 
    else if (totalWeight === 100) { progressColor = '#10b981'; }
    
    const progressWidth = Math.min(100, totalWeight);

    let timeColor = 'text-gray-500';
    if (timeBudgetSurplus < 0) { timeColor = 'text-red-600'; } 
    else if (timeBudgetSurplus < (availableAssignmentHours * 0.1)) { timeColor = 'text-yellow-600'; } 
    else { timeColor = 'text-green-600'; }

    return (
        <div 
            onClick={() => onClick(module)} 
            className={`bg-white p-5 rounded-xl shadow-lg flex flex-col justify-between transition-shadow hover:shadow-xl cursor-pointer ${module.isTracked ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
        >
            <div>
                <h3 className="text-lg font-bold text-gray-800">{module.code} - {module.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{module.ectsCredits} ECTS | {(module.assignments || []).length} assignments</p>
                {!module.isTracked && <span className="text-xs font-bold text-red-600">(Not Tracked)</span>}
                
                <div className="mt-4 space-y-3">
                    <div className='border-b pb-3 border-gray-100'>
                        <p className="text-sm font-bold text-gray-600 mb-2">Weighting Status</p>
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-700">Total Assigned Weight</span>
                            <span className={`font-bold ${totalWeight > 100 ? 'text-red-500' : 'text-indigo-600'}`}>{totalWeight}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className={`h-2 rounded-full`} style={{ width: `${progressWidth}%`, backgroundColor: progressColor }}></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-600 mb-2">Time Budget</p>
                        <div className="flex justify-between text-xs text-gray-600"><span>Available for Assignments:</span><span className='font-semibold'>{availableAssignmentHours} Hrs</span></div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1"><span>Total Assigned Time:</span><span className='font-semibold'>{totalAssignmentHours} Hrs</span></div>
                        <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-100">
                            <span className="flex items-center">
                                Surplus/Deficit (Self-Study):
                                <span 
                                    className="ml-1 text-gray-400 cursor-help"
                                    title="Difference between 'Available Assignment Time' and 'Lecturer's Total Estimated Time'."
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                </span>
                            </span>
                            <span className={timeColor}>{timeBudgetSurplus} Hrs</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end">
                <p className="text-xs text-gray-400">Click card for details</p>
            </div>
        </div>
    );
};

const ModuleWorkloadBreakdown = ({ module }) => {
    const { ectsCredits, formalInstructionHours, assignments } = module;
    const totalWorkloadHours = (ectsCredits || 0) * HOURS_PER_ECTS;
    const formalHours = formalInstructionHours || 0;
    const totalAssignmentHours = (assignments || []).reduce((sum, a) => sum + (a.estimatedCompletionHours || 0), 0);
    const availableAssignmentHours = totalWorkloadHours - formalHours;
    const timeBudgetSurplus = availableAssignmentHours - totalAssignmentHours;

    let timeBudgetColor = 'text-green-600';
    if (timeBudgetSurplus < 0) { timeBudgetColor = 'text-red-600'; } 
    else if (timeBudgetSurplus < (availableAssignmentHours * 0.1)) { timeBudgetColor = 'text-yellow-600'; }

    return (
        <div className="p-4 bg-indigo-50 rounded-lg mb-6 border border-indigo-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Module Workload Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailItem label="ECTS Credits" value={`${ectsCredits} ECTS`} />
                <DetailItem label="Total Workload" value={`${totalWorkloadHours} Hours`} />
                <DetailItem label="Formal Instruction Hours" value={`${formalHours} Hours`} />
                <DetailItem label="Available Time for Assignments/Self-Study" value={`${availableAssignmentHours} Hours`} highlight={true} />
                <div className="col-span-2 mt-2 pt-2 border-t border-indigo-200">
                    <DetailItem label="Total Time Assigned (Lecturer Estimate)" value={`${totalAssignmentHours} Hours`} />
                </div>
                <div className="col-span-2 mt-2 pt-2 border-t border-indigo-200">
                    <div>
                        <span className="flex items-center text-xs font-medium text-gray-500">
                            Surplus/Deficit (Self-Study)
                        </span>
                        <span className={`block font-semibold text-indigo-600 text-lg ${timeBudgetColor}`}>{timeBudgetSurplus} Hours</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODAL & PANEL COMPONENTS ---

const AssignmentDetailModal = ({ assignment, onClose, onToggleCompleted }) => {
    if (!assignment) return null;
    const { 
        title, moduleName, moduleCode, description, dueDate, weight, estimatedCompletionHours, 
        release_date, feedback_date, assignment_type, completed, pdf_descriptor, pdf_rubric, 
        feedback_pdf, coveredLos = [], coveredCss = [], moduleLearningOutcomes = [] 
    } = assignment;

    const allLos = moduleLearningOutcomes;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 sm:p-8">
                    {/* --- Header --- */}
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
                            <p className="text-lg font-semibold text-indigo-600">{moduleName} ({moduleCode})</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* --- Description --- */}
                    <p className="text-gray-600 mb-6">{description}</p>
                    
                    {/* --- Details Grid --- */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4 border-t border-b py-5 mb-5">
                        <DetailItem label="Submission Date" value={formatDate(dueDate)} />
                        <DetailItem label="Weighting" value={`${weight}%`} />
                        <DetailItem label="Est. Completion Time" value={`${estimatedCompletionHours} Hours`} />
                        <DetailItem label="Release Date" value={formatDate(release_date)} />
                        <DetailItem label="Expected Feedback" value={formatDate(feedback_date)} />
                        <DetailItem label="Assignment Type" value={assignment_type} />
                    </div>

                    {/* --- LOs and CSs --- */}
                    <div className="mb-5">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Learning Outcomes & Critical Skills Covered</h4>
                        <div className="flex flex-wrap gap-2">
                            {(coveredLos || []).map(loId => {
                                const lo = (allLos || []).find(l => l.id === loId);
                                return lo ? <SkillTag key={lo.id} id={lo.id} text={lo.text} type="lo" /> : null;
                            })}
                            {(coveredCss || []).map(csId => {
                                const cs = getCriticalSkillById(csId);
                                return cs ? <SkillTag key={cs.id} id={cs.id} text={cs.text} type="cs" /> : null;
                            })}
                        </div>
                    </div>
                    
                    {/* --- Links --- */}
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                        {pdf_descriptor && (
                            <a href={pdf_descriptor} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-800 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Assignment PDF
                            </a>
                        )}
                        {pdf_rubric && (
                            <a href={pdf_rubric} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-800 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                Rubric PDF
                            </a>
                        )}
                         {feedback_pdf && (
                            <a href={feedback_pdf} target="_blank" rel="noopener noreferrer" className="flex items-center text-teal-600 hover:text-teal-800 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3v-3h5a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                View Feedback
                            </a>
                        )}
                    </div>

                    {/* --- Action Button (Student only) --- */}
                    {onToggleCompleted && (
                        <div className="mt-6 pt-4 border-t">
                            <button
                                onClick={() => {
                                    onToggleCompleted(moduleCode, assignment.id);
                                    onClose();
                                }}
                                className={`w-full py-2 rounded-lg font-bold text-white transition duration-200 shadow-md ${completed ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-600 hover:bg-teal-700'}`}
                            >
                                {completed ? 'Mark as INCOMPLETE' : 'Mark as COMPLETE'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ModuleDetailModal = ({ module, onClose, onToggleTracked, onSelectAssignment, onRemoveFromWatchlist }) => {
    if (!module) return null;
    
    const { learningOutcomes = [], criticalSkills = [], assignments = [] } = module;
    const allSkills = CRITICAL_SKILLS_LIST.flatMap(c => c.skills);
    
    const groupedSkills = (criticalSkills || []).reduce((acc, skillId) => {
        const skill = allSkills.find(s => s.id === skillId);
        if (!skill) return acc;
        const category = CRITICAL_SKILLS_LIST.find(c => c.skills.some(s => s.id === skillId))?.category;
        if (!category) return acc;
        if (!acc[category]) { acc[category] = []; }
        acc[category].push(skill);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all" 
                onClick={e => e.stopPropagation()}
            >
                {/* --- Header --- */}
                <div className="p-6 sm:p-8 border-b">
                    <div className="flex justify-between items-start mb-1">
                        <h2 className="text-3xl font-bold text-gray-800">{module.code} - {module.name}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-md text-gray-500">Lecturer: <span className="font-semibold text-gray-600">{(module.lecturer || {}).name || 'N/A'}</span></p>
                </div>

                <div className="p-6 sm:p-8">
                    {/* --- Descriptor --- */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Module Descriptor</h3>
                    <div className="p-4 bg-gray-50 rounded-lg text-gray-600 mb-6 border border-gray-200">
                        {module.descriptor || 'No descriptor available.'}
                    </div>

                    {/* --- Workload --- */}
                    <ModuleWorkloadBreakdown module={module} />

                    {/* --- Learning Outcomes --- */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Learning Outcomes</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                        {learningOutcomes.length > 0 ? (
                            learningOutcomes.map(lo => (
                                <li key={lo.id}><span className="font-semibold mr-1">[{lo.id.split('-')[1].toUpperCase()}]:</span>{lo.text}</li>
                            ))
                        ) : (<p className="text-gray-500 italic">No learning outcomes listed.</p>)}
                    </ul>

                    {/* --- Critical Skills --- */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Critical Skills Gained</h3>
                    <div className="space-y-3 mb-6">
                        {Object.keys(groupedSkills).length > 0 ? (
                            Object.entries(groupedSkills).map(([category, skills]) => (
                                <div key={category}>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase">{category}</h4>
                                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 mt-1">
                                        {skills.map(skill => (
                                            <li key={skill.id}>{skill.text.split(': ')[1]}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (<p className="text-gray-500 italic">No critical skills listed for this module.</p>)}
                    </div>
                    
                    {/* --- Assignments --- */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-2 border-t pt-4">Module Assignments</h3>
                    <div className="space-y-2">
                        {assignments.length > 0 ? (
                            assignments.map(assignment => (
                                <div key={assignment.id} onClick={() => onSelectAssignment(assignment)} className="p-3 bg-white border rounded-lg flex justify-between items-center cursor-pointer hover:shadow-md transition">
                                    <div>
                                        <p className="font-semibold text-indigo-700">{assignment.title}</p>
                                        <p className="text-sm text-gray-500">Due: {formatDate(assignment.dueDate)} | Weight: {assignment.weight}% ({assignment.estimatedCompletionHours} Hrs)</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(assignment.coveredLos || []).map(loId => <SkillTag key={loId} id={loId} text={learningOutcomes.find(l => l.id === loId)?.text} type="lo" />)}
                                        {(assignment.coveredCss || []).map(csId => <SkillTag key={csId} id={csId} text={getCriticalSkillById(csId)?.text} type="cs" />)}
                                    </div>
                                </div>
                            ))
                        ) : (<p className="text-gray-500 italic">No assignments listed for this module.</p>)}
                    </div>
                </div>

                {/* --- Footer Action --- */}
                <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t rounded-b-xl space-y-3">
                    <button
                        onClick={() => {
                            onToggleTracked(module.code);
                            onClose();
                        }}
                        className={`w-full py-2 rounded-lg font-bold text-white transition duration-200 shadow-md ${module.isTracked ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {module.isTracked ? 'Untrack Module' : 'Track This Module'}
                    </button>
                    <button
                        onClick={() => {
                            if (onRemoveFromWatchlist) {
                                onRemoveFromWatchlist(module.code);
                            }
                            onClose();
                        }}
                        className="w-full py-2 rounded-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition duration-200"
                    >
                        Remove from Watchlist
                    </button>
                </div>
            </div>
        </div>
    );
};

const LecturerModuleManagementPanel = ({ module, onClose, onEditModule, onSaveLos, onSaveSkills, onOpenAssignmentEditor, onDeleteAssignment, onUploadFeedback }) => {
    if (!module) return null;
    
    const [isLoModalOpen, setIsLoModalOpen] = useState(false);
    const [isCsModalOpen, setIsCsModalOpen] = useState(false);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[70] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all" onClick={e => e.stopPropagation()}>
                {/* --- Panel Header --- */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-indigo-600">Managing Module</p>
                            <h2 className="text-3xl font-bold text-gray-800">{module.code} - {module.name}</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                
                <div className="p-6">
                    {/* --- Module Details --- */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xl font-semibold text-gray-700">Module Details</h3>
                            <button onClick={() => onEditModule(module)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{module.descriptor}</p>
                        <div className="grid grid-cols-3 gap-4">
                            <DetailItem label="ECTS Credits" value={module.ectsCredits} />
                            <DetailItem label="Formal Hours" value={module.formalInstructionHours} />
                            <DetailItem label="Module Code" value={module.code} />
                        </div>
                    </div>
                    
                    {/* --- WORKLOAD BREAKDOWN --- */}
                    <div className="mb-6">
                        <ModuleWorkloadBreakdown module={module} />
                    </div>
                    
                    {/* --- LOs and CSs --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-semibold text-gray-700">Learning Outcomes</h3>
                                <button onClick={() => setIsLoModalOpen(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 max-h-40 overflow-y-auto pr-2">
                                {(module.learningOutcomes || []).map(lo => <li key={lo.id}><b>{lo.id.split('-')[1].toUpperCase()}:</b> {lo.text}</li>) || <li>No LOs.</li>}
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-semibold text-gray-700">Critical Skills</h3>
                                <button onClick={() => setIsCsModalOpen(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 max-h-40 overflow-y-auto pr-2">
                                {(module.criticalSkills || []).map(csId => {
                                    const skill = getCriticalSkillById(csId);
                                    return <li key={csId}><b>{skill?.short}:</b> {(skill?.text || '').split(': ')[1]}</li>
                                }) || <li>No Skills.</li>}
                            </ul>
                        </div>
                    </div>

                    {/* --- Assignments --- */}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-700">Assignments</h3>
                        <button onClick={() => onOpenAssignmentEditor({}, module.code)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 shadow-sm transition text-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add New
                        </button>
                    </div>
                    <div className="space-y-3">
                        {(module.assignments || []).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).map(assignment => (
                            <div key={assignment.id} className="p-4 border rounded-lg shadow-sm bg-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">{assignment.title}</p>
                                        <p className="text-sm text-gray-500">Weight: {assignment.weight}% | Due: {formatDate(assignment.dueDate)} | Est. {assignment.estimatedCompletionHours} Hrs</p>
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                        <button onClick={() => onOpenAssignmentEditor(assignment, module.code)} className="text-blue-600 p-1 hover:bg-blue-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                        <button onClick={() => onDeleteAssignment(assignment.id, module.code)} className="text-red-600 p-1 hover:bg-red-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                    <div className="flex flex-wrap gap-2">
                                        {(assignment.coveredLos || []).map(loId => <SkillTag key={loId} id={loId} text={(module.learningOutcomes || []).find(l => l.id === loId)?.text} type="lo" />)}
                                        {(assignment.coveredCss || []).map(csId => <SkillTag key={csId} id={csId} text={getCriticalSkillById(csId)?.text} type="cs" />)}
                                    </div>
                                    {assignment.feedback_pdf ? (
                                        <span className="text-sm font-semibold text-green-600 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>Feedback Uploaded</span>
                                    ) : (
                                        <button onClick={() => onUploadFeedback(assignment.id, module.code)} className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            Upload Feedback
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* --- Child Modals --- */}
            {isLoModalOpen && <LearningOutcomeEditorModal module={module} onSave={onSaveLos} onClose={() => setIsLoModalOpen(false)} />}
            {isCsModalOpen && <CriticalSkillsEditorModal module={module} onSave={onSaveSkills} onClose={() => setIsCsModalOpen(false)} />}
        </div>
    );
};

const ShareModuleModal = ({ module, onClose }) => {
    const [copied, setCopied] = useState(false);
    const code = module.code;

    const handleCopy = () => {
        try {
            const ta = document.createElement('textarea');
            ta.value = code;
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
        }
    };

    return (
        <LecturerModal title="Share Module" onClose={onClose} maxWidth="max-w-md">
            <p className="text-sm text-gray-600 mb-4">Students can use this code to track your module. Share it via email or your course announcement page.</p>
            <div className="flex items-center space-x-2">
                <input type="text" readOnly value={code} className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg font-mono text-lg text-gray-800" />
                <button 
                    onClick={handleCopy} 
                    className={`px-4 py-3 rounded-lg font-semibold transition ${copied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white w-28 text-center`}
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </LecturerModal>
    );
};

// --- LECTURER VIEW COMPONENTS ---

const LecturerEventRow = ({ event, onClick }) => {
    const eventTypes = {
        release: { label: 'Assignment Release', color: 'blue', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0' },
        submission: { label: 'Submissions Due', color: 'orange', icon: 'M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2h-4a2 2 0 00-2 2z' },
        feedback: { label: 'Feedback Due', color: 'teal', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    };
    
    let typeInfo = eventTypes[event.type];
    let customLabel = typeInfo.label;
    
    const colorClasses = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
        orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' },
        teal: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-500' },
        red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
    };

    let classes = colorClasses[typeInfo.color];
    
    if(event.isMissed) {
        classes = colorClasses.red;
        customLabel = 'FEEDBACK OVERDUE';
    }

    return (
        <div 
            className={`flex items-center p-3 rounded-lg border-l-4 ${classes.bg} ${classes.border} ${event.isPast ? 'opacity-60' : ''} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={onClick ? () => onClick(event) : undefined}
        >
            <div className={`p-2 rounded-full ${classes.text}`} style={{ backgroundColor: classes.bg.replace('100', '200')}}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={typeInfo.icon} /></svg>
            </div>
            <div className="flex-1 ml-4 min-w-0">
                <p className={`font-semibold truncate ${classes.text}`}>{event.assignment.title}</p>
                <p className="text-xs text-gray-500">{event.module.code}</p>
            </div>
            <div className="hidden sm:block w-32 text-center text-sm font-medium text-gray-600">{formatDate(event.date)}</div>
            <div className={`w-36 text-right text-xs font-bold uppercase ${classes.text}`}>{customLabel}</div>
        </div>
    );
};

const LecturerTimeline = ({ modules, onEventClick }) => {
    const [showPastEvents, setShowPastEvents] = useState(false);

    const { upcomingEvents, pastEvents } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const allEvents = [];
        modules.forEach(module => {
            (module.assignments || []).forEach(assignment => {
                if (assignment.release_date) allEvents.push({ type: 'release', date: assignment.release_date, assignment, module });
                if (assignment.dueDate) allEvents.push({ type: 'submission', date: assignment.dueDate, assignment, module });
                if (assignment.feedback_date) allEvents.push({ type: 'feedback', date: assignment.feedback_date, assignment, module });
            });
        });
        
        const upcoming = [];
        const past = [];

        allEvents.forEach(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0,0,0,0);
            if (eventDate >= today) {
                upcoming.push(event);
            } else {
                event.isPast = true;
                if (event.type === 'feedback' && !event.assignment.feedback_pdf) {
                    event.isMissed = true;
                }
                past.push(event);
            }
        });
        
        return { 
            upcomingEvents: upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)),
            pastEvents: past.sort((a, b) => new Date(b.date) - new Date(a.date)) 
        };
    }, [modules]);
    
    return (
        <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Upcoming Deadlines & Key Dates</h2>
            <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event, index) => <LecturerEventRow key={`up-${index}`} event={event} onClick={onEventClick} />)
                ) : (
                    <p className="text-center text-gray-500 italic p-4">No upcoming key dates found.</p>
                )}
            </div>

            <div className="mt-6 border-t pt-4">
                <button onClick={() => setShowPastEvents(!showPastEvents)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                   {showPastEvents ? 'Hide' : 'Show'} Past Events
                   <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-1 transition-transform ${showPastEvents ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {showPastEvents && (
                    <div className="mt-4 space-y-3">
                        {pastEvents.length > 0 ? (
                            pastEvents.map((event, index) => <LecturerEventRow key={`past-${index}`} event={event} onClick={onEventClick} />)
                        ) : (
                            <p className="text-center text-gray-500 italic p-4">No past events found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const LecturerModuleCard = ({ module, onManage, onShare }) => {
    const totalWeight = (module.assignments || []).reduce((sum, a) => sum + a.weight, 0);
    const totalWorkloadHours = (module.ectsCredits || 0) * HOURS_PER_ECTS;
    const formalHours = module.formalInstructionHours || 0;
    const totalAssignmentHours = (module.assignments || []).reduce((sum, a) => sum + (a.estimatedCompletionHours || 0), 0);
    const availableAssignmentHours = totalWorkloadHours - formalHours;
    const timeBudgetSurplus = availableAssignmentHours - totalAssignmentHours;

    let progressColor = '#4f46e5';
    if (totalWeight > 100) { progressColor = '#ef4444'; } 
    else if (totalWeight === 100) { progressColor = '#10b981'; }
    
    const progressWidth = Math.min(100, totalWeight);

    let timeColor = 'text-gray-500';
    if (timeBudgetSurplus < 0) { timeColor = 'text-red-600'; } 
    else if (timeBudgetSurplus < (availableAssignmentHours * 0.1)) { timeColor = 'text-yellow-600'; } 
    else { timeColor = 'text-green-600'; }

    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 flex flex-col justify-between hover:shadow-xl transition-shadow cursor-pointer" style={{ borderColor: progressColor }} onClick={() => onManage(module)}>
            <div>
                <h3 className="text-lg font-bold text-gray-800">{module.code} - {module.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{module.ectsCredits} ECTS | {(module.assignments || []).length} assignments</p>
                
                <div className="mt-4 space-y-3">
                    <div className='border-b pb-3 border-gray-100'>
                        <p className="text-sm font-bold text-gray-600 mb-2">Weighting Status</p>
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-700">Total Assigned Weight</span>
                            <span className={`font-bold ${totalWeight > 100 ? 'text-red-500' : 'text-indigo-600'}`}>{totalWeight}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div className={`h-2 rounded-full`} style={{ width: `${progressWidth}%`, backgroundColor: progressColor }}></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-600 mb-2">Time Budget</p>
                        <div className="flex justify-between text-xs text-gray-600"><span>Available for Assignments:</span><span className='font-semibold'>{availableAssignmentHours} Hrs</span></div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1"><span>Total Assigned Time:</span><span className='font-semibold'>{totalAssignmentHours} Hrs</span></div>
                        <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-100">
                            <span className="flex items-center">
                                Surplus/Deficit (Self-Study):
                            </span>
                            <span className={timeColor}>{timeBudgetSurplus} Hrs</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button onClick={(e) => { e.stopPropagation(); onShare(module); }} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition">Share Link</button>
                <p className="text-xs text-gray-400">Click card to manage</p>
            </div>
        </div>
    );
};

const LecturerModal = ({ children, title, onClose, maxWidth = "max-w-2xl" }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-[70] flex items-center justify-center p-4" onClick={onClose}>
        <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto transform transition-all`} onClick={e => e.stopPropagation()}>
            <div className="p-6">
                <div className="flex justify-between items-start border-b pb-3 mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    </div>
);

const FormInput = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={id} {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

const ModuleEditModal = ({ module, onSave, onClose }) => {
    const [formData, setFormData] = useState({ code: '', name: '', ectsCredits: '', formalInstructionHours: '', descriptor: '', ...module });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); onClose(); };
    
    return (
        <LecturerModal title={module.code ? `Edit Module: ${module.code}` : "Create New Module"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Module Code" id="code" name="code" value={formData.code} onChange={handleChange} required disabled={!!module.code} />
                    <FormInput label="Module Name" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    <FormInput label="ECTS Credits" id="ectsCredits" name="ectsCredits" type="number" value={formData.ectsCredits} onChange={handleChange} required />
                    <FormInput label="Formal Instruction Hours" id="formalInstructionHours" name="formalInstructionHours" type="number" value={formData.formalInstructionHours} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="descriptor" className="block text-sm font-medium text-gray-700 mb-1">Module Descriptor</label>
                    <textarea id="descriptor" name="descriptor" rows="4" value={formData.descriptor} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required></textarea>
                </div>
                <div className="flex justify-end pt-4 border-t mt-4 space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 shadow-sm transition">Save Changes</button>
                </div>
            </form>
        </LecturerModal>
    );
};

const AssignmentEditModal = ({ assignment, moduleLos, onSave, onClose }) => {
    const [formData, setFormData] = useState({ title: '', dueDate: '', weight: '', estimatedCompletionHours: '', description: '', release_date: '', feedback_date: '', assignment_type: 'Individual', coveredLos: [], coveredCss: [], ...assignment });
    
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleLoChange = (loId) => {
        setFormData(prev => {
            const currentLos = prev.coveredLos || [];
            const newLos = currentLos.includes(loId) ? currentLos.filter(id => id !== loId) : [...currentLos, loId];
            return { ...prev, coveredLos: newLos };
        });
    };

    const handleCsChange = (csId) => {
        setFormData(prev => {
             const currentCss = prev.coveredCss || [];
            const newCss = currentCss.includes(csId) ? currentCss.filter(id => id !== csId) : [...currentCss, csId];
            return { ...prev, coveredCss: newCss };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            weight: parseInt(formData.weight, 10) || 0,
            estimatedCompletionHours: parseInt(formData.estimatedCompletionHours, 10) || 0,
        });
        onClose();
    };
    
    return (
        <LecturerModal title={assignment.id ? "Edit Assignment" : "Create New Assignment"} onClose={onClose} maxWidth="max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput label="Assignment Title" id="title" name="title" value={formData.title} onChange={handleChange} required />
                <FormInput label="Description" id="description" name="description" value={formData.description} onChange={handleChange} required />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput label="Weight (%)" id="weight" name="weight" type="number" value={formData.weight} onChange={handleChange} required />
                    <FormInput label="Estimated Hours" id="estimatedCompletionHours" name="estimatedCompletionHours" type="number" value={formData.estimatedCompletionHours} onChange={handleChange} required />
                    <FormInput label="Due Date" id="dueDate" name="dueDate" type="date" value={dateToInputFormat(formData.dueDate)} onChange={handleChange} required />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Release Date" id="release_date" name="release_date" type="date" value={dateToInputFormat(formData.release_date)} onChange={handleChange} required />
                    <FormInput label="Feedback Date" id="feedback_date" name="feedback_date" type="date" value={dateToInputFormat(formData.feedback_date)} onChange={handleChange} required />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Covered Learning Outcomes</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-gray-50 border rounded-lg">
                        {(moduleLos || []).map(lo => {
                            const summary = (lo.text || '').split(' ').slice(0, 2).join(' ') + '...';
                            return (
                                <label key={lo.id} className="flex items-center space-x-2 text-sm" title={lo.text}>
                                    <input type="checkbox" checked={(formData.coveredLos || []).includes(lo.id)} onChange={() => handleLoChange(lo.id)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <span>{lo.id.split('-')[1].toUpperCase()} <span className="text-gray-500">({summary})</span></span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Covered Critical Skills</h4>
                    <div className="p-3 bg-gray-50 border rounded-lg max-h-48 overflow-y-auto">
                        {CRITICAL_SKILLS_LIST.map(category => (
                            <div key={category.category} className="mb-2">
                                <h5 className="text-xs font-bold text-gray-500 uppercase mb-1 mt-3 first:mt-0">{category.category}</h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {category.skills.map(skill => {
                                        const summary = skill.text.split(':')[0] || 'Skill';
                                        return (
                                            <label key={skill.id} className="flex items-center space-x-2 text-sm" title={skill.text}>
                                                <input type="checkbox" checked={(formData.coveredCss || []).includes(skill.id)} onChange={() => handleCsChange(skill.id)} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                                                <span>{skill.short} <span className="text-gray-500">({summary})</span></span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-4 space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 shadow-sm transition">Save Assignment</button>
                </div>
            </form>
        </LecturerModal>
    );
};

const LearningOutcomeEditorModal = ({ module, onSave, onClose }) => {
    const [los, setLos] = useState(module.learningOutcomes || []);
    const [newLoText, setNewLoText] = useState("");

    const handleTextChange = (id, newText) => {
        setLos(currentLos => currentLos.map(lo => lo.id === id ? { ...lo, text: newText } : lo));
    };

    const handleAddLo = () => {
        if (newLoText.trim() === "") return;
        const newLoIdNumber = (los.length > 0 ? Math.max(...los.map(lo => parseInt(lo.id.split('-lo')[1]))) : 0) + 1;
        const newLo = {
            id: `${module.code}-lo${newLoIdNumber}`,
            text: newLoText.trim()
        };
        setLos(currentLos => [...currentLos, newLo]);
        setNewLoText("");
    };

    const handleDeleteLo = (id) => {
        setLos(currentLos => currentLos.filter(lo => lo.id !== id));
    };

    const handleSave = () => {
        onSave(los);
        onClose();
    };

    return (
        <LecturerModal title={`Edit Learning Outcomes for ${module.code}`} onClose={onClose}>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
                {los.map(lo => (
                    <div key={lo.id} className="flex items-center space-x-2">
                        <span className="font-bold text-gray-600">[{lo.id.split('-')[1].toUpperCase()}]:</span>
                        <input type="text" value={lo.text} onChange={(e) => handleTextChange(lo.id, e.target.value)} className="flex-grow px-2 py-1 border border-gray-300 rounded-md shadow-sm" />
                        <button onClick={() => handleDeleteLo(lo.id)} className="text-red-500 hover:text-red-700 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                ))}
            </div>
            <div className="flex items-center space-x-2 border-t pt-4">
                <input type="text" value={newLoText} onChange={(e) => setNewLoText(e.target.value)} placeholder="Enter new learning outcome text..." className="flex-grow px-3 py-2 border border-gray-300 rounded-lg shadow-sm" />
                <button onClick={handleAddLo} className="bg-green-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-600 transition">Add</button>
            </div>
            <div className="flex justify-end pt-6 border-t mt-4 space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
                <button type="button" onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 shadow-sm transition">Save Changes</button>
            </div>
        </LecturerModal>
    );
};

const CriticalSkillsEditorModal = ({ module, onSave, onClose }) => {
    const [selectedSkills, setSelectedSkills] = useState(module.criticalSkills || []);

    const handleSkillToggle = (skillId) => {
        setSelectedSkills(prev => 
            prev.includes(skillId) 
                ? prev.filter(s => s !== skillId) 
                : [...prev, skillId]
        );
    };
    
    const handleSave = () => {
        onSave(selectedSkills);
        onClose();
    };

    return (
        <LecturerModal title={`Edit Critical Skills for ${module.code}`} onClose={onClose} maxWidth="max-w-3xl">
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {CRITICAL_SKILLS_LIST.map(category => (
                    <div key={category.category}>
                        <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">{category.category}</h4>
                        <div className="space-y-2">
                            {category.skills.map(skill => {
                                const [title, ...description] = skill.text.split(':');
                                return (
                                    <label key={skill.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedSkills.includes(skill.id)} 
                                            onChange={() => handleSkillToggle(skill.id)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                                        />
                                        <span className="text-sm text-gray-800">
                                            <span className="font-semibold">{title}:</span>
                                            {description.join(':')}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
             <div className="flex justify-end pt-6 border-t mt-4 space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
                <button type="button" onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 shadow-sm transition">Save Skills</button>
            </div>
        </LecturerModal>
    )
};

const LecturerDashboard = ({ modules, lecturer, onCreateModule, onManageModule, onShareModule, onEventClick }) => {
    const lecturerModules = useMemo(() => 
        modules.filter(m => (m.lecturer || {}).email === lecturer.email), 
    [modules, lecturer.email]);

    return (
        <div>
            <LecturerTimeline modules={lecturerModules} onEventClick={onEventClick} />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Modules</h2>
                <button onClick={onCreateModule} className="bg-green-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 shadow-md transition flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Create New Module
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lecturerModules.map(module => (
                    <LecturerModuleCard 
                        key={module.code} 
                        module={module}
                        onManage={onManageModule}
                        onShare={onShareModule}
                    />
                ))}
            </div>
        </div>
    );
}

// --- StudentDashboard Component ---
const StudentDashboard = ({ modules, handleToggleCompleted, handleToggleTracked, handleOpenAssignmentDetail, setSelectedModule, upcomingDeadlinesRef, weeklyPressureRef, moduleSummaryRef, scrollToRef, onAddToWatchlist }) => {
    
    const [moduleCodeInput, setModuleCodeInput] = useState('');
    const [addModuleMsg, setAddModuleMsg] = useState({ text: '', error: false });
    
    const allAssignments = useMemo(() => modules.flatMap(m => (m.assignments || []).map(a => ({ ...a, moduleCode: m.code, moduleName: m.name, isTracked: m.isTracked }))).filter(a => a.isTracked), [modules]);
    const metrics = useMemo(() => {
        const overdueAssignments = allAssignments.filter(a => !a.completed && getAssignmentStatus(a.dueDate, false).days < 0);
        return {
            total: allAssignments.length,
            completed: allAssignments.filter(a => a.completed).length,
            dueToday: allAssignments.filter(a => !a.completed && getAssignmentStatus(a.dueDate, false).days === 0).length,
            overdueCount: overdueAssignments.length,
            overdueWeight: overdueAssignments.reduce((sum, a) => sum + a.weight, 0),
        };
    }, [allAssignments]);
    
    const groupedAssignmentsByWeek = useMemo(() => {
        const groups = {};
        allAssignments.filter(a => !a.completed).forEach(a => {
            const week = getWeekNumber(new Date(a.dueDate));
            if (!groups[week]) { groups[week] = []; }
            groups[week].push(a);
        });
        Object.keys(groups).forEach(week => { groups[week].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); });
        return groups;
    }, [allAssignments]);

    const sortedAssignments = useMemo(() => allAssignments.slice().sort((a, b) => getAssignmentStatus(a.dueDate, a.completed).days - getAssignmentStatus(b.dueDate, b.completed).days), [allAssignments]);
    const sortedModules = useMemo(() => modules.slice().sort((a, b) => (a.isTracked === b.isTracked) ? a.code.localeCompare(b.code) : a.isTracked ? -1 : 1), [modules]);

    const handleAddModule = async (e) => {
        e.preventDefault();
        if (!moduleCodeInput.trim()) return;
        const message = await onAddToWatchlist(moduleCodeInput.trim().toUpperCase());
        setAddModuleMsg(message);
        if (!message.error) {
            setModuleCodeInput('');
        }
        setTimeout(() => setAddModuleMsg({ text: '', error: false }), 3000);
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <MetricCard title="Total Modules" value={modules.length} icon="M4 6h16M4 12h16M4 18h16" color="#3b82f6" onClick={() => scrollToRef(moduleSummaryRef)} />
                <MetricCard title="Due Today" value={metrics.dueToday} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="#f97316" onClick={() => scrollToRef(weeklyPressureRef)} />
                <MetricCard title="Overdue Count" value={metrics.overdueCount} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" color="#ef4444" onClick={() => scrollToRef(upcomingDeadlinesRef)} />
                <MetricCard title="Overdue Weight" value={`${metrics.overdueWeight}%`} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color={metrics.overdueWeight > 0 ? "#b91c1c" : "#0d9488"} onClick={() => scrollToRef(upcomingDeadlinesRef)} />
            </div>

            <main ref={upcomingDeadlinesRef} className="bg-white rounded-xl shadow-2xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Deadlines ({sortedAssignments.length} Assignments Tracked)</h2>
                <div className="hidden sm:flex items-center p-4 border-b-2 border-indigo-200 font-bold text-sm text-gray-600 bg-indigo-50 rounded-t-lg">
                    <div className="w-5 mr-4 ml-1.5"></div>
                    <div className="flex-1 min-w-0">Assignment & Module</div>
                    <div className="w-24 text-center">Weight / Est. Time</div>
                    <div className="w-24 text-center">Due Date</div>
                    <div className="w-40 ml-4">Status</div>
                    <div className="w-5 ml-4"></div>
                </div>
                <div className="divide-y divide-gray-100">
                    {sortedAssignments.length === 0 ? (<div className="p-8 text-center text-gray-500 italic">No assignments found. Make sure to track modules to see their assignments.</div>) : (sortedAssignments.map(a => (
                        <AssignmentRow key={`${a.moduleCode}-${a.id}`} moduleCode={a.moduleCode} assignment={a} onToggleCompleted={handleToggleCompleted} onClick={handleOpenAssignmentDetail} />
                    )))}
                </div>
            </main>
            
            <div ref={weeklyPressureRef}><WeeklyTimeline groupedAssignments={groupedAssignmentsByWeek} onOpenAssignmentDetail={handleOpenAssignmentDetail} /></div>

            <div ref={moduleSummaryRef} className="mt-12">
                 <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                     <h2 className="text-2xl font-bold text-gray-800">My Module Watchlist</h2>
                     <form onSubmit={handleAddModule} className="flex items-center space-x-2">
                         <input
                             type="text"
                             value={moduleCodeInput}
                             onChange={(e) => setModuleCodeInput(e.target.value)}
                             placeholder="Enter Module Code (e.g., COMP101)"
                             className="px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                         />
                         <button type="submit" className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-indigo-700 shadow-sm transition text-sm">
                             Add
                         </button>
                     </form>
                </div>
                {addModuleMsg.text && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${addModuleMsg.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {addModuleMsg.text}
                    </div>
                )}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedModules.map(module => (<ModuleSummaryCard key={module.code} module={module} onClick={setSelectedModule} />))}
                 </div>
            </div>
        </>
    );
}

// --- Main App Component ---
const App = () => {
    const [publicModules, setPublicModules] = useState([]);
    const [userProfile, setUserProfile] = useState({ watchlistModules: [], trackedModules: [], completedAssignments: [] });
    const [authUserId, setAuthUserId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedMessage, setSeedMessage] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [currentView, setCurrentView] = useState('student');

    // --- Lecturer State ---
    const [currentLecturer, setCurrentLecturer] = useState(LECTURERS_LIST[0]);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [sharingModule, setSharingModule] = useState(null);
    const [managingModule, setManagingModule] = useState(null);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [assignmentModuleCode, setAssignmentModuleCode] = useState(null);
    const [viewingAssignment, setViewingAssignment] = useState(null);

    const upcomingDeadlinesRef = useRef(null);
    const weeklyPressureRef = useRef(null);
    const moduleSummaryRef = useRef(null);

    // --- Seeding Function ---
    const seedDatabase = async (currentAuthUserId) => {
        if (isSeeding) return;
        if (!currentAuthUserId) {
            setSeedMessage('Please wait, auth not ready...');
            setTimeout(() => setSeedMessage(''), 3000);
            return;
        }
        setIsSeeding(true);
        setSeedMessage('Seeding...');
        
        const modulesToSeed = MOCK_MODULES_DATA.map(({ isTracked, assignments, ...moduleData }) => ({
            ...moduleData,
            assignments: (assignments || []).map(({ completed, ...assignmentData }) => assignmentData)
        }));

        const batch = writeBatch(db);
        
        // 1. Seed Public Modules
        const modulesCollectionPath = `artifacts/${appId}/public/data/modules`;
        modulesToSeed.forEach(module => {
            const docRef = doc(db, modulesCollectionPath, module.code);
            batch.set(docRef, module);
        });

        // 2. Seed Student Profiles with pre-tracked modules
        const studentProfilesPath = `artifacts/${appId}/public/data/student-profiles`;

        const studentModuleMap = {
            'default': ['DESN101', 'COMP101'], // Alex Johnson
            'student-profile-2': ['PHIL301'], // Maria Garcia
            'student-profile-3': ['MGMT201'], // Chen Wei
            'student-profile-4': ['COMP101', 'MATH101', 'INFO201'] // Sarah O'Brien
        };

        STUDENTS_LIST.forEach(student => {
            const studentId = student.id === 'default' ? currentAuthUserId : student.id;
            const modulesToTrack = studentModuleMap[student.id] || [];
            const profileDocRef = doc(db, studentProfilesPath, studentId);
            
            batch.set(profileDocRef, {
                watchlistModules: modulesToTrack,
                trackedModules: modulesToTrack,
                completedAssignments: []
            });
        });

        try {
            await batch.commit();
            setSeedMessage(`Seeded ${modulesToSeed.length} modules & ${STUDENTS_LIST.length} profiles!`);
        } catch (error) {
            console.error("Error seeding database:", error);
            setSeedMessage('Error seeding database. Check console.');
        } finally {
            setIsSeeding(false);
            setTimeout(() => setSeedMessage(''), 5000);
        }
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUserId(user.uid);
                setUserId(user.uid);
                setIsAuthReady(true);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined') {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Error signing in:", error);
                    setIsLoading(false);
                }
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!isAuthReady) return;
        const modulesCollectionPath = `artifacts/${appId}/public/data/modules`;
        const q = query(collection(db, modulesCollectionPath));

        const unsubscribeModules = onSnapshot(q, (snapshot) => {
            const modulesData = snapshot.docs.map(doc => ({ ...doc.data(), code: doc.id }));
            setPublicModules(modulesData);
            if (isLoading) setIsLoading(false);
        }, (error) => {
            console.error("Error fetching public modules:", error);
            setIsLoading(false);
        });

        return () => unsubscribeModules();
    }, [isAuthReady, isLoading]);

    useEffect(() => {
        if (!userId) return;
        const profileDocPath = `artifacts/${appId}/public/data/student-profiles/${userId}`;
        const docRef = doc(db, profileDocPath);

        const unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            } else {
                setDoc(docRef, { watchlistModules: [], trackedModules: [], completedAssignments: [] })
                    .catch(e => console.error("Error creating profile:", e));
            }
        }, (error) => {
            console.error("Error fetching user profile:", error);
        });

        return () => unsubscribeProfile();
    }, [userId]);

    const modules = useMemo(() => {
        const { trackedModules = [], completedAssignments = [], watchlistModules = [] } = userProfile;
        
        return publicModules
            .filter(module => watchlistModules.includes(module.code))
            .map(module => ({
                ...module,
                isTracked: trackedModules.includes(module.code),
                assignments: (module.assignments || []).map(assignment => ({
                    ...assignment,
                    completed: completedAssignments.includes(assignment.id)
                }))
            }));
    }, [publicModules, userProfile]);

    const dynamicStudentList = useMemo(() => {
        if (!authUserId) return [];
        return STUDENTS_LIST.map(student => ({
            ...student,
            id: student.id === 'default' ? authUserId : student.id
        }));
    }, [authUserId]);

    const handleAddModuleToWatchlist = useCallback(async (moduleCode) => {
        if (!userId) return { text: 'User not found.', error: true };

        const moduleExists = publicModules.some(m => m.code === moduleCode);
        if (!moduleExists) {
            return { text: `Module code "${moduleCode}" not found.`, error: true };
        }

        if ((userProfile.watchlistModules || []).includes(moduleCode)) {
            return { text: `Module "${moduleCode}" is already in your watchlist.`, error: true };
        }

        const profileDocRef = doc(db, `artifacts/${appId}/public/data/student-profiles/${userId}`);
        try {
            await updateDoc(profileDocRef, {
                watchlistModules: arrayUnion(moduleCode)
            });
            return { text: `Module "${moduleCode}" added to your watchlist.`, error: false };
        } catch (error) {
            console.error("Error adding to watchlist:", error);
            return { text: 'Error adding module. Please try again.', error: true };
        }
    }, [userId, publicModules, userProfile.watchlistModules]);
    
    const handleRemoveModuleFromWatchlist = useCallback(async (moduleCode) => {
        if (!userId) return;
        const profileDocRef = doc(db, `artifacts/${appId}/public/data/student-profiles/${userId}`);
        try {
            await updateDoc(profileDocRef, {
                watchlistModules: arrayRemove(moduleCode),
                trackedModules: arrayRemove(moduleCode)
            });
        } catch (error) {
            console.error("Error removing from watchlist:", error);
        }
    }, [userId]);

    const handleToggleCompleted = useCallback(async (moduleCode, assignmentId) => {
        if (!userId) return;
        const profileDocRef = doc(db, `artifacts/${appId}/public/data/student-profiles/${userId}`);
        const isCompleted = (userProfile.completedAssignments || []).includes(assignmentId);
        try {
            await updateDoc(profileDocRef, {
                completedAssignments: isCompleted ? arrayRemove(assignmentId) : arrayUnion(assignmentId)
            });
        } catch (error) {
            console.error("Error toggling assignment:", error);
        }
    }, [userId, userProfile.completedAssignments]);

    const handleToggleTracked = useCallback(async (moduleCode) => {
        if (!userId) return;
        const profileDocRef = doc(db, `artifacts/${appId}/public/data/student-profiles/${userId}`);
        const isTracked = (userProfile.trackedModules || []).includes(moduleCode);
        try {
            await updateDoc(profileDocRef, {
                trackedModules: isTracked ? arrayRemove(moduleCode) : arrayUnion(moduleCode)
            });
        } catch (error) {
            console.error("Error toggling module tracking:", error);
        }
    }, [userId, userProfile.trackedModules]);

    const handleOpenAssignmentDetail = useCallback((assignment, moduleCode) => {
         const module = modules.find(m => m.code === moduleCode);
         const assignmentWithStatus = {
             ...assignment,
             completed: (userProfile.completedAssignments || []).includes(assignment.id)
         };
         setSelectedAssignment({
             ...assignmentWithStatus,
             moduleName: module?.name || 'Unknown',
             moduleCode,
             moduleLearningOutcomes: module?.learningOutcomes || []
         });
    }, [modules, userProfile.completedAssignments]);

    const handleOpenAssignmentFromModule = useCallback((assignment) => {
        if (selectedModule) {
            handleOpenAssignmentDetail(assignment, selectedModule.code);
            setSelectedModule(null);
        }
    }, [selectedModule, handleOpenAssignmentDetail]);

     const handleLecturerViewAssignment = useCallback((event) => {
        const { assignment, module } = event;
        const assignmentWithStatus = {
            ...assignment,
            completed: false
        };
        setViewingAssignment({
            ...assignmentWithStatus,
            moduleName: module.name,
            moduleCode: module.code,
            moduleLearningOutcomes: module.learningOutcomes || []
        });
    }, []);

     const handleCreateModule = () => {
        setEditingModule({});
        setIsModuleModalOpen(true);
    };

    const handleEditModule = (module) => {
        setEditingModule(module);
        setIsModuleModalOpen(true);
    };

    const handleSaveModule = async (moduleData) => {
        const moduleDocRef = doc(db, `artifacts/${appId}/public/data/modules`, moduleData.code);
        const { isTracked, ...publicModuleData } = moduleData;
        publicModuleData.assignments = (publicModuleData.assignments || []).map(({completed, ...rest}) => rest);

        try {
            if (publicModules.some(m => m.code === moduleData.code)) {
                await setDoc(moduleDocRef, publicModuleData, { merge: true });
            } else {
                const newModule = {
                     ...publicModuleData,
                     lecturer: currentLecturer,
                     assignments: [], 
                     learningOutcomes: [],
                     criticalSkills: []
                 };
                await setDoc(moduleDocRef, newModule);
            }
        } catch (error) {
            console.error("Error saving module:", error);
        }
    };

     const handleShareModule = (module) => {
        setSharingModule(module);
        setIsShareModalOpen(true);
    };

    const handleManageModule = (module) => {
        setManagingModule(module); 
    };

     const handleOpenAssignmentEditor = (assignment, moduleCode) => {
        setEditingAssignment(assignment);
        setAssignmentModuleCode(moduleCode);
        setIsAssignmentModalOpen(true);
    };

    const handleSaveAssignment = async (assignmentData) => {
        const moduleDocRef = doc(db, `artifacts/${appId}/public/data/modules`, assignmentModuleCode);
        const moduleToUpdate = publicModules.find(m => m.code === assignmentModuleCode);
        if (!moduleToUpdate) return;

        const { completed, ...publicAssignmentData } = assignmentData;
        let newAssignments;
        const currentAssignments = moduleToUpdate.assignments || [];

        if (publicAssignmentData.id) {
            newAssignments = currentAssignments.map(a => a.id === publicAssignmentData.id ? publicAssignmentData : a);
        } else {
            newAssignments = [...currentAssignments, { ...publicAssignmentData, id: crypto.randomUUID(), feedback_pdf: null }];
        }

        try {
            await updateDoc(moduleDocRef, { assignments: newAssignments });
        } catch (error) {
            console.error("Error saving assignment:", error);
        }
    };

    const handleDeleteAssignment = async (assignmentId, moduleCode) => {
        const moduleDocRef = doc(db, `artifacts/${appId}/public/data/modules`, moduleCode);
        const moduleToUpdate = publicModules.find(m => m.code === moduleCode);
        if (!moduleToUpdate || !moduleToUpdate.assignments) return;

        const newAssignments = moduleToUpdate.assignments.filter(a => a.id !== assignmentId);

        try {
            await updateDoc(moduleDocRef, { assignments: newAssignments });
        } catch (error) {
            console.error("Error deleting assignment:", error);
        }
    };

     const handleUploadFeedback = async (assignmentId, moduleCode) => {
        const moduleDocRef = doc(db, `artifacts/${appId}/public/data/modules`, moduleCode);
        const moduleToUpdate = publicModules.find(m => m.code === moduleCode);
        if (!moduleToUpdate || !moduleToUpdate.assignments) return;

        const newAssignments = moduleToUpdate.assignments.map(a =>
            a.id === assignmentId ? { ...a, feedback_pdf: '#' } : a
        );

        try {
            await updateDoc(moduleDocRef, { assignments: newAssignments });
        } catch (error) {
            console.error("Error updating feedback link:", error);
        }
    };

     const handleSaveLos = async (updatedLos) => {
        if (!managingModule) return;
        const moduleDocRef = doc(db, `artifacts/${appId}/public/data/modules`, managingModule.code);
        try {
            await updateDoc(moduleDocRef, { learningOutcomes: updatedLos });
        } catch (error) {
            console.error("Error saving LOs:", error);
        }
    };

    const handleSaveSkills = async (updatedSkills) => {
        if (!managingModule) return;
        const moduleDocRef = doc(db, `artifacts/${appId}/public/data/modules`, managingModule.code);
        try {
            await updateDoc(moduleDocRef, { criticalSkills: updatedSkills });
        } catch (error) {
            console.error("Error saving skills:", error);
        }
    };

    useEffect(() => {
        if (!managingModule?.code) return;
        const moduleDocRef = doc(db, `artifacts/${appId}/public/data/modules`, managingModule.code);
        const unsubscribe = onSnapshot(moduleDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const publicData = { ...docSnap.data(), code: docSnap.id };
                const { trackedModules = [], completedAssignments = [] } = userProfile;
                setManagingModule({
                    ...publicData,
                    isTracked: trackedModules.includes(publicData.code),
                    assignments: (publicData.assignments || []).map(assignment => ({
                        ...assignment,
                        completed: completedAssignments.includes(assignment.id)
                    }))
                });
            } else {
                setManagingModule(null);
            }
        });
        return () => unsubscribe();
    }, [managingModule?.code, userProfile]);

    const studentDashboardProps = {
        modules, handleToggleCompleted, handleToggleTracked, handleOpenAssignmentDetail, setSelectedModule, upcomingDeadlinesRef, weeklyPressureRef, moduleSummaryRef,
        scrollToRef: (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        onAddToWatchlist: handleAddModuleToWatchlist,
        onRemoveFromWatchlist: handleRemoveModuleFromWatchlist
    };

    if (isLoading && publicModules.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4 font-sans">
                <svg className="animate-spin h-10 w-10 text-indigo-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="ml-3 text-lg text-gray-700 font-semibold">Loading assessment data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans antialiased">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">University Assessment Dashboard</h1>
                            <p className="text-sm text-gray-500">Currently viewing as a <span className="font-bold text-indigo-600">{currentView.charAt(0).toUpperCase() + currentView.slice(1)}</span></p>
                            {userId && <p className="text-xs text-gray-400 mt-1">UserID: {userId}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                id="seed-button"
                                onClick={() => seedDatabase(authUserId)}
                                disabled={isSeeding || publicModules.length > 0}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
                                    isSeeding ? 'bg-yellow-400 text-yellow-800 cursor-not-allowed' :
                                    publicModules.length > 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                                    'bg-teal-500 text-white hover:bg-teal-600'
                                }`}
                                title={publicModules.length > 0 ? "Database already contains data" : "Click ONCE to add initial modules"}
                            >
                                {isSeeding ? 'Seeding...' : publicModules.length > 0 ? 'Data Seeded' : 'Seed Initial Data'}
                            </button>
                            {seedMessage && <span className="text-sm text-green-700 ml-2">{seedMessage}</span>}

                            {currentView === 'student' && authUserId && (
                                <div className="ml-4">
                                    <label htmlFor="student-select" className="sr-only">Select Student</label>
                                    <select
                                        id="student-select"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
                                    >
                                        {dynamicStudentList.map(student => (
                                            <option key={student.id} value={student.id}>
                                                Viewing as: {student.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {currentView === 'lecturer' && (
                                <div className="ml-4">
                                    <label htmlFor="lecturer-select" className="sr-only">Select Lecturer</label>
                                    <select
                                        id="lecturer-select"
                                        value={currentLecturer.email}
                                        onChange={(e) => {
                                            const selected = LECTURERS_LIST.find(l => l.email === e.target.value);
                                            setCurrentLecturer(selected || LECTURERS_LIST[0]);
                                        }}
                                        className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
                                    >
                                        {LECTURERS_LIST.map(lecturer => (
                                            <option key={lecturer.email} value={lecturer.email}>
                                                Viewing as: {lecturer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex items-center space-x-2 bg-gray-200 p-1 rounded-lg ml-4">
                                <button onClick={() => setCurrentView('student')} className={`px-4 py-1 rounded-lg text-sm font-semibold transition-colors ${currentView === 'student' ? 'bg-white text-indigo-700 shadow' : 'text-gray-500'}`}>Student</button>
                                <button onClick={() => setCurrentView('lecturer')} className={`px-4 py-1 rounded-lg text-sm font-semibold transition-colors ${currentView === 'lecturer' ? 'bg-white text-indigo-700 shadow' : 'text-gray-500'}`}>Lecturer</button>
                            </div>
                        </div>
                    </div>
                </header>

                {currentView === 'student' ? (
                    <StudentDashboard {...studentDashboardProps} />
                ) : (
                    <LecturerDashboard
                        modules={publicModules}
                        lecturer={currentLecturer}
                        onCreateModule={handleCreateModule}
                        onManageModule={handleManageModule} 
                        onShareModule={handleShareModule}
                        onEventClick={handleLecturerViewAssignment}
                    />
                )}

                {selectedAssignment && (<AssignmentDetailModal assignment={selectedAssignment} onClose={() => setSelectedAssignment(null)} onToggleCompleted={handleToggleCompleted} />)}
                {viewingAssignment && (<AssignmentDetailModal assignment={viewingAssignment} onClose={() => setViewingAssignment(null)} />)}
                {selectedModule && (<ModuleDetailModal 
                            module={selectedModule} 
                            onClose={() => setSelectedModule(null)} 
                            onToggleTracked={handleToggleTracked} 
                            onSelectAssignment={handleOpenAssignmentFromModule}
                            onRemoveFromWatchlist={handleRemoveModuleFromWatchlist}
                        />)}

                {managingModule && <LecturerModuleManagementPanel module={managingModule} onClose={() => setManagingModule(null)} onEditModule={handleEditModule} onSaveLos={handleSaveLos} onSaveSkills={handleSaveSkills} onOpenAssignmentEditor={handleOpenAssignmentEditor} onDeleteAssignment={handleDeleteAssignment} onUploadFeedback={handleUploadFeedback} />}
                {isModuleModalOpen && <ModuleEditModal module={editingModule} onSave={handleSaveModule} onClose={() => setIsModuleModalOpen(false)} />}
                {isAssignmentModalOpen && <AssignmentEditModal assignment={editingAssignment} moduleLos={publicModules.find(m => m.code === assignmentModuleCode)?.learningOutcomes || []} onSave={handleSaveAssignment} onClose={() => setIsAssignmentModalOpen(false)} />}
                {isShareModalOpen && sharingModule && <ShareModuleModal module={sharingModule} onClose={() => setIsShareModalOpen(false)} />}
            </div>
        </div>
    );
};

export default App;
