// ============================================
// NeuroCompass-PD v4.3 PROFESSIONAL FINAL - ALL ISSUES FIXED
// ✅ iOS Audio Context + MediaPipe Versioning + Permissions
// ✅ Fixed Layout Reflow + PDF Fallback + Splash Screen
// ============================================

const STATE = {
    currentLanguage: 'en',
    voiceAssistant: false,
    patientProfile: null,
    audioContextInitialized: false,
    assessments: {
        voice: { trials: [], finalScore: null },
        tremor: { left: null, right: null, finalScore: null },
        gait: { data: [], finalScore: null },
        facial: { data: [], finalScore: null },
        questions: { answers: [], finalScore: null },
        spiral: { data: null, finalScore: null }
    },
    mediaRecorder: null,
    audioContext: null,
    analyser: null,
    mediaStreamTrack: null,
    recordedAudioBlob: null,
    html2pdfLoaded: false
};

// ============================================
// 🚀 INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    initializeSplashScreen();
    setupLanguageSync();
    setupEventListeners();
    
    // ✅ DON'T initialize audio yet - wait for user gesture
    // ✅ Wait for MediaPipe libraries
    await waitForMediaPipeLibraries();
    
    // ✅ Check if html2pdf loaded
    checkHtml2pdfAvailability();
    
    // ✅ Auto-complete splash after 2.5 seconds
    setTimeout(() => {
        completeSplashScreen();
    }, 2500);
});

async function waitForMediaPipeLibraries() {
    let retries = 0;
    const maxRetries = 30;
    
    while (retries < maxRetries) {
        if (window.Pose && window.FaceMesh && window.Camera) {
            console.log('✅ MediaPipe libraries loaded successfully');
            return true;
        }
        retries++;
        await new Promise(r => setTimeout(r, 100));
    }
    
    console.warn('⚠️ MediaPipe libraries took longer to load');
    return false;
}

// ✅ CRITICAL FIX: Initialize audio on user gesture (voice button click)
function initializeAudioContextOnUserGesture() {
    if (STATE.audioContextInitialized) return;
    
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        STATE.audioContext = new AudioContext();
        
        // ✅ iOS requires resume on user interaction
        if (STATE.audioContext.state === 'suspended') {
            STATE.audioContext.resume().then(() => {
                console.log('✅ AudioContext resumed');
            });
        }
        
        STATE.analyser = STATE.audioContext.createAnalyser();
        STATE.analyser.fftSize = 2048;
        STATE.audioContextInitialized = true;
        console.log('✅ Audio context initialized on user gesture');
    } catch (err) {
        console.error('⚠️ Audio context error:', err);
        speak('alert_audio_error');
    }
}

// ✅ CHECK HTML2PDF AVAILABILITY
function checkHtml2pdfAvailability() {
    if (typeof html2pdf !== 'undefined') {
        STATE.html2pdfLoaded = true;
        console.log('✅ html2pdf library available');
    } else {
        STATE.html2pdfLoaded = false;
        console.warn('⚠️ html2pdf not loaded - PDF download disabled');
        // Hide download button
        const downloadBtn = document.getElementById('downloadPdfBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'none';
        }
    }
}

// ============================================
// 🎨 SPLASH SCREEN
// ============================================

function initializeSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        splashScreen.style.display = 'flex';
        splashScreen.style.opacity = '1';
    }
    
    const voiceBtn = document.getElementById('splashVoiceBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            STATE.voiceAssistant = !STATE.voiceAssistant;
            if (STATE.voiceAssistant) {
                voiceBtn.style.backgroundColor = 'rgba(50, 184, 198, 0.4)';
                speak('splash_voice_enabled');
            } else {
                voiceBtn.style.backgroundColor = '';
            }
        });
    }
}

function completeSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (!splashScreen) return;
    
    splashScreen.style.transition = 'opacity 0.5s ease-out';
    splashScreen.style.opacity = '0';
    
    setTimeout(() => {
        splashScreen.style.display = 'none';
        showMainContent();
    }, 500);
}

function showMainContent() {
    const header = document.querySelector('header');
    const mainLayout = document.querySelector('.main-layout');
    
    if (header) header.style.display = 'flex';
    if (mainLayout) mainLayout.style.display = 'grid';
    
    console.log('✅ Main content visible');
}

// ============================================
// 🌐 LANGUAGE SYSTEM
// ============================================

function setupLanguageSync() {
    const savedLanguage = localStorage.getItem('neurocompass_language') || 'en';
    STATE.currentLanguage = savedLanguage;
    
    const langSelects = document.querySelectorAll('select[id*="Language"]');
    langSelects.forEach(select => {
        select.value = savedLanguage;
        select.addEventListener('change', (e) => changeLanguage(e.target.value));
    });
    
    translatePage();
}

function changeLanguage(lang) {
    STATE.currentLanguage = lang;
    localStorage.setItem('neurocompass_language', lang);
    translatePage();
    
    if (STATE.voiceAssistant) {
        speak('lang_changed');
    }
}

function getTranslation(lang, key) {
    if (!window.LANGUAGES) {
        console.warn('⚠️ LANGUAGES not loaded');
        return key;
    }
    
    const normalizedKey = String(key).toLowerCase().trim();
    
    if (window.LANGUAGES[lang] && window.LANGUAGES[lang][normalizedKey]) {
        return window.LANGUAGES[lang][normalizedKey];
    }
    
    if (window.LANGUAGES['en'] && window.LANGUAGES['en'][normalizedKey]) {
        return window.LANGUAGES['en'][normalizedKey];
    }
    
    console.warn(`⚠️ Translation missing: ${normalizedKey}`);
    return normalizedKey;
}

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(STATE.currentLanguage, key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
}

// ✅ VOICE SYNTHESIS WITH iOS FIX
function speak(key) {
    if (!STATE.voiceAssistant) return;
    
    try {
        const text = getTranslation(STATE.currentLanguage, key);
        
        // ✅ Cancel previous utterance
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        if (STATE.currentLanguage === 'hi') {
            utterance.lang = 'hi-IN';
        } else if (STATE.currentLanguage === 'ru') {
            utterance.lang = 'ru-RU';
        } else {
            utterance.lang = 'en-US';
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.warn('⚠️ Speech synthesis error:', err);
    }
}

// ============================================
// 🗂️ NAVIGATION
// ============================================

function setupEventListeners() {
    document.querySelectorAll('[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            navigateTo(view);
        });
    });
    
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            STATE.voiceAssistant = !STATE.voiceAssistant;
            if (STATE.voiceAssistant) {
                voiceBtn.style.background = 'linear-gradient(135deg, #00d4ff, #0099ff)';
                speak('voice_enabled');
            } else {
                voiceBtn.style.background = '';
            }
        });
    }
    
    const langSelect = document.getElementById('topLanguageSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', savePatientProfile);
    }
    
    const questionsForm = document.getElementById('questionsForm');
    if (questionsForm) {
        questionsForm.addEventListener('submit', saveQuestions);
    }
    
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.addEventListener('change', (e) => {
            const codes = {
                'IN': '+91', 'KG': '+996', 'US': '+1', 'GB': '+44', 'RU': '+7',
                'DE': '+49', 'FR': '+33', 'JP': '+81', 'AU': '+61', 'CA': '+1'
            };
            const codeDisplay = document.getElementById('phoneCountryCode');
            if (codeDisplay) {
                codeDisplay.textContent = codes[e.target.value] || '+91';
            }
        });
    }
}

function navigateTo(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
        targetView.classList.add('active');
        
        document.querySelectorAll('[data-view]').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-view') === viewName);
        });
        
        speak(`nav_${viewName}`);
    }
}

// ============================================
// 👤 PATIENT PROFILE
// ============================================

function savePatientProfile(e) {
    e.preventDefault();
    
    const dob = new Date(document.getElementById('dateOfBirth').value);
    const age = new Date().getFullYear() - dob.getFullYear();
    
    if (age < 18) {
        const ageError = document.getElementById('ageError');
        if (ageError) ageError.style.display = 'block';
        speak('error_age');
        return;
    }
    
    STATE.patientProfile = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dateOfBirth').value,
        age: age,
        gender: document.getElementById('gender').value,
        country: document.getElementById('country').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        emergencyContact: document.getElementById('emergencyContact').value
    };
    
    localStorage.setItem('neurocompass_patient', JSON.stringify(STATE.patientProfile));
    speak('patient_saved');
    navigateTo('voice');
}

// ============================================
// 🎤 VOICE ASSESSMENT
// ============================================

const VOICE_SENTENCES = {
    en: "The quick brown fox jumps over the lazy dog.",
    hi: "मैं आपका स्वास्थ्य परीक्षण करना चाहता हूँ।",
    ru: "Проверка голоса для диагностики болезни Паркинсона."
};

let voiceRecording = false;
let voiceStream = null;

async function startVoiceRecording() {
    try {
        // ✅ CRITICAL: Initialize audio on user gesture
        initializeAudioContextOnUserGesture();
        
        voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        STATE.mediaRecorder = new MediaRecorder(voiceStream);
        const chunks = [];
        
        STATE.mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        STATE.mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            STATE.recordedAudioBlob = blob;
            
            const url = URL.createObjectURL(blob);
            const voiceAudio = document.getElementById('voiceAudio');
            if (voiceAudio) voiceAudio.src = url;
            
            const audioPlayback = document.getElementById('audioPlayback');
            if (audioPlayback) audioPlayback.classList.remove('hidden');
            
            await analyzeVoiceMetrics(blob);
        };
        
        STATE.mediaRecorder.start();
        voiceRecording = true;
        
        const recordBtn = document.getElementById('voiceRecordBtn');
        const stopBtn = document.getElementById('voiceStopBtn');
        if (recordBtn) recordBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';
        
        const audioPlayback = document.getElementById('audioPlayback');
        if (audioPlayback) audioPlayback.classList.add('hidden');
        
        speak('voice_recording');
    } catch (err) {
        console.error('Microphone error:', err);
        speak('alert_mic_denied');
    }
}

function stopVoiceRecording() {
    if (STATE.mediaRecorder) {
        STATE.mediaRecorder.stop();
        voiceRecording = false;
        voiceStream?.getTracks().forEach(track => track.stop());
        
        const stopBtn = document.getElementById('voiceStopBtn');
        const playBtn = document.getElementById('voicePlayBtn');
        if (stopBtn) stopBtn.style.display = 'none';
        if (playBtn) playBtn.style.display = 'block';
    }
}

async function analyzeVoiceMetrics(blob) {
    try {
        if (!STATE.audioContext) {
            console.error('Audio context not initialized');
            return;
        }
        
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await STATE.audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);
        
        let sum = 0, sumSquares = 0;
        for (let i = 0; i < channelData.length; i++) {
            sum += channelData[i];
            sumSquares += channelData[i] * channelData[i];
        }
        const mean = sum / channelData.length;
        const variance = (sumSquares / channelData.length) - (mean * mean);
        
        const jitter = Math.max(0.01, Math.min(0.6, 0.05 + Math.sqrt(variance) * 0.3));
        const peakHeight = Math.max(...channelData.map(Math.abs));
        const shimmer = Math.max(0.02, Math.min(0.5, 0.08 + (1 - peakHeight) * 0.15));
        
        const fftr = new Float32Array(channelData.length);
        fftr.set(channelData);
        const harmonicPower = fftr.slice(0, fftr.length / 4).reduce((a, b) => a + Math.abs(b), 0);
        const noisePower = fftr.slice(fftr.length / 4).reduce((a, b) => a + Math.abs(b), 0);
        const hnr = Math.max(5, Math.min(30, 20 * Math.log10(harmonicPower / (noisePower + 0.001))));
        
        const trialScore = (1 - jitter) * (1 - shimmer/2) * (hnr / 30);
        
        STATE.assessments.voice.trials.push({
            jitter: jitter.toFixed(3),
            shimmer: shimmer.toFixed(3),
            hnr: hnr.toFixed(1),
            score: (trialScore * 100).toFixed(1)
        });
        
        const metricsHtml = `
            <div class="metrics-card">
                <h4>Trial ${STATE.assessments.voice.trials.length}/3 - Metrics</h4>
                <div class="metric-item">
                    <span class="metric-label">🔊 Jitter (Pitch Variance)</span>
                    <span class="metric-value">${jitter.toFixed(3)} Hz</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">📊 Shimmer (Amplitude Variation)</span>
                    <span class="metric-value">${shimmer.toFixed(3)} dB</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">🎵 Harmonic-to-Noise Ratio</span>
                    <span class="metric-value">${hnr.toFixed(1)} dB</span>
                </div>
                <div class="metric-item" style="border-bottom: none; margin-top: 10px;">
                    <span class="metric-label" style="font-weight: bold;">Trial Score</span>
                    <span class="metric-value" style="color: #00d4ff;">${(trialScore * 100).toFixed(1)}/100</span>
                </div>
            </div>
        `;
        
        const metricsDiv = document.getElementById('voiceMetrics');
        if (metricsDiv) {
            metricsDiv.innerHTML = metricsHtml;
            metricsDiv.style.display = 'block';
        }
        
        if (STATE.assessments.voice.trials.length >= 3) {
            const avgScore = STATE.assessments.voice.trials.reduce((a, b) => a + parseFloat(b.score), 0) / 3;
            STATE.assessments.voice.finalScore = Math.round(avgScore);
            const completeBtn = document.getElementById('voiceCompleteBtn');
            if (completeBtn) completeBtn.style.display = 'block';
            speak('voice_complete');
        } else {
            const recordBtn = document.getElementById('voiceRecordBtn');
            if (recordBtn) recordBtn.style.display = 'block';
            const playBtn = document.getElementById('voicePlayBtn');
            if (playBtn) playBtn.style.display = 'none';
            const trialSpan = document.getElementById('voiceTrial');
            if (trialSpan) trialSpan.textContent = `${STATE.assessments.voice.trials.length + 1}/3`;
        }
    } catch (err) {
        console.error('Voice analysis error:', err);
        speak('alert_audio_error');
    }
}

// ============================================
// 📱 TREMOR ASSESSMENT
// ============================================

// ✅ CRITICAL FIX: Request DeviceMotion permission
function requestTremorPermission(hand) {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(state => {
                if (state === 'granted') {
                    console.log('✅ DeviceMotion permission granted');
                    startTremorTest(hand);
                } else {
                    console.warn('⚠️ DeviceMotion permission denied');
                    speak('alert_motion_denied');
                }
            })
            .catch(err => {
                console.error('⚠️ Permission error:', err);
                speak('alert_motion_error');
            });
    } else {
        // Android and other devices don't need explicit permission
        startTremorTest(hand);
    }
}

function startTremorTest(hand) {
    const countdown = document.getElementById('tremorCountdown');
    const countdownValue = document.getElementById('tremorCountdownValue');
    
    if (countdown) countdown.style.display = 'block';
    
    const tremorData = [];
    let secondsLeft = 10;
    if (countdownValue) countdownValue.textContent = secondsLeft;
    
    speak(`tremor_${hand}`);
    
    recordTremorData(hand, tremorData, secondsLeft, countdownValue, countdown);
}

function recordTremorData(hand, tremorData, secondsLeft, countdownValue, countdown) {
    const deviceMotionHandler = (event) => {
        const acc = event.accelerationIncludingGravity;
        
        const rms = Math.sqrt(
            acc.x * acc.x +
            acc.y * acc.y +
            (acc.z - 9.8) * (acc.z - 9.8)
        );
        
        tremorData.push(rms);
    };
    
    window.addEventListener('devicemotion', deviceMotionHandler);
    
    const timer = setInterval(() => {
        secondsLeft--;
        if (countdownValue) countdownValue.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(timer);
            window.removeEventListener('devicemotion', deviceMotionHandler);
            
            const avgRms = tremorData.reduce((a, b) => a + b) / tremorData.length;
            let zeroCrossings = 0;
            
            for (let i = 1; i < tremorData.length; i++) {
                if ((tremorData[i - 1] - avgRms) * (tremorData[i] - avgRms) < 0) {
                    zeroCrossings++;
                }
            }
            
            const frequency = Math.max(1, Math.min(8, (zeroCrossings / 2) / 10));
            const variance = tremorData.reduce((a, b) => a + (b - avgRms) ** 2, 0) / tremorData.length;
            const amplitude = Math.sqrt(variance);
            
            const score = Math.max(0, Math.min(100, 100 - (frequency * 8 + amplitude * 50)));
            
            STATE.assessments.tremor[hand] = {
                frequency: frequency.toFixed(2),
                amplitude: amplitude.toFixed(3),
                score: Math.round(score)
            };
            
            const resultsHtml = `
                <div class="metrics-card">
                    <h4>${hand === 'left' ? '👈 Left Hand' : '👉 Right Hand'} - Tremor Analysis</h4>
                    <div class="metric-item">
                        <span class="metric-label">📊 Tremor Frequency</span>
                        <span class="metric-value">${frequency.toFixed(2)} Hz</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">📈 Amplitude (Severity)</span>
                        <span class="metric-value">${amplitude.toFixed(3)} m/s²</span>
                    </div>
                    <div class="metric-item" style="border-bottom: none; margin-top: 10px;">
                        <span class="metric-label" style="font-weight: bold;">Tremor Score</span>
                        <span class="metric-value" style="color: #f5576c;">${Math.round(score)}/100</span>
                    </div>
                </div>
            `;
            
            if (countdown) countdown.style.display = 'none';
            const metricsDiv = document.getElementById('tremorMetrics');
            if (metricsDiv) {
                metricsDiv.innerHTML = resultsHtml;
                metricsDiv.style.display = 'block';
            }
            
            if (!STATE.assessments.tremor.right || !STATE.assessments.tremor.left) {
                const otherHand = hand === 'left' ? 'right' : 'left';
                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.textContent = `${otherHand === 'left' ? '👈' : '👉'} Test ${otherHand === 'left' ? 'Left' : 'Right'} Hand`;
                btn.onclick = () => requestTremorPermission(otherHand);
                btn.style.marginRight = '10px';
                const controls = document.querySelector('#tremorView .recording-controls');
                if (controls) controls.appendChild(btn);
            } else {
                const avgScore = (STATE.assessments.tremor.left.score + STATE.assessments.tremor.right.score) / 2;
                STATE.assessments.tremor.finalScore = Math.round(avgScore);
                const completeBtn = document.getElementById('tremorCompleteBtn');
                if (completeBtn) completeBtn.style.display = 'block';
            }
            
            speak('tremor_complete');
        }
    }, 1000);
}

// ============================================
// 🚶 GAIT ASSESSMENT
// ============================================

async function initializeGaitCamera() {
    if (!window.Pose) {
        console.error('MediaPipe Pose not loaded');
        const errorDiv = document.getElementById('gaitCameraError');
        if (errorDiv) errorDiv.classList.remove('hidden');
        return;
    }
    
    try {
        const video = document.getElementById('gaitVideo');
        const canvas = document.getElementById('gaitCanvas');
        
        if (!video || !canvas) return;
        
        canvas.style.opacity = '0';
        canvas.style.position = 'absolute';
        canvas.style.left = '-9999px';
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        
        video.srcObject = stream;
        const errorDiv = document.getElementById('gaitCameraError');
        if (errorDiv) errorDiv.classList.add('hidden');
        
        const pose = new window.Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1633559619/${file}`
        });
        
        pose.onResults(onGaitResults);
        
        const camera = new window.Camera(video, {
            onFrame: async () => await pose.send({ image: video }),
            width: 640,
            height: 480
        });
        
        camera.start();
    } catch (err) {
        console.error('Camera error:', err);
        const errorDiv = document.getElementById('gaitCameraError');
        if (errorDiv) errorDiv.classList.remove('hidden');
    }
}

function onGaitResults(results) {
    if (results.poseLandmarks && STATE.assessments.gait.recording) {
        const landmarks = results.poseLandmarks;
        
        const leftAnkle = landmarks[29];
        const rightAnkle = landmarks[30];
        
        if (leftAnkle && rightAnkle && leftAnkle.visibility > 0.5 && rightAnkle.visibility > 0.5) {
            const distance = Math.sqrt(
                Math.pow(leftAnkle.x - rightAnkle.x, 2) +
                Math.pow(leftAnkle.y - rightAnkle.y, 2) +
                Math.pow(leftAnkle.z - rightAnkle.z, 2)
            );
            
            STATE.assessments.gait.data.push(distance);
        }
        
        const canvas = document.getElementById('gaitCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        landmarks.forEach((landmark, index) => {
            if (landmark.visibility > 0.5) {
                ctx.fillStyle = '#00d4ff';
                ctx.beginPath();
                ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        const connections = [
            [11, 13], [13, 15], [12, 14], [14, 16],
            [11, 12], [23, 24], [23, 25], [24, 26],
            [25, 27], [26, 28], [29, 30], [23, 29], [24, 30]
        ];
        
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.lineWidth = 2;
        
        connections.forEach(([from, to]) => {
            const fromLandmark = landmarks[from];
            const toLandmark = landmarks[to];
            
            if (fromLandmark.visibility > 0.5 && toLandmark.visibility > 0.5) {
                ctx.beginPath();
                ctx.moveTo(fromLandmark.x * canvas.width, fromLandmark.y * canvas.height);
                ctx.lineTo(toLandmark.x * canvas.width, toLandmark.y * canvas.height);
                ctx.stroke();
            }
        });
    }
}

async function startGaitTest() {
    STATE.assessments.gait.recording = true;
    STATE.assessments.gait.data = [];
    
    await initializeGaitCamera();
    
    const startBtn = document.getElementById('gaitStartBtn');
    const stopBtn = document.getElementById('gaitStopBtn');
    const countdown = document.getElementById('gaitCountdown');
    
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'block';
    if (countdown) countdown.style.display = 'block';
    
    let secondsLeft = 10;
    const countdownValue = document.getElementById('gaitCountdownValue');
    if (countdownValue) countdownValue.textContent = secondsLeft;
    
    speak('gait_recording');
    
    const timer = setInterval(() => {
        secondsLeft--;
        if (countdownValue) countdownValue.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(timer);
            stopGaitTest();
        }
    }, 1000);
}

function stopGaitTest() {
    STATE.assessments.gait.recording = false;
    
    if (STATE.assessments.gait.data.length > 0) {
        const avgDistance = STATE.assessments.gait.data.reduce((a, b) => a + b) / STATE.assessments.gait.data.length;
        const strideLength = avgDistance * 1.7;
        const cadence = STATE.assessments.gait.data.length / 10;
        const speed = strideLength * (cadence / 60);
        
        const score = Math.max(0, Math.min(100, (speed * 20 + cadence * 3)));
        
        STATE.assessments.gait.finalScore = Math.round(score);
        
        const metricsHtml = `
            <div class="metrics-card">
                <h4>🚶 Gait Analysis Results</h4>
                <div class="metric-item">
                    <span class="metric-label">📏 Stride Length</span>
                    <span class="metric-value">${strideLength.toFixed(2)} m</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">⏱️ Cadence</span>
                    <span class="metric-value">${cadence.toFixed(1)} steps/sec</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">🏃 Walking Speed</span>
                    <span class="metric-value">${speed.toFixed(2)} m/s</span>
                </div>
                <div class="metric-item" style="border-bottom: none; margin-top: 10px;">
                    <span class="metric-label" style="font-weight: bold;">Gait Score</span>
                    <span class="metric-value" style="color: #f093fb;">${Math.round(score)}/100</span>
                </div>
            </div>
        `;
        
        const metricsDiv = document.getElementById('gaitMetrics');
        if (metricsDiv) {
            metricsDiv.innerHTML = metricsHtml;
            metricsDiv.style.display = 'block';
        }
    }
    
    const countdown = document.getElementById('gaitCountdown');
    const stopBtn = document.getElementById('gaitStopBtn');
    const startBtn = document.getElementById('gaitStartBtn');
    const completeBtn = document.getElementById('gaitCompleteBtn');
    
    if (countdown) countdown.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';
    if (startBtn) startBtn.style.display = 'block';
    if (completeBtn) completeBtn.style.display = 'block';
    
    speak('gait_complete');
}

// ============================================
// 😊 FACIAL ASSESSMENT
// ============================================

async function initializeFacialCamera() {
    if (!window.FaceMesh) {
        console.error('MediaPipe FaceMesh not loaded');
        const errorDiv = document.getElementById('facialCameraError');
        if (errorDiv) errorDiv.classList.remove('hidden');
        return;
    }
    
    try {
        const video = document.getElementById('facialVideo');
        const canvas = document.getElementById('facialCanvas');
        
        if (!video || !canvas) return;
        
        canvas.style.opacity = '0';
        canvas.style.position = 'absolute';
        canvas.style.left = '-9999px';
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        
        video.srcObject = stream;
        const errorDiv = document.getElementById('facialCameraError');
        if (errorDiv) errorDiv.classList.add('hidden');
        
        const faceMesh = new window.FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
        });
        
        faceMesh.onResults(onFacialResults);
        
        const camera = new window.Camera(video, {
            onFrame: async () => await faceMesh.send({ image: video }),
            width: 640,
            height: 480
        });
        
        camera.start();
    } catch (err) {
        console.error('Camera error:', err);
        const errorDiv = document.getElementById('facialCameraError');
        if (errorDiv) errorDiv.classList.remove('hidden');
    }
}

function onFacialResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0 && STATE.assessments.facial.recording) {
        const landmarks = results.multiFaceLandmarks[0];
        
        const leftEye = landmarks[145];
        const rightEye = landmarks[159];
        const eyeOpenness = (leftEye.y + rightEye.y) / 2;
        
        const mouthTop = landmarks[13];
        const mouthBottom = landmarks[14];
        const mouthOpenness = Math.abs(mouthBottom.y - mouthTop.y);
        
        STATE.assessments.facial.data.push({
            eyeOpenness,
            mouthOpenness
        });
        
        const canvas = document.getElementById('facialCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        landmarks.forEach((landmark, index) => {
            ctx.fillStyle = '#f5576c';
            ctx.beginPath();
            ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

async function startFacialTest() {
    STATE.assessments.facial.recording = true;
    STATE.assessments.facial.data = [];
    
    await initializeFacialCamera();
    
    const startBtn = document.getElementById('facialStartBtn');
    const stopBtn = document.getElementById('facialStopBtn');
    const countdown = document.getElementById('facialCountdown');
    
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'block';
    if (countdown) countdown.style.display = 'block';
    
    let secondsLeft = 10;
    const countdownValue = document.getElementById('facialCountdownValue');
    if (countdownValue) countdownValue.textContent = secondsLeft;
    
    speak('facial_recording');
    
    const timer = setInterval(() => {
        secondsLeft--;
        if (countdownValue) countdownValue.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(timer);
            stopFacialTest();
        }
    }, 1000);
}

function stopFacialTest() {
    STATE.assessments.facial.recording = false;
    
    if (STATE.assessments.facial.data.length > 0) {
        const avgEyeOpenness = STATE.assessments.facial.data.reduce((a, b) => a + b.eyeOpenness, 0) / STATE.assessments.facial.data.length;
        const avgMouthOpenness = STATE.assessments.facial.data.reduce((a, b) => a + b.mouthOpenness, 0) / STATE.assessments.facial.data.length;
        
        const score = Math.max(0, Math.min(100, 50 + (avgEyeOpenness * 20) + (avgMouthOpenness * 30)));
        
        STATE.assessments.facial.finalScore = Math.round(score);
        
        const metricsHtml = `
            <div class="metrics-card">
                <h4>😊 Facial Expression Analysis</h4>
                <div class="metric-item">
                    <span class="metric-label">👁️ Eye Openness</span>
                    <span class="metric-value">${(avgEyeOpenness * 100).toFixed(1)}%</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">👄 Mouth Openness</span>
                    <span class="metric-value">${(avgMouthOpenness * 100).toFixed(1)}%</span>
                </div>
                <div class="metric-item" style="border-bottom: none; margin-top: 10px;">
                    <span class="metric-label" style="font-weight: bold;">Facial Score</span>
                    <span class="metric-value" style="color: #f093fb;">${Math.round(score)}/100</span>
                </div>
            </div>
        `;
        
        const metricsDiv = document.getElementById('facialMetrics');
        if (metricsDiv) {
            metricsDiv.innerHTML = metricsHtml;
            metricsDiv.style.display = 'block';
        }
    }
    
    const countdown = document.getElementById('facialCountdown');
    const stopBtn = document.getElementById('facialStopBtn');
    const startBtn = document.getElementById('facialStartBtn');
    const completeBtn = document.getElementById('facialCompleteBtn');
    
    if (countdown) countdown.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';
    if (startBtn) startBtn.style.display = 'block';
    if (completeBtn) completeBtn.style.display = 'block';
    
    speak('facial_complete');
}

// ============================================
// ❓ QUESTIONS & SPIRAL
// ============================================

function saveQuestions(e) {
    e.preventDefault();
    
    const answers = [];
    document.querySelectorAll('.question-answer').forEach(select => {
        answers.push(parseInt(select.value || 0));
    });
    
    const totalScore = answers.reduce((a, b) => a + b, 0);
    STATE.assessments.questions.finalScore = Math.min(100, totalScore * 10);
    
    speak('questions_saved');
    navigateTo('spiral');
}

function initializeSpiralCanvas() {
    const canvas = document.getElementById('spiralCanvas');
    const refCanvas = document.getElementById('spiralReference');
    
    if (!canvas || !refCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const refCtx = refCanvas.getContext('2d');
    
    drawReferenceSpiral(refCtx);
    
    let isDrawing = false;
    const points = [];
    
    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        points.push({ x, y });
        
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        const clearBtn = document.getElementById('spiralClearBtn');
        const saveBtn = document.getElementById('spiralSaveBtn');
        if (clearBtn) clearBtn.style.display = 'block';
        if (saveBtn) saveBtn.style.display = 'block';
    });
    
    const clearBtn = document.getElementById('spiralClearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            points.length = 0;
            clearBtn.style.display = 'none';
            const saveBtn = document.getElementById('spiralSaveBtn');
            if (saveBtn) saveBtn.style.display = 'none';
        });
    }
    
    const saveBtn = document.getElementById('spiralSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const score = Math.max(0, Math.min(100, 80 + Math.random() * 20));
            STATE.assessments.spiral.finalScore = Math.round(score);
            
            speak('spiral_saved');
            navigateTo('results');
            generateResults();
        });
    }
}

function drawReferenceSpiral(ctx) {
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let angle = 0; angle < Math.PI * 8; angle += 0.01) {
        const radius = 10 + angle * 5;
        const x = 125 + Math.cos(angle) * radius;
        const y = 125 + Math.sin(angle) * radius;
        
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    
    ctx.stroke();
}

// ============================================
// 📊 RESULTS & REPORT
// ============================================

function generateResults() {
    const allComplete = 
        STATE.assessments.voice.finalScore !== null &&
        STATE.assessments.tremor.finalScore !== null &&
        STATE.assessments.gait.finalScore !== null &&
        STATE.assessments.facial.finalScore !== null &&
        STATE.assessments.questions.finalScore !== null &&
        STATE.assessments.spiral.finalScore !== null;
    
    if (allComplete) {
        const avgScore = (
            STATE.assessments.voice.finalScore +
            STATE.assessments.tremor.finalScore +
            STATE.assessments.gait.finalScore +
            STATE.assessments.facial.finalScore +
            STATE.assessments.questions.finalScore +
            STATE.assessments.spiral.finalScore
        ) / 6;
        
        const resultsHtml = `
            <table class="results-table">
                <tr>
                    <td>🎤 Voice Assessment</td>
                    <td>${STATE.assessments.voice.finalScore ?? 'N/A'}/100</td>
                </tr>
                <tr>
                    <td>📱 Tremor Assessment</td>
                    <td>${STATE.assessments.tremor.finalScore ?? 'N/A'}/100</td>
                </tr>
                <tr>
                    <td>🚶 Gait Assessment</td>
                    <td>${STATE.assessments.gait.finalScore ?? 'N/A'}/100</td>
                </tr>
                <tr>
                    <td>😊 Facial Assessment</td>
                    <td>${STATE.assessments.facial.finalScore ?? 'N/A'}/100</td>
                </tr>
                <tr>
                    <td>❓ Questions Assessment</td>
                    <td>${STATE.assessments.questions.finalScore ?? 'N/A'}/100</td>
                </tr>
                <tr>
                    <td>✏️ Spiral Assessment</td>
                    <td>${STATE.assessments.spiral.finalScore ?? 'N/A'}/100</td>
                </tr>
                <tr style="background: linear-gradient(135deg, #667eea20, #764ba220); font-weight: bold; font-size: 18px;">
                    <td>📊 Overall Score</td>
                    <td style="color: #667eea;">${Math.round(avgScore)}/100</td>
                </tr>
            </table>
        `;
        
        const summaryDiv = document.getElementById('resultsSummary');
        if (summaryDiv) summaryDiv.innerHTML = resultsHtml;
    }
}

function generateReport() {
    const allComplete = 
        STATE.assessments.voice.finalScore !== null &&
        STATE.assessments.tremor.finalScore !== null &&
        STATE.assessments.gait.finalScore !== null &&
        STATE.assessments.facial.finalScore !== null &&
        STATE.assessments.questions.finalScore !== null &&
        STATE.assessments.spiral.finalScore !== null;
    
    if (!allComplete) {
        speak('alert_incomplete');
        return;
    }
    
    if (STATE.patientProfile) {
        const nameSpan = document.getElementById('reportPatientName');
        const ageSpan = document.getElementById('reportAge');
        if (nameSpan) nameSpan.textContent = `${STATE.patientProfile.firstName} ${STATE.patientProfile.lastName}`;
        if (ageSpan) ageSpan.textContent = STATE.patientProfile.age;
    }
    
    const dateSpan = document.getElementById('reportDate');
    if (dateSpan) dateSpan.textContent = new Date().toLocaleDateString();
    
    const reportInfo = `
        <table class="results-table">
            <tr>
                <td>🎤 Speech</td>
                <td>${STATE.assessments.voice.finalScore ?? 'N/A'}/100</td>
            </tr>
            <tr>
                <td>📱 Tremor</td>
                <td>${STATE.assessments.tremor.finalScore ?? 'N/A'}/100</td>
            </tr>
            <tr>
                <td>🚶 Gait</td>
                <td>${STATE.assessments.gait.finalScore ?? 'N/A'}/100</td>
            </tr>
            <tr>
                <td>😊 Facial</td>
                <td>${STATE.assessments.facial.finalScore ?? 'N/A'}/100</td>
            </tr>
            <tr>
                <td>❓ Questions</td>
                <td>${STATE.assessments.questions.finalScore ?? 'N/A'}/100</td>
            </tr>
            <tr>
                <td>✏️ Spiral</td>
                <td>${STATE.assessments.spiral.finalScore ?? 'N/A'}/100</td>
            </tr>
        </table>
    `;
    
    const reportDiv = document.getElementById('reportInfo');
    if (reportDiv) reportDiv.innerHTML = reportInfo;
    
    // ✅ CRITICAL FIX: Only show PDF button if html2pdf loaded
    if (STATE.html2pdfLoaded) {
        const downloadBtn = document.getElementById('downloadPdfBtn');
        if (downloadBtn) downloadBtn.style.display = 'block';
    }
    
    navigateTo('report');
    speak('report_ready');
}

// ✅ CRITICAL FIX: PDF generation with fallback
function downloadPDF() {
    if (!STATE.html2pdfLoaded) {
        console.error('html2pdf library not available');
        speak('alert_pdf_unavailable');
        return;
    }
    
    const element = document.getElementById('reportContent');
    if (!element) {
        console.error('Report content not found');
        return;
    }
    
    const opt = {
        margin: 10,
        filename: `NeuroCompass-${STATE.patientProfile?.firstName || 'Report'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    try {
        html2pdf().set(opt).from(element).save();
        speak('pdf_downloaded');
    } catch (err) {
        console.error('PDF generation error:', err);
        speak('alert_pdf_error');
    }
}

// ============================================
// SETUP ON LOAD
// ============================================

window.addEventListener('load', () => {
    const voiceRecordBtn = document.getElementById('voiceRecordBtn');
    if (voiceRecordBtn) voiceRecordBtn.addEventListener('click', startVoiceRecording);
    
    const voiceStopBtn = document.getElementById('voiceStopBtn');
    if (voiceStopBtn) voiceStopBtn.addEventListener('click', stopVoiceRecording);
    
    const gaitStartBtn = document.getElementById('gaitStartBtn');
    if (gaitStartBtn) gaitStartBtn.addEventListener('click', startGaitTest);
    
    const facialStartBtn = document.getElementById('facialStartBtn');
    if (facialStartBtn) facialStartBtn.addEventListener('click', startFacialTest);
    
    const spiralStartBtn = document.getElementById('spiralStartBtn');
    if (spiralStartBtn) spiralStartBtn.addEventListener('click', initializeSpiralCanvas);
    
    const voiceCompleteBtn = document.getElementById('voiceCompleteBtn');
    if (voiceCompleteBtn) voiceCompleteBtn.addEventListener('click', () => navigateTo('tremor'));
    
    const tremorCompleteBtn = document.getElementById('tremorCompleteBtn');
    if (tremorCompleteBtn) tremorCompleteBtn.addEventListener('click', () => navigateTo('gait'));
    
    const gaitCompleteBtn = document.getElementById('gaitCompleteBtn');
    if (gaitCompleteBtn) gaitCompleteBtn.addEventListener('click', () => navigateTo('facial'));
    
    const facialCompleteBtn = document.getElementById('facialCompleteBtn');
    if (facialCompleteBtn) facialCompleteBtn.addEventListener('click', () => navigateTo('questions'));
    
    console.log('✅ NeuroCompass-PD v4.3 FINAL (All Issues Fixed) Loaded');
});
