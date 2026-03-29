import re

def check_safety(user_text):
    """
    Scans user input for high-risk crisis keywords using 
    Regex to catch variations in spelling and tense.
    """
    
    # 1. Define Patterns (Regex)
    # \b means "word boundary" so it doesn't trigger on words like "skill"
    crisis_patterns = [
        r"\b(suicide|suicidal)\b",
        r"\bkill\s+myself\b",
        r"\bhurt\s+myself\b",
        r"\bend\s+my\s+life\b",
        r"\bend\s+it\s+all\b",
        r"\bself\s*harm\b",
        r"\bdie\b"
    ]
    
    user_text_clean = user_text.lower()

    # 2. Check for matches
    for pattern in crisis_patterns:
        if re.search(pattern, user_text_clean):
            return {
                "safe": False, 
                "message": (
                    "It sounds like you're going through a very difficult time. "
                    "I am an AI, not a crisis counselor. Please reach out for help: "
                    "\n\n📞 **National Suicide Prevention Lifeline:** 988"
                    "\n💬 **Crisis Text Line:** Text HOME to 741741"
                    "\n🌎 **International Resources:** findahelpline.com"
                )
            }

    # 3. If no red flags found
    return {"safe": True}