// js/leaderboard.js - Leaderboard functionality
class LeaderboardManager {
    constructor(app) {
        this.app = app;
    }

    updateLeaderboardScreen() {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        if (this.app.state.leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p class="no-data">No leaderboard data yet. Complete a quiz to appear here!</p>';
            return;
        }
        
        this.app.state.leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-name">${entry.name}</div>
                <div class="leaderboard-score">${entry.score}%</div>
                <div class="leaderboard-date">${new Date(entry.date).toLocaleDateString()}</div>
            `;
            leaderboardList.appendChild(item);
        });
    }
}