"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MapPin, Cloud, Calendar, Lightbulb, ExternalLink, Plus } from "lucide-react"

interface GeminiRecommendation {
  id: string
  title: string
  description: string
  category: string
  location: string
  weather_condition: string
  estimated_duration: string
  cost_range: string
  difficulty: "Easy" | "Medium" | "Hard"
  best_time: string
  tips: string[]
  image_url?: string
}


interface GeminiRecommendationsProps {
  userLocation: {
    city: string
    country: string
    coordinates: { lat: number; lng: number }
  }
  weatherData: {
    temperature: number
    description: string
    humidity: number
    windSpeed: number
  }
  onRecommendationSelect: (recommendation: GeminiRecommendation) => void
  onAddToPlanner?: (recommendation: GeminiRecommendation, day: "saturday" | "sunday") => void
}

export function GeminiRecommendations({
  userLocation,
  weatherData,
  onRecommendationSelect,
  onAddToPlanner
}: GeminiRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<GeminiRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    if (userLocation.city && weatherData.description) {
      fetchGeminiRecommendations()
    }
  }, [userLocation, weatherData])

  const fetchGeminiRecommendations = async () => {
    setLoading(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      console.log('🔑 API Key check:', apiKey ? 'Present' : 'Missing')
      console.log('🔑 API Key value:', apiKey?.substring(0, 10) + '...')

      if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '') {
        const prompt = `You are a smart weekend planning assistant. Based on the following information, recommend 5-7 specific activities for this weekend:

Location: ${userLocation.city}, ${userLocation.country}
Weather: ${weatherData.description}, ${weatherData.temperature}°C, Humidity: ${weatherData.humidity}%, Wind: ${weatherData.windSpeed} m/s

Please provide recommendations that are:
1. Suitable for the current weather conditions
2. Available in or near ${userLocation.city}
3. Perfect for weekend activities
4. Include both indoor and outdoor options based on weather

Return as JSON array with this structure:
[
  {
    "id": "unique_id",
    "title": "Activity Name",
    "description": "Brief description",
    "category": "outdoor/indoor/cultural/food/entertainment",
    "location": "Specific location in city",
    "weather_condition": "sunny/rainy/cloudy/cold/hot",
    "estimated_duration": "2-3 hours",
    "cost_range": "Free/$10-20/$20-50/Expensive",
    "difficulty": "Easy/Medium/Hard",
    "best_time": "Morning/Afternoon/Evening",
    "tips": ["tip1", "tip2", "tip3"]
  }
]`

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('📦 Gemini API Response:', data)
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text
          console.log('📝 Generated content:', content)

          if (content) {
            try {
              // Extract JSON from the response
              const jsonMatch = content.match(/\[[\s\S]*\]/)
              if (jsonMatch) {
                const parsedRecommendations = JSON.parse(jsonMatch[0])
                console.log('✅ Parsed recommendations:', parsedRecommendations)
                setUsingMockData(false)
                setRecommendations(parsedRecommendations)
              } else {
                console.error('❌ No JSON found in response')
                throw new Error('No JSON found in response')
              }
            } catch (parseError) {
              console.error('Error parsing Gemini response:', parseError)
              setUsingMockData(true)
              setRecommendations(getMockRecommendations())
            }
          } else {
            console.error('❌ No content in response')
            throw new Error('No content in response')
          }
        } else {
          console.error('❌ API request failed:', response.status, response.statusText)
          const errorText = await response.text()
          console.error('❌ Error response:', errorText)
          throw new Error(`API request failed: ${response.status}`)
        }
      } else {
        // Fallback to mock data
        console.warn('⚠️ Gemini API key not configured. Using mock recommendations.')
        console.log('To enable AI recommendations, set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.')
        setUsingMockData(true)
        setRecommendations(getMockRecommendations())
      }
    } catch (error) {
      console.error('Error fetching Gemini recommendations:', error)
      setUsingMockData(true)
      setRecommendations(getMockRecommendations())
    } finally {
      setLoading(false)
    }
  }


  const getMockRecommendations = (): GeminiRecommendation[] => {
    const isRainy = weatherData?.description?.toLowerCase().includes('rain')
    const isCold = weatherData?.temperature < 10
    const isHot = weatherData?.temperature > 25
    const isSunny = weatherData?.description?.toLowerCase().includes('sun') || weatherData?.description?.toLowerCase().includes('clear')

    const baseRecommendations: GeminiRecommendation[] = [
      {
        id: "gem-1",
        title: "Local Museum Visit",
        description: "Explore the cultural heritage and history of your city",
        category: "cultural",
        location: `${userLocation?.city || 'Local'} Museum`,
        weather_condition: "any",
        estimated_duration: "2-3 hours",
        cost_range: "$10-20",
        difficulty: "Easy",
        best_time: "Morning",
        tips: ["Check opening hours", "Bring camera", "Wear comfortable shoes"]
      },
      {
        id: "gem-2",
        title: "Coffee Shop Reading",
        description: "Relax with a good book and local coffee",
        category: "indoor",
        location: "Local Coffee Shop",
        weather_condition: "any",
        estimated_duration: "1-2 hours",
        cost_range: "$5-15",
        difficulty: "Easy",
        best_time: "Afternoon",
        tips: ["Bring your own book", "Find a quiet corner", "Try local coffee"]
      }
    ]

    if (isRainy) {
      baseRecommendations.unshift({
        id: "gem-rainy",
        title: "Indoor Art Gallery",
        description: "Perfect rainy day activity to explore local art",
        category: "cultural",
        location: `${userLocation?.city || 'Local'} Art Gallery`,
        weather_condition: "rainy",
        estimated_duration: "2-3 hours",
        cost_range: "$5-15",
        difficulty: "Easy",
        best_time: "Afternoon",
        tips: ["Bring umbrella", "Check for special exhibitions", "Take your time"]
      })
    }

    if (isSunny && !isCold) {
      baseRecommendations.unshift({
        id: "gem-sunny",
        title: "City Park Walk",
        description: "Enjoy the beautiful weather with a leisurely walk",
        category: "outdoor",
        location: `${userLocation?.city || 'Local'} Central Park`,
        weather_condition: "sunny",
        estimated_duration: "1-2 hours",
        cost_range: "Free",
        difficulty: "Easy",
        best_time: "Morning",
        tips: ["Bring water", "Wear sunscreen", "Take photos"]
      })
    }

    if (isCold) {
      baseRecommendations.unshift({
        id: "gem-cold",
        title: "Cozy Library Visit",
        description: "Warm up with books and quiet reading",
        category: "indoor",
        location: `${userLocation?.city || 'Local'} Public Library`,
        weather_condition: "cold",
        estimated_duration: "2-4 hours",
        cost_range: "Free",
        difficulty: "Easy",
        best_time: "Afternoon",
        tips: ["Bring warm clothes", "Find a quiet spot", "Check out local history section"]
      })
    }

    return baseRecommendations.slice(0, 5)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "outdoor": return "🌳"
      case "indoor": return "🏠"
      case "cultural": return "🎨"
      case "food": return "🍽️"
      case "entertainment": return "🎭"
      default: return "⭐"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800"
      case "Medium": return "bg-yellow-100 text-yellow-800"
      case "Hard": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny": return "☀️"
      case "rainy": return "🌧️"
      case "cloudy": return "☁️"
      case "cold": return "❄️"
      case "hot": return "🔥"
      default: return "🌤️"
    }
  }

  return (
    <div className="space-y-6">

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Recommendations
            <Badge variant="outline" className="ml-auto">
              {usingMockData ? "Demo Data" : "Powered by Gemini"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">
                Gemini is analyzing your location and weather...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                {userLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {userLocation.city}, {userLocation.country}
                  </div>
                )}
                {weatherData && (
                  <div className="flex items-center gap-1">
                    <Cloud className="h-4 w-4" />
                    {weatherData.description}, {weatherData.temperature}°C
                  </div>
                )}
              </div>

              {usingMockData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Lightbulb className="h-4 w-4" />
                    <span className="text-sm font-medium">Demo Mode</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    To get personalized AI recommendations, add your Gemini API key to enable real-time suggestions.
                  </p>
                </div>
              )}

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((recommendation) => (
                    <Card
                      key={recommendation.id}
                      className="hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      onClick={() => onRecommendationSelect(recommendation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(recommendation.category)}</span>
                            <h5 className="font-medium">{recommendation.title}</h5>
                          </div>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {recommendation.location}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{getWeatherIcon(recommendation.weather_condition)}</span>
                            Best for: {recommendation.weather_condition} weather
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <Badge variant="outline" className="text-xs">
                              {recommendation.estimated_duration}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {recommendation.cost_range}
                            </Badge>
                            <Badge className={`text-xs ${getDifficultyColor(recommendation.difficulty)}`}>
                              {recommendation.difficulty}
                            </Badge>
                          </div>
                          {recommendation.tips.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">💡 Tips:</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {recommendation.tips.slice(0, 2).map((tip, index) => (
                                  <li key={index} className="flex items-start gap-1">
                                    <span className="text-primary">•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Add to Planner Buttons */}
                          {onAddToPlanner && (
                            <div className="mt-4 pt-3 border-t border-border/50">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onAddToPlanner(recommendation, "saturday")
                                  }}
                                  className="flex-1 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add to Saturday
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onAddToPlanner(recommendation, "sunday")
                                  }}
                                  className="flex-1 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add to Sunday
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recommendations available</p>
                  <p className="text-sm">Try refreshing or check your location settings</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
