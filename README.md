# XPOOL AI CONNECT - Enterprise Telephony & CRM Dashboard

**Client:** XPOOL Technology Private Limited  
**Product:** XPOOL AI CONNECT Frontend SaaS Suite  
**Version:** 2.4.0 (Enterprise Preview)

---

## 🚀 Overview

**XPOOL AI CONNECT** is a SaaS dashboard engineered for **XPOOL Technology Private Limited**. It provides management over AI-driven conversational telephony, driver onboarding funnels, passenger engagement, live call monitoring, multi-language speech workflows (Tamil, Telugu, English, Hindi), and staff operations.

This build includes all 13 enterprise pages, local data persistence via `DataContext` and `localStorage`, interactive call simulation dialogs, realistic multi-lingual audio waveforms and transcripts, role switching (CEO, HR, Team Leader, Customer Care Executive), and an Excel/CSV lead parsing and deduplication engine.

---

## 🎨 Branding & Design System

- **Color Palette:**
  - **Primary:** Vibrant Amber & Warm Orange (`#F59E0B`, `#EA580C`, `#D97706`)
  - **Neutrals:** Jet Black / Slate-950 (`#0B0F19`, `#111827`, `#1E293B`)
  - **Backgrounds:** Clean Enterprise Light Grey (`#F8FAFC`, `#F1F5F9`)
  - **Accents:** Emerald (`#10B981`), Rose (`#F43F5E`), Blue (`#3B82F6`)
- **Typography:** Google Font **Poppins** (300, 400, 500, 600, 700)
- **Responsive Layout:** Adaptive sidebar navigation with mobile toggle, clean topbar, and accessible modals.

---

## 🛠 Tech Stack

- **Framework:** React.js 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Icons:** Lucide React
- **Analytics & Visualizations:** Recharts (Area, Bar, Funnel, Pie)
- **Routing:** React Router v6
- **Spreadsheet Ingestion:** SheetJS (`xlsx`) for drag-and-drop Excel/CSV client-side parsing
- **Data Engine:** Local persistent state via React Context API (`DataProvider` & `AuthProvider`)

---

## 📋 Complete Page Catalog (13 Routes)

| # | Route | Page Name | Key Capabilities |
|---|---|---|---|
| 1 | `/` | **Overview Dashboard** | 8 KPI Cards (Total Drivers, Passengers, Leads, Calls, Answered, Onboarded, Follow-ups, Escalations), Recharts telemetry, recent activity feed. |
| 2 | `/drivers` | **Driver Onboarding** | Searchable driver directory, status & city filters, KYC compliance checklists, "Start AI Call" trigger, manual registration. |
| 3 | `/leads/import` | **Excel Lead Import** | Drag-and-drop XLSX/CSV parsing, column mapping, error checks, duplicate detection against existing phone numbers, batch ingest. |
| 4 | `/passengers` | **Passenger Management** | Commuter directory, registration status, preferred languages, engagement segments (VIP, Active, Dormant, Churned), ride history. |
| 5 | `/driver-engagement` | **Driver Engagement** | SLA follow-up queues (Critical, Scheduled Callbacks, Pending KYC, Re-engagement), quick notes, Team Leader escalation. |
| 6 | `/calls/management` | **AI Call Management** | Outbound telephony dispatcher, AI agent persona selector, dialect picker, carrier trunk telemetry, live simulation trigger. |
| 7 | `/calls/live` | **Live Call Monitor** | Real-time concurrent call tiles with live ticking timers, signal strength, sentiment monitoring, "Listen In", and human takeover. |
| 8 | `/calls/history` | **Call History & Transcripts** | Searchable audit log, interactive audio waveform player with playback speeds, multi-turn transcripts in Tamil, Telugu, and English. |
| 9 | `/tasks` | **Follow-up Tasks** | Callback task scheduling, employee assignment (CEO, HR, TL, CCE), priority SLA badges, status transitions. |
| 10 | `/employees` | **Employee Management** | User roster across 4 corporate roles (CEO, HR, Team Leader, CCE), permissions scope, active status toggling. |
| 11 | `/ai-settings` | **AI Voice Agent Settings** | Dialect prompts configuration (Tamil, Telugu, English, Hindi), synthetic voice parameters (gender, rate, silence timeout), test voice synthesis. |
| 12 | `/reports` | **Reports & Analytics** | Regional conversion yield by metro hub (Chennai, Hyderabad, Bengaluru, etc.), connectivity analytics, operator efficiency tables. |
| 13 | `/settings` | **Settings** | Corporate legal details (CIN, Registered Office, Contact), user profile credentials, sound and UI density preferences. |

---

## 💻 Installation & Development

### 1. Prerequisites
- Node.js version 18.0.0 or higher
- npm 9.0.0 or higher

### 2. Install Dependencies
```bash
cd c:\X_CRM
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized static bundle in the `dist/` directory.

---

## 🔒 Security & Privacy Notice
- **Zero API Keys Required:** All telephony, audio synthesis, and transcription features operate using client-side mock engines.
- **Ready for Integration:** Pre-architected interfaces ready to attach to Supabase, n8n webhooks, Exotel SIP trunks, and the OpenAI Realtime API when deployment phase begins.

---

© 2026 **XPOOL Technology Private Limited**. All Rights Reserved.

