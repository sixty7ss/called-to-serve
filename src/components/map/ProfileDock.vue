<template>
  <div
    class="pointer-events-none absolute bottom-5 left-1/2 z-20 w-[calc(100%-9rem)] max-w-4xl -translate-x-1/2"
  >
    <div
      class="pointer-events-auto flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-950/60 px-4 py-3 shadow-xl backdrop-blur-md"
    >
      <ProfileMarker
        v-for="profile in profiles"
        :key="profile.id"
        :profile="profile"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import ProfileMarker from '@/components/map/ProfileMarker.vue'

defineProps({
  profiles: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['select'])
</script>
