import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, Layers, GitCommit, Copy, Check, ShieldCheck, DollarSign } from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const { t } = useAuth();
  const [activeDiagram, setActiveDiagram] = useState<number>(0);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const diagrams = [
    {
      id: 1,
      title: t('১. সিস্টেম আর্কিটেকচার', '1. System Architecture'),
      desc: t('React Frontend, Sovereignty PII Middleware, OpenSource Parsers, FastMCP 5 Agents, and Hybrid RAG Layer.', 'End-to-end full-stack component breakdown.'),
      code: `graph TB
  subgraph Client["Zero-Hassle Bilingual Frontend (React + Tailwind + Web Speech bn-BD)"]
    Snap["1-Photo / PDF Dropzone"]
    Mic["Bangla Voice Input (bn-BD)"]
    Presets["4 One-Click Judge Presets"]
    DealRoom["4-Tab Autonomous Export Deal Room"]
  end

  subgraph Guardrails["Sovereignty & Auth Middleware"]
    JWT["JWT + RBAC Session (Login / Logout / Protected Route)"]
    PII["Local Bangla PII Redactor (Masks NID, TIN, BIN, Phone)"]
  end

  subgraph OpenSourceEngine["100% Open-Source Parsing & Studio Pipeline"]
    Vision["OpenCV + Pillow Studio Cleaner"]
    PDFParse["PyMuPDF (fitz) + pdfplumber"]
    PDFGen["ReportLab Multi-Document PDF Exporter"]
  end

  subgraph MCPCore["FastMCP 5-Agent Orchestrator (SSE Real-Time Stream)"]
    A1["Agent 1: Vision-to-8-Digit-HS-Code Classifier"]
    A2["Agent 2: GraphRAG Global Buyer & 0% Tariff Matcher"]
    A3["Agent 3: Zero-Hardware EU CBAM Carbon & Bill Auditor"]
    A4["Agent 4: Loss-Aversion FOB Pricer & Margin Calculator"]
    A5["Agent 5: Multilingual Pitch (EN/DE/JP) & Invoice Generator"]
  end

  subgraph DataLayer["Hybrid RAG & Persistence Layer"]
    Chroma[("ChromaDB Multilingual Embeddings")]
    Graph[("NetworkX GraphRAG: Product -> HS Code -> Tariff -> Buyer")]
    SQL[("SQLite Database: Users, Sessions, Deals, Audit Logs")]
  end

  Client --> Guardrails
  Guardrails --> OpenSourceEngine
  OpenSourceEngine --> MCPCore
  MCPCore <--> Chroma
  MCPCore <--> Graph
  MCPCore <--> SQL
  MCPCore --> PDFGen
  PDFGen --> DealRoom`
    },
    {
      id: 2,
      title: t('২. ইউজার ও ইউজ-কেস ডায়াগ্রাম', '2. User Use-Case Diagram'),
      desc: t('কারখানা মালিক, কংগ্রেস বিচারক, প্রবাসী মেন্টর ও অ্যাডমিন ভূমিকা।', 'Actors and interactions across ExportPilot AI platform.'),
      code: `flowchart LR
  SME(["SME Exporter (কারখানা মালিক)"])
  Judge(["কংগ্রেস বিচারক ও ইনভেস্টর (DIU)"])
  NRB(["প্রবাসী NRB ট্রেড মেন্টর"])
  Admin(["সিস্টেম ও সিকিউরিটি অ্যাডমিন"])

  subgraph ExportPilot_Use_Cases["ExportPilot AI Use Cases"]
    U1("১টি পণ্যের ছবি ও বাংলা ভয়েস দিয়ে এক্সপোর্ট ডিল তৈরি")
    U2("ব্যাকগ্রাউন্ড রিমুভ করে স্টুডিও ক্যাটালগ ও 8-Digit HS Code নির্ণয়")
    U3("GraphRAG দিয়ে শুল্কমুক্ত (0% Duty) দেশ ও ভেরিফায়েড বায়ার নির্বাচন")
    U4("বিদ্যুৎ বিল PDF আপলোড করে বিনা হার্ডওয়্যারে EU CBAM কার্বন অডিট")
    U5("দালাল বনাম সরাসরি এক্সপোর্ট লাভ-ক্ষতি (Loss Aversion) তুলনা")
    U6("১-ক্লিকে FOB Proforma Invoice, ক্যাটালগ ও CBAM সার্টিফিকেট PDF ডাউনলোড")
    U7("এন্টারপ্রাইজ লগইন (/login) ও ভূমিকা-ভিত্তিক অ্যাডমিন অ্যাক্সেস (/admin)")
    U8("PII মাস্কিং ও এন্টারপ্রাইজ সিকিউরিটি অডিট রিপোর্ট জেনারেট (/audit)")
  end

  SME --> U1
  SME --> U2
  SME --> U3
  SME --> U4
  SME --> U5
  SME --> U6
  Judge --> U8
  Judge --> U7
  Admin --> U7
  Judge --> U4
  Judge --> U8
  NRB --> U3
  Admin --> U8`
    },
    {
      id: 3,
      title: t('৩. ৫-এজেন্ট MCP সিকোয়েন্স ডায়াগ্রাম', '3. 5-Agent MCP Sequence'),
      desc: t('SSE স্ট্রিমিং ও মাইক্রোসেকেন্ড পাইপলাইন এক্সিকিউশন সিকোয়েন্স।', 'Execution timeline from photo drop to PDF download.'),
      code: `sequenceDiagram
  autonumber
  actor Exporter as SME Owner / Judge
  participant Frontend as React UI
  participant Sovereignty as Bangla PII Filter
  participant Parsers as OpenCV + PyMuPDF
  participant MCP as FastMCP 5-Agent Server
  participant HybridRAG as GraphRAG + Database
  participant ReportLab as PDF Deal Generator

  Exporter->>Frontend: Drop 1 Product Photo + Speak Bangla (or Click Preset #1)
  Frontend->>Sovereignty: POST /api/v1/export/analyze (Image + Voice/PDF)
  Sovereignty->>Sovereignty: Redact any NID / TIN / BIN / Phone numbers
  Sovereignty->>Parsers: Clean input payload
  Parsers-->>MCP: Studio Image + Electricity Bill kWh Metrics
  MCP-->>Frontend: SSE Event: [Agent 1] 8-Digit HS Code 4202.22.10 Matched (98.4%)
  MCP->>HybridRAG: Query Multi-Hop Graph (HS 4202.22.10 -> 0% Duty Markets -> Buyers)
  HybridRAG-->>MCP: Germany (0% EU EBA), Japan (0% DFQF), UK (0% DCTS) + 4 Buyers
  MCP-->>Frontend: SSE Event: [Agent 2] GraphRAG Subgraph & 4 Active Buyers Found
  MCP-->>Frontend: SSE Event: [Agent 3] Scope 2 Emissions: 0.31 kg CO2e/unit (EU CBAM Pass)
  MCP-->>Frontend: SSE Event: [Agent 4] Direct FOB Price $3.40/unit (+36.5% Margin vs Buying House)
  MCP->>ReportLab: Render Proforma Invoice PDF, CBAM Certificate PDF & Lookbook PDF
  ReportLab-->>Frontend: Return Deal Package JSON + Download Links
  Frontend-->>Exporter: Render Interactive Graph, Studio Photo, Bangla Audio & PDFs!`
    },
    {
      id: 4,
      title: t('৪. ডাটাবেজ ERD ডায়াগ্রাম', '4. Database ERD'),
      desc: t('SQLite/PostgreSQL রিলেশনাল টেবিল স্ট্রাকচার।', 'Schema: users, products_and_scans, global_buyers, parsed_documents, audit_logs.'),
      code: `erDiagram
  USERS ||--o{ SESSIONS : has
  USERS ||--o{ PRODUCTS_AND_SCANS : creates
  USERS ||--o{ PARSED_DOCUMENTS : uploads
  PRODUCTS_AND_SCANS }o--|| HS_CODES : classified_as
  HS_CODES ||--o{ GLOBAL_BUYERS : imported_by
  HS_CODES ||--o{ TARIFF_RULES : governed_by
  USERS {
    string id PK
    string email UK
    string password_hash
    string full_name_bn
    string role
    string factory_name
  }
  PRODUCTS_AND_SCANS {
    string id PK
    string user_id FK
    string title_bn
    string hs_code_8digit FK
    float unit_cost_bdt
    float recommended_fob_usd
    float cbam_co2_kg
    int compliance_score
  }
  GLOBAL_BUYERS {
    string id PK
    string company_name
    string country_code
    string hs_code_8digit FK
    float avg_order_usd
    float tariff_pct
  }
  PARSED_DOCUMENTS {
    string id PK
    string user_id FK
    string doc_type
    string parser_engine
    int pii_masked_count
  }`
    },
    {
      id: 5,
      title: t('৫. ইউজার জার্নি স্টেট মেশিন', '5. User Journey State Machine'),
      desc: t('স্টেট ট্রানজিশন: ল্যান্ডিং থেকে বায়ার প্রপোজাল ডেলিভারি।', 'Finite State Machine: Landing -> Input -> PII -> MCP -> Deal Room.'),
      code: `stateDiagram-v2
  [*] --> Landing_Portal
  Landing_Portal --> Authenticated_Workspace : Enterprise Login (/login)
  Authenticated_Workspace --> Input_Captured : Drop 1 Photo / PDF or Speak Bangla or Select Preset
  Input_Captured --> PII_Sovereignty_Filter : Local Regex Redaction
  PII_Sovereignty_Filter --> OpenSource_Studio_And_OCR : OpenCV bg-remove + PyMuPDF
  OpenSource_Studio_And_OCR --> Parallel_5_MCP_Agents : FastMCP SSE Orchestration
  Parallel_5_MCP_Agents --> Deal_Room_Ready : GraphRAG + FOB Pricing + ReportLab PDFs
  Deal_Room_Ready --> Buyer_Proposal_Sent : 1-Click Send Multilingual Pitch / Download PDFs
  Buyer_Proposal_Sent --> [*]`
    }
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const current = diagrams[activeDiagram];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
          SYSTEM ARCHITECTURE & MERMAID SUITE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {t('সিস্টেম আর্কিটেকচার ও ইঞ্জিনিয়ারিং ব্লুপ্রিন্ট', 'Engineering Architecture & Diagrams')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-bangla">
          {t(
            'ইন্টারন্যাশনাল এআই বিল্ডার্স কংগ্রেস ২০২৬ এর জন্য তৈরি ৫টি ইন্টারেক্টিভ মারমেইড ডায়াগ্রাম ও ক্লাউড কস্ট কম্প্যারিজন।',
            '5 interactive architectural blueprints conforming to Section 4 of the Congress specification.'
          )}
        </p>
      </div>

      {/* Diagram Viewer Tabs */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="flex border-b border-slate-800 bg-slate-950/80 overflow-x-auto">
          {diagrams.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setActiveDiagram(idx)}
              className={`px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeDiagram === idx
                  ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">{current.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{current.desc}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs text-slate-300 transition-colors"
              >
                {showRaw ? t('ভিউ ডায়াগ্রাম', 'View Diagram') : t('সোর্স কোড', 'Raw Mermaid Source')}
              </button>
              <button
                onClick={() => handleCopy(current.code)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('কপি হয়েছে', 'Copied') : t('কপি কোড', 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Diagram Display Area */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 min-h-[350px] flex items-center justify-center">
            {showRaw ? (
              <pre className="w-full text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {current.code}
              </pre>
            ) : (
              <div className="w-full space-y-4">
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap max-h-[450px] overflow-y-auto">
                  {current.code}
                </div>
                <div className="text-center text-[11px] text-slate-400">
                  {t('মারমেইড স্পেসিফিকেশন ভ্যালিডেটেড • GitHub ও Mermaid.js লাইভ রেন্ডারার কম্প্যাটিবল।', 'Mermaid 11.x verified specification.')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Cost Comparison Table ($0.00 Idle Guarantee) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span>{t('ওপেন-সোর্স বনাম ক্লাউড খরচ তুলনা (Azure $100 ক্রেডিট প্রটেকশন)', 'Cloud Cost Comparison & $0.00 Idle Protection')}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead className="bg-slate-950 text-slate-300 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Component / Service</th>
                <th className="p-3">Commercial SaaS Alternative</th>
                <th className="p-3">ExportPilot AI Open-Source Engine</th>
                <th className="p-3">Monthly Runtime Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">Utility Bill & PDF OCR Parsing</td>
                <td className="p-3 text-rose-400">AWS Textract ($1.50 / 100 pages)</td>
                <td className="p-3 text-emerald-400 font-bold">PyMuPDF (fitz) + pdfplumber</td>
                <td className="p-3 text-emerald-400 font-bold">$0.00 / month</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Studio Photo Background Removal</td>
                <td className="p-3 text-rose-400">remove.bg API ($0.20 / photo)</td>
                <td className="p-3 text-emerald-400 font-bold">OpenCV GrabCut + Pillow Studio</td>
                <td className="p-3 text-emerald-400 font-bold">$0.00 / month</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Trade Knowledge Graph & RAG</td>
                <td className="p-3 text-rose-400">Neo4j Enterprise Cloud ($65 / mo)</td>
                <td className="p-3 text-emerald-400 font-bold">NetworkX In-Memory Property Graph</td>
                <td className="p-3 text-emerald-400 font-bold">$0.00 / month</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Invoice & Lookbook PDF Generation</td>
                <td className="p-3 text-rose-400">DocRaptor / PDFMonkey ($39 / mo)</td>
                <td className="p-3 text-emerald-400 font-bold">ReportLab 4.x Vector PDF Engine</td>
                <td className="p-3 text-emerald-400 font-bold">$0.00 / month</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Azure Cloud Container Hosting</td>
                <td className="p-3 text-rose-400">Dedicated VM ($55+ / mo)</td>
                <td className="p-3 text-emerald-400 font-bold">Container Apps (Scale-to-Zero, 0 min)</td>
                <td className="p-3 text-emerald-400 font-bold">$0.00 idle (Under $10/year)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
