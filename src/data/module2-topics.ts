import type { Topic } from "./module1-topics";

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "Editing vs Word Processing",
    time: "~3 mins",
    badges: [{ text: "Foundation", type: "star" }],
    hook: `Notepad and MS Word both let you type letters. <strong>So why do we have two apps? Because one just types text \u2014 the other lets your homework actually look like homework.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>Editing</strong> means you type letters and delete letters. That\u2019s it. <strong>Word processing</strong> is much bigger \u2014 you type letters AND you can make them <mark>bold, change the colour, add a picture, make a table, check spelling, and print a nice page</mark>. Word processing <em>includes</em> editing, plus a lot more.`,
      },
      {
        type: "image",
        src: "/images/m2/word-formatting.webp",
        description: "Text Editor (plain text) vs Word Processor (formatted document) side-by-side comparison",
      },
      {
        type: "analogy",
        label: "\u270f\ufe0f Pencil vs a full art set",
        html: `A <strong>text editor</strong> (like Notepad on Windows) is a <strong>pencil</strong>. You can write and rub out \u2014 nothing else. A <strong>word processor</strong> (like MS Word or Google Docs) is a <strong>full art set</strong>. You still write, but now you also have colours, a ruler, stickers, nice fonts, and a way to print a clean page for your teacher.`,
      },
      {
        type: "text",
        html: `<strong>You already meet both of these every day:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\u270f\ufe0f",
            title: "Text Editor (Notepad)",
            description: "Just plain letters. No bold, no pictures, no colours. Good for a quick list or a phone number you want to save fast. Saves as a .txt file.",
            tag: "Plain \u00b7 .txt",
            tagColor: "amber",
          },
          {
            icon: "\ud83d\udcc4",
            title: "Word Processor (MS Word)",
            description: "Bold, italic, colours, photos, tables, spell-check, page numbers. Perfect for a school essay, a CV, or a formal letter. Saves as a .docx file.",
            tag: "Rich \u00b7 .docx",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this matters:</strong> \u2705 An essay in Word looks like real homework, not a shopping list \u00b7 \u2705 You can print a CV with a proper heading \u00b7 \u2705 Spell-check catches silly mistakes before your teacher does \u00b7 \u2705 One short note? Notepad is faster and opens instantly.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f If your teacher asks for a \u201cword-processed document,\u201d they want a .docx file from MS Word or Google Docs \u2014 NOT a .txt file from Notepad \u00b7 \u26a0\ufe0f Saying \u201cediting and word processing are the same\u201d is wrong \u2014 editing is only ONE part of word processing.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Your friend sends you a shopping list and a school report in the same chat. Which one fits best in Notepad, and which one really needs MS Word? Why?`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "MS Word \u2014 Text Editing & Formatting",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Your school essay is just plain typing? Boring. <strong>With a few clicks in MS Word, the same text looks like a proper report \u2014 with headings, bold words, and neat paragraphs.</strong>`,
    content: [
      {
        type: "text",
        html: `When you open MS Word, the strip of buttons at the top is called the <mark>Ribbon</mark>. The <strong>Home</strong> tab is where you find the most-used buttons \u2014 <strong>B</strong> for Bold, <strong>I</strong> for Italic, <strong>U</strong> for Underline, font name, font size, and text colour. The letter on the button is the hint!`,
      },
      {
        type: "image",
        src: "/images/m2/word-ribbon.webp",
        description: "MS Word Ribbon interface showing Home tab with Font group, Paragraph group, and Styles group highlighted",
      },
      {
        type: "analogy",
        label: "\ud83d\udd8d\ufe0f A highlighter on your notebook",
        html: `Think of a paper notebook. If you want to make a word stand out, you take a highlighter and <strong>first you colour over the word</strong>, then it is bright. In Word it is the same idea \u2014 <strong>first you select the text (drag the mouse over it so it goes blue), THEN you press the button</strong>. No selection = nothing happens.`,
      },
      {
        type: "text",
        html: `<strong>How to make a word bold \u2014 step by step:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Select the word",
            description: "Click just before the word, hold the mouse, drag to the end. The word turns blue \u2014 that means \u201cselected.\u201d",
            tag: "Drag to highlight",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Click B (or press Ctrl+B)",
            description: "Click the bold button on the Home tab. Or use the keyboard shortcut Ctrl+B. B stands for Bold.",
            tag: "B = Bold",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Click outside",
            description: "Click anywhere else on the page. The blue selection goes away and your word stays bold.",
            tag: "Click to deselect",
          },
          {
            icon: "4\ufe0f\u20e3",
            title: "Save (Ctrl+S)",
            description: "Press Ctrl+S to save. S is for Save. Do this often so you never lose your work.",
            tag: "Ctrl+S always",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Where should the text sit on the page?</strong> Word gives you four choices, called <strong>alignment</strong>:`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\u2b05\ufe0f",
            title: "Left (Ctrl+L)",
            description: "Text starts from the left side of the page. This is the normal choice for almost every paragraph in a school essay.",
            tag: "Essays \u00b7 letters",
          },
          {
            icon: "\u2194\ufe0f",
            title: "Centre (Ctrl+E)",
            description: "Text sits in the middle of the line. Great for the title at the top of a report or a birthday invitation.",
            tag: "Titles \u00b7 invitations",
          },
          {
            icon: "\u27a1\ufe0f",
            title: "Right (Ctrl+R)",
            description: "Text sits on the right side of the page. Good for writing the date or your name in the top corner of a letter.",
            tag: "Dates \u00b7 signatures",
          },
          {
            icon: "\ud83d\udccf",
            title: "Justify (Ctrl+J)",
            description: "Text stretches so BOTH the left and right edges are straight. Makes a formal report look very neat, like a newspaper page.",
            tag: "Formal reports",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Shortcuts to remember \u2014 the letter is the clue:</strong> \u2705 Ctrl+<strong>B</strong> = Bold \u00b7 \u2705 Ctrl+<strong>I</strong> = Italic \u00b7 \u2705 Ctrl+<strong>U</strong> = Underline \u00b7 \u2705 Ctrl+<strong>S</strong> = Save \u00b7 \u2705 Ctrl+Z = Undo (Zap the last mistake) \u00b7 \u2705 Ctrl+C = Copy \u00b7 \u2705 Ctrl+V = Paste. These work in almost every app on Windows, including Google Docs and Gmail.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f If you press Ctrl+B and nothing happens, you probably forgot to SELECT the text first \u00b7 \u26a0\ufe0f Don\u2019t make every word bold \u2014 if everything is bold, nothing stands out \u00b7 \u26a0\ufe0f Press Ctrl+S every few minutes \u2014 if the power goes out, unsaved work is gone.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You are writing a school report about Tashkent for your teacher. Which two things should you make bold, and which alignment will you use for the title at the top? Why?`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "MS Word \u2014 Images & Tables",
    time: "~5 mins",
    badges: [],
    hook: `A five-page wall of text? Nobody wants to read that. <strong>A picture of your topic and a neat little table make your school project look ten times better.</strong>`,
    content: [
      {
        type: "text",
        html: `In MS Word, both pictures and tables come from the <mark>Insert tab</mark> at the top. Think of Insert as the \u201cadd stuff\u201d tab \u2014 if you want to put something into your page that is not plain typing (a photo, a table, a shape), you go there.`,
      },
      {
        type: "image",
        src: "/images/m2/word-formatting.webp",
        description: "Text Editor (plain text) vs Word Processor (formatted document) side-by-side comparison",
      },
      {
        type: "analogy",
        label: "\ud83c\udfa8 Pictures = photos, Tables = graph-paper boxes",
        html: `A <strong>picture</strong> in Word is just like sticking a photo from your phone into your notebook. A <strong>table</strong> is like drawing a small grid of boxes \u2014 each box holds one piece of info. Tables are great for timetables, shopping prices, or a list of friends with their phone numbers.`,
      },
      {
        type: "text",
        html: `<strong>How to add a picture \u2014 step by step:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Insert \u2192 Pictures",
            description: "Click the Insert tab. Click Pictures. Choose \u2018This Device\u2019 to pick a photo from your laptop, or \u2018Online Pictures\u2019 to search the internet.",
            tag: "Insert \u2192 Pictures",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Resize from the CORNER",
            description: "Drag the little corner dots to make the picture bigger or smaller. If you drag the SIDE dot, the picture gets squashed \u2014 your face will look weird!",
            tag: "Corners only",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Wrap text around it",
            description: "Click the picture \u2192 a small layout icon appears. Pick \u2018Square\u2019 so your paragraph flows nicely around the picture, not under it.",
            tag: "Square = normal",
          },
          {
            icon: "4\ufe0f\u20e3",
            title: "Drag where you want",
            description: "Click and drag the picture to place it top-left, top-right, middle \u2014 wherever looks best for your report.",
            tag: "Drag to move",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How to add a table</strong> (3 columns, 4 rows for a small timetable): click <strong>Insert \u2192 Table</strong>. A grid pops up. Slide your mouse over the grid to pick the size you want, then click. A blank table appears in your page. Click inside any box to type. <strong>Press Tab</strong> to jump to the next box.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why pictures and tables help:</strong> \u2705 A photo of the Registan makes a history project come alive \u00b7 \u2705 A table of your weekly timetable is easier to read than a paragraph \u00b7 \u2705 A birthday invitation with a photo looks much nicer than plain text \u00b7 \u2705 Your teacher can scan your report faster when it has visual breaks.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Always drag pictures from the <strong>corners</strong> \u2014 the sides stretch and squash the image \u00b7 \u26a0\ufe0f Don\u2019t put more than 4 or 5 pictures on one page or it looks messy \u00b7 \u26a0\ufe0f <strong>Merge cells</strong> joins boxes together, <strong>Split cells</strong> breaks one box apart \u2014 they are opposites, don\u2019t mix them up.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You are writing a school project about the countries of Central Asia. Where would a picture help the reader? Where would a table help more than words? Try to name two spots for each.`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "MS Excel \u2014 Creating Worksheets",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `MS Word is for writing. <strong>MS Excel is for numbers.</strong> Your pocket money, your marks, a shopping list with prices \u2014 anything with numbers is easier in Excel than in Word.`,
    content: [
      {
        type: "text",
        html: `<strong>MS Excel</strong> gives you a huge grid of small boxes. Each box is called a <mark>cell</mark>. The columns going left-to-right are named with letters (A, B, C\u2026). The rows going top-to-bottom are named with numbers (1, 2, 3\u2026). So the box where column <strong>B</strong> meets row <strong>3</strong> is called cell <strong>B3</strong> \u2014 just like a seat number in a cinema (row 3, seat B).`,
      },
      {
        type: "image",
        src: "/images/m2/excel-grid.webp",
        description: "Excel spreadsheet showing Column letters (A, B, C), Row numbers (1, 2, 3), a Cell highlighted at B3, and the Name Box showing 'B3'",
      },
      {
        type: "analogy",
        label: "\ud83c\udfa6 A cinema seating plan",
        html: `Think of Excel as a <strong>cinema seating plan</strong>. Every seat has an address \u2014 \u201crow 3, seat B\u201d \u2014 and there is only one seat with that address. In Excel, every cell has an address too, like <strong>B3</strong>. Once you know a cell\u2019s address, you (or a formula) can find it again in one click.`,
      },
      {
        type: "text",
        html: `<strong>Three words you must know in Excel:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udfe9",
            title: "Cell",
            description: "One small box where you type one thing \u2014 a number, a word, or a date. Every cell has a name like A1, B3, or D12.",
            tag: "One box",
          },
          {
            icon: "\ud83d\udcc4",
            title: "Worksheet",
            description: "One full page of cells. Like one page of a graph-paper notebook. The tabs at the bottom (Sheet1, Sheet2) are different worksheets.",
            tag: "One tab = one page",
          },
          {
            icon: "\ud83d\udcd3",
            title: "Workbook",
            description: "The whole Excel file. It can hold many worksheets inside, like a whole notebook with many pages. Saves as a .xlsx file.",
            tag: "The full file",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Your first Excel sheet \u2014 a tiny pocket-money tracker:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Click cell A1",
            description: "Click the top-left box. In the \u201cName Box\u201d above, you will see the address change to A1. That means A1 is now the active cell.",
            tag: "A1 is the start",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Type a heading",
            description: "Type \u201cItem\u201d in A1, press Tab, type \u201cPrice (UZS)\u201d in B1. Tab moves you right. Enter moves you down.",
            tag: "Tab \u2192 right",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Add your list",
            description: "In A2 type Samsa, in B2 type 5000. In A3 type Non, in B3 type 3000. Just real things you buy on your way home from school.",
            tag: "One row per item",
          },
          {
            icon: "4\ufe0f\u20e3",
            title: "Save (Ctrl+S)",
            description: "Press Ctrl+S. Give the file a name like \u201cPocket money\u201d and save. Excel adds .xlsx automatically \u2014 that is the workbook file.",
            tag: "Save as .xlsx",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>What Excel is good for:</strong> \u2705 Tracking your pocket money each week \u00b7 \u2705 A family shopping list with prices in UZS \u00b7 \u2705 Your marks for every subject this semester \u00b7 \u2705 A class attendance register with dates across the top \u00b7 \u2705 Anything you would normally write in a table of numbers.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f A cell can hold a <strong>number</strong> (5000), <strong>text</strong> (\u201cSamsa\u201d), a <strong>date</strong> (21/04/2026), or a <strong>formula</strong> (we cover those next topic) \u2014 Excel guesses which one from what you type \u00b7 \u26a0\ufe0f If your number looks stuck to the LEFT of the cell, Excel thinks it is text, not a number.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Imagine you want to track every tenge you spend in one month. What would your columns be? (Hint: think date, item, amount.) Which cell would hold the price of the very first thing you buy?`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "MS Excel \u2014 Formulas & Functions",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }, { text: "Most tested", type: "hot" }],
    hook: `This is why Excel exists. <strong>Instead of adding numbers in your head, Excel does the maths for you \u2014 and the answer updates the moment you change a number.</strong>`,
    content: [
      {
        type: "text",
        html: `A <mark>formula</mark> in Excel is a little sum that the cell works out for you. The big rule: every formula starts with an <strong>equals sign (=)</strong>. If you forget the =, Excel just shows your text. If you put the =, Excel does the maths. That one small symbol changes everything.`,
      },
      {
        type: "analogy",
        label: "\ud83e\uddee A smart calculator in every cell",
        html: `Think of each cell as a <strong>tiny smart calculator</strong>. You tell it: \u201chey cell C1, add the number in A1 to the number in B1.\u201d You write that as <strong>=A1+B1</strong>. The calculator shows the answer. If you later change A1 from 10 to 50, cell C1 updates itself. No need to press anything \u2014 the answer is always fresh.`,
      },
      {
        type: "text",
        html: `<strong>The five maths symbols you need:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\u2795",
            title: "Plus (+)",
            description: "Adds two numbers. =10+3 gives 13. =A1+B1 adds whatever is in A1 and B1. Great for a simple total.",
            tag: "=A1+B1",
          },
          {
            icon: "\u2796",
            title: "Minus (\u2212)",
            description: "Subtracts. =10-3 gives 7. Useful for \u201cmoney left\u201d: =B1-C1 (money I had minus money I spent).",
            tag: "=B1-C1",
          },
          {
            icon: "\u2716\ufe0f",
            title: "Times (*)",
            description: "Multiplies. =10*3 gives 30. Great for shop totals: =price*quantity, like =B2*C2 for 3 samsas at 5000 UZS.",
            tag: "=B2*C2",
          },
          {
            icon: "\u2797",
            title: "Divide (/)",
            description: "Divides. =10/3 gives about 3.33. Use it for averages or splitting a bill among friends.",
            tag: "=A1/4",
          },
          {
            icon: "=",
            title: "Equals (=)",
            description: "The most important one! Every formula MUST start with =. Without it, Excel shows \u201cA1+B1\u201d as plain text.",
            tag: "Always first",
          },
          {
            icon: "\ud83c\udd95",
            title: "Ready-made functions",
            description: "Excel has short words for common sums: SUM, AVERAGE, MIN, MAX, COUNT. You just say =SUM(A1:A10) and it adds them all.",
            tag: "SUM \u00b7 AVERAGE",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>The 5 most useful ready-made functions \u2014 in plain English:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\u2795",
            title: "=SUM(A1:A10) \u2014 add them all",
            description: "Adds every number from A1 down to A10. If you have 10 items on your shopping list in column A, this gives the total at the bottom.",
            tag: "Total of a range",
          },
          {
            icon: "\ud83d\udcca",
            title: "=AVERAGE(B1:B5) \u2014 the mean",
            description: "Finds the average. Perfect for: \u201cwhat is my average mark this term?\u201d Put your 5 test marks in B1:B5 and the formula tells you.",
            tag: "Mean score",
          },
          {
            icon: "\u2b06\ufe0f",
            title: "=MAX(C1:C30) \u2014 the biggest",
            description: "Finds the HIGHEST number. Who got the top score in class? What was the most expensive item in the family shop?",
            tag: "Highest value",
          },
          {
            icon: "\u2b07\ufe0f",
            title: "=MIN(C1:C30) \u2014 the smallest",
            description: "Finds the LOWEST number. The cheapest item, the coldest day, the lowest mark. The opposite of MAX.",
            tag: "Lowest value",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why formulas are magic:</strong> \u2705 Change one number and every total updates instantly \u00b7 \u2705 No more adding long columns in your head \u00b7 \u2705 Family budget: change one shop price, the month total changes by itself \u00b7 \u2705 Class marks: add one new test, the average updates without you touching it.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Forgetting the = is the #1 mistake \u2014 Excel will just show your typing as text \u00b7 \u26a0\ufe0f The colon <strong>:</strong> means \u201cfrom\u2026 to\u2026\u201d, so A1:A10 means \u201cevery cell from A1 down to A10\u201d \u00b7 \u26a0\ufe0f If a cell shows <strong>#####</strong>, the column is too narrow \u2014 drag the edge wider.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Your family buys 5 things from the bazaar. Prices go in column B and how many you bought goes in column C. Which formula gives the total cost for one row? Which formula gives the total cost for the whole shopping trip?`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "MS Excel \u2014 Data Management",
    time: "~5 mins",
    badges: [],
    hook: `You have 500 marks in one Excel sheet. The teacher says \u201cshow me only the students who got more than 80.\u201d <strong>Doing it by eye takes an hour. With sorting and filtering, it takes three clicks.</strong>`,
    content: [
      {
        type: "text",
        html: `Once your data is in Excel, you can do three super-useful things to find what you need: <mark>sort</mark> (put rows in order), <mark>filter</mark> (hide rows you don\u2019t want right now), and <mark>link</mark> (pull a number from one sheet into another). All three live on the <strong>Data</strong> tab of the Ribbon.`,
      },
      {
        type: "analogy",
        label: "\ud83d\udcda Books on a shelf",
        html: `Imagine 500 books on a big shelf. <strong>Sorting</strong> = putting the books in order (A to Z by title, or tallest to shortest). All the books are still on the shelf \u2014 they just moved. <strong>Filtering</strong> = putting a cloth over the books you don\u2019t want to see right now, so only \u201chistory books\u201d are visible. The others are still there, just hidden. Remove the cloth and they come back.`,
      },
      {
        type: "text",
        html: `<strong>Sorting vs Filtering \u2014 they are NOT the same:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udd3d",
            title: "Sorting \u2014 changes the ORDER",
            description: "Rearranges your rows from smallest to biggest, A to Z, or oldest date to newest. You still see every row. Example: sort your class list A to Z by name.",
            tag: "Data \u2192 Sort",
          },
          {
            icon: "\ud83d\udd0d",
            title: "Filtering \u2014 HIDES some rows",
            description: "Keeps only rows that match a rule. The others are hidden (not deleted). Example: show only students who scored above 80. Turn filter off \u2192 everyone is back.",
            tag: "Data \u2192 Filter",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How to filter \u2014 super quick:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Click a cell in your data",
            description: "Click any cell inside your table of data \u2014 any row, any column. Excel needs to know which table you mean.",
            tag: "Any cell",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Data \u2192 Filter",
            description: "Go to the Data tab at the top and click Filter. Small arrows appear next to every column heading. That\u2019s it \u2014 filter is on!",
            tag: "Click Filter",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Click an arrow \u2192 pick",
            description: "Click the little arrow next to \u201cMarks\u201d \u2192 choose \u201cNumber Filters \u2192 Greater Than \u2192 80\u201d. Only rows above 80 stay. Done.",
            tag: "3 clicks total",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this saves your life:</strong> \u2705 Find the top 10 scores in a class of 200 in seconds \u00b7 \u2705 Sort a shopping list from cheapest to most expensive \u00b7 \u2705 Show only family members in your contacts list \u00b7 \u2705 Birthday list: sort by date to see whose birthday is next \u00b7 \u2705 Linking sheets: one \u201cSummary\u201d sheet can pull totals from 12 monthly sheets and update by itself.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Before sorting, select the WHOLE table, not just one column \u2014 otherwise only that column moves and your data gets mixed up \u00b7 \u26a0\ufe0f A filter only HIDES rows, it doesn\u2019t delete them. If you save and send the file, the hidden rows go with it \u00b7 \u26a0\ufe0f To link a cell from another sheet, use <strong>=SheetName!Cell</strong>, for example <strong>=Sheet2!A1</strong>.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You have a list of 40 friends with their birthdays. You want to know \u201cwhose birthday is next month?\u201d Would sorting or filtering answer that faster? Explain why in one sentence.`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "MS PowerPoint \u2014 Creating Presentations",
    time: "~5 mins",
    badges: [],
    hook: `When you stand in front of the class and speak about your project, what helps your friends follow you? <strong>Slides.</strong> MS PowerPoint is the tool that turns your words into slides on the big screen.`,
    content: [
      {
        type: "text",
        html: `<strong>MS PowerPoint</strong> is where you build <mark>slides</mark> for a presentation. Each slide is like one page on the screen. You click an arrow or press a key to go to the next slide while you speak. The file saves as a .pptx file.`,
      },
      {
        type: "image",
        src: "/images/m2/powerpoint-slides.webp",
        description: "PowerPoint interface showing Slide panel (left), Main editing area (centre), Notes section (bottom), and Ribbon with Home/Insert/Design tabs",
      },
      {
        type: "analogy",
        label: "\ud83c\udfa5 A small movie for your class project",
        html: `Think of your presentation as a <strong>short movie</strong>. Every <strong>slide is one scene</strong>. The <strong>theme</strong> (colours, fonts, background) is the movie\u2019s visual style \u2014 warm and bright, or clean and serious. <strong>You are the director</strong>: you choose what goes on each slide and in what order.`,
      },
      {
        type: "text",
        html: `<strong>The three building blocks of every presentation:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcfd\ufe0f",
            title: "Slides",
            description: "One page of your presentation. It holds a title, a few words, maybe a picture. Add a new slide by pressing Ctrl+M or clicking \u2018New Slide\u2019 on the Home tab.",
            tag: "Ctrl+M = new slide",
          },
          {
            icon: "\ud83c\udfa8",
            title: "Themes",
            description: "A ready-made style. One click changes the colours and fonts on ALL your slides at once. Find them on the Design tab. Pick one you like before you start typing.",
            tag: "Design \u2192 Themes",
          },
          {
            icon: "\ud83d\udccf",
            title: "Layouts",
            description: "A ready-made shape for one slide: Title Slide (slide 1), Title + Content (most slides), Two Content (for comparing), or Blank. Pick a layout, then type.",
            tag: "Home \u2192 Layout",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Making a 5-slide presentation about your city:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Pick a theme",
            description: "Design tab \u2192 click a theme you like. All 5 slides get the same look. Picking first saves you a lot of work later.",
            tag: "Design first",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Title slide",
            description: "Slide 1 = title. Big text in the middle: \u201cMy City \u2014 Tashkent\u201d. Below it, your name and class.",
            tag: "Slide 1",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Content slides",
            description: "Slides 2\u20134 = short bullet points + one picture each. Example: a photo of Chorsu bazaar with three short notes about it.",
            tag: "Slides 2\u20134",
          },
          {
            icon: "4\ufe0f\u20e3",
            title: "Closing slide",
            description: "Slide 5 = \u201cThank you!\u201d or \u201cAny questions?\u201d This tells your class the talk is over, so they clap at the right moment.",
            tag: "Slide 5",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Good slide rules (keep them simple):</strong> \u2705 About 5 short lines per slide, MAX \u2014 slides are not essays \u00b7 \u2705 One picture per slide makes it visual \u00b7 \u2705 Big clear font so the back of the class can read it \u00b7 \u2705 One clear idea per slide \u00b7 \u2705 Your mouth gives the detail \u2014 the slide just shows the key words.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f If you copy a whole paragraph onto a slide, your class will read it and stop listening to you \u00b7 \u26a0\ufe0f Don\u2019t use 5 different fonts and 10 colours \u2014 pick one theme and stick to it \u00b7 \u26a0\ufe0f Tiny text (under size 18) can\u2019t be read from the back \u2014 aim for size 24 or bigger.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You need to present \u201cWhy I love my school\u201d in 3 minutes. How many slides would you use? Which layout would slide 1 need, and which layout would a \u201cbefore vs after\u201d slide need?`,
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "MS PowerPoint \u2014 Master Slides & Slide Shows",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You\u2019ve made 20 slides. Your teacher says \u201cadd the school logo to EVERY slide.\u201d Do it 20 times? No way. <strong>The Slide Master lets you add it once \u2014 and it appears on all 20 at the same time.</strong>`,
    content: [
      {
        type: "text",
        html: `The <mark>Slide Master</mark> is a special \u201cparent slide\u201d. Whatever you put on it (a logo, a background colour, the school name in the corner) appears on <strong>every</strong> slide of your presentation automatically. You find it at <strong>View \u2192 Slide Master</strong>. Make your changes, then click \u201cClose Master View\u201d to return to normal slides.`,
      },
      {
        type: "analogy",
        label: "\ud83c\udfd7\ufe0f A stamp for every page",
        html: `Imagine you have 20 pages in your notebook and you want the school logo on each one. You could draw it 20 times\u2026 or you could make one <strong>stamp</strong> and press it on every page. The <strong>Slide Master is that stamp</strong>. One change there = all 20 slides update at the same time.`,
      },
      {
        type: "text",
        html: `<strong>Two big things in this topic \u2014 Slide Master and Slide Show tricks:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcdc",
            title: "Slide Master",
            description: "The stamp. Put a logo, footer, or background on it and every slide gets it. Found at View \u2192 Slide Master. Saves hours on long presentations.",
            tag: "View \u2192 Slide Master",
          },
          {
            icon: "\u25b6\ufe0f",
            title: "Slide Show",
            description: "When you press F5, your slides go full-screen for the audience. Press Shift+F5 to start from the slide you are currently on (useful for practice).",
            tag: "F5 to start",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Transitions vs Animations \u2014 easy to mix up:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udd04",
            title: "Transitions \u2014 BETWEEN slides",
            description: "The little effect when you move from slide 3 to slide 4 \u2014 a fade, a wipe, a push. One per slide. Find them on the Transitions tab. Keep them gentle!",
            tag: "Slide \u2192 next slide",
          },
          {
            icon: "\u2728",
            title: "Animations \u2014 INSIDE one slide",
            description: "The effect on a thing ON a slide: the title flies in, a bullet appears on click. Find them on the Animations tab. Use them to reveal points one by one.",
            tag: "Thing on the slide",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why these features help:</strong> \u2705 Slide Master = one change updates every slide (logos, footers, page numbers) \u00b7 \u2705 Transitions make slide changes feel smooth, not jumpy \u00b7 \u2705 Animations reveal points one at a time so your class listens instead of reading ahead \u00b7 \u2705 <strong>Presenter View</strong> shows your notes to YOU while the class sees only the slide \u2014 your secret weapon.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Don\u2019t put a different transition on every slide \u2014 it looks messy. Pick ONE and use it everywhere \u00b7 \u26a0\ufe0f Too many animations (things spinning, bouncing, zooming) distract from your message \u00b7 \u26a0\ufe0f <strong>Transition = between slides, animation = inside a slide</strong>. Don\u2019t mix the words up.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You\u2019re presenting 15 slides about your school to parents. You want your school\u2019s name and logo in the corner of every slide. Which feature do you use, and how does it save you 14 clicks?`,
      },
    ],
  },

  // ─── Topic 9 ───
  {
    id: 9,
    title: "Putting It All Together \u2014 Which Tool When?",
    time: "~3 mins",
    badges: [{ text: "Exam scenarios", type: "hot" }],
    hook: `You now know MS Word, Excel, and PowerPoint. The question the exam always asks: <strong>\u201cWhich one would you use for \u2026?\u201d</strong> Pick wrong and you lose easy marks. Let\u2019s make that impossible.`,
    content: [
      {
        type: "text",
        html: `The three Office tools look similar (same Ribbon, same shortcuts), but they each do <mark>one main job</mark>. Use the right tool and the work is fast. Use the wrong tool and you spend an hour fighting the software.`,
      },
      {
        type: "analogy",
        label: "\ud83e\uddf0 A carpenter\u2019s toolbox",
        html: `A carpenter doesn\u2019t use a hammer for screws. Nails need a hammer, screws need a screwdriver, wires need pliers. Same idea with Office: <strong>Word = writing</strong>, <strong>Excel = numbers</strong>, <strong>PowerPoint = presenting</strong>. Using Excel for an essay is like using a hammer on a screw \u2014 it kind of works, but badly.`,
      },
      {
        type: "text",
        html: `<strong>The 3-second decision rule:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcdd",
            title: "Am I WRITING? \u2192 Word",
            description: "Essays, letters, a CV, a formal letter to the school director, a report with headings and paragraphs. Anything that will be READ as a document.",
            tag: "MS Word (.docx)",
          },
          {
            icon: "\ud83d\udcca",
            title: "Am I doing NUMBERS? \u2192 Excel",
            description: "Pocket money, class marks, family shopping list with prices in UZS, attendance, a small business plan. Anything with rows, columns, and maths.",
            tag: "MS Excel (.xlsx)",
          },
          {
            icon: "\ud83c\udfa5",
            title: "Am I PRESENTING? \u2192 PowerPoint",
            description: "A class project on a screen, a school assembly, a business pitch, a birthday slideshow for a friend. Anything you STAND UP and show to people.",
            tag: "PowerPoint (.pptx)",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Quick quiz \u2014 cover the tag and guess the tool:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83c\udf82",
            title: "Birthday invitation poster",
            description: "Nice layout, one photo, a few words. Will be printed or shared as a PDF. Not many numbers, not a class presentation.",
            tag: "MS Word",
          },
          {
            icon: "\ud83d\udcb0",
            title: "Tracking pocket money for a month",
            description: "Dates down the left, amounts on the right. You want totals and averages by month end. Maths is the main job.",
            tag: "MS Excel",
          },
          {
            icon: "\ud83c\udfeb",
            title: "Class project \u2018My Family\u2019",
            description: "You have to stand in front of the class and talk for 5 minutes with pictures on the big screen.",
            tag: "PowerPoint",
          },
          {
            icon: "\ud83d\udcdc",
            title: "A formal letter to the school director",
            description: "Top of page: date. Then address. Then \u201cDear Director\u201d. Then a polite paragraph. Will be signed and handed in.",
            tag: "MS Word",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>They work TOGETHER:</strong> \u2705 Put an Excel chart inside a Word report \u00b7 \u2705 Copy an Excel table into a PowerPoint slide \u00b7 \u2705 Write your speech in Word, then make the slides in PowerPoint \u00b7 \u2705 Big projects use all three: data in Excel, report in Word, presentation in PowerPoint. They are a team, not rivals.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Writing a long essay in Excel = disaster, rows don\u2019t flow like paragraphs \u00b7 \u26a0\ufe0f Doing a family budget in Word = no auto-totals, you add by hand \u00b7 \u26a0\ufe0f Putting your whole 10-page report inside one PowerPoint slide = nobody can read it \u00b7 \u26a0\ufe0f Always pick the tool that matches the MAIN job.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Your class is doing a group project on \u201cMy Favourite Tashkent Caf\u00e9.\u201d You need to track the menu prices, write a one-page report, and present to the class. Which tool for each part, in what order?`,
      },
    ],
  },
];
