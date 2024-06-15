"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, MapPin, Edit, Save, X, Camera } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "Demo User",
    email: user?.email || "demo@weeksync.com",
    bio: "Weekend planning enthusiast who loves discovering new activities and making the most of every free moment.",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    totalPlans: 24,
    favoriteActivities: ["Hiking", "Photography", "Cooking", "Reading"]
  })

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving profile:", profileData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setProfileData({
      name: user?.name || "Demo User",
      email: user?.email || "demo@weeksync.com",
      bio: "Weekend planning enthusiast who loves discovering new activities and making the most of every free moment.",
      location: "San Francisco, CA",
      joinDate: "January 2024",
      totalPlans: 24,
      favoriteActivities: ["Hiking", "Photography", "Cooking", "Reading"]
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={profileData.name} />
                <AvatarFallback className="text-2xl">
                  {profileData.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardTitle className="text-xl">{profileData.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1">
              <MapPin className="h-4 w-4" />
              {profileData.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{profileData.totalPlans}</div>
              <div className="text-sm text-muted-foreground">Weekend Plans Created</div>
            </div>
            <Separator />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Member since</div>
              <div className="font-medium">{profileData.joinDate}</div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
              </div>
              <Button
                variant={isEditing ? "outline" : "default"}
                size="sm"
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {profileData.name}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profileData.email}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {profileData.location}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={3}
                />
              ) : (
                <div className="p-3 rounded-md bg-muted/50">
                  {profileData.bio}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Favorite Activities</Label>
              <div className="flex flex-wrap gap-2">
                {profileData.favoriteActivities.map((activity, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Statistics</CardTitle>
          <CardDescription>Your weekend planning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{profileData.totalPlans}</div>
              <div className="text-sm text-muted-foreground">Total Plans</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Activities Completed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Favorite Places</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

