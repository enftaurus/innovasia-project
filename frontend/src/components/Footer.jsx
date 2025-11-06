import React from "react";

export default function Footer(){
  return (
    <footer className="footer section">
      <div className="container grid" style={{gridTemplateColumns:'2fr repeat(4,1fr)'}}>
        <div>
          <div className="brand"><div className="logo">🧠</div><strong>Student Sanctuary</strong></div>
          <p style={{color:'#94a3b8',maxWidth:'46ch'}}>Not for emergencies. If you’re in danger or considering self-harm, call local emergency services.</p>
        </div>
        <div>
          <strong>Programs</strong>
          <ul style={{listStyle:'none',padding:0,margin:8}}>
            <li><a href="#">Sleep</a></li>
            <li><a href="#">Anxiety</a></li>
            <li><a href="#">Study stress</a></li>
          </ul>
        </div>
        <div>
          <strong>Company</strong>
          <ul style={{listStyle:'none',padding:0,margin:8}}>
            <li><a href="#">About</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div>
          <strong>Support</strong>
          <ul style={{listStyle:'none',padding:0,margin:8}}>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Help center</a></li>
          </ul>
        </div>
        <div>
          <strong>Legal</strong>
          <ul style={{listStyle:'none',padding:0,margin:8}}>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="container" style={{borderTop:'1px solid #1f2937',marginTop:16,paddingTop:12}}>
        <small>© {new Date().getFullYear()} Student Sanctuary</small>
      </div>
    </footer>
  );
}
