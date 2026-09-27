import { collection, getDocs } from 'firebase/firestore'

import { db } from '@/services/firebase'

export async function getProfiles() {
  const snapshot = await getDocs(collection(db, 'missionaries'))

  return snapshot.docs.map((document) => {
    const data = document.data()

    return {
      id: document.id,

      ...data,

      name: `${data.firstName} ${data.lastName}`,

      bounds: [
        [data.west, data.south],
        [data.east, data.north],
      ],
    }
  })
}
