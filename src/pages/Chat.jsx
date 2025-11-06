import React, { useRef, useState, useEffect } from "react";
import { chatReply } from "../services/api";
import toast from "react-hot-toast";

export default function Chat(){
  const [msgs, setMsgs] = useState([{ role:"bot", text:"Hi! I’m here for you. What’s on your mind?" }]);
  const [txt, setTxt] = useState("");
  const boxRef = useRef(null);

  useEffect(()=>{ boxRef.current?.scrollTo(0, boxRef.current.scrollHeight); }, [msgs]);

  async function send(){
    const t = txt.trim();
    if(!t) return;
    setMsgs(m=>[...m, {role:"user", text:t}]);
    setTxt("");
    try {
      const { data } = await chatReply({ message:t });
      setMsgs(m=>[...m, {role:"bot", text:data.reply || "I’m here with you."}]);
    } catch {
      // Fallback mini-router
      const low = t.toLowerCase();
      let reply = "Tell me a bit more about what’s hardest right now.";
      if (low.includes("sleep")) reply = "Try a 30-min wind-down, no screens, cool/dim room, and a fixed wake time.";
      if (low.includes("panic") || low.includes("anx")) reply = "Grounding 5-4-3-2-1; exhale longer than inhale for 2 minutes.";
      if (low.includes("study") || low.includes("focus")) reply = "Pomodoro: 25/5 ×4, then a 20-min break. Start with a tiny task.";
      setTimeout(()=> setMsgs(m=>[...m, {role:"bot", text:reply}]), 400);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{maxWidth:720}}>
        <h2>Chatbot</h2>
        <div ref={boxRef} className="card" style={{height:360, overflow:"auto"}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{
              maxWidth:"80%", margin:"8px 0", padding:"10px 12px",
              borderRadius:12, background:m.role==="bot"?"#eef2ff":"#fff",
              border:"1px solid #e5e7eb", marginLeft:m.role==="user"?"auto":0
            }}>{m.text}</div>
          ))}
        </div>
        <div className="pill" style={{marginTop:10}}>
          <input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Type a message..."/>
          <button className="btn primary" onClick={send}>Send</button>
        </div>
      </div>
    </section>
  );
}
