export interface TopicCard {
  icon: string;
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
}

export interface EraCard {
  icon: string;
  period: string;
  title: string;
  description: string;
  limitation: string;
}

export interface TableRow {
  cells: string[];
}

export interface Step {
  title: string;
  description: string;
}

export type ContentBlock =
  | { type: "text"; html: string }
  | { type: "cards"; columns: 2 | 3 | 4; items: TopicCard[] }
  | { type: "era-cards"; columns: 4; items: EraCard[] }
  | { type: "callout"; variant?: "amber" | "blue" | "red" | "purple" | "dark"; html: string }
  | { type: "analogy"; label: string; html: string }
  | { type: "table"; headers: string[]; rows: TableRow[] }
  | { type: "steps"; items: Step[] }
  | { type: "image"; src?: string; description: string };

export interface Topic {
  id: number;
  title: string;
  time: string;
  badges: { text: string; type: "star" | "hot" }[];
  hook: string;
  content: ContentBlock[];
}

export const topics: Topic[] = [
  // ─── Topic 1 ───
  {
    id: 1,
    title: "Artificial Intelligence (AI)",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Imagine a machine that can <strong>see, hear, think, and make decisions</strong> — not because it is alive, but because humans taught it to imitate intelligence. That is Artificial Intelligence. And it is already in your pocket.`,
    content: [
      {
        type: "text",
        html: `Artificial Intelligence (AI) is the ability of a machine to <mark>simulate human intelligence</mark>. It allows computers to perform tasks that normally require human brains — recognising faces, understanding speech, making decisions, and even driving cars.`,
      },
      {
        type: "image",
        src: "/images/m5/image%205.webp",
        description: "Artificial Intelligence overview",
      },
      {
        type: "analogy",
        label: "\ud83e\udde0 The Smart Assistant Analogy",
        html: `Think of AI as a <strong>very talented student who learns by example</strong>. You show them 1,000 pictures of cats and dogs. They study the patterns — ears, tails, fur. Now when they see a new photo, they can tell you which is which. They did not become alive — they just learned the rules from data.`,
      },
      {
        type: "text",
        html: `<strong>Types of AI:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udfaf",
            title: "Narrow AI (Weak AI)",
            description: "Designed for ONE specific task. Cannot do anything else. Siri answers questions but cannot drive a car.",
            tag: "Siri \u00b7 Google Maps \u00b7 Netflix",
          },
          {
            icon: "\ud83e\udde0",
            title: "General AI (Strong AI)",
            description: "A machine that can think and learn like a human across ANY task. Does NOT exist yet \u2014 still science fiction.",
            tag: "Theoretical \u00b7 Not yet built",
          },
          {
            icon: "\ud83e\udd16",
            title: "Super AI",
            description: "AI smarter than all humans combined. A concept for the far future. Currently only in movies and books.",
            tag: "Hypothetical \u00b7 Far future",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Real-world applications of AI:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udde3\ufe0f",
            title: "Voice Assistants",
            description: "Siri, Alexa, Google Assistant \u2014 understand your speech and respond with answers or actions.",
          },
          {
            icon: "\ud83d\ude97",
            title: "Self-Driving Cars",
            description: "Tesla and Waymo use AI to see roads, detect obstacles, and navigate without a human driver.",
          },
          {
            icon: "\ud83c\udfe5",
            title: "Healthcare",
            description: "AI analyses X-rays and scans to detect diseases like cancer earlier than human doctors can.",
          },
          {
            icon: "\ud83c\udfac",
            title: "Recommendations",
            description: "Netflix, YouTube, Spotify all use AI to recommend what to watch, listen to, or read next.",
          },
        ],
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Key exam point:</strong> All AI today is <mark>Narrow AI</mark> \u2014 good at one thing, cannot generalise. General AI and Super AI do NOT exist yet. If a question mentions "current AI," the answer is always Narrow/Weak AI.`,
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "Machine Learning (ML)",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `What if you never had to write rules for a computer? What if the computer could <strong>look at thousands of examples and figure out the rules itself?</strong> That is Machine Learning \u2014 the engine behind modern AI.`,
    content: [
      {
        type: "text",
        html: `Machine Learning is a <mark>subset of AI</mark> where computers learn from data without being explicitly programmed. Instead of writing rules, you feed the computer data and it discovers patterns on its own.`,
      },
      {
        type: "image",
        src: "/images/m5/machine-learning.webp",
        description: "Machine Learning overview",
      },
      {
        type: "analogy",
        label: "\ud83d\udc76 The Baby Learning Analogy",
        html: `A baby learns to recognise a cat not by reading a definition, but by <strong>seeing hundreds of cats</strong>. After enough examples, the baby just "knows" \u2014 that is a cat. Machine Learning works the same way. The more data (examples) you give it, the better it gets.`,
      },
      {
        type: "text",
        html: `<strong>Types of Machine Learning:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udff7\ufe0f",
            title: "Supervised Learning",
            description: "You give the machine labelled data \u2014 \u201cthis is a cat,\u201d \u201cthis is a dog.\u201d The machine learns from these labels to classify new data.",
            tag: "Labelled data \u00b7 Teacher guides",
          },
          {
            icon: "\ud83d\udd0d",
            title: "Unsupervised Learning",
            description: "No labels. The machine finds hidden patterns on its own \u2014 like grouping customers by shopping behaviour without being told the categories.",
            tag: "No labels \u00b7 Finds patterns",
          },
          {
            icon: "\ud83c\udfae",
            title: "Reinforcement Learning",
            description: "The machine learns by trial and error \u2014 rewarded for good actions, penalised for bad ones. Like training a dog with treats.",
            tag: "Rewards \u00b7 Trial & error",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>ML applications in real life:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udce7",
            title: "Spam Detection",
            description: "Gmail learns which emails are spam by studying millions of labelled examples.",
          },
          {
            icon: "\ud83c\udfb5",
            title: "Music Recommendations",
            description: "Spotify learns your taste by analysing what you play, skip, and save.",
          },
          {
            icon: "\ud83c\udfe6",
            title: "Fraud Detection",
            description: "Banks use ML to spot unusual transactions that might be fraudulent.",
          },
          {
            icon: "\ud83d\udcf8",
            title: "Face Recognition",
            description: "Your phone learns your face and unlocks only for you \u2014 trained on your photos.",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>AI vs ML \u2014 the relationship:</strong> AI is the big umbrella goal (make machines smart). ML is one method to achieve AI (learn from data). All ML is AI, but not all AI is ML. ML is currently the most successful approach to building AI.`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "Data Analytics",
    time: "~5 mins",
    badges: [],
    hook: `Every click, swipe, purchase, and search you make creates data. But raw data is useless \u2014 like an unsorted pile of puzzle pieces. <strong>Data Analytics is the art of turning that chaos into clear answers.</strong>`,
    content: [
      {
        type: "text",
        html: `Data Analytics is the process of <mark>examining, cleaning, transforming, and modelling data</mark> to discover useful information, draw conclusions, and support decision-making. Businesses use it to understand customers, predict trends, and make smarter choices.`,
      },
      {
        type: "image",
        src: "/images/m5/data-analytics.webp",
        description: "Data Analytics overview",
      },
      {
        type: "analogy",
        label: "\ud83d\udd75\ufe0f The Detective Analogy",
        html: `Data Analytics is like being a detective. You have clues (raw data) scattered everywhere. Your job is to <strong>collect, organise, and connect the dots</strong> until the picture becomes clear. Without analysis, clues are just random facts \u2014 useless on their own.`,
      },
      {
        type: "text",
        html: `<strong>Types of Data Analytics:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcca",
            title: "Descriptive",
            description: "\u201cWhat happened?\u201d \u2014 Summarises past data. Example: monthly sales report showing totals.",
            tag: "Past \u00b7 Summary",
          },
          {
            icon: "\ud83d\udd2c",
            title: "Diagnostic",
            description: "\u201cWhy did it happen?\u201d \u2014 Digs deeper to find causes. Example: why did sales drop in March?",
            tag: "Cause \u00b7 Root analysis",
          },
          {
            icon: "\ud83d\udd2e",
            title: "Predictive",
            description: "\u201cWhat will happen?\u201d \u2014 Uses patterns to forecast future. Example: predicting next quarter\u2019s revenue.",
            tag: "Future \u00b7 Forecast",
          },
          {
            icon: "\ud83c\udfaf",
            title: "Prescriptive",
            description: "\u201cWhat should we do?\u201d \u2014 Recommends actions. Example: \u201cLaunch a sale in April to boost revenue.\u201d",
            tag: "Action \u00b7 Recommendation",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Memory trick:</strong> The 4 types follow a progression: What happened \u2192 Why \u2192 What will happen \u2192 What to do about it. Each level adds more value. Descriptive is the simplest; Prescriptive is the most advanced.`,
      },
      {
        type: "text",
        html: `<strong>Tools used in Data Analytics:</strong> Excel, Google Sheets, Python, R, Tableau, Power BI, SQL. Big companies use these daily to make billion-dollar decisions based on data, not guesses.`,
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "Cloud Computing",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `You open Google Docs. You type an essay. You close your laptop and open your phone \u2014 your essay is right there. <strong>Where is it stored? Not on your device. It lives on the \u201ccloud\u201d \u2014 powerful computers owned by Google, far away from you.</strong>`,
    content: [
      {
        type: "text",
        html: `Cloud Computing means using <mark>remote servers on the internet</mark> to store, manage, and process data \u2014 instead of doing it on your personal computer. The \u201ccloud\u201d is just someone else\u2019s very powerful computer, sitting in a data centre somewhere in the world.`,
      },
      {
        type: "image",
        src: "/images/m5/image%2020.webp",
        description: "Cloud Computing overview",
      },
      {
        type: "analogy",
        label: "\ud83c\udfe8 The Hotel Analogy",
        html: `Buying your own computer server is like <strong>buying a house</strong> \u2014 expensive, you maintain everything yourself. Cloud computing is like <strong>staying at a hotel</strong> \u2014 you pay only for the room you need, someone else handles cleaning, security, and maintenance. Need a bigger room? Just upgrade. No construction needed.`,
      },
      {
        type: "text",
        html: `<strong>Cloud Service Models:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udfd7\ufe0f",
            title: "IaaS \u2014 Infrastructure as a Service",
            description: "Rent the raw hardware \u2014 servers, storage, networks. You build everything on top. Like renting an empty plot of land.",
            tag: "AWS \u00b7 Azure \u00b7 Google Cloud",
          },
          {
            icon: "\ud83d\udee0\ufe0f",
            title: "PaaS \u2014 Platform as a Service",
            description: "Rent a ready-made platform for building apps. No need to worry about servers. Like renting a furnished kitchen \u2014 just cook.",
            tag: "Heroku \u00b7 Google App Engine",
          },
          {
            icon: "\ud83d\udcf1",
            title: "SaaS \u2014 Software as a Service",
            description: "Use finished software over the internet. No installation needed. Like ordering food \u2014 just eat, no cooking.",
            tag: "Gmail \u00b7 Google Docs \u00b7 Netflix",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Cloud Deployment Models:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83c\udf10",
            title: "Public Cloud",
            description: "Shared resources over the internet. Cheap, scalable. Like a public bus \u2014 shared, affordable.",
            tag: "AWS \u00b7 Google Cloud",
          },
          {
            icon: "\ud83d\udd12",
            title: "Private Cloud",
            description: "Dedicated to one organisation. More secure but expensive. Like a private chauffeur \u2014 exclusive.",
            tag: "Banks \u00b7 Government",
          },
          {
            icon: "\ud83d\udd00",
            title: "Hybrid Cloud",
            description: "Mix of public and private. Sensitive data stays private; everything else goes public. Best of both worlds.",
            tag: "Most large companies",
          },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Benefits of cloud:</strong> No upfront hardware cost \u00b7 Access from anywhere \u00b7 Automatic backups \u00b7 Scales up or down instantly \u00b7 Pay only for what you use. <strong>Risks:</strong> Needs internet \u00b7 Data privacy concerns \u00b7 Vendor lock-in.`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "Blockchain",
    time: "~5 mins",
    badges: [],
    hook: `What if every transaction ever made was written in a notebook that <strong>everyone could read, nobody could erase, and no single person controlled?</strong> That is Blockchain \u2014 and it is the technology behind Bitcoin and much more.`,
    content: [
      {
        type: "text",
        html: `Blockchain is a <mark>decentralised, distributed digital ledger</mark> that records transactions across many computers. Once a record is added, it cannot be changed or deleted. Each \u201cblock\u201d of transactions is chained to the previous one, forming an unbreakable chain.`,
      },
      {
        type: "image",
        src: "/images/m5/blockchain.webp",
        description: "Blockchain overview",
      },
      {
        type: "analogy",
        label: "\ud83d\udcd3 The Shared Notebook Analogy",
        html: `Imagine a classroom where <strong>every student has an identical copy of a notebook</strong>. When someone writes a new entry, every student\u2019s copy updates simultaneously. No one can secretly erase a page because everyone else\u2019s copy still has it. That is blockchain \u2014 thousands of copies, no single owner, impossible to cheat.`,
      },
      {
        type: "text",
        html: `<strong>Key features of Blockchain:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83c\udf10",
            title: "Decentralised",
            description: "No single authority controls it. Distributed across thousands of computers worldwide.",
          },
          {
            icon: "\ud83d\udd12",
            title: "Immutable",
            description: "Once recorded, data cannot be altered or deleted. The chain is permanent.",
          },
          {
            icon: "\ud83d\udc41\ufe0f",
            title: "Transparent",
            description: "Everyone on the network can see the transactions. Full visibility, full trust.",
          },
          {
            icon: "\ud83d\udee1\ufe0f",
            title: "Secure",
            description: "Uses cryptography to protect data. Extremely difficult to hack because every copy must match.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Applications beyond cryptocurrency:</strong> Supply chain tracking, digital voting, medical records, smart contracts (self-executing agreements), land registry, and digital identity verification.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>Common misconception:</strong> Blockchain is NOT the same as Bitcoin. Bitcoin is one application that USES blockchain. Blockchain is the underlying technology \u2014 like the internet is the technology, and email is one application.`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "Virtual Reality (VR)",
    time: "~5 mins",
    badges: [],
    hook: `Put on a headset and suddenly you are standing on Mars, swimming with whales, or performing open-heart surgery \u2014 none of it real, all of it <strong>completely immersive</strong>. That is Virtual Reality.`,
    content: [
      {
        type: "text",
        html: `Virtual Reality (VR) creates a <mark>completely artificial, computer-generated environment</mark> that replaces the real world. You wear a headset that covers your eyes and ears, cutting you off from reality and immersing you in a simulated 3D world.`,
      },
      {
        type: "image",
        src: "/images/m5/image%2030.webp",
        description: "Virtual Reality overview",
      },
      {
        type: "analogy",
        label: "\ud83e\udd3f The Diving Mask Analogy",
        html: `Wearing a VR headset is like putting on a <strong>diving mask underwater</strong> \u2014 the moment you put it on, the real world disappears and all you see is the underwater world. Take the mask off, you are back in reality. VR replaces your entire visual and audio environment.`,
      },
      {
        type: "text",
        html: `<strong>Key components of VR:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83e\udd7d",
            title: "VR Headset",
            description: "The main device. Covers your eyes with screens showing the virtual world. Examples: Meta Quest, PlayStation VR, HTC Vive.",
          },
          {
            icon: "\ud83c\udfae",
            title: "Motion Controllers",
            description: "Handheld devices that track your hand movements in VR. Lets you grab, point, and interact with virtual objects.",
          },
          {
            icon: "\ud83d\udd0a",
            title: "Spatial Audio",
            description: "3D sound that changes as you turn your head. Footsteps behind you actually sound behind you \u2014 making VR feel real.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Applications of VR:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83c\udfae",
            title: "Gaming",
            description: "Immersive games where you physically look around, duck, and reach out to interact.",
          },
          {
            icon: "\ud83c\udfe5",
            title: "Medical Training",
            description: "Surgeons practise operations in VR before touching a real patient. Zero risk, unlimited practice.",
          },
          {
            icon: "\ud83c\udfe0",
            title: "Real Estate",
            description: "Tour homes virtually from your couch \u2014 walk through rooms without physically visiting.",
          },
          {
            icon: "\ud83d\udcda",
            title: "Education",
            description: "Students explore ancient Rome, the solar system, or the human body \u2014 all from their classroom.",
          },
        ],
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Key distinction:</strong> VR = <mark>fully immersive, replaces reality</mark>. You see ONLY the virtual world. This is different from AR (next topic) which adds to reality rather than replacing it. Know this difference cold.`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "Augmented Reality (AR)",
    time: "~5 mins",
    badges: [{ text: "Most confused", type: "hot" }],
    hook: `You are looking at your real room through your phone camera, but suddenly a virtual dinosaur is standing on your table. You can walk around it. <strong>The real world is still there \u2014 AR just adds digital objects on top of it.</strong>`,
    content: [
      {
        type: "text",
        html: `Augmented Reality (AR) <mark>overlays digital content onto the real world</mark>. Unlike VR, you can still see your actual surroundings \u2014 AR just adds virtual objects, text, or graphics on top. You experience AR through a phone camera, tablet, or smart glasses.`,
      },
      {
        type: "image",
        src: "/images/m5/augmented-reality.webp",
        description: "Augmented Reality overview",
      },
      {
        type: "analogy",
        label: "\ud83e\ude9f The Window Sticker Analogy",
        html: `AR is like putting <strong>stickers on a glass window</strong>. You still see the real world through the glass. The stickers (digital objects) are added on top. VR would be painting the entire window black and projecting a new scene \u2014 you cannot see outside at all.`,
      },
      {
        type: "text",
        html: `<strong>Examples of AR you already use:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcf8",
            title: "Snapchat/Instagram Filters",
            description: "Dog ears, flower crowns \u2014 digital objects placed on your real face through the camera. That is AR!",
          },
          {
            icon: "\ud83c\udfae",
            title: "Pokemon GO",
            description: "Virtual Pokemon appear in your real-world surroundings through your phone camera. Classic AR.",
          },
          {
            icon: "\ud83d\udecb\ufe0f",
            title: "IKEA Place App",
            description: "See how virtual furniture looks in your real room before buying. Place a virtual sofa in your living room.",
          },
          {
            icon: "\ud83d\uddfa\ufe0f",
            title: "Google Maps Live View",
            description: "Point your camera at the street and see virtual arrows overlaid on the real road, guiding you.",
          },
        ],
      },
      {
        type: "table",
        headers: ["Feature", "VR (Virtual Reality)", "AR (Augmented Reality)"],
        rows: [
          { cells: ["Environment", "Completely artificial \u2014 replaces reality", "Real world with digital additions"] },
          { cells: ["Device", "VR headset (covers eyes fully)", "Phone camera, smart glasses"] },
          { cells: ["Real world visible?", "\u274c No \u2014 fully blocked", "\u2705 Yes \u2014 enhanced with virtual objects"] },
          { cells: ["Popular example", "Meta Quest, PlayStation VR", "Pokemon GO, Snapchat filters"] },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>Exam trap:</strong> VR <em>replaces</em> reality. AR <em>adds to</em> reality. If the question says \u201cyou can still see the real world\u201d \u2192 AR. If \u201cthe real world is completely blocked\u201d \u2192 VR. This distinction comes up in almost every exam.`,
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "Internet of Things (IoT)",
    time: "~5 mins",
    badges: [],
    hook: `Your fridge orders milk when it runs low. Your watch calls an ambulance if your heart rate spikes. Your lights turn on when you walk in the door. <strong>Welcome to the Internet of Things \u2014 where everyday objects become smart.</strong>`,
    content: [
      {
        type: "text",
        html: `The Internet of Things (IoT) is a network of <mark>physical objects embedded with sensors, software, and connectivity</mark> that allows them to collect and exchange data over the internet. Any \u201cdumb\u201d object becomes \u201csmart\u201d when it can connect, sense, and communicate.`,
      },
      {
        type: "image",
        src: "/images/m5/iot.webp",
        description: "Internet of Things overview",
      },
      {
        type: "analogy",
        label: "\ud83c\udfe0 The Smart Home Analogy",
        html: `Imagine every appliance in your house can <strong>talk to each other and to you</strong> through the internet. Your alarm clock tells your coffee machine to start brewing. Your thermostat notices you left and turns heating off. Your doorbell shows you who is outside \u2014 on your phone. That entire connected home is IoT in action.`,
      },
      {
        type: "text",
        html: `<strong>IoT components:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udce1",
            title: "Sensors",
            description: "Collect data from the environment \u2014 temperature, motion, light, heartbeat. The \u201ceyes and ears\u201d of IoT.",
          },
          {
            icon: "\ud83d\udcf6",
            title: "Connectivity",
            description: "Wi-Fi, Bluetooth, or cellular \u2014 sends the sensor data to the cloud or other devices.",
          },
          {
            icon: "\ud83e\udde0",
            title: "Data Processing",
            description: "The cloud or a local computer analyses the sensor data and decides what to do.",
          },
          {
            icon: "\u26a1",
            title: "Action",
            description: "Based on the analysis, the system takes action \u2014 turns on lights, sends an alert, adjusts temperature.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Real-world IoT examples:</strong> Smart watches (health tracking), smart thermostats (Nest), smart speakers (Amazon Echo), connected cars, smart agriculture (soil sensors), industrial sensors in factories, and smart city traffic systems.`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Benefits:</strong> Automation, efficiency, remote monitoring, data-driven decisions. <strong>Risks:</strong> Privacy concerns (devices always collecting data), security vulnerabilities (hackers could access your devices), and over-dependence on internet connectivity.`,
      },
    ],
  },

  // ─── Topic 9 ───
  {
    id: 9,
    title: "Introduction to Generative AI",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Traditional AI analyses data. Generative AI <strong>creates entirely new content</strong> \u2014 text, images, music, code, and video \u2014 that never existed before. ChatGPT writing an essay, DALL-E painting a picture, and AI composing music. This is the revolution.`,
    content: [
      {
        type: "text",
        html: `Generative AI refers to AI systems that can <mark>create new, original content</mark> based on patterns learned from massive amounts of training data. Instead of just classifying or predicting, these models generate text, images, audio, and video that look like they were made by humans.`,
      },
      {
        type: "image",
        src: "/images/m5/generative-ai.webp",
        description: "Generative AI overview",
      },
      {
        type: "analogy",
        label: "\ud83c\udfa8 The Art Student Analogy",
        html: `A generative AI model is like an art student who has <strong>studied millions of paintings</strong>. They have not memorised any single painting, but they have absorbed the styles, techniques, and patterns. When you ask them to \u201cpaint a sunset over mountains,\u201d they create something brand new \u2014 inspired by everything they learned, but never a copy.`,
      },
      {
        type: "text",
        html: `<strong>Types of Generative AI:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udcdd",
            title: "Text Generation",
            description: "Creates human-like text \u2014 essays, emails, stories, code. Powered by Large Language Models (LLMs).",
            tag: "ChatGPT \u00b7 Claude \u00b7 Gemini",
          },
          {
            icon: "\ud83d\uddbc\ufe0f",
            title: "Image Generation",
            description: "Creates images from text descriptions. Type \u201castronaut riding a horse\u201d and get a picture.",
            tag: "DALL-E \u00b7 Midjourney \u00b7 Stable Diffusion",
          },
          {
            icon: "\ud83c\udfb5",
            title: "Audio/Music",
            description: "Composes music, generates voice, and creates sound effects from text prompts.",
            tag: "Suno \u00b7 ElevenLabs",
          },
          {
            icon: "\ud83c\udfac",
            title: "Video Generation",
            description: "Creates videos from text descriptions or modifies existing video content using AI.",
            tag: "Sora \u00b7 Runway",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>How it works (simplified):</strong> These models are trained on billions of text/image examples. They learn statistical patterns \u2014 which words follow which, which pixels make up a face. When you give them a prompt, they predict the most likely next word/pixel until a complete output is generated.`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>Key concept:</strong> Generative AI does NOT understand or think. It predicts patterns. When ChatGPT writes a sentence, it is statistically predicting the next most likely word based on training data. It is very convincing, but it is pattern matching, not comprehension.`,
      },
    ],
  },

  // ─── Topic 10 ───
  {
    id: 10,
    title: "Ethical Use of GPTs",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `AI can write your essay in 30 seconds. It can deepfake a celebrity\u2019s face. It can spread misinformation at scale. <strong>The power is incredible \u2014 but with power comes responsibility.</strong> This topic is about using AI ethically and responsibly.`,
    content: [
      {
        type: "text",
        html: `GPT stands for <mark>Generative Pre-trained Transformer</mark> \u2014 a type of large language model. As these tools become mainstream, understanding the ethical boundaries of their use is critical. Misuse can lead to academic dishonesty, misinformation, privacy violations, and bias.`,
      },
      {
        type: "image",
        src: "/images/m5/ethical-ai.webp",
        description: "Ethical AI overview",
      },
      {
        type: "text",
        html: `<strong>Key ethical concerns:</strong>`,
      },
      {
        type: "cards",
        columns: 4,
        items: [
          {
            icon: "\ud83d\udccb",
            title: "Plagiarism & Academic Dishonesty",
            description: "Submitting AI-generated work as your own is plagiarism. Use AI to learn and assist, not to replace your thinking.",
          },
          {
            icon: "\ud83e\udd25",
            title: "Misinformation & Hallucinations",
            description: "AI can confidently generate false information (\u201challucinate\u201d). Always fact-check AI output before trusting or sharing it.",
          },
          {
            icon: "\u2696\ufe0f",
            title: "Bias & Fairness",
            description: "AI learns from human data which contains biases. AI can amplify racism, sexism, and stereotypes if not carefully managed.",
          },
          {
            icon: "\ud83d\udd10",
            title: "Privacy & Data",
            description: "Never share personal, sensitive, or confidential information with AI chatbots. Your data may be stored or used for training.",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>Guidelines for responsible AI use:</strong>`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\u2705",
            title: "Do: Use as a Learning Tool",
            description: "Use AI to explain concepts, brainstorm ideas, check your understanding, and get feedback on your work.",
          },
          {
            icon: "\u2705",
            title: "Do: Verify Everything",
            description: "Always fact-check AI-generated content. Cross-reference with reliable sources before using or sharing.",
          },
          {
            icon: "\u274c",
            title: "Don\u2019t: Submit AI Work as Yours",
            description: "Using AI to write your assignment and claiming you wrote it is academic dishonesty. Always disclose AI assistance.",
          },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>The golden rule of AI ethics:</strong> Use AI as a <mark>co-pilot, not an auto-pilot</mark>. Let it assist your thinking, but never replace it. Always verify, always disclose, always think critically about what AI tells you.`,
      },
      {
        type: "text",
        html: `<strong>Deepfakes:</strong> AI-generated fake videos or audio that make it look like real people said or did things they never did. These pose serious threats to trust, reputation, and democracy. Always question suspicious media and verify sources.`,
      },
    ],
  },
];
