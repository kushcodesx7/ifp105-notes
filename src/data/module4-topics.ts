import type { Topic } from "./module1-topics";

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "World Wide Web (WWW)",
    time: "~4 mins",
    badges: [],
    hook: `You open Chrome and type google.uz. A page shows up. <strong>But what is \u201cthe web\u201d? Is it the same as \u201cthe internet\u201d? Short answer: no.</strong> Let\u2019s fix that in 4 minutes.`,
    content: [
      {
        type: "text",
        html: `The <strong>World Wide Web (WWW)</strong> is the huge collection of <mark>web pages</mark> stored on computers all over the world. You visit them in a <strong>browser</strong> (Chrome, Firefox, Edge) by typing a web address.`,
      },
      {
        type: "image",
        src: "/images/m4/www-globe.webp",
        description: "The World Wide Web: a glowing globe connected to browser windows by network lines",
      },
      {
        type: "analogy",
        label: "\ud83d\udee3\ufe0f Road and buildings",
        html: `The <strong>internet is the road</strong>. The <strong>web is all the shops and houses</strong> on that road. You need the road to reach a building. Email, WhatsApp calls, and online games also use the road \u2014 but they are NOT the web. The web is just one thing you can do on the internet.`,
      },
      {
        type: "text",
        html: `<strong>A web address is called a URL.</strong> Every URL has a few parts \u2014 here is one you see every day:`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px;">https://www.yandex.uz/news</code>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udd10",
            title: "https://",
            description: "The safe, locked version of http. The \u201cs\u201d means your info is scrambled on the way, so a password or card number cannot be read by strangers on the Wi-Fi.",
            tag: "Protocol",
            tagColor: "blue",
          },
          {
            icon: "\ud83c\udf10",
            title: "www.yandex.uz",
            description: "The website name, called the domain. The .uz ending tells you this site belongs to Uzbekistan. .com, .ru, .edu are other endings you see often.",
            tag: "Domain",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udcc4",
            title: "/news",
            description: "The path. It tells the server which page on the site you want \u2014 in this case the news page, not the home page.",
            tag: "Path",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udda5\ufe0f",
            title: "The server",
            description: "A powerful computer somewhere in the world that stores this page and sends it to your browser when you ask.",
            tag: "Behind the scenes",
            tagColor: "amber",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this matters:</strong> \u2705 You type a URL, the browser asks the server, the server sends the page back \u00b7 \u2705 HTTPS (the lock icon) keeps your passwords safe on caf\u00e9 Wi-Fi \u00b7 \u2705 Knowing .uz / .com / .edu helps you spot fake sites.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f \u201cInternet\u201d and \u201cweb\u201d are NOT the same \u2014 the web is one service on the internet \u00b7 \u26a0\ufe0f If a site is just <code>http://</code> (no s) and asks for a password, don\u2019t type it \u00b7 \u26a0\ufe0f A weird domain like <code>yand3x.uz</code> is almost always a scam.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Open your phone and look at the URL of three sites you visited today. Which ones start with <code>https://</code>? Which ending (.uz, .com, .ru) is most common, and why do you think that is?`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "HTML & Basic Tags",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Every website you open \u2014 YouTube, Instagram, yandex.uz \u2014 is built with HTML. <strong>HTML is the skeleton that tells the browser what to show: a heading here, a paragraph there, an image below.</strong> In a few minutes, you\u2019ll write your first HTML page.`,
    content: [
      {
        type: "text",
        html: `<strong>HTML</strong> stands for <strong>HyperText Markup Language</strong>. You use small instructions called <mark>tags</mark> to tell the browser what to put on the page. A tag looks like this \u2014 a word inside angle brackets:`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px;">&lt;h1&gt;Hello, Tashkent!&lt;/h1&gt;</code>`,
      },
      {
        type: "analogy",
        label: "\ud83c\udfa8 Instructions for an artist",
        html: `HTML is like giving a drawing list to an artist. <code>&lt;h1&gt;</code> means \u201cdraw a big title here.\u201d <code>&lt;p&gt;</code> means \u201cwrite a paragraph here.\u201d The <strong>browser is the artist</strong> \u2014 it reads your tags and paints the page for you.`,
      },
      {
        type: "image",
        src: "/images/m4/html-tags.webp",
        description: "HTML code structure showing nested tags in a tree-like hierarchy",
      },
      {
        type: "text",
        html: `<strong>Every HTML page follows the same shape.</strong> You can copy this into Notepad, save as <code>page.html</code>, and open it in Chrome:`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px; white-space:pre;">&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;My First Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello!&lt;/h1&gt;
    &lt;p&gt;This is my first web page.&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83e\udde0",
            title: "<head> \u2014 info about the page",
            description: "Holds the browser tab title and settings. You do NOT see this on the page itself. Think \u201cbehind the scenes.\u201d",
            tag: "Not visible",
            tagColor: "amber",
          },
          {
            icon: "\ud83d\udcc4",
            title: "<body> \u2014 what people see",
            description: "Everything you want to show on the page: headings, paragraphs, pictures, buttons. If you want it on screen, put it here.",
            tag: "Visible",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Try it yourself \u2014 small challenges:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Change the title",
            description: "Make the browser tab say \u201cMy Tashkent Page\u201d instead of \u201cMy First Page.\u201d Look for the tag inside <head>.",
            tag: "<title>",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Add your name",
            description: "Below the h1, add a paragraph that says your full name. Use <p>your name</p> inside the body.",
            tag: "<p>",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Try different sizes",
            description: "Replace the h1 with h2, then h3. Save and reload. Notice how the heading gets smaller each time.",
            tag: "<h1>\u2013<h6>",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this helps:</strong> \u2705 Every HTML page uses the same shape \u2014 learn it once, use it forever \u00b7 \u2705 <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> give you 6 heading sizes, biggest to smallest \u00b7 \u2705 Notepad + a browser is all you need to start \u2014 no paid software.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Forgetting <code>&lt;!DOCTYPE html&gt;</code> can make the page render in a weird old mode \u00b7 \u26a0\ufe0f Every opening tag like <code>&lt;p&gt;</code> needs a closing <code>&lt;/p&gt;</code> \u2014 note the slash \u00b7 \u26a0\ufe0f Save the file as <code>.html</code>, not <code>.txt</code>, or the browser won\u2019t read the tags.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> If the <code>&lt;title&gt;</code> is inside the <code>&lt;head&gt;</code> (which is not shown on the page), why do you still see it somewhere? Where does it actually appear?`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "HTML Elements",
    time: "~4 mins",
    badges: [],
    hook: `People mix up \u201ctag\u201d and \u201celement\u201d all the time. <strong>They\u2019re close, but not the same.</strong> An element is the full package \u2014 opening tag + content + closing tag. Sort this out now and you\u2019ll never get tripped up.`,
    content: [
      {
        type: "text",
        html: `An <strong>HTML element</strong> is the complete thing: an <mark>opening tag</mark>, some <mark>content</mark> in the middle, and a <mark>closing tag</mark> at the end. The closing tag has a small slash in it.`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px;">&lt;p&gt;I live in Tashkent.&lt;/p&gt;</code>`,
      },
      {
        type: "analogy",
        label: "\ud83e\udd6a A sandwich",
        html: `Think of a sandwich. <strong>Top bread</strong> (opening tag <code>&lt;p&gt;</code>) + <strong>filling</strong> (your words) + <strong>bottom bread</strong> (closing tag <code>&lt;/p&gt;</code>) = one complete sandwich, which is your <strong>element</strong>. A tag on its own is just one slice of bread.`,
      },
      {
        type: "image",
        src: "/images/m4/html-element.webp",
        description: "Anatomy of an HTML element: opening tag, content, closing tag",
      },
      {
        type: "text",
        html: `<strong>Some special elements don\u2019t need a closing tag.</strong> They carry their info inside the tag itself and stand alone. These are called <strong>self-closing</strong> or <strong>empty</strong> tags:`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px; white-space:pre;">&lt;br&gt;                          &nbsp;&nbsp;line break (new line)
&lt;hr&gt;                          &nbsp;&nbsp;horizontal line across the page
&lt;img src="photo.jpg"&gt;        &nbsp;&nbsp;an image</code>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Tag vs element",
            description: "<p> is just a tag (one piece). <p>Hi</p> is an element (the whole thing). If someone says \u201cthe p element,\u201d they mean the opening tag + content + closing tag.",
            tag: "Big difference",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "The slash / is important",
            description: "The closing tag is what tells the browser \u201cthis element ends here.\u201d Without the slash, the browser keeps waiting for more content.",
            tag: "/ = end",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Try it in Notepad",
            description: "Type <h1>My name</h1> and save as test.html. Now try it WITHOUT the closing </h1>. See how the rest of the page also turns into a giant heading.",
            tag: "Learn by breaking",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this matters:</strong> \u2705 Most tags come in pairs \u2014 opening and closing \u00b7 \u2705 A few stand-alone tags (<code>&lt;br&gt;</code>, <code>&lt;hr&gt;</code>, <code>&lt;img&gt;</code>) don\u2019t need a closing tag \u00b7 \u2705 Elements can sit inside other elements \u2014 that\u2019s how you get a page with a heading inside a section inside the body.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Forgetting the slash (<code>&lt;/p&gt;</code>) is the #1 beginner mistake \u2014 everything after it can break \u00b7 \u26a0\ufe0f Don\u2019t write a closing tag for <code>&lt;br&gt;</code> or <code>&lt;img&gt;</code> \u2014 they don\u2019t take one \u00b7 \u26a0\ufe0f Tags are case-sensitive in some files \u2014 stick to lowercase to be safe.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Open any website, right-click, and pick \u201cView Page Source.\u201d Can you spot three different elements (like <code>&lt;div&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;a&gt;</code>)? Which ones have closing tags and which don\u2019t?`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "HTML Attributes",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Tags say WHAT to show. <strong>Attributes say HOW to show it</strong> \u2014 what size, which picture, where the link goes. Without attributes, an <code>&lt;img&gt;</code> has no idea which photo to show.`,
    content: [
      {
        type: "text",
        html: `<strong>Attributes</strong> are extra info you add inside the opening tag. They come as <mark>name="value"</mark> pairs, and the value always sits in quotes. Many attributes can fit in the same tag \u2014 separate them with a space.`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px;">&lt;img src="registan.jpg" width="300" alt="Registan Square"&gt;</code>`,
      },
      {
        type: "analogy",
        label: "\ud83c\udf55 Ordering a pizza",
        html: `A tag is like ordering a pizza \u2014 <code>&lt;img&gt;</code> says \u201cpizza please.\u201d Attributes are the customisations: <strong>large, extra cheese, thin crust</strong>. Same pizza, different options. <code>src</code> says which file, <code>width</code> sets the size, <code>alt</code> gives a backup description.`,
      },
      {
        type: "image",
        src: "/images/m4/html-attributes.webp",
        description: "HTML tag with attributes highlighted in different colors",
      },
      {
        type: "text",
        html: `<strong>The attributes you\u2019ll meet most often:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\uddbc\ufe0f",
            title: "src \u2014 source of an image",
            description: "Goes inside <img>. Tells the browser which file to load. Example: src=\"cat.jpg\" or src=\"https://example.uz/logo.png\".",
            tag: "<img>",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udd17",
            title: "href \u2014 link destination",
            description: "Goes inside <a>. Tells the browser where to go when the link is clicked. Example: href=\"https://yandex.uz\".",
            tag: "<a>",
            tagColor: "blue",
          },
          {
            icon: "\ud83c\udfaf",
            title: "alt \u2014 backup text",
            description: "Goes inside <img>. Shown if the image fails to load. Also read aloud by screen readers for blind users. Always include it.",
            tag: "<img>",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udccf",
            title: "width / height \u2014 size",
            description: "Goes inside <img>. A number in pixels. Example: width=\"200\" makes the image 200 pixels wide. Use one or both.",
            tag: "<img>",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Try it yourself \u2014 small challenges:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Add an image",
            description: "Write <img src=\"photo.jpg\" width=\"200\" alt=\"Me in Samarkand\"> in the body. Save a photo called photo.jpg in the same folder.",
            tag: "src + width + alt",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Add a link",
            description: "Write <a href=\"https://yandex.uz\">Go to Yandex</a>. Click the words in Chrome \u2014 they should take you to Yandex.",
            tag: "<a href>",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Break alt on purpose",
            description: "Change src=\"photo.jpg\" to src=\"nothing.jpg\". Reload \u2014 you\u2019ll see the alt text show up where the photo should be.",
            tag: "Learn by breaking",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this helps:</strong> \u2705 Same tag, many looks \u2014 one <code>&lt;img&gt;</code> can show any photo, at any size \u00b7 \u2705 The <code>alt</code> attribute helps blind users and shows up if the image fails \u00b7 \u2705 You can put many attributes in one tag \u2014 just separate them with a space.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Attributes ALWAYS go in the <strong>opening</strong> tag, never the closing tag \u00b7 \u26a0\ufe0f Forgetting the quotes (<code>width=200</code> instead of <code>width="200"</code>) works sometimes but is risky \u00b7 \u26a0\ufe0f Wrong file name in <code>src</code> = broken image icon on the page.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> If a classmate\u2019s page shows a broken-image icon instead of a photo of Registan Square, what are the three most likely reasons? Check <code>src</code>, the file name, and the folder \u2014 which one would you check first?`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "HTML Comments",
    time: "~3 mins",
    badges: [],
    hook: `What if you could write secret notes inside your code \u2014 notes the browser completely ignores and visitors never see? <strong>That\u2019s exactly what comments do.</strong> They\u2019re for YOU and your teammates, not the page.`,
    content: [
      {
        type: "text",
        html: `A <strong>comment</strong> is a note in your code that the browser <mark>does not show</mark> on the page. It stays in the file for humans to read \u2014 to explain what your code does or to leave yourself a reminder.`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px; white-space:pre;">&lt;!-- This is a comment. The browser ignores it. --&gt;
&lt;h1&gt;My Page&lt;/h1&gt;
&lt;!-- TODO: add a picture of Chorsu Bazaar below --&gt;</code>`,
      },
      {
        type: "analogy",
        label: "\ud83d\udcdd Sticky notes on your textbook",
        html: `Comments are like <strong>sticky notes you put on your textbook</strong>. They help you remember things, but your teacher doesn\u2019t mark them. Another student reading your code will thank you for leaving good notes \u2014 and future YOU, coming back next week, will too.`,
      },
      {
        type: "image",
        src: "/images/m4/html-comments.webp",
        description: "HTML comments shown as ghosted/invisible code compared to visible code",
      },
      {
        type: "text",
        html: `<strong>The syntax is easy to remember:</strong> open with <code>&lt;!--</code> and close with <code>--&gt;</code>. Anything between is ignored by the browser.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcac",
            title: "Explain your code",
            description: "Write <!-- This is the navigation menu --> above the menu. Next week, when you reopen the file, you\u2019ll know what each section does at a glance.",
            tag: "Readability",
          },
          {
            icon: "\ud83d\udeab",
            title: "Hide code temporarily",
            description: "Wrap a broken <img> in <!-- ... --> to \u201cturn it off\u201d without deleting it. Take the comment markers off later to bring the image back.",
            tag: "Debug trick",
          },
          {
            icon: "\u270f\ufe0f",
            title: "Leave yourself a TODO",
            description: "<!-- TODO: replace this fake address with my real one --> reminds you to come back and finish. Great for long homework you build in stages.",
            tag: "Reminders",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this helps:</strong> \u2705 Your own notes stay inside the file forever, safe and close \u00b7 \u2705 Comments don\u2019t slow the page \u2014 the browser just skips them \u00b7 \u2705 You can \u201ccomment out\u201d broken code while you fix another part, instead of deleting it \u00b7 \u2705 Teachers love seeing comments \u2014 they show you understand your code.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Starts with <code>&lt;!--</code> and ends with <code>--&gt;</code> \u2014 all four symbols matter \u00b7 \u26a0\ufe0f Never put passwords or private info in comments \u2014 anyone who views the page source can read them \u00b7 \u26a0\ufe0f Don\u2019t put <code>--</code> inside a comment body \u2014 it can end the comment early.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You\u2019re halfway through a homework page and your table tag is acting weird. Instead of deleting the broken table, how could a comment help you keep the code safe while you try a new version below it?`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "HTML Formatting",
    time: "~4 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Plain text is boring. You want <strong>bold</strong>, <em>italic</em>, and <u>underlined</u> words \u2014 just like the buttons in MS Word. <strong>HTML has a tag for each style,</strong> and yes, you can combine them.`,
    content: [
      {
        type: "text",
        html: `HTML has small tags to change how your text looks \u2014 very similar to the <strong>B</strong>, <em>I</em>, <u>U</u> buttons in MS Word. Wrap the word you want to style with an opening tag and a closing tag.`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px; white-space:pre;">&lt;b&gt;Bold text&lt;/b&gt;
&lt;i&gt;Italic text&lt;/i&gt;
&lt;u&gt;Underlined text&lt;/u&gt;
&lt;mark&gt;Yellow highlight&lt;/mark&gt;
&lt;small&gt;Smaller print&lt;/small&gt;</code>`,
      },
      {
        type: "image",
        src: "/images/m4/html-formatting.webp",
        description: "Text formatting showcase: bold, italic, underline, subscript, superscript",
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83c\udd71\ufe0f",
            title: "<b> \u2014 bold",
            description: "Makes the text thick and heavy. Good for making one word jump out of a sentence, like the name of a shop.",
            tag: "Bold",
          },
          {
            icon: "\ud83c\udd78\ufe0f",
            title: "<i> \u2014 italic",
            description: "Slants the text to the right. Often used for book titles, foreign words like \u201csamsa,\u201d or thoughts in a story.",
            tag: "Italic",
          },
          {
            icon: "\u2583\u2583\u2583",
            title: "<u> \u2014 underline",
            description: "Draws a line under the text. Used sparingly \u2014 on the web, underline usually means a link, so don\u2019t overuse it.",
            tag: "Underline",
          },
          {
            icon: "\ud83d\udd8d\ufe0f",
            title: "<mark> \u2014 highlight",
            description: "Puts a yellow background behind the text, like a school highlighter. Great for key terms you want to pop.",
            tag: "Highlight",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>You can also mix tags together</strong> \u2014 just close them in reverse order:`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px;">&lt;b&gt;&lt;i&gt;Bold and italic at the same time&lt;/i&gt;&lt;/b&gt;</code>`,
      },
      {
        type: "text",
        html: `<strong>Try it yourself \u2014 small challenges:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Bold your city",
            description: "Write <p>I live in <b>Tashkent</b>.</p>. The word Tashkent should look thick and dark when you reload.",
            tag: "<b>",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Italic a dish name",
            description: "Try <p>My favourite food is <i>plov</i>.</p>. The word plov should lean to the right.",
            tag: "<i>",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Highlight a key word",
            description: "Try <p>The exam is on <mark>Friday</mark>.</p>. Friday should have a yellow background like a highlighter.",
            tag: "<mark>",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this helps:</strong> \u2705 One small tag is enough to change how a word looks \u00b7 \u2705 Mixing tags (bold + italic) is allowed \u2014 just close in reverse \u00b7 \u2705 Formatting guides the reader\u2019s eye, like a paper poster \u00b7 \u2705 <code>&lt;strong&gt;</code> and <code>&lt;em&gt;</code> do the same job as <code>&lt;b&gt;</code> and <code>&lt;i&gt;</code> but add a hint of importance for screen readers.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f If EVERYTHING is bold, nothing stands out \u2014 use it sparingly \u00b7 \u26a0\ufe0f Don\u2019t underline random text \u2014 users will try to click it, thinking it\u2019s a link \u00b7 \u26a0\ufe0f Close tags in the reverse order you opened them: open <code>&lt;b&gt;&lt;i&gt;</code>, close <code>&lt;/i&gt;&lt;/b&gt;</code>.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You\u2019re making a small \u201cAbout Me\u201d page. Which words in your paragraph deserve <code>&lt;b&gt;</code> (your name?), which deserve <code>&lt;i&gt;</code> (a book or film name?), and which deserve <code>&lt;mark&gt;</code> (an important date?)?`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "HTML Tables",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }, { text: "Exam favourite", type: "hot" }],
    hook: `Tables show up in almost every HTML exam. <strong>If your info has rows and columns \u2014 a menu, a timetable, a price list \u2014 a table is the right tool.</strong> Four tags, one shape. Master it and you\u2019re done.`,
    content: [
      {
        type: "text",
        html: `A <strong>table</strong> arranges info into <mark>rows and columns</mark>, like a mini spreadsheet on your page. You build it with four tags that always nest in the same order: table \u2192 row \u2192 cell.`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px; white-space:pre;">&lt;table border="1"&gt;
  &lt;tr&gt;
    &lt;th&gt;Dish&lt;/th&gt;
    &lt;th&gt;Price (UZS)&lt;/th&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;td&gt;Plov&lt;/td&gt;
    &lt;td&gt;35000&lt;/td&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;td&gt;Samsa&lt;/td&gt;
    &lt;td&gt;8000&lt;/td&gt;
  &lt;/tr&gt;
&lt;/table&gt;</code>`,
      },
      {
        type: "analogy",
        label: "\ud83c\udfeb A school timetable",
        html: `A table is like the <strong>timetable pinned on your classroom wall</strong>. The outer frame is <code>&lt;table&gt;</code>. Each row of the day is <code>&lt;tr&gt;</code>. Each little box for a class is <code>&lt;td&gt;</code>. The bold day-names at the top (Mon, Tue, Wed) are <code>&lt;th&gt;</code> \u2014 table header cells.`,
      },
      {
        type: "image",
        src: "/images/m4/html-table.webp",
        description: "HTML table with colored header row, grid cells, and merged cell arrows",
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udce6",
            title: "<table>",
            description: "The outer box. Wraps ALL rows and cells. Add border=\"1\" so the grid is actually visible on the page.",
            tag: "The whole table",
          },
          {
            icon: "\u2b95",
            title: "<tr> \u2014 table row",
            description: "One horizontal row. Always goes INSIDE <table>. You can have as many rows as you need.",
            tag: "One row",
          },
          {
            icon: "\ud83c\udfe0",
            title: "<th> \u2014 header cell",
            description: "A cell in the top row that labels a column. Bold and centred by default. Use it for \u201cName,\u201d \u201cPrice,\u201d \u201cDay,\u201d etc.",
            tag: "Bold heading",
          },
          {
            icon: "\ud83d\udcdd",
            title: "<td> \u2014 data cell",
            description: "A regular cell that holds one piece of data \u2014 a number, a word, a small image. Always goes inside a <tr>.",
            tag: "One box",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Try it yourself \u2014 small challenges:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Add a third column",
            description: "In the menu above, add a \u201cSpicy?\u201d column. You\u2019ll need one extra <th> in the header row and one extra <td> in every data row.",
            tag: "Extend it",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Try border=\"0\"",
            description: "Change border=\"1\" to border=\"0\". Reload. The grid lines disappear, but the data is still there \u2014 it just looks messy.",
            tag: "Learn by breaking",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Add a caption",
            description: "Put <caption>Chaikhana Menu</caption> right after the opening <table>. A small title appears above the table.",
            tag: "<caption>",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why tables help:</strong> \u2705 Any info with rows and columns fits naturally \u2014 menus, prices, schedules, results \u00b7 \u2705 Four tags are enough: <code>&lt;table&gt;</code>, <code>&lt;tr&gt;</code>, <code>&lt;th&gt;</code>, <code>&lt;td&gt;</code> \u00b7 \u2705 <code>&lt;th&gt;</code> is automatically bold so headers look like headers without extra work.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f <code>&lt;td&gt;</code> must be INSIDE <code>&lt;tr&gt;</code>, never straight inside <code>&lt;table&gt;</code> \u00b7 \u26a0\ufe0f Forgetting <code>border="1"</code> makes the grid invisible \u2014 data is there but you see no lines \u00b7 \u26a0\ufe0f Every row should have the same number of cells, or the table will look crooked.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You\u2019re making a page for a Chorsu samsa shop. Which info belongs in a table (menu? address? photos?) and which belongs in simple paragraphs? Why does table shape fit some data and not others?`,
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "HTML Lists",
    time: "~4 mins",
    badges: [{ text: "Exam favourite", type: "hot" }],
    hook: `Every time you write a shopping list or a set of steps, you\u2019re making a list. <strong>HTML has two kinds: numbered and bulleted.</strong> Three tags, easy rule \u2014 learn it once and it\u2019s yours.`,
    content: [
      {
        type: "text",
        html: `HTML gives you two kinds of lists. An <strong>ordered list</strong> has numbers (1, 2, 3) \u2014 use it when the order matters, like cooking steps. An <strong>unordered list</strong> has bullet points (\u2022) \u2014 use it when order doesn\u2019t matter, like favourite foods.`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px; white-space:pre;">&lt;!-- Ordered: order matters --&gt;
&lt;ol&gt;
  &lt;li&gt;Wake up&lt;/li&gt;
  &lt;li&gt;Brush teeth&lt;/li&gt;
  &lt;li&gt;Go to college&lt;/li&gt;
&lt;/ol&gt;

&lt;!-- Unordered: order doesn't matter --&gt;
&lt;ul&gt;
  &lt;li&gt;Plov&lt;/li&gt;
  &lt;li&gt;Samsa&lt;/li&gt;
  &lt;li&gt;Lagman&lt;/li&gt;
&lt;/ul&gt;</code>`,
      },
      {
        type: "analogy",
        label: "\ud83e\uddfe Recipe vs shopping list",
        html: `A <strong>recipe</strong> must be followed in order \u2014 you can\u2019t bake the cake before mixing the flour. That\u2019s an <strong>ordered list</strong>. A <strong>shopping list</strong> works in any order \u2014 bread, milk, eggs, or eggs, milk, bread, same result. That\u2019s an <strong>unordered list</strong>.`,
      },
      {
        type: "image",
        src: "/images/m4/html-lists.webp",
        description: "Unordered and ordered lists side by side with nested sub-items",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udd22",
            title: "<ol> \u2014 ordered list",
            description: "Automatically numbers each item: 1, 2, 3, 4. Use it for steps, rankings, any sequence where the order is part of the meaning.",
            tag: "1, 2, 3",
            tagColor: "blue",
          },
          {
            icon: "\u2022",
            title: "<ul> \u2014 unordered list",
            description: "Adds a bullet dot (\u2022) in front of each item. Use it when the items could be in any order \u2014 favourite apps, hobbies, subjects.",
            tag: "Bullets",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udccc",
            title: "<li> \u2014 list item",
            description: "One single entry in the list. The SAME tag works inside both <ol> and <ul>. The wrapper decides numbered vs bullets.",
            tag: "Same for both",
            tagColor: "amber",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Try it yourself \u2014 small challenges:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Morning routine",
            description: "Make an <ol> with 4 things you do every morning. Check that the browser adds 1, 2, 3, 4 automatically.",
            tag: "<ol>",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Favourite apps",
            description: "Make a <ul> with 5 apps you use every day. Notice each item gets a bullet point.",
            tag: "<ul>",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Swap ol \u2194 ul",
            description: "Change your <ol> to <ul> (or the other way round). Watch what happens to the numbers and bullets \u2014 only the outside tag changes.",
            tag: "Compare",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Memory trick:</strong> \u2705 <strong>O</strong>rdered = <strong>O</strong>ne, two, three (numbers) \u00b7 \u2705 <strong>U</strong>nordered = <strong>U</strong>nhappy with any order (just bullets) \u00b7 \u2705 Only <code>&lt;ol&gt;</code> / <code>&lt;ul&gt;</code> changes \u2014 <code>&lt;li&gt;</code> stays the same \u00b7 \u2705 You can even put a list inside another list for sub-points.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Don\u2019t wrap every word in <code>&lt;li&gt;</code> \u2014 one <code>&lt;li&gt;</code> = one whole item \u00b7 \u26a0\ufe0f Forgetting the outer <code>&lt;ol&gt;</code> or <code>&lt;ul&gt;</code> makes the list look broken \u00b7 \u26a0\ufe0f Don\u2019t use <code>&lt;br&gt;</code> between lines to fake a list \u2014 use real list tags so screen readers announce \u201clist of 5 items.\u201d`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You\u2019re writing a page about how to make tea. \u201cBoil water, add leaves, wait 3 minutes, pour\u201d \u2014 ordered or unordered? Now you list four types of tea you like \u2014 ordered or unordered? Why?`,
      },
    ],
  },

  // ─── Topic 9 ───
  {
    id: 9,
    title: "Hyperlinks",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Every time you click \u201cread more,\u201d \u201ccontact us,\u201d or a friend\u2019s Instagram bio link \u2014 you use a hyperlink. <strong>Without links, the whole web would just be dead-end pages.</strong> One tiny tag makes them work.`,
    content: [
      {
        type: "text",
        html: `A <strong>hyperlink</strong> is a piece of text (or an image) you can click to jump to another page. The tag is <code>&lt;a&gt;</code> \u2014 short for <strong>anchor</strong>. The <code>href</code> attribute is where the link goes.`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px; white-space:pre;">&lt;a href="https://www.yandex.uz"&gt;Go to Yandex&lt;/a&gt;

&lt;!-- Open in a NEW tab --&gt;
&lt;a href="https://www.amity.edu" target="_blank"&gt;Visit Amity&lt;/a&gt;</code>`,
      },
      {
        type: "analogy",
        label: "\ud83d\udeaa A magic door",
        html: `A link is like a <strong>magic door</strong> painted on the wall of your page. The words inside the <code>&lt;a&gt;</code> tag are the door\u2019s label (what the user sees and clicks). The <code>href</code> attribute is the address the door leads to. Click the door \u2014 you\u2019re somewhere new.`,
      },
      {
        type: "image",
        src: "/images/m4/html-links.webp",
        description: "Two web pages connected by a glowing link with click cursor",
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udd17",
            title: "href \u2014 the destination",
            description: "The URL the link goes to. Must be in quotes. Can be a full web address (https://uzum.uz) or a page on your own site (about.html).",
            tag: "Always needed",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\uddc2\ufe0f",
            title: "target=\"_blank\" \u2014 new tab",
            description: "Makes the link open in a NEW tab. Good for outside sites \u2014 users don\u2019t lose your page. Skip it if you want the same tab.",
            tag: "Optional",
            tagColor: "amber",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Try it yourself \u2014 small challenges:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Link to Yandex",
            description: "Add <a href=\"https://yandex.uz\">Search Yandex</a> to your body. Click it \u2014 the same tab should jump to yandex.uz.",
            tag: "Basic link",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Open in new tab",
            description: "Add target=\"_blank\" to the same link. Click again \u2014 a new tab opens, and your page stays open too.",
            tag: "target=\"_blank\"",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Link to your own page",
            description: "Save a second file, about.html. On your main page, add <a href=\"about.html\">About me</a>. The click should open your own page.",
            tag: "Local link",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why links matter:</strong> \u2705 Links are what turned the web from a pile of pages into a giant connected net \u00b7 \u2705 One tag (<code>&lt;a&gt;</code>) + one attribute (<code>href</code>) = a working link \u00b7 \u2705 <code>target="_blank"</code> keeps your page open for external links \u00b7 \u2705 Descriptive link text (\u201cRead our menu\u201d) beats \u201cclick here\u201d every time.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Typing the wrong URL in <code>href</code> = broken link \u00b7 \u26a0\ufe0f Forgetting <code>https://</code> on an outside link can make the browser think it\u2019s a local file \u00b7 \u26a0\ufe0f \u201cClick here\u201d is a bad link text \u2014 use words that tell the user where the link goes.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Imagine a website with 50 pages but zero links between them. How would a visitor move around? Why do we call hyperlinks \u201cthe backbone of the web\u201d?`,
      },
    ],
  },

  // ─── Topic 10 ───
  {
    id: 10,
    title: "Images & Image Links",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `A page with only words is dry. Drop in a photo of Registan Square and suddenly it feels alive. <strong>And when you wrap an image inside a link, the image itself becomes clickable.</strong> Huge pattern \u2014 learn it once, use it everywhere.`,
    content: [
      {
        type: "text",
        html: `Use the <code>&lt;img&gt;</code> tag to put a picture on your page. It\u2019s <mark>self-closing</mark> \u2014 no <code>&lt;/img&gt;</code> needed. All the info goes in attributes: <code>src</code> (which file), <code>alt</code> (backup text), and <code>width</code> (size).`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px; white-space:pre;">&lt;!-- Just an image --&gt;
&lt;img src="registan.jpg" alt="Registan Square" width="300"&gt;

&lt;!-- A CLICKABLE image --&gt;
&lt;a href="https://uzum.uz"&gt;
  &lt;img src="logo.png" alt="Uzum logo" width="150"&gt;
&lt;/a&gt;</code>`,
      },
      {
        type: "analogy",
        label: "\ud83d\uddbc\ufe0f A picture frame with a note behind it",
        html: `<code>&lt;img&gt;</code> is a <strong>picture frame on your page</strong>. <code>src</code> is the photo you slide into the frame. <code>alt</code> is a small note taped to the back \u2014 in case someone can\u2019t see the photo, they can read the note instead. <code>width</code> is the size of the frame.`,
      },
      {
        type: "image",
        src: "/images/m4/html-images.webp",
        description: "The img tag concept: picture frame with src arrow and alt tooltip",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcc2",
            title: "src \u2014 which file",
            description: "The photo\u2019s file name or web address. Example: src=\"photo.jpg\" (same folder) or src=\"https://example.uz/pic.jpg\" (from the internet).",
            tag: "Required",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udc41\ufe0f",
            title: "alt \u2014 backup text",
            description: "What should show if the image fails, and what a blind user hears. Always write a short description \u2014 don\u2019t skip it.",
            tag: "Always add",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udccf",
            title: "width \u2014 size",
            description: "A number in pixels. width=\"300\" makes the image 300 pixels wide. Height can be added too, or the browser keeps the shape automatically.",
            tag: "Optional but useful",
            tagColor: "amber",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>To make an image clickable, wrap it inside an <code>&lt;a&gt;</code> tag.</strong> This is how logos in website headers always take you to the home page.`,
      },
      {
        type: "text",
        html: `<strong>Try it yourself \u2014 small challenges:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Show a photo",
            description: "Save a photo called me.jpg in the same folder as your page. Add <img src=\"me.jpg\" alt=\"Me\" width=\"200\">. Reload \u2014 your face appears.",
            tag: "Basic <img>",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Break the src",
            description: "Change src=\"me.jpg\" to src=\"xxx.jpg\". Reload. A broken-icon appears \u2014 and the alt text shows up next to it. That\u2019s why alt matters!",
            tag: "Why alt matters",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Clickable logo",
            description: "Wrap the <img> inside <a href=\"https://amity.edu\">...</a>. Now the photo itself is a link to Amity\u2019s site.",
            tag: "Image link",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this helps:</strong> \u2705 One tag shows any photo at any size \u00b7 \u2705 <code>alt</code> keeps your page accessible and shows up when the image fails \u00b7 \u2705 Putting <code>&lt;img&gt;</code> inside <code>&lt;a&gt;</code> = clickable image \u2014 every logo on the web works this way \u00b7 \u2705 Set a <code>width</code> so the page doesn\u2019t jump while images load.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f <code>&lt;img&gt;</code> has NO closing tag \u2014 don\u2019t write <code>&lt;/img&gt;</code> \u00b7 \u26a0\ufe0f Forgetting <code>alt</code> is a common beginner mistake and fails accessibility \u00b7 \u26a0\ufe0f Wrong file name in <code>src</code> = broken image \u00b7 \u26a0\ufe0f Huge photos (10 MB) make pages very slow \u2014 resize them first.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You want the Amity logo at the top of your page to open the Amity website when clicked. Which tag goes on the OUTSIDE, and which goes on the INSIDE? (Hint: the door or the picture in the frame \u2014 which wraps which?)`,
      },
    ],
  },

  // ─── Topic 11 ───
  {
    id: 11,
    title: "Build a Full HTML Page",
    time: "~8 mins",
    badges: [{ text: "Exam favourite", type: "hot" }],
    hook: `Time to put it all together. <strong>Your goal: a complete personal web page with headings, formatted text, a table, a list, an image, and a link.</strong> This is exactly the kind of task you\u2019ll see in the exam \u2014 and exactly what you need to build a real page about yourself.`,
    content: [
      {
        type: "text",
        html: `In this topic, you\u2019ll combine everything from Module 4 into ONE complete page \u2014 your own mini personal website. A good page uses the <mark>right tag for the right job</mark>: headings for titles, paragraphs for text, a table for data, a list for items, an image for a photo, a link for a destination.`,
      },
      {
        type: "analogy",
        label: "\ud83c\udfd7\ufe0f Building a house",
        html: `Think of your page as a <strong>small house</strong>. <code>&lt;!DOCTYPE html&gt;</code> is the \u201cthis IS a house\u201d sign. <code>&lt;html&gt;</code> is the outer walls. <code>&lt;head&gt;</code> is the roof and wiring (important, but not what you see). <code>&lt;body&gt;</code> is the rooms \u2014 everything a guest actually walks into.`,
      },
      {
        type: "image",
        src: "/images/m4/html-full-page.webp",
        description: "Complete HTML page structure as a layered building blueprint",
      },
      {
        type: "text",
        html: `<strong>Here\u2019s a full, working example.</strong> Copy it into Notepad, save as <code>me.html</code>, open in Chrome. Then swap in your own details:`,
      },
      {
        type: "text",
        html: `<code style="display:block; padding:12px; background:rgba(255,255,255,0.04); border-radius:8px; white-space:pre; font-size:0.85em;">&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;About Aziz&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;!-- Main heading --&gt;
    &lt;h1&gt;Hi, I am Aziz&lt;/h1&gt;

    &lt;!-- A short intro --&gt;
    &lt;p&gt;I live in &lt;b&gt;Tashkent&lt;/b&gt; and I study at &lt;i&gt;Amity University&lt;/i&gt;.&lt;/p&gt;

    &lt;!-- A photo --&gt;
    &lt;img src="me.jpg" alt="Aziz in Samarkand" width="250"&gt;

    &lt;!-- My subjects table --&gt;
    &lt;h2&gt;My Subjects&lt;/h2&gt;
    &lt;table border="1"&gt;
      &lt;tr&gt;
        &lt;th&gt;Subject&lt;/th&gt;&lt;th&gt;Grade&lt;/th&gt;
      &lt;/tr&gt;
      &lt;tr&gt;
        &lt;td&gt;ICT&lt;/td&gt;&lt;td&gt;A&lt;/td&gt;
      &lt;/tr&gt;
      &lt;tr&gt;
        &lt;td&gt;Maths&lt;/td&gt;&lt;td&gt;B+&lt;/td&gt;
      &lt;/tr&gt;
    &lt;/table&gt;

    &lt;!-- My hobbies --&gt;
    &lt;h2&gt;Hobbies&lt;/h2&gt;
    &lt;ul&gt;
      &lt;li&gt;Football&lt;/li&gt;
      &lt;li&gt;Coding&lt;/li&gt;
      &lt;li&gt;Cooking plov&lt;/li&gt;
    &lt;/ul&gt;

    &lt;!-- A link to my school --&gt;
    &lt;a href="https://www.amity.edu" target="_blank"&gt;Visit Amity&lt;/a&gt;
  &lt;/body&gt;
&lt;/html&gt;</code>`,
      },
      {
        type: "text",
        html: `<strong>Your page must include (exam checklist):</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83c\udfd7\ufe0f",
            title: "Proper skeleton",
            description: "<!DOCTYPE html>, then <html>, <head> with <title>, and <body>. Every page starts this way \u2014 no exceptions.",
            tag: "Foundation",
          },
          {
            icon: "\ud83d\udd24",
            title: "Heading + paragraph",
            description: "One <h1> for your name, plus a <p> that uses <b> or <i> on a word or two. Short intro sentence works well.",
            tag: "Words",
          },
          {
            icon: "\ud83d\udcca",
            title: "Table + list",
            description: "A <table> with at least 2 data rows (subjects, prices, etc.) AND a <ul> or <ol> with 3+ items (hobbies, steps).",
            tag: "Structured data",
          },
          {
            icon: "\ud83d\udd17",
            title: "Link + comment",
            description: "One <a href> somewhere (your school, favourite site). At least ONE <!-- comment --> above a section to label it.",
            tag: "Polish",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Try it yourself \u2014 build your real page:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Copy the template",
            description: "Open Notepad, paste the example, save as me.html. Double-click the file \u2014 it opens in Chrome. Make sure everything works before changing anything.",
            tag: "Start safe",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Swap in your details",
            description: "Change the name, city, subjects, grades, hobbies. Add your own photo file into the same folder and update the src.",
            tag: "Make it yours",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Add one extra thing",
            description: "Try adding a second <h2> section (Favourite films? Family?) with a new list or table. Put a comment above it so the code stays clean.",
            tag: "Go beyond",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why this matters:</strong> \u2705 You now have all the pieces to build a real personal page \u00b7 \u2705 In the exam, a question like this is worth big marks \u2014 follow the checklist \u00b7 \u2705 Use comments to label each section \u2014 it shows you understand the structure and earns extra clarity marks \u00b7 \u2705 Once this works, you can keep adding to it for the rest of your life.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Common mistakes:</strong> \u26a0\ufe0f Forgetting <code>&lt;!DOCTYPE html&gt;</code> at the very top \u00b7 \u26a0\ufe0f Missing closing tags (every <code>&lt;h1&gt;</code> needs <code>&lt;/h1&gt;</code>) \u00b7 \u26a0\ufe0f Putting <code>&lt;td&gt;</code> directly inside <code>&lt;table&gt;</code> without a <code>&lt;tr&gt;</code> wrapper \u00b7 \u26a0\ufe0f Leaving the <code>border</code> off a table so the grid is invisible \u00b7 \u26a0\ufe0f Skipping <code>alt</code> on images \u2014 small attribute, big mark loss.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Look at your favourite website (Yandex, Uzum, TikTok). Can you spot a heading? A list? An image link? A table somewhere? If you had 10 minutes of HTML, which parts of their page could you already rebuild using tags from this module?`,
      },
    ],
  },
];
