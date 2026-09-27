<template>
  <div
    class="absolute right-6 top-6 z-20 w-[calc(100%-3rem)] max-w-sm rounded-2xl bg-white/95 p-5 shadow-2xl backdrop-blur"
  >
    <img :src="profileImage" :alt="fullName" class="block h-auto w-full rounded-xl" />

    <div class="pt-5">
      <h2 class="text-2xl font-semibold text-slate-900">
        <span v-if="title">
          {{ title }}
        </span>

        {{ fullName }}
      </h2>

      <p v-if="formattedLocation" class="mt-2 text-base text-slate-600">
        {{ formattedLocation }}
      </p>

      <p v-if="formattedDates" class="mt-2 text-sm text-slate-500">
        {{ formattedDates }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import { formatMissionDates } from '@/utils/dates'

import { getFullName, getMissionaryTitle, getProfileImage } from '@/utils/profile'

const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
})

const title = computed(() => {
  return getMissionaryTitle(props.profile)
})

const fullName = computed(() => {
  return getFullName(props.profile)
})

const profileImage = computed(() => {
  return getProfileImage(props.profile)
})

const formattedLocation = computed(() => {
  if (props.profile.mission) {
    return `${props.profile.mission} Mission`
  }

  return [props.profile.city, props.profile.state, props.profile.country].filter(Boolean).join(', ')
})

const formattedDates = computed(() => {
  return formatMissionDates(props.profile.startDate, props.profile.endDate)
})
</script>
