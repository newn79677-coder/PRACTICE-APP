// js/settings.js - Settings functionality
class SettingsManager {
    constructor(app) {
        this.app = app;
    }

    exportAllData() {
        const data = {
            profile: this.app.state.userProfile,
            settings: this.app.state.settings,
            history: this.app.state.quizHistory,
            leaderboard: this.app.state.leaderboard,
            questions: this.app.state.questionBank
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'quiz_app_backup.json';
        link.click();
        
        this.app.showNotification('Data exported successfully!');
    }

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.profile) this.app.state.userProfile = data.profile;
                if (data.settings) this.app.state.settings = data.settings;
                if (data.history) this.app.state.quizHistory = data.history;
                if (data.leaderboard) this.app.state.leaderboard = data.leaderboard;
                if (data.questions) this.app.state.questionBank = data.questions;
                
                this.app.saveToLocalStorage();
                this.app.applySettings();
                this.app.updateUI();
                
                this.app.showNotification('Data imported successfully!');
            } catch (error) {
                console.error('Error importing data:', error);
                this.app.showNotification('Error importing data. File may be corrupted.');
            }
        };
        reader.readAsText(file);
    }

    resetApp() {
        if (confirm('Are you sure you want to reset the app? All your data will be lost.')) {
            localStorage.clear();
            this.app.state = {
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
            
            this.app.loadDefaultQuestions();
            this.app.applySettings();
            this.app.updateUI();
            
            this.app.showNotification('App reset successfully!');
        }
    }
}