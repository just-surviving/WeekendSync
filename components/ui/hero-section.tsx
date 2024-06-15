"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, MapPin, Sparkles, ArrowRight, Star } from "lucide-react"

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      {/* Subtle black shade overlay for header blending */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-2xl rotate-12 animate-pulse" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full animate-bounce" />
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-lg rotate-45 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-2xl -rotate-12 animate-bounce" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-float-delayed" />
        <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-float-delayed" />
      </div>

      {/* Modern Floating Cards */}
      <div className="absolute top-16 left-16 hidden xl:block">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-white/20 shadow-xl w-56 hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Weekend Plan</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">8 activities planned</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute top-32 right-16 hidden xl:block">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-white/20 shadow-xl w-52 hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Community</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">12 friends online</p>
                <div className="flex -space-x-1 mt-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white dark:border-slate-800"></div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-24 left-24 hidden xl:block">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-white/20 shadow-xl w-60 hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Local Events</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">15 events this weekend</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                    <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full w-3/4"></div>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">75%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        <div className="slide-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">AI-Powered Weekend Planning</span>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              WeekSync
            </span>
            <br />
            <span className="text-slate-900 dark:text-white">Makes Weekends</span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Magical ✨
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Discover activities, connect with friends, and create unforgettable weekend experiences with our AI-powered planning assistant.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl px-6 py-3 h-auto group shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
              onClick={onGetStarted}
            >
              Start Planning
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>

          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Weekend Plans</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">15K+</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Happy Users</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">200+</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Activities</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">98%</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Scroll</span>
          <div className="w-6 h-10 border-2 border-slate-300 dark:border-slate-600 rounded-full flex justify-center group hover:border-purple-400 transition-colors duration-300">
            <div className="w-1 h-3 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mt-2 animate-bounce group-hover:from-purple-500 group-hover:to-pink-500" />
          </div>
        </div>
      </div>
    </div>
  )
}



