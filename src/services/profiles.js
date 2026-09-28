import { collection, getDocs } from 'firebase/firestore'

import { db } from '@/services/firebase'

export async function getProfiles() {
  const snapshot = await getDocs(collection(db, 'missionaries'))

  return snapshot.docs.map((document) => {
    const data = document.data()

    return {
      ...data,

      id: document.id,

      name: [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' '),

      bounds: [
        [data.west, data.south],
        [data.east, data.north],
      ],
    }
  })
}
