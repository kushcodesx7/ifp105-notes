import type { Topic } from "./module1-topics";

export const topics: Topic[] = [
  // ─── Topic 1 ───
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

  // ─── Topic 2 ───
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
        description: "6 platform categories in a grid: Social Networking (Facebook, LinkedIn) · Media Sharing (Instagram, YouTube, TikTok) · Microblogging (Twitter/X) · Messaging (WhatsApp, Telegram) · Discussion Forums (Reddit) · Professional (LinkedIn)",
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

  // ─── Topic 3 ───
  {
    id: 3,
    title: "Social Media Management Tools",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Imagine managing 5 social media accounts — Facebook, Instagram, Twitter, LinkedIn, TikTok — each with different post formats, different best posting times, and hundreds of comments daily. Doing this manually? <strong>You'd burn out in a week.</strong> That's why social media management tools exist.`,
    content: [
      {
        type: "analogy",
        label: "\ud83c\udfa8 The Art Studio Analogy",
        html: `Imagine painting 5 canvases at once in 5 different rooms. Exhausting, right? A social media management tool is like <strong>putting all 5 canvases on one big desk</strong>. You paint them all from one seat — schedule posts, reply to comments, and check analytics across every platform, all from a single dashboard.`,
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
            icon: "\ud83e\udda5",
            title: "Hootsuite",
            description: "One of the oldest and most popular. Schedule posts, monitor mentions, track analytics. Supports 35+ social networks. Used by enterprises worldwide.",
            tag: "Industry standard",
            tagColor: "green",
          },
          {
            icon: "\ud83d\udca1",
            title: "Buffer",
            description: "Simple, clean, beginner-friendly. Great for small businesses and solo creators. Schedule posts, track performance, plan content calendar.",
            tag: "Best for beginners",
            tagColor: "blue",
          },
          {
            icon: "\ud83c\udf31",
            title: "Sprout Social",
            description: "Advanced analytics, social listening, CRM features. Best for larger teams needing detailed reporting and customer relationship management.",
            tag: "Enterprise-grade",
            tagColor: "purple",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>The 4 core functions every management tool provides:</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Scheduling \ud83d\udcc5",
            description: "Write posts in advance and set them to publish automatically at the best times. No more waking up at 6 AM to post. Set it and forget it.",
          },
          {
            title: "Monitoring \ud83d\udc41\ufe0f",
            description: "Track who mentions your brand, what people say about you, and trending conversations. Social listening — your ears across the internet.",
          },
          {
            title: "Analytics \ud83d\udcca",
            description: "See which posts perform best, when your audience is online, follower growth, engagement rates. Data-driven decisions, not guesswork.",
          },
          {
            title: "Unified Inbox \ud83d\udce5",
            description: "All comments, messages, and mentions from every platform in ONE inbox. Reply to a Facebook comment and an Instagram DM without switching apps.",
          },
        ],
      },
      {
        type: "table",
        headers: ["Feature", "Hootsuite", "Buffer", "Sprout Social"],
        rows: [
          { cells: ["Scheduling", "\u2705 Advanced", "\u2705 Simple & clean", "\u2705 Advanced"] },
          { cells: ["Analytics", "\u2705 Detailed", "\u2705 Basic", "\u2705 Very detailed"] },
          { cells: ["Social Listening", "\u2705 Yes", "\u274c Limited", "\u2705 Advanced"] },
          { cells: ["Best For", "Large teams", "Small biz / solo", "Enterprise / agencies"] },
          { cells: ["Price Range", "$$$", "$", "$$$$"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Why does this matter?</strong> No professional social media manager posts manually. These tools save hours every week, prevent mistakes, and give you data to prove your posts are actually working. Knowing these tools = employable skill.`,
      },
    ],
  },

  // ─── Topic 4 ───
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

  // ─── Topic 5 ───
  {
    id: 5,
    title: "Social Advertising",
    time: "~6 mins",
    badges: [{ text: "Hot topic", type: "hot" }],
    hook: `You post something amazing on Instagram. It gets 50 likes from your followers. But you want 50,000 people to see it — including people who've never heard of you. <strong>That's where paid social advertising comes in.</strong> You pay the platform to show your content to exactly the right people. It's the difference between whispering in a room and renting a stadium loudspeaker.`,
    content: [
      {
        type: "text",
        html: `Social advertising means <mark>paying platforms to display your content to a targeted audience beyond your existing followers</mark>. Every major platform offers advertising — and it's how they make billions.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83c\udf31",
            title: "Organic Content",
            description: "Free posts seen by your existing followers. Limited reach — platforms show organic posts to only 2-5% of your followers (they want you to pay!).",
            tag: "Free but limited reach",
            tagColor: "green",
          },
          {
            icon: "\ud83d\udcb5",
            title: "Paid Advertising",
            description: "You pay to show content to specific audiences. Much wider reach — you choose who sees it by age, location, interests, behaviour. Scales infinitely with budget.",
            tag: "Costs money but massive reach",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "image",
        src: "/images/m3/advertising.webp",
        description: "Funnel diagram: Paid ad shown to targeted audience \u2192 Users click \u2192 Land on website \u2192 Some convert to customers — with $ amount at each stage",
      },
      {
        type: "text",
        html: `<strong>Common ad formats across platforms:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\uddbc\ufe0f",
            title: "Image Ads",
            description: "Single photo with text and CTA button. Simple, effective, works everywhere.",
          },
          {
            icon: "\ud83c\udfa5",
            title: "Video Ads",
            description: "Short videos (15-60 seconds). Higher engagement than images. Autoplay in feeds.",
          },
          {
            icon: "\ud83c\udfa0",
            title: "Carousel Ads",
            description: "Multiple swipeable images/videos in one ad. Great for showing product features or collections.",
          },
          {
            icon: "\ud83d\udcf1",
            title: "Story Ads",
            description: "Full-screen vertical ads between Stories. Immersive, disappear in 24 hours. Huge on Instagram and Facebook.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Targeting options — the real power of social ads:</strong>`,
      },
      {
        type: "table",
        headers: ["Targeting Type", "What It Does", "Example"],
        rows: [
          { cells: ["Demographics", "Target by age, gender, location, language", "Women aged 18-25 in Mumbai"] },
          { cells: ["Interests", "Target by hobbies and interests", "People interested in fitness and yoga"] },
          { cells: ["Behaviour", "Target by purchase behaviour and device usage", "People who recently shopped online"] },
          { cells: ["Lookalike Audiences", "Find new people similar to your existing customers", "People who behave like your top 1,000 buyers"] },
          { cells: ["Retargeting", "Show ads to people who already visited your website", "Someone who added to cart but didn't buy"] },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>A/B Testing (Split Testing):</strong> Run two versions of the same ad with ONE difference (different image, different headline). See which one performs better. Keep the winner, drop the loser. Never guess — test everything. This is how professionals optimise ads.`,
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>Budget basics:</strong> You can start with as little as $1/day on most platforms. You set a daily or total budget, and the platform stops showing ads when the budget runs out. No surprise bills. Common pricing models: <mark>CPC (Cost Per Click)</mark> — pay only when someone clicks. <mark>CPM (Cost Per Thousand Impressions)</mark> — pay per 1,000 views.`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "Facebook Marketing",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `With nearly 3 billion monthly users, Facebook is the world's largest social network. Love it or hate it, ignoring Facebook for marketing is like ignoring a stadium full of potential customers. <strong>It's the most complete marketing platform ever built</strong> — pages, groups, ads, marketplace, events, and messenger all in one place.`,
    content: [
      {
        type: "text",
        html: `Facebook isn't just for sharing holiday photos anymore. For businesses, it's a <mark>full marketing ecosystem</mark> with tools for awareness, engagement, sales, and customer service.`,
      },
      {
        type: "image",
        src: "/images/m3/facebook-marketing.webp",
        description: "Facebook marketing ecosystem: Business Page at centre \u2192 connected to Ads Manager, Groups, Marketplace, Events, Messenger, Insights — all labeled",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udfe2",
            title: "Business Pages",
            description: "Your brand's official Facebook presence. Like a free website inside Facebook. Post updates, share hours, collect reviews, chat with customers via Messenger.",
            tag: "Your digital storefront",
          },
          {
            icon: "\ud83d\udcb0",
            title: "Facebook Ads Manager",
            description: "The command centre for all paid ads. Set budgets, choose audiences, pick ad formats, track performance — all in one dashboard. Powers ads on Facebook AND Instagram.",
            tag: "Campaign control centre",
          },
          {
            icon: "\ud83c\udfaf",
            title: "Audience Targeting",
            description: "Facebook knows users' age, location, interests, job, relationship status, purchase behaviour. Advertisers use this to target with surgical precision.",
            tag: "Most detailed targeting ever",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Key Facebook marketing features:</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Boosted Posts \ud83d\ude80",
            description: "Take any regular post and pay to show it to more people. Simplest form of Facebook advertising. Pick audience, budget, duration — done. Great for beginners.",
          },
          {
            title: "Facebook Groups \ud83d\udc65",
            description: "Community spaces around shared interests. Brands create groups to build loyal communities. Members discuss, share tips, and help each other. Organic engagement gold.",
          },
          {
            title: "Facebook Marketplace \ud83d\udecd\ufe0f",
            description: "Buy and sell locally. Like a digital classifieds board. Businesses list products, users browse nearby deals. Huge for local businesses and e-commerce.",
          },
          {
            title: "Facebook Insights \ud83d\udcca",
            description: "Built-in analytics showing page performance, post reach, audience demographics, best posting times. Data-driven decisions for your Facebook strategy.",
          },
        ],
      },
      {
        type: "table",
        headers: ["Feature", "Cost", "Best For", "Difficulty"],
        rows: [
          { cells: ["Business Page", "Free", "Brand presence, credibility", "Easy"] },
          { cells: ["Boosted Post", "$5\u2013$100+", "Quick reach boost", "Very easy"] },
          { cells: ["Ads Manager Campaign", "$10\u2013$10,000+", "Targeted conversions, leads, sales", "Intermediate"] },
          { cells: ["Facebook Groups", "Free", "Community building, loyalty", "Easy"] },
          { cells: ["Marketplace", "Free (small fee for shipping)", "Local sales, product listings", "Easy"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Facebook Pixel:</strong> A tiny piece of code you add to your website. It tracks what visitors do after clicking your Facebook ad — did they buy? Add to cart? Sign up? This data makes your future ads smarter because Facebook learns who converts and finds more people like them.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Remember:</strong> Facebook Ads Manager controls ads for BOTH Facebook and Instagram (Meta owns both). One dashboard, two giant platforms. That's why it's the most powerful social ad tool in the world.`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "Twitter/X Marketing",
    time: "~5 mins",
    badges: [],
    hook: `Twitter (now X) is the world's town square. It's where news breaks, opinions clash, brands go viral, and one badly-worded tweet can destroy a company overnight. <strong>280 characters. That's all you get.</strong> The constraint is what makes it powerful — every word has to count.`,
    content: [
      {
        type: "analogy",
        label: "\ud83d\udce3 The Town Square Analogy",
        html: `Twitter is the internet's <strong>public town square</strong>. Everyone can hear everyone. A small shop owner can reply directly to a global CEO. A student's thread can outperform a news network. There are no walls between people — just conversations. That's terrifying AND incredible for marketing.`,
      },
      {
        type: "image",
        src: "/images/m3/twitter-marketing.webp",
        description: "Twitter marketing toolkit: Tweet at centre \u2192 connected to Hashtags, Threads, Polls, Twitter Ads, Trending Topics, Retweets — all labeled",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcdd",
            title: "Tweets",
            description: "Short posts up to 280 characters. Can include images, videos, GIFs, polls, and links. The atomic unit of Twitter. Brevity is the soul of engagement.",
            tag: "280 characters max",
          },
          {
            icon: "#\ufe0f\u20e3",
            title: "Hashtags",
            description: "Words prefixed with # that categorise content. #Marketing, #MondayMotivation. Makes your tweet discoverable by people searching that topic.",
            tag: "Discovery engine",
          },
          {
            icon: "\ud83d\udcc8",
            title: "Trending Topics",
            description: "Most talked-about subjects right now. Brands jump on relevant trends for massive visibility. Called 'newsjacking' — riding the wave of what's already hot.",
            tag: "Real-time relevance",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Twitter marketing strategies that work:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83e\uddf5",
            title: "Threads",
            description: "Chain of connected tweets telling a longer story. Threads get massive engagement because each tweet is a hook. Educational threads and storytelling threads go viral regularly.",
            tag: "Long-form on short-form platform",
          },
          {
            icon: "\ud83d\udcac",
            title: "Engagement Strategy",
            description: "Reply to followers, quote-tweet with commentary, participate in conversations. Twitter rewards brands that act like humans, not corporations. Personality wins.",
            tag: "Be human, not corporate",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Twitter Ads — paid options:</strong>`,
      },
      {
        type: "table",
        headers: ["Ad Type", "What It Does", "Best For"],
        rows: [
          { cells: ["Promoted Tweets", "Your tweet shown to targeted users beyond followers", "Driving engagement and website visits"] },
          { cells: ["Promoted Accounts", "Your profile suggested to targeted users as 'Who to Follow'", "Growing your follower base"] },
          { cells: ["Promoted Trends", "Your hashtag appears at the top of Trending Topics", "Massive brand awareness (expensive!)"] },
          { cells: ["Twitter Cards", "Rich media preview with image, title, CTA when sharing links", "Driving clicks to your website"] },
        ],
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>Real-world example:</strong> Wendy's became legendary on Twitter by roasting competitors and replying with witty comebacks. Their follower count exploded. Cost? $0 in ad spend — just a social media manager with permission to be funny. <mark>On Twitter, personality > budget.</mark>`,
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u26a0\ufe0f Warning:</strong> Twitter is also where brand crises happen fastest. A tone-deaf tweet during a tragedy, a typo that changes meaning, a reply to the wrong account — all public, all permanent (even if deleted, screenshots live forever). Always think twice before posting.`,
      },
    ],
  },
];
