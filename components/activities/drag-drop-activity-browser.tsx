"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Clock, MapPin, Edit, Heart, GripVertical, Mountain, Home, Coffee, Users, Zap, Palette, Dumbbell, TreePine, Sparkles } from "lucide-react"
import { useWeekendStore, type Activity } from "@/hooks/use-weekend-store"
import { type WeekendTheme } from "../planner/weekend-theme-selector"

const categories = [
  "All",
  "Food",
  "Outdoor",
  "Entertainment",
  "Leisure",
  "Shopping",
  "Culture",
  "Learning",
  "Sports",
  "Social",
  "Wellness",
  "Family",
  "Creative",
  "Fitness",
]

const activityTypeFilters = [
  "All Types",
  "outdoor",
  "indoor",
  "lazy",
  "family",
  "adventurous",
  "social",
  "creative",
  "fitness",
]

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "duration", label: "Duration" },
  { value: "type", label: "Activity Type" },
]

export function DragDropActivityBrowser() {
  const { activities, addActivity, updateActivity } = useWeekendStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedActivityType, setSelectedActivityType] = useState("All Types")
  const [sortBy, setSortBy] = useState("name")
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null)

  const filteredAndSortedActivities = useMemo(() => {
    const filtered = activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || activity.category === selectedCategory
      const matchesActivityType = selectedActivityType === "All Types" || activity.activityType === selectedActivityType

      return matchesSearch && matchesCategory && matchesActivityType
    })

    // Sort activities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "category":
          return a.category.localeCompare(b.category)
        case "duration":
          return (a.duration || 0) - (b.duration || 0)
        case "type":
          return (a.activityType || "").localeCompare(b.activityType || "")
        default:
          return 0
      }
    })

    return filtered
  }, [activities, searchQuery, selectedCategory, selectedActivityType, sortBy])

  const handleAddActivity = () => {
    if (!newActivity.title || !newActivity.category) return

    const activity: Activity = {
      id: Date.now().toString(),
      title: newActivity.title,
      category: newActivity.category,
      description: newActivity.description || "",
      duration: newActivity.duration || 60,
      location: newActivity.location || "",
      activityType: newActivity.activityType as Activity["activityType"],
      isPredefined: false,
    }

    addActivity(activity)
    setNewActivity({ title: "", category: "", description: "", duration: 60, location: "", activityType: "indoor" })
    setIsAddingActivity(false)
  }

  const handleUpdateActivity = () => {
    if (!editingActivity) return
    updateActivity(editingActivity.id, editingActivity)
    setEditingActivity(null)
  }

  const toggleFavorite = (activityId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(activityId)) {
      newFavorites.delete(activityId)
    } else {
      newFavorites.add(activityId)
    }
    setFavorites(newFavorites)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const getActivityTypeIcon = (activityType: Activity["activityType"]) => {
    const iconProps = { className: "h-4 w-4" }
    switch (activityType) {
      case "outdoor": return <Mountain {...iconProps} />
      case "indoor": return <Home {...iconProps} />
      case "lazy": return <Coffee {...iconProps} />
      case "family": return <Users {...iconProps} />
      case "adventurous": return <Zap {...iconProps} />
      case "social": return <Users {...iconProps} />
      case "creative": return <Palette {...iconProps} />
      case "fitness": return <Dumbbell {...iconProps} />
      default: return <TreePine {...iconProps} />
    }
  }

  const getActivityTypeColor = (activityType: Activity["activityType"]) => {
    switch (activityType) {
      case "outdoor": return "!bg-green-100 !text-green-800 dark:!bg-green-900 dark:!text-green-200"
      case "indoor": return "!bg-blue-100 !text-blue-800 dark:!bg-blue-900 dark:!text-blue-200"
      case "lazy": return "!bg-purple-100 !text-purple-800 dark:!bg-purple-900 dark:!text-purple-200"
      case "family": return "!bg-pink-100 !text-pink-800 dark:!bg-pink-900 dark:!text-pink-200"
      case "adventurous": return "!bg-orange-100 !text-orange-800 dark:!bg-orange-900 dark:!text-orange-200"
      case "social": return "!bg-yellow-100 !text-yellow-800 dark:!bg-yellow-900 dark:!text-yellow-200"
      case "creative": return "!bg-indigo-100 !text-indigo-800 dark:!bg-indigo-900 dark:!text-indigo-200"
      case "fitness": return "!bg-red-100 !text-red-800 dark:!bg-red-900 dark:!text-red-200"
      default: return "!bg-gray-100 !text-gray-800 dark:!bg-gray-900 dark:!text-gray-200"
    }
  }

  const handleDragStart = (e: React.DragEvent, activity: Activity) => {
    console.log("🚀 Drag started for activity:", activity.title)

    try {
      // Set dragged activity for visual feedback
      setDraggedActivityId(activity.id)

      // Ensure we have a valid dataTransfer object
      if (!e.dataTransfer) {
        console.error("❌ No dataTransfer object available")
        return
      }

      // Clear any existing data first
      e.dataTransfer.clearData()

      // Set drag effects before setting data
      e.dataTransfer.effectAllowed = "move"

      // Set the activity data in multiple formats for compatibility
      const activityJson = JSON.stringify(activity)
      e.dataTransfer.setData("application/json", activityJson)
      e.dataTransfer.setData("text/plain", activity.title)

      // Verify data was set correctly
      const setJsonData = e.dataTransfer.getData("application/json")
      const setTextData = e.dataTransfer.getData("text/plain")

      console.log("✅ Drag data set successfully for:", activity.title)
      console.log("📦 JSON data verification:", setJsonData ? "✅ Set" : "❌ Failed")
      console.log("📦 Text data verification:", setTextData ? "✅ Set" : "❌ Failed")

    } catch (error) {
      console.error("❌ Error in handleDragStart:", error)
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    console.log("🏁 Drag ended")

    // Reset visual feedback
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1"
      e.target.style.transform = "scale(1)"
    }
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
      e.currentTarget.style.transform = "scale(1)"
    }

    setDraggedActivityId(null)
  }

  const ActivityCard = ({ activity }: { activity: Activity }) => (
    <Card
      className={`activity-card group cursor-grab active:cursor-grabbing transition-all duration-200 ${draggedActivityId === activity.id ? 'opacity-50 scale-95 border-primary' : 'hover:shadow-md hover:scale-[1.02]'
        }`}
      draggable={true}
      onDragStart={(e) => {
        console.log("🚀 Card onDragStart triggered for:", activity.title)
        handleDragStart(e, activity)
      }}
      onDragEnd={(e) => {
        console.log("🏁 Card onDragEnd triggered for:", activity.title)
        handleDragEnd(e)
      }}
      onMouseDown={(e) => {
        // Only log, don't prevent default to allow drag to work
        console.log("🖱️ Mouse down on draggable item:", activity.title)
      }}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      tabIndex={-1}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="drag-handle flex-shrink-0 mt-0.5 p-1 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate mb-1">{activity.title}</h4>
            <div className="flex items-center gap-1 mb-2">
              <Badge className="text-xs h-4 bg-muted text-muted-foreground border-0">
                {activity.category}
              </Badge>
              {activity.duration && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <Clock className="h-2 w-2" />
                  {formatDuration(activity.duration)}
                </span>
              )}
            </div>
            {activity.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{activity.description}</p>
            )}
            {activity.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-2 w-2" />
                <span className="truncate">{activity.location}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(activity.id)
              }}
              className={`h-6 w-6 p-0 ${favorites.has(activity.id) ? "text-red-500" : ""}`}
            >
              <Heart className={`h-2 w-2 ${favorites.has(activity.id) ? "fill-current" : ""}`} />
            </Button>
            {!activity.isPredefined && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingActivity(activity)
                }}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-2 w-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    title: "",
    category: "",
    description: "",
    duration: 60,
    location: "",
    activityType: "indoor",
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">Browse Activities</h3>
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <GripVertical className="h-3 w-3" />
              Drag to plan
            </span>
          </p>
        </div>
        <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Activity</DialogTitle>
              <DialogDescription>Create a custom activity for your collection</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Activity Title</Label>
                <Input
                  id="title"
                  value={newActivity.title || ""}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="e.g., Morning Yoga"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newActivity.category || ""}
                    onValueChange={(value) => setNewActivity({ ...newActivity, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => cat !== "All")
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activityType">Activity Type</Label>
                  <Select
                    value={newActivity.activityType || "indoor"}
                    onValueChange={(value) =>
                      setNewActivity({ ...newActivity, activityType: value as Activity["activityType"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypeFilters
                        .filter((type) => type !== "All Types")
                        .map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newActivity.description || ""}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="Brief description of the activity"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newActivity.duration || 60}
                    onChange={(e) => setNewActivity({ ...newActivity, duration: Number.parseInt(e.target.value) })}
                    min="15"
                    step="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={newActivity.location || ""}
                    onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                    placeholder="e.g., Central Park"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingActivity(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddActivity}>Add Activity</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-2 mt-2">
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-8 text-xs">
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
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredAndSortedActivities.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No activities found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>


      <Dialog open={!!editingActivity} onOpenChange={() => setEditingActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>Update the activity details</DialogDescription>
          </DialogHeader>
          {editingActivity && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Activity Title</Label>
                <Input
                  id="edit-title"
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingActivity.category}
                    onValueChange={(value) => setEditingActivity({ ...editingActivity, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => cat !== "All")
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-activityType">Activity Type</Label>
                  <Select
                    value={editingActivity.activityType || "indoor"}
                    onValueChange={(value) =>
                      setEditingActivity({ ...editingActivity, activityType: value as Activity["activityType"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypeFilters
                        .filter((type) => type !== "All Types")
                        .map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingActivity.description || ""}
                  onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editingActivity.duration || 60}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, duration: Number.parseInt(e.target.value) })
                    }
                    min="15"
                    step="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingActivity.location || ""}
                    onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingActivity(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateActivity}>Update Activity</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
