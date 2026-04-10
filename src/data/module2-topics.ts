import type { Topic } from "./module1-topics";

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "Editing vs Word Processing",
    time: "~3 mins",
    badges: [{ text: "Foundation", type: "star" }],
    hook: `Think about Notepad on your computer. Now think about Microsoft Word. They both let you type, right? <strong>But are they the same thing? Nope! One is a bicycle, the other is a sports car.</strong> Let's find out the difference.`,
    content: [
      {
        type: "image",
        src: "/images/m2/word-formatting.webp",
        description: "Text Editor (plain text) vs Word Processor (formatted document) side-by-side comparison",
      },
      {
        type: "text",
        html: `"Editing" means you can type words and delete words. That's it. <mark>Word processing</mark> means you can also make text bold, add pictures, create tables, check spelling, and make your document look amazing.`,
      },
      {
        type: "analogy",
        label: "Pencil vs Art Studio",
        html: `<strong>A text editor is like a pencil.</strong> You can write and erase. Nothing else.<br/><br/><strong>A word processor is like an entire art studio.</strong> You still write, but now you have colours, stickers, rulers, fancy fonts, and a way to print everything beautifully.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\u270f\ufe0f",
            title: "Text Editor (Notepad)",
            description: "Plain text only. No bold, no pictures, no colours. Just letters on a screen. Good for quick notes or writing code.",
            tag: "Simple \u00b7 .txt files",
            tagColor: "amber",
          },
          {
            icon: "\ud83d\udcc4",
            title: "Word Processor (MS Word)",
            description: "Bold, italic, fonts, colours, images, tables, spell-check, page numbers, headers, footers, and print layouts. The full package!",
            tag: "Powerful \u00b7 .docx files",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "table",
        headers: ["Can you...", "Notepad (Editor)", "MS Word (Word Processor)"],
        rows: [
          { cells: ["Make text Bold or Italic?", "\u274c No", "\u2705 Yes"] },
          { cells: ["Add pictures?", "\u274c No", "\u2705 Yes"] },
          { cells: ["Create tables?", "\u274c No", "\u2705 Yes"] },
          { cells: ["Check spelling?", "\u274c No", "\u2705 Yes"] },
          { cells: ["See how it looks when printed?", "\u274c No", "\u2705 Yes"] },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>Common exam mistake:</strong> Students write "editing and word processing are the same thing." They are NOT. Word processing <em>includes</em> editing, but editing alone is NOT word processing. It's like saying "walking" and "running" are the same \u2014 running includes walking, but walking is not running!`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Exam tip:</strong> If a question says "submit a word-processed document," your teacher wants a formatted .docx file from Word \u2014 NOT a plain .txt file from Notepad!`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "MS Word \u2014 Text Editing & Formatting",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Microsoft Word is where your homework, essays, and assignments come to life. But most people only know how to type in it. <strong>Let's learn how to make your documents look professional in just a few clicks!</strong>`,
    content: [
      {
        type: "text",
        html: `When you open Word, you see a bar of buttons at the top called the <mark>Ribbon</mark>. It has tabs like Home, Insert, and Layout. The Home tab is where most of the magic happens.`,
      },
      {
        type: "image",
        src: "/images/m2/word-ribbon.webp",
        description: "MS Word Ribbon interface showing Home tab with Font group, Paragraph group, and Styles group highlighted",
      },
      {
        type: "text",
        html: `<strong>Here's the golden rule of formatting:</strong> You must SELECT the text first, THEN apply formatting. If you don't select anything, nothing will change!`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Select Your Text",
            description: "Click and drag your mouse over the words you want to format. They will turn blue (highlighted). You can also press Ctrl+A to select everything.",
          },
          {
            title: "Step 2: Make It Bold, Italic, or Underlined",
            description: "Press Ctrl+B for Bold, Ctrl+I for Italic, or Ctrl+U for Underline. The letter IS the hint! B = Bold, I = Italic, U = Underline.",
          },
          {
            title: "Step 3: Change the Font or Size",
            description: "Use the font dropdown on the Home tab to pick a font (like Arial or Times New Roman). Use the size dropdown to make text bigger or smaller (12 is normal, 14 is a heading).",
          },
          {
            title: "Step 4: Check with Print Preview",
            description: "Press Ctrl+P to see exactly how your document will look on paper before you print it.",
          },
        ],
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udd71\ufe0f",
            title: "Font Formatting",
            description: "Change the font name, size, colour, or make it bold/italic/underlined. All in the Home tab, Font group.",
            tag: "Home \u2192 Font group",
          },
          {
            icon: "\u2261",
            title: "Paragraph Formatting",
            description: "Change alignment (left, centre, right), add bullet points, change line spacing. Home tab, Paragraph group.",
            tag: "Home \u2192 Paragraph group",
          },
          {
            icon: "\ud83c\udfa8",
            title: "Styles",
            description: "One-click formatting combos like 'Heading 1' or 'Title'. Makes your whole document look consistent without doing each thing manually.",
            tag: "Home \u2192 Styles group",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>The 4 alignments \u2014 where does your text sit on the page?</strong>`,
      },
      {
        type: "table",
        headers: ["Alignment", "Shortcut", "What It Looks Like", "When to Use It"],
        rows: [
          { cells: ["Left", "Ctrl + L", "Text starts from the left side", "Normal paragraphs (this is the default)"] },
          { cells: ["Centre", "Ctrl + E", "Text sits in the middle", "Titles, headings, invitations"] },
          { cells: ["Right", "Ctrl + R", "Text pushed to the right side", "Dates, page numbers"] },
          { cells: ["Justify", "Ctrl + J", "Text stretches to fill both sides evenly", "Formal reports, newspapers"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Memory trick for shortcuts:</strong> Ctrl+B = <strong>B</strong> for Bold \u00b7 Ctrl+I = <strong>I</strong> for Italic \u00b7 Ctrl+U = <strong>U</strong> for Underline \u00b7 Ctrl+S = <strong>S</strong> for Save \u00b7 Ctrl+Z = Undo (think "Z for Zap away mistakes!") \u00b7 Ctrl+C = Copy \u00b7 Ctrl+V = Paste (V looks like a down arrow \u2014 "paste it down!"). These work in almost EVERY app!`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Exam tip \u2014 Format Painter:</strong> Want to copy formatting from one place to another? Select the formatted text \u2192 click the paintbrush icon on the Home tab \u2192 drag across the text you want to format. Done! It copies all the formatting instantly.`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "MS Word \u2014 Images & Tables",
    time: "~5 mins",
    badges: [],
    hook: `Nobody wants to read a 5-page wall of text. Imagine a school project that's JUST paragraphs \u2014 boring! <strong>Pictures make it visual. Tables make it organised.</strong> Here's how to add both.`,
    content: [
      {
        type: "text",
        html: `Both images and tables are added from the <mark>Insert tab</mark> on the Ribbon. Think of the Insert tab as your "add stuff" button.`,
      },
      {
        type: "text",
        html: `<strong>Adding a Picture to Your Document:</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Click the Insert Tab",
            description: "Go to the Insert tab at the top of the screen. You'll see buttons for Pictures, Table, Shapes, and more.",
          },
          {
            title: "Step 2: Click Pictures",
            description: "Choose 'This Device' to pick a photo from your computer, or 'Online Pictures' to search the internet.",
          },
          {
            title: "Step 3: Resize from the CORNERS",
            description: "Drag the corner handles to make the image bigger or smaller. NEVER drag from the sides \u2014 that squishes and stretches the picture!",
          },
          {
            title: "Step 4: Set Text Wrapping",
            description: "Click the image, then the small layout button that appears. Choose 'Square' so text wraps neatly around your picture. This is the most common option.",
          },
        ],
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\u25fb\ufe0f",
            title: "Square Wrapping",
            description: "Text wraps around the image in a neat box shape. Best for most school projects and reports.",
            tag: "Most common choice",
          },
          {
            icon: "\ud83d\uddbc\ufe0f",
            title: "Behind Text",
            description: "Image sits behind your words like a watermark or background. Text goes right over it.",
            tag: "For backgrounds",
          },
          {
            icon: "\ud83d\udcc4",
            title: "In Line with Text",
            description: "Image acts like a giant letter sitting inside your paragraph. Moves with the text around it.",
            tag: "For small icons",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Adding a Table to Your Document:</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Insert \u2192 Table",
            description: "Go to Insert tab \u2192 click Table. A grid appears. Hover over it to choose how many columns and rows you want (for example, 3 across and 4 down).",
          },
          {
            title: "Step 2: Type in Each Cell",
            description: "Click inside a cell (box) and type. Press the Tab key to jump to the next cell. Press Shift+Tab to go back.",
          },
          {
            title: "Step 3: Make It Look Good",
            description: "Click your table, then use the Table Design tab to add borders, colours, and styles. Use Table Layout tab to merge cells or change row height.",
          },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>Common exam mistake:</strong> Students forget the difference between Merge Cells and Split Cells. <strong>Merge</strong> = join several cells into one big cell (great for table headings). <strong>Split</strong> = divide one cell into smaller cells. They're opposites!`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Exam tip:</strong> Always resize images from the <mark>corner handles</mark> to keep them looking normal. Side handles stretch the image and make it look weird. If a question asks "how to maintain image proportions," the answer is corner handles!`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "MS Excel \u2014 Creating Worksheets",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `If Word is for writing essays, <strong>Excel is for anything with numbers.</strong> Your marks, a monthly budget, attendance records, or a list of scores \u2014 they all belong in Excel. Think of it as a giant calculator notebook!`,
    content: [
      {
        type: "analogy",
        label: "Giant Calculator Notebook",
        html: `Imagine a huge sheet of graph paper, but each little box is super smart. It can hold a number, a word, a date, or even a formula that calculates things for you. That's Excel! <strong>Columns go left-to-right: A, B, C.</strong> <strong>Rows go top-to-bottom: 1, 2, 3.</strong> Where a column and row meet, that's called a <strong>Cell</strong>. Cell B3 means column B, row 3.`,
      },
      {
        type: "image",
        src: "/images/m2/excel-grid.webp",
        description: "Excel spreadsheet showing Column letters (A, B, C), Row numbers (1, 2, 3), a Cell highlighted at B3, and the Name Box showing 'B3'",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udfe9",
            title: "Cell",
            description: "One single box where you type something. Every cell has an address like A1, B5, or C12 \u2014 like a seat number in a cinema.",
            tag: "The basic building block",
          },
          {
            icon: "\ud83d\udcca",
            title: "Worksheet (Sheet)",
            description: "One full page of cells. You can see sheet tabs at the bottom of the screen. Think of it like one page in a notebook.",
            tag: "One tab = one sheet",
          },
          {
            icon: "\ud83d\udcd3",
            title: "Workbook",
            description: "The entire Excel file. It can contain many sheets inside it. Think of it like the whole notebook containing many pages.",
            tag: "The whole file",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Key terms you need to know:</strong>`,
      },
      {
        type: "table",
        headers: ["Term", "What It Means", "Example"],
        rows: [
          { cells: ["Cell Reference", "The address of a cell", "B5, D12, A1"] },
          { cells: ["Range", "A group of cells together", "A1:A10 (cells A1 through A10)"] },
          { cells: ["Active Cell", "The cell you've clicked on right now (has a blue border)", "Whatever cell is selected"] },
          { cells: ["Column", "A vertical strip labelled with letters", "Column A, Column B, Column C"] },
          { cells: ["Row", "A horizontal strip labelled with numbers", "Row 1, Row 2, Row 3"] },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Open Excel and Click a Cell",
            description: "Click on any cell to make it the active cell. You'll see its address in the Name Box at the top-left (e.g., A1).",
          },
          {
            title: "Step 2: Type Your Data",
            description: "Just start typing! Press Enter to move down to the next row, or Tab to move right to the next column.",
          },
          {
            title: "Step 3: Format Your Cells",
            description: "Right-click a cell \u2192 Format Cells. You can change the number format (currency, percentage, date), add borders, or change colours.",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Exam tip:</strong> A cell can hold 4 types of data: <mark>Numbers</mark> (100, 3.14), <mark>Text</mark> ("Student Name"), <mark>Dates</mark> (09/04/2026), or <mark>Formulas</mark> (=A1+B1). Excel figures out the type automatically based on what you type.`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "MS Excel \u2014 Formulas & Functions",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }, { text: "Most tested", type: "hot" }],
    hook: `THIS is the reason Excel exists. You don't open Excel just to type numbers in boxes \u2014 you open it to <strong>calculate things automatically.</strong> Change one number and everything updates by itself. That's the superpower!`,
    content: [
      {
        type: "text",
        html: `Every formula starts with an <mark>equals sign (=)</mark>. Without it, Excel thinks you're just typing regular text. The = sign is like saying "Hey Excel, do some maths!"`,
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>The #1 exam mistake EVER:</strong> Forgetting the = sign! If you type A1+B1, Excel shows the text "A1+B1". If you type <mark>=A1+B1</mark>, Excel actually adds the numbers. Always start with =`,
      },
      {
        type: "text",
        html: `<strong>Basic maths operators \u2014 the building blocks:</strong>`,
      },
      {
        type: "table",
        headers: ["Symbol", "What It Does", "Example Formula", "If A1=10 and B1=3, Result ="],
        rows: [
          { cells: ["+", "Adds", "=A1+B1", "13"] },
          { cells: ["-", "Subtracts", "=A1-B1", "7"] },
          { cells: ["*", "Multiplies", "=A1*B1", "30"] },
          { cells: ["/", "Divides", "=A1/B1", "3.33"] },
          { cells: ["^", "Power (exponent)", "=A1^2", "100 (10 squared)"] },
        ],
      },
      {
        type: "text",
        html: `<strong>Built-in Functions \u2014 shortcuts for common maths:</strong> Instead of typing =A1+A2+A3+A4+A5, just type <mark>=SUM(A1:A5)</mark>. Way less typing!`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\u2795",
            title: "SUM",
            description: "Adds up all numbers in a range. =SUM(A1:A10) adds cells A1 through A10 together. The most used function ever!",
            tag: "=SUM(A1:A10)",
          },
          {
            icon: "\ud83d\udcca",
            title: "AVERAGE",
            description: "Finds the average (mean). =AVERAGE(B1:B20) adds them all up and divides by how many there are. Great for class marks!",
            tag: "=AVERAGE(B1:B20)",
          },
          {
            icon: "\ud83d\udd22",
            title: "COUNT",
            description: "Counts how many cells have numbers in them. =COUNT(A1:A50) tells you how many entries exist.",
            tag: "=COUNT(A1:A50)",
          },
          {
            icon: "\u2b06\ufe0f",
            title: "MAX",
            description: "Finds the biggest number. =MAX(C1:C100) finds the highest score in the class. Who got the top mark?",
            tag: "=MAX(range)",
          },
          {
            icon: "\u2b07\ufe0f",
            title: "MIN",
            description: "Finds the smallest number. =MIN(C1:C100) finds the lowest score. Opposite of MAX.",
            tag: "=MIN(range)",
          },
          {
            icon: "\ud83e\udde0",
            title: "IF",
            description: "Makes a decision! =IF(A1>=40,\"Pass\",\"Fail\") checks: is A1 at least 40? If yes, show \"Pass\". If no, show \"Fail\".",
            tag: "=IF(test, yes, no)",
          },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Click the Cell Where You Want the Answer",
            description: "Click on an empty cell where you want the result to appear (for example, C1).",
          },
          {
            title: "Step 2: Type = to Start Your Formula",
            description: "Type the equals sign, then your formula. For example: =SUM(A1:A10) or =B2*C2 or =AVERAGE(D1:D20).",
          },
          {
            title: "Step 3: Press Enter",
            description: "Hit Enter and the answer appears instantly! If you change any of the numbers the formula uses, the answer updates automatically.",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>How to read an IF formula:</strong> =IF(B2>90, "Distinction", "Regular")<br/>Read it like English: "IF the value in B2 is greater than 90, THEN show 'Distinction', OTHERWISE show 'Regular'."<br/>Structure: =IF( <em>question</em> , <em>answer if yes</em> , <em>answer if no</em> )`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Exam tip \u2014 Formulas are ALIVE:</strong> If you write =A1+B1 and later change the number in A1, the answer updates automatically. You build the formula once and it keeps working forever. That's the whole point of Excel!`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "MS Excel \u2014 Data Management",
    time: "~5 mins",
    badges: [],
    hook: `Imagine your school has 500 student records in Excel. Your principal says: "Show me only students who scored above 80, from highest to lowest." Without these tools, you'd spend hours. <strong>With sorting and filtering? Three clicks.</strong>`,
    content: [
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udd3d",
            title: "Sorting",
            description: "Rearranges your data in order. A to Z, Z to A, smallest to biggest, or biggest to smallest. Like arranging books on a shelf!",
            tag: "Data tab \u2192 Sort",
          },
          {
            icon: "\ud83d\udd0d",
            title: "Filtering",
            description: "Hides rows you don't want to see right now. Only shows data that matches what you're looking for. The hidden rows aren't deleted \u2014 just invisible!",
            tag: "Data tab \u2192 Filter",
          },
          {
            icon: "\ud83d\udd17",
            title: "Linking Sheets",
            description: "Pull data from one sheet into another using a formula like =Sheet2!A1. One file, multiple connected pages!",
            tag: "=SheetName!Cell",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Sorting vs Filtering \u2014 they sound similar but they're different!</strong>`,
      },
      {
        type: "table",
        headers: ["", "Sorting", "Filtering"],
        rows: [
          { cells: ["What it does", "Rearranges the ORDER of rows", "HIDES rows that don't match"] },
          { cells: ["Can you still see all rows?", "\u2705 Yes, just in a new order", "\u274c No, non-matching rows are hidden"] },
          { cells: ["Example", "Sort names A to Z", "Show only students who scored > 80"] },
          { cells: ["How to undo", "Sort again in a different order", "Remove the filter to see everything again"] },
        ],
      },
      {
        type: "text",
        html: `<strong>How to Sort Data:</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Click Any Cell in the Column You Want to Sort",
            description: "For example, click any cell in the 'Marks' column if you want to sort by marks.",
          },
          {
            title: "Step 2: Go to Data Tab \u2192 Click Sort A\u2192Z or Z\u2192A",
            description: "A\u2192Z sorts from smallest to biggest (or alphabetically A to Z). Z\u2192A sorts from biggest to smallest.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How to Filter Data:</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Click Any Cell in Your Data",
            description: "Make sure you're inside your data table, not in an empty area.",
          },
          {
            title: "Step 2: Go to Data Tab \u2192 Click Filter",
            description: "Small dropdown arrows appear on each column header.",
          },
          {
            title: "Step 3: Click the Arrow and Choose What to Show",
            description: "Uncheck the values you don't want to see. Only the checked values stay visible. Click again and check 'Select All' to show everything again.",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Linking sheets formula:</strong> <mark>=SheetName!CellReference</mark><br/>Example: =Sheet2!A1 pulls the value from cell A1 on Sheet2 into your current sheet.<br/>If the sheet name has spaces, wrap it in quotes: ='My Data'!C3`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Exam tip \u2014 Why link sheets?</strong> Imagine one sheet has "January Sales" and another has "February Sales." A third "Summary" sheet can pull totals from both. Change January's numbers \u2192 Summary updates automatically. No copy-pasting needed!`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "MS PowerPoint \u2014 Creating Presentations",
    time: "~5 mins",
    badges: [],
    hook: `Word is for reading. Excel is for calculating. <strong>PowerPoint is for presenting!</strong> Every class project, every school assembly, every show-and-tell \u2014 it all uses slides. Let's learn how to make ones that actually look good.`,
    content: [
      {
        type: "analogy",
        label: "Movie Director Analogy",
        html: `Think of yourself as a movie director. Each <strong>slide is one scene</strong>. The <strong>theme is the visual style</strong> \u2014 the colours, fonts, and background (like a movie's colour palette). <strong>Slide layouts</strong> are pre-made templates for each scene. You decide what goes where!`,
      },
      {
        type: "image",
        src: "/images/m2/powerpoint-slides.webp",
        description: "PowerPoint interface showing Slide panel (left), Main editing area (centre), Notes section (bottom), and Ribbon with Home/Insert/Design tabs",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcbb",
            title: "Slides",
            description: "Individual pages of your presentation. Each one holds text, pictures, charts, or videos. Add a new slide with Ctrl+M.",
            tag: "Building blocks",
          },
          {
            icon: "\ud83c\udfa8",
            title: "Themes",
            description: "Pre-made visual styles. One click changes the look of ALL slides at once \u2014 colours, fonts, backgrounds. Found in the Design tab.",
            tag: "Design tab \u2192 Themes",
          },
          {
            icon: "\ud83d\udccf",
            title: "Slide Layouts",
            description: "Pre-arranged templates for what goes on each slide: Title Slide, Title + Content, Two Content, Blank, etc.",
            tag: "Home \u2192 Layout",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Common Slide Layouts:</strong>`,
      },
      {
        type: "table",
        headers: ["Layout Name", "What's On It", "Best Used For"],
        rows: [
          { cells: ["Title Slide", "Big title + subtitle in the centre", "The first slide of your presentation"] },
          { cells: ["Title and Content", "Title on top, content area below", "Most slides \u2014 text, bullets, images"] },
          { cells: ["Two Content", "Title + two side-by-side areas", "Comparisons (before/after, pros/cons)"] },
          { cells: ["Blank", "Completely empty", "Custom designs, full-screen images"] },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Pick a Theme",
            description: "Go to Design tab and click a Theme you like. This sets the colours, fonts, and background for your whole presentation.",
          },
          {
            title: "Step 2: Add New Slides",
            description: "Home tab \u2192 click the dropdown arrow under 'New Slide' \u2192 pick a layout. Use 'Title Slide' for slide 1, then 'Title and Content' for most others.",
          },
          {
            title: "Step 3: Add Your Content",
            description: "Click on the placeholder text and start typing. Use the Insert tab to add pictures, shapes, or videos.",
          },
          {
            title: "Step 4: Keep It Simple!",
            description: "Maximum 6 lines per slide, maximum 6 words per line. Slides are visual aids, not essays. If people are reading your slide, they're not listening to you!",
          },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>The #1 PowerPoint mistake:</strong> Putting entire paragraphs on slides. Your slide should have <mark>key points and pictures only</mark>. If you need to write a paragraph, that belongs in a Word document, not a slide!`,
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "MS PowerPoint \u2014 Master Slides & Slide Shows",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You have 30 slides and your teacher says "Add the school logo to every slide." Without Slide Master, that's 30 separate edits. <strong>With Slide Master? One change and all 30 slides update at once.</strong> Mind = blown.`,
    content: [
      {
        type: "analogy",
        label: "Blueprint Analogy",
        html: `A <strong>Slide Master is like a building blueprint</strong>. If you add a window to the blueprint, every room built from it gets a window. Similarly, if you add a logo to the Slide Master, every slide in your presentation gets that logo. One change = everywhere changes!`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcdc",
            title: "Slide Master",
            description: "The master template that controls the look of ALL slides. Change fonts, backgrounds, or add a logo here and it appears on every single slide.",
            tag: "View \u2192 Slide Master",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udccf",
            title: "Layout Masters",
            description: "Under the Slide Master, there are individual layout templates (Title, Content, etc.). You can customise each one while keeping the master's global style.",
            tag: "Under the Slide Master",
            tagColor: "green",
          },
        ],
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Open Slide Master View",
            description: "Go to View tab \u2192 click Slide Master. The big slide at the top of the left panel is the Master. The smaller ones below are Layout Masters.",
          },
          {
            title: "Step 2: Make Your Changes",
            description: "Edit the top Master Slide \u2014 add a logo, change fonts, set a background colour. Whatever you do here appears on ALL slides.",
          },
          {
            title: "Step 3: Close Master View",
            description: "Click 'Close Master View' on the Ribbon. Go back to your normal slides and you'll see all the changes applied everywhere!",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Presenting your slides \u2014 Slide Show features:</strong>`,
      },
      {
        type: "table",
        headers: ["Feature", "What It Does", "How to Use It"],
        rows: [
          { cells: ["Transitions", "Cool effects BETWEEN slides (fade, wipe, push)", "Transitions tab \u2192 pick one"] },
          { cells: ["Animations", "Effects for OBJECTS on a slide (text flying in, images bouncing)", "Animations tab \u2192 pick one"] },
          { cells: ["Start from Beginning", "Starts the slideshow from slide 1", "Press F5"] },
          { cells: ["Start from Current Slide", "Starts from whatever slide you're on", "Press Shift+F5"] },
          { cells: ["Presenter View", "YOU see your notes and next slide. Audience sees only the current slide!", "Slide Show tab \u2192 Presenter View"] },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>Common exam mistake \u2014 Transitions vs Animations:</strong><br/><mark>Transitions</mark> = effects when moving FROM one slide TO the next (like a fade between scenes in a movie).<br/><mark>Animations</mark> = effects for objects WITHIN a single slide (like text flying in from the left). Don't mix them up!`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Exam tip \u2014 Presenter View is a secret weapon:</strong> You get to see your speaker notes, the upcoming slide, and a timer on your screen. The audience only sees the current slide. Perfect for remembering what to say without reading directly from the slide!`,
      },
    ],
  },

  // ─── Topic 9 ───
  {
    id: 9,
    title: "Putting It All Together \u2014 Which Tool When?",
    time: "~3 mins",
    badges: [{ text: "Exam scenarios", type: "hot" }],
    hook: `You now know Word, Excel, and PowerPoint. But the real exam question is: <strong>"Which application would you use for ___?"</strong> Pick the wrong one and you lose easy marks. Let's make sure that never happens.`,
    content: [
      {
        type: "analogy",
        label: "Toolbox Analogy",
        html: `A carpenter doesn't use a hammer for everything. Nails need a hammer, screws need a screwdriver. Same idea: <strong>Word = writing</strong>, <strong>Excel = numbers</strong>, <strong>PowerPoint = presenting</strong>. Using the wrong tool is like trying to hammer a screw \u2014 it doesn't work well!`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcdd",
            title: "Use Word When...",
            description: "You need to WRITE something that people will READ: essays, letters, assignments, resumes, reports.",
            tag: "Writing \u00b7 Reading \u00b7 Printing",
          },
          {
            icon: "\ud83d\udcca",
            title: "Use Excel When...",
            description: "You need to work with NUMBERS or ORGANISE DATA: budgets, marks, attendance, invoices, anything with calculations.",
            tag: "Numbers \u00b7 Formulas \u00b7 Data",
          },
          {
            icon: "\ud83c\udfa5",
            title: "Use PowerPoint When...",
            description: "You need to PRESENT to an audience: class projects, pitches, training sessions. Visual slides, not long documents.",
            tag: "Presenting \u00b7 Slides \u00b7 Visual",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Practice scenarios \u2014 which tool would YOU pick?</strong>`,
      },
      {
        type: "table",
        headers: ["Scenario", "Best Tool", "Why?"],
        rows: [
          { cells: ["Writing a school essay", "MS Word", "You're writing text with headings and formatting"] },
          { cells: ["Making a monthly pocket money budget", "MS Excel", "You need numbers, formulas, and calculations"] },
          { cells: ["Presenting your science project to class", "MS PowerPoint", "You're showing slides to an audience"] },
          { cells: ["Tracking attendance for your sports team", "MS Excel", "It's a table of data with names and dates"] },
          { cells: ["Writing a formal letter to the principal", "MS Word", "It's a formatted letter meant to be read or printed"] },
          { cells: ["Calculating average marks for 200 students", "MS Excel", "You need AVERAGE, SUM, sorting, and filtering"] },
          { cells: ["Pitching a business idea to judges", "MS PowerPoint", "You're presenting live to an audience"] },
          { cells: ["Creating your CV / resume", "MS Word", "It's a formatted document you print or email"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>The 3-second decision rule:</strong> Ask yourself ONE question \u2014<br/>"Am I <strong>writing</strong> something?" \u2192 Word<br/>"Am I <strong>calculating</strong> something?" \u2192 Excel<br/>"Am I <strong>presenting</strong> something?" \u2192 PowerPoint<br/>That's it. You'll never pick wrong!`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Exam tip \u2014 They work together!</strong> You can paste an Excel chart into a Word report. You can link Excel data to PowerPoint slides. You can copy a Word outline into PowerPoint. They're a team \u2014 each one handles what it does best!`,
      },
    ],
  },
];
