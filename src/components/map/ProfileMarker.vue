<template>
  <button
    type="button"
    :aria-label="`View ${fullName}`"
    :class="markerClasses"
    :style="{
      backgroundImage: `url('${profileImage}')`,
    }"
    @click="$emit('select', profile)"
  >
    <span v-if="statusIcon" :class="badgeClasses">
      <CTSIcon :name="statusIcon" size="xs" theme="white" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

import CTSIcon from '@/components/ui/CTSIcon.vue'

import {
  getFullName,
  getProfileImage,
  isMissionCompleted,
  isMissionUpcoming,
} from '@/utils/profile'

const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])

const fullName = computed(() => {
  return getFullName(props.profile)
})

const profileImage = computed(() => {
  return getProfileImage(props.profile)
})

const completed = computed(() => {
  return isMissionCompleted(props.profile)
})

const upcoming = computed(() => {
  return isMissionUpcoming(props.profile)
})

const statusIcon = computed(() => {
  if (completed.value) {
    return 'check'
  }

  if (upcoming.value) {
    return 'clock'
  }

  return ''
})

const markerClasses = computed(() => {
  return [
    'relative h-[54px] w-[54px] cursor-pointer rounded-full border-[3px] bg-cover bg-center shadow-lg transition duration-150 hover:scale-110 hover:shadow-xl',

    completed.value
      ? 'border-slate-400 grayscale-[40%] saturate-[70%] opacity-90'
      : upcoming.value
        ? 'border-amber-400 opacity-90'
        : 'border-white',
  ]
})

const badgeClasses = computed(() => {
  return [
    'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-white shadow',

    completed.value ? 'bg-slate-700' : 'bg-amber-500',
  ]
})
</script>
