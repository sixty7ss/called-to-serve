<template>
  <div>
    <label class="mb-2 block text-sm font-semibold text-slate-700"> Profile Photo </label>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900"
      @change="handlePhoto"
    />

    <div class="mt-4">
      <p class="mb-2 text-sm font-medium text-slate-600">Profile Preview</p>

      <img
        :src="displayPhoto"
        alt="Profile preview"
        class="h-32 w-32 rounded-full object-cover shadow"
      />

      <div v-if="hasPhoto" class="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          @click="removePhoto"
        >
          Remove Photo
        </button>
      </div>

      <p v-if="existingPhotoUrl && !previewUrl" class="mt-2 text-xs text-slate-500">
        Choose a new photo only if you want to replace this one.
      </p>

      <p v-else-if="!hasPhoto" class="mt-2 text-xs text-slate-500">
        A default profile image will be used until a photo is uploaded.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

import { getProfileImage } from '@/utils/profile'

const props = defineProps({
  existingPhotoUrl: {
    type: String,
    default: '',
  },

  gender: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['selected', 'remove'])

const previewUrl = ref('')
const fileInput = ref(null)

const hasPhoto = computed(() => {
  return Boolean(previewUrl.value || props.existingPhotoUrl)
})

const displayPhoto = computed(() => {
  if (previewUrl.value) {
    return previewUrl.value
  }

  return getProfileImage({
    photoUrl: props.existingPhotoUrl,
    gender: props.gender,
  })
})

function handlePhoto(event) {
  const file = event.target.files?.[0]

  if (!file) return

  clearPreview()

  previewUrl.value = URL.createObjectURL(file)

  emit('selected', file)
}

function removePhoto() {
  clearPreview()

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  emit('selected', null)
  emit('remove')
}

function clearPreview() {
  if (!previewUrl.value) {
    return
  }

  URL.revokeObjectURL(previewUrl.value)

  previewUrl.value = ''
}

onBeforeUnmount(() => {
  clearPreview()
})
</script>
