export type SeoPageKind = 'location' | 'sector' | 'feature' | 'product';

export interface LocalizedCopy {
  en: string;
  bn: string;
}

export interface SeoLandingPageData {
  kind: SeoPageKind;
  slug: string;
  heading: LocalizedCopy;
  lead: LocalizedCopy;
  sectionHeading: LocalizedCopy;
  sectionBody: LocalizedCopy;
  points: LocalizedCopy[];
  related: string[];
}

export const SEO_LANDING_PAGES: SeoLandingPageData[] = [
  {
    kind: 'location', slug: 'savar',
    heading: { en: 'Export preparation for manufacturers in Savar', bn: 'সাভারের কারখানার রপ্তানি প্রস্তুতি' },
    lead: { en: 'Savar manufacturers can use ExportPilot AI to organize product specifications, review proposed HS classifications, compare buyer requirements, and prepare draft trade documents. The workspace supports jute, leather, garments, and other goods. Tariffs and market eligibility depend on the final product code, origin rules, and destination requirements.', bn: 'সাভারের কারখানাগুলো পণ্যের স্পেসিফিকেশন গুছিয়ে HS কোডের প্রস্তাব পর্যালোচনা, বায়ারের চাহিদা তুলনা এবং বাণিজ্যিক কাগজপত্রের খসড়া তৈরিতে ExportPilot AI ব্যবহার করতে পারে। পাট, চামড়া, তৈরি পোশাকসহ বিভিন্ন পণ্যের তথ্য রাখা যায়। চূড়ান্ত শুল্ক সুবিধা HS কোড, উৎপত্তির নিয়ম ও গন্তব্য দেশের শর্তের ওপর নির্ভর করে।' },
    sectionHeading: { en: 'Prepare a shipment from product details', bn: 'পণ্যের তথ্য থেকে চালানের প্রস্তুতি নিন' },
    sectionBody: { en: 'Start with the item description, materials, dimensions, production capacity, and target destination. Review the suggested classification with a customs professional before using it on export paperwork.', bn: 'পণ্যের বিবরণ, উপকরণ, মাপ, উৎপাদন সক্ষমতা এবং গন্তব্য দেশ দিয়ে শুরু করুন। রপ্তানির কাগজে ব্যবহারের আগে কাস্টমস বিশেষজ্ঞের সঙ্গে প্রস্তাবিত শ্রেণিবিন্যাস মিলিয়ে নিন।' },
    points: [
      { en: 'Record factory capacity and shipment terms.', bn: 'কারখানার সক্ষমতা ও চালানের শর্ত লিখুন।' },
      { en: 'Compare buyer quantity and payment requirements.', bn: 'বায়ারের পরিমাণ ও পেমেন্টের শর্ত তুলনা করুন।' },
      { en: 'Keep draft documents available for review.', bn: 'পর্যালোচনার জন্য কাগজপত্রের খসড়া রাখুন।' },
    ],
    related: ['/sectors/jute', '/features/hs-classification', '/features/export-documents'],
  },
  {
    kind: 'location', slug: 'gazipur',
    heading: { en: 'Export preparation for manufacturers in Gazipur', bn: 'গাজীপুরের কারখানার রপ্তানি প্রস্তুতি' },
    lead: { en: 'Garment and textile teams in Gazipur can organize fabric, construction, sizing, and production details before discussing an export order. ExportPilot AI keeps product classification research, buyer terms, carbon estimates, and draft documents together. Use the results as working material and confirm final requirements with the importer and relevant authorities.', bn: 'গাজীপুরের তৈরি পোশাক ও টেক্সটাইল দল অর্ডার আলোচনার আগে কাপড়, নির্মাণ, মাপ এবং উৎপাদনের তথ্য গুছিয়ে নিতে পারে। ExportPilot AI-তে পণ্যের শ্রেণিবিন্যাস গবেষণা, বায়ারের শর্ত, কার্বনের হিসাব ও কাগজপত্রের খসড়া এক জায়গায় রাখা যায়। এগুলো প্রস্তুতির কাজে ব্যবহার করুন এবং চূড়ান্ত শর্ত আমদানিকারক ও সংশ্লিষ্ট কর্তৃপক্ষের সঙ্গে যাচাই করুন।' },
    sectionHeading: { en: 'Review garment requirements before quoting', bn: 'দর দেওয়ার আগে পোশাকের শর্ত যাচাই করুন' },
    sectionBody: { en: 'A clear specification sheet helps both sides check materials, tolerances, labels, order quantity, packing, delivery dates, and payment terms. Record each agreed change before a proforma invoice is prepared.', bn: 'পরিষ্কার স্পেসিফিকেশন শিটে উপকরণ, মাপের সহনশীলতা, লেবেল, অর্ডারের পরিমাণ, প্যাকিং, ডেলিভারির তারিখ ও পেমেন্টের শর্ত দুই পক্ষই যাচাই করতে পারে। প্রোফর্মা ইনভয়েস তৈরির আগে সম্মত প্রতিটি পরিবর্তন লিখে রাখুন।' },
    points: [
      { en: 'Describe fiber content and garment construction.', bn: 'ফাইবারের ধরন ও পোশাকের নির্মাণ লিখুন।' },
      { en: 'Confirm size range, labeling, and packaging.', bn: 'সাইজ, লেবেল ও প্যাকিং নিশ্চিত করুন।' },
      { en: 'Review order and payment terms with the buyer.', bn: 'বায়ারের সঙ্গে অর্ডার ও পেমেন্টের শর্ত পর্যালোচনা করুন।' },
    ],
    related: ['/sectors/garments', '/features/hs-classification', '/features/buyer-matching'],
  },
  {
    kind: 'location', slug: 'bogura',
    heading: { en: 'Export preparation for manufacturers in Bogura', bn: 'বগুড়ার উৎপাদকদের রপ্তানি প্রস্তুতি' },
    lead: { en: 'Ceramic, agro-processing, and small manufacturing teams in Bogura can use a shared workspace to record product specifications and review export requirements. ExportPilot AI helps prepare classification research, buyer questions, and draft documents. Destination rules, food safety requirements, and tariff treatment vary by product and must be confirmed before shipment.', bn: 'বগুড়ার সিরামিক, কৃষি প্রক্রিয়াজাতকরণ ও ক্ষুদ্র উৎপাদন দল পণ্যের স্পেসিফিকেশন লিখে রপ্তানির শর্ত পর্যালোচনায় একটি যৌথ workspace ব্যবহার করতে পারে। ExportPilot AI শ্রেণিবিন্যাস গবেষণা, বায়ারের প্রশ্ন এবং কাগজপত্রের খসড়া তৈরিতে সহায়তা করে। পণ্যভেদে গন্তব্য দেশের নিয়ম, খাদ্য নিরাপত্তা ও শুল্ক আলাদা হয়, তাই চালানের আগে যাচাই জরুরি।' },
    sectionHeading: { en: 'Document product and packing details', bn: 'পণ্য ও প্যাকিংয়ের তথ্য নথিভুক্ত করুন' },
    sectionBody: { en: 'For ceramics, capture material, dimensions, finish, breakage protection, and carton details. For processed goods, record ingredients, processing method, shelf life, and any required certificates for the destination market.', bn: 'সিরামিক পণ্যে উপাদান, মাপ, ফিনিশ, ভাঙন সুরক্ষা ও কার্টনের তথ্য রাখুন। প্রক্রিয়াজাত পণ্যে উপকরণ, প্রক্রিয়াকরণ পদ্ধতি, মেয়াদ এবং গন্তব্য বাজারে প্রয়োজনীয় সনদের তথ্য নথিভুক্ত করুন।' },
    points: [
      { en: 'Separate product facts from assumptions.', bn: 'পণ্যের নিশ্চিত তথ্য ও ধারণা আলাদা রাখুন।' },
      { en: 'Ask the importer to confirm destination standards.', bn: 'গন্তব্য দেশের মান আমদানিকারকের সঙ্গে যাচাই করুন।' },
      { en: 'Keep packaging and inspection terms in writing.', bn: 'প্যাকিং ও পরিদর্শনের শর্ত লিখিত রাখুন।' },
    ],
    related: ['/sectors/ceramics', '/sectors/agro-processing', '/features/export-documents'],
  },
  {
    kind: 'location', slug: 'chattogram',
    heading: { en: 'Export preparation for manufacturers in Chattogram', bn: 'চট্টগ্রামের উৎপাদকদের রপ্তানি প্রস্তুতি' },
    lead: { en: 'Manufacturers and export teams in Chattogram can coordinate product details, buyer terms, shipment quantities, and document drafts before cargo is booked. ExportPilot AI provides a place to review these inputs and estimate selected compliance figures. Confirm port, carrier, customs, insurance, and documentary credit terms with the responsible parties.', bn: 'চট্টগ্রামের উৎপাদক ও রপ্তানি দল কার্গো বুকিংয়ের আগে পণ্যের তথ্য, বায়ারের শর্ত, চালানের পরিমাণ এবং কাগজপত্রের খসড়া সমন্বয় করতে পারে। ExportPilot AI এসব তথ্য পর্যালোচনা ও কিছু কমপ্লায়েন্স হিসাব প্রস্তুত করার জায়গা দেয়। বন্দর, পরিবহন, কাস্টমস, বীমা ও এলসি নিষ্পত্তির শর্ত সংশ্লিষ্ট পক্ষের সঙ্গে নিশ্চিত করুন।' },
    sectionHeading: { en: 'Align trade terms before cargo booking', bn: 'কার্গো বুকিংয়ের আগে বাণিজ্যিক শর্ত মিলিয়ে নিন' },
    sectionBody: { en: 'Agree on the named port, Incoterm version, shipment window, inspection process, and document list. Have the exporter, buyer, freight forwarder, and bank review the terms that apply to their part of the shipment.', bn: 'নির্দিষ্ট বন্দর, Incoterms-এর সংস্করণ, চালানের সময়, পরিদর্শন পদ্ধতি এবং কাগজপত্রের তালিকায় একমত হন। চালানের যে অংশ যার দায়িত্ব, সে অনুযায়ী রপ্তানিকারক, বায়ার, ফ্রেইট ফরোয়ার্ডার ও ব্যাংককে শর্তগুলো পর্যালোচনা করতে দিন।' },
    points: [
      { en: 'Record the agreed port and delivery window.', bn: 'সম্মত বন্দর ও ডেলিভারির সময় লিখে রাখুন।' },
      { en: 'Check invoice and packing list details together.', bn: 'ইনভয়েস ও প্যাকিং লিস্টের তথ্য একসঙ্গে যাচাই করুন।' },
      { en: 'Confirm the documentary credit with the bank.', bn: 'ব্যাংকের সঙ্গে এলসির শর্ত নিশ্চিত করুন।' },
    ],
    related: ['/features/export-documents', '/features/buyer-matching', '/docs'],
  },
  {
    kind: 'sector', slug: 'garments',
    heading: { en: 'Garment export preparation', bn: 'তৈরি পোশাক রপ্তানির প্রস্তুতি' },
    lead: { en: 'Garment exporters can organize fiber content, fabric weight, construction, sizing, labeling, packing, and production capacity before a buyer quote. ExportPilot AI supports classification research, buyer term review, and draft document preparation. Import rules and tariff rates depend on the final product code, origin, destination, and the current trade agreement.', bn: 'পোশাক রপ্তানিকারকরা বায়ারকে দর দেওয়ার আগে ফাইবার, কাপড়ের ওজন, নির্মাণ, মাপ, লেবেল, প্যাকিং এবং উৎপাদন সক্ষমতা গুছিয়ে নিতে পারেন। ExportPilot AI শ্রেণিবিন্যাস গবেষণা, বায়ারের শর্ত পর্যালোচনা এবং কাগজপত্রের খসড়ায় সহায়তা করে। আমদানি নিয়ম ও শুল্ক চূড়ান্ত পণ্য কোড, উৎপত্তি, গন্তব্য এবং চলতি বাণিজ্য চুক্তির ওপর নির্ভর করে।' },
    sectionHeading: { en: 'Build a complete garment specification', bn: 'পোশাকের পূর্ণ স্পেসিফিকেশন তৈরি করুন' },
    sectionBody: { en: 'Use one record for the sample, size range, material composition, trims, care labels, packaging, inspection points, lead time, and minimum order quantity. Confirm each item against the buyer purchase order.', bn: 'স্যাম্পল, সাইজ রেঞ্জ, উপকরণের গঠন, ট্রিমস, কেয়ার লেবেল, প্যাকিং, পরিদর্শন, লিড টাইম এবং ন্যূনতম অর্ডারের তথ্য এক রেকর্ডে রাখুন। বায়ারের ক্রয়াদেশের সঙ্গে প্রতিটি বিষয় মিলিয়ে নিন।' },
    points: [
      { en: 'Record fiber content and construction accurately.', bn: 'ফাইবারের গঠন ও নির্মাণ নির্ভুলভাবে লিখুন।' },
      { en: 'Confirm labels, packaging, and inspection standards.', bn: 'লেবেল, প্যাকিং ও পরিদর্শনের মান নিশ্চিত করুন।' },
      { en: 'Review destination tariff and origin rules.', bn: 'গন্তব্যের শুল্ক ও উৎপত্তির নিয়ম যাচাই করুন।' },
    ],
    related: ['/locations/gazipur', '/features/hs-classification', '/features/buyer-matching'],
  },
  {
    kind: 'sector', slug: 'jute',
    heading: { en: 'Jute product export preparation', bn: 'পাটজাত পণ্য রপ্তানির প্রস্তুতি' },
    lead: { en: 'Jute exporters can describe fiber type, weave, dimensions, handles, lining, intended use, and packing before preparing a quotation. ExportPilot AI helps keep product details, classification research, buyer requirements, and draft documents together. Confirm product claims, destination labeling rules, tariff treatment, and any required certificates before accepting an order.', bn: 'পাট রপ্তানিকারকরা দর তৈরির আগে ফাইবারের ধরন, বুনন, মাপ, হাতল, আস্তরণ, ব্যবহার এবং প্যাকিংয়ের তথ্য লিখতে পারেন। ExportPilot AI পণ্যের তথ্য, শ্রেণিবিন্যাস গবেষণা, বায়ারের চাহিদা ও কাগজপত্রের খসড়া এক জায়গায় রাখে। অর্ডার নেওয়ার আগে পণ্যের দাবি, লেবেল, শুল্ক এবং প্রয়োজনীয় সনদ যাচাই করুন।' },
    sectionHeading: { en: 'Describe the item buyers will receive', bn: 'বায়ার যে পণ্য পাবেন তার বিবরণ দিন' },
    sectionBody: { en: 'A useful jute product record includes dimensions, weight, color, finishing, stitching, allowable variation, carton quantity, and the intended use. Keep sample approval and bulk production specifications aligned.', bn: 'পাটজাত পণ্যের রেকর্ডে মাপ, ওজন, রং, ফিনিশিং, সেলাই, গ্রহণযোগ্য তারতম্য, কার্টনের পরিমাণ এবং ব্যবহারের বিবরণ রাখুন। স্যাম্পল অনুমোদন ও বাল্ক উৎপাদনের স্পেসিফিকেশন একই রাখুন।' },
    points: [
      { en: 'Specify natural fiber content and construction.', bn: 'প্রাকৃতিক ফাইবারের পরিমাণ ও নির্মাণ লিখুন।' },
      { en: 'Confirm color and dimension tolerances.', bn: 'রং ও মাপের গ্রহণযোগ্য তারতম্য নিশ্চিত করুন।' },
      { en: 'Check claims and labeling with the importer.', bn: 'পণ্যের দাবি ও লেবেল আমদানিকারকের সঙ্গে যাচাই করুন।' },
    ],
    related: ['/locations/savar', '/features/hs-classification', '/products/jute-tote'],
  },
  {
    kind: 'sector', slug: 'leather',
    heading: { en: 'Leather export preparation', bn: 'চামড়াজাত পণ্য রপ্তানির প্রস্তুতি' },
    lead: { en: 'Leather exporters can record material type, product construction, lining, sole or hardware, size range, finish, and origin documents before discussing an order. ExportPilot AI supports product classification research and draft trade paperwork. Destination restrictions, chemical limits, origin requirements, and tariff rates must be checked for the specific product and market.', bn: 'চামড়াজাত পণ্য রপ্তানিকারকরা অর্ডার আলোচনার আগে উপাদানের ধরন, নির্মাণ, আস্তরণ, সোল বা হার্ডওয়্যার, মাপ, ফিনিশ এবং উৎপত্তির কাগজপত্র লিখে রাখতে পারেন। ExportPilot AI শ্রেণিবিন্যাস গবেষণা ও বাণিজ্যিক কাগজপত্রের খসড়ায় সহায়তা করে। নির্দিষ্ট পণ্য ও বাজারের বিধিনিষেধ, রাসায়নিক সীমা, উৎপত্তির শর্ত এবং শুল্ক যাচাই করুন।' },
    sectionHeading: { en: 'Check product and material records', bn: 'পণ্য ও উপকরণের তথ্য যাচাই করুন' },
    sectionBody: { en: 'Keep material declarations, component details, finishing records, test results, and buyer approvals linked to the same product version. Ask the importer which destination standards and supporting documents apply.', bn: 'উপকরণের ঘোষণা, যন্ত্রাংশ, ফিনিশিং রেকর্ড, পরীক্ষার ফল এবং বায়ারের অনুমোদন একই পণ্য সংস্করণের সঙ্গে রাখুন। গন্তব্য দেশের মান ও সহায়ক কাগজপত্র সম্পর্কে আমদানিকারকের কাছে জেনে নিন।' },
    points: [
      { en: 'State leather and non-leather components.', bn: 'চামড়া ও অন্যান্য উপাদানের বিবরণ দিন।' },
      { en: 'Keep test records and buyer approvals current.', bn: 'পরীক্ষার রেকর্ড ও বায়ারের অনুমোদন হালনাগাদ রাখুন।' },
      { en: 'Confirm destination requirements before quoting.', bn: 'দর দেওয়ার আগে গন্তব্যের শর্ত যাচাই করুন।' },
    ],
    related: ['/locations/savar', '/features/hs-classification', '/products/leather-boot'],
  },
  {
    kind: 'sector', slug: 'ceramics',
    heading: { en: 'Ceramics export preparation', bn: 'সিরামিক পণ্য রপ্তানির প্রস্তুতি' },
    lead: { en: 'Ceramic exporters can prepare product dimensions, clay body, glaze, finish, food-contact status, breakage protection, and carton configuration for buyer review. ExportPilot AI organizes these details with classification research and draft documents. Confirm testing, labeling, packaging, and import rules with the destination buyer before production for export.', bn: 'সিরামিক রপ্তানিকারকরা বায়ারের পর্যালোচনার জন্য পণ্যের মাপ, মাটির গঠন, গ্লেজ, ফিনিশ, খাবারের সংস্পর্শের উপযোগিতা, ভাঙন সুরক্ষা এবং কার্টনের তথ্য প্রস্তুত করতে পারেন। ExportPilot AI এসব তথ্য, শ্রেণিবিন্যাস গবেষণা ও কাগজপত্রের খসড়া এক জায়গায় রাখে। রপ্তানির জন্য উৎপাদনের আগে পরীক্ষা, লেবেল, প্যাকিং ও আমদানি নিয়ম নিশ্চিত করুন।' },
    sectionHeading: { en: 'Plan safe packing and handling', bn: 'নিরাপদ প্যাকিং ও হ্যান্ডলিং পরিকল্পনা করুন' },
    sectionBody: { en: 'Specify inner protection, dividers, carton strength, pallet requirements, marks, and the inspection method. Document acceptable breakage limits and how claims are handled in the purchase agreement.', bn: 'ভেতরের সুরক্ষা, ডিভাইডার, কার্টনের শক্তি, প্যালেট, মার্কিং এবং পরিদর্শনের পদ্ধতি লিখুন। গ্রহণযোগ্য ভাঙনের সীমা ও ক্ষতিপূরণ দাবি কীভাবে হবে তা ক্রয়চুক্তিতে নথিভুক্ত করুন।' },
    points: [
      { en: 'Record dimensions, glaze, and product use.', bn: 'মাপ, গ্লেজ ও পণ্যের ব্যবহার লিখুন।' },
      { en: 'Agree on packing and breakage inspection.', bn: 'প্যাকিং ও ভাঙন পরিদর্শনে একমত হন।' },
      { en: 'Check food-contact and labeling rules if relevant.', bn: 'প্রযোজ্য হলে খাবারের সংস্পর্শ ও লেবেলিংয়ের নিয়ম দেখুন।' },
    ],
    related: ['/locations/bogura', '/features/buyer-matching', '/products/ceramic-tableware'],
  },
  {
    kind: 'sector', slug: 'agro-processing',
    heading: { en: 'Agro-processing export preparation', bn: 'কৃষি প্রক্রিয়াজাত পণ্য রপ্তানির প্রস্তুতি' },
    lead: { en: 'Processors can organize ingredients, origin, production method, shelf life, storage conditions, packaging, and laboratory records before approaching an importer. ExportPilot AI supports product research and document preparation, but does not certify food safety. Check destination registration, sanitary certificates, permitted ingredients, and labeling with qualified authorities.', bn: 'আমদানিকারকের সঙ্গে যোগাযোগের আগে প্রক্রিয়াজাতকরণ প্রতিষ্ঠান উপকরণ, উৎপত্তি, উৎপাদন পদ্ধতি, মেয়াদ, সংরক্ষণ, প্যাকেজিং এবং পরীক্ষাগারের রেকর্ড গুছিয়ে নিতে পারে। ExportPilot AI পণ্য গবেষণা ও কাগজপত্র তৈরিতে সহায়তা করে, তবে খাদ্য নিরাপত্তার সনদ দেয় না। গন্তব্য দেশের নিবন্ধন, স্বাস্থ্য সনদ, অনুমোদিত উপকরণ ও লেবেল কর্তৃপক্ষের সঙ্গে যাচাই করুন।' },
    sectionHeading: { en: 'Check destination food requirements', bn: 'গন্তব্য দেশের খাদ্যবিধি যাচাই করুন' },
    sectionBody: { en: 'Ask the importer for the applicable ingredient limits, facility registration, lab tests, language and nutrition labeling, shelf-life rules, and temperature controls. Keep certificates connected to the product batch they cover.', bn: 'আমদানিকারকের কাছে উপকরণের সীমা, প্রতিষ্ঠানের নিবন্ধন, ল্যাব পরীক্ষা, ভাষা ও পুষ্টি লেবেল, মেয়াদ এবং তাপমাত্রা নিয়ন্ত্রণের নিয়ম জানুন। সনদ যে পণ্য ব্যাচের জন্য প্রযোজ্য, তার সঙ্গে সনদটি যুক্ত রাখুন।' },
    points: [
      { en: 'Maintain ingredient and batch records.', bn: 'উপকরণ ও ব্যাচের রেকর্ড রাখুন।' },
      { en: 'Confirm certificates and label language.', bn: 'সনদ ও লেবেলের ভাষা নিশ্চিত করুন।' },
      { en: 'Verify shelf-life and transport conditions.', bn: 'মেয়াদ ও পরিবহনের শর্ত যাচাই করুন।' },
    ],
    related: ['/locations/bogura', '/features/export-documents', '/features/buyer-matching'],
  },
  {
    kind: 'feature', slug: 'hs-classification',
    heading: { en: 'HS code research for export products', bn: 'রপ্তানি পণ্যের HS কোড গবেষণা' },
    lead: { en: 'HS classification starts with a precise description of a product, its materials, construction, use, and processing. ExportPilot AI helps organize those details and review a proposed code. The final tariff classification is a customs decision, so exporters should confirm the code and any national extensions before quoting duty or preparing a declaration.', bn: 'HS শ্রেণিবিন্যাসে পণ্যের বিবরণ, উপকরণ, নির্মাণ, ব্যবহার ও প্রক্রিয়াকরণের তথ্য দরকার। ExportPilot AI এসব তথ্য গুছিয়ে প্রস্তাবিত কোড পর্যালোচনায় সহায়তা করে। চূড়ান্ত শুল্ক শ্রেণিবিন্যাস কাস্টমসের সিদ্ধান্ত, তাই শুল্কের দর দেওয়ার বা ঘোষণা তৈরির আগে কোড ও জাতীয় উপবিভাগ নিশ্চিত করুন।' },
    sectionHeading: { en: 'What to record for classification review', bn: 'শ্রেণিবিন্যাস পর্যালোচনায় যা লিখবেন' },
    sectionBody: { en: 'Include the product function, material percentages, manufacturing process, physical form, packaging, and clear photographs. Small differences can change the classification, especially for composite or processed goods.', bn: 'পণ্যের কাজ, উপকরণের শতাংশ, উৎপাদন পদ্ধতি, বাহ্যিক রূপ, প্যাকেজিং এবং পরিষ্কার ছবি দিন। বিশেষ করে মিশ্র বা প্রক্রিয়াজাত পণ্যে ছোট পার্থক্যেও শ্রেণিবিন্যাস বদলাতে পারে।' },
    points: [
      { en: 'Use the destination tariff schedule for final review.', bn: 'চূড়ান্ত যাচাইয়ে গন্তব্য দেশের ট্যারিফ সূচি দেখুন।' },
      { en: 'Check rules of origin separately from HS code.', bn: 'HS কোডের পাশাপাশি উৎপত্তির নিয়ম আলাদা করে যাচাই করুন।' },
      { en: 'Keep classification references with the shipment file.', bn: 'চালানের ফাইলে শ্রেণিবিন্যাসের সূত্র রাখুন।' },
    ],
    related: ['/sectors/garments', '/sectors/jute', '/docs'],
  },
  {
    kind: 'feature', slug: 'buyer-matching',
    heading: { en: 'Review buyer requirements before export', bn: 'রপ্তানির আগে বায়ারের চাহিদা পর্যালোচনা' },
    lead: { en: 'A buyer review should compare the product specification with order quantity, target price, delivery window, destination, packaging, certifications, and payment terms. ExportPilot AI brings these working details together so exporters can identify open questions before negotiation. Verify buyer identity and commercial capacity independently before sharing a quotation or accepting an order.', bn: 'বায়ার পর্যালোচনায় পণ্যের স্পেসিফিকেশনের সঙ্গে অর্ডারের পরিমাণ, লক্ষ্যমূল্য, ডেলিভারি, গন্তব্য, প্যাকিং, সনদ এবং পেমেন্টের শর্ত তুলনা করা উচিত। ExportPilot AI এসব তথ্য এক জায়গায় রেখে আলোচনার আগে অসম্পূর্ণ বিষয় চিহ্নিত করতে সাহায্য করে। দর পাঠানো বা অর্ডার নেওয়ার আগে বায়ারের পরিচয় ও বাণিজ্যিক সক্ষমতা নিজে যাচাই করুন।' },
    sectionHeading: { en: 'Compare terms, not only the target price', bn: 'শুধু দর নয়, সব শর্ত তুলনা করুন' },
    sectionBody: { en: 'A workable offer also depends on minimum quantity, sample approval, inspection, Incoterm, shipment date, payment security, and dispute handling. Record the final agreed version in writing.', bn: 'কার্যকর অফারে ন্যূনতম পরিমাণ, স্যাম্পল অনুমোদন, পরিদর্শন, Incoterm, চালানের তারিখ, পেমেন্টের নিরাপত্তা এবং বিরোধ নিষ্পত্তির শর্তও থাকে। চূড়ান্ত সম্মত সংস্করণ লিখিতভাবে রাখুন।' },
    points: [
      { en: 'Check company registration and references.', bn: 'কোম্পানির নিবন্ধন ও রেফারেন্স যাচাই করুন।' },
      { en: 'Confirm payment security with your bank.', bn: 'ব্যাংকের সঙ্গে পেমেন্টের নিরাপত্তা নিশ্চিত করুন।' },
      { en: 'Compare total landed terms before accepting.', bn: 'অর্ডার নেওয়ার আগে মোট বাণিজ্যিক শর্ত তুলনা করুন।' },
    ],
    related: ['/locations/chattogram', '/features/export-documents', '/buyers'],
  },
  {
    kind: 'feature', slug: 'cbam-audit',
    heading: { en: 'Prepare a Scope 2 carbon estimate', bn: 'স্কোপ ২ কার্বনের হিসাব প্রস্তুত করুন' },
    lead: { en: 'A Scope 2 estimate uses purchased electricity data and an applicable emissions factor to calculate indirect emissions from electricity use. ExportPilot AI can organize bill inputs and produce a working estimate for review. The result is not a third-party assurance statement and must be checked against the reporting method and factor required by the importer.', bn: 'স্কোপ ২ হিসাব করতে কেনা বিদ্যুতের তথ্য ও প্রযোজ্য নির্গমন ফ্যাক্টর ব্যবহার করে বিদ্যুৎ ব্যবহারের পরোক্ষ নির্গমন নির্ণয় করা হয়। ExportPilot AI বিলের তথ্য গুছিয়ে পর্যালোচনার জন্য একটি হিসাব দিতে পারে। এটি তৃতীয় পক্ষের নিশ্চয়তাপত্র নয়; আমদানিকারকের রিপোর্টিং পদ্ধতি ও ফ্যাক্টরের সঙ্গে মিলিয়ে নিতে হবে।' },
    sectionHeading: { en: 'Keep the calculation traceable', bn: 'হিসাবের প্রতিটি ধাপ নথিভুক্ত রাখুন' },
    sectionBody: { en: 'Store the billing period, kWh consumed, meter or account reference, emissions factor, conversion units, and any production allocation used. Retain the source bill and review unusual or estimated readings.', bn: 'বিলের সময়কাল, ব্যবহৃত kWh, মিটার বা অ্যাকাউন্টের সূত্র, নির্গমন ফ্যাক্টর, একক রূপান্তর এবং উৎপাদন বণ্টনের তথ্য রাখুন। মূল বিল সংরক্ষণ করুন এবং অস্বাভাবিক বা আনুমানিক রিডিং পর্যালোচনা করুন।' },
    points: [
      { en: 'Use the reporting boundary requested by the buyer.', bn: 'বায়ারের চাওয়া রিপোর্টিং সীমা ব্যবহার করুন।' },
      { en: 'Record the source and year of each emissions factor.', bn: 'প্রতিটি নির্গমন ফ্যাক্টরের সূত্র ও বছর লিখুন।' },
      { en: 'Ask the importer whether verification is required.', bn: 'যাচাই সনদ লাগবে কি না আমদানিকারককে জিজ্ঞেস করুন।' },
    ],
    related: ['/locations/gazipur', '/features/export-documents', '/docs'],
  },
  {
    kind: 'feature', slug: 'export-documents',
    heading: { en: 'Prepare export documents for review', bn: 'পর্যালোচনার জন্য রপ্তানি কাগজপত্র প্রস্তুত করুন' },
    lead: { en: 'ExportPilot AI helps teams assemble draft commercial details for a proforma invoice and deal record. Confirm the seller and buyer names, item descriptions, quantities, unit prices, currency, Incoterm, delivery dates, and payment instructions before issue. A draft is not a substitute for bank, customs, legal, or buyer approval.', bn: 'ExportPilot AI প্রোফর্মা ইনভয়েস ও ডিল রেকর্ডের জন্য বাণিজ্যিক তথ্যের খসড়া গুছিয়ে দিতে পারে। পাঠানোর আগে বিক্রেতা ও বায়ারের নাম, পণ্যের বিবরণ, পরিমাণ, ইউনিট দর, মুদ্রা, Incoterm, ডেলিভারির তারিখ ও পেমেন্ট নির্দেশনা মিলিয়ে নিন। খসড়া ব্যাংক, কাস্টমস, আইনজীবী বা বায়ারের অনুমোদনের বিকল্প নয়।' },
    sectionHeading: { en: 'Review every commercial field', bn: 'প্রতিটি বাণিজ্যিক তথ্য যাচাই করুন' },
    sectionBody: { en: 'Match the invoice to the signed purchase order and letter of credit, where applicable. Confirm that totals, currency, shipment terms, and beneficiary details agree across all documents.', bn: 'প্রযোজ্য ক্ষেত্রে ইনভয়েসের সঙ্গে স্বাক্ষরিত ক্রয়াদেশ ও এলসি মিলিয়ে নিন। সব কাগজে মোট মূল্য, মুদ্রা, চালানের শর্ত এবং সুবিধাভোগীর তথ্য এক আছে কি না দেখুন।' },
    points: [
      { en: 'Check names, addresses, and tax references.', bn: 'নাম, ঠিকানা ও কর-সংক্রান্ত তথ্য যাচাই করুন।' },
      { en: 'Recalculate quantity, price, and totals.', bn: 'পরিমাণ, দর ও মোট মূল্য আবার হিসাব করুন।' },
      { en: 'Obtain required bank and buyer approvals.', bn: 'প্রয়োজনীয় ব্যাংক ও বায়ারের অনুমোদন নিন।' },
    ],
    related: ['/locations/chattogram', '/features/buyer-matching', '/docs'],
  },
  {
    kind: 'product', slug: 'jute-tote',
    heading: { en: 'Illustrative jute tote export profile', bn: 'নমুনা পাটের টোট ব্যাগ রপ্তানি প্রোফাইল' },
    lead: { en: 'This sample profile shows the information an exporter may prepare for a jute tote: fiber content, weave, dimensions, handle construction, lining, color, packing, and intended use. It is a product data example, not a live buyer offer. Confirm the final HS code, labeling, origin documents, and buyer specification before quoting.', bn: 'এই নমুনা প্রোফাইলে পাটের টোট ব্যাগের ফাইবার, বুনন, মাপ, হাতল, আস্তরণ, রং, প্যাকিং এবং ব্যবহারসংক্রান্ত তথ্য দেখানো হয়েছে। এটি পণ্যের তথ্যের উদাহরণ, বাস্তব বায়ার অফার নয়। দর দেওয়ার আগে চূড়ান্ত HS কোড, লেবেল, উৎপত্তির কাগজপত্র ও বায়ারের স্পেসিফিকেশন যাচাই করুন।' },
    sectionHeading: { en: 'Fields to complete', bn: 'যে তথ্যগুলো পূরণ করবেন' },
    sectionBody: { en: 'Use the buyer-approved sample and packing plan as the reference for bulk production and export documents.', bn: 'বাল্ক উৎপাদন ও রপ্তানি কাগজপত্রে বায়ার অনুমোদিত স্যাম্পল ও প্যাকিং পরিকল্পনাকে ভিত্তি হিসেবে নিন।' },
    points: [
      { en: 'Dimensions, weight, material, and color.', bn: 'মাপ, ওজন, উপকরণ ও রং।' },
      { en: 'Handle, lining, stitch, and finish details.', bn: 'হাতল, আস্তরণ, সেলাই ও ফিনিশ।' },
      { en: 'Packing quantity and shipping carton marks.', bn: 'প্যাকিংয়ের পরিমাণ ও শিপিং কার্টনের মার্কিং।' },
    ],
    related: ['/sectors/jute', '/locations/savar', '/features/hs-classification'],
  },
  {
    kind: 'product', slug: 'denim-jacket',
    heading: { en: 'Illustrative denim jacket export profile', bn: 'নমুনা ডেনিম জ্যাকেট রপ্তানি প্রোফাইল' },
    lead: { en: 'This sample profile helps a garment team gather denim weight, fiber content, wash, trims, measurements, size range, labels, and packing details. It is not a listing for sale or a verified buyer order. Confirm testing, restricted substances, final classification, country of origin, and purchase order terms with the importer.', bn: 'এই নমুনা প্রোফাইলে ডেনিমের ওজন, ফাইবার, ওয়াশ, ট্রিমস, মাপ, সাইজ, লেবেল ও প্যাকিংয়ের তথ্য গুছিয়ে নেওয়া যায়। এটি বিক্রির তালিকা বা যাচাইকৃত বায়ার অর্ডার নয়। আমদানিকারকের সঙ্গে পরীক্ষা, রাসায়নিক সীমা, চূড়ান্ত শ্রেণিবিন্যাস, উৎপত্তির দেশ ও ক্রয়াদেশের শর্ত নিশ্চিত করুন।' },
    sectionHeading: { en: 'Fields to complete', bn: 'যে তথ্যগুলো পূরণ করবেন' },
    sectionBody: { en: 'Keep the approved sample, measurement chart, testing record, and shipment specification on the same version of the product file.', bn: 'অনুমোদিত স্যাম্পল, মাপের চার্ট, পরীক্ষার রেকর্ড ও চালানের স্পেসিফিকেশন একই পণ্য ফাইলে রাখুন।' },
    points: [
      { en: 'Fabric composition, weight, and wash effect.', bn: 'কাপড়ের গঠন, ওজন ও ওয়াশের ধরন।' },
      { en: 'Measurement chart, trims, and care label.', bn: 'মাপের চার্ট, ট্রিমস ও কেয়ার লেবেল।' },
      { en: 'Inspection, packing, and delivery schedule.', bn: 'পরিদর্শন, প্যাকিং ও ডেলিভারি সূচি।' },
    ],
    related: ['/sectors/garments', '/locations/gazipur', '/features/buyer-matching'],
  },
  {
    kind: 'product', slug: 'leather-boot',
    heading: { en: 'Illustrative leather boot export profile', bn: 'নমুনা চামড়ার বুট রপ্তানি প্রোফাইল' },
    lead: { en: 'This sample profile lists details commonly reviewed for a leather boot, including upper and lining materials, sole, hardware, sizes, finish, packing, and test records. It is a workflow example, not a verified offer. Confirm the material declaration, destination requirements, product code, origin evidence, and agreed buyer specification before production.', bn: 'এই নমুনা প্রোফাইলে চামড়ার বুটের আপার ও আস্তরণের উপকরণ, সোল, হার্ডওয়্যার, সাইজ, ফিনিশ, প্যাকিং এবং পরীক্ষার তথ্য রাখা হয়েছে। এটি কাজের উদাহরণ, যাচাইকৃত অফার নয়। উৎপাদনের আগে উপকরণের ঘোষণা, গন্তব্যের শর্ত, পণ্য কোড, উৎপত্তির প্রমাণ ও বায়ারের স্পেসিফিকেশন নিশ্চিত করুন।' },
    sectionHeading: { en: 'Fields to complete', bn: 'যে তথ্যগুলো পূরণ করবেন' },
    sectionBody: { en: 'Use consistent component names and material percentages across the specification, test documents, and commercial paperwork.', bn: 'স্পেসিফিকেশন, পরীক্ষার কাগজ ও বাণিজ্যিক নথিতে উপকরণের নাম ও শতাংশ একইভাবে লিখুন।' },
    points: [
      { en: 'Upper, lining, sole, and hardware materials.', bn: 'আপার, আস্তরণ, সোল ও হার্ডওয়্যারের উপকরণ।' },
      { en: 'Size range, finish, and care requirements.', bn: 'সাইজ, ফিনিশ ও যত্নের নির্দেশনা।' },
      { en: 'Destination tests and packing requirements.', bn: 'গন্তব্যের পরীক্ষা ও প্যাকিংয়ের শর্ত।' },
    ],
    related: ['/sectors/leather', '/locations/savar', '/features/hs-classification'],
  },
  {
    kind: 'product', slug: 'ceramic-tableware',
    heading: { en: 'Illustrative ceramic tableware export profile', bn: 'নমুনা সিরামিক টেবিলওয়্যার রপ্তানি প্রোফাইল' },
    lead: { en: 'This sample profile helps record ceramic material, glaze, finish, dimensions, food-contact status, set composition, protective packing, and inspection criteria. It is an export preparation example, not a live product listing. Verify laboratory tests, destination standards, labeling, tariff code, and buyer packaging approval for each item.', bn: 'এই নমুনা প্রোফাইলে সিরামিকের উপাদান, গ্লেজ, ফিনিশ, মাপ, খাবারের সংস্পর্শের উপযোগিতা, সেটের গঠন, সুরক্ষিত প্যাকিং ও পরিদর্শনের মান লেখা যায়। এটি রপ্তানি প্রস্তুতির উদাহরণ, বিক্রির তালিকা নয়। প্রতিটি পণ্যের পরীক্ষা, গন্তব্যের মান, লেবেল, শুল্ক কোড ও প্যাকিং অনুমোদন যাচাই করুন।' },
    sectionHeading: { en: 'Fields to complete', bn: 'যে তথ্যগুলো পূরণ করবেন' },
    sectionBody: { en: 'Agree on a packing test and allowable breakage process before setting shipment quantities and claim terms.', bn: 'চালানের পরিমাণ ও ক্ষতিপূরণের শর্ত ঠিক করার আগে প্যাকিং পরীক্ষা এবং গ্রহণযোগ্য ভাঙনের নিয়মে একমত হন।' },
    points: [
      { en: 'Material, dimensions, glaze, and intended use.', bn: 'উপাদান, মাপ, গ্লেজ ও ব্যবহারের বিবরণ।' },
      { en: 'Set contents, carton strength, and inner protection.', bn: 'সেটের উপকরণ, কার্টনের শক্তি ও ভেতরের সুরক্ষা।' },
      { en: 'Testing and food-contact documentation.', bn: 'পরীক্ষা ও খাবারের সংস্পর্শের কাগজপত্র।' },
    ],
    related: ['/sectors/ceramics', '/locations/bogura', '/features/export-documents'],
  },
];

export const getSeoLandingPage = (kind: SeoPageKind, slug: string) =>
  SEO_LANDING_PAGES.find((page) => page.kind === kind && page.slug === slug);
