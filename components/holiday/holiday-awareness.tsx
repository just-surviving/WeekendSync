"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Sparkles, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface HolidayInfo {
  name: string
  date: string
  type: string
  description: string
  suggestions: string[]
  isLongWeekend: boolean
  daysOff: number
}

interface HolidayAwarenessProps {
  userLocation?: {
    country: string
    region?: string
  }
}

export function HolidayAwareness({ userLocation }: HolidayAwarenessProps) {
  const [holidays, setHolidays] = useState<HolidayInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHolidaySuggestions()
  }, [userLocation])

  const fetchHolidaySuggestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const country = userLocation?.country || "United States"
      const region = userLocation?.region || ""

      const response = await fetch('/api/gemini/holiday-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country,
          region,
          months: 3 // Next 3 months
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch holiday suggestions')
      }

      const data = await response.json()
      setHolidays(data.holidays || [])
    } catch (err) {
      console.error('Error fetching holiday suggestions:', err)
      setError('Failed to load holiday suggestions')
      // Fallback to mock data
      setHolidays(getMockHolidays())
    } finally {
      setLoading(false)
    }
  }

  const getMockHolidays = (): HolidayInfo[] => {
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const twoMonths = new Date(today.getFullYear(), today.getMonth() + 2, 1)

    return [
      {
        name: "New Year's Day",
        date: "2024-01-01",
        type: "National Holiday",
        description: "Start the year with a fresh perspective and new goals",
        suggestions: ["Plan a resolution party", "Take a winter getaway", "Organize a family gathering"],
        isLongWeekend: true,
        daysOff: 3
      },
      {
        name: "Martin Luther King Jr. Day",
        date: "2024-01-15",
        type: "Federal Holiday",
        description: "Honor the legacy of civil rights leader Martin Luther King Jr.",
        suggestions: ["Volunteer in your community", "Visit historical sites", "Attend cultural events"],
        isLongWeekend: true,
        daysOff: 3
      },
      {
        name: "Presidents' Day",
        date: "2024-02-19",
        type: "Federal Holiday",
        description: "Celebrate the contributions of U.S. presidents",
        suggestions: ["Plan a ski trip", "Visit presidential museums", "Host a themed party"],
        isLongWeekend: true,
        daysOff: 3
      }
    ]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    const holiday = new Date(dateString)
    const diffTime = holiday.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Holiday Awareness
          </CardTitle>
          <CardDescription>Discover upcoming long weekends and plan ahead</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Holiday Awareness
          </CardTitle>
          <CardDescription>Discover upcoming long weekends and plan ahead</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchHolidaySuggestions} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="w-full"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#FFFFFF' }}>
          <Calendar className="h-4 w-4" style={{ color: '#4DD9CB' }} />
          Holiday Awareness
        </CardTitle>
        <CardDescription className="text-sm" style={{ color: '#B8C4E6' }}>
          Discover upcoming long weekends and plan ahead
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {holidays.length === 0 ? (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No upcoming holidays found</p>
            </div>
          ) : (
            holidays.slice(0, 2).map((holiday, index) => {
              const daysUntil = getDaysUntil(holiday.date)
              const isUpcoming = daysUntil >= 0 && daysUntil <= 30

              if (!isUpcoming) return null

              return (
                <div
                  key={index}
                  className="rounded-lg p-3 transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, rgba(74, 127, 255, 0.08) 0%, rgba(74, 127, 255, 0.02) 100%)',
                    border: '1px solid rgba(74, 127, 255, 0.15)',
                    borderRadius: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 127, 255, 0.12) 0%, rgba(74, 127, 255, 0.04) 100%)'
                    e.currentTarget.style.borderColor = 'rgba(74, 127, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(74, 127, 255, 0.08) 0%, rgba(74, 127, 255, 0.02) 100%)'
                    e.currentTarget.style.borderColor = 'rgba(74, 127, 255, 0.15)'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base" style={{ color: '#FFFFFF' }}>
                          {holiday.name}
                        </h3>
                        {holiday.isLongWeekend && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              background: 'rgba(77, 217, 203, 0.1)',
                              color: '#4DD9CB',
                              border: '1px solid rgba(77, 217, 203, 0.2)'
                            }}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {holiday.daysOff} days off
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs mb-2" style={{ color: '#7A86A8' }}>
                        {formatDate(holiday.date)} • {holiday.type}
                      </p>
                      <p className="text-xs mb-2" style={{ color: '#B8C4E6' }}>{holiday.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: '#4DD9CB' }}>
                        {daysUntil === 0 ? "Today" : `${daysUntil}d`}
                      </div>
                      <div className="text-xs" style={{ color: '#7A86A8' }}>
                        {daysUntil === 0 ? "Holiday!" : "until"}
                      </div>
                    </div>
                  </div>

                  {holiday.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        <Sparkles className="h-3 w-3 inline mr-1" />
                        Suggested Activities:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {holiday.suggestions.slice(0, 4).map((suggestion, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-primary/10"
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      style={{
                        background: '#4DD9CB',
                        color: '#0A0E27',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 16px rgba(77, 217, 203, 0.2)'
                      }}
                      onClick={() => {
                        console.log('Add holiday to planner:', holiday)
                      }}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Plan Weekend
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#B8C4E6',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        fontSize: '0.75rem'
                      }}
                      onClick={() => {
                        window.open('https://calendar.google.com', '_blank')
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Add to Calendar
                    </Button>
                  </div>
                </div>
              )
            })
          )}

        </div>
      </CardContent>
    </Card>
  )
}
