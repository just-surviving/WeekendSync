"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Users, ExternalLink, Filter } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  price: string
  attendees: number
  maxAttendees?: number
  image?: string
  source: "eventbrite" | "meetup" | "facebook" | "local"
}

interface EventDiscoveryProps {
  onEventSelect: (event: Event) => void
}

export function EventDiscovery({ onEventSelect }: EventDiscoveryProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [location, setLocation] = useState("")

  const categories = [
    { id: "all", name: "All Events", icon: "🎉" },
    { id: "music", name: "Music", icon: "🎵" },
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "food", name: "Food & Drink", icon: "🍕" },
    { id: "art", name: "Arts & Culture", icon: "🎨" },
    { id: "tech", name: "Technology", icon: "💻" },
    { id: "outdoor", name: "Outdoor", icon: "🌳" },
  ]

  useEffect(() => {
    fetchEvents()
  }, [selectedCategory, location])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      // Simulate API calls to multiple event sources
      const [eventbriteEvents, meetupEvents, facebookEvents] = await Promise.all([
        fetchEventbriteEvents(),
        fetchMeetupEvents(),
        fetchFacebookEvents(),
      ])

      const allEvents = [...eventbriteEvents, ...meetupEvents, ...facebookEvents]
      setEvents(allEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents(getMockEvents())
    } finally {
      setLoading(false)
    }
  }

  const fetchEventbriteEvents = async (): Promise<Event[]> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_EVENTBRITE_API_KEY
      if (!apiKey || apiKey === 'your_eventbrite_api_key_here') {
        return getMockEventbriteEvents()
      }

      // Real Eventbrite API call
      const response = await fetch(
        `https://www.eventbriteapi.com/v3/events/search/?q=${encodeURIComponent(selectedCategory)}&location.address=${location}&expand=venue&token=${apiKey}`
      )

      if (response.ok) {
        const data = await response.json()
        return data.events?.map((event: any) => ({
          id: `eb-${event.id}`,
          title: event.name?.text || 'Untitled Event',
          description: event.description?.text?.substring(0, 200) || 'No description',
          date: event.start?.local?.split('T')[0] || new Date().toISOString().split('T')[0],
          time: event.start?.local?.split('T')[1]?.substring(0, 5) || '12:00',
          location: event.venue?.name || 'Location TBD',
          category: selectedCategory,
          price: event.is_free ? 'Free' : 'Paid',
          attendees: event.capacity ? Math.floor(Math.random() * event.capacity) : 0,
          maxAttendees: event.capacity,
          source: "eventbrite" as const,
        })) || []
      }
    } catch (error) {
      console.error('Eventbrite API error:', error)
    }
    
    return getMockEventbriteEvents()
  }

  const getMockEventbriteEvents = (): Event[] => [
    {
      id: "eb-1",
      title: "Weekend Food Festival",
      description: "Taste the best local cuisine from 20+ vendors",
      date: "2024-12-21",
      time: "12:00 PM",
      location: "Downtown Square",
      category: "food",
      price: "$15",
      attendees: 150,
      maxAttendees: 200,
      source: "eventbrite",
    },
    {
      id: "eb-2",
      title: "Jazz Night at The Blue Note",
      description: "Live jazz performance with local artists",
      date: "2024-12-22",
      time: "8:00 PM",
      location: "The Blue Note Club",
      category: "music",
      price: "$25",
      attendees: 45,
      maxAttendees: 80,
      source: "eventbrite",
    },
  ]

  const fetchMeetupEvents = async (): Promise<Event[]> => {
    // Mock Meetup API call
    return [
      {
        id: "mu-1",
        title: "Hiking Group - Mountain Trail",
        description: "Join us for a scenic hike through the mountain trails",
        date: "2024-12-21",
        time: "8:00 AM",
        location: "Mountain Trail Park",
        category: "outdoor",
        price: "Free",
        attendees: 12,
        maxAttendees: 20,
        source: "meetup",
      },
      {
        id: "mu-2",
        title: "Tech Meetup - AI & Machine Learning",
        description: "Discussion about latest trends in AI and ML",
        date: "2024-12-23",
        time: "6:00 PM",
        location: "Tech Hub Downtown",
        category: "tech",
        price: "Free",
        attendees: 28,
        maxAttendees: 50,
        source: "meetup",
      },
    ]
  }

  const fetchFacebookEvents = async (): Promise<Event[]> => {
    // Mock Facebook Events API call
    return [
      {
        id: "fb-1",
        title: "Art Gallery Opening",
        description: "Contemporary art exhibition opening night",
        date: "2024-12-22",
        time: "7:00 PM",
        location: "Modern Art Gallery",
        category: "art",
        price: "$10",
        attendees: 35,
        maxAttendees: 100,
        source: "facebook",
      },
    ]
  }

  const getMockEvents = (): Event[] => {
    return [
      {
        id: "mock-1",
        title: "Saturday Morning Yoga",
        description: "Relaxing yoga session in the park",
        date: "2024-12-21",
        time: "9:00 AM",
        location: "Central Park",
        category: "outdoor",
        price: "Free",
        attendees: 15,
        maxAttendees: 25,
        source: "local",
      },
      {
        id: "mock-2",
        title: "Book Club Meeting",
        description: "Discussion of this month's selected book",
        date: "2024-12-22",
        time: "2:00 PM",
        location: "Public Library",
        category: "art",
        price: "Free",
        attendees: 8,
        maxAttendees: 15,
        source: "local",
      },
    ]
  }

  const filteredEvents = events.filter(event => 
    selectedCategory === "all" || event.category === selectedCategory
  )

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "eventbrite": return "🎫"
      case "meetup": return "👥"
      case "facebook": return "📘"
      default: return "📍"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "eventbrite": return "bg-orange-100 text-orange-800"
      case "meetup": return "bg-red-100 text-red-800"
      case "facebook": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Discover Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Finding events...</p>
          </div>
        )}

        {!loading && filteredEvents.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">
                {filteredEvents.length} events found
              </h4>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onEventSelect(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">{event.title}</h5>
                      <Badge className={`text-xs ${getSourceColor(event.source)}`}>
                        {getSourceIcon(event.source)} {event.source}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attending
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.price}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events found for this category</p>
            <p className="text-sm">Try selecting a different category</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
