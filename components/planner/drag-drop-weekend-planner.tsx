"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Clock, MapPin, X, Calendar, Sun, Moon, Smile, Heart, Zap, Star, Leaf, PartyPopper, Coffee } from "lucide-react"
import { useWeekendStore, type Activity, type ScheduledActivity } from "@/hooks/use-weekend-store"
import { useTheme } from "@/contexts/theme-context"
import { type WeekendTheme } from "./weekend-theme-selector"
import { WeekendPlanExport } from "./weekend-plan-export"

export function DragDropWeekendPlanner() {
  const {
    weekendPlan,
    showMonday,
    showFriday,
    addToWeekend,
    removeFromWeekend,
    updateScheduledActivity,
    getActivitiesForDay,
    toggleMonday,
    toggleFriday,
    isLongWeekendMode,
    getLongWeekendDays
  } = useWeekendStore()

  const [editingActivity, setEditingActivity] = useState<ScheduledActivity | null>(null)
  const [holidayDays, setHolidayDays] = useState<string[]>([])
  const [currentLongWeekend, setCurrentLongWeekend] = useState<any>(null)
  const { selectedTheme } = useTheme()

  // Get all available days based on long weekend mode and actual holidays
  const availableDays = getLongWeekendDays(holidayDays)
  const isLongWeekend = isLongWeekendMode

  // Fetch holiday information when long weekend mode is enabled
  useEffect(() => {
    if (isLongWeekendMode) {
      fetchHolidayDays()
    } else {
      setHolidayDays([])
    }
  }, [isLongWeekendMode])

  const fetchHolidayDays = async () => {
    try {
      const response = await fetch('/api/calendar/long-weekends?country=IN')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.longWeekends.length > 0) {
          // Get the most immediate long weekend (closest to today)
          const upcomingLongWeekend = data.longWeekends[0]
          setHolidayDays(upcomingLongWeekend.days || [])
          setCurrentLongWeekend(upcomingLongWeekend)
          console.log('🗓️ Found holiday days:', upcomingLongWeekend.days, 'for:', upcomingLongWeekend.name)
        } else {
          // No holidays found, use fallback long weekend days
          console.log('🗓️ No holidays found, using fallback long weekend days')
          setHolidayDays(['friday', 'monday']) // Common long weekend days
        }
      }
    } catch (error) {
      console.error('Error fetching holiday days:', error)
      // Use fallback on error
      setHolidayDays(['friday', 'monday'])
    }
  }

  const saturdayActivities = getActivitiesForDay("saturday")
  const sundayActivities = getActivitiesForDay("sunday")
  const fridayActivities = getActivitiesForDay("friday")
  const mondayActivities = getActivitiesForDay("monday")
  const thursdayActivities = getActivitiesForDay("thursday")

  const [dragOverDay, setDragOverDay] = useState<"saturday" | "sunday" | "friday" | "monday" | "thursday" | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Set the drop effect to indicate this is a valid drop target
    e.dataTransfer.dropEffect = "move"
    console.log("🎯 Drag over detected on drop zone")
  }

  const handleDragEnter = (e: React.DragEvent, day: "saturday" | "sunday" | "friday" | "monday" | "thursday") => {
    e.preventDefault()
    e.stopPropagation()
    console.log("🎯 Drag entered", day)
    setDragOverDay(day)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation()
    // Only clear if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      console.log("🎯 Drag left drop zone")
      setDragOverDay(null)
    }
  }

  const handleDrop = (e: React.DragEvent, day: "saturday" | "sunday" | "friday" | "monday" | "thursday") => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverDay(null)
    console.log("🎯 Drop event triggered for", day)

    try {
      // Get all available data types
      const types = Array.from(e.dataTransfer.types)
      console.log("Available data types:", types)

      // Try to get activity data from multiple formats for better compatibility
      let activityData = e.dataTransfer.getData("application/json")
      let textData = e.dataTransfer.getData("text/plain")

      console.log("📦 Activity data received (JSON):", activityData)
      console.log("📦 Activity data received (text):", textData)

      // If no JSON data, try to parse text data
      if (!activityData && textData) {
        try {
          activityData = textData
          console.log("📦 Using text data as JSON:", activityData)
        } catch (parseError) {
          console.error("❌ Failed to parse text data:", parseError)
        }
      }

      // If still no data, try alternative data types
      if (!activityData) {
        for (const type of types) {
          const data = e.dataTransfer.getData(type)
          if (data) {
            console.log(`📦 Trying data from type ${type}:`, data)
            try {
              activityData = data
              break
            } catch (parseError) {
              console.log(`❌ Failed to parse data from ${type}`)
            }
          }
        }
      }

      if (!activityData) {
        console.error("❌ No activity data found in drop event")
        console.error("Available types:", types)
        return
      }

      const activity: Activity = JSON.parse(activityData)
      console.log("✅ Parsed activity:", activity.title)

      // Check if activity is already scheduled for this day
      const existingActivity = weekendPlan.find(a => a.id === activity.id && a.day === day)
      if (existingActivity) {
        console.log("⚠️ Activity already scheduled for this day")
        return
      }

      console.log("🎉 Adding activity directly to weekend plan:", activity.title)
      addToWeekend(activity, day)
    } catch (error) {
      console.error("❌ Failed to parse dropped activity:", error)
      console.error("Raw data:", e.dataTransfer.getData("application/json"))
      console.error("Text data:", e.dataTransfer.getData("text/plain"))
    }
  }

  const handleUpdateActivity = () => {
    if (!editingActivity) return
    updateScheduledActivity(editingActivity.id, editingActivity.day, editingActivity)
    setEditingActivity(null)
  }


  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const getMoodIcon = (mood: ScheduledActivity["mood"]) => {
    const iconProps = { className: "h-3 w-3" }
    switch (mood) {
      case "happy": return <Smile {...iconProps} />
      case "relaxed": return <Leaf {...iconProps} />
      case "energetic": return <Zap {...iconProps} />
      case "excited": return <Star {...iconProps} />
      case "peaceful": return <Heart {...iconProps} />
      default: return null
    }
  }

  const getMoodColor = (mood: ScheduledActivity["mood"]) => {
    switch (mood) {
      case "happy": return "text-yellow-600 bg-yellow-100"
      case "relaxed": return "text-green-600 bg-green-100"
      case "energetic": return "text-red-600 bg-red-100"
      case "excited": return "text-purple-600 bg-purple-100"
      case "peaceful": return "text-blue-600 bg-blue-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const calculateTotalDuration = (activities: ScheduledActivity[]) => {
    const total = activities.reduce((sum, activity) => sum + (activity.duration || 0), 0)
    return formatDuration(total)
  }

  const ActivityItem = ({ activity, day }: { activity: ScheduledActivity; day: "saturday" | "sunday" | "friday" | "monday" | "thursday" }) => (
    <Card className="glass-card group scale-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-sm">{activity.title}</h4>
              <Badge className="text-xs bg-muted text-muted-foreground border-0 rounded-md">
                {activity.category}
              </Badge>
              {activity.activityType && (
                <Badge variant="outline" className="text-xs capitalize bg-muted text-muted-foreground border-0 rounded-md">
                  {activity.activityType}
                </Badge>
              )}
            </div>
            {activity.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{activity.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {activity.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(activity.duration)}
                </div>
              )}
              {activity.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {activity.location}
                </div>
              )}
              {activity.startTime && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {activity.startTime}
                </div>
              )}
              {activity.mood && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getMoodColor(activity.mood)}`}>
                  {getMoodIcon(activity.mood)}
                  <span className="capitalize text-xs">{activity.mood}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={() => setEditingActivity(activity)} className="h-8 w-8 p-0">
              <Calendar className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeFromWeekend(activity.id, day)}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const DayColumn = ({
    day,
    activities,
    icon: Icon,
    title,
  }: {
    day: "saturday" | "sunday" | "friday" | "monday" | "thursday"
    activities: ScheduledActivity[]
    icon: React.ComponentType<{ className?: string }>
    title: string
  }) => (
    <Card
      className={`flex-1 min-h-[400px] border-2 border-dashed transition-all duration-300 bg-card ${dragOverDay === day
        ? "border-primary bg-primary/10 scale-[1.02] shadow-xl border-solid"
        : "border-border hover:border-primary/50"
        }`}
      onDragOver={handleDragOver}
      onDragEnter={(e) => {
        handleDragEnter(e, day)
      }}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        console.log("🎯 Drop triggered on day column:", day)
        handleDrop(e, day)
      }}
      style={{
        minHeight: '400px',
        position: 'relative'
      }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
          <Badge variant="outline" className="ml-auto">
            {activities.length} activities
          </Badge>
        </CardTitle>
        {activities.length > 0 && (
          <div className="text-sm text-muted-foreground">Total duration: {calculateTotalDuration(activities)}</div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon className="h-16 w-16 mx-auto mb-4 opacity-40" />
            <p className="text-base font-medium mb-2">Drop activities here</p>
            <p className="text-sm">Drag activity cards from above</p>
            <div className="mt-4 px-4 py-2 bg-muted/50 rounded-lg text-xs inline-block">
              💡 Drag any activity card and drop it here to add to {title}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const activityName = window.prompt('Enter activity name:')
                if (activityName) {
                  const newActivity: Activity = {
                    id: `custom-${Date.now()}`,
                    title: activityName,
                    category: 'Custom',
                    duration: 60,
                    description: 'Custom activity',
                    location: '',
                    activityType: 'indoor',
                    isPredefined: false
                  }
                  addToWeekend(newActivity, day)
                }
              }}
            >
              + Add Custom Activity
            </Button>
          </div>
        ) : (
          <>
            {activities.map((activity) => (
              <ActivityItem key={`${activity.id}-${activity.day}`} activity={activity} day={day} />
            ))}
            <div className="pt-2 border-t border-dashed">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const activityName = window.prompt('Enter activity name:')
                  if (activityName) {
                    const newActivity: Activity = {
                      id: `custom-${Date.now()}`,
                      title: activityName,
                      category: 'Custom',
                      duration: 60,
                      description: 'Custom activity',
                      location: '',
                      activityType: 'indoor',
                      isPredefined: false
                    }
                    addToWeekend(newActivity, day)
                  }
                }}
              >
                + Add More Activities
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  // Helper function to get day icon
  const getDayIcon = (day: string) => {
    switch (day) {
      case 'thursday': return Calendar
      case 'friday': return PartyPopper
      case 'saturday': return Sun
      case 'sunday': return Moon
      case 'monday': return Coffee
      default: return Calendar
    }
  }

  // Helper function to get day title
  const getDayTitle = (day: string) => {
    const baseTitle = day.charAt(0).toUpperCase() + day.slice(1)

    // Add holiday indicator for non-weekend days
    if (isLongWeekend && holidayDays.includes(day) && day !== 'saturday' && day !== 'sunday') {
      return `${baseTitle} 🎉`
    }

    return baseTitle
  }

  // Helper function to get day activities
  const getDayActivities = (day: string) => {
    switch (day) {
      case 'thursday': return thursdayActivities
      case 'friday': return fridayActivities
      case 'saturday': return saturdayActivities
      case 'sunday': return sundayActivities
      case 'monday': return mondayActivities
      default: return []
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          {/* Monday Button - Left Corner */}
          <Button
            size="sm"
            variant={showMonday ? "default" : "outline"}
            onClick={toggleMonday}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Monday</span>
            <span className="sm:hidden">Mon</span>
            {showMonday && <span className="ml-1">✓</span>}
          </Button>

          {/* Weekend Plan Title - Center */}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {isLongWeekend ? 'Long Weekend Plan' : 'Weekend Plan'}
          </h2>

          {/* Friday Button - Right Corner */}
          <Button
            size="sm"
            variant={showFriday ? "default" : "outline"}
            onClick={toggleFriday}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Friday</span>
            <span className="sm:hidden">Fri</span>
            {showFriday && <span className="ml-1">✓</span>}
          </Button>
        </div>
        {isLongWeekend && (
          <p className="text-sm text-muted-foreground">
            🎉 Long weekend mode enabled! Plan activities for extra days.
            {currentLongWeekend && (
              <span className="block mt-1">
                <strong>{currentLongWeekend.name}</strong> - {currentLongWeekend.reason}
              </span>
            )}
            {holidayDays.length > 0 && (
              <span className="block mt-1">
                Holiday days: {holidayDays.filter(day => day !== 'saturday' && day !== 'sunday').join(', ')}
              </span>
            )}
          </p>
        )}
      </div>

      <div className={`flex flex-col sm:flex-row gap-4 ${isLongWeekend || showFriday || showMonday ? 'sm:flex-wrap' : ''}`}>
        {availableDays.map((day) => {
          const DayIcon = getDayIcon(day)
          const activities = getDayActivities(day)
          return (
            <div key={day} className={`w-full sm:${isLongWeekend || showFriday || showMonday ? 'min-w-[280px] flex-1' : 'flex-1'}`}>
              <DayColumn
                day={day as any}
                activities={activities}
                icon={DayIcon}
                title={getDayTitle(day)}
              />
            </div>
          )
        })}

        {/* Friday Card */}
        {showFriday && (
          <div className="w-full sm:min-w-[280px] sm:flex-1">
            <DayColumn
              day="friday"
              activities={fridayActivities}
              icon={PartyPopper}
              title="Friday"
            />
          </div>
        )}

        {/* Monday Card */}
        {showMonday && (
          <div className="w-full sm:min-w-[280px] sm:flex-1">
            <DayColumn
              day="monday"
              activities={mondayActivities}
              icon={Coffee}
              title="Monday"
            />
          </div>
        )}
      </div>

      {(availableDays.some(day => getDayActivities(day).length > 0) ||
        (showFriday && fridayActivities.length > 0) ||
        (showMonday && mondayActivities.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isLongWeekend || showFriday || showMonday ? 'Extended Weekend Summary' : 'Weekend Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 sm:gap-6 ${isLongWeekend || showFriday || showMonday ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {availableDays.map((day) => {
                  const activities = getDayActivities(day)
                  const DayIcon = getDayIcon(day)
                  if (activities.length === 0) return null

                  return (
                    <div key={day}>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <DayIcon className="h-4 w-4" />
                        {getDayTitle(day)} ({activities.length} activities)
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        Duration: {calculateTotalDuration(activities)}
                      </div>
                    </div>
                  )
                })}

                {/* Friday Summary */}
                {showFriday && fridayActivities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <PartyPopper className="h-4 w-4" />
                      Friday ({fridayActivities.length} activities)
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      Duration: {calculateTotalDuration(fridayActivities)}
                    </div>
                  </div>
                )}

                {/* Monday Summary */}
                {showMonday && mondayActivities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      Monday ({mondayActivities.length} activities)
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      Duration: {calculateTotalDuration(mondayActivities)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}



      <Dialog open={!!editingActivity} onOpenChange={() => setEditingActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Activity</DialogTitle>
            <DialogDescription>Set timing and details for this activity</DialogDescription>
          </DialogHeader>
          {editingActivity && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time (Optional)</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={editingActivity.startTime || ""}
                  onChange={(e) => setEditingActivity({ ...editingActivity, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time (Optional)</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={editingActivity.endTime || ""}
                  onChange={(e) => setEditingActivity({ ...editingActivity, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mood">Mood/Vibe (Optional)</Label>
                <Select
                  value={editingActivity.mood || "none"}
                  onValueChange={(value) => setEditingActivity({ ...editingActivity, mood: value === "none" ? undefined : value as ScheduledActivity["mood"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No mood</SelectItem>
                    <SelectItem value="happy">😊 Happy</SelectItem>
                    <SelectItem value="relaxed">🍃 Relaxed</SelectItem>
                    <SelectItem value="energetic">⚡ Energetic</SelectItem>
                    <SelectItem value="excited">⭐ Excited</SelectItem>
                    <SelectItem value="peaceful">💙 Peaceful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={editingActivity.notes || ""}
                  onChange={(e) => setEditingActivity({ ...editingActivity, notes: e.target.value })}
                  placeholder="Add any notes about this activity..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingActivity(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateActivity}>Update Schedule</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
