<template>
  <main class="min-h-screen bg-slate-100 p-6">
    <div class="mx-auto max-w-5xl">
      <MissionaryList
        v-if="viewMode === 'list'"
        v-model:search-query="searchQuery"
        v-model:status-filter="statusFilter"
        v-model:type-filter="typeFilter"
        v-model:country-filter="countryFilter"
        :missionaries="filteredMissionaries"
        :loading="loading"
        :countries="adminCountries"
        :shown-count="filteredMissionaries.length"
        :has-filters="hasAdminFilters"
        :has-senior-missionaries="hasSeniorMissionaries"
        @clear-filters="clearAdminFilters"
        @add="openAddForm"
        @edit="openEditForm"
        @delete="removeMissionary"
        @logout="handleLogout"
        @home="goToGlobe"
      />

      <MissionaryForm
        v-else
        :missionary="selectedMissionary"
        @saved="handleSaved"
        @cancel="closeForm"
      />
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import { useRouter } from 'vue-router'

import MissionaryForm from '@/components/admin/MissionaryForm.vue'
import MissionaryList from '@/components/admin/MissionaryList.vue'

import { logout } from '@/services/auth'

import { deleteMissionary, getMissionaries } from '@/services/missionaryAdmin'

import { getFullName, isMissionCompleted, isMissionUpcoming } from '@/utils/profile'

const router = useRouter()

const missionaries = ref([])
const loading = ref(true)

const viewMode = ref('list')
const selectedMissionary = ref(null)

const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const countryFilter = ref('')

const adminCountries = computed(() => {
  return [
    ...new Set(missionaries.value.map((missionary) => missionary.country).filter(Boolean)),
  ].sort((a, b) =>
    a.localeCompare(b, undefined, {
      sensitivity: 'base',
    }),
  )
})

const hasAdminFilters = computed(() => {
  return Boolean(searchQuery.value || statusFilter.value || typeFilter.value || countryFilter.value)
})

const filteredMissionaries = computed(() => {
  const search = searchQuery.value.trim().toLowerCase()

  return [...missionaries.value]
    .filter((missionary) => {
      if (search) {
        const searchableText = [
          missionary.firstName,
          missionary.middleName,
          missionary.lastName,
          missionary.mission,
          missionary.city,
          missionary.state,
          missionary.country,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!searchableText.includes(search)) {
          return false
        }
      }

      if (typeFilter.value && (missionary.missionaryType || 'fullTime') !== typeFilter.value) {
        return false
      }

      if (countryFilter.value && missionary.country !== countryFilter.value) {
        return false
      }

      if (statusFilter.value) {
        const upcoming = isMissionUpcoming(missionary)

        const completed = isMissionCompleted(missionary)

        if (statusFilter.value === 'upcoming' && !upcoming) {
          return false
        }

        if (statusFilter.value === 'current' && (upcoming || completed)) {
          return false
        }

        if (statusFilter.value === 'completed' && !completed) {
          return false
        }
      }

      return true
    })
    .sort((a, b) => {
      if (!a.startDate && !b.startDate) {
        return 0
      }

      if (!a.startDate) {
        return 1
      }

      if (!b.startDate) {
        return -1
      }

      return a.startDate.localeCompare(b.startDate)
    })
})

async function loadMissionaries() {
  loading.value = true

  try {
    missionaries.value = await getMissionaries()
  } catch (error) {
    console.error('Unable to load missionaries:', error)
  } finally {
    loading.value = false
  }
}

function openAddForm() {
  selectedMissionary.value = null
  viewMode.value = 'form'
}

function openEditForm(missionary) {
  selectedMissionary.value = missionary

  viewMode.value = 'form'
}

function closeForm() {
  selectedMissionary.value = null
  viewMode.value = 'list'
}

async function handleSaved() {
  await loadMissionaries()
  closeForm()
}

async function removeMissionary(missionary) {
  const fullName = getFullName(missionary)

  const confirmed = window.confirm(`Delete ${fullName}? This cannot be undone.`)

  if (!confirmed) {
    return
  }

  try {
    await deleteMissionary(missionary)

    await loadMissionaries()
  } catch (error) {
    console.error('Unable to delete missionary:', error)
  }
}

const hasSeniorMissionaries = computed(() => {
  return missionaries.value.some((missionary) => missionary.missionaryType === 'senior')
})

function clearAdminFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
  countryFilter.value = ''
}

async function handleLogout() {
  await logout()
  await router.push('/login')
}

function goToGlobe() {
  router.push('/')
}

watch(hasSeniorMissionaries, (hasSeniors) => {
  if (!hasSeniors && typeFilter.value === 'senior') {
    typeFilter.value = ''
  }
})

onMounted(loadMissionaries)
</script>
