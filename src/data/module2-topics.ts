import type { Topic } from "./module1-topics";

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "Editing vs Word Processing — What's the Difference?",
    time: "~4 mins",
    badges: [{ text: "Foundation", type: "star" }],
    hook: `You've been using Notepad and Word your whole life. But here's a question most people get wrong on exams: <strong>Are they the same thing?</strong> Nope. Not even close. One is a blank wall. The other is an interior designer's dream studio.`,
    content: [
      {
        type: "text",
        html: `Before fancy software existed, "editing" just meant <mark>typing and changing text</mark> — nothing more. Word processing added superpowers on top: formatting, images, tables, spell-check, headers, footers, and print layouts. Let's break it down.`,
      },
      {
        type: "analogy",
        label: "\u270f\ufe0f Pencil vs Art Studio",
        html: `<strong>A text editor is a pencil.</strong> You can write. You can erase. That's it. No colors, no stickers, no fancy borders.<br/><br/><strong>A word processor is an entire art studio.</strong> You still write — but now you have colors, fonts, rulers, stickers (images), tables, templates, and a printer-ready layout. Same paper, wildly different tools.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcdd",
            title: "Text Editor (Editing)",
            description: "Plain text only. No formatting, no images, no tables. Just raw characters. Examples: Notepad, nano, vim. Used for code and quick notes.",
            tag: "Simple \u00b7 Plain text only",
            tagColor: "amber",
          },
          {
            icon: "\ud83d\udcc4",
            title: "Word Processor (Word Processing)",
            description: "Full formatting: bold, italic, fonts, colors, images, tables, headers, footers, page numbers, spell-check, print layout. Examples: MS Word, Google Docs.",
            tag: "Powerful \u00b7 Rich formatting",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "table",
        headers: ["Feature", "Text Editor (Notepad)", "Word Processor (MS Word)"],
        rows: [
          { cells: ["Bold / Italic / Underline", "\u274c No", "\u2705 Yes"] },
          { cells: ["Insert Images", "\u274c No", "\u2705 Yes"] },
          { cells: ["Create Tables", "\u274c No", "\u2705 Yes"] },
          { cells: ["Spell Check", "\u274c No", "\u2705 Yes"] },
          { cells: ["Page Layout & Print Preview", "\u274c No", "\u2705 Yes"] },
          { cells: ["Headers & Footers", "\u274c No", "\u2705 Yes"] },
          { cells: ["File Format", ".txt (plain)", ".docx (rich)"] },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u274c Common exam mistake:</strong> Students say "editing and word processing are the same." They are NOT. Editing = basic text changes. Word processing = editing PLUS formatting, layout, images, tables, spell-check, and everything else. Word processing <em>includes</em> editing, but editing alone is NOT word processing.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why does this matter?</strong> When your professor asks you to submit a "word-processed document," they want formatted text with proper headings, spacing, and layout — NOT a plain .txt file from Notepad!`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "MS Word — Text Editing & Formatting",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Microsoft Word is the most used word processor on the planet. Your assignments, resumes, letters, reports — they all live here. But most people only use 10% of what Word can do. <strong>Let's unlock the other 90%.</strong>`,
    content: [
      {
        type: "text",
        html: `MS Word has a <mark>Ribbon interface</mark> — that strip of icons at the top organized into tabs like Home, Insert, Layout, etc. The Home tab is where 80% of your formatting lives.`,
      },
      {
        type: "image",
        description: "MS Word Ribbon interface showing Home tab with Font group, Paragraph group, and Styles group highlighted",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udd71\ufe0f",
            title: "Font Formatting",
            description: "Change font name (Arial, Times New Roman), size (12pt, 14pt), color, Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U).",
            tag: "Home \u2192 Font group",
          },
          {
            icon: "\u2261",
            title: "Paragraph Formatting",
            description: "Alignment (Left, Center, Right, Justify), Line spacing (1.0, 1.5, 2.0), Bullets, Numbering, Indentation.",
            tag: "Home \u2192 Paragraph group",
          },
          {
            icon: "\ud83c\udfa8",
            title: "Styles",
            description: "Pre-built formatting combos: Heading 1, Heading 2, Title, Subtitle. One click = consistent look across the whole document.",
            tag: "Home \u2192 Styles group",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>The 4 types of text alignment — know them cold:</strong>`,
      },
      {
        type: "table",
        headers: ["Alignment", "Shortcut", "What It Does", "Used For"],
        rows: [
          { cells: ["Left Align", "Ctrl + L", "Text starts from the left edge", "Body text, paragraphs (default)"] },
          { cells: ["Center Align", "Ctrl + E", "Text sits in the middle", "Titles, headings, invitations"] },
          { cells: ["Right Align", "Ctrl + R", "Text pushed to the right edge", "Dates, page numbers"] },
          { cells: ["Justify", "Ctrl + J", "Text stretches to fill both edges evenly", "Formal reports, newspapers, books"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Keyboard shortcuts that save your life:</strong> Ctrl+B = Bold \u00b7 Ctrl+I = Italic \u00b7 Ctrl+U = Underline \u00b7 Ctrl+S = Save \u00b7 Ctrl+Z = Undo \u00b7 Ctrl+Y = Redo \u00b7 Ctrl+A = Select All \u00b7 Ctrl+C = Copy \u00b7 Ctrl+V = Paste. Memorize these. They work in almost every application.`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Select the text \ud83d\udc46",
            description: "Click and drag, or use Ctrl+A to select everything. You MUST select text before formatting it.",
          },
          {
            title: "Apply formatting \ud83c\udfa8",
            description: "Use the Ribbon or keyboard shortcuts. Bold, change font, adjust size, pick a color — whatever you need.",
          },
          {
            title: "Check your work \ud83d\udc40",
            description: "Use Print Preview (Ctrl+P) to see exactly how it will look on paper before printing.",
          },
        ],
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Pro tip — Format Painter \ud83c\udfa8:</strong> Select formatted text \u2192 Click the Format Painter brush \u2192 Drag across other text. It copies ALL formatting (font, size, color, spacing) instantly. Double-click the brush to paint multiple sections!`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "MS Word — Images & Tables",
    time: "~5 mins",
    badges: [],
    hook: `A wall of text is boring. Nobody wants to read a 10-page document that's just paragraphs. <strong>Images make it visual. Tables make it organized.</strong> These two features turn a boring document into a professional one.`,
    content: [
      {
        type: "text",
        html: `Both images and tables live under the <mark>Insert tab</mark> on the Ribbon. This tab is your go-to for adding anything that isn't plain text.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\uddbc\ufe0f",
            title: "Inserting Images",
            description: "Insert \u2192 Pictures. Choose from your device or online. Resize using corner handles (keeps proportion). Use text wrapping to control how text flows around the image.",
            tag: "Insert tab \u2192 Pictures",
          },
          {
            icon: "\ud83d\udcca",
            title: "Creating Tables",
            description: "Insert \u2192 Table. Choose rows & columns with the grid, or use 'Insert Table' for exact numbers. Click inside any cell to type data.",
            tag: "Insert tab \u2192 Table",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Image Text Wrapping Options — how text behaves around your picture:</strong>`,
      },
      {
        type: "table",
        headers: ["Wrapping Style", "What Happens", "Best For"],
        rows: [
          { cells: ["In Line with Text", "Image sits inside the text like a giant character", "Small icons in a sentence"] },
          { cells: ["Square", "Text wraps around the image in a square box", "Most common \u2014 photos in reports"] },
          { cells: ["Tight", "Text wraps closely around the image shape", "Irregular-shaped images"] },
          { cells: ["Behind Text", "Image sits behind the text like a watermark", "Background images, letterheads"] },
          { cells: ["In Front of Text", "Image floats on top, covering text below", "Overlay effects, logos"] },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Insert a Table \ud83d\udcca",
            description: "Go to Insert \u2192 Table. Select the number of rows and columns you need from the grid (e.g., 3\u00d74 = 3 columns, 4 rows).",
          },
          {
            title: "Enter Your Data \u2328\ufe0f",
            description: "Click inside each cell and type. Use Tab to jump to the next cell. Shift+Tab to go back.",
          },
          {
            title: "Format the Table \ud83c\udfa8",
            description: "Use Table Design tab for borders, shading, and styles. Use Table Layout tab to merge cells, split cells, or adjust row height.",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Merge Cells:</strong> Select multiple cells \u2192 Table Layout \u2192 Merge Cells. This combines them into one big cell. Perfect for table headers that span multiple columns. <strong>Split Cells</strong> does the opposite \u2014 divides one cell into many.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Resize images properly:</strong> ALWAYS drag from the <mark>corner handles</mark>, not the side handles. Corner handles maintain the image's proportions. Side handles stretch and distort. Nobody wants a squished photo in their assignment!`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "MS Excel — Creating Worksheets",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `If Word is for writing, <strong>Excel is for numbers.</strong> Budgets, attendance, marks, invoices, data analysis — anything with numbers and calculations lives in Excel. It's a giant grid, and that grid is more powerful than you think.`,
    content: [
      {
        type: "analogy",
        label: "\ud83d\udcca Grid Paper Analogy",
        html: `Imagine a massive sheet of graph paper — but every tiny square is smart. It can hold text, numbers, dates, or even a formula that calculates itself. That's Excel. <strong>Columns go A, B, C</strong> (left to right). <strong>Rows go 1, 2, 3</strong> (top to bottom). Where they cross = a <strong>Cell</strong>. Cell B3 = column B, row 3.`,
      },
      {
        type: "image",
        description: "Excel spreadsheet showing Column letters (A, B, C), Row numbers (1, 2, 3), a Cell reference (B3 highlighted), and the Name Box showing 'B3'",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udfe9",
            title: "Cell",
            description: "The intersection of a column and row. Each cell has a unique address like A1, B5, C12. This is where you type data.",
            tag: "The basic unit",
          },
          {
            icon: "\u2194\ufe0f",
            title: "Column",
            description: "Vertical strip labeled with letters: A, B, C... Z, AA, AB. Excel has 16,384 columns!",
            tag: "Letters \u2192 A to XFD",
          },
          {
            icon: "\u2195\ufe0f",
            title: "Row",
            description: "Horizontal strip labeled with numbers: 1, 2, 3... Excel has over 1 million rows per sheet!",
            tag: "Numbers \u2192 1 to 1,048,576",
          },
        ],
      },
      {
        type: "table",
        headers: ["Excel Term", "What It Is", "Real-World Analogy"],
        rows: [
          { cells: ["Cell", "One single box (e.g., A1)", "One square on graph paper"] },
          { cells: ["Worksheet (Sheet)", "One full grid of cells \u2014 one tab at the bottom", "One page of graph paper"] },
          { cells: ["Workbook", "The entire Excel file containing multiple sheets", "The whole notebook"] },
          { cells: ["Cell Reference", "The cell's address like B5 or D12", "The seat number in a movie hall"] },
          { cells: ["Range", "A group of cells like A1:A10 or B2:D5", "A block of seats together"] },
          { cells: ["Active Cell", "The cell currently selected (blue border)", "The seat you're sitting in right now"] },
        ],
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>Data types in cells:</strong> A cell can hold <mark>Numbers</mark> (100, 3.14), <mark>Text/Labels</mark> ("Student Name"), <mark>Dates</mark> (09/04/2026), or <mark>Formulas</mark> (=A1+B1). Excel automatically detects the type based on what you enter.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Formatting cells:</strong> Right-click \u2192 Format Cells to change number format (currency, percentage, date), font, alignment, borders, and fill color. Use the Home tab for quick formatting like Bold, Merge & Center, and cell borders.`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "MS Excel — Formulas & Functions",
    time: "~7 mins",
    badges: [{ text: "High yield", type: "star" }, { text: "Most tested", type: "hot" }],
    hook: `This is <strong>the</strong> reason Excel exists. You don't open Excel to type text — you open it to <em>calculate</em>. Formulas turn Excel from a fancy table into a supercharged calculator that updates itself automatically. <strong>Change one number and everything recalculates instantly.</strong>`,
    content: [
      {
        type: "text",
        html: `Every formula in Excel starts with an <mark>equals sign (=)</mark>. Without it, Excel treats your entry as plain text, not a calculation. Remember: <strong>= is the magic key.</strong>`,
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u274c #1 exam mistake:</strong> Forgetting the = sign. Typing "A1+B1" gives you the text "A1+B1". Typing "<mark>=A1+B1</mark>" gives you the actual sum. The equals sign tells Excel: "This is a formula, calculate it!"`,
      },
      {
        type: "table",
        headers: ["Operator", "Meaning", "Example", "Result (if A1=10, B1=3)"],
        rows: [
          { cells: ["+", "Addition", "=A1+B1", "13"] },
          { cells: ["-", "Subtraction", "=A1-B1", "7"] },
          { cells: ["*", "Multiplication", "=A1*B1", "30"] },
          { cells: ["/", "Division", "=A1/B1", "3.33"] },
          { cells: ["^", "Power (exponent)", "=A1^2", "100"] },
        ],
      },
      {
        type: "text",
        html: `<strong>Built-in Functions — the power tools:</strong> Functions are pre-built formulas. Instead of typing =A1+A2+A3+A4+A5, just use <mark>=SUM(A1:A5)</mark>. Less typing, zero errors.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\u2795",
            title: "SUM",
            description: "Adds all numbers in a range. =SUM(A1:A10) adds cells A1 through A10. The most used function in Excel.",
            tag: "=SUM(range)",
          },
          {
            icon: "\ud83d\udcca",
            title: "AVERAGE",
            description: "Calculates the mean. =AVERAGE(B1:B20) gives the average of 20 values. Perfect for marks and scores.",
            tag: "=AVERAGE(range)",
          },
          {
            icon: "\ud83d\udd22",
            title: "COUNT",
            description: "Counts how many cells contain numbers. =COUNT(A1:A50) tells you how many entries have numeric data.",
            tag: "=COUNT(range)",
          },
          {
            icon: "\u2b06\ufe0f",
            title: "MAX",
            description: "Returns the highest value. =MAX(C1:C100) finds the top score. Great for finding the best mark in a class.",
            tag: "=MAX(range)",
          },
          {
            icon: "\u2b07\ufe0f",
            title: "MIN",
            description: "Returns the lowest value. =MIN(C1:C100) finds the minimum score. Opposite of MAX.",
            tag: "=MIN(range)",
          },
          {
            icon: "\ud83e\udde0",
            title: "IF",
            description: "Makes a decision. =IF(A1>=40,\"Pass\",\"Fail\") checks if A1 is 40 or above. If yes \u2192 \"Pass\". If no \u2192 \"Fail\".",
            tag: "=IF(test, yes, no)",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>IF function structure:</strong> =IF(<em>condition</em>, <em>value_if_true</em>, <em>value_if_false</em>)<br/>Example: =IF(B2>90, "Distinction", "Regular")<br/>Read it as: "If B2 is greater than 90, show Distinction. Otherwise, show Regular."`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Cell References in formulas are dynamic!</strong> If you write =A1+B1 and then change the number in A1, the result updates <em>automatically</em>. This is the whole point. Build the formula once, change data anytime \u2014 Excel recalculates instantly.`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "MS Excel — Data Management",
    time: "~5 mins",
    badges: [],
    hook: `You have a spreadsheet with 500 student records. Your principal asks: "Show me only the students who scored above 80, arranged from highest to lowest." Without sorting and filtering, you'd spend hours. <strong>With Excel? Three clicks.</strong>`,
    content: [
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udd3d",
            title: "Sorting",
            description: "Arranges data in a specific order. A\u2192Z (ascending) or Z\u2192A (descending). Sort numbers low-to-high or high-to-low. Sort names alphabetically.",
            tag: "Data tab \u2192 Sort",
          },
          {
            icon: "\ud83d\udd0d",
            title: "Filtering",
            description: "Hides rows that don't match your criteria. Shows ONLY the data you want to see. The hidden data isn't deleted \u2014 just temporarily invisible.",
            tag: "Data tab \u2192 Filter",
          },
          {
            icon: "\ud83d\udd17",
            title: "Linking Worksheets",
            description: "Pull data from one sheet into another using formulas like =Sheet2!A1. One workbook, multiple connected sheets sharing data.",
            tag: "=SheetName!Cell",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Sorting vs Filtering — they're different:</strong>`,
      },
      {
        type: "table",
        headers: ["Feature", "Sorting", "Filtering"],
        rows: [
          { cells: ["What it does", "Rearranges the order of rows", "Hides rows that don't match"] },
          { cells: ["Data affected", "ALL rows are still visible, just reordered", "Non-matching rows are HIDDEN"] },
          { cells: ["Example", "Sort marks from highest to lowest", "Show only students who scored > 80"] },
          { cells: ["Reversible?", "Sort again in different order", "Remove filter to show all data again"] },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Sort Data \ud83d\udd3d",
            description: "Click any cell in the column you want to sort \u2192 Data tab \u2192 Sort A\u2192Z (ascending) or Z\u2192A (descending). For multi-level sorting, use Data \u2192 Sort and add levels.",
          },
          {
            title: "Filter Data \ud83d\udd0d",
            description: "Click any cell in your data \u2192 Data tab \u2192 Filter. Dropdown arrows appear on headers. Click an arrow and choose which values to show. Uncheck the rest.",
          },
          {
            title: "Link Worksheets \ud83d\udd17",
            description: "In the destination cell, type = then click on the source sheet tab and select the cell you want. Excel writes =Sheet2!B5 automatically. Changes in Sheet2 reflect instantly.",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Linking formula syntax:</strong> <mark>=SheetName!CellReference</mark><br/>Example: =Sheet2!A1 pulls the value from cell A1 on Sheet2 into your current sheet.<br/>Example: =Summary!B5 pulls cell B5 from a sheet named "Summary".<br/>If the sheet name has spaces, use single quotes: ='My Data'!C3`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why link worksheets?</strong> Imagine one sheet tracks "January Sales" and another tracks "February Sales." A third "Summary" sheet can pull totals from both using linking formulas. Change January data \u2192 Summary updates automatically. No manual copying!`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "MS PowerPoint — Creating Presentations",
    time: "~5 mins",
    badges: [],
    hook: `Word is for reading. Excel is for calculating. <strong>PowerPoint is for presenting.</strong> Every class project, business pitch, and conference talk uses slides. The difference between a boring presentation and a great one? Knowing how to use layouts, themes, and content the right way.`,
    content: [
      {
        type: "analogy",
        label: "\ud83c\udfa5 Movie Analogy",
        html: `A PowerPoint presentation is like a short movie. Each <strong>slide is a scene</strong>. The <strong>theme is the visual style</strong> — colors, fonts, background (like a movie's color grading). <strong>Slide layouts</strong> are templates for each scene \u2014 where the title goes, where images go. You're the director.`,
      },
      {
        type: "image",
        description: "PowerPoint interface showing Slide panel (left), Main editing area (center), Notes section (bottom), and Ribbon with Home/Insert/Design tabs",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcbb",
            title: "Slides",
            description: "Individual pages of your presentation. Each slide holds text, images, charts, or videos. Add new slides with Ctrl+M or Home \u2192 New Slide.",
            tag: "Building blocks",
          },
          {
            icon: "\ud83c\udfa8",
            title: "Themes",
            description: "Pre-designed visual styles. One click changes ALL slides' colors, fonts, and backgrounds. Design tab \u2192 Themes.",
            tag: "Design tab \u2192 Themes",
          },
          {
            icon: "\ud83d\udccf",
            title: "Slide Layouts",
            description: "Pre-arranged content placeholders. Title Slide, Title + Content, Two Content, Blank, etc. Home \u2192 Layout to change.",
            tag: "Home \u2192 Layout",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Common Slide Layouts you need to know:</strong>`,
      },
      {
        type: "table",
        headers: ["Layout Name", "What It Contains", "Best Used For"],
        rows: [
          { cells: ["Title Slide", "Large title + subtitle centered", "First slide of any presentation"] },
          { cells: ["Title and Content", "Title at top + one content area below", "Most slides \u2014 text, bullets, images"] },
          { cells: ["Two Content", "Title + two side-by-side content areas", "Comparisons, before/after"] },
          { cells: ["Section Header", "Large text centered on slide", "Dividing sections of a long presentation"] },
          { cells: ["Blank", "Nothing \u2014 completely empty canvas", "Custom layouts, full-screen images"] },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Choose a Theme \ud83c\udfa8",
            description: "Design tab \u2192 pick a Theme. This sets your visual style. You can also choose Variants for color tweaks.",
          },
          {
            title: "Add Slides with Layouts \ud83d\udcbb",
            description: "Home \u2192 New Slide dropdown \u2192 pick a layout. Use Title Slide for slide 1, then Title and Content for most others.",
          },
          {
            title: "Add Content \u270d\ufe0f",
            description: "Click placeholders to type text. Use Insert tab for images, shapes, charts, and videos. Keep text minimal \u2014 slides are visual aids, not documents.",
          },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>The #1 PowerPoint mistake:</strong> Putting entire paragraphs on slides. Slides are for <mark>key points and visuals only</mark>. If your audience is reading your slides, they're not listening to you. Rule of thumb: maximum 6 lines per slide, maximum 6 words per line.`,
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "MS PowerPoint — Master Slides & Slide Shows",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You have a 30-slide presentation and your boss says "Change the logo on every slide." Without Master Slides, that's 30 manual edits. With Master Slides? <strong>One change. All 30 slides update instantly.</strong> That's the power of the Slide Master.`,
    content: [
      {
        type: "analogy",
        label: "\ud83c\udfe0 Blueprint Analogy",
        html: `A <strong>Slide Master is the blueprint</strong> for every room (slide) in a building (presentation). If you change the blueprint — say, add a company logo to the corner — every room built from that blueprint gets the logo automatically. You don't go room by room. One change at the master level = every slide changes.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcdc",
            title: "Slide Master",
            description: "The master template that controls the look of ALL slides. Change fonts, backgrounds, logos, or footers here once — it applies everywhere. View tab \u2192 Slide Master.",
            tag: "View \u2192 Slide Master",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udccf",
            title: "Layout Masters",
            description: "Each Slide Master has multiple layout masters under it (Title, Content, Two Content, etc.). You can customize each layout individually while keeping the master's global style.",
            tag: "Under the Slide Master",
            tagColor: "green",
          },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Open Slide Master View \ud83d\udcdc",
            description: "View tab \u2192 Slide Master. The top slide in the left panel is the Master. Slides below it are Layout Masters.",
          },
          {
            title: "Make Global Changes \ud83c\udf0d",
            description: "Edit the top Master Slide to change fonts, add a logo, change background color, or add footer text that appears on EVERY slide.",
          },
          {
            title: "Close Master View \u2705",
            description: "Click 'Close Master View' on the Ribbon. All your slides now reflect the changes instantly.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Presenting your slides — Slide Show features:</strong>`,
      },
      {
        type: "table",
        headers: ["Feature", "What It Does", "Where to Find It"],
        rows: [
          { cells: ["Transitions", "Animations BETWEEN slides (fade, wipe, push)", "Transitions tab"] },
          { cells: ["Animations", "Animations of OBJECTS on a slide (appear, fly in, bounce)", "Animations tab"] },
          { cells: ["Slide Show \u2014 From Beginning", "Starts the presentation from slide 1", "F5 or Slide Show tab"] },
          { cells: ["Slide Show \u2014 From Current", "Starts from the slide you're on right now", "Shift+F5"] },
          { cells: ["Presenter View", "Shows notes and next slide to YOU while audience sees only the current slide", "Slide Show tab \u2192 Presenter View"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Transitions vs Animations — don't confuse them!</strong><br/><mark>Transitions</mark> = how one slide changes to the next (fade, dissolve, wipe).<br/><mark>Animations</mark> = how objects (text boxes, images) appear/move WITHIN a single slide (fly in, bounce, fade in).`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Presenter View is a secret weapon.</strong> You see your notes, upcoming slides, and a timer. The audience only sees the current slide. Perfect for remembering key points without reading from the slide. Enable it from Slide Show tab before presenting.`,
      },
    ],
  },

  // ─── Topic 9 ───
  {
    id: 9,
    title: "Putting It All Together — Which Tool When?",
    time: "~4 mins",
    badges: [{ text: "Exam scenarios", type: "hot" }],
    hook: `You now know Word, Excel, and PowerPoint. But the real exam question is: <strong>"Which application would you use for ___?"</strong> Getting this wrong is the easiest way to lose marks. Let's make sure you never pick the wrong tool.`,
    content: [
      {
        type: "analogy",
        label: "\ud83e\uddf0 Toolbox Analogy",
        html: `A carpenter doesn't use a hammer for everything. Nails need a hammer, screws need a screwdriver, measurements need a tape. Same idea: <strong>Word = documents</strong> (writing), <strong>Excel = data & calculations</strong> (numbers), <strong>PowerPoint = presentations</strong> (presenting to an audience). Using the wrong tool = messy results and lost marks.`,
      },
      {
        type: "table",
        headers: ["Scenario", "Best Tool", "Why"],
        rows: [
          { cells: ["Writing a college assignment", "MS Word", "Rich text formatting, headings, images, page layout"] },
          { cells: ["Creating a monthly budget", "MS Excel", "Numbers, formulas, auto-calculations, charts"] },
          { cells: ["Presenting a project to the class", "MS PowerPoint", "Visual slides, animations, speaker notes"] },
          { cells: ["Maintaining student attendance records", "MS Excel", "Tabular data, sorting, filtering, formulas"] },
          { cells: ["Writing a formal letter to a company", "MS Word", "Formatted text, letterhead layout, print-ready"] },
          { cells: ["Analyzing exam results for 200 students", "MS Excel", "SUM, AVERAGE, IF, sorting, filtering, charts"] },
          { cells: ["Company product pitch to investors", "MS PowerPoint", "Visual impact, slides, animations, presenting live"] },
          { cells: ["Creating a resume / CV", "MS Word", "Formatted document, layout, fonts, print/PDF export"] },
        ],
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcdd",
            title: "Use MS Word When...",
            description: "You need to WRITE something: essays, letters, reports, resumes, assignments. Anything that will be read as a document.",
            tag: "Writing \u00b7 Documents \u00b7 Print",
          },
          {
            icon: "\ud83d\udcca",
            title: "Use MS Excel When...",
            description: "You need to CALCULATE or ORGANIZE data: budgets, marks, invoices, attendance, any data with numbers, sorting, or formulas.",
            tag: "Numbers \u00b7 Formulas \u00b7 Data",
          },
          {
            icon: "\ud83d\udcfd\ufe0f",
            title: "Use MS PowerPoint When...",
            description: "You need to PRESENT to an audience: class projects, business pitches, training sessions. Visual slides, not documents.",
            tag: "Presenting \u00b7 Slides \u00b7 Visual",
          },
        ],
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>The golden decision rule:</strong><br/>\ud83d\udcdd Writing a document to be read? \u2192 <strong>Word</strong><br/>\ud83d\udcca Working with numbers, data, or formulas? \u2192 <strong>Excel</strong><br/>\ud83d\udcfd\ufe0f Presenting to an audience live? \u2192 <strong>PowerPoint</strong><br/>Ask yourself: "Is this for reading, calculating, or presenting?" and you'll never pick wrong.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>They work together!</strong> You can embed an Excel chart into a Word report. You can paste a Word outline into PowerPoint slides. You can link Excel data to PowerPoint charts. These tools are a team — each handles what it does best.`,
      },
    ],
  },
];
