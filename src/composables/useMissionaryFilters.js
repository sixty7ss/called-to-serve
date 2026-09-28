import { computed, ref, watch } from 'vue'

import { isMissionCompleted } from '@/utils/profile'

export function useMissionaryFilters(profiles) {
  const missionaryStatus = ref('current')
  const missionaryType = ref('fullTime')

  const selectedLetter = ref('')
  const selectedCountry = ref('')
  const selectedState = ref('')
  const selectedDecade = ref('')

  function isUnitedStatesCountry(country) {
    const normalized = (country || '').trim().toLowerCase()

    return ['united states', 'united states of america', 'usa', 'u.s.a.', 'us', 'u.s.'].includes(
      normalized,
    )
  }

  const typeProfiles = computed(() => {
    return profiles.value.filter((profile) => {
      const profileType = profile.missionaryType || 'fullTime'

      return profileType === missionaryType.value
    })
  })

  const statusProfiles = computed(() => {
    return typeProfiles.value.filter((profile) => {
      const completed = isMissionCompleted(profile)

      if (missionaryStatus.value === 'returned') {
        return completed
      }

      return !completed
    })
  })

  const lastNameLetters = computed(() => {
    return [
      ...new Set(
        statusProfiles.value
          .map((profile) => profile.lastName?.charAt(0).toUpperCase())
          .filter(Boolean),
      ),
    ].sort()
  })

  const countries = computed(() => {
    return [
      ...new Set(statusProfiles.value.map((profile) => profile.country).filter(Boolean)),
    ].sort((a, b) =>
      a.localeCompare(b, undefined, {
        sensitivity: 'base',
      }),
    )
  })

  const states = computed(() => {
    return [
      ...new Set(
        statusProfiles.value
          .filter((profile) => isUnitedStatesCountry(profile.country))
          .map((profile) => profile.state)
          .filter(Boolean),
      ),
    ].sort((a, b) =>
      a.localeCompare(b, undefined, {
        sensitivity: 'base',
      }),
    )
  })

  const stateFilterDisabled = computed(() => {
    return Boolean(selectedCountry.value && !isUnitedStatesCountry(selectedCountry.value))
  })

  const decades = computed(() => {
    const values = statusProfiles.value
      .map((profile) => {
        if (!profile.endDate) {
          return null
        }

        const year = Number(profile.endDate.slice(0, 4))

        if (!Number.isFinite(year)) {
          return null
        }

        return Math.floor(year / 10) * 10
      })
      .filter((decade) => decade !== null)

    return [...new Set(values)].sort((a, b) => b - a)
  })

  function isProfileVisible(profile) {
    const completed = isMissionCompleted(profile)

    const profileType = profile.missionaryType || 'fullTime'

    if (profileType !== missionaryType.value) {
      return false
    }

    if (missionaryStatus.value === 'current' && completed) {
      return false
    }

    if (missionaryStatus.value === 'returned' && !completed) {
      return false
    }

    if (selectedLetter.value && !profile.lastName?.toUpperCase().startsWith(selectedLetter.value)) {
      return false
    }

    if (selectedCountry.value && profile.country !== selectedCountry.value) {
      return false
    }

    if (selectedState.value) {
      if (!isUnitedStatesCountry(profile.country) || profile.state !== selectedState.value) {
        return false
      }
    }

    if (missionaryStatus.value === 'returned' && selectedDecade.value) {
      if (!profile.endDate) {
        return false
      }

      const year = Number(profile.endDate.slice(0, 4))

      const decade = Math.floor(year / 10) * 10

      if (decade !== Number(selectedDecade.value)) {
        return false
      }
    }

    return true
  }

  const visibleProfiles = computed(() => {
    return profiles.value.filter(isProfileVisible)
  })

  const sortedProfiles = computed(() => {
    return [...visibleProfiles.value].sort((a, b) => {
      const lastNameCompare = (a.lastName || '').localeCompare(b.lastName || '', undefined, {
        sensitivity: 'base',
      })

      if (lastNameCompare !== 0) {
        return lastNameCompare
      }

      return (a.firstName || '').localeCompare(b.firstName || '', undefined, {
        sensitivity: 'base',
      })
    })
  })

  const hasRefinementFilters = computed(() => {
    return Boolean(
      selectedLetter.value || selectedCountry.value || selectedState.value || selectedDecade.value,
    )
  })

  function clearRefinementFilters() {
    selectedLetter.value = ''
    selectedCountry.value = ''
    selectedState.value = ''
    selectedDecade.value = ''
  }

  watch(missionaryStatus, () => {
    clearRefinementFilters()
  })

  watch(missionaryType, () => {
    clearRefinementFilters()
  })

  watch(selectedCountry, (country) => {
    if (country && !isUnitedStatesCountry(country)) {
      selectedState.value = ''
    }
  })

  return {
    missionaryStatus,
    missionaryType,

    selectedLetter,
    selectedCountry,
    selectedState,
    selectedDecade,

    lastNameLetters,
    countries,
    states,
    decades,

    stateFilterDisabled,
    hasRefinementFilters,

    visibleProfiles,
    sortedProfiles,

    isProfileVisible,
    clearRefinementFilters,
  }
}
