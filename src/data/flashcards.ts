export interface Flashcard {
  front: string;
  back: string;
}

// Flashcards per module, keyed by module number, then by topic number
export const flashcardData: Record<number, Record<number, Flashcard[]>> = {
  // ━━━ Module 1: Hardware & Software ━━━
  1: {
    // Topic 1: Why Did We Even Invent Computers?
    1: [
      { front: "What are the 4 reasons computers were invented?", back: "Speed, Accuracy, Storage, Connectivity (S.A.S.C.)" },
      { front: "What does 'Accuracy' mean in the context of why computers were invented?", back: "Computers follow instructions exactly every time without getting tired or making human errors." },
      { front: "How did computers solve the 'Storage' problem humans had?", back: "Paper files filled rooms and could burn. Digital storage holds more than a library on a single thumb drive." },
      { front: "What does 'Connectivity' refer to as a reason for inventing computers?", back: "Computers allow instant global communication -- a message that once took weeks now arrives in seconds." },
    ],

    // Topic 2: How Computers Grew Up
    2: [
      { front: "Name the 4 eras of computer evolution in order.", back: "Mechanical Era, Electronic Era, Personal Computer Era, Mobile + Internet Era." },
      { front: "What technology defined the Electronic Era (1940s-1950s)?", back: "Vacuum tubes. ENIAC was the first electronic computer -- it filled entire buildings and cost millions." },
      { front: "What problem did each new era solve?", back: "Electronic fixed Mechanical being too slow. PC fixed Electronic filling whole buildings. Mobile fixed PC not being portable. Each era shrinks the computer and adds reach." },
      { front: "What era do modern smartphones belong to?", back: "Era 4: Mobile + Internet (2000s-Now). Supercomputers in your pocket, always connected via Wi-Fi." },
      { front: "What device represents the Mechanical Era?", back: "The Abacus -- used gears, wheels, and beads. No electricity, no memory, painfully slow." },
    ],

    // Topic 3: How Every Computer Works -- IPO
    3: [
      { front: "What does IPO stand for in computing?", back: "Input, Process, Output -- the 3-step cycle every computer follows." },
      { front: "What does the 'Process' step involve and which component performs it?", back: "The CPU does all thinking — calculations, decisions, comparisons — in nanoseconds (a 3 GHz CPU runs ~3 billion simple operations every second)." },
      { front: "Give an example of an Input device and an Output device.", back: "Input: keyboard, mouse, microphone. Output: monitor, speakers, printer." },
      { front: "What is the role of Storage in the IPO model?", back: "Storage saves your work permanently even when the computer turns off. Without it, everything disappears on shutdown." },
      { front: "In the Pizza Analogy, what does the oven represent?", back: "The CPU (Process). Ingredients = Input, finished pizza = Output, fridge = Storage." },
    ],

    // Topic 4: The CPU -- Brain of the Computer
    4: [
      { front: "What are the 3 components inside a CPU?", back: "Control Unit (CU), Arithmetic Logic Unit (ALU), and Registers." },
      { front: "What does the Control Unit (CU) do?", back: "It is the manager/boss -- gives instructions and controls data flow but never does calculations itself." },
      { front: "What does the ALU do?", back: "Arithmetic Logic Unit -- performs ALL calculations (addition, subtraction) and logical comparisons (is A > B?)." },
      { front: "What are Registers?", back: "Tiny, ultra-fast storage inside the CPU that holds data being processed right this microsecond. Faster than RAM." },
      { front: "What unit measures CPU speed, and what does 3.0 GHz mean?", back: "GHz (Gigahertz). 3.0 GHz = 3 billion operations per second." },
    ],

    // Topic 5: Memory -- RAM & ROM
    5: [
      { front: "What is the key difference between RAM and ROM?", back: "RAM is volatile (loses data when power is off) and user-changeable. ROM is non-volatile (permanent) and cannot be changed." },
      { front: "What does 'volatile' mean in computing?", back: "Data is lost when the power is turned off. RAM is volatile; ROM is non-volatile." },
      { front: "What is RAM used for?", back: "Temporary working memory -- holds all currently running apps, browser tabs, and active data." },
      { front: "What is ROM used for?", back: "Stores permanent startup instructions so the computer knows how to boot up. Cannot be changed by the user." },
      { front: "Is '256GB' on a phone RAM or Storage?", back: "Storage. RAM is typically 4-16GB. The 256GB is permanent storage (like an SSD), not memory." },
    ],

    // Topic 6: Input Devices
    6: [
      { front: "Define an input device.", back: "Any device that sends data INTO the computer -- keyboard, mouse, microphone, scanner, webcam, touchscreen." },
      { front: "Why is a touchscreen considered an I/O device?", back: "It is both Input (you touch it to send commands) and Output (it displays content). I/O = Input/Output." },
      { front: "What does a scanner do?", back: "Converts physical paper documents into digital files -- sends data INTO the computer (input device)." },
      { front: "What is the easy rule to tell Input from Output?", back: "Data going INTO the computer = Input device. Data coming OUT to the user = Output device." },
    ],

    // Topic 7: Output Devices
    7: [
      { front: "Define an output device.", back: "Any device that communicates results FROM the computer back to the user -- monitor, speakers, printer, projector." },
      { front: "What is the difference between a Hard Copy and a Soft Copy?", back: "Hard Copy = printed on physical paper. Soft Copy = digital output displayed on screen." },
      { front: "Name 4 output devices.", back: "Monitor, speakers, printer, projector, headphones, haptic feedback (vibration)." },
      { front: "What type of output is the vibration on your phone?", back: "Haptic feedback -- the computer communicates through touch. It is an output device." },
    ],

    // Topic 8: Storage Devices
    8: [
      { front: "Compare HDD and SSD.", back: "HDD: spinning disk, cheap, slow, large capacity. SSD: no moving parts (chips), fast, more expensive, why modern laptops boot in seconds." },
      { front: "What is cloud storage?", back: "Files stored on internet servers (Google Drive, iCloud). Accessible from any device, anywhere, but requires internet." },
      { front: "Why does a game take time to load?", back: "Game files sit in storage (HDD/SSD). When you press Play, data moves to fast RAM for the CPU to use. Bigger game = longer load." },
      { front: "What makes a USB flash drive different from HDD/SSD?", back: "USB drives are portable (pocket-sized) and plug into any USB port. HDD/SSD are typically fixed inside the computer." },
    ],

    // Topic 9: Types of Software
    9: [
      { front: "What are the 3 types of software?", back: "System Software (OS), Application Software (apps), and Utility Software (maintenance tools)." },
      { front: "What is System Software and give examples.", back: "Controls all hardware and makes everything run. Examples: Windows, Android, iOS, macOS. Must be installed first." },
      { front: "What is the difference between Application and Utility software?", back: "Application software = apps for specific user tasks (Word, Chrome, Spotify). Utility software = background maintenance tools (antivirus, disk cleanup, backup)." },
      { front: "Can you run application software without system software?", back: "No. System software (OS) must be installed first. WhatsApp cannot work without Android or iOS." },
      { front: "In the School analogy, what represents Utility Software?", back: "The Janitor & Nurse -- working quietly in the background, keeping things clean, safe, and healthy." },
    ],

    // Topic 10: Internet Basics
    10: [
      { front: "What is an IP Address?", back: "A unique number address assigned to every device on the internet (e.g., 192.168.1.1). Computers use it to find each other." },
      { front: "What is a URL?", back: "Uniform Resource Locator -- a human-friendly web address (e.g., www.google.com) instead of a numeric IP address." },
      { front: "What does a DNS Server do?", back: "Domain Name System -- the internet's phonebook. Converts a URL (google.com) into its actual IP address." },
      { front: "What are the 4 steps when you type www.google.com?", back: "1) Browser sends request. 2) DNS converts URL to IP. 3) Google's server prepares the page. 4) Page arrives in your browser." },
      { front: "What is the format of an email address?", back: "name@domain.com -- the @ means 'at'. Example: student@amity.edu = user 'student' at server 'amity.edu'." },
    ],

    // Topic 11: Internet Applications
    11: [
      { front: "Name the 3 main internet applications and when to use each.", back: "Email (formal communication), Instant Messaging (quick casual chats), Video Conferencing (live face-to-face meetings)." },
      { front: "How does Email differ from Instant Messaging?", back: "Email is formal, has attachments, doesn't need instant reply. IM is real-time, casual, and fast." },
      { front: "Give examples of Video Conferencing tools.", back: "Zoom, Google Meet, Microsoft Teams -- used for online classes and meetings." },
      { front: "Which internet application would you use to submit an assignment?", back: "Email -- it is formal, supports attachments, and creates an official record." },
    ],
  },

  // ━━━ Module 2: Office Automation ━━━
  2: {
    // Topic 1: Editing vs Word Processing
    1: [
      { front: "What's the difference between a text editor and a word processor?", back: "Text editor (like Notepad) types plain letters only -- no bold, no colour, no pictures. Word processor (like MS Word or Google Docs) does all that PLUS formatting, images, tables, and spell-check." },
      { front: "Does word processing include editing?", back: "Yes. Word processing is editing (typing and deleting) PLUS a lot more -- bold, colour, pictures, tables. So editing is one small part of word processing, not the other way round." },
      { front: "What file type comes from Notepad vs MS Word?", back: "Notepad saves as .txt (plain letters only, very small file). MS Word saves as .docx (keeps all your bold, fonts, pictures, and layout)." },
      { front: "When should I use Notepad instead of MS Word?", back: "Use Notepad for quick plain notes -- a phone number, a shopping list, or a line of code. It opens instantly and the file is tiny. For anything you'll print or submit, use MS Word." },
      { front: "Name two real word-processor apps.", back: "MS Word (part of Microsoft Office, saves as .docx) and Google Docs (free, works in the browser, saves to Google Drive). Both handle formatting, pictures, and tables." },
      { front: "My teacher says 'submit a word-processed document.' What file should I send?", back: "A .docx file from MS Word or Google Docs -- with proper formatting, headings, and paragraphs. NOT a .txt file from Notepad." },
    ],

    // Topic 2: MS Word -- Text Editing & Formatting
    2: [
      { front: "What is the Ribbon in MS Word?", back: "The strip of tabs and buttons at the top of the window. The Home tab has the buttons you use most -- Bold, Italic, Underline, font name, font size, colour, alignment." },
      { front: "Why do I always have to SELECT text before making it bold?", back: "Word needs to know WHICH text to change. If nothing is selected, pressing Ctrl+B does nothing -- Word has no target. Always drag the mouse over the word first so it turns blue, then press B." },
      { front: "Name 5 keyboard shortcuts I should know.", back: "Ctrl+B = Bold, Ctrl+I = Italic, Ctrl+U = Underline, Ctrl+S = Save, Ctrl+Z = Undo. The letter is always a hint for what it does." },
      { front: "What are the 4 alignments in MS Word?", back: "Left (Ctrl+L, the normal one), Centre (Ctrl+E, for titles), Right (Ctrl+R, for dates), and Justify (Ctrl+J, makes both sides straight like a newspaper)." },
      { front: "What does the Format Painter do?", back: "The little paintbrush on the Home tab. Click a nicely-formatted word, click the paintbrush, then drag across other text -- the second text gets the same look (font, size, colour, bold). Fast way to copy formatting." },
      { front: "Why shouldn't I make every word bold?", back: "If EVERYTHING is bold, then nothing stands out. Bold is for the important words -- like headings or key names. If the whole page is bold, your reader's eye has nowhere to rest." },
    ],

    // Topic 3: MS Word -- Images & Tables
    3: [
      { front: "Where do I add a picture or a table in MS Word?", back: "Both live on the Insert tab of the Ribbon. Think of Insert as the 'add stuff' tab -- pictures, tables, shapes, charts, page numbers all live there." },
      { front: "How do I resize a picture without squashing it?", back: "Drag from the CORNER dots, not the side dots. Corners keep the width-to-height ratio (the picture just gets bigger or smaller). Side dots stretch one way and make faces look weird." },
      { front: "What does 'Square' text wrapping do?", back: "Text flows around the picture in a neat box shape. Great for a photo inside a school report paragraph -- the words go around the image instead of under it. This is the most common choice." },
      { front: "How do I add a 3x4 table fast?", back: "Click Insert tab > Table. A grid pops up. Hover to pick 3 columns and 4 rows, then click. A blank table appears. Click inside a cell to type. Press Tab to jump to the next cell." },
      { front: "What's the difference between Merge Cells and Split Cells?", back: "Merge joins several cells into one big cell (nice for a table heading that spans all columns). Split breaks one cell into smaller cells. They are opposites -- don't mix them up." },
      { front: "My picture is in the wrong place. How do I fix it?", back: "Click the picture, then choose a wrapping option like 'Square' so text flows around it. Then drag the picture where you want it on the page. With Square wrapping the paragraph neatly rewraps around the new position." },
    ],

    // Topic 4: MS Excel -- Creating Worksheets
    4: [
      { front: "What is a cell in Excel?", back: "One little box in the Excel grid. Every cell has a unique address like A1, B3, or D12 -- the column letter comes first, then the row number. Think of it like a seat number in a cinema." },
      { front: "What does 'cell B3' mean?", back: "The box where column B (the second column) meets row 3 (the third row). Always column letter first, then row number." },
      { front: "Worksheet vs Workbook -- what's the difference?", back: "A Worksheet is one tab (one page of cells). A Workbook is the whole Excel file (the .xlsx), which can contain many Worksheets. Like one notebook with many pages." },
      { front: "What 4 kinds of things can a cell hold?", back: "A number (5000), text (Samsa), a date (21/04/2026), or a formula (=A1+B1). Excel guesses which one from what you type." },
      { front: "Why is my number stuck to the LEFT of the cell?", back: "Left-aligned numbers mean Excel thinks it's text, not a real number. Fix: right-click > Format Cells > Number. Or retype the value in a fresh cell. Real numbers sit on the RIGHT." },
      { front: "How do I add the heading row for a shopping list?", back: "In row 1: type 'Item' in A1, press Tab, type 'Price (UZS)' in B1. Tab moves you right. Now fill items and prices from row 2 downwards. Row 1 is always for headings." },
    ],

    // Topic 5: MS Excel -- Formulas & Functions
    5: [
      { front: "What character does every Excel formula start with?", back: "The equals sign (=). Without it, Excel shows your text as plain writing. With it, Excel calculates. Forgetting = is the #1 Excel mistake students make." },
      { front: "What does =SUM(A1:A10) do?", back: "Adds every number from cell A1 down to cell A10 and shows the total. The colon (:) means 'every cell from-to'. Great for getting the total of a shopping list." },
      { front: "What does =AVERAGE(B1:B5) give me?", back: "The average (mean) of the numbers in B1 to B5. If those are your 5 test marks, this is your term average. Excel adds them all and divides by how many there are." },
      { front: "What does MAX do vs MIN?", back: "=MAX(C1:C30) finds the BIGGEST number in that range -- top score, most expensive item. =MIN(C1:C30) finds the SMALLEST -- lowest mark, cheapest item. Opposites." },
      { front: "4 non at 3000 UZS each -- which formula?", back: "=3000*4 (uses * for times). Gives 12000 UZS. The * symbol is the multiply sign in Excel, not x. Always start with =." },
      { front: "My cell shows ##### instead of a number. What's wrong?", back: "The column is too narrow to show the number. Double-click the right edge of the column letter (like the line between B and C) and Excel auto-widens it. The number comes back." },
      { front: "Why are Excel formulas called 'alive'?", back: "If you write =A1+B1 and later change A1 from 10 to 50, the answer in the formula cell updates by itself. You build the formula once and it keeps working whenever the numbers change. That's the magic of Excel." },
    ],

    // Topic 6: MS Excel -- Data Management
    6: [
      { front: "What's the difference between sorting and filtering?", back: "Sorting rearranges the ORDER of rows (A to Z, smallest to biggest). Filtering HIDES rows that don't match a rule (like 'only show scores above 80'). Sorting keeps every row visible; filtering hides some, but doesn't delete them." },
      { front: "How do I filter to see only high scores?", back: "Click any cell in your data > Data tab > Filter. Small arrows appear on each column. Click the arrow on the Marks column > Number Filters > Greater Than > 80. Only rows above 80 remain visible." },
      { front: "My aunt's birthday list has 40 people. How do I see who's next?", back: "Sort the list by the Birthday column, oldest date first -- the next upcoming birthday floats to the top. Data tab > Sort. Sorting by date is faster than filtering because 'next month' might miss someone early in the month after." },
      { front: "Where do I find Sort and Filter in Excel?", back: "Both are on the Data tab of the Ribbon. Click any cell inside your table, then click Sort or Filter. Filter adds little arrows to each column heading that open a menu of options." },
      { front: "How do I pull a value from another sheet?", back: "Write =SheetName!CellAddress. Example: =Sheet2!A1 pulls cell A1 from Sheet2 into your current sheet. If the sheet name has spaces, wrap it in single quotes: ='Shop Sales'!B10." },
      { front: "Is a filter safe? Will I lose my data?", back: "No -- filtering only HIDES rows, it doesn't delete them. Turn the filter off (Data > Filter again) and every row comes back. That's why filtering is 'non-destructive'." },
    ],

    // Topic 7: MS PowerPoint -- Creating Presentations
    7: [
      { front: "What file type does MS PowerPoint make?", back: "A .pptx file. Just like Word makes .docx and Excel makes .xlsx, PowerPoint has its own format for presentations. Each Office app has a three-letter extension starting with the app's name." },
      { front: "What are the 3 building blocks of a presentation?", back: "Slides (one page each), Themes (a ready-made look -- colours, fonts, background for ALL slides), and Layouts (ready-made shapes like Title Slide, Title + Content, Two Content)." },
      { front: "How do I add a new slide?", back: "Press Ctrl+M, or click Home tab > New Slide. Click the little arrow under 'New Slide' to pick a specific layout (like Two Content for a comparison slide)." },
      { front: "What's a theme and why should I pick one first?", back: "A theme sets the colours, fonts, and background for EVERY slide at once. Pick one on the Design tab before you start typing -- then all your slides look the same, no per-slide design work needed." },
      { front: "How many words should I put on a slide?", back: "Keep it short -- about 5 short lines per slide, no long paragraphs. If you dump a full essay on a slide, your class reads it faster than you speak and stops listening. Slides are KEY POINTS, your mouth gives the detail." },
      { front: "Which layout for 'before vs after' on one slide?", back: "Two Content. It gives you a title at the top and two equal content boxes side by side below. Perfect for any side-by-side comparison -- healthy food vs junk food, summer vs winter, before vs after." },
    ],

    // Topic 8: MS PowerPoint -- Master Slides & Slide Shows
    8: [
      { front: "What is a Slide Master?", back: "A 'parent slide' that sets how every slide in your presentation looks. Put the school logo on it ONCE, and every slide automatically shows the logo. Find it at View tab > Slide Master." },
      { front: "F5 vs Shift+F5 -- what's the difference?", back: "F5 starts the slideshow from slide 1 (for the real presentation). Shift+F5 starts from the slide you're currently on (handy for practicing just one section)." },
      { front: "Transitions vs animations -- what's the difference?", back: "A Transition is the effect BETWEEN slides -- the little fade or wipe when you go from slide 3 to slide 4. An Animation is the effect on something INSIDE one slide -- a bullet point flying in, a picture appearing on click." },
      { front: "I have 20 slides and need my school logo on every one. What's fastest?", back: "View > Slide Master > paste the logo ONCE on the master slide > Close Master View. All 20 slides now show the logo in the same place. Much faster than pasting 20 times." },
      { front: "What is Presenter View?", back: "A secret window YOU see while presenting: your speaker notes, a timer, and the next slide. The class sees only the current slide on the big screen. Great for remembering what to say without reading the slides out loud." },
      { front: "Why shouldn't I use lots of flashy animations?", back: "Too much motion distracts your audience -- they watch the spinning text instead of listening to YOU. Use animations only to REVEAL points one by one, not to decorate. Simple is professional." },
    ],

    // Topic 9: Which Tool When?
    9: [
      { front: "The 3-second decision rule -- which tool when?", back: "Am I writing? -> MS Word. Am I doing numbers? -> MS Excel. Am I presenting? -> PowerPoint. Match the main job of the task to the tool, and you'll never pick wrong." },
      { front: "Which tool for a CV?", back: "MS Word (or Google Docs). A CV is a formatted one-page document with name at the top, bullet-list jobs, and education -- exactly what a word processor does. Not Excel (it's a grid) and not PowerPoint (it's for slides)." },
      { front: "Which tool for a family monthly budget in UZS?", back: "MS Excel. You need rows of amounts, SUM at the bottom, AVERAGE for the month, and maybe a sort by date. That's Excel's home ground." },
      { front: "Which tool for a 5-minute class presentation?", back: "MS PowerPoint. When you stand up and speak to people, slides on the big screen help the audience follow you. Keep each slide short and visual." },
      { front: "Can Word, Excel, and PowerPoint work together?", back: "Yes! You can paste an Excel chart into a Word report. You can copy an Excel table onto a PowerPoint slide. A big school project usually uses all three -- data in Excel, report in Word, presentation in PowerPoint." },
      { front: "Why can't one single app do everything well?", back: "Each tool was built for one main job: Word for prose, Excel for numbers, PowerPoint for slides. Forcing one tool to do another's job is like using a hammer on a screw -- it sort of works, but badly. Pick the right tool and the work is fast." },
    ],
  },

  // ━━━ Module 3: Social Media ━━━
  3: {
    // Topic 1: Introduction to Social Media
    1: [
      { front: "What is social media, in simple words?", back: "Any app or website where normal users make their own posts AND can reply to each other. Instagram, TikTok, Telegram, YouTube, and Facebook are all social media. The 'two-way' part is what makes it different from old TV." },
      { front: "Why is social media 'two-way' but TV is 'one-way'?", back: "On TV you can only watch -- you can't answer back. On social media you can post, comment, reply, and share. Both sides send messages, not just the broadcaster." },
      { front: "Name 3 everyday things you already do that count as social media.", back: "Posting an Instagram Story of your lunch, replying in a Telegram group chat, and leaving a comment on a YouTube video. Every time you post or reply -- that's social media." },
      { front: "Why is social media so useful for a small Tashkent shop?", back: "It's almost free -- a Chorsu samsa shop can post a fresh photo every morning for zero som. Customers also leave instant feedback in the comments ('tasty!' / 'too salty') the same day." },
      { front: "Name 3 things to watch out for on social media.", back: "1) Not everything is true -- people lie online. 2) Apps are built to keep you scrolling, so 2 hours feel like 10 minutes. 3) What you post stays online, even if you delete it later." },
      { front: "Is a YouTube comment section social media?", back: "Yes. You post (your comment), other users reply, the creator can heart it. That's a two-way conversation -- the key feature of social media." },
    ],

    // Topic 2: Types of Social Media Platforms
    2: [
      { front: "Match the app to what it's best for: Instagram, TikTok, YouTube, Telegram, LinkedIn.", back: "Instagram = photos and Reels. TikTok = short vertical videos. YouTube = longer videos and learning. Telegram = chat and news channels (#1 in Uzbekistan). LinkedIn = jobs and online CV." },
      { front: "Why does my TikTok For You page feel so personal?", back: "TikTok's algorithm watches what you finish, like, and share. Then it shows MORE of the same type. Watch three football videos and your feed fills with football -- the app learned your taste." },
      { front: "Which app is most popular in Uzbekistan for news and group chats?", back: "Telegram. @gazeta_uz, school groups, class groups, and most Tashkent news channels live there. Teens in Uzbekistan use it every day." },
      { front: "Who mostly uses Facebook in Uzbekistan?", back: "Adults over 30 -- parents, teachers, small-business owners. Teens mostly prefer Instagram and TikTok. Knowing WHO is on each app helps a shop pick the right one." },
      { front: "Can you post the exact same thing on Instagram and LinkedIn?", back: "Usually no. A LinkedIn-style post looks boring on TikTok; a TikTok dance looks unprofessional on LinkedIn. Each app has its own style and audience -- adapt the post." },
      { front: "What's LinkedIn for?", back: "A professional app -- like an online CV. It's used to find internships and first jobs after university. No party photos, no memes. Not popular with teens, but useful when you start job-hunting." },
      { front: "Why does Instagram trap you in one topic over time?", back: "The algorithm shows more of what you already watched. Only football clips in = only football out. To widen the feed, like a few new kinds of posts on purpose." },
    ],

    // Topic 3: Social Media Management Tools
    3: [
      { front: "What is a 'social media management tool'?", back: "An app that lets you post and reply across many social apps from one place. Instead of opening Instagram, TikTok, and Telegram separately, you write in one dashboard and the tool posts for you." },
      { front: "Name 3 tools a student or small shop might use.", back: "Buffer, Later, and Metricool -- all have free plans that can schedule posts to Instagram, TikTok, and Facebook. Canva is a separate helper for designing the post's picture." },
      { front: "What does 'scheduling a post' mean?", back: "You write the post now, pick a future time, and the tool posts it automatically at that time. Example: on Sunday, line up 5 posts for Monday-Friday at 7 p.m., then forget about it." },
      { front: "What is a 'unified inbox'?", back: "One screen that shows DMs and comments from every app you use -- Instagram, Facebook, Telegram. You reply without jumping between apps, so nothing gets missed." },
      { front: "Does Canva do the same thing as Buffer?", back: "No -- different jobs. Canva DESIGNS the picture (templates, drag-and-drop). Buffer SCHEDULES when to post. Small pages often use both together -- design in Canva, schedule in Buffer." },
      { front: "Does scheduling replace replying to followers?", back: "No. Scheduling handles POSTS. Replies, comments, and DMs are a separate daily job. If you schedule 50 posts and ignore every comment for a month, followers feel unheard and leave." },
      { front: "What's a catch with free plans?", back: "Most have a limit (often 10-30 posts per month). Enough for a student-run page or one-person shop. A big chain with 4 branches usually needs a paid plan." },
    ],

    // Topic 4: Social Media Measurement & Reporting
    4: [
      { front: "What does 'reach' mean in plain English?", back: "How many DIFFERENT people saw your post. If your best friend looks three times, she still counts as one. Reach is 'how wide did it go.'" },
      { front: "Which is stronger: a like, a comment, or a share?", back: "A share is strongest -- the person wanted their friends to see it too. A comment is next (real effort to type). A like is weakest -- one fast tap. Shares matter most, likes least." },
      { front: "What's a 'save' and why does it matter?", back: "A save = the person bookmarked your post to come back later. Common for recipes, study tips, shopping lists. Saves are a quiet sign that the post was USEFUL." },
      { front: "Is 10,000 followers always better than 500?", back: "Not really. 10,000 silent or fake followers are worth less than 500 real ones who like, comment, and share. Follower count alone is a weak number -- look at engagement too." },
      { front: "How often should I check my page's numbers?", back: "About once a week is enough. Every 5 minutes is stressful and useless. Compare this week to last week to spot trends, not one bad day." },
      { front: "Post A got 300 likes, 3 comments. Post B got 150 likes, 80 comments, 40 saves. Which is better?", back: "Post B. Fewer likes but real conversation (80 comments) and many saves (40) -- people kept the recipe. Depth beats easy taps." },
    ],

    // Topic 5: Social Advertising
    5: [
      { front: "What is a social media ad, in simple words?", back: "A normal-looking post that a shop PAID the app to show to people who don't follow them yet. You can tell it's an ad by the small 'Sponsored' label under the shop's name." },
      { front: "Free post vs paid post -- what's the difference?", back: "Free: only your followers and some friends-of-friends see it (small reach). Paid: the shop pays the app to push the post to many more people, including total strangers the shop chose." },
      { front: "How does a shop pick who sees its ad?", back: "Three simple filters: age, city, and interests. Example: 'people aged 16-25 in Tashkent who like food.' The app already knows all this from your taps." },
      { front: "How does a daily budget protect a small shop?", back: "The shop sets a daily cap (say 20,000 som). Once it's spent, the app stops showing the ad until tomorrow. No surprise bills at the end of the month." },
      { front: "Does a paid ad fix a bad product?", back: "No. If the photo is blurry and the cafe is dirty, paying more money just means more people see the bad cafe. Fix the product first, then advertise." },
      { front: "Give 3 places you see social ads every day.", back: "1) Instagram 'Sponsored' posts between friends' posts. 2) TikTok ad clips on your For You page. 3) YouTube 'Skip Ad' 5-15 seconds before your video." },
    ],

    // Topic 6: Facebook Marketing
    6: [
      { front: "Who mostly uses Facebook in Uzbekistan?", back: "Adults over 30 -- parents, aunties, teachers, small-business owners. Teens mostly skip Facebook and live on Instagram and TikTok instead. Knowing this picks the right app for the customer." },
      { front: "What is a Facebook 'Page'?", back: "A free public profile for a business -- shop name, address, hours, photos, phone. Customers can follow it without becoming 'friends.' Different from a personal profile." },
      { front: "What does it mean to 'boost a post' on Facebook?", back: "Take a good post (like a photo of the new menu) and pay Facebook a small amount so MORE adults see it. The easiest first ad anyone can run." },
      { front: "Why can one tool post to both Facebook and Instagram at once?", back: "Because Meta owns both apps. Meta's 'Business Suite' lets you write one post and send it to both Facebook and Instagram together -- two apps, one click." },
      { front: "How can a home-baker use a Facebook group to get customers?", back: "Join local groups like 'Tashkent food lovers' or 'Chilanzar mums.' Share a useful post (photo + price) and real local adults see it -- for free, no ad money needed." },
      { front: "Should a home bread-baker use Facebook or Instagram?", back: "Facebook -- her customers are adult neighbours, and adults in Uzbekistan mostly use Facebook. A teen cafe near a school would be the opposite -- Instagram fits better." },
      { front: "What's a simple first-week Facebook plan for a small shop?", back: "Create a free Page (name, phone, address, photos, hours), join 2 local groups, and post one helpful post. Don't spend on ads yet -- grow the free Page first." },
    ],

    // Topic 7: X (formerly Twitter) Marketing
    7: [
      { front: "What is X (the app formerly called Twitter)?", back: "A social app mainly for very short posts -- usually under 280 letters. Like a public SMS board: anyone can post, anyone can reply. Big in the USA, UK, India, Japan." },
      { front: "Is X popular in Uzbekistan?", back: "No -- X is blocked in Uzbekistan. Most Uzbek users get short news updates on Telegram channels instead (@gazeta_uz, @uzinfocom, football teams, singers)." },
      { front: "What's a retweet (or repost)?", back: "Sharing someone else's post with your own followers. Like forwarding a message in Telegram -- the original writer gets more reach, and your followers see the post." },
      { front: "What does a hashtag do?", back: "A word with # in front, like #Tashkent or #IFP105. Anyone who clicks it sees every post using the same hashtag -- it groups posts into one topic page." },
      { front: "Why should an Uzbek student still learn the basics of X?", back: "You may travel or study abroad where X works. Breaking world news (sports, elections, earthquakes) often hits X first. Knowing tweet / retweet / hashtag is useful when you go." },
      { front: "Should a Tashkent bookshop open an X account or a Telegram channel?", back: "Telegram channel. X is blocked in Uzbekistan, so local customers can't easily see X posts. Telegram is where the audience is, and it does the same 'short updates' job." },
      { front: "Why do big Western companies reply fast to X complaints?", back: "Because X complaints are PUBLIC -- everyone watching. Silence looks bad, so companies answer quickly. That's why many US/UK brands handle customer service on X first." },
    ],
  },

  // ━━━ Module 4: HTML & Web Development ━━━
  4: {
    // Topic 1: World Wide Web
    1: [
      { front: "Is the web the same as the internet?", back: "No. The internet is the network (cables, Wi-Fi, phone signal). The web is ONE service running on it -- the pages you visit in a browser. Email and WhatsApp also use the internet but are not the web." },
      { front: "What is a URL, in simple words?", back: "A web address. Example: https://yandex.uz/news. It has a protocol (https://), a domain (yandex.uz), and sometimes a path (/news)." },
      { front: "What does the 's' in HTTPS mean and why should you care?", back: "Secure. HTTPS scrambles your data on the way, so a stranger on the cafe Wi-Fi can't read your password. Never type a password on an http:// page with no 's'." },
      { front: "What does the .uz ending on a domain tell you?", back: "The site is registered in Uzbekistan. Other endings: .com (global business), .ru (Russia), .edu (education), .org (non-profit)." },
      { front: "What is a web browser? Name three.", back: "An app that loads and shows web pages. Chrome, Firefox, Edge, Safari are the big four. Type a URL in the bar, the browser fetches the page from the server." },
      { front: "What is a web server?", back: "A powerful computer somewhere in the world that stores a website and sends the pages to your browser whenever you ask for them." },
    ],

    // Topic 2: HTML & Basic Tags
    2: [
      { front: "What does HTML stand for?", back: "HyperText Markup Language. Hypertext = text with links. Markup = adding tags around the content. It's the language every web page is built with." },
      { front: "What is the basic shape of every HTML page?", back: "<!DOCTYPE html> on line 1, then <html> wrapping <head> (settings, <title>) and <body> (visible content: headings, paragraphs, images, links)." },
      { front: "What goes in <head> vs <body>?", back: "<head> = info about the page (browser tab title, settings) -- NOT shown on the page. <body> = everything a visitor actually sees." },
      { front: "How do you set the text on the browser tab?", back: "Put <title>My Page</title> inside <head>. It's NOT the heading on the page -- that's <h1>. They can be different text." },
      { front: "What are <h1> to <h6>?", back: "Heading tags. <h1> is the biggest (usually the main page title), <h6> is the smallest. Use <h1> once per page for the main title." },
      { front: "How do you save an HTML file so the browser reads it?", back: "Save the file with a .html ending (for example me.html), not .txt. Double-click it and it opens in Chrome. .txt just shows the tags as plain text." },
    ],

    // Topic 3: HTML Elements
    3: [
      { front: "What is the difference between a tag and an element?", back: "A tag is one piece: <p> or </p>. An element is the whole thing: <p>Hello</p> -- opening tag + content + closing tag together." },
      { front: "What is a self-closing tag? Give three.", back: "A tag with no content and no closing tag. Examples: <br> (line break), <hr> (horizontal line), <img> (image). All info goes in attributes." },
      { front: "Why does the closing tag have a / in it?", back: "The slash tells the browser 'this element ends here.' Without </h1>, the browser keeps the heading open and every word after becomes a giant heading." },
      { front: "What does <br> do?", back: "Adds a line break inside a paragraph -- the next text goes on a new line. Self-closing, no </br> needed. Example: My address<br>in Tashkent." },
      { front: "What does <hr> do?", back: "Draws a horizontal line across the page -- good for splitting sections. Self-closing, no </hr> needed." },
      { front: "Should you write </img> for an image?", back: "No. <img> is self-closing -- all its info goes in attributes (src, alt, width) inside the one tag. Adding </img> isn't standard HTML." },
    ],

    // Topic 4: HTML Attributes
    4: [
      { front: "What is an HTML attribute?", back: "Extra info inside the opening tag, written as name=\"value\". Examples: <img src=\"cat.jpg\" width=\"200\" alt=\"a cat\">." },
      { front: "What does src do in an <img> tag?", back: "Source -- tells the browser which image file to show. Example: src=\"photo.jpg\" (same folder) or src=\"https://site.uz/logo.png\"." },
      { front: "What does href do in an <a> tag?", back: "Hypertext reference -- the URL where the link goes. Example: <a href=\"https://yandex.uz\">Go to Yandex</a>." },
      { front: "Why should every <img> have an alt attribute?", back: "alt is the backup text. It shows up if the image fails to load, and it's read aloud by screen readers for blind users. Small attribute, big accessibility win." },
      { front: "Where do attributes live -- opening or closing tag?", back: "Always in the OPENING tag. Never the closing tag. Values go in quotes: width=\"200\", not width=200." },
      { front: "Your photo shows a broken-image icon. What are the top reasons?", back: "Wrong src (bad filename), photo in a different folder, or the photo file isn't actually there. Check the src and the folder first." },
    ],

    // Topic 5: HTML Comments
    5: [
      { front: "What is the HTML comment syntax?", back: "<!-- your note here -->. Starts with <!-- and ends with -->. The browser ignores everything between." },
      { front: "Do comments show up on the page?", back: "No. The browser skips them when it paints the page. But they ARE in the file -- anyone can see them with right-click > View Page Source." },
      { front: "Name three reasons to use comments.", back: "1) Explain what your code does. 2) Label sections (<!-- Menu table -->). 3) Hide broken code temporarily without deleting it." },
      { front: "Can you put a password inside a comment to hide it?", back: "No! Never. Anyone can view the page source and read every comment. Comments are invisible on the PAGE, not in the FILE." },
      { front: "Why do teachers love seeing comments in exam HTML?", back: "Labels like <!-- Table -->, <!-- List -->, <!-- Link --> above each section show you understand your structure. Free clarity marks for almost no effort." },
      { front: "How can a comment help when debugging?", back: "Wrap broken code in <!-- ... --> to turn it off without deleting it. Fix the rest of the page, then take the comment markers off to bring the code back." },
    ],

    // Topic 6: HTML Formatting
    6: [
      { front: "What tags make text bold, italic, and underlined?", back: "<b>bold</b>, <i>italic</i>, <u>underline</u>. Wrap the words you want styled. Close each one properly." },
      { front: "What does the <mark> tag do?", back: "Puts a yellow background behind the text, like a highlighter pen. Example: <mark>Friday</mark>. Great for key words and important dates." },
      { front: "What's the difference between <b> and <strong>?", back: "Both make text look bold. <strong> also adds a hint of 'this is important' for screen readers. For a simple page, <b> is fine." },
      { front: "How do you combine bold AND italic on the same words?", back: "Nest the tags: <b><i>text</i></b>. Open both, close in reverse order (last opened = first closed)." },
      { front: "Why should you avoid <u> on normal text?", back: "On the web, underlined text usually means a link. If you underline a normal word, users will try to click it. Use <b> or <mark> for emphasis instead." },
      { front: "What does <small> do?", back: "Makes text smaller than normal. Good for fine print like disclaimers, phone numbers in a footer, or copyright notes." },
    ],

    // Topic 7: HTML Tables
    7: [
      { front: "What are the four key tags for an HTML table?", back: "<table> (outer wrapper), <tr> (table row), <th> (header cell, bold), <td> (data cell). Rule: table > tr > th/td." },
      { front: "What's the correct nesting order for tables?", back: "<table> contains <tr>, and each <tr> contains <th> or <td>. Never put <td> straight inside <table> -- it must be inside a <tr>." },
      { front: "Why do most tables have border=\"1\" on the <table> tag?", back: "Without a border, the table grid is invisible. Data is there but no lines. <table border=\"1\"> adds visible lines around every cell." },
      { front: "What's the difference between <th> and <td>?", back: "<th> = table header (bold and centred by default) -- use for column titles like Dish, Price, Day. <td> = regular data cell for the actual numbers and words." },
      { front: "What does <tr> stand for?", back: "Table Row -- one horizontal row of the table. One <tr> can hold many cells (<th> or <td>). Always inside <table>." },
      { front: "When should you NOT use a table?", back: "For page layout (header + menu + content). Tables are for DATA with real rows and columns (menus, schedules, prices). CSS handles layout better." },
    ],

    // Topic 8: HTML Lists
    8: [
      { front: "What's the difference between <ol> and <ul>?", back: "<ol> = Ordered List (numbered 1, 2, 3) -- use when order matters, like cooking steps. <ul> = Unordered List (bullets) -- use for any-order lists like shopping." },
      { front: "What tag is used for each list item?", back: "<li> = List Item. The same tag works inside both <ol> and <ul>. Only the outer wrapper (<ol> or <ul>) decides numbers vs bullets." },
      { front: "Memory trick: how to remember <ol> vs <ul>?", back: "Ordered = One, two, three (numbers). Unordered = Unhappy with any order (just bullets). Pick the one that matches what your list means." },
      { front: "Can you put a list inside another list?", back: "Yes. Put a new <ul> or <ol> inside an <li>. That's how you make outlines and sub-points. Browsers indent nested lists automatically." },
      { front: "If you swap <ol> for <ul>, what changes?", back: "Only the marker -- numbers become bullets. The <li> items themselves stay exactly the same. That's why <li> is one tag for both list types." },
      { front: "Why is <ul> wrong for cooking steps?", back: "Steps have a strict order -- step 1 must come before step 2. <ul> gives bullets, which hides the order. Use <ol> so the numbers 1, 2, 3 show the sequence." },
    ],

    // Topic 9: Hyperlinks
    9: [
      { front: "What tag creates a hyperlink?", back: "The anchor tag: <a href=\"URL\">visible text</a>. Example: <a href=\"https://yandex.uz\">Search Yandex</a>." },
      { front: "What does the href attribute do?", back: "Holds the URL -- where the link goes when clicked. Without href, the <a> looks like a link but goes nowhere." },
      { front: "How do you make a link open in a new tab?", back: "Add target=\"_blank\" to the anchor tag: <a href=\"url\" target=\"_blank\">Text</a>. Underscore-blank, no space. Great for external links." },
      { front: "What happens without target=\"_blank\"?", back: "The link opens in the SAME tab, replacing your current page. Good for internal links (menu, about, contact) where the user is still on your site." },
      { front: "What's the difference between a relative and absolute link?", back: "Relative: href=\"about.html\" -- a file in the same folder. Absolute: href=\"https://amity.edu\" -- a full URL to another site. Use relative for your own pages." },
      { front: "Why is 'click here' a bad link text?", back: "It tells the user nothing about where the link goes. Better: 'Read our menu' or 'Visit Amity' -- descriptive text helps users AND search engines understand your page." },
    ],

    // Topic 10: Images & Image Links
    10: [
      { front: "What tag displays an image?", back: "<img src=\"file.jpg\" alt=\"description\" width=\"200\">. Self-closing -- no </img>. All info goes in attributes: src, alt, width." },
      { front: "How do you make an image clickable?", back: "Wrap it inside an <a>: <a href=\"url\"><img src=\"pic.jpg\" alt=\"text\"></a>. The anchor is always on the OUTSIDE, the image on the inside." },
      { front: "What are the three essential attributes of <img>?", back: "src (which file), alt (backup text for accessibility + fallback), and width (size in pixels). Height is optional -- the browser keeps the shape." },
      { front: "Why is alt important, even if the image loads fine?", back: "Screen readers read alt aloud for blind users. Search engines use it to understand what's in the image. And if the image ever fails to load, the alt text shows up." },
      { front: "Is <img> self-closing?", back: "Yes. No </img> needed. All the info fits inside the one tag using attributes. Same for <br> and <hr>." },
      { front: "What's the rule for picking a good width?", back: "Set a width that matches how big you want the image on the page (like width=\"300\" for a photo in an article). This also stops the page from jumping while images load." },
    ],

    // Topic 11: Build a Full HTML Page
    11: [
      { front: "What 7 things should a complete exam HTML page have?", back: "1) Skeleton (<!DOCTYPE html>, html, head with title, body). 2) Heading. 3) Formatted paragraph (with <b> or <i>). 4) Table. 5) List. 6) Hyperlink. 7) At least one comment." },
      { front: "What must appear on line 1 of every HTML page?", back: "<!DOCTYPE html>. This tells the browser to use modern HTML5 rules. Skipping it can trigger 'quirks mode' and break layouts." },
      { front: "Name five common beginner HTML mistakes.", back: "1) Missing <!DOCTYPE html>. 2) Forgetting closing tags (</h1>, </p>). 3) <td> without a <tr> around it. 4) Table with no border=\"1\". 5) Missing alt on images." },
      { front: "What's the correct order of the main sections?", back: "<!DOCTYPE html> first, then <html> wrapping <head> (with <title>) BEFORE <body>. Head before body, always." },
      { front: "How should you use comments in an exam answer?", back: "Label each section: <!-- Heading -->, <!-- Subjects table -->, <!-- Hobbies list -->, <!-- Link -->. Shows the examiner you planned your page -- easy marks." },
      { front: "If you're building an 'About Me' page, which tag does each part need?", back: "<h1> for name, <p> with <b> or <i> for intro, <img> for photo, <table> for subjects and grades, <ul> or <ol> for hobbies, <a href=\"...\"> for a link. One tag per role." },
      { front: "A classmate says 'as long as it renders, the teacher will give full marks.' Is that true?", back: "No. Teachers grade on structure, correct tag choice, proper nesting, and comments that show understanding. 'Renders' is the minimum, not the target." },
    ],
  },

  // ━━━ Module 5: Tech Trends ━━━
  5: {
    // Topic 1: Artificial Intelligence (AI) — simple, school-level
    1: [
      { front: "What is Artificial Intelligence (AI), in simple words?", back: "Software that can do things that usually need a human brain — like recognising your face, understanding your voice, or guessing what video you'll like next on TikTok." },
      { front: "Name 3 AI apps you probably used this week.", back: "Face ID on your phone, Yandex Taxi predicting your arrival time, and the TikTok or Instagram 'For You' feed picking videos for you." },
      { front: "Why is today's AI called 'narrow' AI?", back: "Because each AI is built for just ONE task. Siri can answer questions but can't drive a car. Netflix picks shows but can't write your essay." },
      { front: "How is AI different from a normal computer program?", back: "A normal program follows step-by-step rules written by a human. AI learns patterns by itself from lots of examples." },
      { front: "Can AI be wrong?", back: "Yes. AI can sound very sure of itself and still be wrong (a 'hallucination'). Always check important facts with a trusted source." },
      { front: "Why can AI end up being unfair?", back: "AI learns from past data. If the past was unfair (for example, past hiring favoured one group), the AI can copy that unfair pattern without anyone telling it to." },
    ],

    // Topic 2: Machine Learning (ML) — simple, school-level
    2: [
      { front: "What is Machine Learning (ML), in simple words?", back: "When a computer learns from lots of examples instead of following rules a person wrote. The more examples it sees, the better it gets." },
      { front: "How is ML different from a normal program?", back: "A normal program: a human writes every rule. ML: you give the computer lots of examples, and it finds its own rules in the data." },
      { front: "Give an everyday example of ML at work.", back: "Gmail spam filter. Millions of users clicked 'spam' or 'not spam' — Gmail learned from those clicks, so it can catch new spam it has never seen before." },
      { front: "How does Spotify know which songs you'll like?", back: "ML watches what you play, skip, and save. It groups similar-sounding songs, then recommends more of what you already enjoy." },
      { front: "How is ML related to AI?", back: "AI is the big goal ('make computers act smart'). ML is the most popular way to reach it ('let computers learn from examples'). Most AI apps today use ML inside." },
      { front: "Why is good data so important for ML?", back: "ML is only as good as the examples it sees. Bad or unfair data teaches the model wrong patterns — the old rule: garbage in, garbage out." },
    ],

    // Topic 3: Data Analytics — simple, school-level
    3: [
      { front: "What is Data Analytics, in simple words?", back: "Taking raw numbers and turning them into useful answers that help people make better decisions — like shops, banks, hospitals, or schools do every day." },
      { front: "What are the four questions data analytics can answer?", back: "1) What happened? 2) Why did it happen? 3) What will happen next? 4) What should we do about it?" },
      { front: "Which type of analytics does Uzum use when it shows 'phone sales went up 20% last month'?", back: "Descriptive analytics — 'what happened.' It summarises the past using totals and percentages." },
      { front: "Which type of analytics is Yandex Taxi doing when it predicts 'high demand near the metro at 6 p.m.'?", back: "Predictive analytics — 'what will happen next.' It uses past rides and times to guess busy zones." },
      { front: "Give a Tashkent example of prescriptive analytics.", back: "A ride app saying 'send more drivers to the metro at 5:45 p.m.' — it doesn't just predict, it recommends an action." },
      { front: "Why is data analytics useful in real life?", back: "It helps shops stock the right items, banks catch fraud quickly, hospitals spot disease trends, and schools see which students need extra help. Decisions based on facts instead of guesses." },
    ],

    // Topic 4: Cloud Computing (simple, school-level)
    4: [
      { front: "What is Cloud Computing, in simple words?", back: "Saving your files and running apps on big computers on the internet, not only on your own phone or laptop. The 'cloud' is just someone else's powerful computer in a data centre." },
      { front: "Name 3 cloud apps you already use every day.", back: "Google Drive / Google Photos (save files + photos). Gmail + Google Docs (work in the browser). YouTube / Netflix / Spotify (stream videos and music). None of these live on your device." },
      { front: "Why can you open your Google Photos from your phone AND your laptop?", back: "The photos are saved on Google's cloud servers on the internet, not only on one device. Any device that signs in with your account sees the same photos." },
      { front: "What is the main difference between cloud storage and saving only on your laptop?", back: "Laptop-only files live on ONE device -- if it breaks or is lost, the file is gone. Cloud files live on the internet -- you can open them from any device, and they survive even if your laptop dies." },
      { front: "Name 3 benefits of saving to the cloud.", back: "1) Open your files from any device. 2) Automatic backup -- if your phone breaks, your photos are still safe. 3) Share and work together on one file at the same time (like Google Docs)." },
      { front: "What is the biggest limitation of the cloud?", back: "You need the internet to reach your files. No Wi-Fi or mobile data = no access. Always keep an offline copy of anything critical (like your final project before submission)." },
      { front: "Your laptop breaks the night before a project is due. How would the cloud have saved you?", back: "If the project was saved to Google Drive / OneDrive, you just sign in from any other computer (cousin, friend, library) and keep working from exactly where you stopped." },
      { front: "How do you keep your cloud account safe?", back: "Use a strong password (long, not reused) and turn on 2-step sign-in (a code to your phone). Your files sit on someone else's computer, so the account is the lock on the door." },
    ],

    // Topic 5: Blockchain — simple, school-level
    5: [
      { front: "What is blockchain, in simple words?", back: "A shared digital notebook copied across many computers. When someone writes a new line, every copy updates, and nothing can be secretly changed later." },
      { front: "Is blockchain the same as Bitcoin?", back: "No. Bitcoin is ONE kind of money that runs on a blockchain. Blockchain is the underlying technology — like the road, while Bitcoin is one car that drives on it." },
      { front: "Why is it so hard to cheat a blockchain?", back: "Many computers keep copies of the same record. If you try to change one copy, all the other copies still show the original — so the cheat is caught." },
      { front: "Name 3 real uses of blockchain today.", back: "1) Cryptocurrencies like Bitcoin and Ethereum. 2) Tracking food or medicine from factory to shop. 3) Testing new forms of land-ownership records in some countries." },
      { front: "What are the biggest risks with crypto?", back: "Prices jump up and down a lot, scams are common, and if you lose your password ('private key') your coins are gone forever. In Uzbekistan, crypto rules are strict — always check the law." },
      { front: "Does blockchain always make things better?", back: "No. It shines when many parties must share a record nobody should change. For simple tasks like a shop's stock list, a normal database is cheaper, simpler, and faster." },
    ],

    // Topic 6: Virtual Reality (VR) — simple, school-level
    6: [
      { front: "What is Virtual Reality (VR), in simple words?", back: "A fake world made by a computer that you step into using a headset. The headset covers your eyes, so your real room disappears and you see only the virtual scene." },
      { front: "What gear do you need to use VR?", back: "A VR headset like Meta Quest or PlayStation VR, hand controllers for pointing and grabbing, and built-in 3D sound that changes as you turn your head." },
      { front: "Why does VR feel more real than watching a TV?", back: "The headset tracks your head — when you turn, the scene turns with you. Your real room is hidden, so the brain starts believing you're actually INSIDE the scene." },
      { front: "Name 3 places VR is useful.", back: "1) Games (you physically duck and reach out). 2) Training doctors (practise surgery on a virtual patient, no risk). 3) History class — 'visit' old Samarkand or ancient Rome from your classroom." },
      { front: "What is the main weakness of VR?", back: "The headset covers your eyes, so you can't see the real world. Bad for walking around a bazaar. Can also make people feel dizzy after 20–30 minutes — take breaks." },
      { front: "What is the big difference between VR and AR?", back: "VR replaces the real world (you see only the virtual scene). AR adds digital things on top of the real world (you still see your room or the street)." },
    ],

    // Topic 7: Augmented Reality (AR) — simple, school-level
    7: [
      { front: "What is Augmented Reality (AR), in simple words?", back: "Adding digital things on top of the real world you can see. Instagram dog-ear filters, Uzum 'try this fridge in your room,' and Yandex Maps arrows on the street are all AR." },
      { front: "Name 4 AR apps you probably use.", back: "1) Instagram / TikTok face filters. 2) Pokémon GO. 3) Uzum or IKEA 'place furniture in your room.' 4) Yandex or Google Maps Live View with arrows on the street." },
      { front: "What device do you need for AR?", back: "Usually just a phone camera (Instagram, Uzum, Maps). Some fancier AR uses smart glasses. The real world stays visible — that's the point." },
      { front: "AR or VR — if you can still see the real world?", back: "AR. VR completely blocks the real world. This one line shows up in almost every exam question on these two topics." },
      { front: "Give a Tashkent example where AR is very useful.", back: "Uzum shows a 3D sofa sitting in your actual living room through your phone camera, so you can see if it fits before buying — no tape measure needed." },
      { front: "Why is AR better than VR for walking around Chorsu bazaar?", back: "AR keeps the real street, people, and stalls visible — so you can still see where you're going. VR would cover your eyes and make that dangerous." },
    ],

    // Topic 8: Internet of Things (IoT) — simple, school-level
    8: [
      { front: "What is the Internet of Things (IoT), in simple words?", back: "Everyday objects connected to the internet so they can send data or be controlled from far away. A normal lamp is just a lamp — a lamp you control from your phone is IoT." },
      { front: "Give 4 examples of IoT devices.", back: "1) Smart watches (count steps, read heart rate). 2) Smart doorbells (live video on your phone). 3) Smart AC and lights (control from phone). 4) Connected cars that send data to the maker." },
      { front: "What three things does most IoT do?", back: "1) SENSES something (temperature, motion, heart rate). 2) SENDS the info over the internet. 3) Something useful HAPPENS — a notification, a light turns on, or data is saved." },
      { front: "Give one Uzbek example of IoT that really helps.", back: "A smart doorbell at the front gate. You can see and speak to whoever is there from your phone, even when you're at school or work." },
      { front: "What's the biggest security mistake with IoT?", back: "Leaving the default password. Many people never change the factory password, which lets hackers log in easily. Always change the password when you set up a new device." },
      { front: "What's the privacy worry with IoT?", back: "IoT devices collect a LOT of data about you — where you go, when you sleep, who visits your home. If the company gets hacked, all that info can leak." },
    ],

    // Topic 9: Introduction to Generative AI — simple, school-level
    9: [
      { front: "What is Generative AI, in simple words?", back: "AI that creates new content when you ask it to — text, images, music, videos. ChatGPT writing a birthday message and DALL·E drawing a cat are generative AI." },
      { front: "How is Generative AI different from older AI like a spam filter?", back: "Older AI sorts or predicts from existing content (spam or not spam). Generative AI MAKES new content that didn't exist before." },
      { front: "Does ChatGPT actually understand what it writes?", back: "No. It predicts the next most likely word based on patterns it learned from huge amounts of text. It's fluent pattern-matching, not real understanding." },
      { front: "What does 'GPT' stand for?", back: "Generative Pre-trained Transformer — a type of large AI model (also called an LLM, Large Language Model) that generates text." },
      { front: "Name 4 kinds of content Generative AI can make.", back: "1) Text (ChatGPT, Claude, Gemini, Yandex GPT). 2) Images (DALL·E, Midjourney). 3) Music and voice (Suno, ElevenLabs). 4) Short videos (Sora, Runway)." },
      { front: "Why can ChatGPT be confidently wrong?", back: "It's built to pick the most likely next word, not to check if the answer is true. This is called a 'hallucination' — a fluent, confident lie. Always check important facts." },
    ],

    // Topic 10: Ethical Use of GPTs — simple, school-level
    10: [
      { front: "What does GPT stand for?", back: "Generative Pre-trained Transformer — the kind of AI that powers ChatGPT, Claude, Gemini, and similar tools." },
      { front: "What is an AI 'hallucination'?", back: "When an AI gives a wrong answer with full confidence, as if it were true. It happens because the AI guesses the next likely word, not the actually-true word. Always fact-check." },
      { front: "What are deepfakes?", back: "Fake videos or voice clips made by AI that show a real person saying or doing things they never did. Scammers sometimes use them to fool families, schools, and banks." },
      { front: "Is submitting a ChatGPT essay as your own work cheating?", back: "Yes — that's plagiarism. The assignment is meant to test YOUR thinking, not the AI's. Using AI to explain a topic is fine, but the words you submit should be yours." },
      { front: "What's the golden rule for using AI?", back: "Use AI as a helper, not a replacement for your brain. Always check its facts, always say when you used it, and never share secrets with it." },
      { front: "What should you NEVER type into a free AI chatbot?", back: "Passwords, bank card numbers, private family details, or other secrets. Whatever you type may be stored on the company's server." },
      { front: "How should you react to a shocking deepfake video on Telegram?", back: "Don't forward it right away. Check if trusted news sites report the same story. Look at the real person's official account. Share only after you're sure it's real." },
    ],
  },
};
