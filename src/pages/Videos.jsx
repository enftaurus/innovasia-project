import React, { useEffect, useState } from "react";
import { getResources } from "../services/api";

const FALLBACK = [
  { title:"Mindful Breathing (2 min)", id:"86HUcX8ZtAk" },
  { title:"Panic reset", id:"aEqlQvczMJQ" },
  { title:"Sleep body scan", id:"1sgb2cUqFiY" },
  { title:"Emotional balance", id:"tEmt1Znux58" },
];

export default function Videos(){
  const [list,setList]=useState(FALLBACK);

  useEffect(()=>{
    (async ()=>{
      try{
        const { data } = await getResources();
        if (Array.isArray(data) && data.length) setList(data);
      }catch{}
    })();
  },[]);

  return (
    <section className="section">
      <div className="container">
        <h2>Guided learning & relaxation</h2>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>
          {list.map((v,i)=>(
            <article className="card" key={i}>
              <div style={{position:"relative",paddingTop:"56.25%"}}>
                <iframe
                  title={v.title}
                  src={`https://www.youtube.com/embed/${v.id}`}
                  style={{position:"absolute",inset:0,width:"100%",height:"100%",border:0,borderRadius:12}}
                  allowFullScreen
                />
              </div>
              <h3 style={{marginTop:8}}>{v.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
