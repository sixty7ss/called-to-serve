import { onBeforeUnmount, ref } from 'vue'

const TOUR_PROFILE_KEY = 'called-to-serve-tour-profile'

export function useProfileTour({
  profiles,
  moveToProfile,
  openProfile,
  closeProfile,
  displayDuration = 10000,
  closeDelay = 1000,
}) {
  const active = ref(false)
  const paused = ref(false)

  let currentIndex = 0
  let tourTimer = null
  let runId = 0

  function getSavedProfileId() {
    return sessionStorage.getItem(TOUR_PROFILE_KEY)
  }

  function saveCurrentProfile() {
    const profile = profiles.value[currentIndex]

    if (!profile?.id) {
      return
    }

    sessionStorage.setItem(TOUR_PROFILE_KEY, profile.id)
  }

  function restoreCurrentIndex() {
    const savedProfileId = getSavedProfileId()

    if (!savedProfileId) {
      currentIndex = 0
      return
    }

    const savedIndex = profiles.value.findIndex((profile) => profile.id === savedProfileId)

    currentIndex = savedIndex >= 0 ? savedIndex : 0
  }

  function wait(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds)
    })
  }

  function clearTourTimer() {
    if (!tourTimer) {
      return
    }

    clearTimeout(tourTimer)

    tourTimer = null
  }

  function isCurrentRun(currentRunId) {
    return active.value && !paused.value && currentRunId === runId && profiles.value.length > 0
  }

  function start({ reset = false } = {}) {
    if (!profiles.value.length) {
      return
    }

    stop()

    if (reset) {
      currentIndex = 0

      saveCurrentProfile()
    } else {
      restoreCurrentIndex()
    }

    active.value = true
    paused.value = false

    showProfile(runId)
  }

  function stop() {
    active.value = false
    paused.value = false

    runId += 1

    clearTourTimer()
  }

  function pause() {
    if (!active.value) {
      return
    }

    paused.value = true

    runId += 1

    clearTourTimer()

    closeProfile()
  }

  function resume() {
    if (!active.value || !profiles.value.length) {
      return
    }

    paused.value = false

    restoreCurrentIndex()

    showProfile(runId)
  }

  async function showProfile(currentRunId) {
    if (!isCurrentRun(currentRunId)) {
      return
    }

    closeProfile()

    await wait(closeDelay)

    if (!isCurrentRun(currentRunId)) {
      return
    }

    const profile = profiles.value[currentIndex]

    if (!profile) {
      return
    }

    saveCurrentProfile()

    await moveToProfile(profile)

    if (!isCurrentRun(currentRunId)) {
      return
    }

    openProfile(profile)

    tourTimer = setTimeout(() => {
      advance(currentRunId)
    }, displayDuration)
  }

  function advance(currentRunId) {
    if (!isCurrentRun(currentRunId)) {
      return
    }

    currentIndex = (currentIndex + 1) % profiles.value.length

    saveCurrentProfile()

    showProfile(currentRunId)
  }

  onBeforeUnmount(() => {
    clearTourTimer()
  })

  return {
    active,
    paused,
    start,
    stop,
    pause,
    resume,
  }
}
