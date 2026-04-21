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
      { front: "What is X (formerly Twitter) best used for?", back: "Real-time microblogging, breaking news, trending topics, and public conversations. Free accounts post up to 280 characters; Premium accounts can post longer." },
      { front: "What is Facebook's key demographic?", back: "25-55+ years old. 3 billion users. Best for community building with groups, pages, marketplace, and events." },
    ],

    // Topic 3: Social Media Management Tools
    3: [
      { front: "Name 3 social media management tools.", back: "Buffer (free-tier, beginner default), Later (visual Instagram planner), Metricool (analytics-heavy; popular with small agencies in UZ). Hootsuite dropped its free tier in 2023 and is now enterprise-only." },
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
      { front: "What is ROI and how is it calculated?", back: "Return on Investment = ((Revenue - Cost) / Cost) x 100. Tells you the percentage profit you made compared to what you spent. If you spent $100 and earned $150, ROI = 50%." },
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

    // Topic 7: X (formerly Twitter) Marketing
    7: [
      { front: "What is a hashtag and what does it do?", back: "A word prefixed with # that categorizes content (e.g., #Marketing). Makes posts discoverable by people searching that topic." },
      { front: "What is an X Thread (formerly a Twitter Thread)?", back: "A chain of connected posts telling a longer story. Threads get strong engagement because each post acts as a hook." },
      { front: "Name 3 types of X paid ads.", back: "Promoted Posts (wider reach), Promoted Accounts (gain followers), Promoted Trends (top of trending topics)." },
      { front: "What is 'newsjacking' on X?", back: "Brands jumping on currently trending topics for massive visibility -- riding the wave of what's already hot." },
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
