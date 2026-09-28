<template>
  <main class="fixed inset-0 h-dvh w-screen overflow-hidden bg-black">
    <div ref="mapContainer" class="absolute inset-0 h-full w-full"></div>
    <!-- FILTERS -->
    <MissionaryFilters
      v-model:missionary-status="missionaryStatus"
      v-model:missionary-type="missionaryType"
      v-model:selected-letter="selectedLetter"
      v-model:selected-country="selectedCountry"
      v-model:selected-state="selectedState"
      v-model:selected-decade="selectedDecade"
      :last-name-letters="lastNameLetters"
      :countries="countries"
      :states="states"
      :decades="decades"
      :state-filter-disabled="stateFilterDisabled"
      :has-refinement-filters="hasRefinementFilters"
      :shown-count="sortedProfiles.length"
      @clear="clearRefinementFilters"
    />

    <!-- PROFILE CARD -->
    <Transition
      enter-active-class="transition duration-700 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-500 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div v-if="selectedProfile" class="fixed inset-0 z-[2000]" @click.self="closeSelectedProfile">
        <ProfileCard :profile="selectedProfile" />
      </div>
    </Transition>
    <!-- PROFILE DOCK -->
    <ProfileDock
      :profiles="sortedProfiles"
      :active-profile-id="activeProfileId"
      @select="selectDockProfile"
    />
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
import MissionaryFilters from '@/components/map/MissionaryFilters.vue'
import { useProfileTour } from '@/composables/useProfileTour'
import { useMissionaryFilters } from '@/composables/useMissionaryFilters'
import { globeFog, homeView, mapStyle, secondsPerRevolution } from '@/config/map'
import { createProfileMarker } from '@/services/mapMarkers'
import { getProfiles } from '@/services/profiles'

const mapContainer = ref(null)
const profiles = ref([])
const selectedProfile = ref(null)
const activeProfileId = ref(null)
const displayMode = ref('tour')

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

const {
  missionaryStatus,
  missionaryType,

  selectedLetter,
  selectedCountry,
  selectedState,
  selectedDecade,

  lastNameLetters,
  countries,
  states,
  decades,

  stateFilterDisabled,
  hasRefinementFilters,

  visibleProfiles,
  sortedProfiles,

  isProfileVisible,
  clearRefinementFilters,
} = useMissionaryFilters(profiles)

/*
|--------------------------------------------------------------------------
| Map Movement
|--------------------------------------------------------------------------
*/

function moveToProfile(profile) {
  if (!map || !profile) {
    return Promise.resolve()
  }
  activeProfileId.value = profile.id
  return new Promise((resolve) => {
    map.stop()
    map.once('moveend', resolve)
    if (profile.bounds) {
      map.fitBounds(profile.bounds, {
        padding: 300,
        maxZoom: 6,
        duration: 4500,
        essential: true,
      })
      return
    }
    map.flyTo({
      center: [profile.longitude, profile.latitude],
      zoom: 4,
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
  paused: tourPaused,
  start: startTour,
  stop: stopTour,
  pause: pauseTour,
  resume: resumeTour,
} = useProfileTour({
  profiles: sortedProfiles,
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
  if (manualProfileTimer) {
    clearTimeout(manualProfileTimer)
    manualProfileTimer = null
  }
  if (displayMode.value === 'tour') {
    pauseTour()
  }
  await moveToProfile(profile)
  selectedProfile.value = profile
  manualProfileTimer = setTimeout(() => {
    selectedProfile.value = null
    manualProfileTimer = null
    if (displayMode.value === 'tour' && tourActive.value && tourPaused.value) {
      resumeTour()
    }
  }, 10000)
}
function clearManualProfileTimer() {
  if (!manualProfileTimer) {
    return
  }
  clearTimeout(manualProfileTimer)
  manualProfileTimer = null
}
function closeSelectedProfile() {
  if (manualProfileTimer) {
    clearTimeout(manualProfileTimer)
    manualProfileTimer = null
  }
  selectedProfile.value = null
  if (displayMode.value === 'tour' && tourActive.value && tourPaused.value) {
    setTimeout(() => {
      resumeTour()
    }, 300)
    return
  }
  if (displayMode.value !== 'tour') {
    returnToGlobe()
  }
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
  activeProfileId.value = null
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
    updateMarkerStacking()
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
function updateMarkerStacking() {
  markerApps.forEach(({ marker, profile }) => {
    const element = marker.getElement()
    element.style.zIndex = profile.id === activeProfileId.value ? '1000' : '1'
  })
}
watch(visibleProfiles, () => {
  updateMarkerVisibility()
  if (
    activeProfileId.value &&
    !visibleProfiles.value.some((profile) => profile.id === activeProfileId.value)
  ) {
    activeProfileId.value = null
    selectedProfile.value = null
  }
  if (displayMode.value === 'tour' && tourActive.value && visibleProfiles.value.length) {
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
  if (!map) {
    return
  }

  map.setFog(globeFog)
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

watch(activeProfileId, () => {
  updateMarkerStacking()
})
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
