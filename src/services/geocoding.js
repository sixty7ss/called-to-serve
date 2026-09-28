const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6/forward'

/*
|--------------------------------------------------------------------------
| Mapbox Helpers
|--------------------------------------------------------------------------
*/

function getFeatureType(feature) {
  return feature?.properties?.feature_type || feature?.feature_type || ''
}

function getFeatureName(feature) {
  return feature?.properties?.name || feature?.name || ''
}

function getContext(feature) {
  return feature?.properties?.context || feature?.context || {}
}

function getContextObject(feature, type) {
  if (getFeatureType(feature) === type) {
    return {
      mapbox_id: feature?.properties?.mapbox_id || feature?.id || '',
      name: getFeatureName(feature),
    }
  }

  return getContext(feature)?.[type] || null
}

function getContextValue(feature, type) {
  return getContextObject(feature, type)?.name || ''
}

function getCountryCode(feature) {
  const country = getContextObject(feature, 'country')

  return (country?.country_code || country?.country_code_alpha_2 || '').trim().toUpperCase()
}

function getFullAddress(feature) {
  return (
    feature?.properties?.full_address ||
    feature?.properties?.place_formatted ||
    feature?.place_name ||
    [
      getContextValue(feature, 'place') || getContextValue(feature, 'locality'),
      getContextValue(feature, 'region'),
      getContextValue(feature, 'country'),
    ]
      .filter(Boolean)
      .join(', ')
  )
}

/*
|--------------------------------------------------------------------------
| Bounds
|--------------------------------------------------------------------------
*/

function hasBounds(feature) {
  const bounds = feature?.properties?.bbox || feature?.bbox

  return Array.isArray(bounds) && bounds.length === 4
}

function getFallbackBounds(longitude, latitude) {
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return [null, null, null, null]
  }

  return [longitude - 0.25, latitude - 0.25, longitude + 0.25, latitude + 0.25]
}

function getFeatureBounds(feature) {
  const bounds = feature?.properties?.bbox || feature?.bbox

  if (Array.isArray(bounds) && bounds.length === 4) {
    return bounds
  }

  const coordinates = feature?.geometry?.coordinates || []

  const [longitude, latitude] = coordinates

  return getFallbackBounds(longitude, latitude)
}

/*
|--------------------------------------------------------------------------
| Country / Region Rules
|--------------------------------------------------------------------------
*/

function usesRegionBounds(countryName, countryCode) {
  const normalizedName = (countryName || '').trim().toLowerCase()

  const normalizedCode = (countryCode || '').trim().toUpperCase()

  return (
    normalizedCode === 'US' ||
    normalizedCode === 'CA' ||
    ['united states', 'united states of america', 'usa', 'u.s.a.', 'us', 'u.s.', 'canada'].includes(
      normalizedName,
    )
  )
}

/*
|--------------------------------------------------------------------------
| Normalize Mapbox Feature
|--------------------------------------------------------------------------
*/

function normalizeFeature(feature) {
  const coordinates = feature?.geometry?.coordinates || []

  const [longitude, latitude] = coordinates

  const [west, south, east, north] = getFeatureBounds(feature)

  return {
    mapboxId: feature?.properties?.mapbox_id || feature?.id || '',
    city: getContextValue(feature, 'place') || getContextValue(feature, 'locality'),
    state: getContextValue(feature, 'region'),
    country: getContextValue(feature, 'country'),
    countryCode: getCountryCode(feature),

    latitude,
    longitude,

    west,
    south,
    east,
    north,

    fullAddress: getFullAddress(feature),
  }
}

/*
|--------------------------------------------------------------------------
| Mapbox Request
|--------------------------------------------------------------------------
*/

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
| Temporary Autocomplete Search
|--------------------------------------------------------------------------
|
| These requests happen while the user types.
|
| permanent=false means autocomplete results
| are not requested for permanent storage.
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
| Permanent Geographic Bounds
|--------------------------------------------------------------------------
|
| U.S. and Canada:
|   Store the state/province bounds.
|
| Everywhere else:
|   Store the country bounds.
|
*/

async function getPermanentAreaBounds(location) {
  const { state, country, countryCode } = location

  /*
   * United States / Canada
   *
   * Search specifically for the state or province.
   */
  if (usesRegionBounds(country, countryCode) && state) {
    const params = {
      q: `${state}, ${country}`,

      autocomplete: 'false',

      permanent: 'true',

      types: 'region',

      limit: '1',
    }

    /*
     * Restrict the search to the correct
     * country whenever Mapbox supplied
     * its ISO country code.
     */
    if (countryCode) {
      params.country = countryCode.toLowerCase()
    }

    const data = await requestGeocoding(params)

    const regionFeature = data.features?.[0]

    if (regionFeature && hasBounds(regionFeature)) {
      return getFeatureBounds(regionFeature)
    }
  }

  /*
   * Other countries.
   *
   * Search specifically for the country
   * so the map zooms to the country level.
   */
  if (country) {
    const params = {
      q: country,

      autocomplete: 'false',

      permanent: 'true',

      types: 'country',

      limit: '1',
    }

    if (countryCode) {
      params.country = countryCode.toLowerCase()
    }

    const data = await requestGeocoding(params)

    const countryFeature = data.features?.[0]

    if (countryFeature && hasBounds(countryFeature)) {
      return getFeatureBounds(countryFeature)
    }
  }

  /*
   * If Mapbox cannot find the larger
   * geographic area's bounds, retain
   * the selected location's bounds.
   */
  return [location.west, location.south, location.east, location.north]
}

/*
|--------------------------------------------------------------------------
| Permanent Selected Location
|--------------------------------------------------------------------------
|
| This runs only after the user chooses
| a location from the autocomplete list.
|
*/

export async function getMissionLocationDetails(suggestion) {
  const query = suggestion?.fullAddress?.trim()

  if (!query) {
    throw new Error('Unable to identify the selected location.')
  }

  /*
   * First permanent lookup:
   * retrieve the actual selected city.
   */
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

  const location = normalizeFeature(feature)

  /*
   * Second permanent lookup:
   *
   * U.S.    -> state bounds
   * Canada  -> province bounds
   * Other   -> country bounds
   */
  const [west, south, east, north] = await getPermanentAreaBounds(location)

  return {
    ...location,

    west,
    south,
    east,
    north,
  }
}
