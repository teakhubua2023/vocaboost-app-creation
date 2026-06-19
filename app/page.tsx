import { WordScrambleGame } from "@/components/word-scramble-game"
import { BookOpenCheck } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Voca<span className="text-primary">Boost</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Word arranging practice for English learners
            </p>
          </div>
        </div>
      </header>

      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Unscramble the words. Build the sentence.
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Tap the words in the right order, check your answer, and earn points
            for every sentence you get right.
          </p>
        </div>
        <WordScrambleGame />
      </section>
    </main>
  )
}
