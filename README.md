# MediTrack

MediTrack is a modern medication tracking web app that helps users manage daily medicines, reminders, and adherence in a clean, intuitive interface.

Built with **React + Vite + Tailwind CSS**, MediTrack focuses on usability, clarity, and a premium UI experience.

---

## Features (v1)

- **Medication Management**
  - Add, view, and delete medications
  - Custom dosage, units, and multiple reminder times
  - Optional instructions and treatment duration

- **Daily Schedule**
  - Automatically generated daily medication schedule
  - Mark doses as **Taken** or **Skipped**
  - Visual status indicators

- **Adherence Tracking**
  - Daily progress (taken vs remaining)
  - Weekly adherence percentage
  - 7-day adherence trend visualization

- **Reports Dashboard**
  - Weekly adherence summary
  - Total doses taken
  - Active medications count
  - Recent activity log

- **Modern UI**
  - Gradient-based design
  - Glassmorphism effects
  - Responsive layout (mobile → desktop)
  - Clean animations and hover states

---

## Tech Stack

- **Frontend**: React (Hooks)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React `useState`
- **Deployment**: Vercel 

---

## Project Structure

meditrack/
├── src/
│ ├── assets/ # Logos & static assets
│ ├── App.jsx # Main application logic
│ ├── main.jsx # App entry point
│ └── index.css # Tailwind styles
├── public/
├── index.html
├── tailwind.config.cjs
├── vite.config.cjs
└── package.json

## Future Improvements 

🔔 Notification reminders
💾 Persistent storage (LocalStorage / Backend)
👥 Multi-user support
📱 PWA / Mobile-first enhancements
🧪 Unit & integration tests

Live : https://medi-track-self.vercel.app
