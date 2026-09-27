<template>
  <div class="absolute bottom-5 left-5 z-30">
    <button
      type="button"
      class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition hover:bg-white"
      aria-label="Open menu"
      @click="menuOpen = !menuOpen"
    >
      <CTSIcon name="menu" size="md" />
    </button>

    <div
      v-if="menuOpen"
      class="absolute bottom-14 left-0 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
    >
      <div class="border-b border-slate-100">
        <button
          type="button"
          :class="[
            'flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition',
            displayMode === 'globe'
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-600 hover:bg-slate-50',
          ]"
          @click="changeDisplayMode('globe')"
        >
          <CTSIcon name="globe" size="sm" />

          Rotating Globe
        </button>

        <button
          type="button"
          :class="[
            'flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition',
            displayMode === 'tour'
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-600 hover:bg-slate-50',
          ]"
          @click="changeDisplayMode('tour')"
        >
          <CTSIcon name="play" size="sm" />

          Profile Tour
        </button>
      </div>

      <button
        v-if="adminUser"
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        @click="goToAdmin"
      >
        <CTSIcon name="user" size="sm" />

        Admin
      </button>

      <button
        v-if="adminUser"
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        @click="handleLogout"
      >
        <CTSIcon name="logout" size="sm" />

        Log Out
      </button>

      <button
        v-else
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        @click="goToLogin"
      >
        <CTSIcon name="login" size="sm" />

        Admin Login
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

import { onAuthStateChanged } from 'firebase/auth'

import { useRouter } from 'vue-router'

import CTSIcon from '@/components/ui/CTSIcon.vue'

import { auth, isAdmin, logout } from '@/services/auth'

const props = defineProps({
  displayMode: {
    type: String,
    default: 'globe',
  },

  showUpcoming: {
    type: Boolean,
    default: true,
  },

  showCompleted: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['display-mode', 'update:show-upcoming', 'update:show-completed'])

const router = useRouter()

const menuOpen = ref(false)
const adminUser = ref(null)

const unsubscribe = onAuthStateChanged(auth, (user) => {
  adminUser.value = user && isAdmin(user) ? user : null
})

function changeDisplayMode(mode) {
  emit('display-mode', mode)

  menuOpen.value = false
}

function goToAdmin() {
  menuOpen.value = false

  router.push('/admin')
}

function goToLogin() {
  menuOpen.value = false

  router.push('/login')
}

async function handleLogout() {
  await logout()

  menuOpen.value = false
}

onBeforeUnmount(() => {
  unsubscribe()
})
</script>
