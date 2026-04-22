// Quick Challenge questions for the home-page hero.
//
// Used by /app/page.tsx to give a first-time visitor a taste of the
// quiz UI before they sign up. Previously inlined in page.tsx as a
// 5-entry literal — moved here so:
//   · the question bank is grep-able as DATA, not buried in UI code
//   · future audits (length-bias / Bloom's distribution) can scan
//     these the same way they scan /data/moduleN-mcq.ts
//   · adding/removing questions doesn't require editing the
//     home-page render code
//
// Style matches the broader MCQ rules:
//   · 4 options each
//   · correct answer never the longest option
//   · plain English, no jargon
//   · the topics covered are deliberately the simplest "what does X
//     stand for" / "which tag does Y" because this is a
//     pre-registration teaser, not a real quiz session

export interface QuickChallenge {
  question: string;
  options: string[];
  /** 0-based index of the correct option. */
  answer: number;
}

export const QUICK_CHALLENGE: QuickChallenge[] = [
  {
    question: "What does CPU stand for?",
    options: [
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Program Utility",
      "Core Processing Unit",
    ],
    answer: 0,
  },
  {
    question: "Which HTML tag makes text bold?",
    options: ["<strong>", "<em>", "<h1>", "<br>"],
    answer: 0,
  },
  {
    question: "What does AI stand for?",
    options: [
      "Automatic Integration",
      "Artificial Intelligence",
      "Advanced Interface",
      "Applied Informatics",
    ],
    answer: 1,
  },
  {
    question: "RAM is a type of ___?",
    options: ["Storage", "Memory", "Processor", "Software"],
    answer: 1,
  },
  {
    question: "Who invented the World Wide Web?",
    options: ["Steve Jobs", "Bill Gates", "Tim Berners-Lee", "Mark Zuckerberg"],
    answer: 2,
  },
];
