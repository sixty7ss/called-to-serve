<template>
  <div class="pointer-events-none absolute bottom-5 left-25 right-25 z-20">
    <div
      class="pointer-events-auto relative overflow-hidden rounded-2xl bg-slate-950/60 shadow-xl backdrop-blur-md"
    >
      <div ref="scroller" class="overflow-x-auto px-4 py-3" @scroll="handleScroll">
        <div class="grid w-max grid-flow-col grid-rows-2 gap-5 p-2">
          <ProfileMarker
            v-for="profile in profiles"
            :key="profile.id"
            :profile="profile"
            :active="profile.id === activeProfileId"
            @select="$emit('select', $event)"
          />
        </div>
      </div>

      <div
        v-if="canScrollLeft"
        class="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-start bg-gradient-to-r from-slate-950/90 to-transparent pl-2"
      >
        <CTSIcon name="chevronLeft" size="md" theme="white" />
      </div>

      <div
        v-if="canScrollRight"
        class="pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end bg-gradient-to-l from-slate-950/90 to-transparent pr-2"
      >
        <CTSIcon name="chevronRight" size="md" theme="white" />
      </div>

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
import { nextTick, onMounted, ref, watch } from 'vue'

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

function updateScrollState() {
  if (!scroller.value) {
    return
  }

  const { scrollLeft, scrollWidth, clientWidth } = scroller.value

  canScrollLeft.value = scrollLeft > 2

  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 2
}

function handleScroll() {
  if (scroller.value?.scrollLeft > 5) {
    hasScrolled.value = true
  }

  updateScrollState()
}

async function refreshScrollState() {
  await nextTick()

  updateScrollState()
}

watch(() => props.profiles, refreshScrollState, {
  deep: true,
})

onMounted(() => {
  refreshScrollState()
})
</script>
