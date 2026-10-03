<template>
  <div class="absolute left-4 top-4 z-10 max-w-[calc(100vw-2rem)] sm:left-6 sm:top-6">
    <div
      class="w-[22rem] max-w-full rounded-2xl bg-slate-950/60 px-4 py-4 text-white shadow-xl backdrop-blur-md sm:px-6"
    >
      <h1 class="text-2xl font-semibold tracking-tight">Called to Serve</h1>

      <p class="mt-1 text-sm text-white/70">Missionaries Around the World</p>

      <!-- STATUS -->
      <div class="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-white/10 p-1">
        <button
          type="button"
          :class="[
            'rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm',
            missionaryStatus === 'current'
              ? 'bg-white text-slate-900 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          ]"
          @click="$emit('update:missionaryStatus', 'current')"
        >
          Current
        </button>

        <button
          type="button"
          :class="[
            'rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm',
            missionaryStatus === 'returned'
              ? 'bg-white text-slate-900 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          ]"
          @click="$emit('update:missionaryStatus', 'returned')"
        >
          Returned
        </button>

        <button
          type="button"
          :class="[
            'rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm',
            missionaryStatus === 'all'
              ? 'bg-white text-slate-900 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          ]"
          @click="$emit('update:missionaryStatus', 'all')"
        >
          All
        </button>
      </div>

      <!-- MISSIONARY TYPE -->
      <div class="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-white/10 p-1">
        <button
          type="button"
          :class="[
            'rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm',
            missionaryType === 'fullTime'
              ? 'bg-white text-slate-900 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          ]"
          @click="$emit('update:missionaryType', 'fullTime')"
        >
          Full Time
        </button>

        <button
          type="button"
          :class="[
            'rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm',
            missionaryType === 'senior'
              ? 'bg-white text-slate-900 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          ]"
          @click="$emit('update:missionaryType', 'senior')"
        >
          Senior
        </button>

        <button
          type="button"
          :class="[
            'rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm',
            missionaryType === 'all'
              ? 'bg-white text-slate-900 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          ]"
          @click="$emit('update:missionaryType', 'all')"
        >
          All
        </button>
      </div>

      <!-- REFINEMENT FILTERS -->
      <div class="mt-3 grid grid-cols-2 gap-2">
        <label class="flex flex-col gap-1 text-xs text-white/60">
          Last Name

          <select
            :value="selectedLetter"
            class="min-w-0 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
            @change="$emit('update:selectedLetter', $event.target.value)"
          >
            <option value="">All</option>

            <option v-for="letter in lastNameLetters" :key="letter" :value="letter">
              {{ letter }}
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-1 text-xs text-white/60">
          Country

          <select
            :value="selectedCountry"
            class="min-w-0 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
            @change="$emit('update:selectedCountry', $event.target.value)"
          >
            <option value="">All</option>

            <option v-for="country in countries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </label>

        <label class="col-span-2 flex flex-col gap-1 text-xs text-white/60">
          State (U.S.)

          <select
            :value="selectedState"
            :disabled="stateFilterDisabled"
            :class="[
              'rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30',
              stateFilterDisabled ? 'cursor-not-allowed opacity-40' : '',
            ]"
            @change="$emit('update:selectedState', $event.target.value)"
          >
            <option value="">All</option>

            <option v-for="state in states" :key="state" :value="state">
              {{ state }}
            </option>
          </select>
        </label>

        <label
          v-if="missionaryStatus === 'returned'"
          class="col-span-2 flex flex-col gap-1 text-xs text-white/60"
        >
          Decade returned

          <select
            :value="selectedDecade"
            class="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
            @change="$emit('update:selectedDecade', $event.target.value)"
          >
            <option value="">All decades</option>

            <option v-for="decade in decades" :key="decade" :value="String(decade)">
              {{ decade }}s
            </option>
          </select>
        </label>
      </div>

      <div class="mt-3 flex items-center justify-between text-xs text-white/50">
        <span> {{ shownCount }} shown </span>

        <button
          v-if="hasRefinementFilters"
          type="button"
          class="text-white/70 transition hover:text-white"
          @click="$emit('clear')"
        >
          Clear filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  missionaryStatus: {
    type: String,
    default: 'current',
  },

  missionaryType: {
    type: String,
    default: 'fullTime',
  },

  selectedLetter: {
    type: String,
    default: '',
  },

  selectedCountry: {
    type: String,
    default: '',
  },

  selectedState: {
    type: String,
    default: '',
  },

  selectedDecade: {
    type: String,
    default: '',
  },

  lastNameLetters: {
    type: Array,
    default: () => [],
  },

  countries: {
    type: Array,
    default: () => [],
  },

  states: {
    type: Array,
    default: () => [],
  },

  decades: {
    type: Array,
    default: () => [],
  },

  stateFilterDisabled: {
    type: Boolean,
    default: false,
  },

  hasRefinementFilters: {
    type: Boolean,
    default: false,
  },

  shownCount: {
    type: Number,
    default: 0,
  },
})

defineEmits([
  'update:missionaryStatus',
  'update:missionaryType',
  'update:selectedLetter',
  'update:selectedCountry',
  'update:selectedState',
  'update:selectedDecade',
  'clear',
])
</script>
