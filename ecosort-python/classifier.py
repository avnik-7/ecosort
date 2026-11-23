def classify_waste(item):
    item = item.lower().strip()

    rules = {
        "Wet": {
            "items": ["banana peel", "vegetable scraps", "food waste", "fruit waste", "tea leaves", "eggshell"],
            "bin": "Green bin",
            "instruction": "Compost it. Keep food waste separate from dry materials."
        },
        "Dry": {
            "items": ["paper", "cardboard", "plastic bottle", "glass bottle", "newspaper", "metal can"],
            "bin": "Blue bin",
            "instruction": "Keep it clean and dry. Send recyclable materials for recycling."
        },
        "E-Waste": {
            "items": ["mobile phone", "battery", "charger", "laptop", "keyboard", "cable"],
            "bin": "E-waste collection point",
            "instruction": "Do not put electronic waste in regular bins. Use an authorised collection centre."
        },
        "Hazardous": {
            "items": ["paint", "chemical", "medicine", "pesticide", "disinfectant", "used syringe"],
            "bin": "Hazardous waste collection",
            "instruction": "Keep it sealed and separate. Follow authorised hazardous waste disposal guidance."
        }
    }

    for category, data in rules.items():
        if any(word in item for word in data["items"]):
            return {
                "item": item.title(),
                "category": category,
                "bin": data["bin"],
                "instruction": data["instruction"]
            }

    return {
        "item": item.title(),
        "category": "Unknown",
        "bin": "Check local collection guidance",
        "instruction": "We don't have a verified disposal match for this item yet. Please check with your local waste authority."
    }
