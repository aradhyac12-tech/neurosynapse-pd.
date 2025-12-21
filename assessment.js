// ==================== GLOBAL STATE ====================

const APP_STATE = {
    patient: null,
    tests: {
        voice: { completed: false, scores: [] },
        tremor: { completed: false, scores: {} },
        gait: { completed: false, scores: {} },
        facial: { completed: false, scores: {} },
        questions: { completed: false, scores: {} },
        spiral: { completed: false, scores: {} }
    },
    currentLanguage: 'en',
    voiceEnabled: false,
    currentVoiceTrial: 1,
    currentTremorHand: null,
    audioRecorder: null,
    mediaStream: null
};

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    initializeSplashScreen();
    setupEventListeners();
    loadLocalStorage();
    translatePage();
});

function initializeSplashScreen() {
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';
    }, 6000);
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-view]').forEach(el => {
        if (el.tagName === 'A' || el.classList.contains('nav-item')) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const view = el.getAttribute('data-view');
                if (view) showView(view);
                closeSidebar();
            });
        }
    });

    // Buttons with data-view
    document.querySelectorAll('[onclick*="showView"]').forEach(btn => {
        btn.addEventListener('click', closeSidebar);
    });

    // Language selector
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });

    // Voice toggle
    document.getElementById('voiceToggle').addEventListener('click', toggleVoice);

    // Hamburger menu
    document.getElementById('hamburgerMenu').addEventListener('click', openSidebar);
    document.getElementById('closeMenu').addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

    // Patient form
    document.getElementById('patientForm').addEventListener('submit', savePatient);
    document.getElementById('dob').addEventListener('change', validateAge);
}

// ==================== NAVIGATION ====================

function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Show selected view
    const view = document.getElementById(viewName + 'View');
    if (view) {
        view.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        }
    });
}

function openSidebar() {
    document.getElementById('sidebar').classList.add('active');
    document.getElementById('sidebarOverlay').classList.add('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// ==================== PATIENT MANAGEMENT ====================

function validateAge() {
    const dob = new Date(document.getElementById('dob').value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    const error = document.getElementById('ageError');
    if (age < 18) {
        error.style.display = 'block';
        return false;
    } else {
        error.style.display = 'none';
        return true;
    }
}

function savePatient(e) {
    e.preventDefault();

    if (!validateAge()) {
        alert('Must be 18 or older');
        return;
    }

    const patient = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        countryCode: document.getElementById('countryCode').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        medicalId: document.getElementById('medicalId').value
    };

    APP_STATE.patient = patient;
    saveLocalStorage();
    updateDashboard();
    showView('dashboard');
    alert('✓ Patient Profile Saved! Screening tests unlocked!');
}

function updateDashboard() {
    if (APP_STATE.patient) {
        document.getElementById('patientStatusText').textContent = `✓ ${APP_STATE.patient.firstName} ${APP_STATE.patient.lastName}`;
        
        // Unlock all tests
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            const view = item.getAttribute('data-view');
            if (['voice', 'tremor', 'gait', 'facial', 'questions', 'spiral'].includes(view)) {
                item.classList.remove('disabled');
                item.querySelector('.badge')?.remove();
            }
        });

        document.getElementById('testsBtn').disabled = false;
        document.getElementById('testsBtn').textContent = 'Start Screening';
    }

    // Update test count
    const completedCount = Object.values(APP_STATE.tests).filter(t => t.completed).length;
    document.getElementById('testCount').textContent = `${completedCount}/6`;

    if (completedCount === 6) {
        document.getElementById('reportBtn').disabled = false;
    }
}

// ==================== VOICE TEST ====================

function startVoiceRecording() {
    if (APP_STATE.currentVoiceTrial > 3) {
        completeVoiceTest();
        return;
    }

    document.getElementById('voiceButtons').style.display = 'none';
    document.getElementById('voiceCountdown').style.display = 'block';

    startCountdown('voice', 3, () => {
        recordVoiceTrial();
    });
}

function recordVoiceTrial() {
    document.getElementById('voiceCountdown').style.display = 'none';
    document.getElementById('voiceRecording').style.display = 'flex';

    const duration = 6;
    let remaining = duration;

    const timer = setInterval(() => {
        document.getElementById('voiceRecordingTimer').textContent = remaining;
        remaining--;

        if (remaining < 0) {
            clearInterval(timer);
            finishVoiceTrial();
        }
    }, 1000);
}

function finishVoiceTrial() {
    document.getElementById('voiceRecording').style.display = 'none';
    
    // Generate fake metrics
    const metrics = {
        jitter: (Math.random() * 1.5 + 0.5).toFixed(2) + '%',
        shimmer: (Math.random() * 0.7 + 0.3).toFixed(2) + ' dB',
        hnr: (Math.random() * 15 + 18).toFixed(1) + ' dB',
        f0: (Math.random() * 100 + 150).toFixed(0) + ' Hz'
    };

    document.getElementById('jitterVal').textContent = metrics.jitter;
    document.getElementById('shimmerVal').textContent = metrics.shimmer;
    document.getElementById('hnrVal').textContent = metrics.hnr;
    document.getElementById('f0Val').textContent = metrics.f0;

    APP_STATE.tests.voice.scores.push(metrics);

    // Update trial indicator
    const indicator = document.getElementById('trial' + APP_STATE.currentVoiceTrial + 'Indicator');
    if (indicator) {
        indicator.classList.add('completed');
    }

    document.getElementById('voiceMetrics').style.display = 'block';
    document.getElementById('voiceButtons').style.display = 'flex';

    if (APP_STATE.currentVoiceTrial < 3) {
        document.getElementById('voiceStartBtn').style.display = 'none';
        document.getElementById('voiceNextBtn').style.display = 'block';
        APP_STATE.currentVoiceTrial++;
    } else {
        document.getElementById('voiceCompleteBtn').style.display = 'block';
    }
}

function nextVoiceTrial() {
    document.getElementById('voiceMetrics').style.display = 'none';
    document.getElementById('voiceStartBtn').style.display = 'block';
    document.getElementById('voiceNextBtn').style.display = 'none';
    startVoiceRecording();
}

function completeVoiceTest() {
    APP_STATE.tests.voice.completed = true;
    saveLocalStorage();
    updateDashboard();
    showView('tremor');
    alert('✓ Speech test completed!');
}

// ==================== TREMOR TEST ====================

function selectTremorHand(hand) {
    APP_STATE.currentTremorHand = hand;
    
    // Update buttons
    document.querySelectorAll('[onclick*="selectTremorHand"]').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    document.getElementById('tremorHandSelect').style.display = 'none';
    document.getElementById('tremorCountdown').style.display = 'block';

    startCountdown('tremor', 3, () => {
        recordTremorData();
    });
}

function recordTremorData() {
    document.getElementById('tremorCountdown').style.display = 'none';
    document.getElementById('tremorRecording').style.display = 'block';

    const hand = APP_STATE.currentTremorHand;
    document.getElementById('tremorHandDisplay').textContent = hand === 'left' ? '👈' : '👉';

    const duration = 10;
    let remaining = duration;

    const timer = setInterval(() => {
        document.getElementById('tremorRecordingTimer').textContent = remaining;
        remaining--;

        if (remaining < 0) {
            clearInterval(timer);
            finishTremorData(hand);
        }
    }, 1000);
}

function finishTremorData(hand) {
    document.getElementById('tremorRecording').style.display = 'none';

    const metrics = {
        frequency: (Math.random() * 3 + 4).toFixed(1) + ' Hz',
        amplitude: (Math.random() * 2 + 0.5).toFixed(2) + ' m/s²',
        power: (Math.random() * 10 + 5).toFixed(1) + ' dB'
    };

    document.getElementById('freqVal').textContent = metrics.frequency;
    document.getElementById('ampVal').textContent = metrics.amplitude;
    document.getElementById('powVal').textContent = metrics.power;

    APP_STATE.tests.tremor.scores[hand] = metrics;

    const handIndicator = hand === 'left' ? 'tremorLeftIndicator' : 'tremorRightIndicator';
    const indicator = document.getElementById(handIndicator);
    if (indicator) {
        indicator.classList.add('completed');
    }

    document.getElementById('tremorMetrics').style.display = 'block';

    if (!APP_STATE.tests.tremor.scores.right || !APP_STATE.tests.tremor.scores.left) {
        document.getElementById('tremorHandSelect').style.display = 'block';
        document.getElementById('tremorCompleteBtn').style.display = 'none';
    } else {
        document.getElementById('tremorCompleteBtn').style.display = 'block';
    }
}

function completeTremorTest() {
    APP_STATE.tests.tremor.completed = true;
    saveLocalStorage();
    updateDashboard();
    showView('gait');
    alert('✓ Tremor test completed!');
}

// ==================== GAIT TEST ====================

function startGaitTest() {
    requestCameraPermission(() => {
        document.getElementById('gaitButton').style.display = 'none';
        document.getElementById('gaitCountdown').style.display = 'block';

        startCountdown('gait', 3, () => {
            recordGaitData();
        });
    });
}

function recordGaitData() {
    document.getElementById('gaitCountdown').style.display = 'none';
    document.getElementById('gaitRecording').style.display = 'block';

    const duration = 15;
    let remaining = duration;

    const timer = setInterval(() => {
        document.getElementById('gaitRecordingTimer').textContent = remaining;
        remaining--;

        if (remaining < 0) {
            clearInterval(timer);
            finishGaitData();
        }
    }, 1000);
}

function finishGaitData() {
    document.getElementById('gaitRecording').style.display = 'none';

    const metrics = {
        cadence: (Math.random() * 30 + 100).toFixed(0) + ' steps/min',
        strideLength: (Math.random() * 0.3 + 0.6).toFixed(2) + ' m',
        speed: (Math.random() * 0.4 + 1.0).toFixed(2) + ' m/s'
    };

    document.getElementById('cadVal').textContent = metrics.cadence;
    document.getElementById('strVal').textContent = metrics.strideLength;
    document.getElementById('spdVal').textContent = metrics.speed;

    APP_STATE.tests.gait.scores = metrics;
    document.getElementById('gaitMetrics').style.display = 'block';
    document.getElementById('gaitCompleteBtn').style.display = 'block';
}

function completeGaitTest() {
    APP_STATE.tests.gait.completed = true;
    saveLocalStorage();
    updateDashboard();
    showView('facial');
    alert('✓ Gait test completed!');
}

// ==================== FACIAL TEST ====================

function startFacialTest() {
    requestCameraPermission(() => {
        document.getElementById('facialButton').style.display = 'none';
        document.getElementById('facialCountdown').style.display = 'block';

        startCountdown('facial', 3, () => {
            recordFacialData();
        });
    });
}

function recordFacialData() {
    document.getElementById('facialCountdown').style.display = 'none';
    document.getElementById('facialRecording').style.display = 'block';

    const duration = 10;
    let remaining = duration;

    const timer = setInterval(() => {
        document.getElementById('facialRecordingTimer').textContent = remaining;
        remaining--;

        if (remaining < 0) {
            clearInterval(timer);
            finishFacialData();
        }
    }, 1000);
}

function finishFacialData() {
    document.getElementById('facialRecording').style.display = 'none';

    const metrics = {
        blinkRate: (Math.random() * 10 + 15).toFixed(0) + '/min',
        jawOpening: (Math.random() * 2 + 1.5).toFixed(1) + ' cm',
        mouthWidth: (Math.random() * 3 + 3).toFixed(1) + ' cm'
    };

    document.getElementById('blkVal').textContent = metrics.blinkRate;
    document.getElementById('jawVal').textContent = metrics.jawOpening;
    document.getElementById('mthVal').textContent = metrics.mouthWidth;

    APP_STATE.tests.facial.scores = metrics;
    document.getElementById('facialMetrics').style.display = 'block';
    document.getElementById('facialCompleteBtn').style.display = 'block';
}

function completeFacialTest() {
    APP_STATE.tests.facial.completed = true;
    saveLocalStorage();
    updateDashboard();
    showView('questions');
    alert('✓ Facial test completed!');
}

// ==================== QUESTIONS ====================

function submitQuestions(e) {
    e.preventDefault();

    const q1 = document.querySelector('input[name="q1"]:checked')?.value;
    const q2 = document.querySelector('input[name="q2"]:checked')?.value;
    const q3 = document.querySelector('input[name="q3"]:checked')?.value;

    if (!q1 || !q2 || !q3) {
        alert('Please answer all questions');
        return;
    }

    APP_STATE.tests.questions.completed = true;
    APP_STATE.tests.questions.scores = { q1, q2, q3 };
    saveLocalStorage();
    updateDashboard();
    showView('spiral');
    alert('✓ Questions completed!');
}

// ==================== SPIRAL TEST ====================

let spiralCanvas, spiralCtx, isDrawing = false;
let spiralPoints = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeSpiral();
});

function initializeSpiral() {
    spiralCanvas = document.getElementById('spiralCanvas');
    if (!spiralCanvas) return;
    
    spiralCtx = spiralCanvas.getContext('2d');
    drawReferenceSpiral();

    spiralCanvas.addEventListener('mousedown', startSpiral);
    spiralCanvas.addEventListener('mousemove', drawSpiral);
    spiralCanvas.addEventListener('mouseup', endSpiral);
    spiralCanvas.addEventListener('mouseout', endSpiral);

    spiralCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        spiralCanvas.dispatchEvent(mouseEvent);
    });

    spiralCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        spiralCanvas.dispatchEvent(mouseEvent);
    });

    spiralCanvas.addEventListener('touchend', endSpiral);
}

function drawReferenceSpiral() {
    const ref = document.getElementById('referenceSpiral');
    if (!ref) return;
    
    const ctx = ref.getContext('2d');
    ctx.clearRect(0, 0, ref.width, ref.height);
    
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const centerX = ref.width / 2;
    const centerY = ref.height / 2;

    for (let angle = 0; angle < Math.PI * 6; angle += 0.05) {
        const radius = angle * 10;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();
}

function startSpiral(e) {
    isDrawing = true;
    spiralPoints = [];
    const rect = spiralCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spiralPoints.push({ x, y });
    spiralCtx.clearRect(0, 0, spiralCanvas.width, spiralCanvas.height);
}

function drawSpiral(e) {
    if (!isDrawing) return;

    const rect = spiralCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spiralPoints.push({ x, y });

    spiralCtx.clearRect(0, 0, spiralCanvas.width, spiralCanvas.height);
    spiralCtx.strokeStyle = '#10b981';
    spiralCtx.lineWidth = 2;
    spiralCtx.lineCap = 'round';
    spiralCtx.lineJoin = 'round';

    spiralCtx.beginPath();
    spiralCtx.moveTo(spiralPoints[0].x, spiralPoints[0].y);
    for (let i = 1; i < spiralPoints.length; i++) {
        spiralCtx.lineTo(spiralPoints[i].x, spiralPoints[i].y);
    }
    spiralCtx.stroke();
}

function endSpiral() {
    isDrawing = false;
}

function clearSpiral() {
    spiralPoints = [];
    spiralCtx.clearRect(0, 0, spiralCanvas.width, spiralCanvas.height);
}

function completeSpiral Test() {
    if (spiralPoints.length === 0) {
        alert('Please draw a spiral first');
        return;
    }

    // Calculate metrics
    let totalDistance = 0;
    for (let i = 1; i < spiralPoints.length; i++) {
        const dx = spiralPoints[i].x - spiralPoints[i-1].x;
        const dy = spiralPoints[i].y - spiralPoints[i-1].y;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
    }

    const metrics = {
        tremorIndex: (Math.random() * 2 + 1).toFixed(2),
        pathLength: totalDistance.toFixed(0) + ' px',
        velocity: (totalDistance / spiralPoints.length).toFixed(2) + ' px/step'
    };

    document.getElementById('treIdxVal').textContent = metrics.tremorIndex;
    document.getElementById('pathVal').textContent = metrics.pathLength;
    document.getElementById('velVal').textContent = metrics.velocity;

    APP_STATE.tests.spiral.completed = true;
    APP_STATE.tests.spiral.scores = metrics;
    saveLocalStorage();
    updateDashboard();
    showView('results');
    alert('✓ Spiral test completed!');
}

// ==================== TIMER & COUNTDOWN ====================

function startCountdown(testType, seconds, callback) {
    let remaining = seconds;
    const timerId = testType + 'CountdownTimer';

    const timer = setInterval(() => {
        document.getElementById(timerId).textContent = remaining;
        remaining--;

        if (remaining < 0) {
            clearInterval(timer);
            callback();
        }
    }, 1000);
}

// ==================== CAMERA PERMISSION ====================

function requestCameraPermission(callback) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            APP_STATE.mediaStream = stream;
            stream.getTracks().forEach(track => track.stop());
            callback();
        })
        .catch(err => {
            console.error('Camera permission denied:', err);
            alert('Camera permission denied. Proceeding with simulated data.');
            callback();
        });
}

// ==================== VOICE CONTROL ====================

function toggleVoice() {
    APP_STATE.voiceEnabled = !APP_STATE.voiceEnabled;
    const btn = document.getElementById('voiceToggle');
    if (APP_STATE.voiceEnabled) {
        btn.classList.add('active');
        speakText('Voice enabled');
    } else {
        btn.classList.remove('active');
    }
}

function speakText(text) {
    if (!APP_STATE.voiceEnabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = APP_STATE.currentLanguage === 'en' ? 'en-US' : 
                     APP_STATE.currentLanguage === 'hi' ? 'hi-IN' : 'ru-RU';
    speechSynthesis.speak(utterance);
}

// ==================== LANGUAGE & LOCALIZATION ====================

function changeLanguage(lang) {
    APP_STATE.currentLanguage = lang;
    saveLocalStorage();
    translatePage();
    speakText('Language changed');
}

function translatePage() {
    document.documentElement.lang = APP_STATE.currentLanguage;
    // Translation logic will be in language.js
}

// ==================== LOCAL STORAGE ====================

function saveLocalStorage() {
    localStorage.setItem('neuroPDState', JSON.stringify(APP_STATE));
}

function loadLocalStorage() {
    const saved = localStorage.getItem('neuroPDState');
    if (saved) {
        const state = JSON.parse(saved);
        Object.assign(APP_STATE, state);
        document.getElementById('languageSelector').value = APP_STATE.currentLanguage;
        if (APP_STATE.patient) {
            updateDashboard();
        }
    }
}

// ==================== PDF EXPORT ====================

function downloadPDF() {
    const element = document.getElementById('reportView');
    const opt = {
        margin: 10,
        filename: 'NeuroCompass_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element).save();
}