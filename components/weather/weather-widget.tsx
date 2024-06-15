"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets, Eye, RefreshCw } from "lucide-react"

interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  visibility: number
  city: string
  country: string
  icon: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface LocationData {
  city: string
  country: string
  lat: number
  lon: number
}

interface WeatherWidgetProps {
  onWeatherUpdate?: (weather: WeatherData) => void
  onLocationUpdate?: (location: { city: string; country: string; coordinates: { lat: number; lng: number } }) => void
}

export function WeatherWidget({ onWeatherUpdate, onLocationUpdate }: WeatherWidgetProps = {}) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Step 1: Get user's location using browser geolocation first, then IP fallback
      let locationData: LocationData

      try {
        // Try browser geolocation first
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true
          })
        })

        // Reverse geocoding to get city name
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=74853f90fb1557e36e6b32da0ec56ce6`
        )
        const geoData = await geoResponse.json()
        
        locationData = {
          city: geoData[0]?.name || 'Unknown City',
          country: geoData[0]?.country || 'Unknown Country',
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }
      } catch (geoError) {
        console.log('Geolocation failed, trying IP-based location:', geoError)
        // Fallback to IP-based location
        const ipResponse = await fetch('https://ipapi.co/json/')
        locationData = await ipResponse.json()
      }

      if (!locationData.city || !locationData.lat || !locationData.lon) {
        throw new Error('Unable to determine location')
      }

      // Step 2: Get weather data using OpenWeatherMap API
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${locationData.lat}&lon=${locationData.lon}&appid=74853f90fb1557e36e6b32da0ec56ce6&units=metric`
      )

      if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json()
        throw new Error(`Weather API error: ${errorData.message || weatherResponse.statusText}`)
      }

      const weatherData = await weatherResponse.json()
      console.log('Weather data received:', weatherData)

      const weatherInfo = {
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        visibility: weatherData.visibility / 1000, // Convert to km
        city: locationData.city,
        country: locationData.country,
        icon: weatherData.weather[0].icon,
        coordinates: {
          lat: locationData.lat,
          lng: locationData.lon
        }
      }
      
      setWeather(weatherInfo)
      
      // Notify parent components
      if (onWeatherUpdate) {
        onWeatherUpdate(weatherInfo)
      }
      if (onLocationUpdate) {
        onLocationUpdate({
          city: locationData.city,
          country: locationData.country,
          coordinates: {
            lat: locationData.lat,
            lng: locationData.lon
          }
        })
      }
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError(`Unable to fetch weather data: ${err instanceof Error ? err.message : 'Unknown error'}`)
      // Set fallback data
      setWeather({
        temperature: 22,
        description: "Partly Cloudy",
        humidity: 65,
        windSpeed: 12,
        visibility: 10,
        city: "Your City",
        country: "Your Country",
        icon: "partly-cloudy"
      })
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (icon: string) => {
    const iconProps = { className: "h-6 w-6" }
    switch (icon) {
      case "01d":
      case "01n":
        return <Sun {...iconProps} />
      case "02d":
      case "02n":
      case "03d":
      case "03n":
        return <Cloud {...iconProps} />
      case "09d":
      case "09n":
      case "10d":
      case "10n":
        return <CloudRain {...iconProps} />
      case "11d":
      case "11n":
        return <CloudRain {...iconProps} />
      case "13d":
      case "13n":
        return <CloudSnow {...iconProps} />
      default:
        return <Cloud {...iconProps} />
    }
  }

  const getWeatherColor = (description: string) => {
    const desc = description.toLowerCase()
    if (desc.includes('sun') || desc.includes('clear')) return "text-yellow-500"
    if (desc.includes('cloud')) return "text-gray-500"
    if (desc.includes('rain')) return "text-blue-500"
    if (desc.includes('snow')) return "text-blue-300"
    return "text-gray-500"
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !weather) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather in {weather?.city}
          </div>
          <button
            onClick={fetchWeatherData}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Refresh weather data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${getWeatherColor(weather?.description || '')}`}>
              {getWeatherIcon(weather?.icon || '')}
            </div>
            <div>
              <div className="text-2xl font-bold">{weather?.temperature}°C</div>
              <div className="text-sm text-muted-foreground capitalize">
                {weather?.description}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {weather?.city}, {weather?.country}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Humidity</span>
            <span className="font-medium">{weather?.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span className="text-muted-foreground">Wind</span>
            <span className="font-medium">{weather?.windSpeed} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-muted-foreground">Visibility</span>
            <span className="font-medium">{weather?.visibility} km</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-red-500" />
            <span className="text-muted-foreground">Feels like</span>
            <span className="font-medium">{weather?.temperature}°C</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
