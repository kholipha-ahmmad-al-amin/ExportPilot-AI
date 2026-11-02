import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Package,
  FileText,
  MessageSquare,
  Check,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { TradeLogisticsRadar } from "../components/TradeLogisticsRadar";
import seoConfig from "../../seo.config.json";
import "./Landing.css";

export const Landing: React.FC = () => {
  const { user, t, lang } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [units, setUnits] = useState(10000);
  const [cost, setCost] = useState(180);
  const [video, setVideo] = useState(false);
  const products = [
    {
      id: "preset_jute_bag",
      bn: "পাটের ব্যাগ",
      en: "Jute bags",
      image: "jute-tote-bag-preview.webp",
      place: t("সাভার, ঢাকা", "Savar, Dhaka"),
      material: t(
        "পাটের তৈরি, বারবার ব্যবহার করা যায়",
        "Reusable natural jute",
      ),
      price: "3.40",
    },
    {
      id: "preset_denim_jacket",
      bn: "ডেনিম জ্যাকেট",
      en: "Denim jackets",
      image: "denim-jacket-rmg-preview.webp",
      place: t("গাজীপুর", "Gazipur"),
      material: t("তৈরি পোশাক ও টেক্সটাইল", "Garments and textiles"),
      price: "13.80",
    },
    {
      id: "preset_leather_boot",
      bn: "চামড়ার জুতা",
      en: "Leather footwear",
      image: "leather-chelsea-boot-preview.webp",
      place: t("সাভার, ঢাকা", "Savar, Dhaka"),
      material: t("চামড়ার তৈরি চেলসি বুট", "Leather Chelsea boots"),
      price: "24.50",
    },
    {
      id: "preset_terracotta",
      bn: "সিরামিকের বাসন",
      en: "Ceramic tableware",
      image: "terracotta-tableware-preview.webp",
      place: t("বগুড়া", "Bogura"),
      material: t("ঘর ও খাবার টেবিলের জন্য", "For home and hospitality"),
      price: "11.20",
    },
  ];
  const product = products[selected];
  const destination =
    user?.role === "verified_buyer"
      ? "/buyers"
      : user?.role === "compliance_auditor"
        ? "/audit"
        : "/app";
  const launch = (id: string, calculator = false) => {
    const target =
      user?.role === "verified_buyer" || user?.role === "compliance_auditor"
        ? destination
        : `/dealroom?preset=${id}${calculator ? `&units=${units}&cost=${cost}` : ""}`;
    navigate(user ? target : `/login?from=${encodeURIComponent(target)}`);
  };
  const steps = [
    {
      Icon: Package,
      title: t("আপনার পণ্যের কথা বলুন", "Start with your product"),
      body: t(
        "কী তৈরি করেন, কতটা দিতে পারবেন আর দাম কত ভাবছেন, লিখে জানান। পণ্যের ছবিও যোগ করতে পারবেন।",
        "Describe what you make, how much you can supply and your expected price. Add a product photo for context.",
      ),
    },
    {
      Icon: MessageSquare,
      title: t("বাজার ও খরচ বুঝে নিন", "Understand your options"),
      body: t(
        "সম্ভাব্য বাজার, পণ্যের HS কোড ও দর নিয়ে প্রাথমিক ধারণা নিন। ক্রেতার চাহিদার সঙ্গে আপনার পণ্য মেলান।",
        "Review market references, suggested HS codes and pricing. Compare your product with buyer requests.",
      ),
    },
    {
      Icon: FileText,
      title: t("কাগজপত্র গুছিয়ে এগোন", "Prepare your next move"),
      body: t(
        "কোটেশন ও প্রফরমা ইনভয়েসের খসড়া তৈরি করুন। চূড়ান্ত করার আগে তথ্য ও শর্ত যাচাই করে নিন।",
        "Prepare a quotation and draft proforma invoice. Review the details and terms before using them.",
      ),
    },
  ];
  return (
    <div
      className={`trade-home ${lang === "bn" ? "font-bangla" : "font-sans"}`}
    >
      <section className="trade-hero trade-container">
        <div className="trade-hero-copy">
          <p className="trade-eyebrow">
            {t(
              "বাংলাদেশের কারখানার জন্য",
              "BUILT FOR BANGLADESH’S MANUFACTURERS",
            )}
          </p>
          <h1>
            {t("আপনার পণ্য।", "Your product.")}
            <br />
            <span>{t("সামনে নতুন বাজার।", "Your next market.")}</span>
          </h1>
          <p className="trade-intro">
            {t(
              "ভালো পণ্য তো তৈরি করছেন। এবার বিদেশে বিক্রির প্রস্তুতিটাও গুছিয়ে নিন। পণ্যের তথ্য, সম্ভাব্য বাজার, দর আর কাগজপত্রের খসড়া পাবেন এক জায়গায়।",
              "You know how to make a good product. Bring the next steps together: product details, market research, pricing and draft export documents.",
            )}
          </p>
          <div className="trade-actions">
            <Link className="btn-primary" to={user ? destination : "/register"}>
              {user
                ? t("আমার কাজে ফিরি", "Return to my workspace")
                : t("আমার পণ্য নিয়ে শুরু করি", "Start with my product")}
              <ArrowRight size={18} />
            </Link>
            <Link className="trade-text-link" to="/#how-it-works">
              {t("আগে কাজটা বুঝে নিই", "See how it works")}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <p className="trade-reassurance">
            <Check size={16} />
            {t(
              "বাংলায় ব্যবহার করুন। নিজের গতিতে এগোন।",
              "Work in Bangla. Go at your own pace.",
            )}
          </p>
        </div>
        <div className="trade-product-preview">
          <div className="trade-preview-top">
            <span>
              {t("একটি পণ্য দিয়ে দেখে নিন", "Explore a product example")}
            </span>
            <span className="trade-sample">{t("নমুনা", "EXAMPLE")}</span>
          </div>
          <div className="trade-product-photo">
            <img
              src={`/assets/samples/${product.image}`}
              alt={t(product.bn, product.en)}
              width="640"
              height="640"
              fetchPriority="high"
            />
          </div>
          <div className="trade-product-info">
            <div>
              <p className="trade-caption">{product.place}</p>
              <h2>{t(product.bn, product.en)}</h2>
              <p>{product.material}</p>
            </div>
            <div className="trade-price">
              <span>{t("নমুনা FOB দর", "Example FOB price")}</span>
              <strong>${product.price}</strong>
              <span>{t("প্রতি পিস", "per piece")}</span>
            </div>
          </div>
          <div
            className="trade-product-tabs"
            role="group"
            aria-label={t("পণ্যের ধরন বেছে নিন", "Choose a product")}
          >
            {products.map((p, i) => (
              <button
                key={p.id}
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                {t(p.bn, p.en)}
              </button>
            ))}
          </div>
          <button
            className="trade-preview-link"
            onClick={() => launch(product.id)}
          >
            {t("এই পণ্য দিয়ে কাজটা দেখি", "Try this product")}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
      <div className="trade-context trade-container">
        <span>
          {t(
            "পণ্য থেকে রপ্তানির প্রস্তুতি",
            "FROM PRODUCT TO EXPORT PREPARATION",
          )}
        </span>
        <p>
          {t(
            "পাটের ব্যাগ হোক বা তৈরি পোশাক, শুরুটা আপনার চেনা কাজ দিয়েই।",
            "Jute bags or finished garments, start with the work you know best.",
          )}
        </p>
      </div>
      <section id="how-it-works" className="trade-section trade-container">
        <div className="trade-section-heading">
          <p className="trade-eyebrow">
            {t("যেভাবে সাহায্য করবে", "HOW IT HELPS")}
          </p>
          <h2>{t("পরের কাজটা পরিষ্কার থাকুক।", "Know what to do next.")}</h2>
          <p>
            {t(
              "একসঙ্গে সব জানার দরকার নেই। পণ্যের তথ্য দিন, হিসাব দেখুন, তারপর প্রয়োজনের কাগজপত্র তৈরি করুন।",
              "You do not need every answer up front. Describe your product, review the analysis, then prepare the documents you need.",
            )}
          </p>
        </div>
        <div className="trade-steps">
          {steps.map(({ Icon, title, body }) => (
            <article key={title}>
              <div className="trade-icon">
                <Icon size={23} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="sectors" className="trade-section trade-container">
        <div className="trade-section-heading">
          <p className="trade-eyebrow">
            {t("আমাদের চেনা পণ্য", "PRODUCTS WE KNOW")}
          </p>
          <h2>
            {t(
              "দেশে তৈরি। বাইরের বাজারের জন্য প্রস্তুতি।",
              "Made here. Prepared for new markets.",
            )}
          </h2>
          <p>
            {t(
              "আপনার খাতের একটি নমুনা বেছে নিয়ে শুরু করতে পারেন। নিজের পণ্যের তথ্য পরে যোগ করুন।",
              "Choose an example from your sector, then add your own product details.",
            )}
          </p>
        </div>
        <div className="trade-sector-grid">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => launch(p.id)}
              className="trade-sector"
            >
              <img
                src={`/assets/samples/${p.image}`}
                alt={t(p.bn, p.en)}
                width="320"
                height="320"
                loading="lazy"
              />
              <span>
                {t(p.bn, p.en)}
                <ArrowUpRight size={18} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section id="calculator" className="trade-section trade-container">
        <div className="trade-calculator">
          <div>
            <p className="trade-eyebrow">
              {t("আগে একটু হিসাব করি", "WORK THROUGH THE NUMBERS")}
            </p>
            <h2>
              {t(
                "এক চালানে কতটা পার্থক্য হতে পারে?",
                "What could change per shipment?",
              )}
            </h2>
            <p>
              {t(
                "এই নমুনা হিসাবে উৎপাদন খরচের ওপর বাড়তি ২২% আয় ও প্রতি ডলার ১২০ টাকা ধরা হয়েছে। এটি লাভের নিশ্চয়তা নয়।",
                "This illustration assumes additional earnings of 22% of production cost and BDT 120 per USD. It is not a profit forecast.",
              )}
            </p>
            <label htmlFor="shipment-units">
              {t("চালানে পণ্যের সংখ্যা", "Units per shipment")}
              <strong>{units.toLocaleString()}</strong>
            </label>
            <input
              id="shipment-units"
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
            />
            <label htmlFor="production-cost">
              {t("প্রতি পিস তৈরির খরচ", "Production cost per unit")}
              <strong>৳{cost.toLocaleString()}</strong>
            </label>
            <input
              id="production-cost"
              type="range"
              min="50"
              max="2000"
              step="10"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
            />
          </div>
          <div className="trade-calculator-result" aria-live="polite">
            <span>
              {t("এই হিসাবে বাড়তি আয়", "Additional earnings in this scenario")}
            </span>
            <strong>
              ${Math.round((units * cost * 0.22) / 120).toLocaleString()}
            </strong>
            <p>
              {t(
                "পরিবহন, কর ও অন্যান্য খরচ এখানে ধরা হয়নি। প্রকৃত দর ও শর্ত দিয়ে পুরো হিসাব যাচাই করতে হবে।",
                "Freight, taxes and other expenses are excluded. Review actual prices and terms for a complete estimate.",
              )}
            </p>
            <button
              className="btn-primary"
              onClick={() => launch(product.id, true)}
            >
              {t("এই তথ্য নিয়ে এগোই", "Continue with these figures")}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <section className="trade-section trade-container trade-support">
        <div>
          <ShieldCheck size={28} />
          <h2>
            {t(
              "নিজের তথ্য বুঝে শেয়ার করুন।",
              "Stay in control of what you share.",
            )}
          </h2>
          <p>
            {t(
              "চেনা ধরনের পরিচয়পত্র ও যোগাযোগের তথ্য আড়াল করার ব্যবস্থা আছে। তবু পাঠানোর আগে একবার দেখে নিন। কাগজপত্রের ফলাফল খসড়া হিসেবে ব্যবহার করুন।",
              "Recognized identity and contact patterns can be masked. Check your content before sending it, and treat generated documents as drafts.",
            )}
          </p>
          <Link className="trade-text-link" to="/privacy">
            {t("তথ্য কীভাবে ব্যবহার হয়", "How your data is used")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div>
          <p className="trade-eyebrow">
            {t("জেনে রাখা ভালো", "BEFORE YOU START")}
          </p>
          <h2>
            {t("দেখে নিন, তারপর সিদ্ধান্ত নিন।", "Explore before you decide.")}
          </h2>
          <p>
            {t(
              "এখন প্রতিযোগিতার জন্য তৈরি সংস্করণটি ব্যবহার করছেন। নমুনা কারখানা, পণ্য ও বাজারের তথ্য দিয়ে কাজগুলো দেখা যায়। এগুলো প্রকৃত ক্রেতা বা সম্পন্ন রপ্তানির রেকর্ড নয়।",
              "This competition version uses illustrative factories, products and market information to demonstrate the workflows. These are not actual customers or completed exports.",
            )}
          </p>
          <Link className="trade-text-link" to="/docs">
            {t("ব্যবহারের নির্দেশনা", "Read the guide")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section
        id="platform-video"
        className="trade-container trade-details-section"
      >
        <details
          onToggle={(e) => {
            if (!e.currentTarget.open) setVideo(false);
          }}
        >
          <summary>
            <Play size={18} />
            {t("ভিডিওতে কাজটা দেখুন", "Watch the walkthrough")}
          </summary>
          {video ? (
            <iframe
              className="trade-video"
              src="https://www.youtube-nocookie.com/embed/fHR5ZNmKrxU?autoplay=1&rel=0"
              title="ExportPilot walkthrough"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              className="trade-video-start"
              onClick={() => setVideo(true)}
            >
              <Play size={30} />
              {t("ভিডিও চালান", "Play video")}
            </button>
          )}
        </details>
      </section>
      <section id="corridor" className="trade-container trade-details-section">
        <details>
          <summary>
            {t(
              "সম্ভাব্য পরিবহনপথের নমুনা দেখুন",
              "Explore illustrative shipping routes",
            )}
          </summary>
          <p>
            {t(
              "এখানকার দর, সময় ও শুল্কের তথ্য নমুনা। চালানের আগে বর্তমান তথ্য যাচাই করুন।",
              "Rates, timing and tariff information here are illustrative. Verify current terms before shipment.",
            )}
          </p>
          <TradeLogisticsRadar />
        </details>
      </section>
      <section className="trade-section trade-container trade-faq">
        <div className="trade-section-heading">
          <p className="trade-eyebrow">{t("আপনার প্রশ্ন", "YOUR QUESTIONS")}</p>
          <h2>{t("শুরু করার আগে", "Before getting started")}</h2>
        </div>
        {seoConfig.homeFaqs.map((f) => (
          <details key={f.questionEn}>
            <summary>{t(f.questionBn, f.questionEn)}</summary>
            <p>{t(f.answerBn, f.answerEn)}</p>
          </details>
        ))}
      </section>
      <section className="trade-container trade-closing">
        <h2>
          {t("শুরু হোক আপনার একটি পণ্য দিয়ে।", "Start with one product.")}
        </h2>
        <p>
          {t(
            "সব তথ্য একবারে দিতে হবে না। যা জানা আছে, তা দিয়েই শুরু করুন।",
            "Bring what you know. Build the rest as you go.",
          )}
        </p>
        <Link className="btn-primary" to={user ? destination : "/register"}>
          {t("শুরু করি", "Get started")}
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
};
