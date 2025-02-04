import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  getAuth, 
  signOut, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const auth = getAuth();
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [role,setRole] = useState("");
  // Enhanced getUserData function to fetch complete user details
  const getUserData = useCallback(async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Return all fields from Firestore document
        return {
          ...docSnap.data(),
          lastFetched: new Date().toISOString()
        };
      } else {
        console.warn("No user document found for:", userId);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }, []);

  // Enhanced updateUserData function
  const updateUserData = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      // Get auth user
      const authUser = auth.currentUser;
      // Get Firestore data
      const firestoreData = await getUserData(userId);
      
      if (!firestoreData) {
        console.warn("Creating new user document for:", userId);
        // Initialize new user document if it doesn't exist
        const initialUserData = {
          uid: userId,
          email: authUser?.email || "",
          emailVerified: authUser?.emailVerified || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          role: "user",
          username: "",
          // Add any other default fields you need
        };
        
        await setDoc(doc(db, "users", userId), initialUserData);
        setUser(initialUserData);
        return;
      }

      // Merge auth and Firestore data
      const mergedUserData = {
        ...firestoreData,
        uid: userId,
        email: authUser?.email || firestoreData.email || "",
        emailVerified: authUser?.emailVerified || false,
        lastLogin: new Date().toISOString(),
        // Add any other fields you want to sync from auth
      };

      // Update the user document with latest auth data
      await setDoc(doc(db, "users", userId), mergedUserData, { merge: true });
      
      // Update local state
      setUser(mergedUserData);
      setRole(mergedUserData.role);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  }, [getUserData]);

  // Setup auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      try {
        if (authUser) {
          await updateUserData(authUser.uid);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [updateUserData]);

  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      await updateUserData(response.user.uid);
      setIsAuthenticated(true);
      return { success: true, data: response.user };
    } catch (e) {
      let msg = e.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if (msg.includes("(auth/user-not-found)")) msg = "User not found";
      if (msg.includes("(auth/wrong-password)")) msg = "Invalid password";
      return { success: false, msg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const register = async (email, password, username, role = "user") => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        username,
        role,
        email,
        uid: response.user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: response.user.emailVerified,
        // Add any other initial user fields you need
      };
      
      await setDoc(doc(db, "users", response.user.uid), userData);
      setUser(userData);
      setIsAuthenticated(true);
      setRole(userData.role);
      return { success: true, data: userData };
    } catch (e) {
      let msg = e.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if (msg.includes("(auth/weak-password)")) msg = "Weak Password";
      if (msg.includes("(auth/email-already-in-use)")) msg = "Email already in use";
      return { success: false, msg };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      register, 
      login, 
      logout, 
      loading, 
      isAuthenticated,
      refreshUserData: () => updateUserData(user?.uid)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
