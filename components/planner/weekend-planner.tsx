"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Plus, X, Clock, MapPin, GripVertical, Edit, Trash2, Calendar, Sun, Moon } from "lucide-react"
import { useWeekendStore, type Activity, type ScheduledActivity } from "@/hooks/use-weekend-store"

const categories = [
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

export function WeekendPlanner() {
  const {
    activities,
    weekendPlan,
    addActivity,
    removeActivity,
    updateActivity,
    addToWeekend,
    removeFromWeekend,
    getActivitiesForDay,
    clearWeekendPlan,
  } = useWeekendStore()

  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    title: "",
    category: "",
    description: "",
    duration: 60,
    location: "",
  })
  const [isAddingActivity, setIsAddingActivity] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const ActivityCard = ({ activity, showAddButtons = true }: { activity: Activity; showAddButtons?: boolean }) => (
    <Card className="hover:shadow-md transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{activity.title}</CardTitle>
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
        {activity.description && <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>}
        {activity.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3 w-3" />
            {activity.location}
          </div>
        )}
        {showAddButtons && (
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
        )}
      </CardContent>
    </Card>
  )

  const ScheduledActivityCard = ({ activity }: { activity: ScheduledActivity }) => (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border group hover:shadow-sm transition-shadow">
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{activity.title}</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeFromWeekend(activity.id, activity.day)}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <Badge variant="outline" className="text-xs">
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
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Weekend Planner</h2>
          <p className="text-muted-foreground">Plan your perfect weekend activities</p>
        </div>
        <div className="flex gap-2">
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
                <DialogDescription>Create a custom activity for your weekend plans</DialogDescription>
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
                      {categories.map((category) => (
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
          {weekendPlan.length > 0 && (
            <Button variant="outline" onClick={clearWeekendPlan}>
              Clear Plan
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Activities</TabsTrigger>
          <TabsTrigger value="plan">Weekend Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saturday */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-accent" />
                  Saturday
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getActivitiesForDay("saturday").length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activities planned yet</p>
                    <p className="text-sm">Add activities from the Browse tab</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getActivitiesForDay("saturday").map((activity) => (
                      <ScheduledActivityCard key={`${activity.id}-saturday`} activity={activity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sunday */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-primary" />
                  Sunday
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getActivitiesForDay("sunday").length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activities planned yet</p>
                    <p className="text-sm">Add activities from the Browse tab</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getActivitiesForDay("sunday").map((activity) => (
                      <ScheduledActivityCard key={`${activity.id}-sunday`} activity={activity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                    {categories.map((category) => (
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
