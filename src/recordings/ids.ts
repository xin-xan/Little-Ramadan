/** Stable recording IDs, shared by the Parent Zone recorder and the children's screens. */
export const rid = {
  storyPage: (story: string, page: number) => `story:${story}:p${page + 1}`,
  lessonSummary: (lesson: string) => `lesson:${lesson}:intro`,
  lessonSection: (lesson: string, i: number) => `lesson:${lesson}:s${i + 1}`,
  lessonWords: (lesson: string) => `lesson:${lesson}:words`,
  lessonTry: (lesson: string) => `lesson:${lesson}:try`,
  quizQuestion: (set: string, q: string) => `quiz:${set}:${q}:q`,
  quizAnswer: (set: string, q: string) => `quiz:${set}:${q}:a`,
  howToPlay: (game: string) => `game:${game}:how`,
  mission: (id: string) => `mission:${id}`,
  firstFast: (id: string) => `firstfast:${id}`,
  health: () => "safety:health",
  unwell: () => "safety:unwell",
  stayingSafe: () => "safety:staying-safe",
  dvLetter: (name: string) => `dv-letter:${name}`,
  dvWord: (id: string) => `dv-word:${id}`,
};

export const UNWELL_STEPS = [
  "Stop what you are doing.",
  "Tell your parent or another trusted adult straight away.",
  "Have a drink or something to eat if your grown-up says so. Stopping a fast is okay!",
];

