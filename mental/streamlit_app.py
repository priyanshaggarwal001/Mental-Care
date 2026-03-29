import streamlit as st
from safety import check_safety
from brain import (
    get_clinical_context, 
    get_long_term_memory, 
    generate_response, 
    save_user_memory,
    clear_long_term_db
)

# --- UI CONFIGURATION ---
st.set_page_config(page_title="Wellness AI", page_icon="🌿")

with st.sidebar:
    st.title("Settings")
    if st.button("🗑️ Wipe Long-Term Memory"):
        clear_long_term_db()
        st.session_state.messages = []
        st.success("Memory cleared!")
        st.rerun()
    
    st.write("---")
    st.error("🚨 EMERGENCY: Call 988")
    st.info("I am a wellness coach, not a clinical professional.")

st.title("🌿 Wellness AI Coach")
st.caption("Your private space for growth and reflection.")

# --- SESSION MANAGEMENT ---
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display previous messages in the current session
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# --- CHAT LOGIC ---
if prompt := st.chat_input("What's on your mind?"):
    
    # 1. Show User Message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # 2. Safety Gatekeeper
    safety = check_safety(prompt)
    if not safety["safe"]:
        with st.chat_message("assistant"):
            st.error(safety["message"])
        st.session_state.messages.append({"role": "assistant", "content": safety["message"]})
    
    else:
        # 3. Process with AI
        with st.chat_message("assistant"):
            with st.spinner("Reflecting on our history..."):
                
                # A. Retrieve Clinical Facts (from PDFs)
                clinical = get_clinical_context(prompt)
                
                # B. Retrieve Long-Term Personal Memory (from DB)
                past_life = get_long_term_memory(prompt)
                
                # C. Build the Super Prompt
                super_prompt = f"""
                CLINICAL TOOLS: {clinical}
                PAST MEMORIES OF THIS USER: {past_life}
                
                CURRENT MESSAGE: {prompt}
                """
                
                # D. Get AI Response
                answer = generate_response(prompt, super_prompt)
                st.markdown(answer)
        
        # 4. Save to Current Session & Long-Term Database
        st.session_state.messages.append({"role": "assistant", "content": answer})
        save_user_memory(prompt, answer)