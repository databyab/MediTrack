# 🏥 MediTrack: Smart Medication Management

MediTrack is a premium, AI-powered medication tracking application designed to help users stay on top of their health with ease. Built with **React**, **TypeScript**, and **Supabase**, it features a sleek SaaS-style interface and secure AI-driven medical insights via **Groq**.

![MediTrack Header](https://raw.githubusercontent.com/databyab/MediTrack/main/public/og-image.png)

## ✨ Key Features

-   **📋 Smart Dashboard**: A comprehensive view of today's medication schedule with progress tracking.
-   **🤖 AI Insight Engine**: Instantly get detailed medical summaries, uses, side effects, and precautions for any medication using Groq's Llama 3.1 8B model.
-   **🔒 Secure by Design**: All AI integrations are proxied through Supabase Edge Functions, keeping your API keys safe from the client side.
-   **📊 Adherence Reports**: Track your consistency over time with visual progress reports and adherence scoring.
-   **📱 Fully Responsive**: A premium, "linear-style" design that works beautifully on desktop, tablet, and mobile.
-   **🔐 Robust Auth**: Secure user authentication via Supabase (Email/Password & Google OAuth).

## 🛠 Tech Stack

-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 4.
-   **Animations**: Motion (formerly Framer Motion).
-   **Backend**: Supabase (Database, Auth, Edge Functions).
-   **AI Engine**: Groq (Llama 3.1 8B Instant).
-   **Icons/UI**: Lucide React, Radix UI.

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   A Supabase Project
-   A Groq API Key

### Local Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/Medi-Track.git
    cd Medi-Track
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    GROQ_API_KEY=your_groq_api_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

### Supabase Deployment

1.  **Deploy Edge Functions**:
    ```bash
    npx supabase functions deploy get-medicine-info
    ```

2.  **Set Secrets**:
    ```bash
    npx supabase secrets set GROQ_API_KEY=your_groq_api_key
    ```

3.  **Database Setup**:
    Apply the schema provided in `supabase_schema.sql` via the Supabase SQL Editor.

## 🛡 Security Note

MediTrack takes security seriously:
-   **API Security**: AI requests are handled server-side to prevent key exposure.
-   **Data Protection**: Row Level Security (RLS) ensures users can only access their own medical data.
-   **Input Validation**: Strict sanitization on all user-provided data sent to AI engines.

## 📄 License

This project is licensed under the MIT License.

---
*Disclaimer: MediTrack is for educational and tracking purposes only. Always consult a healthcare professional for medical advice.*