import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Question } from '../types';

interface QuizProps {
  questions: Question[];
  onComplete: (answers: Record<number, number>) => void;
}

export default function Quiz({ questions, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [direction, setDirection] = useState(0);

  const handleAnswer = (score: number) => {
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: score }));
    
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete({ ...answers, [questions[currentIndex].id]: score });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-red-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="relative h-[400px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Strongly Disagree", value: 1, color: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200" },
                { label: "Disagree", value: 2, color: "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200" },
                { label: "Neutral", value: 3, color: "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200" },
                { label: "Agree", value: 4, color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200" },
                { label: "Strongly Agree", value: 5, color: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full py-3 px-4 rounded-lg border transition-all duration-200 font-medium text-sm md:text-base ${option.color} ${answers[currentQuestion.id] === option.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
      </div>
    </div>
  );
}
