"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Friend {
  id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "offline" | "busy"
  mutualFriends?: number
  joinedDate: string
}

export interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  isPrivate: boolean
  category: string
  image?: string
  createdBy: string
  createdAt: string
  members: string[]
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  organizer: string
  attendees: string[]
  maxAttendees?: number
  isPublic: boolean
  image?: string
}

interface CommunityStore {
  friends: Friend[]
  groups: Group[]
  events: Event[]
  friendRequests: Friend[]

  // Actions
  addFriend: (friend: Friend) => void
  removeFriend: (friendId: string) => void
  sendFriendRequest: (friend: Friend) => void
  acceptFriendRequest: (friendId: string) => void
  rejectFriendRequest: (friendId: string) => void

  createGroup: (group: Omit<Group, "id" | "createdAt">) => void
  joinGroup: (groupId: string, userId: string) => void
  leaveGroup: (groupId: string, userId: string) => void

  createEvent: (event: Omit<Event, "id">) => void
  joinEvent: (eventId: string, userId: string) => void
  leaveEvent: (eventId: string, userId: string) => void
}

// Mock data
const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "/diverse-woman-portrait.png",
    status: "online",
    mutualFriends: 5,
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike@example.com",
    avatar: "/thoughtful-man.png",
    status: "offline",
    mutualFriends: 3,
    joinedDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma@example.com",
    avatar: "/diverse-woman-portrait.png",
    status: "busy",
    mutualFriends: 8,
    joinedDate: "2024-01-08",
  },
  {
    id: "4",
    name: "Alex Rodriguez",
    email: "alex@example.com",
    avatar: "/thoughtful-man.png",
    status: "online",
    mutualFriends: 12,
    joinedDate: "2024-03-10",
  },
  {
    id: "5",
    name: "Jessica Wang",
    email: "jessica@example.com",
    avatar: "/diverse-woman-portrait.png",
    status: "offline",
    mutualFriends: 7,
    joinedDate: "2024-02-28",
  },
  {
    id: "6",
    name: "David Thompson",
    email: "david@example.com",
    avatar: "/thoughtful-man.png",
    status: "busy",
    mutualFriends: 4,
    joinedDate: "2024-03-15",
  },
  {
    id: "7",
    name: "Maria Garcia",
    email: "maria@example.com",
    avatar: "/diverse-woman-portrait.png",
    status: "online",
    mutualFriends: 15,
    joinedDate: "2024-01-22",
  },
  {
    id: "8",
    name: "James Wilson",
    email: "james@example.com",
    avatar: "/thoughtful-man.png",
    status: "offline",
    mutualFriends: 6,
    joinedDate: "2024-03-05",
  },
  {
    id: "9",
    name: "Lisa Anderson",
    email: "lisa@example.com",
    avatar: "/diverse-woman-portrait.png",
    status: "online",
    mutualFriends: 9,
    joinedDate: "2024-02-14",
  },
  {
    id: "10",
    name: "Ryan O'Connor",
    email: "ryan@example.com",
    avatar: "/thoughtful-man.png",
    status: "busy",
    mutualFriends: 11,
    joinedDate: "2024-03-20",
  },
  {
    id: "11",
    name: "Sophie Brown",
    email: "sophie@example.com",
    avatar: "/diverse-woman-portrait.png",
    status: "online",
    mutualFriends: 13,
    joinedDate: "2024-01-30",
  },
  {
    id: "12",
    name: "Kevin Lee",
    email: "kevin@example.com",
    avatar: "/thoughtful-man.png",
    status: "offline",
    mutualFriends: 8,
    joinedDate: "2024-03-12",
  },
  {
    id: "13",
    name: "Amanda Taylor",
    email: "amanda@example.com",
    avatar: "/diverse-woman-portrait.png",
    status: "online",
    mutualFriends: 10,
    joinedDate: "2024-02-05",
  },
]

const mockGroups: Group[] = [
  {
    id: "1",
    name: "Weekend Hikers",
    description: "A group for hiking enthusiasts who love exploring trails on weekends",
    memberCount: 24,
    isPrivate: false,
    category: "Outdoor",
    createdBy: "1",
    createdAt: "2024-01-10",
    members: ["1", "2", "3"],
  },
  {
    id: "2",
    name: "Foodie Adventures",
    description: "Discover new restaurants and culinary experiences together",
    memberCount: 18,
    isPrivate: false,
    category: "Food",
    createdBy: "2",
    createdAt: "2024-02-05",
    members: ["1", "2"],
  },
  {
    id: "3",
    name: "Book Club",
    description: "Monthly book discussions and literary adventures",
    memberCount: 12,
    isPrivate: true,
    category: "Culture",
    createdBy: "3",
    createdAt: "2024-01-20",
    members: ["1", "3"],
  },
]

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Saturday Morning Hike",
    description: "Join us for a scenic hike through the mountain trails",
    date: "2024-12-21",
    time: "08:00",
    location: "Mountain Trail Park",
    category: "Outdoor",
    organizer: "Sarah Johnson",
    attendees: ["1", "2"],
    maxAttendees: 15,
    isPublic: true,
  },
  {
    id: "2",
    title: "Brunch & Book Discussion",
    description: "Casual brunch while discussing this month's book selection",
    date: "2024-12-22",
    time: "11:00",
    location: "Café Central",
    category: "Culture",
    organizer: "Emma Davis",
    attendees: ["1", "3"],
    maxAttendees: 8,
    isPublic: false,
  },
  {
    id: "3",
    title: "Food Truck Festival",
    description: "Explore diverse cuisines at the weekend food truck festival",
    date: "2024-12-22",
    time: "12:00",
    location: "Downtown Square",
    category: "Food",
    organizer: "Mike Chen",
    attendees: ["2"],
    isPublic: true,
  },
]

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set, get) => ({
      friends: mockFriends,
      groups: mockGroups,
      events: mockEvents,
      friendRequests: [],

      addFriend: (friend) =>
        set((state) => ({
          friends: [...state.friends, friend],
        })),

      removeFriend: (friendId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== friendId),
        })),

      sendFriendRequest: (friend) =>
        set((state) => ({
          friendRequests: [...state.friendRequests, friend],
        })),

      acceptFriendRequest: (friendId) =>
        set((state) => {
          const request = state.friendRequests.find((r) => r.id === friendId)
          if (!request) return state

          return {
            friends: [...state.friends, request],
            friendRequests: state.friendRequests.filter((r) => r.id !== friendId),
          }
        }),

      rejectFriendRequest: (friendId) =>
        set((state) => ({
          friendRequests: state.friendRequests.filter((r) => r.id !== friendId),
        })),

      createGroup: (groupData) =>
        set((state) => {
          const newGroup: Group = {
            ...groupData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          }
          return {
            groups: [...state.groups, newGroup],
          }
        }),

      joinGroup: (groupId, userId) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  members: [...group.members, userId],
                  memberCount: group.memberCount + 1,
                }
              : group,
          ),
        })),

      leaveGroup: (groupId, userId) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  members: group.members.filter((id) => id !== userId),
                  memberCount: group.memberCount - 1,
                }
              : group,
          ),
        })),

      createEvent: (eventData) =>
        set((state) => {
          const newEvent: Event = {
            ...eventData,
            id: Date.now().toString(),
          }
          return {
            events: [...state.events, newEvent],
          }
        }),

      joinEvent: (eventId, userId) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  attendees: [...event.attendees, userId],
                }
              : event,
          ),
        })),

      leaveEvent: (eventId, userId) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  attendees: event.attendees.filter((id) => id !== userId),
                }
              : event,
          ),
        })),
    }),
    {
      name: "community-store",
    },
  ),
)
