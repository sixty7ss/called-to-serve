import couplePlaceholder from '@/assets/placeholders/couple-profile.png'
import femalePlaceholder from '@/assets/placeholders/female-profile.png'
import malePlaceholder from '@/assets/placeholders/male-profile.png'

export function getMissionaryTitle(profile) {
  if (profile?.gender === 'male') {
    return 'Elder'
  }

  if (profile?.gender === 'female') {
    return 'Sister'
  }

  return ''
}

export function getFullName(profile) {
  if (profile?.missionaryType === 'senior' && profile?.isCouple) {
    return profile?.lastName || ''
  }

  return [profile?.firstName, profile?.middleName, profile?.lastName].filter(Boolean).join(' ')
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

export function getAdminDisplayName(profile) {
  if (profile?.missionaryType === 'senior' && profile?.isCouple) {
    return `Elder & Sister ${profile.lastName || ''}`.trim()
  }

  return [getMissionaryTitle(profile), getFullName(profile)].filter(Boolean).join(' ')
}

export function getProfileDisplayName(profile) {
  if (profile?.missionaryType === 'senior' && profile?.isCouple) {
    return [
      `Elder ${profile.firstName || ''} ${profile.lastName || ''}`,
      `Sister ${profile.spouseFirstName || ''} ${profile.lastName || ''}`,
    ]
      .map((name) => name.replace(/\s+/g, ' ').trim())
      .join(' & ')
  }

  return [getMissionaryTitle(profile), getFullName(profile)].filter(Boolean).join(' ')
}
