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
      { front: "Memory trick for the 4 reasons: S.A.S.C. stands for?", back: "Speed, Accuracy, Storage, Connectivity. Mnemonic: 'Some Amazing Students Compute.'" },
    ],

    // Topic 2: How Computers Grew Up
    2: [
      { front: "Name the 4 eras of computer evolution in order.", back: "Mechanical Era, Electronic Era, Personal Computer Era, Mobile + Internet Era." },
      { front: "What technology defined the Electronic Era (1940s-1950s)?", back: "Vacuum tubes. ENIAC was the first electronic computer -- it filled entire buildings and cost millions." },
      { front: "What was the main limitation of each era that the next era solved?", back: "Mechanical: too slow. Electronic: too big. PC: not portable. Mobile: solved all (portable, connected, affordable)." },
      { front: "What era do modern smartphones belong to?", back: "Era 4: Mobile + Internet (2000s-Now). Supercomputers in your pocket, always connected via Wi-Fi." },
      { front: "What device represents the Mechanical Era?", back: "The Abacus -- used gears, wheels, and beads. No electricity, no memory, painfully slow." },
    ],

    // Topic 3: How Every Computer Works -- IPO
    3: [
      { front: "What does IPO stand for in computing?", back: "Input, Process, Output -- the 3-step cycle every computer follows." },
      { front: "What does the 'Process' step involve and which component performs it?", back: "The CPU does all thinking -- calculations, decisions, comparisons -- in milliseconds." },
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
      { front: "Name 4 types of storage devices.", back: "HDD (Hard Disk Drive), SSD (Solid State Drive), USB Flash Drive, Cloud Storage." },
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
      { front: "What is the difference between a text editor and a word processor?", back: "Text editor: plain text only, no formatting (e.g., Notepad). Word processor: rich formatting -- bold, images, tables, spell-check (e.g., MS Word)." },
      { front: "Does word processing include editing?", back: "Yes. Word processing includes editing PLUS formatting, images, tables, spell-check, and layout. But editing alone is NOT word processing." },
      { front: "What file format does a text editor produce vs a word processor?", back: "Text editor: .txt (plain text). Word processor: .docx (rich formatted document)." },
      { front: "What is a word processor? Name two examples.", back: "Software for creating formatted documents with fonts, images, tables, and layouts. Examples: MS Word, Google Docs." },
    ],

    // Topic 2: MS Word -- Text Editing & Formatting
    2: [
      { front: "What are the 4 types of text alignment in MS Word?", back: "Left (Ctrl+L), Center (Ctrl+E), Right (Ctrl+R), Justify (Ctrl+J)." },
      { front: "What does Justify alignment do?", back: "Stretches text to fill both left and right edges evenly. Used in formal reports, newspapers, and books." },
      { front: "Name 5 essential keyboard shortcuts in MS Word.", back: "Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+S (Save), Ctrl+Z (Undo)." },
      { front: "What is the Format Painter in MS Word?", back: "A tool that copies ALL formatting from selected text and applies it to other text. Double-click the brush to paint multiple sections." },
      { front: "What is the Ribbon in MS Word?", back: "The strip of icons at the top organized into tabs (Home, Insert, Layout, etc.). The Home tab contains 80% of formatting tools." },
    ],

    // Topic 3: MS Word -- Images & Tables
    3: [
      { front: "Where do you find Insert Image and Insert Table in MS Word?", back: "Both are under the Insert tab on the Ribbon." },
      { front: "What is 'Square' text wrapping?", back: "Text wraps around the image in a square box. It is the most commonly used wrapping style for photos in reports." },
      { front: "How do you resize an image without distorting it?", back: "Always drag from the CORNER handles, not the side handles. Corner handles maintain the image's proportions." },
      { front: "What does Merge Cells do in a Word table?", back: "Combines multiple selected cells into one big cell. Found under Table Layout tab. Split Cells does the opposite." },
      { front: "How do you navigate between cells in a Word table?", back: "Press Tab to jump to the next cell. Press Shift+Tab to go back to the previous cell." },
    ],

    // Topic 4: MS Excel -- Creating Worksheets
    4: [
      { front: "What is a Cell in Excel?", back: "The intersection of a column and row. Each cell has a unique address like A1, B5, C12." },
      { front: "What is the difference between a Worksheet and a Workbook?", back: "Worksheet = one full grid of cells (one tab). Workbook = the entire Excel file containing multiple worksheets." },
      { front: "How are columns and rows labeled in Excel?", back: "Columns: letters (A, B, C... up to XFD = 16,384). Rows: numbers (1, 2, 3... up to 1,048,576)." },
      { front: "What is a Cell Range in Excel?", back: "A group of cells referenced together, like A1:A10 (column range) or B2:D5 (block range)." },
      { front: "What 4 data types can an Excel cell hold?", back: "Numbers (100, 3.14), Text/Labels ('Student Name'), Dates (09/04/2026), and Formulas (=A1+B1)." },
    ],

    // Topic 5: MS Excel -- Formulas & Functions
    5: [
      { front: "What character must every Excel formula start with?", back: "The equals sign (=). Without it, Excel treats your entry as plain text, not a calculation." },
      { front: "What does the SUM function do? Write its syntax.", back: "Adds all numbers in a range. Syntax: =SUM(A1:A10). The most used function in Excel." },
      { front: "Write the syntax for the IF function and explain it.", back: "=IF(condition, value_if_true, value_if_false). Example: =IF(A1>=40,\"Pass\",\"Fail\") checks if A1 is 40+ and returns Pass or Fail." },
      { front: "What do MAX and MIN do?", back: "MAX returns the highest value in a range. MIN returns the lowest. Example: =MAX(C1:C100) finds the top score." },
      { front: "What is the difference between AVERAGE and COUNT?", back: "AVERAGE calculates the mean of numbers in a range. COUNT counts how many cells contain numbers in a range." },
      { front: "What are the 5 arithmetic operators in Excel?", back: "+ (add), - (subtract), * (multiply), / (divide), ^ (power/exponent)." },
    ],

    // Topic 6: MS Excel -- Data Management
    6: [
      { front: "What is the difference between Sorting and Filtering in Excel?", back: "Sorting rearranges the order of all rows. Filtering hides rows that don't match criteria (data isn't deleted, just hidden)." },
      { front: "How do you link data between worksheets in Excel?", back: "Use the formula =SheetName!CellReference. Example: =Sheet2!A1 pulls the value from cell A1 on Sheet2." },
      { front: "Where do you find Sort and Filter in Excel?", back: "Both are on the Data tab. Click any cell in your data, then use Sort or Filter buttons." },
      { front: "If a sheet name has spaces, how do you reference it in a linking formula?", back: "Wrap the sheet name in single quotes: ='My Data'!C3" },
    ],

    // Topic 7: MS PowerPoint -- Creating Presentations
    7: [
      { front: "What are the 3 key building blocks of a PowerPoint presentation?", back: "Slides (individual pages), Themes (visual styles for colors/fonts/backgrounds), and Slide Layouts (content placeholders)." },
      { front: "What is the 6x6 rule for PowerPoint slides?", back: "Maximum 6 lines per slide, maximum 6 words per line. Slides are for key points and visuals, not paragraphs." },
      { front: "Where do you change a slide's layout in PowerPoint?", back: "Home tab > Layout dropdown. Choose from Title Slide, Title and Content, Two Content, Blank, etc." },
      { front: "How do you add a new slide in PowerPoint?", back: "Press Ctrl+M, or go to Home tab > New Slide. Use the dropdown arrow to pick a specific layout." },
    ],

    // Topic 8: MS PowerPoint -- Master Slides & Slide Shows
    8: [
      { front: "What is a Slide Master in PowerPoint?", back: "A master template that controls the look of ALL slides. Change fonts, logos, or backgrounds once and it applies everywhere. View tab > Slide Master." },
      { front: "What is the difference between Transitions and Animations?", back: "Transitions: animations BETWEEN slides (fade, wipe). Animations: movement of OBJECTS within a single slide (appear, fly in, bounce)." },
      { front: "How do you start a slideshow from the beginning vs. current slide?", back: "From beginning: F5. From current slide: Shift+F5." },
      { front: "What is Presenter View in PowerPoint?", back: "Shows your notes, upcoming slides, and a timer to YOU while the audience only sees the current slide. Found in Slide Show tab." },
      { front: "How do you access Slide Master view?", back: "View tab > Slide Master. The top slide is the Master; slides below are Layout Masters. Click 'Close Master View' when done." },
    ],

    // Topic 9: Which Tool When?
    9: [
      { front: "When should you use MS Word vs MS Excel vs MS PowerPoint?", back: "Word: writing documents to be read. Excel: numbers, data, formulas, calculations. PowerPoint: presenting to an audience live." },
      { front: "Which tool for a monthly budget?", back: "MS Excel -- it handles numbers, formulas, auto-calculations, and charts." },
      { front: "Which tool for a college assignment essay?", back: "MS Word -- rich text formatting, headings, images, page layout, and print-ready output." },
      { front: "Which tool for a company product pitch?", back: "MS PowerPoint -- visual slides, animations, speaker notes for live presenting." },
    ],
  },

  // ━━━ Module 3: Social Media ━━━
  3: {
    // Topic 1: Introduction to Social Media
    1: [
      { front: "Define social media.", back: "Websites and apps that let users create, share, and interact with content and each other." },
      { front: "What makes social media different from traditional media (TV, newspapers)?", back: "Social media is two-way communication where users CREATE the content. Traditional media is one-way broadcast." },
      { front: "What is 'User-Generated Content'?", back: "Content created by the audience themselves -- posts, stories, videos, reviews. The audience IS the creator." },
      { front: "How many social media users exist worldwide (approx)?", back: "Over 4.9 billion -- more than 60% of the planet's population." },
    ],

    // Topic 2: Types of Social Media Platforms
    2: [
      { front: "What type of platform is Instagram and who is its key audience?", back: "Media sharing (visual-first: photos, Reels, Stories). Key audience: 18-34 years old." },
      { front: "What type of platform is LinkedIn?", back: "Professional networking -- resumes, job posts, industry articles. Best for B2B marketing." },
      { front: "What makes TikTok unique among social platforms?", back: "Short-form vertical video, algorithm-driven discovery, dominated by Gen Z (16-30), fastest-growing platform in history." },
      { front: "What is Twitter/X best used for?", back: "Real-time microblogging, breaking news, trending topics, and public conversations. Posts limited to 280 characters." },
      { front: "What is Facebook's key demographic?", back: "25-55+ years old. 3 billion users. Best for community building with groups, pages, marketplace, and events." },
    ],

    // Topic 3: Social Media Management Tools
    3: [
      { front: "Name 3 social media management tools.", back: "Hootsuite (enterprise), Buffer (beginners/small biz), Sprout Social (agencies/advanced analytics)." },
      { front: "What are the 4 core functions of a social media management tool?", back: "Scheduling (auto-post at best times), Monitoring (track mentions), Analytics (track performance), Unified Inbox (all messages in one place)." },
      { front: "What is a 'Unified Inbox' in social media management?", back: "All comments, messages, and mentions from every platform combined into ONE inbox -- reply without switching apps." },
      { front: "Why do professionals use scheduling tools?", back: "Write posts in advance and auto-publish at optimal times. Saves hours, prevents mistakes, and enables data-driven decisions." },
    ],

    // Topic 4: Social Media Measurement & Reporting
    4: [
      { front: "What is the difference between Reach and Impressions?", back: "Reach = unique people who saw your post. Impressions = total times displayed (includes same person seeing it multiple times). Impressions >= Reach." },
      { front: "What is Engagement Rate and how is it calculated?", back: "(Engagements / Reach) x 100. Industry average is 1-3%. Over 5% is excellent." },
      { front: "What is CTR (Click-Through Rate)?", back: "(Clicks / Impressions) x 100. Measures how many people were interested enough to click your link." },
      { front: "What are vanity metrics vs action metrics?", back: "Vanity metrics: likes, impressions -- look good but don't pay bills. Action metrics: CTR, conversions, ROI -- show actual business results." },
      { front: "What is ROI in social media?", back: "Return on Investment = (Revenue / Cost) x 100. Tells you if you made more money than you spent." },
    ],

    // Topic 5: Social Advertising
    5: [
      { front: "What is the difference between organic content and paid advertising?", back: "Organic: free posts seen by existing followers (only 2-5% reach). Paid: you pay to show content to targeted audiences beyond followers." },
      { front: "Name 4 common social media ad formats.", back: "Image ads, Video ads, Carousel ads (swipeable), and Story ads (full-screen vertical, 24-hour)." },
      { front: "What is A/B Testing (Split Testing)?", back: "Running two versions of the same ad with ONE difference to see which performs better. Keep the winner, drop the loser." },
      { front: "What is Retargeting in social advertising?", back: "Showing ads to people who already visited your website -- e.g., someone who added to cart but didn't buy." },
      { front: "What do CPC and CPM stand for?", back: "CPC = Cost Per Click (pay when someone clicks). CPM = Cost Per Thousand Impressions (pay per 1,000 views)." },
    ],

    // Topic 6: Facebook Marketing
    6: [
      { front: "What is a Facebook Business Page?", back: "Your brand's official Facebook presence -- like a free website inside Facebook. Post updates, collect reviews, chat via Messenger." },
      { front: "What is Facebook Ads Manager?", back: "The command centre for all paid ads on BOTH Facebook and Instagram (Meta owns both). Set budgets, audiences, and track performance." },
      { front: "What is a Boosted Post on Facebook?", back: "Taking any regular post and paying to show it to more people. Simplest form of Facebook advertising -- pick audience, budget, duration." },
      { front: "What is the Facebook Pixel?", back: "A tiny code added to your website that tracks what visitors do after clicking a Facebook ad. It helps Facebook find more people likely to convert." },
    ],

    // Topic 7: Twitter/X Marketing
    7: [
      { front: "What is a hashtag and what does it do?", back: "A word prefixed with # that categorizes content (e.g., #Marketing). Makes tweets discoverable by people searching that topic." },
      { front: "What is a Twitter Thread?", back: "A chain of connected tweets telling a longer story. Threads get massive engagement because each tweet acts as a hook." },
      { front: "Name 3 types of Twitter/X paid ads.", back: "Promoted Tweets (wider reach), Promoted Accounts (gain followers), Promoted Trends (top of trending topics)." },
      { front: "What is 'newsjacking' on Twitter?", back: "Brands jumping on currently trending topics for massive visibility -- riding the wave of what's already hot." },
    ],
  },

  // ━━━ Module 4: HTML ━━━
  4: {
    // Topic 1: World Wide Web
    1: [
      { front: "Is the WWW the same as the Internet?", back: "No. The Internet is the network of cables/connections. WWW is one service running on it -- a collection of web pages. Email is another service." },
      { front: "What is a URL?", back: "Uniform Resource Locator -- the web address of a page (e.g., https://www.google.com)." },
      { front: "What is HTTP/HTTPS?", back: "Rules (protocols) for sending web pages. HTTPS is the secure version. Seen at the start of URLs." },
      { front: "What is a Web Browser?", back: "An application that loads and displays web pages. Examples: Chrome, Firefox, Edge." },
      { front: "What is a Web Server?", back: "A computer that stores websites and sends them to browsers when requested. Google's servers store google.com." },
    ],

    // Topic 2: HTML & Basic Tags
    2: [
      { front: "What does HTML stand for?", back: "HyperText Markup Language -- the language used to build the structure of web pages." },
      { front: "What is the basic skeleton structure of every HTML page?", back: "<!DOCTYPE html> at top, then <html> wrapping <head> (metadata) and <body> (visible content)." },
      { front: "What does the <title> tag do?", back: "Sets the title shown on the browser tab. It goes inside the <head> section." },
      { front: "What goes inside the <body> tag?", back: "Everything visible on the web page -- headings, paragraphs, images, tables, links, etc." },
      { front: "What tags are used for headings in HTML?", back: "<h1> through <h6>. h1 is the largest/most important, h6 is the smallest." },
    ],

    // Topic 3: HTML Elements
    3: [
      { front: "What is the difference between an HTML tag and an HTML element?", back: "A tag is just <p> or </p>. An element is the complete package: opening tag + content + closing tag, e.g., <p>Hello</p>." },
      { front: "What is a self-closing tag? Give 3 examples.", back: "Tags with no content or closing tag: <br> (line break), <hr> (horizontal line), <img> (image)." },
      { front: "What are the 3 parts of an HTML element?", back: "Opening tag (e.g., <h1>), Content (e.g., Hello!), and Closing tag (e.g., </h1>). Note the / in the closing tag." },
      { front: "What does the closing tag always include that the opening tag doesn't?", back: "A forward slash: /. Example: <p> is opening, </p> is closing." },
    ],

    // Topic 4: HTML Attributes
    4: [
      { front: "What are HTML attributes?", back: "Extra information inside the opening tag as name=\"value\" pairs. They customize how an element behaves or appears." },
      { front: "What does the 'src' attribute do in an <img> tag?", back: "Specifies the path or URL to the image file that should be displayed." },
      { front: "What does the 'href' attribute do in an <a> tag?", back: "Specifies the URL of the link destination -- where the user goes when they click." },
      { front: "What does the 'alt' attribute do on an image?", back: "Provides alternative text shown if the image fails to load. Also used for accessibility (screen readers)." },
      { front: "Where do attributes go -- opening tag or closing tag?", back: "Always in the OPENING tag only, never the closing tag. Values must be in quotes." },
    ],

    // Topic 5: HTML Comments
    5: [
      { front: "What is the syntax for an HTML comment?", back: "<!-- comment text -->. Starts with <!-- and ends with -->." },
      { front: "Do HTML comments appear on the webpage?", back: "No. The browser completely ignores them. They are only visible in the source code." },
      { front: "Name 3 reasons to use HTML comments.", back: "1) Explain your code. 2) Temporarily hide parts of code. 3) Leave notes for future edits." },
      { front: "Why are comments valuable in exams?", back: "Adding comments above each section (<!-- table -->, <!-- list -->) shows the examiner you understand the structure and earns extra marks." },
    ],

    // Topic 6: HTML Formatting
    6: [
      { front: "What tags make text bold, italic, and underlined in HTML?", back: "<b> for bold, <i> for italic, <u> for underline." },
      { front: "What is the difference between <b> and <strong>?", back: "Both display bold text, but <strong> adds semantic meaning (importance). Browsers and screen readers treat <strong> as important content." },
      { front: "How do you combine bold and italic in HTML?", back: "Nest the tags: <b><i>Bold and Italic</i></b>. Close in reverse order -- last opened = first closed." },
      { front: "What does the <mark> tag do?", back: "Highlights text with a yellow background, like a highlighter pen. Used for key terms." },
    ],

    // Topic 7: HTML Tables
    7: [
      { front: "What are the 4 key tags for creating an HTML table?", back: "<table> (wraps table), <tr> (table row), <th> (header cell, bold), <td> (data cell)." },
      { front: "What is the correct nesting order for table tags?", back: "<table> contains <tr>, and <tr> contains <th> or <td>. Never put <td> directly inside <table>." },
      { front: "What does the border attribute do on a table?", back: "<table border=\"1\"> adds visible lines around cells. Without it, the table data exists but the grid is invisible." },
      { front: "What does <th> stand for and how is it different from <td>?", back: "<th> = Table Header (bold, centered). <td> = Table Data (regular cell). Use <th> for column headers." },
      { front: "What does <tr> stand for?", back: "Table Row -- creates one horizontal row in the table." },
    ],

    // Topic 8: HTML Lists
    8: [
      { front: "What is the difference between <ol> and <ul>?", back: "<ol> = Ordered List (numbered 1, 2, 3). <ul> = Unordered List (bullet points). Use <ol> when sequence matters." },
      { front: "What tag is used for each item in a list?", back: "<li> (List Item). It is the same for both ordered and unordered lists." },
      { front: "What determines whether a list shows numbers or bullets?", back: "The outer wrapper: <ol> gives numbers, <ul> gives bullets. The <li> tag is identical in both." },
      { front: "Memory trick: How to remember ol vs ul?", back: "Ordered = One, two, three (numbered). Unordered = Unhappy with any order (just bullets)." },
    ],

    // Topic 9: Hyperlinks
    9: [
      { front: "What tag creates a hyperlink in HTML?", back: "The anchor tag: <a href=\"URL\">Link Text</a>." },
      { front: "What does the href attribute specify?", back: "The URL destination -- where the user goes when they click the link." },
      { front: "How do you make a link open in a new tab?", back: "Add target=\"_blank\" to the anchor tag: <a href=\"url\" target=\"_blank\">Text</a>." },
      { front: "What happens if you don't use target=\"_blank\"?", back: "The link opens in the SAME tab, replacing the current page." },
    ],

    // Topic 10: Images & Image Links
    10: [
      { front: "What tag displays an image in HTML?", back: "<img src=\"file.jpg\" alt=\"description\" width=\"200\">. It is a self-closing tag (no </img>)." },
      { front: "How do you create a clickable image link?", back: "Wrap <img> inside <a>: <a href=\"url\"><img src=\"pic.jpg\" alt=\"text\"></a>. The anchor tag is always the outer wrapper." },
      { front: "What are the 3 essential attributes of the <img> tag?", back: "src (image path), alt (fallback text / accessibility), and width (size in pixels)." },
      { front: "Why is the 'alt' attribute important?", back: "It provides text if the image fails to load AND helps screen readers describe the image for visually impaired users." },
    ],

    // Topic 11: Build a Full HTML Page
    11: [
      { front: "What 7 elements must a complete exam HTML page include?", back: "1) Proper structure (html, head, title, body). 2) Heading. 3) Formatted paragraph. 4) Table. 5) List. 6) Hyperlink. 7) Comment." },
      { front: "What are the most common HTML exam mistakes?", back: "Forgetting <!DOCTYPE html>, not closing tags, putting <td> directly in <table> without <tr>, missing border on tables, missing alt on images." },
      { front: "Why should you use comments in exam HTML code?", back: "Label each section (<!-- table -->, <!-- list -->) to show the examiner you understand the structure -- earns extra marks for clarity." },
      { front: "What must always appear at the very top of an HTML document?", back: "<!DOCTYPE html> -- tells the browser this is an HTML document." },
    ],
  },

  // ━━━ Module 5: Tech Trends ━━━
  5: {
    // Topic 1: Artificial Intelligence (AI)
    1: [
      { front: "What is Artificial Intelligence (AI)?", back: "The ability of a machine to simulate human intelligence -- recognizing faces, understanding speech, making decisions." },
      { front: "What are the 3 types of AI?", back: "Narrow AI (one task, exists today), General AI (human-level across all tasks, doesn't exist yet), Super AI (smarter than all humans, hypothetical)." },
      { front: "What type of AI do we currently have?", back: "Narrow (Weak) AI only. It is good at ONE specific task but cannot generalise. Examples: Siri, Google Maps, Netflix recommendations." },
      { front: "Name 4 real-world applications of AI.", back: "Voice assistants (Siri, Alexa), self-driving cars (Tesla), healthcare (X-ray analysis), recommendation engines (Netflix, Spotify)." },
    ],

    // Topic 2: Machine Learning (ML)
    2: [
      { front: "What is Machine Learning?", back: "A subset of AI where computers learn from data without being explicitly programmed. They discover patterns on their own." },
      { front: "What is the relationship between AI and ML?", back: "AI is the big umbrella goal (make machines smart). ML is one method to achieve AI. All ML is AI, but not all AI is ML." },
      { front: "Name and define the 3 types of Machine Learning.", back: "Supervised (labeled data, teacher guides), Unsupervised (no labels, finds patterns alone), Reinforcement (trial and error with rewards/penalties)." },
      { front: "Give an example of Supervised Learning.", back: "Spam detection -- Gmail learns from millions of emails labeled as 'spam' or 'not spam' to classify new emails." },
      { front: "How does Reinforcement Learning work?", back: "The machine learns by trial and error -- rewarded for good actions, penalized for bad ones. Like training a dog with treats." },
    ],

    // Topic 3: Data Analytics
    3: [
      { front: "What is Data Analytics?", back: "The process of examining, cleaning, and modelling data to discover useful information and support decision-making." },
      { front: "What are the 4 types of Data Analytics?", back: "Descriptive (what happened?), Diagnostic (why?), Predictive (what will happen?), Prescriptive (what should we do?)." },
      { front: "What type of analytics answers 'What will happen next?'", back: "Predictive Analytics -- uses patterns in historical data to forecast future outcomes." },
      { front: "What is Prescriptive Analytics?", back: "The most advanced type -- recommends specific actions to take. Example: 'Launch a sale in April to boost revenue.'" },
      { front: "Name 3 tools used for Data Analytics.", back: "Excel, Python, Tableau, Power BI, SQL, Google Sheets, R." },
    ],

    // Topic 4: Cloud Computing
    4: [
      { front: "What is Cloud Computing?", back: "Using remote servers on the internet to store, manage, and process data instead of your personal computer." },
      { front: "What are the 3 cloud service models (IaaS, PaaS, SaaS)?", back: "IaaS: rent raw hardware (AWS). PaaS: rent a platform for building apps (Heroku). SaaS: use finished software online (Gmail, Netflix)." },
      { front: "What are the 3 cloud deployment models?", back: "Public (shared, cheap -- AWS), Private (dedicated, secure -- banks), Hybrid (mix of both -- most large companies)." },
      { front: "Name 3 benefits and 2 risks of cloud computing.", back: "Benefits: no upfront cost, access anywhere, auto backups. Risks: needs internet, data privacy concerns." },
      { front: "SaaS stands for what? Give 3 examples.", back: "Software as a Service -- finished software used over the internet. Examples: Gmail, Google Docs, Netflix." },
    ],

    // Topic 5: Blockchain
    5: [
      { front: "What is Blockchain?", back: "A decentralized, distributed digital ledger that records transactions across many computers. Once added, records cannot be changed or deleted." },
      { front: "Is Blockchain the same as Bitcoin?", back: "No. Bitcoin is one application that USES blockchain. Blockchain is the underlying technology -- like the internet is technology and email is one app." },
      { front: "What are the 4 key features of Blockchain?", back: "Decentralized (no single authority), Immutable (cannot be changed), Transparent (everyone sees transactions), Secure (uses cryptography)." },
      { front: "Name 3 applications of Blockchain beyond cryptocurrency.", back: "Supply chain tracking, digital voting, medical records, smart contracts, land registry, digital identity verification." },
    ],

    // Topic 6: Virtual Reality (VR)
    6: [
      { front: "What is Virtual Reality (VR)?", back: "A completely artificial, computer-generated environment that REPLACES the real world. You wear a headset that blocks reality entirely." },
      { front: "Name 3 VR hardware components.", back: "VR headset (covers eyes), motion controllers (track hand movements), spatial audio (3D directional sound)." },
      { front: "Name 4 applications of VR.", back: "Gaming (immersive play), medical training (practice surgery), real estate (virtual tours), education (explore historical sites)." },
      { front: "What is the key distinction between VR and AR?", back: "VR REPLACES reality completely (you see only the virtual world). AR ADDS digital objects on top of the real world." },
    ],

    // Topic 7: Augmented Reality (AR)
    7: [
      { front: "What is Augmented Reality (AR)?", back: "Overlays digital content onto the real world. You can still see your surroundings -- AR just adds virtual objects on top." },
      { front: "Name 4 everyday examples of AR.", back: "Snapchat/Instagram filters, Pokemon GO, IKEA Place app (virtual furniture), Google Maps Live View (arrows on real streets)." },
      { front: "What device do you use for AR vs VR?", back: "AR: phone camera or smart glasses (real world visible). VR: headset covering eyes fully (real world blocked)." },
      { front: "If you can still see the real world, is it AR or VR?", back: "AR (Augmented Reality). VR blocks the real world completely. This distinction appears in almost every exam." },
    ],

    // Topic 8: Internet of Things (IoT)
    8: [
      { front: "What is the Internet of Things (IoT)?", back: "A network of physical objects embedded with sensors, software, and connectivity that collect and exchange data over the internet." },
      { front: "What are the 4 components of an IoT system?", back: "Sensors (collect data), Connectivity (send data via Wi-Fi/Bluetooth), Data Processing (analyse in cloud), Action (respond -- turn on lights, send alert)." },
      { front: "Give 4 examples of IoT devices.", back: "Smart watches, smart thermostats (Nest), smart speakers (Alexa), connected cars, soil sensors in agriculture." },
      { front: "Name 2 benefits and 2 risks of IoT.", back: "Benefits: automation, remote monitoring. Risks: privacy concerns (always collecting data), security vulnerabilities (hackable devices)." },
    ],

    // Topic 9: Introduction to Generative AI
    9: [
      { front: "What is Generative AI?", back: "AI systems that CREATE new, original content (text, images, music, video) based on patterns learned from massive training data." },
      { front: "How does Generative AI differ from traditional AI?", back: "Traditional AI analyses and classifies data. Generative AI creates entirely new content that never existed before." },
      { front: "Does ChatGPT actually 'understand' what it writes?", back: "No. It predicts the next most likely word based on patterns in training data. It is pattern matching, not comprehension." },
      { front: "What does GPT stand for?", back: "Generative Pre-trained Transformer -- a type of large language model (LLM) that generates text." },
      { front: "Name 4 types of content Generative AI can create.", back: "Text (ChatGPT, Claude), Images (DALL-E, Midjourney), Audio/Music (Suno, ElevenLabs), Video (Sora, Runway)." },
    ],

    // Topic 10: Ethical Use of GPTs
    10: [
      { front: "What are the 4 key ethical concerns with AI/GPTs?", back: "Plagiarism/academic dishonesty, misinformation/hallucinations, bias/fairness, and privacy/data concerns." },
      { front: "What is an AI 'hallucination'?", back: "When AI confidently generates false information that sounds convincing. Always fact-check AI output before trusting it." },
      { front: "What is the golden rule of AI ethics?", back: "Use AI as a co-pilot, not an auto-pilot. Let it assist your thinking but never replace it. Always verify and disclose." },
      { front: "What are Deepfakes?", back: "AI-generated fake videos or audio that make it look like real people said or did things they never did. A serious threat to trust." },
      { front: "Is submitting AI-generated work as your own considered plagiarism?", back: "Yes. Using AI to write your assignment and claiming you wrote it is academic dishonesty. Always disclose AI assistance." },
    ],
  },
};
