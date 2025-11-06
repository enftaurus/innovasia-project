import React from "react";

export default function Card({ title, text }) {
  return (
    <article className="card info">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
