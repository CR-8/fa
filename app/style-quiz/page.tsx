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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Your Style Profile is Ready!</CardTitle>
              <p className="text-muted-foreground">
                Based on your answers, here's your personalized style summary
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(answers).map(([questionId, answer]) => {
                  const question = quizQuestions.find(q => q.id === questionId)
                  return (
                    <div key={questionId} className="p-4 border rounded-lg">
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">
                        {question?.question}
                      </h3>
                      <Badge variant="secondary">{answer}</Badge>
                    </div>
                  )
                })}
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your AI fashion assistant will now use these preferences to give you more personalized recommendations!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleRestart} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                  <Button onClick={() => window.location.href = '/ai-fa'}>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Style Quiz</h1>
          <p className="text-muted-foreground">
            Answer a few questions to help our AI understand your style preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">{question.question}</h2>

              <div className="grid grid-cols-1 gap-3">
                {question.options.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start"
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
                  className="w-full"
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