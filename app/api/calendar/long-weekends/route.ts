import { NextRequest, NextResponse } from 'next/server'
import { calendarService } from '@/lib/calendar-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
      const country = searchParams.get('country') || 'IN'
    const region = searchParams.get('region') || ''
        
    console.log('🗓️ Calendar API: Fetching long weekends for:', { country, region })

    // Configure calendar service with Google API key
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (googleApiKey) {
      calendarService.updateConfig({ country, region, apiKey: googleApiKey })
      console.log('🗓️ Calendar API: Using Google Calendar API with key')
    } else {
      console.log('🗓️ Calendar API: No Google API key, using fallback data')
    }

    // Get date range (next 3 months)
    const today = new Date()
    const endDate = new Date()
    endDate.setMonth(today.getMonth() + 3)

    // Fetch long weekends
    const longWeekends = await calendarService.detectLongWeekends(today, endDate)

    console.log('🗓️ Calendar API: Found long weekends:', longWeekends.length)

    // Serialize dates to strings for JSON response
    const serializedLongWeekends = longWeekends.map(weekend => ({
      ...weekend,
      startDate: weekend.startDate.toISOString(),
      endDate: weekend.endDate.toISOString()
    }))

    return NextResponse.json({
      success: true,
      longWeekends: serializedLongWeekends,
      country,
      region,
      apiSource: googleApiKey ? 'google-calendar' : 'fallback',
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('🗓️ Calendar API: Error fetching long weekends:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch long weekends',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country = 'US', region = '', apiKey = '' } = body

    console.log('🗓️ Calendar API: POST request for:', { country, region })

    // Update calendar service configuration
    calendarService.updateConfig({ country, region, apiKey })

    // Get date range (next 3 months)
    const today = new Date()
    const endDate = new Date()
    endDate.setMonth(today.getMonth() + 3)

    // Fetch both holidays and long weekends
    const [holidays, longWeekends] = await Promise.all([
      calendarService.fetchHolidays(today, endDate),
      calendarService.detectLongWeekends(today, endDate)
    ])

    console.log('🗓️ Calendar API: Found holidays:', holidays.length, 'long weekends:', longWeekends.length)

    // Serialize dates to strings for JSON response
    const serializedLongWeekends = longWeekends.map(weekend => ({
      ...weekend,
      startDate: weekend.startDate.toISOString(),
      endDate: weekend.endDate.toISOString()
    }))

    return NextResponse.json({
      success: true,
      holidays,
      longWeekends: serializedLongWeekends,
      country,
      region,
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('🗓️ Calendar API: Error in POST request:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch calendar data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
