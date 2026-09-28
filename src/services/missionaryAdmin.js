import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore'

import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'

import { db, storage } from '@/services/firebase'

function cleanFileName(value) {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, '_')
}

function getPhotoFileName(firstName, lastName, imageFile) {
  const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'

  const first = cleanFileName(firstName)

  const last = cleanFileName(lastName)

  return `${first}_${last}_profile.${extension}`
}

async function uploadProfilePhoto(documentId, missionary, imageFile) {
  const fileName = getPhotoFileName(missionary.firstName, missionary.lastName, imageFile)

  const photoPath = `missionaries/${documentId}/${fileName}`

  const imageRef = ref(storage, photoPath)

  await uploadBytes(imageRef, imageFile, {
    contentType: imageFile.type,
  })

  const photoUrl = await getDownloadURL(imageRef)

  return {
    photoUrl,
    photoPath,
  }
}

export async function getMissionaries() {
  const snapshot = await getDocs(collection(db, 'missionaries'))

  return snapshot.docs.map((document) => ({
    ...document.data(),
    id: document.id,
  }))
}

export async function createMissionary(missionary, imageFile) {
  const docRef = await addDoc(collection(db, 'missionaries'), {
    ...missionary,
    photoUrl: '',
    photoPath: '',
  })

  if (imageFile) {
    const photo = await uploadProfilePhoto(docRef.id, missionary, imageFile)

    await updateDoc(docRef, photo)
  }

  return docRef.id
}

export async function updateMissionary(
  id,
  missionary,
  imageFile,
  existingPhotoPath = '',
  removePhoto = false,
) {
  const docRef = doc(db, 'missionaries', id)

  const updates = {
    ...missionary,
  }

  if (removePhoto) {
    if (existingPhotoPath) {
      try {
        await deleteObject(ref(storage, existingPhotoPath))
      } catch (error) {
        console.warn('Profile photo could not be deleted:', error)
      }
    }

    updates.photoUrl = ''
    updates.photoPath = ''
  }

  if (imageFile) {
    const photo = await uploadProfilePhoto(id, missionary, imageFile)

    updates.photoUrl = photo.photoUrl

    updates.photoPath = photo.photoPath

    if (existingPhotoPath && existingPhotoPath !== photo.photoPath) {
      try {
        await deleteObject(ref(storage, existingPhotoPath))
      } catch (error) {
        console.warn('Old photo could not be removed:', error)
      }
    }
  }

  await updateDoc(docRef, updates)
}

export async function deleteMissionary(missionary) {
  if (missionary.photoPath) {
    try {
      await deleteObject(ref(storage, missionary.photoPath))
    } catch (error) {
      console.warn('Profile photo could not be deleted:', error)
    }
  }

  await deleteDoc(doc(db, 'missionaries', missionary.id))
}
