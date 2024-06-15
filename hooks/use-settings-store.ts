"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  interests: string[]
  joinedDate: string
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  weekendReminders: boolean
  friendRequests: boolean
  eventInvitations: boolean
  groupUpdates: boolean
}

export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private"
  showEmail: boolean
  showLocation: boolean
  allowFriendRequests: boolean
  allowEventInvitations: boolean
}

export interface AppPreferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  weekStartsOn: "sunday" | "monday"
  defaultView: "planner" | "activities" | "community"
}

interface SettingsStore {
  profile: UserProfile | null
  notifications: NotificationSettings
  privacy: PrivacySettings
  preferences: AppPreferences

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void
  updateNotifications: (updates: Partial<NotificationSettings>) => void
  updatePrivacy: (updates: Partial<PrivacySettings>) => void
  updatePreferences: (updates: Partial<AppPreferences>) => void
  resetSettings: () => void
}

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  weekendReminders: true,
  friendRequests: true,
  eventInvitations: true,
  groupUpdates: false,
}

const defaultPrivacy: PrivacySettings = {
  profileVisibility: "friends",
  showEmail: false,
  showLocation: true,
  allowFriendRequests: true,
  allowEventInvitations: true,
}

const defaultPreferences: AppPreferences = {
  theme: "system",
  language: "en",
  timezone: "America/New_York",
  weekStartsOn: "sunday",
  defaultView: "planner",
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      profile: null,
      notifications: defaultNotifications,
      privacy: defaultPrivacy,
      preferences: defaultPreferences,

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      updateNotifications: (updates) =>
        set((state) => ({
          notifications: { ...state.notifications, ...updates },
        })),

      updatePrivacy: (updates) =>
        set((state) => ({
          privacy: { ...state.privacy, ...updates },
        })),

      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),

      resetSettings: () =>
        set({
          notifications: defaultNotifications,
          privacy: defaultPrivacy,
          preferences: defaultPreferences,
        }),
    }),
    {
      name: "settings-store",
    },
  ),
)
