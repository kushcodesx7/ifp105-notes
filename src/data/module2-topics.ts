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
  | { type: "image"; description: string };

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
    title: "Why Number Systems Matter",
    time: "~4 mins",
    badges: [],
    hook: `You speak English. Your friend speaks French. Your computer? It speaks <strong>electricity</strong> \u2014 and electricity only has two states: ON or OFF. That's it. 1 or 0. Every photo, song, game, and message on your phone is secretly just a massive wall of 1s and 0s. <strong>Welcome to the language your computer actually understands.</strong>`,
    content: [
      {
        type: "text",
        html: `Humans use <mark>10 digits (0\u20139)</mark> because we have 10 fingers. Computers use <mark>2 digits (0 and 1)</mark> because they run on electricity \u2014 a wire is either ON (1) or OFF (0). That's the entire alphabet of a computer. Everything else is built from those two tiny symbols.`,
      },
      {
        type: "image",
        description: "Light switch analogy: OFF = 0, ON = 1 \u00b7 Every piece of data is combinations of these switches",
      },
      {
        type: "analogy",
        label: "\ud83d\udca1 Light Switch Analogy",
        html: `Imagine a row of light switches on a wall. Each switch can only be <strong>OFF (0)</strong> or <strong>ON (1)</strong>. One switch = 1 bit. With 8 switches (8 bits = 1 byte), you can make <strong>256 different patterns</strong> \u2014 enough to represent every letter, number, and symbol you type. Your keyboard's "A" key? Internally it's just the pattern <strong>01000001</strong>. That's how a computer "sees" the letter A.`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udd22",
            title: "Decimal (Base 10)",
            description: "The system YOU use every day. 10 digits: 0\u20139. Based on our 10 fingers. Humans love it.",
            tag: "Human language",
          },
          {
            icon: "\ud83d\udcbb",
            title: "Binary (Base 2)",
            description: "The system COMPUTERS use. Only 2 digits: 0 and 1. Based on electricity being ON or OFF.",
            tag: "Computer language",
          },
          {
            icon: "\ud83d\udd17",
            title: "Hex & Octal",
            description: "Shortcuts for humans to read long binary numbers without going cross-eyed. Base 16 and Base 8.",
            tag: "Translator languages",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>\ud83e\udde0 Key idea:</strong> Number systems are NOT different numbers \u2014 they're different LANGUAGES for the same number. The number "thirteen" is 13 in decimal, 1101 in binary, 15 in octal, and D in hexadecimal. Same value, different spelling!`,
      },
      {
        type: "table",
        headers: ["Term", "Meaning", "Example"],
        rows: [
          { cells: ["<strong>Bit</strong>", "A single 0 or 1 \u2014 smallest unit of data", "1"] },
          { cells: ["<strong>Byte</strong>", "8 bits grouped together", "01000001 (= letter A)"] },
          { cells: ["<strong>Base</strong>", "How many digits a number system uses", "Base 10 uses 0\u20139"] },
        ],
      },
    ],
  },

  // ─── Topic 2 ───
  {
    id: 2,
    title: "The Decimal System \u2014 Base 10",
    time: "~4 mins",
    badges: [],
    hook: `You already know this system perfectly. You've been using it since you were 5 years old. <strong>But do you actually know WHY it works?</strong> Understanding how decimal works is the secret key to understanding binary, octal, and hex. Master this one, and the rest are just copy-paste with different numbers.`,
    content: [
      {
        type: "text",
        html: `Decimal = <mark>Base 10</mark>. It uses <strong>10 digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9</strong>. Why 10? Because humans have 10 fingers! Ancient humans literally counted on their hands, and the system stuck for thousands of years.`,
      },
      {
        type: "text",
        html: `The magic of decimal (and ALL number systems) is <mark>positional value</mark>. The POSITION of a digit determines its value. The digit "5" in <strong>500</strong> is worth way more than "5" in <strong>5</strong> \u2014 even though it's the same digit!`,
      },
      {
        type: "image",
        description: "Breakdown of number 365: 3\u00d7100 + 6\u00d710 + 5\u00d71 = 300 + 60 + 5 = 365 \u2014 each position labeled with power of 10",
      },
      {
        type: "table",
        headers: ["Position", "Power of 10", "Value", "Digit \u00d7 Value"],
        rows: [
          { cells: ["Hundreds", "10\u00b2 = 100", "100", "3 \u00d7 100 = <strong>300</strong>"] },
          { cells: ["Tens", "10\u00b9 = 10", "10", "6 \u00d7 10 = <strong>60</strong>"] },
          { cells: ["Ones", "10\u2070 = 1", "1", "5 \u00d7 1 = <strong>5</strong>"] },
        ],
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>The rule for ANY base:</strong> Each position is worth <mark>base<sup>position</sup></mark>, counting from 0 on the right. In base 10: positions are 10\u2070=1, 10\u00b9=10, 10\u00b2=100, 10\u00b3=1000... This SAME rule applies to binary (base 2), octal (base 8), and hex (base 16). Learn it once, use it everywhere. \ud83d\udca1`,
      },
      {
        type: "analogy",
        label: "\ud83d\udcb0 Money Analogy",
        html: `Think of decimal like money slots. You have a <strong>R1 slot</strong>, a <strong>R10 slot</strong>, a <strong>R100 slot</strong>. Each slot can hold 0\u20139 of that denomination. The number 247 means: 2 hundreds + 4 tens + 7 ones. When a slot reaches 9, the next number <strong>carries over</strong> to the next slot (like 99 + 1 = 100). This carry-over idea is identical in binary!`,
      },
    ],
  },

  // ─── Topic 3 ───
  {
    id: 3,
    title: "The Binary System \u2014 Base 2",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `This is THE language of every computer, phone, and smart device on the planet. <strong>Binary only has two digits: 0 and 1.</strong> That's it. No 2, no 3, no 9. Just two options \u2014 like a coin flip, a yes/no question, or a light switch. Simple? Yes. Powerful? Insanely.`,
    content: [
      {
        type: "text",
        html: `Binary = <mark>Base 2</mark>. It uses only <strong>2 digits: 0 and 1</strong>. Each digit is called a <mark>bit</mark> (binary digit). Why base 2? Because electricity has two states: OFF (0) and ON (1). Computers are built from billions of tiny switches (transistors) that are either on or off.`,
      },
      {
        type: "analogy",
        label: "\u270a Finger Counting Analogy",
        html: `In decimal you have 10 fingers, so you count 0\u20139 before you need a new column. In binary, pretend you only have <strong>2 fingers</strong>. You count 0, 1... done! Out of fingers! So you start a new column: <strong>10</strong> (which equals "two" in decimal). Then 11 (= three). Then you need ANOTHER new column: <strong>100</strong> (= four). Binary numbers get long fast because you run out of digits so quickly!`,
      },
      {
        type: "image",
        description: "Binary counting from 0 to 15: 0000, 0001, 0010, 0011, 0100... with decimal equivalents shown",
      },
      {
        type: "table",
        headers: ["Decimal", "Binary", "How to read it"],
        rows: [
          { cells: ["0", "0000", "Zero"] },
          { cells: ["1", "0001", "One"] },
          { cells: ["2", "0010", "One-zero (NOT ten!)"] },
          { cells: ["3", "0011", "One-one"] },
          { cells: ["4", "0100", "One-zero-zero"] },
          { cells: ["5", "0101", "One-zero-one"] },
          { cells: ["6", "0110", "One-one-zero"] },
          { cells: ["7", "0111", "One-one-one"] },
          { cells: ["8", "1000", "One-zero-zero-zero"] },
          { cells: ["9", "1001", "One-zero-zero-one"] },
          { cells: ["10", "1010", "One-zero-one-zero"] },
          { cells: ["15", "1111", "One-one-one-one"] },
        ],
      },
      {
        type: "callout",
        variant: "red",
        html: `<strong>\u274c Never say "ten" for binary 10!</strong> Binary 10 = decimal 2. Binary 110 = decimal 6. Always say "one-zero" or "one-one-zero". If someone says "binary ten," they mean the number <strong>two</strong>, not ten!`,
      },
      {
        type: "text",
        html: `<strong>Binary position values (from right to left):</strong> Each position doubles. The values are: <mark>1, 2, 4, 8, 16, 32, 64, 128</mark>. Memorise this row \u2014 you'll use it for every single conversion! \ud83e\udde0`,
      },
      {
        type: "table",
        headers: ["Position (right to left)", "7", "6", "5", "4", "3", "2", "1", "0"],
        rows: [
          { cells: ["Power of 2", "2\u2077", "2\u2076", "2\u2075", "2\u2074", "2\u00b3", "2\u00b2", "2\u00b9", "2\u2070"] },
          { cells: ["Value", "128", "64", "32", "16", "8", "4", "2", "1"] },
        ],
      },
    ],
  },

  // ─── Topic 4 ───
  {
    id: 4,
    title: "Decimal to Binary Conversion",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }, { text: "Exam favourite", type: "hot" }],
    hook: `Your teacher gives you the number 13 and says "convert to binary." Your friends panic. <strong>You don't \u2014 because you know the trick.</strong> It's just dividing by 2, writing remainders, and reading backwards. 30 seconds, done. Let's learn the method that makes this effortless.`,
    content: [
      {
        type: "text",
        html: `The method is called <mark>Repeated Division by 2</mark>. Divide the decimal number by 2 over and over. Write down the <strong>remainder</strong> each time (0 or 1). When you reach 0, stop. Then read the remainders from <strong>BOTTOM to TOP</strong> \u2014 that's your binary number!`,
      },
      {
        type: "image",
        description: "Step-by-step division of 13 by 2 showing quotient and remainder columns, with arrow reading remainders bottom-to-top = 1101",
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcdd Example: Convert 13 to binary</strong>`,
      },
      {
        type: "steps",
        items: [
          {
            title: "13 \u00f7 2 = 6 remainder 1 \u2b07\ufe0f",
            description: "13 divided by 2 is 6 with remainder 1. Write down the remainder: 1",
          },
          {
            title: "6 \u00f7 2 = 3 remainder 0 \u2b07\ufe0f",
            description: "6 divided by 2 is 3 with remainder 0. Write it down: 0",
          },
          {
            title: "3 \u00f7 2 = 1 remainder 1 \u2b07\ufe0f",
            description: "3 divided by 2 is 1 with remainder 1. Write it down: 1",
          },
          {
            title: "1 \u00f7 2 = 0 remainder 1 \u23f9\ufe0f",
            description: "1 divided by 2 is 0 with remainder 1. Write it down: 1. Quotient is 0, so STOP here!",
          },
          {
            title: "Read BOTTOM to TOP: 1101 \u2705",
            description: "Reading remainders from bottom to top gives us 1101. So 13 in decimal = 1101 in binary!",
          },
        ],
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>\ud83e\udde0 Memory trick:</strong> "Divide, Remainder, Repeat, Read Backwards." Or just remember: <strong>D.R.R.B.</strong> \u2014 "Don't Run, Read Backwards!" The last remainder you write is the FIRST digit of your binary number.`,
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcdd Another example: Convert 25 to binary</strong>`,
      },
      {
        type: "table",
        headers: ["Step", "Division", "Quotient", "Remainder"],
        rows: [
          { cells: ["1", "25 \u00f7 2", "12", "<strong>1</strong>"] },
          { cells: ["2", "12 \u00f7 2", "6", "<strong>0</strong>"] },
          { cells: ["3", "6 \u00f7 2", "3", "<strong>0</strong>"] },
          { cells: ["4", "3 \u00f7 2", "1", "<strong>1</strong>"] },
          { cells: ["5", "1 \u00f7 2", "0", "<strong>1</strong>"] },
        ],
      },
      {
        type: "text",
        html: `Read remainders bottom to top: <mark>11001</mark>. So 25 in decimal = <strong>11001</strong> in binary. \u2705`,
      },
      {
        type: "callout",
        variant: "blue",
        html: `<strong>Quick check:</strong> Add up the position values where there's a 1: 11001 = 16 + 8 + 0 + 0 + 1 = <strong>25</strong> \u2705. Always verify your answer by converting back!`,
      },
    ],
  },

  // ─── Topic 5 ───
  {
    id: 5,
    title: "Binary to Decimal Conversion",
    time: "~5 mins",
    badges: [{ text: "High yield", type: "star" }, { text: "Exam favourite", type: "hot" }],
    hook: `Now the reverse \u2014 your teacher gives you <strong>10110</strong> and says "what number is this?" Don't sweat it. You already know the position values (1, 2, 4, 8, 16...). <strong>Just multiply and add.</strong> It's even easier than the other direction.`,
    content: [
      {
        type: "text",
        html: `The method is called the <mark>Positional Value Method</mark>. Write the binary number, place the position values (1, 2, 4, 8, 16, 32...) underneath from <strong>right to left</strong>, multiply each bit by its position value, then <strong>add them all up</strong>.`,
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcdd Example: Convert 10110 to decimal</strong>`,
      },
      {
        type: "image",
        description: "Binary 10110 with position values 16, 8, 4, 2, 1 underneath each digit, showing multiplication and sum = 22",
      },
      {
        type: "table",
        headers: ["Binary digit", "1", "0", "1", "1", "0"],
        rows: [
          { cells: ["Position value", "16", "8", "4", "2", "1"] },
          { cells: ["Multiply", "1\u00d716 = <strong>16</strong>", "0\u00d78 = <strong>0</strong>", "1\u00d74 = <strong>4</strong>", "1\u00d72 = <strong>2</strong>", "0\u00d71 = <strong>0</strong>"] },
        ],
      },
      {
        type: "text",
        html: `Add them up: 16 + 0 + 4 + 2 + 0 = <mark>22</mark>. So binary 10110 = decimal <strong>22</strong>. \u2705`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>\ud83d\ude80 Shortcut:</strong> You can skip all the zeros! Only add the position values where the bit is <strong>1</strong>. For 10110: the 1s are at positions 16, 4, and 2. So just do 16 + 4 + 2 = 22. Faster! \u26a1`,
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcdd Another example: Convert 11001011 to decimal</strong>`,
      },
      {
        type: "table",
        headers: ["Binary digit", "1", "1", "0", "0", "1", "0", "1", "1"],
        rows: [
          { cells: ["Position value", "128", "64", "32", "16", "8", "4", "2", "1"] },
          { cells: ["Multiply", "128", "64", "0", "0", "8", "0", "2", "1"] },
        ],
      },
      {
        type: "text",
        html: `Add: 128 + 64 + 8 + 2 + 1 = <mark>203</mark>. Binary 11001011 = decimal <strong>203</strong>. \u2705`,
      },
      {
        type: "steps",
        items: [
          {
            title: "Step 1: Write the binary number \u270d\ufe0f",
            description: "Write each binary digit in its own box, left to right.",
          },
          {
            title: "Step 2: Write position values below \ud83d\udccd",
            description: "Starting from the RIGHT, write: 1, 2, 4, 8, 16, 32, 64, 128... Each doubles!",
          },
          {
            title: "Step 3: Multiply each pair \u2716\ufe0f",
            description: "Multiply each binary digit by the value below it. If the bit is 0, the result is 0. If it's 1, the result is the position value.",
          },
          {
            title: "Step 4: Add all products \u2795",
            description: "Sum every result together. That's your decimal answer!",
          },
        ],
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>\ud83e\udde0 Memorise this row:</strong> 128 \u00b7 64 \u00b7 32 \u00b7 16 \u00b7 8 \u00b7 4 \u00b7 2 \u00b7 1 \u2014 these are the powers of 2 for an 8-bit binary number. Write them on your exam paper first thing. They're the key to every binary question!`,
      },
    ],
  },

  // ─── Topic 6 ───
  {
    id: 6,
    title: "Octal & Hexadecimal \u2014 Binary's Best Friends",
    time: "~5 mins",
    badges: [],
    hook: `Binary works perfectly for computers. But for humans? Reading <strong>11111111001011010000</strong> without making a mistake is torture. \ud83d\ude35 That's why we invented <strong>octal (base 8)</strong> and <strong>hexadecimal (base 16)</strong> \u2014 shortcut systems that compress long binary into something humans can actually read.`,
    content: [
      {
        type: "text",
        html: `<mark>Octal (Base 8)</mark> uses digits <strong>0\u20137</strong>. Each octal digit represents exactly <strong>3 binary digits</strong>. <mark>Hexadecimal (Base 16)</mark> uses digits <strong>0\u20139 and A\u2013F</strong>. Each hex digit represents exactly <strong>4 binary digits</strong>. They're not new number values \u2014 they're just shorter ways to write binary!`,
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            icon: "\ud83d\udc19",
            title: "Octal \u2014 Base 8",
            description: "Uses 8 digits: 0, 1, 2, 3, 4, 5, 6, 7. Each octal digit = 3 binary digits. Used in file permissions (Linux/Unix).",
            tag: "3 binary bits = 1 octal digit",
          },
          {
            icon: "\ud83d\udd36",
            title: "Hexadecimal \u2014 Base 16",
            description: "Uses 16 symbols: 0\u20139 then A=10, B=11, C=12, D=13, E=14, F=15. Each hex digit = 4 binary bits. Used in colors, memory addresses.",
            tag: "4 binary bits = 1 hex digit",
          },
        ],
      },
      {
        type: "table",
        headers: ["Decimal", "Binary", "Octal", "Hexadecimal"],
        rows: [
          { cells: ["0", "0000", "0", "0"] },
          { cells: ["1", "0001", "1", "1"] },
          { cells: ["5", "0101", "5", "5"] },
          { cells: ["7", "0111", "7", "7"] },
          { cells: ["8", "1000", "10", "8"] },
          { cells: ["9", "1001", "11", "9"] },
          { cells: ["10", "1010", "12", "A"] },
          { cells: ["11", "1011", "13", "B"] },
          { cells: ["12", "1100", "14", "C"] },
          { cells: ["13", "1101", "15", "D"] },
          { cells: ["14", "1110", "16", "E"] },
          { cells: ["15", "1111", "17", "F"] },
          { cells: ["255", "11111111", "377", "FF"] },
        ],
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83c\udfa8 Where you've seen hex before:</strong> Color codes! White = <strong>#FFFFFF</strong>. Red = <strong>#FF0000</strong>. Black = <strong>#000000</strong>. Those are hexadecimal numbers representing how much Red, Green, and Blue light to mix. Every website and app uses hex colors!`,
      },
      {
        type: "analogy",
        label: "\ud83d\udce6 Packaging Analogy",
        html: `Imagine you have 12 individual apples (binary digits). You could: count them one by one (binary \u2014 tedious), group them into bags of 3 (octal \u2014 4 bags), or group them into bags of 4 (hex \u2014 3 bags). Same apples, just packaged differently for easier counting! Hex is the most popular packaging because 4 bits fits perfectly into modern computer architecture.`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>\ud83e\udde0 Hex memory trick:</strong> After 9, the alphabet takes over: <strong>A=10, B=11, C=12, D=13, E=14, F=15</strong>. Think: "All Bad Children Deserve Extra Fun" \u2014 silly, but you'll never forget A\u2013F = 10\u201315!`,
      },
    ],
  },

  // ─── Topic 7 ───
  {
    id: 7,
    title: "Logic Gates \u2014 AND, OR, NOT",
    time: "~6 mins",
    badges: [{ text: "High yield", type: "star" }],
    hook: `Every decision your computer makes \u2014 from "should this pixel be red?" to "did the user click the button?" \u2014 comes down to <strong>tiny yes/no questions.</strong> Logic gates are the microscopic decision-makers inside every chip. They take 1s and 0s as input and spit out a 1 or 0 as output. <strong>Three gates rule them all: AND, OR, and NOT.</strong>`,
    content: [
      {
        type: "text",
        html: `Logic gates implement <mark>Boolean logic</mark> \u2014 named after mathematician George Boole. In Boolean logic, everything is either <strong>TRUE (1)</strong> or <strong>FALSE (0)</strong>. No maybes. No "sort of." Just yes or no. Logic gates take one or two inputs and produce one output based on simple rules.`,
      },
      {
        type: "image",
        description: "Three gate symbols: AND gate (flat back, curved front) \u00b7 OR gate (curved back and front) \u00b7 NOT gate (triangle with bubble) \u2014 each labeled with inputs A, B and output Q",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83e\udd1d",
            title: "AND Gate",
            description: "Output is 1 ONLY when ALL inputs are 1. Both must be true. Like needing BOTH a key AND a password to unlock a safe.",
            tag: "Both must be ON",
          },
          {
            icon: "\ud83e\udd37",
            title: "OR Gate",
            description: "Output is 1 when ANY input is 1. At least one must be true. Like a door that opens if you push OR pull.",
            tag: "At least one ON",
          },
          {
            icon: "\ud83d\udd04",
            title: "NOT Gate",
            description: "Flips the input. 1 becomes 0. 0 becomes 1. Only one input. Like a light switch \u2014 whatever it is, make it the opposite!",
            tag: "Flips the value",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcca Truth Tables \u2014 AND Gate:</strong> Output is 1 <em>only</em> when <strong>both</strong> A AND B are 1.`,
      },
      {
        type: "table",
        headers: ["Input A", "Input B", "Output (A AND B)"],
        rows: [
          { cells: ["0", "0", "<strong>0</strong>"] },
          { cells: ["0", "1", "<strong>0</strong>"] },
          { cells: ["1", "0", "<strong>0</strong>"] },
          { cells: ["1", "1", "<strong>1</strong> \u2705"] },
        ],
      },
      {
        type: "analogy",
        label: "\ud83d\udd10 AND = Security Door",
        html: `An AND gate is like a security system that needs <strong>both</strong> your keycard AND your fingerprint. Miss either one? Door stays locked (0). Both correct? Door opens (1). <strong>Both must be true.</strong>`,
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcca Truth Table \u2014 OR Gate:</strong> Output is 1 when <strong>at least one</strong> input is 1.`,
      },
      {
        type: "table",
        headers: ["Input A", "Input B", "Output (A OR B)"],
        rows: [
          { cells: ["0", "0", "<strong>0</strong>"] },
          { cells: ["0", "1", "<strong>1</strong> \u2705"] },
          { cells: ["1", "0", "<strong>1</strong> \u2705"] },
          { cells: ["1", "1", "<strong>1</strong> \u2705"] },
        ],
      },
      {
        type: "analogy",
        label: "\ud83d\udeaa OR = Automatic Door",
        html: `An OR gate is like an automatic door at a mall \u2014 it opens if <strong>anyone</strong> walks up. Person A walks up? Opens. Person B walks up? Opens. Both walk up? Still opens. The ONLY time it stays closed is when <strong>nobody</strong> is there (both 0).`,
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcca Truth Table \u2014 NOT Gate (Inverter):</strong> Only 1 input. Flips it.`,
      },
      {
        type: "table",
        headers: ["Input A", "Output (NOT A)"],
        rows: [
          { cells: ["0", "<strong>1</strong>"] },
          { cells: ["1", "<strong>0</strong>"] },
        ],
      },
      {
        type: "callout",
        variant: "dark",
        html: `<strong>Real-world example:</strong> Your phone's "Do Not Disturb" is a NOT gate. Notifications ON (1) \u2192 DND flips it to OFF (0). Notifications OFF (0) \u2192 DND flips it to ON (1). It simply inverts whatever the current state is.`,
      },
    ],
  },

  // ─── Topic 8 ───
  {
    id: 8,
    title: "Logic Gates \u2014 NAND, NOR, XOR",
    time: "~6 mins",
    badges: [{ text: "Most confused", type: "hot" }],
    hook: `You know AND, OR, and NOT. Now meet their remix versions. <strong>NAND = NOT + AND. NOR = NOT + OR. XOR = eXclusive OR.</strong> These "compound gates" are built by combining the basic three. NAND is so important that you can build an <em>entire computer</em> using nothing but NAND gates. Seriously. \ud83e\udd2f`,
    content: [
      {
        type: "text",
        html: `Compound gates are created by combining basic gates. The trick is simple: <mark>NAND = AND + NOT</mark> (flip the AND output). <mark>NOR = OR + NOT</mark> (flip the OR output). <mark>XOR = exclusive OR</mark> (output is 1 only when inputs are <strong>different</strong>).`,
      },
      {
        type: "image",
        description: "Three compound gate symbols: NAND (AND with bubble) \u00b7 NOR (OR with bubble) \u00b7 XOR (OR with extra curved line) \u2014 each labeled",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            icon: "\ud83d\udeab",
            title: "NAND Gate",
            description: "AND gate with output flipped by NOT. Output is 0 ONLY when both inputs are 1. Otherwise always 1. The 'universal gate.'",
            tag: "NOT + AND",
          },
          {
            icon: "\u26d4",
            title: "NOR Gate",
            description: "OR gate with output flipped by NOT. Output is 1 ONLY when both inputs are 0. Otherwise always 0.",
            tag: "NOT + OR",
          },
          {
            icon: "\u2194\ufe0f",
            title: "XOR Gate",
            description: "Exclusive OR. Output is 1 ONLY when inputs are DIFFERENT. Same inputs = 0. Different inputs = 1.",
            tag: "Different = 1",
          },
        ],
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcca Truth Table \u2014 NAND Gate:</strong> The exact <strong>opposite</strong> of AND. Flip every AND output.`,
      },
      {
        type: "table",
        headers: ["Input A", "Input B", "AND Output", "NAND Output (flipped)"],
        rows: [
          { cells: ["0", "0", "0", "<strong>1</strong>"] },
          { cells: ["0", "1", "0", "<strong>1</strong>"] },
          { cells: ["1", "0", "0", "<strong>1</strong>"] },
          { cells: ["1", "1", "1", "<strong>0</strong>"] },
        ],
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcca Truth Table \u2014 NOR Gate:</strong> The exact <strong>opposite</strong> of OR. Flip every OR output.`,
      },
      {
        type: "table",
        headers: ["Input A", "Input B", "OR Output", "NOR Output (flipped)"],
        rows: [
          { cells: ["0", "0", "0", "<strong>1</strong>"] },
          { cells: ["0", "1", "1", "<strong>0</strong>"] },
          { cells: ["1", "0", "1", "<strong>0</strong>"] },
          { cells: ["1", "1", "1", "<strong>0</strong>"] },
        ],
      },
      {
        type: "text",
        html: `<strong>\ud83d\udcca Truth Table \u2014 XOR Gate (Exclusive OR):</strong> Output is 1 when inputs are <strong>different</strong>.`,
      },
      {
        type: "table",
        headers: ["Input A", "Input B", "XOR Output"],
        rows: [
          { cells: ["0", "0", "<strong>0</strong> (same)"] },
          { cells: ["0", "1", "<strong>1</strong> (different) \u2705"] },
          { cells: ["1", "0", "<strong>1</strong> (different) \u2705"] },
          { cells: ["1", "1", "<strong>0</strong> (same)"] },
        ],
      },
      {
        type: "analogy",
        label: "\ud83d\udca1 XOR = Light Switch Analogy",
        html: `Imagine a room with <strong>two light switches</strong> controlling one light (a two-way switch). If both switches are in the same position (both up or both down), the light is OFF. If they're in <strong>different positions</strong>, the light is ON. That's exactly how XOR works \u2014 different inputs = 1, same inputs = 0!`,
      },
      {
        type: "callout",
        variant: "purple",
        html: `<strong>\ud83c\udfc6 NAND is special:</strong> It's called a <mark>Universal Gate</mark> because you can build ANY other gate (AND, OR, NOT, XOR) using ONLY NAND gates. Engineers love it because they only need one type of gate to build an entire processor!`,
      },
      {
        type: "callout",
        variant: "amber",
        html: `<strong>\ud83e\udde0 Summary trick:</strong> AND = "both ON" \u00b7 OR = "at least one ON" \u00b7 NOT = "flip it" \u00b7 NAND = "NOT both ON" \u00b7 NOR = "NOT any ON" \u00b7 XOR = "one but not both." Write this on your exam paper before you start!`,
      },
    ],
  },
];
