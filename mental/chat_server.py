import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# Ensure brain.py uses the mental/db path by setting cwd to this file's folder.
os.chdir(os.path.dirname(__file__))

from safety import check_safety
from brain import (
    get_clinical_context,
    get_long_term_memory,
    generate_response,
    save_user_memory,
)

HOST = "127.0.0.1"
PORT = 8000


class ChatHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_POST(self):
        if self.path != "/chat":
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode("utf-8"))
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(content_length)
            payload = json.loads(raw.decode("utf-8")) if raw else {}
            user_msg = str(payload.get("message", "")).strip()

            if not user_msg:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Message is required"}).encode("utf-8"))
                return

            safety = check_safety(user_msg)
            if not safety.get("safe", True):
                self._set_headers(200)
                self.wfile.write(json.dumps({"reply": safety.get("message", "")}).encode("utf-8"))
                return

            clinical = get_clinical_context(user_msg)
            memory = get_long_term_memory(user_msg)
            super_prompt = (
                f"CLINICAL TOOLS: {clinical}\n"
                f"PAST MEMORIES OF THIS USER: {memory}\n"
                f"CURRENT MESSAGE: {user_msg}"
            )

            answer = generate_response(user_msg, super_prompt)
            save_user_memory(user_msg, answer)

            self._set_headers(200)
            self.wfile.write(json.dumps({"reply": answer}).encode("utf-8"))

        except Exception as exc:
            self._set_headers(500)
            self.wfile.write(
                json.dumps(
                    {
                        "error": "Chat service failed",
                        "details": str(exc),
                    }
                ).encode("utf-8")
            )


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), ChatHandler)
    print(f"Mental chat server running on http://{HOST}:{PORT}")
    print("POST /chat with JSON: {\"message\": \"...\"}")
    server.serve_forever()
