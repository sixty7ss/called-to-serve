<template>
  <div class="mb-4 rounded-2xl bg-white p-4 shadow-sm">
    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <input
        :value="searchQuery"
        type="search"
        placeholder="Search missionaries..."
        class="rounded-xl border border-slate-300 px-4 py-2 text-slate-900 outline-none transition focus:border-slate-500"
        @input="$emit('update:searchQuery', $event.target.value)"
      />

      <select
        :value="statusFilter"
        class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-slate-500"
        @change="$emit('update:statusFilter', $event.target.value)"
      >
        <option value="">All statuses</option>
        <option value="upcoming">Called</option>
        <option value="current">Currently Serving</option>
        <option value="completed">Returned</option>
      </select>

      <select
        v-if="hasSeniorMissionaries"
        :value="typeFilter"
        class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-slate-500"
        @change="$emit('update:typeFilter', $event.target.value)"
      >
        <option value="">All missionary types</option>
        <option value="fullTime">Full Time</option>
        <option value="senior">Senior</option>
      </select>

      <select
        :value="countryFilter"
        class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-slate-500"
        @change="$emit('update:countryFilter', $event.target.value)"
      >
        <option value="">All countries</option>

        <option v-for="country in countries" :key="country" :value="country">
          {{ country }}
        </option>
      </select>
    </div>

    <div class="mt-3 flex items-center justify-between text-sm text-slate-500">
      <span> {{ shownCount }} shown </span>

      <button
        v-if="hasFilters"
        type="button"
        class="font-medium text-slate-700 hover:text-slate-950"
        @click="$emit('clear')"
      >
        Clear filters
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
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

defineEmits([
  'update:searchQuery',
  'update:statusFilter',
  'update:typeFilter',
  'update:countryFilter',
  'clear',
])
</script>
