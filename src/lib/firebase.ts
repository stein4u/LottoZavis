import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

// Config parsed from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyAZwEgKVi73R89cueUN9XpjWNn3ZsJ0igM",
  authDomain: "salarycalculator-496605.firebaseapp.com",
  projectId: "salarycalculator-496605",
  storageBucket: "salarycalculator-496605.firebasestorage.app",
  messagingSenderId: "906893678358",
  appId: "1:906893678358:web:82735fb297264cf764e237"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Sign in with Google Popup
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Google login error:", error);
    throw error;
  }
};

// Sign Out
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase logout error:", error);
    throw error;
  }
};

// Firestore helper functions
export interface SavedPrediction {
  id?: string;
  userId: string;
  numbers: number[];
  confidence?: number;
  modelType: string;
  createdAt: any;
  oddEvenRatio?: string;
  sum?: number;
  statsWindow?: string | number;
  latestRound?: number;
}

export interface WikiComment {
  id?: string;
  pageId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: any;
}

export interface WikiQAItem {
  id?: string;
  question: string;
  answer: string;
  userId: string;
  userName: string;
  createdAt: any;
}

// 1. Save prediction to Firestore
export const savePrediction = async (prediction: Omit<SavedPrediction, "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "predictions"), {
      ...prediction,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving prediction to Firestore:", error);
    throw error;
  }
};

// 2. Fetch predictions history for specific user
export const fetchPredictionsHistory = async (userId: string): Promise<SavedPrediction[]> => {
  try {
    const q = query(
      collection(db, "predictions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    const history: SavedPrediction[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        userId: data.userId,
        numbers: data.numbers,
        confidence: data.confidence,
        modelType: data.modelType,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        oddEvenRatio: data.oddEvenRatio,
        sum: data.sum,
        statsWindow: data.statsWindow,
        latestRound: data.latestRound,
      });
    });
    return history;
  } catch (error) {
    console.error("Error fetching predictions:", error);
    // Return fallback empty array if query fails (e.g. index building)
    return [];
  }
};

// 3. Save discussion comment to Wiki page
export const saveWikiComment = async (comment: Omit<WikiComment, "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "wiki_comments"), {
      ...comment,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving comment to Firestore:", error);
    throw error;
  }
};

// 4. Stream comments for a Wiki page
export const listenToWikiComments = (pageId: string, callback: (comments: WikiComment[]) => void) => {
  const q = query(
    collection(db, "wiki_comments"),
    where("pageId", "==", pageId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const comments: WikiComment[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        pageId: data.pageId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        content: data.content,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      });
    });
    callback(comments);
  }, (error) => {
    console.error("Error streaming wiki comments:", error);
  });
};

// 5. Save custom LLM Q&A
export const saveQAItem = async (qaItem: Omit<WikiQAItem, "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "wiki_qa"), {
      ...qaItem,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving Q&A to Firestore:", error);
    throw error;
  }
};

// 6. Fetch Q&A items
export const fetchQAItems = async (): Promise<WikiQAItem[]> => {
  try {
    const q = query(
      collection(db, "wiki_qa"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    const qaList: WikiQAItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      qaList.push({
        id: doc.id,
        question: data.question,
        answer: data.answer,
        userId: data.userId,
        userName: data.userName,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
      });
    });
    return qaList;
  } catch (error) {
    console.error("Error fetching QA items:", error);
    return [];
  }
};
