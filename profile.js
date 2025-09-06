// js/profile.js - Profile functionality
class ProfileManager {
    constructor(app) {
        this.app = app;
    }

    saveProfile() {
        const name = document.getElementById('profileName').value.trim();
        const bio = document.getElementById('profileBio').value.trim();
        
        if (!name) {
            this.app.showNotification('Please enter your name');
            return;
        }
        
        this.app.state.userProfile.name = name;
        this.app.state.userProfile.bio = bio;
        
        this.app.saveToLocalStorage();
        this.app.updateUI();
        
        this.app.showNotification('Profile saved successfully!');
        this.app.navigateTo('home');
    }

    uploadProfilePicture(file) {
        if (!file || !file.type.match('image.*')) {
            this.app.showNotification('Please select a valid image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.app.state.userProfile.profilePicture = e.target.result;
            document.getElementById('profilePicturePreview').src = e.target.result;
            this.app.saveToLocalStorage();
            this.app.showNotification('Profile picture updated!');
        };
        reader.readAsDataURL(file);
    }
}