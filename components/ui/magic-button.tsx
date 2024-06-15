"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2, Star, Zap } from "lucide-react"

interface MagicButtonProps {
    onClick: () => void
    className?: string
    variant?: "default" | "landing"
}

export function MagicButton({ onClick, className = "", variant = "default" }: MagicButtonProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)
    const [showText, setShowText] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    // Auto-animate every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true)
            setShowText(true)

            // Reset animation after 1 second
            setTimeout(() => {
                setIsAnimating(false)
                setShowText(false)
            }, 1000)
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    // Show text with delay on hover (override auto-animation)
    useEffect(() => {
        if (isHovered) {
            const timer = setTimeout(() => setShowText(true), 500)
            return () => clearTimeout(timer)
        } else if (!isAnimating) {
            setShowText(false)
        }
    }, [isHovered, isAnimating])

    return (
        <div className={`relative ${className}`}>
            {/* Magic Text that slides out from the right */}
            <div className={`
        absolute right-full mr-4 top-1/2 transform -translate-y-1/2
        transition-all duration-500 ease-out
        ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
        pointer-events-none
      `}>
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span className="font-semibold text-sm">
                            {variant === "landing" ? "Start your magical journey" : "Tap TAB to see the magic"}
                        </span>
                        <Wand2 className="h-4 w-4 animate-bounce" />
                    </div>
                    {/* Text tail/pointer */}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-purple-600 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                </div>
            </div>

            {/* Keyboard hint text that slides in from the left */}
            {variant === "default" && (
                <div className={`
          absolute left-full ml-4 top-1/2 transform -translate-y-1/2
          transition-all duration-600 ease-out
          ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          pointer-events-none
        `}>
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <Zap className="h-3 w-3 animate-pulse" />
                            <span className="font-medium text-xs">
                                Press TAB for instant access
                            </span>
                        </div>
                        {/* Text tail/pointer */}
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-r-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                    </div>
                </div>
            )}

            {/* Round Magic Button */}
            <Button
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                className={`
          relative overflow-hidden
          w-16 h-16 rounded-full
          bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500
          hover:from-purple-500 hover:via-pink-500 hover:to-orange-400
          border-0 shadow-lg hover:shadow-2xl
          transition-all duration-300 ease-out
          transform hover:scale-110 active:scale-95
          ${isHovered || isAnimating ? 'shadow-purple-500/50' : ''}
          ${isPressed ? 'scale-95' : ''}
          ${isAnimating ? 'scale-110' : ''}
          text-white
        `}
            >
                {/* Animated Background Gradient */}
                <div className={`
          absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500
          opacity-0 transition-opacity duration-500
          ${isHovered || isAnimating ? 'opacity-30 animate-pulse' : ''}
        `} />

                {/* Magic Particles around the button */}
                {(isHovered || isAnimating) && (
                    <>
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                                style={{
                                    left: `${20 + (i * 15)}%`,
                                    top: `${15 + (i * 12)}%`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '1.5s'
                                }}
                            />
                        ))}
                    </>
                )}

                {/* Main Icon */}
                <div className="relative z-10 flex items-center justify-center">
                    <Sparkles className={`
            h-8 w-8 transition-all duration-300
            ${isHovered || isAnimating ? 'animate-spin scale-110' : ''}
          `} />
                </div>

                {/* Shimmer Effect */}
                <div className={`
          absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
          -rotate-45 translate-x-[-100%] transition-transform duration-1000
          ${isHovered || isAnimating ? 'translate-x-[100%]' : ''}
        `} />

                {/* Glow Effect */}
                <div className={`
          absolute inset-0 rounded-full border-2 border-transparent
          transition-all duration-500
          ${isHovered || isAnimating ? 'border-white/30 shadow-lg shadow-purple-400/30' : ''}
        `} />
            </Button>

            {/* Floating Stars Around Button */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top Star */}
                <Star className={`
          absolute -top-3 left-1/2 transform -translate-x-1/2 h-4 w-4 text-yellow-400
          transition-all duration-700
          ${isHovered || isAnimating ? 'animate-pulse scale-125 -translate-y-1' : 'opacity-60'}
        `} />

                {/* Right Star */}
                <Star className={`
          absolute top-1/2 -right-3 transform -translate-y-1/2 h-3 w-3 text-pink-400
          transition-all duration-600
          ${isHovered || isAnimating ? 'animate-pulse scale-150 translate-x-1' : 'opacity-60'}
        `} />

                {/* Bottom Star */}
                <Star className={`
          absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-3 w-3 text-blue-400
          transition-all duration-800
          ${isHovered || isAnimating ? 'animate-pulse scale-125 translate-y-1' : 'opacity-60'}
        `} />

                {/* Left Star */}
                <Star className={`
          absolute top-1/2 -left-3 transform -translate-y-1/2 h-4 w-4 text-purple-400
          transition-all duration-500
          ${isHovered || isAnimating ? 'animate-pulse scale-150 -translate-x-1' : 'opacity-60'}
        `} />
            </div>

            {/* Magic Circle Ripple Effect */}
            <div className={`
          absolute inset-0 rounded-full border-2 border-purple-400/30
          transition-all duration-1000
          ${isHovered || isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
        `} />

            <div className={`
          absolute inset-0 rounded-full border-2 border-pink-400/30
          transition-all duration-1200
          ${isHovered || isAnimating ? 'scale-200 opacity-0' : 'scale-100 opacity-100'}
        `} />
        </div>
    )
}
