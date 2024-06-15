// Calendar Service for fetching real-time holiday and long weekend data

export interface Holiday {
  name: string
  date: string
  type: 'public' | 'observance' | 'optional'
  country: string
  description?: string
}

export interface LongWeekend {
  id: string
  name: string
  startDate: Date
  endDate: Date
  days: string[]
  isUpcoming: boolean
  daysUntil: number
  reason: string
  holidays: Holiday[]
}

export interface CalendarServiceConfig {
  country?: string
  region?: string
  apiKey?: string
}

class CalendarService {
  private config: CalendarServiceConfig

  constructor(config: CalendarServiceConfig = {}) {
    this.config = {
      country: config.country || 'US',
      region: config.region || '',
      apiKey: config.apiKey || ''
    }
  }

  /**
   * Fetch holidays from multiple sources
   */
  async fetchHolidays(startDate: Date, endDate: Date): Promise<Holiday[]> {
    try {
      // Try multiple APIs in order of preference
      const holidays = await Promise.allSettled([
        this.fetchFromHolidayAPI(startDate, endDate),
        this.fetchFromGoogleCalendar(startDate, endDate),
        this.getMockHolidays(startDate, endDate) // Fallback
      ])

      // Combine results from successful API calls
      const allHolidays: Holiday[] = []
      holidays.forEach(result => {
        if (result.status === 'fulfilled') {
          allHolidays.push(...result.value)
        }
      })

      // Remove duplicates and sort by date
      return this.deduplicateHolidays(allHolidays).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    } catch (error) {
      console.error('Error fetching holidays:', error)
      return this.getMockHolidays(startDate, endDate)
    }
  }

  /**
   * Fetch from Holiday API (free tier available)
   */
  private async fetchFromHolidayAPI(startDate: Date, endDate: Date): Promise<Holiday[]> {
    try {
      const startYear = startDate.getFullYear()
      const endYear = endDate.getFullYear()
      const holidays: Holiday[] = []

      // Fetch for each year in range
      for (let year = startYear; year <= endYear; year++) {
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/${this.config.country}`
        )
        
        if (response.ok) {
          const responseText = await response.text()
          console.log(`🗓️ Nager.Date response for ${year}: ${responseText.length} characters`)
          
          if (responseText.trim()) {
            try {
              const yearHolidays = JSON.parse(responseText)
              holidays.push(...yearHolidays.map((holiday: any) => ({
                name: holiday.name,
                date: holiday.date,
                type: 'public' as const,
                country: this.config.country || 'US',
                description: holiday.localName || holiday.name
              })))
              console.log(`🗓️ Added ${yearHolidays.length} holidays for ${year}`)
            } catch (parseError) {
              console.warn(`🗓️ Failed to parse JSON for ${year}:`, parseError)
            }
          } else {
            console.log(`🗓️ Empty response for ${year}`)
          }
        } else {
          console.log(`🗓️ Nager.Date API failed for ${year}: ${response.status} ${response.statusText}`)
        }
      }

      // Filter by date range
      return holidays.filter(holiday => {
        const holidayDate = new Date(holiday.date)
        return holidayDate >= startDate && holidayDate <= endDate
      })
    } catch (error) {
      console.warn('Holiday API failed:', error)
      return []
    }
  }

  /**
   * Fetch from Google Calendar API (if API key provided)
   */
  private async fetchFromGoogleCalendar(startDate: Date, endDate: Date): Promise<Holiday[]> {
    if (!this.config.apiKey) {
      console.log('🗓️ No Google Calendar API key provided')
      return []
    }

    try {
      // Try different calendar IDs for different countries
      const country = this.config.country || 'US'
      let calendarIds = [
        `${country}__en@holiday.calendar.google.com`, // Primary
        `en.${country}@holiday.calendar.google.com`, // Alternative
        `en.${country.toLowerCase()}@holiday.calendar.google.com` // Lowercase alternative
      ]

      // Special handling for specific countries
      if (country === 'IN') {
        calendarIds = [
          'india__en@holiday.calendar.google.com',
          'en.india@holiday.calendar.google.com',
          'en.in@holiday.calendar.google.com',
          'IN__en@holiday.calendar.google.com'
        ]
      }

      const timeMin = startDate.toISOString()
      const timeMax = endDate.toISOString()

      for (const calendarId of calendarIds) {
        try {
          console.log(`🗓️ Trying Google Calendar: ${calendarId}`)
          
          const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?` +
            `key=${this.config.apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
          )

          if (response.ok) {
            const data = await response.json()
            const holidays = data.items?.map((event: any) => ({
              name: event.summary,
              date: event.start.date || event.start.dateTime?.split('T')[0],
              type: 'public' as const,
              country: this.config.country || 'US',
              description: event.description || ''
            })) || []
            
            if (holidays.length > 0) {
              console.log(`🗓️ Found ${holidays.length} holidays from Google Calendar: ${calendarId}`)
              return holidays
            }
          } else {
            console.log(`🗓️ Calendar ${calendarId} not available (${response.status})`)
          }
        } catch (calendarError) {
          console.log(`🗓️ Error with calendar ${calendarId}:`, calendarError)
        }
      }
      
      console.log('🗓️ No Google Calendar holidays found for any calendar ID')
    } catch (error) {
      console.warn('🗓️ Google Calendar API failed:', error)
    }

    return []
  }

  /**
   * Detect long weekends based on holidays
   */
  async detectLongWeekends(startDate: Date, endDate: Date): Promise<LongWeekend[]> {
    const holidays = await this.fetchHolidays(startDate, endDate)
    const longWeekends: LongWeekend[] = []
    const today = new Date()

    console.log(`🗓️ Analyzing ${holidays.length} holidays for long weekend detection`)

    // Only check holidays - no regular weekends
    for (const holiday of holidays) {
      const holidayDate = new Date(holiday.date)
      const longWeekend = this.analyzeLongWeekend(holiday, holidayDate, today)
      
      if (longWeekend) {
        console.log(`🗓️ Found holiday-based long weekend: ${holiday.name} on ${holiday.date}`)
        longWeekends.push(longWeekend)
      }
    }

    // Sort by days until and remove duplicates
    const result = this.deduplicateLongWeekends(longWeekends)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 10) // Limit to next 10 long weekends

    console.log(`🗓️ Detected ${result.length} holiday-based long weekends`)
    return result
  }

  /**
   * Analyze if a holiday creates a long weekend
   */
  private analyzeLongWeekend(holiday: Holiday, holidayDate: Date, today: Date): LongWeekend | null {
    const dayOfWeek = holidayDate.getDay()
    const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) return null // Past holiday

    let longWeekend: LongWeekend | null = null

    // Friday holiday = Thursday-Friday-Saturday-Sunday (4-day weekend)
    if (dayOfWeek === 5) {
      const thursday = new Date(holidayDate)
      thursday.setDate(holidayDate.getDate() - 1)
      const sunday = new Date(holidayDate)
      sunday.setDate(holidayDate.getDate() + 2)

      longWeekend = {
        id: `holiday-${holiday.date}-friday`,
        name: `${holiday.name} Weekend`,
        startDate: thursday,
        endDate: sunday,
        days: ['thursday', 'friday', 'saturday', 'sunday'],
        isUpcoming: daysUntil <= 30,
        daysUntil,
        reason: `Public holiday: ${holiday.name}`,
        holidays: [holiday]
      }
    }
    // Monday holiday = Saturday-Sunday-Monday (3-day weekend)
    else if (dayOfWeek === 1) {
      const saturday = new Date(holidayDate)
      saturday.setDate(holidayDate.getDate() - 2)
      const monday = holidayDate

      longWeekend = {
        id: `holiday-${holiday.date}-monday`,
        name: `${holiday.name} Weekend`,
        startDate: saturday,
        endDate: monday,
        days: ['saturday', 'sunday', 'monday'],
        isUpcoming: daysUntil <= 30,
        daysUntil,
        reason: `Public holiday: ${holiday.name}`,
        holidays: [holiday]
      }
    }
    // Tuesday holiday = Friday-Monday (4-day weekend if Friday is taken off)
    else if (dayOfWeek === 2) {
      const friday = new Date(holidayDate)
      friday.setDate(holidayDate.getDate() - 4)
      const monday = holidayDate

      longWeekend = {
        id: `holiday-${holiday.date}-tuesday`,
        name: `${holiday.name} Long Weekend`,
        startDate: friday,
        endDate: monday,
        days: ['friday', 'saturday', 'sunday', 'monday'],
        isUpcoming: daysUntil <= 30,
        daysUntil,
        reason: `Public holiday: ${holiday.name} (bridge day)`,
        holidays: [holiday]
      }
    }

    return longWeekend
  }


  /**
   * Remove duplicate holidays
   */
  private deduplicateHolidays(holidays: Holiday[]): Holiday[] {
    const seen = new Set<string>()
    return holidays.filter(holiday => {
      const key = `${holiday.date}-${holiday.name}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /**
   * Remove duplicate long weekends
   */
  private deduplicateLongWeekends(longWeekends: LongWeekend[]): LongWeekend[] {
    const seen = new Set<string>()
    return longWeekends.filter(weekend => {
      if (seen.has(weekend.id)) return false
      seen.add(weekend.id)
      return true
    })
  }

  /**
   * Mock holidays for fallback
   */
  private getMockHolidays(startDate: Date, endDate: Date): Holiday[] {
    const year = startDate.getFullYear()
    
    // Different mock holidays based on country
    if (this.config.country === 'IN') {
      const mockHolidays: Holiday[] = [
        {
          name: 'Republic Day',
          date: `${year}-01-26`,
          type: 'public',
          country: 'IN',
          description: 'Republic Day of India'
        },
        {
          name: 'Independence Day',
          date: `${year}-08-15`,
          type: 'public',
          country: 'IN',
          description: 'Independence Day of India'
        },
        {
          name: 'Gandhi Jayanti',
          date: `${year}-10-02`,
          type: 'public',
          country: 'IN',
          description: 'Birth anniversary of Mahatma Gandhi'
        },
        {
          name: 'Diwali',
          date: `${year}-11-01`,
          type: 'public',
          country: 'IN',
          description: 'Festival of Lights'
        },
        {
          name: 'Christmas Day',
          date: `${year}-12-25`,
          type: 'public',
          country: 'IN',
          description: 'Christmas Day'
        }
      ]
      
      // Add some upcoming holidays for testing (next few weeks)
      const today = new Date()
      const nextFriday = new Date(today)
      nextFriday.setDate(today.getDate() + (5 - today.getDay() + 7) % 7) // Next Friday
      
      const nextMonday = new Date(today)
      nextMonday.setDate(today.getDate() + (1 - today.getDay() + 7) % 7) // Next Monday
      
      const nextThursday = new Date(today)
      nextThursday.setDate(today.getDate() + (4 - today.getDay() + 7) % 7) // Next Thursday
      
      // Add test holidays for the next few weeks
      mockHolidays.push(
        {
          name: 'Test Friday Holiday',
          date: nextFriday.toISOString().split('T')[0],
          type: 'public',
          country: 'IN',
          description: 'Test holiday for Friday'
        },
        {
          name: 'Test Monday Holiday',
          date: nextMonday.toISOString().split('T')[0],
          type: 'public',
          country: 'IN',
          description: 'Test holiday for Monday'
        },
        {
          name: 'Test Thursday Holiday',
          date: nextThursday.toISOString().split('T')[0],
          type: 'public',
          country: 'IN',
          description: 'Test holiday for Thursday'
        }
      )
      
      return mockHolidays.filter(holiday => {
        const holidayDate = new Date(holiday.date)
        return holidayDate >= startDate && holidayDate <= endDate
      })
    }
    
    // Default US holidays
    const mockHolidays: Holiday[] = [
      {
        name: 'New Year\'s Day',
        date: `${year}-01-01`,
        type: 'public',
        country: this.config.country || 'US',
        description: 'New Year celebration'
      },
      {
        name: 'Independence Day',
        date: `${year}-07-04`,
        type: 'public',
        country: this.config.country || 'US',
        description: 'Independence Day'
      },
      {
        name: 'Christmas Day',
        date: `${year}-12-25`,
        type: 'public',
        country: this.config.country || 'US',
        description: 'Christmas celebration'
      }
    ]

    return mockHolidays.filter(holiday => {
      const holidayDate = new Date(holiday.date)
      return holidayDate >= startDate && holidayDate <= endDate
    })
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CalendarServiceConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): CalendarServiceConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const calendarService = new CalendarService()

// Export class for custom instances
export { CalendarService }
