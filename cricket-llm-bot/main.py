from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
import pandas as pd

# ---------------------------
#  ENVIRONMENT + API SETUP
# ---------------------------
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---------------------------
#  LOAD ALL CSV FILES
# ---------------------------
"""
This block automatically loads EVERY .csv file inside your project folder.
You don't need to manually load each file.

All files are stored in:  csv_data = { "filename.csv": dataframe }
"""

csv_data = {}

for file in os.listdir():
    if file.endswith(".csv"):
        try:
            df = pd.read_csv(file)
            csv_data[file] = df
            print(f"Loaded: {file}  ({df.shape[0]} rows)")
        except Exception as e:
            print(f"❌ Error loading {file}:", e)

# ---------------------------
#  LOAD KOHLI DATA EXPLICITLY
# ---------------------------
vk_data = pd.read_csv("vkdata.csv")

# Clean Kohli dataset
vk_data["Against"] = vk_data["Against"].astype(str).str.replace("\xa0"," ").str.strip().str.lower()
vk_data["Venue"] = vk_data["Venue"].astype(str).str.replace("\xa0"," ").str.strip().str.lower()
vk_data["Date"] = vk_data["Date"].astype(str)
vk_data["Runs"] = vk_data["Runs"].astype(str)

# ---------------------------
#  IMPORT CRICKET FACT FUNCTIONS
# ---------------------------
from cricket_facts import (
    get_world_cup_winner,
    get_t20_winner,
    get_champions_trophy_winner,
    get_stadium_location,
    get_top_run_scorer,
)

# ---------------------------
#  FASTAPI SETUP
# ---------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str


# ======================================================
#                UNIVERSAL CSV SEARCH ENGINE
# ======================================================
"""
This function searches ALL CSV files for any keyword.
Useful for:
- player stats
- bowling stats
- batting records
- match info
- ball-by-ball data
- team info

If ANY CSV contains the keyword, it returns the matched rows.
"""

def search_in_all_csvs(query):
    query = str(query).lower()
    results = []

    for filename, df in csv_data.items():
        for col in df.columns:
            try:
                matches = df[df[col].astype(str).str.contains(query, case=False, na=False)]
                if not matches.empty:
                    results.append((filename, matches.head(5)))
            except:
                pass

    return results



# ======================================================
#                KOHLI CUSTOM FUNCTIONS
# ======================================================

def kohli_runs_against(team):
    team = team.lower().strip()

    df = vk_data[vk_data["Against"] == team]
    if df.empty:
        return None

    runs = df["Runs"].str.extract(r"(\d+)")[0].astype(float)
    total = int(runs.sum())
    return f"Virat Kohli has scored {total} runs against {team.title()}."


def kohli_highest_score():
    numeric = vk_data["Runs"].str.extract(r"(\d+)").astype(float)
    max_score = int(numeric.max()[0])
    return f"Virat Kohli's highest score is {max_score}."


def kohli_centuries():
    numeric = vk_data["Runs"].str.extract(r"(\d+)").astype(float)
    count = (numeric >= 100).sum()[0]
    return f"Virat Kohli has scored {count} centuries in this dataset."


def kohli_runs_at_venue(venue):
    venue = venue.lower().strip()
    df = vk_data[vk_data["Venue"].str.contains(venue)]

    if df.empty:
        return None
    
    total = int(df["Runs"].str.extract(r"(\d+)")[0].astype(float).sum())
    return f"Virat Kohli has scored {total} runs at {venue.title()}."


def kohli_runs_in_year(year):
    df = vk_data[vk_data["Date"].str.contains(str(year))]
    if df.empty:
        return None

    total = int(df["Runs"].str.extract(r"(\d+)")[0].astype(float).sum())
    return f"Virat Kohli scored {total} runs in {year}."



# ======================================================
#                    MAIN CHAT LOGIC
# ======================================================

@app.post("/chat")
async def chat(req: ChatRequest):
    user_msg = req.message.lower().strip()

    # ------------------------------------------
    # 0. Reject non-cricket questions
    # ------------------------------------------

    banned = ["python", "java", "movie", "weather", "code", "program"]
    if any(b in user_msg for b in banned):
        return {"answer": "This chatbot is not trained for that. Please ask something related to cricket."}


    # ------------------------------------------
    # 1. Cricket facts (World Cup, T20, CT etc.)
    # ------------------------------------------
    for year in range(1975, 2030):
        if str(year) in user_msg and "world cup" in user_msg:
            ans = get_world_cup_winner(year)
            if ans:
                return {"answer": ans}

    for year in range(2007, 2030):
        if str(year) in user_msg and "t20" in user_msg:
            ans = get_t20_winner(year)
            if ans:
                return {"answer": ans}

    for year in range(1998, 2030):
        if str(year) in user_msg and "champions trophy" in user_msg:
            ans = get_champions_trophy_winner(year)
            if ans:
                return {"answer": ans}

    stadium = get_stadium_location(user_msg)
    if stadium:
        return {"answer": stadium}


    # ------------------------------------------
    # 2. Kohli dataset detection
    # ------------------------------------------
    teams = ["australia","england","pakistan","south africa","new zealand",
             "sri lanka","bangladesh","west indies","zimbabwe","afghanistan"]

    if "kohli" in user_msg and ("run" in user_msg or "score" in user_msg):
        for t in teams:
            if t in user_msg:
                result = kohli_runs_against(t)
                if result:
                    return {"answer": result}

    if "kohli" in user_msg and "highest" in user_msg:
        return {"answer": kohli_highest_score()}

    if "century" in user_msg or "centuries" in user_msg:
        return {"answer": kohli_centuries()}

    if "kohli" in user_msg and "at" in user_msg:
        venue = user_msg.split("at")[-1].strip()
        result = kohli_runs_at_venue(venue)
        if result:
            return {"answer": result}

    for year in range(2000, 2030):
        if str(year) in user_msg and "kohli" in user_msg:
            ans = kohli_runs_in_year(year)
            if ans:
                return {"answer": ans}



    # ------------------------------------------
    # 3. UNIVERSAL CSV SEARCH BEFORE LLM
    # ------------------------------------------
    matches = search_in_all_csvs(user_msg)

    if matches:
        final = ""
        for filename, df in matches:
            final += f"\n📄 From **{filename}**:\n{df.to_string(index=False)}\n\n"
        return {"answer": final}



    # ------------------------------------------
    # 4. FALLBACK LLM (Cricket-only prompt)
    # ------------------------------------------
    SYSTEM_PROMPT = """
You are VK Bot, an intelligent and friendly cricket assistant.

Instructions:
- Primarily answer cricket-related questions.
- If a question is partially related to cricket, try to answer it using your best judgment.
- If the question is unclear, ask a short clarifying question instead of refusing.
- Never refuse the same query repeatedly.
- If unsure, provide the closest relevant cricket information.
- Be confident, helpful, and concise in your replies.
"""


    response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": req.message}
    ]
    )


    return {"answer": response.choices[0].message.content}
