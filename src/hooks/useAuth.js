import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
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

  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Invalid email or password. Please try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check and try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed. Please contact support.';
      case 'auth/weak-password':
        return 'Please choose a stronger password.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful attempts. Please try again later.';
      default:
        return 'An unexpected issue occurred. Please try again.';
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        return { success: false, message: 'Please verify your email before logging in.' };
      }
      
      const userSnapshot = await get(ref(db, `users/${userCredential.user.uid}`));
      const userData = userSnapshot.val();
      if (userData?.isActive === false) {
        return { success: false, message: 'Your account has been disabled.' };
      }
      
      if (userData?.role !== 'admin') {
        return { success: false, message: 'You do not have admin privileges.' };
      }
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;
      
      const userSnapshot = await get(ref(db, `users/${user.uid}`));
      const userData = userSnapshot.val();
      
      if (userData?.isActive === false) {
        return { success: false, message: 'Your account has been disabled.' };
      }
      
      if (userData?.role !== 'admin') {
        return { success: false, message: 'You do not have admin privileges.' };
      }
      
      return { success: true, user };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
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

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent. Check your inbox.' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  return { 
    user, 
    isEmailVerified, 
    isAdmin, 
    isActive, 
    login, 
    loginWithGoogle, 
    logout, 
    redirectToLogin,
    resetPassword
  };
};
