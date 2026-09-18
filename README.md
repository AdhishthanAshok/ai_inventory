# Smart AI Wardrobe & Styling Assistant

A full-stack web application for digitizing your clothing inventory, getting AI-powered outfit recommendations, and evaluating potential purchases.

## Tech Stack
- **Backend:** FastAPI (Python) with PostgreSQL
- **Frontend:** Next.js (React) + TailwindCSS
- **AI:** Google Gemini API
- **Image Processing:** rembg for background removal
- **Storage:** Cloudinary for image hosting

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Fill in your credentials
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # Fill in your API URL
npm run dev
```

## Environment Variables
See `.env.example` files in both `backend/` and `frontend/` directories.
