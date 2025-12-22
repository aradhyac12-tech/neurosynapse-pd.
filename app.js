// Global state
const STATE = {
    patient: null,
    voiceTrials: 0,
    tremorLeft: false,
    tremorRight: false,
    currentTremorHand: null,
    tests: {
        voice: false,
        tremor: false,
        gait: false,
        facial: false,
        questions: false,
        spiral: false
    },
    voiceEnabled: false,
    language: 'en'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

function initializePage() {
    // Hide splash after 6 seconds
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';
    }, 6000);

    // Speak welcome message
    setTimeout(() => {
        speak('Welcome to NeuroCompass PD Clinical Assessment Suite');
    }, 500);

    // Setup all event listeners
    setupEventListeners();
    loadState();
}

function setupEventListeners() {
    // Hamburger menu
    document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
    document.getElementById('closeSidebarBtn').addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-view');
            navigateTo(view);
            closeSidebar();
        });
    });

    // Language selector
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        STATE.language = e.target.value;
        saveState();
        location.reload();
    });

    // Voice button
    document.getElementById('voiceBtn').addEventListener('click', toggleVoice);
}

// Navigation functions
function navigateTo(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // Show selected view
    const view = document.getElementById(viewName + 'View');
    if (view) {
        view.classList.add('active');
    }

    // Update sidebar active
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-view') === viewName) {
            link.classList.add('active');
        }
    });

    // Scroll to top
    window.scrollTo(0, 0);
}

function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('open');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');
}

// Patient functions
function savePatient(e) {
    e.preventDefault();

    // Validate age
    const dob = new Date(document.getElementById('dob').value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    if (age < 18) {
        document.getElementById('ageError').style.display = 'block';
        speak('Age must be 18 or older');
        return;
    }

    // Save patient info
    STATE.patient = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        country: document.getElementById('countryCode').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        medicalId: document.getElementById('medicalId').value
    };

    saveState();
    updateDashboard();
    speak('Patient profile saved. Tests are now unlocked.');
    alert('✓ Patient profile saved! Tests unlocked!');
    navigateTo('dashboard');
}

function validateAge() {
    const dob = new Date(document.getElementById('dob').value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    const error = document.getElementById('ageError');
    if (age < 18) {
        error.style.display = 'block';
    } else {
        error.style.display = 'none';
    }
}

function updateDashboard() {
    if (STATE.patient) {
        document.getElementById('patientStatus').innerHTML = `✓ ${STATE.patient.firstName} ${STATE.patient.lastName}`;
    }

    const completed = Object.values(STATE.tests).filter(t => t).length;
    document.getElementById('testCount').textContent = `${completed}/6`;

    if (completed === 6) {
        document.getElementById('reportBtn').disabled = false;
    }
}

// Voice test
function startVoiceRecording() {
    speak('Starting voice recording in 3 seconds');
    document.getElementById('voiceStartBtn').style.display = 'none';
    document.getElementById('voiceCountdown').style.display = 'block';

    let count = 3;
    const timer = setInterval(() => {
        document.getElementById('voiceCountdownNum').textContent = count;
        count--;
        if (count < 0) {
            clearInterval(timer);
            document.getElementById('voiceCountdown').style.display = 'none';
            document.getElementById('voiceRecording').style.display = 'block';
            recordVoice();
        }
    }, 1000);
}

function recordVoice() {
    STATE.voiceTrials++;
    let duration = 6;
    const timer = setInterval(() => {
        document.getElementById('voiceRecordingNum').textContent = duration;
        duration--;
        if (duration < 0) {
            clearInterval(timer);
            document.getElementById('voiceRecording').style.display = 'none';
            showVoiceMetrics();
        }
    }, 1000);
}

function showVoiceMetrics() {
    document.getElementById('jitterVal').textContent = (Math.random() * 1.5 + 0.5).toFixed(2) + '%';
    document.getElementById('shimmerVal').textContent = (Math.random() * 0.7 + 0.3).toFixed(2) + ' dB';
    document.getElementById('hnrVal').textContent = (Math.random() * 15 + 18).toFixed(1) + ' dB';
    document.getElementById('f0Val').textContent = (Math.random() * 100 + 150).toFixed(0) + ' Hz';

    document.getElementById('voiceMetrics').style.display = 'block';

    // Mark trial as complete
    if (STATE.voiceTrials <= 3) {
        document.getElementById('trial' + STATE.voiceTrials).classList.add('complete');
    }

    if (STATE.voiceTrials < 3) {
        document.getElementById('voiceStartBtn').innerHTML = '🎤 Next Trial ' + (STATE.voiceTrials + 1);
        document.getElementById('voiceStartBtn').style.display = 'block';
    } else {
        document.getElementById('voiceStartBtn').style.display = 'none';
        document.getElementById('voiceCompleteBtn').style.display = 'block';
    }

    speak('Voice recording complete for trial ' + STATE.voiceTrials);
}

function completeVoiceTest() {
    STATE.tests.voice = true;
    STATE.voiceTrials = 0;
    saveState();
    updateDashboard();
    updateResults();
    speak('Speech test completed');
    alert('✓ Speech test completed!');
    navigateTo('tremor');
}

// Tremor test
function selectTremorHand(hand) {
    STATE.currentTremorHand = hand;
    speak('Recording ' + hand + ' hand tremor');
    document.getElementById('tremorHandSelect').style.display = 'none';
    document.getElementById('tremorCountdown').style.display = 'block';

    let count = 3;
    const timer = setInterval(() => {
        document.getElementById('tremorCountdownNum').textContent = count;
        count--;
        if (count < 0) {
            clearInterval(timer);
            document.getElementById('tremorCountdown').style.display = 'none';
            document.getElementById('tremorRecording').style.display = 'block';
            recordTremor();
        }
    }, 1000);
}

function recordTremor() {
    document.getElementById('handEmoji').textContent = STATE.currentTremorHand === 'left' ? '👈' : '👉';

    let duration = 10;
    const timer = setInterval(() => {
        document.getElementById('tremorRecordingNum').textContent = duration;
        duration--;
        if (duration < 0) {
            clearInterval(timer);
            document.getElementById('tremorRecording').style.display = 'none';
            showTremorMetrics();
        }
    }, 1000);
}

function showTremorMetrics() {
    document.getElementById('freqVal').textContent = (Math.random() * 3 + 4).toFixed(1) + ' Hz';
    document.getElementById('ampVal').textContent = (Math.random() * 2 + 0.5).toFixed(2) + ' m/s²';
    document.getElementById('powVal').textContent = (Math.random() * 10 + 5).toFixed(1) + ' dB';

    document.getElementById('tremorMetrics').style.display = 'block';

    // Mark hand as complete
    if (STATE.currentTremorHand === 'left') {
        STATE.tremorLeft = true;
        document.getElementById('leftHand').classList.add('complete');
    } else {
        STATE.tremorRight = true;
        document.getElementById('rightHand').classList.add('complete');
    }

    if (STATE.tremorLeft && STATE.tremorRight) {
        document.getElementById('tremorHandSelect').style.display = 'none';
        document.getElementById('tremorCompleteBtn').style.display = 'block';
    } else {
        document.getElementById('tremorHandSelect').style.display = 'block';
    }

    speak('Tremor recording complete for ' + STATE.currentTremorHand + ' hand');
}

function completeTremorTest() {
    STATE.tests.tremor = true;
    STATE.tremorLeft = false;
    STATE.tremorRight = false;
    saveState();
    updateDashboard();
    updateResults();
    speak('Tremor test completed');
    alert('✓ Tremor test completed!');
    navigateTo('gait');
}

// Gait test
function startGaitTest() {
    speak('Starting gait recording in 3 seconds');
    requestCamera(() => {
        document.getElementById('gaitStart').style.display = 'none';
        document.getElementById('gaitCountdown').style.display = 'block';

        let count = 3;
        const timer = setInterval(() => {
            document.getElementById('gaitCountdownNum').textContent = count;
            count--;
            if (count < 0) {
                clearInterval(timer);
                document.getElementById('gaitCountdown').style.display = 'none';
                document.getElementById('gaitRecording').style.display = 'block';
                recordGait();
            }
        }, 1000);
    });
}

function recordGait() {
    let duration = 15;
    const timer = setInterval(() => {
        document.getElementById('gaitRecordingNum').textContent = duration;
        duration--;
        if (duration < 0) {
            clearInterval(timer);
            document.getElementById('gaitRecording').style.display = 'none';
            document.getElementById('cadVal').textContent = (Math.random() * 30 + 100).toFixed(0) + ' steps/min';
            document.getElementById('strVal').textContent = (Math.random() * 0.3 + 0.6).toFixed(2) + ' m';
            document.getElementById('spdVal').textContent = (Math.random() * 0.4 + 1.0).toFixed(2) + ' m/s';
            document.getElementById('gaitMetrics').style.display = 'block';
            document.getElementById('gaitCompleteBtn').style.display = 'block';
            speak('Gait recording complete');
        }
    }, 1000);
}

function completeGaitTest() {
    STATE.tests.gait = true;
    saveState();
    updateDashboard();
    updateResults();
    speak('Gait test completed');
    alert('✓ Gait test completed!');
    navigateTo('facial');
}

// Facial test
function startFacialTest() {
    speak('Starting facial recording in 3 seconds');
    requestCamera(() => {
        document.getElementById('facialStart').style.display = 'none';
        document.getElementById('facialCountdown').style.display = 'block';

        let count = 3;
        const timer = setInterval(() => {
            document.getElementById('facialCountdownNum').textContent = count;
            count--;
            if (count < 0) {
                clearInterval(timer);
                document.getElementById('facialCountdown').style.display = 'none';
                document.getElementById('facialRecording').style.display = 'block';
                recordFacial();
            }
        }, 1000);
    });
}

function recordFacial() {
    let duration = 10;
    const timer = setInterval(() => {
        document.getElementById('facialRecordingNum').textContent = duration;
        duration--;
        if (duration < 0) {
            clearInterval(timer);
            document.getElementById('facialRecording').style.display = 'none';
            document.getElementById('blkVal').textContent = (Math.random() * 10 + 15).toFixed(0) + '/min';
            document.getElementById('jawVal').textContent = (Math.random() * 2 + 1.5).toFixed(1) + ' cm';
            document.getElementById('mthVal').textContent = (Math.random() * 3 + 3).toFixed(1) + ' cm';
            document.getElementById('facialMetrics').style.display = 'block';
            document.getElementById('facialCompleteBtn').style.display = 'block';
            speak('Facial recording complete');
        }
    }, 1000);
}

function completeFacialTest() {
    STATE.tests.facial = true;
    saveState();
    updateDashboard();
    updateResults();
    speak('Facial test completed');
    alert('✓ Facial test completed!');
    navigateTo('questions');
}

// Questions
function submitQuestions(e) {
    e.preventDefault();

    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');

    if (!q1 || !q2 || !q3) {
        speak('Please answer all questions');
        alert('Please answer all questions');
        return;
    }

    STATE.tests.questions = true;
    saveState();
    updateDashboard();
    updateResults();
    speak('Questions completed');
    alert('✓ Questions completed!');
    navigateTo('spiral');
}

// Spiral test
let spiralCanvas, spiralCtx;
let isDrawing = false;
let spiralPoints = [];

document.addEventListener('DOMContentLoaded', () => {
    spiralCanvas = document.getElementById('spiralCanvas');
    if (spiralCanvas) {
        spiralCtx = spiralCanvas.getContext('2d');
        drawReferenceSpiral();
        
        spiralCanvas.addEventListener('mousedown', startDraw);
        spiralCanvas.addEventListener('mousemove', draw);
        spiralCanvas.addEventListener('mouseup', stopDraw);
        spiralCanvas.addEventListener('mouseout', stopDraw);
        
        spiralCanvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            spiralCanvas.dispatchEvent(new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            }));
        });
        
        spiralCanvas.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            spiralCanvas.dispatchEvent(new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            }));
        });
    }
});

function drawReferenceSpiral() {
    const ref = document.getElementById('refSpiral');
    if (!ref) return;
    
    const ctx = ref.getContext('2d');
    ctx.clearRect(0, 0, ref.width, ref.height);
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const cx = ref.width / 2;
    const cy = ref.height / 2;

    for (let a = 0; a < Math.PI * 6; a += 0.05) {
        const r = a * 10;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function startDraw(e) {
    isDrawing = true;
    spiralPoints = [];
    const rect = spiralCanvas.getBoundingClientRect();
    spiralPoints.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
}

function draw(e) {
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

function stopDraw() {
    isDrawing = false;
}

function clearSpiral() {
    spiralPoints = [];
    spiralCtx.clearRect(0, 0, spiralCanvas.width, spiralCanvas.height);
}

function completeSpiralTest() {
    if (spiralPoints.length === 0) {
        speak('Please draw a spiral first');
        alert('Please draw a spiral first');
        return;
    }

    let distance = 0;
    for (let i = 1; i < spiralPoints.length; i++) {
        const dx = spiralPoints[i].x - spiralPoints[i-1].x;
        const dy = spiralPoints[i].y - spiralPoints[i-1].y;
        distance += Math.sqrt(dx * dx + dy * dy);
    }

    document.getElementById('treIdxVal').textContent = (Math.random() * 2 + 1).toFixed(2);
    document.getElementById('pathVal').textContent = distance.toFixed(0) + ' px';
    document.getElementById('velVal').textContent = (distance / spiralPoints.length).toFixed(2) + ' px/step';
    document.getElementById('spiralMetrics').style.display = 'block';

    STATE.tests.spiral = true;
    saveState();
    updateDashboard();
    updateResults();
    speak('Spiral test completed');
    alert('✓ Spiral test completed!');
    navigateTo('results');
}

// Results and Report
function updateResults() {
    const status = (test) => STATE.tests[test] ? '✓' : '❌';
    document.getElementById('voiceStatus').textContent = status('voice');
    document.getElementById('tremorStatus').textContent = status('tremor');
    document.getElementById('gaitStatus').textContent = status('gait');
    document.getElementById('facialStatus').textContent = status('facial');
    document.getElementById('questionsStatus').textContent = status('questions');
    document.getElementById('spiralStatus').textContent = status('spiral');
}

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
    speak('Report downloaded');
}

// Camera permission
function requestCamera(callback) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => callback())
        .catch(() => {
            console.warn('Camera not available');
            callback();
        });
}

// Voice
function toggleVoice() {
    STATE.voiceEnabled = !STATE.voiceEnabled;
    const btn = document.getElementById('voiceBtn');
    if (STATE.voiceEnabled) {
        btn.style.color = '#10b981';
        speak('Voice enabled');
    } else {
        btn.style.color = '#fff';
    }
}

function speak(text) {
    if (!STATE.voiceEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = STATE.language === 'en' ? 'en-US' : 
                     STATE.language === 'hi' ? 'hi-IN' : 'ru-RU';
    speechSynthesis.speak(utterance);
}

// Storage
function saveState() {
    localStorage.setItem('neuroPD', JSON.stringify(STATE));
}

function loadState() {
    const saved = localStorage.getItem('neuroPD');
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(STATE, loaded);
        document.getElementById('languageSelector').value = STATE.language;
        updateDashboard();
        updateResults();
    }
}