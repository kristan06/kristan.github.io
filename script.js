// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Initialize the app
    initPhilippineTime();
    initTabNavigation();
    initThemeSettings();
    initStudyTimer();
    initTaskTracker();
    initNotes();
    initAnalytics();
    initFocusMode();
    initKeyboardShortcuts();
    initDataManagement();
    
    // Load saved data
    loadSavedData();
});

// Global variables
let tasks = [];
let sessions = [];
let notes = [];
let activeTheme = 'default';
let isDarkMode = false;
let isFocusMode = false;
let soundEnabled = true;
let selectedSound = 'bell';
let soundVolume = 80;
let streakData = {
    currentStreak: 0,
    lastStudyDate: null,
    studyDays: []
};

// Study timer variables
let selectedTechnique = {
    id: 'pomodoro',
    name: 'Pomodoro',
    studyTime: 25 * 60,
    breakTime: 5 * 60
};
let timeLeft = selectedTechnique.studyTime;
let isRunning = false;
let isBreak = false;
let timerInterval = null;
let customStudyTime = 45;
let customBreakTime = 15;
let pomodoroCycles = 0;
let activeNote = null;

// Philippine Time Clock with accurate time
function initPhilippineTime() {
    const timeDisplay = document.getElementById('philippine-time');
    
    function updateTime() {
        // Create a date object with the current UTC time
        const now = new Date();
        
        // Philippine Standard Time is UTC+8
        const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        
        // Format the time
        const hours = philippineTime.getUTCHours();
        const minutes = philippineTime.getUTCMinutes();
        const seconds = philippineTime.getUTCSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convert to 12-hour format
        const formattedHours = hours % 12 || 12;
        
        // Format the time string
        const timeString = `${formattedHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm} PHT`;
        
        timeDisplay.textContent = timeString;
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', initPhilippineTime);


// Tab Navigation
function initTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Theme Settings
function initThemeSettings() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeOptions = document.querySelectorAll('.theme-option');
    const modeOptions = document.querySelectorAll('.mode-option');
    const colorPicker = document.getElementById('color-picker');
    const colorHex = document.getElementById('color-hex');
    const customColorPreview = document.getElementById('custom-color-preview');
    const notificationSoundSelect = document.getElementById('notification-sound-select');
    const volumeControl = document.getElementById('volume-control');
    const testSoundBtn = document.getElementById('test-sound-btn');
    
    // Theme toggle button
    themeToggle.addEventListener('click', () => {
        toggleDarkMode();
    });
    
    // Theme options
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            setActiveTheme(theme);
            
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Show/hide custom color picker
            const customColorPicker = document.getElementById('custom-color-picker');
            if (theme === 'custom') {
                customColorPicker.classList.remove('hidden');
            } else {
                customColorPicker.classList.add('hidden');
            }
        });
    });
    
    // Mode options
    modeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const mode = option.getAttribute('data-mode');
            
            if (mode === 'dark') {
                setDarkMode(true);
            } else {
                setDarkMode(false);
            }
            
            modeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Custom color picker
    colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        colorHex.value = color;
        customColorPreview.style.backgroundColor = color;
        setCustomColor(color);
    });
    
    colorHex.addEventListener('input', (e) => {
        const color = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
            colorPicker.value = color;
            customColorPreview.style.backgroundColor = color;
            setCustomColor(color);
        }
    });
    
    // Sound settings
    notificationSoundSelect.addEventListener('change', (e) => {
        selectedSound = e.target.value;
        localStorage.setItem('selectedSound', selectedSound);
    });
    
    volumeControl.addEventListener('input', (e) => {
        soundVolume = e.target.value;
        localStorage.setItem('soundVolume', soundVolume);
    });
    
    testSoundBtn.addEventListener('click', () => {
        playNotificationSound();
    });
}

function setActiveTheme(theme) {
    // Remove previous theme class
    document.body.classList.remove(`theme-${activeTheme}`);
    
    // Set new theme
    activeTheme = theme;
    
    if (theme !== 'default' && theme !== 'custom') {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Save theme preference
    localStorage.setItem('studyTheme', theme);
}

function setCustomColor(color) {
    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Set CSS variables
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-hover', adjustColorBrightness(color, -10));
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    
    // Save custom color
    localStorage.setItem('customColor', color);
}

function adjustColorBrightness(hex, percent) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    // Adjust brightness
    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function toggleDarkMode() {
    setDarkMode(!isDarkMode);
}

function setDarkMode(dark) {
    isDarkMode = dark;
    
    if (dark) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i data-lucide="sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i data-lucide="moon"></i>';
    }
    
    // Update mode options
    document.querySelectorAll('.mode-option').forEach(option => {
        const mode = option.getAttribute('data-mode');
        if ((mode === 'dark' && dark) || (mode === 'light' && !dark)) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Save dark mode preference
    localStorage.setItem('darkMode', dark.toString());
    
    // Refresh Lucide icons
    lucide.createIcons();
}

// Focus Mode
function initFocusMode() {
    const focusModeToggle = document.getElementById('focus-mode-toggle');
    const exitFocusModeBtn = document.getElementById('exit-focus-mode-btn');
    const focusModeMessage = document.getElementById('focus-mode-message');
    const focusModeOverlayMessage = document.getElementById('focus-mode-overlay-message');
    const autoFocusMode = document.getElementById('auto-focus-mode');
    
    focusModeToggle.addEventListener('click', () => {
        toggleFocusMode();
    });
    
    exitFocusModeBtn.addEventListener('click', () => {
        toggleFocusMode();
    });
    
    focusModeMessage.addEventListener('input', (e) => {
        focusModeOverlayMessage.textContent = e.target.value;
        localStorage.setItem('focusModeMessage', e.target.value);
    });
    
    autoFocusMode.addEventListener('change', () => {
        localStorage.setItem('autoFocusMode', autoFocusMode.checked);
    });
}

function toggleFocusMode() {
    isFocusMode = !isFocusMode;
    
    const focusModeOverlay = document.getElementById('focus-mode-overlay');
    
    if (isFocusMode) {
        focusModeOverlay.classList.remove('hidden');
        document.getElementById('focus-mode-toggle').innerHTML = '<i data-lucide="eye"></i>';
    } else {
        focusModeOverlay.classList.add('hidden');
        document.getElementById('focus-mode-toggle').innerHTML = '<i data-lucide="eye-off"></i>';
    }
    
    // Refresh Lucide icons
    lucide.createIcons();
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only process if not in an input field
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (e.code === 'Space') {
                e.preventDefault();
                toggleTimer();
            } else if (e.key === 'r' || e.key === 'R') {
                resetTimer();
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFocusMode();
            } else if (e.key === 'd' || e.key === 'D') {
                toggleDarkMode();
            }
        }
    });
}

// Study Timer
function initStudyTimer() {
    const techniqueButtons = document.querySelectorAll('.technique-btn');
    const timerToggle = document.getElementById('timer-toggle');
    const timerReset = document.getElementById('timer-reset');
    const soundToggle = document.getElementById('sound-toggle');
    const studyTimeInput = document.getElementById('study-time');
    const breakTimeInput = document.getElementById('break-time');
    
    // Set initial timer
    updateTimerDisplay();
    updatePomodoroCycles();
    
    // Technique buttons
    techniqueButtons.forEach(button => {
        button.addEventListener('click', () => {
            const techniqueId = button.getAttribute('data-technique');
            
            // Update active button
            techniqueButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show/hide custom timer settings
            const customSettings = document.getElementById('custom-timer-settings');
            if (techniqueId === 'custom') {
                customSettings.classList.remove('hidden');
            } else {
                customSettings.classList.add('hidden');
            }
            
            // Set selected technique
            setSelectedTechnique(techniqueId);
        });
    });
    
    // Timer controls
    timerToggle.addEventListener('click', toggleTimer);
    timerReset.addEventListener('click', resetTimer);
    
    // Sound toggle
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        updateSoundToggle();
        localStorage.setItem('soundEnabled', soundEnabled);
    });
    
    // Custom timer inputs
    studyTimeInput.addEventListener('change', () => {
        customStudyTime = parseInt(studyTimeInput.value) || 45;
        if (selectedTechnique.id === 'custom' && !isBreak) {
            timeLeft = customStudyTime * 60;
            updateTimerDisplay();
        }
    });
    
    breakTimeInput.addEventListener('change', () => {
        customBreakTime = parseInt(breakTimeInput.value) || 15;
        if (selectedTechnique.id === 'custom' && isBreak) {
            timeLeft = customBreakTime * 60;
            updateTimerDisplay();
        }
    });
}

function updateSoundToggle() {
    const soundToggle = document.getElementById('sound-toggle');
    
    if (soundEnabled) {
        soundToggle.innerHTML = '<i data-lucide="volume-2"></i>';
    } else {
        soundToggle.innerHTML = '<i data-lucide="volume-x"></i>';
    }
    
    // Refresh Lucide icons
    lucide.createIcons();
}

function setSelectedTechnique(techniqueId) {
    // Stop current timer
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        updateTimerControls();
    }
    
    // Reset break state
    isBreak = false;
    
    // Reset pomodoro cycles if changing techniques
    if (selectedTechnique.id !== techniqueId) {
        pomodoroCycles = 0;
        updatePomodoroCycles();
    }
    
    // Set technique
    switch (techniqueId) {
        case 'pomodoro':
            selectedTechnique = {
                id: 'pomodoro',
                name: 'Pomodoro',
                studyTime: 25 * 60,
                breakTime: 5 * 60
            };
            break;
        case 'feynman':
            selectedTechnique = {
                id: 'feynman',
                name: 'Feynman Technique',
                studyTime: 30 * 60,
                breakTime: 10 * 60
            };
            break;
        case 'spaced':
            selectedTechnique = {
                id: 'spaced',
                name: 'Spaced Repetition',
                studyTime: 20 * 60,
                breakTime: 10 * 60
            };
            break;
        case 'active':
            selectedTechnique = {
                id: 'active',
                name: 'Active Recall',
                studyTime: 30 * 60,
                breakTime: 5 * 60
            };
            break;
        case 'custom':
            selectedTechnique = {
                id: 'custom',
                name: 'Custom Timer',
                studyTime: customStudyTime * 60,
                breakTime: customBreakTime * 60
            };
            break;
    }
    
    // Update timer
    timeLeft = selectedTechnique.studyTime;
    updateTimerDisplay();
    updateTechniqueTips(techniqueId);
}

function updateTechniqueTips(techniqueId) {
    const tipsElement = document.getElementById('technique-tips');
    let tipsText = '';
    
    switch (techniqueId) {
        case 'pomodoro':
            tipsText = 'Focus intensely for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break.';
            break;
        case 'feynman':
            tipsText = 'Study a concept, then try to explain it in simple terms as if teaching someone else. Identify gaps in your understanding.';
            break;
        case 'spaced':
            tipsText = 'Review material at increasing intervals: first after 20 minutes, then a day later, then a week later, etc.';
            break;
        case 'active':
            tipsText = 'Instead of rereading, test yourself on the material. Create flashcards or practice problems to reinforce learning.';
            break;
        case 'custom':
            tipsText = 'Customize your study and break times to match your personal concentration patterns and learning style.';
            break;
    }
    
    tipsElement.querySelector('p').textContent = tipsText;
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
    } else {
        timerInterval = setInterval(updateTimer, 1000);
        isRunning = true;
        
        // Auto focus mode
        const autoFocusMode = document.getElementById('auto-focus-mode');
        if (autoFocusMode && autoFocusMode.checked && !isFocusMode) {
            toggleFocusMode();
        }
    }
    
    updateTimerControls();
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    if (isBreak) {
        timeLeft = selectedTechnique.id === 'custom' ? customBreakTime * 60 : selectedTechnique.breakTime;
    } else {
        timeLeft = selectedTechnique.id === 'custom' ? customStudyTime * 60 : selectedTechnique.studyTime;
    }
    
    updateTimerDisplay();
    updateTimerControls();
}

function updateTimer() {
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        
        // Play notification sound
        playNotificationSound();
        
        if (!isBreak) {
            // Record completed study session
            const topic = document.getElementById('current-topic').value || 'Unnamed Session';
            const notes = document.getElementById('session-notes').value || '';
            
            const session = {
                id: Date.now(),
                technique: selectedTechnique.name,
                duration: selectedTechnique.id === 'custom' ? customStudyTime * 60 : selectedTechnique.studyTime,
                topic: topic,
                notes: notes,
                date: new Date().toISOString()
            };
            
            addSession(session);
            
            // Update pomodoro cycles
            if (selectedTechnique.id === 'pomodoro') {
                pomodoroCycles = (pomodoroCycles + 1) % 4;
                updatePomodoroCycles();
            }
            
            // Update streak
            updateStreak();
            
            // Switch to break
            isBreak = true;
            timeLeft = selectedTechnique.id === 'custom' ? customBreakTime * 60 : selectedTechnique.breakTime;
            document.getElementById('timer-state').textContent = 'Break Time';
        } else {
            // End of break
            isBreak = false;
            timeLeft = selectedTechnique.id === 'custom' ? customStudyTime * 60 : selectedTechnique.studyTime;
            document.getElementById('timer-state').textContent = 'Study Session';
        }
        
        updateTimerDisplay();
        updateTimerControls();
    } else {
        timeLeft--;
        updateTimerDisplay();
    }
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer-time');
    const progressElement = document.getElementById('timer-progress');
    const techniqueName = document.getElementById('technique-name');
    
    // Update timer text
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update technique name
    techniqueName.textContent = selectedTechnique.name;
    
    // Update progress circle
    const totalTime = isBreak 
        ? (selectedTechnique.id === 'custom' ? customBreakTime * 60 : selectedTechnique.breakTime)
        : (selectedTechnique.id === 'custom' ? customStudyTime * 60 : selectedTechnique.studyTime);
    
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (progress / 100) * circumference;
    
    progressElement.style.strokeDasharray = circumference;
    progressElement.style.strokeDashoffset = offset;
}

function updateTimerControls() {
    const timerToggle = document.getElementById('timer-toggle');
    
    if (isRunning) {
        timerToggle.innerHTML = '<i data-lucide="pause"></i>';
    } else {
        timerToggle.innerHTML = '<i data-lucide="play"></i>';
    }
    
    // Refresh Lucide icons
    lucide.createIcons();
}

function updatePomodoroCycles() {
    const pomodoroCounter = document.getElementById('pomodoro-counter');
    
    // Only show for Pomodoro technique
    if (selectedTechnique.id === 'pomodoro') {
        pomodoroCounter.classList.remove('hidden');
        
        // Update cycle indicators
        const cycles = pomodoroCounter.querySelectorAll('.pomodoro-cycle');
        cycles.forEach((cycle, index) => {
            cycle.classList.remove('active', 'completed');
            
            if (index < pomodoroCycles) {
                cycle.classList.add('completed');
            } else if (index === pomodoroCycles) {
                cycle.classList.add('active');
            }
        });
    } else {
        pomodoroCounter.classList.add('hidden');
    }
}

function playNotificationSound() {
    if (soundEnabled) {
        const sound = document.getElementById(`notification-sound-${selectedSound}`);
        if (sound) {
            sound.volume = soundVolume / 100;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    }
}

function updateStreak() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // If this is the first study session ever
    if (!streakData.lastStudyDate) {
        streakData.currentStreak = 1;
        streakData.lastStudyDate = today;
        streakData.studyDays = [today];
    } 
    // If already studied today, do nothing
    else if (streakData.lastStudyDate === today) {
        return;
    } 
    // If studied yesterday, increment streak
    else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (streakData.lastStudyDate === yesterdayStr) {
            streakData.currentStreak++;
        } else {
            streakData.currentStreak = 1;
        }
        
        streakData.lastStudyDate = today;
        
        // Add today to study days if not already there
        if (!streakData.studyDays.includes(today)) {
            streakData.studyDays.push(today);
        }
    }
    
    // Update UI
    updateStreakDisplay();
    
    // Save streak data
    localStorage.setItem('streakData', JSON.stringify(streakData));
}

function updateStreakDisplay() {
    const streakCount = document.getElementById('streak-count');
    const streakCalendar = document.getElementById('streak-calendar');
    const currentStreakElement = document.getElementById('current-streak');
    
    // Update streak count
    streakCount.textContent = streakData.currentStreak;
    currentStreakElement.textContent = `${streakData.currentStreak} days`;
    
    // Update calendar
    streakCalendar.innerHTML = '';
    
    // Get last 7 days
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${streakData.studyDays.includes(dateStr) ? 'active' : ''}`;
        dayElement.textContent = date.getDate();
        
        streakCalendar.appendChild(dayElement);
    }
}

// Task Tracker
function initTaskTracker() {
    const addTaskForm = document.getElementById('add-task-form');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Add task form
    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const prioritySelect = document.getElementById('task-priority');
        const dueDateInput = document.getElementById('task-due-date');
        
        const task = {
            id: Date.now(),
            title: titleInput.value,
            description: descriptionInput.value,
            priority: prioritySelect.value,
            dueDate: dueDateInput.value || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        addTask(task);
        
        // Reset form
        titleInput.value = '';
        descriptionInput.value = '';
        prioritySelect.value = 'medium';
        dueDateInput.value = '';
    });
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter tasks
            renderTasks(filter);
        });
    });
}

function addTask(task) {
    tasks.push(task);
    renderTasks();
    saveData();
    updateAnalytics();
}

function renderTasks(filter = 'all') {
    const tasksList = document.getElementById('tasks-list');
    const filteredTasks = filterTasks(tasks, filter);
    
    // Clear list
    tasksList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <p>No tasks found. Add a new task to get started!</p>
            </div>
        `;
        return;
    }
    
    // Render tasks
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        // Check if task is due soon (within 2 days) or overdue
        let dueDateClass = '';
        let dueDateText = '';
        
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const timeDiff = dueDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff < 0) {
                dueDateClass = 'overdue';
                dueDateText = `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''}`;
            } else if (daysDiff <= 2) {
                dueDateClass = 'soon';
                dueDateText = daysDiff === 0 ? 'Due today' : daysDiff === 1 ? 'Due tomorrow' : `Due in ${daysDiff} days`;
            } else {
                dueDateText = `Due on ${new Date(task.dueDate).toLocaleDateString()}`;
            }
        }
        
        taskElement.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                ${task.completed ? '<i data-lucide="check"></i>' : ''}
            </div>
            <div class="task-content">
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-priority ${task.priority}">${task.priority}</div>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">Added: ${new Date(task.createdAt).toLocaleString()}</div>
                ${task.dueDate ? `<div class="task-due-date ${dueDateClass}">${dueDateText}</div>` : ''}
            </div>
            <button class="task-delete" data-id="${task.id}">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        
        tasksList.appendChild(taskElement);
    });
    
    // Add event listeners
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', () => {
            const taskId = parseInt(checkbox.getAttribute('data-id'));
            toggleTaskCompletion(taskId);
        });
    });
    
    document.querySelectorAll('.task-delete').forEach(button => {
        button.addEventListener('click', () => {
            const taskId = parseInt(button.getAttribute('data-id'));
            deleteTask(taskId);
        });
    });
    
    // Refresh Lucide icons
    lucide.createIcons();
}

function filterTasks(tasks, filter) {
    switch (filter) {
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'due-soon':
            return tasks.filter(task => {
                if (!task.dueDate || task.completed) return false;
                
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const timeDiff = dueDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                return daysDiff <= 2; // Due today, tomorrow, or overdue
            });
        default:
            return tasks;
    }
}

function toggleTaskCompletion(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    renderTasks();
    saveData();
    updateAnalytics();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
    saveData();
    updateAnalytics();
}

// Notes
function initNotes() {
    const addNoteBtn = document.getElementById('add-note-btn');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    
    // Add note button
    addNoteBtn.addEventListener('click', () => {
        // Clear editor
        noteTitleInput.value = '';
        noteContentInput.value = '';
        
        // Create new note
        const note = {
            id: Date.now(),
            title: 'Untitled Note',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        notes.push(note);
        activeNote = note.id;
        
        // Enable save and delete buttons
        saveNoteBtn.disabled = false;
        deleteNoteBtn.disabled = false;
        
        // Set title input
        noteTitleInput.value = note.title;
        
        // Render notes list
        renderNotes();
        
        // Focus title input
        noteTitleInput.focus();
        noteTitleInput.select();
    });
    
    // Save note button
    saveNoteBtn.addEventListener('click', () => {
        if (!activeNote) return;
        
        const title = noteTitleInput.value || 'Untitled Note';
        const content = noteContentInput.value;
        
        notes = notes.map(note => {
            if (note.id === activeNote) {
                return {
                    ...note,
                    title,
                    content,
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });
        
        renderNotes();
        saveData();
    });
    
    // Delete note button
    deleteNoteBtn.addEventListener('click', () => {
        if (!activeNote) return;
        
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== activeNote);
            
            // Clear editor
            noteTitleInput.value = '';
            noteContentInput.value = '';
            activeNote = null;
            
            // Disable save and delete buttons
            saveNoteBtn.disabled = true;
            deleteNoteBtn.disabled = true;
            
            renderNotes();
            saveData();
        }
    });
    
    // Auto-save on input
    noteTitleInput.addEventListener('input', () => {
        if (!activeNote) return;
        
        const title = noteTitleInput.value || 'Untitled Note';
        
        notes = notes.map(note => {
            if (note.id === activeNote) {
                return {
                    ...note,
                    title,
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });
        
        renderNotes();
    });
    
    noteContentInput.addEventListener('input', () => {
        if (!activeNote) return;
        
        const content = noteContentInput.value;
        
        notes = notes.map(note => {
            if (note.id === activeNote) {
                return {
                    ...note,
                    content,
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });
    });
}

function renderNotes() {
    const notesList = document.getElementById('notes-list');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');
    
    // Clear list
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <p>No notes found. Add a new note to get started!</p>
            </div>
        `;
        
        // Disable editor
        noteTitleInput.value = '';
        noteContentInput.value = '';
        noteTitleInput.disabled = true;
        noteContentInput.disabled = true;
        saveNoteBtn.disabled = true;
        deleteNoteBtn.disabled = true;
        
        return;
    }
    
    // Enable editor
    noteTitleInput.disabled = false;
    noteContentInput.disabled = false;
    
    // Render notes
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = `note-item ${activeNote === note.id ? 'active' : ''}`;
        noteElement.textContent = note.title;
        noteElement.setAttribute('data-id', note.id);
        
        noteElement.addEventListener('click', () => {
            activeNote = note.id;
            
            // Update editor
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            
            // Update active state
            renderNotes();
        });
        
        notesList.appendChild(noteElement);
    });
    
    // Set active note content
    if (activeNote) {
        const active = notes.find(note => note.id === activeNote);
        noteTitleInput.value = active.title;
        noteContentInput.value = active.content;
        
        saveNoteBtn.disabled = false;
        deleteNoteBtn.disabled = false;
    } else {
        noteTitleInput.value = '';
        noteContentInput.value = '';
        saveNoteBtn.disabled = true;
        deleteNoteBtn.disabled = true;
    }
}

// Analytics
function initAnalytics() {
    // Initial render
    updateAnalytics();
}

function addSession(session) {
    sessions.push(session);
    saveData();
    updateAnalytics();
}

function updateAnalytics() {
    updateStudyTimeStats();
    updateTaskCompletionStats();
    renderDailyChart();
    renderTechniqueChart();
    renderWeeklyChart();
    renderProductivityChart();
    renderRecentSessions();
}

function updateStudyTimeStats() {
    const totalStudyTimeElement = document.getElementById('total-study-time');
    const totalSessionsElement = document.getElementById('total-sessions');
    
    // Calculate total study time
    const totalSeconds = sessions.reduce((total, session) => total + session.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    totalStudyTimeElement.textContent = `${hours}h ${minutes}m`;
    totalSessionsElement.textContent = sessions.length;
}

function updateTaskCompletionStats() {
    const taskCompletionElement = document.getElementById('task-completion');
    const taskCompletionDetailElement = document.getElementById('task-completion-detail');
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    taskCompletionElement.textContent = `${completionRate}%`;
    taskCompletionDetailElement.textContent = `${completedTasks} of ${totalTasks} tasks completed`;
}

function renderDailyChart() {
    const chartElement = document.getElementById('daily-chart');
    
    // Get last 7 days
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayTotal = sessions.reduce((total, session) => {
            const sessionDate = new Date(session.date);
            if (sessionDate >= date && sessionDate < nextDay) {
                return total + session.duration;
            }
            return total;
        }, 0);
        
        last7Days.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            total: dayTotal
        });
    }
    
    // Find max value for scaling
    const maxValue = Math.max(...last7Days.map(day => day.total)) || 3600; // Default to 1 hour if no data
    
    // Clear chart
    chartElement.innerHTML = '';
    
    // Render chart
    if (last7Days.some(day => day.total > 0)) {
        last7Days.forEach(day => {
            const barHeight = day.total > 0 ? (day.total / maxValue) * 100 : 0;
            
            const barElement = document.createElement('div');
            barElement.className = 'chart-bar';
            
            const hours = Math.floor(day.total / 3600);
            const minutes = Math.floor((day.total % 3600) / 60);
            const timeText = day.total > 0 ? `${hours > 0 ? hours + 'h ' : ''}${minutes}m` : '0m';
            
            barElement.innerHTML = `
                <div class="chart-bar-value">${timeText}</div>
                <div class="chart-bar-column" style="height: 80%;">
                    <div class="chart-bar-fill" style="height: ${barHeight}%;"></div>
                </div>
                <div class="chart-bar-label">${day.date}</div>
            `;
            
            chartElement.appendChild(barElement);
        });
    } else {
        chartElement.innerHTML = `
            <div class="empty-state">
                <p>No study data available</p>
            </div>
        `;
    }
}

function renderTechniqueChart() {
    const chartElement = document.getElementById('technique-chart');
    
    // Calculate technique breakdown
    const techniques = {};
    let totalTime = 0;
    
    sessions.forEach(session => {
        if (!techniques[session.technique]) {
            techniques[session.technique] = 0;
        }
        techniques[session.technique] += session.duration;
        totalTime += session.duration;
    });
    
    // Clear chart
    chartElement.innerHTML = '';
    
    // Render chart
    if (Object.keys(techniques).length > 0) {
        Object.entries(techniques).forEach(([technique, duration]) => {
            const percentage = Math.round((duration / totalTime) * 100) || 0;
            
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            const timeText = `${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
            
            const barElement = document.createElement('div');
            barElement.className = 'technique-bar';
            
            barElement.innerHTML = `
                <div class="technique-bar-header">
                    <span>${technique}</span>
                    <span>${timeText} (${percentage}%)</span>
                </div>
                <div class="technique-bar-container">
                    <div class="technique-bar-fill" style="width: ${percentage}%;"></div>
                </div>
            `;
            
            chartElement.appendChild(barElement);
        });
    } else {
        chartElement.innerHTML = `
            <div class="empty-state">
                <p>No technique data available</p>
            </div>
        `;
    }
}

function renderWeeklyChart() {
    const chartElement = document.getElementById('weekly-chart');
    
    // Get weekly data for the last 4 weeks
    const weeklyData = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekTotal = sessions.reduce((total, session) => {
            const sessionDate = new Date(session.date);
            if (sessionDate >= weekStart && sessionDate < weekEnd) {
                return total + session.duration;
            }
            return total;
        }, 0);
        
        const weekLabel = `Week ${4-i}`;
        
        weeklyData.push({
            label: weekLabel,
            total: weekTotal
        });
    }
    
    // Find max value for scaling
    const maxValue = Math.max(...weeklyData.map(week => week.total)) || 3600; // Default to 1 hour if no data
    
    // Clear chart
    chartElement.innerHTML = '';
    
    // Render chart
    if (weeklyData.some(week => week.total > 0)) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'daily-chart'; // Reuse daily chart styles
        
        weeklyData.forEach(week => {
            const barHeight = week.total > 0 ? (week.total / maxValue) * 100 : 0;
            
            const barElement = document.createElement('div');
            barElement.className = 'chart-bar';
            
            const hours = Math.floor(week.total / 3600);
            const timeText = `${hours}h`;
            
            barElement.innerHTML = `
                <div class="chart-bar-value">${timeText}</div>
                <div class="chart-bar-column" style="height: 80%;">
                    <div class="chart-bar-fill" style="height: ${barHeight}%;"></div>
                </div>
                <div class="chart-bar-label">${week.label}</div>
            `;
            
            chartContainer.appendChild(barElement);
        });
        
        chartElement.appendChild(chartContainer);
    } else {
        chartElement.innerHTML = `
            <div class="empty-state">
                <p>No weekly data available</p>
            </div>
        `;
    }
}

function renderProductivityChart() {
    const chartElement = document.getElementById('productivity-chart');
    
    // Calculate productivity score (0-100)
    // Based on: study time, task completion, streak
    let score = 0;
    
    // Study time component (up to 40 points)
    const totalStudySeconds = sessions.reduce((total, session) => total + session.duration, 0);
    const studyHours = totalStudySeconds / 3600;
    const studyScore = Math.min(40, Math.round(studyHours * 2)); // 2 points per hour, max 40
    
    // Task completion component (up to 30 points)
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const taskScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 30) : 0;
    
    // Streak component (up to 30 points)
    const streakScore = Math.min(30, streakData.currentStreak * 3); // 3 points per day, max 30
    
    // Total score
    score = studyScore + taskScore + streakScore;
    
    // Clear chart
    chartElement.innerHTML = '';
    
    // Create productivity gauge
    const scoreElement = document.createElement('div');
    scoreElement.className = 'productivity-score';
    
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    
    scoreElement.innerHTML = `
        <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" class="timer-circle-bg" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" stroke-width="8" stroke-linecap="round" 
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 50 50)" />
        </svg>
        <div class="productivity-score-value">
            ${score}
            <small>Productivity Score</small>
        </div>
    `;
    
    chartElement.appendChild(scoreElement);
    
    // Add score breakdown
    const breakdownElement = document.createElement('div');
    breakdownElement.className = 'technique-chart'; // Reuse technique chart styles
    breakdownElement.style.marginTop = '2rem';
    
    const components = [
        { name: 'Study Time', score: studyScore, max: 40 },
        { name: 'Task Completion', score: taskScore, max: 30 },
        { name: 'Study Streak', score: streakScore, max: 30 }
    ];
    
    components.forEach(component => {
        const percentage = (component.score / component.max) * 100;
        
        const barElement = document.createElement('div');
        barElement.className = 'technique-bar';
        
        barElement.innerHTML = `
            <div class="technique-bar-header">
                <span>${component.name}</span>
                <span>${component.score}/${component.max} pts</span>
            </div>
            <div class="technique-bar-container">
                <div class="technique-bar-fill" style="width: ${percentage}%;"></div>
            </div>
        `;
        
        breakdownElement.appendChild(barElement);
    });
    
    chartElement.appendChild(breakdownElement);
}

function renderRecentSessions() {
    const sessionsListElement = document.getElementById('recent-sessions-list');
    
    // Clear list
    sessionsListElement.innerHTML = '';
    
    if (sessions.length === 0) {
        sessionsListElement.innerHTML = `
            <div class="empty-state">
                <p>No study sessions recorded yet</p>
            </div>
        `;
        return;
    }
    
    // Get recent sessions (last 5)
    const recentSessions = [...sessions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    }).slice(0, 5);
    
    // Render sessions
    recentSessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.className = 'session-item';
        
        const hours = Math.floor(session.duration / 3600);
        const minutes = Math.floor((session.duration % 3600) / 60);
        const timeText = `${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
        
        sessionElement.innerHTML = `
            <div class="session-header">
                <div class="session-title">${session.topic || 'Unnamed Session'}</div>
                <div class="session-date">${new Date(session.date).toLocaleDateString()}</div>
            </div>
            <div class="session-meta">${session.technique} • ${timeText}</div>
            ${session.notes ? `<div class="session-notes">${session.notes}</div>` : ''}
        `;
        
        sessionsListElement.appendChild(sessionElement);
    });
}

// Data Management
function initDataManagement() {
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    const importFileInput = document.getElementById('import-file-input');
    
    // Export data
    exportDataBtn.addEventListener('click', () => {
        const data = {
            tasks,
            sessions,
            notes,
            streakData,
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileName = `studyfocus_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
    });
    
    // Import data
    importDataBtn.addEventListener('click', () => {
        importFileInput.click();
    });
    
    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Validate data
                if (!data.tasks || !data.sessions || !data.version) {
                    throw new Error('Invalid data format');
                }
                
                // Import data
                tasks = data.tasks || [];
                sessions = data.sessions || [];
                notes = data.notes || [];
                streakData = data.streakData || {
                    currentStreak: 0,
                    lastStudyDate: null,
                    studyDays: []
                };
                
                // Update UI
                renderTasks();
                renderNotes();
                updateAnalytics();
                updateStreakDisplay();
                
                // Save data
                saveData();
                
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    });
    
    // Clear data
    clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            tasks = [];
            sessions = [];
            notes = [];
            streakData = {
                currentStreak: 0,
                lastStudyDate: null,
                studyDays: []
            };
            
            // Update UI
            renderTasks();
            renderNotes();
            updateAnalytics();
            updateStreakDisplay();
            
            // Clear active note
            activeNote = null;
            document.getElementById('note-title').value = '';
            document.getElementById('note-content').value = '';
            document.getElementById('save-note-btn').disabled = true;
            document.getElementById('delete-note-btn').disabled = true;
            
            // Save data
            localStorage.clear();
            
            alert('All data has been cleared.');
        }
    });
}

function saveData() {
    localStorage.setItem('studyTasks', JSON.stringify(tasks));
    localStorage.setItem('studySessions', JSON.stringify(sessions));
    localStorage.setItem('studyNotes', JSON.stringify(notes));
    localStorage.setItem('streakData', JSON.stringify(streakData));
}

function loadSavedData() {
    // Load tasks, sessions, and notes
    const savedTasks = localStorage.getItem('studyTasks');
    const savedSessions = localStorage.getItem('studySessions');
    const savedNotes = localStorage.getItem('studyNotes');
    const savedStreakData = localStorage.getItem('streakData');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
    
    if (savedSessions) {
        sessions = JSON.parse(savedSessions);
    }
    
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        renderNotes();
    }
    
    if (savedStreakData) {
        streakData = JSON.parse(savedStreakData);
        updateStreakDisplay();
    }
    
    // Load theme settings
    const savedTheme = localStorage.getItem('studyTheme');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedCustomColor = localStorage.getItem('customColor');
    const savedSound = localStorage.getItem('selectedSound');
    const savedVolume = localStorage.getItem('soundVolume');
    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    const savedFocusModeMessage = localStorage.getItem('focusModeMessage');
    const savedAutoFocusMode = localStorage.getItem('autoFocusMode');
    
    if (savedTheme) {
        setActiveTheme(savedTheme);
        
        // Update theme option buttons
        document.querySelectorAll('.theme-option').forEach(option => {
            const theme = option.getAttribute('data-theme');
            if (theme === savedTheme) {
                option.classList.add('active');
                
                // Show custom color picker if needed
                if (theme === 'custom') {
                    document.getElementById('custom-color-picker').classList.remove('hidden');
                }
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    if (savedDarkMode === 'true') {
        setDarkMode(true);
    }
    
    if (savedCustomColor && savedTheme === 'custom') {
        document.getElementById('color-picker').value = savedCustomColor;
        document.getElementById('color-hex').value = savedCustomColor;
        document.getElementById('custom-color-preview').style.backgroundColor = savedCustomColor;
        setCustomColor(savedCustomColor);
    }
    
    if (savedSound) {
        selectedSound = savedSound;
        document.getElementById('notification-sound-select').value = savedSound;
    }
    
    if (savedVolume) {
        soundVolume = parseInt(savedVolume);
        document.getElementById('volume-control').value = soundVolume;
    }
    
    if (savedSoundEnabled) {
        soundEnabled = savedSoundEnabled === 'true';
        updateSoundToggle();
    }
    
    if (savedFocusModeMessage) {
        document.getElementById('focus-mode-message').value = savedFocusModeMessage;
        document.getElementById('focus-mode-overlay-message').textContent = savedFocusModeMessage;
    }
    
    if (savedAutoFocusMode) {
        document.getElementById('auto-focus-mode').checked = savedAutoFocusMode === 'true';
    }
    
    // Update analytics
    updateAnalytics();
}

// Declare lucide variable
const lucide = window.lucide;
