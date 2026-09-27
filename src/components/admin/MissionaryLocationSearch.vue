<template>
  <div>
    <h2 class="mb-4 text-lg font-semibold text-slate-900">Mission Location</h2>

    <div class="relative">
      <label class="mb-2 block text-sm font-semibold text-slate-700"> Search for a City </label>

      <input
        v-model="searchText"
        type="text"
        class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        placeholder="Start typing a city..."
        autocomplete="off"
        @input="searchLocations"
      />

      <div
        v-if="suggestions.length"
        class="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <button
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          type="button"
          class="block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
          @click="selectSuggestion(suggestion)"
        >
          <div class="font-medium text-slate-900">
            {{ suggestion.name }}
          </div>

          <div class="mt-1 text-sm text-slate-500">
            {{ suggestion.fullAddress }}
          </div>
        </button>
      </div>
    </div>

    <div v-if="selected" class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Location</p>

      <p class="mt-1 font-medium text-slate-900">
        {{ formattedLocation }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

import { getMissionLocationDetails, searchMissionLocations } from '@/services/geocoding'

const props = defineProps({
  initialLocation: {
    type: Object,
    default: null,
  },

  initialLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['selected'])

const searchText = ref(props.initialLabel)

const suggestions = ref([])

const selected = ref(props.initialLocation)

let searchTimer = null

const formattedLocation = computed(() => {
  if (!selected.value) {
    return ''
  }

  return [selected.value.city, selected.value.state, selected.value.country]
    .filter(Boolean)
    .join(', ')
})

function searchLocations() {
  clearTimeout(searchTimer)

  selected.value = null
  suggestions.value = []

  emit('selected', null)

  const query = searchText.value.trim()

  if (query.length < 3) {
    return
  }

  searchTimer = setTimeout(async () => {
    try {
      suggestions.value = await searchMissionLocations(query)
    } catch (error) {
      console.error('Unable to search locations:', error)

      suggestions.value = []
    }
  }, 300)
}

async function selectSuggestion(suggestion) {
  try {
    const location = await getMissionLocationDetails(suggestion)

    selected.value = location
    searchText.value = suggestion.fullAddress
    suggestions.value = []

    emit('selected', location)
  } catch (error) {
    console.error('Unable to select location:', error)
  }
}

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
})
</script>
