import type { QuizSet, Review } from "./types";

const draft: Review = { status: "draft", notes: "Awaiting qualified Islamic content reviewer." };

/** Three options per question for younger players. Every answer has an explanation. */
export const quizSets: QuizSet[] = [
  {
    id: "ramadan-basics",
    title: "Ramadan Basics",
    illustration: "crescent",
    review: draft,
    questions: [
      { id: "rb1", question: "Which month of the Islamic calendar is Ramadan?", options: ["The first month", "The ninth month", "The twelfth month"], answer: 1, explanation: "Ramadan is the ninth month of the Islamic calendar." },
      { id: "rb2", question: "How do Islamic months begin?", options: ["When the new crescent moon is seen", "When it rains", "On the same date every year"], answer: 0, explanation: "Islamic months follow the moon and begin when the new crescent moon is seen." },
      { id: "rb3", question: "How many days can Ramadan have?", options: ["Always 31 days", "29 or 30 days", "Only 7 days"], answer: 1, explanation: "Because it follows the moon, Ramadan has 29 or 30 days." },
      { id: "rb4", question: "What is fasting?", options: ["Running very fast", "Not eating or drinking from dawn until sunset", "Sleeping all day"], answer: 1, explanation: "Fasting means not eating or drinking from dawn until sunset." },
      { id: "rb5", question: "Do children have to fast?", options: ["No, children do not have to fast", "Yes, every day", "Only on Fridays"], answer: 0, explanation: "Children do not have to fast. Some practise a little with their family's guidance. Your health always comes first." },
      { id: "rb6", question: "What celebration comes at the end of Ramadan?", options: ["A birthday", "Eid al-Fitr", "New Year"], answer: 1, explanation: "Eid al-Fitr is the celebration at the end of Ramadan." },
    ],
  },
  {
    id: "suhoor-iftar",
    title: "Suhoor and Iftar",
    illustration: "sunset",
    review: draft,
    questions: [
      { id: "si1", question: "When is Suhoor eaten?", options: ["Before dawn", "At lunchtime", "At midnight only"], answer: 0, explanation: "Suhoor is the meal before dawn, before the day's fast begins." },
      { id: "si2", question: "When is Iftar?", options: ["In the morning", "At sunset", "At noon"], answer: 1, explanation: "Iftar is the meal at sunset, when the fast ends for the day." },
      { id: "si3", question: "What do many Muslims eat first at Iftar?", options: ["Ice cream", "Dates and water", "Popcorn"], answer: 1, explanation: "Many Muslims like to begin Iftar with dates and water." },
      { id: "si4", question: "Which prayer comes just after sunset?", options: ["Fajr", "Maghrib", "Asr"], answer: 1, explanation: "Maghrib is the prayer just after sunset, around Iftar time." },
      { id: "si5", question: "Which of these is a Maldivian snack some families enjoy at Iftar?", options: ["Bajiya", "Pizza", "Cornflakes"], answer: 0, explanation: "Bajiya, gulha and masroshi are snacks some Maldivian families enjoy. Every family has its own favourites." },
      { id: "si6", question: "What should you do if you feel dizzy or unwell?", options: ["Keep it a secret", "Tell a grown-up straight away", "Run around"], answer: 1, explanation: "Your health comes first! Always tell a grown-up if you feel dizzy, weak or unwell." },
    ],
  },
  {
    id: "quran-prayer",
    title: "Quran and Prayer",
    illustration: "book",
    review: draft,
    questions: [
      { id: "qp1", question: "What is the Quran?", options: ["A storybook", "The holy book of Islam", "A map"], answer: 1, explanation: "The Quran is the holy book of Islam." },
      { id: "qp2", question: "What language is the Quran in?", options: ["Arabic", "English", "French"], answer: 0, explanation: "The Quran is in Arabic. Many children learn to read it with a teacher." },
      { id: "qp3", question: "What is a chapter of the Quran called?", options: ["A surah", "A page", "A song"], answer: 0, explanation: "Each chapter of the Quran is called a surah." },
      { id: "qp4", question: "How many times a day do Muslims pray Salah?", options: ["Two", "Five", "Ten"], answer: 1, explanation: "Muslims pray Salah five times a day." },
      { id: "qp5", question: "Which prayer is at dawn?", options: ["Isha", "Fajr", "Dhuhr"], answer: 1, explanation: "Fajr is the dawn prayer." },
      { id: "qp6", question: "What is wudu?", options: ["Washing in a special way before prayer", "A kind of food", "A game"], answer: 0, explanation: "Wudu is washing in a special way before prayer." },
    ],
  },
  {
    id: "giving",
    title: "Giving and Sharing",
    illustration: "charity-box",
    review: draft,
    questions: [
      { id: "gv1", question: "What is charity?", options: ["Giving to help others", "Keeping everything", "A type of boat"], answer: 0, explanation: "Charity means giving to help people who need it." },
      { id: "gv2", question: "What is giving that you choose to do called?", options: ["Sadaqah", "Suhoor", "Surah"], answer: 0, explanation: "Sadaqah is giving you choose to do." },
      { id: "gv3", question: "Zakat is one of the...", options: ["Five pillars of Islam", "Seven seas", "Days of the week"], answer: 0, explanation: "Zakat is one of the five pillars of Islam." },
      { id: "gv4", question: "Who works out and gives Zakat?", options: ["Grown-ups who have enough money", "Babies", "Nobody"], answer: 0, explanation: "Grown-ups who have enough money give Zakat. Children can learn about it and help their family be generous." },
      { id: "gv5", question: "What special charity do families give before Eid al-Fitr?", options: ["Zakat al-Fitr", "A birthday gift", "A party hat"], answer: 0, explanation: "Zakat al-Fitr is given before Eid so that everyone can enjoy Eid." },
      { id: "gv6", question: "Which is a kind way to share?", options: ["Sharing a snack with a friend", "Hiding all the toys", "Taking someone's turn"], answer: 0, explanation: "Sharing a snack, a toy or a turn is a kind thing to do." },
    ],
  },
  {
    id: "manners",
    title: "Good Manners",
    illustration: "smile",
    review: draft,
    questions: [
      { id: "mn1", question: "What does \"Assalamu alaikum\" mean?", options: ["Good night", "Peace be upon you", "Let's eat"], answer: 1, explanation: "\"Assalamu alaikum\" means \"Peace be upon you\"." },
      { id: "mn2", question: "What do many Muslims say before eating?", options: ["Bismillah", "Goodbye", "Hooray"], answer: 0, explanation: "Many Muslims say \"Bismillah\", which means \"In the name of Allah\", before eating." },
      { id: "mn3", question: "What should you do at a mosque?", options: ["Shout and run", "Take off your shoes and use a quiet voice", "Leave rubbish"], answer: 1, explanation: "At a mosque we take off our shoes, keep it clean and use a quiet voice." },
      { id: "mn4", question: "Someone is talking to you. What is good manners?", options: ["Listen to them", "Walk away", "Talk over them"], answer: 0, explanation: "Good manners means listening when someone is talking." },
      { id: "mn5", question: "What does \"Alhamdulillah\" mean?", options: ["All praise is for Allah", "Hurry up", "I'm hungry"], answer: 0, explanation: "\"Alhamdulillah\" means \"All praise is for Allah\". Muslims say it to thank Allah." },
      { id: "mn6", question: "You made a mistake. What is an honest thing to do?", options: ["Hide it", "Say sorry and try to fix it", "Blame someone else"], answer: 1, explanation: "Saying sorry and trying to make things better is honest and brave." },
    ],
  },
  {
    id: "knowledge",
    title: "Big Knowledge Quiz",
    illustration: "quiz",
    review: draft,
    questions: [
      { id: "kn1", question: "How many pillars of Islam are there?", options: ["Three", "Five", "Nine"], answer: 1, explanation: "There are five pillars of Islam: Shahada, Salah, Zakat, Sawm and Hajj." },
      { id: "kn2", question: "Which pillar is fasting in Ramadan?", options: ["Sawm", "Hajj", "Shahada"], answer: 0, explanation: "Sawm means fasting. Fasting in Ramadan is one of the five pillars." },
      { id: "kn3", question: "What is Hajj?", options: ["The pilgrimage to Makkah", "A morning meal", "A kind of lantern"], answer: 0, explanation: "Hajj is the pilgrimage to Makkah, once in a lifetime for grown-ups who are able." },
      { id: "kn4", question: "What is a dua?", options: ["Asking Allah for something in your own words", "A kind of fruit", "A boat"], answer: 0, explanation: "A dua is asking Allah for help or good things, in your own words." },
      { id: "kn5", question: "What is Laylatul Qadr?", options: ["A very special night in Ramadan", "A type of cake", "The first day of school"], answer: 0, explanation: "Laylatul Qadr, the Night of Power, is a very special night in the last ten nights of Ramadan." },
      { id: "kn6", question: "What is another word for a mosque?", options: ["Masjid", "Market", "Minaret"], answer: 0, explanation: "Masjid is the Arabic word for mosque. A minaret is the tall tower many mosques have." },
    ],
  },
  {
    id: "eid",
    title: "Eid Quiz",
    illustration: "eid",
    review: draft,
    questions: [
      { id: "ed1", question: "When is Eid al-Fitr?", options: ["At the end of Ramadan", "At the start of Ramadan", "In the middle of Ramadan"], answer: 0, explanation: "Eid al-Fitr is the celebration at the end of Ramadan." },
      { id: "ed2", question: "What do people say on Eid?", options: ["Eid Mubarak!", "Good luck!", "Happy birthday!"], answer: 0, explanation: "People say \"Eid Mubarak\", which means \"Blessed Eid\"." },
      { id: "ed3", question: "How do people know when Eid starts?", options: ["The new crescent moon is seen and it is announced", "A rooster crows", "It always starts on a Monday"], answer: 0, explanation: "Like Ramadan, Eid starts when the new crescent moon is seen. Grown-ups listen for the local announcement." },
      { id: "ed4", question: "What do many Muslims do on Eid morning?", options: ["Go to the special Eid prayer", "Go to school", "Stay in bed all day"], answer: 0, explanation: "Many Muslims wear clean or new clothes and go to the special Eid prayer." },
      { id: "ed5", question: "What do many people in the Maldives call Eid al-Fitr?", options: ["Kuda Eid", "Big Party", "Moon Day"], answer: 0, explanation: "Many people in the Maldives call Eid al-Fitr \"Kuda Eid\"." },
      { id: "ed6", question: "Which is a kind thing to do on Eid?", options: ["Visit family and share", "Keep all the treats", "Forget to say hello"], answer: 0, explanation: "Visiting family and sharing makes Eid happy for everyone." },
    ],
  },
];

export const quizSetById = (id: string) => quizSets.find((q) => q.id === id);
