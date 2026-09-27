import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'

import { auth } from '@/services/firebase'

const googleProvider = new GoogleAuthProvider()

const ADMIN_UIDS = ['DC97PfHEQnVvfnISsY174iXEPPq1']

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function logout() {
  return signOut(auth)
}

export function isAdmin(user) {
  return Boolean(user && ADMIN_UIDS.includes(user.uid))
}

export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

export { auth }
