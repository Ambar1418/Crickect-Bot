🏏 Cricket LLM Chatbot (FastAPI + React + Groq + CSV Dataset)

COMMENT:
This is the title + short one-line description.

A smart Cricket-only AI Chatbot built using FastAPI, React, Groq LLM, and a custom Virat Kohli dataset.
It answers cricket questions like runs vs team, centuries, venue stats, and more.

🚀 Features

COMMENT:
This section explains what the chatbot can do.

✅ 1. Cricket-Only AI

Only answers cricket-related questions. Non-cricket → rejected.

✅ 2. Custom Dataset Integration

Uses vkdata.csv to answer:

Kohli runs vs team

Highest score

Centuries

Venue-wise runs

Year-wise performance

✅ 3. Smart Keyword Detection

Understands real natural language:

Examples:

“Kohli runs vs Australia?”

“How many centuries has Kohli scored?”

“Kohli at Wankhede?”

“Kohli runs in 2016?”

✅ 4. LLM Backup Answering

If dataset cannot answer → Groq LLM answers.

✅ 5. Clean & Modern Chat UI

Responsive chat design built in React.

📁 Project Structure

COMMENT:
This tells how your folders are organized.

Crickect-Bot/
│
├── cricket-llm-bot/        # Backend (FastAPI + Python)
│   ├── main.py             # Main backend logic + LLM + dataset
│   ├── vkdata.csv          # Virat Kohli dataset
│   ├── .env                # API keys
│   └── requirements.txt    # Python dependencies
│
├── cricket-ui/             # Frontend (React + Vite)
│   ├── src/
│   │   └── App.jsx         # Main UI + chat logic
│   ├── index.html
│   └── package.json
│
└── README.md               # Documentation

⚙️ Backend Setup (FastAPI)

COMMENT:
Steps to run Python API server.

1. Go to backend folder
cd cricket-llm-bot

2. Create virtual environment
conda create -n cricketbot python=3.12 -y
conda activate cricketbot

3. Install dependencies
pip install fastapi uvicorn python-dotenv pandas groq

4. Create .env file

COMMENT:
This stores your Groq API key securely.

GROQ_API_KEY=your_key_here

5. Run backend server
uvicorn main:app --reload


Backend runs at:

http://127.0.0.1:8000

⚛️ Frontend Setup (React + Vite)

COMMENT:
Steps to run your React chat UI.

1. Navigate to frontend folder
cd cricket-ui

2. Install dependencies
npm install
npm install axios

3. Start React app
npm run dev


Frontend runs at:

http://localhost:5173

🔗 API Endpoint (Backend → Frontend)

COMMENT:
Your React frontend sends queries to this endpoint.

POST /chat

Request Example:

{
  "message": "How many runs has Virat Kohli scored against Australia?"
}


Response Example:

{
  "answer": "Virat Kohli has scored 2003 runs against Australia."
}







✅ Kohli Runs vs Teams

How many runs has Virat Kohli scored against Australia?

Kohli runs vs England?

How many runs did Kohli score against Pakistan?

Kohli runs against South Africa?

Total runs of Kohli vs Sri Lanka?

✅ Kohli Century + Highest Score

How many centuries has Virat Kohli scored?

What is Virat Kohli’s highest score?

✅ Kohli Runs at Venue

How many runs has Kohli scored at Wankhede Stadium?

Kohli runs at Eden Gardens?

Kohli runs at M. Chinnaswamy Stadium?

✅ Kohli Runs in a Year

How many runs did Virat Kohli score in 2016?

Kohli runs in 2018?

✅ World Cup Winners

Who won the 2011 Cricket World Cup?

Who won the 2003 Cricket World Cup?

Who won the 2019 World Cup?

✅ T20 World Cup Winners

Who won the 2007 T20 World Cup?

Who won the 2022 T20 World Cup?

✅ Champions Trophy Winners

Who won the 2013 Champions Trophy?

✅ Stadium Locations

Where is Eden Gardens located?

Where is the Melbourne Cricket Ground?