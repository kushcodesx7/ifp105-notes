// Canonical content types live in src/types/content.ts. They used to
// originate here and be re-exported by modules 2-4; now content.ts is
// the source and this file re-exports for backward-compat.
import type {
  Topic,
  ContentBlock,
  TopicCard,
  EraCard,
  TableRow,
  StepItem,
} from "@/types/content";

export type {
  Topic,
  ContentBlock,
  TopicCard,
  EraCard,
  TableRow,
};

// Legacy alias — the old name in this file was `Step`, canonical name is `StepItem`.
export type Step = StepItem;

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "Why Did We Even Invent Computers?",
    time: "~4 mins",
    badges: [],
    hook: `Humans are smart. But we are slow, we get tired, and we make mistakes. <strong>What if there was something that could do everything we do — but faster, perfectly, and without ever needing a lunch break?</strong>`,
    content: [
      {
        type: "text",
        html: `Computers were invented to solve <mark>4 specific human problems</mark>. Everything in this module connects back to these four.`,
      },
      {
        type: "image",
        src: "/images/m1/why-computers.webp",
        description: "4 reasons for computers (Speed \u00b7 Accuracy \u00b7 Storage \u00b7 Connectivity)",
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\u26a1",
            title: "Speed",
            description: "Exam results for 1,000 students by hand = weeks. A computer does it in seconds.",
            tag: "Milliseconds > Weeks",
          },
          {
            icon: "\ud83c\udfaf",
            title: "Accuracy",
            description: "Humans get tired and make mistakes. Computers follow instructions exactly, every single time.",
            tag: "Zero errors if coded right",
          },
          {
            icon: "\ud83d\uddc3\ufe0f",
            title: "Storage",
            description: "Paper files filled rooms and could burn. One USB holds more than a library of books.",
            tag: "Library on a thumb drive",
          },
          {
            icon: "\ud83c\udf10",
            title: "Connectivity",
            description: "A letter once took 2 weeks. Now you send a video in 2 seconds.",
            tag: "Instant global reach",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Memory trick:</strong> S.A.S.C. \u2014 Speed, Accuracy, Storage, Connectivity. "Some Amazing Students Compute." Silly sentence, but you'll remember it. \ud83d\ude04`,
      },
    ],
  },

  // ─── Topic 2 ───
  //
  // Redesigned Apr 24 2026 from 4 dense era-cards (~50 words each)
  // to a memorable visual journey + 1 anchor word per era + 1 story
  // sentence students can repeat. The original 4-card grid asked
  // students to memorise 4 isolated paragraphs. The new layout
  // teaches the WHOLE topic as a connected story:
  //
  //   Building → Room → Desk → Pocket
  //
  // The inline SVG shows the literal shrinking of computers across
  // eras, so the visual itself encodes the answer to "how did
  // computers evolve?" One picture + one sentence + 4 anchor words
  // = the whole topic, recallable in 30 seconds.
  {
    id: 2,
    title: "How Computers Grew Up",
    time: "~3 mins",
    badges: [],
    hook: `Your phone is more powerful than <strong>all the computers NASA used to send men to the moon in 1969 — combined.</strong> Here's the whole story in one picture: <mark>Building → Room → Desk → Pocket.</mark>`,
    content: [
      // ─── Hero visual: the shrinking-computer journey ───
      // Inline SVG inside a `text` block (which renders via
      // dangerouslySetInnerHTML). Four boxes shrinking left-to-right,
      // each labelled with era + the one-word problem its successor
      // fixed. One picture = the whole topic.
      {
        type: "text",
        html: `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px;margin:8px 0;overflow-x:auto"><svg viewBox="0 0 720 230" style="width:100%;height:auto;min-width:560px;display:block" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Shrinking computer journey: building-sized Mechanical era to pocket-sized Mobile era"><defs><marker id="m1t2arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#A1A1AA"/></marker></defs><text x="360" y="20" text-anchor="middle" fill="#71717A" font-size="11" font-family="system-ui" font-weight="700" letter-spacing="3">THE SHRINKING COMPUTER</text><rect x="20" y="50" width="130" height="130" rx="10" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" stroke-width="2"/><text x="85" y="100" text-anchor="middle" font-size="46">🏛</text><text x="85" y="135" text-anchor="middle" fill="#A78BFA" font-size="13" font-family="system-ui" font-weight="700">BUILDING</text><text x="85" y="152" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Mechanical</text><text x="85" y="166" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Pre-1940s</text><text x="85" y="200" text-anchor="middle" fill="#F87171" font-size="10" font-family="system-ui" font-weight="600">too slow</text><line x1="160" y1="115" x2="195" y2="115" stroke="#A1A1AA" stroke-width="2" marker-end="url(#m1t2arr)"/><text x="177" y="105" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">+power</text><rect x="205" y="65" width="110" height="110" rx="9" fill="rgba(96,165,250,0.10)" stroke="#60A5FA" stroke-width="2"/><text x="260" y="110" text-anchor="middle" font-size="38">🏢</text><text x="260" y="138" text-anchor="middle" fill="#60A5FA" font-size="12" font-family="system-ui" font-weight="700">ROOM</text><text x="260" y="153" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Electronic</text><text x="260" y="166" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">1940s–60s</text><text x="260" y="200" text-anchor="middle" fill="#F87171" font-size="10" font-family="system-ui" font-weight="600">too big</text><line x1="325" y1="115" x2="360" y2="115" stroke="#A1A1AA" stroke-width="2" marker-end="url(#m1t2arr)"/><text x="342" y="105" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">+chips</text><rect x="370" y="80" width="90" height="90" rx="8" fill="rgba(52,211,153,0.10)" stroke="#34D399" stroke-width="2"/><text x="415" y="120" text-anchor="middle" font-size="32">🖥</text><text x="415" y="142" text-anchor="middle" fill="#34D399" font-size="11" font-family="system-ui" font-weight="700">DESK</text><text x="415" y="156" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">PC</text><text x="415" y="167" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">1970s–90s</text><text x="415" y="200" text-anchor="middle" fill="#F87171" font-size="10" font-family="system-ui" font-weight="600">stuck at home</text><line x1="470" y1="115" x2="505" y2="115" stroke="#A1A1AA" stroke-width="2" marker-end="url(#m1t2arr)"/><text x="487" y="105" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">+wifi</text><rect x="515" y="95" width="65" height="75" rx="6" fill="rgba(251,191,36,0.10)" stroke="#FBBF24" stroke-width="2"/><text x="547" y="130" text-anchor="middle" font-size="26">📱</text><text x="547" y="148" text-anchor="middle" fill="#FBBF24" font-size="10" font-family="system-ui" font-weight="700">POCKET</text><text x="547" y="160" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">Mobile</text><text x="547" y="170" text-anchor="middle" fill="#A1A1AA" font-size="9" font-family="system-ui">2000s–now</text><text x="547" y="200" text-anchor="middle" fill="#34D399" font-size="10" font-family="system-ui" font-weight="600">does it all ✓</text><text x="650" y="105" text-anchor="middle" fill="#71717A" font-size="9" font-family="system-ui" font-style="italic">+1000×</text><text x="650" y="120" text-anchor="middle" fill="#71717A" font-size="9" font-family="system-ui" font-style="italic">faster</text></svg><div style="text-align:center;color:#71717A;font-size:11px;margin-top:8px">Each era solved the last era\'s biggest problem.</div></div>`,
      },

      // ─── 2 + 2 era cards: each card is a mini-lesson ───
      // Layout split into two 2-column rows so each card has 2× the
      // horizontal space. Per card: lead headline + concrete story
      // sentence + 3 quick-fact bullets + "Why it mattered" line.
      // Designed for 17-year-old self-study — every fact is a vivid
      // comparison (size of a school, weight of 6 elephants, lights
      // dimming in nearby buildings) instead of raw specs students
      // can't picture (174,000W, 5,000 ops/sec, etc.).
      // First row: the OLD eras (Mechanical, Electronic).
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "🏛",
            title: "Mechanical",
            description: "<strong>Counting with wooden beads.</strong> For over <strong>2,500 years</strong>, shopkeepers, traders, and even astronomers did all their math on a frame of beads called the <strong>Abacus</strong> — still seen in some Chorsu shops today.<br><br>▸ <strong>How big?</strong> Fits in a small bag<br>▸ <strong>How fast?</strong> Quick at adding, but multiplying took minutes<br>▸ <strong>Famous:</strong> the Abacus · Pascal's calculating box (1642) · Babbage's brass machine (1830s)<br><br><strong>Why it mattered:</strong> Before this, every shop owner did math in their head or on paper — slow and full of mistakes. The Abacus made trade across countries possible.",
            tag: "Pre-1940s",
            tagColor: "purple",
          },
          {
            icon: "🏢",
            title: "Electronic",
            description: "<strong>A computer the size of a school.</strong> In 1945, the US Army built <strong>ENIAC</strong> — the first fully electric computer. As big as a small house, weighed as much as <strong>6 elephants</strong>, and when it switched on, lights in nearby buildings dimmed.<br><br>▸ <strong>How big?</strong> Filled an entire room<br>▸ <strong>How fast?</strong> Did in 1 second what took 100 humans a whole day<br>▸ <strong>Famous:</strong> ENIAC (1945) · UNIVAC (first one sold to a business, 1951)<br><br><strong>Why it mattered:</strong> Calculations that used to take weeks now took minutes. Weather forecasts, bank loans, and space missions all became possible. The \"digital age\" started here.",
            tag: "1940s–60s",
            tagColor: "blue",
          },
        ],
      },
      // Second row: the MODERN eras (Personal, Mobile) — the ones
      // students' parents lived through, and the one students live
      // in now.
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "🖥️",
            title: "Personal",
            description: "<strong>A computer on your desk at home.</strong> In 1977, the <strong>Apple II</strong> arrived — the first computer normal families could buy. Kids started typing essays, doing homework, and playing simple games. Your parents probably saw their first computer in this era.<br><br>▸ <strong>How big?</strong> Sat on a desk like a TV<br>▸ <strong>How fast?</strong> Ran word processors, simple games, early websites<br>▸ <strong>Famous:</strong> Apple II (1977) · IBM PC (1981) · Windows 95 (1995)<br><br><strong>Why it mattered:</strong> Computers stopped being only for governments and big companies. Schools, offices, and homes finally had one. Email and the early internet started here.",
            tag: "1970s–90s",
            tagColor: "green",
          },
          {
            icon: "📱",
            title: "Mobile",
            description: "<strong>A computer in your pocket.</strong> Look at your phone — it's more powerful than <strong>all the computers NASA used to send astronauts to the Moon in 1969, COMBINED</strong>. With Wi-Fi everywhere, you carry a supercomputer wherever you go.<br><br>▸ <strong>How big?</strong> Slides into your pocket<br>▸ <strong>How fast?</strong> Streams videos, plays games, runs hundreds of apps at once<br>▸ <strong>Famous:</strong> iPhone (2007) · Android phones (2008) · iPad (2010)<br><br><strong>Why it mattered:</strong> TikTok, Instagram, YouTube, Uber, and mobile banking exist <strong>ONLY</strong> because of this era. The whole world is connected — in everyone's pocket.",
            tag: "2000s–now",
            tagColor: "pink",
          },
        ],
      },

      // ─── The story sentence — the ONE thing to memorise ───
      {
        type: "callout",
        variant: "blue",
        html: `<strong>📌 Memorise this one sentence:</strong> &ldquo;Computers went from <mark>Building → Room → Desk → Pocket</mark>. Each step fixed the last era\'s biggest problem.&rdquo; If you remember this sentence, you can rebuild the whole topic in your head.`,
      },

      // ─── Test yourself ───
      {
        type: "callout",
        variant: "purple",
        html: `<strong>🤔 Think it through:</strong> Pick one era. Name its biggest problem in 2 words. Now name the era that fixed it. <em>(Try: PC era → stuck at home → fixed by Mobile era.)</em>`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "How Every Computer Works \u2014 IPO",
    time: "~4 mins",
    badges: [],
    hook: `Whether it's a $10 calculator or a space shuttle \u2014 <strong>every computer in history follows the exact same 3-step recipe.</strong> Input \u2192 Process \u2192 Output. That's literally the whole secret. Everything else is just details.`,
    content: [
      {
        type: "analogy",
        label: "\ud83c\udf55 Pizza Analogy",
        html: `Making pizza = how a computer works. You put in <strong>ingredients</strong> (Input). The <strong>oven cooks</strong> (Process \u2014 that's the CPU). You get a <strong>finished pizza</strong> (Output). Not eating now? Put it in the <strong>fridge</strong> \u2014 that's Storage (your hard drive). The oven doesn't eat the pizza. It just transforms. Same as your CPU.`,
      },
      {
        type: "image",
        src: "/images/m1/ipo-cycle.webp",
        description: "IPO Cycle: Keyboard/Mouse \u2192 CPU \u2192 Screen/Printer \u00b7 Storage below",
      },
      {
        type: "steps",
        items: [
          {
            title: "Input \u2328\ufe0f",
            description: "You tell the computer what to do. Keyboard, mouse, microphone, touchscreen \u2014 sending data into the computer.",
          },
          {
            title: "Process \ud83e\udde0",
            description: "The CPU does all the thinking \u2014 calculations, decisions, comparisons. A modern chip runs 3 billion+ simple operations per second (each one takes nanoseconds). You never see it.",
          },
          {
            title: "Output \ud83d\udda5\ufe0f",
            description: "The result comes back to you \u2014 on screen, through speakers, or printed. The computer communicates its answer.",
          },
        ],
      },
      {
        type: "callout",
        html: `<strong>+ Storage:</strong> Saves your work permanently \u2014 even when the computer turns off. Without it, everything disappears on shutdown. Hence: Ctrl+S exists.`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "The CPU \u2014 Brain of the Computer",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Remove the CPU and you have an expensive paperweight. It's the only part doing <em>actual thinking</em>. Every click, scroll, video, message \u2014 the CPU processes it, billions of times per second. <strong>Let's meet the three characters living inside it.</strong>`,
    content: [
      {
        type: "image",
        src: "/images/m1/cpu-components.webp",
        description: "Inside the CPU: Control Unit (boss) \u00b7 ALU (calculator) \u00b7 Registers (notepad) \u2014 labeled",
      },
      {
        type: "analogy",
        label: "\ud83d\udc6e Police Station Analogy",
        html: `The <strong>Control Unit = the Chief Inspector</strong> \u2014 gives orders, directs everyone, never does the actual work. The <strong>ALU = the detective with a calculator</strong> \u2014 solves every problem, does every calculation. The <strong>Registers = the Inspector's notepad</strong> \u2014 tiny, ultra-fast memory for whatever's happening right this second.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udc6e",
            title: "Control Unit (CU)",
            description: "The manager. Gives instructions and controls data flow. Never does the maths itself.",
            tag: "The Boss",
          },
          {
            icon: "\ud83e\uddee",
            title: "ALU",
            description: "Arithmetic Logic Unit. Does ALL calculations (2+3=5) and logical comparisons (is A bigger than B?).",
            tag: "The Calculator",
          },
          {
            icon: "\ud83d\udccc",
            title: "Registers",
            description: "Tiny ultra-fast storage inside the CPU. Holds data being processed right this microsecond. Faster than RAM.",
            tag: "The Instant Notepad",
          },
        ],
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>Real example \u2014 You type 2+3:</strong> Keyboard sends input \u2192 CU tells ALU "add these" \u2192 ALU calculates 5 \u2192 Registers hold it \u2192 Screen shows 5. The actual arithmetic takes nanoseconds; most of the felt delay is your screen refreshing. \u26a1`,
      },
      {
        type: "text",
        html: `CPU speed is measured in <mark>GHz (Gigahertz)</mark>. A 3.0 GHz CPU runs 3 billion operations per second. Modern phones have multi-core CPUs \u2014 8 or 12 "brains" all working at once.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think Deeper:</strong> If a CPU has 8 cores, does that mean it\u2019s 8x faster than a single-core CPU? What might prevent a computer from using all cores at full speed simultaneously?`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "Memory \u2014 RAM & ROM",
    time: "~5 mins",
    badges: [{ text: "Most confused", type: "hot" }],
    hook: `<strong>Fair warning: this one trips almost everyone up.</strong> "Memory" and "Storage" sound like the same thing. They are completely different. Memory = what the computer is using right now. Storage = where things live permanently. Desk vs cupboard.`,
    content: [
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u274c Common mistake:</strong> "I have 256GB memory on my phone." That's storage, not memory. RAM is usually 4\u201316GB. They are not the same thing. Ever.`,
      },
      {
        type: "analogy",
        label: "\ud83c\udf73 Kitchen Analogy",
        html: `<strong>RAM = your kitchen counter.</strong> Fast to reach, you spread everything out to cook. But when you clean up (power off), the counter is completely clear. Gone. That's RAM \u2014 temporary.<br/><br/><strong>ROM = a printed recipe book.</strong> Permanently printed. You can read it anytime, even with no power. But you cannot write new recipes into it.`,
      },
      {
        type: "image",
        src: "/images/m1/ram-vs-rom.webp",
        description: `RAM chip (left, "Temporary/Volatile") vs ROM chip (right, "Permanent/Non-volatile")`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\u26a1",
            title: "RAM \u2014 Random Access Memory",
            description: "Temporary working memory. Holds everything active right now \u2014 open apps, browser tabs, games. When power goes off, <strong>everything in RAM disappears completely.</strong>",
            tag: "Volatile \u2014 loses data when OFF",
            tagColor: "red",
          },
          {
            icon: "\ud83d\udd12",
            title: "ROM \u2014 Read Only Memory",
            description: "Permanent memory built into hardware. Stores startup instructions so the computer knows how to wake up. Cannot be changed by the user.",
            tag: "Non-volatile \u2014 keeps data always",
            tagColor: "green",
          },
        ],
      },
      {
        type: "table",
        headers: ["Feature", "RAM", "ROM"],
        rows: [
          { cells: ["Full Name", "Random Access Memory", "Read Only Memory"] },
          { cells: ["Data lost when OFF?", "\u2705 Yes (volatile)", "\u274c No (permanent)"] },
          { cells: ["Can user change it?", "\u2705 Yes", "\u274c No"] },
          { cells: ["Speed", "Very fast \u26a1", "Fast"] },
          { cells: ["Used for", "Running apps right now", "Startup instructions"] },
        ],
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think Deeper:</strong> If RAM is so fast, why don\u2019t computers just use RAM for everything instead of hard drives? What would be the trade-off in cost, capacity, and what happens when you turn off the power?`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "Input Devices \u2014 Talking TO the Computer",
    time: "~4 mins",
    badges: [],
    hook: `The computer has zero idea what you want until you tell it. It just sits there. Input devices are how <em>you</em> communicate with the machine. <strong>No input = nothing happens.</strong> The computer waits, silent, like a very expensive paperweight.`,
    content: [
      {
        type: "image",
        src: "/images/m1/input-devices.webp",
        description: "Input devices (Keyboard, Mouse, Mic, Webcam, Scanner, Touchscreen) with arrows pointing INTO computer \u2014 each labeled",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\u2328\ufe0f",
            title: "Keyboard",
            description: "Types letters and commands into the computer. Most common input device on laptops and desktops.",
          },
          {
            icon: "\ud83d\uddb1\ufe0f",
            title: "Mouse",
            description: "Controls the cursor. Click, select, drag. Sends your movements and clicks into the computer.",
          },
          {
            icon: "\ud83d\udc46",
            title: "Touchscreen",
            description: "Touch the screen to input directly. Replaces both mouse and keyboard on phones and tablets.",
          },
          {
            icon: "\ud83c\udfa4",
            title: "Microphone",
            description: "Sends your voice INTO the computer. Powers Siri, voice calls, recordings.",
          },
          {
            icon: "\ud83d\udcc4",
            title: "Scanner",
            description: "Takes physical paper and converts it to a digital file. Paper \u2192 Digital. Goes INTO the computer.",
          },
          {
            icon: "\ud83d\udcf7",
            title: "Webcam",
            description: "Captures video as input. Used for video calls and laptop photos.",
          },
        ],
      },
      {
        type: "callout",
        html: `<strong>The easy rule:</strong> Data going INTO the computer = Input. Data coming OUT = Output. Scanner sends paper IN \u2705. Printer sends paper OUT \u2705. Never mix these up.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Tricky one \u2014 Touchscreen:</strong> It's BOTH input (touch) AND output (displays content). So it's called an <mark>I/O Device</mark> \u2014 Input/Output. Your phone screen is the most common example in the world.`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "Output Devices \u2014 The Computer Talking Back",
    time: "~4 mins",
    badges: [],
    hook: `The CPU has finished thinking. Now it needs to tell <em>you</em> the answer. Output devices are how the computer communicates results back to humans \u2014 through your eyes, ears, or even touch. Without output, you'd have no idea what the computer just did.`,
    content: [
      {
        type: "image",
        src: "/images/m1/output-devices.webp",
        description: "Output devices (Monitor, Speakers, Printer, Projector, Headphones) with arrows pointing AWAY from computer \u2014 each labeled",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udda5\ufe0f",
            title: "Monitor",
            description: "Shows everything visual \u2014 text, videos, images. The most important output device.",
          },
          {
            icon: "\ud83d\udd0a",
            title: "Speakers",
            description: "Plays sound \u2014 music, video audio, notification sounds. Audio output for the room.",
          },
          {
            icon: "\ud83d\udda8\ufe0f",
            title: "Printer",
            description: `Takes a digital file and prints it on physical paper. The printed page = a <mark>Hard Copy</mark>.`,
          },
          {
            icon: "\ud83d\udcfd\ufe0f",
            title: "Projector",
            description: "Projects screen onto a big wall. Used in classrooms and cinemas. Monitor for a crowd.",
          },
          {
            icon: "\ud83c\udfa7",
            title: "Headphones",
            description: "Personal audio output. Only you hear it \u2014 great for studying without disturbing everyone else.",
          },
          {
            icon: "\ud83d\udcf3",
            title: "Haptic Feedback",
            description: "The vibration when your phone gets a notification. That's output! The computer speaks through touch.",
          },
        ],
      },
      {
        type: "table",
        headers: ["Term", "Meaning", "Example"],
        rows: [
          { cells: ["<strong>Soft Copy</strong>", "Digital output on screen \u2014 no paper", "Document on your monitor"] },
          { cells: ["<strong>Hard Copy</strong>", "Output printed on physical paper", "Your printed assignment"] },
        ],
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "Storage Devices \u2014 Where Everything Lives",
    time: "~5 mins",
    badges: [],
    hook: `RAM is your desk \u2014 fast, temporary. Storage is your <em>cupboard</em>. Everything stays there even when the lights go off. Every photo, song, app, and document you've ever saved lives permanently in storage. This topic is about the different types of cupboards.`,
    content: [
      {
        type: "image",
        src: "/images/m1/storage-devices.webp",
        description: "4 storage types: HDD (spinning disk) \u00b7 SSD (chip) \u00b7 USB Drive (plug) \u00b7 Cloud (server) \u2014 labeled with speed & size",
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcbd",
            title: "HDD \u2014 Hard Disk Drive",
            description: "Traditional spinning disk. Stores lots of data cheaply. Slower than SSD. Found in older laptops and desktops.",
            tag: "Cheap \u00b7 1TB\u201310TB \u00b7 Slow",
            tagColor: "amber",
          },
          {
            icon: "\u26a1",
            title: "SSD \u2014 Solid State Drive",
            description: "No moving parts \u2014 just chips. Much faster than HDD. Why modern laptops boot in seconds.",
            tag: "Fast \u00b7 256GB\u20134TB \u00b7 Modern",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udd0c",
            title: "USB Flash Drive",
            description: "Tiny portable storage. Plug into any USB port. Carry files between computers. Pocket-sized.",
            tag: "Portable \u00b7 4GB\u20131TB",
            tagColor: "green",
          },
          {
            icon: "\u2601\ufe0f",
            title: "Cloud Storage",
            description: "Files on internet servers. Access from any device, anywhere. Google Drive, iCloud, OneDrive. Needs internet!",
            tag: "Anywhere \u00b7 Unlimited",
          },
        ],
      },
      {
        type: "table",
        headers: ["Type", "Speed", "Size", "Portable?"],
        rows: [
          { cells: ["HDD", "\ud83d\udc22 Slow", "1\u201310 TB", "\u274c Fixed inside"] },
          { cells: ["SSD", "\ud83d\ude80 Very fast", "256GB\u20134TB", "\u274c Fixed inside"] },
          { cells: ["USB Drive", "\u26a1 Medium", "4GB\u20131TB", "\u2705 Pocket-sized"] },
          { cells: ["Cloud", "\ud83d\udcf6 WiFi-dependent", "Unlimited", "\u2705 Anywhere"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why does a game take time to load?</strong> Game files sit in storage (HDD/SSD). When you press Play, the computer moves them into fast RAM so the CPU can use them. That loading screen = data moving from slow storage to fast RAM. Bigger game = longer move.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>🤔 Think Deeper:</strong> A company needs to choose between HDD and SSD for 500 employee laptops. What factors should they consider beyond just speed — think about budget, durability, and the type of work employees do?`,
      },
    ],
  },

  // ─── Topic 9 ───
  {
    id: 9,
    title: "Types of Software",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Hardware without software is metal and plastic that does nothing. Your brand-new laptop with no operating system? It turns on and shows a black screen. <strong>Software is the invisible magic</strong> that turns a box of components into something useful.`,
    content: [
      {
        type: "analogy",
        label: "\ud83c\udfeb The School Analogy",
        html: `Think of a school. The <strong>building = Hardware</strong> \u2014 useless without people. The <strong>Principal = System Software</strong> \u2014 manages everything, makes the school run, never teaches directly. The <strong>Teachers = Application Software</strong> \u2014 the actual reason students come every day. The <strong>Janitor &amp; Nurse = Utility Software</strong> \u2014 working quietly, keeping things clean, safe, and healthy.`,
      },
      {
        type: "image",
        src: "/images/m1/software-types.webp",
        description: "Software pyramid: System Software (base) \u2192 Application Software (middle) \u2192 Utility Software (maintenance) \u2014 all labeled with examples",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\u2699\ufe0f",
            title: "System Software",
            description: "Controls all the hardware. Makes everything else run. Without it, the computer does absolutely nothing.",
            tag: "Windows \u00b7 Android \u00b7 iOS \u00b7 macOS",
          },
          {
            icon: "\ud83d\udcf1",
            title: "Application Software",
            description: "Apps built for specific tasks. Games, browsers, music players. The software you actually use every day.",
            tag: "WhatsApp \u00b7 Chrome \u00b7 Word \u00b7 Spotify",
          },
          {
            icon: "\ud83d\udd27",
            title: "Utility Software",
            description: "Background maintenance tools. Keeps your device healthy, secure, and running smoothly. Works quietly.",
            tag: "Antivirus \u00b7 Disk Cleanup \u00b7 Backup",
          },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u2b50 The golden rule:</strong> You CANNOT run application software without system software first. Your phone needs Android or iOS before WhatsApp can work. System software is always the foundation \u2014 installed first, always in charge.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think Deeper:</strong> Imagine your phone has no operating system installed. Can you install WhatsApp on it? Why does the order of software installation matter, and what role does system software play as a \u201cfoundation\u201d?`,
      },
    ],
  },

  // ─── Topic 10 ───
  {
    id: 10,
    title: "Internet Basics \u2014 How It Actually Works",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You type "google.com" and press Enter. Google appears in half a second. But behind that half-second, a mini miracle happened \u2014 your request found Google's servers across the world and came back with a full webpage. <strong>Let's see exactly how.</strong>`,
    content: [
      {
        type: "analogy",
        label: "\ud83c\udfd9\ufe0f City Address Analogy",
        html: `Every building in a city has a unique number address \u2014 that's how delivery vans find it. The internet works the same way. Every device has a unique <strong>IP Address</strong> (like "142.250.190.46"). But nobody memorises numbers \u2014 we use names like "City Mall." <strong>URLs</strong> (google.com) are those friendly names. The <strong>DNS Server</strong> is the phonebook converting friendly name \u2192 actual number, automatically.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udd22",
            title: "IP Address",
            description: "Every device has a unique number address (e.g. 192.168.1.1). Computers use this to find each other. Impossible for humans to memorise.",
            tag: "e.g. 142.250.190.46",
          },
          {
            icon: "\ud83d\udd17",
            title: "URL",
            description: `Human-friendly name for a website. "google.com" instead of "142.250.190.46". Much easier to type and remember.`,
            tag: "e.g. www.google.com",
          },
          {
            icon: "\ud83d\udcd6",
            title: "DNS Server",
            description: `The internet's phonebook. Converts "google.com" into its actual IP address so your browser knows where to go.`,
            tag: "Domain Name System",
          },
        ],
      },
      {
        type: "image",
        src: "/images/m1/internet.webp",
        description: "4-step journey: Type URL \u2192 DNS converts \u2192 Server prepares \u2192 Page arrives \u2014 labeled flow diagram",
      },
      {
        type: "text",
        html: `<strong>What happens when you type www.google.com? \u2014 The 4-step journey:</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "You Send a Request \u2709\ufe0f",
            description: `Your browser sends a message \u2014 "I want google.com's homepage, please!"`,
          },
          {
            title: "DNS Finds the Address \ud83d\udcd6",
            description: `The DNS Server looks up "google.com" and returns its real IP address. Like finding a contact in your phone.`,
          },
          {
            title: "Google Prepares the Package \ud83d\udce6",
            description: "Your request reaches Google's data center. Their server prepares the full homepage to send back.",
          },
          {
            title: "Page Arrives! \ud83c\udf89",
            description: "The package travels back. Browser opens it. You see Google's homepage. All in under 1 second.",
          },
        ],
      },
      {
        type: "callout",
        html: `<strong>Email address format:</strong> name<strong>@</strong>domain.com \u2014 The @ means "at". student@amity.edu = user "student" AT server "amity.edu". Don't confuse email address, URL, and IP address \u2014 three completely different things.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think Deeper:</strong> What would happen if DNS servers worldwide went down for one hour? Which of your daily activities \u2014 messaging, browsing, streaming, gaming \u2014 would still work, and which would break completely?`,
      },
    ],
  },

  // ─── Topic 11 ───
  {
    id: 11,
    title: "Internet Applications \u2014 What We Actually Use",
    time: "~4 mins",
    badges: [],
    hook: `The internet is the motorway. Applications are the vehicles using it. Three categories you need to know cold: Email, Instant Messaging, and Video Conferencing. They sound similar. <strong>They are very different.</strong>`,
    content: [
      {
        type: "image",
        src: "/images/m1/internet-apps.webp",
        description: "Three panels: Email (formal letter) \u00b7 Instant Messaging (chat bubble) \u00b7 Video Conferencing (camera + faces) \u2014 each labeled with examples",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\u2709\ufe0f",
            title: "Email \u2014 The Digital Letter",
            description: "Send messages with attachments. Formal. Doesn't need instant reply. Best for assignments, professional communication, official records.",
            tag: "Gmail \u00b7 Outlook \u00b7 Yahoo",
          },
          {
            icon: "\ud83d\udcac",
            title: "Instant Messaging",
            description: "Real-time text chat \u2014 your friend sees it in seconds. Casual, fast, great for quick questions and photos.",
            tag: "WhatsApp \u00b7 Telegram \u00b7 iMessage",
          },
          {
            icon: "\ud83d\udcf9",
            title: "Video Conferencing",
            description: "Live face-to-face conversation through your camera over the internet. Changed online school and work forever.",
            tag: "Zoom \u00b7 Google Meet \u00b7 Teams",
          },
        ],
      },
      {
        type: "table",
        headers: ["Feature", "Email", "Instant Messaging", "Video Conferencing"],
        rows: [
          { cells: ["Speed", "Minutes\u2013Hours", "Instant \u26a1", "Live / Real-time"] },
          { cells: ["Formality", "Formal \ud83d\udc54", "Casual \ud83d\ude0a", "Semi-formal \ud83d\udc4b"] },
          { cells: ["Best for", "Assignments, documents", "Friends, quick chats", "Meetings, online classes"] },
          { cells: ["Examples", "Gmail, Outlook", "WhatsApp, Telegram", "Zoom, Google Meet"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Quick decision rule:</strong> Submitting an assignment \u2192 Email. Asking what's for lunch \u2192 WhatsApp. Online class \u2192 Zoom. Formal = Email. Instant = Messaging. Live face = Video call.`,
      },
    ],
  },
];
