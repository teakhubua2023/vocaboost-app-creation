export type Exercise = {
  id: number
  sentence: string
  /** A short focus word that the sentence practices, shown as a hint chip. */
  focus: string
}

// The exercises. Each "sentence" is the correctly ordered answer.
// Students arrange the scrambled words to rebuild it.
export const exercises: Exercise[] = [
  { id: 1, sentence: "Tell about a time you burst into laughter.", focus: "burst" },
  { id: 2, sentence: "Name a rule that you always obey.", focus: "obey" },
  { id: 3, sentence: "Name someone you trust completely.", focus: "trust" },
  { id: 4, sentence: "Talk about your steady daily routine.", focus: "steady" },
  { id: 5, sentence: "Share your opinion about the military.", focus: "military" },
  { id: 6, sentence: "Explain how to secure a good grade.", focus: "secure" },
  { id: 7, sentence: "Unless I drink coffee in the morning I am sleepy.", focus: "unless" },
  { id: 8, sentence: "Imagine carrying a heavy wooden log.", focus: "log" },
  { id: 9, sentence: "Give your opinion about video game weapons.", focus: "weapons" },
  { id: 10, sentence: "Tell if you ever twisted your ankle.", focus: "twisted" },
]

export const POINTS_FIRST_TRY = 10
export const POINTS_AFTER_RETRY = 6
