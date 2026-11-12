/** All editable content files as one bundle (what the admin dashboard edits and the validator checks). */
import lessons from "./data/lessons.json";
import stories from "./data/stories.json";
import missions from "./data/missions.json";
import quizzes from "./data/quizzes.json";
import days from "./data/days.json";
import games from "./data/games.json";
import vocabulary from "./data/vocabulary.json";
import pictureWords from "./data/picture-words.json";
import sortCards from "./data/sort-cards.json";
import lanternDesigns from "./data/lantern-designs.json";
import memoryCards from "./data/memory-cards.json";
import goals from "./data/goals.json";
import badges from "./data/badges.json";
import firstFast from "./data/first-fast.json";
import safety from "./data/safety.json";
import copy from "./data/copy.json";
import dhivehi from "./data/dhivehi.json";
import type { ContentBundle } from "./validate";

export const BUNDLED_CONTENT: ContentBundle = { lessons, stories, missions, quizzes, days, games, vocabulary, pictureWords, sortCards, lanternDesigns, memoryCards, goals, badges, firstFast, safety, copy, dhivehi };
