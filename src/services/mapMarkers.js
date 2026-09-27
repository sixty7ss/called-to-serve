import { createApp, h } from 'vue'

import mapboxgl from 'mapbox-gl'

import ProfileMarker from '@/components/map/ProfileMarker.vue'

export function createProfileMarker({ map, profile, onSelect, offset = [0, 0] }) {
  const container = document.createElement('div')

  const app = createApp({
    render() {
      return h(ProfileMarker, {
        profile,

        onSelect: () => {
          onSelect(profile)
        },
      })
    },
  })

  app.mount(container)

  const marker = new mapboxgl.Marker({
    element: container,
    anchor: 'center',
    offset,
  })
    .setLngLat([profile.longitude, profile.latitude])
    .addTo(map)

  return {
    marker,
    app,
  }
}
