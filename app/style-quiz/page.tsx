"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  category: string
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "style",
    question: "What's your preferred style?",
    options: ["Casual", "Professional", "Streetwear", "Bohemian", "Minimalist", "Vintage"],
    category: "style"
  },
  {
    id: "colors",
    question: "Which color palette appeals to you most?",
    options: ["Neutrals (Black, White, Gray)", "Bright & Bold", "Pastels", "Earth Tones", "Monochromatic"],
    category: "colors"
  },
  {
    id: "fit",
    question: "How do you prefer your clothes to fit?",
    options: ["Oversized", "Slim Fit", "Regular Fit", "Tailored"],
    category: "fit"
  },
  {
    id: "occasion",
    question: "What's your most common occasion for dressing up?",
    options: ["Work", "Casual Outings", "Parties", "Sports", "Home"],
    category: "occasion"
  },
  {
    id: "budget",
    question: "What's your typical budget for clothing items?",
    options: ["Under ₹2000", "₹2000-₹5000", "₹5000-₹10000", "Over ₹10000"],
    category: "budget"
  }
]

export default function StyleQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load saved answers on mount
  useEffect(() => {
    const saved = localStorage.getItem('styleQuizAnswers')
    if (saved) {
      const parsed = JSON.parse(saved)
      setAnswers(parsed)
      if (Object.keys(parsed).length === quizQuestions.length) {
        setCompleted(true)
      }
    }
  }, [])

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)
    localStorage.setItem('styleQuizAnswers', JSON.stringify(newAnswers))

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setCompleted(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setCompleted(false)
    localStorage.removeItem('styleQuizAnswers')
  }

  const progress = ((currentQuestion + (completed ? 1 : 0)) / quizQuestions.length) * 100

  if (completed) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="container mx-auto px-6 lg:px-8 py-10 max-w-2xl">
          <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            <CardHeader className="text-center border-b-2 border-neutral-200 dark:border-neutral-800">
              <div className="mx-auto w-16 h-16 bg-neutral-900 dark:bg-neutral-100 rounded-sm border-2 border-neutral-900 dark:border-neutral-100 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-neutral-50 dark:text-neutral-900" />
              </div>
              <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Your Style Profile is Ready!</CardTitle>
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                Based on your answers, here's your personalized style summary
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(answers).map(([questionId, answer]) => {
                  const question = quizQuestions.find(q => q.id === questionId)
                  return (
                    <div key={questionId} className="p-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-sm bg-neutral-100 dark:bg-neutral-800">
                      <h3 className="font-bold text-sm text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wide">
                        {question?.question}
                      </h3>
                      <Badge variant="outline" className="border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase">{answer}</Badge>
                    </div>
                  )
                })}
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                  Your AI fashion assistant will now use these preferences to give you more personalized recommendations!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleRestart} variant="outline" className="h-12 px-6 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button onClick={() => window.location.href = '/ai-fa'} className="h-12 px-6 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide">
                    Try AI Assistant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const question = quizQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto px-6 lg:px-8 py-10 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Style Quiz</h1>
          <p className="text-neutral-600 dark:text-neutral-400 font-medium">
            Answer a few questions to help our AI understand your style preferences
          </p>
        </div>

        <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wide">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wide">
                {Math.round(progress)}% complete
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">{question.question}</h2>

              <div className="grid grid-cols-1 gap-3">
                {question.options.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => handleAnswer(question.id, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {currentQuestion > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="w-full h-12 font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm"
                >
                  ← Previous Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}