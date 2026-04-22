// src/services/authService.js
// ==========================================
// Authentication Service
// Email, Google, Apple Sign-in
// ==========================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, COLLECTIONS } from './firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';

// ==========================================
// REGISTER
// ==========================================

export const registerWithEmail = async (email, password, displayName, username) => {
  try {
    // Check username uniqueness
    const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
    if (usernameDoc.exists()) throw new Error('اسم المستخدم مأخوذ بالفعل');

    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(user, { displayName });
    await sendEmailVerification(user);

    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email,
      displayName,
      username: username.toLowerCase(),
      photoURL: null,
      bio: '',
      website: '',
      location: '',
      socialLinks: {
        twitter: '',
        instagram: '',
        linkedin: '',
        github: '',
      },
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
      bookmarkedPosts: [],
      role: 'user', // user | author | admin
      isVerified: false,
      isEmailVerified: false,
      isPremium: false,
      badges: [],
      preferredLanguage: 'ar',
      notifications: {
        likes: true,
        comments: true,
        follows: true,
        newsletter: true,
        push: true,
      },
      privacy: {
        showEmail: false,
        showLocation: true,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfile);
    await setDoc(doc(db, 'usernames', username.toLowerCase()), { uid: user.uid });

    return { user, profile: userProfile };
  } catch (error) {
    throw translateAuthError(error);
  }
};

// ==========================================
// LOGIN
// ==========================================

export const loginWithEmail = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await updateLastActive(user.uid);
    const profile = await getUserProfile(user.uid);
    return { user, profile };
  } catch (error) {
    throw translateAuthError(error);
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    // Implementation depends on platform - using expo-auth-session
    // See Google Sign-In setup in the README
    throw new Error('Google Sign-in requires additional setup. See README.');
  } catch (error) {
    throw translateAuthError(error);
  }
};

export const loginWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const provider = new OAuthProvider('apple.com');
    const authCredential = provider.credential({
      idToken: credential.identityToken,
      rawNonce: credential.authorizationCode,
    });

    const { user } = await signInWithCredential(auth, authCredential);

    // Create profile if new user
    const profileExists = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    if (!profileExists.exists()) {
      await createInitialProfile(user);
    }

    return { user, profile: await getUserProfile(user.uid) };
  } catch (error) {
    throw translateAuthError(error);
  }
};

// ==========================================
// LOGOUT
// ==========================================

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Failed to logout');
  }
};

// ==========================================
// PASSWORD RESET
// ==========================================

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: 'https://blogverse.app/reset-success',
    });
  } catch (error) {
    throw translateAuthError(error);
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    throw translateAuthError(error);
  }
};

// ==========================================
// PROFILE
// ==========================================

export const getUserProfile = async (userId) => {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (!snap.exists()) throw new Error('User not found');
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    throw new Error(`Failed to get profile: ${error.message}`);
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);

    if (updates.photoURL && updates.photoURL.startsWith('file://')) {
      updates.photoURL = await uploadProfilePhoto(updates.photoURL, userId);
    }

    await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() });

    if (updates.displayName) {
      await updateProfile(auth.currentUser, { displayName: updates.displayName });
    }

    return await getUserProfile(userId);
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

const uploadProfilePhoto = async (localUri, userId) => {
  const filename = `profiles/${userId}/avatar_${Date.now()}.jpg`;
  const photoRef = ref(storage, filename);
  const response = await fetch(localUri);
  const blob = await response.blob();
  await uploadBytes(photoRef, blob);
  return await getDownloadURL(photoRef);
};

// ==========================================
// FOLLOW SYSTEM
// ==========================================

export const followUser = async (followerId, followingId) => {
  if (followerId === followingId) throw new Error('Cannot follow yourself');

  try {
    const followId = `${followerId}_${followingId}`;
    const followRef = doc(db, COLLECTIONS.FOLLOWS, followId);
    const followSnap = await getDoc(followRef);

    if (followSnap.exists()) {
      // Unfollow
      await Promise.all([
        deleteDoc(followRef),
        updateDoc(doc(db, COLLECTIONS.USERS, followerId), {
          followingCount: increment(-1),
        }),
        updateDoc(doc(db, COLLECTIONS.USERS, followingId), {
          followersCount: increment(-1),
        }),
      ]);
      return false;
    } else {
      // Follow
      await Promise.all([
        setDoc(followRef, {
          followerId,
          followingId,
          createdAt: serverTimestamp(),
        }),
        updateDoc(doc(db, COLLECTIONS.USERS, followerId), {
          followingCount: increment(1),
        }),
        updateDoc(doc(db, COLLECTIONS.USERS, followingId), {
          followersCount: increment(1),
        }),
      ]);
      return true;
    }
  } catch (error) {
    throw new Error(`Follow failed: ${error.message}`);
  }
};

export const isFollowing = async (followerId, followingId) => {
  const snap = await getDoc(
    doc(db, COLLECTIONS.FOLLOWS, `${followerId}_${followingId}`)
  );
  return snap.exists();
};

// ==========================================
// ACCOUNT DELETION
// ==========================================

export const deleteAccount = async (password) => {
  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Delete Firestore data
    await deleteDoc(doc(db, COLLECTIONS.USERS, user.uid));

    // Delete Auth account
    await deleteUser(user);
  } catch (error) {
    throw translateAuthError(error);
  }
};

// ==========================================
// AUTH STATE LISTENER
// ==========================================

export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ==========================================
// HELPERS
// ==========================================

const updateLastActive = async (userId) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    lastActiveAt: serverTimestamp(),
  }).catch(() => {});
};

const createInitialProfile = async (user) => {
  const username = `user_${Math.random().toString(36).substr(2, 8)}`;
  const profile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'مستخدم جديد',
    username,
    photoURL: user.photoURL || null,
    bio: '',
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    bookmarkedPosts: [],
    role: 'user',
    isVerified: false,
    isPremium: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  };
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), profile);
};

const translateAuthError = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
    'auth/operation-not-allowed': 'العملية غير مسموح بها',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل)',
    'auth/user-disabled': 'تم تعليق هذا الحساب',
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/too-many-requests': 'محاولات كثيرة. يرجى الانتظار قليلاً',
    'auth/network-request-failed': 'فشل الاتصال بالإنترنت',
    'auth/invalid-credential': 'بيانات الاعتماد غير صحيحة',
    'auth/requires-recent-login': 'يرجى تسجيل الدخول مرة أخرى',
  };
  return new Error(errorMessages[error.code] || error.message);
};
