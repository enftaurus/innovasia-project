import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Bar } from "react-chartjs-2";
import { postAssessment } from "../services/api";
import toast from "react-hot-toast";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OPTS = [
  {v:0,t:"Not at all"},
  {v:1,t:"Several days"},
  {v:2,t:"More than half the days"},
  {v:3,t:"Nearly every day"},
];

const PHQ9 = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling/staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself / failure",
  "Trouble concentrating",
  "Moving or speaking slowly / fidgety or restless",
  "Thoughts that you would be better off dead, or thoughts of self-harm",
];

const GAD7 = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

export default function SelfCheck(){
  const { register, handleSubmit, watch } = useForm();
  const [result, setResult] = useState(null);

  function sum(arr){ return arr.reduce((a,b)=>a+(+b||0),0); }

  const onSubmit = async (data)=>{
    const phq = PHQ9.map((_,i)=> Number(data[`phq-${i}`]||0));
    const gad = GAD7.map((_,i)=> Number(data[`gad-${i}`]||0));
    const phqScore = sum(phq);
    const gadScore = sum(gad);
    const suicidal = (phq[8]||0) > 0;
    const high = suicidal || phqScore>=20 || gadScore>=15 || (phqScore>=15 && gadScore>=10);
    const risk = high ? "High" : (phqScore>=10 || gadScore>=10 ? "Moderate" : "Low");
    const payload = { phq, gad, phqScore, gadScore, risk };

    try { await postAssessment(payload); } catch {}
    setResult(payload);
    toast.success("Assessment complete");
  };

  const chart = useMemo(()=> result ? {
    labels:["PHQ-9","GAD-7"],
    datasets:[{label:"Score", data:[result.phqScore, result.gadScore]}]
  } : null, [result]);

  return (
    <section className="section">
      <div className="container" style={{maxWidth:900}}>
        <h2>Self-Assessment</h2>
        {!result ? (
          <form onSubmit={handleSubmit(onSubmit)} className="grid" style={{gap:18}}>
            <div className="feature">
              <h3>PHQ-9 (past 2 weeks)</h3>
              {PHQ9.map((q,i)=>(
                <div className="grid" key={i} style={{gap:8, gridTemplateColumns:"1fr"}}>
                  <label><strong>{i+1}.</strong> {q}</label>
                  <div className="pill">
                    {OPTS.map(o=>(
                      <label key={o.v} className="btn" style={{cursor:"pointer"}}>
                        <input type="radio" value={o.v} {...register(`phq-${i}`)} style={{marginRight:8}}/>{o.t}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="feature">
              <h3>GAD-7 (past 2 weeks)</h3>
              {GAD7.map((q,i)=>(
                <div className="grid" key={i} style={{gap:8, gridTemplateColumns:"1fr"}}>
                  <label><strong>{i+1}.</strong> {q}</label>
                  <div className="pill">
                    {OPTS.map(o=>(
                      <label key={o.v} className="btn" style={{cursor:"pointer"}}>
                        <input type="radio" value={o.v} {...register(`gad-${i}`)} style={{marginRight:8}}/>{o.t}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn primary" type="submit">See results</button>
          </form>
        ) : (
          <div className="grid" style={{gap:16, gridTemplateColumns:"1fr 1fr"}}>
            <div className="feature">
              <h3>Your Results</h3>
              <p><strong>PHQ-9:</strong> {result.phqScore}</p>
              <p><strong>GAD-7:</strong> {result.gadScore}</p>
              <p><strong>Risk:</strong> {result.risk}</p>
              <div className="cta" style={{marginTop:8}}>
                <a className="btn" href="/videos">Coping videos</a>
                <a className="btn primary" href="/appointments">Contact counsellor</a>
              </div>
            </div>
            <div className="feature">
              <Bar data={chart} options={{ plugins:{legend:{display:false}} }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
