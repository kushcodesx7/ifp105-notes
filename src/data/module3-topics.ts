import type { Topic } from "./module1-topics";

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "What is Productivity Software?",
    time: "~4 mins",
    badges: [],
    hook: `You walk into an office in 1985 — there are typewriters, paper calendars, filing cabinets, and calculators on every desk. Now walk into an office today — <strong>one laptop replaces ALL of that.</strong> The magic behind it? Productivity software. Let's find out what it is and why every workplace on Earth depends on it.`,
    content: [
      {
        type: "text",
        html: `Productivity software is a category of application software designed to help people <mark>create, organise, and manage their work</mark> more efficiently. Instead of ten separate tools on your desk, you get one suite of programs that does it all — faster, cleaner, and with zero paper cuts.`,
      },
      {
        type: "image",
        description: "Old office (typewriter, paper files, calculator) vs Modern office (laptop with Word, Excel, PowerPoint icons) — side by side comparison",
      },
      {
        type: "analogy",
        label: "\ud83e\uddf0 Swiss Army Knife Analogy",
        html: `A Swiss Army knife has a blade, scissors, screwdriver, and bottle opener — all in one tool. <strong>Productivity software is the Swiss Army knife of the office.</strong> Word processing, spreadsheets, presentations, email — all bundled into one package called an <mark>Office Suite</mark>. Microsoft Office and Google Workspace are the two biggest examples.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcdd",
            title: "Word Processing",
            description: "Create and format text documents — essays, letters, reports. Replaces the typewriter completely.",
            tag: "MS Word \u00b7 Google Docs",
          },
          {
            icon: "\ud83d\udcca",
            title: "Spreadsheets",
            description: "Organise data in rows and columns, perform calculations, create charts. Replaces calculators and ledgers.",
            tag: "MS Excel \u00b7 Google Sheets",
          },
          {
            icon: "\ud83d\udcfd\ufe0f",
            title: "Presentations",
            description: "Create visual slideshows with text, images, and animations for presenting ideas to an audience.",
            tag: "MS PowerPoint \u00b7 Google Slides",
          },
        ],
      },
      {
        type: "table",
        headers: ["Old Way", "Productivity Software", "Benefit"],
        rows: [
          { cells: ["Typewriter", "Microsoft Word", "Edit without retyping the whole page"] },
          { cells: ["Paper ledger + calculator", "Microsoft Excel", "Auto-calculate thousands of numbers instantly"] },
          { cells: ["Overhead projector + transparencies", "Microsoft PowerPoint", "Animated, colourful slides in minutes"] },
          { cells: ["Filing cabinet", "File Explorer / Cloud", "Search any file in seconds"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Key term — Office Suite:</strong> A bundle of productivity apps sold together. Microsoft Office (Word, Excel, PowerPoint, Outlook) is the most widely used office suite in the world. Google Workspace (Docs, Sheets, Slides, Gmail) is the main cloud-based alternative.`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "Microsoft Word \u2014 Basics",
    time: "~5 mins",
    badges: [],
    hook: `Every assignment you submit, every CV you'll write, every professional letter you'll ever send — <strong>Microsoft Word is behind almost all of them.</strong> It's the world's most-used word processor. If you can master Word, you can handle any document thrown at you. Let's start from zero.`,
    content: [
      {
        type: "text",
        html: `Microsoft Word is a <mark>word processing application</mark> — software specifically designed for creating, editing, formatting, and printing text-based documents. Think of it as a supercharged typewriter that lets you fix mistakes, change fonts, add images, and rearrange everything without starting over.`,
      },
      {
        type: "image",
        description: "Microsoft Word interface: Ribbon (tabs at top), Document area (centre), Status bar (bottom) — each labelled",
      },
      {
        type: "steps",
        items: [
          {
            title: "Create a New Document \ud83d\udcc4",
            description: "Open Word \u2192 Click 'Blank document' or choose a template (resume, letter, report). A fresh page appears ready for typing.",
          },
          {
            title: "Type Your Content \u2328\ufe0f",
            description: "Just start typing. Word wraps text automatically — no need to press Enter at the end of each line. Press Enter only to start a new paragraph.",
          },
          {
            title: "Format Your Text \ud83c\udfa8",
            description: "Select text, then use the Home tab: Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U). Change font, size, colour. Make it look professional.",
          },
          {
            title: "Save Your Work \ud83d\udcbe",
            description: "Ctrl+S \u2014 the most important shortcut you will ever learn. Save early, save often. Choose a file name and location. Word saves as .docx by default.",
          },
        ],
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83c\udd71\ufe0f",
            title: "Bold",
            description: "Ctrl+B \u2014 makes text thicker and heavier for emphasis.",
            tag: "Ctrl+B",
          },
          {
            icon: "\ud83c\udd58",
            title: "Italic",
            description: "Ctrl+I \u2014 slants text. Used for titles, foreign words, emphasis.",
            tag: "Ctrl+I",
          },
          {
            icon: "\ud83c\udd64",
            title: "Underline",
            description: "Ctrl+U \u2014 draws a line below text. Used for headings or links.",
            tag: "Ctrl+U",
          },
          {
            icon: "\ud83d\udcbe",
            title: "Save",
            description: "Ctrl+S \u2014 saves your document. Do this every few minutes!",
            tag: "Ctrl+S",
          },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u274c Classic disaster:</strong> You spend 2 hours typing an essay. Power goes out. You never pressed Ctrl+S. <strong>Everything is gone.</strong> RAM is temporary! Your unsaved document lived only in RAM. The fix? Save every few minutes. Or turn on AutoSave if using OneDrive.`,
      },
      {
        type: "table",
        headers: ["Action", "Shortcut", "What It Does"],
        rows: [
          { cells: ["Undo", "Ctrl+Z", "Reverses your last action \u2014 the magic eraser"] },
          { cells: ["Redo", "Ctrl+Y", "Brings back what you just undid"] },
          { cells: ["Copy", "Ctrl+C", "Copies selected text to clipboard"] },
          { cells: ["Paste", "Ctrl+V", "Pastes clipboard content where cursor is"] },
          { cells: ["Select All", "Ctrl+A", "Selects everything in the document"] },
          { cells: ["Find", "Ctrl+F", "Searches for a word or phrase"] },
        ],
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "Microsoft Word \u2014 Advanced Features",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Basic Word gets you through an essay. But what about a 50-page report with a title page, automatic table of contents, page numbers, and headers on every page? <strong>Advanced Word features turn a student document into a professional-quality report.</strong> These are the features that separate beginners from pros.`,
    content: [
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcc3",
            title: "Headers & Footers",
            description: "Text that appears at the TOP (header) or BOTTOM (footer) of every page automatically. Perfect for page numbers, dates, or your name.",
            tag: "Insert \u2192 Header/Footer",
          },
          {
            icon: "\ud83d\udcca",
            title: "Tables",
            description: "Rows and columns inside your document for organising data neatly. Insert \u2192 Table \u2192 choose grid size.",
            tag: "Insert \u2192 Table",
          },
          {
            icon: "\u2709\ufe0f",
            title: "Mail Merge",
            description: "Send the SAME letter to hundreds of people, but with each person's name and details filled in automatically.",
            tag: "Mailings tab",
          },
        ],
      },
      {
        type: "analogy",
        label: "\u2709\ufe0f Mail Merge = Wedding Invitations",
        html: `Imagine writing 200 wedding invitations by hand, each with a different guest name and address. Nightmare! <strong>Mail Merge</strong> lets you write ONE template letter, connect it to a list of names and addresses (from Excel), and Word automatically creates 200 personalised letters in seconds. Same letter, different details — zero hand-cramp.`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Insert a Header with Page Numbers",
            description: "Insert tab \u2192 Header \u2192 Choose a style \u2192 Type your text. For page numbers: Insert \u2192 Page Number \u2192 Choose position (top, bottom, etc.).",
          },
          {
            title: "Create a Table",
            description: "Insert tab \u2192 Table \u2192 Drag to select rows and columns (e.g. 3x4). Click inside cells to type. Use Table Design tab to style it.",
          },
          {
            title: "Set Up Mail Merge",
            description: "Mailings tab \u2192 Start Mail Merge \u2192 Letters. Select Recipients (from an Excel file). Insert Merge Fields (name, address). Preview \u2192 Finish & Merge.",
          },
        ],
      },
      {
        type: "table",
        headers: ["Feature", "What It Does", "Where to Find It"],
        rows: [
          { cells: ["Header/Footer", "Repeating text on top/bottom of every page", "Insert tab \u2192 Header or Footer"] },
          { cells: ["Page Numbers", "Automatic numbering on each page", "Insert tab \u2192 Page Number"] },
          { cells: ["Table of Contents", "Auto-generated list of sections with page numbers", "References tab \u2192 Table of Contents"] },
          { cells: ["Spell Check", "Underlines spelling/grammar mistakes", "Review tab \u2192 Spelling & Grammar (or F7)"] },
          { cells: ["Track Changes", "Shows edits made by you or others in colour", "Review tab \u2192 Track Changes"] },
          { cells: ["Mail Merge", "Personalised bulk letters from a data source", "Mailings tab \u2192 Start Mail Merge"] },
        ],
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>File format tip:</strong> Word saves as <mark>.docx</mark> by default. To share with someone who can't edit it, save as <mark>.pdf</mark> (File \u2192 Save As \u2192 PDF). PDFs look the same on every device and cannot be easily changed — perfect for final submissions.`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "Microsoft Excel \u2014 Basics",
    time: "~5 mins",
    badges: [],
    hook: `Word handles words. Excel handles <em>numbers</em>. Every business, bank, school, and hospital on the planet uses spreadsheets. <strong>If Word is the pen, Excel is the calculator — except this calculator can handle millions of numbers at once.</strong> Let's learn the building blocks.`,
    content: [
      {
        type: "text",
        html: `Microsoft Excel is a <mark>spreadsheet application</mark> — software designed for organising data in a grid of rows and columns, performing calculations, and creating charts. The entire workspace is called a <strong>workbook</strong>, and each tab at the bottom is a <strong>worksheet</strong> (or sheet).`,
      },
      {
        type: "image",
        description: "Excel interface: Column letters (A, B, C) across top, Row numbers (1, 2, 3) down left side, Cell B3 highlighted with Name Box showing 'B3', Formula Bar above — all labelled",
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udfe9",
            title: "Cell",
            description: "The single box where a row and column meet. Each cell has a unique address like B3 (column B, row 3).",
            tag: "The basic unit",
          },
          {
            icon: "\u2194\ufe0f",
            title: "Row",
            description: "A horizontal line of cells going LEFT to RIGHT. Numbered 1, 2, 3... Excel has over 1 million rows!",
            tag: "Horizontal \u2014 numbers",
          },
          {
            icon: "\u2195\ufe0f",
            title: "Column",
            description: "A vertical line of cells going TOP to BOTTOM. Labelled A, B, C... up to XFD (16,384 columns).",
            tag: "Vertical \u2014 letters",
          },
          {
            icon: "\ud83d\udccb",
            title: "Worksheet",
            description: "One single sheet (tab) inside a workbook. You can have multiple sheets — like pages in a notebook.",
            tag: "Tab at the bottom",
          },
        ],
      },
      {
        type: "analogy",
        label: "\ud83d\udcd3 Notebook Analogy",
        html: `An Excel <strong>Workbook</strong> is like a physical notebook. Each <strong>Worksheet</strong> (sheet tab at the bottom) is a page in that notebook. Each page has a grid — <strong>Columns</strong> are the vertical lines, <strong>Rows</strong> are the horizontal lines, and where they cross is a <strong>Cell</strong>. Cell A1 = column A, row 1 — the very first box in the top-left corner.`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Open Excel & Start a Workbook",
            description: "Open Excel \u2192 Click 'Blank workbook'. You see a grid of cells. The active cell is highlighted with a green border — that's where your typing will go.",
          },
          {
            title: "Enter Data",
            description: "Click any cell and type. Press Tab to move right, Enter to move down. Type names in column A, numbers in column B. Keep it organised!",
          },
          {
            title: "Resize Columns",
            description: "If text gets cut off, double-click the column border between letters to auto-fit. Or drag it wider manually.",
          },
          {
            title: "Save Your Workbook",
            description: "Ctrl+S \u2014 saves as .xlsx (Excel format). Name it clearly: 'Student_Marks_2026.xlsx' not 'Book1.xlsx'.",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Cell Address trick:</strong> The cell address is always <mark>Column Letter + Row Number</mark>. So the cell in column D, row 7 = <strong>D7</strong>. Never the other way around. It's NOT 7D. Think: "Letter first, number second" \u2014 like a postcode.`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "Microsoft Excel \u2014 Formulas & Functions",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }, { text: "Most tested", type: "hot" }],
    hook: `Typing numbers into cells is just a fancy table. The real power of Excel is that it can <strong>calculate for you</strong>. One formula can add up 10,000 numbers in a blink. Change one number, and every result updates instantly. <strong>Formulas are what make Excel, Excel.</strong>`,
    content: [
      {
        type: "callout",
        variant: "red",
        html: `<strong>Golden Rule #1:</strong> Every formula in Excel starts with an <mark>equals sign (=)</mark>. No equals sign = Excel treats it as plain text, not a calculation. <code>=A1+B1</code> calculates. <code>A1+B1</code> is just text sitting in a cell doing nothing.`,
      },
      {
        type: "text",
        html: `A <strong>formula</strong> is a calculation you write yourself (like <code>=A1+B1</code>). A <strong>function</strong> is a pre-built shortcut for common calculations (like <code>=SUM(A1:A10)</code>). Functions save you from typing long formulas manually.`,
      },
      {
        type: "table",
        headers: ["Function", "What It Does", "Example", "Result"],
        rows: [
          { cells: ["<strong>SUM</strong>", "Adds up a range of numbers", "<code>=SUM(A1:A5)</code>", "Total of cells A1 through A5"] },
          { cells: ["<strong>AVERAGE</strong>", "Calculates the mean (average)", "<code>=AVERAGE(B1:B10)</code>", "Average of B1 to B10"] },
          { cells: ["<strong>COUNT</strong>", "Counts how many cells have numbers", "<code>=COUNT(A1:A20)</code>", "Number of cells with numeric data"] },
          { cells: ["<strong>MAX</strong>", "Finds the largest number", "<code>=MAX(C1:C50)</code>", "Highest value in the range"] },
          { cells: ["<strong>MIN</strong>", "Finds the smallest number", "<code>=MIN(C1:C50)</code>", "Lowest value in the range"] },
          { cells: ["<strong>IF</strong>", "Tests a condition, returns different values", "<code>=IF(A1>=50,\"Pass\",\"Fail\")</code>", "\"Pass\" if A1\u226550, else \"Fail\""] },
        ],
      },
      {
        type: "analogy",
        label: "\ud83e\uddd1\u200d\ud83c\udfeb The IF Function = A Strict Teacher",
        html: `The IF function works like a teacher checking marks: <strong>"Is this student's mark 50 or above? If YES, write Pass. If NO, write Fail."</strong> The formula <code>=IF(A1>=50,"Pass","Fail")</code> does exactly that. Three parts: the <mark>test</mark> (A1>=50), the <mark>value if true</mark> ("Pass"), and the <mark>value if false</mark> ("Fail").`,
      },
      {
        type: "image",
        description: "Excel sheet showing: Column A (Student names), Column B (Marks), Column C with =IF(B2>=50,\"Pass\",\"Fail\") formula and results — labelled",
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>The colon (:) means "through".</strong> <code>A1:A10</code> means "A1 through A10" \u2014 all 10 cells. It's called a <mark>range</mark>. You'll use ranges in every single function. <code>=SUM(A1:A10)</code> = add everything from A1 through A10.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\u2795",
            title: "Basic Operators",
            description: "Add (+), Subtract (-), Multiply (*), Divide (/). Example: =A1*B1 multiplies A1 by B1.",
            tag: "+ \u2212 * /",
          },
          {
            icon: "\ud83d\udcc0",
            title: "Cell References",
            description: "Use cell addresses instead of numbers. =A1+A2 is better than =5+3 because if A1 changes, the formula auto-updates.",
            tag: "Always use references!",
          },
        ],
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "Microsoft Excel \u2014 Charts, Sorting & Filtering",
    time: "~5 mins",
    badges: [],
    hook: `A spreadsheet full of 500 numbers is overwhelming. But turn those numbers into a colourful bar chart? <strong>Suddenly everyone understands.</strong> Charts turn boring data into visual stories. Sorting and filtering help you find exactly what you need in seconds. These three skills make you an Excel power user.`,
    content: [
      {
        type: "text",
        html: `Charts (also called <mark>graphs</mark>) are visual representations of data. Instead of reading rows of numbers, you see patterns, trends, and comparisons instantly. Excel can create charts from your data in just a few clicks.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcca",
            title: "Bar / Column Chart",
            description: "Compares different categories side by side. Best for: 'Which month had the most sales?' or 'Compare student marks'.",
            tag: "Comparing items",
          },
          {
            icon: "\ud83d\udcc8",
            title: "Line Chart",
            description: "Shows trends over time. Best for: 'How did temperature change over 12 months?' or 'Sales growth over years'.",
            tag: "Trends over time",
          },
          {
            icon: "\ud83e\udd67",
            title: "Pie Chart",
            description: "Shows parts of a whole (percentages). Best for: 'What percentage of students chose each subject?'",
            tag: "Parts of a whole",
          },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Select Your Data",
            description: "Click and drag to highlight the data you want to chart \u2014 including the column headers. The headers become labels on your chart.",
          },
          {
            title: "Insert a Chart",
            description: "Insert tab \u2192 Choose chart type (Column, Line, Pie, etc.). Excel creates the chart instantly. Click it to move or resize.",
          },
          {
            title: "Customise",
            description: "Click the chart \u2192 Use Chart Design tab to change colours, layout, and style. Add a title, data labels, and legend.",
          },
        ],
      },
      {
        type: "image",
        description: "Three charts side by side: Bar chart (comparing sales), Line chart (trend over months), Pie chart (percentage breakdown) — each labelled with best use case",
      },
      {
        type: "table",
        headers: ["Feature", "What It Does", "How to Use"],
        rows: [
          { cells: ["<strong>Sort (A\u2192Z)</strong>", "Arranges data in alphabetical or numerical order", "Select column \u2192 Data tab \u2192 Sort A to Z (or Z to A)"] },
          { cells: ["<strong>Sort (Smallest\u2192Largest)</strong>", "Puts numbers from lowest to highest", "Select column \u2192 Data tab \u2192 Sort Smallest to Largest"] },
          { cells: ["<strong>Filter</strong>", "Shows only rows that match your criteria, hides the rest", "Data tab \u2192 Filter \u2192 Click dropdown arrow on column header"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Sort vs Filter:</strong> Sorting <em>rearranges</em> your data (like alphabetising a list). Filtering <em>hides</em> rows that don't match (like wearing sunglasses that only let you see red cars). The hidden data isn't deleted \u2014 just temporarily invisible. Remove the filter and everything comes back.`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "Microsoft PowerPoint \u2014 Basics",
    time: "~5 mins",
    badges: [],
    hook: `You've got 5 minutes to present your idea to the class. Do you read a 10-page essay out loud? <strong>No.</strong> You create a slideshow with key points, images, and maybe a chart. That's PowerPoint — <strong>the world's go-to tool for presentations.</strong> Let's build your first one.`,
    content: [
      {
        type: "text",
        html: `Microsoft PowerPoint is a <mark>presentation application</mark> — software designed for creating visual slideshows. Each page is called a <strong>slide</strong>. A complete set of slides is called a <strong>presentation</strong> or <strong>slide deck</strong>. You present it by going into <strong>Slideshow Mode</strong> (F5).`,
      },
      {
        type: "image",
        description: "PowerPoint interface: Slide panel (left thumbnails), Main editing area (centre), Notes section (bottom), Ribbon (top) — all labelled",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\uddbc\ufe0f",
            title: "Slide",
            description: "A single page in your presentation. Each slide shows one idea or point. Keep slides simple and visual!",
            tag: "One idea per slide",
          },
          {
            icon: "\ud83c\udfa8",
            title: "Theme",
            description: "A pre-designed look (colours, fonts, backgrounds) applied to all slides at once. Gives your presentation a professional, consistent appearance.",
            tag: "Design tab \u2192 Themes",
          },
          {
            icon: "\ud83d\udcd0",
            title: "Layout",
            description: "The arrangement of placeholders on a slide. Title Slide, Title + Content, Two Columns, Blank, etc.",
            tag: "Home \u2192 Layout",
          },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Create a New Presentation",
            description: "Open PowerPoint \u2192 Choose 'Blank Presentation' or pick a template. Your first slide (Title Slide) appears automatically.",
          },
          {
            title: "Add Content to Slides",
            description: "Click on text placeholders to type. Use Insert tab to add Images, Shapes, Icons, or Videos. Keep text short \u2014 bullet points, not essays.",
          },
          {
            title: "Add More Slides",
            description: "Home tab \u2192 New Slide (or Ctrl+M). Choose a layout for each new slide. Drag slides in the left panel to reorder them.",
          },
          {
            title: "Apply a Theme",
            description: "Design tab \u2192 Browse Themes. Click one to apply it to ALL slides instantly. Your entire presentation gets a coordinated look.",
          },
          {
            title: "Present!",
            description: "Press F5 to start from slide 1. Press N or click to advance. Press Esc to exit. That's Slideshow Mode.",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>The 6\u00d76 Rule:</strong> No more than <mark>6 bullet points per slide</mark> and no more than <mark>6 words per bullet</mark>. Slides are visual aids, not essays. If you're reading your slides word-for-word, you're doing it wrong. The audience should listen to YOU, not read the screen.`,
      },
      {
        type: "callout",
        html: `<strong>File format:</strong> PowerPoint saves as <mark>.pptx</mark>. To share a version nobody can edit, export as PDF. To include a presentation in your assignment submission, always use .pptx unless told otherwise.`,
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "Microsoft PowerPoint \u2014 Advanced Features",
    time: "~5 mins",
    badges: [],
    hook: `A plain slideshow with bullet points is fine. A slideshow where text flies in, images fade, and slides smoothly morph into each other? <strong>That's a presentation people actually remember.</strong> Transitions, animations, and Presenter View take your slides from "okay" to "wow."`,
    content: [
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udf00",
            title: "Transitions",
            description: "The visual effect when moving FROM one slide TO the next. Fade, Push, Wipe, Morph. Applied to the WHOLE slide.",
            tag: "Between slides",
          },
          {
            icon: "\u2728",
            title: "Animations",
            description: "Effects on INDIVIDUAL elements within a slide. Text can fly in, images can zoom, bullets can appear one by one.",
            tag: "Within a slide",
          },
          {
            icon: "\ud83d\udcfa",
            title: "Presenter View",
            description: "YOU see your notes + next slide on your screen. The AUDIENCE only sees the current slide. Your secret cheat sheet.",
            tag: "Your private view",
          },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u274c Transition vs Animation — Don't confuse them!</strong> <mark>Transition</mark> = the effect BETWEEN two slides (how slide 2 replaces slide 1). <mark>Animation</mark> = an effect on an ELEMENT inside one slide (how a title flies in or a bullet appears). Transition = slide level. Animation = element level.`,
      },
      {
        type: "table",
        headers: ["Feature", "What It Affects", "Tab in PowerPoint", "Example"],
        rows: [
          { cells: ["Transition", "The whole slide (between slides)", "Transitions tab", "Slide 1 fades out, Slide 2 fades in"] },
          { cells: ["Animation", "Individual element on a slide", "Animations tab", "Title flies in from the left"] },
          { cells: ["Presenter View", "What the presenter sees on their screen", "Slide Show tab", "Notes + next slide preview (private)"] },
          { cells: ["Slide Master", "Design template for ALL slides at once", "View tab \u2192 Slide Master", "Change logo on every slide in one click"] },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Add a Transition",
            description: "Click on a slide \u2192 Transitions tab \u2192 Pick an effect (Fade, Push, Morph). Set Duration and click 'Apply To All' if you want the same transition everywhere.",
          },
          {
            title: "Add an Animation",
            description: "Click on an element (text box, image) \u2192 Animations tab \u2192 Pick an effect (Appear, Fly In, Fade, Zoom). Use Animation Pane to control the order and timing.",
          },
          {
            title: "Use Presenter View",
            description: "Slide Show tab \u2192 Check 'Use Presenter View'. When presenting on a projector, your laptop shows notes + next slide while the audience sees only the current slide.",
          },
        ],
      },
      {
        type: "analogy",
        label: "\ud83c\udfac Movie Analogy",
        html: `Think of your presentation as a movie. <strong>Transitions</strong> are the scene changes \u2014 how one scene ends and the next begins (fade to black, cut, dissolve). <strong>Animations</strong> are the special effects within a scene \u2014 a character entering, text appearing on screen, an explosion. Both make the movie more engaging, but too many make it look ridiculous.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Pro tip:</strong> Use animations and transitions sparingly. One consistent transition (like Fade) for all slides looks professional. Random bouncing text on every slide looks like a 2005 school project. <mark>Less is more.</mark>`,
      },
    ],
  },

  // ─── Topic 9 ───
  {
    id: 9,
    title: "File Management & Cloud Storage",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You've created Word documents, Excel spreadsheets, and PowerPoint presentations. Now where do they all live? If your desktop looks like a digital junkyard with 200 unnamed files — <strong>you need file management.</strong> And if your laptop dies tomorrow, will you lose everything? <strong>Cloud storage is your safety net.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>File management</strong> means organising your digital files into a logical structure of <mark>folders</mark> (also called directories) so you can find anything in seconds. Think of it like a filing cabinet \u2014 each drawer is a folder, each document goes in the right drawer.`,
      },
      {
        type: "image",
        description: "Folder tree structure: My Documents > School (with subfolders: IFP105, Maths, English) > Work > Personal — each with sample files inside",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcc1",
            title: "Folders",
            description: "Containers for organising files. Create folders by subject, project, or date. Use subfolders for deeper organisation.",
            tag: "Right-click \u2192 New Folder",
          },
          {
            icon: "\ud83d\udcc4",
            title: "File Types",
            description: "The extension tells you the file type. .docx = Word, .xlsx = Excel, .pptx = PowerPoint, .pdf = PDF, .jpg = Image.",
            tag: "Extension = identity",
          },
          {
            icon: "\u2601\ufe0f",
            title: "Cloud Storage",
            description: "Files stored on internet servers. Access from any device, anywhere. Auto-backup means nothing is ever truly lost.",
            tag: "OneDrive \u00b7 Google Drive",
          },
        ],
      },
      {
        type: "table",
        headers: ["File Extension", "Application", "Type of File"],
        rows: [
          { cells: [".docx", "Microsoft Word", "Text document"] },
          { cells: [".xlsx", "Microsoft Excel", "Spreadsheet"] },
          { cells: [".pptx", "Microsoft PowerPoint", "Presentation"] },
          { cells: [".pdf", "Adobe Reader / any browser", "Portable Document (read-only)"] },
          { cells: [".jpg / .png", "Image viewer", "Image / photo"] },
          { cells: [".mp4", "Media player", "Video file"] },
          { cells: [".txt", "Notepad", "Plain text (no formatting)"] },
        ],
      },
      {
        type: "analogy",
        label: "\u2601\ufe0f Cloud = Your Invisible Backup Cupboard",
        html: `Imagine you have a magical cupboard that: (1) lives somewhere safe that fire can't reach, (2) you can open from any room in the world, and (3) automatically copies everything you put in it. That's <strong>cloud storage</strong>. Google Drive, OneDrive, and iCloud are all cloud services. Your files live on powerful servers in data centres — not on your fragile laptop.`,
      },
      {
        type: "table",
        headers: ["Feature", "Local Storage (USB/HDD)", "Cloud Storage"],
        rows: [
          { cells: ["Access from anywhere?", "\u274c Only with the physical device", "\u2705 Any device with internet"] },
          { cells: ["Risk of loss?", "\u26a0\ufe0f Can break, get lost, or be stolen", "\u2705 Backed up on multiple servers"] },
          { cells: ["Needs internet?", "\u2705 Works offline", "\u274c Needs internet (some offline sync)"] },
          { cells: ["Sharing files?", "\u274c Must physically hand over device", "\u2705 Share a link instantly"] },
          { cells: ["Free storage?", "N/A (you buy the device)", "5\u201315 GB free (then pay for more)"] },
        ],
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>Best practice:</strong> Use the <mark>3-2-1 Backup Rule</mark>. Keep <strong>3 copies</strong> of important files, on <strong>2 different types</strong> of storage (e.g. laptop + cloud), with <strong>1 copy offsite</strong> (cloud). If your laptop breaks, you still have your assignments safe in the cloud.`,
      },
    ],
  },
];
