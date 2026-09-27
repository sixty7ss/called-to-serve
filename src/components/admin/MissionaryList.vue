<template>
  <section>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Called to Serve</h1>

        <p class="mt-1 text-slate-600">Missionaries</p>
      </div>

      <div class="flex gap-2">
        <button
          type="button"
          class="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          @click="$emit('home')"
        >
          View Map
        </button>

        <button
          type="button"
          class="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          @click="$emit('logout')"
        >
          Log Out
        </button>

        <button
          type="button"
          class="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-700"
          @click="$emit('add')"
        >
          Add +
        </button>
      </div>
    </div>

    <div v-if="loading" class="rounded-2xl bg-white p-8 text-center text-slate-500">
      Loading missionaries...
    </div>

    <div v-else-if="!missionaries.length" class="rounded-2xl bg-white p-8 text-center">
      <p class="text-slate-500">No missionaries have been added yet.</p>

      <button type="button" class="mt-4 font-semibold text-slate-900" @click="$emit('add')">
        Add your first missionary
      </button>
    </div>

    <div v-else class="overflow-hidden rounded-2xl bg-white shadow-sm">
      <MissionaryListItem
        v-for="missionary in missionaries"
        :key="missionary.id"
        :missionary="missionary"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import MissionaryListItem from '@/components/admin/MissionaryListItem.vue'

defineProps({
  missionaries: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add', 'edit', 'delete', 'logout', 'home'])
</script>

<style scoped></style>
