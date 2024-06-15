"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Route, Clock, Car, User } from "lucide-react"

interface Location {
  id: string
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  type: string
  rating?: number
  distance?: number
}

interface MapIntegrationProps {
  activities: Array<{
    id: string
    title: string
    location?: string
    coordinates?: { lat: number; lng: number }
  }>
}

export function MapIntegration({ activities }: MapIntegrationProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [route, setRoute] = useState<{
    distance: string
    duration: string
    mode: "driving" | "walking" | "transit"
  } | null>(null)

  useEffect(() => {
    // Convert activities to locations for mapping
    const activityLocations = activities
      .filter(activity => activity.location || activity.coordinates)
      .map((activity, index) => ({
        id: activity.id,
        name: activity.title,
        address: activity.location || "Unknown Address",
        coordinates: activity.coordinates || {
          lat: 40.7128 + (index * 0.01),
          lng: -74.0060 + (index * 0.01)
        },
        type: "activity",
        rating: 4.0 + Math.random(),
        distance: Math.random() * 10
      }))

    setLocations(activityLocations)
  }, [activities])

  const calculateRoute = (mode: "driving" | "walking" | "transit") => {
    if (locations.length < 2) return

    // Mock route calculation
    const totalDistance = locations.reduce((sum, loc) => sum + (loc.distance || 0), 0)
    const duration = mode === "walking" ? totalDistance * 15 : totalDistance * 2

    setRoute({
      distance: `${totalDistance.toFixed(1)} km`,
      duration: `${Math.round(duration)} min`,
      mode
    })
  }

  const openInMaps = (location: Location) => {
    const { lat, lng } = location.coordinates
    const url = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(url, '_blank')
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "driving": return <Car className="h-4 w-4" />
      case "walking": return <User className="h-4 w-4" />
      case "transit": return <Route className="h-4 w-4" />
      default: return <Navigation className="h-4 w-4" />
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "driving": return "bg-blue-100 text-blue-800"
      case "walking": return "bg-green-100 text-green-800"
      case "transit": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Activity Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {locations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No locations found</p>
            <p className="text-sm">Add activities with locations to see them on the map</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedLocation?.id === location.id 
                      ? "bg-primary/10 border-primary" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium">{location.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {location.type}
                        </Badge>
                        {location.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {location.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{location.address}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                        </div>
                        {location.distance && (
                          <div className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {location.distance.toFixed(1)} km away
                          </div>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        openInMaps(location)
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {selectedLocation && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Route Planning</h4>
                <div className="flex gap-2 mb-4">
                  {["driving", "walking", "transit"].map((mode) => (
                    <Button
                      key={mode}
                      variant={route?.mode === mode ? "default" : "outline"}
                      size="sm"
                      onClick={() => calculateRoute(mode as any)}
                      className="text-xs"
                    >
                      {getModeIcon(mode)}
                      <span className="ml-1 capitalize">{mode}</span>
                    </Button>
                  ))}
                </div>
                {route && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {route.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="h-4 w-4" />
                      {route.distance}
                    </div>
                    <Badge className={`text-xs ${getModeColor(route.mode)}`}>
                      {getModeIcon(route.mode)}
                      <span className="ml-1 capitalize">{route.mode}</span>
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Pro Tip:</span>
                <span>Click on any location to plan your route and get directions</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
