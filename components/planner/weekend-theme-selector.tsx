"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coffee, Zap, Users, Heart, TreePine, Sparkles } from "lucide-react"

export interface WeekendTheme {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  suggestedActivityTypes: string[]
  mood: "relaxed" | "energetic" | "social" | "adventurous" | "balanced"
}

const weekendThemes: WeekendTheme[] = [
  {
    id: "lazy",
    name: "Lazy Weekend",
    description: "Perfect for recharging and taking it slow",
    icon: <Coffee className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    suggestedActivityTypes: ["lazy", "indoor"],
    mood: "relaxed"
  },
  {
    id: "adventurous", 
    name: "Adventurous Weekend",
    description: "Get your adrenaline pumping with exciting activities",
    icon: <Zap className="h-5 w-5" />,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    suggestedActivityTypes: ["adventurous", "outdoor"],
    mood: "energetic"
  },
  {
    id: "family",
    name: "Family Weekend", 
    description: "Quality time with loved ones",
    icon: <Users className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-800 border-pink-200",
    suggestedActivityTypes: ["family", "social"],
    mood: "social"
  },
  {
    id: "wellness",
    name: "Wellness Weekend",
    description: "Focus on health, mindfulness, and self-care",
    icon: <Heart className="h-5 w-5" />,
    color: "bg-green-100 text-green-800 border-green-200", 
    suggestedActivityTypes: ["fitness", "lazy"],
    mood: "balanced"
  },
  {
    id: "nature",
    name: "Nature Weekend",
    description: "Connect with the great outdoors",
    icon: <TreePine className="h-5 w-5" />,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    suggestedActivityTypes: ["outdoor"],
    mood: "adventurous"
  },
  {
    id: "creative",
    name: "Creative Weekend",
    description: "Express yourself through art and creativity",
    icon: <Sparkles className="h-5 w-5" />,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    suggestedActivityTypes: ["creative", "indoor"],
    mood: "balanced"
  }
]

interface WeekendThemeSelectorProps {
  className?: string
}

export function WeekendThemeSelector({ className }: WeekendThemeSelectorProps) {
  const { selectedTheme, setSelectedTheme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Weekend Vibe
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Choose Theme"}
          </Button>
        </CardTitle>
        {selectedTheme && (
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${selectedTheme.color}`}>
            {selectedTheme.icon}
            <span className="font-medium">{selectedTheme.name}</span>
            <Badge variant="outline" className="text-xs">
              {selectedTheme.mood}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weekendThemes.map((theme) => (
              <Card
                key={theme.id}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedTheme?.id === theme.id
                    ? `ring-2 ring-primary ${theme.color}`
                    : "hover:shadow-md"
                }`}
                onClick={() => {
                  setSelectedTheme(selectedTheme?.id === theme.id ? null : theme)
                  setIsExpanded(false)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${theme.color}`}>
                      {theme.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{theme.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {theme.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {theme.suggestedActivityTypes.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTheme(null)
                setIsExpanded(false)
              }}
            >
              Clear Theme
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export { weekendThemes }
