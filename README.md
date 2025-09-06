# Mock Test Pro

A professional mock test platform designed to be better than Testbook, with modern UI/UX and comprehensive features.

## Features

### Core Functionality
- **JSON Question Upload**: Paste or upload questions in JSON format
- **Testbook-like Navigation**: Grid-style question panel with status indicators
- **Smart Question Status**: Unvisited (gray), Visited (red), Answered (green), Marked for Review (purple star)
- **Global Timer**: Single countdown timer for entire test with auto-submit
- **Complete Navigation**: Next/Previous, Jump to any question, Mark for Review, Clear Response
- **Detailed Results**: Score analysis with question-by-question review and explanations

### UI/UX Improvements
- **Modern Design**: Clean, professional interface using modern CSS
- **Responsive Layout**: Mobile-first design that works on all devices
- **Dark/Light Theme**: Toggle between themes with persistent storage
- **Smooth Animations**: Professional transitions and micro-interactions
- **PWA Support**: Install as native app with offline functionality

### Advanced Features
- **Keyboard Shortcuts**: 
  - Arrow keys for navigation
  - Number keys (1-4) for option selection
  - Space/Enter for next question
  - 'R' to mark for review
  - 'C' to clear response
- **Auto-Submit**: Configurable auto-submit when timer expires
- **Local Storage**: All data persists locally
- **Test Management**: Save, retake, and delete tests
- **Result History**: Track all past attempts

## Setup Instructions

### 1. File Structure
```
mock-test-pro/
├── index.html          (Main application)
├── manifest.json       (PWA configuration)
├── sw.js              (Service worker)
├── sample-questions.json (Example questions)
└── README.md          (This file)
```

### 2. Installation
1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. For PWA features, serve via HTTP/HTTPS (use local server)

### 3. Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Usage Guide

### Creating a Test
1. Click "Get Started" on dashboard
2. Enter test title and duration
3. Paste JSON questions in the specified format
4. Click "Create Test" to start immediately

### JSON Format
```json
[
  {
    "question": "Your question text here?",
    "options": [
      "Option A",
      "Option B", 
      "Option C",
      "Option D"
    ],
    "correct": 1,
    "explanation": "Explanation for the correct answer"
  }
]
```

**Important**: 
- `correct` is the index (0-based) of the correct option
- `explanation` is optional but recommended

### Taking a Test
1. **Navigation Panel**: Click any question number to jump directly
2. **Question Controls**: 
   - Select options by clicking
   - Use "Mark for Review" for questions you want to revisit
   - "Clear Response" removes your selection
3. **Timer**: Shows remaining time with color coding (green → yellow → red)
4. **Submit**: Use "Submit Test" button or let it auto-submit when time expires

### Question Status Colors
- **Gray**: Unvisited questions
- **Red**: Visited but not answered
- **Green**: Answered questions  
- **Purple with ★**: Marked for review

### Keyboard Shortcuts
- **1, 2, 3, 4**: Select options A, B, C, D
- **Space/Enter**: Next question
- **Left/Right Arrow**: Navigate questions
- **R**: Mark for review
- **C**: Clear response

### Results & Review
- **Score Overview**: Percentage with detailed breakdown
- **Question Review**: See all questions with correct answers
- **Explanations**: Understand why answers are correct
- **Retake Option**: Redo the same test

## Technical Features

### PWA Capabilities
- **Offline Mode**: Works without internet after first load
- **Install Prompt**: Add to home screen on mobile/desktop
- **Fast Loading**: Cached resources for instant startup

### Data Management
- **Local Storage**: All data stored in browser
- **No Backend Required**: Fully client-side application
- **Export Ready**: Easy to integrate with backend APIs

### Performance
- **Optimized Rendering**: Smooth 60fps animations
- **Memory Efficient**: Minimal resource usage
- **Fast Navigation**: Instant question switching

## Customization

### Theming
Colors can be customized by modifying CSS variables in the `:root` section:
```css
:root {
  --primary: #4f46e5;
  --success: #10b981;
  --error: #ef4444;
  /* etc. */
}
```

### Timer Settings
Default auto-submit can be disabled in Settings, or modified in the code:
```javascript
document.getElementById('auto-submit').checked = false; // Disable auto-submit
```

### Question Format Extensions
To add more question types, modify the `createTest()` and validation functions.

## Browser Support
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License
Free to use for educational and personal purposes.

## Support
For issues or feature requests, check the code comments or modify as needed for your specific requirements.

---

**Made with ❤️ to be better than Testbook**