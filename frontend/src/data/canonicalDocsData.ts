// Practical export guides for ExportPilot AI.
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
    categoryBn: 'শুরু করুন',
    categoryEn: 'Getting Started',
    titleBn: 'পণ্য থেকে সরাসরি রপ্তানি',
    titleEn: 'From product to direct export',
    descriptionBn: 'কারখানার তথ্য সাজিয়ে সম্ভাব্য বায়ার, বাজার ও রপ্তানি নথি এক জায়গায় দেখুন।',
    descriptionEn: 'Organize factory details, review potential buyers and markets, and prepare export documents in one place.',
    readTime: '3 min',
    subsections: [
      {
        id: 'factory-details',
        headingBn: 'কারখানা ও পণ্যের তথ্য দিন',
        headingEn: 'Add factory and product details',
        contentBn: 'কারখানার নাম, পণ্যের ছবি, উপাদান, উৎপাদন সক্ষমতা এবং আনুমানিক খরচ লিখুন। সঠিক তথ্য দিলে বায়ারের জন্য দর ও শর্ত সাজানো সহজ হয়।',
        contentEn: 'Add your factory name, product photo, materials, production capacity, and estimated cost. Accurate details make it easier to prepare prices and terms for buyers.',
        callout: {
          type: 'tip',
          textBn: 'উৎপাদন সক্ষমতা ও খরচের তথ্য নিয়মিত হালনাগাদ রাখুন।',
          textEn: 'Keep production capacity and cost details up to date.'
        }
      },
      {
        id: 'market-review',
        headingBn: 'বাজারের শর্ত যাচাই করুন',
        headingEn: 'Review market requirements',
        contentBn: 'প্রতিটি বাজারে পণ্যের শুল্ক, প্রয়োজনীয় সনদ, বায়ারের শর্ত এবং পেমেন্ট পদ্ধতি আলাদা হতে পারে। প্রস্তাব পাঠানোর আগে সংশ্লিষ্ট বাজারের নিয়ম ও বায়ারের তথ্য যাচাই করুন।',
        contentEn: 'Tariffs, certificates, buyer requirements, and payment terms can vary by market. Check the relevant rules and buyer details before sending a proposal.'
      }
    ]
  },
  {
    id: 'deal-room-steps',
    categoryBn: 'কাজের ধাপ',
    categoryEn: 'How it works',
    titleBn: 'ডিল রুমে রপ্তানির প্রস্তুতি',
    titleEn: 'Prepare an export deal',
    descriptionBn: 'পণ্যের বিবরণ থেকে বায়ারের জন্য প্রস্তাব ও নথি তৈরির সংক্ষিপ্ত নির্দেশিকা।',
    descriptionEn: 'A short guide to preparing a buyer proposal and export documents from your product details.',
    readTime: '4 min',
    subsections: [
      {
        id: 'product-details',
        headingBn: 'পণ্যের বিবরণ',
        headingEn: 'Product details',
        contentBn: 'পণ্যের ছবি, উপাদান, মাপ, উৎপাদন খরচ এবং মাসিক সক্ষমতা যোগ করুন। সিস্টেম সম্ভাব্য এইচএস কোড সাজেস্ট করলে চালানের আগে কাস্টমস ব্রোকারের সঙ্গে মিলিয়ে নিন.',
        contentEn: 'Add a product photo, materials, size, production cost, and monthly capacity. If a tariff code is suggested, confirm it with your customs broker before shipment.'
      },
      {
        id: 'factory-brief',
        headingBn: 'কারখানার বিবরণ',
        headingEn: 'Factory brief',
        contentBn: 'মাইক্রোফোন চালু করে বাংলায় উৎপাদন সক্ষমতা, বন্দর, পণ্যের বৈশিষ্ট্য এবং বায়ারের শর্ত বলুন। পাঠানোর আগে তৈরি হওয়া তথ্যগুলো দেখে নিন।',
        contentEn: 'Use the microphone to describe capacity, port, product details, and buyer requirements in Bangla. Review the captured details before sending.'
      },
      {
        id: 'carbon-review',
        headingBn: 'কার্বন তথ্য',
        headingEn: 'Carbon information',
        contentBn: 'বিদ্যুৎ বিল ও উৎপাদনের পরিমাণ দিয়ে প্রতি ইউনিটের আনুমানিক নির্গমন দেখুন। প্রয়োজন হলে হিসাবটি আপনার বায়ার বা কমপ্লায়েন্স পরামর্শকের সঙ্গে যাচাই করুন।',
        contentEn: 'Use the electricity bill and production volume to review estimated emissions per unit. Confirm the result with your buyer or compliance adviser when required.'
      },
      {
        id: 'buyers-and-terms',
        headingBn: 'বায়ার ও দর',
        headingEn: 'Buyers and pricing',
        contentBn: 'সম্ভাব্য বায়ার, গন্তব্য বাজার, এফওবি দর এবং পেমেন্ট শর্ত তুলনা করুন। শুল্ক সুবিধা পণ্য ও উৎপত্তির নিয়মের ওপর নির্ভর করে।',
        contentEn: 'Compare potential buyers, destination markets, FOB prices, and payment terms. Tariff benefits depend on the product and rules of origin.'
      },
      {
        id: 'documents',
        headingBn: 'রপ্তানি নথি',
        headingEn: 'Export documents',
        contentBn: 'প্রফর্মা ইনভয়েস ও বায়ারের জন্য প্রস্তাব তৈরি করুন। প্রতিষ্ঠানের নাম, পণ্যের পরিমাণ, দর, চালানের শর্ত এবং পেমেন্টের তথ্য পাঠানোর আগে মিলিয়ে নিন।',
        contentEn: 'Prepare a proforma invoice and buyer proposal. Check the company name, quantities, price, shipping terms, and payment details before sharing.'
      }
    ]
  },
  {
    id: 'buyer-directory',
    categoryBn: 'বায়ার ও বাজার',
    categoryEn: 'Buyers and markets',
    titleBn: 'বায়ার তালিকা ব্যবহার করুন',
    titleEn: 'Use the buyer directory',
    descriptionBn: 'পণ্য, দেশ, সনদ এবং পেমেন্ট শর্ত অনুযায়ী সম্ভাব্য বায়ার খুঁজুন।',
    descriptionEn: 'Find potential buyers by product, destination, certification, and payment terms.',
    readTime: '2 min',
    subsections: [
      {
        id: 'buyer-search',
        headingBn: 'তালিকা ফিল্টার করুন',
        headingEn: 'Filter the directory',
        contentBn: 'কোম্পানি, শহর বা পণ্যের খাত লিখে খুঁজুন। এরপর গন্তব্য দেশ, প্রয়োজনীয় সনদ, ন্যূনতম অর্ডার এবং পেমেন্ট শর্ত বেছে নিন।',
        contentEn: 'Search by company, city, or product segment. Then choose a destination, required certification, minimum order, and payment terms.'
      },
      {
        id: 'buyer-checks',
        headingBn: 'চালানের আগে যাচাই',
        headingEn: 'Check before shipment',
        contentBn: 'অর্ডার নিশ্চিত করার আগে বায়ারের নিবন্ধন, রেফারেন্স, ব্যাংক নির্দেশনা এবং চুক্তির শর্ত স্বাধীনভাবে যাচাই করুন।',
        contentEn: 'Before confirming an order, independently verify the buyer registration, references, bank instructions, and contract terms.',
        callout: {
          type: 'important',
          textBn: 'তালিকার তথ্য প্রাথমিক যাচাইয়ে সহায়তা করে। অর্থ বা পণ্য পাঠানোর আগে নিজস্ব যাচাই করুন।',
          textEn: 'Directory details are a starting point. Complete your own checks before sending money or goods.'
        }
      }
    ]
  },
  {
    id: 'carbon-record',
    categoryBn: 'কমপ্লায়েন্স',
    categoryEn: 'Compliance',
    titleBn: 'বিদ্যুৎ বিল থেকে কার্বন তথ্য',
    titleEn: 'Carbon information from utility bills',
    descriptionBn: 'বিদ্যুৎ ব্যবহার ও উৎপাদনের তথ্য থেকে প্রতি ইউনিটের নির্গমন হিসাব পর্যালোচনা করুন।',
    descriptionEn: 'Review an emissions estimate per unit using electricity use and production details.',
    readTime: '3 min',
    subsections: [
      {
        id: 'carbon-inputs',
        headingBn: 'যে তথ্য লাগবে',
        headingEn: 'Information to provide',
        contentBn: 'সঠিক সময়ের বিদ্যুৎ বিল এবং ওই সময়ে উৎপাদিত পণ্যের পরিমাণ দিন। বিলের ব্যবহার ও উৎপাদনের সময়সীমা যেন মিলে তা দেখে নিন।',
        contentEn: 'Provide a utility bill for the relevant period and the quantity produced during that period. Check that the bill and production dates match.'
      },
      {
        id: 'carbon-limits',
        headingBn: 'হিসাবের ব্যবহার',
        headingEn: 'How to use the estimate',
        contentBn: 'এটি প্রাথমিক হিসাব। আমদানিকারক, নিরীক্ষক বা সরকারি সংস্থা যে পদ্ধতি ও নথি চায়, তা আলাদাভাবে যাচাই করুন।',
        contentEn: 'This is an estimate. Confirm the method and documentation required by the importer, auditor, or relevant authority.'
      }
    ]
  },
  {
    id: 'export-documents',
    categoryBn: 'চালান ও নথি',
    categoryEn: 'Shipment documents',
    titleBn: 'প্রফর্মা ইনভয়েস প্রস্তুত করুন',
    titleEn: 'Prepare a proforma invoice',
    descriptionBn: 'বায়ারের সঙ্গে দর, পরিমাণ, চালান এবং পেমেন্টের শর্ত লিখিতভাবে মিলিয়ে নিন।',
    descriptionEn: 'Confirm price, quantity, shipment, and payment terms with the buyer in writing.',
    readTime: '3 min',
    subsections: [
      {
        id: 'invoice-details',
        headingBn: 'ইনভয়েসে যা দেখবেন',
        headingEn: 'What to check on the invoice',
        contentBn: 'বিক্রেতা ও বায়ারের প্রতিষ্ঠানের নাম, পণ্যের বিবরণ, পরিমাণ, একক দর, মোট মূল্য, মুদ্রা, এফওবি বন্দর এবং পেমেন্ট শর্ত মিলিয়ে নিন।',
        contentEn: 'Check the seller and buyer names, product description, quantity, unit price, total value, currency, FOB port, and payment terms.'
      },
      {
        id: 'invoice-review',
        headingBn: 'পাঠানোর আগে',
        headingEn: 'Before sharing',
        contentBn: 'ব্যাংক বা এলসি সংক্রান্ত শর্ত, পণ্যের শ্রেণিবিন্যাস এবং প্রযোজ্য রপ্তানি নথি আপনার ব্যাংকার, কাস্টমস ব্রোকার বা উপদেষ্টার সঙ্গে যাচাই করুন।',
        contentEn: 'Confirm bank or LC terms, product classification, and required export documents with your banker, customs broker, or adviser.'
      }
    ]
  },
  {
    id: 'privacy-and-access',
    categoryBn: 'তথ্য ও অ্যাকাউন্ট',
    categoryEn: 'Information and accounts',
    titleBn: 'তথ্য ও অ্যাকাউন্টের গোপনীয়তা',
    titleEn: 'Information and account privacy',
    descriptionBn: 'অ্যাকাউন্টে প্রবেশাধিকার, সংবেদনশীল তথ্য এবং বায়ারের সঙ্গে তথ্য ভাগ করার নিয়ম জানুন।',
    descriptionEn: 'Learn about account access, sensitive details, and sharing information with buyers.',
    readTime: '2 min',
    subsections: [
      {
        id: 'sensitive-details',
        headingBn: 'সংবেদনশীল তথ্য',
        headingEn: 'Sensitive details',
        contentBn: 'বাণিজ্য পরামর্শে পাঠানোর আগে পরিচিত পরিচয় ও কর নম্বর আড়াল করা হয়। ভয়েস রেকর্ডিং আগে কথায় রূপান্তর করা হয়।',
        contentEn: 'Known identifiers and tax numbers are masked before trade advice is requested. Voice recordings are sent for transcription first.'
      },
      {
        id: 'account-access',
        headingBn: 'অ্যাকাউন্টে প্রবেশাধিকার',
        headingEn: 'Account access',
        contentBn: 'নিজের অ্যাকাউন্টের পাসওয়ার্ড গোপন রাখুন। কোনো সহকর্মী বা উপদেষ্টার সহায়তা প্রয়োজন হলে অ্যাকাউন্ট ভাগ না করে উপযুক্ত নথি আলাদাভাবে শেয়ার করুন।',
        contentEn: 'Keep your password private. If a colleague or adviser needs to help, share the relevant document instead of sharing your account.'
      }
    ]
  }
];
