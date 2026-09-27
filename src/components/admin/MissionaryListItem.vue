<template>
  <div class="flex items-center gap-4 border-b border-slate-100 p-4 last:border-b-0">
    <img :src="profileImage" :alt="fullName" class="h-16 w-16 shrink-0 rounded-full object-cover" />

    <div class="min-w-0 flex-1">
      <h2 class="font-semibold text-slate-900">
        <span v-if="title">
          {{ title }}
        </span>

        {{ fullName }}
      </h2>

      <p v-if="formattedMission" class="text-sm text-slate-500">
        {{ formattedMission }}
      </p>

      <p v-if="formattedDates" class="text-sm text-slate-500">
        {{ formattedDates }}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label="Edit missionary"
        title="Edit"
        @click="$emit('edit', missionary)"
      >
        <CTSIcon name="pencil" size="md" />
      </button>

      <button
        type="button"
        class="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
        aria-label="Delete missionary"
        title="Delete"
        @click="$emit('delete', missionary)"
      >
        <CTSIcon name="trash" size="md" theme="danger" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import CTSIcon from '@/components/ui/CTSIcon.vue'
import { getProfileImage } from '@/utils/profile'
import { formatMissionDates } from '@/utils/dates'

const props = defineProps({
  missionary: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'delete'])

const fullName = computed(() => {
  return [props.missionary.firstName, props.missionary.lastName].filter(Boolean).join(' ')
})

const title = computed(() => {
  if (props.missionary.gender === 'male') {
    return 'Elder'
  }

  if (props.missionary.gender === 'female') {
    return 'Sister'
  }

  return ''
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

const profileImage = computed(() => {
  return getProfileImage(props.missionary)
})
</script>

<style scoped></style>
