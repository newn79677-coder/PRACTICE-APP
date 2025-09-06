// js/quiz.js - Quiz functionality
class QuizManager {
    constructor(app) {
        this.app = app;
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.userAnswers = [];
        this.startTime = null;
        this.timerInterval = null;
        
        this.setupQuizEventListeners();
    }

    setupQuizEventListeners() {
        // Option selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('option')) {
                this.selectOption(e.target);
                this.app.playSound();
            }
        });

        // Question grid item click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('grid-item')) {
                const index = parseInt(e.target.dataset.index);
                this.goToQuestion(index);
                this.app.playSound();
            }
        });
    }

    startNewQuiz() {
        const numQuestions = parseInt(document.getElementById('numQuestions').value);
        const quizName = document.getElementById('quizName').value;
        const timeLimit = parseInt(document.getElementById('timeLimit').value);
        const language = document.getElementById('languageSelect').value;
        
        // Validate inputs
        if (numQuestions > this.app.state.questionBank.length) {
            this.app.showNotification(`Only ${this.app.state.questionBank.length} questions available`);
            return;
        }
        
        // Select random questions
        this.questions = this.getRandomQuestions(numQuestions);
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.currentQuestionIndex = 0;
        this.app.state.currentLanguage = language;
        
        // Set up quiz state
        this.app.state.currentTest = {
            name: quizName,
            questions: this.questions,
            userAnswers: this.userAnswers,
            startTime: new Date(),
            timeLimit: timeLimit * 60 * 1000, // Convert to milliseconds
            language: language
        };
        
        // Start timer
        this.startTimer();
        
        // Display first question
        this.displayQuestion(0);
        this.app.navigateTo('quiz');
    }

    getRandomQuestions(count) {
        const shuffled = [...this.app.state.questionBank].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    displayQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;
        
        this.currentQuestionIndex = index;
        const question = this.questions[index];
        const language = this.app.state.currentLanguage;
        
        const questionContainer = document.getElementById('question-container');
        questionContainer.innerHTML = `
            <div class="question">
                <h3>${question.question[language]}</h3>
                <div class="options">
                    ${question.options[language].map((option, i) => `
                        <div class="option" data-value="${option}">
                            ${String.fromCharCode(65 + i)}. ${option}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Mark selected option if any
        const selectedAnswer = this.userAnswers[index];
        if (selectedAnswer !== null) {
            const options = questionContainer.querySelectorAll('.option');
            options.forEach(opt => {
                if (opt.dataset.value === selectedAnswer) {
                    opt.classList.add('selected');
                }
            });
        }
        
        // Update navigation
        document.getElementById('currentQuestionNumber').textContent = index + 1;
        document.getElementById('totalQuestions').textContent = this.questions.length;
        
        // Update progress bar
        const progress = ((index + 1) / this.questions.length) * 100;
        document.getElementById('progress').style.width = `${progress}%`;
        
        // Update question grid
        this.updateQuestionGrid();
        
        // Show/hide navigation buttons
        document.getElementById('prevQuestion').style.display = index > 0 ? 'block' : 'none';
        document.getElementById('nextQuestion').style.display = index < this.questions.length - 1 ? 'block' : 'none';
        document.getElementById('submitQuiz').style.display = index === this.questions.length - 1 ? 'block' : 'none';
    }

    selectOption(optionElement) {
        const selectedValue = optionElement.dataset.value;
        this.userAnswers[this.currentQuestionIndex] = selectedValue;
        
        // Update UI
        const options = document.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected'));
        optionElement.classList.add('selected');
        
        // Update question grid
        this.updateQuestionGrid();
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.displayQuestion(this.currentQuestionIndex + 1);
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.displayQuestion(this.currentQuestionIndex - 1);
        }
    }

    goToQuestion(index) {
        this.displayQuestion(index);
    }

    updateQuestionGrid() {
        const grid = document.getElementById('questionGrid');
        grid.innerHTML = '';
        
        this.questions.forEach((_, index) => {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.textContent = index + 1;
            gridItem.dataset.index = index;
            
            if (index === this.currentQuestionIndex) {
                gridItem.classList.add('current');
            }
            
            if (this.userAnswers[index] !== null) {
                gridItem.classList.add('answered');
            } else {
                gridItem.classList.add('viewed');
            }
            
            grid.appendChild(gridItem);
        });
    }

    toggleQuestionGrid() {
        document.getElementById('questionGrid').classList.toggle('active');
    }

    startTimer() {
        const endTime = this.app.state.currentTest.startTime.getTime() + 
                       this.app.state.currentTest.timeLimit;
        
        this.timerInterval = setInterval(() => {
            const now = Date.now();
            const remaining = endTime - now;
            
            if (remaining <= 0) {
                clearInterval(this.timerInterval);
                this.submitQuiz();
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    submitQuiz() {
        clearInterval(this.timerInterval);
        
        // Calculate results
        const results = this.calculateResults();
        
        // Update app state
        this.app.state.currentResult = results;
        
        // Display results
        this.displayResults();
        
        // Navigate to results screen
        this.app.navigateTo('results');
    }

    calculateResults() {
        const correctAnswers = this.questions.map((q, i) => {
            const userAnswer = this.userAnswers[i];
            const isCorrect = userAnswer === q.answer;
            const isSkipped = userAnswer === null;
            
            return {
                question: q,
                userAnswer: userAnswer,
                isCorrect: isCorrect,
                isSkipped: isSkipped,
                explanation: q.explanation || {
                    en: "No explanation provided",
                    hi: "कोई स्पष्टीकरण प्रदान नहीं किया गया"
                }
            };
        });
        
        const correctCount = correctAnswers.filter(a => a.isCorrect).length;
        const incorrectCount = correctAnswers.filter(a => !a.isCorrect && !a.isSkipped).length;
        const skippedCount = correctAnswers.filter(a => a.isSkipped).length;
        const score = Math.round((correctCount / this.questions.length) * 100);
        
        return {
            quizName: this.app.state.currentTest.name,
            questions: correctAnswers,
            correctCount: correctCount,
            incorrectCount: incorrectCount,
            skippedCount: skippedCount,
            score: score,
            totalQuestions: this.questions.length,
            date: new Date(),
            timeSpent: Date.now() - this.app.state.currentTest.startTime.getTime()
        };
    }

    displayResults() {
        const result = this.app.state.currentResult;
        
        document.getElementById('resultQuizName').textContent = result.quizName;
        document.getElementById('finalScore').textContent = 
            `${result.correctCount}/${result.totalQuestions}`;
        document.getElementById('percentage').textContent = `${result.score}%`;
        document.getElementById('correctCount').textContent = result.correctCount;
        document.getElementById('incorrectCount').textContent = result.incorrectCount;
        document.getElementById('skippedCount').textContent = result.skippedCount;
        document.getElementById('resultDate').textContent = 
            `Date: ${result.date.toLocaleDateString()}`;
        
        // Update progress circle
        const progressCircle = document.getElementById('circleProgress');
        const degrees = (result.score / 100) * 360;
        progressCircle.style.transform = `rotate(${degrees}deg)`;
    }

    saveQuizResult() {
        if (!this.app.state.currentResult) return;
        
        this.app.state.quizHistory.push(this.app.state.currentResult);
        
        // Update leaderboard if score is high enough
        this.updateLeaderboard();
        
        this.app.saveToLocalStorage();
        this.app.showNotification('Results saved successfully!');
    }

    updateLeaderboard() {
        const result = this.app.state.currentResult;
        const existingEntry = this.app.state.leaderboard.find(
            entry => entry.name === this.app.state.userProfile.name
        );
        
        if (existingEntry) {
            if (result.score > existingEntry.score) {
                existingEntry.score = result.score;
                existingEntry.date = result.date;
            }
        } else {
            this.app.state.leaderboard.push({
                name: this.app.state.userProfile.name,
                score: result.score,
                date: result.date
            });
        }
        
        // Sort leaderboard by score (descending)
        this.app.state.leaderboard.sort((a, b) => b.score - a.score);
    }
}