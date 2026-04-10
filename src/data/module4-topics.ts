import type { Topic } from "./module1-topics";

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "World Wide Web (WWW)",
    time: "~4 mins",
    badges: [],
    hook: `You open Chrome, type a website, and it appears. But what exactly IS the web? Is it the same as the internet? <strong>Spoiler: they are NOT the same thing.</strong> Let's clear this up once and for all.`,
    content: [
      {
        type: "image",
        src: "/images/m4/www-globe.webp",
        description: "The World Wide Web: a glowing globe connected to browser windows by network lines",
      },
      {
        type: "text",
        html: `The <strong>World Wide Web (WWW)</strong> is a huge collection of web pages stored on computers all over the world — connected through the internet.`,
      },
      {
        type: "analogy",
        label: "Road & Buildings Analogy",
        html: `The <strong>Internet is the road</strong>. The <strong>WWW is all the shops, houses and buildings</strong> on that road. You need the road (internet) to reach the buildings (websites). The internet existed before the web — email worked without it!`,
      },
      {
        type: "text",
        html: `You access websites using a <strong>Web Browser</strong> like Chrome or Firefox. You type a <strong>URL</strong> (web address) and the browser fetches that page for you.`,
      },
      {
        type: "table",
        headers: ["Term", "What it means", "Example"],
        rows: [
          { cells: ["<code>WWW</code>", "World Wide Web — system of web pages", "What you browse daily"] },
          { cells: ["<code>URL</code>", "Uniform Resource Locator — web address", "https://www.google.com"] },
          { cells: ["<code>Web Browser</code>", "App that loads web pages", "Chrome, Firefox, Edge"] },
          { cells: ["<code>HTTP/HTTPS</code>", "Rules for sending web pages", "https:// at the start of URLs"] },
          { cells: ["<code>Web Server</code>", "Computer that stores websites", "Google's servers store google.com"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Key distinction:</strong> WWW is NOT the Internet. The Internet is the network of cables and connections. WWW is just one service running on it — like email is another service on the same network.`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "HTML & Basic Tags",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Every website you've ever visited — Google, YouTube, Instagram — is built with HTML under the hood. <strong>HTML is the skeleton of every web page.</strong> It tells the browser what to show and how to structure it. Time to write your first code.`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-tags.webp",
        description: "HTML code structure showing nested tags in a tree-like hierarchy",
      },
      {
        type: "text",
        html: `<strong>HTML (HyperText Markup Language)</strong> is the language used to build web pages. It uses <strong>tags</strong> to tell the browser what to display.`,
      },
      {
        type: "analogy",
        label: "Artist Instructions Analogy",
        html: `HTML is like giving instructions to an artist. <code>&lt;h1&gt;</code> = "Draw a big title". <code>&lt;p&gt;</code> = "Write a paragraph here". The browser is the artist that follows your instructions!`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;!DOCTYPE html&gt;         &lt;!-- tells browser: this is HTML --&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello World!&lt;/h1&gt;
    &lt;p&gt;This is a paragraph.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>`,
      },
      {
        type: "table",
        headers: ["Tag", "Purpose"],
        rows: [
          { cells: ["<code>&lt;html&gt;</code>", "Root tag — wraps everything"] },
          { cells: ["<code>&lt;head&gt;</code>", "Info about the page (not shown on screen)"] },
          { cells: ["<code>&lt;title&gt;</code>", "Title shown on browser tab"] },
          { cells: ["<code>&lt;body&gt;</code>", "Everything visible on the page goes here"] },
          { cells: ["<code>&lt;h1&gt; to &lt;h6&gt;</code>", "Headings — h1 is biggest, h6 is smallest"] },
          { cells: ["<code>&lt;p&gt;</code>", "Paragraph of text"] },
        ],
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>📐 Visual: HTML Page Structure</strong><pre><code>  &lt;!DOCTYPE html&gt;  ← tells browser: this is HTML5
  ┌─── &lt;html&gt; ────────────────────┐
  │                                 │
  │  ┌─── &lt;head&gt; ──────────────┐   │
  │  │  &lt;title&gt;My Page&lt;/title&gt; │   │  ← Not visible on page
  │  └─────────────────────────┘   │     (shown in browser tab)
  │                                 │
  │  ┌─── &lt;body&gt; ──────────────┐   │
  │  │  &lt;h1&gt;Hello!&lt;/h1&gt;       │   │  ← Everything visible
  │  │  &lt;p&gt;Welcome.&lt;/p&gt;       │   │     goes here
  │  └─────────────────────────┘   │
  │                                 │
  └─────────────────────────────────┘</code></pre>`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Structure rule:</strong> Every HTML page needs this skeleton: <code>&lt;!DOCTYPE html&gt;</code> at the top, then <code>&lt;html&gt;</code> wrapping <code>&lt;head&gt;</code> and <code>&lt;body&gt;</code>. The head holds metadata; the body holds everything visible.`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "HTML Elements",
    time: "~4 mins",
    badges: [],
    hook: `People confuse "tags" and "elements" all the time. They are NOT the same thing. <strong>An element is the whole package — opening tag + content + closing tag.</strong> Getting this difference right is worth easy marks.`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-element.webp",
        description: "Anatomy of an HTML element: opening tag, content, closing tag",
      },
      {
        type: "text",
        html: `An <strong>HTML Element</strong> = Opening tag + Content + Closing tag. It's the complete package!`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;p&gt;This is a paragraph.&lt;/p&gt;
 ^  opening    ^ content          ^ closing tag
 |_____________ This whole thing = 1 Element ______________|</code></pre>`,
      },
      {
        type: "analogy",
        label: "Sandwich Analogy",
        html: `Think of it like a sandwich: <strong>bread</strong> (opening tag) + <strong>filling</strong> (content) + <strong>bread</strong> (closing tag) = one complete sandwich (element)!`,
      },
      {
        type: "table",
        headers: ["Part", "Example", "What it does"],
        rows: [
          { cells: ["Opening Tag", "<code>&lt;h1&gt;</code>", "Starts the element"] },
          { cells: ["Content", "<code>Hello!</code>", "What is shown on screen"] },
          { cells: ["Closing Tag", "<code>&lt;/h1&gt;</code>", "Ends the element (note the /)"] },
        ],
      },
      {
        type: "text",
        html: `Some elements are <strong>self-closing</strong> — they have no content or closing tag:`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;br&gt;                  &lt;!-- line break --&gt;
&lt;hr&gt;                  &lt;!-- horizontal line --&gt;
&lt;img src="photo.jpg"&gt; &lt;!-- image --&gt;</code></pre>`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Key difference:</strong> <code>&lt;p&gt;</code> is a <strong>tag</strong>. <code>&lt;p&gt;Hello&lt;/p&gt;</code> is an <strong>element</strong>. Elements include BOTH tags AND the content inside!`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "HTML Attributes",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Tags tell the browser WHAT to show. But <strong>attributes tell it HOW</strong> — what size, what colour, where to link. They're the customisation options that make HTML flexible and powerful.`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-attributes.webp",
        description: "HTML tag with attributes highlighted in different colors",
      },
      {
        type: "text",
        html: `<strong>Attributes</strong> give extra information about an element. They always go inside the <strong>opening tag</strong> as <strong>name="value"</strong> pairs.`,
      },
      {
        type: "analogy",
        label: "Pizza Customisation Analogy",
        html: `A tag is like ordering a pizza. Attributes are the extras — "make it <strong>large</strong>, <strong>extra cheese</strong>, <strong>thin crust</strong>". Same pizza, different customisation!`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;img src="dog.jpg" width="200" alt="A cute dog"&gt;
      ^ name  ^ value   ^ name  ^ value  ^ name  ^ value</code></pre>`,
      },
      {
        type: "table",
        headers: ["Attribute", "Used in", "What it does"],
        rows: [
          { cells: ["<code>src</code>", "&lt;img&gt;", "Path or URL to the image"] },
          { cells: ["<code>href</code>", "&lt;a&gt;", "URL of the link destination"] },
          { cells: ["<code>alt</code>", "&lt;img&gt;", "Text shown if image fails to load"] },
          { cells: ["<code>width / height</code>", "&lt;img&gt;", "Size of the image in pixels"] },
          { cells: ["<code>border</code>", "&lt;table&gt;", "Adds a border to the table"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Rules to remember:</strong> Attributes go in the <strong>opening tag only</strong> — never the closing tag. Values must always be in <strong>quotes</strong>. Example: <code>width="200"</code>`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Boolean attributes:</strong> Some attributes don't need a value — just being present makes them active. Example: <code>&lt;input disabled&gt;</code> makes the input disabled. Common booleans: <code>disabled</code>, <code>readonly</code>, <code>checked</code>.`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "HTML Comments",
    time: "~3 mins",
    badges: [],
    hook: `What if you could write secret notes in your code that only YOU can see — completely invisible to anyone visiting the website? <strong>That's exactly what HTML comments do.</strong> The browser ignores them completely.`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-comments.webp",
        description: "HTML comments shown as ghosted/invisible code compared to visible code",
      },
      {
        type: "text",
        html: `A <strong>comment</strong> is a note you write in your HTML code — but the browser <strong>completely ignores it</strong>. It won't show on the webpage at all!`,
      },
      {
        type: "analogy",
        label: "Sticky Notes Analogy",
        html: `Comments are like <strong>sticky notes on your textbook</strong>. They're for YOU — the teacher (browser) doesn't mark them! Other coders reading your code will thank you for good comments.`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;!-- This is a comment. Browser ignores this. --&gt;
&lt;h1&gt;My Page&lt;/h1&gt;   &lt;!-- This is the main heading --&gt;
&lt;!-- TODO: Add more content here later --&gt;</code></pre>`,
      },
      {
        type: "table",
        headers: ["Syntax", "Example"],
        rows: [
          { cells: ["<code>&lt;!-- comment text --&gt;</code>", "<code>&lt;!-- This is the navigation bar --&gt;</code>"] },
        ],
      },
      {
        type: "text",
        html: `<strong>Why use comments?</strong><br>1. To explain your code<br>2. To temporarily hide parts of code<br>3. To leave notes for future edits`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Exam syntax:</strong> Starts with <code>&lt;!--</code> and ends with <code>--&gt;</code>. Don't forget the dashes! This syntax is very commonly tested in exams.`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "HTML Formatting",
    time: "~4 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Plain text is boring. You want <strong>bold</strong>, <em>italic</em>, and underlined text — just like in MS Word. <strong>HTML has tags for all of this.</strong> And yes, you can combine them.`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-formatting.webp",
        description: "Text formatting showcase: bold, italic, underline, subscript, superscript",
      },
      {
        type: "text",
        html: `HTML has tags to style your text — just like the bold/italic/underline buttons in MS Word!`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;b&gt;Bold text&lt;/b&gt;
&lt;i&gt;Italic text&lt;/i&gt;
&lt;u&gt;Underlined text&lt;/u&gt;
&lt;strong&gt;Important!&lt;/strong&gt;    (bold + semantic meaning)
&lt;mark&gt;Highlighted&lt;/mark&gt;      (yellow highlight)
&lt;small&gt;Small text&lt;/small&gt;    (smaller font size)</code></pre>`,
      },
      {
        type: "table",
        headers: ["Tag", "Effect", "When to use"],
        rows: [
          { cells: ["<code>&lt;b&gt;</code>", "Bold", "Visual emphasis"] },
          { cells: ["<code>&lt;i&gt;</code>", "Italic", "Titles, foreign words"] },
          { cells: ["<code>&lt;u&gt;</code>", "Underline", "Special attention"] },
          { cells: ["<code>&lt;strong&gt;</code>", "Bold + importance", "Important content (browsers also bold it)"] },
          { cells: ["<code>&lt;mark&gt;</code>", "Yellow highlight", "Key terms"] },
          { cells: ["<code>&lt;small&gt;</code>", "Smaller text", "Fine print, disclaimers"] },
          { cells: ["<code>&lt;em&gt;</code>", "Italic + emphasis", "Words you'd stress when speaking (like &lt;strong&gt; but for italic)"] },
          { cells: ["<code>&lt;del&gt;</code>", "Strikethrough", "Deleted or outdated text (shows a line through it)"] },
          { cells: ["<code>&lt;sub&gt;</code>", "Subscript", "Chemical formulas: H<sub>2</sub>O"] },
          { cells: ["<code>&lt;sup&gt;</code>", "Superscript", "Math powers: x<sup>2</sup>"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Combining tags:</strong> You can nest formatting tags! <code>&lt;b&gt;&lt;i&gt;Bold and Italic&lt;/i&gt;&lt;/b&gt;</code> makes text both bold AND italic. Just close them in <strong>reverse order</strong> — last opened = first closed.`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "HTML Tables",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }, { text: "Exam favourite", type: "hot" }],
    hook: `Tables are one of the <strong>most commonly tested HTML topics</strong> in the exam. They're worth 8 marks and they show up in almost every paper. <strong>Master the table structure and it's free marks.</strong>`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-table.webp",
        description: "HTML table with colored header row, grid cells, and merged cell arrows",
      },
      {
        type: "text",
        html: `A <strong>table</strong> organises data into rows and columns — like a spreadsheet on a webpage.`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;table border="1"&gt;
  &lt;tr&gt;                         &lt;!-- Table Row --&gt;
    &lt;th&gt;Name&lt;/th&gt;              &lt;!-- Table Header (bold) --&gt;
    &lt;th&gt;Age&lt;/th&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;td&gt;Alex&lt;/td&gt;             &lt;!-- Table Data (regular cell) --&gt;
    &lt;td&gt;20&lt;/td&gt;
  &lt;/tr&gt;
&lt;/table&gt;</code></pre>`,
      },
      {
        type: "table",
        headers: ["Tag", "Stands For", "Purpose"],
        rows: [
          { cells: ["<code>&lt;table&gt;</code>", "Table", "Wraps the whole table"] },
          { cells: ["<code>&lt;tr&gt;</code>", "Table Row", "One horizontal row"] },
          { cells: ["<code>&lt;th&gt;</code>", "Table Header", "Bold header cell"] },
          { cells: ["<code>&lt;td&gt;</code>", "Table Data", "Regular data cell"] },
        ],
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>📐 Visual: Table Structure</strong><pre><code>┌──────── &lt;table&gt; ────────┐
│                          │
│  ┌──── &lt;tr&gt; ──────────┐  │
│  │ &lt;th&gt;Name&lt;/th&gt; │ &lt;th&gt;Age&lt;/th&gt; │  │
│  └─────────────────────┘  │
│  ┌──── &lt;tr&gt; ──────────┐  │
│  │ &lt;td&gt;Alex&lt;/td&gt; │ &lt;td&gt;20&lt;/td&gt;  │  │
│  └─────────────────────┘  │
│                          │
└──────────────────────────┘</code></pre>`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Nesting rule:</strong> <code>table</code> contains <code>tr</code>, and <code>tr</code> contains <code>th</code> or <code>td</code>. Never put <code>&lt;td&gt;</code> directly inside <code>&lt;table&gt;</code> — it MUST be inside a <code>&lt;tr&gt;</code>!`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>The border attribute:</strong> <code>&lt;table border="1"&gt;</code> adds visible lines around cells. Without it, the table is invisible — the data is there but you can't see the grid.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Table caption:</strong> Use <code>&lt;caption&gt;</code> right after the opening <code>&lt;table&gt;</code> tag to give your table a title. Example: <code>&lt;caption&gt;Student Grades&lt;/caption&gt;</code>. It appears above the table and helps describe what the table shows.`,
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "HTML Lists",
    time: "~4 mins",
    badges: [{ text: "Exam favourite", type: "hot" }],
    hook: `Lists appear in almost every exam paper. There are two types: <strong>numbered (ordered) and bulleted (unordered)</strong>. Know when to use each one and how to code them — it's guaranteed marks.`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-lists.webp",
        description: "Unordered and ordered lists side by side with nested sub-items",
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;!-- ORDERED LIST -- numbered 1, 2, 3 --&gt;
&lt;ol&gt;
  &lt;li&gt;Wake up&lt;/li&gt;
  &lt;li&gt;Brush teeth&lt;/li&gt;
  &lt;li&gt;Go to college&lt;/li&gt;
&lt;/ol&gt;

&lt;!-- UNORDERED LIST -- bullet points --&gt;
&lt;ul&gt;
  &lt;li&gt;Pizza&lt;/li&gt;
  &lt;li&gt;Burger&lt;/li&gt;
  &lt;li&gt;Pasta&lt;/li&gt;
&lt;/ul&gt;</code></pre>`,
      },
      {
        type: "table",
        headers: ["Tag", "Type", "Output"],
        rows: [
          { cells: ["<code>&lt;ol&gt;</code>", "Ordered List", "1. 2. 3. (numbers)"] },
          { cells: ["<code>&lt;ul&gt;</code>", "Unordered List", "Bullet points"] },
          { cells: ["<code>&lt;li&gt;</code>", "List Item", "Each individual item"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Memory trick:</strong> <strong>O</strong>rdered = <strong>O</strong>ne, two, three (numbered). <strong>U</strong>nordered = <strong>U</strong>nhappy with any order — just bullets! Use ordered when sequence matters; unordered when it doesn't.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Structure:</strong> The <code>&lt;li&gt;</code> tag is the same for BOTH list types. The outer wrapper (<code>&lt;ol&gt;</code> or <code>&lt;ul&gt;</code>) decides whether you get numbers or bullets.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Customising lists:</strong> Use <code>type</code> to change numbering style: <code>&lt;ol type="A"&gt;</code> for A, B, C. <code>type="I"</code> for Roman numerals. <code>type="a"</code> for lowercase. Use <code>start="5"</code> to begin counting from 5 instead of 1.`,
      },
    ],
  },

  // ─── Topic 9 ───
  {
    id: 9,
    title: "Hyperlinks",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `The entire web is built on links — click one thing and you're somewhere else. <strong>Without hyperlinks, every website would be a dead end.</strong> The anchor tag <code>&lt;a&gt;</code> is how you create them.`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-links.webp",
        description: "Two web pages connected by a glowing link with click cursor",
      },
      {
        type: "text",
        html: `A <strong>hyperlink</strong> lets users click text and jump to another page or website. The tag is <code>&lt;a&gt;</code> — called the <strong>anchor tag</strong>.`,
      },
      {
        type: "analogy",
        label: "Teleporter Door Analogy",
        html: `A hyperlink is a <strong>teleporter door</strong> on a webpage. Click it and you're instantly somewhere else! The <code>href</code> attribute is the address you teleport to.`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;a href="https://www.google.com"&gt;Click here to visit Google&lt;/a&gt;

&lt;!-- Opens in a NEW tab --&gt;
&lt;a href="https://www.youtube.com" target="_blank"&gt;YouTube&lt;/a&gt;</code></pre>`,
      },
      {
        type: "table",
        headers: ["Attribute", "Purpose"],
        rows: [
          { cells: ["<code>href</code>", "The URL where the link goes (the destination)"] },
          { cells: ["<code>target=\"_blank\"</code>", "Opens the link in a new browser tab"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Exam detail:</strong> <code>target="_blank"</code> is a commonly tested attribute — it makes the link open in a NEW tab instead of replacing the current page. If not specified, the link opens in the same tab.`,
      },
    ],
  },

  // ─── Topic 10 ───
  {
    id: 10,
    title: "Images & Image Links",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `A page with just text is boring. Images make websites come alive. And when you combine images with links, <strong>you get clickable images — one of the most powerful patterns in web design.</strong>`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-images.webp",
        description: "The img tag concept: picture frame with src arrow and alt tooltip",
      },
      {
        type: "text",
        html: `Use <code>&lt;img&gt;</code> to show an image. To make an image <strong>clickable</strong>, wrap it inside an <code>&lt;a&gt;</code> tag!`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;!-- Just an image --&gt;
&lt;img src="photo.jpg" alt="My Photo" width="200"&gt;

&lt;!-- Clickable Image Link --&gt;
&lt;a href="https://www.amity.edu"&gt;
  &lt;img src="logo.jpg" alt="Amity Logo" width="200"&gt;
&lt;/a&gt;</code></pre>`,
      },
      {
        type: "table",
        headers: ["Attribute", "Purpose"],
        rows: [
          { cells: ["<code>src</code>", "URL or file path of the image"] },
          { cells: ["<code>alt</code>", "Text shown if image can't load (accessibility)"] },
          { cells: ["<code>width</code>", "Width of the image in pixels"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Image Link pattern:</strong> <code>&lt;a&gt;</code> wraps around <code>&lt;img&gt;</code>. The anchor tag is always the OUTER wrapper. Think of it as: the link is the door frame, the image is the door.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Self-closing tag:</strong> <code>&lt;img&gt;</code> has NO closing tag — it's self-closing. All its info goes in attributes: <code>src</code>, <code>alt</code>, <code>width</code>. Forgetting <code>alt</code> is a common mistake in exams.`,
      },
    ],
  },

  // ─── Topic 11 ───
  {
    id: 11,
    title: "Big Challenge -- Build a Full HTML Page",
    time: "~8 mins",
    badges: [{ text: "Exam favourite", type: "hot" }],
    hook: `This is where everything comes together. In the exam, you'll be asked to <strong>write a complete HTML page from scratch</strong> — using headings, paragraphs, formatting, tables, lists, links, and comments. This topic is your rehearsal.`,
    content: [
      {
        type: "image",
        src: "/images/m4/html-full-page.webp",
        description: "Complete HTML page structure as a layered building blueprint",
      },
      {
        type: "text",
        html: `Your final challenge — build a <strong>complete HTML page</strong> using everything from Module 4. This is exactly the type of question worth big marks in the exam!`,
      },
      {
        type: "text",
        html: `<strong>Your page must include:</strong><br>
1. Proper HTML structure (<code>html</code>, <code>head</code>, <code>title</code>, <code>body</code>)<br>
2. At least one heading (<code>h1</code> or <code>h2</code>)<br>
3. One paragraph with formatted text (bold, italic, or underline)<br>
4. A table with at least 2 data rows<br>
5. An ordered OR unordered list with 3+ items<br>
6. One hyperlink<br>
7. At least one HTML comment`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My Portfolio&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;!-- Main heading --&gt;
    &lt;h1&gt;About Me&lt;/h1&gt;
    &lt;p&gt;My name is &lt;b&gt;Alex&lt;/b&gt; and I study &lt;i&gt;Computer Science&lt;/i&gt;.&lt;/p&gt;

    &lt;!-- My subjects table --&gt;
    &lt;table border="1"&gt;
      &lt;tr&gt;
        &lt;th&gt;Subject&lt;/th&gt;&lt;th&gt;Grade&lt;/th&gt;
      &lt;/tr&gt;
      &lt;tr&gt;
        &lt;td&gt;Maths&lt;/td&gt;&lt;td&gt;A&lt;/td&gt;
      &lt;/tr&gt;
      &lt;tr&gt;
        &lt;td&gt;Science&lt;/td&gt;&lt;td&gt;B+&lt;/td&gt;
      &lt;/tr&gt;
    &lt;/table&gt;

    &lt;!-- My hobbies --&gt;
    &lt;h2&gt;Hobbies&lt;/h2&gt;
    &lt;ul&gt;
      &lt;li&gt;Coding&lt;/li&gt;
      &lt;li&gt;Gaming&lt;/li&gt;
      &lt;li&gt;Reading&lt;/li&gt;
    &lt;/ul&gt;

    &lt;!-- Link to my school --&gt;
    &lt;a href="https://www.amity.edu"&gt;Visit Amity&lt;/a&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Exam strategy:</strong> Use comments above each section to show the examiner you understand the structure. Label each part: <code>&lt;!-- heading --&gt;</code>, <code>&lt;!-- table --&gt;</code>, <code>&lt;!-- list --&gt;</code>. This earns extra marks for clarity.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Semantic HTML (bonus marks):</strong> Modern HTML uses tags that <strong>describe meaning</strong>, not just appearance. <code>&lt;nav&gt;</code> for navigation menus. <code>&lt;header&gt;</code> and <code>&lt;footer&gt;</code> for page top/bottom sections. <code>&lt;section&gt;</code> for grouped content. <code>&lt;article&gt;</code> for standalone content like blog posts. Using these shows the examiner you know modern web standards!`,
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>Common mistakes:</strong> Forgetting <code>&lt;!DOCTYPE html&gt;</code> at the top. Not closing tags. Putting <code>&lt;td&gt;</code> directly inside <code>&lt;table&gt;</code> without <code>&lt;tr&gt;</code>. Forgetting the <code>border</code> attribute on tables. Missing <code>alt</code> on images.`,
      },
    ],
  },
];
