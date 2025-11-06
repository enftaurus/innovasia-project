import React from 'react'

export default function VideoCard({ title, id }) {
  return (
    <article className="card video">
      <iframe src={`https://www.youtube.com/embed/${id}`} title={title} allowFullScreen></iframe>
      <h3>{title}</h3>
    </article>
  )
}
