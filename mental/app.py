from safety import is_crisis, CRISIS_MSG
from brain import get_clinical_context, generate_response

def main():
    print("Welcome to your AI Wellness Space. (Type 'quit' to exit)")
    
    while True:
        user_msg = input("\nYou: ")
        if user_msg.lower() == 'quit': break

        # Step 1: Safety Check
        if is_crisis(user_msg):
            print(f"\nBot: {CRISIS_MSG}")
            continue

        # Step 2: Get Knowledge from your PDF
        context = get_clinical_context(user_msg)

        # Step 3: Generate empathetic AI response
        reply = generate_response(user_msg, context)
        print(f"\nBot: {reply}")

if __name__ == "__main__":
    main()