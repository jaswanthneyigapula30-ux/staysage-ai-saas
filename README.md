# StaySage AI 🛎️✨

**[🔗 View Live Website](https://staysage-ai.vercel.app/)**

![Application Screenshot](C:/Users/Jaswanth/.gemini/antigravity/brain/tempmediaStorage/media__1782139955466.png)

StaySage AI is a modern, premium AI-powered Hotel Guest Complaint Management SaaS platform designed for high-end hospitality operations. The application enables hotel operations teams, front desk agents, and duty managers to log guest complaints, run real-time AI analysis to categorize and determine ticket urgency, and manage workflows via a centralized dashboard.

Built with a sleek dark aesthetic inspired by Linear and Stripe, the app provides a highly visual operations center containing glassmorphism widgets, detailed timeline activity tracking, slide-out details panels, and interactive analytics charts.

---

## 🌟 Key Features

1. **AI Guest Complaint Analysis**:
   - Parses guest complaints in real time using OpenAI GPT-4o-mini (with custom local heuristic matching fallbacks).
   - Extracts room number, guest name, priority levels (Low, Medium, High, Critical), category routing, sentiment, and suggested operational resolution procedures.
2. **Unified Operations Dashboard**:
   - Summary cards displaying total, open, critical, and resolved incidents.
   - High-priority alerts to highlight tickets needing immediate manager attention.
   - Interactive table supporting quick status updates and division assignments.
3. **Linear-style Detail Drawer**:
   - Slide-out panels displaying raw statements, AI-extracted insights, and suggested resolution procedures.
   - Activity Timeline logging every ticket transition (who did what, and when).
4. **Interactive Operational Analytics**:
   - Incident filing trends over the last 7 days.
   - Interactive Pie/Bar charts displaying department division breakdowns and severity distribution.
5. **Secure Authentication**:
   - Role-based credentials support (General Manager, Operations Manager, Front Desk staff).
   - Dual-mode integration: integrates with Supabase Auth or uses pre-seeded local credentials for demo reviews.
6. **Delightful Micro-interactions**:
   - Particle confetti celebrations on ticket resolution.
   - Modern smooth Framer Motion transitions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI Engine**: [OpenAI API](https://openai.com/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## ⚙️ Environment Variables

Copy the `.env.example` (or create a `.env.local` file) at the root of the project with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_api_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

*Note: If these variables are not provided, the application automatically enters **Demo Mode** using built-in mock database caches (localStorage + memory) and heuristic AI classifiers, making the application fully interactive out of the box.*

---

## 💾 Database Schema Setup

If connecting to a production Supabase instance, execute the SQL commands found in [schema.sql](./schema.sql) within your Supabase SQL Editor. This will automatically create:
- `profiles` table (synced with Supabase Auth)
- `complaints` table (logs raw records, sources, and priorities)
- `complaint_analysis` table (contains structured AI parsing data)
- `activity_logs` table (timeline tracks status changes)
- PostgreSQL triggers to automate `updated_at` timestamps and user profile generation.

---

## 🚀 Local Development Setup

Follow these steps to run the application locally:

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd staysage-ai
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file at the root and insert your credentials (optional).
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
5. **Open in browser**:
   Navigate to [https://staysage-ai.vercel.app/](https://staysage-ai.vercel.app/)

### Demo Credentials
For testing in Demo Mode, select one of the quick login options on the login screen or enter manually:
- **General Manager (Admin)**: `admin@staysage.ai` / `password`
- **Operations Manager**: `manager@staysage.ai` / `password`
- **Front Desk Staff**: `staff@staysage.ai` / `password`

---

## 📤 Deployment (Vercel)

The easiest way to deploy StaySage AI is using the Vercel Platform:

1. Push your repository to GitHub.
2. Go to Vercel and click **Add New Project**.
3. Import your `staysage-ai` repository.
4. Add the environment variables (optional).
5. Click **Deploy**.
