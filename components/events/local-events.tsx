"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Clock, Search, Filter, Plus, ExternalLink, CheckCircle } from "lucide-react"
import { useCommunityStore, type Event } from "@/hooks/use-community-store"
import { useWeekendStore } from "@/hooks/use-weekend-store"
import { useAuth } from "@/contexts/auth-context"
import { WeatherWidget } from "@/components/weather/weather-widget"
import { toast } from "sonner"

const categories = ["All", "Outdoor", "Food", "Culture", "Entertainment", "Sports", "Learning", "Social"]

interface APIEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time?: string
  location: string
  category: string
  organizer?: string
  attendees?: number
  max_attendees?: number
  image?: string
  url?: string
  venue?: {
    name: string
    address: string
    city: string
    state: string
  }
}

export function LocalEvents() {
  const { user } = useAuth()
  const { addToWeekend, weekendPlan } = useWeekendStore()
  const [weatherData, setWeatherData] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<any>(null)
  const [apiEvents, setApiEvents] = useState<APIEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Pass data to parent component for Gemini integration
  useEffect(() => {
    if (weatherData && userLocation) {
      window.dispatchEvent(new CustomEvent('weatherLocationUpdate', {
        detail: { weatherData, userLocation }
      }))
    }
  }, [weatherData, userLocation])

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const location = userLocation?.city || 'New York'
        const response = await fetch(`/api/events?location=${encodeURIComponent(location)}&category=${selectedCategory.toLowerCase()}`)
        const data = await response.json()
        setApiEvents(data.events || [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [selectedCategory, userLocation])

  const { events: communityEvents, joinEvent, leaveEvent } = useCommunityStore()

  // Helper function to get day of week from date
  const getDayOfWeek = (dateString: string): 'saturday' | 'sunday' | 'friday' | 'monday' | 'thursday' | null => {
    const date = new Date(dateString)
    const dayOfWeek = date.getDay()

    switch (dayOfWeek) {
      case 5: return 'friday'
      case 6: return 'saturday'
      case 0: return 'sunday'
      case 1: return 'monday'
      case 4: return 'thursday'
      default: return null
    }
  }

  // Helper function to check if event is already in weekend plan
  const isEventInWeekendPlan = (eventId: string) => {
    return weekendPlan.some(activity => activity.id === eventId)
  }

  // Function to add API event to weekend planner
  const addEventToWeekend = (event: APIEvent) => {
    const eventDay = getDayOfWeek(event.start_time)
    if (!eventDay) {
      toast.error('This event is not on a weekend day')
      return
    }

    const startTime = new Date(event.start_time).toTimeString().slice(0, 5)

    const activity = {
      id: `event-${event.id}`,
      title: event.title,
      category: event.category,
      description: event.description,
      duration: event.end_time ? Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60)) : 120,
      location: event.location,
      image: event.image,
      isPredefined: false,
      activityType: event.category.toLowerCase() as any,
    }

    addToWeekend(activity, eventDay, startTime)
    toast.success(`Added "${event.title}" to your ${eventDay} plan!`)
  }

  const CommunityEventCard = ({ event }: { event: Event }) => {
    const isAttending = user && event.attendees.includes(user.id)
    const isFull = event.maxAttendees && event.attendees.length >= event.maxAttendees

    return (
      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 text-balance">{event.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-xs !text-slate-700 !bg-slate-200 dark:!text-slate-200 dark:!bg-slate-700"
            >
              {event.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 text-pretty">{event.description}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {event.attendees.slice(0, 3).map((attendeeId, index) => (
                  <Avatar key={attendeeId} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={`/placeholder-user.jpg`} />
                    <AvatarFallback className="text-xs">{String.fromCharCode(65 + index)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {event.attendees.length}
                {event.maxAttendees && `/${event.maxAttendees}`} attending
              </span>
            </div>
            <Button
              size="sm"
              variant={isAttending ? "outline" : "default"}
              disabled={!isAttending && !!isFull}
              onClick={() => {
                if (user) {
                  isAttending ? leaveEvent(event.id, user.id) : joinEvent(event.id, user.id)
                }
              }}
              className="hover:scale-105 transition-transform"
            >
              {isAttending ? "Leave" : isFull ? "Full" : "Join"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const APIEventCard = ({ event }: { event: APIEvent }) => {
    const eventDay = getDayOfWeek(event.start_time)
    const isInWeekendPlan = isEventInWeekendPlan(`event-${event.id}`)
    const canAddToWeekend = eventDay && !isInWeekendPlan

    return (
      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 border-blue-100 dark:border-blue-900">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 text-balance flex items-center gap-2">
                {event.title}
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Live Event
                </Badge>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.start_time).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.venue?.name || event.location}
                </div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="text-xs !text-slate-700 !bg-slate-200 dark:!text-slate-200 dark:!bg-slate-700"
            >
              {event.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 text-pretty">{event.description}</p>
          {event.organizer && (
            <p className="text-xs text-muted-foreground mb-3">
              <strong>Organizer:</strong> {event.organizer}
            </p>
          )}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {event.attendees && (
                <span className="text-sm text-muted-foreground">
                  {event.attendees} {event.max_attendees ? `/${event.max_attendees}` : ''} attending
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {canAddToWeekend && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => addEventToWeekend(event)}
                  className="hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add to Plan
                </Button>
              )}
              {isInWeekendPlan && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="text-green-600 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Added
                </Button>
              )}
              {event.url && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(event.url, '_blank')}
                  className="hover:scale-105 transition-transform"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredCommunityEvents = communityEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredApiEvents = apiEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.venue?.name && event.venue.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground text-balance">Local Events</h2>
          <p className="text-muted-foreground text-pretty">Discover exciting events happening in your community</p>
        </div>
        <Button className="hover:scale-105 transition-transform">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Weather Widget */}
      <div className="mb-6">
        <WeatherWidget onWeatherUpdate={setWeatherData} onLocationUpdate={setUserLocation} />
      </div>

      {/* Live Events Section */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
          <p className="text-lg font-medium">Loading live events...</p>
        </div>
      ) : (
        <>
          {/* Live Events from API */}
          {filteredApiEvents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Live Events</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {filteredApiEvents.length} events
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApiEvents.map((event) => (
                  <APIEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Community Events Section */}
          {filteredCommunityEvents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Community Events</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {filteredCommunityEvents.length} events
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunityEvents.map((event) => (
                  <CommunityEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* No Events Message */}
          {filteredApiEvents.length === 0 && filteredCommunityEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm">Try adjusting your search or create a new event</p>
            </div>
          )}
        </>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{apiEvents.length + communityEvents.length}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{apiEvents.length}</div>
            <div className="text-sm text-muted-foreground">Live Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{communityEvents.length}</div>
            <div className="text-sm text-muted-foreground">Community Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {weekendPlan.filter(activity => activity.id.startsWith('event-')).length}
            </div>
            <div className="text-sm text-muted-foreground">Events in Plan</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
