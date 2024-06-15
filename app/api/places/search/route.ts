import { NextRequest, NextResponse } from 'next/server'

// Legacy API fallback function
async function tryLegacyAPI(query: string, location: string | null, radius: number, apiKey: string) {
  console.log('🔍 Places API: Trying legacy Google Places API')
  
  const legacyUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json`
  const params = new URLSearchParams({
    query: query,
    key: apiKey
  })

  // Only add location and radius if location is provided (for nearby searches)
  if (location) {
    params.append('location', location)
    params.append('radius', radius.toString())
  }

  const legacyResponse = await fetch(`${legacyUrl}?${params}`)
  
  if (legacyResponse.ok) {
    const legacyData = await legacyResponse.json()
    console.log('🔍 Places API: Legacy API response:', legacyData)
    
    if (legacyData.status === 'OK' || legacyData.status === 'ZERO_RESULTS') {
      return NextResponse.json({
        results: legacyData.results || [],
        status: legacyData.status,
        source: 'google_legacy'
      })
    }
  }
  
  throw new Error('Legacy API also failed')
}

export async function POST(request: NextRequest) {
  try {
    const { query, location, radius } = await request.json()
    
    console.log('🔍 Places API: Received request:', {
      query,
      location,
      radius,
      timestamp: new Date().toISOString()
    })

    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    console.log('🔍 Places API: Google API key available:', !!googleApiKey)

    // Try to use Google Places API if key is available
    if (googleApiKey) {
      console.log('🔍 Places API: Using new Google Places API')
      try {
        // Use the new Google Places API (New) - Text Search endpoint
        const googleUrl = `https://places.googleapis.com/v1/places:searchText`
        
        const requestBody: any = {
          textQuery: query,
          maxResultCount: 20
        }

        // Only add location bias if location is provided (for nearby searches)
        if (location) {
          requestBody.locationBias = {
            circle: {
              center: {
                latitude: parseFloat(location.split(',')[0]),
                longitude: parseFloat(location.split(',')[1])
              },
              radius: radius
            }
          }
          console.log('🔍 Places API: Using location bias for nearby search')
        } else {
          console.log('🔍 Places API: No location bias - searching globally')
        }

        console.log('🔍 Places API: Making request to new Google Places API:', {
          url: googleUrl,
          requestBody
        })

        const googleResponse = await fetch(googleUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.types,places.currentOpeningHours,places.location,places.photos'
          },
          body: JSON.stringify(requestBody)
        })

        console.log('🔍 Places API: Google response status:', googleResponse.status)

        if (googleResponse.ok) {
          const googleData = await googleResponse.json()
          console.log('🔍 Places API: Google response data:', googleData)
          
          // Transform the new API response format to match our expected format
          const transformedResults = googleData.places?.map((place: any) => ({
            place_id: place.id || Math.random().toString(36).substr(2, 9),
            name: place.displayName?.text || 'Unknown Place',
            rating: place.rating || 0,
            price_level: place.priceLevel || 0,
            vicinity: place.formattedAddress || 'Address not available',
            types: place.types || [],
            opening_hours: place.currentOpeningHours ? { open_now: place.currentOpeningHours.openNow } : null,
            geometry: {
              location: {
                lat: place.location?.latitude || 0,
                lng: place.location?.longitude || 0
              }
            },
            photos: place.photos?.map((photo: any) => {
              // Generate photo URL from photo reference
              if (photo.name) {
                return `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=400&key=${googleApiKey}`
              }
              return null
            }).filter(Boolean) || [],
            photo_references: place.photos || []
          })) || []

          return NextResponse.json({
            results: transformedResults,
            status: "OK",
            source: 'google_new'
          })
        } else {
          const errorText = await googleResponse.text()
          console.error('🔍 Places API: Google API request failed:', {
            status: googleResponse.status,
            errorText
          })
          
          // Try fallback to legacy API if new API fails
          console.log('🔍 Places API: Trying legacy API as fallback')
          return await tryLegacyAPI(query, location, radius, googleApiKey)
        }
      } catch (googleError) {
        console.error('🔍 Places API: Error calling new Google API:', googleError)
        
        // Try fallback to legacy API
        console.log('🔍 Places API: Trying legacy API as fallback')
        try {
          return await tryLegacyAPI(query, location, radius, googleApiKey)
        } catch (legacyError) {
          console.error('🔍 Places API: Legacy API also failed:', legacyError)
        }
      }
    } else {
      console.log('🔍 Places API: No Google API key found, using mock data')
    }

    // Fallback to mock data if Google API fails or no key
    console.log('🔍 Places API: Using mock data fallback')
    const mockPlaces = [
      {
        place_id: "1",
        name: "The Golden Spoon",
        rating: 4.5,
        price_level: 2,
        vicinity: "123 Main St",
        types: ["restaurant", "food"],
        opening_hours: { open_now: true },
        geometry: {
          location: {
            lat: 40.7128,
            lng: -74.0060
          }
        },
        photos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center"]
      },
      {
        place_id: "2",
        name: "Café Central",
        rating: 4.2,
        price_level: 1,
        vicinity: "456 Oak Ave",
        types: ["cafe", "restaurant"],
        opening_hours: { open_now: true },
        geometry: {
          location: {
            lat: 40.7589,
            lng: -73.9851
          }
        },
        photos: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop&crop=center"]
      },
      {
        place_id: "3",
        name: "Noida Spice House",
        rating: 4.3,
        price_level: 2,
        vicinity: "Sector 18, Noida",
        types: ["restaurant", "food"],
        opening_hours: { open_now: true },
        geometry: {
          location: {
            lat: 28.5937,
            lng: 77.3848
          }
        },
        photos: ["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&crop=center"]
      },
      {
        place_id: "4",
        name: "Delhi Dhaba",
        rating: 4.1,
        price_level: 1,
        vicinity: "Sector 62, Noida",
        types: ["restaurant", "food"],
        opening_hours: { open_now: true },
        geometry: {
          location: {
            lat: 28.6280,
            lng: 77.3649
          }
        },
        photos: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center"]
      },
      {
        place_id: "5",
        name: "City Cinema",
        rating: 4.0,
        price_level: 2,
        vicinity: "789 Theater Blvd",
        types: ["movie_theater", "entertainment"],
        opening_hours: { open_now: true },
        geometry: {
          location: {
            lat: 40.7505,
            lng: -73.9934
          }
        },
        photos: ["https://images.unsplash.com/photo-1489599735184-c5c8f4a8d0f0?w=400&h=300&fit=crop&crop=center"]
      },
      {
        place_id: "6",
        name: "Central Park Mall",
        rating: 4.2,
        price_level: 2,
        vicinity: "Sector 62, Noida",
        types: ["shopping_mall", "store"],
        opening_hours: { open_now: true },
        geometry: {
          location: {
            lat: 28.6280,
            lng: 77.3649
          }
        },
        photos: ["https://images.unsplash.com/photo-1555529903-fffe3037daa0?w=400&h=300&fit=crop&crop=center"]
      },
      {
        place_id: "7",
        name: "Botanical Garden",
        rating: 4.6,
        price_level: 0,
        vicinity: "Sector 18A, Noida",
        types: ["park", "tourist_attraction"],
        opening_hours: { open_now: true },
        geometry: {
          location: {
            lat: 28.5937,
            lng: 77.3848
          }
        },
        photos: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center"]
      },
      {
        place_id: "8",
        name: "FitLife Gym",
        rating: 4.4,
        price_level: 2,
        vicinity: "Sector 63, Noida",
        types: ["gym", "health"],
        opening_hours: { open_now: true },
        geometry: {
          location: {
            lat: 28.6280,
            lng: 77.3649
          }
        },
        photos: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center"]
      }
    ]

    // Filter results based on query
    const filteredPlaces = mockPlaces.filter(place =>
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.types.some(type => type.includes(query.toLowerCase()))
    )

    return NextResponse.json({
      results: filteredPlaces,
      status: "OK",
      source: 'mock'
    })

  } catch (error) {
    console.error('🔍 Places API: Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search places',
        details: error instanceof Error ? error.message : 'Unknown error',
        source: 'error'
      },
      { status: 500 }
    )
  }
}

