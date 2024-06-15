"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Sun, Moon, Star, CalendarDays } from "lucide-react"
import { useWeekendStore, type ScheduledActivity } from "@/hooks/use-weekend-store"

interface LongWeekend {
  id: string
  name: string
  startDate: Date
  endDate: Date
  days: string[]
  isUpcoming: boolean
}

export function TimelineWeekendPlanner() {
  const { weekendPlan, getActivitiesForDay } = useWeekendStore()
  const [viewMode, setViewMode] = useState<"timeline" | "calendar" | "cards">("timeline")
  const [selectedWeekend, setSelectedWeekend] = useState<"regular" | "long">("regular")
  const [upcomingLongWeekends, setUpcomingLongWeekends] = useState<LongWeekend[]>([])

  useEffect(() => {
    // Generate upcoming long weekends for the next 3 months
    const longWeekends = generateUpcomingLongWeekends()
    setUpcomingLongWeekends(longWeekends)
  }, [])

  const generateUpcomingLongWeekends = (): LongWeekend[] => {
    const weekends: LongWeekend[] = []
    const today = new Date()
    
    // Check next 3 months for long weekends
    for (let i = 0; i < 90; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Check if it's a Friday (3-day weekend) or Thursday (4-day weekend)
      if (date.getDay() === 5) { // Friday
        const saturday = new Date(date)
        saturday.setDate(date.getDate() + 1)
        const sunday = new Date(date)
        sunday.setDate(date.getDate() + 2)
        
        weekends.push({
          id: `long-${date.getTime()}`,
          name: `3-Day Weekend (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
          startDate: date,
          endDate: sunday,
          days: ['friday', 'saturday', 'sunday'],
          isUpcoming: true
        })
      }
    }
    
    return weekends.slice(0, 4) // Return next 4 long weekends
  }

  const getActivitiesForLongWeekend = (days: string[]) => {
    return days.map(day => ({
      day,
      activities: getActivitiesForDay(day as "saturday" | "sunday")
    }))
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDayIcon = (day: string) => {
    switch (day) {
      case 'friday': return <Calendar className="h-4 w-4" />
      case 'saturday': return <Sun className="h-4 w-4" />
      case 'sunday': return <Moon className="h-4 w-4" />
      default: return <CalendarDays className="h-4 w-4" />
    }
  }

  const getDayName = (day: string) => {
    switch (day) {
      case 'friday': return 'Friday'
      case 'saturday': return 'Saturday'
      case 'sunday': return 'Sunday'
      default: return day.charAt(0).toUpperCase() + day.slice(1)
    }
  }

  const TimelineView = () => (
    <div className="space-y-6">
      {selectedWeekend === "regular" ? (
        <div className="space-y-4">
          {['saturday', 'sunday'].map(day => {
            const activities = getActivitiesForDay(day as "saturday" | "sunday")
            return (
              <Card key={day} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    {getDayIcon(day)}
                    {getDayName(day)}
                    <Badge variant="outline" className="ml-auto">
                      {activities.length} activities
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {activities.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activities planned</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
                      {activities.map((activity, index) => (
                        <div key={`${activity.id}-${activity.day}`} className="relative flex items-start p-6">
                          <div className="absolute left-6 w-3 h-3 bg-primary rounded-full -translate-x-1.5"></div>
                          <div className="ml-8 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{activity.title}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {activity.category}
                              </Badge>
                            </div>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {activity.startTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(activity.startTime)}
                                </div>
                              )}
                              {activity.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                                </div>
                              )}
                              {activity.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {activity.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingLongWeekends.map(weekend => {
            const weekendActivities = getActivitiesForLongWeekend(weekend.days)
            return (
              <Card key={weekend.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    {weekend.name}
                    <Badge variant="outline" className="ml-auto">
                      {weekend.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekend.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {weekendActivities.map(({ day, activities }) => (
                    <div key={day} className="border-b last:border-b-0">
                      <div className="p-4 bg-muted/30">
                        <h4 className="font-medium flex items-center gap-2">
                          {getDayIcon(day)}
                          {getDayName(day)}
                          <Badge variant="outline" className="text-xs">
                            {activities.length} activities
                          </Badge>
                        </h4>
                      </div>
                      {activities.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No activities planned</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {activities.map((activity) => (
                            <div key={`${activity.id}-${activity.day}`} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-sm">{activity.title}</h5>
                                  <Badge variant="secondary" className="text-xs">
                                    {activity.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {activity.startTime && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatTime(activity.startTime)}
                                    </div>
                                  )}
                                  {activity.duration && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  const CalendarView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {selectedWeekend === "regular" ? (
        ['saturday', 'sunday'].map(day => {
          const activities = getActivitiesForDay(day as "saturday" | "sunday")
          return (
            <Card key={day} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getDayIcon(day)}
                  {getDayName(day)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activities</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={`${activity.id}-${activity.day}`} className="p-3 bg-muted rounded-lg">
                      <h5 className="font-medium text-sm mb-1">{activity.title}</h5>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {activity.startTime && (
                          <span>{formatTime(activity.startTime)}</span>
                        )}
                        {activity.duration && (
                          <span>• {Math.floor(activity.duration / 60)}h {activity.duration % 60}m</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })
      ) : (
        upcomingLongWeekends.map(weekend => {
          const weekendActivities = getActivitiesForLongWeekend(weekend.days)
          return (
            <Card key={weekend.id} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {weekend.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weekendActivities.map(({ day, activities }) => (
                  <div key={day}>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      {getDayIcon(day)}
                      {getDayName(day)}
                    </h4>
                    <div className="space-y-2">
                      {activities.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No activities</p>
                      ) : (
                        activities.map((activity) => (
                          <div key={`${activity.id}-${activity.day}`} className="p-2 bg-muted rounded text-xs">
                            <div className="font-medium">{activity.title}</div>
                            {activity.startTime && (
                              <div className="text-muted-foreground">{formatTime(activity.startTime)}</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Weekend Planner</h2>
          <p className="text-muted-foreground">Plan your perfect weekend with timeline view</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedWeekend === "regular" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedWeekend("regular")}
          >
            Regular Weekend
          </Button>
          <Button
            variant={selectedWeekend === "long" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedWeekend("long")}
          >
            Long Weekend
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "timeline" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("timeline")}
        >
          Timeline
        </Button>
        <Button
          variant={viewMode === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("calendar")}
        >
          Calendar
        </Button>
        <Button
          variant={viewMode === "cards" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("cards")}
        >
          Cards
        </Button>
      </div>

      {viewMode === "timeline" && <TimelineView />}
      {viewMode === "calendar" && <CalendarView />}
      {viewMode === "cards" && <TimelineView />}
    </div>
  )
}

