"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Star, Clock, DollarSign, Phone, ExternalLink, Search } from "lucide-react"

interface Place {
  place_id: string
  name: string
  rating: number
  price_level?: number
  vicinity: string
  types: string[]
  opening_hours?: {
    open_now: boolean
  }
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
  photos?: string[] // Array of photo URLs
  photo_references?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
}

interface PlacesSearchProps {
  activityType: string
  onPlaceSelect: (place: Place) => void
}

export function GooglePlacesIntegration({ activityType, onPlaceSelect }: PlacesSearchProps) {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Define categories for filtering
  const categories = [
    { id: "restaurant", label: "Restaurants", icon: "🍽️" },
    { id: "shopping_mall", label: "Shopping", icon: "🛍️" },
    { id: "park", label: "Parks", icon: "🌳" },
    { id: "tourist_attraction", label: "Attractions", icon: "🎯" },
    { id: "movie_theater", label: "Cinemas", icon: "🎬" },
    { id: "gym", label: "Fitness", icon: "💪" },
    { id: "cafe", label: "Cafes", icon: "☕" },
    { id: "hospital", label: "Healthcare", icon: "🏥" }
  ]

  useEffect(() => {
    console.log('🔍 Nearby Places: Initializing location detection')
    // Get user's location for nearby search
    if (navigator.geolocation) {
      console.log('🔍 Nearby Places: Geolocation API available, requesting position')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationString = `${position.coords.latitude},${position.coords.longitude}`
          console.log('🔍 Nearby Places: Location obtained:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationString
          })
          setLocation(locationString)
        },
        (error) => {
          console.warn('🔍 Nearby Places: Geolocation error:', error)
          console.log('🔍 Nearby Places: Using default NYC location')
          setLocation("40.7128,-74.0060") // Default to NYC
        }
      )
    } else {
      console.warn('🔍 Nearby Places: Geolocation API not available')
      console.log('🔍 Nearby Places: Using default NYC location')
      setLocation("40.7128,-74.0060") // Default to NYC
    }
  }, [])

  const searchPlaces = useCallback(async (categoryQuery?: string) => {
    const isCategoryButtonClick = !!categoryQuery
    const hasSearchQuery = searchQuery.trim().length > 0

    console.log('🔍 Nearby Places: Starting search with:', {
      searchQuery,
      selectedCategory,
      categoryQuery,
      activityType,
      location,
      isCategoryButtonClick,
      hasSearchQuery
    })

    if (!hasSearchQuery && !isCategoryButtonClick) {
      console.warn('🔍 Nearby Places: Search cancelled - no query or category')
      return
    }

    setLoading(true)
    console.log('🔍 Nearby Places: Making API request to /api/places/search')

    try {
      // Build the search query by combining location search with category
      let searchQueryText = ""
      let searchLocation: string | null = null
      let searchCategory: string | undefined = undefined

      if (isCategoryButtonClick) {
        // Category button clicked - combine search query with category
        if (hasSearchQuery) {
          // User has typed something in search bar + clicked category
          // e.g., "jaipur" + "restaurants" = "restaurants in jaipur"
          searchQueryText = `${categoryQuery} in ${searchQuery}`
          searchLocation = null // Let Google determine location from query
          searchCategory = undefined
          console.log('🔍 Nearby Places: Category + location search:', searchQueryText)
        } else {
          // Just category clicked, no search query - use current location
          searchQueryText = categoryQuery
          searchLocation = location
          searchCategory = categoryQuery.toLowerCase()
          console.log('🔍 Nearby Places: Category search near current location')
        }
      } else {
        // Search bar used (Enter key or search button)
        if (selectedCategory && hasSearchQuery) {
          // User has selected category and typed location
          // e.g., "jaipur" + selected "restaurants" = "restaurants in jaipur"
          const categoryLabel = categories.find(cat => cat.id === selectedCategory)?.label || selectedCategory
          searchQueryText = `${categoryLabel.toLowerCase()} in ${searchQuery}`
          searchLocation = null
          searchCategory = undefined
          console.log('🔍 Nearby Places: Search bar with category:', searchQueryText)
        } else {
          // Just search query, no category
          searchQueryText = searchQuery
          searchLocation = null
          searchCategory = undefined
          console.log('🔍 Nearby Places: General location search:', searchQueryText)
        }
      }

      const requestBody = {
        query: searchQueryText,
        location: searchLocation,
        radius: searchLocation ? 5000 : undefined,
        category: searchCategory
      }

      console.log('🔍 Nearby Places: Request body:', requestBody)

      // Use our backend API route to avoid CORS issues
      const response = await fetch('/api/places/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('🔍 Nearby Places: API response status:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Nearby Places: API response data:', data)
        setPlaces(data.results || [])
        console.log('🔍 Nearby Places: Places set successfully, count:', data.results?.length || 0)
      } else {
        const errorText = await response.text()
        console.error('🔍 Nearby Places: API request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        })
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('🔍 Nearby Places: Error searching places:', error)
      console.log('🔍 Nearby Places: Falling back to mock data')
      // Fallback to mock data
      const mockPlaces = getMockPlaces(activityType)
      console.log('🔍 Nearby Places: Mock places generated:', mockPlaces)
      setPlaces(mockPlaces)
    } finally {
      setLoading(false)
      console.log('🔍 Nearby Places: Search completed, loading set to false')
    }
  }, [searchQuery, activityType, location])

  const getMockPlaces = (type: string): Place[] => {
    const mockPlaces = {
      restaurant: [
        {
          place_id: "1",
          name: "The Golden Spoon",
          rating: 4.5,
          price_level: 2,
          vicinity: "123 Main St",
          types: ["restaurant", "food"],
          opening_hours: { open_now: true },
        },
        {
          place_id: "2",
          name: "Café Central",
          rating: 4.2,
          price_level: 1,
          vicinity: "456 Oak Ave",
          types: ["cafe", "restaurant"],
          opening_hours: { open_now: true },
        },
      ],
      entertainment: [
        {
          place_id: "3",
          name: "City Cinema",
          rating: 4.0,
          price_level: 2,
          vicinity: "789 Theater Blvd",
          types: ["movie_theater", "entertainment"],
          opening_hours: { open_now: true },
        },
        {
          place_id: "4",
          name: "Arcade Zone",
          rating: 4.3,
          price_level: 1,
          vicinity: "321 Game St",
          types: ["amusement_park", "entertainment"],
          opening_hours: { open_now: true },
        },
      ],
      outdoor: [
        {
          place_id: "5",
          name: "Central Park",
          rating: 4.7,
          price_level: 0,
          vicinity: "Central Park, NYC",
          types: ["park", "tourist_attraction"],
          opening_hours: { open_now: true },
        },
        {
          place_id: "6",
          name: "Mountain Trail",
          rating: 4.4,
          price_level: 0,
          vicinity: "Trail Head Rd",
          types: ["park", "hiking_area"],
          opening_hours: { open_now: true },
        },
      ],
    }

    return mockPlaces[type as keyof typeof mockPlaces] || []
  }

  const getPriceLevel = (level?: number) => {
    if (!level) return "Free"
    return "$".repeat(level)
  }

  const getTypeIcon = (types: string[]) => {
    if (types.includes("restaurant") || types.includes("food")) return "🍽️"
    if (types.includes("movie_theater")) return "🎬"
    if (types.includes("park")) return "🌳"
    if (types.includes("shopping_mall")) return "🛍️"
    if (types.includes("gym")) return "💪"
    return "📍"
  }

  // Auto-load nearby places by category on mount
  useEffect(() => {
    if (location && isInitialLoad) {
      console.log('🔍 Nearby Places: Location detected, auto-loading popular categories')
      setIsInitialLoad(false)

      // Auto-load restaurants first, then other popular categories
      setTimeout(() => {
        searchPlaces("restaurants")
        setSelectedCategory("restaurant")
      }, 100)
    }
  }, [location, searchPlaces, isInitialLoad])

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    console.log('🔍 Nearby Places: Category selected:', categoryId)
    setSelectedCategory(categoryId)

    // Find the category label
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      searchPlaces(category.label.toLowerCase())
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h3 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ color: '#FFFFFF' }}>
          <MapPin className="h-4 w-4" style={{ color: '#4DD9CB' }} />
          Nearby Places
        </h3>
        <div className="flex gap-1 mt-2">
          <Input
            placeholder="Type location (e.g., 'jaipur') then select category below..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
            className="h-8 text-xs"
          />
          <Button onClick={() => searchPlaces()} disabled={loading} size="sm" variant="outline" className="px-2">
            <Search className="h-3 w-3" />
          </Button>
        </div>

        {/* Category Filter Buttons */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                disabled={loading}
                size="sm"
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`h-7 px-2 text-xs ${selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10"
                  }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && (
          <div className="text-center py-6">
            <div
              className="animate-spin rounded-full h-6 w-6 mx-auto"
              style={{
                borderTop: '2px solid #4DD9CB',
                borderRight: '2px solid transparent',
                borderBottom: '2px solid #4DD9CB',
                borderLeft: '2px solid transparent'
              }}
            ></div>
            <p className="text-xs mt-2" style={{ color: '#B8C4E6' }}>Finding places...</p>
          </div>
        )}

        {places.length > 0 && !loading && (
          <div className="space-y-2">
            {places.map((place) => (
              <div
                key={place.place_id}
                className="p-2 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => onPlaceSelect(place)}
              >
                <div className="flex items-start gap-3">
                  {/* Place Image */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    {place.photos && place.photos[0] ? (
                      <img
                        src={place.photos[0]}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">${getTypeIcon(place.types)}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                        {getTypeIcon(place.types)}
                      </div>
                    )}
                  </div>

                  {/* Place Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm truncate mb-1">{place.name}</h5>
                        <p className="text-xs text-muted-foreground truncate mb-2">{place.vicinity}</p>

                        {/* Category Badge */}
                        {place.types && place.types.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {place.types.slice(0, 2).map((type, index) => (
                              <span
                                key={index}
                                className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                              >
                                {type.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-0.5">
                            <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />
                            {place.rating || 'N/A'}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <DollarSign className="h-2 w-2" />
                            {getPriceLevel(place.price_level)}
                          </div>
                          {place.opening_hours && (
                            <div className={`text-xs px-1 py-0.5 rounded ${place.opening_hours.open_now ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {place.opening_hours.open_now ? "Open" : "Closed"}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-60 hover:opacity-100 h-6 w-6 p-0 flex-shrink-0 hover:bg-primary/10 transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          let mapsUrl = ""

                          if (place.geometry?.location) {
                            // Use exact coordinates if available
                            const { lat, lng } = place.geometry.location
                            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                          } else {
                            // Fallback to place name and vicinity
                            const searchQuery = `${place.name} ${place.vicinity}`.replace(/\s+/g, '+')
                            mapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`
                          }

                          window.open(mapsUrl, '_blank')
                          console.log('🔍 Nearby Places: Opening Google Maps for:', place.name, mapsUrl)
                        }}
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && places.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No places found</p>
            <p className="text-xs">Try searching something else</p>
          </div>
        )}

        {/* Search Status Indicator */}
        {!loading && places.length > 0 && (
          <div className="mb-2 px-2 py-1 text-xs text-muted-foreground border-l-2 border-primary/30">
            {searchQuery.trim() && selectedCategory ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Showing {categories.find(cat => cat.id === selectedCategory)?.label} in {searchQuery}
              </span>
            ) : searchQuery.trim() && !selectedCategory ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Searching for "{searchQuery}" globally
              </span>
            ) : selectedCategory && !searchQuery.trim() ? (
              <span className="flex items-center gap-1">
                <span className="text-primary">📍</span>
                Showing {categories.find(cat => cat.id === selectedCategory)?.label} near you
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
