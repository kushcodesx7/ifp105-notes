// Module 1 — Foundations of Computing
// Bloom's-aligned MCQs. Each topic follows the progression:
// Q1-Q2 Remember · Q3-Q4 Understand · Q5-Q7 Apply · Q8 Analyze · Q9 Evaluate · Q10 Create
// All distractors are length-balanced: every option is roughly the same
// visual length as the correct one (or longer, never shorter). This kills
// the "longest option is correct" tell. Correct-answer positions are
// distributed across 0, 1, 2, 3.

// Canonical `Question` type lives in src/types/content.ts. Re-exporting
// here for backward-compat with modules 2-5 (which do
// `import type { Question } from "./module1-mcq"`). New code should
// import directly from "@/types/content".
import type { Question } from "@/types/content";
export type { Question };

export const mcqData: Record<number, Question[]> = {
  // ─── Topic 1: Why Computers Were Invented (Speed, Accuracy, Storage, Connectivity) ───
  1: [
    { q: "Which set correctly lists the four foundational reasons computers were invented?",
      opts: [
        "Calculation (doing arithmetic), Automation (running tasks without humans), Communication (sending messages), and Simulation (modelling real-world systems)",
        "Processing (running code), Memory (short-term storage), Display (showing results on screen), and Network (connecting to the internet)",
        "Speed (doing work fast), Accuracy (doing work error-free), Storage (keeping data for later), and Connectivity (sharing data across distance)",
        "Input (taking data in), Output (sending data out), Storage (keeping data for later), and Connectivity (sharing data across distance)"
      ],
      ans: 2,
      why: "The four canonical reasons are Speed, Accuracy, Storage, and Connectivity — each solves a different human problem. The other options mix in related ideas (automation, IPO steps, or hardware parts) that describe HOW computers work, not WHY they were built.",
      bloom: "remember" },

    { q: "Which pairing correctly matches a human problem before computers with the foundational reason that solved it?",
      opts: [
        "Humans made mistakes in long math calculations, so computers were built for Speed because faster work means fewer errors",
        "Humans forgot things and paper records burned or got lost, so computers were built for Storage to keep data safe for years",
        "Humans couldn't type fast enough on typewriters, so computers were built for Accuracy because typing faster means fewer typos",
        "Humans couldn't physically travel to distant places, so computers were built for Connectivity to extend human vision further"
      ],
      ans: 1,
      why: "Paper records were fragile — fires, floods, and lost files destroyed history. Storage solved that retention problem. A mixes up Speed and Accuracy. C mislabels fast typing as Accuracy. D confuses travel with data sharing — Connectivity moves information, not people.",
      bloom: "remember" },

    { q: "A textbook claims: \"Accuracy just means computers are fast.\" What is wrong with this statement?",
      opts: [
        "Nothing wrong — speed and accuracy describe the same capability, just from different angles of the same basic idea",
        "Wrong — accuracy means executing instructions without error, which is completely separate from how fast that execution runs",
        "Wrong — accuracy only applies to mathematical calculations and scientific work, not to everyday tasks like writing or browsing",
        "Wrong — accuracy is the technical term for how much storage capacity a computer has, measured in gigabytes or terabytes"
      ],
      ans: 1,
      why: "Speed is operations per second. Accuracy is whether those operations give correct results. A slow calculator can still be perfectly accurate; a fast one can still be wrong. A collapses two ideas. C narrows accuracy to math only. D redefines accuracy as storage.",
      bloom: "understand" },

    { q: "Why is Connectivity considered a foundational reason for computers rather than just a nice extra feature?",
      opts: [
        "Because without connectivity a computer cannot turn on at all, since all modern processors need internet access to boot up properly",
        "Because sharing data across distance unlocks teamwork, banking, and services that a single isolated computer could never provide alone",
        "Because the internet came before the computer itself, and computers were specifically designed to connect to the existing network",
        "Because connectivity is a software feature that all applications need in order to process and display their results on the screen"
      ],
      ans: 1,
      why: "Connectivity turns many separate machines into one shared system — enabling email, banking, cloud, and remote work. Without it, computers would be isolated calculators. A is false (computers boot without internet). C reverses history. D confuses connectivity with processing.",
      bloom: "understand" },

    { q: "A university wants to keep 30 years of student records accessible from any campus branch, with no risk of paper fires or floods. Which of the four reasons does this primarily demonstrate?",
      opts: [
        "Only Speed matters — students expect record retrieval to feel instant when they request their transcripts from the office",
        "Only Accuracy matters — university records must contain zero errors because lawsuits could follow if data is wrong",
        "Storage combined with Connectivity — 30-year disaster-proof retention AND multi-branch accessibility are both needed",
        "Only Connectivity matters — physical paper archives already handle the 30-year long-term storage job perfectly well"
      ],
      ans: 2,
      why: "The scenario names retention (Storage) AND multi-branch reach (Connectivity). A and B each pick one side and ignore the other. D ignores the whole reason digital was chosen — paper IS the problem (fire/flood risk), so it cannot also be the solution.",
      bloom: "apply" },

    { q: "A small village clinic takes handwritten notes and photographs them with a phone camera. They email the photos to a central hospital. Which of the four reasons are they using via the phone?",
      opts: [
        "Speed primarily — the phone takes photos much faster than manually scanning each document to a PDF file on a computer",
        "Accuracy primarily — phone cameras produce exact pixel-for-pixel copies without any typing errors or transcription mistakes",
        "Connectivity primarily — email lets the central hospital review the notes from a distance without anyone needing to travel",
        "Storage primarily — the phone's memory card can hold thousands of patient photos before it runs out of space for more"
      ],
      ans: 2,
      why: "Speed, Accuracy, and Storage are all touched a little — but the KEY capability is bridging distance (village → central hospital). The clinic's bottleneck isn't fast photos or many photos; it's getting them to qualified doctors far away. That's Connectivity.",
      bloom: "apply" },

    { q: "A bank processes 10 million transactions every day without a single math error. Which two foundational reasons are most directly at work?",
      opts: [
        "Speed and Accuracy — because 10 million means fast work, and zero errors means correct work on every single transaction",
        "Storage and Connectivity — because the bank must keep records for years and share them with branches all over the country",
        "Accuracy only — because speed is not important when money is involved, since banks can take as long as they need",
        "Speed only — because 10 million is a big number and that is what shows that speed is the main reason here"
      ],
      ans: 0,
      why: "10 million/day means Speed (huge volume processed fast). Zero math errors means Accuracy. Both are needed at once. B names real bank needs but not what the scenario highlights. C wrongly says speed doesn't matter. D ignores the \"no errors\" detail which points straight at Accuracy.",
      bloom: "apply" },

    { q: "An online shop loses all customer orders every time the power goes out. Which foundational reason is the shop failing to use properly?",
      opts: [
        "Speed — the shop's website is probably too slow and that is why orders keep disappearing from the system after each outage",
        "Accuracy — the orders are being calculated wrongly and then deleted by the system because the numbers do not match up",
        "Connectivity — the shop is probably losing its internet connection during the power cut and that breaks all the orders",
        "Storage — orders are not being saved to permanent memory, so anything in temporary memory vanishes when power drops"
      ],
      ans: 3,
      why: "\"Lost when power goes out\" is the classic sign of data that was never written to permanent storage. Proper Storage would survive the outage. A, B, C each name a real concept but none explain why data vanishes on power loss — only volatile memory does that.",
      bloom: "analyze" },

    { q: "Someone argues: \"Speed is the only reason that really matters. Accuracy, Storage, and Connectivity all come from being fast.\" Evaluate this claim.",
      opts: [
        "Strong — a fast enough computer can redo any calculation, resend any message, and recreate any lost file in no time at all",
        "Strong — speed is the root capability, and modern storage and networks only exist because processors became fast enough",
        "Weak — each of the four solves a different problem, and no amount of speed fixes a lost file, a wrong answer, or isolation",
        "Weak — actually Storage is the only reason that matters because without memory a computer cannot hold any data at all"
      ],
      ans: 2,
      why: "A fast computer still can't recover a deleted file (needs Storage), still gives wrong answers if the logic is flawed (needs Accuracy), and still can't reach another city alone (needs Connectivity). The four reasons solve different problems. D swaps one wrong answer for another.",
      bloom: "evaluate" },

    { q: "Design a simple library system for a Tashkent school. Which features map to each of the four foundational reasons?",
      opts: [
        "Only a barcode scanner — it covers speed, accuracy, storage, and connectivity all by itself in one single device for the library",
        "Fast checkout (Speed) + barcode match (Accuracy) + book database (Storage) + online catalogue for students (Connectivity)",
        "Just a printed book list on the wall — students can read it fast and the paper keeps the information safe for many years",
        "A camera that watches the library — it records everything so that speed, storage, and connectivity are all handled at once"
      ],
      ans: 1,
      why: "Good design names ONE feature per reason: barcode scan = Speed, barcode verification = Accuracy, book database = Storage, online catalogue = Connectivity. A, C, D each try to make one device do everything, which misses the point of mapping features to distinct needs.",
      bloom: "create" },
  ],

  // ─── Topic 2: Evolution of Computers (Mechanical → Electronic → PC → Mobile) ───
  2: [
    { q: "Which sequence correctly orders the four eras of computing from earliest to most recent?",
      opts: [
        "Electronic Era → Mechanical Era → Personal Computer Era → Mobile and Internet Era with smartphones everywhere",
        "Mechanical Era → Electronic Era → Personal Computer Era → Mobile and Internet Era with smartphones everywhere",
        "Mechanical Era → Personal Computer Era → Electronic Era → Mobile and Internet Era with smartphones everywhere",
        "Personal Computer Era → Electronic Era → Mechanical Era → Mobile and Internet Era with smartphones everywhere"
      ],
      ans: 1,
      why: "The order is Mechanical (gears, beads, no electricity) → Electronic (vacuum tubes, room-sized) → PC (desktops in homes) → Mobile and Internet (portable, always online). Each era built on the last.",
      bloom: "remember" },

    { q: "Which device belongs to the Mechanical Era of computing?",
      opts: [
        "ENIAC, the huge vacuum-tube machine from the 1940s that filled a whole room and was used for military calculations every day",
        "The first Apple Macintosh from 1984, which brought graphical windows and a mouse into the homes of many regular families",
        "The abacus, a wooden frame with beads on rods that has been used for counting and arithmetic for thousands of years by traders",
        "The iPhone, the first widely successful smartphone that combined phone, camera, and internet into one pocket-sized device"
      ],
      ans: 2,
      why: "The abacus has no electricity, just moving beads — pure Mechanical Era. ENIAC is Electronic Era (vacuum tubes). Macintosh is PC Era. iPhone is Mobile Era. \"No electricity\" is the clearest sign of the Mechanical Era.",
      bloom: "remember" },

    { q: "Why did the Electronic Era represent a real leap over the Mechanical Era, beyond just being newer?",
      opts: [
        "Electricity let computers do thousands of operations per second, because moving electrons is far faster than moving physical gears",
        "Electronic computers were cheaper to build than mechanical ones, which let ordinary families buy them for their own homes",
        "Electronic computers were smaller than mechanical ones from day one, so they fit easily onto a single desk in any office",
        "Electronic computers had internet built in from the very beginning, which mechanical computers simply could not provide at all"
      ],
      ans: 0,
      why: "The real difference is physics: electrons move far faster than gears, which are limited by friction and weight. Size and cost improved much later — early electronic computers were actually huge and expensive. Internet came decades later, so D is wrong.",
      bloom: "understand" },

    { q: "What is the most important difference between the PC Era and the Mobile Era?",
      opts: [
        "PCs had colour screens while mobile devices still mostly use black-and-white displays even today in most modern smartphones",
        "PCs were faster than mobile devices and still are, because desktop computers always beat phones in every performance test",
        "PCs kept you at a desk, while mobile devices are portable and always online, which changed when and where we use computers",
        "PCs were invented after mobile phones, because engineers first made small devices and then scaled them up into big machines"
      ],
      ans: 2,
      why: "PCs brought computers into homes but still tied you to a desk. The Mobile Era's big shift is portability plus always-on internet — you can compute anywhere, anytime. A is factually wrong. B is only sometimes true. D reverses the real history.",
      bloom: "understand" },

    { q: "You see a device with rotating wheels, no electricity, used to do arithmetic. Which era does it belong to?",
      opts: [
        "Electronic Era — any device that does arithmetic counts as electronic, even if it has wheels and no wires plugged into it",
        "Personal Computer Era — it is a calculator, and calculators are part of the PC era when computers came to every home",
        "Mechanical Era — no electricity and moving parts are the clear signs of the mechanical era, which came first in history",
        "Mobile Era — if a device is small enough to carry around easily then it must belong to the modern mobile computing era"
      ],
      ans: 2,
      why: "\"No electricity + moving parts\" is the Mechanical Era signature. Wheels, gears, beads — the abacus, Pascaline, and Babbage's machines all fit here, no matter their size.",
      bloom: "apply" },

    { q: "A museum labels ENIAC as belonging to the \"Personal Computer Era\" because it was used to solve specific problems. Is this label correct?",
      opts: [
        "Yes — solving specific problems is exactly what personal computers do, so ENIAC fits cleanly into the PC era by that logic",
        "No — ENIAC belongs to the Electronic Era, since it used vacuum tubes and filled a whole room, unlike any personal computer",
        "Yes — ENIAC was built in the 1940s, and the 1940s count as part of the personal computer era in most history textbooks today",
        "No — ENIAC belongs to the Mobile Era, because it was used for important calculations that now run on smartphones every day"
      ],
      ans: 1,
      why: "Era is about technology and who could use it, not about purpose. ENIAC was room-sized, vacuum-tube-based, and cost millions — that's Electronic Era. PC Era means chips on a desk, affordable to families. ENIAC was decades away from that.",
      bloom: "apply" },

    { q: "Your grandmother used a typewriter in the 1960s. Which era was she in, and why?",
      opts: [
        "Electronic Era — typewriters use electricity to move the letters onto the page, which makes them electronic computing devices",
        "Mobile Era — typewriters are small and can be carried around, which makes them clear examples of mobile computing technology",
        "PC Era — typewriters are the direct ancestors of the personal computer keyboard and so they belong to the same era exactly",
        "Mechanical Era — typewriters use mechanical levers to stamp letters, not electrons to compute, so they fit the mechanical era"
      ],
      ans: 3,
      why: "Typewriters stamp letters using springs and levers — no electrons doing computation. Even electric typewriters just add a motor; they don't process data. That puts them squarely in the Mechanical Era. They are NOT computers — they are mechanical tools.",
      bloom: "apply" },

    { q: "Compare the PC Era to the Mobile Era. Which pair of improvements most clearly separates Mobile from PC?",
      opts: [
        "Bigger screens and louder speakers, which finally made it possible to watch videos and listen to music on a computing device",
        "Colour displays, which the personal computer era never actually had, since all PCs used black-and-white screens at all times",
        "Faster processors on their own, because mobile chips are always more powerful than any desktop CPU ever built before now",
        "Portability and always-on internet, which together let people use computers anywhere at any time, not just at a desk at home"
      ],
      ans: 3,
      why: "PCs already had big screens, good speakers, colour, and fast chips. The two things that truly separate Mobile from PC are portability (carry anywhere) and always-on internet. These two changes unlocked apps like maps, banking, and ride-hailing.",
      bloom: "analyze" },

    { q: "A historian says: \"The Mobile Era is just the PC Era with smaller screens — nothing fundamental changed.\" Evaluate.",
      opts: [
        "Correct — smartphones are just tiny laptops that happen to fit in a pocket, so nothing really new has been invented since the PC",
        "Correct — nothing important has changed since the PC era, because all the same programs (email, web, documents) still run today",
        "Flawed — constant internet, location awareness, and always-in-pocket ubiquity created whole new app types that PCs could not run",
        "Flawed only because smartphones have better cameras, which is the single new feature that the personal computer era missed"
      ],
      ans: 2,
      why: "A weak evaluation looks at screen size. A strong one names the NEW capabilities — always online, location awareness, always in pocket — that made entirely new app categories possible (ride-hailing, mobile banking, maps). Cameras alone (D) miss the bigger shift.",
      bloom: "evaluate" },

    { q: "Imagine the next era of computing after Mobile. Based on the pattern from Mechanical → Electronic → PC → Mobile, what is the most defensible prediction?",
      opts: [
        "Computing that dissolves into the environment — wearables, voice assistants, and AI that help without a visible device in hand",
        "Even smaller phones, maybe the size of a coin, because the trend has always been to just keep shrinking the same basic device",
        "A return to mechanical gears, because the trend in technology is always circular and old ideas eventually come back into fashion",
        "The Mobile Era again, just cheaper this time, because phones will keep getting cheaper and that is the only real change coming"
      ],
      ans: 0,
      why: "Each era reduced friction to access computing: rooms → desks → pockets → ??? The pattern suggests the device itself disappears — ambient AI, voice, wearables, glasses — where the user doesn't consciously \"use a computer.\" B just shrinks mobile. C and D ignore the pattern.",
      bloom: "create" },
  ],

  // ─── Topic 3: Input → Process → Output (IPO) ───
  3: [
    { q: "Which expansion of IPO is correct?",
      opts: [
        "Internal Processing Operation — a term that describes what happens inside the CPU when a program is running on the computer",
        "Integrated Program Output — a term for the final results that a program produces after it has finished running all its code",
        "Input, Process, Output — the three-step cycle that describes every basic computer operation, from typing a key to browsing the web",
        "Input, Protocol, Output — a networking term that describes how data moves between two computers connected over the internet"
      ],
      ans: 2,
      why: "IPO = Input → Process → Output. Every computer operation, from pressing a key to streaming a video, fits this three-step cycle. The other options sound technical but are not what IPO stands for.",
      bloom: "remember" },

    { q: "In the IPO model, what role does the Process step play?",
      opts: [
        "It captures data from the user through devices like the keyboard, mouse, microphone, and camera before anything else happens",
        "It transforms the input data into something useful by running instructions, doing calculations, or applying rules inside the CPU",
        "It displays the results to the user through devices like the monitor, speakers, or printer at the end of the full cycle",
        "It stores the data permanently on the hard drive so that the information stays safe even after the computer is switched off"
      ],
      ans: 1,
      why: "Process is the \"thinking\" step — the CPU turns input into meaningful output by running instructions. A describes Input, C describes Output, D describes Storage (a separate concept).",
      bloom: "remember" },

    { q: "Why is Output always placed after Process in the IPO cycle, never before?",
      opts: [
        "Because the letters I-P-O happen to be in that order in the English alphabet, so it is just a convention taught in textbooks",
        "Because output devices are slower than input devices, so placing them last gives them more time to warm up and get ready",
        "Because output depends on what Process produced — there is nothing meaningful to show until the CPU has done its work first",
        "Because output devices need to fully boot up before any processing can begin, which is why they always come at the end"
      ],
      ans: 2,
      why: "The order reflects cause and effect, not tradition. There's nothing to show until Process has created a result. Reversing the order would be asking the computer to show an answer before computing it.",
      bloom: "understand" },

    { q: "Why is the IPO model so widely useful for understanding computers?",
      opts: [
        "Because every computer operation — from pressing a key to running a game — can be broken down into input, processing, and output",
        "Because the IPO model describes only simple operations, and anything complex has to use a completely different model instead",
        "Because the IPO model was invented recently and applies mainly to mobile phones and tablets, not to older desktop computers",
        "Because the IPO model only applies to hardware, while software follows a completely separate model that has nothing to do with IPO"
      ],
      ans: 0,
      why: "IPO works for everything — clicking a mouse, running AI, streaming video. Its universality is its power. B, C, D each wrongly narrow IPO's scope; in reality it covers all computing, old and new, hardware and software.",
      bloom: "understand" },

    { q: "You use a fingerprint to unlock your phone and the home screen appears. Match each action to an IPO stage.",
      opts: [
        "Fingerprint = Output, matching = Input, screen = Process — because the finger is giving data out to the phone to be analysed",
        "Fingerprint = Input, matching against stored pattern = Process, home screen appearing = Output — the classic three-step flow",
        "Fingerprint = Process, home screen = Input, matching = Output — because the phone processes your finger before anything else",
        "All three steps happen at the home screen, because that is where the user sees everything and where all the action takes place"
      ],
      ans: 1,
      why: "Finger on sensor = data IN (Input). Phone comparing prints = Process. Screen appearing = data OUT (Output). That's the standard IPO flow applied to a phone unlock.",
      bloom: "apply" },

    { q: "An online banking transfer: you type an amount, the bank verifies the balance, and a confirmation message appears. Which step represents Process?",
      opts: [
        "Typing the amount into the transfer form on your phone or computer, because that is where the action of the transfer truly begins",
        "The balance check, limit check, and transfer logic running on the bank's server, which together decide whether the transfer can go ahead",
        "The confirmation message appearing on your screen, because that is the final result and so that must be the processing step here",
        "All three actions are input, because they all involve the user's account and the user is the one starting the whole transfer"
      ],
      ans: 1,
      why: "Typing is Input. Message appearing is Output. The balance check and ledger update on the server — invisible to you — are the Process step. D wrongly says all three are input; only the typing is input.",
      bloom: "apply" },

    { q: "A spell-checker in a word processor underlines misspelled words. Map this feature to IPO.",
      opts: [
        "Input = the text you type, Process = comparing each word to a dictionary, Output = the red squiggly line under misspelled words",
        "Input = the dictionary file, Process = the text you type on the keyboard, Output = the spell-check engine doing its comparisons",
        "Input = the red squiggly line, Process = the user seeing the line, Output = the user fixing the word they just typed incorrectly",
        "Input = the spell-checker button, Process = clicking it with the mouse, Output = the entire document loading onto the screen"
      ],
      ans: 0,
      why: "You type (Input). The computer checks each word against its dictionary (Process). It draws a red line under misspelled words (Output). The other options confuse which part is which — the user typing is always input, the visible result is always output.",
      bloom: "apply" },

    { q: "A student argues that Storage is \"just a kind of Output.\" Analyse whether this is correct.",
      opts: [
        "Correct — saving a file is output to the hard drive, and the hard drive is just another output device like the screen or printer",
        "Partly — storage is sometimes output but is better modelled as its own step, because it loops data back into future input cycles",
        "Correct — storage and output are literally the same thing, since both send data from the CPU out to another piece of hardware",
        "Wrong — storage has nothing to do with IPO and should be thought of as a completely separate concept not related to the cycle"
      ],
      ans: 1,
      why: "Output is what leaves the computer for the user. Storage keeps data inside so it can feed back in tomorrow as Input. Storage often follows Process, but calling it just output misses that it creates a loop back to Input — a key difference.",
      bloom: "analyze" },

    { q: "Two designers model a voice assistant. A treats it as one IPO cycle. B treats it as a chain: speech→text, text→intent, intent→answer, answer→audio, each its own IPO. Which is more useful?",
      opts: [
        "A, because simpler is always better and adding more steps just makes the system harder to understand for everyone involved",
        "A, because voice assistants only ever have one processing step, so breaking it into many smaller IPO cycles makes no real sense",
        "B, because breaking the system into smaller IPO cycles shows exactly where failures happen and lets each part be fixed on its own",
        "Neither — IPO does not apply to voice assistants at all, because they use AI which follows a completely different design model"
      ],
      ans: 2,
      why: "Designing a real system means asking which model helps you debug and improve it. Nested IPO cycles show exactly where failures happen (bad audio? wrong transcription? bad intent?) and let each stage be fixed separately. The single-cycle view hides these details.",
      bloom: "evaluate" },

    { q: "Design the IPO flow for a smart traffic light at a busy Tashkent intersection. What would you include?",
      opts: [
        "Just a timer that cycles the lights every 30 seconds, because that is the simplest possible design and simple is always best",
        "Only output lights and no inputs, because a traffic light only needs to show red, yellow, and green — nothing else matters here",
        "Cameras + pedestrian buttons + emergency vehicle radio (Input) → flow logic (Process) → signal lights + pedestrian signs (Output)",
        "Only the processor in the middle, because the sensors and lights are optional and the system works fine without them being there"
      ],
      ans: 2,
      why: "Good design names real inputs (cameras for vehicles, buttons for pedestrians, radio for emergency vehicles), a real decision process (balancing flow, pedestrian waits, emergencies), and real outputs (lights, walk signs). A timer-only light ignores actual traffic.",
      bloom: "create" },
  ],

  // ─── Topic 4: CPU (Control Unit, ALU, Registers) ───
  4: [
    { q: "Which expansion and description of CPU is correct?",
      opts: [
        "Central Protocol Unit — a piece of hardware that manages network traffic between computers and servers across the internet",
        "Common Program Utility — a type of software that runs other programs and manages their access to memory and storage",
        "Core Processing Utility — a memory chip that sits next to the RAM and helps the computer remember things for longer",
        "Central Processing Unit — the main hardware chip that executes instructions and does the actual computing work inside a computer"
      ],
      ans: 3,
      why: "CPU = Central Processing Unit. It is hardware (not software), it executes instructions (not just stores them), and it handles computation (not networking).",
      bloom: "remember" },

    { q: "Which two components sit inside a CPU?",
      opts: [
        "The Control Unit (which decides what to do) and the Arithmetic Logic Unit (which does math and comparisons on data)",
        "The hard drive (which stores files) and the power supply (which provides electricity to all the other parts of the computer)",
        "The monitor (which displays output) and the keyboard (which captures input from the user while they are typing on it)",
        "The internet router (which connects to the network) and the speakers (which play sound back out to the user as audio)"
      ],
      ans: 0,
      why: "Inside a CPU: the Control Unit (CU) directs what happens and when, and the ALU does arithmetic and logic. The other options list external devices — hard drives, monitors, routers — which are OUTSIDE the CPU.",
      bloom: "remember" },

    { q: "Why do the Control Unit and the ALU exist as separate components inside a CPU?",
      opts: [
        "It is a historical accident — engineers just drew the diagram that way and the industry kept the split for no good reason",
        "Because splitting the \"decider\" from the \"doer\" lets each be improved on its own — a standard engineering design pattern",
        "Because the ALU is physically faster than the CU, so they have to be on separate chips to avoid slowing each other down",
        "Because the CU is older technology that is being phased out, and the ALU is the newer replacement for the older control unit"
      ],
      ans: 1,
      why: "The CU decides what to do and in what order. The ALU actually does the arithmetic and logic. Splitting decider from doer is a classic engineering pattern — each can be improved independently. A and D are false; C misstates why the split exists.",
      bloom: "understand" },

    { q: "What job does a CPU register do?",
      opts: [
        "It stores personal files like documents and photos permanently, so you can find them again after rebooting the computer",
        "It is a small, extremely fast storage slot inside the CPU that holds values the CPU is working on right this instant",
        "It is a connector on the back of the computer that lets you plug in devices such as a keyboard, mouse, or printer",
        "It is a type of antivirus software that registers each program when it tries to start up on the machine for the first time"
      ],
      ans: 1,
      why: "Registers are tiny, ultra-fast slots inside the CPU for values being used RIGHT NOW. They are faster than RAM and far faster than disk. A describes storage. C describes ports. D invents a meaning — registers have nothing to do with antivirus.",
      bloom: "understand" },

    { q: "A program needs to check whether a user's balance minus a withdrawal is still greater than zero. Which CPU component performs BOTH the subtraction and the comparison?",
      opts: [
        "Control Unit, because it controls all of the logic in the program and so it must also be the part that does comparisons like this",
        "Arithmetic Logic Unit, because the ALU handles arithmetic (subtraction) AND logic (is the result greater than zero?) in one place",
        "Registers, because the balance and withdrawal values are stored there and so the comparison must also happen inside them",
        "Main RAM, because all of the calculations that a computer does take place inside the RAM rather than in the CPU itself"
      ],
      ans: 1,
      why: "ALU literally stands for Arithmetic Logic Unit. Subtract = arithmetic. \"Is result > 0?\" = logic. Both live in the ALU. The Control Unit decides what to do but doesn't do the math itself.",
      bloom: "apply" },

    { q: "A program sums numbers in a tight loop a million times. Where does the CPU keep the running total for fastest access?",
      opts: [
        "On the hard drive, because that is the safest place to keep any value that the computer might need to use at a later time",
        "In ROM, because ROM is fast and it never loses its contents, which makes it ideal for values used a million times in a row",
        "In cloud storage, because the cloud has infinite capacity and so it can handle a million operations without slowing down at all",
        "In a CPU register, because registers are measured in picoseconds while RAM is in nanoseconds and disk is in milliseconds"
      ],
      ans: 3,
      why: "Registers are inside the CPU, measured in picoseconds. RAM is nanoseconds (1000x slower). Disk is milliseconds (1,000,000x slower). For a value touched a million times per second, only a register is fast enough.",
      bloom: "apply" },

    { q: "A gaming PC feels slow in a new game. Which CPU-related upgrade is most likely to help?",
      opts: [
        "Upgrading the monitor to a larger 4K display, because a bigger screen will make the game look faster and feel more responsive",
        "Adding more RAM to the system, because more memory always equals more speed for every possible type of computing workload",
        "Upgrading to a CPU with more cores and a higher clock speed, since games need fast decision-making and parallel work at once",
        "Installing a new copy of the operating system, because a fresh OS install always fixes any kind of slowness in any application"
      ],
      ans: 2,
      why: "Games are CPU-heavy — they need fast instruction execution (clock speed) and parallel work (cores). A monitor doesn't change speed. More RAM helps memory-bound tasks but won't fix CPU bottlenecks. A reinstall is unrelated to the CPU itself.",
      bloom: "apply" },

    { q: "A CPU is advertised as \"8-core at 2.4 GHz.\" Another as \"2-core at 4.8 GHz.\" For a video-editing workstation running many parallel renders, why is the 8-core the right choice?",
      opts: [
        "Because higher core count is always better in every single situation, no matter what software the user is actually running",
        "Because 2.4 GHz is somehow faster than 4.8 GHz when you compare them on a modern CPU, even though the numbers seem wrong",
        "Because parallel renders run independently on different cores, so 8 × 2.4 GHz gives more total throughput than 2 × 4.8 GHz",
        "Because the 8-core chip is newer and any newer chip is always the better buy, no matter what workload you plan to run on it"
      ],
      ans: 2,
      why: "Clock speed is per-core throughput. Cores are independent workers. Parallel renders run on different cores at once — 8 × 2.4 GHz = 19.2 total GHz vs 2 × 4.8 = 9.6 for the dual-core. When the work parallelises, more workers beats faster workers.",
      bloom: "analyze" },

    { q: "A school is choosing between (A) 2 GHz quad-core CPUs and (B) 4 GHz single-core CPUs for workstations that run a browser, word processor, and video chat all at once. Which is the better buy?",
      opts: [
        "B, because higher GHz is always better than lower GHz for any possible computing task, including schoolwork and video chat",
        "Neither, because GHz is completely irrelevant to real-world performance and nobody should look at GHz when buying a computer",
        "They are the same, because GHz multiplied by cores always gives the same total performance no matter how you split it up",
        "A, because three programs running at the same time benefit from multiple cores handling each app independently on its own core"
      ],
      ans: 3,
      why: "Three apps running side by side is exactly where multiple cores pay off. A single 4 GHz core would bottleneck switching between them. A gives each app its own core. GHz × cores isn't literally the same (D wrong) but for this workload, A wins.",
      bloom: "evaluate" },

    { q: "Design a simplified CPU for a smart thermostat. What minimal set from {Control Unit, ALU, Registers, Cache} would you include?",
      opts: [
        "Nothing at all, because a thermostat is a simple device and it does not need any kind of CPU to do its basic job of heating",
        "Control Unit + ALU + a handful of registers, because thermostats do light work (read temperature, compare, toggle relay) that fits",
        "All four components identical to a gaming PC, because every CPU must have the same parts no matter how simple the task is",
        "Only registers with no CU or ALU at all, because registers store the temperature and that is all the device needs to function"
      ],
      ans: 1,
      why: "Thermostats do light work: read temperature, compare to setpoint, toggle relay. CU directs flow, ALU compares numbers, registers hold the reading. Cache exists to hide RAM latency for big workloads — overkill for a thermostat. Good design matches parts to workload.",
      bloom: "create" },
  ],

  // ─── Topic 5: Memory (RAM vs ROM) ───
  5: [
    { q: "Which statement correctly describes RAM?",
      opts: [
        "Fast, volatile working memory — it holds the data and programs the CPU is using right now, and loses its contents on power off",
        "Permanent storage for the operating system and personal files, which survives power loss and keeps data for many years",
        "A read-only chip that contains startup instructions that the computer runs the moment it is switched on for the first time",
        "A type of hard drive with no moving parts that is used to store programs, documents, and photos over long periods of time"
      ],
      ans: 0,
      why: "RAM = Random Access Memory. Fast (good), volatile (data vanishes on power loss). B describes storage, C describes ROM, D describes SSDs — all different components.",
      bloom: "remember" },

    { q: "Which statement correctly describes ROM?",
      opts: [
        "Fast, changeable memory that the CPU uses to store the programs and files a user is working with right now in the current session",
        "Read-only memory that keeps its contents without power, used to hold startup instructions the computer needs the moment it boots",
        "A type of cloud service that stores files online and lets a user access them from any device connected to the internet anywhere",
        "A giant hard drive built into the motherboard that stores the operating system and all the user's personal documents permanently"
      ],
      ans: 1,
      why: "ROM = Read-Only Memory. Non-volatile (keeps contents without power) and holds boot instructions. A describes RAM. C describes cloud storage. D describes a built-in SSD — not ROM.",
      bloom: "remember" },

    { q: "Why is ROM specifically used for boot instructions instead of RAM or the hard drive?",
      opts: [
        "Because ROM is faster than RAM and that speed is needed during the boot process when the computer starts up for the first time",
        "Because ROM is cheaper per gigabyte than a hard drive, which lets computer makers save money on the overall cost of the machine",
        "Because ROM keeps its contents without power, so the CPU has instructions the moment power is applied, before anything else loads",
        "Because ROM is newer technology than RAM and the hard drive, so it naturally replaced them for the job of storing boot code"
      ],
      ans: 2,
      why: "At power-on, RAM is blank and the hard drive hasn't been read yet. Something must tell the CPU what to do first. ROM keeps its contents without power, so instructions are waiting the moment the machine turns on. A is false (ROM is slower than RAM).",
      bloom: "understand" },

    { q: "Why do computers have both RAM and storage instead of just one big pool of memory?",
      opts: [
        "Because RAM is extremely fast but expensive per gigabyte, while storage is slower but cheap — so they play different roles together",
        "Because of an old tradition that is slowly disappearing — modern computers are starting to use just one type of memory for both",
        "Because RAM and storage are manufactured by different companies, and the industry never agreed to combine them into one chip",
        "Because the CPU cannot access storage directly at all, so RAM is added only as a translator between the CPU and the hard drive"
      ],
      ans: 0,
      why: "RAM is fast but costly — you get gigabytes. Storage is slow but cheap — you get terabytes. Using both means hot data lives in fast RAM, while cold data lives in cheap storage. B, C, D each invent reasons that don't match how computers actually work.",
      bloom: "understand" },

    { q: "You are editing a 10-page document. The building loses power. After reboot, the last two pages are gone but earlier pages (saved 5 minutes ago) are intact. Explain what happened.",
      opts: [
        "ROM lost its contents during the power cut, which caused the two most recently edited pages to disappear from the document",
        "The hard drive is the only part that loses data during power cuts, which is why your last two pages of work are now gone",
        "The saved pages went to non-volatile storage and survived, while the unsaved pages were in volatile RAM and vanished on power loss",
        "The CPU somehow forgot those two pages during the reboot, which is why they are no longer part of your document after restart"
      ],
      ans: 2,
      why: "\"Lost everything since the last save\" is the signature of RAM volatility. Storage keeps data across power cuts; RAM does not. The \"save\" button moves data from RAM to storage. A and B are backwards. D misdescribes how memory works.",
      bloom: "apply" },

    { q: "A smartphone spec lists \"8 GB RAM, 256 GB storage.\" Your friend says \"the 256 is more important because it's bigger.\" What is more precise advice?",
      opts: [
        "Agree — a bigger number always means better, and 256 is much bigger than 8, so 256 GB of storage must be the more important one",
        "They are the same kind of memory with different labels, so comparing them directly is not a meaningful thing to do at all",
        "Disagree — only RAM matters in a smartphone, since storage is only used for backing things up rather than for running any apps",
        "They do different jobs — storage decides how much you can KEEP; RAM decides how much you can USE AT ONCE without slowdown"
      ],
      ans: 3,
      why: "256 GB storage = how much you can KEEP (photos, apps, files). 8 GB RAM = how much you can USE AT ONCE. Both matter for different reasons. Good advice names both jobs instead of treating memory as one number.",
      bloom: "apply" },

    { q: "A computer freezes when you open too many Chrome tabs. Which memory is most likely the bottleneck?",
      opts: [
        "ROM — too many tabs use up the boot instructions that are stored in ROM, which slows down the computer and makes it freeze",
        "The hard drive — opening tabs writes lots of files, and eventually the hard drive runs out of space to save new information",
        "RAM — each tab holds page data in RAM, and running out of RAM forces the OS to swap to slow disk, causing the freeze",
        "The CPU cache — Chrome tabs need cache, and when cache fills up the whole system comes to a stop until it clears out"
      ],
      ans: 2,
      why: "Each tab keeps page data (images, scripts, history) in RAM. Run out of RAM and the OS starts swapping to the much slower disk, which feels like a freeze. A is wrong (ROM isn't for tabs). D is close but cache isn't the main bottleneck; RAM is.",
      bloom: "apply" },

    { q: "A server is swapping heavily — the OS is constantly moving data between RAM and disk, and everything feels slow. Analyse the root cause.",
      opts: [
        "The CPU is running at its maximum clock speed, which is causing the system to heat up and slow down to protect the hardware",
        "Swap is a normal feature rather than a problem, and there is nothing that needs to be diagnosed or fixed in this situation at all",
        "The hard drive is nearly full and cannot save any more data, which is why the whole system is running so slowly right now",
        "The working set has exceeded RAM, so the OS is using disk as overflow — and since disk is 1000x slower, performance collapses"
      ],
      ans: 3,
      why: "\"Slow + heavy disk activity + high memory pressure\" = swap thrashing. Disk is ~1000x slower than RAM, so performance collapses. The fix: add RAM or reduce demand. A, B, C each name plausible-sounding but wrong causes.",
      bloom: "analyze" },

    { q: "A startup stores all customer orders \"only in RAM for speed\" and skips writing to disk. Evaluate this choice.",
      opts: [
        "Good — RAM is faster than disk, so keeping orders in RAM will make the website feel much more responsive to all customers",
        "Dangerous only if the RAM is small, because with enough RAM the orders will never be lost even when the power goes out",
        "Good — disks are obsolete technology, and all modern systems have moved entirely to RAM-only storage for every task now",
        "Dangerous — any restart, crash, or power event wipes every order since last start; production needs durable storage for orders"
      ],
      ans: 3,
      why: "A single power cut, crash, or reboot deletes every order. Production needs durable storage. RAM is a cache, not a source of truth. The right pattern is RAM for speed PLUS disk/database for durability. A, B, C each miss the data-loss risk.",
      bloom: "evaluate" },

    { q: "Design the memory setup for a 4K video-editing workstation that runs Premiere Pro, Chrome with 20 tabs, and two preview monitors. Justify each choice.",
      opts: [
        "32–64 GB RAM + 1–2 TB NVMe SSD + standard ROM, because 4K editing needs huge RAM and the SSD must keep up with file I/O",
        "8 GB RAM + 256 GB hard drive, because that is cheaper and video editing does not really need more memory than a normal PC does",
        "64 GB ROM and skip the RAM entirely, since ROM is non-volatile and will never lose any of the video editor's working project data",
        "Only cloud storage with no local memory, because cloud is always faster than local drives and never runs out of storage space"
      ],
      ans: 0,
      why: "4K editing has huge working sets (needs lots of RAM for 4K frames + many apps) and huge file I/O (needs fast NVMe SSD). A hard drive bottlenecks editing. ROM can't hold working data. Cloud isn't fast enough for real-time editing. Good design matches capacity to workload.",
      bloom: "create" },
  ],

  // ─── Topic 6: Input Devices ───
  6: [
    { q: "Which of the following is the correct definition of an input device?",
      opts: [
        "Any device that plugs into the computer via USB, whether it is sending data in, sending data out, or storing data on the machine",
        "A device that sends data INTO the computer, such as a keyboard, mouse, microphone, or camera capturing information for the CPU",
        "A device that displays the results of processing to the user, such as a monitor, a speaker, or a printer showing the final output",
        "A device that stores data permanently, such as a hard drive, an SSD, or a USB flash drive that keeps files after power is gone"
      ],
      ans: 1,
      why: "\"Input\" is directional — data flows IN. USB is just a port, not a direction. Monitors and speakers are output. Storage is a separate role. The direction of the data flow is what defines input.",
      bloom: "remember" },

    { q: "Which of the following is an input device?",
      opts: [
        "A monitor, which is the screen that shows the user the results of the processing that the computer has just completed for them",
        "A printer, which takes a digital document and makes a paper copy that the user can hold in their hand and read at any time",
        "A microphone, which captures the sound of a person speaking and sends that audio into the computer for processing and recording",
        "A speaker, which takes the audio signal produced by the computer and turns it into sound that the user can actually hear clearly"
      ],
      ans: 2,
      why: "A microphone captures sound and sends it INTO the computer — classic input. Monitors, printers, and speakers all send data OUT to the user, making them output devices.",
      bloom: "remember" },

    { q: "Why are touchscreens classified as input/output (I/O) devices rather than just input or just output?",
      opts: [
        "Because they are more expensive than a normal keyboard, and the high cost is what makes them count as both input and output at once",
        "Because they display content AND register touches through the same physical surface, meaning data flows both IN and OUT of it",
        "Because they always require a special driver to work, which is what moves them from the input-only category into the I/O category",
        "Because they can be switched off by the user at any time, which is the feature that officially classes them as I/O rather than input"
      ],
      ans: 1,
      why: "Classification is about direction of data flow. A touchscreen both shows pixels (out) and reports finger positions (in) through the same surface — so it plays both roles. Cost, drivers, and power have nothing to do with the I/O label.",
      bloom: "understand" },

    { q: "What makes a pressure-sensitive stylus an input device rather than just a pointer?",
      opts: [
        "It moves the cursor on the screen, which is the only thing that matters for calling any hardware device an input device in practice",
        "It only works with certain software applications, and that limitation is what makes it qualify as a specialised kind of input device",
        "It has its own battery inside it, which provides the electrical power that is required for something to be classed as an input device",
        "It sends position, pressure, and tilt data INTO the computer — several streams at once, which is richer input than a mouse provides"
      ],
      ans: 3,
      why: "Input is about what data goes IN. A stylus sends position, pressure, tilt, sometimes rotation — all at once. That richness is why designers prefer it over a mouse, which sends only position and button clicks. A, B, C each miss what makes it input.",
      bloom: "understand" },

    { q: "A food delivery driver scans a QR code with their phone camera to mark a parcel delivered. The camera is serving as what kind of device here?",
      opts: [
        "Input, because the camera is capturing the QR code's image data and feeding it into the app for the phone to decode and process",
        "Output, because the camera is showing the user what the QR code looks like on the screen while they line up the shot carefully",
        "Processing, because the camera is the part of the phone that actually decodes the QR code and turns it into useful information",
        "Storage, because the photo of the QR code is saved to the phone's storage so that the driver has a permanent record of delivery"
      ],
      ans: 0,
      why: "The camera pulls the QR pattern INTO the phone — that's input. Decoding happens later in the processor. The camera itself is a sensor, and direction of data flow is IN, so it's an input device.",
      bloom: "apply" },

    { q: "At a supermarket self-checkout, a customer scans items with a barcode reader. What type of device is the barcode reader?",
      opts: [
        "Output, because the barcode reader displays prices on its little LED screen, which is the main way it communicates with the customer",
        "Input, because the reader captures the barcode pattern and sends the product code INTO the cash register for lookup in the database",
        "Processing, because the reader is the part of the checkout system that decides what the price of each item should be at that moment",
        "Storage, because the reader keeps a list of all the items scanned today and remembers them permanently for accounting purposes"
      ],
      ans: 1,
      why: "The barcode reader captures the pattern and sends a product code IN to the till. That's input. The till then processes (looks up the price) and outputs (shows the total, prints the receipt). The reader itself has only one job: input.",
      bloom: "apply" },

    { q: "A student uses voice dictation to write an essay. Which device is the input device, and what data is it sending?",
      opts: [
        "The speakers are the input device, because they vibrate and convert the student's voice into electrical signals for the processor",
        "The monitor is the input device, because the student reads the essay on the screen and decides what words to say out loud next",
        "The microphone is the input device, because it captures sound waves from the student's voice and sends audio data into the computer",
        "The hard drive is the input device, because it receives the audio and sends it into the dictation software for word-by-word matching"
      ],
      ans: 2,
      why: "The microphone captures sound and sends audio data IN — that is input. Speakers play sound out (output). The monitor displays text (output). The hard drive stores data. Only the mic fits the \"sends data INTO the computer\" definition.",
      bloom: "apply" },

    { q: "A voice assistant mis-transcribes \"book a meeting at four\" as \"book a meeting at for.\" Analyse where in the input pipeline the error likely occurred.",
      opts: [
        "The microphone is broken, because otherwise it would have captured the word correctly and the assistant would have understood it",
        "The speakers are wrong, because they are part of the input pipeline and they affect how the assistant hears each spoken word",
        "Downstream in the speech-to-text model, not the microphone — the audio was captured fine but converted to the wrong homophone",
        "The hard drive corrupted the audio file, which is why the assistant heard a different word than the one the user actually said"
      ],
      ans: 2,
      why: "The mic likely captured the audio correctly — \"four\" and \"for\" sound identical. The error is in the speech-to-text model choosing the wrong homophone. Replacing the mic wouldn't fix that; it's a language-model issue, not an input-hardware issue.",
      bloom: "analyze" },

    { q: "For a public library's self-checkout kiosk used mostly by elderly patrons, which primary input method is best?",
      opts: [
        "Keyboard only, because it is the cheapest possible option and any money saved there can go into buying more books for the library",
        "Mouse and trackball only, because these are the traditional devices that everybody already knows how to use from many years of practice",
        "Gesture recognition through a webcam, because it is futuristic and will make the library look modern to all visitors who walk in",
        "A large touchscreen + barcode scanner + voice prompts, because big targets, few typed characters, and alternative modes fit the users"
      ],
      ans: 3,
      why: "Evaluating input choices means weighing the user group. Elderly patrons benefit from large targets (touch), fewer typed characters (barcode scanner), and alternative modes (voice). Keyboard-only optimises for the wrong user. Gesture is a gimmick for this group.",
      bloom: "evaluate" },

    { q: "Design the input system for a hospital operating theatre where surgeons' hands must stay sterile. Which inputs fit, and why does a standard keyboard not work?",
      opts: [
        "Standard keyboard and mouse on the operating table, because they are familiar and every surgeon in every hospital already knows how to use them",
        "No inputs at all, because surgeons during an operation do not actually need any computer input at all and just focus only on the patient",
        "A microphone alone with no other input, because a single microphone handles 100% of a surgeon's possible needs during an operation",
        "Foot pedals + voice commands + gesture sensors, because hands-free modalities honour the sterility constraint and keyboards cannot"
      ],
      ans: 3,
      why: "Hands-free inputs (foot, voice, gesture) exist exactly for scenarios where keyboards can't serve. They minimise contact after scrub-in; keyboards can't be reliably sterilised and tie up hands the surgeon needs for instruments. Designing for a constraint means honouring it.",
      bloom: "create" },
  ],

  // ─── Topic 7: Output Devices ───
  7: [
    { q: "Which of the following is the correct definition of an output device?",
      opts: [
        "A device that communicates results from the computer to the user, such as a monitor, printer, speaker, or vibrating motor",
        "Any device that requires electricity to work, whether it sends data in, sends data out, or stores data on the computer",
        "A device that captures user actions and sends them into the computer, such as a keyboard, mouse, camera, or microphone",
        "A device that connects the computer to the internet, such as a router, a modem, or a wireless network card inside the machine"
      ],
      ans: 0,
      why: "Output is directional — data flows OUT of the computer to the user. Electricity use is irrelevant. Input devices capture user actions (opposite direction). Networking is a separate role.",
      bloom: "remember" },

    { q: "Which of the following is an output device?",
      opts: [
        "A keyboard, which the user presses to type words and send those words into the computer for the CPU to process right away",
        "A mouse, which the user moves to point at things on the screen and send position data into the computer for processing",
        "A printer, which takes a digital document and produces a paper copy that the user can hold, read, or file away for later use",
        "A scanner, which takes a paper document and sends the image of it into the computer so that the computer can process the file"
      ],
      ans: 2,
      why: "A printer takes digital data and produces a physical result OUT to the user — that's output. Keyboards, mice, and scanners all send data IN, making them input devices.",
      bloom: "remember" },

    { q: "What is the meaningful difference between a \"hard copy\" and a \"soft copy\" of a document?",
      opts: [
        "Hard copies are always more accurate than soft copies, because the printer checks each letter more carefully than a screen ever does",
        "Soft copies are digital (screen, file, email); hard copies are physical (ink on paper) — two different media, not two qualities",
        "Hard copies are always bigger in size than soft copies, because paper versions include more details than digital versions ever do",
        "Soft copies cannot be shared with other people, which is why they are called soft — because they are restricted to just one device"
      ],
      ans: 1,
      why: "The difference is the medium, not the content. Soft = digital (screen, file). Hard = physical (ink on paper). The same essay can be both. A, C, D each invent meanings that don't match how the terms are really used.",
      bloom: "understand" },

    { q: "A blind user listens to a screen reader that speaks the contents of web pages aloud. What kind of device is delivering output to this user?",
      opts: [
        "Speakers are the output device, because they convert the screen reader's text-to-speech output into sound waves the user can hear",
        "The microphone is the output device, because it handles all sound output on a computer and the user hears sound through it in this case",
        "The keyboard is the output device, because the blind user relies on the keyboard to hear what the computer wants to tell them next",
        "The screen is the output device, because a screen reader always displays text visually for the user to read on the monitor first"
      ],
      ans: 0,
      why: "Speakers take digital audio and produce sound waves for the user — classic output. Microphones are input (they capture sound going IN). Keyboards are input. The screen exists but the USER in this scenario is hearing the output through speakers.",
      bloom: "understand" },

    { q: "A phone vibrates when a message arrives. Classify the vibration.",
      opts: [
        "Input, because the phone is sensing the environment and converting that motion into data the CPU can process and understand",
        "Output, because the phone is communicating a state (new message arrived) to the user through the medium of physical motion",
        "Processing, because the CPU is doing work to create the vibration and that work is what makes the device count as processing",
        "Storage, because the incoming message is saved to the phone's memory at the same time that the vibration happens on the device"
      ],
      ans: 1,
      why: "Haptic feedback is the computer TELLING YOU something (new message), even without screen or sound. That's output by definition — direction of information flow matters, not the medium. Motion is just an unusual output medium.",
      bloom: "apply" },

    { q: "A student claims: \"The monitor shows output, so if I can see it on the screen, it's output.\" Apply the definition: is a cursor moving in response to the mouse output?",
      opts: [
        "No, because cursor motion is caused by the mouse, and the mouse is an input device, so the cursor must be an input too by logic",
        "It is neither input nor output, because cursors are a special category of screen element that does not fit the usual IPO model",
        "Yes, because the cursor on the screen is rendered by the GPU and displayed on the monitor, which is the output side of the IPO cycle",
        "Only if the mouse has a light underneath it, because the LED is what actually puts the cursor image onto the monitor for the user"
      ],
      ans: 2,
      why: "Input and output are defined by direction, not source. The mouse sends data IN. The cursor position is rendered by the GPU and displayed on the monitor — output. Two ends of one IPO cycle: mouse is input, cursor is the visible result of processing it.",
      bloom: "apply" },

    { q: "A car navigation system speaks directions and shows them on a screen. Which output devices are being used?",
      opts: [
        "The microphone speaks directions, and the monitor shows the map — both of those parts are the output devices in this system",
        "The GPS is the output device, because it is the part of the system that communicates the user's current location to the driver",
        "The steering wheel is the output device, because it gives the driver feedback about where the car is supposed to go next",
        "The speaker delivers the spoken directions, and the screen displays the map — both send information OUT to the driver at once"
      ],
      ans: 3,
      why: "Speaker (audio out) + screen (visual out) both deliver information to the driver. Microphones are input (they capture sound IN). GPS is a sensor — it gives input to the system. The steering wheel is a control, not an output device.",
      bloom: "apply" },

    { q: "A projector, a monitor, and a printer all present the same slide deck. Analyse which dimensions each device optimises.",
      opts: [
        "They are all identical in every way, because they all show the same slides, so the choice between them does not matter at all",
        "Only monitors matter in a real classroom setting, because projectors and printers are outdated technology that no one uses now",
        "Only printers matter, because a paper copy of the slides is the only permanent record and the other two are just temporary displays",
        "Each optimises different dimensions — projector for large audiences, monitor for high fidelity, printer for permanence and take-home"
      ],
      ans: 3,
      why: "Projector = large audience, temporary, lower fidelity. Monitor = small audience, temporary, high fidelity. Printer = any audience, permanent, high fidelity, high cost per copy. Real analysis maps each device onto its trade-offs. A, B, C each oversimplify.",
      bloom: "analyze" },

    { q: "A small business must choose ONE output for invoices: printer, PDF export (email), or both. Evaluate.",
      opts: [
        "Printer only, because paper invoices look professional and customers always expect to receive their invoices on paper at the end of a job",
        "PDF primary for speed and email, with a printer as an on-demand fallback for customers who specifically request paper copies of invoices",
        "PDF only, because it is always cheaper than printing on paper and absolutely no customer ever needs paper for any reason in any case",
        "Neither of them, because invoices are not really important to a small business and can just be sent as plain text in a normal email"
      ],
      ans: 1,
      why: "PDF is fast, free to duplicate, searchable, and archivable — strictly more versatile as the primary. Printer remains a fallback for customers who need paper. PDF-only may fail for some legal scenarios. Evaluation weighs cost, speed, legal needs, and customer preference.",
      bloom: "evaluate" },

    { q: "Design the output system for a self-driving car. Which outputs are necessary to serve BOTH passengers AND the environment around the car?",
      opts: [
        "Passenger outputs (dashboard + voice + haptic seat) + environment outputs (headlights, indicators, horn, brake lights, external signals)",
        "A single dashboard screen inside the car, because that is all the information that a self-driving car's passengers ever really need",
        "Only speakers inside the car for playing music, because the self-driving car handles everything else automatically on its own now",
        "Only the headlights and no other outputs, because they are the one part of a car that really communicates with other road users"
      ],
      ans: 0,
      why: "A car communicates with occupants AND with drivers/pedestrians around it. Passenger outputs: dashboard, voice, haptics. Environment outputs: lights, indicators, horn, brake lights, external signals. Skipping either audience makes the system unsafe or useless.",
      bloom: "create" },
  ],

  // ─── Topic 8: Storage (HDD, SSD, USB, Cloud) ───
  8: [
    { q: "Which statement about secondary storage (HDD, SSD, USB) is correct?",
      opts: [
        "It is volatile, meaning the contents are lost when the power is removed, which is why users must save their work often on a computer",
        "It replaces the CPU during the boot process, because the CPU is not active yet and storage takes over all computing tasks at startup",
        "It is non-volatile and holds files long-term, which is why your documents, photos, and programs are still there after a reboot",
        "It is the exact same physical chip as RAM, just labelled differently, because RAM and storage are two names for a single component"
      ],
      ans: 2,
      why: "Secondary storage (HDD, SSD, USB, cloud-backed disks) is non-volatile — contents persist across power cycles. That's precisely what separates it from RAM (primary, volatile). A, B, D each describe other components or invent false claims.",
      bloom: "remember" },

    { q: "Which of the following is an example of secondary storage?",
      opts: [
        "RAM, the fast working memory that the CPU uses to hold programs and data that it is actively using right now in the current session",
        "CPU cache, the very small and very fast memory inside the CPU that holds values the processor is about to use in the next few cycles",
        "An SSD, a solid-state drive that holds files, programs, and the operating system long after the computer has been switched off",
        "A ROM chip, a non-volatile memory on the motherboard that stores the boot instructions the CPU runs when the power is first applied"
      ],
      ans: 2,
      why: "SSDs are secondary storage — non-volatile, holds files long-term. RAM and cache are primary (volatile, working memory). ROM is also non-volatile but holds only boot instructions, not user files. Secondary storage = user-facing files.",
      bloom: "remember" },

    { q: "Why is an SSD typically faster than an HDD for opening large applications, even at the same capacity?",
      opts: [
        "SSDs are physically larger than HDDs, so they can hold more data at once, which makes every operation feel faster to the user",
        "SSDs read electronically from flash chips; HDDs must physically move a read head over a spinning disk, which takes milliseconds",
        "SSDs have better internet connections built into them than HDDs, which is the main reason they feel faster to users in practice",
        "HDDs need to warm up before they can read anything, while SSDs work instantly, which is the real reason SSDs feel faster overall"
      ],
      ans: 1,
      why: "HDDs have a spinning disk and a head that physically seeks each location (milliseconds). SSDs read from flash chips electronically (microseconds). That's why boot times dropped from 60s to 10s when laptops switched to SSD. Size, internet, warm-up are all wrong.",
      bloom: "understand" },

    { q: "Why is cloud storage useful even for someone who already owns a large hard drive?",
      opts: [
        "Because cloud storage is always completely free, and paying for a hard drive is a waste of money when there is a free option",
        "Because cloud storage lets you access your files from any device with internet, and it protects against local disasters like fire or theft",
        "Because cloud storage is always faster than any local drive, regardless of the internet speed available at the time of the access",
        "Because cloud storage is the only type of storage that is really secure, and local drives cannot be protected from attackers at all"
      ],
      ans: 1,
      why: "Cloud's advantages are multi-device access (laptop, phone, parent's PC) and off-site backup (fire, theft, drive failure don't wipe everything). A is false (most clouds charge). C is false (local is usually faster). D is wrong (local can be secure too).",
      bloom: "understand" },

    { q: "You are backing up family photos and need them accessible from your laptop at home, your phone on trips, and your parents' computer. Which approach fits?",
      opts: [
        "A single USB drive kept in a drawer at home, because that way the photos are in one safe place that nobody else can ever access",
        "Only the phone's internal storage, because the phone is always with you and that makes it the most convenient storage option by far",
        "A hard drive locked inside a safe at home, because that protects the photos from theft and is all that any family really needs",
        "Cloud storage plus a local copy on the laptop, because cloud gives multi-device access and a local copy provides offline backup"
      ],
      ans: 3,
      why: "The scenario's keyword is multi-device access. Cloud reaches any device with internet; a local copy on the laptop provides offline access and extra safety. A USB in a drawer fails the multi-device test. Phone-only loses photos if phone breaks. A safe isolates data.",
      bloom: "apply" },

    { q: "A photographer has 2 TB of RAW files. She edits a small \"current project\" (~50 GB) daily and archives the rest. Which storage layout fits?",
      opts: [
        "Keep absolutely everything on one HDD, because that is the simplest possible setup and it keeps all the files in one single place",
        "SSD for current project + HDD/NAS for archive + cloud backup — hot data on fast disk, cold data on cheap disk, disaster copy in cloud",
        "Keep absolutely everything on a single USB stick, because USB drives are portable and that lets her take her work anywhere with her",
        "Cloud only and no local copies at all, because the cloud is large enough to hold 2 TB and she always has an internet connection"
      ],
      ans: 1,
      why: "Applying storage tiers means matching speed to usage. Fast SSD for OS + current project (edit speed). Large HDD or NAS for archive (cheap per GB, slower is fine). Cloud for disaster recovery. This tiered pattern is standard on professional workstations.",
      bloom: "apply" },

    { q: "You have a 200 MB PowerPoint file that you need to share with a classmate by tomorrow. Which storage option is most practical?",
      opts: [
        "Burn a CD and physically hand it over, because CDs are reliable and your classmate's laptop definitely has a CD drive built into it",
        "Copy it to an external HDD and drive across town, because external hard drives are the most reliable way to transfer large files today",
        "Upload to cloud storage and share a link, because 200 MB is easy for any cloud service and your classmate opens a link from anywhere",
        "Email the file as an attachment, because email always handles any file size without limits and your classmate always checks email daily"
      ],
      ans: 2,
      why: "Cloud + share link is fast and works over any internet connection. CDs are obsolete (most laptops have no drive). Driving across town wastes hours. Email usually caps attachments at 25 MB — 200 MB will be rejected. Match the tool to the scenario.",
      bloom: "apply" },

    { q: "A university department backs up all research only to a single external hard drive kept next to the server. Analyse the risks.",
      opts: [
        "There are no risks at all, because external hard drives are reliable devices and one of them is always enough for any kind of backup",
        "The only risk is that the drive might run out of space, which is easily fixed by buying a bigger drive when the current one fills up",
        "Single point of failure — theft, fire, flood, or ransomware can destroy both the server and the backup at the same moment together",
        "External drives cannot hold research data at all, which means the department is not actually backing up anything in this setup"
      ],
      ans: 2,
      why: "Theft, fire, drive failure, or ransomware can destroy both copies at once. The 3-2-1 rule (3 copies, 2 media, 1 off-site) fixes this. Analysing backups means naming failure modes that defeat the whole strategy simultaneously — co-located backups are defeated by any local incident.",
      bloom: "analyze" },

    { q: "A small business can afford ONE upgrade: (A) bigger HDD, (B) same-size SSD, (C) cloud subscription. They run Excel-heavy accounting and occasional video calls. Evaluate.",
      opts: [
        "A — more space is always better, and a bigger HDD will fix all of the slowness issues that the business is currently experiencing",
        "B — their bottleneck is disk speed (opening and saving Excel files, booting Windows), and an SSD gives the biggest daily-use improvement",
        "C — cloud is always the best choice for any small business, and paying for a subscription fixes every single performance problem they have",
        "None of them — the business should just skip the upgrade entirely and keep using the slow computer that they already own for now"
      ],
      ans: 1,
      why: "The workload is limited by disk speed (opening/saving files), not capacity. SSD gives immediate daily improvement. Cloud is useful but doesn't fix local latency. Evaluating means matching the bottleneck to the solution: slow → faster disk, not bigger disk.",
      bloom: "evaluate" },

    { q: "Design a storage strategy for a wedding photographer delivering 50,000 photos per year. Name the media, the redundancy, and why each layer exists.",
      opts: [
        "Local SSD + large HDD archive + off-site HDD + cloud backup + cloud client galleries — each layer serves speed, capacity, safety, or delivery",
        "One external drive that she swaps out every year, because that is the simplest setup and keeps all the costs as low as they can possibly be",
        "Only a USB stick carried in her bag, because USB sticks are portable enough that she can take her entire business with her every day",
        "Only cloud storage with no local copies at all, because the cloud is always available and removes the need to manage any local files"
      ],
      ans: 0,
      why: "Local SSD = speed for editing. Large HDD = capacity for archive. Off-site HDD + cloud = geographic + medium diversity against disaster. Cloud galleries = delivery to clients. Each layer handles a different risk or workflow. Single-medium answers all fail at least one need.",
      bloom: "create" },
  ],

  // ─── Topic 9: Software (System, Application, Utility) ───
  9: [
    { q: "Which statement best distinguishes system software from application software?",
      opts: [
        "System software is always paid, while application software is always free — the price is the main way to tell the two apart easily",
        "System software manages the hardware and provides services; application software is built for end-user tasks and sits on top of it",
        "System software is older than application software, because the operating system was invented many decades before any modern apps were",
        "System software and application software are just two different names for the exact same thing, with no real difference between them"
      ],
      ans: 1,
      why: "The distinction is role, not price or age. System software (OS, drivers) manages hardware and provides services. Application software (Word, Chrome, Spotify) is built for user tasks and sits on top. The price, age, or naming claims are all wrong.",
      bloom: "remember" },

    { q: "Which of the following is an example of an operating system (system software)?",
      opts: [
        "Microsoft Word, which lets users write documents, format text, insert tables, and save their work into various different file formats",
        "Google Chrome, which lets users browse the web, search for information, watch videos, and use web apps like Gmail and Google Docs",
        "Windows 11, which manages the hardware of the computer, provides services to applications, and gives users a desktop interface to work with",
        "Adobe Photoshop, which lets users edit photos, create digital artwork, and apply many different filters and effects to images"
      ],
      ans: 2,
      why: "Windows 11 is an operating system — system software that manages hardware and gives apps a place to run. Word, Chrome, and Photoshop are applications — they run ON TOP of the OS.",
      bloom: "remember" },

    { q: "Why can't an application like WhatsApp run on a phone with no operating system installed?",
      opts: [
        "Because WhatsApp is too heavy for a phone without an OS, and the OS is needed to compress the app down to a manageable size",
        "Because applications call into OS services (file system, network, screen, permissions) and without an OS those services do not exist",
        "Because WhatsApp needs a SIM card to run, and the OS is what activates the SIM card so the app can then use it for messaging",
        "Because applications can actually run without an OS perfectly well, and this question is based on a mistaken idea about how apps work"
      ],
      ans: 1,
      why: "Apps call into OS services (files, network, screen, permissions). No OS means those services don't exist, so the app has nothing to call and no way to reach the hardware. Apps are NOT self-contained — they depend on the OS underneath.",
      bloom: "understand" },

    { q: "What does utility software do, and how is it different from the OS and applications?",
      opts: [
        "Utility software is just another name for the operating system, so there is no real difference between utility software and the OS itself",
        "Utility software maintains the computer's health (cleanup, antivirus, backup) — it is neither the OS nor the user-facing application",
        "Utility software is the same thing as an application, because both run on top of the OS and serve the user directly in many ways",
        "Utility software only runs on old computers, and modern computers have replaced utilities entirely with built-in operating system features"
      ],
      ans: 1,
      why: "Utilities keep the machine healthy (antivirus, disk cleanup, backup tools) without being the OS or a productivity app. It is a third category alongside system and application. Modern OSes have some built-in utilities, but the category still matters.",
      bloom: "understand" },

    { q: "An antivirus program scans for malicious files, removes them, and monitors new downloads. Which category of software is it?",
      opts: [
        "System software, because it talks directly to hardware and needs very low-level access to every file on the user's computer",
        "Application software, because the user interacts with it through a window, much like they do with Word, Chrome, or any other app",
        "Utility software, because it maintains the computer's health and security without being the OS or a user-facing productivity app",
        "None of the above, because antivirus is a completely separate type of software that does not fit any of the standard categories"
      ],
      ans: 2,
      why: "Applying the three-category model: OS = system. Maintenance/security tools = utility. Word/Excel/Chrome = application. Antivirus maintains the computer's health — classic utility, not system or application.",
      bloom: "apply" },

    { q: "A user complains: \"My computer is slow.\" Which category of software should you check FIRST, and what should you look for?",
      opts: [
        "Application software only — it must be Chrome, because browsers are always the biggest source of slowness on any computer ever built",
        "Check system (OS updates, drivers), then utility (malware scan, disk cleanup), then applications (which single app is using resources)",
        "Ignore the complaint completely, because computers are just slow in general and there is nothing a user can really do to fix it",
        "Reinstall Windows immediately, because a fresh install always fixes every kind of slowness on every computer in every situation"
      ],
      ans: 1,
      why: "Start broad: check system (OS updates, drivers), then utility (malware, cleanup), then applications (which app is using CPU/RAM). Most issues resolve at one of these layers. Applying the three-category model as a checklist beats guessing.",
      bloom: "apply" },

    { q: "A student installs a video game (Counter-Strike) on their laptop. Which category of software is this, and what does it need underneath?",
      opts: [
        "System software, because games control the GPU directly and need low-level hardware access that only system software ever has",
        "Utility software, because a game helps maintain the student's mental health by providing relaxation and fun on school evenings",
        "Application software, because a game is a user-facing program that runs on top of the OS and uses OS services for input and graphics",
        "It is not software at all, because games are a separate kind of digital content that does not count as software in the normal sense"
      ],
      ans: 2,
      why: "Games are applications — user-facing programs that run on top of the OS. The OS handles input (keyboard, mouse), graphics driver, audio, file system. The game calls into those services. Games are software; they just happen to be entertainment apps.",
      bloom: "apply" },

    { q: "A company bans utility software (cleanup tools, third-party antivirus) but keeps system and application software. Analyse the likely consequences.",
      opts: [
        "Malware risk rises, disk clutter accumulates, and performance slowly drifts down as maintenance tasks pile up over the months and years",
        "There will be no consequences at all, because operating systems already include every single utility that a modern business needs by default",
        "The computers will actually run faster, because removing utility software frees up resources that can be used for real work by the team",
        "Applications will stop working immediately, because every single application depends on utilities in order to launch and run properly"
      ],
      ans: 0,
      why: "Without utilities: malware risk rises, disk clutter accumulates, performance drifts down. The OS has some built-in utilities, but dropping the category entirely leaves gaps. Analysing means tracing consequences — decline is slow, which is actually worse (harder to notice).",
      bloom: "analyze" },

    { q: "A small business's IT budget allows ONE of: upgraded OS, new office-app licences, or a security/backup utility suite. Evaluate their priorities.",
      opts: [
        "Always pick the OS first, because the operating system is the foundation and every single other piece of software depends on it working",
        "Always pick the applications first, because applications are what the staff use every day to get their real work done for the business",
        "It depends — rank by risk: unsupported OS is a ticking time bomb; no backup risks catastrophic loss; old apps are just annoying",
        "Always pick the utilities first, because antivirus and backup are the two most important things that any business computer could ever need"
      ],
      ans: 2,
      why: "If the OS is unsupported (no security patches), upgrade it. If there's no backup or antivirus, the utility suite prevents disaster. If apps block real work, licence the apps. Evaluating means risk-ranking each option, not picking a default category every time.",
      bloom: "evaluate" },

    { q: "Design the software stack for a school computer lab of 30 machines used for mixed coursework (writing, programming, research). Name one product per category.",
      opts: [
        "System: Linux or Windows for management + Application: LibreOffice or Word + VS Code + Chrome + Utility: antivirus + backup + cleanup",
        "Just install Windows and nothing else, because Windows already comes with every possible program that a student could ever need in a lab",
        "Just install Microsoft Word, because that is the only program students really need, and they can do every assignment in Word every time",
        "Do not install any software at all — just buy the hardware, because students will bring their own software from home on USB sticks"
      ],
      ans: 0,
      why: "System: OS (Linux or Windows) to manage machines. Application: LibreOffice/Word + VS Code + Chrome for writing, coding, research. Utility: antivirus + backup + cleanup tools. Designing a stack means ONE representative per category, tied to real student tasks.",
      bloom: "create" },
  ],

  // ─── Topic 10: Internet Basics (IP, URL, DNS, Email) ───
  10: [
    { q: "Which statement correctly distinguishes an IP address from a URL?",
      opts: [
        "An IP address and a URL are the same thing, with the only difference being the label we give them in different technical situations",
        "An IP address is a numeric label for a device (like 142.250.190.46), while a URL is a human-readable locator for a resource on the web",
        "A URL is used only for email addresses, while an IP address is used only for websites — they serve two completely separate purposes",
        "Only URLs work on phones, while IP addresses only work on desktop computers because of differences in how mobile networks are set up"
      ],
      ans: 1,
      why: "IP = numeric address for a device (e.g., 142.250.190.46). URL = readable locator for a resource (e.g., google.com/search). DNS bridges the two by converting names to numbers. A, C, D each invent false distinctions.",
      bloom: "remember" },

    { q: "What does DNS stand for, and what does it do?",
      opts: [
        "Digital Network Service — a type of software that all computers need in order to connect to the internet and browse websites online",
        "Domain Name System — a service that translates human-readable names (like google.com) into the numeric IP addresses that computers use",
        "Data Numbering Standard — a rule for how IP addresses should be numbered so that every computer in the world has a unique number for itself",
        "Dynamic Network Setup — the process a computer uses to connect to a Wi-Fi network and get an IP address from the local router at home"
      ],
      ans: 1,
      why: "DNS = Domain Name System. It turns names humans can remember (google.com) into IP addresses computers need (142.250.190.46). A, C, D all sound plausible but are made up — none match the real acronym.",
      bloom: "remember" },

    { q: "Why does DNS exist at all — why not just memorise IP addresses?",
      opts: [
        "Because IP addresses do not actually exist without DNS, and every website on the internet is identified only by its human-readable name",
        "Humans are good at names and bad at numbers; names also stay the same even when a server's IP address changes for any reason",
        "Because DNS makes the internet physically faster than it would be if we all had to look up addresses manually every single time we browse",
        "Because IP addresses are secret and must be hidden from users, and DNS is the only way to reach a website without seeing the IP"
      ],
      ans: 1,
      why: "Humans remember names far better than numbers. DNS also lets a service change its IP (migrate servers) without breaking every bookmark. Understanding DNS means seeing it as a layer of indirection that serves memorability AND flexibility.",
      bloom: "understand" },

    { q: "How does HTTPS (the padlock in the browser) help protect you when visiting a website?",
      opts: [
        "It encrypts the traffic between your browser and the site, so anyone watching the network (like a café owner) cannot read what you send",
        "It blocks all advertisements on the website, so the user has a cleaner browsing experience without pop-ups getting in the way of content",
        "It makes the website load much faster than HTTP would, which is why every modern website has switched to HTTPS over the last few years",
        "It stores your password for you automatically, so you do not need to type your password again when you return to the same website later"
      ],
      ans: 0,
      why: "HTTPS encrypts the connection — nobody on the network between you and the site can read the data. It also verifies you are actually talking to the real site (certificate). It does NOT block ads, speed up loading, or store passwords — those are separate features.",
      bloom: "understand" },

    { q: "You type `www.library.edu` into a browser. Put these steps in the correct order: (1) browser requests the page from the server, (2) DNS returns the IP address, (3) browser asks DNS for the IP of library.edu, (4) server sends the HTML back.",
      opts: [
        "1 → 2 → 3 → 4, because the browser sends the request first and everything else happens after the initial request has been made",
        "3 → 2 → 1 → 4, because the browser needs the IP before it can talk to the server, so DNS must come first, then the request, then the HTML",
        "4 → 3 → 2 → 1, because the server actually sends the HTML first and then the browser asks for the right address after the fact",
        "2 → 3 → 4 → 1, because the DNS reply comes first, then the browser asks for the IP, then the HTML arrives, then the page request"
      ],
      ans: 1,
      why: "The browser can't contact a server without its IP. So: ask DNS (3) → get IP (2) → request page (1) → receive HTML (4). DNS always comes first; the actual HTML arrives last. The other orderings are impossible because they put the server call before the IP lookup.",
      bloom: "apply" },

    { q: "Your friend says: \"Email and a URL are the same because they both have dots and letters.\" Correct her precisely.",
      opts: [
        "Agree with her completely, because both email addresses and URLs use the same format with dots separating words and no real differences",
        "Disagree — emails do not actually have dots in them, so the statement about dots-and-letters is wrong and there is no similarity at all",
        "Disagree — `name@domain.com` identifies a mailbox AT a domain (SMTP); `https://domain.com/path` identifies a resource ON a server (HTTP)",
        "Agree — there is no real difference between emails and URLs, just different words for the same kind of address used by the internet"
      ],
      ans: 2,
      why: "An email `name@domain.com` identifies a mailbox AT a domain. A URL `https://domain.com/path` identifies a resource ON a server. Different structures (@ vs /), purposes (mailbox vs resource), protocols (SMTP vs HTTP). Dots-and-letters is a surface similarity that hides the real distinction.",
      bloom: "apply" },

    { q: "You want to visit your university's portal from a coffee shop's public Wi-Fi. Which action is safest?",
      opts: [
        "Connect to the Wi-Fi, go to the portal over HTTP (no padlock), and log in quickly so nobody has time to intercept the password",
        "Connect to the Wi-Fi, verify the portal shows HTTPS (padlock), check the domain name carefully, and then log in to the portal",
        "Connect to any Wi-Fi network named \"Free Internet\" without checking anything, because all coffee shops use secure networks by default",
        "Do not use the internet at all ever again from any public place, because public Wi-Fi is always completely unsafe in every possible case"
      ],
      ans: 1,
      why: "HTTPS encrypts your traffic, and checking the domain name stops phishing. HTTP is readable by anyone on the network. Blindly connecting to \"Free Internet\" is how fake hotspots trick users. Never using public Wi-Fi is too extreme — HTTPS makes it reasonably safe.",
      bloom: "apply" },

    { q: "Global DNS outage: all DNS servers go dark for an hour. Analyse which still works: (a) typing google.com, (b) visiting a site by IP you've memorised, (c) sending email to friend@gmail.com.",
      opts: [
        "Only (b) — a direct-IP visit bypasses DNS entirely, while (a) and (c) both need DNS to turn domain names into IP addresses first",
        "All three would continue working just fine, because DNS is not actually required for normal internet usage in any real situation",
        "Only (a) would still work, because typing a domain name is the only internet action that does not actually depend on DNS in any way",
        "None of them would work at all, because DNS is required for every possible internet action without any single exception to the rule"
      ],
      ans: 0,
      why: "Typing a domain needs DNS. Sending email needs DNS to find gmail.com's mail servers. A direct-IP visit bypasses DNS entirely. Analysing the outage means tracing which actions need DNS — any action starting with a name fails; actions starting with an IP work.",
      bloom: "analyze" },

    { q: "A teacher tells students: \"For privacy, always visit websites by IP address instead of URL.\" Evaluate.",
      opts: [
        "Flawed — your ISP still sees where you connect, the site still logs you, and you lose HTTPS certificate verification (issued to names)",
        "Good advice — using IPs instead of URLs hides your identity completely, because IP addresses are private in a way URLs never are",
        "Good advice — URLs are insecure by design, so using IPs is the only way to browse safely without anyone intercepting your traffic",
        "Flawed only because IP addresses are hard to memorise, and if users could remember them easily the advice would be completely correct"
      ],
      ans: 0,
      why: "Your ISP still sees the IP you connect to. The site still logs your visit. Worse, you lose HTTPS verification (certificates are issued to domain names, so your browser can't confirm you're talking to the real site). It's security theatre that actively reduces safety.",
      bloom: "evaluate" },

    { q: "Design a minimal checklist a student can use to identify whether a URL received in an email is legitimate (e.g., `secure-bank.example.com` vs `secure-bank-example.com.bad.ru`).",
      opts: [
        "Click it and see what happens — if the page looks fine everything is safe, and if it does not look right just close the tab quickly",
        "Read the URL right-to-left, check the TLD, confirm HTTPS, hover to see the real target, and if unsure use your own saved bookmark",
        "Trust anything that ends in .com, because .com domains are all verified by internet authorities and cannot be used by any attackers",
        "Only check the sender's name in the email, because if the sender looks familiar the link in the email is definitely safe to click"
      ],
      ans: 1,
      why: "1) Read right-to-left — the real domain is just before the first single slash. 2) Check the TLD (.com vs .ru). 3) Confirm HTTPS matches the domain. 4) Hover before clicking. 5) When unsure, use a bookmark. This catches real phishing (subdomain spoofing, lookalike domains, unexpected TLDs).",
      bloom: "create" },
  ],

  // ─── Topic 11: Internet Applications (Email, IM, Video Conferencing) ───
  11: [
    { q: "Which is the most accurate description of email as a communication medium?",
      opts: [
        "A real-time casual messaging tool that replaces face-to-face conversation and is mostly used for quick chats with friends and family",
        "Exactly the same as instant messaging, with no real difference in purpose, formality, or how people use it in daily business life",
        "A live audio or video only tool, which is why email is used for meetings and presentations rather than for text-based communication",
        "An asynchronous medium with formal tone, attachments, and a searchable durable record — recipients reply when they have time"
      ],
      ans: 3,
      why: "Email's signature traits are asynchronous delivery, formal conventions, attachments, and a durable searchable record. That's what separates it from IM (casual, real-time) and video calls (live audio/video).",
      bloom: "remember" },

    { q: "Which of these is a common use of instant messaging (IM) in a workplace setting?",
      opts: [
        "Sending a legal contract that requires a written signature and must be kept as a permanent record for at least the next ten years",
        "Running a formal 50-minute presentation to the whole company with slides, Q&A, and breakout rooms for small-group discussion afterwards",
        "Asking a colleague a quick question like \"are you free for lunch?\" or \"did you see the email from the client this morning?\" in real time",
        "Writing a full 5-page report for the marketing director, including a table of contents, a bibliography, and an executive summary at the top"
      ],
      ans: 2,
      why: "IM is for quick, casual, real-time back-and-forth. Long formal contracts need email. Presentations need video conferencing. Long reports need documents attached to email. IM is the \"tap on the shoulder\" of digital communication.",
      bloom: "remember" },

    { q: "Why is email still preferred over instant messaging for formal business communication, even though IM is faster?",
      opts: [
        "Because email is always cheaper than instant messaging, and saving money is the main reason that businesses choose one over the other here",
        "Email's asynchronous nature fits formal use: thoughtful replies, attachments, audit trail, and a tone that signals seriousness, unlike IM",
        "Because instant messaging does not actually support text at all, so it cannot be used for formal business messages in any real way",
        "Because email is newer technology than instant messaging, and newer technology is always the better choice for business communication"
      ],
      ans: 1,
      why: "Email's slower, asynchronous nature fits formal use: people can reply thoughtfully, attachments are standard, and the format signals seriousness. \"Faster\" isn't the only metric — for contracts, records, and deliberate replies, asynchronous beats real-time.",
      bloom: "understand" },

    { q: "What is the main advantage of video conferencing over a phone call for a team meeting?",
      opts: [
        "Video conferencing is always much cheaper than a phone call, which is the main reason that modern teams have switched over to it completely",
        "Video conferencing lets participants see facial expressions, share screens, and show visuals — richer communication than audio alone provides",
        "Video conferencing is the only tool that works over the internet, while phone calls have now been completely replaced by newer technology",
        "Video conferencing has existed longer than phone calls, which is why most business teams prefer to use it over the phone for all meetings"
      ],
      ans: 1,
      why: "Video adds facial cues, body language, and screen sharing — much richer than audio alone. That's why it's preferred for meetings that need visual elements or nuance. A is not always true. C and D are factually wrong (phone calls still exist and predate video).",
      bloom: "understand" },

    { q: "Choose the most appropriate tool for each task: (a) asking a classmate one quick question, (b) submitting a term paper to a professor, (c) a 30-minute project discussion with 4 remote team members.",
      opts: [
        "(a) instant message, (b) email with attachment, (c) video conferencing — matching the medium to the urgency and formality of each task",
        "Use email for all three, because email is the most professional tool and works for every possible communication situation in every context",
        "Use instant messaging for all three, because it is the fastest tool and speed is the only thing that matters in communication these days",
        "Use video conferencing for all three, because seeing the other person is always better than just reading their words on a screen"
      ],
      ans: 0,
      why: "Applying medium-fit: IM for quick casual, email for formal submission with audit trail, video for multi-party discussion. Using one tool for everything either wastes time or under-serves the task. Match the tool to the purpose.",
      bloom: "apply" },

    { q: "A remote team schedules a daily 1-hour video call for standup with 5 people. Apply what you know about media fit — what's likely going wrong?",
      opts: [
        "Nothing at all — daily video is the best format for every single team standup because seeing faces builds trust and improves communication",
        "Video is overkill for short status updates; 5 people × 1 hour = 5 hours/day, and async text (email digest or IM channel) fits better",
        "The problem is the internet speed, which is why the standup is not working well — the solution is to buy a faster internet connection",
        "The team needs longer meetings than one hour, because 60 minutes is not enough time for 5 people to give their daily status updates"
      ],
      ans: 1,
      why: "Video conferencing costs time and attention. Standups are short status updates, best handled async (IM channel, email digest). 5 × 1 hour = 5 hours/day burned. Applying media-fit means recognising that synchronous video is overkill for short, predictable updates.",
      bloom: "apply" },

    { q: "You need to share a 20-page technical report with 8 colleagues and collect their written comments over the next week. Which medium fits best?",
      opts: [
        "Instant message with the report pasted in, so everyone can read it and reply quickly in the same chat thread at their convenience",
        "A phone call to each of the 8 colleagues, so you can read the report aloud to each of them and hear their verbal feedback right there",
        "Email with the report attached as a PDF and a request for written comments, giving each colleague a week to read and reply in their own time",
        "A video conference with all 8 people, so everyone can read the 20 pages together on screen share and give comments out loud one by one"
      ],
      ans: 2,
      why: "Email with attachment fits: asynchronous (respects each colleague's schedule), handles long documents, and creates a written record of feedback. IM isn't for 20-page reports. Phone calls don't scale to 8 people individually. Video wastes everyone's time reading silently.",
      bloom: "apply" },

    { q: "Analyse why a \"reply all\" on a 200-person email thread is usually considered harmful.",
      opts: [
        "Email servers actually cannot handle reply-all at all, which is why large email threads always crash the whole company's email system",
        "Every reply goes to all 200 recipients, so a handful of reply-alls floods inboxes with hundreds of messages that bury the real replies",
        "There is nothing actually wrong with replying all on a large email thread, and it is the polite thing to do in every single situation",
        "Reply-all is always required by business etiquette, and choosing not to use it is considered rude in most professional workplaces today"
      ],
      ans: 1,
      why: "Every reply goes to all N recipients, so even a few reply-alls cascade into hundreds of messages — flooding inboxes and burying real replies. The tool supports it but the social contract penalises unnecessary broadcast. Separate what the tool CAN do from what it SHOULD do.",
      bloom: "analyze" },

    { q: "A university is deciding: mandate Zoom for everything, or mix Zoom (lectures) + email (assignments) + Slack (quick Q&A). Evaluate.",
      opts: [
        "Zoom-only is simpler and therefore always the better choice, because reducing the number of tools is good for students and for staff alike",
        "All three options are equally bad, because no communication system can actually work for modern university classes in any real sense",
        "Email-only would be fine, because email has existed for a long time and still covers every communication need at a modern university",
        "A mix is strictly better — live lectures fit Zoom, written assignments fit email, ad-hoc questions fit Slack, each matched to its content"
      ],
      ans: 3,
      why: "Live explanation = Zoom. Written deliverables = email. Ambient questions = Slack. Zoom-only forces async tasks into a synchronous tool, wasting time. Evaluating means comparing fit — classes contain multiple communication types, and one medium can't serve all of them.",
      bloom: "evaluate" },

    { q: "Design a communication policy for a 20-person hybrid startup. Specify which medium for: (a) urgent outages, (b) weekly planning, (c) legal/formal, (d) ad-hoc questions, (e) onboarding new hires.",
      opts: [
        "Use Slack for absolutely everything, because it is one tool and keeping things in one place is always the simplest and best approach possible",
        "Phone call + IM page for urgent outages, video + shared doc for weekly planning, email for legal, IM channel for ad-hoc, video + handbook for onboarding",
        "Use email for absolutely everything, because email is the most professional tool available and it covers every possible business communication",
        "No policy is needed at all, because people will naturally figure out the right communication tool for every situation that they encounter daily"
      ],
      ans: 1,
      why: "(a) Phone + IM page for urgency, (b) video + shared doc for planning, (c) email for legal record, (d) IM for ad-hoc, (e) video + handbook + IM mentor for onboarding. Designing a policy means mapping situations to media on explicit axes (urgency, formality, record). One tool can't serve all.",
      bloom: "create" },
  ],
};
