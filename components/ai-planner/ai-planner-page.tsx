"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, MapPin, Clock, DollarSign, Star, ArrowLeft, Plus, Search } from "lucide-react"
import { GeminiRecommendations } from "@/components/integrations/gemini-recommendations"
import { useWeekendStore, Activity } from "@/hooks/use-weekend-store"

interface WeatherData {
  description: string
  temperature: number
  humidity: number
  windSpeed: number
  coordinates: { lat: number; lon: number }
}

interface UserLocation {
  city: string
  country: string
  coordinates: { lat: number; lon: number }
}

interface AIRecommendation {
  id: string
  title: string
  description: string
  category: string
  location: string
  weather_condition: string
  estimated_duration: string
  cost_range: string
  difficulty: string
  best_time: string
  tips: string[]
}

interface AIPlannerPageProps {
  weatherData: WeatherData | null
  userLocation: UserLocation | null
  onBack: () => void
  onRecommendationSelect: (recommendation: AIRecommendation) => void
}

export function AIPlannerPage({ weatherData, userLocation, onBack, onRecommendationSelect }: AIPlannerPageProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cityInput, setCityInput] = useState("")
  const [isFetchingWeather, setIsFetchingWeather] = useState(false)
  const [currentWeatherData, setCurrentWeatherData] = useState<WeatherData | null>(weatherData)
  const [currentUserLocation, setCurrentUserLocation] = useState<UserLocation | null>(userLocation)
  const [showCityInput, setShowCityInput] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { addToWeekend } = useWeekendStore()

  // Fetch weather data for a given city
  const fetchWeatherForCity = async (city: string) => {
    setIsFetchingWeather(true)
    setError(null)

    try {
      // First, get coordinates for the city using geocoding
      const geocodeResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=74853f90fb1557e36e6b32da0ec56ce6`
      )

      if (!geocodeResponse.ok) {
        throw new Error('Failed to get city coordinates')
      }

      const geocodeData = await geocodeResponse.json()
      if (!geocodeData || geocodeData.length === 0) {
        throw new Error('City not found')
      }

      const { lat, lon, name, country } = geocodeData[0]

      // Now fetch weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=74853f90fb1557e36e6b32da0ec56ce6&units=metric`
      )

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const weatherData = await weatherResponse.json()

      // Format the data
      const formattedWeatherData: WeatherData = {
        description: weatherData.weather[0].description,
        temperature: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        coordinates: { lat, lon }
      }

      const formattedLocation: UserLocation = {
        city: name,
        country: country,
        coordinates: { lat, lon }
      }

      setCurrentWeatherData(formattedWeatherData)
      setCurrentUserLocation(formattedLocation)
      setSuccessMessage(`Successfully loaded recommendations for ${name}!`)
      // Keep search bar visible for re-searching
      // setShowCityInput(false)

    } catch (error) {
      console.error('Error fetching weather:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch weather data')
    } finally {
      setIsFetchingWeather(false)
    }
  }

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cityInput.trim()) {
      // Clear current data to show loading state for new search
      if (currentWeatherData && currentUserLocation) {
        setCurrentWeatherData(null)
        setCurrentUserLocation(null)
        setSuccessMessage(null)
        setError(null)
      }
      fetchWeatherForCity(cityInput.trim())
    }
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
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getCostColor = (cost: string) => {
    if (cost.toLowerCase().includes("free")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (cost.includes("$5-15") || cost.includes("$10-20")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    if (cost.includes("$20-50")) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  }

  const handleRecommendationSelect = (recommendation: AIRecommendation) => {
    onRecommendationSelect(recommendation)
  }

  // Helper function to convert duration string to minutes
  const parseDurationToMinutes = (duration: string): number => {
    // Handle common duration formats like "2-3 hours", "1 hour", "30 minutes", etc.
    const lowerDuration = duration.toLowerCase()

    // Extract hours
    const hoursMatch = lowerDuration.match(/(\d+)(?:\s*-\s*(\d+))?\s*hours?/)
    if (hoursMatch) {
      const minHours = parseInt(hoursMatch[1])
      const maxHours = hoursMatch[2] ? parseInt(hoursMatch[2]) : minHours
      // Return average of min and max hours converted to minutes
      return Math.round(((minHours + maxHours) / 2) * 60)
    }

    // Extract minutes
    const minutesMatch = lowerDuration.match(/(\d+)(?:\s*-\s*(\d+))?\s*minutes?/)
    if (minutesMatch) {
      const minMinutes = parseInt(minutesMatch[1])
      const maxMinutes = minutesMatch[2] ? parseInt(minutesMatch[2]) : minMinutes
      // Return average of min and max minutes
      return Math.round((minMinutes + maxMinutes) / 2)
    }

    // Default fallback (2 hours = 120 minutes)
    return 120
  }

  const addToWeekendPlanner = (recommendation: AIRecommendation, day: "saturday" | "sunday") => {
    const activity: Activity = {
      id: recommendation.id,
      title: recommendation.title,
      description: recommendation.description,
      category: recommendation.category,
      duration: parseDurationToMinutes(recommendation.estimated_duration),
      location: recommendation.location,
      isPredefined: false
    }

    addToWeekend(activity, day, "09:00") // Default time, user can change later

    // Show success message
    setSuccessMessage(`"${recommendation.title}" added to ${day.charAt(0).toUpperCase() + day.slice(1)}!`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={onBack}
              className="hover:bg-muted/80 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 transition-all duration-300 hover:scale-110 hover:bg-primary/20 hover:shadow-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  AI Planner
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Smart recommendations based on your location and weather
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6">
              <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          {/* City Input Form */}
          {showCityInput && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {currentWeatherData && currentUserLocation ? 'Search Different City' : "What's your city?"}
                </CardTitle>
                <CardDescription>
                  {currentWeatherData && currentUserLocation
                    ? `Currently showing recommendations for ${currentUserLocation.city}. Enter a different city to get new recommendations.`
                    : 'Enter your city to get personalized AI recommendations based on local weather and activities'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCitySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="city"
                        placeholder={currentWeatherData && currentUserLocation
                          ? `Try ${currentUserLocation.city === 'New York' ? 'London' : currentUserLocation.city === 'London' ? 'Tokyo' : 'New York'}...`
                          : "e.g., New York, London, Tokyo"
                        }
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        className="flex-1"
                        disabled={isFetchingWeather}
                      />
                      <Button
                        type="submit"
                        disabled={!cityInput.trim() || isFetchingWeather}
                        className="px-6"
                      >
                        {isFetchingWeather ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            {currentWeatherData && currentUserLocation ? 'Search Again' : 'Search'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      {error}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {/* Weather Info */}
          {(currentWeatherData || currentUserLocation) && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {currentUserLocation ? `Current Conditions in ${currentUserLocation.city}` : 'Current Conditions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    {currentWeatherData && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>🌡️ {currentWeatherData.temperature}°C</span>
                        <span>💧 {currentWeatherData.humidity}% humidity</span>
                        <span>💨 {currentWeatherData.windSpeed} km/h wind</span>
                      </div>
                    )}
                  </div>
                  {currentWeatherData && (
                    <div className="text-right">
                      <div className="text-lg font-semibold capitalize">
                        {currentWeatherData.description}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Perfect for planning your weekend!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Recommendations
            </h2>

            {!currentWeatherData && !currentUserLocation ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Getting Your Location & Weather</h3>
                      <p className="text-muted-foreground text-sm">
                        Please visit the "Local Events" section first to enable location and weather data for personalized AI recommendations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              currentUserLocation && currentWeatherData && (
                <GeminiRecommendations
                  userLocation={{
                    city: currentUserLocation.city,
                    country: currentUserLocation.country,
                    coordinates: {
                      lat: currentUserLocation.coordinates.lat,
                      lng: currentUserLocation.coordinates.lon
                    }
                  }}
                  weatherData={currentWeatherData}
                  onRecommendationSelect={handleRecommendationSelect}
                  onAddToPlanner={addToWeekendPlanner}
                />
              )
            )}
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location-Based
                </CardTitle>
                <CardDescription>
                  Recommendations tailored to your specific city and area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your location to suggest activities that are actually available and accessible in your area.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Weather-Aware
                </CardTitle>
                <CardDescription>
                  Smart suggestions that match current weather conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get indoor activities for rainy days and outdoor adventures for sunny weather.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
