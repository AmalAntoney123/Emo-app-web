import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsEmailVerified(user?.emailVerified ?? false);

      if (user) {
        try {
          const userSnapshot = await get(ref(db, `users/${user.uid}`));
          const userData = userSnapshot.val();

          setIsAdmin(userData?.role === 'admin');
          setIsActive(userData?.isActive !== false);
        } catch (error) {
          console.error("Failed to fetch user's data:", error);
          setIsAdmin(false);
          setIsActive(true);
        }
      } else {
        setIsAdmin(false);
        setIsActive(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        throw new Error('email-not-verified');
      }
      
      const userSnapshot = await get(ref(db, `users/${userCredential.user.uid}`));
      const userData = userSnapshot.val();
      if (userData?.isActive === false) {
        throw new Error('user-disabled');
      }
      
      if (userData?.role !== 'admin') {
        throw new Error('not-admin');
      }
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      
      const userSnapshot = await get(ref(db, `users/${user.uid}`));
      const userData = userSnapshot.val();
      
      if (userData?.isActive === false) {
        throw new Error('user-disabled');
      }
      
      if (userData?.role !== 'admin') {
        throw new Error('not-admin');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  const logout = async () => {
    try {
      await signOut(auth);
      redirectToLogin();
    } catch (error) {
      throw error;
    }
  };

  return { user, isEmailVerified, isAdmin, isActive, login, loginWithGoogle, logout, redirectToLogin };
};
