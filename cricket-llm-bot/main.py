from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
import pandas as pd

# Load env variables
load_dotenv()

# Load Kohli dataset
vk_data = pd.read_csv("vkdata.csv")

# ---------- CLEAN THE CSV DATA ----------
vk_data["Against"] = (
    vk_data["Against"]
    .astype(str)
    .str.replace("\xa0", " ", regex=False)
    .str.strip()
    .str.lower()
)

vk_data["Venue"] = (
    vk_data["Venue"]
    .astype(str)
    .str.replace("\xa0", " ", regex=False)
    .str.strip()
    .str.lower()
)

vk_data["Date"] = vk_data["Date"].astype(str).str.strip()
vk_data["Runs"] = vk_data["Runs"].astype(str).str.strip()

# Load cricket facts module
from cricket_facts import (
    get_world_cup_winner,
    get_t20_winner,
    get_champions_trophy_winner,
    get_stadium_location,
    get_top_run_scorer
)

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ChatRequest(BaseModel):
    message: str


# -------------------------
#  KOHLI DATASET FUNCTIONS
# -------------------------

def kohli_runs_against(team):
    team = team.lower().strip().strip("?.,! ")

    df = vk_data[vk_data["Against"] == team]
    if df.empty:
        return None

    runs_col = (
        df["Runs"]
        .astype(str)
        .str.extract(r"(\d+)")
        [0]
        .astype(float)
    )

    total = int(runs_col.sum())
    return f"Virat Kohli has scored {total} runs against {team.title()}."


def kohli_highest_score():
    numeric_runs = vk_data["Runs"].str.extract(r"(\d+)").astype(float)
    max_score = int(numeric_runs.max()[0])
    return f"Virat Kohli's highest score is {max_score}."


def kohli_centuries():
    numeric_runs = vk_data["Runs"].str.extract(r"(\d+)").astype(float)
    centuries = (numeric_runs >= 100).sum()[0]
    return f"Virat Kohli has scored {centuries} centuries in this dataset."


def kohli_runs_at_venue(venue):
    import re
    venue = re.sub(r"[^a-zA-Z0-9\s]", "", venue.lower()).strip()

    df = vk_data[vk_data["Venue"].str.contains(venue, case=False)]
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


# ---------------------------------
#         MAIN CHAT ENDPOINT
# ---------------------------------

@app.post("/chat")
async def chat(req: ChatRequest):
    user_msg = req.message.lower().strip()

    try:
        # -----------------------------------------
        # 1. Prevent NON-cricket questions
        # -----------------------------------------
        non_cricket_keywords = ["python", "java", "movie", "weather", "code", "program"]
        if any(word in user_msg for word in non_cricket_keywords):
            return {"answer": "I can only answer cricket-related questions."}

        # -----------------------------------------
        # 2. Check rule-based cricket facts
        # -----------------------------------------

        # ODI World Cup
        for year in range(1975, 2030):
            if str(year) in user_msg and "world cup" in user_msg:
                wc = get_world_cup_winner(year)
                if wc:
                    return {"answer": wc}

        # T20 World Cup
        for year in range(2007, 2030):
            if str(year) in user_msg and "t20" in user_msg:
                t20 = get_t20_winner(year)
                if t20:
                    return {"answer": t20}

        # Champions Trophy
        for year in range(1998, 2030):
            if str(year) in user_msg and "champions trophy" in user_msg:
                ct = get_champions_trophy_winner(year)
                if ct:
                    return {"answer": ct}

        # Stadium location
        stadium = get_stadium_location(user_msg)
        if stadium:
            return {"answer": stadium}

        # Runs by player
        for p in ["sachin", "ponting", "kumar", "mahela", "kohli"]:
            if p in user_msg and "runs" in user_msg:
                runs = get_top_run_scorer(p)
                if runs:
                    return {"answer": runs}

        # -----------------------------------------
        # 3. Kohli dataset query detection
        # -----------------------------------------

        teams = [
            "australia", "england", "pakistan", "south africa", "new zealand",
            "sri lanka", "bangladesh", "west indies", "zimbabwe", "afghanistan"
        ]

        # Kohli runs vs team
        if "kohli" in user_msg and ("run" in user_msg or "score" in user_msg):
            for t in teams:
                if t in user_msg:
                    result = kohli_runs_against(t)
                    if result:
                        return {"answer": result}

        # Highest score
        if "kohli" in user_msg and "highest" in user_msg:
            return {"answer": kohli_highest_score()}

        # Centuries
        if "century" in user_msg or "centuries" in user_msg:
            return {"answer": kohli_centuries()}

        # Venue
        if "kohli" in user_msg and "at" in user_msg:
            venue = user_msg.split("at")[-1].strip()
            result = kohli_runs_at_venue(venue)
            if result:
                return {"answer": result}
            
        

        # Year
        if "kohli" in user_msg:
            for y in range(2000, 2030):
                if str(y) in user_msg:
                    ans = kohli_runs_in_year(y)
                    if ans:
                        return {"answer": ans}
                    

        # -----------------------------------------
        # 4. FALLBACK → Groq LLM
        # -----------------------------------------

        system_prompt = """
        You are CricketBot, a strict cricket-only expert.
        If you are unsure, reply: "I am not sure about this cricket fact."
        """

        # BIOGRAPHY QUESTIONS (Kohli, Sachin, Dhoni, etc.)
        # -----------------------------------------

        if ("who is virat" in user_msg) or ("who is kohli" in user_msg):
            response = client.chat.completions.create(
                model="llama-3.3-8b-instant",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a cricket expert. Explain cricket players' biographies accurately and clearly."
                    },
                    {"role": "user", "content": req.message}
                ]
            )
            return {"answer": response.choices[0].message.content}


    except Exception as e:
        print("🔥 ERROR:", e)
        return {"answer": f"Server Error: {e}"}

