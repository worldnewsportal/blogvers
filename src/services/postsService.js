// src/services/postsService.js
// ==========================================
// Posts Service - Complete CRUD + Advanced Features
// Built to handle thousands of concurrent users
// ==========================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  startAt,
  endBefore,
  limitToLast,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  runTransaction,
  writeBatch,
  onSnapshot,
  getCountFromServer,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, COLLECTIONS } from './firebase';
import { compressImage } from '../utils/imageUtils';

const PAGE_SIZE = 10;

// ==========================================
// POSTS CRUD
// ==========================================

export const createPost = async (postData, userId) => {
  try {
    const coverImageUrl = postData.coverImage
      ? await uploadPostImage(postData.coverImage, userId)
      : null;

    const post = {
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || postData.content.substring(0, 200),
      coverImage: coverImageUrl,
      authorId: userId,
      categoryId: postData.categoryId,
      tags: postData.tags || [],
      status: postData.status || 'published', // published | draft | scheduled
      scheduledAt: postData.scheduledAt || null,
      seriesId: postData.seriesId || null,
      seriesOrder: postData.seriesOrder || null,
      language: postData.language || 'ar',
      allowComments: postData.allowComments !== false,
      isPremium: postData.isPremium || false,
      readingTime: calculateReadingTime(postData.content),
      wordCount: countWords(postData.content),
      views: 0,
      likes: 0,
      comments: 0,
      bookmarks: 0,
      shares: 0,
      score: 0, // Algorithm score for trending
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: postData.status === 'published' ? serverTimestamp() : null,
      searchKeywords: generateSearchKeywords(postData.title, postData.tags),
      seoTitle: postData.seoTitle || postData.title,
      seoDescription: postData.seoDescription || postData.excerpt,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.POSTS), post);

    // Update user's post count
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      postsCount: increment(1),
    });

    return { id: docRef.id, ...post };
  } catch (error) {
    throw new Error(`Failed to create post: ${error.message}`);
  }
};

export const updatePost = async (postId, updates, userId) => {
  try {
    const postRef = doc(db, COLLECTIONS.POSTS, postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) throw new Error('Post not found');
    if (postSnap.data().authorId !== userId) throw new Error('Unauthorized');

    let coverImageUrl = updates.coverImage;
    if (updates.coverImage && updates.coverImage.startsWith('file://')) {
      coverImageUrl = await uploadPostImage(updates.coverImage, userId);
      // Delete old image if exists
      if (postSnap.data().coverImage) {
        await deletePostImage(postSnap.data().coverImage).catch(() => {});
      }
    }

    const updatedData = {
      ...updates,
      coverImage: coverImageUrl,
      readingTime: updates.content ? calculateReadingTime(updates.content) : postSnap.data().readingTime,
      wordCount: updates.content ? countWords(updates.content) : postSnap.data().wordCount,
      updatedAt: serverTimestamp(),
      searchKeywords: generateSearchKeywords(
        updates.title || postSnap.data().title,
        updates.tags || postSnap.data().tags
      ),
    };

    await updateDoc(postRef, updatedData);
    return { id: postId, ...postSnap.data(), ...updatedData };
  } catch (error) {
    throw new Error(`Failed to update post: ${error.message}`);
  }
};

export const deletePost = async (postId, userId) => {
  try {
    await runTransaction(db, async (transaction) => {
      const postRef = doc(db, COLLECTIONS.POSTS, postId);
      const postSnap = await transaction.get(postRef);

      if (!postSnap.exists()) throw new Error('Post not found');
      if (postSnap.data().authorId !== userId) throw new Error('Unauthorized');

      transaction.delete(postRef);
      transaction.update(doc(db, COLLECTIONS.USERS, userId), {
        postsCount: increment(-1),
      });
    });

    // Delete comments in batch
    const commentsQuery = query(
      collection(db, COLLECTIONS.COMMENTS),
      where('postId', '==', postId)
    );
    const commentsSnap = await getDocs(commentsQuery);
    const batch = writeBatch(db);
    commentsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return true;
  } catch (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

export const getPost = async (postId) => {
  try {
    const postSnap = await getDoc(doc(db, COLLECTIONS.POSTS, postId));
    if (!postSnap.exists()) throw new Error('Post not found');

    // Increment view count
    updateDoc(doc(db, COLLECTIONS.POSTS, postId), {
      views: increment(1),
    }).catch(() => {});

    return { id: postSnap.id, ...postSnap.data() };
  } catch (error) {
    throw new Error(`Failed to get post: ${error.message}`);
  }
};

// ==========================================
// POSTS QUERIES (Paginated)
// ==========================================

export const getLatestPosts = async (lastDoc = null, pageSize = PAGE_SIZE) => {
  try {
    let q = query(
      collection(db, COLLECTIONS.POSTS),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return {
      posts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    throw new Error(`Failed to get posts: ${error.message}`);
  }
};

export const getTrendingPosts = async (period = '7days', pageSize = PAGE_SIZE) => {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - (period === '24h' ? 1 : period === '7days' ? 7 : 30));

  try {
    const q = query(
      collection(db, COLLECTIONS.POSTS),
      where('status', '==', 'published'),
      where('publishedAt', '>=', daysAgo),
      orderBy('publishedAt', 'desc'),
      orderBy('score', 'desc'),
      limit(pageSize)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Failed to get trending posts: ${error.message}`);
  }
};

export const getPostsByCategory = async (categoryId, lastDoc = null, pageSize = PAGE_SIZE) => {
  try {
    let q = query(
      collection(db, COLLECTIONS.POSTS),
      where('status', '==', 'published'),
      where('categoryId', '==', categoryId),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snapshot = await getDocs(q);
    return {
      posts: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    throw new Error(`Failed to get category posts: ${error.message}`);
  }
};

export const getPostsByAuthor = async (authorId, lastDoc = null, pageSize = PAGE_SIZE) => {
  try {
    let q = query(
      collection(db, COLLECTIONS.POSTS),
      where('authorId', '==', authorId),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snapshot = await getDocs(q);
    return {
      posts: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    throw new Error(`Failed to get author posts: ${error.message}`);
  }
};

export const searchPosts = async (searchText, lastDoc = null, pageSize = PAGE_SIZE) => {
  try {
    const keywords = searchText.toLowerCase().split(' ').filter((k) => k.length > 1);

    let q = query(
      collection(db, COLLECTIONS.POSTS),
      where('status', '==', 'published'),
      where('searchKeywords', 'array-contains-any', keywords.slice(0, 10)),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snapshot = await getDocs(q);
    return {
      posts: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    throw new Error(`Failed to search posts: ${error.message}`);
  }
};

export const getFollowingFeed = async (followingIds, lastDoc = null, pageSize = PAGE_SIZE) => {
  if (!followingIds?.length) return { posts: [], lastDoc: null, hasMore: false };

  try {
    // Firebase allows max 30 items in 'in' query
    const ids = followingIds.slice(0, 30);
    let q = query(
      collection(db, COLLECTIONS.POSTS),
      where('status', '==', 'published'),
      where('authorId', 'in', ids),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snapshot = await getDocs(q);
    return {
      posts: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    throw new Error(`Failed to get following feed: ${error.message}`);
  }
};

// ==========================================
// LIKES
// ==========================================

export const toggleLike = async (postId, userId) => {
  try {
    const likeId = `${userId}_${postId}`;
    const likeRef = doc(db, COLLECTIONS.LIKES, likeId);
    const likeSnap = await getDoc(likeRef);
    const postRef = doc(db, COLLECTIONS.POSTS, postId);

    if (likeSnap.exists()) {
      await runTransaction(db, async (t) => {
        t.delete(likeRef);
        t.update(postRef, { likes: increment(-1) });
      });
      return false; // unliked
    } else {
      await runTransaction(db, async (t) => {
        t.set(likeRef, { userId, postId, createdAt: serverTimestamp() });
        t.update(postRef, { likes: increment(1), score: increment(2) });
      });
      return true; // liked
    }
  } catch (error) {
    throw new Error(`Failed to toggle like: ${error.message}`);
  }
};

export const checkLiked = async (postId, userId) => {
  const likeRef = doc(db, COLLECTIONS.LIKES, `${userId}_${postId}`);
  const snap = await getDoc(likeRef);
  return snap.exists();
};

// ==========================================
// BOOKMARKS
// ==========================================

export const toggleBookmark = async (postId, userId) => {
  try {
    const bookmarkId = `${userId}_${postId}`;
    const bookmarkRef = doc(db, COLLECTIONS.BOOKMARKS, bookmarkId);
    const snap = await getDoc(bookmarkRef);
    const postRef = doc(db, COLLECTIONS.POSTS, postId);

    if (snap.exists()) {
      await runTransaction(db, async (t) => {
        t.delete(bookmarkRef);
        t.update(postRef, { bookmarks: increment(-1) });
        t.update(doc(db, COLLECTIONS.USERS, userId), {
          bookmarkedPosts: arrayRemove(postId),
        });
      });
      return false;
    } else {
      await runTransaction(db, async (t) => {
        t.set(bookmarkRef, { userId, postId, createdAt: serverTimestamp() });
        t.update(postRef, { bookmarks: increment(1) });
        t.update(doc(db, COLLECTIONS.USERS, userId), {
          bookmarkedPosts: arrayUnion(postId),
        });
      });
      return true;
    }
  } catch (error) {
    throw new Error(`Failed to toggle bookmark: ${error.message}`);
  }
};

export const getUserBookmarks = async (userId, lastDoc = null, pageSize = PAGE_SIZE) => {
  try {
    let q = query(
      collection(db, COLLECTIONS.BOOKMARKS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snapshot = await getDocs(q);
    const bookmarks = snapshot.docs.map((doc) => doc.data());

    // Fetch actual posts
    const postIds = bookmarks.map((b) => b.postId);
    const posts = await Promise.all(
      postIds.map(async (id) => {
        const snap = await getDoc(doc(db, COLLECTIONS.POSTS, id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
      })
    );

    return {
      posts: posts.filter(Boolean),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    throw new Error(`Failed to get bookmarks: ${error.message}`);
  }
};

// ==========================================
// COMMENTS
// ==========================================

export const addComment = async (postId, userId, text, parentId = null) => {
  try {
    const comment = {
      postId,
      userId,
      text,
      parentId,
      likes: 0,
      isEdited: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const commentRef = await addDoc(collection(db, COLLECTIONS.COMMENTS), comment);
    await updateDoc(doc(db, COLLECTIONS.POSTS, postId), {
      comments: increment(1),
    });

    return { id: commentRef.id, ...comment };
  } catch (error) {
    throw new Error(`Failed to add comment: ${error.message}`);
  }
};

export const getPostComments = async (postId, lastDoc = null, pageSize = 20) => {
  try {
    let q = query(
      collection(db, COLLECTIONS.COMMENTS),
      where('postId', '==', postId),
      where('parentId', '==', null),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snapshot = await getDocs(q);
    return {
      comments: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    throw new Error(`Failed to get comments: ${error.message}`);
  }
};

// ==========================================
// IMAGE UPLOAD
// ==========================================

const uploadPostImage = async (localUri, userId) => {
  try {
    const compressed = await compressImage(localUri);
    const filename = `posts/${userId}/${Date.now()}_post.jpg`;
    const imageRef = ref(storage, filename);
    const response = await fetch(compressed);
    const blob = await response.blob();
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

const deletePostImage = async (imageUrl) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.log('Image delete failed:', error);
  }
};

// ==========================================
// UTILITIES
// ==========================================

const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = countWords(content);
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

const countWords = (text) => {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
};

const generateSearchKeywords = (title, tags = []) => {
  const words = [
    ...title.toLowerCase().split(' '),
    ...tags.map((t) => t.toLowerCase()),
  ].filter((w) => w.length > 1);
  return [...new Set(words)];
};

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

export const subscribeToPost = (postId, callback) => {
  return onSnapshot(doc(db, COLLECTIONS.POSTS, postId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
};

export const subscribeToLatestPosts = (callback, pageSize = PAGE_SIZE) => {
  const q = query(
    collection(db, COLLECTIONS.POSTS),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    limit(pageSize)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  });
};
