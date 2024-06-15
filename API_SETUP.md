# API Setup Guide

## Gemini AI API Setup (Required for AI Recommendations)

The AI-Powered Recommendations feature uses Google's Gemini API to provide personalized activity suggestions based on your location and weather.

### Steps to Enable AI Recommendations:

1. **Get a Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

2. **Add the API Key to Your Environment:**
   - Create a `.env.local` file in your project root
   - Add the following line:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Restart Your Development Server:**
   ```bash
   npm run dev
   ```

### Current Status
- ✅ **Demo Mode**: The app currently shows sample recommendations
- 🔧 **To Enable AI**: Add your Gemini API key as described above

### Other Optional APIs
- **Google Places API**: For nearby restaurants and places
- **Google Maps API**: For map integration
- **Eventbrite API**: For local events
- **Meetup API**: For local meetups

Add these to your `.env.local` file as needed:
```
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_EVENTBRITE_API_KEY=your_key_here
NEXT_PUBLIC_MEETUP_API_KEY=your_key_here
```

### Troubleshooting
- If you see "Demo Data" in the recommendations section, the API key is not configured
- Check the browser console for detailed error messages
- Ensure your API key is valid and has the necessary permissions