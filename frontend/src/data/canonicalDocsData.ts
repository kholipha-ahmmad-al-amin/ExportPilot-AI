// Canonical Documentation Dataset for ExportPilot AI (GlobalBepari AI)
// Adheres strictly to: Zero AI slop, Zero emojis, Zero em/en dashes, Zero sparkles.

export interface DocSection {
  id: string;
  categoryBn: string;
  categoryEn: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  readTime: string;
  subsections: {
    id: string;
    headingBn: string;
    headingEn: string;
    contentBn: string;
    contentEn: string;
    codeSnippet?: {
      language: string;
      code: string;
    };
    callout?: {
      type: 'note' | 'tip' | 'important' | 'compliance';
      textBn: string;
      textEn: string;
    };
  }[];
}

export const CANONICAL_DOCS_DATA: DocSection[] = [
  {
    id: 'overview',
    categoryBn: 'প্রারম্ভিক নির্দেশিকা',
    categoryEn: 'Getting Started',
    titleBn: 'প্ল্যাটফর্ম পরিচিতি ও সিস্টেম আর্কিটেকচার',
    titleEn: 'Platform Overview & System Architecture',
    descriptionBn: 'এক্সপোর্টপাইলট এআই এর মৌলিক উদ্দেশ্য, সমস্যা সমাধান পদ্ধতি এবং সার্বভৌম এআই আর্কিটেকচার।',
    descriptionEn: 'Core mission, architectural topology, and trade problem resolution for Bangladeshi SME exporters.',
    readTime: '4 min',
    subsections: [
      {
        id: 'mission-problem',
        headingBn: 'সমস্যা ও সমাধানের দৃষ্টিভঙ্গি',
        headingEn: 'The Manufacturing & Export Problem',
        contentBn: 'বাংলাদেশের তৈরি পোশাক (RMG), বহুমুখী পাটজাত পণ্য, চামড়া এবং সিরামিক শিল্পের প্রায় ৭০ শতাংশ কারখানা মধ্যস্বত্বভোগী বায়িং হাউসের ওপর নির্ভরশীল। এই বায়িং হাউসগুলো কেবল বায়ারের সাথে ইংরেজি যোগাযোগ নিয়ন্ত্রণ করে প্রতি চালানে ১৮ থেকে ২৫ শতাংশ মার্জিন কেটে নেয়। উপরন্তু ইউরোপীয় ইউনিয়নের কার্বন বর্ডার অ্যাডজাস্টমেন্ট মেকানিজম (CBAM) এবং সাপ্লাই চেইন ডিউ ডিলিজেন্স অ্যাক্ট (LkSG) এর কারণে কারখানার ওপর কঠোর স্কোপ ২ কার্বন অডিটের চাপ তৈরি হয়েছে। এক্সপোর্টপাইলট এআই সরাসরি ফ্যাক্টরি ফ্লোরের মোবাইল ছবি এবং কথ্য বাংলা ভয়েস নোটকে ৬০ সেকেন্ডে যাচাইকৃত আন্তর্জাতিক এক্সপোর্ট ডিলে রূপান্তর করে।',
        contentEn: 'Over 70 percent of Bangladeshi SME factories in RMG, jute, leather, and ceramics lose 18 to 25 percent of their FOB deal margins to Dhaka-based buying houses simply because they lack international English trade representation. Simultaneously, European Union CBAM regulations mandate strict Scope 2 greenhouse gas emissions tracking per manufactured unit. ExportPilot AI bridges this gap by turning raw factory photos and spoken Bangla voice notes into verified, duty-free international export contracts in under 60 seconds.',
        callout: {
          type: 'important',
          textBn: 'প্ল্যাটফর্মটি স্থানীয় ডেটা সার্বভৌমিকতা নীতি মেনে চলে: কোনো সংবেদনশীল জাতীয় পরিচয়পত্র, টিআইএন বা ব্যাংক হিসাব নম্বর বাইরের কোনো পাবলিক ক্লাউডে যায় না।',
          textEn: 'The platform strictly enforces local data sovereignty: no sensitive factory NIDs, TINs, or banking details are transmitted across public networks.'
        }
      },
      {
        id: 'top-level-architecture',
        headingBn: 'সিস্টেম টপোলজি ও স্তরবিন্যাস',
        headingEn: 'System Topology & Core Layers',
        contentBn: 'এক্সপোর্টপাইলট এআই চারটি প্রধান স্তরে বিভক্ত: ১. ক্লায়েন্ট টিয়ার (React 18 + Vite 5 + Tailwind CSS), ২. গেটওয়ে টিয়ার (FastAPI + Starlette + JWT Session + Local Regex Redactor), ৩. এজেন্ট ও ইনফারেন্স টিয়ার (FastMCP 5-Agent Pipeline + Azure OpenAI Korea Central + Deepgram Nova-3 + PyMuPDF + NetworkX GraphRAG), এবং ৪. ডেটা টিয়ার (SQLite 3 WAL Mode + SQLAlchemy 2.0 declarative models)।',
        contentEn: 'ExportPilot AI is partitioned into four decoupled layers: 1. Client Tier (React 18 + Vite 5 with Hind Siliguri and Inter typography), 2. Gateway Tier (FastAPI with JWT Session Cookies, CORS guards, and regex PII interceptors), 3. Agent & Inference Tier (FastMCP multi-agent pipeline, Azure OpenAI Korea Central, Deepgram Nova-3, PyMuPDF, and NetworkX GraphRAG), and 4. Data Tier (SQLite 3 with WAL concurrency and SQLAlchemy 2.0 ORM).',
        codeSnippet: {
          language: 'bash',
          code: `# Run local verification test suite covering all 12 system routes
.venv\\Scripts\\python.exe -u scripts/verify_all_routes.py`
        }
      }
    ]
  },
  {
    id: 'quickstart',
    categoryBn: 'প্রারম্ভিক নির্দেশিকা',
    categoryEn: 'Getting Started',
    titleBn: '৫-ধাপ ডিল ওয়ার্কস্পেস দ্রুত শুরুর গাইড',
    titleEn: '5-Step Progressive Deal Workspace Quickstart',
    descriptionBn: 'একটি পণ্য নির্বাচন থেকে শুরু করে আন্তর্জাতিক প্রপোজাল তৈরি করার ধারাবাহিক নির্দেশিকা।',
    descriptionEn: 'Step-by-step workflow guide from physical product specification to binding export contracts.',
    readTime: '5 min',
    subsections: [
      {
        id: 'deal-pipeline-steps',
        headingBn: 'পাঁচটি ধারাবাহিক কাজের ধাপ',
        headingEn: 'The Five Sequential Workspace Stages',
        contentBn: 'ওয়ার্কস্পেসটি পাঁচটি পরিষ্কার ধাপে সাজানো হয়েছে যাতে কারখানা মালিক কোনো প্রকার বিভ্রান্তি ছাড়া কাজ করতে পারেন: ধাপ ১: পণ্য ও স্পেক নির্বাচন (ছবি আপলোড অথবা প্রাক-নির্ধারিত সাভার জুট, গাজীপুর ডেনিম, হাজারীবাগ লেদার বা মিরপুর সিরামিক প্রিসেট নির্বাচন)। ধাপ ২: কারখানা ভয়েস ও ব্রিফ (৭-বার ওয়েভফর্মে বাংলায় কথা বলে উৎপাদন খরচ ও মাসিক সক্ষমতা প্রদান)। ধাপ ৩: কার্বন অডিট (বিদ্যুৎ বিল পার্স করে স্কোপ ২ নির্গমন নির্নয়)। ধাপ ৪: বায়ার ও মার্জিন (গ্রাফর‌্যাগ ভেরিফায়েড ক্রেতা ও মধ্যস্বত্বভোগী লাভ তুলনা)। ধাপ ৫: ট্রেড নেগোসিয়েশন ও চুক্তি (অ্যাজিউর ওপেনএআই ট্রেড অ্যাডভাইজার এবং ১-ক্লিক প্রোফরমা ইনভয়েস ডাউনলোড)।',
        contentEn: 'The workspace guides the exporter across five structured stages: Step 1: Product Specification & HS Classification (drop a photo or select verified factory presets). Step 2: Spoken Factory Brief (record colloquial Bangla with 7-bar live waveform visualizer). Step 3: Carbon Audit (parse DESCO/BREB electric bills to compute Scope 2 CO2e against EU benchmarks). Step 4: Buyers & Margin (GraphRAG verified buyers and real-time loss-aversion comparison). Step 5: Negotiation & Contracts (Azure OpenAI tactical counter-pitch and 1-click Proforma Invoice PDF generation).',
        callout: {
          type: 'tip',
          textBn: 'ডিল রুমের প্রতিটি ইনপুট পরিবর্তনের সাথে সাথে মার্জিন ক্যালকুলেটর স্বয়ংক্রিয়ভাবে আপডেট হয়।',
          textEn: 'Every cost or volume slider adjustment recalculates net exporter profit instantly.'
        }
      }
    ]
  },
  {
    id: 'agents-pipeline',
    categoryBn: 'স্বায়ত্তশাসিত এজেন্ট',
    categoryEn: 'Autonomous Agents',
    titleBn: '৫-এজেন্ট FastMCP পাইপলাইন আর্কিটেকচার',
    titleEn: '5-Agent FastMCP Pipeline Architecture',
    descriptionBn: 'এইচএস ক্লাসিফায়ার, গ্রাফর‌্যাগ ট্রেড স্কিম, সিবিএএম অডিটর, এফওবি অপ্টিমাইজার এবং মাল্টিলিঙ্গুয়াল ড্রাফটার।',
    descriptionEn: 'Deep architectural dive into the five specialized FastMCP trade intelligence agents.',
    readTime: '6 min',
    subsections: [
      {
        id: 'agent-1-vision-hs',
        headingBn: 'এজেন্ট ১: ভিশন টু ৮-ডিজিট এইচএস কোড ক্লাসিফায়ার',
        headingEn: 'Agent 1: Vision-to-8-Digit-HS-Code Classifier',
        contentBn: 'ডব্লিউসিও (WCO) হারমোনাইজড সিস্টেমের ৩ লাখেরও বেশি কমোডিটি কোড থেকে সঠিক ৮-ডিজিট শ্রেণিবিন্যাস করে। যেমন: পাটের শপিং ব্যাগের জন্য 4202.92.10 এবং ডেনিম ট্রাউজারের জন্য 6203.42.00। এটি একইসাথে ব্যাকগ্রাউন্ড রিমুভ করে ওপেনসিভি ফিল্টারের মাধ্যমে পণ্যের স্টুডিও কোয়ালিটি ছবি প্রস্তুত করে।',
        contentEn: 'Classifies product images into 8-digit WCO Harmonized System codes (e.g. 4202.92.10 for jute tote bags, 6203.42.00 for men denim jeans) while executing OpenCV studio background cleanups in real time.'
      },
      {
        id: 'agent-2-graphrag',
        headingBn: 'এজেন্ট ২: গ্রাফর‌্যাগ ট্রেড স্কিম ও বায়ার ম্যাচিং',
        headingEn: 'Agent 2: GraphRAG Trade Scheme & Buyer Matcher',
        contentBn: 'নেটওয়ার্কএক্স (NetworkX) গ্রাফ ডাটাবেসে মাল্টি-হপ রিলেশনশিপ (পণ্য -> এইচএস কোড -> শুল্ক চুক্তি -> ভেরিফায়েড ক্রেতা) ট্রাভার্স করে ইউরোপীয় ইউনিয়নের এভরিথিং বাট আর্মস (EBA), যুক্তরাজ্যের ডিসিটিএস (DCTS) এবং জাপানের ডিএফকিউএফ (DFQF) আওতায় ০% শুল্কমুক্ত আমদানিকারকদের সাথে সংযোগ তৈরি করে।',
        contentEn: 'Traverses a multi-hop knowledge graph (Product -> HS Code -> Trade Treaty -> Verified Buyer) to discover 0% preferential tariff opportunities across the European Union (EBA), United Kingdom (DCTS), and Japan (DFQF).'
      },
      {
        id: 'agent-3-cbam-audit',
        headingBn: 'এজেন্ট ৩: জিরো-হার্ডওয়্যার ইইউ সিবিএএম কার্বন অডিটর',
        headingEn: 'Agent 3: Zero-Hardware EU CBAM Carbon Auditor',
        contentBn: 'কোনো ব্যয়বহুল সেন্সর বা আইওটি ডিভাইস ছাড়াই কারখানার মাসিক ডেসকো অথবা পল্লী বিদ্যুৎ (BREB) বিল পার্স করে বিদ্যুৎ ব্যবহারের পরিমাণ (kWh) ও উৎপাদিত পণ্যের সংখ্যা থেকে প্রতি ইউনিটে কেজি কার্বন নিঃসরণ হিসাব করে এবং ইইউ বেঞ্চমার্কের সাথে তুলনা করে পাস/ফেল নির্ধারণ করে।',
        contentEn: 'Extracts kilowatt-hour totals from factory electricity bills using PyMuPDF and computes exact Scope 2 greenhouse gas emissions per manufactured unit (kg CO2e) against European Union CBAM benchmarks.'
      },
      {
        id: 'agent-4-fob-optimizer',
        headingBn: 'এজেন্ট ৪: লস-অ্যাভারশন এফওবি মার্জিন অপ্টিমাইজার',
        headingEn: 'Agent 4: Loss-Aversion FOB Margin Optimizer',
        contentBn: 'নোবেলজয়ী অর্থনীতিবিদ ড্যানিয়েল কানেম্যান ও আমোস টিভারস্কির প্রসপেক্ট থিওরি এবং লস-অ্যাভারশন ফ্রেমওয়ার্ক ব্যবহার করে দেখায় যে দেশীয় মধ্যস্বত্বভোগী বায়িং হাউসকে বাদ দিয়ে সরাসরি আন্তর্জাতিক বায়ারের সাথে চুক্তি করলে প্রতি চালানে কারখানা মালিকের কত হাজার ডলার লাভ বৃদ্ধি পায়।',
        contentEn: 'Applies Kahneman and Tversky prospect theory to benchmark predatory buying house bids against direct international market rates, demonstrating net dollar profit gains per shipment.'
      },
      {
        id: 'agent-5-multilingual-pitch',
        headingBn: 'এজেন্ট ৫: বহুভাষিক পিচ ও রিপোর্টল্যাব পিডিএফ জেনারেটর',
        headingEn: 'Agent 5: Multilingual Pitch & ReportLab PDF Generator',
        contentBn: 'ইংরেজি, জার্মান এবং জাপানি ভাষায় স্থানীয় ব্যবসায়িক শিষ্টাচার মেনে আন্তর্জাতিক ক্রেতাদের জন্য রপ্তানি প্রস্তাব তৈরি করে এবং রিপোর্টল্যাব ভেক্টর ইঞ্জিনের মাধ্যমে সাথে সাথে আন্তর্জাতিক স্ট্যান্ডার্ড প্রোফরমা ইনভয়েস এবং সিবিএএম সার্টিফিকেট পিডিএফ তৈরি করে।',
        contentEn: 'Synthesizes native business proposals in English, German, and Japanese, backed by instant ReportLab vector rendering of Proforma Invoices and EU CBAM Declaration Certificates.'
      }
    ]
  },
  {
    id: 'voice-engine',
    categoryBn: 'ভয়েস ইন্টেলিজেন্স',
    categoryEn: 'Voice Intelligence',
    titleBn: 'ডিপগ্রাম নোভা-৩ কথ্য বাংলা ভয়েস ইঞ্জিন',
    titleEn: 'Deepgram Nova-3 Spoken Bangla Engine',
    descriptionBn: 'কারখানা ফ্লোরের ব্যাকগ্রাউন্ড নয়েজ সহ্য করে অনানুষ্ঠানিক কথ্য বাংলা স্পিচ-টু-টেক্সট প্রসেসিং।',
    descriptionEn: 'Factory noise-tolerant speech-to-text pipeline targeting colloquial factory Bangla dialects.',
    readTime: '3 min',
    subsections: [
      {
        id: 'nova-3-specs',
        headingBn: 'নোভা-৩ অ্যাকোস্টিক মডেল ও টেকনিক্যাল স্পেসিফিকেশন',
        headingEn: 'Nova-3 Acoustic Model & Architecture',
        contentBn: 'ডিপগ্রামের সর্বাধুনিক নোভা-৩ (Nova-3) মডেল বাংলা ভাষার জন্য বিশেষায়িত কি-টার্মস (FOB, Chattogram, HS Code, CBAM, পিস, ডলার, টাকা, এলসি, সাভার, গাজীপুর) সহ কনফিগার করা হয়েছে। এটি ওয়েবএম (WebM), ওজিজি (OGG), ওয়েভ (WAV) এবং এএসি (AAC) ফরম্যাটের অডিও সরাসরি গ্রহণ করে এবং ৩০০ মিলিসেকেন্ডের মধ্যে টেক্সট রূপান্তর করে।',
        contentEn: 'Integrates Deepgram Nova-3 acoustic modeling with custom industrial keyterm biasing (FOB, Chattogram, HS Code, CBAM, pieces, dollars, LC terms, Savar, Gazipur). Ingests WebM, OGG, WAV, and AAC streams with sub-300ms transcription latency.',
        codeSnippet: {
          language: 'python',
          code: `# Voice endpoint request signature
POST /api/v1/voice/transcribe
Content-Type: multipart/form-data
Body: audio_file=@factory_voice_sample.webm`
        }
      }
    ]
  },
  {
    id: 'azure-openai',
    categoryBn: 'এআই ট্রেড স্ট্র্যাটেজি',
    categoryEn: 'AI Trade Strategy',
    titleBn: 'অ্যাজিউর ওপেনএআই সার্বভৌম ট্রেড অ্যাডভাইজার',
    titleEn: 'Azure OpenAI Sovereign Trade Advisor',
    descriptionBn: 'কোরিয়া সেন্ট্রাল অঞ্চলে হোস্টেড জিপিটি-৪.১-মিনি এবং জিপিটি-৫-মিনি সমৃদ্ধ কৌশলগত নেগোসিয়েশন ইঞ্জিন।',
    descriptionEn: 'Korea Central hosted GPT models delivering tactical price counter-proposals and trade risk checklists.',
    readTime: '4 min',
    subsections: [
      {
        id: 'azure-openai-runtime',
        headingBn: 'মডেল কনফিগারেশন ও ক্লাউড নিরাপত্তা',
        headingEn: 'Model Provisioning & Sovereign Guardrails',
        contentBn: 'অ্যাজিউর ওপেনএআই রিসোর্স exportpilot-openai কোরিয়া সেন্ট্রাল (koreacentral) অঞ্চলে হোস্ট করা হয়েছে। প্রাথমিক মডেল হিসেবে gpt-4.1-mini এবং ফলব্যাক হিসেবে gpt-5-mini ডিপ্লয় করা আছে। কারখানার কোনো তথ্য বাইরের এলএলএম এ পাঠানোর পূর্বে লোকাল গেটওয়েতে স্বয়ংক্রিয়ভাবে সব এনআইডি, টিআইএন এবং ফোন নম্বর মাস্ক করা হয়।',
        contentEn: 'Hosted on resource exportpilot-openai in Azure Korea Central (koreacentral). Features gpt-4.1-mini with automatic fallback to gpt-5-mini. All prompts are strictly sanitized by the local gateway redactor before transmission.',
        codeSnippet: {
          language: 'json',
          code: `{
  "message": "বায়ার ডেনিম প্যান্টের দাম $7.50 দিতে চান। কীভাবে দরকষাকষি করব?",
  "deal_context": {
    "commodity": "Men Slim Denim Jeans",
    "target_price": "$9.20/pc",
    "moq": "5000 pcs",
    "incoterm": "FOB Chattogram",
    "destination_country": "USA"
  },
  "language": "bn"
}`
        }
      }
    ]
  },
  {
    id: 'sovereignty-security',
    categoryBn: 'সার্বভৌমত্ব ও নিরাপত্তা',
    categoryEn: 'Sovereignty & Security',
    titleBn: 'ডেটা সার্বভৌমিকতা ও লোকাল পিআইআই মাস্কিং প্রোটোকল',
    titleEn: 'Data Sovereignty & Local PII Protection Protocol',
    descriptionBn: 'জাতীয় পরিচয়পত্র, টিআইএন, ব্যাংক হিসাব ও মোবাইল ফোন নম্বরের শূন্য ডেটা লিক নীতি।',
    descriptionEn: 'Zero cloud data leakage policy redacting national IDs, tax certificates, and bank credentials.',
    readTime: '4 min',
    subsections: [
      {
        id: 'pii-regex-engine',
        headingBn: 'রেজেক্স প্যাটার্ন ও টোকেনাইজেশন স্পেক',
        headingEn: 'Regex Patterns & Pseudonymization Schema',
        contentBn: 'বাংলাদেশের নির্দিষ্ট ফরম্যাটের ১০, ১৩ ও ১৭ ডিজিটের জাতীয় পরিচয়পত্র (NID), ১২ ডিজিটের টিআইএন (TIN), ৯ ও ১১ ডিজিটের বিআইএন (BIN), আন্তর্জাতিক ব্যাংক হিসাব নম্বর (IBAN) এবং স্থানীয় ফোন নম্বর (013-019) শনাক্ত করার জন্য লংগেস্ট-ম্যাচ-ফার্স্ট অ্যালগরিদম ব্যবহৃত হয়। বাংলা ও ইংরেজি উভয় সংখ্যার ক্ষেত্রে এই মাস্কিং শতভাগ কাজ করে।',
        contentEn: 'Executes a longest-match-first tokenizer that sanitizes 10/13/17-digit Bangladeshi National IDs, 12-digit TINs, 9/11-digit BINs, IBANs, bank accounts, and local mobile numbers across both Bengali and English numeral encodings.',
        callout: {
          type: 'compliance',
          textBn: 'প্রতিটি মাস্কিং কার্যক্রমের একটি অপরিবর্তনীয় অডিট লগ স্থানীয় এসকিউলাইটে সংরক্ষিত থাকে।',
          textEn: 'An immutable cryptographic ledger of all redacted items is recorded in the local SQLite audit table.'
        }
      }
    ]
  },
  {
    id: 'cbam-compliance',
    categoryBn: 'ইউরোপীয় ইউনিয়ন সিবিএএম',
    categoryEn: 'EU CBAM Compliance',
    titleBn: 'ইইউ সিবিএএম ও স্কোপ ২ কার্বন অডিট টেকনিক্যাল গাইড',
    titleEn: 'EU CBAM Scope 2 Carbon Audit Technical Guide',
    descriptionBn: 'বাংলাদেশ বিদ্যুৎ গ্রিড নিঃসরণ ফ্যাক্টর, ইউটিলিটি বিল পার্সিং এবং ইউরোপীয় কাস্টমস ডিক্লারেশন।',
    descriptionEn: 'Bangladesh grid emissions factor calculations, utility bill ingestion, and European customs declarations.',
    readTime: '5 min',
    subsections: [
      {
        id: 'cbam-calculation-math',
        headingBn: 'কার্বন নিঃসরণ হিসাবের গাণিতিক সূত্র',
        headingEn: 'Mathematical Formula for Scope 2 Carbon Accounting',
        contentBn: 'বাংলাদেশ জাতীয় গ্রিডের গড় কার্বন তীব্রতা ০.০০০৬৩৭৫ মেট্রিক টন CO2e প্রতি কিলোওয়াট-ঘণ্টা (০.৬৩৭৫ কেজি CO2e/kWh)। কারখানা থেকে প্রাপ্ত বিদ্যুৎ বিল থেকে মোট কিলোওয়াট-ঘণ্টা এবং মাসিক উৎপাদিত ইউনিটের সংখ্যার ভিত্তিতে প্রতি পণ্যের স্কোপ ২ নির্গমন বের করা হয়: E_unit = (Total_kWh * 0.6375) / Total_Units। যদি E_unit ইউরোপীয় ইউনিয়নের ক্যাটাগরি বেঞ্চমার্কের নিচে থাকে, তবে চালানটি সিবিএএম কর অব্যাহতি পায়।',
        contentEn: 'Bangladesh average grid carbon intensity is established at 0.0006375 tCO2e per kilowatt-hour (0.6375 kg CO2e/kWh). Unit emissions are computed as E_unit = (Total_kWh * 0.6375) / Total_Units. Shipments falling below EU sectoral thresholds qualify for full CBAM tariff exemption.',
        codeSnippet: {
          language: 'python',
          code: `# Example Scope 2 calculation
total_kwh = 16000.0
monthly_units = 10000
grid_factor = 0.6375  # kg CO2e / kWh
scope2_unit = (total_kwh * grid_factor) / monthly_units
# Result: 1.02 kg CO2e / unit (EU Benchmark: 1.80 kg CO2e -> PASS)`
        }
      }
    ]
  },
  {
    id: 'api-reference',
    categoryBn: 'এপিআই রেফারেন্স',
    categoryEn: 'API Reference',
    titleBn: '১২টি মূল এপিআই এন্ডপয়েন্ট ও স্কিমা স্পেসিফিকেশন',
    titleEn: 'Complete 12-Endpoint API Reference & Schemas',
    descriptionBn: 'অথেন্টিকেশন, এজেন্ট পাইপলাইন, পিআইআই মাস্কিং, ভয়েস, পিডিএফ এবং অ্যাজিউর ওপেনএআই এর পূর্ণাঙ্গ বিবরণ।',
    descriptionEn: 'Technical specifications, HTTP verbs, payload models, and response formats for all 12 core APIs.',
    readTime: '7 min',
    subsections: [
      {
        id: 'endpoint-catalog',
        headingBn: 'প্রধান এন্ডপয়েন্ট তালিকা ও রেসপন্স কোড',
        headingEn: 'Endpoint Catalog & Status Codes',
        contentBn: '১. GET /api/v1/health (সিস্টেম হেলথ চেক, 200 OK)\n২. POST /api/v1/auth/login (JWT সেশন সাইন ইন, 200 OK)\n৩. POST /api/v1/auth/register (নতুন অ্যাকাউন্ট রেজিস্ট্রেশন, 201 Created)\n৪. POST /api/v1/auth/logout (সেশন সমাপ্তি, 200 OK)\n৫. GET /api/v1/auth/me (বর্তমান ব্যবহারকারীর প্রোফাইল ও ভূমিকা, 200 OK)\n৬. POST /api/v1/export/analyze (৫-এজেন্ট ডিল পাইপলাইন, 200 OK)\n৭. GET /api/v1/buyers (আন্তর্জাতিক বায়ার ডিরেক্টরি, 200 OK)\n৮. POST /api/v1/security/mask-pii (সার্বভৌম পিআইআই মাস্কার, 200 OK)\n৯. POST /api/v1/parsers/parse-pdf (বিদ্যুৎ বিল পার্সিং ও স্কোপ ২ কার্বন হিসাব, 200 OK)\n১০. GET /api/v1/reports/download/{doc_type}/{preset_id} (ভেক্টর পিডিএফ জেনারেশন, 200 OK)\n১১. POST /api/v1/audit/run (১০০-পয়েন্ট এন্টারপ্রাইজ কমপ্লায়েন্স স্কোরকার্ড, 200 OK)\n১২. POST /api/v1/azure-openai/negotiate (সার্বভৌম ট্রেড নেগোসিয়েশন ও কাউন্টার-অফার, 200 OK)',
        contentEn: '1. GET /api/v1/health (System health check, 200 OK)\n2. POST /api/v1/auth/login (JWT session creation, 200 OK)\n3. POST /api/v1/auth/register (User registration, 201 Created)\n4. POST /api/v1/auth/logout (Session termination, 200 OK)\n5. GET /api/v1/auth/me (Current user profile and role, 200 OK)\n6. POST /api/v1/export/analyze (5-agent deal pipeline, 200 OK)\n7. GET /api/v1/buyers (Verified international importer catalog, 200 OK)\n8. POST /api/v1/security/mask-pii (Local PII sanitizer, 200 OK)\n9. POST /api/v1/parsers/parse-pdf (Electric bill parser & Scope 2 calculator, 200 OK)\n10. GET /api/v1/reports/download/{doc_type}/{preset_id} (Vector PDF streamer, 200 OK)\n11. POST /api/v1/audit/run (100-point enterprise compliance scorecard, 200 OK)\n12. POST /api/v1/azure-openai/negotiate (Sovereign trade negotiation advisor, 200 OK)',
        codeSnippet: {
          language: 'bash',
          code: `# Example curl for Health Check
curl -X GET "https://exportpilot.equisaas-bd.com/api/v1/health"

# Example curl for Sovereign PII Redaction
curl -X POST "https://exportpilot.equisaas-bd.com/api/v1/security/mask-pii" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "কারখানা মালিকের NID 19882694812004512 ও ফোন 01712984920"}'`
        }
      }
    ]
  },
  {
    id: 'deployment-runbook',
    categoryBn: 'অপারেশন ও রানবুক',
    categoryEn: 'Operations & Runbooks',
    titleBn: 'অ্যাজিউর অ্যাপ সার্ভিস ও ক্লাউডফ্লেয়ার ডিপ্লয়মেন্ট রানবুক',
    titleEn: 'Azure App Service & Cloudflare Deployment Runbook',
    descriptionBn: 'অ্যাজিউর লিনাক্স বি১ প্ল্যান, ওরিক্স পাইথন ৩.১১ ভার্চুয়াল এনভায়রনমেন্ট ও কাস্টম ডোমেইন সিএনএএমই কনফিগারেশন।',
    descriptionEn: 'Operational runbook for Azure App Service Linux B1, Oryx environment, and Cloudflare DNS routing.',
    readTime: '5 min',
    subsections: [
      {
        id: 'azure-dns-setup',
        headingBn: 'ক্লাউডফ্লেয়ার ডিএনএস ও অ্যাজিউর কাস্টম ডোমেইন বাইন্ডিং',
        headingEn: 'Cloudflare DNS Records & Azure Hostname Binding',
        contentBn: 'ডোমেইন exportpilot.equisaas-bd.com কে অ্যাজিউর ওয়েব অ্যাপ exportpilot-bd-2026 এর সাথে যুক্ত করতে দুটি ডিএনএস রেকর্ড কার্যকর রয়েছে: ১. CNAME রেকর্ড: Host exportpilot -> exportpilot-bd-2026.azurewebsites.net (DNS Only / Gray Cloud), ২. TXT রেকর্ড: Host asuid.exportpilot -> CFE8848B9F6010D6AD507B19777DFB2235421DA48E0AC413F8926D8809C18090 (অ্যাজিউর ডোমেইন মালিকানা ভেরিফিকেশন)।',
        contentEn: 'The custom subdomain exportpilot.equisaas-bd.com routes to Azure Web App exportpilot-bd-2026 via two Cloudflare DNS records: 1. CNAME: Host exportpilot pointing to exportpilot-bd-2026.azurewebsites.net (DNS Only), and 2. TXT: Host asuid.exportpilot carrying verification token CFE8848B9F6010D6AD507B19777DFB2235421DA48E0AC413F8926D8809C18090.',
        codeSnippet: {
          language: 'bash',
          code: `# Packaging and deployment command
python scripts/create_deploy_zip.py
az webapp deploy --resource-group rg-exportpilot-bd-2026 \\
  --name exportpilot-bd-2026 --src-path deploy.zip --type zip --async true`
        }
      }
    ]
  }
];
