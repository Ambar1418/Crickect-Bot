from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import AsyncGroq
import os
import asyncio
import json
from dotenv import load_dotenv
import pandas as pd
from cricket_facts import (
    get_world_cup_winner,
    get_t20_winner,
    get_champions_trophy_winner,
    get_stadium_location,
    get_top_run_scorer,
)

# ---------------------------
#  ENVIRONMENT + API SETUP
# ---------------------------
load_dotenv()
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# ---------------------------
#  LOAD ALL CSV FILES
# ---------------------------
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
try:
    vk_data = pd.read_csv("vkdata.csv")
    vk_data["Against"] = vk_data["Against"].astype(str).str.replace("\xa0"," ").str.strip().str.lower()
    vk_data["Venue"] = vk_data["Venue"].astype(str).str.replace("\xa0"," ").str.strip().str.lower()
    vk_data["Date"] = vk_data["Date"].astype(str)
    vk_data["Runs"] = vk_data["Runs"].astype(str)
except Exception as e:
    print(f"⚠️ Warning: Could not load vkdata.csv: {e}")
    vk_data = pd.DataFrame()

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
def search_in_all_csvs(query):
    query = str(query).lower()
    results = []

    for filename, df in csv_data.items():
        for col in df.columns:
            try:
                matches = df[df[col].astype(str).str.contains(query, case=False, na=False)]
                if not matches.empty:
                    results.append((filename, matches.head(3))) # Reduced to 3 for brevity
            except:
                pass

    return results

# ======================================================
#                KOHLI CUSTOM FUNCTIONS
# ======================================================
def kohli_runs_against(team):
    if vk_data.empty: return None
    team = team.lower().strip()
    df = vk_data[vk_data["Against"] == team]
    if df.empty: return None
    runs = df["Runs"].str.extract(r"(\d+)")[0].astype(float)
    total = int(runs.sum())
    return f"Virat Kohli has scored {total} runs against {team.title()}."

def kohli_highest_score():
    if vk_data.empty: return None
    numeric = vk_data["Runs"].str.extract(r"(\d+)").astype(float)
    max_score = int(numeric.max()[0])
    return f"Virat Kohli's highest score is {max_score}."

def kohli_centuries():
    if vk_data.empty: return None
    numeric = vk_data["Runs"].str.extract(r"(\d+)").astype(float)
    count = (numeric >= 100).sum()[0]
    return f"Virat Kohli has scored {count} centuries in this dataset."

# ======================================================
#                    STREAMING GENERATOR
# ======================================================

async def generate_response(user_msg: str):
    user_msg_lower = user_msg.lower().strip()

    # 1. Banned topic check
    banned = ["python", "java", "movie", "weather", "code", "program"]
    if any(b in user_msg_lower for b in banned):
        yield "This chatbot is specialized in cricket. Please ask something related to the game! 🏏"
        return

    # 2. Hardcoded Fact Checks
    # (Simplified for the generator)
    fact_response = None
    
    # World Cup winners
    for year in range(1975, 2030):
        if str(year) in user_msg_lower and "world cup" in user_msg_lower:
            fact_response = get_world_cup_winner(year)
            break
    
    # T20 winners
    if not fact_response:
        for year in range(2007, 2030):
            if str(year) in user_msg_lower and "t20" in user_msg_lower:
                fact_response = get_t20_winner(year)
                break

    # Stadiums
    if not fact_response:
        fact_response = get_stadium_location(user_msg_lower)

    if fact_response:
        yield fact_response
        return

    # 3. CSV Data Search
    matches = search_in_all_csvs(user_msg_lower)
    csv_context = ""
    if matches:
        csv_context = "Here is some data from our records:\n"
        for filename, df in matches:
            csv_context += f"\n📄 File: {filename}\n{df.to_string(index=False)}\n"

    # 4. Fallback LLM with Streaming
    SYSTEM_PROMPT = """
You are VK Bot, an intelligent cricket assistant.
- Answer cricket-related questions using the provided context if available.
- Be concise, professional, and helpful.
- If the context contains data, summarize it for the user.
- If asked about non-cricket topics, politely redirect to cricket.
"""
    
    prompt = user_msg
    if csv_context:
        prompt = f"Context:\n{csv_context}\n\nUser Question: {user_msg}"

    try:
        stream = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            stream=True,
        )

        async for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content
    except Exception as e:
        yield f"⚠️ Error connecting to the cricket engine: {str(e)}"

# ======================================================
#                    MAIN CHAT LOGIC
# ======================================================

@app.post("/chat")
async def chat(req: ChatRequest):
    return StreamingResponse(generate_response(req.message), media_type="text/plain")
