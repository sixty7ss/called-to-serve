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
      <CTSIcon :name="statusIcon" :size="size === 'lg' ? 'sm' : 'xs'" theme="white" />
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

  active: {
    type: Boolean,
    default: false,
  },

  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['sm', 'lg'].includes(value),
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

const markerSizeClasses = computed(() => {
  return props.size === 'lg' ? 'h-20 w-20 border-3' : 'h-15 w-15 border-3'
})

const markerClasses = computed(() => [
  'relative cursor-pointer rounded-full bg-cover bg-center shadow-lg transition duration-150 hover:scale-110 hover:shadow-xl',

  markerSizeClasses.value,

  completed.value
    ? 'border-slate-400 grayscale-[40%] saturate-[70%] opacity-90'
    : upcoming.value
      ? 'border-amber-400 opacity-90'
      : 'border-white',

  props.active ? 'scale-110 ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-950' : '',
])

const badgeSizeClasses = computed(() => {
  return props.size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'
})

const badgeClasses = computed(() => [
  'absolute -bottom-1 -right-1 flex items-center justify-center rounded-full border-2 border-white text-white shadow',

  badgeSizeClasses.value,

  completed.value ? 'bg-slate-700' : 'bg-amber-500',
])
</script>
