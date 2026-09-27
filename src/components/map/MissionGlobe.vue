<template>
  <main class="fixed inset-0 h-dvh w-screen overflow-hidden bg-black">
    <div ref="mapContainer" class="absolute inset-0 h-full w-full"></div>

    <!-- HEADER / FILTERS -->
    <div class="absolute left-6 top-6 z-10">
      <div class="rounded-2xl bg-slate-950/60 px-6 py-4 text-white shadow-xl backdrop-blur-md">
        <h1 class="text-2xl font-semibold tracking-tight">Called to Serve</h1>

        <p class="mt-1 text-sm text-white/70">Missionaries Around the World</p>

        <div class="mt-4 flex flex-col gap-3">
          <!-- UPCOMING -->
          <div class="flex items-center justify-between gap-6 text-sm">
            <span class="text-white/80"> Upcoming </span>

            <button
              type="button"
              role="switch"
              :aria-checked="showUpcoming"
              :class="[
                'relative h-6 w-11 rounded-full transition',
                showUpcoming ? 'bg-white' : 'bg-white/20',
              ]"
              @click="showUpcoming = !showUpcoming"
            >
              <span
                :class="[
                  'absolute top-1 h-4 w-4 rounded-full transition-all',
                  showUpcoming ? 'left-6 bg-slate-900' : 'left-1 bg-white',
                ]"
              ></span>
            </button>
          </div>

          <!-- COMPLETED -->
          <div class="flex items-center justify-between gap-6 text-sm">
            <span class="text-white/80"> Completed </span>

            <button
              type="button"
              role="switch"
              :aria-checked="showCompleted"
              :class="[
                'relative h-6 w-11 rounded-full transition',
                showCompleted ? 'bg-white' : 'bg-white/20',
              ]"
              @click="showCompleted = !showCompleted"
            >
              <span
                :class="[
                  'absolute top-1 h-4 w-4 rounded-full transition-all',
                  showCompleted ? 'left-6 bg-slate-900' : 'left-1 bg-white',
                ]"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PROFILE CARD -->
    <Transition
      enter-active-class="transition duration-700 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-500 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div v-if="selectedProfile" class="fixed inset-0 z-20" @click.self="returnToGlobe">
        <ProfileCard :profile="selectedProfile" />
      </div>
    </Transition>

    <!-- PROFILE DOCK -->
    <ProfileDock :profiles="visibleProfiles" @select="selectDockProfile" />

    <!-- MENU -->
    <GlobeMenu :display-mode="displayMode" @display-mode="changeDisplayMode" />
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import GlobeMenu from '@/components/navigation/GlobeMenu.vue'
import ProfileCard from '@/components/map/ProfileCard.vue'
import ProfileDock from '@/components/map/ProfileDock.vue'

import { useProfileTour } from '@/composables/useProfileTour'

import { globeFog, homeView, mapStyle, secondsPerRevolution } from '@/config/map'

import { createProfileMarker } from '@/services/mapMarkers'

import { getProfiles } from '@/services/profiles'

import { isMissionCompleted, isMissionUpcoming } from '@/utils/profile'

const mapContainer = ref(null)

const profiles = ref([])
const selectedProfile = ref(null)

const displayMode = ref('tour')

const showUpcoming = ref(true)
const showCompleted = ref(true)

const markerApps = []

let map = null
let animationFrame = null
let userInteracting = false
let manualProfileTimer = null

/*
|--------------------------------------------------------------------------
| Profile Filtering
|--------------------------------------------------------------------------
*/

function isProfileVisible(profile) {
  if (isMissionUpcoming(profile) && !showUpcoming.value) {
    return false
  }

  if (isMissionCompleted(profile) && !showCompleted.value) {
    return false
  }

  return true
}

const visibleProfiles = computed(() => {
  return profiles.value.filter(isProfileVisible)
})

/*
|--------------------------------------------------------------------------
| Map Movement
|--------------------------------------------------------------------------
*/

function moveToProfile(profile) {
  if (!map || !profile) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    map.stop()

    map.once('moveend', resolve)

    if (profile.bounds) {
      map.fitBounds(profile.bounds, {
        padding: 100,
        duration: 4500,
        essential: true,
      })

      return
    }

    map.flyTo({
      center: [profile.longitude, profile.latitude],

      zoom: 5,
      duration: 4500,
      essential: true,
    })
  })
}

/*
|--------------------------------------------------------------------------
| Profile Tour
|--------------------------------------------------------------------------
*/

const {
  active: tourActive,
  start: startTour,
  stop: stopTour,
  pause: pauseTour,
  resume: resumeTour,
} = useProfileTour({
  profiles: visibleProfiles,

  moveToProfile,

  openProfile(profile) {
    selectedProfile.value = profile
    userInteracting = false
  },

  closeProfile() {
    selectedProfile.value = null
    userInteracting = true
  },

  displayDuration: 10000,
  closeDelay: 1000,
})

/*
|--------------------------------------------------------------------------
| Globe Rotation
|--------------------------------------------------------------------------
*/

function rotateGlobe() {
  if (!map) return

  const canRotate =
    displayMode.value === 'globe' &&
    !tourActive.value &&
    !userInteracting &&
    !selectedProfile.value &&
    !map.isMoving() &&
    map.getZoom() <= 3.1

  if (canRotate) {
    const center = map.getCenter()

    center.lng -= 360 / (secondsPerRevolution * 60)

    map.setCenter(center)
  }

  animationFrame = requestAnimationFrame(rotateGlobe)
}

/*
|--------------------------------------------------------------------------
| Profile Selection
|--------------------------------------------------------------------------
*/

async function selectProfile(profile) {
  clearManualProfileTimer()
  stopTour()

  displayMode.value = 'globe'
  selectedProfile.value = profile
  userInteracting = true

  await moveToProfile(profile)

  userInteracting = false
}

async function selectDockProfile(profile) {
  clearManualProfileTimer()

  const shouldResumeTour = displayMode.value === 'tour'

  if (shouldResumeTour) {
    pauseTour()
  }

  selectedProfile.value = null
  userInteracting = true

  await moveToProfile(profile)

  selectedProfile.value = profile
  userInteracting = false

  manualProfileTimer = setTimeout(() => {
    selectedProfile.value = null

    if (shouldResumeTour) {
      resumeTour()
      return
    }

    returnToGlobe()
  }, 10000)
}

function clearManualProfileTimer() {
  if (!manualProfileTimer) {
    return
  }

  clearTimeout(manualProfileTimer)

  manualProfileTimer = null
}

/*
|--------------------------------------------------------------------------
| Display Modes
|--------------------------------------------------------------------------
*/

function changeDisplayMode(mode) {
  if (mode === displayMode.value) {
    return
  }

  clearManualProfileTimer()

  displayMode.value = mode

  if (mode === 'tour') {
    selectedProfile.value = null
    startTour()

    return
  }

  stopTour()
  returnToGlobe()
}

function returnToGlobe() {
  clearManualProfileTimer()
  stopTour()

  displayMode.value = 'globe'
  selectedProfile.value = null
  userInteracting = true

  if (!map) {
    return
  }

  map.stop()

  map.easeTo({
    ...homeView,

    duration: 4500,
    essential: true,
  })

  map.once('moveend', finishInteraction)
}

/*
|--------------------------------------------------------------------------
| Marker Creation
|--------------------------------------------------------------------------
*/

function getMarkerOffset(index, count) {
  if (count <= 1) {
    return [0, 0]
  }

  const spacing = 34
  const center = (count - 1) / 2

  return [(index - center) * spacing, 0]
}

async function loadProfiles() {
  try {
    profiles.value = await getProfiles()

    const locationGroups = new Map()

    profiles.value.forEach((profile) => {
      const key = `${profile.longitude},${profile.latitude}`

      if (!locationGroups.has(key)) {
        locationGroups.set(key, [])
      }

      locationGroups.get(key).push(profile)
    })

    locationGroups.forEach((group) => {
      const count = group.length

      group.forEach((profile, index) => {
        const markerApp = createProfileMarker({
          map,
          profile,
          onSelect: selectProfile,

          offset: getMarkerOffset(index, count),
        })

        markerApps.push({
          ...markerApp,
          profile,
        })
      })
    })

    updateMarkerVisibility()
  } catch (error) {
    console.error('Unable to load missionaries:', error)
  }
}

/*
|--------------------------------------------------------------------------
| Marker Visibility
|--------------------------------------------------------------------------
*/

function updateMarkerVisibility() {
  markerApps.forEach(({ marker, profile }) => {
    marker.getElement().classList.toggle('hidden', !isProfileVisible(profile))
  })
}

watch([showUpcoming, showCompleted], () => {
  updateMarkerVisibility()

  /*
   * Restart the automatic tour so its current
   * profile/index always matches the filtered list.
   */
  if (displayMode.value === 'tour' && tourActive.value) {
    selectedProfile.value = null
    startTour()
  }
})

/*
|--------------------------------------------------------------------------
| Map Events
|--------------------------------------------------------------------------
*/

function startInteraction() {
  userInteracting = true
}

function finishInteraction() {
  userInteracting = false
}

function handleStyleLoad() {
  map?.setFog(globeFog)
}

async function handleMapLoad() {
  map?.resize()

  await loadProfiles()

  rotateGlobe()

  if (displayMode.value === 'tour' && visibleProfiles.value.length) {
    startTour()
  }
}

/*
|--------------------------------------------------------------------------
| Map Initialization
|--------------------------------------------------------------------------
*/

function initializeMap() {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

  map = new mapboxgl.Map({
    container: mapContainer.value,

    style: mapStyle,

    ...homeView,

    projection: 'globe',
  })

  map.on('style.load', handleStyleLoad)

  map.on('load', handleMapLoad)

  map.on('mousedown', startInteraction)

  map.on('mouseup', finishInteraction)

  map.on('touchstart', startInteraction)

  map.on('touchend', finishInteraction)
}

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(() => {
  initializeMap()
})

onBeforeUnmount(() => {
  stopTour()
  clearManualProfileTimer()

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }

  markerApps.forEach(({ app }) => {
    app?.unmount()
  })

  map?.remove()
})
</script>
