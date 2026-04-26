import type { Topic } from "./module1-topics";

// Module 3 — Social Media (rewritten Apr 24 2026 for self-study)
//
// Teacher: "I haven't taught Module 3. Refocus on the basics + the
// LinkedIn-for-career angle. Make it easy for school students."
//
// 6 topics, each ~3 min read with 5 MCQs:
//   1. What is Social Media?
//   2. Advantages of Social Media
//   3. Disadvantages of Social Media
//   4. What is LinkedIn?
//   5. LinkedIn vs Instagram
//   6. Why YOU should focus on LinkedIn for career growth
//
// Pattern matches the Module 1 Topic 2 redesign:
//   · Hero: vivid SVG or existing image
//   · Lead text: short definition
//   · 2 + 2 cards (mini-lessons — Lead → Story → Quick facts → Why it matters)
//   · "Memorise this" blue callout — the one sentence that rebuilds the topic
//   · Purple Think Deeper callout — active recall prompt
//
// Topics 4-6 build the LinkedIn case progressively. Topic 6 is the
// "do this now" capstone — students leave with a clear next step
// (set up your LinkedIn TODAY, not after graduation).

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "What is Social Media?",
    time: "~3 mins",
    badges: [{ text: "Foundation", type: "star" }],
    hook: `You scroll Instagram, watch TikTok, and chat on Telegram every single day. <strong>That IS social media — apps where you can post, reply, and share, all at the same time.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>Social media</strong> is any app or website where <mark>users post their own content AND others can reply, comment, or share</mark>. It's <strong>two-way</strong> — unlike old TV, which only talks at you. Anyone with a phone can post a photo, drop a comment, send a message. That's the big change.`,
      },
      {
        // Hero replaced (Apr 27 2026): the old social-media.webp was a
        // generic AI-generated icon grid (network wheels, charts, people
        // groups) with zero connection to the lesson content. Teacher
        // flagged it as off-theme. Inline SVG below tells the actual
        // story: a phone in the centre, six real social apps orbiting,
        // two-way arrows between every app and the user — exactly what
        // makes social media "two-way" vs old TV. Same visual language
        // as the Topic-3 hero (PR #165) so the module reads as one set.
        type: "text",
        html: `<div style="background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(59,130,246,0.06));border:1px solid rgba(99,102,241,0.18);border-radius:14px;padding:24px 20px;margin:8px 0;overflow-x:auto"><svg viewBox="0 0 720 280" style="width:100%;height:auto;min-width:560px;display:block" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A user at the centre with two-way arrows to Instagram, TikTok, Telegram, YouTube, Facebook, and X — showing how social media is a conversation, not a broadcast"><defs><radialGradient id="t1glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(99,102,241,0.35)"/><stop offset="1" stop-color="rgba(99,102,241,0)"/></radialGradient></defs><text x="360" y="22" text-anchor="middle" fill="#71717A" font-size="11" font-family="system-ui" font-weight="700" letter-spacing="3">SOCIAL MEDIA · TWO-WAY</text><circle cx="360" cy="150" r="80" fill="url(#t1glow)"/><g transform="translate(360,150)"><circle r="38" fill="rgba(99,102,241,0.15)" stroke="#818CF8" stroke-width="2"/><text y="6" text-anchor="middle" font-size="34">🧑</text><text y="56" text-anchor="middle" fill="#A5B4FC" font-size="11" font-family="system-ui" font-weight="700" letter-spacing="2">YOU</text></g><g transform="translate(110,80)"><circle r="28" fill="rgba(236,72,153,0.12)" stroke="#EC4899" stroke-width="1.8"/><text y="5" text-anchor="middle" font-size="22">📷</text><text y="48" text-anchor="middle" fill="#F472B6" font-size="10" font-family="system-ui" font-weight="700">INSTAGRAM</text></g><g transform="translate(110,220)"><circle r="28" fill="rgba(20,184,166,0.12)" stroke="#14B8A6" stroke-width="1.8"/><text y="5" text-anchor="middle" font-size="22">🎵</text><text y="48" text-anchor="middle" fill="#5EEAD4" font-size="10" font-family="system-ui" font-weight="700">TIKTOK</text></g><g transform="translate(360,40)"><circle r="28" fill="rgba(56,189,248,0.12)" stroke="#38BDF8" stroke-width="1.8"/><text y="5" text-anchor="middle" font-size="22">✈️</text><text y="48" text-anchor="middle" fill="#7DD3FC" font-size="10" font-family="system-ui" font-weight="700">TELEGRAM</text></g><g transform="translate(610,80)"><circle r="28" fill="rgba(239,68,68,0.12)" stroke="#EF4444" stroke-width="1.8"/><text y="5" text-anchor="middle" font-size="22">▶️</text><text y="48" text-anchor="middle" fill="#FCA5A5" font-size="10" font-family="system-ui" font-weight="700">YOUTUBE</text></g><g transform="translate(610,220)"><circle r="28" fill="rgba(37,99,235,0.12)" stroke="#2563EB" stroke-width="1.8"/><text y="5" text-anchor="middle" font-size="22">f</text><text y="48" text-anchor="middle" fill="#93C5FD" font-size="10" font-family="system-ui" font-weight="700">FACEBOOK</text></g><g transform="translate(360,260)"><circle r="28" fill="rgba(161,161,170,0.12)" stroke="#A1A1AA" stroke-width="1.8"/><text y="5" text-anchor="middle" font-size="22">𝕏</text><text y="-38" text-anchor="middle" fill="#D4D4D8" font-size="10" font-family="system-ui" font-weight="700">X</text></g><g fill="none" stroke-width="1.4" opacity="0.55"><defs><marker id="t1arrowR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#818CF8"/></marker></defs><path d="M 138 95 Q 240 110 322 135" stroke="#EC4899" stroke-dasharray="4 3" marker-end="url(#t1arrowR)"/><path d="M 322 165 Q 240 185 138 205" stroke="#EC4899" stroke-dasharray="4 3" marker-end="url(#t1arrowR)"/><path d="M 138 235 Q 240 215 322 175" stroke="#14B8A6" stroke-dasharray="4 3" marker-end="url(#t1arrowR)"/><path d="M 322 145 Q 240 165 138 230" stroke="#14B8A6" stroke-dasharray="4 3" marker-end="url(#t1arrowR)"/><path d="M 360 70 L 360 115" stroke="#38BDF8" stroke-dasharray="4 3" marker-end="url(#t1arrowR)"/><path d="M 350 115 L 350 70" stroke="#38BDF8" stroke-dasharray="4 3" marker-end="url(#t1arrowR)"/><path d="M 582 95 Q 480 110 398 135" stroke="#EF4444" stroke-dasharray="4 3" marker-end="url(#t1arrowR)"/><path d="M 398 165 Q 480 185 582 205" stroke="#2563EB" stroke-dasharray="4 3" marker-end="url(#t1arrowR)"/><path d="M 360 232 L 360 188" stroke="#A1A1AA" stroke-dasharray="4 3" marker-end="url(#t1arrowR)"/></g></svg></div>`,
      },
      {
        type: "analogy",
        label: "📺 Old TV vs a group chat",
        html: `Old TV is like a teacher who just talks — nobody can reply. <strong>Social media is like a giant group chat:</strong> everyone can post, reply, share photos, and react with emojis. Sometimes the whole school joins. Sometimes only your best friends do.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "📸",
            title: "Instagram",
            description: "<strong>Photos, Reels, Stories.</strong> Most popular with teens and young adults. Great for food, fashion, and travel pictures.<br><br>▸ <strong>Owned by:</strong> Meta<br>▸ <strong>Famous for:</strong> the For You feed, Stories that disappear after 24h<br>▸ <strong>Daily users:</strong> 2 billion+ worldwide",
            tag: "Photos · Reels",
            tagColor: "purple",
          },
          {
            icon: "🎵",
            title: "TikTok",
            description: "<strong>Short vertical videos</strong> (15–60 seconds). The 'For You' page learns what you watch and shows you more of the same. Crazy addictive — by design.<br><br>▸ <strong>Famous for:</strong> dance trends, life hacks, viral sounds<br>▸ <strong>Daily users:</strong> 1 billion+",
            tag: "Short videos",
            tagColor: "pink",
          },
        ],
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "💬",
            title: "Telegram",
            description: "<strong>Uzbekistan's #1 app.</strong> Chat with friends, join group chats, follow news channels (@gazeta_uz, your school's class group). Less photos, more conversation.<br><br>▸ <strong>Famous for:</strong> public channels with 100,000+ followers<br>▸ <strong>Why huge in UZ:</strong> works fast, no ads, files don't get blocked",
            tag: "Chat · Channels",
            tagColor: "blue",
          },
          {
            icon: "🎥",
            title: "YouTube",
            description: "<strong>Longer videos.</strong> 5-minute tutorials, 2-hour movie reviews, IELTS lessons, music. Great for learning anything for free.<br><br>▸ <strong>Famous for:</strong> the world's biggest free education library<br>▸ <strong>Daily users:</strong> 2.5 billion+",
            tag: "Long videos",
            tagColor: "red",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>📌 Memorise this:</strong> <mark>Social media = apps where users POST and others REPLY.</mark> Two-way, not one-way like TV. If only friends can see and react, it's social media.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>🤔 Think it through:</strong> Pick the last 3 apps you opened on your phone. Which let you POST something? Which let other people REPLY to you? Those are the social media apps.`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "Advantages of Social Media",
    time: "~3 mins",
    badges: [],
    hook: `Social media isn't just for fun. <strong>Used wisely, it's the most powerful free tool ever for connecting people, learning new things, doing business, and staying informed.</strong>`,
    content: [
      {
        type: "text",
        html: `Before social media, you needed <mark>money</mark> and <mark>connections</mark> to reach a big audience. TV ads cost millions. Newspapers had editors who picked who got published. Now? <strong>A 17-year-old in Tashkent with a phone can reach the whole world for free.</strong> That's the revolution.`,
      },
      {
        type: "text",
        html: `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px;margin:8px 0;overflow-x:auto"><svg viewBox="0 0 720 160" style="width:100%;height:auto;min-width:560px;display:block" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Four superpowers of social media: Connect, Learn, Sell, Inform"><text x="360" y="22" text-anchor="middle" fill="#71717A" font-size="11" font-family="system-ui" font-weight="700" letter-spacing="3">4 SUPERPOWERS · ALL FREE</text><g><circle cx="100" cy="80" r="38" fill="rgba(52,211,153,0.12)" stroke="#34D399" stroke-width="2"/><text x="100" y="92" text-anchor="middle" font-size="36">🤝</text><text x="100" y="138" text-anchor="middle" fill="#34D399" font-size="13" font-family="system-ui" font-weight="700">CONNECT</text></g><g><circle cx="280" cy="80" r="38" fill="rgba(96,165,250,0.12)" stroke="#60A5FA" stroke-width="2"/><text x="280" y="92" text-anchor="middle" font-size="36">📚</text><text x="280" y="138" text-anchor="middle" fill="#60A5FA" font-size="13" font-family="system-ui" font-weight="700">LEARN</text></g><g><circle cx="460" cy="80" r="38" fill="rgba(251,191,36,0.12)" stroke="#FBBF24" stroke-width="2"/><text x="460" y="92" text-anchor="middle" font-size="36">🏪</text><text x="460" y="138" text-anchor="middle" fill="#FBBF24" font-size="13" font-family="system-ui" font-weight="700">SELL</text></g><g><circle cx="640" cy="80" r="38" fill="rgba(167,139,250,0.12)" stroke="#A78BFA" stroke-width="2"/><text x="640" y="92" text-anchor="middle" font-size="36">📰</text><text x="640" y="138" text-anchor="middle" fill="#A78BFA" font-size="13" font-family="system-ui" font-weight="700">INFORM</text></g></svg></div>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "🤝",
            title: "Stay Connected",
            description: "<strong>Talk to anyone, anywhere — for free.</strong> Your cousin moved to Korea? Video-call her on WhatsApp. Old school friend in another city? DM them on Instagram. Distance no longer breaks relationships.<br><br>▸ <strong>What used to cost:</strong> long-distance calls were $1+/minute<br>▸ <strong>Now:</strong> free, instant, with photos and video<br>▸ <strong>Result:</strong> families and friendships survive across continents",
            tag: "Personal",
            tagColor: "green",
          },
          {
            icon: "📚",
            title: "Free Learning",
            description: "<strong>YouTube replaced expensive courses.</strong> Want to learn coding, English, guitar, makeup, cooking? It's all there for zero som. Top universities upload full lecture series.<br><br>▸ <strong>Examples:</strong> Khan Academy (math), freeCodeCamp (coding), 3Blue1Brown (any subject)<br>▸ <strong>Famous students:</strong> millions teach themselves IELTS, web dev, design — all from social media",
            tag: "Personal",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "🏪",
            title: "Small Business Power",
            description: "<strong>A samsa shop in Chorsu reaches 10,000 customers — for free.</strong> Before social media, only big companies with TV ad budgets could advertise. Now any small shop with a phone competes equally.<br><br>▸ <strong>Real Tashkent example:</strong> home bakers, tutors, and barbers run whole businesses on Instagram alone<br>▸ <strong>Cost:</strong> zero. Just post good photos and reply to messages",
            tag: "Business",
            tagColor: "purple",
          },
          {
            icon: "📰",
            title: "Fast Information",
            description: "<strong>News reaches you in seconds, not hours.</strong> Earthquake, cricket score, election result — Twitter and Telegram channels post first; TV and newspapers come hours later.<br><br>▸ <strong>How fast:</strong> often faster than the people who CAUSED the news to announce it<br>▸ <strong>Real impact:</strong> during emergencies, social media often saves lives by spreading instructions before any official channel can",
            tag: "World",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>📌 Memorise this:</strong> <mark>Connect · Learn · Sell · Inform</mark> — 4 superpowers for free. Your grandparents had to pay for any one of these. You get all 4 for the cost of a phone.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>🤔 Think it through:</strong> Name ONE skill you learned this year from a YouTube, Instagram, or TikTok video. That's social media's biggest advantage in your own life.`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "Disadvantages of Social Media",
    time: "~3 mins",
    badges: [],
    hook: `Social media is powerful — but <strong>it's designed to keep you scrolling</strong>. Apps make money when you waste time. Knowing the risks helps you stay in control instead of being controlled.`,
    content: [
      {
        type: "text",
        html: `Every social media app you use is run by a company that earns money from <strong>ads</strong>. The longer you stay, the more ads they show, the more they earn. So they hire psychologists to make the apps as <mark>addictive as possible</mark>. That's why "I'll just check for 5 minutes" turns into 2 hours.`,
      },
      {
        type: "text",
        html: `<div style="background:linear-gradient(135deg,rgba(248,113,113,0.06),rgba(167,139,250,0.06));border:1px solid rgba(248,113,113,0.18);border-radius:14px;padding:24px 20px;margin:8px 0;overflow-x:auto"><svg viewBox="0 0 720 280" style="width:100%;height:auto;min-width:560px;display:block" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The infinite scroll trap: phone shows endless feed while time, privacy, truth and mental wellbeing slip away"><defs><linearGradient id="t3phone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1F1F23"/><stop offset="1" stop-color="#0A0A0F"/></linearGradient><linearGradient id="t3screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F87171" stop-opacity="0.25"/><stop offset="0.5" stop-color="#FB923C" stop-opacity="0.18"/><stop offset="1" stop-color="#A78BFA" stop-opacity="0.25"/></linearGradient></defs><text x="360" y="22" text-anchor="middle" fill="#71717A" font-size="11" font-family="system-ui" font-weight="700" letter-spacing="3">⚠ THE INFINITE SCROLL TRAP</text><g transform="translate(290,42)"><rect x="0" y="0" width="140" height="220" rx="22" fill="url(#t3phone)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/><rect x="8" y="10" width="124" height="200" rx="14" fill="url(#t3screen)"/><rect x="55" y="14" width="30" height="4" rx="2" fill="rgba(0,0,0,0.5)"/><g opacity="0.85"><rect x="16" y="28" width="108" height="44" rx="6" fill="rgba(255,255,255,0.08)"/><circle cx="28" cy="40" r="6" fill="#F87171"/><rect x="40" y="36" width="50" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/><rect x="40" y="44" width="34" height="2.5" rx="1" fill="rgba(255,255,255,0.3)"/><rect x="16" y="56" width="108" height="12" rx="3" fill="rgba(255,255,255,0.05)"/></g><g opacity="0.7"><rect x="16" y="80" width="108" height="44" rx="6" fill="rgba(255,255,255,0.06)"/><circle cx="28" cy="92" r="6" fill="#FB923C"/><rect x="40" y="88" width="60" height="3" rx="1.5" fill="rgba(255,255,255,0.4)"/><rect x="40" y="96" width="40" height="2.5" rx="1" fill="rgba(255,255,255,0.25)"/></g><g opacity="0.45"><rect x="16" y="132" width="108" height="44" rx="6" fill="rgba(255,255,255,0.04)"/><circle cx="28" cy="144" r="6" fill="#A78BFA"/><rect x="40" y="140" width="56" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/><rect x="40" y="148" width="36" height="2.5" rx="1" fill="rgba(255,255,255,0.2)"/></g><g opacity="0.2"><rect x="16" y="184" width="108" height="22" rx="6" fill="rgba(255,255,255,0.03)"/></g><g transform="translate(70,196)"><circle r="13" fill="rgba(248,113,113,0.18)" stroke="#F87171" stroke-width="1.5"/><path d="M -4 -2 L 0 2 L 4 -2 M 0 2 L 0 -5" fill="none" stroke="#F87171" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><animateTransform attributeName="transform" type="translate" values="70,193; 70,199; 70,193" dur="1.6s" repeatCount="indefinite"/></g></g><g transform="translate(60,70)"><circle r="34" fill="rgba(248,113,113,0.10)" stroke="#F87171" stroke-width="2"/><text y="6" text-anchor="middle" font-size="28" font-family="system-ui" font-weight="700" fill="#F87171">⏳</text><text y="56" text-anchor="middle" fill="#F87171" font-size="12" font-family="system-ui" font-weight="700" letter-spacing="2">TIME</text><text y="72" text-anchor="middle" fill="#A1A1AA" font-size="9.5" font-family="system-ui">stolen</text></g><g transform="translate(60,180)"><circle r="34" fill="rgba(251,146,60,0.10)" stroke="#FB923C" stroke-width="2"/><text y="6" text-anchor="middle" font-size="26" font-family="system-ui" font-weight="700" fill="#FB923C">🤥</text><text y="56" text-anchor="middle" fill="#FB923C" font-size="12" font-family="system-ui" font-weight="700" letter-spacing="2">TRUTH</text><text y="72" text-anchor="middle" fill="#A1A1AA" font-size="9.5" font-family="system-ui">twisted</text></g><g transform="translate(660,70)"><circle r="34" fill="rgba(251,191,36,0.10)" stroke="#FBBF24" stroke-width="2"/><text y="6" text-anchor="middle" font-size="26" font-family="system-ui" font-weight="700" fill="#FBBF24">🔒</text><text y="56" text-anchor="middle" fill="#FBBF24" font-size="12" font-family="system-ui" font-weight="700" letter-spacing="2">PRIVACY</text><text y="72" text-anchor="middle" fill="#A1A1AA" font-size="9.5" font-family="system-ui">leaked</text></g><g transform="translate(660,180)"><circle r="34" fill="rgba(167,139,250,0.10)" stroke="#A78BFA" stroke-width="2"/><text y="6" text-anchor="middle" font-size="26" font-family="system-ui" font-weight="700" fill="#A78BFA">😔</text><text y="56" text-anchor="middle" fill="#A78BFA" font-size="12" font-family="system-ui" font-weight="700" letter-spacing="2">MIND</text><text y="72" text-anchor="middle" fill="#A1A1AA" font-size="9.5" font-family="system-ui">drained</text></g><g stroke-dasharray="3 4" stroke-width="1.3" fill="none" opacity="0.45"><path d="M 100 78 Q 200 110 290 130" stroke="#F87171"/><path d="M 100 188 Q 200 180 290 175" stroke="#FB923C"/><path d="M 620 78 Q 520 110 430 130" stroke="#FBBF24"/><path d="M 620 188 Q 520 180 430 175" stroke="#A78BFA"/></g></svg></div>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "⏳",
            title: "The Time Trap",
            description: "<strong>2 hours feels like 10 minutes.</strong> Apps autoplay videos, send notifications at the perfect moment, and design feeds that never end. There's no 'last page' on TikTok — by design.<br><br>▸ <strong>How to spot it:</strong> Settings → Screen Time. Most teens spend 4–6 hours/day<br>▸ <strong>The cost:</strong> homework slips, sleep shrinks, real-life friendships fade<br>▸ <strong>Smart move:</strong> set a daily timer (Instagram itself has one)",
            tag: "Risk",
            tagColor: "pink",
          },
          {
            icon: "🤥",
            title: "Fake News",
            description: "<strong>Anyone can post anything.</strong> No editor, no fact-checker. A photo of a 2010 earthquake gets shared as 'breaking news' today. Old screenshots circulate as fresh quotes.<br><br>▸ <strong>Why it spreads:</strong> shocking + emotional posts get shared faster than calm true ones<br>▸ <strong>Real example:</strong> election rumours, fake celebrity deaths, made-up health 'cures'<br>▸ <strong>Smart move:</strong> always check the source before sharing",
            tag: "Risk",
            tagColor: "pink",
          },
        ],
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "🔒",
            title: "Privacy Lost",
            description: "<strong>What you post stays online forever.</strong> Even if you delete a photo, screenshots may live somewhere. Future employers, universities, and dates will Google your name and find what you posted at 15.<br><br>▸ <strong>What gets remembered:</strong> screenshots, archive websites, friends' downloads<br>▸ <strong>Real impact:</strong> people lose jobs over old tweets they forgot they wrote<br>▸ <strong>Smart move:</strong> never post anything you wouldn't show your future boss",
            tag: "Risk",
            tagColor: "pink",
          },
          {
            icon: "😔",
            title: "Mental Health",
            description: "<strong>Comparison kills happiness.</strong> Everyone posts their best moments — birthday parties, vacations, A grades. Scrolling through this 100 times a day, your brain thinks 'why is my life so boring?'<br><br>▸ <strong>What's hidden:</strong> the stress, sad days, ordinary moments<br>▸ <strong>Cyberbullying:</strong> mean comments, exclusion from group chats<br>▸ <strong>Smart move:</strong> follow people who teach or inspire you, not perfect strangers",
            tag: "Risk",
            tagColor: "pink",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>📌 Memorise this:</strong> <mark>4 risks: Time · Truth · Privacy · Mind.</mark> Apps want your time. Posts can be lies. Privacy disappears. Comparison hurts. Be smart, not addicted.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>🤔 Think it through:</strong> Open your phone right now and check Settings → Screen Time. Look at Instagram or TikTok. Are you happy with the number? If not — set a daily timer for that app today.`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "What is LinkedIn?",
    time: "~3 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Instagram is for friends. TikTok is for fun. <strong>LinkedIn is where your future job is hiding.</strong> Recruiters from Google, Microsoft, and local Tashkent companies scroll LinkedIn every day looking for people exactly like you.`,
    content: [
      {
        type: "text",
        html: `<strong>LinkedIn</strong> is a social network — but instead of posting selfies and food photos, you post <mark>what you're learning, what you've built, and what you want to do for work</mark>. Everyone on LinkedIn is there for the same reason: <strong>find a job, find a teammate, find a mentor, find an internship</strong>. Think of it as your <strong>online CV that works 24/7</strong>.`,
      },
      {
        type: "image",
        src: "/images/m3/linkedin-profile.webp",
        description: "Anatomy of a great student LinkedIn profile — clear head-shot, headline mentioning skills (CS Student | Interested in AI & Web Development), Tashkent + Amity location, Connect and Message buttons, About paragraph and Skills pills (HTML, CSS, Python, Teamwork). Callouts highlight the three things recruiters see in 3 seconds: PHOTO, HEADLINE, and the growing Skills list.",
      },
      {
        type: "analogy",
        label: "💼 Your digital business card — 100× more powerful",
        html: `A business card has your name and phone number — you hand it to someone and hope they call. <strong>Your LinkedIn profile is a business card that works 24/7.</strong> It shows your photo, your school, your skills, your projects, and your goals to anyone searching. Recruiters search 'Computer Science student Tashkent' and your card pops up — even while you sleep.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "💼",
            title: "What's on it?",
            description: "<strong>Your online CV.</strong> Photo, name, headline ('CS Student | Interested in AI'), school, skills (HTML, Python, English), projects you've built, certificates earned.<br><br>▸ <strong>Free to set up:</strong> 30 minutes total<br>▸ <strong>Always visible:</strong> recruiters can find you 24/7<br>▸ <strong>Updates with you:</strong> finished a course? Add it. Built a project? Pin it.",
            tag: "The Profile",
            tagColor: "blue",
          },
          {
            icon: "🌐",
            title: "Who uses it?",
            description: "<strong>900+ million professionals worldwide.</strong> Including every Fortune 500 company, every major bank, every tech startup. In Tashkent: EPAM, Beeline, Uzcard, Click, Humans, Amity faculty.<br><br>▸ <strong>Famous fact:</strong> 8 people get hired every minute through LinkedIn<br>▸ <strong>Recruiters:</strong> 95% check your LinkedIn before deciding to interview you",
            tag: "The Network",
            tagColor: "purple",
          },
        ],
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "🎯",
            title: "Recruiters Find YOU",
            description: "<strong>You don't apply — they reach out.</strong> A recruiter searches 'CS student Tashkent interested in AI' → your profile shows up → they message you. Many students get their first internship this way.<br><br>▸ <strong>Real Tashkent example:</strong> EPAM, Click, and Beeline recruiters actively message Amity students<br>▸ <strong>Your job:</strong> have a clear headline so search finds you",
            tag: "How it works",
            tagColor: "green",
          },
          {
            icon: "🤝",
            title: "Network = Career",
            description: "<strong>Every connection is a future opportunity.</strong> Connect with classmates, professors, alumni, people you meet at events. A polite 'hello' today becomes a job referral 3 years from now.<br><br>▸ <strong>Why it works:</strong> 70% of jobs are found through people, not job ads<br>▸ <strong>Smart move:</strong> connect with everyone you meet in real life — same day",
            tag: "How it works",
            tagColor: "green",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>📌 Memorise this:</strong> <mark>LinkedIn = your career card.</mark> Free. Always on. 900M users. 8 hires per minute. The first place every recruiter looks before deciding to interview you.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>🤔 Think it through:</strong> Google your own name right now. What comes up? If a recruiter Googles you tomorrow, will they see your LinkedIn — or your party photos? Your career depends on which.`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "LinkedIn vs Instagram",
    time: "~3 mins",
    badges: [],
    hook: `Same idea: post and follow. <strong>Totally different audience.</strong> Instagram is for friends and fun. LinkedIn is for career and work. Use both — but use them differently. Get them mixed up and you lose either friends OR opportunities.`,
    content: [
      {
        type: "text",
        html: `Both apps let you <mark>post content and follow people</mark>. That's where the similarity ends. Instagram = your <strong>personal life</strong>. LinkedIn = your <strong>career life</strong>. Same person, two stages, two completely different sets of clothes.`,
      },
      {
        type: "analogy",
        label: "👔 Same you, two stages",
        html: `Imagine going to a job interview wearing party clothes — sunglasses, casual sneakers, loud t-shirt. It doesn't fit. Same with posting a TikTok dance on LinkedIn or your CV on Instagram. <strong>Different stages, different clothes, different rules.</strong> Smart students learn when to wear what.`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "📸",
            title: "Instagram",
            description: "<strong>Friends, family, fun.</strong> Where you post: <em>my lunch · weekend trip · birthday party · funny meme · new haircut</em>.<br><br>▸ <strong>Audience:</strong> mostly 16–30 year olds<br>▸ <strong>Tone:</strong> casual, emoji-heavy, fun<br>▸ <strong>What you post:</strong> photos, Reels, Stories<br>▸ <strong>Goal:</strong> stay connected, share moments<br><br><strong>Why it matters:</strong> for keeping friendships alive and just enjoying life. NOT for getting jobs.",
            tag: "Personal life",
            tagColor: "purple",
          },
          {
            icon: "💼",
            title: "LinkedIn",
            description: "<strong>Career, jobs, learning.</strong> Where you post: <em>finished an HTML course · built my first website · attended a coding competition · proud of my classmate's internship</em>.<br><br>▸ <strong>Audience:</strong> recruiters, alumni, professors, students with goals<br>▸ <strong>Tone:</strong> professional but friendly<br>▸ <strong>What you post:</strong> achievements, skills, opinions on your field<br>▸ <strong>Goal:</strong> find internships, build a network<br><br><strong>Why it matters:</strong> this is where your future job hunts for you.",
            tag: "Career life",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "❌",
            title: "Wrong on Instagram",
            description: "<strong>Don't post your CV.</strong> Friends scroll for fun, not work. Posting 'I'm looking for an internship' on Instagram is like asking the cinema audience for a job.<br><br>▸ <strong>Stays casual:</strong> photos, life updates, friends<br>▸ <strong>Skip:</strong> certificates, dry achievements, formal posts<br>▸ <strong>Use Stories:</strong> for fun, ephemeral moments",
            tag: "What NOT to do",
            tagColor: "pink",
          },
          {
            icon: "❌",
            title: "Wrong on LinkedIn",
            description: "<strong>Don't post party photos or drama.</strong> Recruiters see EVERYTHING on your profile. One angry rant or beach selfie can quietly drop you from a candidate list.<br><br>▸ <strong>Stays professional:</strong> what you've learned, built, achieved<br>▸ <strong>Skip:</strong> personal complaints, party photos, random memes<br>▸ <strong>Avoid:</strong> tagging your professor in jokes",
            tag: "What NOT to do",
            tagColor: "pink",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>📌 Memorise this:</strong> <mark>Instagram = personal life. LinkedIn = career life.</mark> Same idea (post + follow). Different audience, different rules. Mix them up → lose friends OR opportunities.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>🤔 Think it through:</strong> You finished an HTML class assignment. Where do you post about it? <em>(Hint: friends don't care about HTML; recruiters do.)</em> Now you understand the difference.`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "Why YOU Should Focus on LinkedIn for Career Growth",
    time: "~4 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `LinkedIn is NOT 'for later when I have a real job'. <strong>Starting in Year 1 gives you 3 years of building before any company asks for your CV.</strong> The students with strong LinkedIn profiles get internships their classmates don't even SEE.`,
    content: [
      {
        type: "text",
        html: `Most students think 'I'll set up LinkedIn after I graduate'. <strong>That's the biggest mistake of your university years.</strong> A strong LinkedIn takes time — connections compound, skills accumulate, professors remember you. <mark>Year 1 LinkedIn = Year 4 internship.</mark> Like compound interest, but for your career.`,
      },
      {
        type: "text",
        html: `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px;margin:8px 0;overflow-x:auto"><svg viewBox="0 0 720 200" style="width:100%;height:auto;min-width:560px;display:block" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The compounding network: starts at 5 connections in Year 1, grows to 500+ by Year 4 and to a real job offer by Year 5"><text x="360" y="22" text-anchor="middle" fill="#71717A" font-size="11" font-family="system-ui" font-weight="700" letter-spacing="3">THE COMPOUNDING NETWORK</text><line x1="60" y1="160" x2="700" y2="160" stroke="#3F3F46" stroke-width="1"/><line x1="60" y1="40" x2="60" y2="160" stroke="#3F3F46" stroke-width="1"/><circle cx="120" cy="148" r="6" fill="#A78BFA"/><text x="120" y="178" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Year 1</text><text x="120" y="138" text-anchor="middle" fill="#A78BFA" font-size="11" font-family="system-ui" font-weight="700">5 conn.</text><circle cx="260" cy="120" r="9" fill="#818CF8"/><text x="260" y="178" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Year 2</text><text x="260" y="106" text-anchor="middle" fill="#818CF8" font-size="11" font-family="system-ui" font-weight="700">50 conn.</text><circle cx="400" cy="80" r="13" fill="#60A5FA"/><text x="400" y="178" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Year 3</text><text x="400" y="62" text-anchor="middle" fill="#60A5FA" font-size="11" font-family="system-ui" font-weight="700">200 conn.</text><circle cx="540" cy="55" r="16" fill="#34D399"/><text x="540" y="178" text-anchor="middle" fill="#A1A1AA" font-size="10" font-family="system-ui">Year 4</text><text x="540" y="36" text-anchor="middle" fill="#34D399" font-size="11" font-family="system-ui" font-weight="700">500+ conn.</text><circle cx="680" cy="48" r="18" fill="#FBBF24"/><text x="680" y="178" text-anchor="middle" fill="#FBBF24" font-size="10" font-family="system-ui" font-weight="700">JOB OFFER</text><path d="M120 148 Q190 130 260 120 Q330 100 400 80 Q470 65 540 55 Q610 50 680 48" fill="none" stroke="url(#gradLine)" stroke-width="3"/><defs><linearGradient id="gradLine" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#A78BFA"/><stop offset="50%" stop-color="#60A5FA"/><stop offset="100%" stop-color="#FBBF24"/></linearGradient></defs></svg><div style="text-align:center;color:#71717A;font-size:11px;margin-top:8px">Network compounds: 5 → 50 → 200 → 500+ → real opportunities</div></div>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "⏰",
            title: "Time = Network",
            description: "<strong>You can't rush 1,000 connections.</strong> Each one happens slowly — a classmate, a professor, an alumnus, someone from a club. By Year 4, you have <strong>3 years of small actions adding up</strong>. Late starters apply with zero connections.<br><br>▸ <strong>Compound math:</strong> 1 new connection per week × 4 years = 200+ connections<br>▸ <strong>The gap:</strong> someone starting in Year 4 is 3 years behind",
            tag: "Why now",
            tagColor: "blue",
          },
          {
            icon: "📋",
            title: "Hidden Internships",
            description: "<strong>Many internships posted ONLY on LinkedIn.</strong> Microsoft, Google, EPAM Tashkent, banks — they post on LinkedIn first (or only). If you don't have a profile, you literally don't see them.<br><br>▸ <strong>Real example:</strong> EPAM Tashkent posts most of its student programs only on LinkedIn<br>▸ <strong>The cost of waiting:</strong> miss them entirely",
            tag: "Why now",
            tagColor: "blue",
          },
        ],
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "🏛️",
            title: "IFS Connect = LinkedIn",
            description: "<strong>Our own /connect page is powered by LinkedIn.</strong> The URL you add to your profile becomes a 'Connect on LinkedIn' button on your IFS Connect card. Classmates and juniors find you instantly.<br><br>▸ <strong>Profile boost:</strong> cards with LinkedIn rank higher on /connect<br>▸ <strong>Already wired:</strong> add your URL once at /profile/edit",
            tag: "The Amity angle",
            tagColor: "green",
          },
          {
            icon: "🎓",
            title: "Juniors Will Need You",
            description: "<strong>Next year's first-year students will reach out.</strong> They'll see your IFS Connect card, click your LinkedIn, ask for advice. By Year 3, you become THE senior they remember. That's how mentorship — and your reputation — starts.<br><br>▸ <strong>Your legacy:</strong> the senior who actually replied to messages<br>▸ <strong>Career win:</strong> mentees become your future co-workers and references",
            tag: "The Amity angle",
            tagColor: "green",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>4 quick wins to set up your profile in 30 minutes:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "📷",
            title: "1. Clear photo",
            description: "Plain background, friendly smile, no sunglasses, no group photos. Like your university ID photo, but warmer.",
            tag: "5 min",
          },
          {
            icon: "✍️",
            title: "2. Headline that pops",
            description: "Don't write just 'Student at Amity'. Try: <strong>'CS Student | Interested in AI & Web Development'</strong>. Recruiters find you by these words.",
            tag: "5 min",
          },
          {
            icon: "🛠️",
            title: "3. Add every skill",
            description: "HTML, CSS, Python, MS Excel, Communication, Teamwork — anything you've touched in class. Recruiters search by skills.",
            tag: "10 min",
          },
          {
            icon: "🎓",
            title: "4. Education + bio",
            description: "Add Amity University Tashkent, your year, your program. Then a 3-line About: who you are, what you're learning, what excites you.",
            tag: "10 min",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>📌 Memorise this:</strong> <mark>Year 1 LinkedIn = Year 4 internship.</mark> Compound interest, but for careers. Late starters can't catch up. Set yours up THIS WEEK — 30 minutes total.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>⚠️ Common excuse — and why it's wrong:</strong> 'I'll make a LinkedIn once I have something to show.' But LinkedIn IS how you show progress. Your first project, first course, first internship — every small step goes there and compounds. <strong>Start empty, fill it as you grow.</strong>`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>🤔 Final think it through:</strong> Three years from now, two students apply for the same internship at EPAM. Same grades. One started LinkedIn in Year 1 — has 300+ connections, projects, professor recommendations. The other waits until graduation — empty profile. <strong>Who gets the call back?</strong> That version of YOU is being built right now, by what you do (or don't do) this week.`,
      },
    ],
  },
];
