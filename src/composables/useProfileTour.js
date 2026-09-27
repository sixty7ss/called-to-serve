import { onBeforeUnmount, ref } from 'vue'

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

  function start() {
    if (!profiles.value.length) {
      return
    }

    stop()

    active.value = true
    paused.value = false
    currentIndex = 0

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

    showProfile(currentRunId)
  }

  onBeforeUnmount(() => {
    stop()
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
