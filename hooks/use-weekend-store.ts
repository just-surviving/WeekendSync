"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Activity {
  id: string
  title: string
  category: string
  description?: string
  duration?: number // in minutes
  location?: string
  image?: string
  isPredefined?: boolean
  activityType?: "outdoor" | "indoor" | "lazy" | "family" | "adventurous" | "social" | "creative" | "fitness"
}

export interface ScheduledActivity extends Activity {
  day: "saturday" | "sunday" | "friday" | "monday" | "thursday"
  startTime?: string
  endTime?: string
  order: number
  mood?: "happy" | "relaxed" | "energetic" | "excited" | "peaceful"
  notes?: string
}

interface WeekendStore {
  activities: Activity[]
  weekendPlan: ScheduledActivity[]
  activeTab: string
  selectedActivity: Activity | null
  showMonday: boolean
  showFriday: boolean

  // Actions
  setActiveTab: (tab: string) => void
  setSelectedActivity: (activity: Activity | null) => void
  addActivity: (activity: Activity) => void
  removeActivity: (id: string) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void

  // Weekend planning actions
  addToWeekend: (activity: Activity, day: "saturday" | "sunday" | "friday" | "monday" | "thursday", startTime?: string) => void
  removeFromWeekend: (id: string, day: "saturday" | "sunday" | "friday" | "monday" | "thursday") => void
  reorderWeekendActivity: (id: string, day: "saturday" | "sunday" | "friday" | "monday" | "thursday", newOrder: number) => void
  updateScheduledActivity: (id: string, day: "saturday" | "sunday" | "friday" | "monday" | "thursday", updates: Partial<ScheduledActivity>) => void

  // Extra days toggle
  toggleMonday: () => void
  toggleFriday: () => void

  removeFromAvailable: (id: string) => void
  restoreToAvailable: (activity: Activity) => void

  // Utility
  getActivitiesForDay: (day: "saturday" | "sunday" | "friday" | "monday" | "thursday") => ScheduledActivity[]
  clearWeekendPlan: () => void
  resetToDefaults: () => void
  
  // Long weekend support
  isLongWeekendMode: boolean
  setLongWeekendMode: (enabled: boolean) => void
  getLongWeekendDays: (holidayDays?: string[]) => string[]
}

const defaultActivities: Activity[] = [
  // Outdoor Activities
  {
    id: "1",
    title: "Morning Coffee & Pastries",
    category: "Food",
    description: "Start your day with artisanal coffee and fresh pastries",
    duration: 60,
    location: "Local Café",
    isPredefined: true,
    activityType: "lazy",
  },
  {
    id: "2",
    title: "Nature Hike",
    category: "Outdoor",
    description: "Explore scenic trails and enjoy fresh air",
    duration: 180,
    location: "Mountain Trail",
    isPredefined: true,
    activityType: "outdoor",
  },
  {
    id: "3",
    title: "Movie Marathon",
    category: "Entertainment",
    description: "Cozy movie night with your favorite films",
    duration: 240,
    location: "Home",
    isPredefined: true,
    activityType: "lazy",
  },
  {
    id: "4",
    title: "Reading Session",
    category: "Leisure",
    description: "Dive into a good book in a quiet space",
    duration: 120,
    location: "Library/Home",
    isPredefined: true,
    activityType: "lazy",
  },
  {
    id: "5",
    title: "Farmers Market",
    category: "Shopping",
    description: "Browse local produce and artisanal goods",
    duration: 90,
    location: "Downtown Market",
    isPredefined: true,
    activityType: "outdoor",
  },
  {
    id: "6",
    title: "Art Gallery Visit",
    category: "Culture",
    description: "Explore contemporary and classic art exhibitions",
    duration: 120,
    location: "City Art Gallery",
    isPredefined: true,
    activityType: "indoor",
  },
  {
    id: "7",
    title: "Cooking Workshop",
    category: "Learning",
    description: "Learn new culinary skills and recipes",
    duration: 150,
    location: "Culinary School",
    isPredefined: true,
    activityType: "creative",
  },
  {
    id: "8",
    title: "Beach Volleyball",
    category: "Sports",
    description: "Fun beach volleyball with friends",
    duration: 120,
    location: "Beach Courts",
    isPredefined: true,
    activityType: "outdoor",
  },
  // Additional Outdoor Activities
  {
    id: "9",
    title: "Rock Climbing",
    category: "Sports",
    description: "Challenge yourself with indoor or outdoor climbing",
    duration: 180,
    location: "Climbing Gym",
    isPredefined: true,
    activityType: "adventurous",
  },
  {
    id: "10",
    title: "Kayaking Adventure",
    category: "Outdoor",
    description: "Paddle through scenic waterways",
    duration: 240,
    location: "Lake/River",
    isPredefined: true,
    activityType: "adventurous",
  },
  {
    id: "11",
    title: "Cycling Tour",
    category: "Sports",
    description: "Explore the city or countryside on two wheels",
    duration: 150,
    location: "Bike Trail",
    isPredefined: true,
    activityType: "outdoor",
  },
  {
    id: "12",
    title: "Picnic in the Park",
    category: "Outdoor",
    description: "Relaxing outdoor meal with family or friends",
    duration: 120,
    location: "City Park",
    isPredefined: true,
    activityType: "family",
  },
  {
    id: "13",
    title: "Camping Trip",
    category: "Outdoor",
    description: "Weekend camping under the stars",
    duration: 1440,
    location: "National Park",
    isPredefined: true,
    activityType: "adventurous",
  },
  {
    id: "14",
    title: "Fishing Expedition",
    category: "Outdoor",
    description: "Peaceful fishing by the water",
    duration: 240,
    location: "Lake/River",
    isPredefined: true,
    activityType: "lazy",
  },
  {
    id: "15",
    title: "Botanical Garden Walk",
    category: "Outdoor",
    description: "Stroll through beautiful gardens and learn about plants",
    duration: 90,
    location: "Botanical Garden",
    isPredefined: true,
    activityType: "family",
  },
  // Indoor Activities
  {
    id: "16",
    title: "Museum Visit",
    category: "Culture",
    description: "Explore history, science, or art museums",
    duration: 150,
    location: "Local Museum",
    isPredefined: true,
    activityType: "indoor",
  },
  {
    id: "17",
    title: "Board Game Night",
    category: "Entertainment",
    description: "Fun evening with friends playing board games",
    duration: 180,
    location: "Home",
    isPredefined: true,
    activityType: "social",
  },
  {
    id: "18",
    title: "Pottery Class",
    category: "Learning",
    description: "Create beautiful ceramics with your hands",
    duration: 120,
    location: "Art Studio",
    isPredefined: true,
    activityType: "creative",
  },
  {
    id: "19",
    title: "Wine Tasting",
    category: "Food",
    description: "Sample local wines and learn about viticulture",
    duration: 120,
    location: "Winery",
    isPredefined: true,
    activityType: "social",
  },
  {
    id: "20",
    title: "Escape Room Challenge",
    category: "Entertainment",
    description: "Solve puzzles and escape themed rooms",
    duration: 90,
    location: "Escape Room Venue",
    isPredefined: true,
    activityType: "social",
  },
  {
    id: "21",
    title: "Yoga Class",
    category: "Wellness",
    description: "Relaxing yoga session for mind and body",
    duration: 90,
    location: "Yoga Studio",
    isPredefined: true,
    activityType: "fitness",
  },
  {
    id: "22",
    title: "Cooking at Home",
    category: "Food",
    description: "Prepare a special meal from scratch",
    duration: 120,
    location: "Home",
    isPredefined: true,
    activityType: "creative",
  },
  {
    id: "23",
    title: "Spa Day",
    category: "Wellness",
    description: "Pamper yourself with relaxing treatments",
    duration: 240,
    location: "Spa",
    isPredefined: true,
    activityType: "lazy",
  },
  {
    id: "24",
    title: "Video Game Tournament",
    category: "Entertainment",
    description: "Competitive gaming with friends",
    duration: 180,
    location: "Home",
    isPredefined: true,
    activityType: "indoor",
  },
  {
    id: "25",
    title: "Language Exchange",
    category: "Learning",
    description: "Practice languages with native speakers",
    duration: 120,
    location: "Community Center",
    isPredefined: true,
    activityType: "social",
  },
  // Family Activities
  {
    id: "26",
    title: "Zoo Visit",
    category: "Family",
    description: "Educational and fun day with animals",
    duration: 240,
    location: "City Zoo",
    isPredefined: true,
    activityType: "family",
  },
  {
    id: "27",
    title: "Amusement Park",
    category: "Entertainment",
    description: "Thrilling rides and family fun",
    duration: 480,
    location: "Theme Park",
    isPredefined: true,
    activityType: "family",
  },
  {
    id: "28",
    title: "Mini Golf",
    category: "Sports",
    description: "Fun miniature golf for all ages",
    duration: 90,
    location: "Mini Golf Course",
    isPredefined: true,
    activityType: "family",
  },
  {
    id: "29",
    title: "Ice Skating",
    category: "Sports",
    description: "Glide on ice with family and friends",
    duration: 120,
    location: "Ice Rink",
    isPredefined: true,
    activityType: "family",
  },
  {
    id: "30",
    title: "Bowling",
    category: "Sports",
    description: "Classic bowling fun for groups",
    duration: 120,
    location: "Bowling Alley",
    isPredefined: true,
    activityType: "family",
  },
  // Lazy/Relaxing Activities
  {
    id: "31",
    title: "Netflix Binge",
    category: "Entertainment",
    description: "Catch up on your favorite series",
    duration: 300,
    location: "Home",
    isPredefined: true,
    activityType: "lazy",
  },
  {
    id: "32",
    title: "Afternoon Nap",
    category: "Leisure",
    description: "Recharge with a peaceful nap",
    duration: 90,
    location: "Home",
    isPredefined: true,
    activityType: "lazy",
  },
  {
    id: "33",
    title: "Meditation Session",
    category: "Wellness",
    description: "Find inner peace through meditation",
    duration: 60,
    location: "Home/Park",
    isPredefined: true,
    activityType: "lazy",
  },
  {
    id: "34",
    title: "Bubble Bath",
    category: "Wellness",
    description: "Luxurious relaxing bath time",
    duration: 60,
    location: "Home",
    isPredefined: true,
    activityType: "lazy",
  },
  {
    id: "35",
    title: "Journaling",
    category: "Leisure",
    description: "Reflect and write in your personal journal",
    duration: 45,
    location: "Home",
    isPredefined: true,
    activityType: "lazy",
  },
  // Adventurous Activities
  {
    id: "36",
    title: "Skydiving",
    category: "Sports",
    description: "Ultimate adrenaline rush from the sky",
    duration: 240,
    location: "Skydiving Center",
    isPredefined: true,
    activityType: "adventurous",
  },
  {
    id: "37",
    title: "Bungee Jumping",
    category: "Sports",
    description: "Heart-pounding leap of faith",
    duration: 120,
    location: "Bungee Site",
    isPredefined: true,
    activityType: "adventurous",
  },
  {
    id: "38",
    title: "White Water Rafting",
    category: "Outdoor",
    description: "Navigate exciting rapids with a team",
    duration: 360,
    location: "River Rapids",
    isPredefined: true,
    activityType: "adventurous",
  },
  {
    id: "39",
    title: "Mountain Biking",
    category: "Sports",
    description: "Challenging off-road cycling adventure",
    duration: 180,
    location: "Mountain Trails",
    isPredefined: true,
    activityType: "adventurous",
  },
  {
    id: "40",
    title: "Zip Lining",
    category: "Outdoor",
    description: "Soar through treetops on zip lines",
    duration: 150,
    location: "Adventure Park",
    isPredefined: true,
    activityType: "adventurous",
  },
  // Social Activities
  {
    id: "41",
    title: "Karaoke Night",
    category: "Entertainment",
    description: "Sing your heart out with friends",
    duration: 180,
    location: "Karaoke Bar",
    isPredefined: true,
    activityType: "social",
  },
  {
    id: "42",
    title: "Dance Class",
    category: "Learning",
    description: "Learn new dance moves in a fun class",
    duration: 90,
    location: "Dance Studio",
    isPredefined: true,
    activityType: "social",
  },
  {
    id: "43",
    title: "Trivia Night",
    category: "Entertainment",
    description: "Test your knowledge with friends",
    duration: 120,
    location: "Local Pub",
    isPredefined: true,
    activityType: "social",
  },
  {
    id: "44",
    title: "Book Club Meeting",
    category: "Learning",
    description: "Discuss literature with fellow readers",
    duration: 120,
    location: "Library/Café",
    isPredefined: true,
    activityType: "social",
  },
  {
    id: "45",
    title: "Volunteer Work",
    category: "Social",
    description: "Give back to your community",
    duration: 180,
    location: "Community Center",
    isPredefined: true,
    activityType: "social",
  },
  // Creative Activities
  {
    id: "46",
    title: "Photography Walk",
    category: "Creative",
    description: "Capture beautiful moments around the city",
    duration: 150,
    location: "Urban Areas",
    isPredefined: true,
    activityType: "creative",
  },
  {
    id: "47",
    title: "Painting Class",
    category: "Creative",
    description: "Express yourself through colors and canvas",
    duration: 120,
    location: "Art Studio",
    isPredefined: true,
    activityType: "creative",
  },
  {
    id: "48",
    title: "Music Jam Session",
    category: "Creative",
    description: "Play music with fellow musicians",
    duration: 180,
    location: "Music Studio",
    isPredefined: true,
    activityType: "creative",
  },
  {
    id: "49",
    title: "Creative Writing Workshop",
    category: "Learning",
    description: "Develop your writing skills and creativity",
    duration: 120,
    location: "Community Center",
    isPredefined: true,
    activityType: "creative",
  },
  {
    id: "50",
    title: "Craft Making",
    category: "Creative",
    description: "Create handmade crafts and decorations",
    duration: 150,
    location: "Home/Studio",
    isPredefined: true,
    activityType: "creative",
  },
  // Fitness Activities
  {
    id: "51",
    title: "Gym Workout",
    category: "Fitness",
    description: "Strength training and cardio session",
    duration: 90,
    location: "Gym",
    isPredefined: true,
    activityType: "fitness",
  },
  {
    id: "52",
    title: "Swimming",
    category: "Sports",
    description: "Refreshing swim for exercise and fun",
    duration: 60,
    location: "Pool/Beach",
    isPredefined: true,
    activityType: "fitness",
  },
  {
    id: "53",
    title: "Running/Jogging",
    category: "Fitness",
    description: "Cardio workout in fresh air",
    duration: 45,
    location: "Park/Trail",
    isPredefined: true,
    activityType: "fitness",
  },
  {
    id: "54",
    title: "Tennis Match",
    category: "Sports",
    description: "Competitive tennis game with friends",
    duration: 90,
    location: "Tennis Court",
    isPredefined: true,
    activityType: "fitness",
  },
  {
    id: "55",
    title: "Pilates Class",
    category: "Fitness",
    description: "Core strengthening and flexibility workout",
    duration: 60,
    location: "Fitness Studio",
    isPredefined: true,
    activityType: "fitness",
  },
]

export const useWeekendStore = create<WeekendStore>()(
  persist(
    (set, get) => ({
      activities: defaultActivities,
      weekendPlan: [],
      activeTab: "planner",
      selectedActivity: null,
      showMonday: false,
      showFriday: false,
      isLongWeekendMode: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedActivity: (activity) => set({ selectedActivity: activity }),

      addActivity: (activity) =>
        set((state) => ({
          activities: [...state.activities, activity],
        })),

      removeActivity: (id) =>
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
          weekendPlan: state.weekendPlan.filter((a) => !(a.id === id && a.isPredefined)),
        })),

      updateActivity: (id, updates) =>
        set((state) => ({
          activities: state.activities.map((a) => (a.id === id ? { ...a, ...updates } : a)),
          weekendPlan: state.weekendPlan.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      addToWeekend: (activity, day, startTime) =>
        set((state) => {
          const existingActivities = state.weekendPlan.filter((a) => a.day === day)
          const newOrder = existingActivities.length
          const scheduledActivity: ScheduledActivity = {
            ...activity,
            day,
            order: newOrder,
            startTime: startTime || undefined,
          }
          return {
            weekendPlan: [...state.weekendPlan, scheduledActivity],
            // Remove from available activities when added to weekend plan
            activities: state.activities.filter((a) => a.id !== activity.id),
          }
        }),

      removeFromWeekend: (id, day) =>
        set((state) => {
          const removedActivity = state.weekendPlan.find((a) => a.id === id && a.day === day)
          const newWeekendPlan = state.weekendPlan.filter((a) => !(a.id === id && a.day === day))

          // Always restore removed activities back to available activities
          if (removedActivity) {
            const { day: _, order: __, startTime: ___, endTime: ____, mood: _____, notes: ______, ...activityData } = removedActivity
            return {
              weekendPlan: newWeekendPlan,
              activities: [...state.activities, activityData],
            }
          }

          return {
            weekendPlan: newWeekendPlan,
          }
        }),

      updateScheduledActivity: (id, day, updates) =>
        set((state) => ({
          weekendPlan: state.weekendPlan.map((a) =>
            a.id === id && a.day === day ? { ...a, ...updates } : a
          ),
        })),

      reorderWeekendActivity: (id, day, newOrder) =>
        set((state) => {
          const activities = state.weekendPlan.filter((a) => a.day === day)
          const targetActivity = activities.find((a) => a.id === id)
          if (!targetActivity) return state

          const otherActivities = activities.filter((a) => a.id !== id)
          const reorderedActivities = [...otherActivities, { ...targetActivity, order: newOrder }]
            .sort((a, b) => a.order - b.order)

          return {
            weekendPlan: state.weekendPlan.map((a) => {
              if (a.day === day) {
                const reordered = reorderedActivities.find((ra) => ra.id === a.id)
                return reordered || a
              }
              return a
            }),
          }
        }),

      removeFromAvailable: (id) =>
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        })),

      restoreToAvailable: (activity) =>
        set((state) => ({
          activities: [...state.activities, activity],
        })),

      // Extra days toggle
      toggleMonday: () => {
        set((state) => {
          const newShowMonday = !state.showMonday
          
          // If hiding Monday, remove all Monday activities and restore them to available
          if (!newShowMonday) {
            const mondayActivities = state.weekendPlan.filter(activity => activity.day === 'monday')
            const activitiesToRestore = mondayActivities.map(activity => {
              const { day, order, startTime, endTime, mood, notes, ...activityData } = activity
              return activityData
            })
            
            return {
              showMonday: newShowMonday,
              weekendPlan: state.weekendPlan.filter(activity => activity.day !== 'monday'),
              activities: [...state.activities, ...activitiesToRestore],
            }
          }
          
          return { showMonday: newShowMonday }
        })
      },

      toggleFriday: () => {
        set((state) => {
          const newShowFriday = !state.showFriday
          
          // If hiding Friday, remove all Friday activities and restore them to available
          if (!newShowFriday) {
            const fridayActivities = state.weekendPlan.filter(activity => activity.day === 'friday')
            const activitiesToRestore = fridayActivities.map(activity => {
              const { day, order, startTime, endTime, mood, notes, ...activityData } = activity
              return activityData
            })
            
            return {
              showFriday: newShowFriday,
              weekendPlan: state.weekendPlan.filter(activity => activity.day !== 'friday'),
              activities: [...state.activities, ...activitiesToRestore],
            }
          }
          
          return { showFriday: newShowFriday }
        })
      },

      getActivitiesForDay: (day) => {
        const activities = get().weekendPlan.filter((a) => a.day === day)
        return activities.sort((a, b) => a.order - b.order)
      },

      clearWeekendPlan: () => set({ weekendPlan: [] }),

      resetToDefaults: () => set({ 
        activities: defaultActivities, 
        weekendPlan: [],
        showMonday: false,
        showFriday: false,
        isLongWeekendMode: false,
      }),

      // Long weekend support
      setLongWeekendMode: (enabled) => {
        set({ isLongWeekendMode: enabled })
        
        // If disabling long weekend mode, clear activities from non-weekend days
        if (!enabled) {
          const state = get()
          const activitiesToRemove = state.weekendPlan.filter(activity => 
            activity.day !== 'saturday' && activity.day !== 'sunday'
          )
          
          if (activitiesToRemove.length > 0) {
            console.log('🚫 Clearing activities from disabled long weekend days:', activitiesToRemove.length)
            // Remove activities from non-weekend days
            const updatedPlan = state.weekendPlan.filter(activity => 
              activity.day === 'saturday' || activity.day === 'sunday'
            )
            set({ weekendPlan: updatedPlan })
          }
        }
      },
      
      getLongWeekendDays: (holidayDays?: string[]) => {
        const state = get()
        if (!state.isLongWeekendMode) return ['saturday', 'sunday']
        
        // Always include Saturday and Sunday
        const baseDays = ['saturday', 'sunday']
        
        // Add holiday days if provided
        if (holidayDays && holidayDays.length > 0) {
          // Filter out weekend days since they're already included
          const additionalDays = holidayDays.filter(day => 
            day !== 'saturday' && day !== 'sunday'
          )
          return [...baseDays, ...additionalDays]
        }
        
        // Fallback: return base days only
        return baseDays
      },
    }),
    {
      name: "weekend-store",
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Force reset to default activities for version 2
          return {
            ...persistedState,
            activities: defaultActivities,
          }
        }
        if (version < 3) {
          // Add long weekend mode for version 3
          return {
            ...persistedState,
            isLongWeekendMode: false,
          }
        }
        return persistedState
      },
    },
  ),
)
