// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import axios from "axios";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Send,
//   Mic,
//   MicOff,
//   Volume2,
//   VolumeX,
//   Copy,
//   Trash2,
//   AlertTriangle,
//   ClipboardList,
//   Sparkles,
//   RefreshCw,
//   Download,
//   Clock,
//   Shield,
//   HeartHandshake,
//   MessageSquarePlus,
//   Info,
//   Check,
//   X,
//   Loader2,
// } from "lucide-react";

// /**
//  * Chat.jsx — Premium chat experience wired to FastAPI /chat
//  *
//  * Features:
//  * - Two-panel responsive layout (messages + composer/tools)
//  * - Auto-scroll, typing indicator, retries
//  * - Local persistence (localStorage), export JSON
//  * - Quick chips and smart suggestions
//  * - Keyboard UX (Enter send, Shift+Enter newline), focus mgmt
//  * - Crisis banner when risky words detected in user text
//  * - Voice input (Web Speech API, optional) + optional TTS playback
//  * - Copy/clear per message; Clear All; graceful error states
//  *
//  * Backend:
//  *  POST `${import.meta.env.VITE_API_URL}/chat`  ->  { reply: string }
//  *
//  * Env:
//  *  VITE_API_URL=http://127.0.0.1:8000
//  */

// // ---------- Utility ----------
// const RISKY = [
//   "suicide",
//   "kill myself",
//   "end my life",
//   "want to die",
//   "hurt myself",
//   "worthless",
//   "can't go on",
//   "no reason to live",
//   "give up",
//   "end it all",
//   "tired of living",
//   "cut myself",
//   "jump off",
//   "hang myself",
//   "die",
//   "death",
// ];

// const uid = () => Math.random().toString(36).slice(2, 10);
// const LS_KEY = "ss_chat_history_v1";
// const LS_TTS = "ss_chat_tts_on";

// function nowISO() {
//   return new Date().toISOString();
// }

// function riskIn(text = "") {
//   const t = text.toLowerCase();
//   return RISKY.some((k) => t.includes(k));
// }

// function copyToClipboard(text) {
//   try {
//     navigator.clipboard.writeText(text);
//     return true;
//   } catch {
//     return false;
//   }
// }

// function saveToFile(name, data) {
//   const blob = new Blob([data], { type: "application/json" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = name;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// // ---------- Message Bubble ----------
// const Bubble = ({
//   msg,
//   onCopy,
//   onDelete,
//   ttsOn,
//   speak,
//   stopSpeak,
// }) => {
//   const isUser = msg.role === "user";

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0 }}
//       className={`bubble ${isUser ? "user" : "bot"}`}
//       style={{
//         alignSelf: isUser ? "flex-end" : "flex-start",
//         maxWidth: "min(780px, 92%)",
//         background: isUser
//           ? "linear-gradient(135deg,#2563eb,#38bdf8)"
//           : "linear-gradient(180deg,#ffffff,#fff7ed)",
//         color: isUser ? "#fff" : "#0f172a",
//         border: isUser ? "none" : "1px solid #ffe8c6",
//         borderRadius: 16,
//         padding: "10px 12px",
//         boxShadow: isUser ? "0 10px 22px rgba(37,99,235,.25)" : "0 8px 20px rgba(0,0,0,.06)",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           gap: 8,
//           alignItems: "center",
//           marginBottom: 4,
//           opacity: 0.9,
//         }}
//       >
//         {!isUser ? (
//           <>
//             <Shield size={16} color="#f97316" />
//             <span style={{ fontWeight: 800, letterSpacing: 0.3 }}>MindMate</span>
//           </>
//         ) : (
//           <>
//             <MessageSquarePlus size={16} />
//             <span style={{ fontWeight: 800, letterSpacing: 0.3 }}>You</span>
//           </>
//         )}
//         <span style={{ color: isUser ? "rgba(255,255,255,.8)" : "#64748b", fontSize: 12, marginLeft: 6 }}>
//           {new Date(msg.ts).toLocaleTimeString()}
//         </span>
//       </div>

//       <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{msg.text}</div>

//       <div
//         className="bubble-actions"
//         style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, opacity: 0.9 }}
//       >
//         <button
//           className="btn tiny"
//           onClick={() => onCopy(msg)}
//           title="Copy message"
//           style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
//         >
//           <Copy size={14} /> Copy
//         </button>
//         <button
//           className="btn tiny"
//           onClick={() => onDelete(msg)}
//           title="Delete message"
//           style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
//         >
//           <Trash2 size={14} /> Delete
//         </button>

//         {!isUser && (
//           <>
//             {ttsOn ? (
//               <button
//                 className="btn tiny"
//                 onClick={() => stopSpeak()}
//                 title="Stop reading"
//                 style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
//               >
//                 <VolumeX size={14} /> Stop
//               </button>
//             ) : (
//               <button
//                 className="btn tiny"
//                 onClick={() => speak(msg.text)}
//                 title="Read aloud"
//                 style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
//               >
//                 <Volume2 size={14} /> Read
//               </button>
//             )}
//           </>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// // ---------- Typing Indicator ----------
// const Typing = () => (
//   <div
//     style={{
//       display: "inline-flex",
//       alignItems: "center",
//       gap: 8,
//       padding: "8px 12px",
//       background: "#fffaf0",
//       border: "1px solid #ffe8c6",
//       borderRadius: 999,
//       color: "#9a3412",
//       fontWeight: 700,
//     }}
//   >
//     <Loader2 className="spin" size={16} />
//     typing…
//   </div>
// );

// // ---------- Main Component ----------
// export default function Chat() {
//   const [messages, setMessages] = useState(() => {
//     try {
//       const raw = localStorage.getItem(LS_KEY);
//       return raw ? JSON.parse(raw) : [];
//     } catch {
//       return [];
//     }
//   });
//   const [input, setInput] = useState("");
//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState("");
//   const [micOn, setMicOn] = useState(false);
//   const [ttsOn, setTtsOn] = useState(() => localStorage.getItem(LS_TTS) === "1");

//   const scroller = useRef(null);
//   const composerRef = useRef(null);
//   const recogRef = useRef(null);
//   const synthRef = useRef(window.speechSynthesis || null);

//   // Auto-persist
//   useEffect(() => {
//     localStorage.setItem(LS_KEY, JSON.stringify(messages));
//   }, [messages]);

//   // Auto-scroll
//   useEffect(() => {
//     const el = scroller.current;
//     if (!el) return;
//     el.scrollTo({ top: el.scrollHeight + 9999, behavior: "smooth" });
//   }, [messages, busy]);

//   // Greeting on empty
//   useEffect(() => {
//     if (messages.length === 0) {
//       setMessages([
//         {
//           id: uid(),
//           role: "bot",
//           text:
//             "Hi! I’m your MindMate. I can help with breathing, sleep, exam stress, routines, or just listening. " +
//             "If it’s urgent or you feel unsafe, call local emergency services.",
//           ts: nowISO(),
//         },
//       ]);
//     }
//   }, []);

//   // TTS toggler
//   const toggleTTS = () => {
//     const v = !ttsOn;
//     setTtsOn(v);
//     localStorage.setItem(LS_TTS, v ? "1" : "0");
//     if (!v && synthRef.current) synthRef.current.cancel();
//   };

//   // Speak & Stop
//   const speak = useCallback(
//     (text) => {
//       if (!ttsOn || !synthRef.current) return;
//       synthRef.current.cancel();
//       const ut = new SpeechSynthesisUtterance(text);
//       ut.rate = 1.0;
//       ut.pitch = 1.0;
//       ut.volume = 1.0;
//       // pick a voice if available
//       const voices = synthRef.current.getVoices();
//       const en = voices.find((v) => /en/i.test(v.lang)) || voices[0];
//       if (en) ut.voice = en;
//       synthRef.current.speak(ut);
//     },
//     [ttsOn]
//   );

//   const stopSpeak = useCallback(() => {
//     if (synthRef.current) synthRef.current.cancel();
//   }, []);

//   // Voice input (Web Speech API)
//   const toggleMic = () => {
//     if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
//       setErr("Voice input is not supported in this browser.");
//       return;
//     }
//     if (micOn) {
//       recogRef.current?.stop?.();
//       setMicOn(false);
//       return;
//     }
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const rec = new SR();
//     recogRef.current = rec;
//     rec.lang = "en-US";
//     rec.interimResults = true;
//     rec.continuous = true;

//     rec.onresult = (ev) => {
//       let final = "";
//       for (let i = ev.resultIndex; i < ev.results.length; i++) {
//         final += ev.results[i][0].transcript;
//       }
//       setInput(final);
//     };
//     rec.onerror = () => {
//       setErr("Microphone error.");
//       setMicOn(false);
//     };
//     rec.onend = () => setMicOn(false);
//     rec.start();
//     setMicOn(true);
//   };

//   // Send message to server
//   const postToBackend = async (text) => {
//     const url = `${import.meta.env.VITE_API_URL}/chat`;
//     const res = await axios.post(url, { message: text });
//     return res?.data?.reply || "I'm here for you.";
//   };

//   const send = async (explicitText) => {
//     const text = (explicitText ?? input).trim();
//     if (!text) return;
//     setErr("");
//     setBusy(true);

//     // add user message
//     const u = { id: uid(), role: "user", text, ts: nowISO() };
//     setMessages((m) => [...m, u]);
//     setInput("");

//     // risky banner
//     const flagged = riskIn(text);

//     try {
//       const reply = await postToBackend(text);

//       const b = {
//         id: uid(),
//         role: "bot",
//         text: reply,
//         ts: nowISO(),
//       };

//       setMessages((m) => {
//         const arr = flagged
//           ? [
//               ...m,
//               {
//                 id: uid(),
//                 role: "bot",
//                 text:
//                   "💙 If you’re thinking about self-harm or feel unsafe: please reach out now.\n" +
//                   "AASRA: 91-9820466726 · Vandrevala: 1860 2662 345 · Local emergency services.",
//                 ts: nowISO(),
//               },
//               b,
//             ]
//           : [...m, b];
//         return arr;
//       });

//       if (ttsOn) speak(reply);
//     } catch (e) {
//       console.error(e);
//       setErr("Could not reach the chat service. Please try again.");
//       setMessages((m) => [
//         ...m,
//         {
//           id: uid(),
//           role: "bot",
//           text: "Sorry — I’m having trouble connecting. Tap Retry to send again.",
//           ts: nowISO(),
//         },
//       ]);
//     } finally {
//       setBusy(false);
//       composerRef.current?.focus?.();
//     }
//   };

//   const retryLast = async () => {
//     // Find last user message
//     for (let i = messages.length - 1; i >= 0; i--) {
//       if (messages[i].role === "user") {
//         await send(messages[i].text);
//         break;
//       }
//     }
//   };

//   const onKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       send();
//     }
//   };

//   const onCopy = (msg) => {
//     const ok = copyToClipboard(msg.text);
//     setErr(ok ? "" : "Could not copy to clipboard.");
//   };

//   const onDelete = (msg) => {
//     setMessages((m) => m.filter((x) => x.id !== msg.id));
//   };

//   const clearAll = () => {
//     if (!confirm("Clear entire chat?")) return;
//     if (synthRef.current) synthRef.current.cancel();
//     localStorage.removeItem(LS_KEY);
//     setMessages([]);
//     setErr("");
//   };

//   const exportChat = () => {
//     const pretty = JSON.stringify(messages, null, 2);
//     saveToFile(`student-sanctuary-chat-${Date.now()}.json`, pretty);
//   };

//   const chips = useMemo(
//     () => [
//       "breathing exercise",
//       "sleep hygiene tips",
//       "study stress",
//       "panic right now",
//       "routine building",
//       "calming music suggestions",
//     ],
//     []
//   );

//   // -------- Layout --------
//   return (
//     <section
//       className="chat-page"
//       style={{
//         display: "grid",
//         gridTemplateRows: "auto 1fr auto",
//         minHeight: "100vh",
//         background: "linear-gradient(180deg,#fff,#fff7ed)",
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           padding: "12px 10%",
//           borderBottom: "1px solid #ffe8c6",
//           background: "#fffaf0",
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
//           <Sparkles size={18} color="#f97316" />
//           <h2 style={{ margin: 0, fontWeight: 900, letterSpacing: -.3 }}>MindMate Chat</h2>
//           <span
//             style={{
//               marginLeft: "auto",
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 8,
//               color: "#9a3412",
//               fontWeight: 700,
//             }}
//           >
//             <Clock size={16} /> {new Date().toLocaleString()}
//           </span>
//         </div>

//         <div
//           style={{
//             marginTop: 8,
//             display: "flex",
//             gap: 8,
//             flexWrap: "wrap",
//             alignItems: "center",
//           }}
//         >
//           <button className="btn tiny" onClick={toggleTTS} title="Toggle read aloud">
//             {ttsOn ? <><VolumeX size={14} /> TTS Off</> : <><Volume2 size={14} /> TTS On</>}
//           </button>
//           <button className="btn tiny" onClick={toggleMic} title="Voice input">
//             {micOn ? <><MicOff size={14} /> Stop Mic</> : <><Mic size={14} /> Mic</>}
//           </button>
//           <button className="btn tiny" onClick={exportChat} title="Export chat JSON">
//             <Download size={14} /> Export
//           </button>
//           <button className="btn tiny" onClick={clearAll} title="Clear all">
//             <Trash2 size={14} /> Clear
//           </button>
//         </div>

//         {/* quick chips */}
//         <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
//           {chips.map((c) => (
//             <button
//               key={c}
//               className="chip"
//               onClick={() => setInput(c)}
//               style={{
//                 border: "1px solid #ffe8c6",
//                 background: "#fff",
//                 color: "#9a3412",
//                 fontWeight: 700,
//                 borderRadius: 999,
//                 padding: "6px 10px",
//               }}
//             >
//               {c}
//             </button>
//           ))}
//         </div>

//         {/* banner */}
//         <div
//           style={{
//             display: "flex",
//             gap: 10,
//             alignItems: "center",
//             background: "#fff",
//             border: "1px dashed #e2e8f0",
//             padding: "8px 10px",
//             borderRadius: 12,
//             color: "#475569",
//             marginTop: 8,
//           }}
//         >
//           <Info size={16} />
//           <div>
//             <strong>Not for emergencies.</strong> If you’re in danger or thinking about self-harm, call local
//             emergency services now.
//           </div>
//         </div>
//       </div>

//       {/* Messages */}
//       <div
//         ref={scroller}
//         className="chat-scroller"
//         style={{
//           padding: "14px 10%",
//           display: "flex",
//           flexDirection: "column",
//           gap: 10,
//           overflowY: "auto",
//         }}
//       >
//         <AnimatePresence initial={false}>
//           {messages.map((m) => (
//             <Bubble
//               key={m.id}
//               msg={m}
//               onCopy={onCopy}
//               onDelete={onDelete}
//               ttsOn={ttsOn}
//               speak={speak}
//               stopSpeak={stopSpeak}
//             />
//           ))}
//         </AnimatePresence>

//         {busy && <Typing />}

//         {err && (
//           <div
//             role="alert"
//             style={{
//               marginTop: 10,
//               display: "flex",
//               alignItems: "center",
//               gap: 8,
//               background: "rgba(239,68,68,.08)",
//               border: "1px solid rgba(239,68,68,.35)",
//               color: "#991b1b",
//               padding: "8px 10px",
//               borderRadius: 12,
//             }}
//           >
//             <AlertTriangle size={16} />
//             {err}
//             <button
//               className="btn tiny"
//               onClick={retryLast}
//               style={{ marginLeft: "auto", display: "inline-flex", gap: 6, alignItems: "center" }}
//             >
//               <RefreshCw size={14} /> Retry
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Composer */}
//       <div
//         style={{
//           padding: "12px 10%",
//           borderTop: "1px solid #e2e8f0",
//           background: "#fff",
//         }}
//       >
//         {riskIn(input) && (
//           <div
//             role="note"
//             style={{
//               marginBottom: 8,
//               display: "flex",
//               gap: 8,
//               alignItems: "center",
//               background: "rgba(239,68,68,.07)",
//               border: "1px solid rgba(239,68,68,.35)",
//               color: "#7f1d1d",
//               borderRadius: 10,
//               padding: "6px 10px",
//             }}
//           >
//             <AlertTriangle size={16} />
//             We’ll prioritize safety: if you feel unsafe, call local emergency services, AASRA (91-9820466726),
//             or Vandrevala (1860 2662 345).
//           </div>
//         )}

//         <div
//           className="composer"
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr auto",
//             gap: 10,
//             alignItems: "end",
//           }}
//         >
//           <textarea
//             ref={composerRef}
//             rows={3}
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={onKeyDown}
//             placeholder="Type your message… (Shift+Enter for new line)"
//             style={{
//               width: "100%",
//               background: "#fff",
//               border: "1px solid #e2e8f0",
//               borderRadius: 12,
//               padding: "10px 12px",
//               font: "16px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
//               color: "#0f172a",
//               resize: "vertical",
//               minHeight: 80,
//             }}
//           />

//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             <button
//               className="btn"
//               onClick={() => setInput("")}
//               title="Clear"
//               style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
//             >
//               <X size={16} /> Clear
//             </button>
//             <button
//               className="btn primary"
//               disabled={busy || !input.trim()}
//               onClick={() => send()}
//               title="Send"
//               style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: 8,
//                 background: "linear-gradient(135deg,#f97316,#fb923c)",
//                 color: "#fff",
//                 fontWeight: 800,
//               }}
//             >
//               {busy ? <Loader2 className="spin" size={16} /> : <Send size={16} />}
//               {busy ? "Sending…" : "Send"}
//             </button>
//           </div>
//         </div>

//         <div
//           style={{
//             marginTop: 8,
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//             color: "#64748b",
//             fontSize: 12,
//           }}
//         >
//           <ClipboardList size={14} />
//           <span>
//             Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for a new line.
//           </span>
//           <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
//             <HeartHandshake size={14} />
//             Your messages stay private on this device unless you choose to export/share.
//           </span>
//         </div>
//       </div>
//     </section>
//   );
// }



import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Trash2, Copy } from "lucide-react";

export default function Chat() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom automatically
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Save chat history locally
  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  // Send message to backend
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, {
        message: text,
      });

      const botMessage = {
        role: "assistant",
        content: res.data.reply || "Sorry, I didn’t quite get that.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        role: "assistant",
        content: "⚠️ Unable to connect to the server. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Send message on Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear chat
  const clearChat = () => {
    if (confirm("Clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem("chat_history");
    }
  };

  // Copy message
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="chat-container"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f7f7f8",
        color: "#111",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
          fontSize: "1rem",
        }}
      >
        <span>Chat</span>
        <button
          onClick={clearChat}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#666",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
          }}
        >
          <Trash2 size={15} /> Clear
        </button>
      </header>

      {/* Chat Body */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 800, padding: "0 20px" }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background:
                      msg.role === "user" ? "#007aff" : "#ffffff",
                    color: msg.role === "user" ? "#fff" : "#111",
                    padding: "10px 14px",
                    borderRadius: 12,
                    maxWidth: "80%",
                    whiteSpace: "pre-wrap",
                    boxShadow:
                      msg.role === "user"
                        ? "0 4px 10px rgba(0,0,0,0.1)"
                        : "0 4px 12px rgba(0,0,0,0.05)",
                    lineHeight: 1.5,
                    fontSize: "15px",
                  }}
                >
                  {msg.content}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyMessage(msg.content)}
                      style={{
                        background: "transparent",
                        border: "none",
                        marginLeft: 8,
                        cursor: "pointer",
                        opacity: 0.7,
                      }}
                      title="Copy"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: 10,
                gap: 6,
                alignItems: "center",
                color: "#666",
              }}
            >
              <Loader2 className="spin" size={16} />
              <span>Thinking…</span>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>
      </main>

      {/* Input Area */}
      <footer
        style={{
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 800,
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            style={{
              flex: 1,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 15,
              resize: "none",
              minHeight: 48,
              maxHeight: 180,
              background: "#f9fafb",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              background: loading ? "#ccc" : "#007aff",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              height: 48,
              minWidth: 100,
            }}
          >
            {loading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </footer>
    </div>
  );
}
