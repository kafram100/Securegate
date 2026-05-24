"use client"

import { useEffect, useState } from "react"

const images = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80",
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80",
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute inset-0 -z-10">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      ))}
    </div>
  )
}
