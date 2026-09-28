<template>
  <section>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">
          {{ isEditing ? 'Edit Missionary' : 'Add Missionary' }}
        </h1>

        <p class="mt-1 text-slate-600">Called to Serve</p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-white"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
    </div>

    <form class="rounded-2xl bg-white p-6 shadow-sm" @submit.prevent="save">
      <h2 class="mb-4 text-lg font-semibold text-slate-900">Missionary Information</h2>
      <div class="grid gap-5 md:grid-cols-3">
        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700"> First Name </label>

          <input
            v-model="form.firstName"
            type="text"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700">
            Middle Name (optional)</label
          >

          <input
            v-model="form.middleName"
            type="text"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700"> Last Name (if )</label>

          <input
            v-model="form.lastName"
            type="text"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </div>
      </div>

      <div class="mt-5">
        <label class="mb-2 block text-sm font-semibold text-slate-700"> Mission </label>

        <input
          v-model="form.mission"
          type="text"
          class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          placeholder="California, Modesto"
          required
        />
      </div>
      <div class="mt-5">
        <span class="mb-2 block text-sm font-semibold text-slate-700">Senior Missionaries</span>
      </div>

      <div class="mt-5">
        <span class="mb-2 block text-sm font-semibold text-slate-700"> Senior Missionaries </span>
      </div>

      <div class="mt-5 grid gap-5 md:grid-cols-3">
        <div>
          <label class="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              :checked="form.missionaryType === 'senior'"
              class="h-5 w-5 rounded border-slate-300"
              @change="handleSeniorChange"
            />

            <div class="text-sm text-slate-500">Check if senior missionary.</div>
          </label>
        </div>

        <div>
          <label
            v-if="form.missionaryType === 'senior'"
            class="flex cursor-pointer items-start gap-3"
          >
            <input
              v-model="form.isCouple"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-300"
            />

            <div class="text-sm text-slate-500">
              Check if this record represents a senior couple.
            </div>
          </label>
        </div>

        <div v-if="form.isCouple">
          <label class="mb-2 block text-sm font-semibold text-slate-700"> Spouse First Name </label>

          <input
            v-model="form.spouseFirstName"
            type="text"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="Spouse first name"
            required
          />
        </div>
      </div>

      <div class="mt-5" v-if="form.isCouple === false">
        <label class="mb-2 block text-sm font-semibold text-slate-700"> Gender </label>

        <select
          v-model="form.gender"
          class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          required
        >
          <option value="" disabled>Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div class="mt-6">
        <MissionaryPhotoField
          :existing-photo-url="existingPhotoUrl"
          :gender="form.gender"
          :is-couple="form.isCouple"
          @selected="handlePhotoSelected"
          @remove="handlePhotoRemoved"
        />
      </div>

      <div class="mt-8">
        <h2 class="mb-4 text-lg font-semibold text-slate-900">Service Dates</h2>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"> Start Date </label>

            <input
              v-model="form.startDate"
              type="date"
              class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"> End Date </label>

            <input
              v-model="form.endDate"
              type="date"
              class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              required
            />
          </div>
        </div>
      </div>

      <div class="mt-8">
        <MissionaryLocationSearch
          :initial-location="selectedLocation"
          :initial-label="initialLocationLabel"
          @selected="selectedLocation = $event"
        />
      </div>

      <div v-if="message" class="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
        {{ message }}
      </div>

      <div class="mt-8 flex gap-3 border-t border-slate-100 pt-6">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ submitLabel }}
        </button>

        <button
          type="button"
          class="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

import MissionaryLocationSearch from '@/components/admin/MissionaryLocationSearch.vue'
import MissionaryPhotoField from '@/components/admin/MissionaryPhotoField.vue'

import { createMissionary, updateMissionary } from '@/services/missionaryAdmin'

const props = defineProps({
  missionary: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['saved', 'cancel'])

const saving = ref(false)
const message = ref('')
const imageFile = ref(null)
const removeExistingPhoto = ref(false)

const form = reactive({
  firstName: props.missionary?.firstName || '',
  middleName: props.missionary?.middleName || '',
  lastName: props.missionary?.lastName || '',
  missionaryType: props.missionary?.missionaryType || 'fullTime',
  isCouple: props.missionary?.isCouple || false,
  spouseFirstName: props.missionary?.spouseFirstName || '',
  gender: props.missionary?.gender || '',
  mission: props.missionary?.mission || '',
  startDate: props.missionary?.startDate || '',
  endDate: props.missionary?.endDate || '',
})

const selectedLocation = ref(getInitialLocation())

const isEditing = computed(() => {
  return Boolean(props.missionary?.id)
})

const existingPhotoUrl = computed(() => {
  return removeExistingPhoto.value ? '' : props.missionary?.photoUrl || ''
})

const initialLocationLabel = computed(() => {
  if (!props.missionary) {
    return ''
  }

  return [props.missionary.city, props.missionary.state, props.missionary.country]
    .filter(Boolean)
    .join(', ')
})

const submitLabel = computed(() => {
  if (saving.value) {
    return 'Saving...'
  }

  return isEditing.value ? 'Save Changes' : 'Add Missionary'
})

function getInitialLocation() {
  if (!props.missionary) {
    return null
  }

  const { city, state, country, latitude, longitude, west, south, east, north } = props.missionary

  return {
    city,
    state,
    country,
    latitude,
    longitude,
    west,
    south,
    east,
    north,
  }
}

function handlePhotoSelected(file) {
  imageFile.value = file

  if (file) {
    removeExistingPhoto.value = false
  }
}

function handlePhotoRemoved() {
  imageFile.value = null
  removeExistingPhoto.value = true
}

function handleSeniorChange(event) {
  form.missionaryType = event.target.checked ? 'senior' : 'fullTime'

  if (!event.target.checked) {
    form.isCouple = false
    form.spouseFirstName = ''
  }
}

async function save() {
  if (!selectedLocation.value) {
    message.value = 'Please select a location from the search results.'

    return
  }

  saving.value = true

  message.value = isEditing.value ? 'Updating missionary...' : 'Saving missionary...'

  try {
    const missionaryData = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      missionaryType: form.missionaryType,
      isCouple: form.missionaryType === 'senior' ? form.isCouple : false,
      spouseFirstName: form.isCouple ? form.spouseFirstName.trim() : '',
      gender: form.isCouple ? null : form.gender,
      mission: form.mission.trim(),
      startDate: form.startDate,
      endDate: form.endDate,

      ...selectedLocation.value,
    }

    if (isEditing.value) {
      await updateMissionary(
        props.missionary.id,
        missionaryData,
        imageFile.value,
        props.missionary.photoPath || '',
        removeExistingPhoto.value,
      )
    } else {
      await createMissionary(missionaryData, imageFile.value)
    }

    emit('saved')
  } catch (error) {
    console.error('Unable to save missionary:', error)

    message.value = error.message || 'Unable to save missionary.'
  } finally {
    saving.value = false
  }
}
</script>
