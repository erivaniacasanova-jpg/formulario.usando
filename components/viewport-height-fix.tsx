'use client'

import { useEffect } from 'react'

export function ViewportHeightFix() {
  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
    }

    setVH()
    window.addEventListener('resize', setVH)

    return () => window.removeEventListener('resize', setVH)
  }, [])

  return null
}
