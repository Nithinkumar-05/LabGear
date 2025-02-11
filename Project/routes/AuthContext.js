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
  const [role, setRole] = useState("");

  // Fetch complete user details
  const getUserData = useCallback(async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
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

  // Update or create user data
  const updateUserData = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const authUser = auth.currentUser;
      const firestoreData = await getUserData(userId);
      
      if (!firestoreData) {
        console.warn("Creating new user document for:", userId);
        const initialUserData = {
          uid: userId,
          email: authUser?.email || "",
          emailVerified: authUser?.emailVerified || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          role: "user",
          
          labdetails: {
              reference: ""
          },
      
          personal: {
              dob: "",
              email: "",
              name: "",
              phone: ""
          },
      
          professional: {
              department: "CSE",
              designation: "",
              empId: ""
          }
        };
        
        await setDoc(doc(db, "users", userId), initialUserData);
        setUser(initialUserData);
        setRole(initialUserData.role);
        return;
      }

      const mergedUserData = {
        ...firestoreData,
        uid: userId,
        email: authUser?.email || firestoreData.email || "",
        emailVerified: authUser?.emailVerified || false,
        lastLogin: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", userId), mergedUserData, { merge: true });
      
      setUser(mergedUserData);
      setRole(mergedUserData.role);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  }, [getUserData]);

  // Auth state listener
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
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  
  

  return (
    <AuthContext.Provider value={{ 
      user, 
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
