"use client";
import ModulePage from "@/components/module/ModulePage";
import HtmlEditor from "@/components/module/HtmlEditor";
import YourTurnChallenge from "@/components/module/YourTurnChallenge";
import { topics } from "@/data/module4-topics";
import { mcqData } from "@/data/module4-mcq";
import { module4Challenges } from "@/data/module4-challenges";
import TagMatchGame from "@/components/module/TagMatchGame";

const editorDefaults: Record<number, string> = {
  1: '<!-- Topic 1: Try creating a basic HTML page -->\n<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Welcome to the Web!</h1>\n  <p>This is my first web page.</p>\n</body>\n</html>',
  2: '<!-- Topic 2: Practice with basic tags -->\n<!DOCTYPE html>\n<html>\n<body>\n  <h1>Main Heading</h1>\n  <h2>Sub Heading</h2>\n  <p>This is a paragraph.</p>\n  <br>\n  <hr>\n  <p>Another paragraph after a line break and horizontal rule.</p>\n</body>\n</html>',
  3: '<!-- Topic 3: HTML Elements -->\n<!DOCTYPE html>\n<html>\n<body>\n  <div style="background:#f0f0f0; padding:10px;">\n    <h2>This is inside a div</h2>\n    <p>Divs are <strong>block-level</strong> containers.</p>\n  </div>\n  <p>This has <span style="color:blue;">inline span</span> inside it.</p>\n</body>\n</html>',
  4: '<!-- Topic 4: HTML Attributes -->\n<!DOCTYPE html>\n<html>\n<body>\n  <h1 id="main-title" style="color:navy;">Attributes Practice</h1>\n  <p class="intro" title="Hover over me!">This paragraph has class, title attributes.</p>\n  <img src="https://via.placeholder.com/200x100" alt="Placeholder image" width="200">\n</body>\n</html>',
  5: '<!-- Topic 5: HTML Comments -->\n<!DOCTYPE html>\n<html>\n<body>\n  <!-- This is a comment - it won\'t show on the page -->\n  <h1>Comments Practice</h1>\n  <p>Look at the code to see hidden comments!</p>\n  <!-- TODO: Add more content here -->\n  <!-- <p>This paragraph is commented out</p> -->\n</body>\n</html>',
  6: '<!-- Topic 6: Text Formatting -->\n<!DOCTYPE html>\n<html>\n<body>\n  <p><strong>Bold text</strong> and <em>italic text</em></p>\n  <p><u>Underlined</u> and <del>strikethrough</del></p>\n  <p>H<sub>2</sub>O is water, E=mc<sup>2</sup></p>\n  <p><mark>Highlighted text</mark> and <small>small text</small></p>\n  <pre>  This   preserves   spacing</pre>\n</body>\n</html>',
  7: '<!-- Topic 7: HTML Tables -->\n<!DOCTYPE html>\n<html>\n<body>\n  <table border="1" cellpadding="8" cellspacing="0">\n    <caption>Student Grades</caption>\n    <tr>\n      <th>Name</th>\n      <th>Subject</th>\n      <th>Grade</th>\n    </tr>\n    <tr>\n      <td>Alice</td>\n      <td>ICT</td>\n      <td>A</td>\n    </tr>\n    <tr>\n      <td>Bob</td>\n      <td>ICT</td>\n      <td>B+</td>\n    </tr>\n  </table>\n</body>\n</html>',
  8: '<!-- Topic 8: HTML Lists -->\n<!DOCTYPE html>\n<html>\n<body>\n  <h2>Unordered List</h2>\n  <ul>\n    <li>HTML</li>\n    <li>CSS</li>\n    <li>JavaScript</li>\n  </ul>\n  <h2>Ordered List</h2>\n  <ol type="I">\n    <li>Learn basics</li>\n    <li>Practice daily</li>\n    <li>Build projects</li>\n  </ol>\n</body>\n</html>',
  9: '<!-- Topic 9: Hyperlinks -->\n<!DOCTYPE html>\n<html>\n<body>\n  <h2>Link Practice</h2>\n  <p><a href="https://www.google.com" target="_blank">Visit Google</a></p>\n  <p><a href="mailto:student@amity.edu">Email Us</a></p>\n  <p><a href="#section2">Jump to Section 2</a></p>\n  <br><br><br><br><br>\n  <h2 id="section2">Section 2</h2>\n  <p>You jumped here!</p>\n</body>\n</html>',
  10: '<!-- Topic 10: Images -->\n<!DOCTYPE html>\n<html>\n<body>\n  <h2>Image Practice</h2>\n  <img src="https://via.placeholder.com/300x200/4F46E5/ffffff?text=IFP105" alt="Course image" width="300">\n  <br><br>\n  <a href="https://www.google.com">\n    <img src="https://via.placeholder.com/150x50/10B981/ffffff?text=Click+Me" alt="Clickable image">\n  </a>\n  <figure>\n    <img src="https://via.placeholder.com/250x150/8B5CF6/ffffff?text=Figure" alt="Figure">\n    <figcaption>This is a figure caption</figcaption>\n  </figure>\n</body>\n</html>',
  11: '<!-- Topic 11: Build a Complete Page! -->\n<!DOCTYPE html>\n<html>\n<head>\n  <title>My Portfolio</title>\n</head>\n<body>\n  <h1>My Name</h1>\n  <p><em>IFS Student at Amity Tashkent</em></p>\n  <hr>\n  <h2>About Me</h2>\n  <p>Write about yourself here...</p>\n  <h2>My Skills</h2>\n  <ul>\n    <li>HTML</li>\n    <li>Problem Solving</li>\n  </ul>\n  <h2>Contact</h2>\n  <p>Email: <a href="mailto:you@email.com">you@email.com</a></p>\n</body>\n</html>',
};

export default function Module4() {
  return (
    <ModulePage
      moduleNumber={4}
      moduleTitle="HTML & Web"
      moduleSubtitle="Development"
      moduleDescription="Build web pages from scratch. Tags, elements, attributes, tables, lists, links, images — with a live code editor."
      accentFrom="#06B6D4"
      accentTo="#0891B2"
      orbColor1="rgba(6,182,212,0.15)"
      orbColor2="rgba(8,145,178,0.1)"
      topics={topics}
      mcqData={mcqData}
      stats={[
        { n: "11", l: "Topics" },
        { n: "~55", l: "Minutes" },
        { n: "110", l: "Practice Qs" },
      ]}
      renderAfterContent={(topicId) => (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧪</span>
            <h3 className="text-sm font-bold text-zinc-300">Try It Yourself</h3>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(6,182,212,0.12)', color: '#22d3ee' }}>
              Live Editor
            </span>
          </div>
          <HtmlEditor
            initialCode={editorDefaults[topicId] || editorDefaults[1]}
          />

          {/* Guided challenge */}
          {module4Challenges[topicId] && (
            <YourTurnChallenge
              challenge={module4Challenges[topicId]}
              accentFrom="#06B6D4"
              accentTo="#0891B2"
            />
          )}

          {/* Tag Match Game after the final topic */}
          {topicId === 11 && <TagMatchGame />}
        </div>
      )}
    />
  );
}
