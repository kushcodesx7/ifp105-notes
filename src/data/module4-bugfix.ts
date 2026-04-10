export interface BugFixChallenge {
  topicId: number;
  title: string;
  brokenCode: string;
  hint: string;
  correctCode: string;
  explanation: string;
}

export const module4BugFixes: Record<number, BugFixChallenge | null> = {
  1: null, // WWW topic — not a code challenge

  2: {
    topicId: 2,
    title: "Missing closing slash",
    brokenCode: `<h1>Hello World<h1>`,
    hint: "Look carefully at the closing tag — is something missing?",
    correctCode: `<h1>Hello World</h1>`,
    explanation:
      "The closing tag was missing the forward slash (/). Closing tags must be written as </tagname> to tell the browser where the element ends.",
  },

  3: {
    topicId: 3,
    title: "Unclosed element",
    brokenCode: `<p>This is a paragraph`,
    hint: "Every opening tag needs a partner. What's missing at the end?",
    correctCode: `<p>This is a paragraph</p>`,
    explanation:
      "The <p> element was never closed. Most HTML elements need both an opening tag and a closing tag — <p>...</p>.",
  },

  4: {
    topicId: 4,
    title: "Missing attribute quotes",
    brokenCode: `<img src=dog.jpg alt="A dog">`,
    hint: "Attribute values should always be wrapped in something...",
    correctCode: `<img src="dog.jpg" alt="A dog">`,
    explanation:
      'The src attribute value was missing quotes. While some browsers tolerate unquoted values, best practice is to always wrap attribute values in double quotes: src="dog.jpg".',
  },

  5: {
    topicId: 5,
    title: "Broken comment syntax",
    brokenCode: `<!- This is a comment -->`,
    hint: "Count the dashes in the opening part of the comment...",
    correctCode: `<!-- This is a comment -->`,
    explanation:
      "HTML comments must start with <!-- (two dashes). The code only had one dash: <!- which the browser won't recognise as a comment.",
  },

  6: {
    topicId: 6,
    title: "Wrong closing order",
    brokenCode: `<b><i>Bold and Italic</b></i>`,
    hint: "Tags should close in the reverse order they opened — like nesting boxes.",
    correctCode: `<b><i>Bold and Italic</i></b>`,
    explanation:
      "HTML tags must be properly nested. Since <i> was opened inside <b>, it must close before <b> does. Think of it like stacking boxes — the last one opened is the first one closed.",
  },

  7: {
    topicId: 7,
    title: "Missing table row",
    brokenCode: `<table><td>Data</td></table>`,
    hint: "Table cells <td> can't live directly inside <table>. They need a parent...",
    correctCode: `<table><tr><td>Data</td></tr></table>`,
    explanation:
      "Table data cells (<td>) must be inside a table row (<tr>). The correct structure is <table> → <tr> → <td>. Without <tr>, the table structure is invalid.",
  },

  8: {
    topicId: 8,
    title: "Unclosed list item",
    brokenCode: `<ol><li>Item 1<li>Item 2</ol>`,
    hint: "Each list item needs to be properly closed before the next one starts.",
    correctCode: `<ol><li>Item 1</li><li>Item 2</li></ol>`,
    explanation:
      "Each <li> element needs a closing </li> tag. While some browsers auto-close them, proper HTML requires explicit closing tags for clean, valid code.",
  },

  9: {
    topicId: 9,
    title: "Link missing href",
    brokenCode: `<a>Click here</a>`,
    hint: "A link needs to know WHERE to go. What attribute tells it the destination?",
    correctCode: `<a href="https://google.com">Click here</a>`,
    explanation:
      'The <a> tag was missing the href attribute, which specifies where the link goes. Without href, it\'s just text — not a clickable link. The fix adds href="https://google.com".',
  },

  10: {
    topicId: 10,
    title: "Image missing alt",
    brokenCode: `<img src="photo.jpg">`,
    hint: "Images need a text description for accessibility. What attribute provides that?",
    correctCode: `<img src="photo.jpg" alt="A photo">`,
    explanation:
      "The <img> tag was missing the alt attribute. The alt attribute provides alternative text for screen readers and when the image can't load. It's required for accessibility.",
  },

  11: {
    topicId: 11,
    title: "Missing DOCTYPE",
    brokenCode: `<html><body><h1>Hello</h1></body></html>`,
    hint: "Every HTML page should start with a special declaration that tells the browser what version of HTML you're using...",
    correctCode: `<!DOCTYPE html><html><body><h1>Hello</h1></body></html>`,
    explanation:
      "The page was missing <!DOCTYPE html> at the very top. This declaration tells the browser to use modern HTML5 standards. Without it, the browser may render the page in 'quirks mode'.",
  },
};
