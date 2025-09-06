// script.js - Main application logic
class QuizApp {
    constructor() {
        this.state = {
            currentScreen: 'home',
            questionBank: [],
            currentTest: null,
            currentResult: null,
            userProfile: {
                name: 'Quiz Master',
                bio: 'Test your knowledge with our quizzes!',
                profilePicture: 'assets/default-dp.png'
            },
            settings: {
                darkMode: true,
                mobileLayout: false,
                fontSize: 'medium',
                soundEnabled: true
            },
            quizHistory: [],
            leaderboard: [],
            currentLanguage: 'en'
        };

        this.initializeApp();
    }

    initializeApp() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.applySettings();
        this.updateUI();
        
        // Register service worker for PWA
        if ('serviceWorker' in navigator) {
            navigatorServiceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered:', reg.scope))
                .catch(err => console.error('Service Worker failed:', err));
        }

        // Listen for PWA installation prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('installBtn').style.display = 'block';
        });

        // Handle install button click
        document.getElementById('installBtn').addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    document.getElementById('installBtn').style.display = 'none';
                }
                this.deferredPrompt = null;
            }
        });
    }

    loadFromLocalStorage() {
        try {
            const savedProfile = localStorage.getItem('quizUserProfile');
            const savedSettings = localStorage.getItem('quizSettings');
            const savedHistory = localStorage.getItem('quizHistory');
            const savedLeaderboard = localStorage.getItem('quizLeaderboard');
            const savedBank = localStorage.getItem('quizQuestionBank');

            if (savedProfile) this.state.userProfile = JSON.parse(savedProfile);
            if (savedSettings) this.state.settings = JSON.parse(savedSettings);
            if (savedHistory) this.state.quizHistory = JSON.parse(savedHistory);
            if (savedLeaderboard) this.state.leaderboard = JSON.parse(savedLeaderboard);
            if (savedBank) this.state.questionBank = JSON.parse(savedBank);

            // Load default questions if bank is empty
            if (this.state.questionBank.length === 0) {
                this.loadDefaultQuestions();
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            this.showNotification('Error loading saved data');
            
            // Initialize with default values if loading fails
            this.loadDefaultQuestions();
        }
    }

    loadDefaultQuestions() {
        this.state.questionBank = [
            {
                question: {
                    en: "What is 2 + 2?",
                    hi: "2+2 कितना होता है?"
                },
                options: {
                    en: ["2", "3", "4", "5"],
                    hi: ["२", "३", "४", "५"]
                },
                answer: "4",
                explanation: {
                    en: "Because 2 added to 2 equals 4.",
                    hi: "क्योंकि 2 में 2 जोड़ने से 4 होता है।"
                }
            },
            {
                question: {
                    en: "Which planet is known as the Red Planet?",
                    hi: "लाल ग्रह के रूप में किस ग्रह को जाना जाता है?"
                },
                options: {
                    en: ["Venus", "Mars", "Jupiter", "Saturn"],
                    hi: ["शुक्र", "मंगल", "बृहस्पति", "शनि"]
                },
                answer: "Mars",
                explanation: {
                    en: "Mars is often called the Red Planet due to its reddish appearance.",
                    hi: "मंगल ग्रह को अक्सर इसके लाल रंग की उपस्थिति के कारण लाल ग्रह कहा जाता है।"
                }
            },
            {
                question: {
                    en: "What is the capital of France?",
                    hi: "फ्रांस की राजधानी क्या है?"
                },
                options: {
                    en: ["London", "Berlin", "Paris", "Madrid"],
                    hi: ["लंदन", "बर्लिन", "पेरिस", "मैड्रिड"]
                },
                answer: "Paris",
                explanation: {
                    en: "Paris is the capital and most populous city of France.",
                    hi: "पेरिस फ्रांस की राजधानी और सबसे अधिक आबादी वाला शहर है।"
                }
            }
        ];
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('quizUserProfile', JSON.stringify(this.state.userProfile));
            localStorage.setItem('quizSettings', JSON.stringify(this.state.settings));
            localStorage.setItem('quizHistory', JSON.stringify(this.state.quizHistory));
            localStorage.setItem('quizLeaderboard', JSON.stringify(this.state.leaderboard));
            localStorage.setItem('quizQuestionBank', JSON.stringify(this.state.questionBank));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            this.showNotification('Error saving data');
        }
    }

    setupEventListeners() {
        // Profile menu
        document.getElementById('profileMenuBtn').addEventListener('click', () => {
            this.toggleDropdown();
            this.playSound();
        });

        // Dropdown menu items
        document.getElementById('profileBtn').addEventListener('click', () => {
            this.navigateTo('profile');
            this.playSound();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.navigateTo('settings');
            this.playSound();
        });

        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.navigateTo('leaderboard');
            this.playSound();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            // Simple logout - just navigate to home
            this.navigateTo('home');
            this.playSound();
        });

        // Home screen buttons
        document.getElementById('startQuizBtn').addEventListener('click', () => {
            this.navigateTo('setup');
            this.playSound();
        });

        document.getElementById('viewHistoryBtn').addEventListener('click', () => {
            this.navigateTo('history');
            this.playSound();
        });

        // Setup screen buttons
        document.getElementById('startQuiz').addEventListener('click', () => {
            this.startNewQuiz();
            this.playSound();
        });

        document.getElementById('backToHome').addEventListener('click', () => {
            this.navigateTo('home');
            this.playSound();
        });

        // Quiz navigation
        document.getElementById('prevQuestion').addEventListener('click', () => {
            this.previousQuestion();
            this.playSound();
        });

        document.getElementById('nextQuestion').addEventListener('click', () => {
            this.nextQuestion();
            this.playSound();
        });

        document.getElementById('submitQuiz').addEventListener('click', () => {
            this.submitQuiz();
            this.playSound();
        });

        // Results screen buttons
        document.getElementById('reviewAnswers').addEventListener('click', () => {
            this.navigateTo('review');
            this.playSound();
        });

        document.getElementById('newQuiz').addEventListener('click', () => {
            this.navigateTo('setup');
            this.playSound();
        });

        document.getElementById('saveResult').addEventListener('click', () => {
            this.saveQuizResult();
            this.playSound();
        });

        // Review navigation
        document.getElementById('prevReviewQuestion').addEventListener('click', () => {
            this.previousReviewQuestion();
            this.playSound();
        });

        document.getElementById('nextReviewQuestion').addEventListener('click', () => {
            this.nextReviewQuestion();
            this.playSound();
        });

        document.getElementById('backToResults').addEventListener('click', () => {
            this.navigateTo('results');
            this.playSound();
        });

        // History screen buttons
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
            this.playSound();
        });

        document.getElementById('exportHistory').addEventListener('click', () => {
            this.exportHistory();
            this.playSound();
        });

        document.getElementById('backFromHistory').addEventListener('click', () => {
            this.navigateTo('home');
            this.playSound();
        });

        // Settings screen buttons
        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.toggleDarkMode(e.target.checked);
            this.playSound();
        });

        document.getElementById('mobileModeToggle').addEventListener('change', (e) => {
            this.toggleMobileLayout(e.target.checked);
            this.playSound();
        });

        document.getElementById('fontSizeSelect').addEventListener('change', (e) => {
            this.changeFontSize(e.target.value);
            this.playSound();
        });

        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.toggleSound(e.target.checked);
            this.playSound();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.exportAllData();
            this.playSound();
        });

        document.getElementById('importData').addEventListener('click', () => {
            document.getElementById('importDataInput').click();
            this.playSound();
        });

        document.getElementById('importDataInput').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('resetApp').addEventListener('click', () => {
            this.resetApp();
            this.playSound();
        });

        document.getElementById('backFromSettings').addEventListener('click', () => {
            this.navigateTo('home');
            this.playSound();
        });

        // Leaderboard screen buttons
        document.getElementById('backFromLeaderboard').addEventListener('click', () => {
            this.navigateTo('home');
            this.playSound();
        });

        // Profile screen buttons
        document.getElementById('saveProfile').addEventListener('click', () => {
            this.saveProfile();
            this.playSound();
        });

        document.getElementById('backFromProfile').addEventListener('click', () => {
            this.navigateTo('home');
            this.playSound();
        });

        document.getElementById('uploadProfilePic').addEventListener('click', () => {
            document.getElementById('profilePictureUpload').click();
            this.playSound();
        });

        document.getElementById('profilePictureUpload').addEventListener('change', (e) => {
            this.uploadProfilePicture(e.target.files[0]);
        });

        // Close dropdown when clicking outside
        window.addEventListener('click', (e) => {
            if (!e.target.matches('.menu-btn')) {
                const dropdown = document.getElementById('profileDropdown');
                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            }
        });

        // Question grid toggle
        document.getElementById('gridToggle').addEventListener('click', () => {
            this.toggleQuestionGrid();
            this.playSound();
        });
    }

    navigateTo(screen) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        // Show requested screen
        document.getElementById(`${screen}-screen`).classList.add('active');
        this.state.currentScreen = screen;
        
        // Update UI based on screen
        this.updateUI();
    }

    updateUI() {
        // Update profile info on home screen
        document.getElementById('userName').textContent = this.state.userProfile.name;
        document.getElementById('userBio').textContent = this.state.userProfile.bio;
        document.getElementById('profilePicture').src = this.state.userProfile.profilePicture;
        
        // Update stats on home screen
        const totalQuizzes = this.state.quizHistory.length;
        const bestScore = totalQuizzes > 0 ? Math.max(...this.state.quizHistory.map(q => q.score)) : 0;
        const avgScore = totalQuizzes > 0 ? 
            Math.round(this.state.quizHistory.reduce((sum, q) => sum + q.score, 0) / totalQuizzes) : 0;
        
        document.getElementById('totalQuizzes').textContent = totalQuizzes;
        document.getElementById('bestScore').textContent = `${bestScore}%`;
        document.getElementById('avgScore').textContent = `${avgScore}%`;
        
        // Update setup screen
        document.getElementById('maxQuestions').textContent = this.state.questionBank.length;
        
        // Update settings screen
        document.getElementById('darkModeToggle').checked = this.state.settings.darkMode;
        document.getElementById('mobileModeToggle').checked = this.state.settings.mobileLayout;
        document.getElementById('fontSizeSelect').value = this.state.settings.fontSize;
        document.getElementById('soundToggle').checked = this.state.settings.soundEnabled;
        
        // Update profile screen
        document.getElementById('profileName').value = this.state.userProfile.name;
        document.getElementById('profileBio').value = this.state.userProfile.bio;
        document.getElementById('profilePicturePreview').src = this.state.userProfile.profilePicture;
        
        // Update history screen if active
        if (this.state.currentScreen === 'history') {
            this.updateHistoryScreen();
        }
        
        // Update leaderboard screen if active
        if (this.state.currentScreen === 'leaderboard') {
            this.updateLeaderboardScreen();
        }
    }

    toggleDropdown() {
        document.getElementById('profileDropdown').classList.toggle('show');
    }

    playSound() {
        if (this.state.settings.soundEnabled) {
            const sound = document.getElementById('clickSound');
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Sound play failed:', e));
        }
    }

    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }

    applySettings() {
        // Apply dark/light mode
        document.documentElement.setAttribute('data-theme', 
            this.state.settings.darkMode ? 'dark' : 'light');
        
        // Apply mobile layout
        if (this.state.settings.mobileLayout) {
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
        
        // Apply font size
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${this.state.settings.fontSize}`);
    }

    toggleDarkMode(enabled) {
        this.state.settings.darkMode = enabled;
        this.applySettings();
        this.saveToLocalStorage();
    }

    toggleMobileLayout(enabled) {
        this.state.settings.mobileLayout = enabled;
        this.applySettings();
        this.saveToLocalStorage();
    }

    changeFontSize(size) {
        this.state.settings.fontSize = size;
        this.applySettings();
        this.saveToLocalStorage();
    }

    toggleSound(enabled) {
        this.state.settings.soundEnabled = enabled;
        this.saveToLocalStorage();
    }

    // More methods for quiz functionality, review, etc. would be here
    // This is a simplified version for demonstration
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});