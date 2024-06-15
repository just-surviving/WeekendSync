"use client"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter, Clock, MapPin, Edit, Trash2, Heart, Sun, Moon, Grid3X3, List } from "lucide-react"
import { useWeekendStore, type Activity } from "@/hooks/use-weekend-store"

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
]

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "duration", label: "Duration" },
  { value: "recent", label: "Recently Added" },
]

export function ActivityBrowser() {
  const { activities, addActivity, removeActivity, updateActivity, addToWeekend } = useWeekendStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    title: "",
    category: "",
    description: "",
    duration: 60,
    location: "",
  })

  // Filter and sort activities
  const filteredAndSortedActivities = useMemo(() => {
    const filtered = activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || activity.category === selectedCategory
      return matchesSearch && matchesCategory
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
        case "recent":
          return Number.parseInt(b.id) - Number.parseInt(a.id) // Assuming ID is timestamp-based
        default:
          return 0
      }
    })

    return filtered
  }, [activities, searchQuery, selectedCategory, sortBy])

  const handleAddActivity = () => {
    if (!newActivity.title || !newActivity.category) return

    const activity: Activity = {
      id: Date.now().toString(),
      title: newActivity.title,
      category: newActivity.category,
      description: newActivity.description || "",
      duration: newActivity.duration || 60,
      location: newActivity.location || "",
    }

    addActivity(activity)
    setNewActivity({ title: "", category: "", description: "", duration: 60, location: "" })
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

  const ActivityCard = ({ activity, compact = false }: { activity: Activity; compact?: boolean }) => (
    <Card className={`hover:shadow-md transition-all duration-200 group ${compact ? "h-full" : ""}`}>
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={`leading-tight ${compact ? "text-base" : "text-lg"}`}>{activity.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {activity.category}
              </Badge>
              {activity.duration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(activity.duration)}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleFavorite(activity.id)}
              className={`h-8 w-8 p-0 ${favorites.has(activity.id) ? "text-red-500" : ""}`}
            >
              <Heart className={`h-3 w-3 ${favorites.has(activity.id) ? "fill-current" : ""}`} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingActivity(activity)} className="h-8 w-8 p-0">
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeActivity(activity.id)}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {activity.description && !compact && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{activity.description}</p>
        )}
        {activity.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3" />
            {activity.location}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => addToWeekend(activity, "saturday")} className="flex-1">
            <Sun className="h-3 w-3 mr-1" />
            Saturday
          </Button>
          <Button size="sm" variant="outline" onClick={() => addToWeekend(activity, "sunday")} className="flex-1">
            <Moon className="h-3 w-3 mr-1" />
            Sunday
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ActivityListItem = ({ activity }: { activity: Activity }) => (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-medium">{activity.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {activity.category}
              </Badge>
              {activity.duration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(activity.duration)}
                </div>
              )}
              {activity.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {activity.location}
                </div>
              )}
            </div>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{activity.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleFavorite(activity.id)}
              className={`h-8 w-8 p-0 ${favorites.has(activity.id) ? "text-red-500" : ""}`}
            >
              <Heart className={`h-3 w-3 ${favorites.has(activity.id) ? "fill-current" : ""}`} />
            </Button>
            <Button size="sm" variant="outline" onClick={() => addToWeekend(activity, "saturday")}>
              <Sun className="h-3 w-3 mr-1" />
              Sat
            </Button>
            <Button size="sm" variant="outline" onClick={() => addToWeekend(activity, "sunday")}>
              <Moon className="h-3 w-3 mr-1" />
              Sun
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingActivity(activity)} className="h-8 w-8 p-0">
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeActivity(activity.id)}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Activity Browser</h2>
          <p className="text-muted-foreground">Discover and manage your weekend activities</p>
        </div>
        <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
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
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newActivity.category || ""}
                  onValueChange={(value) => setNewActivity({ ...newActivity, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{activities.length}</div>
            <div className="text-sm text-muted-foreground">Total Activities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{favorites.size}</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{new Set(activities.map((a) => a.category)).size}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{filteredAndSortedActivities.length}</div>
            <div className="text-sm text-muted-foreground">Filtered</div>
          </CardContent>
        </Card>
      </div>

      {/* Activities Display */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAndSortedActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activities found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedActivities.map((activity) => (
                <ActivityListItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {Array.from(favorites).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No favorite activities yet</p>
              <p className="text-sm">Click the heart icon on activities to add them to favorites</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities
                .filter((activity) => favorites.has(activity.id))
                .map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
            </div>
          ) : (
            <div className="space-y-3">
              {activities
                .filter((activity) => favorites.has(activity.id))
                .map((activity) => (
                  <ActivityListItem key={activity.id} activity={activity} />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Activity Dialog */}
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
