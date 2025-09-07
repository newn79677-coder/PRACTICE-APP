// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc,
    doc,
    orderBy,
    query,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Use THIS configuration instead (from your screenshot):
const firebaseConfig = {
    apiKey: "AIzaSyCe2A8_IFU18q8eb9XuzipMNT7OERNYY",
    authDomain: "practispro-mock-0786.firebaseapp.com",
    projectId: "practispro-mock-0786",
    storageBucket: "practispro-mock-0786.firebasestorage.app",
    messagingSenderId: "457425256741",
    appId: "1:457425256741:web:0807de1335d8b1651ecc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Global Variables
let currentUser = null;
let isAdmin = false;
const adminEmails = ['jaid121314@gmail.com']; // Add admin emails here

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const notesScreen = document.getElementById('notes-screen');
const classesScreen = document.getElementById('classes-screen');
const settingsScreen = document.getElementById('settings-screen');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupEventListeners();
});

// Authentication State Observer
function initializeAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            isAdmin = adminEmails.includes(user.email.toLowerCase());
            showMainApp();
            updateUserInterface();
            loadNotes();
            loadClasses();
        } else {
            currentUser = null;
            isAdmin = false;
            showAuthScreen();
        }
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Auth Forms
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Modal Forms
    document.getElementById('add-note-form').addEventListener('submit', handleAddNote);
    document.getElementById('add-class-form').addEventListener('submit', handleAddClass);
    
    // Theme Toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const submitBtn = loginForm.querySelector('.btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');
    
    try {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loading.style.display = 'inline-block';
        
        await signInWithEmailAndPassword(auth, email, password);
        showNotification('Login successful!', 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(getErrorMessage(error), 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loading.style.display = 'none';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    const submitBtn = signupForm.querySelector('.btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');
    
    try {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loading.style.display = 'inline-block';
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        showNotification('Account created successfully!', 'success');
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(getErrorMessage(error), 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loading.style.display = 'none';
    }
}

async function signOut() {
    try {
        await firebaseSignOut(auth);
        showNotification('Logged out successfully', 'success');
    } catch (error) {
        console.error('Sign out error:', error);
        showNotification('Error signing out', 'error');
    }
}

// UI State Management
function showAuthScreen() {
    authScreen.style.display = 'flex';
    mainApp.classList.remove('show');
}

function showMainApp() {
    authScreen.style.display = 'none';
    mainApp.classList.add('show');
}

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.style.display = 'none');
    
    document.querySelector(`[onclick="switchAuthTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}-form`).style.display = 'block';
}

function switchScreen(screen) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
    
    // Update screens
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(`${screen}-screen`).classList.add('active');
    
    // Load data if needed
    if (screen === 'notes') loadNotes();
    if (screen === 'classes') loadClasses();
}

function updateUserInterface() {
    if (!currentUser) return;
    
    const userName = currentUser.displayName || 'User';
    const userEmail = currentUser.email;
    
    // Update welcome text
    document.getElementById('welcome-text').textContent = `Welcome, ${userName}!`;
    document.getElementById('user-email').textContent = userEmail;
    document.getElementById('settings-email').textContent = userEmail;
    
    // Update avatar
    const avatar = document.getElementById('user-avatar');
    avatar.textContent = userName.charAt(0).toUpperCase();
    
    // Show/hide admin buttons
    const addNoteBtn = document.getElementById('add-note-btn');
    const addClassBtn = document.getElementById('add-class-btn');
    
    if (isAdmin) {
        addNoteBtn.style.display = 'block';
        addClassBtn.style.display = 'block';
        document.getElementById('user-role').textContent = 'Admin';
    } else {
        addNoteBtn.style.display = 'none';
        addClassBtn.style.display = 'none';
        document.getElementById('user-role').textContent = 'User';
    }
}

// Notes Management
async function loadNotes() {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '<div class="empty-state"><p>Loading notes...</p></div>';
    
    try {
        const notesQuery = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(notesQuery);
        
        if (querySnapshot.empty) {
            notesList.innerHTML = '<div class="empty-state"><p>No notes available yet.</p></div>';
            return;
        }
        
        let notesHTML = '';
        querySnapshot.forEach((doc) => {
            const note = doc.data();
            notesHTML += `
                <div class="item-card" onclick="openNote('${note.url || note.downloadURL}')">
                    <div class="item-title">${note.title}</div>
                    <div class="item-subtitle">${note.description || 'Click to view PDF'}</div>
                    <div class="item-subtitle" style="font-size: 0.75rem; margin-top: 0.25rem;">
                        Added: ${note.createdAt ? new Date(note.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                        ${isAdmin ? `<button onclick="event.stopPropagation(); deleteNote('${doc.id}')" style="float: right; background: var(--error); color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.7rem;">Delete</button>` : ''}
                    </div>
                </div>
            `;
        });
        
        notesList.innerHTML = notesHTML;
        
    } catch (error) {
        console.error('Error loading notes:', error);
        notesList.innerHTML = '<div class="empty-state"><p>Error loading notes. Please try again.</p></div>';
    }
}

async function handleAddNote(e) {
    e.preventDefault();
    
    if (!isAdmin) {
        showNotification('Only admins can add notes', 'error');
        return;
    }
    
    const title = document.getElementById('note-title').value.trim();
    const description = document.getElementById('note-description').value.trim();
    const file = document.getElementById('note-file').files[0];
    const url = document.getElementById('note-url').value.trim();
    
    if (!title) {
        showNotification('Please enter a title', 'error');
        return;
    }
    
    if (!file && !url) {
        showNotification('Please either upload a PDF file or provide a URL', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        
        let downloadURL = url;
        
        // If file is uploaded, store it in Firebase Storage
        if (file) {
            const storageRef = ref(storage, `notes/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            downloadURL = await getDownloadURL(snapshot.ref);
        }
        
        // Add note to Firestore
        await addDoc(collection(db, 'notes'), {
            title,
            description,
            url: url || null,
            downloadURL: file ? downloadURL : null,
            createdAt: serverTimestamp(),
            createdBy: currentUser.uid,
            createdByEmail: currentUser.email
        });
        
        showNotification('Note added successfully!', 'success');
        closeModal();
        loadNotes();
        
        // Reset form
        document.getElementById('add-note-form').reset();
        
    } catch (error) {
        console.error('Error adding note:', error);
        showNotification('Error adding note. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function deleteNote(noteId) {
    if (!isAdmin) {
        showNotification('Only admins can delete notes', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'notes', noteId));
        showNotification('Note deleted successfully', 'success');
        loadNotes();
    } catch (error) {
        console.error('Error deleting note:', error);
        showNotification('Error deleting note', 'error');
    }
}

function openNote(url) {
    if (!url) {
        showNotification('No URL available for this note', 'error');
        return;
    }
    
    // Open PDF in new tab
    window.open(url, '_blank');
}

// Classes Management
async function loadClasses() {
    const classesList = document.getElementById('classes-list');
    classesList.innerHTML = '<div class="empty-state"><p>Loading classes...</p></div>';
    
    try {
        const classesQuery = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(classesQuery);
        
        if (querySnapshot.empty) {
            classesList.innerHTML = '<div class="empty-state"><p>No live classes scheduled yet.</p></div>';
            return;
        }
        
        let classesHTML = '';
        querySnapshot.forEach((doc) => {
            const classData = doc.data();
            const scheduledTime = classData.scheduledTime ? 
                new Date(classData.scheduledTime.toDate()).toLocaleString() : 
                'Time not set';
            
            classesHTML += `
                <div class="item-card" onclick="openClass('${classData.url}')">
                    <div class="item-title">${classData.title}</div>
                    <div class="item-subtitle">${classData.description || 'Click to join class'}</div>
                    <div class="item-subtitle" style="font-size: 0.75rem; margin-top: 0.25rem;">
                        Scheduled: ${scheduledTime}
                        ${isAdmin ? `<button onclick="event.stopPropagation(); deleteClass('${doc.id}')" style="float: right; background: var(--error); color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.7rem;">Delete</button>` : ''}
                    </div>
                </div>
            `;
        });
        
        classesList.innerHTML = classesHTML;
        
    } catch (error) {
        console.error('Error loading classes:', error);
        classesList.innerHTML = '<div class="empty-state"><p>Error loading classes. Please try again.</p></div>';
    }
}

async function handleAddClass(e) {
    e.preventDefault();
    
    if (!isAdmin) {
        showNotification('Only admins can add classes', 'error');
        return;
    }
    
    const title = document.getElementById('class-title').value.trim();
    const description = document.getElementById('class-description').value.trim();
    const url = document.getElementById('class-url').value.trim();
    const time = document.getElementById('class-time').value;
    
    if (!title || !url) {
        showNotification('Please enter title and URL', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
        
        const classData = {
            title,
            description,
            url,
            createdAt: serverTimestamp(),
            createdBy: currentUser.uid,
            createdByEmail: currentUser.email
        };
        
        if (time) {
            classData.scheduledTime = new Date(time);
        }
        
        await addDoc(collection(db, 'classes'), classData);
        
        showNotification('Class added successfully!', 'success');
        closeModal();
        loadClasses();
        
        // Reset form
        document.getElementById('add-class-form').reset();
        
    } catch (error) {
        console.error('Error adding class:', error);
        showNotification('Error adding class. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function deleteClass(classId) {
    if (!isAdmin) {
        showNotification('Only admins can delete classes', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this class?')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'classes', classId));
        showNotification('Class deleted successfully', 'success');
        loadClasses();
    } catch (error) {
        console.error('Error deleting class:', error);
        showNotification('Error deleting class', 'error');
    }
}

function openClass(url) {
    if (!url) {
        showNotification('No URL available for this class', 'error');
        return;
    }
    
    // Open class link in new tab
    window.open(url, '_blank');
}

// Modal Management
function showAddNoteModal() {
    if (!isAdmin) {
        showNotification('Only admins can add notes', 'error');
        return;
    }
    document.getElementById('add-note-modal').classList.add('show');
}

function showAddClassModal() {
    if (!isAdmin) {
        showNotification('Only admins can add classes', 'error');
        return;
    }
    document.getElementById('add-class-modal').classList.add('show');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Theme Management
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    const theme = document.body.getAttribute('data-theme');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');
    
    text.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Error Message Helper
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters';
        case 'auth/invalid-email':
            return 'Please enter a valid email address';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection';
        default:
            return error.message || 'An error occurred. Please try again.';
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Global functions for HTML onclick handlers
window.switchAuthTab = switchAuthTab;
window.switchScreen = switchScreen;
window.showAddNoteModal = showAddNoteModal;
window.showAddClassModal = showAddClassModal;
window.closeModal = closeModal;
window.toggleTheme = toggleTheme;
window.signOut = signOut;
window.openNote = openNote;
window.openClass = openClass;
window.deleteNote = deleteNote;
window.deleteClass = deleteClass;