"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getRandomQuestion } from "@/lib/api/mock";
import type { SkillQuestion } from "@/types";

interface SkillQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SkillQuestionModal({ isOpen, onClose, onSuccess }: SkillQuestionModalProps) {
  const [question, setQuestion] = useState<SkillQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && !question) {
      setQuestion(getRandomQuestion(usedIds));
    }
  }, [isOpen, question, usedIds]);

  const resetQuestion = () => {
    if (!question) return;
    const newUsed = [...usedIds, question.id];
    setUsedIds(newUsed);
    setQuestion(getRandomQuestion(newUsed));
    setAnswer("");
    setIsCorrect(null);
    setAttempts(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSubmitting(false);

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const correct =
      answer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => {
        onSuccess();
        // Reset for next use
        setQuestion(null);
        setAnswer("");
        setIsCorrect(null);
        setAttempts(0);
        setUsedIds([]);
      }, 800);
    } else if (newAttempts >= 3) {
      // Change question after 3 wrong answers
      setTimeout(resetQuestion, 1200);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="480px">
      <div className="mb-6">
        <div className="w-12 h-12 rounded-[12px] bg-[#FFF0F3] flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FF385C" strokeWidth="2" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="#FF385C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#222222] mb-2">Answer to participate</h2>
        <p className="text-sm text-[#717171]">
          Dollar House Club uses skill-based entry to comply with sweepstakes regulations. Answer the question below to place your deposit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {question && (
          <div className="bg-[#F7F7F7] rounded-[12px] p-4">
            <p className="text-lg font-semibold text-[#222222]">{question.question}</p>
          </div>
        )}

        <Input
          label="Your answer"
          placeholder="Enter your answer"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setIsCorrect(null);
          }}
          error={isCorrect === false ? "Incorrect — try again!" : undefined}
          autoFocus
        />

        {isCorrect === true && (
          <div className="flex items-center gap-2 text-[#008A05] text-sm font-semibold">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#008A05" strokeWidth="1.5" />
              <path d="M5 8l2 2 4-4" stroke="#008A05" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Correct! Proceeding...
          </div>
        )}

        {isCorrect === false && attempts >= 3 && (
          <p className="text-xs text-[#717171]">
            Changing question after 3 attempts...
          </p>
        )}

        <Button type="submit" fullWidth isLoading={isSubmitting} disabled={!answer.trim() || isCorrect === true}>
          Submit Answer
        </Button>
      </form>

      <p className="mt-4 text-xs text-[#717171] text-center">
        You have unlimited attempts. Question will change after 3 wrong answers.
      </p>
    </Modal>
  );
}
