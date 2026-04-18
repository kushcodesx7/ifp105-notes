// Practice Questions — 50 questions (10 per module).
//
// Mirror real exam patterns across the 5 modules and tag each with a
// Bloom's level so the Practice Zone readiness dashboard can reflect
// thinking-depth not just hit rate. The Practice Zone surface is
// currently hidden from the main navigation — keep the bank up to date
// so it's ready to re-enable without another content sweep.

export interface PracticeQuestion {
  q: string;
  opts: string[];
  ans: number; // index of correct answer
  why: string; // explanation shown after answering
  bloom?: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
}

export interface PracticeSet {
  moduleId: number;
  moduleTitle: string;
  icon: string;
  accent: string;
  questions: PracticeQuestion[];
}

export const practiceSets: PracticeSet[] = [
  // ─── MODULE 1: Hardware & Software ───
  {
    moduleId: 1,
    moduleTitle: "Hardware & Software",
    icon: "🖥️",
    accent: "#6366F1",
    questions: [
      {
        q: "Which component is known as the 'brain' of the computer?",
        opts: ["RAM", "Hard Drive", "CPU", "Motherboard"],
        ans: 2,
        why: "The CPU (Central Processing Unit) processes all instructions and calculations — it is the brain that controls everything.",
        bloom: "remember",
      },
      {
        q: "What happens to data stored in RAM when the computer is turned off?",
        opts: ["It is saved permanently", "It is transferred to ROM", "It is lost completely", "It moves to the hard drive"],
        ans: 2,
        why: "RAM is volatile memory — all data disappears when power is removed. That is why you must save your work!",
        bloom: "understand",
      },
      {
        q: "Which of the following is an INPUT device?",
        opts: ["Printer", "Monitor", "Scanner", "Speakers"],
        ans: 2,
        why: "A scanner sends data INTO the computer (converts physical paper to digital). Printers, monitors, and speakers are OUTPUT devices.",
        bloom: "remember",
      },
      {
        q: "What does ROM stand for?",
        opts: ["Random Output Memory", "Read Only Memory", "Run On Memory", "Real Operating Memory"],
        ans: 1,
        why: "ROM = Read Only Memory. It stores permanent startup instructions that cannot be changed by the user.",
        bloom: "remember",
      },
      {
        q: "Which type of software manages all the hardware and allows other programs to run?",
        opts: ["Application Software", "Utility Software", "System Software", "Firmware"],
        ans: 2,
        why: "System Software (like Windows, macOS, Android) manages hardware and provides the foundation for all other software.",
        bloom: "remember",
      },
      {
        q: "What is the function of the ALU inside the CPU?",
        opts: ["Store data permanently", "Manage input devices", "Perform calculations and logical operations", "Display output"],
        ans: 2,
        why: "The ALU (Arithmetic Logic Unit) handles all math (2+3=5) and logic (is A > B?) operations inside the CPU.",
        bloom: "remember",
      },
      {
        q: "Which storage device has NO moving parts and is faster than an HDD?",
        opts: ["Floppy Disk", "HDD", "SSD", "CD-ROM"],
        ans: 2,
        why: "SSD (Solid State Drive) uses flash memory chips — no spinning disk — making it much faster and more durable than HDD.",
        bloom: "remember",
      },
      {
        q: "DNS stands for:",
        opts: ["Digital Network Service", "Domain Name System", "Data Network Server", "Direct Name Service"],
        ans: 1,
        why: "DNS = Domain Name System. It converts human-friendly URLs (google.com) into IP addresses that computers understand.",
        bloom: "remember",
      },
      {
        q: "A touchscreen is classified as:",
        opts: ["Only an input device", "Only an output device", "Both input and output (I/O device)", "Neither input nor output"],
        ans: 2,
        why: "A touchscreen accepts touch input AND displays output — making it an I/O (Input/Output) device.",
        bloom: "understand",
      },
      {
        q: "What is a 'Hard Copy'?",
        opts: ["A file saved on a hard drive", "A printed document on paper", "A backup copy of software", "An encrypted file"],
        ans: 1,
        why: "Hard Copy = output printed on physical paper. Soft Copy = digital output displayed on screen.",
        bloom: "remember",
      },
    ],
  },

  // ─── MODULE 2: Office Automation ───
  {
    moduleId: 2,
    moduleTitle: "Office Automation",
    icon: "📊",
    accent: "#10B981",
    questions: [
      {
        q: "What is the key difference between a text editor and a word processor?",
        opts: ["Text editors are faster", "Word processors support formatting like bold, fonts, and images", "Text editors can print", "There is no difference"],
        ans: 1,
        why: "Word processors (like MS Word) support rich formatting — bold, italic, fonts, images, tables. Text editors (like Notepad) only handle plain text.",
        bloom: "understand",
      },
      {
        q: "In MS Excel, what does the formula =SUM(A1:A5) do?",
        opts: ["Counts the number of cells", "Finds the average", "Adds all values from A1 to A5", "Finds the maximum value"],
        ans: 2,
        why: "SUM adds all values in the specified range. =SUM(A1:A5) adds the values in cells A1, A2, A3, A4, and A5.",
        bloom: "understand",
      },
      {
        q: "Which MS Excel function returns the number of cells that contain numbers?",
        opts: ["SUM", "AVERAGE", "COUNT", "MAX"],
        ans: 2,
        why: "COUNT counts how many cells contain numeric values. COUNTA counts non-empty cells (including text).",
        bloom: "remember",
      },
      {
        q: "In MS Word, what is the shortcut for 'Select All'?",
        opts: ["Ctrl + A", "Ctrl + S", "Ctrl + C", "Ctrl + X"],
        ans: 0,
        why: "Ctrl + A selects all content in the document. Ctrl + S saves, Ctrl + C copies, Ctrl + X cuts.",
        bloom: "remember",
      },
      {
        q: "What does the Slide Master in PowerPoint control?",
        opts: ["Only the first slide", "The animation speed", "The global design and layout of all slides", "The print settings"],
        ans: 2,
        why: "Slide Master lets you set fonts, colors, backgrounds, and layouts that apply to ALL slides at once — like a design blueprint.",
        bloom: "understand",
      },
      {
        q: "Which Excel function would you use to find the highest score in a range?",
        opts: ["MIN", "MAX", "AVERAGE", "SUM"],
        ans: 1,
        why: "MAX returns the largest value in a range. MIN returns the smallest. AVERAGE returns the mean.",
        bloom: "apply",
      },
      {
        q: "What is text wrapping in MS Word?",
        opts: ["Making text bold", "How text flows around an inserted image", "Aligning text to center", "Adding borders to text"],
        ans: 1,
        why: "Text wrapping controls how text flows around an image — tight, square, behind text, in front of text, etc.",
        bloom: "understand",
      },
      {
        q: "In Excel, what is a cell reference?",
        opts: ["A formula", "The address of a cell like A1 or B3", "A chart type", "A worksheet name"],
        ans: 1,
        why: "A cell reference is the unique address of a cell — identified by column letter + row number (e.g., A1, B3, C10).",
        bloom: "remember",
      },
      {
        q: "Which tool would you use to create a professional letter with formatting?",
        opts: ["Notepad", "MS Excel", "MS Word", "MS Paint"],
        ans: 2,
        why: "MS Word is designed for creating formatted documents — letters, reports, assignments — with fonts, headers, and images.",
        bloom: "apply",
      },
      {
        q: "What does sorting data in Excel do?",
        opts: ["Deletes duplicate values", "Arranges data in ascending or descending order", "Creates a chart", "Merges cells together"],
        ans: 1,
        why: "Sorting rearranges data in a specific order — A-Z (ascending) or Z-A (descending) — making it easier to find information.",
        bloom: "remember",
      },
    ],
  },

  // ─── MODULE 3: Social Media Foundation ───
  {
    moduleId: 3,
    moduleTitle: "Social Media",
    icon: "📱",
    accent: "#3B82F6",
    questions: [
      {
        q: "What is the main difference between 'reach' and 'impressions' on social media?",
        opts: ["They mean the same thing", "Reach = unique viewers, Impressions = total views including repeats", "Impressions = unique viewers, Reach = total views", "Reach measures comments only"],
        ans: 1,
        why: "Reach = how many different people saw your post. Impressions = total times it was displayed (one person can see it 3 times = 3 impressions, 1 reach).",
        bloom: "understand",
      },
      {
        q: "Which social media platform is BEST for professional networking?",
        opts: ["TikTok", "Snapchat", "LinkedIn", "Instagram"],
        ans: 2,
        why: "LinkedIn is designed specifically for professional networking — connecting with colleagues, finding jobs, and sharing industry content.",
        bloom: "remember",
      },
      {
        q: "What does CTR stand for in social media marketing?",
        opts: ["Content Tracking Report", "Click-Through Rate", "Creative Testing Result", "Customer Target Reach"],
        ans: 1,
        why: "CTR = Click-Through Rate. It measures the percentage of people who clicked on your link or ad after seeing it.",
        bloom: "remember",
      },
      {
        q: "What is 'organic content' on social media?",
        opts: ["Content about organic food", "Content you pay to promote", "Content posted naturally without paying for ads", "Content from verified accounts only"],
        ans: 2,
        why: "Organic content is posted for free — no paid promotion. Paid content is boosted with money to reach more people.",
        bloom: "remember",
      },
      {
        q: "Which tool is used to schedule social media posts in advance?",
        opts: ["Photoshop", "Hootsuite", "Excel", "Notepad"],
        ans: 1,
        why: "Hootsuite (also Buffer, Sprout Social) lets you schedule posts across multiple platforms ahead of time from one dashboard.",
        bloom: "remember",
      },
      {
        q: "What is A/B testing in social media advertising?",
        opts: ["Testing two versions of an ad to see which performs better", "Comparing two social media platforms", "Testing ads on audience A and B only", "Running ads on Android and Browser"],
        ans: 0,
        why: "A/B testing = create two versions of an ad (different image, text, or CTA), show each to a group, and see which gets better results.",
        bloom: "understand",
      },
      {
        q: "What is a 'hashtag' used for?",
        opts: ["To tag a friend", "To make text bold", "To categorize content and make it discoverable", "To encrypt a message"],
        ans: 2,
        why: "Hashtags (#topic) categorize your post so people searching for that topic can find it. They increase discoverability.",
        bloom: "remember",
      },
      {
        q: "What does ROI stand for in marketing?",
        opts: ["Rate of Interest", "Return on Investment", "Reach of Impressions", "Range of Influence"],
        ans: 1,
        why: "ROI = Return on Investment. It measures how much profit or value you got back compared to what you spent.",
        bloom: "remember",
      },
      {
        q: "What type of content format does TikTok primarily focus on?",
        opts: ["Long-form articles", "Short-form video", "Professional resumes", "Email newsletters"],
        ans: 1,
        why: "TikTok specializes in short-form video content — typically 15 seconds to 3 minutes — focusing on entertainment and trends.",
        bloom: "remember",
      },
      {
        q: "What is a 'call to action' (CTA) in a social media post?",
        opts: ["A phone call to customers", "A prompt telling the viewer what to do next", "A complaint form", "A way to block users"],
        ans: 1,
        why: "A CTA tells the viewer what to do next — 'Shop Now', 'Learn More', 'Sign Up', 'Click the link in bio'. It drives action.",
        bloom: "remember",
      },
    ],
  },

  // ─── MODULE 4: HTML & Web Development ───
  {
    moduleId: 4,
    moduleTitle: "HTML & Web Dev",
    icon: "🌐",
    accent: "#06B6D4",
    questions: [
      {
        q: "What does HTML stand for?",
        opts: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyper Transfer Markup Language"],
        ans: 0,
        why: "HTML = HyperText Markup Language. It is the standard language for creating web pages and web applications.",
        bloom: "remember",
      },
      {
        q: "Which HTML tag is used to create a hyperlink?",
        opts: ["<link>", "<href>", "<a>", "<url>"],
        ans: 2,
        why: "The <a> (anchor) tag creates hyperlinks. Usage: <a href=\"https://example.com\">Click here</a>",
        bloom: "remember",
      },
      {
        q: "What is the correct HTML tag for the largest heading?",
        opts: ["<heading>", "<h6>", "<h1>", "<head>"],
        ans: 2,
        why: "<h1> is the largest heading, <h6> is the smallest. <head> is a section for metadata, not a visible heading.",
        bloom: "remember",
      },
      {
        q: "Which HTML tag is used to insert an image?",
        opts: ["<image>", "<img>", "<pic>", "<photo>"],
        ans: 1,
        why: "The <img> tag inserts images. It is self-closing: <img src=\"photo.jpg\" alt=\"description\">",
        bloom: "remember",
      },
      {
        q: "What is the purpose of the 'alt' attribute in an <img> tag?",
        opts: ["Sets the image size", "Provides alternative text if the image cannot load", "Changes the image color", "Links to another page"],
        ans: 1,
        why: "The alt attribute provides text that appears if the image fails to load, and is read by screen readers for accessibility.",
        bloom: "understand",
      },
      {
        q: "Which tag is used to create an unordered (bulleted) list?",
        opts: ["<ol>", "<ul>", "<li>", "<list>"],
        ans: 1,
        why: "<ul> creates an unordered (bulleted) list. <ol> creates an ordered (numbered) list. <li> is each list item inside them.",
        bloom: "remember",
      },
      {
        q: "What does the <br> tag do?",
        opts: ["Creates a bold text", "Inserts a line break", "Creates a border", "Makes text bigger"],
        ans: 1,
        why: "<br> inserts a line break (moves text to the next line). It is a self-closing tag with no closing </br> needed.",
        bloom: "remember",
      },
      {
        q: "Which HTML element is used to define a table row?",
        opts: ["<td>", "<table>", "<tr>", "<th>"],
        ans: 2,
        why: "<tr> = table row. <td> = table data cell. <th> = table header cell. <table> is the container for the whole table.",
        bloom: "remember",
      },
      {
        q: "What is the difference between the Internet and the World Wide Web?",
        opts: ["They are the same thing", "Internet is the network, WWW is the collection of websites on it", "WWW is the network, Internet is the websites", "Internet is only for email"],
        ans: 1,
        why: "The Internet is the global network (the road). The WWW is the websites and pages accessible on that network (the buildings).",
        bloom: "understand",
      },
      {
        q: "Which tag is used to make text bold in HTML?",
        opts: ["<bold>", "<b>", "<strong>", "Both <b> and <strong>"],
        ans: 3,
        why: "Both <b> and <strong> make text bold. <strong> also adds semantic emphasis (important for screen readers).",
        bloom: "remember",
      },
    ],
  },

  // ─── MODULE 5: Latest Technology Trends ───
  {
    moduleId: 5,
    moduleTitle: "Tech Trends",
    icon: "🚀",
    accent: "#8B5CF6",
    questions: [
      {
        q: "What type of AI exists today in real-world applications?",
        opts: ["General AI", "Super AI", "Narrow AI (Weak AI)", "Conscious AI"],
        ans: 2,
        why: "All current AI is Narrow AI — designed for ONE specific task (Siri, face recognition, recommendations). General AI and Super AI do NOT exist yet.",
        bloom: "remember",
      },
      {
        q: "Machine Learning is a subset of:",
        opts: ["Cloud Computing", "Blockchain", "Artificial Intelligence", "Virtual Reality"],
        ans: 2,
        why: "ML is one method to achieve AI — it learns from data instead of being explicitly programmed with rules.",
        bloom: "remember",
      },
      {
        q: "Which type of data analytics answers the question 'What will happen?'",
        opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
        ans: 2,
        why: "Predictive analytics uses patterns to forecast future outcomes. Descriptive = what happened. Diagnostic = why. Prescriptive = what to do.",
        bloom: "remember",
      },
      {
        q: "In Cloud Computing, SaaS stands for:",
        opts: ["Software as a Service", "Storage as a Service", "System as a Service", "Security as a Service"],
        ans: 0,
        why: "SaaS = Software as a Service. You use finished software over the internet (Gmail, Google Docs, Netflix) without installing anything.",
        bloom: "remember",
      },
      {
        q: "Blockchain is BEST described as:",
        opts: ["A social media platform", "A type of cryptocurrency", "A decentralised, distributed digital ledger", "A cloud storage service"],
        ans: 2,
        why: "Blockchain is the underlying technology — a decentralised ledger. Bitcoin is one application that uses blockchain, not blockchain itself.",
        bloom: "remember",
      },
      {
        q: "What is the key difference between VR and AR?",
        opts: ["VR is free, AR is paid", "VR replaces reality, AR adds to reality", "AR replaces reality, VR adds to reality", "There is no difference"],
        ans: 1,
        why: "VR completely replaces your environment (headset blocks real world). AR overlays digital objects on top of the real world (phone camera).",
        bloom: "understand",
      },
      {
        q: "Which of these is an example of IoT (Internet of Things)?",
        opts: ["A regular light bulb", "A smart thermostat that adjusts temperature automatically", "A paper notebook", "A wired desktop computer"],
        ans: 1,
        why: "IoT = everyday objects connected to the internet with sensors. A smart thermostat senses temperature and adjusts itself remotely.",
        bloom: "apply",
      },
      {
        q: "What does Generative AI do differently from traditional AI?",
        opts: ["It only analyses data", "It creates new original content (text, images, music)", "It only classifies existing data", "It replaces human workers"],
        ans: 1,
        why: "Generative AI creates NEW content — text (ChatGPT), images (DALL-E), music (Suno). Traditional AI mainly classifies or predicts.",
        bloom: "understand",
      },
      {
        q: "GPT stands for:",
        opts: ["General Processing Technology", "Generative Pre-trained Transformer", "Global Prediction Tool", "Graphics Processing Terminal"],
        ans: 1,
        why: "GPT = Generative Pre-trained Transformer. It is the architecture behind ChatGPT — trained on massive data to generate human-like text.",
        bloom: "remember",
      },
      {
        q: "Using AI-generated text as your own work without disclosure is considered:",
        opts: ["Creative writing", "Smart studying", "Academic dishonesty / plagiarism", "Fair use"],
        ans: 2,
        why: "Submitting AI output as your own is plagiarism. AI should be used as a learning tool, not a replacement for your thinking. Always disclose.",
        bloom: "evaluate",
      },
    ],
  },
];
