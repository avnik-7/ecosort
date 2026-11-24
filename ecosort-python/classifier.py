import re

RULES = {
    "Wet": {
        "items": {
            "banana peel": ["banana skin"],
            "vegetable scraps": ["vegetable waste", "veggie scraps"],
            "food waste": ["leftover food", "cooked food waste", "food scraps"],
            "fruit waste": ["fruit scraps", "rotten fruit"],
            "tea leaves": ["used tea leaves", "tea waste"],
            "eggshell": ["egg shells"],
            "flowers": ["withered flowers", "puja flowers"],
            "coconut shell": ["coconut husk", "coconut waste"],
            "grass": ["lawn grass", "grass clippings"],
            "dry leaves": ["fallen leaves", "dead leaves"],
            "garden waste": ["plant waste", "plant trimmings"],
        },
        "bin": "Green bin",
        "instruction": "Keep biodegradable waste separate. Compost where possible."
    },

    "Dry": {
        "items": {
            "paper": ["waste paper", "scrap paper"],
            "cardboard": ["carton", "cardboard box"],
            "plastic bottle": ["pet bottle", "water bottle"],
            "glass bottle": ["glass jar", "broken glass bottle"],
            "newspaper": ["old newspaper"],
            "metal can": ["tin can", "aluminium can"],
            "plastic packaging": ["plastic wrapper", "plastic packet"],
            "plastic container": ["plastic box"],
            "metal scrap": ["iron scrap", "steel scrap"],
            "clean cloth": ["old clothes", "fabric scraps"],
        },
        "bin": "Blue bin",
        "instruction": "Keep dry recyclables clean and dry. Separate contaminated materials."
    },

    "E-Waste": {
        "items": {
            "mobile phone": ["cell phone", "smartphone", "old phone"],
            "mobile screen": ["broken mobile screen", "phone screen", "cracked phone screen", "lcd screen", "touchscreen", "mobilescreen"],
            "battery": ["used battery", "dead battery", "phone battery"],
            "charger": ["phone charger", "mobile charger"],
            "laptop": ["old laptop", "broken laptop"],
            "keyboard": ["computer keyboard"],
            "mouse": ["computer mouse"],
            "cable": ["charging cable", "usb cable", "wire"],
            "earphones": ["earbuds", "headphones"],
            "power bank": ["portable charger"],
            "computer monitor": ["desktop monitor", "computer screen"],
            "circuit board": ["motherboard", "pcb"],
            "remote control": ["tv remote"],
            "calculator": ["electronic calculator"],
        },
        "bin": "E-waste collection point",
        "instruction": "Do not put electronic waste in regular bins. Use an authorised e-waste collection centre."
    },

    "Hazardous": {
        "items": {
            "paint": ["paint container", "paint waste"],
            "chemical": ["industrial chemical", "chemical waste"],
            "medicine": ["expired medicine", "expired tablets", "old medicines"],
            "pesticide": ["pesticide container", "insecticide"],
            "disinfectant": ["cleaning chemical"],
            "used syringe": ["medical syringe", "needle", "used needle"],
            "bleach": ["bleach container"],
            "motor oil": ["used engine oil", "waste oil"],
            "solvent": ["paint thinner", "thinner"],
            "fluorescent tube": ["tube light", "cfl bulb"],
        },
        "bin": "Authorised hazardous waste collection",
        "instruction": "Keep hazardous waste sealed and separate. Follow authorised disposal guidance."
    }
}


def normalize(text):
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text)


def classify_waste(item):
    cleaned = normalize(item)

    if cleaned in {"soil", "garden soil", "potting soil", "topsoil"}:
        return {
            "item": item.strip().title(),
            "category": "Special Handling",
            "bin": "Reuse / Garden Soil",
            "instruction": "Clean soil may be reused for gardening or landscaping. Do not mix contaminated soil with regular waste. Seek local authority guidance for contaminated soil."
        }

    if not cleaned:
        return {
            "item": "Empty input",
            "category": "Unknown",
            "bin": "No result",
            "instruction": "Please enter a waste item."
        }

    for category, data in RULES.items():
        for name, aliases in data["items"].items():
            terms = [name] + aliases

            for term in terms:
                if re.search(r"\b" + re.escape(normalize(term)) + r"\b", cleaned):
                    return {
                        "item": name.title(),
                        "category": category,
                        "bin": data["bin"],
                        "instruction": data["instruction"]
                    }

    return {
        "item": item.strip().title(),
        "category": "Unknown",
        "bin": "Check local collection guidance",
        "instruction": "We do not have a verified disposal match for this item yet. Please check with your local waste authority."
    }
