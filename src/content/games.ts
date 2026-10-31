import type { GameInfo, IllustrationKey, Review, SortCard, VocabTerm } from "./types";

const draft: Review = { status: "draft", notes: "Awaiting qualified Islamic content reviewer." };

export const games: GameInfo[] = [
  { id: "quiz", title: "Ramadan Quiz", description: "Answer questions and learn something new.", illustration: "quiz", howToPlay: ["Read the question.", "Tap the answer you think is right.", "Read why the answer is right, then tap Next."] },
  { id: "match-words", title: "Match the Words", description: "Match Ramadan words to their pictures.", illustration: "match", howToPlay: ["Tap a word.", "Then tap the picture that goes with it.", "Match all the pairs!"] },
  { id: "missing-lantern", title: "Find the Missing Lantern", description: "Look carefully — which lantern went missing?", illustration: "lantern", howToPlay: ["Look at the lanterns. Take as long as you like.", "Tap \"I'm ready\".", "One lantern has gone! Tap the lantern that is missing."] },
  { id: "mosque-puzzle", title: "Mosque Puzzle", description: "Put the picture of the village mosque back together.", illustration: "puzzle", howToPlay: ["Tap one piece.", "Then tap another piece to swap them.", "Keep swapping until the picture is complete."] },
  { id: "sort-deeds", title: "Sort the Good Deeds", description: "Is it a kind choice, or could we choose better?", illustration: "sort", howToPlay: ["Read the card.", "Tap \"Kind choice\" or \"Could choose better\".", "Read the friendly tip."] },
  { id: "memory-cards", title: "Ramadan Memory Cards", description: "Flip the cards and find the matching pairs.", illustration: "memory", howToPlay: ["Tap a card to flip it.", "Tap another card.", "If they match, they stay open. Find all the pairs!"] },
  { id: "vocab-match", title: "Word Meanings", description: "Match each Islamic word to its meaning.", illustration: "abc", howToPlay: ["Read the word.", "Tap the meaning that matches.", "Learn a new word each time!"] },
];

export const gameById = (id: string) => games.find((g) => g.id === id);

export const vocabulary: VocabTerm[] = [
  { id: "v-ramadan", word: "Ramadan", meaning: "The ninth month of the Islamic calendar, the month of fasting", illustration: "crescent", review: draft },
  { id: "v-suhoor", word: "Suhoor", meaning: "The meal before dawn", illustration: "sunrise", review: draft },
  { id: "v-iftar", word: "Iftar", meaning: "The meal at sunset that ends the fast", illustration: "sunset", review: draft },
  { id: "v-sawm", word: "Sawm", meaning: "Fasting", illustration: "hourglass", review: draft },
  { id: "v-salah", word: "Salah", meaning: "The prayer Muslims pray five times a day", illustration: "prayer-mat", review: draft },
  { id: "v-dua", word: "Dua", meaning: "Asking Allah for something in your own words", illustration: "dua", review: draft },
  { id: "v-masjid", word: "Masjid", meaning: "A mosque, a place where Muslims pray", illustration: "mosque", review: draft },
  { id: "v-quran", word: "Quran", meaning: "The holy book of Islam", illustration: "book", review: draft },
  { id: "v-zakat", word: "Zakat", meaning: "Giving part of your money to people in need", illustration: "charity-box", review: draft },
  { id: "v-sadaqah", word: "Sadaqah", meaning: "Giving that you choose to do", illustration: "gift", review: draft },
  { id: "v-eid", word: "Eid", meaning: "A celebration day", illustration: "eid", review: draft },
  { id: "v-sabr", word: "Sabr", meaning: "Patience", illustration: "hourglass", review: draft },
  { id: "v-shukr", word: "Shukr", meaning: "Being thankful", illustration: "thank-you", review: draft },
  { id: "v-wudu", word: "Wudu", meaning: "Washing in a special way before prayer", illustration: "water", review: draft },
];

/** Word-to-picture pairs for "Match the Words". */
export const pictureWords: { id: string; word: string; illustration: IllustrationKey; picture: string; hint: string }[] = [
  { id: "pw-ramadan", picture: "a crescent moon in the night sky", word: "Ramadan", illustration: "crescent", hint: "A crescent moon — Ramadan begins when it is seen." },
  { id: "pw-suhoor", picture: "the sun rising over the sea", word: "Suhoor", illustration: "sunrise", hint: "Suhoor is eaten before dawn, before the sun comes up." },
  { id: "pw-iftar", picture: "the sun setting behind a palm tree", word: "Iftar", illustration: "sunset", hint: "Iftar is the meal at sunset." },
  { id: "pw-dua", picture: "two open hands raised", word: "Dua", illustration: "dua", hint: "Many people raise their hands when they make a dua." },
  { id: "pw-mosque", picture: "a building with a dome and a tall tower", word: "Mosque", illustration: "mosque", hint: "A mosque is a place where Muslims pray together." },
  { id: "pw-quran", picture: "an open book on a stand", word: "Quran", illustration: "book", hint: "The Quran is the holy book of Islam." },
  { id: "pw-charity", picture: "a giving box with a heart", word: "Charity", illustration: "charity-box", hint: "Charity means giving to help others." },
  { id: "pw-eid", picture: "bunting, a moon and a star", word: "Eid", illustration: "eid", hint: "Eid is the happy celebration at the end of Ramadan." },
  { id: "pw-dates", picture: "a plate of brown dates", word: "Dates", illustration: "dates", hint: "Many people begin Iftar with dates and water." },
  { id: "pw-lantern", picture: "a glowing lantern", word: "Lantern", illustration: "lantern", hint: "Lanterns are a favourite Ramadan decoration." },
];

/** Cards for "Sort the Good Deeds". Language explains gently; never shames. */
export const sortCards: SortCard[] = [
  { id: "sd1", text: "Helping to set the table", helpful: true, explanation: "Helping at home makes everyone's day easier.", illustration: "family-table" },
  { id: "sd2", text: "Grabbing the last snack without asking", helpful: false, explanation: "Asking first and sharing is a kinder choice. Everyone can try again next time!", illustration: "sharing" },
  { id: "sd3", text: "Saying thank you to the bus driver", helpful: true, explanation: "Saying thank you shows we care.", illustration: "thank-you" },
  { id: "sd4", text: "Leaving toys all over the floor", helpful: false, explanation: "Tidying up is a kinder choice — it keeps everyone safe from tripping.", illustration: "toys" },
  { id: "sd5", text: "Sharing your crayons with a friend", helpful: true, explanation: "Sharing is generous and kind.", illustration: "sharing" },
  { id: "sd6", text: "Shouting in the mosque", helpful: false, explanation: "Using a quiet voice in the mosque is a kinder choice, so people can pray calmly.", illustration: "mosque" },
  { id: "sd7", text: "Telling the truth about a broken cup", helpful: true, explanation: "Being honest is brave, even when it's hard.", illustration: "heart-hands" },
  { id: "sd8", text: "Pushing in front of the line", helpful: false, explanation: "Waiting your turn patiently is a kinder choice.", illustration: "hourglass" },
  { id: "sd9", text: "Helping Grandma carry a light bag", helpful: true, explanation: "Helping elders shows respect and kindness.", illustration: "family" },
  { id: "sd10", text: "Throwing rubbish on the beach", helpful: false, explanation: "Putting rubbish in the bin keeps our island beautiful.", illustration: "island" },
  { id: "sd11", text: "Making a card for a friend who is sad", helpful: true, explanation: "A kind card can cheer someone up.", illustration: "card" },
  { id: "sd12", text: "Saying unkind words when you're cross", helpful: false, explanation: "When we're cross, taking a breath and using kind words is a better choice.", illustration: "smile" },
  { id: "sd13", text: "Watering the plants", helpful: true, explanation: "Caring for plants is caring for Allah's creation.", illustration: "garden" },
  { id: "sd14", text: "Saying sorry after a quarrel", helpful: true, explanation: "Saying sorry helps friends make up.", illustration: "heart-hands" },
];

/** Lantern designs for "Find the Missing Lantern". Names are spoken/read so colour is never the only cue. */
export const lanternDesigns: { id: string; name: string; body: string; glow: string; shape: "round" | "tall" | "star" | "diamond" }[] = [
  { id: "l-red", name: "red round lantern", body: "#C8553D", glow: "#FFD27A", shape: "round" },
  { id: "l-teal", name: "teal tall lantern", body: "#286356", glow: "#BFF0E0", shape: "tall" },
  { id: "l-gold", name: "gold star lantern", body: "#D4A72C", glow: "#FFF1B8", shape: "star" },
  { id: "l-purple", name: "purple diamond lantern", body: "#7A5FB5", glow: "#E4D8FF", shape: "diamond" },
  { id: "l-blue", name: "blue round lantern", body: "#2F6FA8", glow: "#CDE7FF", shape: "round" },
  { id: "l-pink", name: "pink tall lantern", body: "#C2577E", glow: "#FFD6E5", shape: "tall" },
  { id: "l-green", name: "green star lantern", body: "#3E8E41", glow: "#D9F7C9", shape: "star" },
  { id: "l-orange", name: "orange diamond lantern", body: "#D9822B", glow: "#FFE2BF", shape: "diamond" },
];

/** Picture cards for "Memory Cards". */
export const memoryCards: { id: string; label: string; illustration: IllustrationKey }[] = [
  { id: "mc-lantern", label: "Lantern", illustration: "lantern" },
  { id: "mc-dates", label: "Dates", illustration: "dates" },
  { id: "mc-crescent", label: "Crescent moon", illustration: "crescent" },
  { id: "mc-star", label: "Star", illustration: "star" },
  { id: "mc-mosque", label: "Mosque", illustration: "mosque" },
  { id: "mc-gift", label: "Gift", illustration: "gift" },
  { id: "mc-island", label: "Island", illustration: "island" },
  { id: "mc-food", label: "Iftar food", illustration: "maldivian-food" },
];
