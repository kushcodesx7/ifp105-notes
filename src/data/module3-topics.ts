import type { Topic } from "./module1-topics";

export const topics: Topic[] = [
  // ─── Topic 1 ─── KEEP AS-IS
  {
    id: 1,
    title: "Introduction to Social Media",
    time: "~5 mins",
    badges: [{ text: "Foundation", type: "star" }],
    hook: `Before social media, if you wanted to share a photo with 500 people, you'd print 500 copies and mail them. Now you tap "Post" and it's done in 2 seconds. <strong>Social media didn't just change the internet — it changed how humans communicate, shop, learn, and even think.</strong>`,
    content: [
      {
        type: "text",
        html: `Social media refers to <mark>websites and apps that let users create, share, and interact with content and each other</mark>. It's not just scrolling memes — it's a revolution in how information moves around the planet.`,
      },
      {
        type: "image",
        src: "/images/m3/social-media.webp",
        description: "Social media ecosystem: person at centre connected to Facebook, Instagram, Twitter/X, YouTube, TikTok, LinkedIn — arrows showing two-way communication",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udde3\ufe0f",
            title: "User-Generated Content",
            description: "Unlike TV or newspapers, YOU create the content. Posts, stories, videos, reviews — the audience IS the creator. That's the revolution.",
            tag: "You are the media",
          },
          {
            icon: "\ud83c\udf0d",
            title: "Global Reach, Instant Speed",
            description: "A tweet can reach millions in minutes. A TikTok can go viral overnight. No printing press, no TV station needed — just Wi-Fi.",
            tag: "Zero gatekeepers",
          },
          {
            icon: "\ud83d\udd01",
            title: "Two-Way Communication",
            description: "TV talks AT you. Social media talks WITH you. Comments, replies, shares, duets — it's a conversation, not a broadcast.",
            tag: "Interactive by design",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How social media changed communication forever:</strong>`,
      },
      {
        type: "table",
        headers: ["Before Social Media", "After Social Media"],
        rows: [
          { cells: ["News took hours/days to spread", "News spreads in seconds via shares and retweets"] },
          { cells: ["Brands spoke AT customers (ads, billboards)", "Brands have conversations WITH customers (comments, DMs)"] },
          { cells: ["Only celebrities had audiences", "Anyone with a phone can build a following"] },
          { cells: ["Feedback was slow (letters, surveys)", "Feedback is instant (likes, comments, reviews)"] },
          { cells: ["Marketing required huge budgets", "A viral post costs $0 and reaches millions"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Key stat:</strong> There are over 4.9 billion social media users worldwide — that's more than 60% of the entire planet. If social media were a country, it would be the biggest one ever.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Remember:</strong> Social media is not just "fun apps." For businesses, it's a marketing channel, customer service desk, brand builder, and sales platform — all in one. That's why companies hire entire teams just for social media.`,
      },
    ],
  },

  // ─── Topic 2 ─── KEEP AS-IS
  {
    id: 2,
    title: "Types of Social Media Platforms",
    time: "~6 mins",
    badges: [],
    hook: `Not all social media is the same. Instagram is nothing like LinkedIn. TikTok is nothing like Twitter. Each platform has a <strong>different audience, different content style, and different marketing strategy.</strong> Using the wrong platform for your message is like wearing a swimsuit to a job interview — technically clothing, but completely wrong.`,
    content: [
      {
        type: "text",
        html: `Social media platforms fall into <mark>distinct categories</mark> based on what they're designed for. Smart marketers match the platform to the goal.`,
      },
      {
        type: "image",
        src: "/images/m3/platforms.webp",
        description: "6 platform categories in a grid: Social Networking (Facebook, LinkedIn) \u00b7 Media Sharing (Instagram, YouTube, TikTok) \u00b7 Microblogging (Twitter/X) \u00b7 Messaging (WhatsApp, Telegram) \u00b7 Discussion Forums (Reddit) \u00b7 Professional (LinkedIn)",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udc65",
            title: "Facebook",
            description: "The biggest social network. 3 billion users. Groups, Pages, Marketplace, Events. Best for community building and reaching older demographics (25-55+).",
            tag: "Social Networking",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udcf8",
            title: "Instagram",
            description: "Visual-first platform. Photos, Reels, Stories. Huge with 18-34 age group. Perfect for brands with strong visuals — fashion, food, travel, fitness.",
            tag: "Media Sharing",
            tagColor: "purple",
          },
          {
            icon: "\ud83d\udc26",
            title: "Twitter / X",
            description: "Real-time microblogging. 280-character posts. Breaking news, trending topics, public conversations. Fast-paced and opinion-driven.",
            tag: "Microblogging",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udcbc",
            title: "LinkedIn",
            description: "Professional networking. Resumes, job posts, industry articles. B2B marketing goldmine. If Facebook is the party, LinkedIn is the conference.",
            tag: "Professional",
            tagColor: "blue",
          },
          {
            icon: "\ud83c\udfa5",
            title: "YouTube",
            description: "World's second-largest search engine. Long-form and short-form video. Tutorials, vlogs, ads. People search YouTube like they search Google.",
            tag: "Video Platform",
            tagColor: "red",
          },
          {
            icon: "\ud83c\udfb5",
            title: "TikTok",
            description: "Short-form vertical video. Viral trends, challenges, sounds. Dominated by Gen Z. Fastest-growing platform in history. Algorithm-driven discovery.",
            tag: "Short Video",
            tagColor: "pink",
          },
        ],
      },
      {
        type: "table",
        headers: ["Platform", "Best For", "Content Type", "Key Audience"],
        rows: [
          { cells: ["Facebook", "Community, groups, events", "Text, photos, video, links", "25\u201355+ years"] },
          { cells: ["Instagram", "Visual branding, influencers", "Photos, Reels, Stories", "18\u201334 years"] },
          { cells: ["Twitter/X", "News, trends, conversations", "Short text, threads, polls", "18\u201349 years"] },
          { cells: ["LinkedIn", "B2B, professional networking", "Articles, job posts, updates", "25\u201354 professionals"] },
          { cells: ["YouTube", "Tutorials, entertainment, ads", "Long & short video", "All ages"] },
          { cells: ["TikTok", "Viral content, Gen Z reach", "Short vertical video", "16\u201330 years"] },
        ],
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Pro tip:</strong> You don't need to be on EVERY platform. A law firm posting dance videos on TikTok? Awkward. A fashion brand ignoring Instagram? Criminal. <mark>Match the platform to your audience and content style.</mark>`,
      },
    ],
  },

  // ─── Topic 3 ─── REWRITTEN: Modern Tools & Automation
  {
    id: 3,
    title: "Social Media Tools & Automation",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Imagine running 5 social media accounts by hand — writing captions at midnight, replying to DMs at 6 AM, designing graphics between classes. <strong>Nobody does that anymore.</strong> Today's creators and marketers use a toolkit of smart apps that handle scheduling, design, chatbots, and even writing — so you focus on strategy, not busywork.`,
    content: [
      {
        type: "analogy",
        label: "\ud83c\udfad The Film Crew Analogy",
        html: `Making a movie alone is impossible. You need a director, camera operator, editor, and sound engineer. Social media is the same: <strong>Later is your scheduler</strong> (the assistant director who plans every scene), <strong>Canva is your set designer</strong> (makes everything look amazing), <strong>ChatGPT is your scriptwriter</strong> (creates content fast), <strong>ManyChat is your front-desk receptionist</strong> (handles customer messages automatically), and <strong>Notion is your production planner</strong> (keeps everything organized). One person with these five tools = an entire marketing department.`,
      },
      {
        type: "image",
        src: "/images/m3/management-tools.webp",
        description: "Single dashboard connected to Facebook, Instagram, Twitter, LinkedIn, TikTok — showing scheduling calendar, analytics charts, and message inbox",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcc5",
            title: "Later",
            description: "Visual scheduling tool. Drag and drop posts onto a calendar, preview how your Instagram grid will look, and auto-publish at the best times. Free plan available.",
            tag: "Scheduling & planning",
            tagColor: "green",
          },
          {
            icon: "\ud83c\udfa8",
            title: "Canva",
            description: "Design tool anyone can use. Thousands of templates for Instagram posts, stories, YouTube thumbnails, TikTok covers. No Photoshop skills needed — just drag, edit, export.",
            tag: "Design made easy",
            tagColor: "purple",
          },
          {
            icon: "\ud83e\udd16",
            title: "ChatGPT",
            description: "AI writing assistant. Generate captions, brainstorm content ideas, rewrite text for different platforms, create hashtag lists. Like having a copywriter on call 24/7.",
            tag: "AI content creation",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udcac",
            title: "ManyChat",
            description: "Chatbot builder for Instagram and Facebook. Auto-replies to DMs, answers FAQs, sends links when someone comments a keyword. Works while you sleep.",
            tag: "Chatbot automation",
            tagColor: "amber",
          },
          {
            icon: "\ud83d\uddd2\ufe0f",
            title: "Notion",
            description: "All-in-one planner. Build content calendars, store caption ideas, track posting schedules, and collaborate with your team. Your social media HQ.",
            tag: "Planning & organization",
          },
          {
            icon: "\ud83d\udcca",
            title: "Built-in Analytics",
            description: "Every platform (Instagram Insights, YouTube Studio, TikTok Analytics) gives you free data: what posts worked, when your audience is online, follower demographics.",
            tag: "Free from every platform",
            tagColor: "green",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>The 4 pillars every social media toolkit must cover:</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Scheduling \ud83d\udcc5",
            description: "Write posts in advance and set them to publish at the perfect time. Later, Buffer, and Meta Business Suite all do this. No more posting at 3 AM because your audience is in a different time zone.",
          },
          {
            title: "Content Creation \ud83c\udfa8",
            description: "Design graphics in Canva, write captions with ChatGPT, edit videos with CapCut. The creation process is faster than ever because AI and templates handle the heavy lifting.",
          },
          {
            title: "Automation \ud83e\udd16",
            description: "ManyChat auto-replies to DMs on Instagram. Zapier connects your tools so a new blog post automatically becomes a tweet. Automation handles repetitive tasks on autopilot.",
          },
          {
            title: "Analytics \ud83d\udcca",
            description: "Track which posts perform best, when your audience is online, and how your followers grow. Use built-in analytics from each platform — they're free and surprisingly powerful.",
          },
        ],
      },
      {
        type: "table",
        headers: ["Tool", "What It Does", "Best For", "Cost"],
        rows: [
          { cells: ["Later", "Schedule posts, visual planner", "Instagram & TikTok scheduling", "Free / $25+/mo"] },
          { cells: ["Canva", "Design graphics & videos", "Posts, stories, thumbnails", "Free / $13/mo"] },
          { cells: ["ChatGPT", "Write captions, brainstorm ideas", "Content creation, repurposing", "Free / $20/mo"] },
          { cells: ["ManyChat", "Automated DM replies, chatbots", "Instagram & Facebook automation", "Free / $15+/mo"] },
          { cells: ["Notion", "Content calendar, idea database", "Planning & team collaboration", "Free / $10/mo"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Why does this matter?</strong> Employers don't just want someone who "knows social media." They want someone who can use tools like Later, Canva, and ChatGPT to run campaigns efficiently. <mark>Knowing these tools is what separates a social media user from a social media professional.</mark>`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>Real-world example:</strong> A solo entrepreneur in Tashkent uses Canva to design posts, ChatGPT to write captions in English and Russian, Later to schedule a week of content in 30 minutes, and ManyChat to auto-reply to every "Price?" DM on Instagram. Total time: 2 hours per week. Result: looks like a team of 5.`,
      },
    ],
  },

  // ─── Topic 4 ─── KEEP AS-IS
  {
    id: 4,
    title: "Social Media Measurement & Reporting",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You posted a beautiful graphic on Instagram. It got 200 likes. Is that good? Bad? Did it actually bring customers? <strong>Without measurement, social media is just guessing.</strong> Metrics turn "I think it worked" into "I know it worked — here's the proof."`,
    content: [
      {
        type: "text",
        html: `Social media metrics are the <mark>numbers that tell you whether your content is actually working</mark>. Every platform has a built-in analytics dashboard. The trick is knowing which numbers actually matter.`,
      },
      {
        type: "image",
        src: "/images/m3/analytics.webp",
        description: "Analytics dashboard showing: Reach, Impressions, Engagement Rate, CTR, Conversions — each with sample numbers and trend arrows",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udc41\ufe0f",
            title: "Reach",
            description: "How many UNIQUE people saw your post. If 1,000 different people see it, reach = 1,000. Think of it as how wide your megaphone blasts.",
            tag: "Unique viewers",
          },
          {
            icon: "\ud83d\udd01",
            title: "Impressions",
            description: "Total number of times your post was displayed — including the SAME person seeing it multiple times. Always equal to or higher than reach.",
            tag: "Total views (with repeats)",
          },
          {
            icon: "\u2764\ufe0f",
            title: "Engagement",
            description: "Likes + Comments + Shares + Saves + Clicks. It measures how many people INTERACTED with your post, not just scrolled past it.",
            tag: "Likes + Comments + Shares",
          },
        ],
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcf2",
            title: "Engagement Rate",
            description: "Engagement \u00f7 Reach \u00d7 100. If 50 people engaged out of 1,000 who saw it, that's 5%. Industry average is 1-3%. Over 5% = crushing it.",
            tag: "The quality metric",
            tagColor: "green",
          },
          {
            icon: "\ud83d\udd17",
            title: "CTR (Click-Through Rate)",
            description: "Clicks on your link \u00f7 Impressions \u00d7 100. Measures how many people were interested enough to actually CLICK. Higher = better content.",
            tag: "Clicks \u00f7 Impressions",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udcb0",
            title: "ROI (Return on Investment)",
            description: "Revenue earned \u00f7 Amount spent \u00d7 100. The ultimate business metric. Did you make more money than you spent? That's the only question the boss cares about.",
            tag: "Revenue \u00f7 Cost",
            tagColor: "amber",
          },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u274c Common mistake:</strong> "We got 10,000 impressions!" sounds amazing. But if nobody clicked, commented, or bought anything — those are just empty eyeballs. <mark>Vanity metrics (likes, impressions) look good but don't pay bills. Action metrics (CTR, conversions, ROI) actually matter.</mark>`,
      },
      {
        type: "table",
        headers: ["Metric", "What It Measures", "Formula", "Why It Matters"],
        rows: [
          { cells: ["Reach", "Unique people who saw your post", "\u2014", "How far your content spreads"] },
          { cells: ["Impressions", "Total times post was displayed", "\u2014", "Visibility including repeats"] },
          { cells: ["Engagement Rate", "% of viewers who interacted", "(Engagements \u00f7 Reach) \u00d7 100", "Content quality indicator"] },
          { cells: ["CTR", "% who clicked your link", "(Clicks \u00f7 Impressions) \u00d7 100", "Measures interest in your offer"] },
          { cells: ["ROI", "Profit from social media spend", "(Revenue \u00f7 Cost) \u00d7 100", "Bottom-line business impact"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Analytics dashboards:</strong> Every platform has one. Facebook Insights, Instagram Insights, Twitter Analytics, LinkedIn Analytics. Third-party tools (Hootsuite, Sprout Social, Google Analytics) pull all of these into a single report. Professionals review these weekly or monthly.`,
      },
    ],
  },

  // ─── Topic 5 ─── SIMPLIFIED: Social Advertising
  {
    id: 5,
    title: "Social Advertising (Organic vs Paid)",
    time: "~5 mins",
    badges: [{ text: "Exam favourite", type: "star" }],
    hook: `You post a great photo on Instagram. 50 of your followers see it. But you want 50,000 people to see it — including people who've never heard of you. <strong>That's paid advertising.</strong> You pay the platform to show your content to exactly the right people. Think of it as the difference between handing out flyers on campus vs putting your ad on a digital billboard that only shows to people who'd actually care.`,
    content: [
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83c\udf31",
            title: "Organic Content",
            description: "Free posts seen by your existing followers. Limited reach — platforms show organic posts to only 2-5% of your followers. They want you to pay!",
            tag: "Free but tiny reach",
            tagColor: "green",
          },
          {
            icon: "\ud83d\udcb5",
            title: "Paid Advertising",
            description: "You pay to show your content to specific people. Choose who sees it by age, location, interests, and behaviour. Much wider reach, scales with your budget.",
            tag: "Costs money, massive reach",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Ads you see every day (you just don't always notice):</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcf1",
            title: "Instagram Feed Ads",
            description: "Posts that say \"Sponsored\" at the top. They look like normal posts but they're paid. That clothing brand you keep seeing? They paid to reach you.",
          },
          {
            icon: "\ud83c\udfb5",
            title: "TikTok Promoted",
            description: "Videos marked \"Sponsored\" in your For You page. Brands pay TikTok to push their content to your feed based on your interests.",
          },
          {
            icon: "\ud83c\udfa5",
            title: "YouTube Pre-roll",
            description: "The \"Skip Ad\" videos before your YouTube video plays. Companies pay per view. Those 5 seconds? They cost money.",
          },
          {
            icon: "\ud83d\udcf1",
            title: "Story Ads",
            description: "Full-screen vertical ads between your friends' Stories on Instagram and Facebook. Immersive and hard to ignore.",
          },
        ],
      },
      {
        type: "analogy",
        label: "\ud83c\udfaf The Fishing Analogy",
        html: `Organic posts = fishing with a small net in your own pond. You'll catch a few fish you already know. <strong>Paid ads = choosing exactly which ocean to fish in, what type of fish to target, and using sonar to find them.</strong> You pick the age, location, interests, and behaviour of who sees your ad. That's why even small businesses spend on ads — precision beats luck.`,
      },
      {
        type: "table",
        headers: ["Targeting Type", "What It Does", "Real Example"],
        rows: [
          { cells: ["Demographics", "Target by age, gender, location", "Women aged 18-25 in Tashkent"] },
          { cells: ["Interests", "Target by hobbies and interests", "People who follow fitness accounts"] },
          { cells: ["Behaviour", "Target by actions and purchase habits", "People who recently shopped online"] },
          { cells: ["Lookalike Audiences", "Find new people similar to your best customers", "People who behave like your top 100 buyers"] },
          { cells: ["Retargeting", "Show ads to people who already visited your site", "Someone who added to cart but didn't buy"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>A/B Testing:</strong> Run two versions of the same ad with ONE difference (different image, different headline). See which performs better. Keep the winner, drop the loser. Never guess — test everything. This is how professionals optimize every dollar.`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>Budget basics:</strong> You can start with as little as $1/day. You set a daily or total budget, and the platform stops showing ads when the budget runs out. No surprise bills. <mark>CPC (Cost Per Click)</mark> — pay only when someone clicks. <mark>CPM (Cost Per Thousand Impressions)</mark> — pay per 1,000 views. Most students' first ad campaign costs less than a coffee.`,
      },
    ],
  },

  // ─── Topic 6 ─── NEW: LinkedIn
  {
    id: 6,
    title: "LinkedIn \u2014 Build Your Professional Profile",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Instagram shows who you are on the weekend. LinkedIn shows who you are at work. Right now, recruiters are searching LinkedIn for candidates — and if your profile is empty or doesn't exist, <strong>you're invisible to the job market.</strong> Building a strong LinkedIn profile today is like planting a tree: the best time was yesterday, the second-best time is right now.`,
    content: [
      {
        type: "analogy",
        label: "\ud83c\udfe2 The Digital CV Analogy",
        html: `Think of LinkedIn as your <strong>living, breathing CV</strong> that works for you 24/7. A paper CV sits in a drawer until you send it. A LinkedIn profile is out there being found by recruiters, clients, and collaborators while you sleep. It's also a <strong>networking event that never ends</strong> — instead of awkward handshakes at a conference, you connect with professionals from your phone.`,
      },
      {
        type: "text",
        html: `<strong>Why LinkedIn matters (especially for students):</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcbc",
            title: "Jobs & Internships",
            description: "Over 90% of recruiters use LinkedIn to find candidates. Many jobs are filled through LinkedIn connections before they're even posted publicly.",
            tag: "Your #1 career tool",
            tagColor: "blue",
          },
          {
            icon: "\ud83e\udd1d",
            title: "Professional Networking",
            description: "Connect with alumni, professors, industry leaders, and potential mentors. One connection can open doors that no CV ever could.",
            tag: "Who you know matters",
            tagColor: "green",
          },
          {
            icon: "\ud83c\udf1f",
            title: "Credibility & Visibility",
            description: "Share your projects, certifications, and achievements. When someone Googles your name, your LinkedIn profile often appears first.",
            tag: "Your digital first impression",
            tagColor: "purple",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Build a profile that gets noticed — step by step:</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Professional Photo \ud83d\udcf8",
            description: "Use a clear headshot with good lighting and a plain background. No sunglasses, no group photos, no party selfies. You want to look approachable and professional. First impressions are made in 1/10th of a second.",
          },
          {
            title: "Headline (not just your job title) \ud83d\udcdd",
            description: "Your headline appears everywhere — in search results, connection requests, comments. Don't just write \"Student.\" Write what you DO: \"Marketing Student | Content Creator | Fluent in 3 Languages.\" Make people curious enough to click.",
          },
          {
            title: "Summary / About Section \ud83d\udcd6",
            description: "2-3 short paragraphs about who you are, what you're passionate about, and what you're looking for. Write in first person (\"I\" not \"He/She\"). Be human, not robotic. End with a call to action: \"Feel free to connect!\"",
          },
          {
            title: "Skills & Endorsements \u2b50",
            description: "Add at least 5 relevant skills (Social Media Marketing, Microsoft Excel, Content Writing, etc.). Connections can endorse you, which adds credibility. It's like getting a mini-recommendation with one click.",
          },
          {
            title: "Experience & Projects \ud83d\udee0\ufe0f",
            description: "Even if you haven't had a formal job — add volunteer work, freelance projects, university clubs, or class projects. Describe what you DID and what RESULT it had. Action verbs: managed, created, led, increased, organized.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How LinkedIn differs from other platforms:</strong>`,
      },
      {
        type: "table",
        headers: ["Feature", "Instagram", "LinkedIn"],
        rows: [
          { cells: ["Tone", "Casual, fun, personal", "Professional, insightful, career-focused"] },
          { cells: ["Content", "Photos, Reels, Stories", "Articles, achievements, industry insights"] },
          { cells: ["Connections", "Friends, influencers", "Colleagues, recruiters, mentors"] },
          { cells: ["Goal", "Entertainment, brand awareness", "Career growth, networking, B2B"] },
          { cells: ["Profile", "Bio + grid aesthetic", "Full professional CV with skills & endorsements"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Posting on LinkedIn:</strong> You don't need to post every day. Share once or twice a week: a lesson you learned, a project you completed, an article you found interesting with your opinion on it. Posts that tell a personal story + professional lesson get the most engagement. <mark>LinkedIn rewards people who share knowledge, not people who brag.</mark>`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Do this today:</strong> Create a LinkedIn profile (or update your existing one). Add a professional photo, write a headline that's more than just "Student," and connect with 10 classmates. That's it. Takes 20 minutes, and you've just started building your professional network.`,
      },
    ],
  },

  // ─── Topic 7 ─── NEW: Personal Branding
  {
    id: 7,
    title: "Personal Branding on Social Media",
    time: "~6 mins",
    badges: [{ text: "Hot topic", type: "hot" }],
    hook: `Coca-Cola is a brand. Nike is a brand. But here's the thing — <strong>YOU are also a brand.</strong> Every time someone sees your social media, they form an opinion about you in seconds. Are you the "creative video person"? The "always-helpful tech guy"? Or just another account posting random stuff? Personal branding is deciding what people think of when they hear your name — before someone else decides for you.`,
    content: [
      {
        type: "analogy",
        label: "\ud83c\udf54 The Restaurant Analogy",
        html: `Imagine two burger shops side by side. Both sell good burgers. But one has a clean logo, consistent colours, a catchy slogan, and great reviews. The other has no sign, messy tables, and a different menu every day. <strong>Which one would you trust?</strong> Personal branding is the same thing — it's not about being fake, it's about being <strong>consistent, recognizable, and trustworthy</strong> so people choose YOU over the 1,000 other profiles doing similar things.`,
      },
      {
        type: "text",
        html: `<strong>What is personal branding?</strong> It's <mark>the intentional effort to shape how others perceive you</mark>. Your name, your content, your profile photo, your bio, the topics you talk about — all of this creates an image in people's minds. You can either leave it to chance or take control of it.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udfaf",
            title: "Pick Your Niche",
            description: "You can't be about everything. Choose 2-3 topics you're genuinely interested in: tech + AI, fitness + nutrition, design + creativity. Specialists stand out. Generalists blend in.",
            tag: "Focus beats everything",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udcf1",
            title: "Choose Your Platforms",
            description: "You don't need to be on all platforms. Visual work? Instagram + TikTok. Professional content? LinkedIn. Writing? Twitter/X. Pick 2 and be consistent on both.",
            tag: "2 platforms > 5 half-done",
            tagColor: "green",
          },
          {
            icon: "\ud83d\udcc6",
            title: "Post Consistently",
            description: "The algorithm rewards consistency. 3 posts per week beats 20 posts in one day then silence. A content calendar (use Notion or Later) keeps you on track.",
            tag: "Consistency > perfection",
            tagColor: "purple",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Content strategy — what to actually post:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udca1",
            title: "Value Content (70%)",
            description: "Tips, tutorials, lessons learned, industry insights, how-tos. This is what builds your reputation. If people learn something from your posts, they'll follow you.",
            tag: "Teach, share, help",
          },
          {
            icon: "\ud83c\udf1f",
            title: "Personal Content (20%)",
            description: "Behind-the-scenes, your journey, wins and failures, opinions. This makes you human and relatable. People follow people, not just information.",
            tag: "Be real, be human",
          },
          {
            icon: "\ud83d\udce2",
            title: "Promotional Content (10%)",
            description: "Your services, portfolio, products, achievements. Keep this small — if every post is 'hire me' or 'buy this,' people will unfollow fast.",
            tag: "Keep it rare",
            tagColor: "amber",
          },
          {
            icon: "\u2764\ufe0f",
            title: "Engagement",
            description: "Reply to every comment. Comment on others' posts. Join conversations. Social media is SOCIAL. The algorithm pushes content from people who actually engage.",
            tag: "Talk, don't just broadcast",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u274c Common personal branding mistakes:</strong><br/>
\u2022 Posting party photos on a professional account — keep personal and professional separate<br/>
\u2022 Complaining publicly about jobs, professors, or colleagues — the internet never forgets<br/>
\u2022 Inconsistent presence — posting 10 times one week, then disappearing for 2 months<br/>
\u2022 Copying someone else's style instead of finding your own voice<br/>
\u2022 Having an empty or outdated profile — if someone searches your name, what will they find?`,
      },
      {
        type: "table",
        headers: ["Branding Element", "Good Example", "Bad Example"],
        rows: [
          { cells: ["Profile Photo", "Clean headshot, good lighting, friendly", "Blurry group photo, sunglasses, cropped from party pic"] },
          { cells: ["Bio", "\"UX Designer | Helping startups look professional\"", "\"Living my best life\""] },
          { cells: ["Content", "Regular posts about your field + genuine personality", "Random reposts with no original thought"] },
          { cells: ["Engagement", "Replying to comments, adding value in conversations", "Never responding, or only posting links"] },
          { cells: ["Consistency", "Same name, photo, and style across platforms", "Different persona on every platform"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Success story:</strong> A 20-year-old design student starts posting UI design tips on LinkedIn twice a week. After 6 months: 5,000 followers, 3 freelance clients, and an internship offer from a company that found her through her posts. <mark>She didn't have years of experience — she had a consistent personal brand.</mark>`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>Start now, not later:</strong> You don't need to be an expert to start building your brand. Document your learning journey — "Today I learned about..." posts perform incredibly well. The best personal brands are built by people who start before they feel ready.`,
      },
    ],
  },
];
