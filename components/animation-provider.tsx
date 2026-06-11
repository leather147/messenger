"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface AnimationContextValue {
  animationsEnabled: boolean
  toggleAnimations: () => void
}

const AnimationContext = createContext<AnimationContextValue>({
  animationsEnabled: true,
  toggleAnimations: () => {},
})

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("karavan-animations")
    if (saved !== null) setAnimationsEnabled(saved === "true")
  }, [])

  function toggleAnimations() {
    setAnimationsEnabled((prev) => {
      const next = !prev
      localStorage.setItem("karavan-animations", String(next))
      return next
    })
  }

  return (
    <AnimationContext.Provider value={{ animationsEnabled, toggleAnimations }}>
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  return useContext(AnimationContext)
}

/** Returns the animation class only when animations are enabled */
export function useAnimClass(className: string) {
  const { animationsEnabled } = useAnimation()
  return animationsEnabled ? className : ""
}
