const token = import.meta.env.VITE_MAPBOX_TOKEN

export async function searchMissionLocations(query) {
  if (!query || query.trim().length < 3) {
    return []
  }

  const params = new URLSearchParams({
    q: query.trim(),
    access_token: token,
    limit: '5',
    types: 'place,locality',
    autocomplete: 'true',
    permanent: 'true',
  })

  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`)

  if (!response.ok) {
    throw new Error('Unable to search for locations.')
  }

  const data = await response.json()

  return (data.features ?? []).map((feature) => {
    const props = feature.properties ?? {}

    return {
      id: feature.id,

      name: props.name ?? feature.text ?? '',

      fullAddress: props.full_address ?? feature.place_name ?? props.name ?? '',

      feature,
    }
  })
}

export async function getMissionLocationDetails(suggestion) {
  const feature = suggestion.feature

  const props = feature.properties ?? {}

  const context = props.context ?? {}

  const coordinates = feature.geometry?.coordinates

  if (!coordinates) {
    throw new Error('No coordinates were returned for this location.')
  }

  const [longitude, latitude] = coordinates

  const city = props.name ?? context.place?.name ?? ''

  const state = context.region?.name ?? ''

  const country = context.country?.name ?? ''

  const countryCode = context.country?.country_code?.toLowerCase() ?? ''

  let boundsQuery
  let boundsType

  if (countryCode === 'us' && state) {
    boundsQuery = `${state}, United States`

    boundsType = 'region'
  } else {
    boundsQuery = country
    boundsType = 'country'
  }

  const boundsParams = new URLSearchParams({
    q: boundsQuery,
    access_token: token,
    limit: '1',
    types: boundsType,
    permanent: 'true',
  })

  const boundsResponse = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?${boundsParams}`,
  )

  if (!boundsResponse.ok) {
    throw new Error('Unable to determine map bounds.')
  }

  const boundsData = await boundsResponse.json()

  const boundsFeature = boundsData.features?.[0]

  const bbox = boundsFeature?.properties?.bbox ?? boundsFeature?.bbox

  if (!bbox) {
    throw new Error('No map bounds were returned.')
  }

  const [west, south, east, north] = bbox

  return {
    city,
    state,
    country,

    latitude,
    longitude,

    west,
    south,
    east,
    north,
  }
}
