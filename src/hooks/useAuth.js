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
  const [isTherapist, setIsTherapist] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [therapistData, setTherapistData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      setLoading(true);
      if (user) {
        try {
          const userSnapshot = await get(ref(db, `users/${user.uid}`));
          const userData = userSnapshot.val();

          if (mounted) {
            setUser(user);
            setIsEmailVerified(user.emailVerified);
            setIsAdmin(userData?.role === 'admin');
            setIsTherapist(userData?.role === 'therapist');
            setIsActive(userData?.isActive !== false);

            // If user is a therapist, fetch therapist data
            if (userData?.role === 'therapist') {
              const therapistsRef = ref(db, 'therapists');
              const therapistsSnapshot = await get(therapistsRef);
              
              if (therapistsSnapshot.exists()) {
                const therapistsData = therapistsSnapshot.val();
                const therapistInfo = Object.values(therapistsData).find(
                  t => t.uid === user.uid
                );
                
                if (therapistInfo) {
                  setTherapistData(therapistInfo);
                  localStorage.setItem('therapistData', JSON.stringify(therapistInfo));
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch user's data:", error);
          if (mounted) {
            setIsAdmin(false);
            setIsTherapist(false);
            setIsActive(true);
            setTherapistData(null);
          }
        }
      } else {
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setIsTherapist(false);
          setIsActive(true);
          setTherapistData(null);
        }
      }
      if (mounted) {
        setLoading(false);
      }
    });

    // Try to load therapist data from localStorage on initial mount
    const storedTherapistData = localStorage.getItem('therapistData');
    if (storedTherapistData) {
      try {
        setTherapistData(JSON.parse(storedTherapistData));
      } catch (error) {
        console.error('Error parsing stored therapist data:', error);
      }
    }

    return () => {
      mounted = false;
      unsubscribe();
    };
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
      
      // First check user collection
      const userSnapshot = await get(ref(db, `users/${userCredential.user.uid}`));
      const userData = userSnapshot.val();
      
      if (userData?.isActive === false) {
        return { success: false, message: 'Your account has been disabled.' };
      }

      // If user is a therapist, fetch additional therapist data
      if (userData?.role === 'therapist') {
        const therapistsRef = ref(db, 'therapists');
        const therapistsSnapshot = await get(therapistsRef);
        
        if (therapistsSnapshot.exists()) {
          const therapistsData = therapistsSnapshot.val();
          const therapistInfo = Object.values(therapistsData).find(
            t => t.uid === userCredential.user.uid
          );
          
          if (therapistInfo) {
            localStorage.setItem('therapistData', JSON.stringify(therapistInfo));
            
            // Only redirect if this is an actual login, not a temporary auth state change
            if (!userCredential.user._isAdminCreatingTherapist) {
              navigate('/therapist/dashboard');
            }
            return { success: true, user: userCredential.user, therapistData: therapistInfo };
          }
        }
      }

      // Handle other role redirections
      if (userData?.role === 'admin' && !window.location.pathname.includes('/admin')) {
        navigate('/admin/dashboard');
      } else if (userData?.role === 'user' && window.location.pathname.includes('/admin')) {
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

      if (userData?.role !== 'admin' && window.location.pathname.includes('/admin')) {
        return { success: false, message: 'You do not have admin privileges.' };
      }

      console.log('Google Sign In - User Role:', userData?.role);
      console.log('Google Sign In - Is Admin:', userData?.role === 'admin');
      
      return { success: true, user, isAdmin: userData?.role === 'admin' };
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
    isTherapist, 
    isActive,
    therapistData, 
    login, 
    loginWithGoogle, 
    logout, 
    redirectToLogin,
    resetPassword,
    loading
  };
};
