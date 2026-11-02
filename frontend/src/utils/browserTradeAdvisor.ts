/**
 * ExportPilot AI Browser-Native Trade Advisor Engine
 * 
 * Runs entirely in the user's browser in pure JavaScript / TypeScript.
 * Provides instant 0ms, zero-cost, fully offline trade intelligence for
 * public landing page visitors without requiring authentication or backend API calls.
 * 
 * Rules:
 * - NO em-dashes or en-dashes
 * - NO decorative emojis or sparkles
 * - Native, human tone in Bengali and English
 * - Clean markdown formatting with code blocks and clickable internal links
 */

export interface BrowserAdvisorResponse {
  reply: string;
  strategySummary: string;
  riskFactors: string[];
  suggestedCounter?: string;
  modelUsed: string;
}

interface KnowledgeArticle {
  id: string;
  keywords: string[];
  match: (q: string) => boolean;
  getBn: (q: string) => BrowserAdvisorResponse;
  getEn: (q: string) => BrowserAdvisorResponse;
}

const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  // 1. Scope 2 & CBAM Carbon Calculation from Electricity Bill
  {
    id: 'scope2_electricity_cbam',
    keywords: [
      'বিদ্যুৎ', 'বিল', 'কার্বন', 'স্কোপ', 'scope', 'cbam', 'সিবিএএম', 'নির্গমন', 'emission',
      'কিলোওয়াট', 'kwh', 'সোলার', 'solar', 'রুফটপ', 'ট্যাক্স', 'গ্রিড', 'মিটার'
    ],
    match: (q) => {
      const lower = q.toLowerCase();
      return (
        (lower.includes('বিদ্যুৎ') || lower.includes('বিল') || lower.includes('electricity')) &&
        (lower.includes('কার্বন') || lower.includes('scope') || lower.includes('নির্গমন') || lower.includes('বিল'))
      ) || lower.includes('scope 2') || lower.includes('স্কোপ ২') || lower.includes('সিবিএএম') || lower.includes('cbam');
    },
    getBn: () => ({
      reply: `### মূল বিশ্লেষণ ও বিদ্যুৎ বিল থেকে কার্বন হিসাব

বাংলাদেশের বিদ্যুৎ বিতরণ সংস্থাগুলোর (DPDC, DESCO, REB, NESCO) জাতীয় গ্রিডের গড় নির্গমন ফ্যাক্টর:
\`\`\`text
০.৫৮ কেজি CO2e প্রতি কিলোওয়াট ঘণ্টা (kWh)
\`\`\`

আপনার কারখানার মাসিক বিদ্যুৎ বিলের মোট ইউনিট (kWh) জানা থাকলে নিচের সূত্রে স্কোপ ২ নির্গমন হিসাব করা যায়:
\`\`\`text
Scope 2 কার্বন নির্গমন (কেজি CO2e) = মোট বিদ্যুৎ ব্যবহার (kWh) × ০.৫৮
Scope 2 কার্বন নির্গমন (টন CO2e) = (মোট বিদ্যুৎ ব্যবহার × ০.৫৮) / ১,০০০
\`\`\`

**বাস্তব উদাহরণ:**
একটি কারখানায় প্রতি মাসে ১,০০,০০০ কিলোওয়াট ঘণ্টা বিদ্যুৎ খরচ হলে:
\`\`\`text
মাসিক নির্গমন = (১,০০,০০০ × ০.৫৮) / ১,০০০ = ৫৮ টন CO2e
বাৎসরিক নির্গমন = ৫৮ × ১২ = ৬৯৬ টন CO2e
\`\`\`

### রুফটপ সোলার সাশ্রয় ও সিবিএএম কৌশল
* **সোলার বিদ্যুৎ:** প্রতি ১ কিলোওয়াট পিক (kWp) রুফটপ সোলার প্যানেল বছরে প্রায় ১,৩৫০ ইউনিট গ্রিন বিদ্যুৎ দেয়, যা বছরে প্রায় ০.৭৮ টন কার্বন নির্গমন বাঁচায়।
* **সিবিএএম প্রস্তুতি:** ২০২৬ থেকে ইউরোপীয় ইউনিয়ন কার্বন বর্ডার অ্যাডজাস্টমেন্ট মেকানিজমে (CBAM) কার্বন সারচার্জ কার্যকর করছে। কারখানার বিদ্যুৎ বিলের সঠিক তথ্য না রাখলে ইইউ বায়াররা ডিফল্ট পেনাল্টি চার্জ কাটবে।
* **সরাসরি টুল ব্যবহার:** সঠিক অডিট ও রিপোর্টের জন্য আমাদের [কার্বন অডিট ও সিবিএএম গাইড](/docs?topic=carbon-record) ব্যবহার করুন। ফ্যাক্টরি রেটিং দেখতে [অডিট রিপোর্ট](/audit) দেখুন।`,
      strategySummary: 'জাতীয় গ্রিড ফ্যাক্টর ০.৫৮ কেজি CO2e/kWh ধরে স্কোপ ২ নির্গমন হিসাব এবং সোলার অফসেট কৌশল।',
      riskFactors: [
        'বিদ্যুৎ বিলের সঠিক মিটার লগ ও ব্যাংক স্টেটমেন্ট না থাকলে ইইউ সিবিএএম অডিটে পেনাল্টি হতে পারে',
        'ডিজেল জেনারেটর ব্যবহার করলে আলাদাভাবে স্কোপ ১ ডিজেল নির্গমন ফ্যাক্টর (২.৬৮ কেজি CO2e/লিটার) যোগ করতে হবে',
        'সৌর বিদ্যুৎ নেট মিটারিংয়ের সার্টিফিকেট আন্তর্জাতিক অডিটর দ্বারা প্রতি বছর নবায়ন করতে হয়'
      ],
      suggestedCounter: 'ইউরোপীয় বায়ারকে কারখানার ভেরিফাইড কার্বন ফুটপ্রিন্ট সার্টিফিকেট দিয়ে পরিবেশবান্ধব প্রিমিয়াম দাবি করুন।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Key Analysis: Scope 2 Carbon Calculation from Factory Electricity

Bangladesh national grid emission factor across DPDC, DESCO, REB, and NESCO:
\`\`\`text
0.58 kg CO2e per kilowatt-hour (kWh)
\`\`\`

To calculate Scope 2 indirect carbon emissions from your factory monthly electricity bill:
\`\`\`text
Scope 2 Emissions (kg CO2e) = Total Electricity Consumed (kWh) × 0.58
Scope 2 Emissions (Metric Tons CO2e) = (Total kWh × 0.58) / 1,000
\`\`\`

**Concrete Factory Example:**
For a factory consuming 100,000 kWh per month:
\`\`\`text
Monthly Scope 2 = (100,000 × 0.58) / 1,000 = 58 Metric Tons CO2e
Annual Scope 2 = 58 × 12 = 696 Metric Tons CO2e
\`\`\`

### Rooftop Solar Offsets & CBAM Strategy
* **Solar Savings:** Each 1 kWp of rooftop solar generates approx 1,350 clean units per year, saving approx 0.78 tons of CO2e.
* **EU CBAM Compliance:** Starting in 2026, the European Union enforces carbon surcharges. Inaccurate electricity logs result in punitive default penalties.
* **Direct Tool:** Calculate your factory exact footprint with our [Carbon Audit & CBAM Guide](/docs?topic=carbon-record). Review compliance on the [Audit Report](/audit) page.`,
      strategySummary: 'Calculate Scope 2 emissions using 0.58 kg CO2e/kWh grid factor with rooftop solar offsets.',
      riskFactors: [
        'Unverified electricity utility statements trigger EU CBAM default punitive carbon penalties',
        'Diesel generator fuel must be accounted separately under Scope 1 (2.68 kg CO2e per liter)',
        'Net metering solar capacity certificates require annual validation from accredited auditors'
      ],
      suggestedCounter: 'Present verified low-carbon credentials to European buyers to negotiate premium FOB terms.',
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  },

  // 2. Germany & Jute Bags Tariff Duty
  {
    id: 'jute_germany_tariff',
    keywords: ['জার্মানি', 'জার্মানিতে', 'জুট', 'পাট', 'ব্যাগ', 'ট্যারিফ', 'শুল্ক', 'germany', 'jute', 'bag', 'duty', 'eba', 'tariff'],
    match: (q) => {
      const lower = q.toLowerCase();
      return (lower.includes('জুট') || lower.includes('পাট') || lower.includes('jute')) &&
             (lower.includes('জার্মানি') || lower.includes('germany') || lower.includes('শুল্ক') || lower.includes('duty') || lower.includes('সুবিধা'));
    },
    getBn: () => ({
      reply: `### জার্মানি ও ইউরোপে জুট ব্যাগের শুল্ক সুবিধা ও বাজার দর

* **শুল্ক হার:** ইউরোপীয় ইউনিয়নের Everything But Arms (EBA) স্কিমের আওতায় বাংলাদেশে উৎপাদিত পাটের ব্যাগ ও বহুমুখী জুট পণ্যে **০% (সম্পূর্ণ শূন্য) শুল্ক** রয়েছে।
* **প্রযোজ্য এইচএস কোড:** 
  * বহুমুখী জুট শপিং ও টোট ব্যাগ: \`HS 5310.10\` ও \`HS 6305.10\`
  * বায়োডিগ্রেডেবল প্যাকেজিং স্যাক: \`HS 6305.10.00\`
* **FOB দর নির্দেশিকা (চট্টগ্রাম বন্দর):**
\`\`\`text
ল্যামিনেটেড জুট শপিং ব্যাগ: $১.১০ থেকে $১.৬৫ প্রতি পিস (FOB Chattogram)
নন-ল্যামিনেটেড শতভাগ প্রাকৃতিক ব্যাগ: $০.৮৫ থেকে $১.২৫ প্রতি পিস
\`\`\`

### প্রস্তাবিত বাণিজ্যিক কৌশল
* জার্মানির পরিবেশ সচেতন বায়ারদের জন্য প্লাস্টিকমুক্ত অর্গানিক কটন ও পাট হ্যান্ডেলযুক্ত ব্যাগ প্রস্তাব করুন।
* আমাদের [প্রোডাক্ট ক্যাটালগ](/catalog) থেকে জুট টোট ব্যাগের স্পেসিফিকেশন দেখুন এবং সরাসরি [বায়ার ডিরেক্টরি](/buyers)-তে ক্রেতাদের খুঁজুন।`,
      strategySummary: 'ইইউ ইবিএ স্কিমের আওতায় জুট ব্যাগে ০% শুল্ক সুবিধা ও এফওবি চট্টগ্রাম প্রাইসিং স্ট্র্যাটেজি।',
      riskFactors: [
        'ইউরোপে ল্যামিনেশন ব্যবহারের ক্ষেত্রে ফুড-গ্রেড ও টক্সিন-মুক্ত সার্টিফিকেট বাধ্যতামূলক',
        'শিপমেন্টের আর্দ্রতা ১৪% এর নিচে না রাখলে সমুদ্রপথে ছত্রাক বা ফাঙ্গাসের ঝুঁকি থাকে'
      ],
      suggestedCounter: 'ন্যূনতম ৫,০০০ পিস অর্ডারে এফওবি চট্টগ্রাম দর $১.২৫ প্রতি পিস অফার করুন।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Tariff Advantage & Pricing for Jute Bags in Germany

* **Tariff Duty:** Under the European Union Everything But Arms (EBA) preferential scheme, Bangladeshi diversified jute bags enter Germany at **0% duty (duty-free)**.
* **Applicable HS Codes:**
  * Diversified Jute Shopping Bags: \`HS 5310.10\` and \`HS 6305.10\`
  * Eco-friendly Sacks: \`HS 6305.10.00\`
* **FOB Benchmark Pricing (Chattogram Port):**
\`\`\`text
Laminated Jute Tote Bag: $1.10 to $1.65 per piece (FOB Chattogram)
100% Biodegradable Natural Jute Bag: $0.85 to $1.25 per piece
\`\`\`

### Commercial Strategy
* Target European supermarket chains replacing single-use plastic bags with reusable jute totes.
* View sample specs in our [Product Catalog](/catalog) and discover verified European buyers in the [Buyer Directory](/buyers).`,
      strategySummary: '0% EU duty for jute bags under EBA with benchmark FOB pricing from Chattogram Port.',
      riskFactors: [
        'Azo-dye and toxic plasticizers in lamination are strictly prohibited under EU REACH',
        'Moisture content must be kept under 14% to prevent mildew during ocean transit'
      ],
      suggestedCounter: 'Quote FOB Chattogram at $1.25/piece with 5,000 units minimum order quantity (MOQ).',
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  },

  // 3. Denim & RMG under UK DCTS
  {
    id: 'denim_uk_dcts',
    keywords: ['ইউকে', 'ডেনিম', 'পোশাক', 'আরএমজি', 'dcts', 'জিন্স', 'uk', 'denim', 'rmg', 'garments', 'jeans'],
    match: (q) => {
      const lower = q.toLowerCase();
      return (lower.includes('ইউকে') || lower.includes('uk') || lower.includes('dcts')) &&
             (lower.includes('ডেনিম') || lower.includes('denim') || lower.includes('পোশাক') || lower.includes('রপ্তানি') || lower.includes('শুল্ক'));
    },
    getBn: () => ({
      reply: `### ইউকে DCTS স্কিমে ডেনিম ও পোশাক রপ্তানির নিয়ম

* **শুল্ক সুবিধা:** যুক্তরাজ্যের Developing Countries Trading Scheme (DCTS) এর Comprehensive Preferences স্তরে বাংলাদেশের তৈরি পোশাকে **সম্পূর্ণ ০% শুল্ক** অব্যাহত রয়েছে।
* **এইচএস কোড:** ছেলেদের ও মেয়েদের ডেনিম ট্রাউজার: \`HS 6203.42\`
* **রুলস অব অরিজিন (Rules of Origin):** ইউকে DCTS এ সিঙ্গেল ট্রান্সফরমেশন (Single Transformation) সুবিধা কার্যকর। অর্থাৎ যেকোনো দেশ থেকে ফেব্রিক বা সুতা এনে বাংলাদেশে ডেনিম বানালেও ইউকেতে ০% শুল্কমুক্ত প্রবেশাধিকার পাওয়া যাবে।
* **পরিবেশগত কমপ্লায়েন্স:** ওয়াটার ট্রিটমেন্ট (ETP) এবং ওয়াশিং কেমিক্যাল সংক্রান্ত ZDHC (Zero Discharge of Hazardous Chemicals) লেভেল ৩ কমপ্লায়েন্স নিশ্চিত করতে হয়।

### এক্সপোর্টপাইলট কৌশল
* [গার্মেন্টস সেক্টর ড্যাশবোর্ড](/sectors/garments) থেকে ইউকে ও ইউরোপের চাহিদাসম্পন্ন ডেনিম ডিজাইন ও বায়ারদের তালিকা দেখুন।`,
      strategySummary: 'ইউকে DCTS কাঠামোর আওতায় সিঙ্গেল ট্রান্সফরমেশন সুবিধার সাথে ডেনিম রপ্তানিতে ০% শুল্ক।',
      riskFactors: [
        'ইউকে আধুনিক দাসত্ব আইন (Modern Slavery Act) এবং কারখানা কাজের পরিবেশ অডিট মেনে চলতে হবে',
        'ক্যামিকেল ওয়াশিংয়ে REACH সম্মতি না থাকলে পোর্ট অব এন্ট্রিতে পণ্য আটকে যেতে পারে'
      ],
      suggestedCounter: 'ইউকে ক্রেতাকে স্ট্যান্ডার্ড ওয়াশ ডেনিম জ্যাকেটে FOB $৮.৫০ এবং ট্রাইজারে $৭.২০ অফার করুন।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Denim & RMG Export Rules Under UK DCTS

* **Tariff Rate:** Under the UK Developing Countries Trading Scheme (DCTS) Comprehensive Preferences tier, Bangladeshi apparel exports enter the UK with **0% tariff (zero duty)**.
* **HS Classification:** Men's and Women's Denim Trousers: \`HS 6203.42\`
* **Rules of Origin:** UK DCTS operates on generous single transformation rules. Fabric sourced from any global origin cut and sewn in Bangladesh qualifies for duty-free access.
* **Chemical Compliance:** Factories must comply with ZDHC Level 3 standards for denim washing effluent.

### Recommended Action
* Explore active UK buyers on the [Garments Sector](/sectors/garments) hub and browse verified factories.`,
      strategySummary: '0% tariff on denim into the UK under DCTS with single-transformation rules of origin.',
      riskFactors: [
        'Strict audit adherence to UK Modern Slavery Act and factory safety regulations',
        'Non-compliant washing effluent chemicals may trigger cargo rejection at Felixstowe or Southampton'
      ],
      suggestedCounter: 'Offer FOB Chattogram at $7.20 for regular 12oz denim trousers with 90-day lead time.',
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  },

  // 4. Open Account Risks & LC Payment Security
  {
    id: 'payment_open_account_lc',
    keywords: ['ওপেন', 'অ্যাকাউন্ট', 'ঝুঁকি', 'পেমেন্ট', 'এলসি', 'lc', 'open account', 'upas', 'fob', 'টাকা', 'payment', 'letter of credit'],
    match: (q) => {
      const lower = q.toLowerCase();
      return lower.includes('ওপেন অ্যাকাউন্ট') || lower.includes('open account') ||
             (lower.includes('পেমেন্ট') && (lower.includes('ঝুঁকি') || lower.includes('এলসি') || lower.includes('নিরাপত্তা'))) ||
             (lower.includes('payment') && (lower.includes('risk') || lower.includes('lc')));
    },
    getBn: () => ({
      reply: `### ওপেন অ্যাকাউন্টের চরম ঝুঁকি ও নিরাপদ পেমেন্ট রূপরেখা

* **ওপেন অ্যাকাউন্টের ঝুঁকি:**
  * ওপেন অ্যাকাউন্টে বায়ার পণ্য বুঝে পাওয়ার ৩০, ৬০ বা ৯০ দিন পর টাকা দেওয়ার প্রতিশ্রুতি দেয়। এতে কোনো ব্যাংকিং গ্যারান্টি বা জামানত থাকে না।
  * বায়ার টাকা দিতে গড়িমসি করলে বা ছোটখাটো অজুহাতে ডিসকাউন্ট দাবি করলে বাংলাদেশে বসে বিদেশি ক্রেতার বিরুদ্ধে মামলা করার কোনো কার্যকর সুযোগ থাকে না।
  * বায়ার দেউলিয়া হলে পুরো শিপমেন্টের টাকা খোয়া যাওয়ার আশঙ্কা থাকে।

### প্রস্তাবিত নিরাপদ পেমেন্ট কৌশল
\`\`\`text
১. Confirmed Irrevocable LC at Sight (ইউরোপীয় বা প্রথম সারির আন্তর্জাতিক ব্যাংক দ্বারা কনফার্মড)
২. ৩০% অগ্রিম টিটি (Advance TT) এবং বাকি ৭০% শিপমেন্ট ডকুমেন্টস (BL) এর বিপরীতে এলসি
৩. এসক্রো ট্রাস্ট অ্যাকাউন্ট বা এক্সপোর্ট ক্রেডিট ইন্স্যুরেন্স
\`\`\`

* বায়ার যদি এলসিতে অনীহা দেখায়, তবে বাংলাদেশ ব্যাংকের ট্রেড রেগুলেশন অনুযায়ী [ট্রেড রেগুলেটরি গাইড](/features/export-documents) অনুসরণ করুন এবং নিরাপদ ডিলের জন্য আমাদের [লাইভ ডিলরুম](/dealroom)-এ বায়ারকে আমন্ত্রণ জানান।`,
      strategySummary: 'ওপেন অ্যাকাউন্টের শতভাগ ঝুঁকি এড়িয়ে কনফার্মড সাইট এলসি বা ৩০% অগ্রিম টিটি পেমেন্ট রূপরেখা।',
      riskFactors: [
        'ওপেন অ্যাকাউন্টে পণ্য খালাসের পর বায়ার অর্থ পরিশোধে অস্বীকৃতি জানালে ব্যাংকের কোনো দায় থাকে না',
        'বাংলাদেশ ব্যাংকের নির্দেশনা অমান্য করে অরক্ষিত ওপেন অ্যাকাউন্ট করলে রপ্তানি মূল্য প্রত্যাবাসনে জটিলতা হতে পারে'
      ],
      suggestedCounter: 'বায়ারকে জানান: কারখানা পলিসি অনুযায়ী প্রথম অর্ডারে Irrevocable LC at Sight বাধ্যতামূলক, পরবর্তী অর্ডারে UPAS সুবিধা বিবেচনা করা হবে।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Risks of Open Account & Safe Payment Architecture

* **Critical Risks of Open Account:**
  * Goods are shipped and released before payment. The exporter bears 100% default risk with zero bank collateral.
  * Buyers frequently claim fabricated quality discounts or delay payments 90 to 120 days.
  * Cross-border legal recourse from Bangladesh against foreign defaulting buyers is prohibitively expensive.

### Recommended Secure Payment Terms
\`\`\`text
1. Confirmed Irrevocable Letter of Credit at Sight (confirmed by a top-tier European/UK bank)
2. 30% Advance TT deposit + 70% Irrevocable LC against Bill of Lading
3. Export Credit Guarantee Corporation (ECGC) or factoring insurance
\`\`\`

* Review compliance documentation under [Export Documents](/features/export-documents) and conduct structured counter-negotiations in our [Live Deal Room](/dealroom).`,
      strategySummary: 'Mitigate zero-collateral Open Account exposure with Confirmed Irrevocable LC at Sight.',
      riskFactors: [
        'Total loss of export revenue if the foreign importer experiences insolvency post-clearance',
        'Central bank export realization compliance breaches if Open Account payments are withheld'
      ],
      suggestedCounter: 'Counter-offer: Irrevocable LC at Sight for the inaugural contract, with UPAS 60 days on subsequent volume.',
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  },

  // 5. Confirmed LC vs UPAS LC
  {
    id: 'confirmed_vs_upas_lc',
    keywords: ['কনফার্মড', 'ইউপাস', 'upas', 'confirmed', 'পার্থক্য', 'difference'],
    match: (q) => {
      const lower = q.toLowerCase();
      return (lower.includes('ইউপাস') || lower.includes('upas')) &&
             (lower.includes('কনফার্মড') || lower.includes('confirmed') || lower.includes('পার্থক্য') || lower.includes('lc'));
    },
    getBn: () => ({
      reply: `### কনফার্মড এলসি বনাম ইউপাস (UPAS) এলসির পার্থক্য

\`\`\`text
১. কনফার্মড এলসি (Confirmed Irrevocable LC):
   - বায়ারের ব্যাংকের পাশাপাশি একটি আন্তর্জাতিক কনফার্মিং ব্যাংক পেমেন্টের গ্যারান্টি দেয়।
   - জাহাজীকরণের পর ত্রুটিমুক্ত ডকুমেন্টস উপস্থাপন করলেই রপ্তানিকারক তাৎক্ষণিক (At Sight) পেমেন্ট পেয়ে যায়।
   - দেশীয় ও বায়ার উভয় ব্যাংকের ঝুঁকির হাত থেকে শতভাগ সুরক্ষা নিশ্চিত করে।

২. ইউপাস এলসি (Usance Payable at Sight - UPAS):
   - বায়ার তার ব্যাংকের কাছ থেকে ৬০, ৯০ বা ১২০ দিনের মেয়াদি সুবিধা (Usance) পায়।
   - কিন্তু বাংলাদেশি রপ্তানিকারক জাহাজীকরণের পর Sight ভিত্তিতে পূর্ণ অর্থ বুঝে পায়।
   - ব্যাংক ডিসকাউন্টিং চার্জ ও সুদ বায়ারের অ্যাকাউন্টে যোগ হয়।
\`\`\`

### রপ্তানিকারকের জন্য করণীয়
* ইউপাস এলসিতে নিশ্চিত করুন যে ক্লজে স্পষ্টভাবে লেখা আছে: **"All acceptance commission, discounting interest and bank charges are on applicant's (buyer's) account."**`,
      strategySummary: 'কনফার্মড সাইট এলসি ও ইউপাস এলসির তুলনামূলক ব্যাংকিং সুরক্ষা বিশ্লেষণ।',
      riskFactors: [
        'ইউপাস এলসিতে ডিসকাউন্টিং চার্জ বায়ারের বদলে রপ্তানিকারকের ওপর চাপালে লাভের মার্জিন কমে যাবে',
        'কনফার্মিং ব্যাংক প্রথম শ্রেণির আন্তর্জাতিক ব্যাংক না হলে থার্ড-পার্টি রিস্ক থেকে যায়'
      ],
      suggestedCounter: 'ইউপাস এলসি গ্রহণ করুন তবে ডিসকাউন্টিং ফি বায়ার বহন করার স্পষ্ট ক্লজ বাধ্যতামূলক রাখুন।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Confirmed LC vs UPAS LC Comparison

\`\`\`text
1. Confirmed Irrevocable LC at Sight:
   - Both the issuing bank and a Tier-1 confirming bank guarantee payment.
   - Exporter receives immediate payment upon presenting clean shipping documents.
   - Maximum protection against issuing bank insolvency and sovereign political risks.

2. UPAS LC (Usance Payable at Sight):
   - Buyer enjoys deferred credit payment (60, 90, or 120 days).
   - Bangladeshi exporter receives immediate sight payment through bank discounting.
   - Financing interest and bank discounting charges are billed to the buyer.
\`\`\`

### Best Practice for Exporters
* Ensure the LC explicitly stipulates: **"Discounting charges and acceptance interest are for applicant's account."**`,
      strategySummary: 'Comparative breakdown of Confirmed LC vs UPAS LC credit terms and fee allocation.',
      riskFactors: [
        'Hidden bank discounting charges shifted to exporter will erode gross operational margins',
        'Confirming bank must hold minimum A-rating from Fitch, Moody\'s, or S&P'
      ],
      suggestedCounter: 'Accept UPAS 90 days with interest charges and acceptance commissions explicitly borne by applicant.',
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  },

  // 6. Chattogram Port Charges & Trucking Freight
  {
    id: 'chattogram_port_charges',
    keywords: ['চট্টগ্রাম', 'বন্দর', 'কনটেইনার', 'চার্জ', 'ভাড়া', 'ট্রাক', 'freight', 'port', 'chattogram', 'demurrage', 'কন্টেইনার'],
    match: (q) => {
      const lower = q.toLowerCase();
      return (lower.includes('চট্টগ্রাম') || lower.includes('বন্দর') || lower.includes('chattogram') || lower.includes('port')) &&
             (lower.includes('চার্জ') || lower.includes('ভাড়া') || lower.includes('কনটেইনার') || lower.includes('container') || lower.includes('freight'));
    },
    getBn: () => ({
      reply: `### চট্টগ্রাম বন্দর কনটেইনার চার্জ ও ফ্যাক্টরি লজিস্টিকস হিসাব

* **২০ ফুট কনটেইনারের প্রাক্কলিত বন্দর ও টার্মিনাল চার্জ:**
\`\`\`text
চট্টগ্রাম বন্দর কর্তৃপক্ষ (CPA) চার্জ ও টার্মিনাল হ্যান্ডলিং (THC): আনুমানিক ১২,০০০ থেকে ১৮,৫০০ টাকা
অফ-ডক / প্রাইভেট আইসিডি (CFS) চার্জ: আনুমানিক ১৪,০০০ থেকে ২০,০০০ টাকা
কাস্টমস ক্লিয়ারেন্স ও সিঅ্যান্ডএফ এজেন্ট ফি: আনুমানিক ৫,০০০ থেকে ৮,০০০ টাকা
\`\`\`

* **ফ্যাক্টরি থেকে বন্দর কাভার্ড ভ্যান ভাড়া:**
  * সাভার ও আশুলিয়া থেকে চট্টগ্রাম বন্দর (৪০ ফুট কাভার্ড ভ্যান): প্রায় ২৫,০০০ থেকে ৩৪,০০০ টাকা।
  * গাজীপুর / কোনাবাড়ী থেকে চট্টগ্রাম বন্দর: প্রায় ২৬,০০০ থেকে ৩৫,০০০ টাকা।
  * বগুড়া / উত্তরাঞ্চল থেকে চট্টগ্রাম বন্দর: প্রায় ৩৮,০০০ থেকে ৪৮,০০০ টাকা।

### কনটেইনার জট ও ডিউরেজ এড়ানোর কৌশল
* বন্দর ইয়ার্ডে ৪ দিনের ফ্রি টাইম শেষ হওয়ার আগেই বিল অব এক্সপোর্ট দাখিল করুন।
* প্রি-অ্যারাইভাল ডকুমেন্টেশন এবং Direct Port Delivery (DPD) সেবা নিয়ে সময় ও খরচ বাঁচান।
* বিস্তারিত আঞ্চলিক বিবরণ জানতে আমাদের [চট্টগ্রাম হাব](/locations/chattogram) ও [সাভার হাব](/locations/savar) দেখুন।`,
      strategySummary: 'চট্টগ্রাম বন্দরের টার্মিনাল চার্জ, অফ-ডক আইসিডি রেট ও কাভার্ড ভ্যান পরিবহন ব্যয়ের সঠিক হিসাব।',
      riskFactors: [
        'ঈদের ছুটির আগে বা পিক মৌসুমে হাইওয়ে যানজট ও কনটেইনার জটে ডিউরেজ চার্জ প্রতিদিন ১০০ ডলার পর্যন্ত হতে পারে',
        'ড্রাফট বিল অব লেডিং (BL) এ কোনো তথ্যের ভুল থাকলে সংশোধনী ফি ও ক্লিয়ারেন্সে অতিরিক্ত সময় নষ্ট হয়'
      ],
      suggestedCounter: 'বায়ারকে পোর্ট হ্যান্ডলিং ও টার্মিনাল ফি হিসেবে প্রতি ২০ ফুট কনটেইনারে $২০০ যুক্ত করে FOB কোটেশন দিন।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Chattogram Port Container Tariffs & Logistics Schedule

* **Estimated Port & Terminal Charges (20ft Container):**
\`\`\`text
Chattogram Port Authority (CPA) & THC: Approx 12,000 to 18,500 BDT
Off-Dock / Private CFS Depot charges: Approx 14,000 to 20,000 BDT
Customs C&F Clearance Agency Fees: Approx 5,000 to 8,000 BDT
\`\`\`

* **Inland Transportation (Covered Van Freight):**
  * Savar / Ashulia to Chattogram Port (40ft covered van): Approx 25,000 to 34,000 BDT.
  * Gazipur to Chattogram Port: Approx 26,000 to 35,000 BDT.
  * Bogura / North Bengal to Chattogram Port: Approx 38,000 to 48,000 BDT.

### Port Congestion & Demurrage Mitigation
* Submit Bill of Export before cargo dispatch to clear customs within the 4-day free dwell time.
* Utilize Direct Port Delivery (DPD) channels for expedited gate-in.
* Check regional logistics on our [Chattogram Hub](/locations/chattogram) and [Savar Hub](/locations/savar).`,
      strategySummary: 'Schedule of CPA port tariffs, off-dock depot charges, and regional inland haulage.',
      riskFactors: [
        'Peak season port congestion can incur shipping line demurrage fees exceeding $100 per TEU per day',
        'Discrepant shipping marks on Bills of Lading result in extended physical inspection delays'
      ],
      suggestedCounter: 'Include standard $200 per TEU terminal handling buffer in your FOB Chattogram quotation.',
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  },

  // 7. Cash Incentives & Subsidies (নগদ প্রণোদনা)
  {
    id: 'cash_incentives_bangladesh',
    keywords: ['নগদ', 'প্রণোদনা', 'প্রণোদনার', 'সাবসিডি', 'ইনসেনটিভ', 'incentive', 'cash', 'subsidy', 'বাংলাদেশ ব্যাংক'],
    match: (q) => {
      const lower = q.toLowerCase();
      return lower.includes('প্রণোদনা') || lower.includes('নগদ') || lower.includes('incentive') || lower.includes('সাবসিডি');
    },
    getBn: () => ({
      reply: `### বাংলাদেশ ব্যাংক রপ্তানি নগদ প্রণোদনা রূপরেখা

বাংলাদেশ ব্যাংকের বৈদেশিক মুদ্রা নীতি বিভাগ (FEPD) এর সার্কুলার অনুযায়ী বিভিন্ন খাতে বর্তমান প্রণোদনার হার:
\`\`\`text
১. বহুমুখী পাটপণ্য (Diversified Jute Goods): ৭% থেকে ১৫%
২. চামড়া ও জুতা শিল্প (Leather Goods & Footwear): ১০%
৩. কৃষি প্রক্রিয়াজাত পণ্য ও কৃষিজাত সামগ্রী: ১৫%
৪. প্লাস্টিক ও মেলামাইন পণ্য: ৮%
৫. তৈরি পোশাক (RMG): নতুন বাজার ও বিশেষ প্রণোদনা ১.৫% থেকে ৩%
\`\`\`

### নগদ সহায়তার আবেদন পদ্ধতি
* রপ্তানি মূল্য দেশে প্রত্যাবাসনের (Proceeds Realization) **১৮০ দিনের মধ্যে** সংশ্লিষ্ট অথরাইজড ডিলার (AD) ব্যাংকে আবেদন করতে হবে।
* প্রয়োজনীয় ডকুমেন্টস: এক্সপোর্ট পিআরসি (PRC), বিল অব লেডিং (BL), কমার্শিয়াল ইনভয়েস, ইপিবি (EPB) ও অ্যাসোসিয়েশন প্রত্যয়নপত্র।
* বিস্তারিত সার্কুলার নির্দেশিকা দেখতে আমাদের [ট্রেড ডক্স লাইব্রেরি](/docs) পরিদর্শন করুন।`,
      strategySummary: 'বাংলাদেশ ব্যাংক সার্কুলার অনুযায়ী রপ্তানি নগদ প্রণোদনার খাতভিত্তিক হার ও ১৮০ দিনের আবেদন সময়সীমা।',
      riskFactors: [
        'রপ্তানি মূল্য প্রত্যাবাসনের ১৮০ দিন অতিক্রান্ত হলে ব্যাংক কোনোভাবেই আবেদন গ্রহণ করবে না',
        'ভ্যালু এডিশন বা স্থানীয় সংযোজন নির্দেশিত হারের চেয়ে কম থাকলে প্রণোদনা বাতিল হতে পারে'
      ],
      suggestedCounter: 'পণ্য প্রস্তুতকালে লোকাল ভ্যালু এডিশন ৫০% এর বেশি রেখে সর্বোচ্চ নগদ প্রণোদনার যোগ্যতা নিশ্চিত করুন।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Bangladesh Bank Export Cash Incentive Framework

Applicable incentive subsidy rates per Foreign Exchange Policy Department (FEPD) directives:
\`\`\`text
1. Diversified Jute Goods: 7% to 15%
2. Leather Goods & Finished Footwear: 10%
3. Agro-processing & Agricultural Exports: 15%
4. Plastic & Melamine Products: 8%
5. Ready Made Garments (RMG): 1.5% to 3% (new market exploration tier)
\`\`\`

### Application Requirements
* Submit application to your Authorized Dealer (AD) bank within **180 days of proceeds realization (PRC)**.
* Mandatory documents: Export PRC, Bill of Lading, Commercial Invoice, and EPB / Association validation.
* Read official regulatory frameworks on the [Documentation Viewer](/docs).`,
      strategySummary: 'Overview of central bank export cash assistance tiers and strict 180-day filing deadline.',
      riskFactors: [
        'Applications filed past the 180-day statutory deadline are strictly time-barred by Bangladesh Bank',
        'Failure to demonstrate required minimum domestic value addition will disqualify claims'
      ],
      suggestedCounter: 'Maintain verified local value-addition records above 50% to secure full incentive rebates.',
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  },

  // 8. HS Code Classification
  {
    id: 'hs_code_classification',
    keywords: ['hs', 'code', 'এইচএস', 'কোড', 'শ্রেণীবিভাগ', 'classification', 'কাস্টমস'],
    match: (q) => {
      const lower = q.toLowerCase();
      return (lower.includes('hs') || lower.includes('এইচএস')) && (lower.includes('code') || lower.includes('কোড') || lower.includes('ক্লাসিফিকেশন'));
    },
    getBn: () => ({
      reply: `### প্রধান রপ্তানি পণ্যের ডব্লিউসিও এইচএস (HS) কোড তালিকা

\`\`\`text
- নিট টি-শার্ট ও পোলো শার্ট (১০০% সুতি): HS 6109.10
- পুরুষদের ডেনিম ট্রাউজার / জিন্স: HS 6203.42
- বহুমুখী পাটের তৈরি ব্যাগ ও বস্তা: HS 6305.10 ও 5310.10
- চামড়ার তৈরি জুতা ও বুট: HS 6403.59
- চামড়ার হ্যান্ডব্যাগ ও লাগেজ: HS 4202.21
- সিরামিক ও পোরসেলিন টেবিলওয়্যার: HS 6911.10 ও 6912.00
\`\`\`

* যেকোনো কাঁচামাল বা পণ্যের সঠিক ৮-ডিজিট কাস্টমস ট্যারিফ সাবহেডিং নির্ধারণ করতে আমাদের স্বয়ংক্রিয় [এইচএস ক্লাসিফিকেশন ইঞ্জিন](/features/hs-classification) ব্যবহার করুন।`,
      strategySummary: 'আন্তর্জাতিক ডব্লিউসিও ৬ ও ৮ ডিজিট কাস্টমস ট্যারিফ কোড গাইড।',
      riskFactors: [
        'ভুল এইচএস কোড ডিক্লেয়ার করলে কাস্টমস শুল্ক ফাঁকির অভিযোগে চালান আটকে দিতে পারে'
      ],
      suggestedCounter: 'রপ্তানির পূর্বেই পণ্যের ল্যাব টেস্ট রিপোর্ট অনুযায়ী সঠিক এইচএস কোড নিশ্চিত করুন।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Primary Export WCO Harmonized System (HS) Codes

\`\`\`text
- Knit Cotton T-Shirts & Polos: HS 6109.10
- Men's Denim Trousers / Jeans: HS 6203.42
- Diversified Jute Sacks & Bags: HS 6305.10 and 5310.10
- Leather Footwear / Chelsea Boots: HS 6403.59
- Leather Handbags & Travel Goods: HS 4202.21
- Ceramic & Porcelain Tableware: HS 6911.10 and 6912.00
\`\`\`

* To resolve exact 8-digit national tariff lines, launch the [HS Code Classification Engine](/features/hs-classification).`,
      strategySummary: 'Standard Harmonized System code directory for top Bangladesh export commodities.',
      riskFactors: [
        'Misdeclaration of HS subheadings results in customs seizure or heavy tariff misclassification penalties'
      ],
      suggestedCounter: 'Verify tariff heading against sample lab composition before finalizing Bill of Export.',
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  },

  // 9. Finding Buyers & Platform Features
  {
    id: 'finding_buyers_dealroom',
    keywords: ['বায়ার', 'ক্রেতা', 'খুঁজব', 'পাব', 'buyer', 'dealroom', 'ডিলরুম', 'matching', 'মার্কেট'],
    match: (q) => {
      const lower = q.toLowerCase();
      return lower.includes('বায়ার') || lower.includes('ক্রেতা') || lower.includes('buyer') || lower.includes('ডিলরুম') || lower.includes('dealroom');
    },
    getBn: () => ({
      reply: `### আন্তর্জাতিক বায়ারদের সাথে সংযোগ ও লাইভ ডিলরুম

এক্সপোর্টপাইলট এআই প্ল্যাটফর্মে ইউরোপ, যুক্তরাজ্য, জাপান ও উত্তর আমেরিকার সরাসরি ভেরিফাইড বায়ারদের তালিকা রয়েছে:
* **বায়ার তালিকা অনুসন্ধান:** সরাসরি ক্রেতাদের চাহিদা ও আরএফকিউ দেখতে [বায়ার ডিরেক্টরি](/buyers) পরিদর্শন করুন।
* **সরাসরি দর কষাকষি:** মধ্যস্বত্বভোগী ছাড়া রিয়েল-টাইম এফওবি ও সিআইএফ দর আলোচনার জন্য [লাইভ ডিলরুম](/dealroom)-এ যোগ দিন।
* **ক্যাটালগ প্রদর্শন:** কারখানার পণ্যের মান আন্তর্জাতিক বায়ারদের কাছে পৌঁছে দিতে [পণ্য ক্যাটালগ](/catalog) ব্যবহার করুন।

সম্পূর্ণ এআই নেগোশিয়েশন এবং বায়ারদের সাথে সরাসরি লাইভ চ্যাট করতে [লগইন করুন](/login) অথবা নতুন ফ্যাক্টরি হিসেবে [নিবন্ধন করুন](/register)।`,
      strategySummary: 'আন্তর্জাতিক বায়ার ডিরেক্টরি ও মধ্যস্বত্বভোগীবিহীন লাইভ ডিলরুম সংযোগ নির্দেশিকা।',
      riskFactors: [
        'অযাচাইকৃত ট্রেডিং ব্রোকারদের সাথে কাজ করলে কমিশনের কারণে পণ্যের আসল লাভ হাতছাড়া হয়'
      ],
      suggestedCounter: 'সরাসরি প্ল্যাটফর্মের ভেরিফাইড ক্রেতাদের সাথে কথা বলে ১০-১৫% অতিরিক্ত মার্জিন নিশ্চিত করুন।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Connecting with Global Buyers & Live Deal Room

ExportPilot AI connects Bangladeshi manufacturers directly with verified European, UK, Japanese, and American importers:
* **Explore Buyers:** View active trade inquiries in our [Buyer Directory](/buyers).
* **Live Negotiation:** Engage in real-time FOB and CIF deal negotiations in the [Live Deal Room](/dealroom).
* **Showcase Catalog:** Present your audited production capacity via the [Product Catalog](/catalog).

To activate full deal negotiations and direct buyer matching, [Log in to your account](/login) or [Register your factory](/register).`,
      strategySummary: 'Direct buyer matching without intermediaries via Live Deal Room.',
      riskFactors: [
        'Unregistered trading middlemen take 10% to 15% margins from factory profits'
      ],
      suggestedCounter: 'Engage verified importers directly on ExportPilot to protect factory margins.',
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  },

  // 10. Login / Registration Navigation
  {
    id: 'login_account_navigation',
    keywords: ['লগইন', 'রেজিস্টার', 'অ্যাকাউন্ট', 'পাসওয়ার্ড', 'সাইন', 'login', 'register', 'account', 'sign in'],
    match: (q) => {
      const lower = q.toLowerCase();
      return lower.includes('লগইন') || lower.includes('রেজিস্টার') || lower.includes('login') || lower.includes('register') || lower.includes('অ্যাকাউন্ট');
    },
    getBn: () => ({
      reply: `### অ্যাকাউন্ট অ্যাক্সেস ও লগইন সুবিধা

এক্সপোর্টপাইলট এআই সিস্টেমে সকল ধরনের ব্যবহারকারীর জন্য বিশেষায়িত ড্যাশবোর্ড রয়েছে:
* **ফ্যাক্টরি ওনার ও এক্সপোর্টার:** পণ্য ক্যাটালগ, কার্বন অডিট এবং ডিলরুম পরিচালনা।
* **আন্তর্জাতিক বায়ার:** সরাসরি আরএফকিউ প্রদান ও সাপ্লায়ার যাচাই।
* **ব্যাংক ও কাস্টমস অফিসার:** এলসি ডকুমেন্টেশন ও ক্লিয়ারেন্স যাচাই।

আপনার অ্যাকাউন্টে প্রবেশ করতে [এখানে লগইন করুন](/login)। নতুন একাউন্ট খুলতে [রেজিস্ট্রেশন পাতায় যান](/register)।`,
      strategySummary: 'ফ্যাক্টরি ওনার, বায়ার ও কর্মকর্তাদের জন্য ড্যাশবোর্ড অ্যাক্সেস গাইড।',
      riskFactors: ['আপনার লগইন ক্রেডেনশিয়াল অন্য কারো সাথে শেয়ার করবেন না'],
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    }),
    getEn: () => ({
      reply: `### Account Access & Platform Login

ExportPilot AI provides tailored dashboards for all trade participants:
* **Factory Owners & Exporters:** Manage product catalogs, carbon audits, and live deal rooms.
* **International Buyers:** Post RFQs and verify supplier credentials directly.
* **Bankers & Customs Agents:** Audit LC documentation and customs compliance.

To access your workspace, please [Log In Here](/login). To create a new enterprise account, [Register Here](/register).`,
      strategySummary: 'Secure workspace access for factory owners, buyers, and financial officers.',
      riskFactors: ['Never share your authentication credentials with unauthorized parties'],
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    })
  }
];

export type ChatWidgetKind = 'carbon-calculator' | 'incoterms-compare' | 'lc-risk-checker';

/**
 * Deterministic intent detection that attaches interactive widgets to a chat
 * reply. Runs on the user query in both guest and authenticated modes so the
 * experience is identical regardless of engine.
 */
export function detectChatWidgets(rawQuery: string): ChatWidgetKind[] {
  const q = (rawQuery || '').toLowerCase();
  const widgets: ChatWidgetKind[] = [];

  const carbon =
    /(cbam|scope\s*2|kwh|carbon|emission|solar)/.test(q) ||
    ['সিবএএম', 'স্কোপ', 'কার্বন', 'নির্গমন', 'সোলার', 'বিদ্যুৎ'].some((k) => q.includes(k));
  if (carbon) widgets.push('carbon-calculator');

  const incoterms =
    /(cif|cfr|ddp|dap|exw|incoterm)/.test(q) ||
    ['ইনকোটার্ম', 'সিআইএফ', 'ডিডিপি'].some((k) => q.includes(k)) ||
    (/fob/.test(q) && /(compare|vs|versus|difference|তুলনা|পার্থক্য)/.test(q));
  if (incoterms) widgets.push('incoterms-compare');

  const lc =
    /(lc|l\/c|letter\s+of\s+credit|upas)/.test(q) ||
    ['এলসি', 'ইউপাস', 'ক্রেডিট লেটার'].some((k) => q.includes(k));
  if (lc) widgets.push('lc-risk-checker');

  return widgets.slice(0, 2);
}

/**
 * Universal browser-side query resolver.
 * Evaluates user input against structured trade intelligence and returns a rich response.
 */
/**
 * Renders a user query safely inside a markdown reply. Strips characters the
 * chat renderer interprets (links, code, emphasis, headings) so untrusted
 * input can never inject formatting or clickable links into the transcript.
 */
function sanitizeEchoedQuery(raw: string): string {
  return raw
    .replace(/[`*_[\]()#>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

export function queryBrowserTradeAdvisor(rawQuery: string, language: 'bn' | 'en' = 'bn'): BrowserAdvisorResponse {
  const query = (rawQuery || '').trim();
  const lower = query.toLowerCase();
  const echoedQuery = sanitizeEchoedQuery(query);

  // 1. Check knowledge articles
  for (const article of KNOWLEDGE_ARTICLES) {
    if (article.match(query)) {
      return language === 'bn' ? article.getBn(query) : article.getEn(query);
    }
  }

  // 2. Greetings handler
  const greetings = ['হ্যালো', 'হাই', 'সালাম', 'আদাব', 'কেমন', 'hello', 'hi', 'hey', 'greetings', 'help'];
  if (greetings.some((g) => lower.includes(g))) {
    if (language === 'bn') {
      return {
        reply: `### স্বাগতম! আমি এক্সপোর্টপাইলট ব্রাউজার এআই ট্রেড অ্যাডভাইজার

আমি আন্তর্জাতিক রপ্তানি বাণিজ্যের জন্য আপনার সার্বক্ষণিক সহায়ক। আপনি নিচের যেকোনো বিষয় নিয়ে প্রশ্ন করতে পারেন:
* **কার্বন হিসাব ও সিবিএএম:** বিদ্যুৎ বিল থেকে স্কোপ ২ নির্গমন হিসাব ও সোলার সাশ্রয়।
* **শুল্ক ও মার্কেট সুবিধা:** জার্মানি, ইউরোপ ও যুক্তরাজ্যে জুট ও পোশাকের ০% শুল্ক নিয়ম।
* **পেমেন্ট নিরাপত্তা:** ওপেন অ্যাকাউন্টের ঝুঁকি, কনফার্মড এলসি বনাম ইউপাস এলসি পার্থক্য।
* **বন্দর ও পরিবহন:** চট্টগ্রাম বন্দরের চার্জ, অফ-ডক আইসিডি ও ট্রাক ভাড়া।
* **নগদ প্রণোদনা:** বাংলাদেশ ব্যাংকের বৈদেশিক মুদ্রা সার্কুলার ও প্রণোদনার হার।

নিচের প্রশ্নগুলোতে ক্লিক করুন অথবা যেকোনো প্রশ্ন লিখুন। বিস্তারিত বিশ্লেষণের জন্য [ট্রেড ডক্স](/docs) বা [বায়ার ডিরেক্টরি](/buyers) দেখুন।`,
        strategySummary: 'আন্তর্জাতিক রপ্তানি বাণিজ্যের তাৎক্ষণিক ব্রাউজার গাইডলাইন।',
        riskFactors: [
          'রপ্তানি চুক্তিতে ইনকোটার্মস ও পেমেন্ট শর্তের অস্পষ্টতা থাকলে বাণিজ্য ঝুঁকিতে পড়ে'
        ],
        modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
      };
    }
    return {
      reply: `### Welcome! I am the ExportPilot Browser AI Trade Advisor

I provide instant trade intelligence right in your web browser:
* **Carbon & CBAM:** Scope 2 emissions from factory electricity bills and rooftop solar offsets.
* **Tariffs & Market Access:** 0% duty for jute and RMG in Germany, the EU, and the UK.
* **Payment Security:** Mitigating Open Account risks with Confirmed Irrevocable LCs and UPAS terms.
* **Port Logistics:** CPA container charges, off-dock depot fees, and regional inland haulage.
* **Cash Incentives:** Central bank export assistance subsidies and filing deadlines.

Click any suggestion chip below or ask any export question.`,
      strategySummary: 'Instant browser trade guidance for international export commerce.',
      riskFactors: [
        'Ambiguous Incoterms or payment terms in proforma invoices increase trade transaction risk'
      ],
      modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
    };
  }

  // 3. Smart Semantic Fallback for any other trade topic
  if (language === 'bn') {
    return {
      reply: `### এক্সপোর্টপাইলট এআই ব্রাউজার বিশ্লেষণ

আপনার প্রশ্ন: **"${echoedQuery}"**

আন্তর্জাতিক রপ্তানি বাণিজ্যে এই বিষয়ে সফল হতে নিচের মৌলিক বিষয়গুলো বিবেচনা করুন:
* **বাজার ও শুল্ক সুবিধা:** ইউরোপীয় ইউনিয়ন ও যুক্তরাজ্যে বাংলাদেশের তৈরি পোশাক ও বহুমুখী পাটপণ্যে EBA ও DCTS এর আওতায় শূন্য শুল্ক (০%) সুবিধা রয়েছে।
* **পেমেন্ট নিরাপত্তা:** যেকোনো বায়ারের সাথে লেনদেনের ক্ষেত্রে কনফার্মড ইরিভোকেবল এলসি (Confirmed Irrevocable LC at Sight) নির্বাচন করুন। ওপেন অ্যাকাউন্টে অরক্ষিত লেনদেন এড়িয়ে চলুন।
* **কার্বন কমপ্লায়েন্স:** ২০২৬ সাল থেকে কার্যকর সিবিএএম নিয়মে ফ্যাক্টরির গ্রিড বিদ্যুৎ ব্যবহার (প্রতি কিলোওয়াট ঘণ্টায় ০.৫৮ কেজি কার্বন) এবং সোলার এনার্জির সঠিক অডিট প্রস্তুত রাখুন।
* **সরাসরি সংযোগ:** মধ্যস্বত্বভোগী ছাড়া বিদেশি বায়ারদের সাথে আলোচনা করতে আমাদের [বায়ার ডিরেক্টরি](/buyers) ও [লাইভ ডিলরুম](/dealroom) ব্যবহার করুন।

সম্পূর্ণ এআই ট্রেড নেগোশিয়েশন এবং রিয়েল-টাইম কাস্টম বায়ার ডিলের জন্য আপনার অ্যাকাউন্টে [লগইন করুন](/login)। নতুন একাউন্টের জন্য [রেজিস্ট্রেশন করুন](/register)।`,
      strategySummary: 'আন্তর্জাতিক বাণিজ্য কমপ্লায়েন্স, পেমেন্ট নিরাপত্তা ও শূন্য শুল্ক নীতি নির্দেশিকা।',
      riskFactors: [
        'যথাযথ কমপ্লায়েন্স ও আন্তর্জাতিক গুণমান সনদ ছাড়া রপ্তানি করলে কাস্টমস ছাড়পত্রে জটিলতা হতে পারে',
        'নতুন ক্রেতার সাথে প্রথম লেনদেনে কোনো অবস্থাতেই অরক্ষিত বাকিতে বা ওপেন অ্যাকাউন্টে পণ্য দেবেন না'
      ],
      suggestedCounter: 'পেমেন্ট শর্তে কনফার্মড এলসি এবং FOB চট্টগ্রাম বন্দর মূল্য নির্ধারণ করুন।',
      modelUsed: 'ব্রাউজার এআই ইঞ্জিন (JavaScript · Client-side)'
    };
  }

  return {
    reply: `### ExportPilot AI Browser Intelligence

Your Query: **"${echoedQuery}"**

To succeed in cross-border trade regarding this subject, consider these primary pillars:
* **Market Access & Tariffs:** Bangladesh exports in RMG and diversified jute benefit from 0% duty under EU EBA and UK DCTS preferential schemes.
* **Payment Security:** Always demand Confirmed Irrevocable Letter of Credit at Sight from recognized international banks. Avoid unsecured Open Account credit.
* **Environmental Auditing:** Prepare verified Scope 2 emissions documentation (0.58 kg CO2e per kWh) to satisfy emerging EU CBAM compliance standards.
* **Direct Buyer Matching:** Discover verified importers on our [Buyer Directory](/buyers) and negotiate directly in the [Live Deal Room](/dealroom).

To initiate real-time AI deal negotiations with live counterparties, please [Log in to your workspace](/login) or [Register your factory](/register).`,
    strategySummary: 'Standard cross-border trade compliance, secure payment terms, and duty preferences.',
    riskFactors: [
      'Unverified buyer credit ratings create high exposure to cross-border non-payment',
      'Inaccurate trade documentation leads to customs clearance detention at destination ports'
    ],
    suggestedCounter: 'Counter-offer on FOB Chattogram terms with Confirmed LC at Sight.',
    modelUsed: 'Browser AI Engine (JavaScript · Client-side)'
  };
}
