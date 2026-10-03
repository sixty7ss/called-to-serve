import couplePlaceholder from '@/assets/placeholders/couple-profile.png'
import femalePlaceholder from '@/assets/placeholders/female-profile.png'
import malePlaceholder from '@/assets/placeholders/male-profile.png'

export function isMissionCompleted(profile) {
  if (!profile?.endDate) {
    return false
  }

  const endDate = new Date(`${profile.endDate}T23:59:59`)

  return new Date() > endDate
}

export function isMissionUpcoming(profile) {
  if (!profile?.startDate) {
    return false
  }

  const startDate = new Date(`${profile.startDate}T00:00:00`)

  return new Date() < startDate
}

export function getMissionaryTitle(profile) {
  if (isMissionCompleted(profile)) {
    return ''
  }

  if (profile?.missionaryType === 'senior' && profile?.isCouple) {
    return 'Brother & Sister'
  }

  if (profile?.gender === 'male') {
    return 'Elder'
  }

  if (profile?.gender === 'female') {
    return 'Sister'
  }

  return ''
}

export function getFullName(profile) {
  return [profile?.firstName, profile?.middleName, profile?.lastName].filter(Boolean).join(' ')
}

export function getAdminDisplayName(profile) {
  const completed = isMissionCompleted(profile)

  if (profile?.missionaryType === 'senior' && profile?.isCouple) {
    if (completed) {
      return [profile?.firstName, '&', profile?.spouseFirstName, profile?.lastName]
        .filter(Boolean)
        .join(' ')
    }

    return `Brother & Sister ${profile?.lastName || ''}`.trim()
  }

  if (completed) {
    return getFullName(profile)
  }

  return [getMissionaryTitle(profile), getFullName(profile)].filter(Boolean).join(' ')
}

export function getProfileDisplayName(profile) {
  const completed = isMissionCompleted(profile)

  if (profile?.missionaryType === 'senior' && profile?.isCouple) {
    const firstName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')

    const spouseName = [profile?.spouseFirstName, profile?.lastName].filter(Boolean).join(' ')

    if (completed) {
      return [firstName, spouseName].filter(Boolean).join(' & ')
    }

    return [`Brother ${firstName}`, `Sister ${spouseName}`]
      .map((name) => name.replace(/\s+/g, ' ').trim())
      .join(' & ')
  }

  if (completed) {
    return getFullName(profile)
  }

  return [getMissionaryTitle(profile), getFullName(profile)].filter(Boolean).join(' ')
}

export function getProfileImage(profile) {
  if (profile?.photoUrl) {
    return profile.photoUrl
  }

  if (profile?.missionaryType === 'senior' && profile?.isCouple) {
    return couplePlaceholder
  }

  if (profile?.gender === 'female') {
    return femalePlaceholder
  }

  return malePlaceholder
}
