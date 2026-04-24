import type { Topic } from "./module1-topics";

// Module 3 — Social Media topics.
//
// Trimmed Apr 23 2026 for SELF-STUDY. Every topic 1–5 now ships:
//   · hook (1 line)
//   · 1 short text block introducing the concept
//   · 1 image
//   · 1 analogy
//   · 1 cards grid (3 items, not 6)
//   · 1 blue callout — "quick match" takeaway
//   · 1 purple callout — Think Deeper prompt
//
// That's ~6 blocks, 2–3 min read. Removes the duplicate text blocks,
// second cards grids, and amber "watch out" callouts that made every
// topic feel homework-heavy. Topic 6 (LinkedIn) keeps its original
// long-form structure — it was commissioned for self-study with the
// full 5-section + 4 Think Deeper + illustration treatment.
export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "Introduction to Social Media",
    time: "~3 mins",
    badges: [{ text: "Foundation", type: "star" }],
    hook: `You open your phone and scroll Instagram, TikTok, or Telegram for hours every week. <strong>That is social media \u2014 apps where normal people post, watch, chat, and share, all at the same time.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>Social media</strong> is any app or website where <mark>users make their own posts and can reply to each other</mark>. TV only talks at you \u2014 you watch, you cannot answer. Social media lets anyone with a phone post a photo, leave a comment, or send a message. That is the big change.`,
      },
      {
        type: "image",
        src: "/images/m3/social-media.webp",
        description: "A person in the middle with arrows going to Instagram, TikTok, Telegram, YouTube, Facebook, and X \u2014 two-way arrows showing comments and messages going back",
      },
      {
        type: "analogy",
        label: "\ud83d\udcfa Old TV vs a group chat",
        html: `Old TV is like a teacher who just talks \u2014 nobody can reply. <strong>Social media is like a big group chat</strong>: everyone can post, reply, share photos, and react with emojis. Sometimes the whole school joins, sometimes only your best friends.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcf8",
            title: "Posting a Story",
            description: "You snap a photo of your lunch at a Tashkent cafe and add it to your Instagram Story. Friends tap the emoji reply \u2014 that's two-way.",
            tag: "Instagram",
          },
          {
            icon: "\ud83c\udfb5",
            title: "Scrolling TikTok",
            description: "You watch 20 short videos. You like one, share one, follow the creator. Every tap teaches TikTok what to show you next.",
            tag: "TikTok For You",
          },
          {
            icon: "\ud83d\udcac",
            title: "Replying in Telegram",
            description: "Your class group has 40 students. You ask about homework, three friends reply, someone drops a voice note. That's social media too.",
            tag: "Telegram group",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Quick match:</strong> \u2705 Users post \u2014 not just watch \u00b7 \u2705 Others can reply, comment, share \u00b7 \u2705 Almost free for small shops \u00b7 \u2705 Customers give fast feedback in the comments.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Pick the last three apps you opened on your phone today. Which of them let you POST something (not just watch)? Which let other people REPLY to you? Those are the social media apps.`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "Types of Social Media Platforms",
    time: "~3 mins",
    badges: [],
    hook: `Instagram, TikTok, YouTube, Telegram, LinkedIn \u2014 they all have posts and followers, but they feel totally different. <strong>Each app is built for a different kind of content.</strong>`,
    content: [
      {
        type: "text",
        html: `Not every app is the same. Some are for <mark>photos</mark>, some for <mark>short video</mark>, some for <mark>long video</mark>, some for <mark>group chat</mark>, some for <mark>jobs</mark>. Pick the app that matches your content \u2014 a 15-minute study tutorial does not fit TikTok; a funny 20-second dance does not fit LinkedIn.`,
      },
      {
        type: "image",
        src: "/images/m3/platforms.webp",
        description: "Grid showing logos of Instagram, TikTok, YouTube, Telegram, Facebook, LinkedIn \u2014 each with a one-word label for what it is best at",
      },
      {
        type: "analogy",
        label: "\ud83c\udfeb Different classrooms for different subjects",
        html: `At school you have a maths room, an art room, a gym, and a music room. Each room is set up for one job \u2014 you do not learn football in the music room. <strong>Social media apps are the same.</strong> Instagram is the art room (photos). TikTok is the dance studio (short video). LinkedIn is the career office (jobs).`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcf8",
            title: "Instagram",
            description: "Photos, Reels, Stories. Popular with teens and young adults. Great for food, fashion, and pretty Tashkent cafe shots.",
            tag: "Photos \u00b7 Reels",
            tagColor: "purple",
          },
          {
            icon: "\ud83c\udfb5",
            title: "TikTok",
            description: "Short vertical videos (15\u201360 seconds). The \"For You\" page shows videos it thinks you'll like, even from strangers.",
            tag: "Short video",
            tagColor: "pink",
          },
          {
            icon: "\ud83c\udfa5",
            title: "YouTube",
            description: "Longer videos: 5-minute tutorials to 2-hour shows. Good for learning \u2014 IELTS lessons, guitar, maths tricks.",
            tag: "Long video",
            tagColor: "red",
          },
          {
            icon: "\ud83d\udcac",
            title: "Telegram",
            description: "The #1 app in Uzbekistan for group chat and news channels. @gazeta_uz, school groups, and class chats all live here.",
            tag: "Channels \u00b7 Groups",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udc65",
            title: "Facebook",
            description: "Mostly used by parents and older adults in Uzbekistan. Family updates, local event pages, Marketplace.",
            tag: "Older users",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udcbc",
            title: "LinkedIn",
            description: "A professional app \u2014 like an online CV. Used to find internships and first jobs. No party photos, no memes.",
            tag: "Jobs \u00b7 CV",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Quick match:</strong> \u2705 Photo of a cafe's new dessert \u2192 Instagram \u00b7 \u2705 20-second dance with friends \u2192 TikTok \u00b7 \u2705 15-minute IELTS tutorial \u2192 YouTube \u00b7 \u2705 Class news \u2192 Telegram channel \u00b7 \u2705 Internship search \u2192 LinkedIn.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Your family opens a small bakery near your school. Which TWO apps would you use to tell the neighbourhood about it \u2014 and why those two?`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "Social Media Management Tools",
    time: "~3 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Big shops post on Instagram, TikTok, Telegram, and Facebook \u2014 every day, at the right times. <strong>Nobody sits on their phone 24/7 to do that. They use helper apps.</strong>`,
    content: [
      {
        type: "text",
        html: `A <strong>social media management tool</strong> is software that lets you <mark>post, schedule, and reply across many apps from one screen</mark>. Write once, send to Instagram and Facebook. Line up a week of posts on Sunday. Read all DMs in one inbox. Popular free tools: <strong>Buffer</strong>, <strong>Hootsuite</strong>, <strong>Later</strong>.`,
      },
      {
        type: "image",
        src: "/images/m3/management-tools.webp",
        description: "One dashboard on a laptop connected by arrows to Instagram, TikTok, Telegram, and Facebook \u2014 showing a calendar of future posts",
      },
      {
        type: "analogy",
        label: "\ud83c\udf73 A kitchen with one cook and many pans",
        html: `A good cook prepares every pan at once \u2014 rice, soup, salad, meat \u2014 not one at a time. <strong>A management tool is the same.</strong> One dashboard controls many social apps at once, so a small shop with one person can look as busy and steady as a big company.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcc5",
            title: "Schedule posts",
            description: "Write 5 posts on Sunday. The tool posts them Mon\u2013Fri at 7 p.m. automatically. No alarms, no stress.",
            tag: "Write once, post many",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udce9",
            title: "Unified inbox",
            description: "DMs from Instagram, Facebook, and Telegram show in ONE place. Reply faster, don't miss messages.",
            tag: "One screen, all DMs",
            tagColor: "purple",
          },
          {
            icon: "\ud83d\udcca",
            title: "See what works",
            description: "Simple dashboards show which post got the most likes and comments \u2014 so the next post is even better.",
            tag: "Quick insights",
            tagColor: "green",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Quick match:</strong> \u2705 Busy week ahead \u2192 schedule posts in advance \u00b7 \u2705 DMs piling up \u2192 use the unified inbox \u00b7 \u2705 Free plans work for one small shop \u00b7 \u2705 Combine with a design tool like Canva for the pictures.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> A cousin runs a small thrift-clothes page alone \u2014 school all day, she's exhausted by evening, posting is chaos. Which tool would save her the most time, and what would she use it for first?`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "Social Media Measurement & Reporting",
    time: "~3 mins",
    badges: [],
    hook: `Your Instagram post got 200 likes \u2014 is that good? <strong>You can't know without looking at the numbers behind the post.</strong> Every social app has a free dashboard that tells you who saw your post and what they did next.`,
    content: [
      {
        type: "text",
        html: `The main numbers you'll see: <strong>reach</strong> (how many different people saw your post), <strong>likes</strong>, <strong>comments</strong>, <strong>shares</strong>, and <strong>saves</strong>. Each one tells a different story. A like takes half a second; a <mark>save</mark> means \"this was useful, I'll use it later.\" A <mark>share</mark> means \"I want my friends to see this.\" Saves and shares are the strongest signs of a great post.`,
      },
      {
        type: "image",
        src: "/images/m3/analytics.webp",
        description: "A phone screen showing Instagram Insights: reach, likes, comments, saves, and shares with small up-arrow icons and simple charts",
      },
      {
        type: "analogy",
        label: "\ud83d\udcd1 Like a school report card",
        html: `A report card doesn't just show one big number \u2014 it shows maths, English, science, and history separately, so you know where to improve. <strong>Instagram Insights works the same way.</strong> Reach = attendance. Likes = participation. Saves and shares = real learning (people kept it). Look at all of them, not just one.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udc41\ufe0f",
            title: "Reach",
            description: "Different people who saw your post. If the same friend looks 3 times, she still counts once. Good for knowing your audience size.",
            tag: "Who saw it",
            tagColor: "blue",
          },
          {
            icon: "\u2764\ufe0f",
            title: "Likes",
            description: "Easy signal, one tap. Good but not strong. 200 likes on 10,000 reach means only 2% actually liked the post \u2014 think about why.",
            tag: "Cheap signal",
            tagColor: "pink",
          },
          {
            icon: "\ud83d\udd16",
            title: "Saves / Shares",
            description: "The strongest signs. Saves = \"I'll use this later.\" Shares = \"friends must see this.\" More effort from viewers = better content.",
            tag: "Real value",
            tagColor: "green",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Quick match:</strong> \u2705 Post got reach but no saves \u2192 content didn't stick \u00b7 \u2705 Low reach + high saves \u2192 a small but loyal audience loves you \u00b7 \u2705 Big follower count + silent posts \u2192 followers are there but not engaged \u00b7 \u2705 Check numbers weekly, not hourly \u2014 one post doesn't show a trend.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Your friend has 5,000 followers and gets 20 likes per post. Your page has 300 followers and gets 60 likes and 10 comments per post. Whose page is actually healthier \u2014 and why?`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "Social Advertising",
    time: "~3 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You scroll Instagram and see a post from a shop you've never followed. Why is it there? <strong>Someone paid the app to show it to you.</strong> That is social advertising \u2014 shops paying to reach new people.`,
    content: [
      {
        type: "text",
        html: `A <strong>social media ad</strong> is a normal post, except the shop <mark>paid the app to show it to people who don't follow them yet</mark>. You can tell it's an ad because it carries a small <strong>\"Sponsored\"</strong> label under the name. Instagram, TikTok, and Facebook earn most of their money from these ads. The clever part: the shop can <mark>target</mark> the ad \u2014 \"only 16\u201325-year-olds in Tashkent who like food.\"`,
      },
      {
        type: "image",
        src: "/images/m3/advertising.webp",
        description: "An Instagram post with a small \"Sponsored\" label, a cafe photo, and a \"Try our new dessert today\" caption \u2014 with arrows showing city, age, and interest filters chosen by the shop",
      },
      {
        type: "analogy",
        label: "\ud83d\udcee A billboard that picks its own audience",
        html: `A normal billboard on Amir Temur Street is seen by everyone who drives past \u2014 young, old, interested or not. <strong>A social media ad is a billboard that asks first:</strong> \"Only show me to 16\u201325-year-olds who like cafes.\" The app does the filtering, so your budget is only spent on the people most likely to walk into your shop.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udfaf",
            title: "Targeting",
            description: "Pick city, age range, interests. A Tashkent cafe shows ads only to Tashkent 16\u201328-year-olds who like food \u2014 no wasted budget on other cities.",
            tag: "Pick your people",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udcb0",
            title: "Daily budget",
            description: "Set a limit like 30,000 som/day. Once spent, the ad pauses until tomorrow. No surprise bills \u2014 a key safety for first-time advertisers.",
            tag: "Safe start",
            tagColor: "green",
          },
          {
            icon: "\ud83d\uddbc\ufe0f",
            title: "Good creative",
            description: "One bright photo + short text (\"come today\"). A paid ad can't save a bad product \u2014 but a great photo on a good product multiplies the reach.",
            tag: "Photo + message",
            tagColor: "purple",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Quick match:</strong> \u2705 Small budget \u2192 narrow targeting, daily cap \u00b7 \u2705 New cafe in Chorsu \u2192 \"Tashkent, 16\u201345, likes food\" \u00b7 \u2705 Language school \u2192 \"Tashkent, 16\u201325, likes English-learning pages\" \u00b7 \u2705 Boosting a post = the beginner's first ad.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Next time you open Instagram or TikTok, count how many \"Sponsored\" posts you see in the first 20. Why do you think the app showed YOU that specific product and not something random?`,
      },
    ],
  },

  // ─── Topic 6 ───
  //
  // LinkedIn — Your Professional Identity Online.
  //
  // Replaces the old Facebook + X (Twitter) topics. Self-study design:
  // every section ends with a Think Deeper callout, analogy blocks
  // translate "professional network" into things a 17-year-old already
  // understands (digital business card, senior-cousin advice), and
  // the final section ties directly into our own /connect surface so
  // students see immediate value ("your LinkedIn powers IFS Connect").
  {
    id: 6,
    title: "LinkedIn — Your Professional Identity Online",
    time: "~8 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Instagram is for friends. TikTok is for fun. <strong>LinkedIn is where your future job is hiding.</strong> Recruiters from Google, Microsoft, and local Tashkent companies scroll LinkedIn every day looking for people exactly like you \u2014 even if you haven't graduated yet.`,
    content: [
      // ─── SECTION 1: What is LinkedIn and why does it matter? ───
      {
        type: "text",
        html: `<strong>Section 1 \u2014 What is LinkedIn and why does it matter?</strong>`,
      },
      {
        type: "text",
        html: `<strong>LinkedIn</strong> is a social app \u2014 but instead of posting your weekend selfies, you post <mark>what you are learning, what you have built, and what you want to do for work</mark>. Everyone on LinkedIn is there for the same reason: to find a job, a teammate, a mentor, or an internship. It is not a boring website for old people \u2014 900 million+ people use it, and <mark>8 people get hired every single minute</mark> through LinkedIn.`,
      },
      {
        type: "analogy",
        label: "\ud83d\udcbc Your digital business card \u2014 100x more powerful",
        html: `A business card has your name and phone number \u2014 you hand it to someone and hope they call. <strong>Your LinkedIn profile is a business card that works 24/7.</strong> It shows your photo, your school, your skills, your projects, and your goals to anyone searching. Recruiters search for \"Computer Science student Tashkent\" and your card pops up \u2014 even while you sleep.`,
      },
      {
        type: "image",
        src: "/images/m3/linkedin-profile.webp",
        description: "Anatomy of a great student LinkedIn profile \u2014 clear head-shot, headline mentioning skills (\"CS Student | Interested in AI & Web Development\"), Tashkent + Amity location, Connect and Message buttons, About paragraph and Skills pills (HTML, CSS, Python, Teamwork). Callouts highlight the three things recruiters see in 3 seconds: PHOTO, HEADLINE, and the growing Skills list.",
      },
      {
        type: "text",
        html: `<strong>Why LinkedIn actually matters for YOU:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udfaf",
            title: "Recruiters find YOU",
            description: "A recruiter from Google can find you on LinkedIn BEFORE you even apply. Your profile is your advert \u2014 always on. Many students get their first internship from a message like this.",
            tag: "Inbound opportunities",
            tagColor: "blue",
          },
          {
            icon: "\ud83c\udf93",
            title: "Internships live there",
            description: "Many internships \u2014 especially at international companies \u2014 are posted ONLY on LinkedIn. If you're not there, you can't see them. Your friends are already applying.",
            tag: "Internship listings",
            tagColor: "purple",
          },
          {
            icon: "\ud83e\udd1d",
            title: "Real connections",
            description: "Professors, seniors, alumni, classmates \u2014 everyone you'll want to know is one click away. A polite hello today becomes a job reference three years from now.",
            tag: "Network = net worth",
            tagColor: "green",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>LinkedIn vs Instagram / Facebook \u2014 different apps, different jobs:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcf8",
            title: "Instagram / Facebook",
            description: "Friends, family, food photos, holiday pictures. Relaxed, personal. A recruiter doesn't go to Instagram to find a software engineer.",
            tag: "Personal life",
          },
          {
            icon: "\ud83d\udcbc",
            title: "LinkedIn",
            description: "Career, learning, projects, work. Professional but friendly. This is where your skills, not your selfies, are the main attraction.",
            tag: "Professional life",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>The numbers that matter:</strong> \u2705 900 million+ professionals use LinkedIn worldwide \u00b7 \u2705 8 people are hired every minute through it \u00b7 \u2705 Over 95% of recruiters check LinkedIn before deciding who to interview \u00b7 \u2705 Most international internships for students are posted here first.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Imagine a recruiter from a big Tashkent tech company Googles your name today. What comes up? If the answer is \"nothing\" or \"just my Instagram,\" that's a missed chance. A LinkedIn profile puts YOU in control of what they see first.`,
      },

      // ─── SECTION 2: Why students should start NOW ───
      {
        type: "text",
        html: `<strong>Section 2 \u2014 Why you should start NOW, not after graduation</strong>`,
      },
      {
        type: "text",
        html: `Most students think LinkedIn is \"for later \u2014 when I have a real job.\" <strong>That's the biggest mistake.</strong> The whole point of LinkedIn is that it <mark>works slowly over time</mark>. Connections you make in Year 1 remember you in Year 4 when they have an internship to offer. Starting early is like planting a tree \u2014 the best time was 3 years ago, the second-best time is today.`,
      },
      {
        type: "analogy",
        label: "\ud83c\udf31 Why early beats late",
        html: `Think about your senior cousin who graduated 2 years ago. They probably wish they had started LinkedIn in Year 1 \u2014 because now they're applying for jobs with <strong>zero connections</strong>, while a classmate who started early has 500+ contacts, a strong profile, and recruiters already messaging them. Same grades, very different outcomes.`,
      },
      {
        type: "text",
        html: `<strong>Reasons to start now \u2014 this semester, not next year:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udc65",
            title: "Your people are already there",
            description: "Professors, seniors, and classmates have LinkedIn profiles today. Connect while you're in class together \u2014 a \"hi\" in person becomes a connection that lasts forever.",
            tag: "Easy first wins",
            tagColor: "blue",
          },
          {
            icon: "\u23f3",
            title: "Networks take time to grow",
            description: "Going from 0 to 500 meaningful connections takes YEARS of small actions. Starting in Year 1 gives you three years of growth before anyone asks for your CV.",
            tag: "Compound growth",
            tagColor: "purple",
          },
          {
            icon: "\ud83c\udf92",
            title: "Internships are hidden here",
            description: "Many international internships \u2014 Microsoft, Google, EPAM Tashkent, major banks \u2014 post openings on LinkedIn first. Without a profile, you simply don't see them.",
            tag: "Exclusive listings",
            tagColor: "green",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Bonus reason \u2014 our own IFS Connect is LinkedIn-powered:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udd17",
            title: "Your LinkedIn = your Connect card",
            description: "The LinkedIn URL you add to your /profile/edit page shows up as a real \"Connect on LinkedIn\" button on your IFS Connect card. Classmates, juniors, and recruiters browsing the site click through.",
            tag: "Already wired up",
            tagColor: "blue",
          },
          {
            icon: "\ud83c\udfc6",
            title: "Juniors will find YOU",
            description: "Next year, Year 1 students will open IFS Connect and see senior profiles. Your LinkedIn is how they'll reach out for advice. Start building your presence today.",
            tag: "Your legacy",
            tagColor: "purple",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Common excuse \u2014 and why it's wrong:</strong> \u201cI'll make a LinkedIn once I have something to show.\u201d But LinkedIn IS how you show progress. Your first project, first course, first internship \u2014 every small step goes on your profile and compounds over time. Start empty, fill it as you grow.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Name one senior or alumnus you'd love to talk to about your future career. Do you know their email? Probably not. But they're almost certainly on LinkedIn \u2014 one polite connection request away. That's the power you're missing today.`,
      },

      // ─── SECTION 3: How to set up a great profile ───
      {
        type: "text",
        html: `<strong>Section 3 \u2014 How to set up a great LinkedIn profile</strong>`,
      },
      {
        type: "text",
        html: `A weak LinkedIn profile is worse than no LinkedIn \u2014 recruiters see \"Student\" with a blank photo and move on. A <mark>great profile takes 30 minutes to set up</mark> and signals \"I'm serious about my future.\" Here are the six pieces every profile needs.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcf7",
            title: "1. Photo \u2014 clear & friendly",
            description: "Plain background. Good lighting. Smiling. No sunglasses, no group photos, no selfie with a car. Your face, looking approachable \u2014 like a student photo for a university ID.",
            tag: "First impression",
            tagColor: "blue",
          },
          {
            icon: "\u270d\ufe0f",
            title: "2. Headline \u2014 not just \"Student\"",
            description: "Don't write \"Student at Amity Tashkent.\" Instead: \"Computer Science Student | Interested in AI & Web Development.\" Mention ONE skill or interest \u2014 it makes you searchable.",
            tag: "Recruiter search term",
            tagColor: "purple",
          },
          {
            icon: "\ud83d\udcd6",
            title: "3. About \u2014 3 to 4 lines max",
            description: "Who you are, what you're learning, what excites you. \"I'm a Year 1 CS student at Amity Tashkent. I'm learning HTML and Python, and I want to build useful websites for local shops.\" Done.",
            tag: "Short > long",
            tagColor: "green",
          },
          {
            icon: "\ud83c\udf93",
            title: "4. Education \u2014 full details",
            description: "Add Amity University Tashkent, your program (IFS), year of study. Don't skip \u2014 this is the FIRST thing recruiters filter by. \"Recent graduates in Tashkent\" is a common search.",
            tag: "Filter-friendly",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udee0\ufe0f",
            title: "5. Skills \u2014 add what you're learning",
            description: "HTML, CSS, Python, MS Excel, Communication, Teamwork. Add EVERY skill you touch in class. Classmates can \"endorse\" your skills, which adds trust on your profile.",
            tag: "Keyword search",
            tagColor: "purple",
          },
          {
            icon: "\u2b50",
            title: "6. Featured \u2014 show your work",
            description: "As you build projects \u2014 a webpage, a small app, a class presentation \u2014 pin them here. Empty today is fine; fill it as the year progresses. This is what makes recruiters stop scrolling.",
            tag: "Proof of work",
            tagColor: "green",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>One profile, always growing:</strong> \u2705 Finished an HTML assignment? Add HTML to skills \u00b7 \u2705 Got a certificate from a free course? Upload it to Featured \u00b7 \u2705 Did a class project in a team? Put it in Experience as \"Student Project.\" Every action you take in class belongs on LinkedIn.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Avoid these beginner mistakes:</strong> \u26a0\ufe0f Blank photo \u2014 recruiters skip silently \u00b7 \u26a0\ufe0f Headline that just says \"Student\" \u2014 invisible in searches \u00b7 \u26a0\ufe0f No Education section \u2014 filters push you out \u00b7 \u26a0\ufe0f Wall of text in About \u2014 nobody reads more than 4 lines.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Open your phone's camera. Can you take a clean head-shot against a plain wall in 2 minutes? That's your LinkedIn photo, done. The best profile is the one that exists \u2014 don't wait for a \"perfect\" photo.`,
      },

      // ─── SECTION 4: How to use LinkedIn effectively ───
      {
        type: "text",
        html: `<strong>Section 4 \u2014 How to actually USE LinkedIn once you have a profile</strong>`,
      },
      {
        type: "text",
        html: `A profile is just the start. The magic happens when you <mark>connect, engage, and learn</mark> from other people's posts. But there's a right way and a wrong way. Here's a 4-step rhythm that works for students.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\u2795",
            title: "Connect \u2014 but thoughtfully",
            description: "Classmates, professors, alumni, people you met at events. Send a SHORT message: \u201cHi [name], we were in the same ICT class. I'd like to stay connected here.\u201d Personal always beats blank.",
            tag: "Start with people you know",
            tagColor: "blue",
          },
          {
            icon: "\ud83c\udfe2",
            title: "Follow companies you admire",
            description: "Google, Microsoft, EPAM Tashkent, Beeline, Uzcard, Humans. Following = their updates appear in your feed. You learn what they're hiring for and what matters in the industry.",
            tag: "Industry radar",
            tagColor: "purple",
          },
          {
            icon: "\ud83d\udcac",
            title: "Engage with posts",
            description: "Like posts you genuinely find interesting. Comment with a real thought \u2014 not just \u201cnice!\u201d Sharing a useful article with one sentence of your opinion puts you on people's radar.",
            tag: "Be present, not loud",
            tagColor: "green",
          },
          {
            icon: "\u270d\ufe0f",
            title: "Message someone new",
            description: "Want advice? Message a senior or alumnus politely: \u201cHi, I saw you work at EPAM. I'm a CS student \u2014 could you share how you got started?\u201d Most people say yes. Rude or spammy gets ignored.",
            tag: "Be respectful, be brief",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>What NOT to do \u2014 avoid these rookie moves:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udeab",
            title: "Don't spam-connect",
            description: "Sending 200 blank connection requests a day looks desperate \u2014 and LinkedIn will limit your account. Quality over quantity. 5 thoughtful connects > 100 blank ones.",
            tag: "Quality > quantity",
          },
          {
            icon: "\ud83d\ude21",
            title: "Don't post personal drama",
            description: "LinkedIn is not Instagram. Fights, breakups, complaints about teachers \u2014 save those for private chats. Recruiters see EVERYTHING on your profile, including old posts.",
            tag: "Professional tone",
          },
          {
            icon: "\ud83d\udce9",
            title: "Don't ignore messages",
            description: "If a recruiter or alumnus messages you, reply within 2 days \u2014 even if it's just \u201cThank you, I'll think about it.\u201d Silence is the fastest way to lose an opportunity.",
            tag: "Always reply",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>A simple weekly rhythm:</strong> \u2705 Mon \u2014 check your feed for 10 min, like 3 posts \u00b7 \u2705 Wed \u2014 send one new connection request to a classmate or professor \u00b7 \u2705 Fri \u2014 write a one-sentence comment on a post you found useful. 30 minutes a week grows your network steadily.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Which ONE senior at Amity would you love to learn from? Draft a 2-line polite message to them in your head. Would you rather send that message on LinkedIn \u2014 or do nothing and hope you run into them one day?`,
      },

      // ─── SECTION 5: LinkedIn + IFS Connect ───
      {
        type: "text",
        html: `<strong>Section 5 \u2014 LinkedIn meets IFS Connect</strong>`,
      },
      {
        type: "text",
        html: `Here's the best part for us: <mark>our own IFS Connect page is powered by LinkedIn</mark>. When you add your LinkedIn URL to your /profile/edit page, two things happen. <strong>First</strong>, a blue \u201cConnect on LinkedIn\u201d button appears on your Connect card. <strong>Second</strong>, your card gets ranked higher in the list \u2014 classmates see you first. It's a free win.`,
      },
      {
        type: "analogy",
        label: "\ud83c\udfeb A shared contact book for our batch",
        html: `Think of IFS Connect as a <strong>shared contact book</strong> for everyone studying ICT this year. Adding your LinkedIn is like writing your phone number in the book \u2014 suddenly classmates, juniors, and alumni who open the book can actually reach you. A card without a LinkedIn URL is a name with no way to contact.`,
      },
      {
        type: "text",
        html: `<strong>What happens when you add your LinkedIn to IFS Connect:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcf1",
            title: "Your card jumps to the top",
            description: "Cards with a LinkedIn URL rank higher than cards without. Classmates browsing /connect see you in the first screen, not buried on page 5.",
            tag: "Visibility boost",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udc65",
            title: "Juniors can find you",
            description: "Next year's Year 1 students will open IFS Connect and reach out to you on LinkedIn for advice. You become THE senior they remember \u2014 that's how mentorship starts.",
            tag: "Your batch legacy",
            tagColor: "purple",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How to wire it up \u2014 3 steps, 5 minutes:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "1\ufe0f\u20e3",
            title: "Create your LinkedIn",
            description: "Go to linkedin.com on your phone or laptop. Sign up with your main email. Fill in the 6 profile pieces from Section 3 of this topic. About 30 minutes total.",
            tag: "Start at linkedin.com",
            tagColor: "blue",
          },
          {
            icon: "2\ufe0f\u20e3",
            title: "Copy your profile URL",
            description: "Your URL looks like \"linkedin.com/in/yourname-123\". Open your own profile on LinkedIn and copy the address from the browser bar.",
            tag: "Profile URL",
            tagColor: "purple",
          },
          {
            icon: "3\ufe0f\u20e3",
            title: "Paste into /profile/edit",
            description: "Come back here, open the Profile button at the top of this page, and paste your LinkedIn URL. Save. Your IFS Connect card now shows the blue button.",
            tag: "Done",
            tagColor: "green",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>The compounding effect:</strong> \u2705 Today \u2014 one blue button on your card \u00b7 \u2705 Next semester \u2014 a classmate messages you about a group project \u00b7 \u2705 Graduation \u2014 a senior alumnus sees your card and offers an internship \u00b7 \u2705 Five years later \u2014 that same alumnus is the hiring manager at your dream company.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Key takeaway:</strong> \u26a0\ufe0f A LinkedIn profile is free \u00b7 \u26a0\ufe0f Takes 30 minutes to set up \u00b7 \u26a0\ufe0f Adds a button to your IFS Connect card instantly \u00b7 \u26a0\ufe0f Unlocks introductions, internships, and advice that are hidden to students without one. The ONLY cost of starting is 30 minutes.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Final think-it-through:</strong> Three years from now, imagine you need an internship at a top company. The version of you with a LinkedIn since Year 1 has 300+ connections, a filled-in profile, and comments from professors. The version without has to start from scratch. Which version are you building today?`,
      },
    ],
  },

];
