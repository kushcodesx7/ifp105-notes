export interface Challenge {
  instruction: string;
  hint: string;
  starterCode: string;
}

export const module4Challenges: Record<number, Challenge> = {
  1: {
    instruction: `This is a reading topic — no coding needed! But if you're curious, try typing a <strong>complete URL</strong> in your browser's address bar (like <code>https://www.google.com</code>) and notice the <code>https://</code> part. That's the protocol we learned about!`,
    hint: "URLs always start with http:// or https:// — the 's' means it's secure!",
    starterCode: `<!-- Topic 1: World Wide Web -->
<!-- No code to write here! -->
<!-- This topic is about understanding -->
<!-- how the web works. -->

<h1>I understand the WWW!</h1>
<p>The Internet is the road.</p>
<p>The WWW is the buildings on that road.</p>`,
  },

  2: {
    instruction: `Create a <strong>complete HTML page</strong> with the proper skeleton structure. Include:<br>
1. <code>&lt;!DOCTYPE html&gt;</code> at the very top<br>
2. <code>&lt;html&gt;</code> wrapping everything<br>
3. <code>&lt;head&gt;</code> with a <code>&lt;title&gt;</code><br>
4. <code>&lt;body&gt;</code> with an <code>&lt;h1&gt;</code> heading and a <code>&lt;p&gt;</code> paragraph`,
    hint: "Remember the skeleton: DOCTYPE → html → head (with title) → body (with visible content). The title shows in the browser tab, not on the page!",
    starterCode: `<!-- Your Turn: Build the HTML skeleton! -->
<!-- Type your code below -->

`,
  },

  3: {
    instruction: `Practice the difference between tags and elements. Write:<br>
1. A paragraph element with some text<br>
2. A horizontal line using a <strong>self-closing tag</strong> (<code>&lt;hr&gt;</code>)<br>
3. Another paragraph after the line<br>
4. A line break (<code>&lt;br&gt;</code>) inside the second paragraph`,
    hint: "Remember: <p>text</p> is an element (opening + content + closing). <hr> and <br> are self-closing — they have no content or closing tag!",
    starterCode: `<!-- Your Turn: Practice elements! -->


`,
  },

  4: {
    instruction: `Create an image using attributes. Write an <code>&lt;img&gt;</code> tag with these attributes:<br>
1. <code>src</code> = any image URL (try: <code>https://via.placeholder.com/300x200</code>)<br>
2. <code>alt</code> = a description of the image<br>
3. <code>width</code> = 300`,
    hint: "All attributes go inside the opening tag: <img src=\"url\" alt=\"text\" width=\"300\">. Remember, img is self-closing — no </img> needed!",
    starterCode: `<!-- Your Turn: Use attributes! -->
<h2>My Image</h2>

<!-- Add your img tag below -->

`,
  },

  5: {
    instruction: `Practice using HTML comments:<br>
1. Write a comment explaining what the page is about<br>
2. Write a heading<br>
3. Write a comment next to the heading explaining what it does<br>
4. Write a paragraph, then comment it out (hide it) so it doesn't show on screen`,
    hint: "Comments start with <!-- and end with -->. To hide code, wrap it in a comment: <!-- <p>hidden</p> -->",
    starterCode: `<!-- Your Turn: Practice comments! -->

<h1>My Page</h1>

<p>This paragraph is visible.</p>

`,
  },

  6: {
    instruction: `Format this text using HTML tags:<br>
1. Make "Important" <strong>bold</strong> using <code>&lt;b&gt;</code><br>
2. Make "emphasis" <em>italic</em> using <code>&lt;i&gt;</code><br>
3. Make "notice" <u>underlined</u> using <code>&lt;u&gt;</code><br>
4. Try combining: make some text <strong><em>bold AND italic</em></strong>`,
    hint: "To combine, nest the tags: <b><i>Bold and Italic</i></b>. Close in reverse order — last opened = first closed!",
    starterCode: `<!-- Your Turn: Format text! -->
<h2>Formatting Practice</h2>

<p>This word is Important.</p>
<p>This word needs emphasis.</p>
<p>Please notice this text.</p>
<p>This text should be bold AND italic.</p>
`,
  },

  7: {
    instruction: `Create a table with:<br>
1. A <code>border="1"</code> attribute on the table<br>
2. A header row with <code>&lt;th&gt;</code> cells: "Subject" and "Grade"<br>
3. At least 2 data rows with <code>&lt;td&gt;</code> cells<br>
4. Try adding a <code>&lt;caption&gt;</code> tag right after <code>&lt;table&gt;</code>`,
    hint: "Structure: <table border=\"1\"> → <caption> → <tr> with <th> → <tr> with <td>. Each row needs its own <tr> wrapper!",
    starterCode: `<!-- Your Turn: Build a table! -->


`,
  },

  8: {
    instruction: `Create TWO lists:<br>
1. An <strong>ordered list</strong> (<code>&lt;ol&gt;</code>) with 3 steps to make tea<br>
2. An <strong>unordered list</strong> (<code>&lt;ul&gt;</code>) with 3 of your favourite foods<br>
3. Bonus: try <code>type="A"</code> on the ordered list!`,
    hint: "Ordered: <ol><li>Step 1</li></ol>. Unordered: <ul><li>Item</li></ul>. The <li> tag is the same for both — the wrapper decides numbers vs bullets!",
    starterCode: `<!-- Your Turn: Build lists! -->
<h2>How to Make Tea</h2>

<!-- Ordered list here -->

<h2>My Favourite Foods</h2>

<!-- Unordered list here -->
`,
  },

  9: {
    instruction: `Create 3 different types of links:<br>
1. A link to Google that says "Visit Google"<br>
2. A link to YouTube that opens in a <strong>new tab</strong> (use <code>target="_blank"</code>)<br>
3. An email link using <code>mailto:</code>`,
    hint: "Basic: <a href=\"url\">text</a>. New tab: add target=\"_blank\". Email: <a href=\"mailto:you@email.com\">Email Me</a>",
    starterCode: `<!-- Your Turn: Create links! -->
<h2>My Links</h2>

<!-- Link to Google -->

<!-- Link to YouTube (new tab) -->

<!-- Email link -->
`,
  },

  10: {
    instruction: `Create:<br>
1. An image with <code>src</code>, <code>alt</code>, and <code>width</code> attributes<br>
2. A <strong>clickable image</strong> — wrap the image inside an <code>&lt;a&gt;</code> tag so clicking it goes to a website`,
    hint: "Clickable image pattern: <a href=\"url\"><img src=\"image\" alt=\"text\" width=\"200\"></a>. The link wraps AROUND the image — link is the door frame, image is the door!",
    starterCode: `<!-- Your Turn: Images & image links! -->
<h2>My Images</h2>

<!-- Regular image -->

<h2>Click This Image</h2>

<!-- Clickable image link -->
`,
  },

  11: {
    instruction: `Build a <strong>complete portfolio page</strong> using everything you've learned! Include ALL of these:<br>
1. Proper HTML structure (DOCTYPE, html, head, title, body)<br>
2. A heading with your name<br>
3. A paragraph with <strong>formatted text</strong> (bold, italic)<br>
4. A <strong>table</strong> showing your subjects and grades<br>
5. A <strong>list</strong> of your hobbies<br>
6. A <strong>link</strong> to any website<br>
7. At least one <strong>comment</strong>`,
    hint: "Use the skeleton from Topic 2. Add each requirement one at a time. Use comments to label each section — it helps you stay organised AND earns exam marks!",
    starterCode: `<!-- FINAL CHALLENGE: Build Your Portfolio! -->
<!-- Include: structure, heading, formatted text, -->
<!-- table, list, link, and comments -->

`,
  },
};
