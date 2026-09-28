<template>
  <div class="pointer-events-none absolute bottom-5 left-25 right-25 z-20">
    <div
      class="pointer-events-auto relative overflow-hidden rounded-2xl bg-slate-950/60 shadow-xl backdrop-blur-md"
    >
      <!-- SCROLLER -->
      <div
        ref="scroller"
        class="overflow-x-auto px-4 py-3"
        tabindex="0"
        @pointerdown="beginUserInteraction"
        @pointermove="handlePointerMove"
        @pointerup="endPointerInteraction"
        @pointercancel="endPointerInteraction"
        @wheel="noteUserInteraction"
        @keydown="handleKeydown"
      >
        <div class="flex w-max items-center gap-6 p-3">
          <div
            v-for="profile in profiles"
            :key="profile.id"
            :data-profile-id="profile.id"
            class="shrink-0"
          >
            <ProfileMarker
              :profile="profile"
              :active="profile.id === activeProfileId"
              size="lg"
              @select="$emit('select', $event)"
            />
          </div>
        </div>
      </div>

      <!-- LEFT SCROLL INDICATOR -->
      <div
        v-if="canScrollLeft"
        class="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-start bg-gradient-to-r from-slate-950/90 to-transparent pl-2"
      >
        <CTSIcon name="chevronLeft" size="md" theme="white" />
      </div>

      <!-- RIGHT SCROLL INDICATOR -->
      <div
        v-if="canScrollRight"
        class="pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end bg-gradient-to-l from-slate-950/90 to-transparent pr-2"
      >
        <CTSIcon name="chevronRight" size="md" theme="white" />
      </div>

      <!-- INITIAL SCROLL HINT -->
      <div
        v-if="canScrollRight && !hasScrolled"
        class="pointer-events-none absolute bottom-1 right-12 rounded-full bg-slate-950/70 px-2 py-1 text-[10px] font-medium text-white/80"
      >
        Swipe to browse
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import ProfileMarker from '@/components/map/ProfileMarker.vue'
import CTSIcon from '@/components/ui/CTSIcon.vue'

const props = defineProps({
  profiles: {
    type: Array,
    default: () => [],
  },

  activeProfileId: {
    type: String,
    default: null,
  },
})

defineEmits(['select'])

const scroller = ref(null)

const hasScrolled = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const userBrowsing = ref(false)

let pointerActive = false
let interactionTimer = null

const INTERACTION_PAUSE = 10000

/*
|--------------------------------------------------------------------------
| Scroll State
|--------------------------------------------------------------------------
*/

function updateScrollState() {
  if (!scroller.value) {
    return
  }

  const { scrollLeft, scrollWidth, clientWidth } = scroller.value

  canScrollLeft.value = scrollLeft > 2

  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 2

  if (scrollLeft > 5) {
    hasScrolled.value = true
  }
}

/*
|--------------------------------------------------------------------------
| User Interaction
|--------------------------------------------------------------------------
*/

function noteUserInteraction() {
  userBrowsing.value = true

  clearTimeout(interactionTimer)

  interactionTimer = setTimeout(() => {
    userBrowsing.value = false

    scrollActiveProfileIntoView()
  }, INTERACTION_PAUSE)
}

function beginUserInteraction() {
  pointerActive = true

  noteUserInteraction()
}

function handlePointerMove() {
  if (!pointerActive) {
    return
  }

  noteUserInteraction()
}

function endPointerInteraction() {
  pointerActive = false

  noteUserInteraction()
}

function handleKeydown(event) {
  const scrollKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']

  if (scrollKeys.includes(event.key)) {
    noteUserInteraction()
  }
}

/*
|--------------------------------------------------------------------------
| Active Profile Tracking
|--------------------------------------------------------------------------
*/

async function scrollActiveProfileIntoView() {
  if (!scroller.value || !props.activeProfileId || userBrowsing.value) {
    return
  }

  await nextTick()

  const activeMarker = scroller.value.querySelector(`[data-profile-id="${props.activeProfileId}"]`)

  if (!activeMarker) {
    return
  }

  const container = scroller.value

  const markerLeft = activeMarker.offsetLeft

  const markerWidth = activeMarker.offsetWidth

  const markerRight = markerLeft + markerWidth

  const visibleLeft = container.scrollLeft

  const visibleRight = visibleLeft + container.clientWidth

  /*
   * Don't move the dock when the active marker
   * is already completely visible.
   */
  if (markerLeft >= visibleLeft && markerRight <= visibleRight) {
    return
  }

  /*
   * Center the active profile when it has moved
   * outside the visible portion of the dock.
   */
  const targetLeft = markerLeft - container.clientWidth / 2 + markerWidth / 2

  container.scrollTo({
    left: Math.max(0, targetLeft),
    behavior: 'smooth',
  })
}

/*
|--------------------------------------------------------------------------
| Watchers
|--------------------------------------------------------------------------
*/

watch(
  () => props.activeProfileId,
  () => {
    scrollActiveProfileIntoView()
  },
)

watch(
  () => props.profiles,
  async () => {
    await nextTick()

    updateScrollState()
    scrollActiveProfileIntoView()
  },
  {
    deep: true,
  },
)

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await nextTick()

  updateScrollState()

  scroller.value?.addEventListener('scroll', updateScrollState, {
    passive: true,
  })

  scrollActiveProfileIntoView()
})

onBeforeUnmount(() => {
  clearTimeout(interactionTimer)

  scroller.value?.removeEventListener('scroll', updateScrollState)
})
</script>
