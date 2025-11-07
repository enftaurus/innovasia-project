// import React, { useEffect, useState } from "react";
// import { getResources } from "../services/api";

// const FALLBACK = [
//   { title:"Mindful Breathing (2 min)", id:"86HUcX8ZtAk" },
//   { title:"Panic reset", id:"aEqlQvczMJQ" },
//   { title:"Sleep body scan", id:"1sgb2cUqFiY" },
//   { title:"Emotional balance", id:"tEmt1Znux58" },
// ];

// export default function Videos(){
//   const [list,setList]=useState(FALLBACK);

//   useEffect(()=>{
//     (async ()=>{
//       try{
//         const { data } = await getResources();
//         if (Array.isArray(data) && data.length) setList(data);
//       }catch{}
//     })();
//   },[]);

//   return (
//     <section className="section">
//       <div className="container">
//         <h2>Guided learning & relaxation</h2>
//         <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>
//           {list.map((v,i)=>(
//             <article className="card" key={i}>
//               <div style={{position:"relative",paddingTop:"56.25%"}}>
//                 <iframe
//                   title={v.title}
//                   src={`https://www.youtube.com/embed/${v.id}`}
//                   style={{position:"absolute",inset:0,width:"100%",height:"100%",border:0,borderRadius:12}}
//                   allowFullScreen
//                 />
//               </div>
//               <h3 style={{marginTop:8}}>{v.title}</h3>
//             </article>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }



import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Search, Loader2 } from "lucide-react";

/**
 * Videos.jsx — Minimalist modern video hub.
 * Theme: white, black, soft gray.
 * Feel: elegant, smooth, distraction-free.
 */

const videoList = [
  {
    title: "Mindful Breathing for Beginners",
    url: "https://www.youtube.com/embed/nkN3i-BhMJM",
    category: "Breathing",
  },
  {
    title: "5-Minute Guided Meditation",
    url: "https://www.youtube.com/embed/inpok4MKVLM",
    category: "Relaxation",
  },
  {
    title: "Sleep Better Tonight",
    url: "https://www.youtube.com/embed/MmCl3gGSPq4",
    category: "Sleep",
  },
  {
    title: "Overcome Study Stress",
    url: "https://www.youtube.com/embed/DWvHR_RxQwE",
    category: "Focus",
  },
  {
    title: "Dealing with Anxiety",
    url: "https://www.youtube.com/embed/WWloIAQpMcQ",
    category: "Emotions",
  },
  {
    title: "Morning Calm — Reset Mindset",
    url: "https://www.youtube.com/embed/ZToicYcHIOU",
    category: "Mindfulness",
  },
];

export default function Videos() {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(videoList);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const lower = query.toLowerCase();
    setFiltered(
      videoList.filter(
        (v) =>
          v.title.toLowerCase().includes(lower) ||
          v.category.toLowerCase().includes(lower)
      )
    );
  }, [query]);

  return (
    <motion.section
      className="videos-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px 80px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: 900,
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            fontSize: "2rem",
            letterSpacing: -0.5,
          }}
        >
          CalmSpace Videos
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#444",
            marginTop: 8,
          }}
        >
          Curated relaxing, emotional, and mindful moments — just for students.
        </p>
      </motion.div>

      {/* Search */}
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          display: "flex",
          alignItems: "center",
          background: "#f5f5f5",
          borderRadius: 12,
          padding: "8px 14px",
          marginBottom: 30,
          border: "1px solid #e5e5e5",
        }}
      >
        <Search size={18} color="#666" />
        <input
          type="text"
          placeholder="Search videos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            padding: "8px 10px",
            fontSize: 15,
            background: "transparent",
          }}
        />
      </div>

      {/* Loader */}
      {loading ? (
        <div
          style={{
            marginTop: 100,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#666",
            fontSize: 16,
          }}
        >
          <Loader2 className="spin" size={20} /> Loading calmness…
        </div>
      ) : (
        <>
          {/* Video Grid */}
          <motion.div
            className="video-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              width: "100%",
              maxWidth: 1100,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 28,
            }}
          >
            {filtered.map((v, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid #eee",
                  boxShadow:
                    "0 4px 10px rgba(0,0,0,0.03), 0 2px 5px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "56.25%",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  <iframe
                    src={v.url}
                    title={v.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "0 0 12px 12px",
                    }}
                  ></iframe>
                </div>

                <div
                  style={{
                    padding: "16px 18px",
                    borderTop: "1px solid #f1f1f1",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      marginBottom: 6,
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#666",
                      fontWeight: 400,
                    }}
                  >
                    {v.category}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* No Results */}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                color: "#999",
                marginTop: 60,
                fontSize: 16,
              }}
            >
              No videos found for “{query}”.
            </motion.div>
          )}
        </>
      )}
    </motion.section>
  );
}
