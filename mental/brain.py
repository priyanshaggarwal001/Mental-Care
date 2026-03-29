import ollama
import chromadb
from chromadb.utils import embedding_functions

# 1. Setup Local Database Storage
# This saves everything to the /db folder on your Mac
client = chromadb.PersistentClient(path="./db")
default_ef = embedding_functions.DefaultEmbeddingFunction()

# 2. Collection A: Clinical Knowledge (from your PDFs)
clinical_coll = client.get_or_create_collection(
    name="clinical_knowledge", 
    embedding_function=default_ef
)

# 3. Collection B: Long-Term User Memory (History)
user_mem_coll = client.get_or_create_collection(
    name="user_history", 
    embedding_function=default_ef
)

def get_clinical_context(query):
    """Searches your PDFs for medical/therapeutic facts."""
    results = clinical_coll.query(query_texts=[query], n_results=2)
    return " ".join(results['documents'][0]) if results['documents'] else ""

def get_long_term_memory(query):
    """Searches past conversations to remember the user's life."""
    results = user_mem_coll.query(query_texts=[query], n_results=3)
    if results['documents'] and len(results['documents'][0]) > 0:
        return "\n".join(results['documents'][0])
    return "No previous relevant memories."

def save_user_memory(user_msg, bot_msg):
    """Saves this specific conversation turn forever."""
    combined = f"User: {user_msg} | Assistant: {bot_msg}"
    mem_id = f"mem_{user_mem_coll.count() + 1}"
    user_mem_coll.add(documents=[combined], ids=[mem_id])

def generate_response(user_input, augmented_prompt):
    """Sends the final 'Super Prompt' to Ollama."""
    system_instructions = """
    You are a supportive Mental Health Coach. 
    1. Use 'Clinical Context' for facts/exercises.
    2. Use 'Past Memories' to show you remember the user's life.
    3. Be empathetic, concise, and never give medical prescriptions.
    """
    
    response = ollama.chat(model='llama3.2', messages=[
        {'role': 'system', 'content': system_instructions},
        {'role': 'user', 'content': augmented_prompt}
    ])
    return response['message']['content']

def clear_long_term_db():
    """Wipes the user history if they want a fresh start."""
    client.delete_collection(name="user_history")
    # Re-create it empty
    client.get_or_create_collection(name="user_history", embedding_function=default_ef)