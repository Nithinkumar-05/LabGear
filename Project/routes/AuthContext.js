import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  getAuth, 
  signOut, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const auth = getAuth();
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: undefined,
    loading: true,
    role: ""
  });

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
      }
      console.warn("No user document found for:", userId);
      return null;
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
        setAuthState(prev => ({
          ...prev,
          user: initialUserData,
          role: initialUserData.role
        }));
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
      
      setAuthState(prev => ({
        ...prev,
        user: mergedUserData,
        role: mergedUserData.role
      }));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  }, [getUserData]);

  // Auth state listener
  useEffect(() => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          await updateUserData(authUser.uid);
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            loading: false
          }));
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
            role: ""
          });
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return unsubscribe;
  }, [updateUserData]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      await updateUserData(response.user.uid);
      setAuthState(prev => ({ ...prev, isAuthenticated: true }));
      return { success: true, data: response.user };
    } catch (e) {
      let msg = e.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if (msg.includes("(auth/user-not-found)")) msg = "User not found";
      if (msg.includes("(auth/wrong-password)")) msg = "Invalid password";
      return { success: false, msg };
    }
  }, [updateUserData]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        role: ""
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const refreshUserData = useCallback(() => {
    return updateUserData(authState.user?.uid);
  }, [updateUserData, authState.user?.uid]);

  const contextValue = useMemo(() => ({
    ...authState,
    login,
    logout,
    refreshUserData
  }), [authState, login, logout, refreshUserData]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}