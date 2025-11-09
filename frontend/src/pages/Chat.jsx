// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import "../style.css";

// const Chat = () => {
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "👋 Hi! I’m your AI counselor. How are you feeling today?" },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // useEffect(() => {
//   //   chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   // }, [messages]);
//   useEffect(() => {
//     const chatBody = chatEndRef.current?.parentElement;
//     if (!chatBody) return;

//   // Check how far the user is from the bottom
//     const isNearBottom =
//       chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < 100;

//   // Only auto-scroll if near bottom (user didn’t scroll up)
//     if (isNearBottom) {
//       chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);


//   const sendMessage = async () => {
//     const trimmed = input.trim();
//     if (!trimmed) return;

//     const userMessage = { sender: "user", text: trimmed };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await axios.post("http://localhost:8000/chat/", { message: trimmed });
//       const botReply = res.data.reply || "I'm here to listen — tell me more.";
//       setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
//     } catch (err) {
//       console.error(err);
//       let errorMsg = "Sorry, I’m having trouble replying right now.";
//       if (err.response?.data?.detail) {
//         errorMsg = err.response.data.detail;
//       }
//       setMessages((prev) => [...prev, { sender: "bot", text: errorMsg }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chat-wrapper">
//       {/* Header */}
//       <header className="chat-header">
//         ChatBot
//       </header>

//       {/* Chat area */}
//       <div className="chat-body">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`chat-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
//           >
//             {msg.text}
//           </div>
//         ))}
//         {loading && <div className="bot-bubble typing">Typing...</div>}
//         <div ref={chatEndRef}></div>
//       </div>

//       {/* Typing area */}
//       <div className="chat-input-area">
//         <textarea
//           className="chat-input"
//           placeholder="Type your message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           rows="2"
//         />
//         <button className="send-button" onClick={sendMessage} disabled={loading}>
//           Send
//         </button>
//       </div>

      
//     </div>
//   );
// };

// export default Chat;



// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import "../style.css";

// const Chat = () => {
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "👋 Hi! I’m your AI counselor. How are you feeling today?" },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [autoScroll, setAutoScroll] = useState(true);
//   const [showScrollButton, setShowScrollButton] = useState(false);

//   const chatEndRef = useRef(null);
//   const chatContainerRef = useRef(null);

//   // --- Smart scroll behavior ---
//   useEffect(() => {
//     const chat = chatContainerRef.current;
//     if (!chat) return;

//     const handleScroll = () => {
//       const distanceFromBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight;
//       const isNearBottom = distanceFromBottom < 100;
//       setAutoScroll(isNearBottom);
//       setShowScrollButton(!isNearBottom);
//     };

//     chat.addEventListener("scroll", handleScroll);
//     return () => chat.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Scroll only if near bottom
//   useEffect(() => {
//     if (autoScroll) {
//       chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, autoScroll]);

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // --- Send message ---
//   const sendMessage = async () => {
//     const trimmed = input.trim();
//     if (!trimmed) return;

//     const userMessage = { sender: "user", text: trimmed };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await axios.post("http://localhost:8000/chat/", { message: trimmed });
//       const botReply = res.data.reply || "I'm here to listen — tell me more.";
//       setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
//     } catch (err) {
//       console.error(err);
//       let errorMsg = "Sorry, I’m having trouble replying right now.";
//       if (err.response?.data?.detail) {
//         errorMsg = err.response.data.detail;
//       }
//       setMessages((prev) => [...prev, { sender: "bot", text: errorMsg }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chat-wrapper">
//       {/* Header */}
//       <header className="chat-header">🌸 Student Support Chat</header>

//       {/* Chat area */}
//       <div className="chat-body" ref={chatContainerRef}>
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`chat-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
//           >
//             {msg.text}
//           </div>
//         ))}
//         {loading && <div className="bot-bubble typing">Thinking...</div>}
//         <div ref={chatEndRef}></div>

//         {showScrollButton && (
//           <button className="scroll-button" onClick={scrollToBottom}>
//             ↓
//           </button>
//         )}
//       </div>

//       {/* Input area */}
//       <div className="chat-input-area">
//         <textarea
//           className="chat-input"
//           placeholder="Type your message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           rows="2"
//         />
//         <button className="send-button" onClick={sendMessage} disabled={loading}>
//           Send
//         </button>
//       </div>

//       {/* Footer */}
//       <footer className="chat-footer">
//         <p>💛 Powered by Rukwith’s AI Counselor</p>
//       </footer>
//     </div>
//   );
// };

// export default Chat;












import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../style.css";

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I’m your AI counselor. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Scroll to top when AI responds
  const scrollToTop = () => {
    const chat = chatContainerRef.current;
    if (chat) chat.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/chat/", { message: trimmed });
      const botReply = res.data.reply || "I'm here to listen — tell me more.";
      setMessages((prev) => {
        const updated = [...prev, { sender: "bot", text: botReply }];
        return updated;
      });
      // Scroll to top after AI reply
      setTimeout(scrollToTop, 300);
    } catch (err) {
      console.error(err);
      let errorMsg = "Sorry, I’m having trouble replying right now.";
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setMessages((prev) => {
        const updated = [...prev, { sender: "bot", text: errorMsg }];
        return updated;
      });
      // Scroll to top even on error
      setTimeout(scrollToTop, 300);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-wrapper">
      {/* Header */}
      <header className="chat-header">ChatBot</header>

      {/* Chat area */}
      <div className="chat-body" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="bot-bubble typing">Thinking...</div>}
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows="2"
        />
        <button className="send-button" onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>

      
    </div>
  );
};

export default Chat;
