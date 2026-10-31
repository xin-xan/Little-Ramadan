import type { Goal } from "./types";

/** Optional, private, adjustable personal goals chosen with a parent. */
export const goals: Goal[] = [
  { id: "goal-dua", title: "Learn a new dua", description: "Learn a short dua with a parent or teacher.", illustration: "dua" },
  { id: "goal-quran", title: "Read a short Quran passage with family", description: "Read or listen to a short passage together with your family.", illustration: "book" },
  { id: "goal-help-home", title: "Help someone at home", description: "Help someone at home with a job.", illustration: "family" },
  { id: "goal-thank-you", title: "Practise saying thank you", description: "Remember to say thank you to the people who help you.", illustration: "thank-you" },
  { id: "goal-learn-fasting", title: "Learn about fasting", description: "Read the My First Fast pages and ask a grown-up a question.", illustration: "hourglass" },
  { id: "goal-patient", title: "Be patient", description: "Practise waiting calmly for your turn.", illustration: "hourglass" },
  { id: "goal-share", title: "Share with someone", description: "Share something with a brother, sister or friend.", illustration: "sharing" },
];

export const MAX_ACTIVE_GOALS = 3;
