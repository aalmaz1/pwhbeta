// auth.js — Firebase + Регистрация для Pixel Word Hunter
const firebaseConfig = {
  apiKey: "AIzaSyCgKKrHIaDNzjUIaK2Z-Usf587px-lPMSY",
  authDomain: "pixelwordhunter.firebaseapp.com",
  projectId: "pixelwordhunter",
  storageBucket: "pixelwordhunter.firebasestorage.app",
  messagingSenderId: "1094897769595",
  appId: "1:1094897769595:web:392a30ef42f3b558b896de",
  measurementId: "G-X90YSQL16F"
};

// Инициализация Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let isRegisterMode = false;

// ГЛАВНЫЕ ФУНКЦИИ (подключаются к HTML onclick)
window.showAuthModal = (mode) => {
  isRegisterMode = mode === 'register';
  document.getElementById('auth-title').textContent = isRegisterMode ? '// REGISTER //' : '// LOGIN //';
  document.getElementById('username-field').style.display = isRegisterMode ? 'flex' : 'none';
  document.getElementById('auth-modal').classList.remove('hidden');
};

window.toggleAuthMode = () => {
  isRegisterMode = !isRegisterMode;
  document.getElementById('auth-title').textContent = isRegisterMode ? '// REGISTER //' : '// LOGIN //';
  document.getElementById('username-field').style.display = isRegisterMode ? 'flex' : 'none';
  document.getElementById('auth-toggle-text').textContent = isRegisterMode ? 'Have account?' : 'Need an account?';
  document.querySelector('.auth-toggle-btn').textContent = isRegisterMode ? 'LOGIN' : 'REGISTER';
};

window.closeAuthModal = () => {
  document.getElementById('auth-modal').classList.add('hidden');
  document.getElementById('auth-error').textContent = '';
};

window.handleAuthSubmit = async () => {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const username = document.getElementById('auth-username').value;
  const errorEl = document.getElementById('auth-error');
  
  try {
    let userCredential;
    
    if (isRegisterMode) {
      if (!username) throw new Error('Enter username');
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username, email, xp: 0, mastered: 0, total: 600
      });
    } else {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }
    
    closeAuthModal();
    showWelcomeNotification(userCredential.user);
    document.getElementById('hunt-btn').classList.remove('hidden');
    document.getElementById('auth-buttons').classList.add('hidden');
    
  } catch (error) {
    errorEl.textContent = error.message;
  }
};

// Остальные функции...
function showWelcomeNotification(user) {
  const notif = document.getElementById('ios-notification');
  document.getElementById('notification-text').textContent = Welcome, ${user.email.split('@')[0]}!;
  notif.classList.remove('hidden');
  notif.classList.add('show');
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.classList.add('hidden'), 400);
  }, 3000);
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('hunt-btn').classList.remove('hidden');
    document.getElementById('auth-buttons').classList.add('hidden');
  }
});
