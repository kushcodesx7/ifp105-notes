export interface CheatSheetItem {
  term: string;
  definition: string;
}

export interface CheatSheetSection {
  title: string;
  items: CheatSheetItem[];
}

export interface ModuleCheatSheet {
  moduleId: number;
  title: string;
  sections: CheatSheetSection[];
  confusionPairs: { termA: string; termB: string; tip: string }[];
}

export const cheatsheets: ModuleCheatSheet[] = [
  // ─── Module 1: Hardware & Software ───
  {
    moduleId: 1,
    title: "Hardware & Software",
    sections: [
      {
        title: "Core Concepts",
        items: [
          { term: "IPO Cycle", definition: "Input -> Process -> Output (+ Storage) — how every computer works." },
          { term: "CPU", definition: "Central Processing Unit — the brain that processes all instructions." },
          { term: "Control Unit (CU)", definition: "Part of CPU that directs operations — the boss that never calculates." },
          { term: "ALU", definition: "Arithmetic Logic Unit — does ALL math and logical comparisons inside the CPU." },
          { term: "Registers", definition: "Tiny ultra-fast memory inside the CPU — holds data being processed right now." },
          { term: "GHz", definition: "Gigahertz — CPU speed. 3 GHz = 3 billion operations per second." },
        ],
      },
      {
        title: "Memory & Storage",
        items: [
          { term: "RAM", definition: "Temporary memory — loses ALL data when power is off (volatile)." },
          { term: "ROM", definition: "Permanent memory — stores startup instructions, cannot be changed by user (non-volatile)." },
          { term: "HDD", definition: "Hard Disk Drive — spinning disk, cheap, large capacity, slow." },
          { term: "SSD", definition: "Solid State Drive — no moving parts, much faster than HDD, modern laptops." },
          { term: "Cloud Storage", definition: "Files on remote internet servers — access anywhere, needs internet (Google Drive, iCloud)." },
        ],
      },
      {
        title: "Input, Output & Devices",
        items: [
          { term: "Input Device", definition: "Sends data INTO the computer (keyboard, mouse, mic, scanner, webcam)." },
          { term: "Output Device", definition: "Sends data OUT of the computer to the user (monitor, speakers, printer)." },
          { term: "Touchscreen", definition: "Both input AND output — an I/O device." },
          { term: "Hard Copy", definition: "Output printed on physical paper (from a printer)." },
          { term: "Soft Copy", definition: "Digital output displayed on screen — no paper." },
        ],
      },
      {
        title: "Software & Internet",
        items: [
          { term: "System Software", definition: "Controls hardware, must be installed first (Windows, Android, iOS, macOS)." },
          { term: "Application Software", definition: "Apps for specific tasks — cannot run without system software (Chrome, Word, WhatsApp)." },
          { term: "Utility Software", definition: "Background maintenance — antivirus, disk cleanup, backup tools." },
          { term: "IP Address", definition: "Unique number address for every device on the internet (e.g. 192.168.1.1)." },
          { term: "URL", definition: "Human-friendly web address (e.g. www.google.com) instead of IP numbers." },
          { term: "DNS", definition: "Domain Name System — converts URLs to IP addresses (the internet's phonebook)." },
        ],
      },
    ],
    confusionPairs: [
      { termA: "RAM", termB: "ROM", tip: "RAM = temporary, erased on power off. ROM = permanent, keeps data always." },
      { termA: "RAM", termB: "Storage (HDD/SSD)", tip: "RAM = fast desk you work on (temporary). Storage = cupboard where files live (permanent)." },
      { termA: "Input Device", termB: "Output Device", tip: "Data going IN = input (keyboard). Data coming OUT = output (printer)." },
      { termA: "System Software", termB: "Application Software", tip: "System = foundation (OS). Application = apps on top. Apps NEED the OS to run." },
      { termA: "URL", termB: "IP Address", tip: "URL = friendly name (google.com). IP = number address (142.250.190.46). DNS converts between them." },
    ],
  },

  // ─── Module 2: Office Automation ───
  {
    moduleId: 2,
    title: "Office Automation",
    sections: [
      {
        title: "Word Processing Basics",
        items: [
          { term: "Text Editor", definition: "Plain text only, no formatting (Notepad). NOT a word processor." },
          { term: "Word Processor", definition: "Full formatting: bold, images, tables, spell-check, headers (MS Word, Google Docs)." },
          { term: "Format Painter", definition: "Copies ALL formatting from selected text and applies it to other text — double-click to paint multiple." },
          { term: ".docx vs .txt", definition: ".docx = rich formatted Word file. .txt = plain text with zero formatting." },
        ],
      },
      {
        title: "MS Word Key Features",
        items: [
          { term: "Ctrl+B / I / U", definition: "Bold / Italic / Underline — the three essential formatting shortcuts." },
          { term: "Ctrl+Z / Ctrl+Y", definition: "Undo / Redo — reverse or repeat your last action." },
          { term: "Text Wrapping (Square)", definition: "Most common image wrap — text flows around the image in a square box." },
          { term: "Merge Cells", definition: "Combines multiple table cells into one — Table Layout tab. Split Cells does the opposite." },
        ],
      },
      {
        title: "MS Excel Essentials",
        items: [
          { term: "Cell", definition: "Intersection of a column (letter) and row (number) — e.g. B3." },
          { term: "Workbook vs Worksheet", definition: "Workbook = the entire Excel file. Worksheet = one sheet/tab inside it." },
          { term: "= (equals sign)", definition: "MUST start every formula — without it, Excel treats your entry as plain text." },
          { term: "=SUM(A1:A10)", definition: "Adds all values from A1 to A10." },
          { term: "=AVERAGE(B1:B20)", definition: "Calculates the mean of values from B1 to B20." },
          { term: "=IF(A1>=40,\"Pass\",\"Fail\")", definition: "IF condition is true, show Pass; otherwise show Fail." },
          { term: "=MAX(range) / =MIN(range)", definition: "Returns the highest / lowest value in the range." },
          { term: "=COUNT(range)", definition: "Counts how many cells contain numbers in the range." },
        ],
      },
      {
        title: "Excel Data & PowerPoint",
        items: [
          { term: "Sorting", definition: "Rearranges row order (A-Z or Z-A) — all data still visible, just reordered." },
          { term: "Filtering", definition: "Hides rows that don't match criteria — data isn't deleted, just hidden." },
          { term: "=Sheet2!A1", definition: "Links to cell A1 on Sheet2 — changes there update here automatically." },
          { term: "Slide Master", definition: "Master template controlling ALL slides — change once, every slide updates (View tab)." },
          { term: "Transitions vs Animations", definition: "Transitions = between slides. Animations = objects moving within one slide." },
          { term: "Presenter View", definition: "You see notes + next slide; audience sees only the current slide." },
        ],
      },
    ],
    confusionPairs: [
      { termA: "Text Editor", termB: "Word Processor", tip: "Editor = plain text only (Notepad). Word processor = formatting + images + tables (Word)." },
      { termA: "Sorting", termB: "Filtering", tip: "Sorting reorders all rows. Filtering hides non-matching rows." },
      { termA: "Workbook", termB: "Worksheet", tip: "Workbook = whole file. Worksheet = one tab/sheet inside that file." },
      { termA: "Transitions", termB: "Animations", tip: "Transitions = slide-to-slide effects. Animations = objects moving within one slide." },
      { termA: "MS Word", termB: "MS Excel", tip: "Word = writing documents. Excel = numbers, formulas, data. Never use Word for calculations." },
    ],
  },

  // ─── Module 3: Social Media ───
  {
    moduleId: 3,
    title: "Social Media",
    sections: [
      {
        title: "Core Concepts",
        items: [
          { term: "Social Media", definition: "Websites/apps that let users create, share, and interact with content and each other." },
          { term: "User-Generated Content", definition: "Content created by users, not companies — posts, stories, reviews. The audience IS the creator." },
          { term: "Organic Content", definition: "Free posts seen by existing followers only — platforms show it to just 2-5% of them." },
          { term: "Paid Advertising", definition: "You pay the platform to show content to targeted audiences beyond your followers." },
        ],
      },
      {
        title: "Platforms & Their Strengths",
        items: [
          { term: "Facebook", definition: "Largest network (3B users). Groups, Pages, Marketplace. Best for 25-55+ age group." },
          { term: "Instagram", definition: "Visual-first — photos, Reels, Stories. Best for 18-34, fashion/food/travel brands." },
          { term: "Twitter/X", definition: "Microblogging, 280 characters. Real-time news, trends, public conversations." },
          { term: "LinkedIn", definition: "Professional networking. Resumes, B2B marketing, job posts. The conference, not the party." },
          { term: "TikTok", definition: "Short vertical video. Algorithm-driven discovery. Dominated by Gen Z." },
          { term: "YouTube", definition: "World's 2nd largest search engine. Long & short video. All ages." },
        ],
      },
      {
        title: "Metrics & Measurement",
        items: [
          { term: "Reach", definition: "Number of UNIQUE people who saw your post." },
          { term: "Impressions", definition: "TOTAL times post was displayed — includes same person seeing it multiple times." },
          { term: "Engagement Rate", definition: "(Engagements / Reach) x 100 — measures content quality. Over 5% = excellent." },
          { term: "CTR", definition: "Click-Through Rate = (Clicks / Impressions) x 100 — measures interest in your offer." },
          { term: "ROI", definition: "Return on Investment = (Revenue / Cost) x 100 — the only metric the boss cares about." },
          { term: "Vanity Metrics", definition: "Likes and impressions look good but don't pay bills. Focus on CTR, conversions, ROI." },
        ],
      },
      {
        title: "Tools & Advertising",
        items: [
          { term: "Hootsuite", definition: "Industry-standard management tool — schedule posts, monitor mentions, analytics across platforms." },
          { term: "Buffer", definition: "Simple, beginner-friendly scheduling and analytics tool for small businesses." },
          { term: "A/B Testing", definition: "Run two ad versions with ONE difference — keep the winner, drop the loser." },
          { term: "CPC", definition: "Cost Per Click — you pay only when someone clicks your ad." },
          { term: "CPM", definition: "Cost Per Thousand Impressions — you pay per 1,000 views of your ad." },
          { term: "Retargeting", definition: "Show ads to people who already visited your website but didn't buy." },
          { term: "Facebook Pixel", definition: "Code on your website that tracks what visitors do after clicking your Facebook ad." },
        ],
      },
    ],
    confusionPairs: [
      { termA: "Reach", termB: "Impressions", tip: "Reach = unique people. Impressions = total views (same person counted multiple times)." },
      { termA: "Organic", termB: "Paid", tip: "Organic = free but limited reach. Paid = costs money but targets specific audiences." },
      { termA: "CPC", termB: "CPM", tip: "CPC = pay per click. CPM = pay per 1,000 views. CPC for action, CPM for awareness." },
      { termA: "Engagement Rate", termB: "CTR", tip: "Engagement Rate = interactions / reach. CTR = link clicks / impressions. Different formulas!" },
      { termA: "Boosted Post", termB: "Ads Manager Campaign", tip: "Boosted = quick, simple, beginner. Ads Manager = advanced targeting, conversions, full control." },
    ],
  },

  // ─── Module 4: HTML ───
  {
    moduleId: 4,
    title: "HTML",
    sections: [
      {
        title: "Page Structure",
        items: [
          { term: "<!DOCTYPE html>", definition: "Must be first line — tells the browser this is an HTML document." },
          { term: "<html>", definition: "Root tag that wraps the entire page." },
          { term: "<head>", definition: "Contains metadata (title, etc.) — NOT visible on the page." },
          { term: "<title>", definition: "Text shown on the browser tab — goes inside <head>." },
          { term: "<body>", definition: "Everything visible on the page goes here." },
        ],
      },
      {
        title: "Common Tags",
        items: [
          { term: "<h1> to <h6>", definition: "Headings — h1 is biggest, h6 is smallest." },
          { term: "<p>", definition: "Paragraph of text." },
          { term: "<br>", definition: "Line break — no closing tag needed (void/self-closing element)." },
          { term: "<hr>", definition: "Horizontal line — no closing tag needed." },
          { term: "<b> / <strong>", definition: "Bold text. <strong> also adds semantic importance." },
          { term: "<i>", definition: "Italic text." },
          { term: "<u>", definition: "Underlined text." },
          { term: "<mark>", definition: "Yellow highlighted text." },
          { term: "<!-- comment -->", definition: "HTML comment — browser ignores it completely. Starts with <!-- ends with -->." },
        ],
      },
      {
        title: "Links & Images",
        items: [
          { term: "<a href=\"url\">", definition: "Anchor tag — creates a clickable hyperlink to the URL." },
          { term: "target=\"_blank\"", definition: "Opens the link in a NEW browser tab instead of the same tab." },
          { term: "<img src=\"file\" alt=\"text\">", definition: "Displays an image. Self-closing. alt = text if image fails to load." },
          { term: "Image Link", definition: "Wrap <img> inside <a> — the anchor tag is ALWAYS the outer wrapper." },
          { term: "src attribute", definition: "Path or URL to the image file — required for <img>." },
          { term: "href attribute", definition: "The destination URL — required for <a> links." },
        ],
      },
      {
        title: "Tables & Lists",
        items: [
          { term: "<table>", definition: "Wraps the entire table. Use border=\"1\" to see gridlines." },
          { term: "<tr>", definition: "Table Row — one horizontal row of cells." },
          { term: "<th>", definition: "Table Header cell — bold and centered by default." },
          { term: "<td>", definition: "Table Data cell — regular cell. Must be inside a <tr>, never directly in <table>." },
          { term: "<ol>", definition: "Ordered List — numbered (1, 2, 3). Use when sequence matters." },
          { term: "<ul>", definition: "Unordered List — bullet points. Use when order doesn't matter." },
          { term: "<li>", definition: "List Item — same tag for both <ol> and <ul>." },
        ],
      },
      {
        title: "Key Concepts",
        items: [
          { term: "Tag vs Element", definition: "<p> is a tag. <p>Hello</p> is an element (opening tag + content + closing tag)." },
          { term: "Attribute", definition: "Extra info in the opening tag as name=\"value\" pairs (e.g. src, href, alt, width)." },
          { term: "Void Element", definition: "Self-closing tag with no content — <br>, <hr>, <img>. No closing tag needed." },
          { term: "Nesting Rule", definition: "Close tags in reverse order — last opened = first closed." },
        ],
      },
    ],
    confusionPairs: [
      { termA: "Tag", termB: "Element", tip: "<p> is a tag. <p>Hello</p> is an element. Element = opening tag + content + closing tag." },
      { termA: "<th>", termB: "<td>", tip: "<th> = header cell (bold). <td> = regular data cell. Both must be inside <tr>." },
      { termA: "<ol>", termB: "<ul>", tip: "<ol> = numbered list (Ordered). <ul> = bullet list (Unordered)." },
      { termA: "src", termB: "href", tip: "src = source for images (<img>). href = destination for links (<a>)." },
      { termA: "<b>", termB: "<strong>", tip: "Both look bold. <strong> adds semantic importance (better for accessibility/SEO)." },
    ],
  },

  // ─── Module 5: Tech Trends ───
  {
    moduleId: 5,
    title: "Tech Trends",
    sections: [
      {
        title: "AI & Machine Learning",
        items: [
          { term: "Artificial Intelligence (AI)", definition: "Machines simulating human intelligence — seeing, hearing, deciding." },
          { term: "Narrow AI (Weak AI)", definition: "AI that does ONE task well (Siri, spam filters). The only type that exists today." },
          { term: "General AI (Strong AI)", definition: "AI that thinks like a human across any task — does NOT exist yet." },
          { term: "Machine Learning (ML)", definition: "Subset of AI — computers learn patterns from data without being explicitly programmed." },
          { term: "Supervised Learning", definition: "ML trained on labelled data — 'this is cat, this is dog' (teacher guides)." },
          { term: "Unsupervised Learning", definition: "ML finds hidden patterns in unlabelled data — no teacher, discovers groups on its own." },
          { term: "Reinforcement Learning", definition: "ML learns by trial and error — rewarded for good actions, penalised for bad ones." },
        ],
      },
      {
        title: "Cloud Computing",
        items: [
          { term: "Cloud Computing", definition: "Using remote internet servers instead of your own computer for storage/processing." },
          { term: "IaaS", definition: "Infrastructure as a Service — rent raw servers/storage. You build on top (AWS, Azure)." },
          { term: "PaaS", definition: "Platform as a Service — ready-made platform for building apps (Heroku)." },
          { term: "SaaS", definition: "Software as a Service — finished software over the internet, no install (Gmail, Netflix)." },
          { term: "Public Cloud", definition: "Shared resources, cheap, scalable (AWS, Google Cloud)." },
          { term: "Private Cloud", definition: "Dedicated to one org, more secure, expensive (banks, government)." },
          { term: "Hybrid Cloud", definition: "Mix of public + private — sensitive data stays private, rest goes public." },
        ],
      },
      {
        title: "Blockchain, VR & AR",
        items: [
          { term: "Blockchain", definition: "Decentralised, immutable digital ledger — once recorded, data cannot be changed." },
          { term: "VR (Virtual Reality)", definition: "Fully immersive — headset REPLACES the real world with an artificial one." },
          { term: "AR (Augmented Reality)", definition: "ADDS digital objects onto the real world — you still see your surroundings (Pokemon GO, Snapchat filters)." },
          { term: "IoT (Internet of Things)", definition: "Everyday objects with sensors + internet connectivity — smart watches, smart homes." },
        ],
      },
      {
        title: "Generative AI & Ethics",
        items: [
          { term: "Generative AI", definition: "AI that creates NEW content (text, images, music, video) — not just analysing data." },
          { term: "GPT", definition: "Generative Pre-trained Transformer — a type of large language model (ChatGPT, etc.)." },
          { term: "Hallucination", definition: "When AI confidently generates false information — always fact-check AI output." },
          { term: "Deepfake", definition: "AI-generated fake video/audio making it look like real people said things they never did." },
          { term: "AI Ethics Golden Rule", definition: "Use AI as a co-pilot, not auto-pilot — assist thinking, never replace it." },
        ],
      },
      {
        title: "Data Analytics",
        items: [
          { term: "Descriptive Analytics", definition: "What happened? — summarises past data (e.g. monthly sales report)." },
          { term: "Diagnostic Analytics", definition: "Why did it happen? — finds root causes (e.g. why sales dropped)." },
          { term: "Predictive Analytics", definition: "What will happen? — forecasts the future using patterns." },
          { term: "Prescriptive Analytics", definition: "What should we do? — recommends specific actions." },
        ],
      },
    ],
    confusionPairs: [
      { termA: "VR", termB: "AR", tip: "VR replaces reality (headset blocks real world). AR adds to reality (you still see your surroundings)." },
      { termA: "AI", termB: "ML", tip: "AI = the big goal (smart machines). ML = one method to achieve AI (learning from data). All ML is AI, not all AI is ML." },
      { termA: "Blockchain", termB: "Bitcoin", tip: "Blockchain = the technology (ledger). Bitcoin = one application using blockchain. Not the same thing." },
      { termA: "IaaS", termB: "SaaS", tip: "IaaS = rent raw hardware, build everything yourself. SaaS = use finished software, no setup needed." },
      { termA: "Narrow AI", termB: "General AI", tip: "Narrow = one task only, exists today. General = human-level thinking across all tasks, does NOT exist yet." },
    ],
  },
];
