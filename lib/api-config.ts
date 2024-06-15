// API Configuration
export const API_CONFIG = {
  // Google Places API
  GOOGLE_PLACES_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
  
  // Google Maps API
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  
  // Eventbrite API
  EVENTBRITE_API_KEY: process.env.NEXT_PUBLIC_EVENTBRITE_API_KEY || '',
  
  // Meetup API
  MEETUP_API_KEY: process.env.NEXT_PUBLIC_MEETUP_API_KEY || '',
  
  // Facebook Events API
  FACEBOOK_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET || '',
  
  // Google Gemini API
  GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
}

// API Endpoints
export const API_ENDPOINTS = {
  GOOGLE_PLACES: 'https://maps.googleapis.com/maps/api/place',
  EVENTBRITE: 'https://www.eventbriteapi.com/v3',
  MEETUP: 'https://api.meetup.com',
  FACEBOOK_GRAPH: 'https://graph.facebook.com/v18.0',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
}
