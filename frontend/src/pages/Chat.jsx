import React, { useRef, useState, useEffect } from "react";

export default function Chat() {
  const [msgs, setMsgs] = useState([
    { role: "bot", text: "Hi! I'm here for you. What's on your mind?" },
  ]);
  const [txt, setTxt] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const boxRef = useRef(null);
  const isMounted = useRef(true);

  // Scroll to bottom when messages update
  useEffect(() => {
    boxRef.current?.scrollTo(0, boxRef.current.scrollHeight);
  }, [msgs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  async function send() {
    const t = txt.trim();
    if (!t || loading) return;

    setLoading(true);
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setTxt("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      console.log("➡️ Sending message to backend:", t);
      
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Backend response:", data);
      console.log("✅ Reply type:", typeof data?.reply);
      console.log("✅ Reply content:", data?.reply);

      // ✅ Safely extract reply
      let botReply = data?.reply;
      
      if (typeof botReply !== "string") {
        console.warn("⚠️ Unexpected reply format:", botReply);
        botReply = JSON.stringify(botReply, null, 2);
      }

      // ✅ Clean up any escaped newlines that might come from backend
      botReply = botReply.replace(/\\n/g, '\n');

      if (!isMounted.current) return;
      
      setMsgs((m) => [...m, { role: "bot", text: botReply.trim() }]);
      console.log("✅ Message added to state");
      
    } catch (err) {
      console.error("❌ Backend or network error:", err);

      if (err.name === 'AbortError') {
        showToast("⏱ Request timed out. Please try again.");
      } else {
        showToast("⚠️ Server not reachable. Using fallback mode.");

        const low = t.toLowerCase();
        let reply = "Tell me a bit more about what's hardest right now.";
        if (low.includes("sleep"))
          reply = "Try a 30-min wind-down — no screens, cool/dim room, and a fixed wake time.";
        if (low.includes("panic") || low.includes("anx"))
          reply = "Try grounding: 5 things you see, 4 you feel, 3 you hear. Exhale longer than inhale.";
        if (low.includes("study") || low.includes("focus"))
          reply = "Pomodoro method helps: 25 min work + 5 min break ×4, then a 20-min rest.";

        if (isMounted.current) {
          setTimeout(
            () => setMsgs((m) => [...m, { role: "bot", text: reply }]),
            400
          );
        }
      }
    } finally {
      clearTimeout(timeout);
      if (isMounted.current) setLoading(false);
    }
  }

  // Simple markdown parser for basic formatting
  const parseMarkdown = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Bold text **text**
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic text *text*
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        return <div key={i} dangerouslySetInnerHTML={{ __html: line || '<br/>' }} />;
      });
  };

  return (
    <section style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 12 }}>Chatbot</h2>

        {/* 💬 Chat Display */}
        <div
          ref={boxRef}
          style={{
            height: 400,
            overflowY: "auto",
            background: "#f9fafb",
            padding: "10px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
          }}
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                maxWidth: "80%",
                margin: "8px 0",
                padding: "10px 12px",
                borderRadius: 12,
                background: m.role === "bot" ? "#eef2ff" : "#fff",
                border: "1px solid #e5e7eb",
                marginLeft: m.role === "user" ? "auto" : 0,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                whiteSpace: "pre-line",
                wordBreak: "break-word",
              }}
            >
              {m.role === "bot" ? parseMarkdown(String(m.text || "")) : <div>{m.text}</div>}
            </div>
          ))}

          {/* 🕐 Bot typing indicator */}
          {loading && (
            <div
              style={{
                maxWidth: "80%",
                margin: "8px 0",
                padding: "10px 12px",
                borderRadius: 12,
                background: "#eef2ff",
                border: "1px solid #e5e7eb",
                width: "fit-content",
                fontStyle: "italic",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                🤖 Typing
                <span style={{ animation: "blink 1.2s infinite" }}>.</span>
                <span style={{ animation: "blink 1.2s infinite 0.2s" }}>.</span>
                <span style={{ animation: "blink 1.2s infinite 0.4s" }}>.</span>
              </span>
            </div>
          )}
        </div>

        {/* ✏️ Input Box */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
            placeholder={loading ? "Please wait..." : "Type a message..."}
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: 15,
              backgroundColor: loading ? "#f3f4f6" : "white",
            }}
          />
          <button
            onClick={send}
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500,
              transition: "0.2s",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes blink {
            0%, 20%, 50%, 80%, 100% { opacity: 1; }
            40%, 60% { opacity: 0.3; }
          }
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </section>
  );
}