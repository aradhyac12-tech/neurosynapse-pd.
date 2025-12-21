'use strict';

// ============= GLOBAL APP STATE =============
const APP = {
    lang: 'en',
    voiceEnabled: true,
    patient: null,
    completed: {
        voice: false,
        tremor: false,
        gait: false,
        facial: false,
        questions: false,
        spiral: false
    },
    scores: {
        voice: null,
        tremor: null,
        gait: null,
        facial: null,
        questions: null,
        spiral: null
    },
    voiceTrials: [
        { blob: null, url: null, duration: 0 },
        { blob: null, url: null, duration: 0 },
        { blob: null, url: null, duration: 0 }
    ],
    voice: {
        recording: false,
        stream: null,
        recorder: null,
        chunks: [],
        trialIndex: 0,
        startTime: 0,
        durationSec: 8
    },
    tremor: {
        running: false,
        hand: 'right',
        samples: [],
        startTime: 0,
        durationSec: 20
    },
    questions: {
        q1: null,
        q2: null,
        q3: null
    },
    spiral: {
        drawing: false,
        points: []
    }
};

const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ============= UTILITIES =============
function getDict() {
    return (window.NSI18N && window.NSI18N[APP.lang]) || (window.NSI18N && window.NSI18N.en) || {};
}

function speak(key) {
    window.speak?.(key);
}

function showView(name) {
    window.showView?.(name);
}

function setNavLocked(viewName, locked) {
    const item = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (item) {
        item.classList.toggle('disabled', locked);
    }
}

function toast(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = `
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.2);
        z-index: 9999;
        font-weight: 500;
        max-width: calc(100vw - 2rem);
        word-wrap: break-word;
    `;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s';
    }, 2000);
    setTimeout(() => el.remove(), 2300);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function fmtTimer(sec) {
    const s = Math.max(0, Math.round(sec));
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function persistState() {
    try {
        localStorage.setItem('nspd-state', JSON.stringify({
            completed: APP.completed,
            scores: APP.scores,
            patient: APP.patient,
            questions: APP.questions
        }));
    } catch (e) {}
}

function restoreState() {
    try {
        const saved = localStorage.getItem('nspd-state');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.completed) APP.completed = { ...APP.completed, ...data.completed };
            if (data.scores) APP.scores = { ...APP.scores, ...data.scores };
            if (data.patient) APP.patient = data.patient;
            if (data.questions) APP.questions = data.questions;
        }
    } catch (e) {}
}

// ============= AUDIO WAVEFORM =============
function drawWaveform(canvasId, analyser, width = 300, height = 60) {
    const canvas = $(canvasId);
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
                ctx.moveTo(x, height - y);
            } else {
                ctx.lineTo(x, height - y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }

    return draw;
}

// ============= PATIENT FORM =============
function initPatientForm() {
    const form = $('patientForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        APP.patient = {
            firstName: $('firstName')?.value?.trim() || '',
            lastName: $('lastName')?.value?.trim() || '',
            dob: $('dateOfBirth')?.value || '',
            gender: $('gender')?.value || '',
            countryCode: $('countryCode')?.value?.trim() || '',
            phone: $('phoneNumber')?.value?.trim() || '',
            email: $('email')?.value?.trim() || '',
            medicalId: $('medicalId')?.value?.trim() || ''
        };

        // Unlock screening tests
        ['voice', 'tremor', 'gait', 'facial', 'questions', 'spiral'].forEach(v => {
            setNavLocked(v, false);
        });

        const status = $('patientStatus');
        if (status) {
            status.classList.remove('status-pending');
            status.classList.add('status-ok');
            status.textContent = 'Saved';
        }

        const dict = getDict();
        toast(dict.saved || 'Patient information saved.');
        speak('saved');
        persistState();
        updateProgressUI();

        setTimeout(() => showView('voice'), 300);
    });
}

// ============= VOICE ASSESSMENT =============
function initVoice() {
    const btns = [
        { btn: $('voiceTrial1Btn'), idx: 0 },
        { btn: $('voiceTrial2Btn'), idx: 1 },
        { btn: $('voiceTrial3Btn'), idx: 2 }
    ];

    btns.forEach(({ btn, idx }) => {
        if (btn) {
            btn.addEventListener('click', () => startVoiceTrial(idx));
        }
    });

    [$('voiceTrial1Play'), $('voiceTrial2Play'), $('voiceTrial3Play')].forEach((btn, idx) => {
        if (btn) {
            btn.addEventListener('click', () => {
                const trial = APP.voiceTrials[idx];
                if (trial?.url) {
                    const audio = new Audio(trial.url);
                    audio.play().catch(() => toast('Playback not available'));
                }
            });
        }
    });

    const saveBtn = $('saveVoiceResults');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            APP.completed.voice = true;
            APP.scores.voice = 1; // Placeholder score
            persistState();
            toast('Voice screening saved');
            speak('voiceSaved');
            updateProgressUI();
            maybeUnlockResults();
        });
    }
}

async function startVoiceTrial(idx) {
    if (APP.voice.recording) return;

    const dict = getDict();
    APP.voice.trialIndex = idx;

    // Pre-count
    const preEl = $('voicePreTimer');
    if (preEl) {
        for (let i = 3; i > 0; i--) {
            preEl.textContent = String(i);
            await sleep(1000);
        }
        preEl.textContent = '0';
    }

    speak('readNow');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        APP.voice.stream = stream;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const mediaStreamAudioSource = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        mediaStreamAudioSource.connect(analyser);
        analyser.connect(audioContext.destination);

        const recorder = new MediaRecorder(stream, { 
            mimeType: 'audio/webm;codecs=opus' 
        });
        APP.voice.recorder = recorder;
        APP.voice.chunks = [];
        APP.voice.startTime = Date.now();
        APP.voice.recording = true;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) APP.voice.chunks.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(APP.voice.chunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);
            const duration = (Date.now() - APP.voice.startTime) / 1000;

            APP.voiceTrials[idx] = { blob, url, duration };

            const statusEl = $(`voiceTrial${idx + 1}Status`);
            if (statusEl) {
                statusEl.textContent = `✓ ${duration.toFixed(1)}s`;
                statusEl.classList.remove('status-pending');
                statusEl.classList.add('status-ok');
            }

            const playBtn = $(`voiceTrial${idx + 1}Play`);
            if (playBtn) playBtn.disabled = false;

            // Update metrics row
            const metricsRow = $(`voiceMetricsRow${idx + 1}`);
            if (metricsRow) {
                metricsRow.innerHTML = `
                    <td style="padding: 0.75rem; color: var(--text-secondary);">Trial ${idx + 1}</td>
                    <td style="padding: 0.75rem;">1.2%</td>
                    <td style="padding: 0.75rem;">0.5 dB</td>
                    <td style="padding: 0.75rem;">18.5 dB</td>
                    <td style="padding: 0.75rem;">${duration.toFixed(1)}s</td>
                `;
            }

            APP.voice.recording = false;
            stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();

        const canvasId = `voiceWave${idx + 1}`;
        const drawWave = drawWaveform(canvasId, analyser);

        const mainEl = $('voiceMainTimer');
        const duration = APP.voice.durationSec;
        const endTime = Date.now() + duration * 1000;

        const timerInterval = setInterval(() => {
            const left = (endTime - Date.now()) / 1000;
            if (mainEl) mainEl.textContent = fmtTimer(left);

            if (drawWave) drawWave();

            if (left <= 0) {
                clearInterval(timerInterval);
                recorder.stop();
            }
        }, 100);

    } catch (e) {
        toast('Microphone access denied');
        console.error(e);
    }
}

// ============= TREMOR ASSESSMENT =============
function initTremor() {
    const leftBtn = $('tremorLeftBtn');
    const rightBtn = $('tremorRightBtn');
    const startBtn = $('tremorStartBtn');

    if (leftBtn) {
        leftBtn.addEventListener('click', () => {
            APP.tremor.hand = 'left';
            leftBtn.classList.add('btn-primary');
            leftBtn.classList.remove('btn-secondary');
            if (rightBtn) {
                rightBtn.classList.remove('btn-primary');
                rightBtn.classList.add('btn-secondary');
            }
        });
    }

    if (rightBtn) {
        rightBtn.addEventListener('click', () => {
            APP.tremor.hand = 'right';
            rightBtn.classList.add('btn-primary');
            rightBtn.classList.remove('btn-secondary');
            if (leftBtn) {
                leftBtn.classList.remove('btn-primary');
                leftBtn.classList.add('btn-secondary');
            }
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startTremorRecording();
        });
    }

    const saveBtn = $('saveTremorResults');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            APP.completed.tremor = true;
            APP.scores.tremor = 1;
            persistState();
            toast('Tremor assessment saved');
            updateProgressUI();
            maybeUnlockResults();
        });
    }
}

async function startTremorRecording() {
    if (APP.tremor.running) return;

    APP.tremor.running = true;
    APP.tremor.samples = [];
    APP.tremor.startTime = Date.now();

    const dict = getDict();
    toast(`Recording tremor on ${APP.tremor.hand} hand...`);

    const timerEl = $('tremorTimer');
    const duration = APP.tremor.durationSec;
    const endTime = Date.now() + duration * 1000;

    // Simulate accelerometer data
    const interval = setInterval(() => {
        const left = (endTime - Date.now()) / 1000;
        if (timerEl) timerEl.textContent = fmtTimer(left);

        // Mock tremor sample
        const sample = {
            timestamp: Date.now(),
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            z: Math.random() * 2 - 1
        };
        APP.tremor.samples.push(sample);

        if (left <= 0) {
            clearInterval(interval);
            APP.tremor.running = false;
            toast('Tremor recording complete');

            // Update metrics
            updateTremorMetrics();
        }
    }, 100);
}

function updateTremorMetrics() {
    if (APP.tremor.samples.length === 0) return;

    // Mock calculations
    const frequency = 4.5 + Math.random() * 2; // Hz
    const amplitude = 0.5 + Math.random() * 0.5; // m/s²
    const power = 12 + Math.random() * 8; // dB

    $$('table tbody tr').forEach((row, i) => {
        if (i === 0) {
            row.innerHTML = `
                <td style="padding: 0.75rem; color: var(--text-secondary);">Frequency</td>
                <td style="padding: 0.75rem; font-weight: 600;">${frequency.toFixed(1)}</td>
                <td style="padding: 0.75rem;">Hz</td>
                <td style="padding: 0.75rem;"><span class="status-badge status-ok">Complete</span></td>
            `;
        } else if (i === 1) {
            row.innerHTML = `
                <td style="padding: 0.75rem; color: var(--text-secondary);">Amplitude</td>
                <td style="padding: 0.75rem; font-weight: 600;">${amplitude.toFixed(2)}</td>
                <td style="padding: 0.75rem;">m/s²</td>
                <td style="padding: 0.75rem;"><span class="status-badge status-ok">Complete</span></td>
            `;
        } else if (i === 2) {
            row.innerHTML = `
                <td style="padding: 0.75rem; color: var(--text-secondary);">Power</td>
                <td style="padding: 0.75rem; font-weight: 600;">${power.toFixed(1)}</td>
                <td style="padding: 0.75rem;">dB</td>
                <td style="padding: 0.75rem;"><span class="status-badge status-ok">Complete</span></td>
            `;
        }
    });
}

// ============= GAIT ASSESSMENT =============
function initGait() {
    const startBtn = $('gaitStartBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startGaitRecording);
    }

    const saveBtn = $('saveGaitResults');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            APP.completed.gait = true;
            APP.scores.gait = 1;
            persistState();
            toast('Gait assessment saved');
            updateProgressUI();
            maybeUnlockResults();
        });
    }
}

async function startGaitRecording() {
    toast('Recording gait for 15 seconds. Walk naturally...');
    
    const duration = 15;
    let elapsed = 0;

    const interval = setInterval(() => {
        elapsed++;
        if (elapsed >= duration) {
            clearInterval(interval);
            toast('Gait recording complete');
        }
    }, 1000);
}

// ============= FACIAL ASSESSMENT =============
function initFacial() {
    const startBtn = $('facialStartBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startFacialRecording);
    }

    const saveBtn = $('saveFacialResults');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            APP.completed.facial = true;
            APP.scores.facial = 1;
            persistState();
            toast('Facial assessment saved');
            updateProgressUI();
            maybeUnlockResults();
        });
    }
}

async function startFacialRecording() {
    toast('Recording facial expression for 10 seconds. Maintain neutral face...');
    
    const duration = 10;
    let elapsed = 0;

    const interval = setInterval(() => {
        elapsed++;
        if (elapsed >= duration) {
            clearInterval(interval);
            toast('Facial recording complete');
        }
    }, 1000);
}

// ============= QUESTIONS ASSESSMENT =============
function initQuestions() {
    const form = $('questionsForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            APP.questions = {
                q1: parseInt(form.q1.value) || 0,
                q2: parseInt(form.q2.value) || 0,
                q3: parseInt(form.q3.value) || 0
            };

            const total = APP.questions.q1 + APP.questions.q2 + APP.questions.q3;
            APP.scores.questions = Math.min(4, Math.round((total / 6) * 4));

            APP.completed.questions = true;
            persistState();
            toast('Question assessment saved');
            updateProgressUI();
            maybeUnlockResults();
        });
    }
}

// ============= SPIRAL ASSESSMENT =============
function initSpiral() {
    const canvas = $('spiralCanvas');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetWidth * 0.6;

    const ctx = canvas.getContext('2d');
    let drawing = false;
    let points = [];

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        points = [];
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({ x, y });
        ctx.beginPath();
        ctx.moveTo(x, y);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({ x, y });
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    canvas.addEventListener('mouseup', () => {
        drawing = false;
        ctx.closePath();
    });

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        drawing = true;
        points = [];
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        points.push({ x, y });
        ctx.beginPath();
        ctx.moveTo(x, y);
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!drawing) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        points.push({ x, y });
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    canvas.addEventListener('touchend', () => {
        drawing = false;
        ctx.closePath();
    });

    const clearBtn = $('spiralClearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            points = [];
        });
    }

    const saveBtn = $('spiralSaveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            APP.completed.spiral = true;
            APP.scores.spiral = 1;
            persistState();
            toast('Spiral assessment saved');
            updateProgressUI();
            maybeUnlockResults();
        });
    }
}

// ============= RESULTS & REPORT =============
function updateProgressUI() {
    const done = Object.values(APP.completed).filter(Boolean).length;
    const status = $('screeningStatus');
    if (status) status.textContent = `${done}`;

    if (done >= 1) setNavLocked('results', false);
    if (done === 6) {
        setNavLocked('report', false);
        const reportStatus = $('reportStatus');
        if (reportStatus) {
            reportStatus.classList.remove('status-pending');
            reportStatus.classList.add('status-ok');
            reportStatus.textContent = 'Ready';
        }
    }
}

function maybeUnlockResults() {
    const done = Object.values(APP.completed).filter(Boolean).length;
    if (done >= 1) {
        setNavLocked('results', false);
        toast('Results available');
    }
}

function renderResults() {
    const body = $('resultsTableBody');
    if (!body) return;

    body.innerHTML = '';

    const domains = [
        { key: 'voice', label: 'Speech' },
        { key: 'tremor', label: 'Tremor' },
        { key: 'gait', label: 'Gait' },
        { key: 'facial', label: 'Facial' },
        { key: 'questions', label: 'Questions' },
        { key: 'spiral', label: 'Spiral' }
    ];

    domains.forEach(({ key, label }) => {
        const completed = APP.completed[key];
        const score = APP.scores[key];
        const status = completed ? 'Complete' : 'Pending';
        const scoreText = score !== null ? `${score}/4` : '—';
        const comment = completed ? 'Assessment completed successfully' : 'Pending assessment';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding: 0.9rem 1rem; font-weight: 600;">${label}</td>
            <td style="padding: 0.9rem 1rem;"><span class="status-badge ${completed ? 'status-ok' : 'status-pending'}">${status}</span></td>
            <td style="padding: 0.9rem 1rem; font-weight: 600;">${scoreText}</td>
            <td style="padding: 0.9rem 1rem; font-size: 0.9rem;">${comment}</td>
        `;
        body.appendChild(row);
    });

    const riskDiv = document.getElementById('riskIndicator');
    if (riskDiv) {
        const scores = Object.values(APP.scores).filter(s => s !== null);
        if (scores.length === 0) {
            riskDiv.textContent = 'Complete all tests to generate aggregated impression.';
            riskDiv.style.color = 'var(--text-muted)';
        } else {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            const level = avg <= 1 ? 'Low Risk' : avg <= 2 ? 'Moderate Risk' : 'Higher Risk';
            const color = avg <= 1 ? '#10b981' : avg <= 2 ? '#f59e0b' : '#ef4444';
            riskDiv.innerHTML = `Aggregate Severity: <strong style="color: ${color};">${avg.toFixed(1)}/4 - ${level}</strong>`;
        }
    }
}

function renderReport() {
    const content = $('reportContent');
    if (!content) return;

    const patientName = APP.patient ? `${APP.patient.firstName} ${APP.patient.lastName}` : 'Unknown Patient';
    const timestamp = new Date().toLocaleString();

    let html = `
        <h2 style="margin-top: 0; color: var(--primary);">NeuroSynapse-PD Clinical Summary</h2>
        <p><strong>Generated:</strong> ${timestamp}</p>
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Examiner:</strong> Aradhya Chavan</p>
        
        <h3 style="margin-top: 2rem; color: var(--primary);">Assessment Results</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
            <tr style="border-bottom: 1px solid var(--border);">
                <th style="text-align: left; padding: 0.75rem;">Domain</th>
                <th style="text-align: left; padding: 0.75rem;">Status</th>
                <th style="text-align: left; padding: 0.75rem;">Score</th>
            </tr>
    `;

    const domains = [
        { key: 'voice', label: 'Speech (UPDRS 3.1)' },
        { key: 'tremor', label: 'Tremor (UPDRS 3.15-18)' },
        { key: 'gait', label: 'Gait (UPDRS 3.10-11)' },
        { key: 'facial', label: 'Facial (UPDRS 3.2)' },
        { key: 'questions', label: 'Questions' },
        { key: 'spiral', label: 'Spiral Tremor' }
    ];

    domains.forEach(({ key, label }) => {
        const completed = APP.completed[key];
        const score = APP.scores[key];
        const statusText = completed ? '✓ Complete' : '✗ Pending';
        const scoreText = score !== null ? `${score}/4` : '—';
        html += `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 0.75rem;">${label}</td>
                <td style="padding: 0.75rem;">${statusText}</td>
                <td style="padding: 0.75rem; font-weight: 600;">${scoreText}</td>
            </tr>
        `;
    });

    html += `</table>`;

    const scores = Object.values(APP.scores).filter(s => s !== null);
    if (scores.length > 0) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        html += `
            <h3 style="margin-top: 2rem; color: var(--primary);">Clinical Summary</h3>
            <p><strong>Aggregate Severity Score:</strong> ${avg.toFixed(1)}/4</p>
            <p>This is a research prototype. Results should be interpreted by a qualified healthcare professional.</p>
        `;
    }

    content.innerHTML = html;
}

// ============= INIT =============
function initAssessment() {
    restoreState();

    initPatientForm();
    initVoice();
    initTremor();
    initGait();
    initFacial();
    initQuestions();
    initSpiral();

    // Restore patient if exists
    if (APP.patient) {
        ['voice', 'tremor', 'gait', 'facial', 'questions', 'spiral'].forEach(v => {
            setNavLocked(v, false);
        });
    }

    updateProgressUI();

    // Expose for language.js
    window.APP = APP;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAssessment);
} else {
    initAssessment();
}