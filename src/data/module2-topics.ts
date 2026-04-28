import type { Topic } from "./module1-topics";

// Module 2 — rewritten 2026-04-27 to match how the course is actually
// being taught: AI presentations (Gamma), AI study tool (NotebookLM),
// and a quick Excel basics topic. Old Word/PowerPoint tutorial topics
// were removed — the teacher decided to spend that class time on the
// AI tools instead. Self-read style: short paragraphs, no MCQs (the
// teacher said the students don't need testing on this, just exposure).
export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "What is a Presentation?",
    time: "~3 mins",
    badges: [{ text: "Foundation", type: "star" }],
    hook: `A <strong>presentation</strong> is a story told with slides. You stand up, click through a few screens, and explain something to people. <strong>Same as showing photos to your family on the TV — just with words and pictures you planned.</strong>`,
    content: [
      {
        type: "text",
        html: `Every slide holds <strong>one idea</strong>. The title says what the idea is, and a few words or a picture below it back it up. You move to the next slide, you say the next idea. <mark>One slide = one beat of your story.</mark>`,
      },
      {
        type: "text",
        html: `<strong>Why do we use presentations?</strong> Because reading a long page of text is boring, and listening to someone talk for ten minutes without anything to look at is also boring. Slides give the eye something to follow while the ear listens. Two senses working together = the audience actually remembers what you said.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "🎓",
            title: "School project",
            description: "Show your topic to the class — slides keep you on track and the teacher can see your effort.",
            tag: "Class",
            tagColor: "blue",
          },
          {
            icon: "💼",
            title: "Job interview",
            description: "Some interviews ask for a short pitch. A clean 5-slide deck shows you can communicate.",
            tag: "Career",
            tagColor: "purple",
          },
          {
            icon: "💡",
            title: "An idea you care about",
            description: "Pitching a club, a startup, or a school event — slides make people take you seriously.",
            tag: "Pitch",
            tagColor: "amber",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>The old way:</strong> open MS PowerPoint, pick a template, drag text boxes around, choose fonts, hunt for images on Google, line everything up by hand. A 10-slide deck used to take <strong>2–3 hours</strong>. <br><br><strong>The new way (next two topics):</strong> type a sentence, get a finished deck. We'll see how.`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "Gamma AI — Presentations from a Prompt",
    time: "~4 mins",
    badges: [{ text: "AI tool", type: "star" }],
    hook: `Tell <strong>Gamma</strong> what your presentation is about in one sentence. <strong>Thirty seconds later you have a full deck — slides, layout, images, and design — done.</strong> Then you tweak the parts you want to change.`,
    content: [
      {
        type: "text",
        html: `<strong>Gamma</strong> is a website (<a href="https://gamma.app">gamma.app</a>) that builds presentations with AI. You write a prompt like <em>"a 6-slide presentation on climate change for high school students"</em> and it picks a layout, writes the slide titles, drafts the body text, and even pulls in stock images. Everything is editable after — you're not stuck with what it gave you.`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Open gamma.app",
            description: "Sign in with Google. The free plan gives you enough credits to make several decks per month.",
          },
          {
            title: "Click 'Create new'",
            description: "Choose 'Presentation' from the three options (the others are document and webpage).",
          },
          {
            title: "Type your prompt",
            description: "Be specific. 'A 5-slide pitch for opening a coffee shop in Tashkent' works much better than 'coffee shop'.",
          },
          {
            title: "Pick a theme",
            description: "Gamma shows a few colour and font themes. Click one. You can change this later too.",
          },
          {
            title: "Wait ~30 seconds",
            description: "AI writes the slides. You'll see them appear one by one.",
          },
          {
            title: "Edit anything",
            description: "Click on any text or image to change it. Drag slides to reorder them. Add a new slide with the + button.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Why Gamma beats traditional PowerPoint for students:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "⏱️",
            title: "30 seconds vs 2 hours",
            description: "PowerPoint: hunt for layouts, fonts, images yourself. Gamma: type a prompt, done.",
            tag: "Speed",
            tagColor: "green",
          },
          {
            icon: "🎨",
            title: "Design just works",
            description: "Spacing, colours, font sizes — Gamma keeps everything consistent. No more lopsided slides.",
            tag: "Design",
            tagColor: "purple",
          },
          {
            icon: "🖼️",
            title: "Images included",
            description: "Stock photos and AI illustrations are pulled in for you. No Google image search needed.",
            tag: "Visuals",
            tagColor: "blue",
          },
          {
            icon: "✏️",
            title: "Still fully editable",
            description: "Don't like a slide? Click and rewrite it. AI gave you a starting point, not a prison.",
            tag: "Control",
            tagColor: "amber",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Heads up:</strong> Gamma's free plan limits how many AI decks you can make each month. If you run out, you can still edit your existing decks — just can't generate new ones until next month or you upgrade.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Try it:</strong> Open Gamma and prompt: <em>"A 6-slide presentation introducing me as a first-year student at Amity Tashkent — my hometown, what I'm studying, my hobbies, and what I want to do after graduation."</em> Use the result as a self-introduction for a future class.`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "NotebookLM — Smarter Than Gamma",
    time: "~4 mins",
    badges: [{ text: "AI tool", type: "star" }],
    hook: `Gamma makes pretty slides. <strong>NotebookLM does something different — it reads YOUR notes, lecture handouts, and PDFs, then answers questions about them, makes a quiz, or even talks you through the topic like a podcast.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>NotebookLM</strong> is Google's AI notebook (<a href="https://notebooklm.google.com">notebooklm.google.com</a>). You upload your study material — PDFs, slides, web links, your own typed notes — and the AI reads everything. Then you can ask it questions, and every answer comes with a <mark>citation back to which page of your material it came from</mark>. So you can trust it.`,
      },
      {
        type: "text",
        html: `<strong>This is different from ChatGPT.</strong> ChatGPT knows things from the internet. NotebookLM only knows what YOU gave it. That sounds limiting — but for studying, it's the whole point. You don't want random internet answers; you want answers from <em>your</em> textbook and <em>your</em> teacher's notes.`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Open notebooklm.google.com",
            description: "Sign in with your Google account. Free for students.",
          },
          {
            title: "Click 'New notebook'",
            description: "A notebook is a folder where you collect everything for one subject or one exam.",
          },
          {
            title: "Add your sources",
            description: "Drag in PDFs (your textbook, lecture handouts), paste links to websites, or paste in typed notes. Up to 50 sources per notebook on the free plan.",
          },
          {
            title: "Wait for it to read",
            description: "NotebookLM scans every source. Takes a minute or two depending on how much you uploaded.",
          },
          {
            title: "Ask questions",
            description: "'Explain photosynthesis like I'm 12.' 'Make 10 practice questions on chapter 3.' 'Summarise the main argument of this PDF in 3 bullets.' Every answer cites the source.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>What makes NotebookLM more powerful than just slides:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "🎯",
            title: "Cited answers",
            description: "Every reply links back to the exact page of your source. You can verify nothing is made up.",
            tag: "Trust",
            tagColor: "green",
          },
          {
            icon: "📝",
            title: "Auto study guides",
            description: "One click to generate a summary, FAQ, or timeline from your sources. Great for exam prep.",
            tag: "Study",
            tagColor: "blue",
          },
          {
            icon: "🎙️",
            title: "Audio overview",
            description: "Press a button and NotebookLM creates a podcast-style audio of two AI hosts discussing your notes. Listen on the bus.",
            tag: "Listen",
            tagColor: "purple",
          },
          {
            icon: "🧠",
            title: "Quiz me",
            description: "Ask 'make 15 multiple-choice questions on this material with answers' — instant practice test.",
            tag: "Practice",
            tagColor: "amber",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Gamma vs NotebookLM — when to use which:</strong> <br>▸ Need to <strong>present</strong> something to someone? → Gamma. <br>▸ Need to <strong>understand or revise</strong> something? → NotebookLM. <br>▸ Real workflow: revise with NotebookLM until you understand the topic, then ask Gamma to turn your notes into a presentation.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Try it:</strong> Take your last 3 lecture handouts (or this entire IFP105 site!), upload them to a NotebookLM notebook, and ask: <em>"Make a study guide with the 10 most important things I need to know for the exam, with citations."</em>`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "MS Excel — Numbers in Cells",
    time: "~4 mins",
    badges: [{ text: "Tool basics", type: "star" }],
    hook: `<strong>Excel</strong> is the third tool in this module. AI can write and design — Excel is for <strong>numbers in rows and columns</strong>. Marks, expenses, scores, anything you'd otherwise do on paper with a calculator. Excel does the maths for you, and the answer updates the moment a number changes.`,
    content: [
      {
        type: "text",
        html: `Every Excel file is a <strong>workbook</strong>. Inside it are <strong>worksheets</strong> (the tabs at the bottom). Each worksheet is a grid of <strong>cells</strong> arranged in <strong>rows</strong> (numbered 1, 2, 3…) and <strong>columns</strong> (lettered A, B, C…). The cell where row 5 meets column B is called <mark>B5</mark>. That's its address.`,
      },
      {
        type: "analogy",
        label: "🏠 Cells are like houses on a street",
        html: `Think of each column as a street (A Street, B Street, C Street) and each row as a house number (#1, #2, #3). <strong>B5</strong> is "B Street, House 5." Every cell has a unique address, just like every house, so Excel always knows which one you're talking about.`,
      },
      {
        type: "text",
        html: `<strong>Formulas</strong> are how Excel does maths for you. Every formula starts with <strong>=</strong> (the equals sign). That's how Excel knows you want a calculation, not just text.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "➕",
            title: "Add two cells",
            description: "Type =A1+A2 in any empty cell. Excel adds the value of A1 and A2. Change A1, the answer updates.",
            tag: "=A1+A2",
            tagColor: "blue",
          },
          {
            icon: "Σ",
            title: "Sum a range",
            description: "=SUM(A1:A10) adds every number from A1 down to A10 in one go. Faster than typing +A1+A2+A3…",
            tag: "=SUM(A1:A10)",
            tagColor: "green",
          },
          {
            icon: "📊",
            title: "Average",
            description: "=AVERAGE(B2:B30) gives the mean of all numbers in that range. Useful for class marks.",
            tag: "=AVERAGE(…)",
            tagColor: "purple",
          },
          {
            icon: "🏆",
            title: "Max / Min",
            description: "=MAX(C1:C20) finds the biggest number; =MIN(…) finds the smallest. Top scorer in one click.",
            tag: "=MAX / MIN",
            tagColor: "amber",
          },
        ],
      },
      {
        type: "text",
        html: `Try the practice grid below — type the formula into the highlighted cell, press Enter, and watch Excel calculate.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why Excel is worth knowing:</strong> ▸ Tracking your monthly budget ▸ Class mark sheets ▸ Inventory for a small business ▸ Any time you have to repeat the same calculation many times — set up a formula once and Excel does it for every row.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Try it:</strong> Open Excel (or Google Sheets — same idea, free in the browser). Make a sheet of your last 5 test marks. Use =AVERAGE to see your average, =MAX to see your best score, and =MIN to see your worst. That's already useful real data about yourself.`,
      },
    ],
  },
];
