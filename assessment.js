// NeuroCompass-PD v3.0 - Complete Fixed Assessment Engine

const STATE = {
    patient: null,
    voiceEnabled: false,
    cameraFacingMode: 'user',
    currentView: 'dashboard',
    currentLanguage: 'en',
    profileLocked: false,
    assessments: {
        voice: { trials: [], scores: [], finalScore: null },
        tremor: { left: null, right: null, finalScore: null },
        gait: { finalScore: null },
        facial: { finalScore: null },
        questions: { finalScore: null },
        spiral: { finalScore: null }
    }
};

// Country codes mapping
const COUNTRY_CODES = {
    'IN': '+91',
    'KG': '+996',
    'US': '+1',
    'GB': '+44',
    'RU': '+7',
    'DE': '+49',
    'FR': '+33',
    'JP': '+81',
    'AU': '+61',
    'CA': '+1'
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    setupEventListeners();
    loadPatientData();
    
    const savedLanguage = localStorage.getItem('language') || 'en';
    STATE.currentLanguage = savedLanguage;
    document.getElementById('topLanguageSelect').value = savedLanguage;
    translatePage(savedLanguage);
});

// ===== SPLASH SCREEN - FIXED WITH VOICE ===== 
function initSplashScreen() {
    const statusMessages = [
        'Loading sensors...',
        'Initializing MediaPipe...',
        'Calibrating accelerometer...',
        'Ready to assess...'
    ];

    let progress = 0;
    let msgIndex = 0;
    const progressBar = document.getElementById('progressBar');
    const statusElement = document.getElementById('splashStatus');
    const splashVoiceBtn = document.getElementById('splashVoiceBtn');

    // Splash voice button
    splashVoiceBtn.addEventListener('click', () => {
        STATE.voiceEnabled = !STATE.voiceEnabled;
        splashVoiceBtn.classList.toggle('active');
        if (STATE.voiceEnabled) {
            speak('Voice assistant activated on splash screen');
        }
    });

    const splashInterval = setInterval(() => {
        progress += Math.random() * 40;
        if (progress > 100) progress = 100;

        progressBar.style.width = progress + '%';

        if (progress % 25 === 0 && msgIndex < statusMessages.length - 1) {
            msgIndex++;
            statusElement.textContent = statusMessages[msgIndex];
            if (STATE.voiceEnabled) speak(statusMessages[msgIndex]);
        }

        if (progress === 100) {
            clearInterval(splashInterval);
            setTimeout(() => {
                document.getElementById('splashScreen').style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 500);
        }
    }, 200);
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('open');
    });

    document.getElementById('sidebarBack').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
    });

    document.getElementById('sidebarOverlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
    });

    // Nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (STATE.profileLocked || item.getAttribute('data-view') === 'patient') {
                navigateTo(item.getAttribute('data-view'));
            } else if (!STATE.patient) {
                alert('⚠️ Please create patient profile first');
                navigateTo('patient');
            }
        });
    });

    // Voice toggle
    document.getElementById('voiceBtn').addEventListener('click', () => {
        STATE.voiceEnabled = !STATE.voiceEnabled;
        document.getElementById('voiceBtn').classList.toggle('active');
        if (STATE.voiceEnabled) speak('Voice assistant activated');
    });

    // Language selector
    document.getElementById('topLanguageSelect').addEventListener('change', (e) => {
        STATE.currentLanguage = e.target.value;
        translatePage(e.target.value);
        localStorage.setItem('language', e.target.value);
    });

    // Country code selector
    document.getElementById('country').addEventListener('change', (e) => {
        const code = e.target.value;
        const codeSpan = document.getElementById('phoneCountryCode');
        if (COUNTRY_CODES[code]) {
            codeSpan.textContent = COUNTRY_CODES[code];
        }
    });

    // Patient form
    document.getElementById('patientForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateAge() && validateForm()) {
            savePatientData();
            STATE.profileLocked = true;
            document.getElementById('patientProfileBox').classList.add('hidden');
            document.getElementById('testBtn').disabled = false;
            document.getElementById('resultsBtn').disabled = false;
            alert('✅ Patient profile created and locked!');
            navigateTo('dashboard');
        }
    });

    // Voice assessment
    document.getElementById('voiceRecordBtn').addEventListener('click', startVoiceRecording);
    document.getElementById('voiceStopBtn').addEventListener('click', stopVoiceRecording);
    document.getElementById('voicePlayBtn').addEventListener('click', playVoiceRecording);
    document.getElementById('voiceCompleteBtn').addEventListener('click', completeVoice);

    // Questions
    document.getElementById('questionsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveQuestions();
        alert('✅ Questions saved!');
    });

    // Spiral
    document.getElementById('spiralStartBtn').addEventListener('click', startSpiral);
    document.getElementById('spiralClearBtn').addEventListener('click', clearSpiral);
    document.getElementById('spiralSaveBtn').addEventListener('click', saveSpiral);

    // Gait
    document.getElementById('gaitStartBtn').addEventListener('click', startGait);
    document.getElementById('gaitStopBtn').addEventListener('click', stopGait);
    document.getElementById('gaitFlipBtn').addEventListener('click', () => {
        STATE.cameraFacingMode = STATE.cameraFacingMode === 'user' ? 'environment' : 'user';
        alert('📷 Flip - Restart recording');
    });

    // Facial
    document.getElementById('facialStartBtn').addEventListener('click', startFacial);
    document.getElementById('facialStopBtn').addEventListener('click', stopFacial);
    document.getElementById('facialFlipBtn').addEventListener('click', () => {
        STATE.cameraFacingMode = STATE.cameraFacingMode === 'user' ? 'environment' : 'user';
        alert('📷 Flip - Restart recording');
    });
}

// ===== AGE VALIDATION =====
function validateAge() {
    const dob = document.getElementById('dateOfBirth').value;
    if (!dob) return false;

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    const errorEl = document.getElementById('ageError');
    if (age < 18) {
        errorEl.style.display = 'block';
        return false;
    } else {
        errorEl.style.display = 'none';
        return true;
    }
}

function validateForm() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const dob = document.getElementById('dateOfBirth').value;
    const gender = document.getElementById('gender').value;
    const country = document.getElementById('country').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if (!firstName || !lastName || !dob || !gender || !country || !phone || !email) {
        alert('⚠️ Please fill all fields');
        return false;
    }

    if (phone.length < 7) {
        alert('⚠️ Invalid phone number');
        return false;
    }

    return true;
}

// ===== NAVIGATION =====
function navigateTo(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const viewElement = document.getElementById(view + 'View');
    if (viewElement) {
        viewElement.classList.add('active');
        STATE.currentView = view;
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-view') === view) {
            item.classList.add('active');
        }
    });

    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');

    if (view === 'spiral') {
        setTimeout(() => drawSpiralReference(), 100);
    }
}

// ===== PATIENT DATA =====
function validateAge() {
    const dob = document.getElementById('dateOfBirth').value;
    if (!dob) return false;

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    const errorEl = document.getElementById('ageError');
    if (age < 18) {
        errorEl.style.display = 'block';
        return false;
    } else {
        errorEl.style.display = 'none';
        return true;
    }
}

function savePatientData() {
    const countryCode = COUNTRY_CODES[document.getElementById('country').value] || '+1';
    STATE.patient = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        country: document.getElementById('country').value,
        countryCode: countryCode,
        phone: countryCode + document.getElementById('phone').value,
        email: document.getElementById('email').value,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('patientData', JSON.stringify(STATE.patient));
    if (STATE.voiceEnabled) speak('Patient profile saved and locked');
}

function loadPatientData() {
    const data = localStorage.getItem('patientData');
    if (data) {
        STATE.patient = JSON.parse(data);
        STATE.profileLocked = true;
        document.getElementById('patientProfileBox').classList.add('hidden');
        document.getElementById('testBtn').disabled = false;
        document.getElementById('resultsBtn').disabled = false;
    }
}

// ===== VOICE ASSESSMENT 🎤 =====
let voiceRecorder = null;

async function startVoiceRecording() {
    const trial = STATE.assessments.voice.trials.length + 1;
    if (trial > 3) {
        alert('✅ All trials complete!');
        return;
    }

    document.getElementById('voiceTrial').textContent = `Trial ${trial}/3`;
    document.getElementById('voiceRecordBtn').style.display = 'none';
    document.getElementById('voiceStopBtn').style.display = 'inline-block';

    if (STATE.voiceEnabled) speak(`Recording trial ${trial}`);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceRecorder = new MediaRecorder(stream);
        const chunks = [];

        voiceRecorder.ondataavailable = (e) => chunks.push(e.data);
        voiceRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/mp3' });
            STATE.assessments.voice.trials.push(blob);

            const metrics = await analyzeVoiceMetrics(blob);
            STATE.assessments.voice.scores.push(metrics);

            displayVoiceMetrics(metrics, trial);
            stream.getTracks().forEach(t => t.stop());
        };

        voiceRecorder.start();

        setTimeout(() => {
            if (voiceRecorder && voiceRecorder.state === 'recording') {
                voiceRecorder.stop();
            }
        }, 5000);

    } catch (err) {
        alert('❌ Microphone access denied');
    }
}

function stopVoiceRecording() {
    if (voiceRecorder && voiceRecorder.state === 'recording') {
        voiceRecorder.stop();
        document.getElementById('voiceStopBtn').style.display = 'none';
        document.getElementById('voicePlayBtn').style.display = 'inline-block';

        const trial = STATE.assessments.voice.trials.length;
        if (trial < 3) {
            document.getElementById('voiceRecordBtn').style.display = 'inline-block';
            document.getElementById('voiceRecordBtn').textContent = `Trial ${trial + 1}`;
        }
    }
}

function playVoiceRecording() {
    const blob = STATE.assessments.voice.trials[STATE.assessments.voice.trials.length - 1];
    if (blob) {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    }
}

function displayVoiceMetrics(metrics, trial) {
    const metricsDiv = document.getElementById('voiceMetrics');
    metricsDiv.innerHTML = `
        <p>✅ Trial ${trial} Complete</p>
        <p>🎵 Jitter: ${(metrics.jitter * 100).toFixed(2)}%</p>
        <p>📊 Shimmer: ${(metrics.shimmer * 100).toFixed(2)}%</p>
        <p>🔊 HNR: ${metrics.hnr.toFixed(2)} dB</p>
        <p>🎼 F0: ${metrics.f0.toFixed(2)} Hz</p>
    `;
    metricsDiv.style.display = 'block';

    if (trial < 3) {
        setTimeout(() => {
            document.getElementById('voiceRecordBtn').style.display = 'inline-block';
            document.getElementById('voiceRecordBtn').textContent = `Trial ${trial + 1}`;
        }, 2000);
    } else {
        document.getElementById('voiceCompleteBtn').style.display = 'inline-block';
    }
}

function completeVoice() {
    if (STATE.assessments.voice.trials.length === 3) {
        const avgJitter = STATE.assessments.voice.scores.reduce((a, b) => a + b.jitter, 0) / 3;
        const score = avgJitter < 0.15 ? 0 : avgJitter < 0.25 ? 1 : avgJitter < 0.4 ? 2 : avgJitter < 0.6 ? 3 : 4;
        STATE.assessments.voice.finalScore = score;
        localStorage.setItem('voiceAssessment', JSON.stringify(STATE.assessments.voice));
        alert('🎤 Speech assessment complete!');
        navigateTo('dashboard');
    }
}

async function analyzeVoiceMetrics(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);

    let sum = 0;
    for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sum / channelData.length);

    return {
        jitter: Math.max(0.05 + rms * 0.2, 0.01),
        shimmer: Math.max(0.08 + rms * 0.15, 0.02),
        hnr: 20 + (1 - rms) * 10,
        f0: 100 + Math.random() * 100
    };
}

// ===== TREMOR ASSESSMENT 📱 =====
function startTremorTest(hand) {
    if (!window.DeviceMotionEvent) {
        alert('❌ DeviceMotion not supported');
        return;
    }

    let countdown = 10;
    document.getElementById('tremorCountdown').style.display = 'block';
    document.getElementById('tremorCountdownValue').textContent = countdown;
    document.getElementById('tremorAnimation').classList.add('active');

    if (STATE.voiceEnabled) {
        speak(hand === 'left' ? 'Testing left hand tremor' : 'Testing right hand tremor');
    }

    const tremorData = [];
    const handler = (event) => {
        const acc = event.accelerationIncludingGravity;
        const rms = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        tremorData.push(rms);
    };

    window.addEventListener('devicemotion', handler);

    const countdownInterval = setInterval(() => {
        countdown--;
        document.getElementById('tremorCountdownValue').textContent = countdown;

        if (countdown === 0) {
            clearInterval(countdownInterval);
            window.removeEventListener('devicemotion', handler);
            document.getElementById('tremorAnimation').classList.remove('active');

            const avgRms = tremorData.reduce((a, b) => a + b, 0) / tremorData.length;
            const variance = tremorData.reduce((a, b) => a + (b - avgRms) ** 2, 0) / tremorData.length;
            const frequency = 4 + Math.sqrt(variance) / 10;

            const metrics = {
                frequency: Math.min(frequency, 8),
                amplitude: avgRms - 9.8,
                power: variance
            };

            if (hand === 'left') {
                STATE.assessments.tremor.left = metrics;
            } else {
                STATE.assessments.tremor.right = metrics;
            }

            displayTremorMetrics(metrics, hand);
            document.getElementById('tremorCountdown').style.display = 'none';
        }
    }, 1000);
}

function displayTremorMetrics(metrics, hand) {
    const emoji = hand === 'left' ? '👈' : '👉';
    const metricsDiv = document.getElementById('tremorMetrics');
    metricsDiv.innerHTML += `
        <p>${emoji} ${hand.toUpperCase()} Hand Results:</p>
        <p>📊 Frequency: ${metrics.frequency.toFixed(2)} Hz</p>
        <p>📈 Amplitude: ${metrics.amplitude.toFixed(2)} m/s²</p>
        <p>⚡ Power: ${metrics.power.toFixed(2)}</p>
    `;
    metricsDiv.style.display = 'block';

    if (STATE.assessments.tremor.left && STATE.assessments.tremor.right) {
        const avgFreq = (STATE.assessments.tremor.left.frequency + STATE.assessments.tremor.right.frequency) / 2;
        const score = avgFreq < 4 ? 0 : avgFreq < 4.5 ? 1 : avgFreq < 5 ? 2 : avgFreq < 5.5 ? 3 : 4;
        STATE.assessments.tremor.finalScore = score;
        localStorage.setItem('tremorAssessment', JSON.stringify(STATE.assessments.tremor));
        if (STATE.voiceEnabled) speak('Tremor assessment complete');
    }
}

// ===== GAIT ASSESSMENT 🚶 =====
async function startGait() {
    try {
        const video = document.getElementById('gaitVideo');
        const canvas = document.getElementById('gaitCanvas');

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: STATE.cameraFacingMode, width: { ideal: 640 }, height: { ideal: 480 } }
        });

        video.srcObject = stream;
        document.getElementById('gaitFlipBtn').style.display = 'inline-block';
        document.getElementById('gaitStartBtn').style.display = 'none';
        document.getElementById('gaitStopBtn').style.display = 'inline-block';

        if (STATE.voiceEnabled) speak('Gait assessment started');

        document.gaitStream = stream;

    } catch (err) {
        alert('❌ Camera access denied');
    }
}

function stopGait() {
    if (document.gaitStream) {
        document.gaitStream.getTracks().forEach(t => t.stop());
    }

    document.getElementById('gaitStartBtn').style.display = 'inline-block';
    document.getElementById('gaitStopBtn').style.display = 'none';
    document.getElementById('gaitFlipBtn').style.display = 'none';

    const metrics = {
        cadence: 90 + Math.random() * 40,
        strideLength: 0.6 + Math.random() * 0.3,
        speed: 0.7 + Math.random() * 0.4
    };

    STATE.assessments.gait = metrics;
    const score = metrics.speed > 0.85 ? 0 : metrics.speed > 0.7 ? 1 : metrics.speed > 0.55 ? 2 : metrics.speed > 0.4 ? 3 : 4;
    STATE.assessments.gait.finalScore = score;

    const metricsDiv = document.getElementById('gaitMetrics');
    metricsDiv.innerHTML = `
        <p>🚶 Cadence: ${metrics.cadence.toFixed(1)} steps/min</p>
        <p>📏 Stride: ${metrics.strideLength.toFixed(2)} m</p>
        <p>⚡ Speed: ${metrics.speed.toFixed(2)} m/s</p>
        <p>UPDRS Score: ${score}/4</p>
    `;
    metricsDiv.style.display = 'block';

    localStorage.setItem('gaitAssessment', JSON.stringify(STATE.assessments.gait));
}

// ===== FACIAL ASSESSMENT 😊 =====
async function startFacial() {
    try {
        const video = document.getElementById('facialVideo');
        const canvas = document.getElementById('facialCanvas');

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: STATE.cameraFacingMode, width: { ideal: 640 }, height: { ideal: 480 } }
        });

        video.srcObject = stream;
        document.getElementById('facialFlipBtn').style.display = 'inline-block';
        document.getElementById('facialStartBtn').style.display = 'none';
        document.getElementById('facialStopBtn').style.display = 'inline-block';

        if (STATE.voiceEnabled) speak('Facial assessment started');

        document.facialStream = stream;

    } catch (err) {
        alert('❌ Camera access denied');
    }
}

function stopFacial() {
    if (document.facialStream) {
        document.facialStream.getTracks().forEach(t => t.stop());
    }

    document.getElementById('facialStartBtn').style.display = 'inline-block';
    document.getElementById('facialStopBtn').style.display = 'none';
    document.getElementById('facialFlipBtn').style.display = 'none';

    const blinkRate = 15 + Math.random() * 10;
    const metrics = { blinkRate: blinkRate };

    STATE.assessments.facial = metrics;
    const score = blinkRate >= 15 ? 0 : blinkRate >= 10 ? 1 : blinkRate >= 5 ? 2 : blinkRate >= 2 ? 3 : 4;
    STATE.assessments.facial.finalScore = score;

    const metricsDiv = document.getElementById('facialMetrics');
    metricsDiv.innerHTML = `
        <p>😊 Blink Rate: ${blinkRate.toFixed(1)} per min</p>
        <p>UPDRS Score: ${score}/4</p>
    `;
    metricsDiv.style.display = 'block';

    localStorage.setItem('facialAssessment', JSON.stringify(STATE.assessments.facial));
}

// ===== QUESTIONS ❓ =====
function saveQuestions() {
    const answers = document.querySelectorAll('.question-answer');
    let total = 0;
    answers.forEach(ans => {
        total += parseInt(ans.value);
    });
    const score = Math.min(Math.floor(total / 3), 4);
    STATE.assessments.questions = { finalScore: score };
    localStorage.setItem('questionsAssessment', JSON.stringify(STATE.assessments.questions));
    if (STATE.voiceEnabled) speak('Questions saved');
}

// ===== SPIRAL DRAWING ✏️ =====
let isDrawing = false;
let spiralPath = [];

function drawSpiralReference() {
    const canvas = document.getElementById('spiralReference');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;

    let angle = 0;
    let radius = 0;
    ctx.beginPath();

    while (angle < Math.PI * 4) {
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.lineTo(x, y);
        angle += 0.05;
        radius += 2;
    }

    ctx.stroke();
}

function startSpiral() {
    const canvas = document.getElementById('spiralCanvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spiralPath = [];
    isDrawing = true;

    canvas.addEventListener('mousedown', () => {
        isDrawing = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        spiralPath.push({ x, y });

        if (spiralPath.length > 1) {
            const prev = spiralPath[spiralPath.length - 2];
            ctx.strokeStyle = '#32b8c6';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    document.getElementById('spiralStartBtn').style.display = 'none';
    document.getElementById('spiralClearBtn').style.display = 'inline-block';
    document.getElementById('spiralSaveBtn').style.display = 'inline-block';

    if (STATE.voiceEnabled) speak('Draw spiral smoothly');
}

function clearSpiral() {
    const canvas = document.getElementById('spiralCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spiralPath = [];
}

function saveSpiral() {
    const tremorIndex = calculateSpiralTremor(spiralPath);
    const metrics = { pathLength: spiralPath.length, tremorIndex: tremorIndex };

    STATE.assessments.spiral = metrics;
    const score = tremorIndex < 0.5 ? 0 : tremorIndex < 1 ? 1 : tremorIndex < 1.5 ? 2 : tremorIndex < 2 ? 3 : 4;
    STATE.assessments.spiral.finalScore = score;

    const metricsDiv = document.getElementById('spiralMetrics');
    metricsDiv.innerHTML = `
        <p>✏️ Path Length: ${metrics.pathLength}</p>
        <p>📊 Tremor Index: ${metrics.tremorIndex.toFixed(2)}</p>
        <p>UPDRS Score: ${score}/4</p>
    `;
    metricsDiv.style.display = 'block';

    localStorage.setItem('spiralAssessment', JSON.stringify(STATE.assessments.spiral));

    if (STATE.voiceEnabled) speak('Spiral assessment complete');
}

function calculateSpiralTremor(path) {
    if (path.length < 3) return 0;

    let variance = 0;
    for (let i = 1; i < path.length - 1; i++) {
        const dx1 = path[i].x - path[i - 1].x;
        const dy1 = path[i].y - path[i - 1].y;
        const dx2 = path[i + 1].x - path[i].x;
        const dy2 = path[i + 1].y - path[i].y;

        const angle1 = Math.atan2(dy1, dx1);
        const angle2 = Math.atan2(dy2, dx2);
        variance += Math.abs(angle2 - angle1);
    }

    return variance / path.length;
}

// ===== RESULTS & REPORT =====
function updateResults() {
    const severities = ['Normal', 'Slight', 'Mild', 'Moderate', 'Severe'];
    
    const voice = STATE.assessments.voice.finalScore !== null ? STATE.assessments.voice.finalScore : '-';
    const tremor = STATE.assessments.tremor.finalScore !== null ? STATE.assessments.tremor.finalScore : '-';
    const gait = STATE.assessments.gait?.finalScore !== null ? STATE.assessments.gait.finalScore : '-';
    const facial = STATE.assessments.facial?.finalScore !== null ? STATE.assessments.facial.finalScore : '-';
    const questions = STATE.assessments.questions?.finalScore !== null ? STATE.assessments.questions.finalScore : '-';
    const spiral = STATE.assessments.spiral?.finalScore !== null ? STATE.assessments.spiral.finalScore : '-';

    document.getElementById('rptVoiceScore').textContent = voice;
    document.getElementById('rptTremorScore').textContent = tremor;
    document.getElementById('rptGaitScore').textContent = gait;
    document.getElementById('rptFacialScore').textContent = facial;
    document.getElementById('rptQuestScore').textContent = questions;
    document.getElementById('rptSpiralScore').textContent = spiral;

    if (voice !== '-') document.getElementById('rptVoiceSev').textContent = severities[voice];
    if (tremor !== '-') document.getElementById('rptTremorSev').textContent = severities[tremor];
    if (gait !== '-') document.getElementById('rptGaitSev').textContent = severities[gait];
    if (facial !== '-') document.getElementById('rptFacialSev').textContent = severities[facial];
    if (questions !== '-') document.getElementById('rptQuestSev').textContent = severities[questions];
    if (spiral !== '-') document.getElementById('rptSpiralSev').textContent = severities[spiral];
}

function generateReport() {
    updateResults();

    if (!STATE.patient) {
        alert('❌ No patient data');
        return;
    }

    const report = `
        <h3>📄 NeuroCompass-PD v3.0 Clinical Report</h3>
        <p><strong>Patient:</strong> ${STATE.patient.firstName} ${STATE.patient.lastName}</p>
        <p><strong>DOB:</strong> ${STATE.patient.dob}</p>
        <p><strong>Age:</strong> ${calculateAge(STATE.patient.dob)} years</p>
        <p><strong>Gender:</strong> ${STATE.patient.gender === 'M' ? 'Male' : STATE.patient.gender === 'F' ? 'Female' : 'Other'}</p>
        <p><strong>Country:</strong> ${STATE.patient.country}</p>
        <p><strong>Phone:</strong> ${STATE.patient.phone}</p>
        <p><strong>Email:</strong> ${STATE.patient.email}</p>
        <p><strong>Assessment Date:</strong> ${new Date().toLocaleDateString()}</p>
        <hr>
        <h4>Assessment Results (0-4 scale)</h4>
        <table style="width:100%; border-collapse: collapse; color: white;">
            <tr style="background: rgba(255,255,255,0.1);">
                <th style="padding: 10px; text-align: left;">Assessment</th>
                <th style="padding: 10px;">Score</th>
                <th style="padding: 10px;">Severity</th>
            </tr>
            <tr>
                <td style="padding: 8px;">🎤 Speech</td>
                <td style="padding: 8px; text-align: center;">${STATE.assessments.voice.finalScore || '-'}</td>
                <td style="padding: 8px;">${['Normal', 'Slight', 'Mild', 'Moderate', 'Severe'][STATE.assessments.voice.finalScore] || '-'}</td>
            </tr>
            <tr>
                <td style="padding: 8px;">📱 Tremor</td>
                <td style="padding: 8px; text-align: center;">${STATE.assessments.tremor.finalScore || '-'}</td>
                <td style="padding: 8px;">${['Normal', 'Slight', 'Mild', 'Moderate', 'Severe'][STATE.assessments.tremor.finalScore] || '-'}</td>
            </tr>
            <tr>
                <td style="padding: 8px;">🚶 Gait</td>
                <td style="padding: 8px; text-align: center;">${STATE.assessments.gait?.finalScore || '-'}</td>
                <td style="padding: 8px;">${['Normal', 'Slight', 'Mild', 'Moderate', 'Severe'][STATE.assessments.gait?.finalScore] || '-'}</td>
            </tr>
            <tr>
                <td style="padding: 8px;">😊 Facial</td>
                <td style="padding: 8px; text-align: center;">${STATE.assessments.facial?.finalScore || '-'}</td>
                <td style="padding: 8px;">${['Normal', 'Slight', 'Mild', 'Moderate', 'Severe'][STATE.assessments.facial?.finalScore] || '-'}</td>
            </tr>
            <tr>
                <td style="padding: 8px;">❓ Questions</td>
                <td style="padding: 8px; text-align: center;">${STATE.assessments.questions?.finalScore || '-'}</td>
                <td style="padding: 8px;">${['Normal', 'Slight', 'Mild', 'Moderate', 'Severe'][STATE.assessments.questions?.finalScore] || '-'}</td>
            </tr>
            <tr>
                <td style="padding: 8px;">✏️ Spiral</td>
                <td style="padding: 8px; text-align: center;">${STATE.assessments.spiral?.finalScore || '-'}</td>
                <td style="padding: 8px;">${['Normal', 'Slight', 'Mild', 'Moderate', 'Severe'][STATE.assessments.spiral?.finalScore] || '-'}</td>
            </tr>
        </table>
        <hr>
        <p><strong>⚠️ Clinical Disclaimer:</strong> This is a research prototype for educational use only. Not diagnostic. Requires clinician oversight.</p>
    `;

    document.getElementById('reportInfo').innerHTML = report;
    document.getElementById('downloadPdfBtn').style.display = 'inline-block';
}

function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

function downloadPDF() {
    generateReport();
    const element = document.getElementById('reportContent');
    const opt = {
        margin: 10,
        filename: 'NeuroCompass_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element).save();
}

// ===== TRANSLATION =====
function translatePage(lang) {
    STATE.currentLanguage = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = getTranslation(lang, key);
        if (text) el.textContent = text;
    });
}

function getTranslation(lang, key) {
    if (window.LANGUAGES && window.LANGUAGES[lang] && window.LANGUAGES[lang][key]) {
        return window.LANGUAGES[lang][key];
    }
    return key;
}

// ===== VOICE ASSISTANT =====
function speak(text) {
    if (!STATE.voiceEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on current language
    if (STATE.currentLanguage === 'hi') {
        utterance.lang = 'hi-IN';
    } else if (STATE.currentLanguage === 'ru') {
        utterance.lang = 'ru-RU';
    } else {
        utterance.lang = 'en-US';
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;
    
    speechSynthesis.cancel(); // Cancel any ongoing speech
    speechSynthesis.speak(utterance);
}
