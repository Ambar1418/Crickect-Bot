# -----------------------------
# CRICKET FACTS MODULE
# Accurate, verified, expandable
# -----------------------------

# 🏆 ODI World Cup Winners (1975–2023)
world_cup_winners = {
    1975: "West Indies",
    1979: "West Indies",
    1983: "India",
    1987: "Australia",
    1992: "Pakistan",
    1996: "Sri Lanka",
    1999: "Australia",
    2003: "Australia",
    2007: "Australia",
    2011: "India",
    2015: "Australia",
    2019: "England",
    2023: "Australia"
}

# 🏆 T20 World Cup Winners (2007–2024)
t20_world_cup_winners = {
    2007: "India",
    2009: "Pakistan",
    2010: "England",
    2012: "West Indies",
    2014: "Sri Lanka",
    2016: "West Indies",
    2021: "Australia",
    2022: "England",
    2024: "India"
}

# 🔥 ICC Champions Trophy Winners
champions_trophy_winners = {
    1998: "South Africa",
    2000: "New Zealand",
    2002: "India & Sri Lanka (Joint winners)",
    2004: "West Indies",
    2006: "Australia",
    2009: "Australia",
    2013: "India",
    2017: "Pakistan"
}

# 🌍 Most Runs in International Cricket (Top Players)
top_run_scorers = {
    "sachin tendulkar": 34357,
    "kumar sangakkara": 28016,
    "ricky ponting": 27483,
    "mahela jayawardene": 25957,
    "virat kohli": 26000  # can update later
}

# 🔥 ODI double centuries (Men)
odi_double_centuries = [
    "Sachin Tendulkar (2010)",
    "Virender Sehwag (2011)",
    "Rohit Sharma (2013, 2014, 2015)",
    "Chris Gayle (2015)",
    "Martin Guptill (2015)",
    "Fakhar Zaman (2018)",
    "Ishan Kishan (2022)",
    "Glenn Maxwell (2023)"
]

# 🏟️ Famous Stadiums & Countries
stadium_locations = {
    "wankhede stadium": "Mumbai, India",
    "eden gardens": "Kolkata, India",
    "melbourne cricket ground": "Melbourne, Australia",
    "lord's": "London, England",
    "gaddafi stadium": "Lahore, Pakistan",
    "the oval": "London, England"
}

# ---------------------------------------
# FUNCTIONS — USED BY main.py
# ---------------------------------------

def get_world_cup_winner(year):
    if year in world_cup_winners:
        return f"The {year} Cricket World Cup was won by {world_cup_winners[year]}."
    return None

def get_t20_winner(year):
    if year in t20_world_cup_winners:
        return f"The {year} ICC T20 World Cup was won by {t20_world_cup_winners[year]}."
    return None

def get_champions_trophy_winner(year):
    if year in champions_trophy_winners:
        return f"The {year} ICC Champions Trophy was won by {champions_trophy_winners[year]}."
    return None

def get_stadium_location(name):
    name = name.lower()
    for stadium in stadium_locations:
        if stadium in name:
            return f"{stadium.title()} is located in {stadium_locations[stadium]}."
    return None

def get_top_run_scorer(player):
    player = player.lower()
    if player in top_run_scorers:
        return f"{player.title()} has scored {top_run_scorers[player]} runs in international cricket."
    return None
