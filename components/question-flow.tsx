"use client";

import { useState } from "react";
import { Question } from "@/lib/templates";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface QuestionFlowProps {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export function QuestionFlow({ questions, onComplete, onBack }: QuestionFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const isAnswered = answers[currentQuestion.id]?.trim().length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-4">
        <h3 className="text-xl font-semibold text-white">
          {currentQuestion.question}
          {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
        </h3>

        {currentQuestion.type === "text" && (
          <input
            type="text"
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Type your answer..."
          />
        )}

        {currentQuestion.type === "select" && (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                  answers[currentQuestion.id] === option
                    ? "bg-white text-black border-white"
                    : "bg-black text-white border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === "multiselect" && (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => {
              const selected = answers[currentQuestion.id]?.split(",").includes(option) || false;
              return (
                <button
                  key={option}
                  onClick={() => {
                    const current = answers[currentQuestion.id]?.split(",").filter(Boolean) || [];
                    const updated = selected
                      ? current.filter((v) => v !== option)
                      : [...current, option];
                    handleAnswer(updated.join(","));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                    selected
                      ? "bg-white text-black border-white"
                      : "bg-black text-white border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentIndex === 0 ? "Back" : "Previous"}
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentQuestion.required && !isAnswered}
          className="bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentIndex === questions.length - 1 ? "Generate Document" : "Next"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
