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
  return [profile?.firstName, profile?.middleName, profile?.lastName].filter(Boolean).join(' ')
}

export function getProfileImage(profile) {
  if (profile?.photoUrl) {
    return profile.photoUrl
  }

  return profile?.gender === 'female' ? femalePlaceholder : malePlaceholder
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
