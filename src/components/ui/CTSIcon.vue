<template>
  <component v-if="icon" :is="icon" :class="iconClasses" v-bind="$attrs" />
</template>

<script setup>
import { computed } from 'vue'

import { iconMap } from '@/utils/icons'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },

  size: {
    type: String,
    default: 'md',
  },

  theme: {
    type: String,
    default: 'default',
  },
})

const sizes = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const themes = {
  default: 'text-slate-700',
  muted: 'text-slate-400',
  dark: 'text-slate-900',
  white: 'text-white',
  danger: 'text-red-600',
}

const icon = computed(() => {
  return iconMap[props.name]
})

const iconClasses = computed(() => {
  return [sizes[props.size] ?? sizes.md, themes[props.theme] ?? themes.default]
})
</script>
