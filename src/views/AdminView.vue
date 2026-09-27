<template>
  <main class="min-h-screen bg-slate-100 p-6">
    <div class="mx-auto max-w-5xl">
      <MissionaryList
        v-if="viewMode === 'list'"
        :missionaries="missionaries"
        :loading="loading"
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
import { onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'

import MissionaryForm from '@/components/admin/MissionaryForm.vue'
import MissionaryList from '@/components/admin/MissionaryList.vue'

import { logout } from '@/services/auth'

import { deleteMissionary, getMissionaries } from '@/services/missionaryAdmin'

import { getFullName } from '@/utils/profile'

const router = useRouter()

const missionaries = ref([])
const loading = ref(true)
const viewMode = ref('list')
const selectedMissionary = ref(null)

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

async function handleLogout() {
  await logout()

  await router.push('/login')
}

function goToGlobe() {
  router.push('/')
}

onMounted(() => {
  loadMissionaries()
})
</script>
