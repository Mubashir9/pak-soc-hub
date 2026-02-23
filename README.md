<div align="center">
  <img src="public/pakSocMascot.png" alt="PakSoc Mascot" width="150" height="auto"/>
  <h1>PakSoc Hub</h1>
  <p>A comprehensive, role-based platform for Pak@MQ society management, built with modern web technologies.</p>
</div>

## 📌 What is the Project?

**PakSoc Hub** is a specialized management portal designed for the executive team of the Pakistan Society (Pak@MQ). It serves as a unified hub for planning events, managing tasks, tracking budgets, and coordinating team efforts. Access is strictly controlled via domain-restricted Google OAuth (`@students.mq.edu.au`), ensuring only authorized university students and executives can access the system.

## 🎯 The Problem It Solves

Managing a bustling university student society often involves scattered spreadsheets, fragmented communication channels, and unstructured task tracking. This leads to inefficiencies, budget oversights, and miscommunication among the executive team.

**PakSoc Events solves this by providing:**
1. **Centralized Operations:** A single source of truth for all society events, budgets, and tasks.
2. **Role-Specific Workflows:** Tailored core setup for the President, Secretary, Treasurer, Head of Marketing, Head of Events & Communications, and Head of IT.
3. **Structured Task Management:** Intuitive Kanban boards that replace messy to-do lists, allowing executives to visually track the progress of every event.
4. **Financial Oversight:** Built-in budget tracking to ensure the society remains financially healthy and transparent.
5. **Enhanced Security:** Automated domain-level restrictions to ensure that only verified university students can participate and access internal executive resources.

## ✨ Key Features

- **Domain-Restricted Authentication:** Secure login using Supabase and Google OAuth, restricted exclusively to authorized student email addresses.
- **Interactive Kanban Boards:** Drag-and-drop task management for event planning, allowing seamless transitions between states while supporting robust task creation and deletion.
- **Unified Dashboard:** A central dashboard that aggregates tasks across all events assigned to the logged-in user, alongside high-level society metrics.
- **Budget Tracking:** Real-time financial monitoring for events, capturing allocated budgets versus actual expenditures.
- **Role-Based Architecture:** Scalable foundation tailored to the specific operational roles within the society.

## 🛠️ Tech Stack

This project is built with a focus on performance, robust type safety, and developer experience:

- **Frontend Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Radix UI (Accessible, unstyled components)
- **Backend & Auth:** Supabase (PostgreSQL, Authentication, Row Level Security)
- **State & Data Management:** Supabase JS Client
- **Forms & Validation:** React Hook Form + Zod
- **Drag & Drop:** `@hello-pangea/dnd` for fluid Kanban board interactions
- **Animations:** Framer Motion
- **Data Visualization:** Recharts
- **Icons & Theme:** Lucide React + next-themes

## 🚀 Technical Highlights

- **Strict Type Safety:** Comprehensive use of TypeScript combined with Zod schema validation ensures robust data handling from the frontend form to the database layer.
- **Modern Component Architecture:** Built using a modular, composition-based approach with Radix UI and Tailwind CSS, promoting reusability and accessibility without sacrificing aesthetic flexibility.
- **Advanced State Management & UI:** Implementing complex interactive UIs like drag-and-drop Kanban boards while maintaining optimistic UI updates for a snappy user experience.
- **Secure by Design:** Leveraging Supabase Auth and Row Level Security (RLS) to ensure that users only see and modify data they are authorized to access, with strict domain-level event triggers protecting sign-ups.
- **Performant Build:** Utilizing Vite for blazing-fast Hot Module Replacement (HMR) during development and highly optimized production builds.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase project with Google OAuth configured

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/paksoc-events.git
   cd paksoc-events
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
