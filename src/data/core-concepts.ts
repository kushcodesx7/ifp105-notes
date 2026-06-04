// Core ICT Concepts — D·E·E·D revision notes for the IFP105 module material.
//
// Each entry is one concept a student should understand while revising —
// useful for anyone preparing or retaking the subject. Same D·E·E·D
// shape (Define, Explain, Example, Diagram) used in /exam-prep so the
// framing is consistent — students learn ONE structure for revising
// long-answer questions and reuse it.
//
// Framing rule (carved into every heading and label across the UI):
//   ✅ "These are the core ICT concepts from the module material."
//   ❌ Never frame anything as a prediction of what a specific exam
//       will contain — this is general revision material.
//
// Diagrams are kept as small SVG strings so the renderer can drop
// them in via dangerouslySetInnerHTML; each one is the simplest
// labelled visual a student could redraw with a pen in under a
// minute. No per-card React components — keeps the data declarative.

export type ConceptGroup =
  | "computer-basics"
  | "office"
  | "internet-social"
  | "html"
  | "emerging";

export interface ConceptCard {
  /** Stable slug — used as the localStorage key for "studied" state. */
  id: string;
  group: ConceptGroup;
  /** Short concept name, e.g. "Hardware". */
  title: string;
  /** Free-text tags for the search box (lowercased on match). */
  tags: string[];
  /** Optional cross-link back into the modules: "Module 1, 5" style. */
  relatedModules?: number[];

  // ── D·E·E·D body ───────────────────────────────────────────────
  /** 1–2 line definition in plain English. Sentence starter included. */
  define: string;
  /** 3–4 sentence explanation of HOW it works or WHY it matters. */
  explain: string;
  /** 2–3 daily-life examples a 17-year-old will recognise. */
  examples: string[];
  /** Tiny labelled diagram as an SVG string. Kept under 720×220. */
  diagramSvg: string;
  /** One-line caption rendered under the diagram. */
  diagramCaption: string;

  // ── Study notes ────────────────────────────────────────────────
  /** 3–4 phrases worth remembering for a good answer on this topic. */
  keyPhrases: string[];
  /** Specific things that make a clear, complete answer for THIS concept. */
  earnsMarks: string[];
  /** Common mistakes or easy-to-mix-up points for THIS concept. */
  losesMarks: string[];
  /** One-sentence study tip. */
  tip: string;
}

// Display metadata for the 5 groups — matches the chip palette in
// PracticeQuestions.tsx so the visual language stays consistent.
export const CONCEPT_GROUPS: Record<
  ConceptGroup,
  { label: string; icon: string; accent: string; description: string }
> = {
  "computer-basics": {
    label: "Computer Basics",
    icon: "💻",
    accent: "#818CF8",
    description: "The fundamentals every ICT student should be comfortable with.",
  },
  office: {
    label: "MS Office",
    icon: "📄",
    accent: "#34D399",
    description: "Word, Excel, PowerPoint — what each tool is for.",
  },
  "internet-social": {
    label: "Internet & Social Media",
    icon: "🌐",
    accent: "#60A5FA",
    description: "How the web works, plus social platforms for career.",
  },
  html: {
    label: "HTML",
    icon: "🔗",
    accent: "#06B6D4",
    description: "Tags, attributes, lists, tables — basic web pages.",
  },
  emerging: {
    label: "Emerging Tech",
    icon: "🤖",
    accent: "#A78BFA",
    description: "AI, ML, Blockchain, AR/VR — modern tech vocabulary.",
  },
};

// Helper: tiny SVG dimensions used across the bank for visual rhythm.
// Authors don't need to import this — it's documentation for the
// content review process: every diagram fits inside a 720×200 viewBox
// so cards line up nicely on desktop and stack neatly on mobile.

export const CORE_CONCEPTS: ConceptCard[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💻 COMPUTER BASICS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "why-computers-were-invented",
    group: "computer-basics",
    title: "Why Were Computers Invented? (S·A·S·C)",
    tags: [
      "history",
      "speed",
      "accuracy",
      "storage",
      "connectivity",
      "reasons",
      "sasc",
    ],
    relatedModules: [1],
    define:
      "Computers were invented to solve <strong>four big human problems</strong>: we are <em>slow</em>, we make <em>mistakes</em>, we cannot <em>remember</em> everything, and we cannot easily <em>share</em> information across distance. These four needs are remembered as <strong>S·A·S·C — Speed, Accuracy, Storage, Connectivity</strong>.",
    explain:
      "Humans get tired and make errors; computers don't. Marking 1,000 exam papers by hand takes weeks; a computer does it in seconds. Filing rooms full of paper can burn down or get lost; one USB stick holds an entire library. A letter to another country used to take two weeks; a video call now connects you instantly. Every modern device — phones, ATMs, hospital scanners, cars — exists because one of these four problems still needs solving.",
    examples: [
      "<strong>Speed</strong> — calculating bank interest for 1 million customers by hand vs in 2 seconds on a computer",
      "<strong>Accuracy</strong> — your phone's calculator never makes a typo on a maths question",
      "<strong>Storage</strong> — your whole music library, photos, and notes fit on one phone instead of filling a room",
      "<strong>Connectivity</strong> — WhatsApp lets you message a friend in Tashkent and a cousin in London at the same time, instantly",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="40" width="160" height="120" rx="12" fill="rgba(251,191,36,0.12)" stroke="#FBBF24" stroke-width="1.6"/>
      <text x="100" y="68" text-anchor="middle" font-size="22">⚡</text>
      <text x="100" y="96" text-anchor="middle" fill="#FCD34D" font-size="13" font-weight="700" font-family="system-ui">SPEED</text>
      <text x="100" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">milliseconds vs</text>
      <text x="100" y="134" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">weeks by hand</text>
      <rect x="195" y="40" width="160" height="120" rx="12" fill="rgba(96,165,250,0.12)" stroke="#60A5FA" stroke-width="1.6"/>
      <text x="275" y="68" text-anchor="middle" font-size="22">🎯</text>
      <text x="275" y="96" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">ACCURACY</text>
      <text x="275" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">zero errors when</text>
      <text x="275" y="134" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">programmed right</text>
      <rect x="370" y="40" width="160" height="120" rx="12" fill="rgba(167,139,250,0.12)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="450" y="68" text-anchor="middle" font-size="22">🗃️</text>
      <text x="450" y="96" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">STORAGE</text>
      <text x="450" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">a library on a</text>
      <text x="450" y="134" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">thumb drive</text>
      <rect x="545" y="40" width="160" height="120" rx="12" fill="rgba(52,211,153,0.12)" stroke="#34D399" stroke-width="1.6"/>
      <text x="625" y="68" text-anchor="middle" font-size="22">🌐</text>
      <text x="625" y="96" text-anchor="middle" fill="#6EE7B7" font-size="13" font-weight="700" font-family="system-ui">CONNECTIVITY</text>
      <text x="625" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">global reach in</text>
      <text x="625" y="134" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">a single tap</text>
      <text x="360" y="184" text-anchor="middle" fill="#FCD34D" font-size="12" font-weight="700" font-family="system-ui">Memory trick — S·A·S·C: "Some Amazing Students Compute"</text>
    </svg>`,
    diagramCaption:
      "Four boxes side by side, one per reason, with the SASC mnemonic underneath.",
    keyPhrases: [
      "Speed · Accuracy · Storage · Connectivity",
      "solve four human limitations",
      "faster, error-free, more storage, instant sharing",
      "S·A·S·C mnemonic",
    ],
    earnsMarks: [
      "All FOUR reasons named — partial answers (only 2–3) feel incomplete",
      "One real-life example per reason, not just the names",
      "Mentioning that humans are slow / tired / forgetful — gives the contrast",
    ],
    losesMarks: [
      "Naming only Speed and stopping",
      "Confusing Storage with Memory (Memory is RAM/ROM; Storage = hard disk, USB)",
      "Generic examples (\"used in offices\") — be specific",
    ],
    tip: "Memorise the mnemonic <strong>S·A·S·C</strong> — \"Some Amazing Students Compute\". Four words, four reasons, one example each — a clear, complete answer.",
  },
  {
    id: "hardware",
    group: "computer-basics",
    title: "Hardware",
    tags: ["hardware", "input", "output", "device", "physical", "computer"],
    relatedModules: [1],
    define:
      "Hardware refers to the <strong>physical parts of a computer</strong> — the things you can actually see and touch.",
    explain:
      "A computer needs hardware to take in information (input), process it (the CPU and memory), store it (hard disk), and show results (output). Every device — phone, laptop, ATM — is built from hardware working together. Without hardware, software has nowhere to run.",
    examples: [
      "<strong>Input devices</strong> — keyboard, mouse, microphone, webcam, touchscreen",
      "<strong>Output devices</strong> — monitor, speakers, printer",
      "<strong>Storage</strong> — hard disk, SSD, USB stick, SD card",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="60" width="140" height="80" rx="8" fill="rgba(96,165,250,0.12)" stroke="#60A5FA" stroke-width="1.6"/>
      <text x="90" y="95" text-anchor="middle" fill="#93C5FD" font-size="14" font-weight="700" font-family="system-ui">INPUT</text>
      <text x="90" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">keyboard · mouse</text>
      <line x1="160" y1="100" x2="220" y2="100" stroke="#A1A1AA" stroke-width="2" marker-end="url(#cca)"/>
      <rect x="220" y="40" width="200" height="120" rx="10" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.8"/>
      <text x="320" y="80" text-anchor="middle" fill="#C4B5FD" font-size="14" font-weight="700" font-family="system-ui">PROCESS</text>
      <text x="320" y="100" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">CPU + RAM</text>
      <text x="320" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">(brain of computer)</text>
      <line x1="420" y1="100" x2="480" y2="100" stroke="#A1A1AA" stroke-width="2" marker-end="url(#cca)"/>
      <rect x="480" y="60" width="140" height="80" rx="8" fill="rgba(52,211,153,0.12)" stroke="#34D399" stroke-width="1.6"/>
      <text x="550" y="95" text-anchor="middle" fill="#6EE7B7" font-size="14" font-weight="700" font-family="system-ui">OUTPUT</text>
      <text x="550" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">monitor · speaker</text>
      <rect x="220" y="170" width="200" height="20" rx="4" fill="rgba(251,191,36,0.10)" stroke="#FBBF24" stroke-width="1"/>
      <text x="320" y="184" text-anchor="middle" fill="#FCD34D" font-size="10" font-weight="600" font-family="system-ui">STORAGE — hard disk · USB</text>
      <defs>
        <marker id="cca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption: "Input → Process → Output, with Storage holding the data.",
    keyPhrases: [
      "physical parts of a computer",
      "you can see and touch",
      "input · process · output · storage",
    ],
    earnsMarks: [
      "Definition uses the words <em>physical</em> or <em>tangible</em>",
      "At least 2 input AND 2 output examples — not all from one category",
      "Mentions that hardware needs software to actually do anything",
    ],
    losesMarks: [
      "Listing only screens and keyboards (too narrow)",
      "Calling Windows or MS Word hardware (that's software!)",
      "Skipping the diagram when the question asks for one",
    ],
    tip: "Think of the four blocks: <strong>input → process → output</strong>, with storage underneath. If you draw that, you've already covered the diagram part.",
  },
  {
    id: "software",
    group: "computer-basics",
    title: "Software (System vs Application)",
    tags: ["software", "system", "application", "operating system", "os"],
    relatedModules: [1],
    define:
      "Software refers to the <strong>programs and instructions</strong> that tell a computer's hardware what to do. There are two main types: <strong>system software</strong> and <strong>application software</strong>.",
    explain:
      "<strong>System software</strong> runs the computer itself — the operating system (Windows, Android), drivers, and utilities. <strong>Application software</strong> is what you use to get tasks done — writing, browsing, gaming, video calls. Without system software, applications cannot run; without applications, system software is just an idle engine.",
    examples: [
      "<strong>System software</strong> — Windows 11, macOS, Android, Linux",
      "<strong>Application software</strong> — MS Word, WhatsApp, Chrome, Instagram, Zoom",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="80" y="20" width="560" height="50" rx="8" fill="rgba(96,165,250,0.14)" stroke="#60A5FA" stroke-width="1.6"/>
      <text x="360" y="42" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">APPLICATION SOFTWARE</text>
      <text x="360" y="58" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">MS Word · Chrome · WhatsApp · Instagram</text>
      <rect x="80" y="80" width="560" height="50" rx="8" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="360" y="102" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">SYSTEM SOFTWARE</text>
      <text x="360" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Operating System (Windows · Android · macOS)</text>
      <rect x="80" y="140" width="560" height="40" rx="8" fill="rgba(251,191,36,0.10)" stroke="#FBBF24" stroke-width="1.4"/>
      <text x="360" y="165" text-anchor="middle" fill="#FCD34D" font-size="13" font-weight="700" font-family="system-ui">HARDWARE — the physical computer</text>
    </svg>`,
    diagramCaption:
      "Three layers stacked. Hardware at the bottom, system software in the middle, applications on top.",
    keyPhrases: [
      "programs and instructions",
      "system software runs the computer",
      "application software helps the user",
    ],
    earnsMarks: [
      "Both types defined separately, not lumped together",
      "Two examples in each category — don't mix them up",
      "Sentence connecting hardware ↔ software ↔ user",
    ],
    losesMarks: [
      "Saying \"software is anti-virus\" (only one example)",
      "Listing Windows under application software",
      "Forgetting examples of system software entirely",
    ],
    tip: "Memorise one example of each: <em>Windows = system, MS Word = application</em>. From there you can always extend the list.",
  },
  {
    id: "primary-vs-secondary-memory",
    group: "computer-basics",
    title: "Primary vs Secondary Memory",
    tags: ["memory", "ram", "rom", "hard disk", "storage", "primary", "secondary"],
    relatedModules: [1],
    define:
      "<strong>Primary memory</strong> (RAM, ROM) is the fast memory the computer uses <em>while it's switched on</em>. <strong>Secondary memory</strong> (hard disk, SSD, USB) is slower long-term storage that keeps your data <em>even when the computer is off</em>.",
    explain:
      "Primary memory is <em>fast but small and temporary</em> — when you turn off the computer, RAM forgets everything. Secondary memory is <em>slower but bigger and permanent</em> — your photos, music, and files survive a restart. The CPU pulls programs from secondary into primary so it can actually use them.",
    examples: [
      "<strong>Primary</strong> — 8 GB RAM in a laptop, ROM chip on the motherboard",
      "<strong>Secondary</strong> — 512 GB SSD, 1 TB hard disk, 64 GB USB pen drive, SD card",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="70" rx="8" fill="rgba(96,165,250,0.14)" stroke="#60A5FA" stroke-width="1.6"/>
      <text x="190" y="42" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">PRIMARY MEMORY</text>
      <text x="190" y="60" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">RAM · ROM</text>
      <text x="190" y="78" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">fast · small · temporary</text>
      <rect x="380" y="20" width="300" height="70" rx="8" fill="rgba(251,191,36,0.12)" stroke="#FBBF24" stroke-width="1.6"/>
      <text x="530" y="42" text-anchor="middle" fill="#FCD34D" font-size="13" font-weight="700" font-family="system-ui">SECONDARY MEMORY</text>
      <text x="530" y="60" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Hard Disk · SSD · USB</text>
      <text x="530" y="78" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">slower · larger · permanent</text>
      <text x="40" y="120" fill="#A1A1AA" font-size="11" font-family="system-ui" font-weight="600">DIFFERENCES:</text>
      <text x="40" y="140" fill="#D4D4D8" font-size="11" font-family="system-ui">• Speed: Primary is faster than Secondary</text>
      <text x="40" y="158" fill="#D4D4D8" font-size="11" font-family="system-ui">• Size: Secondary is much bigger</text>
      <text x="40" y="176" fill="#D4D4D8" font-size="11" font-family="system-ui">• Power: Primary loses data when off; Secondary keeps it</text>
      <text x="40" y="194" fill="#D4D4D8" font-size="11" font-family="system-ui">• Cost: Primary is more expensive per GB</text>
    </svg>`,
    diagramCaption:
      "Two boxes side by side, with the four key differences listed underneath.",
    keyPhrases: [
      "fast working memory",
      "long-term storage",
      "volatile vs non-volatile",
      "expensive but small / cheap but large",
    ],
    earnsMarks: [
      "Four CLEAR differences (speed, size, permanence, cost)",
      "An example of each kind — not just \"RAM\" twice",
      "Mentioning that primary loses data when power is off",
    ],
    losesMarks: [
      "Calling RAM \"storage\" without distinguishing temp/permanent",
      "Mixing up \"hard disk = primary\" — it's secondary",
      "Listing only one difference and stopping",
    ],
    tip: "Use the <strong>fast/small/temporary</strong> vs <strong>slow/big/permanent</strong> rhythm — three contrasts in one breath. Clean parallel structure is easy to remember.",
  },
  {
    id: "ip-vs-email-address",
    group: "computer-basics",
    title: "IP Address vs Email Address",
    tags: ["ip address", "email", "network", "internet", "address"],
    relatedModules: [1, 4],
    define:
      "An <strong>IP address</strong> is a unique number that identifies a device on a network (e.g. <code>192.168.1.5</code>). An <strong>email address</strong> is a unique name that identifies a person's mailbox on the internet (e.g. <code>kush@gmail.com</code>).",
    explain:
      "IP addresses are how <em>computers find each other</em> — they're for machines. Email addresses are how <em>people find each other</em> — they're for humans. When you send an email, your message travels between two email servers; the underlying network uses IP addresses to actually route the data.",
    examples: [
      "<strong>IP address</strong> — <code>142.250.183.78</code> (Google's servers), <code>192.168.0.1</code> (your home router)",
      "<strong>Email address</strong> — <code>student@amity.edu.uz</code>, <code>kush@gmail.com</code>",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="280" height="120" rx="10" fill="rgba(96,165,250,0.12)" stroke="#60A5FA" stroke-width="1.6"/>
      <text x="180" y="68" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">IP ADDRESS</text>
      <text x="180" y="92" text-anchor="middle" fill="#FFFFFF" font-size="14" font-family="ui-monospace,monospace" font-weight="600">192.168.1.5</text>
      <text x="180" y="115" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">finds a DEVICE on a network</text>
      <text x="180" y="135" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">used by computers, not humans</text>
      <rect x="400" y="40" width="280" height="120" rx="10" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="540" y="68" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">EMAIL ADDRESS</text>
      <text x="540" y="92" text-anchor="middle" fill="#FFFFFF" font-size="14" font-family="ui-monospace,monospace" font-weight="600">kush@gmail.com</text>
      <text x="540" y="115" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">finds a PERSON'S mailbox</text>
      <text x="540" y="135" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">used by humans, written in words</text>
    </svg>`,
    diagramCaption: "IP = numbers for machines; email = words for people.",
    keyPhrases: [
      "unique number identifying a device",
      "unique name identifying a mailbox",
      "machines vs people",
    ],
    earnsMarks: [
      "Both addresses defined with their format (numbers vs words)",
      "Sentence saying who/what each is for",
      "One real example of each — not just made-up",
    ],
    losesMarks: [
      "Saying \"IP address is what you type into Gmail\" (no!)",
      "Skipping the format (numbers vs name@domain)",
      "Defining only one of the two",
    ],
    tip: "<strong>IP = device. Email = person.</strong> If you remember those four words you have the heart of the answer.",
  },
  {
    id: "www-and-browser",
    group: "computer-basics",
    title: "WWW and Web Browser",
    tags: ["www", "world wide web", "browser", "internet", "chrome"],
    relatedModules: [1, 4],
    define:
      "The <strong>World Wide Web (WWW)</strong> is a huge collection of web pages connected by links, all stored on servers around the world. A <strong>web browser</strong> is the software you use to <em>view</em> those pages — like Chrome, Firefox, or Safari.",
    explain:
      "The Web is the <em>content</em>; the browser is the <em>tool</em> that reads it. When you type a website in the address bar, the browser asks a server for the page, downloads the HTML, and renders it so you can see and click. Without a browser, the Web is just files on distant computers; without the Web, the browser has nothing to display.",
    examples: [
      "Open Chrome (browser) → type <code>youtube.com</code> → watch a video — that's WWW + browser working together",
      "Browsers — Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, Opera",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="180" height="80" rx="8" fill="rgba(96,165,250,0.14)" stroke="#60A5FA" stroke-width="1.6"/>
      <text x="130" y="68" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">YOU + BROWSER</text>
      <text x="130" y="88" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Chrome · Firefox</text>
      <text x="130" y="106" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">on your laptop or phone</text>
      <line x1="220" y1="80" x2="280" y2="80" stroke="#A1A1AA" stroke-width="2" marker-end="url(#wwwa)"/>
      <text x="250" y="74" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">request</text>
      <line x1="280" y1="100" x2="220" y2="100" stroke="#A1A1AA" stroke-width="2" marker-end="url(#wwwa)"/>
      <text x="250" y="115" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">page (HTML)</text>
      <rect x="280" y="30" width="200" height="100" rx="50" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="380" y="60" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">WORLD WIDE WEB</text>
      <text x="380" y="82" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">billions of pages on</text>
      <text x="380" y="98" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">servers worldwide</text>
      <text x="380" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">connected by links</text>
      <line x1="480" y1="80" x2="540" y2="80" stroke="#A1A1AA" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="600" y="60" text-anchor="middle" fill="#FCD34D" font-size="11" font-weight="700" font-family="system-ui">SERVERS</text>
      <text x="600" y="78" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">store the pages</text>
      <text x="600" y="96" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">in different countries</text>
      <defs>
        <marker id="wwwa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption:
      "Browser sends a request, the Web (a network of servers) sends the page back.",
    keyPhrases: [
      "collection of web pages",
      "connected by hyperlinks",
      "browser = software to view pages",
      "stored on servers worldwide",
    ],
    earnsMarks: [
      "Both terms defined separately, with their relationship clear",
      "Naming 2–3 real browsers (not just \"Google\")",
      "Sentence about how the browser fetches a page",
    ],
    losesMarks: [
      "Saying \"WWW is the same as the internet\" (it isn't — WWW is one service ON the internet)",
      "Forgetting to say what the browser actually DOES",
      "Listing only Google as a browser (Google is a search engine, not a browser; Chrome is)",
    ],
    tip: "<strong>Web = content. Browser = window into that content.</strong> Always pair them in your answer — they only make sense together.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📄 MS OFFICE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "ms-word-features",
    group: "office",
    title: "MS Word — Word Processing & Features",
    tags: ["ms word", "word processing", "document", "office"],
    relatedModules: [2],
    define:
      "<strong>Word processing</strong> means creating and formatting written documents on a computer. <strong>MS Word</strong> is the most common word-processing application — used for essays, CVs, letters, and reports.",
    explain:
      "Word processing goes far beyond typing. The software helps you format text (bold, headings), insert pictures and tables, fix spelling and grammar, and print a clean page. The same document can be edited, saved, shared, or reopened later — much faster than rewriting on paper.",
    examples: [
      "Writing a school essay with headings, paragraphs, and a cover page",
      "Making a CV with your photo, education table, and contact details",
      "Drafting a formal letter to your professor with a date and signature line",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="640" height="160" rx="10" fill="rgba(255,255,255,0.02)" stroke="#34D399" stroke-width="1.4"/>
      <rect x="40" y="20" width="640" height="36" rx="10" fill="rgba(52,211,153,0.12)"/>
      <text x="60" y="42" fill="#6EE7B7" font-size="12" font-weight="700" font-family="system-ui">📄 MS WORD — Document.docx</text>
      <text x="60" y="76" fill="#FCD34D" font-size="11" font-weight="700" font-family="system-ui">FOUR KEY FEATURES:</text>
      <text x="60" y="98" fill="#D4D4D8" font-size="11" font-family="system-ui">1. Formatting — Bold, Italic, Underline, font sizes</text>
      <text x="60" y="118" fill="#D4D4D8" font-size="11" font-family="system-ui">2. Insert — pictures, tables, charts, page numbers</text>
      <text x="60" y="138" fill="#D4D4D8" font-size="11" font-family="system-ui">3. Spell &amp; Grammar Check — catches typos automatically</text>
      <text x="60" y="158" fill="#D4D4D8" font-size="11" font-family="system-ui">4. Save &amp; Reopen — .docx file you can edit, share, or print</text>
    </svg>`,
    diagramCaption:
      "A page-shape with the four key features stacked inside it.",
    keyPhrases: [
      "create and format documents",
      "formatting, insert, spell-check, save",
      "saved as a .docx file",
    ],
    earnsMarks: [
      "Definition that mentions BOTH \"create\" and \"format\"",
      "Four named features, not vague ones",
      "One specific example (essay, CV, letter)",
    ],
    losesMarks: [
      "Saying \"MS Word is for typing\" — too narrow",
      "Listing four buttons (Bold, Italic, Underline, Save) as features — those are options, not features",
      "Forgetting that you can insert images and tables",
    ],
    tip: "Always pair the definition with the file extension <code>.docx</code> — it shows you understand it's a saveable, editable document, not just typing.",
  },
  {
    id: "ms-word-formatting",
    group: "office",
    title: "MS Word — Bold, Italic, Underline, Font Size",
    tags: ["formatting", "bold", "italic", "underline", "font", "ms word"],
    relatedModules: [2],
    define:
      "<strong>Bold</strong>, <strong>Italic</strong>, <strong>Underline</strong>, and <strong>Font Size</strong> are the four basic formatting tools in MS Word. Each one changes how text <em>looks</em> so the reader can quickly understand what's important.",
    explain:
      "Bold makes text thicker for emphasis (key terms, headings). Italic slants the text — used for book titles, quotations, or stress on a word. Underline draws a line under it (legal terms, links). Font size makes text bigger or smaller — bigger for titles, smaller for footnotes. You select the text first, then click the button (or use the keyboard shortcut: <code>Ctrl+B</code>, <code>Ctrl+I</code>, <code>Ctrl+U</code>).",
    examples: [
      "Bold a heading: <strong>Chapter 1</strong>",
      "Italic a book title: <em>Harry Potter</em>",
      "Underline a key phrase: <u>important note</u>",
      "Font Size 24 for the title, size 12 for the body text",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="160" height="120" rx="10" fill="rgba(96,165,250,0.10)" stroke="#60A5FA" stroke-width="1.4"/>
      <text x="120" y="60" text-anchor="middle" fill="#93C5FD" font-size="36" font-weight="900" font-family="system-ui">B</text>
      <text x="120" y="98" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700" font-family="system-ui">BOLD</text>
      <text x="120" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">emphasis</text>
      <text x="120" y="138" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Ctrl+B</text>
      <rect x="220" y="30" width="160" height="120" rx="10" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" stroke-width="1.4"/>
      <text x="300" y="60" text-anchor="middle" fill="#C4B5FD" font-size="36" font-style="italic" font-weight="700" font-family="system-ui">I</text>
      <text x="300" y="98" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700" font-family="system-ui">ITALIC</text>
      <text x="300" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">titles, quotes</text>
      <text x="300" y="138" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Ctrl+I</text>
      <rect x="400" y="30" width="160" height="120" rx="10" fill="rgba(52,211,153,0.10)" stroke="#34D399" stroke-width="1.4"/>
      <text x="480" y="60" text-anchor="middle" fill="#6EE7B7" font-size="36" font-weight="700" text-decoration="underline" font-family="system-ui">U</text>
      <text x="480" y="98" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700" font-family="system-ui">UNDERLINE</text>
      <text x="480" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">key terms</text>
      <text x="480" y="138" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Ctrl+U</text>
      <rect x="580" y="30" width="100" height="120" rx="10" fill="rgba(251,191,36,0.10)" stroke="#FBBF24" stroke-width="1.4"/>
      <text x="630" y="58" text-anchor="middle" fill="#FCD34D" font-size="20" font-weight="800" font-family="system-ui">A</text>
      <text x="630" y="78" text-anchor="middle" fill="#FCD34D" font-size="13" font-weight="700" font-family="system-ui">A</text>
      <text x="630" y="98" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700" font-family="system-ui">FONT SIZE</text>
      <text x="630" y="118" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">titles vs body</text>
      <text x="630" y="138" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">8 → 72 pt</text>
    </svg>`,
    diagramCaption:
      "Four boxes, one per option, with the keyboard shortcut at the bottom.",
    keyPhrases: [
      "select text first, then format",
      "emphasis vs structure vs hierarchy",
      "Ctrl+B / Ctrl+I / Ctrl+U",
    ],
    earnsMarks: [
      "All four named with WHEN to use each",
      "Mention of the shortcut (<code>Ctrl+B</code> etc.)",
      "One worked example per tool",
    ],
    losesMarks: [
      "Just listing the names with no purpose attached",
      "Saying \"Bold makes text bold\" (circular — explain WHY/WHEN)",
      "Forgetting that you must select the text first",
    ],
    tip: "Always say \"<em>select first, then click</em>\". That one phrase shows you actually know how to use Word, not just memorise buttons.",
  },
  {
    id: "ms-word-find-replace",
    group: "office",
    title: "MS Word — Find and Replace",
    tags: ["find", "replace", "ms word", "ctrl+f", "ctrl+h"],
    relatedModules: [2],
    define:
      "<strong>Find</strong> searches your document for a specific word; <strong>Replace</strong> swaps every match with a new word. Together they let you fix or update text across the whole document in seconds.",
    explain:
      "Open Find with <code>Ctrl+F</code>; open Find &amp; Replace with <code>Ctrl+H</code>. Type the old word in \"Find\", the new word in \"Replace\", and click <em>Replace All</em> — every match changes at once. Useful when you misspell a name, want to update a year, or change a term throughout an essay without re-reading every page.",
    examples: [
      "Misspelt \"Tashkent\" as \"Tashkint\" 12 times → Replace All fixes it instantly",
      "Wrote a CV using \"2024\" everywhere → replace all with \"2026\" before printing",
      "Switching all \"he\" to \"they\" in a story to make it gender-neutral",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="640" height="140" rx="10" fill="rgba(255,255,255,0.02)" stroke="#34D399" stroke-width="1.4"/>
      <text x="60" y="55" fill="#6EE7B7" font-size="13" font-weight="700" font-family="system-ui">🔍 FIND &amp; REPLACE  (Ctrl+H)</text>
      <rect x="60" y="70" width="220" height="32" rx="6" fill="rgba(255,255,255,0.05)" stroke="#71717A" stroke-width="1"/>
      <text x="70" y="90" fill="#A1A1AA" font-size="11" font-family="system-ui">Find:</text>
      <text x="170" y="90" text-anchor="middle" fill="#FBBF24" font-size="12" font-weight="700" font-family="system-ui">Tashkint</text>
      <line x1="290" y1="86" x2="340" y2="86" stroke="#A1A1AA" stroke-width="2" marker-end="url(#fra)"/>
      <text x="315" y="80" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">replace</text>
      <rect x="350" y="70" width="220" height="32" rx="6" fill="rgba(52,211,153,0.10)" stroke="#34D399" stroke-width="1"/>
      <text x="360" y="90" fill="#A1A1AA" font-size="11" font-family="system-ui">Replace with:</text>
      <text x="490" y="90" text-anchor="middle" fill="#6EE7B7" font-size="12" font-weight="700" font-family="system-ui">Tashkent</text>
      <rect x="60" y="118" width="160" height="32" rx="6" fill="rgba(99,102,241,0.20)" stroke="#818CF8" stroke-width="1.4"/>
      <text x="140" y="138" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700" font-family="system-ui">Replace All</text>
      <text x="240" y="138" fill="#A1A1AA" font-size="11" font-family="system-ui">→ all 12 matches fixed at once</text>
      <defs>
        <marker id="fra" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption: "Two text boxes side by side with a Replace All button.",
    keyPhrases: [
      "search a document for a word",
      "swap every match in one step",
      "Ctrl+F to find, Ctrl+H to replace",
    ],
    earnsMarks: [
      "Both Find AND Replace defined separately",
      "Mentioning the keyboard shortcut",
      "A practical example (typo, date update)",
    ],
    losesMarks: [
      "Conflating Find with Replace — they're not the same",
      "Forgetting to mention \"Replace All\" — that's the time-saver",
      "Not giving a real-life use case",
    ],
    tip: "Always include \"<em>saves time on a long document</em>\" — that's the WHY. Explaining the value, not just the steps, makes the answer feel complete.",
  },
  {
    id: "ms-word-save-vs-save-as",
    group: "office",
    title: "MS Word — Save vs Save As",
    tags: ["save", "save as", "ms word", "ctrl+s", "f12"],
    relatedModules: [2],
    define:
      "<strong>Save</strong> updates the existing file with your latest changes. <strong>Save As</strong> creates a NEW file (you choose the name and location), leaving the original untouched.",
    explain:
      "Use Save (<code>Ctrl+S</code>) every few minutes while working — it overwrites the same file, so you don't lose progress if the laptop crashes. Use Save As (<code>F12</code>) the FIRST time you save a brand-new document, OR when you want to keep the original AND make a different copy (e.g. Essay-v1.docx and Essay-v2.docx).",
    examples: [
      "Working on \"Assignment.docx\" — press <code>Ctrl+S</code> after every paragraph",
      "Want to keep last week's draft AND today's edits → <em>Save As</em> \"Assignment-final.docx\"",
      "Sending the same letter to two friends — <em>Save As</em> \"Letter-Ali.docx\" then \"Letter-Aziz.docx\"",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="300" height="140" rx="10" fill="rgba(96,165,250,0.10)" stroke="#60A5FA" stroke-width="1.6"/>
      <text x="190" y="58" text-anchor="middle" fill="#93C5FD" font-size="14" font-weight="700" font-family="system-ui">💾 SAVE  (Ctrl+S)</text>
      <text x="190" y="84" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">updates the SAME file</text>
      <text x="190" y="106" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Essay.docx → Essay.docx</text>
      <text x="190" y="128" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">overwrites the old version</text>
      <text x="190" y="150" text-anchor="middle" fill="#FBBF24" font-size="10" font-weight="700" font-family="system-ui">use every few minutes</text>
      <rect x="380" y="30" width="300" height="140" rx="10" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="530" y="58" text-anchor="middle" fill="#C4B5FD" font-size="14" font-weight="700" font-family="system-ui">📋 SAVE AS  (F12)</text>
      <text x="530" y="84" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">makes a NEW file</text>
      <text x="530" y="106" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Essay.docx → Essay-v2.docx</text>
      <text x="530" y="128" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">original is preserved</text>
      <text x="530" y="150" text-anchor="middle" fill="#FBBF24" font-size="10" font-weight="700" font-family="system-ui">use first save / keep copy</text>
    </svg>`,
    diagramCaption:
      "Two boxes side by side. Save = overwrites; Save As = creates a new file.",
    keyPhrases: [
      "updates the existing file",
      "creates a new file with a chosen name",
      "Ctrl+S vs F12",
    ],
    earnsMarks: [
      "Both clearly distinguished, no confusion between them",
      "Mentioning that Save As lets you choose the name AND location",
      "An example of when each is appropriate",
    ],
    losesMarks: [
      "Saying \"Save and Save As are the same\" (false)",
      "Forgetting the shortcut keys",
      "Not explaining when to use Save As (first save, or keeping a copy)",
    ],
    tip: "Memorise this rule: <strong>Save = same file. Save As = new file.</strong> One sentence captures the difference.",
  },
  {
    id: "ms-excel-spreadsheet",
    group: "office",
    title: "MS Excel — Spreadsheet & Functions",
    tags: ["excel", "spreadsheet", "sum", "average", "max", "min", "formula"],
    relatedModules: [2],
    define:
      "A <strong>spreadsheet</strong> is a grid of <strong>rows and columns</strong> where each box (a <em>cell</em>) holds a number, text, or formula. <strong>MS Excel</strong> is the most common spreadsheet program — it does the maths for you the moment a number changes.",
    explain:
      "Cells are named by their column letter and row number (A1, B7, etc.). You can write <strong>formulas</strong> that calculate from other cells — every formula starts with <code>=</code>. Excel updates the answer instantly when you edit any of the input cells, which makes it the perfect tool for marks, budgets, and any number-heavy task.",
    examples: [
      "<code>=SUM(A1:A10)</code> — adds every number from A1 to A10",
      "<code>=AVERAGE(B1:B5)</code> — finds the mean of 5 test marks",
      "<code>=MAX(C1:C30)</code> / <code>=MIN(C1:C30)</code> — highest and lowest values",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="640" height="160" rx="10" fill="rgba(255,255,255,0.02)" stroke="#34D399" stroke-width="1.4"/>
      <text x="60" y="48" fill="#6EE7B7" font-size="13" font-weight="700" font-family="system-ui">📊 EXCEL — Marks.xlsx</text>
      <g font-family="ui-monospace,monospace" font-size="11">
        <rect x="60" y="60" width="60" height="22" fill="rgba(255,255,255,0.03)" stroke="#52525B"/>
        <text x="90" y="76" text-anchor="middle" fill="#A1A1AA" font-weight="700">A</text>
        <rect x="120" y="60" width="60" height="22" fill="rgba(255,255,255,0.03)" stroke="#52525B"/>
        <text x="150" y="76" text-anchor="middle" fill="#A1A1AA" font-weight="700">B</text>
        <rect x="180" y="60" width="60" height="22" fill="rgba(255,255,255,0.03)" stroke="#52525B"/>
        <text x="210" y="76" text-anchor="middle" fill="#A1A1AA" font-weight="700">C</text>
        <rect x="60" y="82" width="60" height="22" fill="rgba(99,102,241,0.10)" stroke="#52525B"/>
        <text x="90" y="98" text-anchor="middle" fill="#FFFFFF">85</text>
        <rect x="120" y="82" width="60" height="22" stroke="#52525B"/>
        <text x="150" y="98" text-anchor="middle" fill="#FFFFFF">90</text>
        <rect x="180" y="82" width="60" height="22" stroke="#52525B"/>
        <text x="210" y="98" text-anchor="middle" fill="#FFFFFF">75</text>
        <rect x="60" y="104" width="60" height="22" stroke="#52525B"/>
        <text x="90" y="120" text-anchor="middle" fill="#FFFFFF">88</text>
        <rect x="120" y="104" width="60" height="22" stroke="#52525B"/>
        <text x="150" y="120" text-anchor="middle" fill="#FFFFFF">82</text>
        <rect x="180" y="104" width="60" height="22" stroke="#52525B"/>
        <text x="210" y="120" text-anchor="middle" fill="#FFFFFF">91</text>
        <rect x="60" y="126" width="60" height="22" fill="rgba(52,211,153,0.18)" stroke="#34D399"/>
        <text x="90" y="142" text-anchor="middle" fill="#6EE7B7" font-weight="700">86.5</text>
      </g>
      <text x="270" y="98" fill="#FCD34D" font-size="11" font-family="ui-monospace,monospace">=SUM(A1:A2)</text>
      <text x="270" y="118" fill="#A1A1AA" font-size="10" font-family="system-ui">adds 85 + 88 = 173</text>
      <text x="270" y="142" fill="#FCD34D" font-size="11" font-family="ui-monospace,monospace">=AVERAGE(A1:A2)</text>
      <text x="270" y="158" fill="#A1A1AA" font-size="10" font-family="system-ui">→ 86.5</text>
      <text x="500" y="98" fill="#A78BFA" font-size="11" font-family="system-ui" font-weight="700">4 KEY FUNCTIONS:</text>
      <text x="500" y="118" fill="#D4D4D8" font-size="10" font-family="system-ui">SUM, AVERAGE, MAX, MIN</text>
      <text x="500" y="138" fill="#D4D4D8" font-size="10" font-family="system-ui">Always start with =</text>
      <text x="500" y="158" fill="#D4D4D8" font-size="10" font-family="system-ui">Live: changes when data changes</text>
    </svg>`,
    diagramCaption:
      "A 3-column grid (A B C) with cell values and one formula =AVERAGE(A1:A2) showing the result.",
    keyPhrases: [
      "rows and columns of cells",
      "every formula starts with =",
      "SUM, AVERAGE, MAX, MIN",
      "live calculation",
    ],
    earnsMarks: [
      "Definition mentions ROWS and COLUMNS by name",
      "Four functions named with their purpose",
      "Sentence about formulas updating live when data changes",
    ],
    losesMarks: [
      "Listing functions without an example",
      "Forgetting the leading <code>=</code> sign",
      "Calling Excel \"a calculator\" — too narrow",
    ],
    tip: "End your answer with one specific formula written out: <code>=SUM(A1:A10)</code>. One concrete formula proves you've actually used Excel.",
  },
  {
    id: "ms-excel-sort-vs-filter",
    group: "office",
    title: "MS Excel — Sort vs Filter",
    tags: ["excel", "sort", "filter", "data", "ascending", "descending"],
    relatedModules: [2],
    define:
      "<strong>Sorting</strong> rearranges your rows in order (A→Z, smallest→largest, oldest→newest). <strong>Filtering</strong> hides rows that don't match a rule, so only the data you care about stays visible.",
    explain:
      "Sort changes the <em>order</em> but every row stays visible. Filter changes <em>visibility</em> — rows that don't match are temporarily hidden, never deleted, and reappear when you turn the filter off. Both live on the <strong>Data</strong> tab in Excel and work on a table you've selected.",
    examples: [
      "<strong>Sort</strong>: a list of 30 students ordered by marks (highest first)",
      "<strong>Filter</strong>: a class list with only students above 80% shown — the rest are hidden, not removed",
      "<strong>Sort + Filter together</strong>: filter to \"Section A\" only, then sort those by name",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="160" rx="10" fill="rgba(96,165,250,0.10)" stroke="#60A5FA" stroke-width="1.4"/>
      <text x="190" y="44" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">SORT — change ORDER</text>
      <g font-family="ui-monospace,monospace" font-size="11">
        <text x="60" y="70" fill="#A1A1AA">Before:</text>
        <text x="150" y="70" fill="#FFFFFF">Ali 75 · Mia 90 · Bob 60</text>
        <text x="60" y="90" fill="#A1A1AA">After ▼:</text>
        <text x="150" y="90" fill="#34D399">Mia 90 · Ali 75 · Bob 60</text>
      </g>
      <text x="190" y="120" text-anchor="middle" fill="#A1A1AA" font-size="11" font-family="system-ui">all 3 rows still visible</text>
      <text x="190" y="142" text-anchor="middle" fill="#A1A1AA" font-size="11" font-family="system-ui">just rearranged</text>
      <text x="190" y="166" text-anchor="middle" fill="#FCD34D" font-size="10" font-weight="600" font-family="system-ui">A→Z · smallest→largest · oldest→newest</text>
      <rect x="380" y="20" width="300" height="160" rx="10" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" stroke-width="1.4"/>
      <text x="530" y="44" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">FILTER — hide unwanted rows</text>
      <g font-family="ui-monospace,monospace" font-size="11">
        <text x="400" y="70" fill="#A1A1AA">Before:</text>
        <text x="480" y="70" fill="#FFFFFF">Ali 75 · Mia 90 · Bob 60</text>
        <text x="400" y="90" fill="#A1A1AA">Filter &gt;80:</text>
        <text x="490" y="90" fill="#A78BFA">Mia 90</text>
      </g>
      <text x="530" y="120" text-anchor="middle" fill="#A1A1AA" font-size="11" font-family="system-ui">Ali &amp; Bob hidden,</text>
      <text x="530" y="138" text-anchor="middle" fill="#A1A1AA" font-size="11" font-family="system-ui">not deleted</text>
      <text x="530" y="166" text-anchor="middle" fill="#FCD34D" font-size="10" font-weight="600" font-family="system-ui">turn filter off → all rows return</text>
    </svg>`,
    diagramCaption:
      "Sort rearranges every row; Filter hides rows that don't match the rule.",
    keyPhrases: [
      "sort = change the order",
      "filter = hide rows that don't match",
      "filter is non-destructive",
      "found on the Data tab",
    ],
    earnsMarks: [
      "Both verbs explained with an action word (rearrange / hide)",
      "Mentioning that Filter does NOT delete data",
      "One example each, ideally a class-marks scenario",
    ],
    losesMarks: [
      "Saying \"Filter removes rows\" — it hides them",
      "Mixing the two up in the example",
      "Skipping the example entirely (\"Sort sorts\" is not an answer)",
    ],
    tip: "Phrase it as: \"<em>Sort changes the order; Filter changes the visibility.</em>\" That single contrast nails the distinction.",
  },
  {
    id: "ms-powerpoint-features",
    group: "office",
    title: "MS PowerPoint — Features & Advantages",
    tags: ["powerpoint", "presentation", "slides", "features"],
    relatedModules: [2],
    define:
      "<strong>MS PowerPoint</strong> is a presentation program — you build a sequence of <em>slides</em>, each holding text, pictures, or charts, and click through them while you speak to an audience.",
    explain:
      "PowerPoint helps you <em>tell a story visually</em>: a title slide grabs attention, content slides explain points one at a time, and the audience follows along instead of reading a wall of text. Saved as a <code>.pptx</code> file, you can edit, reorder, or reuse slides. Each slide has a <strong>layout</strong> (title, two-content, etc.) and a <strong>theme</strong> sets the colour and font for the whole deck.",
    examples: [
      "A class project on Tashkent — 8 slides with photos, a map, and key facts",
      "A pitch for a school event with a title slide, agenda, and Q&amp;A",
      "Revision deck on \"Computer Hardware\" — one concept per slide",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="40" width="160" height="100" rx="6" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.4"/>
      <text x="110" y="62" text-anchor="middle" fill="#C4B5FD" font-size="11" font-weight="700" font-family="system-ui">SLIDE 1</text>
      <text x="110" y="84" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="700" font-family="system-ui">Title</text>
      <text x="110" y="104" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">project name + my name</text>
      <text x="110" y="128" text-anchor="middle" fill="#FCD34D" font-size="10" font-family="system-ui">📌 Title layout</text>
      <rect x="200" y="40" width="160" height="100" rx="6" fill="rgba(96,165,250,0.12)" stroke="#60A5FA" stroke-width="1.4"/>
      <text x="280" y="62" text-anchor="middle" fill="#93C5FD" font-size="11" font-weight="700" font-family="system-ui">SLIDE 2</text>
      <text x="280" y="84" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="700" font-family="system-ui">Bullets</text>
      <text x="280" y="104" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">3–5 short points</text>
      <text x="280" y="128" text-anchor="middle" fill="#FCD34D" font-size="10" font-family="system-ui">📌 Title + Content</text>
      <rect x="370" y="40" width="160" height="100" rx="6" fill="rgba(52,211,153,0.12)" stroke="#34D399" stroke-width="1.4"/>
      <text x="450" y="62" text-anchor="middle" fill="#6EE7B7" font-size="11" font-weight="700" font-family="system-ui">SLIDE 3</text>
      <text x="450" y="84" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="700" font-family="system-ui">Image</text>
      <text x="450" y="104" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">photo + caption</text>
      <text x="450" y="128" text-anchor="middle" fill="#FCD34D" font-size="10" font-family="system-ui">📌 Picture layout</text>
      <rect x="540" y="40" width="160" height="100" rx="6" fill="rgba(251,191,36,0.12)" stroke="#FBBF24" stroke-width="1.4"/>
      <text x="620" y="62" text-anchor="middle" fill="#FCD34D" font-size="11" font-weight="700" font-family="system-ui">SLIDE 4</text>
      <text x="620" y="84" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="700" font-family="system-ui">Conclusion</text>
      <text x="620" y="104" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">key takeaway</text>
      <text x="620" y="128" text-anchor="middle" fill="#FCD34D" font-size="10" font-family="system-ui">📌 Title + Content</text>
      <text x="360" y="170" text-anchor="middle" fill="#D4D4D8" font-size="11" font-family="system-ui">Features: slides · layouts · themes · transitions · animations</text>
    </svg>`,
    diagramCaption:
      "Four slides arranged left-to-right showing the typical structure of a presentation.",
    keyPhrases: [
      "sequence of slides",
      "each slide holds one idea",
      "themes, layouts, transitions",
      ".pptx file",
    ],
    earnsMarks: [
      "Definition uses the word \"slides\"",
      "At least 4 named features (slides, themes, layouts, transitions, animations — pick 4)",
      "An advantage stated clearly (\"helps audience follow along\")",
    ],
    losesMarks: [
      "Saying \"PowerPoint is for showing pictures\" — too narrow",
      "Listing buttons (Insert, Design) as features",
      "Forgetting the file extension",
    ],
    tip: "Always finish with the audience-perspective: \"<em>helps the audience follow visually while the speaker talks.</em>\" That's the WHY behind every feature.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌐 INTERNET & SOCIAL MEDIA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "social-media",
    group: "internet-social",
    title: "Social Media — Definition, Benefits, Risks",
    tags: ["social media", "instagram", "tiktok", "facebook", "youtube"],
    relatedModules: [3],
    define:
      "<strong>Social media</strong> is any app or website where users <em>post their own content</em> and others can <em>reply, comment, or share</em>. It's two-way — unlike old TV or newspapers, anyone can post.",
    explain:
      "Social media works because of three actions: <em>post, react, share</em>. You upload a photo, friends like or comment, and the platform spreads it to people who don't follow you yet. The same loop powers Instagram, TikTok, YouTube, and X. The result: news, entertainment, and conversations move at the speed of taps.",
    examples: [
      "<strong>Benefits</strong> — instant news, learning communities, free skill tutorials on YouTube, staying in touch with family abroad",
      "<strong>Risks</strong> — addiction (endless scroll), mental-health pressure (comparison), fake news, privacy leaks",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="360" cy="100" r="36" fill="rgba(99,102,241,0.18)" stroke="#818CF8" stroke-width="2"/>
      <text x="360" y="98" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="700" font-family="system-ui">YOU</text>
      <text x="360" y="115" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">post · reply · share</text>
      <g>
        <circle cx="100" cy="60" r="22" fill="rgba(236,72,153,0.14)" stroke="#EC4899" stroke-width="1.4"/>
        <text x="100" y="65" text-anchor="middle" font-size="14">📷</text>
        <text x="100" y="92" text-anchor="middle" fill="#F472B6" font-size="9" font-weight="700" font-family="system-ui">INSTAGRAM</text>
        <line x1="124" y1="68" x2="324" y2="92" stroke="#EC4899" stroke-dasharray="3 2" stroke-width="1.2"/>
      </g>
      <g>
        <circle cx="100" cy="140" r="22" fill="rgba(20,184,166,0.14)" stroke="#14B8A6" stroke-width="1.4"/>
        <text x="100" y="146" text-anchor="middle" font-size="14">🎵</text>
        <text x="100" y="170" text-anchor="middle" fill="#5EEAD4" font-size="9" font-weight="700" font-family="system-ui">TIKTOK</text>
        <line x1="124" y1="138" x2="324" y2="115" stroke="#14B8A6" stroke-dasharray="3 2" stroke-width="1.2"/>
      </g>
      <g>
        <circle cx="620" cy="60" r="22" fill="rgba(239,68,68,0.14)" stroke="#EF4444" stroke-width="1.4"/>
        <text x="620" y="65" text-anchor="middle" font-size="14">▶️</text>
        <text x="620" y="92" text-anchor="middle" fill="#FCA5A5" font-size="9" font-weight="700" font-family="system-ui">YOUTUBE</text>
        <line x1="596" y1="68" x2="396" y2="92" stroke="#EF4444" stroke-dasharray="3 2" stroke-width="1.2"/>
      </g>
      <g>
        <circle cx="620" cy="140" r="22" fill="rgba(37,99,235,0.14)" stroke="#2563EB" stroke-width="1.4"/>
        <text x="620" y="148" text-anchor="middle" font-size="14" fill="#93C5FD" font-weight="700" font-family="system-ui">f</text>
        <text x="620" y="170" text-anchor="middle" fill="#93C5FD" font-size="9" font-weight="700" font-family="system-ui">FACEBOOK</text>
        <line x1="596" y1="138" x2="396" y2="115" stroke="#2563EB" stroke-dasharray="3 2" stroke-width="1.2"/>
      </g>
    </svg>`,
    diagramCaption:
      "You at the centre, with two-way arrows to Instagram, TikTok, YouTube, and Facebook.",
    keyPhrases: [
      "users post their own content",
      "two-way conversation",
      "post · react · share",
      "benefits and risks together",
    ],
    earnsMarks: [
      "Definition makes \"two-way\" explicit (vs old broadcast media)",
      "TWO benefits AND TWO risks, balanced",
      "Real platform names (not generic \"social media app\")",
    ],
    losesMarks: [
      "Only listing benefits or only listing risks (lopsided)",
      "Defining it as \"texting your friends\"",
      "Forgetting that anyone can post — that's what makes it different",
    ],
    tip: "Always present social media <strong>balanced</strong> — two benefits, two risks. A balanced take feels mature, not preachy.",
  },
  {
    id: "social-media-marketing",
    group: "internet-social",
    title: "Social Media Marketing",
    tags: ["marketing", "instagram", "facebook", "ads", "promotion"],
    relatedModules: [3],
    define:
      "<strong>Social Media Marketing</strong> is the use of platforms like Instagram, Facebook, or TikTok to <em>promote a brand, product, or service</em> — through posts, stories, reels, and paid ads.",
    explain:
      "Companies post content where their customers already spend time. A clothing shop posts photos on Instagram, runs a discount story for a weekend, and pays for an ad to reach new people. Compared with TV ads, social media is <em>cheaper, faster, and measurable</em> — the platform tells the brand exactly how many people watched and clicked.",
    examples: [
      "A Tashkent café posting daily Instagram reels and stories",
      "A new sneaker brand running a paid Facebook ad targeting 18–24 year olds",
      "An online tutor making TikTok videos to attract students to their classes",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="180" height="80" rx="10" fill="rgba(96,165,250,0.12)" stroke="#60A5FA" stroke-width="1.4"/>
      <text x="130" y="68" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">BRAND</text>
      <text x="130" y="88" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">café · sneakers · tutor</text>
      <text x="130" y="108" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">creates content</text>
      <line x1="220" y1="80" x2="280" y2="80" stroke="#A1A1AA" stroke-width="2" marker-end="url(#smma)"/>
      <rect x="280" y="20" width="200" height="120" rx="10" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="380" y="48" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">SOCIAL PLATFORMS</text>
      <text x="380" y="72" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">📷 Instagram · 🎵 TikTok</text>
      <text x="380" y="92" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">f Facebook · ▶️ YouTube</text>
      <text x="380" y="116" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">posts · stories · paid ads</text>
      <line x1="480" y1="80" x2="540" y2="80" stroke="#A1A1AA" stroke-width="2" marker-end="url(#smma)"/>
      <rect x="540" y="40" width="140" height="80" rx="10" fill="rgba(52,211,153,0.12)" stroke="#34D399" stroke-width="1.4"/>
      <text x="610" y="68" text-anchor="middle" fill="#6EE7B7" font-size="13" font-weight="700" font-family="system-ui">CUSTOMERS</text>
      <text x="610" y="88" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">see · click · buy</text>
      <text x="610" y="108" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">measurable reach</text>
      <defs>
        <marker id="smma" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption:
      "Brand → Social platforms → Customers, with an arrow showing the flow.",
    keyPhrases: [
      "promote a brand or product",
      "posts, stories, reels, paid ads",
      "cheaper, faster, measurable than TV",
    ],
    earnsMarks: [
      "Definition includes BOTH organic posts AND paid ads",
      "At least 2 platform examples (Instagram + Facebook is the safe pair)",
      "An advantage over traditional advertising (cost or measurability)",
    ],
    losesMarks: [
      "Saying \"posting on Instagram\" without mentioning the goal (selling)",
      "Forgetting that paid ads are part of marketing",
      "Listing only one platform",
    ],
    tip: "Always link the activity to a <strong>goal</strong>: \"to attract customers / build a brand\". Marketing without a goal is just posting.",
  },
  {
    id: "linkedin",
    group: "internet-social",
    title: "LinkedIn — Career Network",
    tags: ["linkedin", "career", "job", "profile", "professional"],
    relatedModules: [3],
    define:
      "<strong>LinkedIn</strong> is a social-media platform built for <em>careers</em> — your profile is like a digital CV, and you connect with classmates, professionals, and companies instead of just friends.",
    explain:
      "Where Instagram is for personal photos and TikTok for entertainment, LinkedIn is for showing your education, skills, and projects. Recruiters search LinkedIn directly for candidates; companies post job openings; alumni share advice. Starting a profile at 17 — even before you have job experience — gives you a head start on every other student who waits until graduation.",
    examples: [
      "A profile listing your university, your IFP105 class, and a project you built",
      "Following companies you'd like to work for (Google, Apple, EPAM)",
      "Connecting with alumni from Amity Tashkent already working in tech",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="160" rx="10" fill="rgba(37,99,235,0.10)" stroke="#2563EB" stroke-width="1.4"/>
      <text x="190" y="44" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">📷 INSTAGRAM</text>
      <text x="190" y="68" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">friends · photos · reels</text>
      <text x="190" y="92" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">personal · entertainment</text>
      <text x="190" y="116" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">followers see your life</text>
      <text x="190" y="140" text-anchor="middle" fill="#FBBF24" font-size="10" font-weight="700" font-family="system-ui">does NOT help with jobs</text>
      <rect x="380" y="20" width="300" height="160" rx="10" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="530" y="44" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">💼 LINKEDIN</text>
      <text x="530" y="68" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">career · skills · jobs</text>
      <text x="530" y="92" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">professional · work-focused</text>
      <text x="530" y="116" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">recruiters search YOU</text>
      <text x="530" y="140" text-anchor="middle" fill="#34D399" font-size="10" font-weight="700" font-family="system-ui">opens internship + job doors</text>
    </svg>`,
    diagramCaption:
      "Instagram on the left for personal life; LinkedIn on the right for career.",
    keyPhrases: [
      "professional network",
      "digital CV",
      "recruiters and companies",
      "start before you graduate",
    ],
    earnsMarks: [
      "Comparison with another platform (Instagram is the easy contrast)",
      "Specific career uses — recruiters, jobs, internships",
      "Mentioning \"start early\" as the advantage",
    ],
    losesMarks: [
      "Calling LinkedIn \"just like Facebook\" — different purpose",
      "Listing it without explaining the career angle",
      "Forgetting that profile = digital CV",
    ],
    tip: "End with one personal action: \"<em>I will create my LinkedIn profile this week</em>\". Concrete intent beats abstract analysis on this one.",
  },
  {
    id: "linkedin-profile-setup",
    group: "internet-social",
    title: "LinkedIn Profile — Set It Up Now",
    tags: ["linkedin", "profile", "headline", "summary", "career"],
    relatedModules: [3],
    define:
      "A <strong>LinkedIn profile</strong> is your <em>online professional identity</em> — the first thing a recruiter, alumnus, or potential mentor sees when they search your name. The earlier you build it, the more it grows with you.",
    explain:
      "A complete profile has five core parts: a clear photo, a headline (one line about you), a summary (3–5 sentences), education, and skills. Even at 17 with no job, you can list your university, your IFP105 course, projects you've built, and clubs you're part of. Recruiters can find you years before graduation, and you start a network of classmates, alumni, and professionals before you actually need it.",
    examples: [
      "<strong>Headline</strong>: \"First-year Computer Science student at Amity Tashkent · Interested in AI and Web Development\"",
      "<strong>Summary</strong>: \"I'm studying at Amity, learning HTML and Python, and building small projects on the side.\"",
      "<strong>Skills</strong>: HTML, MS Office, public speaking, English, Russian",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="640" height="160" rx="10" fill="rgba(255,255,255,0.02)" stroke="#A78BFA" stroke-width="1.4"/>
      <circle cx="100" cy="70" r="28" fill="rgba(167,139,250,0.20)" stroke="#A78BFA" stroke-width="1.4"/>
      <text x="100" y="78" text-anchor="middle" font-size="22">🧑</text>
      <text x="140" y="60" fill="#FFFFFF" font-size="13" font-weight="700" font-family="system-ui">Your Name</text>
      <text x="140" y="78" fill="#C4B5FD" font-size="11" font-family="system-ui">First-year student · Amity Tashkent · Interested in AI</text>
      <text x="140" y="92" fill="#A1A1AA" font-size="10" font-family="system-ui">Tashkent, Uzbekistan</text>
      <line x1="60" y1="110" x2="660" y2="110" stroke="#52525B" stroke-width="1"/>
      <text x="60" y="130" fill="#FCD34D" font-size="11" font-weight="700" font-family="system-ui">5 SECTIONS TO COMPLETE:</text>
      <text x="60" y="148" fill="#D4D4D8" font-size="10" font-family="system-ui">1. Photo (clear face, smile)  2. Headline (one line)  3. Summary (3–5 sentences)</text>
      <text x="60" y="166" fill="#D4D4D8" font-size="10" font-family="system-ui">4. Education (school + course)  5. Skills (5–10 you actually have)</text>
    </svg>`,
    diagramCaption:
      "Profile mockup — photo, headline, location, then 5 numbered sections.",
    keyPhrases: [
      "online professional identity",
      "photo, headline, summary, education, skills",
      "start early, grow with you",
    ],
    earnsMarks: [
      "Naming all 5 sections in order",
      "A specific headline example (your own university and interest)",
      "Mentioning recruiters can find you EARLY",
    ],
    losesMarks: [
      "Saying \"upload a photo\" with no other detail",
      "Listing 10 sections that don't actually exist on LinkedIn",
      "Forgetting that students should start at 17, not after graduation",
    ],
    tip: "Action first, theory second. End with what you'll do tomorrow morning: \"<em>Add my photo and write a one-line headline</em>\". A concrete plan makes the answer feel real.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔗 HTML
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "html-elements-attributes",
    group: "html",
    title: "HTML — Elements vs Attributes",
    tags: ["html", "element", "attribute", "tag", "web"],
    relatedModules: [4],
    define:
      "<strong>HTML</strong> (HyperText Markup Language) is the language used to build web pages. An <strong>element</strong> is a piece of the page (a heading, paragraph, image). An <strong>attribute</strong> is extra information INSIDE the opening tag that tells the browser more about that element.",
    explain:
      "An element looks like <code>&lt;p&gt;Hello&lt;/p&gt;</code> — opening tag, content, closing tag. An attribute lives inside the opening tag and gives the element a property: <code>&lt;a href=\"google.com\"&gt;Search&lt;/a&gt;</code> — the <code>href</code> attribute tells the browser where the link goes. Element = the THING; attribute = a DETAIL about that thing.",
    examples: [
      "<strong>Elements</strong>: <code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;img&gt;</code>, <code>&lt;a&gt;</code>",
      "<strong>Attributes</strong>: <code>href</code> (in &lt;a&gt;), <code>src</code> (in &lt;img&gt;), <code>style</code> (in any tag)",
      "<code>&lt;img src=\"logo.png\" alt=\"School logo\"&gt;</code> — element <code>&lt;img&gt;</code> with two attributes",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="640" height="120" rx="10" fill="rgba(255,255,255,0.02)" stroke="#06B6D4" stroke-width="1.4"/>
      <text x="60" y="68" fill="#67E8F9" font-size="11" font-weight="700" font-family="system-ui">EXAMPLE TAG:</text>
      <text x="60" y="98" fill="#FBBF24" font-size="20" font-family="ui-monospace,monospace" font-weight="700">&lt;a href="google.com"&gt;Search&lt;/a&gt;</text>
      <line x1="80" y1="108" x2="80" y2="120" stroke="#34D399" stroke-width="1.4"/>
      <text x="80" y="135" text-anchor="middle" fill="#34D399" font-size="10" font-weight="700" font-family="system-ui">tag (element)</text>
      <line x1="160" y1="108" x2="160" y2="120" stroke="#A78BFA" stroke-width="1.4"/>
      <text x="160" y="135" text-anchor="middle" fill="#A78BFA" font-size="10" font-weight="700" font-family="system-ui">attribute name</text>
      <line x1="260" y1="108" x2="260" y2="120" stroke="#60A5FA" stroke-width="1.4"/>
      <text x="260" y="135" text-anchor="middle" fill="#60A5FA" font-size="10" font-weight="700" font-family="system-ui">attribute value</text>
      <line x1="380" y1="108" x2="380" y2="120" stroke="#FBBF24" stroke-width="1.4"/>
      <text x="380" y="135" text-anchor="middle" fill="#FBBF24" font-size="10" font-weight="700" font-family="system-ui">content</text>
      <line x1="490" y1="108" x2="490" y2="120" stroke="#EF4444" stroke-width="1.4"/>
      <text x="490" y="135" text-anchor="middle" fill="#EF4444" font-size="10" font-weight="700" font-family="system-ui">closing tag</text>
    </svg>`,
    diagramCaption:
      "One real tag with all four parts labelled — opening tag, attribute, content, closing tag.",
    keyPhrases: [
      "language used to build web pages",
      "element = the thing",
      "attribute = a detail about that thing",
      "attributes live in the opening tag",
    ],
    earnsMarks: [
      "Both terms defined separately, then together in an example",
      "Pointing at where the attribute LIVES (inside the opening tag)",
      "One concrete example showing both",
    ],
    losesMarks: [
      "Confusing element with attribute (\"&lt;p&gt; is an attribute\")",
      "Forgetting the closing tag in your example",
      "Saying \"HTML is a programming language\" — it's a markup language",
    ],
    tip: "Memorise this one example: <code>&lt;a href=\"google.com\"&gt;Search&lt;/a&gt;</code>. Pointing at the parts in order proves you actually understand it.",
  },
  {
    id: "html-comments",
    group: "html",
    title: "HTML Comments",
    tags: ["html", "comment", "documentation"],
    relatedModules: [4],
    define:
      "An <strong>HTML comment</strong> is a note inside your code that the <em>browser ignores</em> — it doesn't show up on the web page. Format: <code>&lt;!-- this is a comment --&gt;</code>.",
    explain:
      "Comments are notes for HUMANS reading your code, not for the browser. You use them to explain a tricky section, leave reminders for your teammate, or temporarily \"hide\" some code without deleting it. Without comments, a long HTML file becomes very hard to understand a week later — even for the person who wrote it.",
    examples: [
      "<code>&lt;!-- main navigation bar --&gt;</code>",
      "<code>&lt;!-- TODO: add the school logo here --&gt;</code>",
      "<code>&lt;!-- &lt;p&gt;Old paragraph, hidden for now&lt;/p&gt; --&gt;</code> (commenting out code instead of deleting it)",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="160" rx="10" fill="rgba(255,255,255,0.02)" stroke="#06B6D4" stroke-width="1.4"/>
      <text x="60" y="48" fill="#67E8F9" font-size="11" font-weight="700" font-family="system-ui">YOUR HTML FILE</text>
      <g font-family="ui-monospace,monospace" font-size="11">
        <text x="60" y="72" fill="#FFFFFF">&lt;h1&gt;Welcome&lt;/h1&gt;</text>
        <text x="60" y="92" fill="#71717A">&lt;!-- This is a comment --&gt;</text>
        <text x="60" y="112" fill="#FFFFFF">&lt;p&gt;Hello world&lt;/p&gt;</text>
        <text x="60" y="132" fill="#71717A">&lt;!-- TODO: add image --&gt;</text>
        <text x="60" y="152" fill="#FFFFFF">&lt;footer&gt;...&lt;/footer&gt;</text>
      </g>
      <line x1="350" y1="100" x2="380" y2="100" stroke="#A1A1AA" stroke-width="2" marker-end="url(#hca)"/>
      <rect x="380" y="20" width="300" height="160" rx="10" fill="rgba(52,211,153,0.10)" stroke="#34D399" stroke-width="1.4"/>
      <text x="400" y="48" fill="#6EE7B7" font-size="11" font-weight="700" font-family="system-ui">WHAT THE BROWSER SHOWS</text>
      <g font-family="system-ui" font-size="14">
        <text x="400" y="76" fill="#FFFFFF" font-weight="700">Welcome</text>
        <text x="400" y="100" fill="#FFFFFF">Hello world</text>
        <text x="400" y="140" fill="#A1A1AA" font-size="11">[footer]</text>
      </g>
      <text x="400" y="172" fill="#FBBF24" font-size="10" font-weight="700" font-family="system-ui">Comments are HIDDEN — only humans see them.</text>
      <defs>
        <marker id="hca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption:
      "Source file on the left includes comments; rendered page on the right hides them.",
    keyPhrases: [
      "<!-- ... -->",
      "ignored by the browser",
      "notes for humans, not the browser",
    ],
    earnsMarks: [
      "Correct syntax shown EXACTLY — both <code>&lt;!--</code> and <code>--&gt;</code>",
      "Stating that the browser ignores comments",
      "At least one use case (explanation, reminder, hiding code)",
    ],
    losesMarks: [
      "Wrong syntax (e.g. <code>// comment</code>)",
      "Saying comments are visible on the page",
      "Forgetting the WHY (helps other people read your code)",
    ],
    tip: "If you can write the syntax <code>&lt;!-- … --&gt;</code> and one example, you've covered the whole topic for a 4-mark question.",
  },
  {
    id: "html-tables",
    group: "html",
    title: "HTML Tables",
    tags: ["html", "table", "tr", "td", "th"],
    relatedModules: [4],
    define:
      "An <strong>HTML table</strong> displays data in <em>rows and columns</em>. You build it with three main tags: <code>&lt;table&gt;</code> (the whole table), <code>&lt;tr&gt;</code> (a row), and <code>&lt;td&gt;</code> (a cell). <code>&lt;th&gt;</code> is for header cells (bold by default).",
    explain:
      "Tables are perfect for data — class marks, train timetables, price lists. Each <code>&lt;tr&gt;</code> opens a new row; inside it, each <code>&lt;td&gt;</code> is one cell. The order of tags matters: table contains rows, rows contain cells. Add <code>border=\"1\"</code> to the <code>&lt;table&gt;</code> tag to make the lines visible.",
    examples: [
      "Class marks: row 1 = headers (\"Name\", \"Mark\"), row 2 = \"Ali\", \"85\"",
      "Train timetable: each row = one departure",
      "Product list: each row = one item with price and stock",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="160" rx="10" fill="rgba(255,255,255,0.02)" stroke="#06B6D4" stroke-width="1.4"/>
      <text x="60" y="44" fill="#67E8F9" font-size="11" font-weight="700" font-family="system-ui">CODE</text>
      <g font-family="ui-monospace,monospace" font-size="10">
        <text x="60" y="62" fill="#FFFFFF">&lt;table border="1"&gt;</text>
        <text x="60" y="78" fill="#FFFFFF">  &lt;tr&gt;&lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Mark&lt;/th&gt;&lt;/tr&gt;</text>
        <text x="60" y="94" fill="#FFFFFF">  &lt;tr&gt;&lt;td&gt;Ali&lt;/td&gt;&lt;td&gt;85&lt;/td&gt;&lt;/tr&gt;</text>
        <text x="60" y="110" fill="#FFFFFF">  &lt;tr&gt;&lt;td&gt;Mia&lt;/td&gt;&lt;td&gt;90&lt;/td&gt;&lt;/tr&gt;</text>
        <text x="60" y="126" fill="#FFFFFF">&lt;/table&gt;</text>
      </g>
      <text x="60" y="158" fill="#A1A1AA" font-size="10" font-family="system-ui">&lt;table&gt; → &lt;tr&gt; rows → &lt;td&gt; cells</text>
      <line x1="350" y1="100" x2="380" y2="100" stroke="#A1A1AA" stroke-width="2" marker-end="url(#hta)"/>
      <text x="365" y="92" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">renders</text>
      <g transform="translate(390,40)">
        <rect x="0" y="0" width="120" height="22" fill="rgba(52,211,153,0.18)" stroke="#34D399"/>
        <rect x="120" y="0" width="100" height="22" fill="rgba(52,211,153,0.18)" stroke="#34D399"/>
        <text x="60" y="15" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700" font-family="system-ui">Name</text>
        <text x="170" y="15" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700" font-family="system-ui">Mark</text>
        <rect x="0" y="22" width="120" height="22" stroke="#34D399"/>
        <rect x="120" y="22" width="100" height="22" stroke="#34D399"/>
        <text x="60" y="37" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">Ali</text>
        <text x="170" y="37" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">85</text>
        <rect x="0" y="44" width="120" height="22" stroke="#34D399"/>
        <rect x="120" y="44" width="100" height="22" stroke="#34D399"/>
        <text x="60" y="59" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">Mia</text>
        <text x="170" y="59" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">90</text>
      </g>
      <defs>
        <marker id="hta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption:
      "Source code on the left, the resulting 2×3 table on the right.",
    keyPhrases: [
      "<table>, <tr>, <td>, <th>",
      "rows and columns of data",
      "tr = row, td = cell, th = header",
    ],
    earnsMarks: [
      "All FOUR tags named (table, tr, td, th)",
      "Correct nesting in the example (table → tr → td)",
      "A real-world use case (marks, timetable, prices)",
    ],
    losesMarks: [
      "Wrong tag order (e.g. <code>td</code> before <code>tr</code>)",
      "Forgetting the closing tags",
      "Skipping <code>border=\"1\"</code> when asked for a visible table",
    ],
    tip: "Always write a 2×2 example: header row + one data row. Small but complete beats a long broken example.",
  },
  {
    id: "html-lists",
    group: "html",
    title: "HTML Lists — Ordered vs Unordered",
    tags: ["html", "list", "ordered", "unordered", "ol", "ul", "li"],
    relatedModules: [4],
    define:
      "<strong>Ordered list</strong> (<code>&lt;ol&gt;</code>) shows items as <em>numbered</em> (1, 2, 3). <strong>Unordered list</strong> (<code>&lt;ul&gt;</code>) shows them as <em>bulleted</em> (•). Each item inside either kind uses <code>&lt;li&gt;</code> (list item).",
    explain:
      "Use an ordered list when the order matters — recipe steps, instructions, top-3 rankings. Use an unordered list when the order doesn't matter — a list of features, a shopping list, a list of friends. Both lists wrap their items in <code>&lt;li&gt;</code>; the only difference is the parent tag (<code>&lt;ol&gt;</code> vs <code>&lt;ul&gt;</code>).",
    examples: [
      "<strong>Ordered</strong> — recipe: 1. Boil water 2. Add tea 3. Add sugar",
      "<strong>Unordered</strong> — fruits: • Apple  • Banana  • Mango",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="160" rx="10" fill="rgba(96,165,250,0.10)" stroke="#60A5FA" stroke-width="1.4"/>
      <text x="190" y="44" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">ORDERED &lt;ol&gt;</text>
      <g font-family="ui-monospace,monospace" font-size="10">
        <text x="60" y="68" fill="#FFFFFF">&lt;ol&gt;</text>
        <text x="60" y="84" fill="#FFFFFF">  &lt;li&gt;Boil water&lt;/li&gt;</text>
        <text x="60" y="100" fill="#FFFFFF">  &lt;li&gt;Add tea&lt;/li&gt;</text>
        <text x="60" y="116" fill="#FFFFFF">  &lt;li&gt;Add sugar&lt;/li&gt;</text>
        <text x="60" y="132" fill="#FFFFFF">&lt;/ol&gt;</text>
      </g>
      <text x="60" y="156" fill="#FCD34D" font-size="11" font-family="system-ui">→ 1. Boil water  2. Add tea  3. Add sugar</text>
      <text x="190" y="174" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">use when order matters</text>
      <rect x="380" y="20" width="300" height="160" rx="10" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" stroke-width="1.4"/>
      <text x="530" y="44" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">UNORDERED &lt;ul&gt;</text>
      <g font-family="ui-monospace,monospace" font-size="10">
        <text x="400" y="68" fill="#FFFFFF">&lt;ul&gt;</text>
        <text x="400" y="84" fill="#FFFFFF">  &lt;li&gt;Apple&lt;/li&gt;</text>
        <text x="400" y="100" fill="#FFFFFF">  &lt;li&gt;Banana&lt;/li&gt;</text>
        <text x="400" y="116" fill="#FFFFFF">  &lt;li&gt;Mango&lt;/li&gt;</text>
        <text x="400" y="132" fill="#FFFFFF">&lt;/ul&gt;</text>
      </g>
      <text x="400" y="156" fill="#FCD34D" font-size="11" font-family="system-ui">→ • Apple  • Banana  • Mango</text>
      <text x="530" y="174" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">use when order doesn't matter</text>
    </svg>`,
    diagramCaption:
      "Two boxes side by side — ordered (numbered) on the left, unordered (bulleted) on the right.",
    keyPhrases: [
      "<ol> ordered (numbered)",
      "<ul> unordered (bulleted)",
      "<li> for each item",
      "order matters → <ol>",
    ],
    earnsMarks: [
      "Both tags named, with the difference in one sentence",
      "Both examples written with at least 3 list items",
      "Mentioning when to use each",
    ],
    losesMarks: [
      "Wrapping items in <code>&lt;p&gt;</code> instead of <code>&lt;li&gt;</code>",
      "Mixing up <code>&lt;ol&gt;</code> and <code>&lt;ul&gt;</code>",
      "Showing only one type when the question asks for both",
    ],
    tip: "Memorise: \"<strong>Ordered = numbered. Unordered = bulleted.</strong>\" If you can write <code>&lt;ol&gt;&lt;li&gt;…&lt;/li&gt;&lt;/ol&gt;</code> from memory, you've got the topic covered.",
  },
  {
    id: "html-text-formatting-program",
    group: "html",
    title: "HTML — Bold, Italic, Underline (sample program)",
    tags: ["html", "bold", "italic", "underline", "b", "i", "u"],
    relatedModules: [4],
    define:
      "HTML has three simple tags for text emphasis: <code>&lt;b&gt;</code> for <strong>bold</strong>, <code>&lt;i&gt;</code> for <em>italic</em>, and <code>&lt;u&gt;</code> for <u>underline</u>. Wrap your text in the tag, and the browser shows it in that style.",
    explain:
      "Each tag wraps the text you want to format: open the tag, put your text, then close it. You can combine them — bold AND italic = nest one inside the other. Use these only for emphasis on individual words; for whole-page styling, CSS is better.",
    examples: [
      "<code>&lt;b&gt;Hello&lt;/b&gt;</code> → <strong>Hello</strong>",
      "<code>&lt;i&gt;Hello&lt;/i&gt;</code> → <em>Hello</em>",
      "<code>&lt;u&gt;Hello&lt;/u&gt;</code> → <u>Hello</u>",
      "Combined: <code>&lt;b&gt;&lt;i&gt;Bold italic&lt;/i&gt;&lt;/b&gt;</code> → <strong><em>Bold italic</em></strong>",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="640" height="160" rx="10" fill="rgba(255,255,255,0.02)" stroke="#06B6D4" stroke-width="1.4"/>
      <text x="60" y="48" fill="#67E8F9" font-size="11" font-weight="700" font-family="system-ui">PROGRAM</text>
      <g font-family="ui-monospace,monospace" font-size="11">
        <text x="60" y="72" fill="#FFFFFF">&lt;p&gt;&lt;b&gt;Hello&lt;/b&gt; world&lt;/p&gt;</text>
        <text x="60" y="92" fill="#FFFFFF">&lt;p&gt;&lt;i&gt;Hello&lt;/i&gt; world&lt;/p&gt;</text>
        <text x="60" y="112" fill="#FFFFFF">&lt;p&gt;&lt;u&gt;Hello&lt;/u&gt; world&lt;/p&gt;</text>
      </g>
      <line x1="350" y1="92" x2="390" y2="92" stroke="#A1A1AA" stroke-width="2" marker-end="url(#hfa)"/>
      <text x="370" y="84" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">renders</text>
      <text x="410" y="76" fill="#FFFFFF" font-size="14" font-family="system-ui"><tspan font-weight="700">Hello</tspan> world</text>
      <text x="410" y="98" fill="#FFFFFF" font-size="14" font-family="system-ui"><tspan font-style="italic">Hello</tspan> world</text>
      <text x="410" y="120" fill="#FFFFFF" font-size="14" font-family="system-ui"><tspan text-decoration="underline">Hello</tspan> world</text>
      <text x="60" y="160" fill="#FBBF24" font-size="11" font-family="system-ui" font-weight="700">Output: bold + italic + underlined "Hello"</text>
      <defs>
        <marker id="hfa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption:
      "Three lines of code on the left, the rendered output on the right.",
    keyPhrases: [
      "<b> bold, <i> italic, <u> underline",
      "open, content, close",
      "tags can be nested",
    ],
    earnsMarks: [
      "All three tags named with their function",
      "A complete program (open + content + close, plus surrounding <code>&lt;p&gt;</code>)",
      "Showing the rendered output OR drawing it",
    ],
    losesMarks: [
      "Forgetting the closing tag (broken HTML)",
      "Confusing <code>&lt;b&gt;</code> with <code>&lt;p&gt;</code>",
      "Listing tags without showing their effect",
    ],
    tip: "Write the THREE tags as one block, then draw what they look like. Side-by-side code + output is the best evidence you understand it.",
  },
  {
    id: "html-heading-paragraph",
    group: "html",
    title: "HTML — Heading & Paragraph (sample program)",
    tags: ["html", "heading", "paragraph", "h1", "p"],
    relatedModules: [4],
    define:
      "<strong>Heading tags</strong> (<code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>) display text as a heading — bold and bigger. <code>&lt;h1&gt;</code> is the largest, <code>&lt;h6&gt;</code> the smallest. <strong>Paragraph tag</strong> (<code>&lt;p&gt;</code>) displays normal body text.",
    explain:
      "Headings give your page structure — the browser draws the <code>&lt;h1&gt;</code> as the main title, then <code>&lt;h2&gt;</code> for section titles, and so on. Paragraphs hold the regular sentences. Each paragraph automatically gets blank space above and below so the page breathes. You wrap each piece of text in the right tag — open, write, close.",
    examples: [
      "<code>&lt;h1&gt;Kush Sharma&lt;/h1&gt;</code> → big bold name",
      "<code>&lt;p&gt;I am a first-year student at Amity Tashkent.&lt;/p&gt;</code> → normal sentence",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="160" rx="10" fill="rgba(255,255,255,0.02)" stroke="#06B6D4" stroke-width="1.4"/>
      <text x="60" y="44" fill="#67E8F9" font-size="11" font-weight="700" font-family="system-ui">CODE</text>
      <g font-family="ui-monospace,monospace" font-size="11">
        <text x="60" y="72" fill="#FFFFFF">&lt;h1&gt;Kush Sharma&lt;/h1&gt;</text>
        <text x="60" y="98" fill="#FFFFFF">&lt;p&gt;I am a first-year</text>
        <text x="60" y="114" fill="#FFFFFF">student at Amity</text>
        <text x="60" y="130" fill="#FFFFFF">Tashkent.&lt;/p&gt;</text>
      </g>
      <text x="190" y="166" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">tags: &lt;h1&gt; for heading, &lt;p&gt; for paragraph</text>
      <line x1="350" y1="100" x2="380" y2="100" stroke="#A1A1AA" stroke-width="2" marker-end="url(#hpa)"/>
      <text x="365" y="92" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">renders</text>
      <rect x="380" y="20" width="300" height="160" rx="10" fill="rgba(52,211,153,0.10)" stroke="#34D399" stroke-width="1.4"/>
      <text x="400" y="44" fill="#6EE7B7" font-size="11" font-weight="700" font-family="system-ui">RENDERED PAGE</text>
      <text x="400" y="78" fill="#FFFFFF" font-size="22" font-weight="800" font-family="system-ui">Kush Sharma</text>
      <text x="400" y="106" fill="#D4D4D8" font-size="12" font-family="system-ui">I am a first-year student at</text>
      <text x="400" y="122" fill="#D4D4D8" font-size="12" font-family="system-ui">Amity Tashkent.</text>
      <defs>
        <marker id="hpa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption:
      "Code on the left, rendered page (big name + paragraph) on the right.",
    keyPhrases: [
      "<h1> for main heading",
      "<p> for paragraph",
      "<h1> biggest, <h6> smallest",
    ],
    earnsMarks: [
      "Both tags named with their purpose",
      "Closing tags shown",
      "Correct nesting — heading and paragraph as sibling elements",
    ],
    losesMarks: [
      "Wrapping the heading in <code>&lt;p&gt;</code> too",
      "Using only one tag",
      "Wrong heading number (<code>&lt;h7&gt;</code> doesn't exist)",
    ],
    tip: "Write the smallest possible program: <code>&lt;h1&gt;Name&lt;/h1&gt;&lt;p&gt;Sentence.&lt;/p&gt;</code>. Compact and complete.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🤖 EMERGING TECH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "ai",
    group: "emerging",
    title: "Artificial Intelligence (AI)",
    tags: ["ai", "artificial intelligence", "siri", "chatgpt"],
    relatedModules: [5],
    define:
      "<strong>Artificial Intelligence (AI)</strong> is technology that lets computers do tasks that normally need <em>human intelligence</em> — like understanding speech, recognising photos, or making decisions.",
    explain:
      "AI doesn't think like a human, but it imitates the result. Modern AI works by being trained on huge amounts of data — millions of photos, conversations, or transactions — and learning patterns. It can then answer questions, recommend videos, translate languages, or drive a car, all by spotting patterns it has seen before.",
    examples: [
      "Voice assistants — <strong>Siri, Alexa, Google Assistant</strong> understand spoken commands",
      "<strong>ChatGPT, Gemini, Claude</strong> — answer questions and write text",
      "Netflix and YouTube recommendations — \"because you watched X, try Y\"",
      "Phone face unlock — recognises your face from a photo",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="180" height="80" rx="10" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.4"/>
      <text x="130" y="68" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">DATA</text>
      <text x="130" y="88" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">millions of photos,</text>
      <text x="130" y="106" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">texts, examples</text>
      <line x1="220" y1="80" x2="280" y2="80" stroke="#A1A1AA" stroke-width="2" marker-end="url(#aia)"/>
      <text x="250" y="74" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">train</text>
      <rect x="280" y="20" width="200" height="120" rx="10" fill="rgba(99,102,241,0.18)" stroke="#818CF8" stroke-width="1.6"/>
      <text x="380" y="48" text-anchor="middle" fill="#A5B4FC" font-size="14" font-weight="700" font-family="system-ui">🧠 AI MODEL</text>
      <text x="380" y="72" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">learns patterns</text>
      <text x="380" y="92" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="system-ui">from the data</text>
      <text x="380" y="116" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">imitates intelligence</text>
      <line x1="480" y1="80" x2="540" y2="80" stroke="#A1A1AA" stroke-width="2" marker-end="url(#aia)"/>
      <text x="510" y="74" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">answer</text>
      <rect x="540" y="40" width="140" height="80" rx="10" fill="rgba(52,211,153,0.12)" stroke="#34D399" stroke-width="1.4"/>
      <text x="610" y="68" text-anchor="middle" fill="#6EE7B7" font-size="13" font-weight="700" font-family="system-ui">SMART OUTPUT</text>
      <text x="610" y="88" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">voice reply, photo tag,</text>
      <text x="610" y="106" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">recommendation</text>
      <defs>
        <marker id="aia" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption: "Data → AI model → Smart output. Three boxes, two arrows.",
    keyPhrases: [
      "tasks that need human intelligence",
      "trained on data",
      "imitates the result, not the process",
    ],
    earnsMarks: [
      "Definition uses \"human intelligence\" or \"learns from data\"",
      "Two real examples a 17-year-old uses (NOT just \"robots\")",
      "Sentence about HOW AI works (training on data)",
    ],
    losesMarks: [
      "Saying \"AI is robots\" — that's only one application",
      "Listing only sci-fi examples (Terminator, etc.)",
      "Skipping the training-on-data part",
    ],
    tip: "Always ground AI in <strong>two apps you use every day</strong>. Concrete beats abstract when revising.",
  },
  {
    id: "machine-learning",
    group: "emerging",
    title: "Machine Learning (ML)",
    tags: ["ml", "machine learning", "ai", "training", "data"],
    relatedModules: [5],
    define:
      "<strong>Machine Learning (ML)</strong> is the part of AI where computers <em>learn from examples</em> instead of being programmed with explicit rules. Show it enough cases, and it figures out the pattern itself.",
    explain:
      "In traditional programming, you write the rules — \"if temperature > 30, say hot\". In ML you show the computer thousands of examples (\"this is hot, this is cold\") and it builds its own rule. The more good examples it sees, the smarter it gets. ML is how Netflix learns your taste, how spam filters catch new tricks, and how voice assistants understand new words.",
    examples: [
      "<strong>Spam filter</strong> — trained on millions of emails marked \"spam\" or \"not spam\"",
      "<strong>Netflix recommendations</strong> — learns your taste from what you watch",
      "<strong>Photo apps</strong> — \"who is this person?\" by learning faces from your gallery",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="160" rx="10" fill="rgba(96,165,250,0.10)" stroke="#60A5FA" stroke-width="1.4"/>
      <text x="190" y="44" text-anchor="middle" fill="#93C5FD" font-size="13" font-weight="700" font-family="system-ui">TRADITIONAL PROGRAMMING</text>
      <text x="60" y="74" fill="#FFFFFF" font-size="11" font-family="system-ui">Programmer writes the rule:</text>
      <text x="60" y="96" fill="#FCD34D" font-size="11" font-family="ui-monospace,monospace">if temp &gt; 30 → "hot"</text>
      <text x="60" y="124" fill="#A1A1AA" font-size="10" font-family="system-ui">Rules first, then data follows.</text>
      <text x="60" y="146" fill="#A1A1AA" font-size="10" font-family="system-ui">Hard to update for new cases.</text>
      <rect x="380" y="20" width="300" height="160" rx="10" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="530" y="44" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">MACHINE LEARNING</text>
      <text x="400" y="74" fill="#FFFFFF" font-size="11" font-family="system-ui">Show many examples:</text>
      <text x="400" y="92" fill="#FCD34D" font-size="11" font-family="ui-monospace,monospace">35°→hot, 28°→warm, 5°→cold</text>
      <text x="400" y="124" fill="#FFFFFF" font-size="11" font-family="system-ui">Computer learns the rule itself.</text>
      <text x="400" y="146" fill="#A1A1AA" font-size="10" font-family="system-ui">More examples = smarter.</text>
    </svg>`,
    diagramCaption:
      "Traditional programming on the left (rules first); ML on the right (examples first).",
    keyPhrases: [
      "learns from examples",
      "no explicit rules",
      "more data = smarter",
      "subset of AI",
    ],
    earnsMarks: [
      "Contrast with traditional programming (rules vs examples)",
      "Two real-world examples",
      "Sentence about \"the more data, the better\"",
    ],
    losesMarks: [
      "Calling ML the same as AI — ML is part of AI",
      "Forgetting the example-based learning",
      "Listing only one application",
    ],
    tip: "Open with the contrast: \"<em>Traditional programs follow rules; ML learns rules.</em>\" One sentence sells the whole concept.",
  },
  {
    id: "ai-vs-ml",
    group: "emerging",
    title: "AI vs ML — The Difference",
    tags: ["ai", "ml", "difference", "compare"],
    relatedModules: [5],
    define:
      "<strong>AI</strong> is the broad goal: making computers do tasks that need human intelligence. <strong>ML</strong> is one specific method to achieve that goal — by learning from data instead of being programmed with rules. Every ML system is AI; not every AI system uses ML.",
    explain:
      "Think of AI as a big circle (the whole field) and ML as a smaller circle inside it (one popular technique). Other AI techniques exist too — rule-based expert systems, search algorithms — but most modern AI you encounter (ChatGPT, Siri, photo recognition) is built using ML. The terms get used interchangeably, but ML is the engine that powers most AI products today.",
    examples: [
      "<strong>AI without ML</strong> — a chess program from 1990 with hand-coded rules",
      "<strong>AI with ML</strong> — ChatGPT, Netflix recommendations, face unlock, spam filter",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="360" cy="100" rx="220" ry="80" fill="rgba(99,102,241,0.10)" stroke="#818CF8" stroke-width="1.6"/>
      <text x="360" y="44" text-anchor="middle" fill="#A5B4FC" font-size="14" font-weight="700" font-family="system-ui">AI — Artificial Intelligence</text>
      <text x="360" y="60" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">computers doing intelligent tasks</text>
      <ellipse cx="360" cy="120" rx="120" ry="50" fill="rgba(167,139,250,0.18)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="360" y="115" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">ML — Machine Learning</text>
      <text x="360" y="135" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">learns from data</text>
      <text x="360" y="186" text-anchor="middle" fill="#FCD34D" font-size="10" font-weight="600" font-family="system-ui">ML is INSIDE AI — every ML is AI; not every AI is ML.</text>
    </svg>`,
    diagramCaption:
      "Big AI circle with a smaller ML circle nested inside — classic Venn relationship.",
    keyPhrases: [
      "AI is the big field",
      "ML is one method inside AI",
      "ML learns from data",
      "every ML is AI; not every AI is ML",
    ],
    earnsMarks: [
      "Both defined separately, with the relationship between them",
      "Drawing the inside-circle Venn diagram",
      "An example of each (AI without ML, AI with ML)",
    ],
    losesMarks: [
      "Saying \"AI and ML are the same\"",
      "Forgetting that ML is a subset of AI",
      "Skipping the diagram on a comparison question",
    ],
    tip: "The Venn diagram is the easiest revision aid here. Two seconds to draw, and it shows the relationship visually.",
  },
  {
    id: "blockchain",
    group: "emerging",
    title: "Blockchain",
    tags: ["blockchain", "bitcoin", "crypto", "ledger"],
    relatedModules: [5],
    define:
      "<strong>Blockchain</strong> is a digital record book where information is stored in a chain of <em>linked blocks</em>. Each block has a unique fingerprint of the block before it, so changing one old block would break every block after it.",
    explain:
      "Unlike a bank that keeps one master copy, a blockchain has copies spread across thousands of computers around the world. To add a new block, most computers have to agree it's valid. To fake an old block, an attacker would need to change it on every copy at the same time — which is practically impossible. That's why blockchain records are very hard to tamper with.",
    examples: [
      "<strong>Bitcoin</strong> — the first popular blockchain, used to transfer money without a bank",
      "<strong>Ethereum smart contracts</strong> — small programs that run on a blockchain",
      "<strong>Supply chain tracking</strong> — companies use blockchains to prove a coffee bean's full journey from farm to cup",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <g font-family="system-ui">
        <rect x="40" y="60" width="140" height="80" rx="8" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.4"/>
        <text x="110" y="84" text-anchor="middle" fill="#C4B5FD" font-size="11" font-weight="700">BLOCK 1</text>
        <text x="110" y="104" text-anchor="middle" fill="#FFFFFF" font-size="10">data</text>
        <text x="110" y="120" text-anchor="middle" fill="#FBBF24" font-size="9">hash: ab12</text>
        <line x1="180" y1="100" x2="220" y2="100" stroke="#A1A1AA" stroke-width="2" marker-end="url(#bca)"/>
        <rect x="220" y="60" width="140" height="80" rx="8" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.4"/>
        <text x="290" y="84" text-anchor="middle" fill="#C4B5FD" font-size="11" font-weight="700">BLOCK 2</text>
        <text x="290" y="100" text-anchor="middle" fill="#FFFFFF" font-size="10">data + prev: ab12</text>
        <text x="290" y="120" text-anchor="middle" fill="#FBBF24" font-size="9">hash: cd34</text>
        <line x1="360" y1="100" x2="400" y2="100" stroke="#A1A1AA" stroke-width="2" marker-end="url(#bca)"/>
        <rect x="400" y="60" width="140" height="80" rx="8" fill="rgba(167,139,250,0.14)" stroke="#A78BFA" stroke-width="1.4"/>
        <text x="470" y="84" text-anchor="middle" fill="#C4B5FD" font-size="11" font-weight="700">BLOCK 3</text>
        <text x="470" y="100" text-anchor="middle" fill="#FFFFFF" font-size="10">data + prev: cd34</text>
        <text x="470" y="120" text-anchor="middle" fill="#FBBF24" font-size="9">hash: ef56</text>
        <line x1="540" y1="100" x2="580" y2="100" stroke="#A1A1AA" stroke-width="2" marker-end="url(#bca)"/>
        <rect x="580" y="60" width="100" height="80" rx="8" fill="rgba(82,82,91,0.20)" stroke="#52525B" stroke-width="1.4" stroke-dasharray="4 3"/>
        <text x="630" y="100" text-anchor="middle" fill="#A1A1AA" font-size="10">…</text>
      </g>
      <text x="360" y="170" text-anchor="middle" fill="#A1A1AA" font-size="11" font-family="system-ui">Each block links to the previous one. Change one → the chain breaks.</text>
      <defs>
        <marker id="bca" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#A1A1AA"/>
        </marker>
      </defs>
    </svg>`,
    diagramCaption:
      "Three blocks in a chain, each linked to the previous via a hash — change one and the whole chain breaks.",
    keyPhrases: [
      "chain of linked blocks",
      "very hard to change once written",
      "no central authority",
      "shared across many computers",
    ],
    earnsMarks: [
      "Definition mentions \"chain of blocks\" AND \"hash links\"",
      "Sentence about why it's hard to fake (consensus / many copies)",
      "Two real applications — Bitcoin is the easy one, plus one more",
    ],
    losesMarks: [
      "Saying \"blockchain = Bitcoin\" — Bitcoin USES blockchain",
      "Skipping the \"chain\" part of the explanation",
      "Forgetting that copies are stored on many computers",
    ],
    tip: "The chain-with-hashes diagram is a great revision aid. Three blocks, three hashes, two arrows — drawing it makes the idea stick.",
  },
  {
    id: "ar-vs-vr",
    group: "emerging",
    title: "AR vs VR",
    tags: ["ar", "vr", "augmented", "virtual", "reality"],
    relatedModules: [5],
    define:
      "<strong>Augmented Reality (AR)</strong> adds digital images on top of the REAL world you see — through your phone or smart glasses. <strong>Virtual Reality (VR)</strong> replaces the real world entirely with a computer-generated one — through a headset that covers your eyes.",
    explain:
      "AR <em>adds</em>; VR <em>replaces</em>. With AR, you still see your room — and a virtual Pokémon walks across your table. With VR, you put on a headset and you're inside a different world entirely; the room around you disappears. AR is great for trying things in real space (furniture, makeup); VR is great for immersive games and training.",
    examples: [
      "<strong>AR</strong> — Pokémon Go, Snapchat / Instagram filters, IKEA \"place a sofa in your room\" app",
      "<strong>VR</strong> — Meta Quest games, flight simulators, virtual tours of museums",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="160" rx="10" fill="rgba(52,211,153,0.10)" stroke="#34D399" stroke-width="1.4"/>
      <text x="190" y="44" text-anchor="middle" fill="#6EE7B7" font-size="13" font-weight="700" font-family="system-ui">AR — Augmented</text>
      <rect x="60" y="60" width="260" height="80" rx="6" fill="rgba(255,255,255,0.04)" stroke="#52525B" stroke-width="1"/>
      <text x="80" y="82" fill="#A1A1AA" font-size="10" font-family="system-ui">your real room (camera view)</text>
      <text x="80" y="100" fill="#A1A1AA" font-size="10" font-family="system-ui">  + table, chair, window</text>
      <circle cx="240" cy="115" r="14" fill="rgba(167,139,250,0.4)" stroke="#A78BFA" stroke-width="1.4"/>
      <text x="240" y="119" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="700" font-family="system-ui">🎮</text>
      <text x="80" y="128" fill="#FCD34D" font-size="10" font-family="system-ui" font-weight="700">+ virtual character on your table</text>
      <text x="190" y="166" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">REAL world + DIGITAL overlay</text>
      <rect x="380" y="20" width="300" height="160" rx="10" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" stroke-width="1.6"/>
      <text x="530" y="44" text-anchor="middle" fill="#C4B5FD" font-size="13" font-weight="700" font-family="system-ui">VR — Virtual</text>
      <rect x="400" y="60" width="260" height="80" rx="6" fill="rgba(99,102,241,0.18)" stroke="#818CF8" stroke-width="1"/>
      <text x="530" y="86" text-anchor="middle" fill="#A5B4FC" font-size="11" font-weight="700" font-family="system-ui">🥽 inside a headset</text>
      <text x="530" y="106" text-anchor="middle" fill="#FFFFFF" font-size="10" font-family="system-ui">a NEW world: forest, space,</text>
      <text x="530" y="124" text-anchor="middle" fill="#FFFFFF" font-size="10" font-family="system-ui">flight cockpit, museum tour</text>
      <text x="530" y="166" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">FULLY DIGITAL world</text>
    </svg>`,
    diagramCaption:
      "AR (left) shows your real room with a digital overlay; VR (right) replaces the world entirely.",
    keyPhrases: [
      "AR adds, VR replaces",
      "AR uses your phone or glasses",
      "VR uses a headset",
      "real + digital vs. fully digital",
    ],
    earnsMarks: [
      "The contrast \"adds vs replaces\" appears clearly",
      "Two real-world examples per technology",
      "Mentioning the device (phone for AR, headset for VR)",
    ],
    losesMarks: [
      "Mixing up examples — Pokémon Go is AR, not VR",
      "Saying both use the same hardware (different — phone vs headset)",
      "Forgetting that VR is fully immersive",
    ],
    tip: "<strong>AR adds. VR replaces.</strong> Three words, full distinction. Use them and the rest writes itself.",
  },
  {
    id: "gpts-ethical-use",
    group: "emerging",
    title: "GPTs & Ethical Use of AI",
    tags: ["gpt", "chatgpt", "ai", "ethics", "plagiarism"],
    relatedModules: [5],
    define:
      "<strong>GPTs</strong> are AI chat tools — like ChatGPT, Gemini, or Claude — that <em>create new</em> text, images, or code based on a prompt you type. <strong>Ethical use</strong> means using them honestly: as a study helper, not to fake your own work.",
    explain:
      "GPTs are powerful: they can explain a topic, draft an essay, debug code, or summarise a chapter. The risks come when students paste an AI answer into their assignment without learning anything, or trust a confidently wrong answer (AI sometimes makes up facts — \"hallucinates\"). The ethical rule: use AI to <em>understand</em>, then write your own work; always check important facts; cite the AI if you used it directly.",
    examples: [
      "<strong>Good use</strong> — ask ChatGPT to explain photosynthesis in 3 lines, then write your homework in your own words",
      "<strong>Good use</strong> — paste your essay and ask \"what are the gaps?\" → fix them yourself",
      "<strong>Bad use</strong> — copy-paste an AI answer into a graded assignment with no checks",
      "<strong>Bad use</strong> — trust an AI fact without verifying (AI can confidently make things up)",
    ],
    diagramSvg: `<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="300" height="160" rx="10" fill="rgba(52,211,153,0.10)" stroke="#34D399" stroke-width="1.4"/>
      <text x="190" y="44" text-anchor="middle" fill="#6EE7B7" font-size="13" font-weight="700" font-family="system-ui">✅ ETHICAL USE</text>
      <text x="60" y="68" fill="#FFFFFF" font-size="11" font-family="system-ui">• Ask AI to EXPLAIN a topic</text>
      <text x="60" y="86" fill="#FFFFFF" font-size="11" font-family="system-ui">• Use AI as a tutor, not a writer</text>
      <text x="60" y="104" fill="#FFFFFF" font-size="11" font-family="system-ui">• Verify every fact yourself</text>
      <text x="60" y="122" fill="#FFFFFF" font-size="11" font-family="system-ui">• Write your own answer in YOUR words</text>
      <text x="60" y="140" fill="#FFFFFF" font-size="11" font-family="system-ui">• Cite the AI if you quote it directly</text>
      <text x="190" y="170" text-anchor="middle" fill="#34D399" font-size="11" font-weight="700" font-family="system-ui">→ you actually learn</text>
      <rect x="380" y="20" width="300" height="160" rx="10" fill="rgba(239,68,68,0.10)" stroke="#EF4444" stroke-width="1.4"/>
      <text x="530" y="44" text-anchor="middle" fill="#FCA5A5" font-size="13" font-weight="700" font-family="system-ui">❌ BAD USE / RISKS</text>
      <text x="400" y="68" fill="#FFFFFF" font-size="11" font-family="system-ui">• Copy-paste AI answer = plagiarism</text>
      <text x="400" y="86" fill="#FFFFFF" font-size="11" font-family="system-ui">• Trust AI facts without checking</text>
      <text x="400" y="104" fill="#FFFFFF" font-size="11" font-family="system-ui">• AI can \"hallucinate\" — make things up</text>
      <text x="400" y="122" fill="#FFFFFF" font-size="11" font-family="system-ui">• Paste private data into AI chats</text>
      <text x="400" y="140" fill="#FFFFFF" font-size="11" font-family="system-ui">• Skip learning entirely</text>
      <text x="530" y="170" text-anchor="middle" fill="#EF4444" font-size="11" font-weight="700" font-family="system-ui">→ you fail when AI is unavailable</text>
    </svg>`,
    diagramCaption: "Ethical use on the left; bad use and risks on the right.",
    keyPhrases: [
      "use AI to understand, write in your own words",
      "verify every fact",
      "AI hallucinates — invents facts confidently",
      "cite AI if quoted directly",
    ],
    earnsMarks: [
      "Both ethical and bad use covered, balanced",
      "Mentioning AI hallucination (confidently wrong)",
      "Concrete rule: \"use to understand, then write yourself\"",
    ],
    losesMarks: [
      "Banning AI entirely (unrealistic, not the answer either)",
      "Listing only risks, missing the helpful uses",
      "Forgetting to mention plagiarism / fact-checking",
    ],
    tip: "End with one clear rule worth remembering: \"<em>I use AI to understand a topic, then write my answer in my own words.</em>\" That sentence sums up the whole concept.",
  },
];
