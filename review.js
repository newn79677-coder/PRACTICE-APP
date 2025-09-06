// js/review.js - Review functionality
class ReviewManager {
    constructor(app) {
        this.app = app;
        this.currentReviewIndex = 0;
    }

    displayReviewQuestion(index) {
        if (!this.app.state.currentResult || 
            index < 0 || 
            index >= this.app.state.currentResult.questions.length) {
            return;
        }
        
        this.currentReviewIndex = index;
        const questionResult = this.app.state.currentResult.questions[index];
        const question = questionResult.question;
        const language = this.app.state.currentLanguage;
        
        const reviewContainer = document.getElementById('review-question-container');
        reviewContainer.innerHTML = `
            <div class="question">
                <h3>${question.question[language]}</h3>
                <div class="options">
                    ${question.options[language].map((option, i) => {
                        let className = 'option';
                        if (option === question.answer) {
                            className += ' correct';
                        } else if (option === questionResult.userAnswer && !questionResult.isCorrect) {
                            className += ' incorrect';
                        } else if (option === questionResult.userAnswer) {
                            className += ' selected';
                        }
                        
                        return `
                            <div class="${className}" data-value="${option}">
                                ${String.fromCharCode(65 + i)}. ${option}
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="explanation">
                    <strong>Explanation:</strong> ${questionResult.explanation[language]}
                </div>
            </div>
        `;
        
        // Update navigation
        document.getElementById('currentReviewQuestionNumber').textContent = index + 1;
        document.getElementById('totalReviewQuestions').textContent = 
            this.app.state.currentResult.questions.length;
        
        // Show/hide navigation buttons
        document.getElementById('prevReviewQuestion').style.display = 
            index > 0 ? 'block' : 'none';
        document.getElementById('nextReviewQuestion').style.display = 
            index < this.app.state.currentResult.questions.length - 1 ? 'block' : 'none';
    }

    nextReviewQuestion() {
        if (this.currentReviewIndex < this.app.state.currentResult.questions.length - 1) {
            this.displayReviewQuestion(this.currentReviewIndex + 1);
        }
    }

    previousReviewQuestion() {
        if (this.currentReviewIndex > 0) {
            this.displayReviewQuestion(this.currentReviewIndex - 1);
        }
    }
}