<template>
  <section>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Called to Serve</h1>

        <p class="mt-1 text-slate-600">Missionaries from the Safford Arizona Stake</p>
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

    <MissionaryAdminFilters
      :search-query="searchQuery"
      :status-filter="statusFilter"
      :type-filter="typeFilter"
      :country-filter="countryFilter"
      :countries="countries"
      :shown-count="shownCount"
      :has-filters="hasFilters"
      :has-senior-missionaries="hasSeniorMissionaries"
      @update:search-query="emit('update:searchQuery', $event)"
      @update:status-filter="emit('update:statusFilter', $event)"
      @update:type-filter="emit('update:typeFilter', $event)"
      @update:country-filter="emit('update:countryFilter', $event)"
      @clear="emit('clearFilters')"
    />

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
import MissionaryAdminFilters from '@/components/admin/MissionaryAdminFilters.vue'

const props = defineProps({
  missionaries: {
    type: Array,
    default: () => [],
  },

  loading: {
    type: Boolean,
    default: false,
  },

  searchQuery: {
    type: String,
    default: '',
  },

  statusFilter: {
    type: String,
    default: '',
  },

  typeFilter: {
    type: String,
    default: '',
  },

  countryFilter: {
    type: String,
    default: '',
  },

  countries: {
    type: Array,
    default: () => [],
  },

  shownCount: {
    type: Number,
    default: 0,
  },

  hasFilters: {
    type: Boolean,
    default: false,
  },

  hasSeniorMissionaries: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'add',
  'edit',
  'delete',
  'logout',
  'home',

  'update:searchQuery',
  'update:statusFilter',
  'update:typeFilter',
  'update:countryFilter',

  'clearFilters',
])
</script>

<style scoped></style>
