// Canonical content types live in src/types/content.ts. Module 5 used
// to redeclare them locally; all modules now share one source.
import type { Topic } from "@/types/content";
export type { Topic };

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "Artificial Intelligence (AI)",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You unlock your phone with your face. You ask Siri the weather. Yandex Taxi guesses when your ride will arrive. <strong>All of that is AI \u2014 software that does things we used to think only humans could do.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>Artificial Intelligence (AI)</strong> is software that can do <mark>things that usually need a human brain</mark> \u2014 like understanding speech, recognising a face in a photo, or guessing what you want to watch next. It is not a robot and it is not alive. It is just a clever computer program trained on lots of examples.`,
      },
      {
        type: "image",
        src: "/images/m5/ai-overview.webp",
        description: "Artificial Intelligence overview",
      },
      {
        type: "analogy",
        label: "\ud83e\udde0 The student who learns from examples",
        html: `Think of AI as a <strong>student who learns by seeing thousands of examples</strong>. Show them 10,000 photos of cats and dogs with the right label on each one. After a while, they can look at a brand-new photo and say \u201ccat\u201d or \u201cdog.\u201d They did not become alive \u2014 they just got very good at spotting patterns in pictures.`,
      },
      {
        type: "text",
        html: `<strong>Today\u2019s AI is \u201cnarrow\u201d \u2014 it is very good at ONE task, but it cannot do other tasks.</strong> Siri can answer questions but it cannot drive a car. Yandex Taxi predicts arrival time but it cannot write your essay. An AI that can do <em>everything</em> a human can do does not exist yet \u2014 it is only in movies.`,
      },
      {
        type: "text",
        html: `<strong>You already use AI every day \u2014 even if you didn\u2019t know:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcf1",
            title: "Phone Face ID",
            description: "Your iPhone or Android unlocks the moment it sees your face \u2014 AI trained to recognise YOU and no one else.",
            tag: "iPhone \u00b7 Samsung",
          },
          {
            icon: "\ud83d\ude97",
            title: "Yandex Taxi / Google Maps",
            description: "AI looks at traffic and predicts how long your ride will take and the fastest road through Tashkent.",
            tag: "Yandex \u00b7 Google Maps",
          },
          {
            icon: "\ud83c\udfac",
            title: "YouTube / TikTok / Netflix",
            description: "AI watches what you like and picks the next video or show for you \u2014 that is why the \u201cFor You\u201d page feels so accurate.",
            tag: "TikTok \u00b7 YouTube \u00b7 Netflix",
          },
          {
            icon: "\ud83d\udde3\ufe0f",
            title: "Voice assistants",
            description: "Siri, Google Assistant, and Alexa turn your voice into text, work out what you asked, and answer.",
            tag: "Siri \u00b7 Google \u00b7 Alexa",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why AI helps you:</strong> \u2705 Saves time (auto-translate a message in Telegram) \u00b7 \u2705 Catches spam emails for you \u00b7 \u2705 Suggests songs you\u2019ll probably love on Spotify \u00b7 \u2705 Helps doctors spot illness in X-rays earlier \u00b7 \u2705 Guides drivers around traffic jams in real time.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>What to watch out for:</strong> \u26a0\ufe0f AI can be confidently wrong \u2014 always check important facts \u00b7 \u26a0\ufe0f It learns from old data, so it can repeat old unfair patterns \u00b7 \u26a0\ufe0f It does not \u201cunderstand\u201d you \u2014 it just spots patterns \u00b7 \u26a0\ufe0f Some AI apps send your questions to a company\u2019s server, so don\u2019t share secrets.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Open your phone and list three apps you used today. Which of them probably use AI behind the scenes? What would those apps feel like if the AI part disappeared?`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "Machine Learning (ML)",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Nobody sat down and wrote the rule \u201cif the email has the word VIAGRA three times, it is spam.\u201d Instead, <strong>Gmail looked at millions of emails and learned by itself what spam looks like.</strong> That is Machine Learning.`,
    content: [
      {
        type: "text",
        html: `<strong>Machine Learning (ML)</strong> is when a computer <mark>learns from lots of examples</mark> instead of following rules a human wrote for it. You give it data, it spots patterns, and then it can handle new situations it has never seen before. ML is the engine inside most AI apps you use.`,
      },
      {
        type: "image",
        src: "/images/m5/machine-learning.webp",
        description: "Machine Learning overview",
      },
      {
        type: "analogy",
        label: "\ud83d\udc76 How a small child learns \u201ccat\u201d",
        html: `A 2-year-old learns what a cat is not by reading a dictionary \u2014 but by <strong>seeing many cats</strong> and hearing the word \u201ccat\u201d each time. After enough examples, the child just knows. ML works the same way: the more examples the computer sees, the better it gets at its job.`,
      },
      {
        type: "text",
        html: `<strong>Three plain-English examples of ML learning from examples:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udce7",
            title: "Gmail spam filter",
            description: "Millions of users clicked \u201cthis is spam\u201d or \u201cnot spam.\u201d Gmail learned from those clicks \u2014 now it catches new spam emails you\u2019ve never seen before.",
            tag: "Gmail",
          },
          {
            icon: "\ud83c\udfb5",
            title: "Spotify / YouTube Music",
            description: "The app sees what you play, skip, and save. It groups songs that feel similar to each other and suggests songs that fit your taste.",
            tag: "Spotify \u00b7 YouTube Music",
          },
          {
            icon: "\ud83c\udfae",
            title: "Game AI (PUBG, FIFA bots)",
            description: "Some game AIs play thousands of matches against themselves. Each win teaches them what works, each loss teaches them what fails \u2014 they get stronger over time.",
            tag: "PUBG \u00b7 FIFA",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How is ML different from a normal program?</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcdc",
            title: "Normal program",
            description: "A person writes every rule by hand: \u201cIF the email has this word, THEN move it to spam.\u201d It breaks the moment spammers change their words.",
            tag: "Human writes rules",
          },
          {
            icon: "\ud83e\udde0",
            title: "Machine Learning",
            description: "The human gives the computer examples. The computer finds the rules by itself from the data. When spammers change tactics, the model can learn the new pattern.",
            tag: "Computer finds rules",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Where AI and ML sit:</strong> AI is the big goal \u2014 \u201cmake computers act smart.\u201d ML is the most popular way to reach that goal \u2014 \u201clet computers learn from examples.\u201d Nearly every AI app you use today (Siri, TikTok, Google Translate, ChatGPT) is built with ML inside.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>What to watch out for:</strong> \u26a0\ufe0f ML is only as good as the examples it sees \u2014 bad data = bad results \u00b7 \u26a0\ufe0f It can pick up unfair patterns from the past (for example, rejecting job applicants from one group) \u00b7 \u26a0\ufe0f It can\u2019t explain WHY it made a choice \u2014 it just found a pattern.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Imagine your little brother uses your TikTok for a week and watches only football clips. Your \u201cFor You\u201d page changes. Why? And what would it take to \u201creset\u201d the app\u2019s idea of what you like?`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "Data Analytics",
    time: "~5 mins",
    badges: [],
    hook: `Every time you open Uzum, tap Payme, or order a ride on Yandex Taxi, you make \u201cdata.\u201d <strong>Data Analytics is how companies turn all those clicks and numbers into clear answers they can actually use.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>Data Analytics</strong> means <mark>looking at raw numbers and turning them into useful answers</mark>. Shops use it to see which products sell best. Banks use it to spot strange card activity. Taxi apps use it to guess where drivers will be needed in the next hour.`,
      },
      {
        type: "image",
        src: "/images/m5/data-analytics.webp",
        description: "Data Analytics overview",
      },
      {
        type: "analogy",
        label: "\ud83d\udd75\ufe0f A detective and a pile of clues",
        html: `Raw data on its own is useless \u2014 like a pile of scattered puzzle pieces. A data analyst is like a <strong>detective</strong>: they collect the clues, put them in order, and connect them until the full picture becomes clear. Without that work, the clues are just random facts.`,
      },
      {
        type: "text",
        html: `<strong>Four questions data analytics can answer</strong> \u2014 they go from simple to smart:`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcca",
            title: "What happened?",
            description: "Looks at the past. Example: Uzum sees that phone sales in Tashkent went up 20% in March.",
            tag: "Past",
          },
          {
            icon: "\ud83d\udd2c",
            title: "Why did it happen?",
            description: "Looks for the reason. Example: sales went up because a school holiday meant more kids bought phones with their families.",
            tag: "Reason",
          },
          {
            icon: "\ud83d\udd2e",
            title: "What will happen next?",
            description: "Uses past patterns to guess the future. Example: Yandex Taxi predicts lots of rides near the metro at 6 p.m.",
            tag: "Forecast",
          },
          {
            icon: "\ud83c\udfaf",
            title: "What should we do?",
            description: "Suggests an action. Example: \u201cSend drivers to the metro at 5:45 p.m. so passengers don\u2019t wait.\u201d",
            tag: "Action",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>You already see data analytics in action in Tashkent:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\uded2",
            title: "Uzum market",
            description: "Knows which products sell most on weekends, so it puts them on the home page on Friday evening.",
            tag: "Uzum",
          },
          {
            icon: "\ud83d\udcb3",
            title: "Payme / Click",
            description: "Watches your spending pattern. If a payment looks very unusual, the app can block it and ask you to confirm.",
            tag: "Payme \u00b7 Click",
          },
          {
            icon: "\ud83d\ude95",
            title: "Yandex Taxi",
            description: "Uses ride history to guess busy zones. That is why the app sometimes shows \u201chigh demand\u201d at certain hours.",
            tag: "Yandex Taxi",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why it matters:</strong> \u2705 Helps shops stock the right products \u00b7 \u2705 Helps banks catch fraud quickly \u00b7 \u2705 Helps hospitals spot disease trends \u00b7 \u2705 Helps schools see which students need extra help \u00b7 \u2705 Makes decisions based on facts, not guesses.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Imagine you run a small bakery near your home. What 3 pieces of data would you want to collect for one month? What decisions could you make from those numbers?`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "Cloud Computing",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You take a photo on your phone. Later you open your laptop \u2014 and the same photo is already there, waiting for you. <strong>You didn\u2019t copy it. You didn\u2019t email it. So how did it travel? It was saved to the <em>cloud</em> \u2014 a huge computer on the internet that both your devices can reach.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>Cloud Computing</strong> means saving your files and running programs on <mark>big computers on the internet</mark> \u2014 instead of only on your own phone or laptop. The \u201ccloud\u201d isn\u2019t really a cloud in the sky \u2014 it\u2019s just someone else\u2019s very powerful computer, kept safe inside a huge building called a <strong>data centre</strong>.`,
      },
      {
        type: "image",
        src: "/images/m5/cloud-computing.webp",
        description: "Cloud Computing overview",
      },
      {
        type: "analogy",
        label: "\ud83c\udfe8 Your locker vs a hotel room",
        html: `Saving files only on your laptop is like keeping everything in <strong>one school locker</strong>. If you forget the key, lose the bag, or the locker breaks \u2014 everything inside is gone. Saving files in the <strong>cloud</strong> is like keeping them in a <strong>hotel safe</strong> that you can open from anywhere in the world, on any device, as long as you have the internet.`,
      },
      {
        type: "text",
        html: `<strong>You already use the cloud every day</strong> \u2014 even if you\u2019ve never heard the word before:`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcf7",
            title: "Saving photos and files",
            description: "Google Drive, Google Photos, iCloud, OneDrive \u2014 your photos and documents are kept on Google\u2019s or Apple\u2019s computers so you can open them from any device.",
            tag: "Google Drive \u00b7 iCloud \u00b7 OneDrive",
          },
          {
            icon: "\u270f\ufe0f",
            title: "Working on documents",
            description: "Google Docs, Google Sheets, Gmail \u2014 nothing is installed on your laptop. You just open the browser and the app runs from the cloud.",
            tag: "Gmail \u00b7 Docs \u00b7 Sheets",
          },
          {
            icon: "\ud83c\udfac",
            title: "Watching and listening",
            description: "YouTube, Netflix, Spotify, Telegram \u2014 the videos, songs, and messages live on huge cloud computers. Your phone just streams them when you press play.",
            tag: "YouTube \u00b7 Netflix \u00b7 Spotify",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Cloud vs your own device \u2014 why people choose the cloud:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udcbb",
            title: "Saving only on your device",
            description: "Files sit on one phone or one laptop. If you lose the device, break it, or run out of space \u2014 your files are gone. You can only open them on that one device.",
            tag: "Local storage",
          },
          {
            icon: "\u2601\ufe0f",
            title: "Saving on the cloud",
            description: "Files sit safely on the internet. You can open them from any phone, laptop, or tablet. If your device breaks, your files are still there. You also get more space than your device has.",
            tag: "Cloud storage",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why the cloud helps you:</strong> \u2705 Open your files from any device \u00b7 \u2705 If your phone breaks, your photos are safe \u00b7 \u2705 Work on the same document with friends at the same time \u00b7 \u2705 Get more storage than your device can hold \u00b7 \u2705 Automatic backup \u2014 no more \u201cI forgot to save!\u201d`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>What to watch out for:</strong> \u26a0\ufe0f You need internet to reach the cloud \u2014 no Wi-Fi, no access \u00b7 \u26a0\ufe0f Your files sit on someone else\u2019s computer, so use a strong password and turn on 2-step login \u00b7 \u26a0\ufe0f Free plans have limits (for example, Google Drive gives 15 GB free).`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Imagine you wrote a big school project on your laptop and saved it only there. The night before submission, the laptop will not turn on. How would the cloud have saved you? Which free cloud app could you start using today?`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "Blockchain",
    time: "~5 mins",
    badges: [],
    hook: `Imagine a notebook that <strong>everyone in class has a copy of, nobody can secretly change, and no single person owns.</strong> That is the basic idea of blockchain \u2014 and it is the tech behind Bitcoin and much more.`,
    content: [
      {
        type: "text",
        html: `<strong>Blockchain</strong> is a <mark>shared digital notebook copied across many computers</mark>. When something is written in it \u2014 like \u201cAli paid Dilnoza 100 UZS\u201d \u2014 every copy updates. Nothing can be secretly changed later, because all the other copies would catch the lie.`,
      },
      {
        type: "image",
        src: "/images/m5/blockchain.webp",
        description: "Blockchain overview",
      },
      {
        type: "analogy",
        label: "\ud83d\udcd3 The shared classroom notebook",
        html: `Picture a classroom where <strong>every student has the same notebook</strong>. Every time anyone writes a new line, all the notebooks update at once. If you try to erase a page in yours, 30 other notebooks still show it. That is blockchain: many copies, no single owner, very hard to cheat.`,
      },
      {
        type: "text",
        html: `<strong>Is blockchain the same as Bitcoin?</strong> No. Bitcoin is one example of money that runs on a blockchain. Blockchain is the underlying technology. It is like the difference between the road (blockchain) and one specific car (Bitcoin) that drives on it.`,
      },
      {
        type: "text",
        html: `<strong>What blockchain is actually used for today:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udcb0",
            title: "Cryptocurrencies",
            description: "Bitcoin, Ethereum, and other digital coins. Instead of a bank keeping the record, the blockchain keeps it across thousands of computers.",
            tag: "Bitcoin \u00b7 Ethereum",
          },
          {
            icon: "\ud83c\udf3e",
            title: "Tracking products",
            description: "Big companies track food or medicine from farm to shop using blockchain. If something goes wrong, they see every step of the journey.",
            tag: "Supply chains",
          },
          {
            icon: "\ud83d\udcdc",
            title: "Property & records",
            description: "Some countries are testing blockchain for land ownership records, so nobody can secretly change who owns a house.",
            tag: "Land registry",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why people like blockchain:</strong> \u2705 No single company controls it \u00b7 \u2705 Records are very hard to fake \u00b7 \u2705 Everyone on the network sees the same truth \u00b7 \u2705 Works across countries without needing a bank in the middle.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>What to watch out for:</strong> \u26a0\ufe0f If you lose your password (\u201cprivate key\u201d), your coins are gone forever \u00b7 \u26a0\ufe0f Cryptocurrency prices jump up and down a lot \u2014 people can lose real money \u00b7 \u26a0\ufe0f In Uzbekistan, crypto rules are strict \u2014 always check the law first \u00b7 \u26a0\ufe0f Once something wrong is written in, it stays \u2014 mistakes are hard to remove.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> If a blockchain record can never be changed, is that always a good thing? Think about a mistake, like sending money to the wrong person by accident. What would you want to happen next?`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "Virtual Reality (VR)",
    time: "~5 mins",
    badges: [],
    hook: `You put on a headset in your bedroom and suddenly you are standing on top of a mountain, or inside a PUBG map, or on the stage of a concert. <strong>The real world is gone \u2014 everything you see is made by a computer. That is Virtual Reality.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>Virtual Reality (VR)</strong> means <mark>a fake world made fully by a computer</mark> that you step into using a headset. The headset covers your eyes and ears, so you no longer see your room \u2014 you see a game, a beach, or a museum built by software. When you turn your head, the virtual world turns with you.`,
      },
      {
        type: "image",
        src: "/images/m5/vr.webp",
        description: "Virtual Reality overview",
      },
      {
        type: "analogy",
        label: "\ud83e\udd3f A diving mask underwater",
        html: `A VR headset is like putting on a <strong>diving mask under the sea</strong>. The moment you put it on, the world above disappears and you only see the fish, the coral, and the blue. Take it off \u2014 you are back in your bedroom. VR replaces what your eyes see.`,
      },
      {
        type: "text",
        html: `<strong>What you need to use VR:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83e\udd7d",
            title: "A VR headset",
            description: "The big glasses that cover your eyes. Popular ones: Meta Quest, PlayStation VR, Apple Vision Pro.",
            tag: "Meta Quest \u00b7 PSVR",
          },
          {
            icon: "\ud83c\udfae",
            title: "Hand controllers",
            description: "Small grips you hold in each hand. They let you point, grab, and shoot things inside the virtual world.",
            tag: "Controllers",
          },
          {
            icon: "\ud83d\udd0a",
            title: "3D sound",
            description: "The headset plays sound that changes as you turn your head \u2014 so footsteps behind you really sound behind you.",
            tag: "Spatial audio",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Where VR is used today:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83c\udfae",
            title: "Games",
            description: "Immersive games like Beat Saber, or VR versions of shooters \u2014 you duck, look around, and reach out with your own body.",
            tag: "Gaming",
          },
          {
            icon: "\ud83c\udfe5",
            title: "Training doctors",
            description: "Medical students practise surgery on a virtual patient first \u2014 no risk to a real person, and they can repeat it many times.",
            tag: "Hospitals",
          },
          {
            icon: "\ud83d\udcda",
            title: "School trips",
            description: "Students can \u201cwalk\u201d through Ancient Rome, the inside of a volcano, or old Samarkand without leaving the classroom.",
            tag: "Education",
          },
          {
            icon: "\ud83c\udfe0",
            title: "House viewing",
            description: "Some websites let you tour a flat in VR before visiting it in person \u2014 useful if the flat is far away.",
            tag: "Real estate",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why people use VR:</strong> \u2705 You feel like you are really inside the game or place \u00b7 \u2705 Safe practice for dangerous jobs (surgery, pilots) \u00b7 \u2705 Visit places you could never reach in real life (Mars, 500-year-old cities) \u00b7 \u2705 Great for fun and learning.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>What to watch out for:</strong> \u26a0\ufe0f Headsets can cost a lot of money \u00b7 \u26a0\ufe0f Some people feel dizzy or sick after 20\u201330 minutes \u2014 take breaks \u00b7 \u26a0\ufe0f You cannot see the real world, so you can bump into furniture or walls \u00b7 \u26a0\ufe0f Long use can strain your eyes.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> If your school got 30 VR headsets, which lesson would you most want to try in VR? What could you see or do that you cannot do with a normal textbook?`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "Augmented Reality (AR)",
    time: "~5 mins",
    badges: [{ text: "Most confused", type: "hot" }],
    hook: `You open Instagram, point the camera at yourself, and suddenly you have dog ears and glitter on your face \u2014 in real time. <strong>Your real face is still there, but the app added digital things on top. That is Augmented Reality.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>Augmented Reality (AR)</strong> means <mark>adding digital things on top of the real world</mark> you can already see. You don\u2019t leave reality \u2014 your phone or glasses just paint extra things over it: dog ears on your face, a virtual sofa in your room, or arrows on the street pointing you to your taxi.`,
      },
      {
        type: "image",
        src: "/images/m5/augmented-reality.webp",
        description: "Augmented Reality overview",
      },
      {
        type: "analogy",
        label: "\ud83e\ude9f Stickers on a window",
        html: `AR is like sticking <strong>stickers on a glass window</strong>. You still see the street through the glass \u2014 the stickers just sit on top. VR would be painting the whole window black and showing you a movie instead. AR keeps reality; VR replaces it.`,
      },
      {
        type: "text",
        html: `<strong>You already use AR every day \u2014 even if nobody told you the name:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcf8",
            title: "Instagram / TikTok filters",
            description: "Dog ears, sparkles, anime eyes \u2014 the app finds your real face through the camera and puts digital things on top of it.",
            tag: "Instagram \u00b7 TikTok",
          },
          {
            icon: "\ud83c\udfae",
            title: "Pokemon GO",
            description: "The camera sees the real park or street, and a little Pokemon appears standing on the grass \u2014 classic AR.",
            tag: "Pokemon GO",
          },
          {
            icon: "\ud83d\udecb\ufe0f",
            title: "Uzum / IKEA furniture preview",
            description: "Point your phone at your room and see how a new sofa or fridge would look before buying. Great for \u201cwill it fit?\u201d without a tape measure.",
            tag: "Uzum \u00b7 IKEA Place",
          },
          {
            icon: "\ud83d\uddfa\ufe0f",
            title: "Yandex / Google Maps arrows",
            description: "In \u201cLive View,\u201d you see the real street through the camera and big arrows appear on the pavement to show where to turn.",
            tag: "Yandex \u00b7 Google Maps",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>AR vs VR \u2014 the one sentence you must remember:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83e\udd7d",
            title: "VR \u2014 replaces reality",
            description: "You wear a headset that covers your eyes. You see only the fake world. Your real room disappears.",
            tag: "Headset \u00b7 Real world blocked",
          },
          {
            icon: "\ud83d\udcf1",
            title: "AR \u2014 adds to reality",
            description: "You use your phone camera or smart glasses. You still see the real world, with digital things added on top.",
            tag: "Phone / glasses \u00b7 Real world visible",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why AR is useful:</strong> \u2705 Try on clothes, makeup, or glasses without going to a shop \u00b7 \u2705 See how furniture fits your room before buying \u00b7 \u2705 Follow arrows on real streets instead of a tiny map \u00b7 \u2705 Fun filters in Instagram, TikTok, Telegram \u00b7 \u2705 Helps doctors, mechanics, and workers see extra info on top of real things.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Exam trap:</strong> \u26a0\ufe0f If a question says \u201cyou can still see the real world\u201d \u2192 AR. If it says \u201cthe real world is completely blocked\u201d \u2192 VR. This one line comes up in almost every exam.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> If Uzum added AR for clothes, so you could \u201ctry on\u201d a shirt using your phone camera before buying \u2014 would you use it? What could still go wrong compared to trying the shirt in a real shop?`,
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "Internet of Things (IoT)",
    time: "~5 mins",
    badges: [],
    hook: `Your smart watch counts your steps. A smart doorbell shows who is outside on your phone. A smart AC turns on before you get home. <strong>These are all everyday things connected to the internet \u2014 that is the Internet of Things (IoT).</strong>`,
    content: [
      {
        type: "text",
        html: `The <strong>Internet of Things (IoT)</strong> means <mark>everyday objects connected to the internet</mark> so they can send information or be controlled from far away. A normal lamp is just a lamp. A \u201csmart\u201d lamp you can switch on from your phone is IoT.`,
      },
      {
        type: "image",
        src: "/images/m5/iot.webp",
        description: "Internet of Things overview",
      },
      {
        type: "analogy",
        label: "\ud83c\udfe0 A house where everything can talk",
        html: `Imagine a home where your <strong>alarm clock tells the kettle to start boiling</strong>, your AC turns off when it sees no one is home, and the doorbell sends a live video to your phone when your cousin arrives. Each object has a little chip and internet. Together they are IoT \u2014 the \u201cinternet\u201d of \u201cthings.\u201d`,
      },
      {
        type: "text",
        html: `<strong>Examples of IoT around you:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\u231a",
            title: "Smart watches",
            description: "Apple Watch, Samsung Galaxy Watch, Xiaomi band. They count your steps, read your heart rate, and send data to your phone.",
            tag: "Fitness",
          },
          {
            icon: "\ud83d\udd14",
            title: "Smart doorbells",
            description: "A camera in the doorbell shows you who is outside \u2014 on your phone, even when you\u2019re at school or at work.",
            tag: "Home",
          },
          {
            icon: "\ud83c\udf21\ufe0f",
            title: "Smart AC & lights",
            description: "Turn on your air conditioner or lights from your phone before you arrive home. Some even learn your schedule.",
            tag: "Home",
          },
          {
            icon: "\ud83d\ude97",
            title: "Connected cars",
            description: "Modern cars send info to the maker \u2014 engine health, location, updates \u2014 a bit like a big smartphone with wheels.",
            tag: "Cars",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>In simple words, every IoT device does three things:</strong> (1) it <strong>senses</strong> something (temperature, motion, your heartbeat), (2) it <strong>sends</strong> that info over the internet, and (3) something useful <strong>happens</strong> \u2014 a notification, a light turns on, or data is saved.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why IoT helps you:</strong> \u2705 Control things from anywhere \u2014 no need to be in the room \u00b7 \u2705 Health tracking (steps, sleep, heart rate) \u00b7 \u2705 Saves energy \u2014 lights and AC turn off when nobody\u2019s home \u00b7 \u2705 Useful in farming, shops, factories, and hospitals too.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>What to watch out for:</strong> \u26a0\ufe0f IoT devices collect a LOT of data about you \u2014 where you go, when you sleep \u00b7 \u26a0\ufe0f Weak passwords let hackers into your home camera or doorbell \u00b7 \u26a0\ufe0f If the internet goes down, the \u201csmart\u201d thing often stops being smart \u00b7 \u26a0\ufe0f Always change the default password when you set up a new device.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> Pick one room in your home. What is one IoT device you would actually want there \u2014 and what is one IoT device you would NOT want (and why)?`,
      },
    ],
  },

  // ─── Topic 9 ───
  {
    id: 9,
    title: "Introduction to Generative AI",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You type \u201cwrite me a birthday message for my mum\u201d into ChatGPT and 3 seconds later, a full message appears. <strong>That is Generative AI \u2014 AI that creates new text, images, or videos when you ask it to.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>Generative AI</strong> is AI that <mark>creates new content for you</mark> \u2014 a message, a picture, a song, a video, a piece of code. You give it a short instruction (called a \u201cprompt\u201d), and it writes or draws something new. It doesn\u2019t copy \u2014 it makes up something based on everything it has learned.`,
      },
      {
        type: "image",
        src: "/images/m5/generative-ai.webp",
        description: "Generative AI overview",
      },
      {
        type: "analogy",
        label: "\ud83c\udfa8 A student who studied a million paintings",
        html: `Imagine an art student who has <strong>looked at a million paintings</strong>. They didn\u2019t memorise any single one, but they learned the styles, colours, and shapes. When you say \u201cpaint a sunset over Chorsu bazaar,\u201d they paint something brand new \u2014 not a copy, but inspired by everything they saw. Generative AI works the same way.`,
      },
      {
        type: "text",
        html: `<strong>What generative AI can make for you today:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcdd",
            title: "Text",
            description: "Essays, messages, poems, emails, code, translations. Ask in English or Russian or Uzbek \u2014 ChatGPT, Claude, Gemini, Yandex GPT can all reply.",
            tag: "ChatGPT \u00b7 Yandex GPT",
          },
          {
            icon: "\ud83d\uddbc\ufe0f",
            title: "Images",
            description: "Type \u201ca cat riding a camel in the desert\u201d \u2014 DALL\u00b7E or Midjourney will draw it. Great for posters, thumbnails, or avatars.",
            tag: "DALL\u00b7E \u00b7 Midjourney",
          },
          {
            icon: "\ud83c\udfb5",
            title: "Music & voice",
            description: "Apps like Suno write full songs from a short prompt. ElevenLabs can read a paragraph in a human voice.",
            tag: "Suno \u00b7 ElevenLabs",
          },
          {
            icon: "\ud83c\udfac",
            title: "Video",
            description: "Newer tools like Sora and Runway can create short video clips from a text description \u2014 still improving, still surprising.",
            tag: "Sora \u00b7 Runway",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How does it actually work, in one sentence?</strong> It has read or seen huge amounts of text and pictures from the internet, and it is very good at <strong>guessing what piece comes next</strong> \u2014 the next word of a sentence, or the next pixel of an image. That is why it can write a full essay one word at a time.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Why it\u2019s useful:</strong> \u2705 Helps you start \u2014 brainstorming, first drafts, outlines \u00b7 \u2705 Explains hard topics in simple words \u00b7 \u2705 Helps non-native English speakers polish grammar \u00b7 \u2705 Saves time on boring writing (formal emails, reports) \u00b7 \u2705 Creates pictures and music without any special skill.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>What to watch out for:</strong> \u26a0\ufe0f It can be confidently wrong \u2014 it makes up facts (this is called a \u201challucination\u201d) \u00b7 \u26a0\ufe0f It does NOT really \u201cunderstand\u201d \u2014 it just predicts the next likely word \u00b7 \u26a0\ufe0f Don\u2019t paste secrets or personal info \u2014 they may be saved on the company\u2019s servers \u00b7 \u26a0\ufe0f Copying its text into your homework without checking is not learning.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> If ChatGPT can write an essay in seconds, why should a student still learn to write? Think about what writing actually teaches you that the AI cannot do for you.`,
      },
    ],
  },

  // ─── Topic 10 ───
  {
    id: 10,
    title: "Ethical Use of GPTs",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `ChatGPT can write your essay in 30 seconds. Someone can make a fake video of a teacher saying things they never said. <strong>The tools are powerful \u2014 this topic is about using them safely and fairly.</strong>`,
    content: [
      {
        type: "text",
        html: `<strong>GPT</strong> is short for <mark>Generative Pre-trained Transformer</mark> \u2014 the kind of AI behind ChatGPT, Claude, and Gemini. These tools are amazing, but using them the wrong way can cause real problems: cheating at school, spreading fake news, leaking private info, or being unfair to people.`,
      },
      {
        type: "image",
        src: "/images/m5/ethical-ai.webp",
        description: "Ethical AI overview",
      },
      {
        type: "text",
        html: `<strong>Four things to be careful about:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udccb",
            title: "Cheating at school",
            description: "If ChatGPT writes your essay and you submit it as your own work, that is cheating \u2014 called plagiarism. Use AI to LEARN, not to copy.",
            tag: "Plagiarism",
          },
          {
            icon: "\ud83e\udd25",
            title: "AI making up facts",
            description: "ChatGPT sometimes gives answers that sound right but are actually wrong (\u201challucinations\u201d). Always check important facts with a trusted source.",
            tag: "Hallucinations",
          },
          {
            icon: "\ud83c\udfad",
            title: "Deepfakes",
            description: "AI can make a fake video or voice that looks and sounds exactly like a real person. Scammers use this to fool families, schools, and banks.",
            tag: "Fake videos",
          },
          {
            icon: "\ud83d\udd10",
            title: "Your private info",
            description: "Whatever you type into a chatbot may be stored on a company\u2019s server. Don\u2019t paste passwords, bank details, or private family info.",
            tag: "Privacy",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Simple rules for using AI well:</strong>`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\u2705",
            title: "Good uses",
            description: "Ask AI to explain a confusing lesson, help you brainstorm ideas, check your grammar, translate a sentence for Telegram, or practise a language.",
            tag: "Do",
          },
          {
            icon: "\u274c",
            title: "Bad uses",
            description: "Copying a full ChatGPT essay and saying you wrote it. Sharing AI-made fake videos of real people. Typing family bank info into a random chatbot.",
            tag: "Don\u2019t",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>The golden rule:</strong> Use AI as a <mark>helper, not a replacement for your brain</mark>. Always check what it says, always say when you used it, and never share anything with it that you wouldn\u2019t share with a stranger.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Before you trust an AI answer, ask:</strong> \u26a0\ufe0f Did I check this fact somewhere else? \u00b7 \u26a0\ufe0f Am I about to share private info I shouldn\u2019t? \u00b7 \u26a0\ufe0f Would my teacher be okay with how I used this? \u00b7 \u26a0\ufe0f If this is a video or voice message, could it be a deepfake?`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83e\udd14 Think it through:</strong> A student uses ChatGPT to understand a tricky science concept, then writes the homework in their own words. Another student copies ChatGPT\u2019s answer word for word. Which one is cheating, and why?`,
      },
    ],
  },
];
