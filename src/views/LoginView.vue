<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-100 p-6">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <div class="mb-6 text-center">
        <h1 class="text-3xl font-bold text-slate-900">Called to Serve</h1>

        <p class="mt-2 text-slate-500">Administrator Login</p>
      </div>

      <form @submit.prevent="handleEmailLogin">
        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-700"> Email </label>

          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </div>

        <div class="mt-5">
          <label class="mb-2 block text-sm font-semibold text-slate-700"> Password </label>

          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="my-6 flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-200"></div>

        <span class="text-sm text-slate-400"> or </span>

        <div class="h-px flex-1 bg-slate-200"></div>
      </div>

      <button
        type="button"
        :disabled="loading"
        class="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleGoogleLogin"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.38Z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.96-.89 6.61-2.39l-3.22-2.51c-.89.6-2.03.95-3.39.95-2.61 0-4.82-1.76-5.61-4.13H3.06v2.59A9.99 9.99 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.92V7.49H3.06A9.98 9.98 0 0 0 2 12c0 1.61.39 3.13 1.06 4.51l3.33-2.59Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.95c1.47 0 2.79.51 3.83 1.49l2.87-2.87C16.95 2.94 14.7 2 12 2a9.99 9.99 0 0 0-8.94 5.49l3.33 2.59C7.18 7.71 9.39 5.95 12 5.95Z"
          />
        </svg>

        Continue with Google
      </button>

      <div v-if="message" class="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
        {{ message }}
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { loginWithEmail, loginWithGoogle } from '@/services/auth'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')

async function finishLogin() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'

  await router.push(redirect)
}

async function handleEmailLogin() {
  loading.value = true
  message.value = ''

  try {
    await loginWithEmail(email.value, password.value)

    await finishLogin()
  } catch (error) {
    console.error('Email login failed:', error)

    message.value = 'Unable to sign in. Check your email and password.'
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  loading.value = true
  message.value = ''

  try {
    await loginWithGoogle()

    await finishLogin()
  } catch (error) {
    console.error('Google login failed:', error)

    message.value =
      error.code === 'auth/popup-closed-by-user'
        ? 'Google sign-in was canceled.'
        : 'Unable to sign in with Google.'
  } finally {
    loading.value = false
  }
}
</script>
