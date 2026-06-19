"use client"

import { useEffect, useMemo, useState } from "react"
import {
  exercises,
  POINTS_AFTER_RETRY,
  POINTS_FIRST_TRY,
} from "@/lib/sentences"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Check,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react"

type Token = {
  id: string
  word: string
}

type Status = "idle" | "correct" | "incorrect"

function tokenize(sentence: string): Token[] {
  return sentence
    .split(" ")
    .map((word, index) => ({ id: `${index}-${word}`, word }))
}

function shuffle(tokens: Token[]): Token[] {
  const copy = [...tokens]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  // Make sure the shuffle isn't accidentally already in order.
  const sameOrder = copy.every((t, i) => t.id === tokens[i].id)
  if (sameOrder && copy.length > 1) {
    ;[copy[0], copy[1]] = [copy[1], copy[0]]
  }
  return copy
}

export function WordScrambleGame() {
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState<Token[]>([])
  const [score, setScore] = useState(0)
  const [solvedCount, setSolvedCount] = useState(0)
  const [status, setStatus] = useState<Status>("idle")
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [solvedIds, setSolvedIds] = useState<number[]>([])
  const [finished, setFinished] = useState(false)

  const exercise = exercises[current]
  const correctTokens = useMemo(() => tokenize(exercise.sentence), [exercise])

  // Pool tokens are the scrambled words not yet placed in the answer.
  // Start in order to keep server and client markup identical, then shuffle
  // on the client after mount to avoid hydration mismatches.
  const [pool, setPool] = useState<Token[]>(() => tokenize(exercises[0].sentence))

  useEffect(() => {
    setPool((p) => shuffle(p))
    // Only shuffle the very first exercise once after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isSolved = solvedIds.includes(exercise.id)
  const totalPossible = exercises.length * POINTS_FIRST_TRY

  function loadExercise(index: number) {
    const ex = exercises[index]
    setCurrent(index)
    setAnswer([])
    setPool(shuffle(tokenize(ex.sentence)))
    setStatus("idle")
    setAttempts(0)
    setShowHint(false)
  }

  function addWord(token: Token) {
    if (isSolved) return
    setPool((p) => p.filter((t) => t.id !== token.id))
    setAnswer((a) => [...a, token])
    setStatus("idle")
  }

  function removeWord(token: Token) {
    if (isSolved) return
    setAnswer((a) => a.filter((t) => t.id !== token.id))
    setPool((p) => [...p, token])
    setStatus("idle")
  }

  function resetAttempt() {
    if (isSolved) return
    setAnswer([])
    setPool(shuffle(correctTokens))
    setStatus("idle")
  }

  function checkAnswer() {
    if (answer.length !== correctTokens.length) return
    const isCorrect = answer.every((t, i) => t.word === correctTokens[i].word)
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)

    if (isCorrect) {
      const earned =
        nextAttempts === 1 && !showHint ? POINTS_FIRST_TRY : POINTS_AFTER_RETRY
      setScore((s) => s + earned)
      setSolvedCount((c) => c + 1)
      setSolvedIds((ids) => [...ids, exercise.id])
      setStatus("correct")
    } else {
      setStatus("incorrect")
    }
  }

  function nextExercise() {
    if (current < exercises.length - 1) {
      loadExercise(current + 1)
    } else {
      setFinished(true)
    }
  }

  function restartGame() {
    setScore(0)
    setSolvedCount(0)
    setSolvedIds([])
    setFinished(false)
    loadExercise(0)
  }

  if (finished) {
    return (
      <FinishScreen
        score={score}
        total={totalPossible}
        solved={solvedCount}
        count={exercises.length}
        onRestart={restartGame}
      />
    )
  }

  const canCheck = answer.length === correctTokens.length && !isSolved

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress + score */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {exercise.id}
          </span>
          <span>of {exercises.length} sentences</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-bold text-accent">
          <Star className="h-4 w-4 fill-accent" />
          {score} pts
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(solvedCount / exercises.length) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Arrange the words
            </p>
            <h2 className="text-balance text-lg font-bold text-foreground">
              Tap the words in the correct order to build the sentence.
            </h2>
          </div>
        </div>

        {/* Answer area */}
        <div
          className={cn(
            "mb-5 flex min-h-24 flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-4 transition-colors",
            status === "correct" && "border-primary bg-primary/5",
            status === "incorrect" && "border-destructive bg-destructive/5",
            status === "idle" && "border-border bg-secondary/40",
          )}
          aria-label="Your sentence"
        >
          {answer.length === 0 && (
            <span className="self-center text-sm text-muted-foreground">
              Your sentence will appear here…
            </span>
          )}
          {answer.map((token) => (
            <WordTile
              key={token.id}
              word={token.word}
              onClick={() => removeWord(token)}
              variant="answer"
              disabled={isSolved}
            />
          ))}
        </div>

        {/* Feedback */}
        {status === "correct" && (
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
            <Check className="h-4 w-4" /> Perfect! That&apos;s the correct
            sentence.
          </p>
        )}
        {status === "incorrect" && (
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-destructive">
            <X className="h-4 w-4" /> Not quite — try rearranging the words.
          </p>
        )}
        {showHint && !isSolved && (
          <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4 text-accent" /> The sentence starts
            with{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{correctTokens[0].word}&rdquo;
            </span>
            .
          </p>
        )}

        {/* Word pool */}
        <div className="mb-6 flex flex-wrap gap-2">
          {pool.map((token) => (
            <WordTile
              key={token.id}
              word={token.word}
              onClick={() => addWord(token)}
              variant="pool"
              disabled={isSolved}
            />
          ))}
          {pool.length === 0 && !isSolved && (
            <span className="text-sm text-muted-foreground">
              All words placed — check your answer!
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {!isSolved ? (
            <>
              <Button onClick={checkAnswer} disabled={!canCheck} size="lg">
                <Check className="h-4 w-4" />
                Check answer
              </Button>
              <Button
                variant="outline"
                onClick={resetAttempt}
                disabled={answer.length === 0}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className="text-accent hover:text-accent"
              >
                <Lightbulb className="h-4 w-4" />
                Hint
              </Button>
            </>
          ) : (
            <Button onClick={nextExercise} size="lg">
              {current < exercises.length - 1 ? (
                <>
                  Next sentence
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  See results
                  <Trophy className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function WordTile({
  word,
  onClick,
  variant,
  disabled,
}: {
  word: string
  onClick: () => void
  variant: "pool" | "answer"
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "select-none rounded-xl px-3.5 py-2 text-base font-semibold shadow-sm transition-all active:scale-95 disabled:cursor-default disabled:opacity-80 disabled:active:scale-100",
        variant === "pool" &&
          "border border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary hover:text-primary",
        variant === "answer" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      {word}
    </button>
  )
}

function FinishScreen({
  score,
  total,
  solved,
  count,
  onRestart,
}: {
  score: number
  total: number
  solved: number
  count: number
  onRestart: () => void
}) {
  const percent = Math.round((score / total) * 100)
  const stars = percent >= 90 ? 3 : percent >= 60 ? 2 : 1
  const message =
    percent >= 90
      ? "Outstanding work!"
      : percent >= 60
        ? "Great job — keep practicing!"
        : "Nice effort — try again to boost your score!"

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-accent/15">
          <Trophy className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{message}</h2>
        <div className="my-5 flex justify-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={cn(
                "h-9 w-9",
                s <= stars
                  ? "fill-accent text-accent"
                  : "fill-secondary text-secondary",
              )}
            />
          ))}
        </div>
        <p className="text-5xl font-extrabold text-primary">{score}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          out of {total} points
        </p>
        <p className="mt-4 text-base text-foreground">
          You solved{" "}
          <span className="font-bold text-primary">
            {solved}/{count}
          </span>{" "}
          sentences correctly.
        </p>
        <Button onClick={onRestart} size="lg" className="mt-6 w-full">
          <RotateCcw className="h-4 w-4" />
          Play again
        </Button>
      </div>
    </div>
  )
}
