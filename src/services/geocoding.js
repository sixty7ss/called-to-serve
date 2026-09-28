const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6/forward'

function getContextValue(feature, type) {
  if (feature.feature_type === type) {
    return feature.name || ''
  }

  return feature.context?.[type]?.name || ''
}

function getFullAddress(feature) {
  return (
    feature.properties?.full_address ||
    feature.place_name ||
    [
      getContextValue(feature, 'place'),
      getContextValue(feature, 'region'),
      getContextValue(feature, 'country'),
    ]
      .filter(Boolean)
      .join(', ')
  )
}

function getBounds(feature) {
  if (Array.isArray(feature.bbox) && feature.bbox.length === 4) {
    return feature.bbox
  }

  const coordinates = feature.geometry?.coordinates

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return [null, null, null, null]
  }

  const [longitude, latitude] = coordinates

  /*
   * Mapbox does not always return a bbox.
   * Fall back to a small area around the
   * location so fitBounds() still works.
   */
  return [longitude - 0.25, latitude - 0.25, longitude + 0.25, latitude + 0.25]
}

function normalizeFeature(feature) {
  const coordinates = feature.geometry?.coordinates || []

  const [longitude, latitude] = coordinates

  const [west, south, east, north] = getBounds(feature)

  return {
    id: feature.id,

    city: getContextValue(feature, 'place') || getContextValue(feature, 'locality'),

    state: getContextValue(feature, 'region'),

    country: getContextValue(feature, 'country'),

    latitude,
    longitude,

    west,
    south,
    east,
    north,

    fullAddress: getFullAddress(feature),
  }
}

async function requestGeocoding(params) {
  const query = new URLSearchParams({
    ...params,
    access_token: MAPBOX_TOKEN,
  })

  const response = await fetch(`${GEOCODING_URL}?${query}`)

  if (!response.ok) {
    throw new Error('Unable to retrieve location information from Mapbox.')
  }

  return response.json()
}

/*
|--------------------------------------------------------------------------
| Temporary Location Search
|--------------------------------------------------------------------------
|
| Used while the user is typing.
|
| permanent=false means these autocomplete
| results are NOT being requested for
| permanent storage.
|
*/

export async function searchMissionLocations(searchText) {
  const query = searchText?.trim()

  if (!query || query.length < 3) {
    return []
  }

  const data = await requestGeocoding({
    q: query,
    autocomplete: 'true',
    permanent: 'false',
    types: 'place,locality',
    limit: '5',
  })

  return (data.features || []).map(normalizeFeature)
}

/*
|--------------------------------------------------------------------------
| Permanent Selected Location
|--------------------------------------------------------------------------
|
| Called only after the user chooses a result.
|
| This makes one permanent geocoding request
| for the location that will actually be stored
| with the missionary record in Firestore.
|
*/

export async function getMissionLocationDetails(suggestion) {
  const query = suggestion?.fullAddress?.trim()

  if (!query) {
    throw new Error('Unable to identify the selected location.')
  }

  const data = await requestGeocoding({
    q: query,
    autocomplete: 'false',
    permanent: 'true',
    types: 'place,locality',
    limit: '1',
  })

  const feature = data.features?.[0]

  if (!feature) {
    throw new Error('No location details were found.')
  }

  return normalizeFeature(feature)
}
