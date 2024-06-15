import { NextRequest, NextResponse } from 'next/server'

interface EventAPIResponse {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') || 'New York'
    const category = searchParams.get('category') || 'all'
    const limit = searchParams.get('limit') || '20'

    // Using Eventbrite API as the primary source
    const eventbriteToken = process.env.EVENTBRITE_API_KEY
    if (!eventbriteToken) {
      console.warn('Eventbrite API key not found, using mock data')
      return getMockEvents(location, category, limit)
    }

    try {
      // Fetch from Eventbrite API
      const eventbriteResponse = await fetch(
        `https://www.eventbriteapi.com/v3/events/search/?location.address=${encodeURIComponent(location)}&categories=${getEventbriteCategoryId(category)}&sort_by=date&status=live&expand=venue,organizer&token=${eventbriteToken}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${eventbriteToken}`,
          },
        }
      )

      if (!eventbriteResponse.ok) {
        console.warn('Eventbrite API failed, using mock data')
        return getMockEvents(location, category, limit)
      }

      const eventbriteData = await eventbriteResponse.json()
      
      const events = eventbriteData.events?.map((event: any) => ({
        id: event.id,
        title: event.name?.text || 'Untitled Event',
        description: event.description?.text?.substring(0, 200) || 'No description available',
        start_time: event.start?.utc || new Date().toISOString(),
        end_time: event.end?.utc,
        location: event.venue?.name || event.online_event ? 'Online Event' : 'Location TBD',
        category: mapEventbriteCategory(event.category_id),
        organizer: event.organizer?.name || 'Unknown Organizer',
        attendees: 0,
        max_attendees: event.capacity,
        image: event.logo?.url,
        url: event.url,
        venue: event.venue ? {
          name: event.venue.name,
          address: event.venue.address?.address_1 || '',
          city: event.venue.address?.city || '',
          state: event.venue.address?.region || '',
        } : undefined,
      })) || []

      return NextResponse.json({
        events,
        source: 'eventbrite',
        location,
        category,
        total: events.length,
      })

    } catch (eventbriteError) {
      console.warn('Eventbrite API error:', eventbriteError)
      return getMockEvents(location, category, limit)
    }

  } catch (error) {
    console.error('Events API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

function getEventbriteCategoryId(category: string): string {
  const categoryMap: Record<string, string> = {
    'all': '',
    'outdoor': '113',
    'food': '110',
    'culture': '105',
    'entertainment': '103',
    'sports': '108',
    'learning': '102',
    'social': '112',
  }
  return categoryMap[category.toLowerCase()] || ''
}

function mapEventbriteCategory(categoryId: string): string {
  const categoryMap: Record<string, string> = {
    '113': 'Outdoor',
    '110': 'Food',
    '105': 'Culture',
    '103': 'Entertainment',
    '108': 'Sports',
    '102': 'Learning',
    '112': 'Social',
  }
  return categoryMap[categoryId] || 'Entertainment'
}

function getMockEvents(location: string, category: string, limit: string) {
  const mockEvents: EventAPIResponse[] = [
    {
      id: 'mock-1',
      title: 'Weekend Farmers Market',
      description: 'Fresh local produce, artisanal goods, and live music every weekend',
      start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
      location: 'Downtown Square',
      category: 'Food',
      organizer: 'Local Farmers Association',
      attendees: 45,
      max_attendees: 100,
      image: '/api/placeholder/400/200',
    },
    {
      id: 'mock-2',
      title: 'Saturday Morning Yoga',
      description: 'Peaceful morning yoga session in the park for all skill levels',
      start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
      location: 'Central Park',
      category: 'Outdoor',
      organizer: 'Zen Yoga Studio',
      attendees: 12,
      max_attendees: 25,
      image: '/api/placeholder/400/200',
    },
    {
      id: 'mock-3',
      title: 'Art Gallery Opening',
      description: 'New contemporary art exhibition featuring local artists',
      start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      location: 'Modern Art Gallery',
      category: 'Culture',
      organizer: 'Art Gallery Collective',
      attendees: 28,
      max_attendees: 50,
      image: '/api/placeholder/400/200',
    },
    {
      id: 'mock-4',
      title: 'Sunday Brunch Meetup',
      description: 'Casual brunch and networking event for professionals',
      start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      location: 'Café Central',
      category: 'Social',
      organizer: 'Professional Network',
      attendees: 18,
      max_attendees: 30,
      image: '/api/placeholder/400/200',
    },
    {
      id: 'mock-5',
      title: 'Weekend Hiking Adventure',
      description: 'Guided hiking trail through scenic mountain paths',
      start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      location: 'Mountain Trail Park',
      category: 'Outdoor',
      organizer: 'Adventure Club',
      attendees: 8,
      max_attendees: 15,
      image: '/api/placeholder/400/200',
    },
  ]

  // Filter by category if not 'all'
  const filteredEvents = category.toLowerCase() === 'all' 
    ? mockEvents 
    : mockEvents.filter(event => event.category.toLowerCase() === category.toLowerCase())

  // Limit results
  const limitedEvents = filteredEvents.slice(0, parseInt(limit))

  return NextResponse.json({
    events: limitedEvents,
    source: 'mock',
    location,
    category,
    total: limitedEvents.length,
  })
}
