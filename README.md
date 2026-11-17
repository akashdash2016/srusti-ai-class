# Attendance Register Generator & WhatsApp Converter

A modern, fast, web-based utility designed for teachers to convert WhatsApp-style lists of present student roll numbers into structured, color-coded, 4-student block attendance registers.

Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**, ready for one-click deployment to **Vercel**.

---

## 🚀 Features

- **WhatsApp Message Parser**: Intelligently extracts present roll numbers from raw pasted WhatsApp messages (newline, comma, space, or mixed formatted text).
- **Consolidation & Validation**: Automatically removes duplicate roll numbers and flags invalid/out-of-bounds numbers with helpful warning banners.
- **4-Student Block Grid**: Visual attendance register grouped into 13 blocks of 4 consecutive students (Rolls 1–4, 5–8, ..., 49–52 for 52 students).
- **Color-Coded Status**: High contrast Present (`P` in Vibrant Green) and Absent (`A` in Crimson Red) badges with icons and labels for accessibility.
- **Attendance Metrics**: Instant real-time cards showing Total Students, Present Count, Absent Count, and Attendance Percentage.
- **Multiple Views**:
  - 🔲 **Grid View**: Card-based 4-student block register format.
  - 📜 **Sequence View**: Compact sequence code lines (e.g., `1–4: P P A P`) for quick physical register marking.
  - 📊 **Table View**: Filterable table with search by roll number or status.
- **Copy Helpers**:
  - `COPY SEQUENCE`: Copies sequence strings like `P P A P | P P P P | A A P A | ...`
  - `COPY REGISTER FORMAT`: Copies lines formatted as `1-P 2-P 3-A 4-P`
  - `COPY ABSENTEE LIST`: Copies formatted list of absent roll numbers.
- **Export Options**:
  - 🖼 **Export PNG**: High-resolution image capture of the register.
  - 📄 **Export PDF**: Clean, printable A4 Landscape document.
  - 📊 **Export CSV**: Full tabular raw data export (`Date,Section,Roll Number,Status,Group`).
- **Data Persistence**: Stores recent attendance records in browser `localStorage`. Reload previous registers with 1 click.
- **Password Protected**: A server-side password gate (Vercel Routing Middleware + `SITE_PASSWORD` env var) protects all pages and assets, so student names are not publicly exposed.
- **Configurable**: Configurable class size (defaults to 53, customizable up to 200) and group block size (defaults to 4).

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Export Engines**: `html-to-image`, `jsPDF`, CSV Blob generator
- **Animations & Toast**: `canvas-confetti`, custom CSS keyframes

---

## 💻 Getting Started Locally

### Prerequisites
Make sure you have Node.js (v18 or higher) installed on your machine.

### Installation

1. Clone or open the repository:
```bash
cd attendance_srusti_mba
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```text
http://localhost:5173/
```

---

## 📦 Production Build

To verify and create an optimized production build:

```bash
npm run build
```

To preview the built production site locally:

```bash
npm run preview
```

---

## 🌐 Deploying to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Run Vercel command inside project directory:
```bash
vercel
```

3. Follow the prompts (Select Vite framework preset, root directory `./`).

### Option 2: Deploy via GitHub / Vercel Dashboard

1. Push this repository to GitHub / GitLab / Bitbucket.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Click **Deploy**.

---

## 🔐 Password Protection (Required)

The app is protected by a password gate implemented in `middleware.js` using
**Vercel Routing Middleware**. The password lives only in a server-side
environment variable and is never shipped to the browser.

### Setup

1. Open your project on Vercel → **Settings** → **Environment Variables**.
2. Add a new variable:
   - **Key**: `SITE_PASSWORD`
   - **Value**: your chosen access password
   - **Environments**: Production (add Preview/Development if you want them protected too)
3. Click **Save**, then **Redeploy** (environment variables only apply to new deployments).

Visitors are redirected to `/login.html` until they enter the correct password.
A signed, `HttpOnly` cookie keeps them signed in for 30 days. The **Lock** button
in the app header clears the cookie immediately.

Notes:
- Changing `SITE_PASSWORD` invalidates all existing sessions automatically.
- Do **not** name the variable `VITE_SITE_PASSWORD`: `VITE_` values are embedded in
  the public JavaScript bundle.
- The gate covers the whole deployment, including the bundled JS that contains the
  student names, not just the home page.
- To test the gate locally, run it through Vercel (`vercel dev`) with
  `SITE_PASSWORD` set. Plain `npm run dev` bypasses middleware by design.

---

## 📋 Attendance Calculation Logic & Test Case

Assuming total students = **52** and present list input = `1, 2, 4, 5, 6, 7, 8`:

- **Parsed Present Roll Numbers**: `[1, 2, 4, 5, 6, 7, 8]`
- **Roll Status**:
  - `1-P`, `2-P`, `3-A`, `4-P` (Group 1: `P P A P`)
  - `5-P`, `6-P`, `7-P`, `8-P` (Group 2: `P P P P`)
  - `9-A`, `10-A`, `11-A`, `12-A` (Group 3: `A A A A`)
  - ... through `52-A` (Group 13: `A A A A`)
- **Metrics**:
  - Total: `52`
  - Present: `7`
  - Absent: `45`
  - Attendance Rate: `13.46%`

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── AttendanceGrid.tsx       # 4-student block grid register
│   ├── DetailedTable.tsx        # Filterable student table view
│   ├── ExportToolbar.tsx        # PNG, PDF, CSV & copy sequence controls
│   ├── Header.tsx               # App header, badge & top actions
│   ├── InputSection.tsx         # Date, Section, Max Roll, Textarea & Generate buttons
│   ├── RecentHistoryModal.tsx   # Saved registers history drawer
│   ├── ResetConfirmModal.tsx    # Safety confirmation modal
│   ├── SequenceView.tsx         # Compact horizontal roll sequence bars
│   ├── SummaryCards.tsx         # Total, Present, Absent & % metric cards
│   ├── Toast.tsx                # Feedback notification toasts
│   ├── ViewSelector.tsx        # Grid / Sequence / Table toggle
│   └── WarningBanner.tsx        # Duplicate & invalid number warning alerts
├── types/
│   └── attendance.ts            # TypeScript interfaces & types
├── utils/
│   ├── attendanceParser.ts      # WhatsApp text parser & grouping logic
│   ├── exportUtils.ts           # PNG, PDF, CSV, clipboard exporters
│   └── localStorageUtils.ts     # LocalStorage history persistence
├── App.tsx                      # Main application layout & orchestrator
├── index.css                    # Tailwind CSS v4 & custom animations
└── main.tsx                     # Vite entry point
```

---

## 📄 License

MIT License. Designed for teachers and educational institutions.
