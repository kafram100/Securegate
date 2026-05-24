"use client"

import { useEffect, useState } from "react"

const gradients = [
  "from-slate-900 via-purple-900 to-slate-900",
  "from-gray-900 via-blue-900 to-gray-900",
  "from-zinc-900 via-emerald-900 to-zinc-900",
  "from-stone-900 via-amber-900 to-stone-900",
]

const images = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80",
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80",
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)

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
          style={{ opacity: loaded && i === current ? 1 : 0 }}
        >
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
            onLoad={() => setLoaded(true)}
          />
        </div>
      ))}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[current]} transition-all duration-700`}
        style={{ opacity: loaded ? 0.7 : 1 }}
      />
    </div>
  )
}
