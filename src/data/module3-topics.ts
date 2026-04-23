import type { Topic } from "./module1-topics";

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "Introduction to Social Media",
    time: "~5 mins",
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
        type: "text",
        html: `<strong>You already do these every day \u2014 this IS social media:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcf8",
            title: "Posting a Story",
            description: "You snap a photo of your lunch at a Tashkent cafe and add it to your Instagram Story for 24 hours. Friends tap the emoji reply \u2014 that is two-way social media.",
            tag: "Instagram Story",
          },
          {
            icon: "\ud83c\udfb5",
            title: "Scrolling TikTok",
            description: "You watch 20 short videos in a row. You like one, share one with a classmate, and follow the creator. Every tap teaches TikTok what to show you next.",
            tag: "TikTok For You",
          },
          {
            icon: "\ud83d\udcac",
            title: "Replying in Telegram",
            description: "Your class group on Telegram has 40 students. You send a question about homework, three friends reply, and someone drops a voice note. That is social media too.",
            tag: "Telegram group",
          },
          {
            icon: "\ud83d\udc4d",
            title: "Commenting on YouTube",
            description: "You watch an Uzbek singer's new clip and leave a comment. Other fans reply. The creator hearts your comment. The video is a post, the comments are the conversation.",
            tag: "YouTube comments",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Why do people and small shops care about social media?</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udc65",
            title: "Everyone is already there",
            description: "Most young people in Tashkent check Instagram, TikTok, or Telegram many times a day. If your cafe is not on one of them, new customers can't find you.",
            tag: "That is where attention lives",
          },
          {
            icon: "\ud83d\udcb0",
            title: "It is almost free",
            description: "A Chorsu samsa shop can post a fresh photo every morning for zero som. Before social media, a newspaper ad cost a lot of money that small shops did not have.",
            tag: "Cheap for small shops",
          },
          {
            icon: "\ud83d\udde3\ufe0f",
            title: "Customers talk back",
            description: "People leave comments like \"tasty!\" or \"too salty.\" The shop hears real feedback the same day \u2014 and can fix problems fast.",
            tag: "Instant feedback",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Good things about social media:</strong> \u2705 You can find friends in other cities and countries \u00b7 \u2705 You can learn new things for free (cooking, languages, how to fix your phone) \u00b7 \u2705 Small shops in Tashkent can reach customers with just a phone \u00b7 \u2705 News travels in minutes, not days.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Not everything you see is true \u2014 people can lie online \u00b7 \u26a0\ufe0f Apps are designed to keep you scrolling \u2014 two hours can feel like ten minutes \u00b7 \u26a0\ufe0f What you post stays on the internet, even if you delete it.`,
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
    time: "~6 mins",
    badges: [],
    hook: `Instagram, TikTok, YouTube, Telegram, LinkedIn \u2014 they all have posts and followers, but they feel totally different. <strong>Each app is built for a different kind of content and a different kind of person.</strong>`,
    content: [
      {
        type: "text",
        html: `Not every social media app is the same. Some are for <mark>photos</mark>, some for <mark>short video</mark>, some for <mark>long video</mark>, some for <mark>group chat</mark>, and some for <mark>jobs</mark>. You already use several of them without thinking about the difference.`,
      },
      {
        type: "image",
        src: "/images/m3/platforms.webp",
        description: "Grid showing logos of Instagram, TikTok, YouTube, Telegram, Facebook, LinkedIn \u2014 each with a one-word label for what it is best at",
      },
      {
        type: "analogy",
        label: "\ud83c\udfeb Different classrooms for different subjects",
        html: `At school you have a maths room, an art room, a gym, and a music room. Each room is set up for one job \u2014 you do not learn football in the music room. <strong>Social media apps are the same.</strong> Instagram is the art room (photos). TikTok is the dance studio (short video). LinkedIn is the career office (jobs). You pick the right room for the right task.`,
      },
      {
        type: "text",
        html: `<strong>The apps you know \u2014 what each one is really for:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcf8",
            title: "Instagram",
            description: "Photos, Reels (short videos), Stories that disappear after a day. Popular for food, fashion, travel, and pretty Tashkent cafe shots. Age: mostly teens and young adults.",
            tag: "Photos \u00b7 Reels \u00b7 Stories",
            tagColor: "purple",
          },
          {
            icon: "\ud83c\udfb5",
            title: "TikTok",
            description: "Short vertical videos (15\u201360 seconds). The \"For You\" page shows videos even from people you don't follow, if the app thinks you'll like them.",
            tag: "Short video \u00b7 For You",
            tagColor: "pink",
          },
          {
            icon: "\ud83c\udfa5",
            title: "YouTube",
            description: "Longer videos, from 5-minute tutorials to 2-hour shows. Good for learning \u2014 maths tricks, guitar lessons, English speaking. Also has YouTube Shorts (like TikTok).",
            tag: "Long video \u00b7 Learning",
            tagColor: "red",
          },
          {
            icon: "\ud83d\udcac",
            title: "Telegram",
            description: "The #1 app in Uzbekistan for group chat and news channels. @uzinfocom and most Tashkent news sites post here. Private chats, big groups, file sharing.",
            tag: "Chat \u00b7 Channels \u00b7 Groups",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udc65",
            title: "Facebook",
            description: "Mostly used by parents and older adults in Uzbekistan. Good for family updates, local event pages, and small Marketplace buying/selling.",
            tag: "Older users \u00b7 Groups",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udcbc",
            title: "LinkedIn",
            description: "A professional app \u2014 like an online CV. Used to find internships and first jobs after university. No party photos, no memes.",
            tag: "Jobs \u00b7 CV \u00b7 Professional",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How does an app decide what you see?</strong> Every app has an <mark>algorithm</mark> \u2014 a set of rules that picks which posts to show. The rules roughly say: \"Show the user more of what they already like, watch, and share.\" That is why your TikTok \"For You\" page feels so personal after a few days.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udc41\ufe0f",
            title: "What the app watches",
            description: "Videos you finish, posts you like, accounts you follow, hashtags you tap, how long you stop on one video. Every action teaches it your taste.",
            tag: "Your quiet signals",
          },
          {
            icon: "\ud83c\udfaf",
            title: "What the app shows back",
            description: "More of the same type. Watch three football videos in a row and your feed fills with football. Watch cooking videos and cooking takes over.",
            tag: "More of what you watched",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Quick match (Tashkent examples):</strong> \u2705 Photo of your cafe's new dessert \u2192 Instagram \u00b7 \u2705 Funny 20-second dance with friends \u2192 TikTok \u00b7 \u2705 15-minute \"How I study for IELTS\" \u2192 YouTube \u00b7 \u2705 News for your class \u2192 Telegram channel \u00b7 \u2705 Your CV and internship search \u2192 LinkedIn.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f The same post does NOT work everywhere \u2014 a LinkedIn post on TikTok looks boring, a TikTok dance on LinkedIn looks unprofessional \u00b7 \u26a0\ufe0f The algorithm can trap you in one topic (only football, only drama) \u2014 like new things on purpose to widen your feed.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Imagine your family opens a small bakery near your school. Which TWO apps would you use to tell the neighbourhood about it, and why those two and not the others?`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "Social Media Management Tools",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Big shops post on Instagram, TikTok, Telegram, and Facebook \u2014 every day, at the right times, with nice pictures. <strong>Nobody sits on the phone 24/7 to do that. They use helper apps.</strong>`,
    content: [
      {
        type: "text",
        html: `A <strong>social media management tool</strong> is an app that helps people post and reply faster. Instead of opening Instagram, then TikTok, then Telegram one by one, you <mark>write everything in one place and the tool posts it for you</mark>. Big shops use them, but so can a student with one Instagram page.`,
      },
      {
        type: "image",
        src: "/images/m3/management-tools.webp",
        description: "One dashboard on a laptop connected by arrows to Instagram, TikTok, Telegram, and Facebook \u2014 showing a calendar of future posts",
      },
      {
        type: "analogy",
        label: "\ud83c\udf73 A kitchen helper who does the boring jobs",
        html: `Imagine a small cafe with only one cook. If the cook also washes dishes, serves tables, and takes orders, the food is slow. <strong>A helper who chops vegetables and washes plates in the background</strong> frees the cook to do the interesting work \u2014 cooking. Management tools do the same for social media: they handle the boring jobs so you focus on the creative ones.`,
      },
      {
        type: "text",
        html: `<strong>Three main things these tools do:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcc5",
            title: "Schedule posts",
            description: "Write 7 posts on Sunday, pick the time for each, and the tool posts them through the week automatically \u2014 even at 9 p.m. when you are doing homework.",
            tag: "Post while you sleep",
          },
          {
            icon: "\ud83d\udce8",
            title: "See all messages in one place",
            description: "Instead of jumping between 3 apps, you see every DM, comment, and reply in one inbox. Reply to customers faster, don't miss any question.",
            tag: "One inbox for all apps",
          },
          {
            icon: "\ud83d\udcca",
            title: "Show simple numbers",
            description: "Which post got the most likes? When are your followers online? The tool draws a chart so you don't have to guess.",
            tag: "Simple charts",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Popular tools you might hear about:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcc6",
            title: "Buffer, Later, Metricool",
            description: "All three can schedule your Instagram, TikTok, and Facebook posts in advance. They have free plans that are enough for a student or a one-person shop.",
            tag: "Scheduling helpers",
            tagColor: "blue",
          },
          {
            icon: "\ud83c\udfa8",
            title: "Canva",
            description: "Not a scheduler \u2014 it is a design helper. Pick a ready template, drop your photo in, change the words. You get a good-looking post in 5 minutes, no design class needed.",
            tag: "Design templates",
            tagColor: "purple",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Real Tashkent example:</strong> A student runs a small thrift-clothing Instagram page. On Sunday evening she designs 5 posts in Canva, writes the captions, and uses Buffer's free plan to schedule one post per weekday at 7 p.m. The whole week is done in 90 minutes. She uses the saved time for school.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Scheduling does not mean \"ignore your followers\" \u2014 you still have to reply to comments and DMs \u00b7 \u26a0\ufe0f Free plans have limits (usually 10\u201330 posts a month) \u2014 enough for small pages, not enough for big shops \u00b7 \u26a0\ufe0f Not every tool supports every app \u2014 check before you sign up.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> You help your older cousin run an Instagram page for her Tashkent nail salon. She posts whenever she remembers \u2014 sometimes three times in one day, sometimes nothing for two weeks. Which ONE thing would change if she used a scheduling tool?`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "Social Media Measurement & Reporting",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You post a photo and get 200 likes. Is that good or bad? <strong>Without numbers, you are only guessing.</strong> Every app gives you free numbers \u2014 you just have to know which ones matter.`,
    content: [
      {
        type: "text",
        html: `Every social media app has a <strong>free tool</strong> that shows you <mark>how your posts are doing</mark>. On Instagram it is called \"Insights,\" on TikTok \"Analytics,\" on YouTube \"Studio.\" They all answer the same questions: How many people saw my post? How many liked it? When are my followers online?`,
      },
      {
        type: "image",
        src: "/images/m3/analytics.webp",
        description: "Phone screen showing Instagram Insights: \"Reached 1,240 people, 180 likes, 24 comments, 12 shares\" with a small chart",
      },
      {
        type: "analogy",
        label: "\ud83c\udfc0 Like a school report card",
        html: `At the end of the term you get a report with your marks in each subject. You can see where you did well and where to try harder next time. <strong>Social media numbers are the same \u2014 a report card for your posts.</strong> You learn which posts your friends loved, which they scrolled past, and what to do next time.`,
      },
      {
        type: "text",
        html: `<strong>The main numbers you'll see \u2014 in plain English:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udc41\ufe0f",
            title: "Reach",
            description: "How many DIFFERENT people saw your post. If 500 people saw it, reach is 500 \u2014 even if your best friend looked three times, she still counts once.",
            tag: "How many people saw it",
          },
          {
            icon: "\u2764\ufe0f",
            title: "Likes",
            description: "How many people tapped the heart. Easy to collect, but also the weakest sign \u2014 people tap fast without reading.",
            tag: "Taps on the heart",
          },
          {
            icon: "\ud83d\udcac",
            title: "Comments",
            description: "People wrote you something. Worth more than a like \u2014 comments take real effort, so each one means the post actually made someone stop and think.",
            tag: "Real effort",
          },
          {
            icon: "\u2197\ufe0f",
            title: "Shares",
            description: "People sent your post to friends or reposted it. The strongest sign \u2014 it means the post was so good someone wanted their friends to see it too.",
            tag: "Friends telling friends",
            tagColor: "green",
          },
          {
            icon: "\ud83d\udd16",
            title: "Saves",
            description: "People bookmarked your post to come back later. Common for recipes, study tips, and shopping lists. Saves are a secret sign of \"this was useful.\"",
            tag: "Bookmark for later",
            tagColor: "blue",
          },
          {
            icon: "\ud83d\udc65",
            title: "Follower growth",
            description: "How many new followers you got this week minus how many left. Slow and steady is healthy \u2014 giant jumps usually mean one post went viral by luck.",
            tag: "New followers over time",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>What do the numbers actually tell you?</strong> You compare this week to last week. If reach is going up \u2014 more people are finding you. If comments go up \u2014 your posts are starting a real conversation. If saves go up \u2014 people find your posts useful enough to keep.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>A small example:</strong> A Tashkent student's baking Instagram has 1,000 followers. Post A got 300 likes, 3 comments. Post B got 150 likes, 80 comments and 40 saves. Which is the better post? Post B \u2014 fewer likes but many saves means real people are keeping the recipe.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f Follower count alone is a weak number \u2014 10,000 fake or silent followers are worth less than 500 real friends \u00b7 \u26a0\ufe0f Don't check numbers every 5 minutes \u2014 once a week is enough \u00b7 \u26a0\ufe0f One bad week does not mean your page is broken \u2014 look at the whole month.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Your friend's Instagram page has 5,000 followers, but every post gets only 20 likes and zero comments. Your page has 300 followers and every post gets 60 likes and 10 comments. Whose page is healthier, and why?`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "Social Advertising",
    time: "~5 mins",
    badges: [{ text: "Exam favourite", type: "star" }],
    hook: `You scroll Instagram and see a post from a shop you've never followed. Why is it there? <strong>Someone paid the app to show it to you.</strong> That is social advertising \u2014 shops paying to reach new people.`,
    content: [
      {
        type: "text",
        html: `A <strong>social media ad</strong> is just a normal post \u2014 except the shop <mark>paid the app to show it to people who don't follow them yet</mark>. You can tell it is an ad because it has a small \"Sponsored\" label under the name. Apps like Instagram, TikTok, and Facebook earn most of their money from these ads.`,
      },
      {
        type: "image",
        src: "/images/m3/advertising.webp",
        description: "Two phone screens side-by-side: one showing a normal friend's post, one showing a post with \"Sponsored\" label \u2014 both look similar",
      },
      {
        type: "analogy",
        label: "\ud83d\udccc Flyer on the classroom board vs a flyer only YOU get",
        html: `Imagine a school flyer pinned on the classroom board \u2014 every student walks past it, even ones who don't care. <strong>A social media ad is smarter</strong>: the shop says \"only show this flyer to 17-year-olds in Tashkent who like basketball.\" You get it, the girl next to you does not. The app knows enough to pick the right people.`,
      },
      {
        type: "text",
        html: `<strong>Free post vs paid post \u2014 what's the difference?</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83c\udf31",
            title: "Free post (\"organic\")",
            description: "You post normally. Only your followers \u2014 and maybe a few friends-of-friends \u2014 see it. No money spent, but reach is small, especially for new pages.",
            tag: "Free \u00b7 small reach",
            tagColor: "green",
          },
          {
            icon: "\ud83d\udcb5",
            title: "Paid post (ad)",
            description: "The shop pays the app. Now the post is shown to many more people, even people who never heard of the shop. The shop picks who sees it.",
            tag: "Costs money \u00b7 big reach",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How does the shop choose who sees the ad?</strong> When the shop pays, it picks simple filters: <mark>age, city, interests.</mark>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udf82",
            title: "Age",
            description: "\"Only show this to people aged 16 to 25.\" A cafe with student prices does not want to pay to reach 60-year-olds.",
            tag: "Pick an age range",
          },
          {
            icon: "\ud83d\udccd",
            title: "City",
            description: "\"Only show this to people in Tashkent.\" A Chorsu bakery does not need to pay to reach someone in London \u2014 they can't come buy samsa anyway.",
            tag: "Pick a place",
          },
          {
            icon: "\ud83c\udfae",
            title: "Interests",
            description: "\"Only show this to people who like football / K-pop / makeup.\" The app already knows what you tap, so it can match.",
            tag: "Pick a hobby",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>You see these ads every single day \u2014 now you'll spot them:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcf8",
            title: "Instagram \"Sponsored\"",
            description: "A clothing shop's post in your feed, with a small \"Sponsored\" label under the name. Looks like a normal post, but the shop paid to reach you.",
          },
          {
            icon: "\ud83c\udfb5",
            title: "TikTok ad clips",
            description: "Short videos with \"Sponsored\" or \"Ad\" on your For You page. Often for games, phone apps, or online shops like Uzum.",
          },
          {
            icon: "\u25b6\ufe0f",
            title: "YouTube \"Skip Ad\"",
            description: "The 5\u201315 seconds before your video starts. Companies pay YouTube every time one is watched. That's why you can skip most of them.",
          },
          {
            icon: "\ud83d\udcac",
            title: "Story ads",
            description: "A big full-screen ad between your friends' Stories on Instagram. Hard to ignore \u2014 that's why shops like them.",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>How much does it cost?</strong> Ads can start very small \u2014 even 10,000\u201330,000 som a day for a Tashkent shop. The shop sets a daily budget, and once the budget is used up the app stops showing the ad. No surprise bills at the end of the month.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Watch out:</strong> \u26a0\ufe0f A paid ad doesn't make a bad product good \u2014 if the photo is ugly or the cafe is dirty, paying more money won't fix it \u00b7 \u26a0\ufe0f Some ads online are scams (\"free iPhone!\") \u2014 if it sounds too good to be true, it usually is \u00b7 \u26a0\ufe0f You are the target. Don't feel bad if you've bought something from an ad \u2014 they are designed to work.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Next time you open Instagram or TikTok, count how many \"Sponsored\" posts you see in the first 20 posts. Why do you think the app showed YOU that specific product and not something random?`,
      },
    ],
  },

];
