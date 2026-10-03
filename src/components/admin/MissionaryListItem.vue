<template>
  <div class="flex items-center gap-4 border-b border-slate-100 p-4 last:border-b-0">
    <div class="relative shrink-0">
      <img
        :src="profileImage"
        :alt="displayName"
        class="h-16 w-16 rounded-full border-[3px] border-white object-cover shadow"
      />

      <div
        v-if="statusIcon"
        :class="[
          'absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white',
          completed ? 'bg-green-600' : 'bg-amber-500',
        ]"
      >
        <CTSIcon :name="statusIcon" size="xs" theme="white" />
      </div>
    </div>

    <div class="min-w-0 flex-1">
      <h2 class="font-semibold text-slate-900">
        {{ displayName }}
      </h2>

      <p v-if="formattedMission" class="text-sm text-slate-500">
        {{ formattedMission }}
      </p>

      <p v-if="formattedDates" class="mt-1 text-sm text-slate-400">
        {{ formattedDates }}
      </p>
    </div>

    <div class="flex shrink-0 gap-2">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-50"
        title="Edit missionary"
        @click="$emit('edit', missionary)"
      >
        <CTSIcon name="pencil" size="sm" />
      </button>

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
        title="Delete missionary"
        @click="$emit('delete', missionary)"
      >
        <CTSIcon name="trash" size="sm" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import CTSIcon from '@/components/ui/CTSIcon.vue'

import { formatMissionDates } from '@/utils/dates'

import {
  getAdminDisplayName,
  getProfileImage,
  isMissionCompleted,
  isMissionUpcoming,
} from '@/utils/profile'

const props = defineProps({
  missionary: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'delete'])

const displayName = computed(() => {
  return getAdminDisplayName(props.missionary)
})

const profileImage = computed(() => {
  return getProfileImage(props.missionary)
})

const formattedMission = computed(() => {
  if (!props.missionary.mission) {
    return ''
  }

  return `${props.missionary.mission} Mission`
})

const formattedDates = computed(() => {
  return formatMissionDates(props.missionary.startDate, props.missionary.endDate)
})

const upcoming = computed(() => {
  return isMissionUpcoming(props.missionary)
})

const completed = computed(() => {
  return isMissionCompleted(props.missionary)
})

const statusIcon = computed(() => {
  if (completed.value) {
    return 'check'
  }

  if (upcoming.value) {
    return 'clock'
  }

  return null
})
</script>
