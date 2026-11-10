/**
 * Everything a parent can record in their own voice, grouped the way the app shows it.
 * IDs are stable: the child-facing screens use the same `rid` helpers to find a recording.
 */
import { LETTERS, WORDS } from "@/content/dhivehi";
import { firstFastPages } from "@/content/firstFast";
import { games } from "@/content/games";
import { lessons } from "@/content/lessons";
import { missions } from "@/content/missions";
import { quizSets } from "@/content/quizzes";
import { CHILD_HEALTH_MESSAGE, CHILD_SAFETY_POINTS } from "@/content/safety";
import { stories } from "@/content/stories";

import { rid, UNWELL_STEPS } from "./ids";

export { rid, UNWELL_STEPS };

export interface RecItem {
  id: string;
  /** Short name, e.g. "Page 3". */
  label: string;
  /** The words to read aloud. */
  script: string;
  /** Large Thaana text shown instead of an icon (Dhivehi letters and words). */
  dv?: string;
}
export interface RecGroup {
  id: string;
  title: string;
  items: RecItem[];
}
export interface RecSection {
  id: string;
  title: string;
  hint: string;
  groups: RecGroup[];
}

export const RECORDING_SECTIONS: RecSection[] = [
  {
    id: "stories",
    title: "Stories",
    hint: "Read each page as you would at bedtime. Children tap Listen on the page to hear you.",
    groups: stories.map((s) => ({
      id: `story:${s.id}`,
      title: s.title,
      items: s.pages.map((p, i) => ({ id: rid.storyPage(s.id, i), label: `Page ${i + 1}`, script: p.text })),
    })),
  },
  {
    id: "lessons",
    title: "Lessons",
    hint: "Read the heading and the text. Children hear you on each part of the lesson.",
    groups: lessons.map((l) => ({
      id: `lesson:${l.id}`,
      title: l.title,
      items: [
        { id: rid.lessonSummary(l.id), label: "Introduction", script: l.summary },
        ...l.sections.map((s, i) => ({ id: rid.lessonSection(l.id, i), label: s.heading, script: `${s.heading}. ${s.text}` })),
        { id: rid.lessonWords(l.id), label: "Words to know", script: l.keyWords.map((k) => `${k.word}: ${k.meaning}`).join(" ") },
        { id: rid.lessonTry(l.id), label: "Try this with your family", script: l.tryThis },
      ],
    })),
  },
  {
    id: "quizzes",
    title: "Quizzes",
    hint: "Record each question, and the explanation children hear after they find the right answer. The answers appear in a different order each time, so it is best to read just the question.",
    groups: quizSets.map((q) => ({
      id: `quiz:${q.id}`,
      title: q.title,
      items: q.questions.flatMap((x, i) => [
        { id: rid.quizQuestion(q.id, x.id), label: `Question ${i + 1}`, script: `${x.question} (Answers: ${x.options.join(" / ")})` },
        { id: rid.quizAnswer(q.id, x.id), label: `Question ${i + 1}: explanation`, script: x.explanation },
      ]),
    })),
  },
  {
    id: "kindness",
    title: "Kindness",
    hint: "Read the mission so your child knows what to do.",
    groups: [
      {
        id: "missions",
        title: "Kindness missions",
        items: missions.map((m) => ({ id: rid.mission(m.id), label: m.title, script: `${m.title}. ${m.description}${m.safetyNote ? ` ${m.safetyNote}` : ""}` })),
      },
    ],
  },
  {
    id: "games",
    title: "Games",
    hint: "Explain how to play each game.",
    groups: [{ id: "how-to-play", title: "How to play", items: games.map((g) => ({ id: rid.howToPlay(g.id), label: g.title, script: g.howToPlay.join(" ") })) }],
  },
  {
    id: "health",
    title: "Health & First Fast",
    hint: "Your own voice is the best way to say that health comes first.",
    groups: [
      {
        id: "safety",
        title: "Your health comes first",
        items: [
          { id: rid.health(), label: "Health message", script: CHILD_HEALTH_MESSAGE },
          { id: rid.unwell(), label: "If you feel unwell", script: UNWELL_STEPS.join(" ") },
          { id: rid.stayingSafe(), label: "Staying safe", script: CHILD_SAFETY_POINTS.join(" ") },
        ],
      },
      { id: "first-fast", title: "My First Fast", items: firstFastPages.map((p) => ({ id: rid.firstFast(p.id), label: p.title, script: `${p.title}. ${p.paragraphs.join(" ")}` })) },
    ],
  },
  {
    id: "dhivehi",
    title: "Dhivehi",
    hint: "Say each letter's name and sound, and each word, so children hear how it is really said.",
    groups: [
      { id: "dv-letters", title: "Letter sounds", items: LETTERS.map((l) => ({ id: rid.dvLetter(l.name), label: l.name, script: `${l.name} (sound: "${l.sound}")`, dv: l.char })) },
      { id: "dv-words", title: "Words", items: WORDS.map((w) => ({ id: rid.dvWord(w.id), label: `${w.roman} (${w.en})`, script: w.roman, dv: w.dv })) },
    ],
  },
];

export const ALL_RECORDING_ITEMS: RecItem[] = RECORDING_SECTIONS.flatMap((s) => s.groups.flatMap((g) => g.items));
