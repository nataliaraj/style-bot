import { useState, useRef, useEffect } from "react";

// Point this at your backend. In development it's localhost;
// once deployed, swap it for your Render/Railway backend URL.
//const BACKEND_URL = "http://localhost:3001/chat";
const BACKEND_URL = "https://style-bot-backend.onrender.com/chat";

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi! I'm your style assistant. Ask me about sizes, colors, or what might work for an outfit you're planning.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Gemini's "contents" format expects role: "user" | "model"
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, something went wrong reaching the assistant. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Style Assistant</div>

      <div style={styles.messageList}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              ...(m.role === "user" ? styles.userBubble : styles.botBubble),
            }}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.bubble, ...styles.botBubble }}>Typing…</div>
        )}
        <div ref={scrollRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about an item, size, or style..."
        />
        <button style={styles.sendButton} onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "360px",
    height: "500px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    overflow: "hidden",
    fontFamily: "system-ui, sans-serif",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  },
  header: {
    background: "#111",
    color: "#fff",
    padding: "12px 16px",
    fontWeight: 600,
  },
  messageList: {
    flex: 1,
    padding: "12px",
    overflowY: "auto",
    background: "#fafafa",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  bubble: {
    padding: "8px 12px",
    borderRadius: "14px",
    maxWidth: "80%",
    fontSize: "14px",
    lineHeight: 1.4,
  },
  userBubble: {
    background: "#111",
    color: "#fff",
    alignSelf: "flex-end",
  },
  botBubble: {
    background: "#eee",
    color: "#111",
    alignSelf: "flex-start",
  },
  inputRow: {
    display: "flex",
    borderTop: "1px solid #ddd",
    padding: "8px",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
  },
  sendButton: {
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "14px",
  },
};
