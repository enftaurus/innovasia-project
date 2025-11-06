import React from "react";

const stories = [
  { title:"“I finally sleep through the night.”", img:"https://images.unsplash.com/photo-1529335764857-3f1164d1cb24?auto=format&fit=crop&w=1200&q=80" },
  { title:"“My exams were calmer this time.”", img:"https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" },
  { title:"“The 2-minute breathing really helps.”", img:"https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80" },
];

export default function Stories(){
  return (
    <section className="section">
      <div className="container">
        <h2>Real stories</h2>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>
          {stories.map((s,i)=>(
            <article key={i} className="card">
              <img src={s.img} alt={s.title} style={{borderRadius:12}}/>
              <p style={{marginTop:8}}>{s.title}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
