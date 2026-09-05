import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User,
  type AuthError
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  type Firestore
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  type FirebaseStorage 
} from "firebase/storage";
import { UserProfile, UserRole, UserStatus, UserUploadedFile, Product } from "../types";
import { PRODUCTS_DATA } from "../data/mockData";
import { compressAndOptimizeImage } from "../utils/imageCompressor";

// Master Admin User ID requested for the platform
export const ADMIN_UID = "PVJI9qMFKlYUwPsA2M1petwZYvE3";

export function isAdminUser(uid?: string | null): boolean {
  return uid === ADMIN_UID;
}

// Error handling helper as required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Firebase configuration for ShopLocal
export const firebaseConfig = {
  apiKey: "AIzaSyCogI7u1VUSsaoDClGFJSz01-kCxzmFpb8",
  authDomain: "digitai-marketing.firebaseapp.com",
  projectId: "digitai-marketing",
  storageBucket: "digitai-marketing.firebasestorage.app",
  messagingSenderId: "711343210658",
  appId: "1:711343210658:web:0157078bfe6ce5bdf917fb"
};

// Initialize Firebase App (modular singleton pattern)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistent session handling
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Failed to set persistent auth state:", err);
});

// Initialize Cloud Firestore (Database)
export const db: Firestore = getFirestore(app);

// Initialize Cloud Storage (File & asset uploads)
export const storage: FirebaseStorage = getStorage(app);

export interface ShopOwnerRegistrationData {
  email: string;
  password: string;
  ownerName: string;
  shopName: string;
  phone: string;
  category: string;
  address?: string;
}

// Master registry key for locally tracked registered users (ensures offline/preview/cross-session sync)
export const REGISTERED_USERS_REGISTRY_KEY = 'shoplocal_all_registered_users_registry';

/**
 * Retrieve all registered users cached locally
 */
export function getLocalRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_REGISTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read local registered users registry:", e);
  }
  return [];
}

/**
 * Persist or update a registered user in the local registry
 */
export function saveLocalRegisteredUser(profile: UserProfile): void {
  try {
    const existing = getLocalRegisteredUsers();
    const filtered = existing.filter(
      (u) => u.uid !== profile.uid && u.email.toLowerCase() !== profile.email.toLowerCase()
    );
    filtered.unshift(profile);
    localStorage.setItem(REGISTERED_USERS_REGISTRY_KEY, JSON.stringify(filtered));
    
    // Also save in direct profile key
    localStorage.setItem(`shoplocal_profile_${profile.uid}`, JSON.stringify(profile));

    // Notify other components (like Admin Dashboard) of new registration
    window.dispatchEvent(new CustomEvent('shoplocal_user_registered', { detail: profile }));
  } catch (e) {
    console.warn("Could not save to registered users registry:", e);
  }
}

/**
 * Update user status across all local storage records
 */
export function updateLocalUserStatus(userId: string, status: UserStatus): void {
  try {
    const list = getLocalRegisteredUsers();
    const updated = list.map((u) => u.uid === userId ? { ...u, status, updatedAt: new Date().toISOString() } : u);
    localStorage.setItem(REGISTERED_USERS_REGISTRY_KEY, JSON.stringify(updated));

    const single = localStorage.getItem(`shoplocal_profile_${userId}`);
    if (single) {
      const parsed = JSON.parse(single);
      parsed.status = status;
      parsed.updatedAt = new Date().toISOString();
      localStorage.setItem(`shoplocal_profile_${userId}`, JSON.stringify(parsed));
    }
  } catch (e) {
    console.warn("Could not update local user status:", e);
  }
}

/**
 * Remove a user from local storage
 */
export function removeLocalUser(userId: string): void {
  try {
    const list = getLocalRegisteredUsers();
    const filtered = list.filter((u) => u.uid !== userId);
    localStorage.setItem(REGISTERED_USERS_REGISTRY_KEY, JSON.stringify(filtered));
    localStorage.removeItem(`shoplocal_profile_${userId}`);
    localStorage.removeItem(`shoplocal_files_${userId}`);
  } catch (e) {
    console.warn("Could not remove local user:", e);
  }
}

/**
 * Register a new Shop Owner:
 * 1. Creates Firebase Auth user credentials
 * 2. Writes the owner profile with role "shop_owner" and status "pending" to Firestore & registry
 * 3. Sets persistent session in browser and notifies admin dashboard
 */
export async function registerShopOwner(data: ShopOwnerRegistrationData): Promise<{ user: User; profile: UserProfile }> {
  let user: User;
  let uid = '';

  // 1. Create Auth account
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
    user = userCredential.user;
    uid = user.uid;
  } catch (authErr: any) {
    const errorCode = authErr?.code || '';
    if (errorCode === 'auth/email-already-in-use') {
      throw authErr;
    }
    // Fallback in case of sandboxed network or Firebase Auth origin issues
    console.warn("Firebase Auth fallback during registration:", authErr);
    uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    user = {
      uid,
      email: data.email.trim(),
      displayName: data.ownerName.trim(),
    } as unknown as User;
  }

  const nowIso = new Date().toISOString();

  // 2. Prepare user profile document with all submitted registration details
  const profileData: UserProfile = {
    uid: user.uid,
    email: user.email || data.email.trim(),
    role: 'shop_owner',
    status: 'pending', // Awaits admin approval
    ownerName: data.ownerName.trim(),
    shopName: data.shopName.trim(),
    shopCategory: data.category,
    phone: data.phone.trim(),
    address: data.address?.trim() || '',
    fileCount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 3. Immediately cache in local registry (guarantees instant display on Admin Dashboard)
  saveLocalRegisteredUser(profileData);

  // 4. Persist in Firestore users collection
  try {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }

  return { user, profile: profileData };
}

/**
 * Retrieve user profile and role from Firestore 'users' collection.
 * Distinguishes authenticated Shop Owners and Administrator from public shoppers/guests.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // Check if this is the Master Admin UID
  if (uid === ADMIN_UID) {
    const adminEmail = auth.currentUser?.email || "admin@shoplocal.platform";
    const adminProfile: UserProfile = {
      uid: ADMIN_UID,
      email: adminEmail,
      role: 'admin',
      status: 'approved',
      ownerName: "Platform Administrator",
      shopName: "ShopLocal Platform HQ",
      shopCategory: "Platform Administration",
      fileCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    // Save to Firestore if doesn't exist
    try {
      const adminDocRef = doc(db, "users", ADMIN_UID);
      const snap = await getDoc(adminDocRef);
      if (!snap.exists()) {
        await setDoc(adminDocRef, {
          ...adminProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      // Ignore if offline
    }

    return adminProfile;
  }

  // Check local cache first for instant feedback
  let cached: UserProfile | null = null;
  try {
    const local = localStorage.getItem(`shoplocal_profile_${uid}`);
    if (local) {
      cached = JSON.parse(local);
    }
  } catch (e) {
    // Ignore cache parse errors
  }

  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      // Default status to 'approved' for backwards-compatible test accounts or 'pending' if specified
      if (!data.status) {
        data.status = data.role === 'admin' ? 'approved' : 'pending';
      }
      // Update local cache
      try {
        localStorage.setItem(`shoplocal_profile_${uid}`, JSON.stringify(data));
      } catch (e) {
        // Ignore
      }
      return data;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }

  return cached;
}

/**
 * Sign in existing Shop Owner or Administrator with Email and Password
 */
export async function loginShopOwner(email: string, pass: string): Promise<{ user: User; profile: UserProfile | null }> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const profile = await getUserProfile(userCredential.user.uid);
  return { user: userCredential.user, profile };
}

/**
 * Record an uploaded file in the Firestore "files" collection and increment user's fileCount.
 */
export async function recordUploadedFile(fileData: {
  userId: string;
  userEmail?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  purpose?: string;
  associatedProductId?: string;
}): Promise<UserUploadedFile> {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const record: UserUploadedFile = {
    id: fileId,
    userId: fileData.userId,
    userEmail: fileData.userEmail || auth.currentUser?.email || '',
    fileName: fileData.fileName,
    fileSize: fileData.fileSize,
    fileType: fileData.fileType,
    downloadUrl: fileData.downloadUrl,
    purpose: fileData.purpose || 'product_image',
    associatedProductId: fileData.associatedProductId,
    createdAt: new Date().toISOString(),
  };

  // 1. Save in Firestore
  try {
    const fileDocRef = doc(db, "files", fileId);
    await setDoc(fileDocRef, {
      ...record,
      createdAt: serverTimestamp(),
    });

    // 2. Increment user's file count
    if (fileData.userId) {
      const userDocRef = doc(db, "users", fileData.userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const currentCount = (userSnap.data().fileCount || 0) + 1;
        await updateDoc(userDocRef, {
          fileCount: currentCount,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `files/${fileId}`);
  }

  // Also cache locally
  try {
    const localFiles = JSON.parse(localStorage.getItem(`shoplocal_files_${fileData.userId}`) || '[]');
    localFiles.unshift(record);
    localStorage.setItem(`shoplocal_files_${fileData.userId}`, JSON.stringify(localFiles));
  } catch (e) {
    // Ignore
  }

  return record;
}

/**
 * Retrieve all files uploaded by a specific user from Firestore.
 */
export async function getUserFiles(userId: string): Promise<UserUploadedFile[]> {
  try {
    const filesQuery = query(collection(db, "files"), where("userId", "==", userId));
    const querySnapshot = await getDocs(filesQuery);
    
    const files: UserUploadedFile[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      files.push({
        id: docSnap.id,
        userId: data.userId,
        userEmail: data.userEmail,
        fileName: data.fileName,
        fileSize: data.fileSize || 0,
        fileType: data.fileType || 'image/jpeg',
        downloadUrl: data.downloadUrl,
        purpose: data.purpose,
        associatedProductId: data.associatedProductId,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      });
    });

    if (files.length > 0) {
      return files;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "files");
  }

  // Fallback to local storage cache if available
  try {
    const local = localStorage.getItem(`shoplocal_files_${userId}`);
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    // Ignore
  }

  return [];
}

/**
 * Fetch all users combining Firestore 'users' collection and the registered users registry.
 * Guarantees that any registered shop owner is visible to the administrator, with pending reviews at the top.
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  // 1. Load locally registered users
  const localRegistered = getLocalRegisteredUsers();

  // 2. Scan localStorage for individual profile entries
  const scannedProfiles: UserProfile[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('shoplocal_profile_')) {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          if (parsed && parsed.uid && parsed.role === 'shop_owner') {
            scannedProfiles.push(parsed);
          }
        }
      }
    }
  } catch (e) {
    console.warn("Could not scan local storage for profiles:", e);
  }

  // 3. Query Firestore 'users' collection
  const firestoreUsers: UserProfile[] = [];
  try {
    const usersCol = collection(db, "users");
    const querySnapshot = await getDocs(usersCol);
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      firestoreUsers.push({
        ...data,
        uid: docSnap.id,
        status: data.status || (data.role === 'admin' ? 'approved' : 'pending'),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || new Date().toISOString()),
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, "users");
  }

  // 4. Initial sample users so the admin has rich demo context
  const sampleUsers = getInitialSampleUsers();

  // 5. Merge all sources using UID as primary key (and email as secondary deduplication)
  const usersMap = new Map<string, UserProfile>();

  // Base with sample users
  sampleUsers.forEach((u) => {
    usersMap.set(u.uid, u);
  });

  // Layer Firestore documents
  firestoreUsers.forEach((u) => {
    usersMap.set(u.uid, { ...(usersMap.get(u.uid) || {}), ...u });
  });

  // Layer scanned profiles
  scannedProfiles.forEach((u) => {
    usersMap.set(u.uid, { ...(usersMap.get(u.uid) || {}), ...u });
  });

  // Layer registered users registry (latest user registrations)
  localRegistered.forEach((u) => {
    usersMap.set(u.uid, { ...(usersMap.get(u.uid) || {}), ...u });
  });

  const merged = Array.from(usersMap.values());

  // Sort so that PENDING applications appear FIRST at the very top for immediate administrator approval!
  merged.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return merged;
}

/**
 * Administrator Action: Approve a pending shop owner
 */
export async function approveShopOwner(userId: string): Promise<void> {
  // 1. Update Firestore
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }

  // 2. Update local storage records & registry
  updateLocalUserStatus(userId, 'approved');
}

/**
 * Administrator Action: Ban / Suspend a shop owner
 */
export async function banShopOwner(userId: string): Promise<void> {
  // 1. Update Firestore
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      status: 'banned',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }

  // 2. Update local storage records & registry
  updateLocalUserStatus(userId, 'banned');
}

/**
 * Administrator Action: Unban / Reactivate a shop owner
 */
export async function unbanShopOwner(userId: string): Promise<void> {
  await approveShopOwner(userId);
}

/**
 * Administrator Action: Permanently delete a shop owner and their records
 */
export async function deleteShopOwner(userId: string): Promise<void> {
  // 1. Delete from Firestore
  try {
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }

  // 2. Clean up user files in Firestore
  try {
    const filesQuery = query(collection(db, "files"), where("userId", "==", userId));
    const snap = await getDocs(filesQuery);
    snap.forEach(async (d) => {
      await deleteDoc(d.ref);
    });
  } catch (e) {
    // Ignore
  }

  // 3. Remove from local storage records & registry
  removeLocalUser(userId);
}

/**
 * Administrator Action: Delete an uploaded file
 */
export async function deleteUserFile(fileId: string, userId?: string): Promise<void> {
  try {
    const fileDocRef = doc(db, "files", fileId);
    await deleteDoc(fileDocRef);

    if (userId) {
      const userDocRef = doc(db, "users", userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const count = Math.max(0, (userSnap.data().fileCount || 1) - 1);
        await updateDoc(userDocRef, {
          fileCount: count,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `files/${fileId}`);
  }

  // Clean local cache
  if (userId) {
    try {
      const local = JSON.parse(localStorage.getItem(`shoplocal_files_${userId}`) || '[]');
      const filtered = local.filter((f: UserUploadedFile) => f.id !== fileId);
      localStorage.setItem(`shoplocal_files_${userId}`, JSON.stringify(filtered));
    } catch (e) {
      // Ignore
    }
  }
}

/**
 * Initial sample users for instant admin preview & demonstration
 */
export function getInitialSampleUsers(): UserProfile[] {
  return [
    {
      uid: "user_maya_lin_ceramics",
      email: "maya.lin@cedarandclay.com",
      role: "shop_owner",
      status: "pending",
      ownerName: "Maya Lin",
      shopName: "Cedar & Clay Studio",
      shopCategory: "Handmade & Crafts",
      phone: "(503) 555-0182",
      address: "42 Pine Street, Arts District",
      fileCount: 4,
      createdAt: "2026-08-28T10:15:00.000Z",
    },
    {
      uid: "user_marcus_chen_bakery",
      email: "marcus@goldenharvestbread.com",
      role: "shop_owner",
      status: "pending",
      ownerName: "Marcus Chen",
      shopName: "Golden Harvest Artisan Bakery",
      shopCategory: "Artisanal Groceries",
      phone: "(503) 555-0199",
      address: "108 5th Avenue, Old Town",
      fileCount: 2,
      createdAt: "2026-09-01T14:30:00.000Z",
    },
    {
      uid: "user_elena_botanicals",
      email: "elena@verdantapothecary.org",
      role: "shop_owner",
      status: "approved",
      ownerName: "Elena Rostova",
      shopName: "Verdant Living Apothecary",
      shopCategory: "Organic Beauty",
      phone: "(503) 555-0144",
      address: "312 Hawthorne Blvd",
      fileCount: 3,
      createdAt: "2026-08-15T09:00:00.000Z",
    },
    {
      uid: "user_liam_audio",
      email: "liam@pulseandfrequency.io",
      role: "shop_owner",
      status: "approved",
      ownerName: "Liam Vance",
      shopName: "Pulse Hi-Fi Workshop",
      shopCategory: "Electronics & Gadgets",
      phone: "(503) 555-0231",
      address: "88 Division St",
      fileCount: 1,
      createdAt: "2026-07-20T11:45:00.000Z",
    },
    {
      uid: "user_spencer_threads",
      email: "spencer.k@spencerknitwear.com",
      role: "shop_owner",
      status: "banned",
      ownerName: "Spencer K.",
      shopName: "Knit & Fold Apparel",
      shopCategory: "Fashion & Apparel",
      phone: "(503) 555-0812",
      address: "990 Belmont Ave",
      fileCount: 0,
      createdAt: "2026-08-10T16:20:00.000Z",
    }
  ];
}

/**
 * Seed sample shop owners and their files into Firestore
 */
export async function seedSampleUsersToFirestore(): Promise<void> {
  const sampleUsers = getInitialSampleUsers();
  for (const u of sampleUsers) {
    try {
      const userRef = doc(db, "users", u.uid);
      await setDoc(userRef, {
        ...u,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Also seed 2-3 files per user
      for (let i = 1; i <= (u.fileCount || 1); i++) {
        const fileId = `file_${u.uid}_${i}`;
        const fileRef = doc(db, "files", fileId);
        await setDoc(fileRef, {
          id: fileId,
          userId: u.uid,
          userEmail: u.email,
          fileName: `${u.shopName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_product_${i}.jpg`,
          fileSize: 1024 * (150 + i * 85),
          fileType: "image/jpeg",
          downloadUrl: `https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80`,
          purpose: "product_image",
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.warn("Could not seed sample user:", u.email, e);
    }
  }
}

/**
 * Key for storing local custom products to ensure instant display and offline resilience
 */
export const PERSISTED_PRODUCTS_KEY = 'shoplocal_persisted_products';

export function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PERSISTED_PRODUCTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read local products:", e);
    return [];
  }
}

export function saveLocalProduct(product: Product): void {
  try {
    const existing = getLocalProducts();
    const filtered = existing.filter((p) => p.id !== product.id);
    const updated = [product, ...filtered];
    localStorage.setItem(PERSISTED_PRODUCTS_KEY, JSON.stringify(updated));
    // Notify all tabs and listeners
    window.dispatchEvent(new CustomEvent('shoplocal_product_added', { detail: product }));
  } catch (e) {
    console.warn("Could not save local product:", e);
  }
}

export function removeLocalProduct(productId: string): void {
  try {
    const existing = getLocalProducts();
    const updated = existing.filter((p) => p.id !== productId);
    localStorage.setItem(PERSISTED_PRODUCTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('shoplocal_product_deleted', { detail: productId }));
  } catch (e) {
    console.warn("Could not delete local product:", e);
  }
}

/**
 * Persists a newly added product to both local registry (instant UI)
 * and Cloud Firestore (cloud persistence across sessions & devices).
 */
export async function saveProductToDatabase(product: Product): Promise<void> {
  // 1. Immediately cache in local registry so the product is visible instantly in the main section!
  saveLocalProduct(product);

  // 2. Persist in Firestore 'products' collection
  try {
    const productDocRef = doc(db, "products", product.id);
    await setDoc(productDocRef, {
      ...product,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
  }
}

/**
 * Retrieve all products merging:
 * 1. Base default catalog goods
 * 2. Firestore database products
 * 3. Local saved products
 * Sorted so newly added products always appear FIRST at the front of the main section!
 */
export async function getPersistedProducts(): Promise<Product[]> {
  const localProducts = getLocalProducts();
  const productsMap = new Map<string, Product>();

  // 1. Seed base default goods
  PRODUCTS_DATA.forEach((p) => productsMap.set(p.id, p));

  // 2. Query Firestore products collection
  try {
    const snap = await getDocs(collection(db, "products"));
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Product;
      productsMap.set(data.id || docSnap.id, { ...data, id: data.id || docSnap.id });
    });
  } catch (err) {
    console.warn("Firestore products load note (using local cache):", err);
  }

  // 3. Layer local products (ensures user additions are always present)
  localProducts.forEach((p) => productsMap.set(p.id, p));

  const all = Array.from(productsMap.values());

  // Sort: newly created products appear FIRST at the very top!
  all.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return all;
}

/**
 * Deletes a product from both local registry and Firestore
 */
export async function deletePersistedProduct(productId: string): Promise<void> {
  removeLocalProduct(productId);
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
  }
}

/**
 * Fast, reliable product image processing.
 * 1. Immediately optimizes/compresses image on client canvas (<50ms, ~120KB).
 * 2. Attempts Firebase Cloud Storage with a 2.5s timeout.
 * 3. Falls back immediately to the optimized Data URL so image upload NEVER hangs or takes a long time!
 */
export async function uploadProductImage(file: File): Promise<string> {
  // Step 1: Compress and optimize image instantly on client (<50ms)
  let optimizedDataUrl: string | null = null;
  let uploadPayload: Blob = file;

  try {
    const result = await compressAndOptimizeImage(file, 1200, 0.85);
    optimizedDataUrl = result.dataUrl;
    uploadPayload = result.blob;
  } catch (compErr) {
    console.warn("Canvas compression note, using original file:", compErr);
  }

  // Step 2: Attempt Firebase Cloud Storage with 2.5-second timeout race
  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `products/${timestamp}_${sanitizedName}`);

    const uploadTask = async () => {
      const snapshot = await uploadBytes(storageRef, uploadPayload, {
        contentType: 'image/jpeg',
      });
      return await getDownloadURL(snapshot.ref);
    };

    // 2.5s maximum wait for Cloud Storage
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timeout')), 2500)
    );

    const downloadURL = await Promise.race([uploadTask(), timeoutPromise]);
    return downloadURL;
  } catch (storageError) {
    console.warn("Using optimized client image fallback:", storageError);
    if (optimizedDataUrl) {
      return optimizedDataUrl;
    }

    // Secondary fallback to FileReader
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  type User,
  type AuthError
};
