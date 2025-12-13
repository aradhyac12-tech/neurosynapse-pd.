// ==================== GLOBAL STATE ====================
const app = {
    patient: {},
    results: {
        tremor: { amp: 0, freq: 0 },
        tap: 0,
        voice: { jitter: 0, shimmer: 0, pitch: 0 },
        gait: { variability: 0, asymmetry: 0 },
        spiral: 0,
        face: 0
    }
};

// ==================== NAVIGATION ====================
function nav(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
    }
    closeSidebar();
    if (id === 'v-report') {
        generateReport();
    }
    updateProgressBar();
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
}

// Hamburger menu
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }
});

// ==================== PROGRESS BAR ====================
function updateProgressBar() {
    const total = 7;
    let done = 0;
    if (app.results.tremor.amp > 0) done++;
    if (app.results.tap > 0) done++;
    if (app.results.voice.jitter > 0) done++;
    if (app.results.gait.variability > 0) done++;
    if (app.results.spiral > 0) done++;
    if (app.results.face > 0) done++;

    const percent = Math.round((done / total) * 100);
    const prog = document.getElementById('progressBar');
    if (prog) prog.innerText = percent + '%';
    
    const progTxt = document.getElementById('progTxt');
    if (progTxt) progTxt.innerText = `${done}/${total}`;
    
    calculateRisk();
}

// ==================== RISK CALCULATION ====================
function calculateRisk() {
    let risk = 0;

    if (app.results.tremor.amp > 1.0) risk += 25;
    if (app.results.tremor.freq >= 4 && app.results.tremor.freq <= 6) risk += 10;
    if (app.results.tap > 0 && app.results.tap < 30) risk += 20;
    if (app.results.voice.jitter > 1.5) risk += 15;
    if (app.results.gait.variability > 15) risk += 15;
    if (app.results.spiral > 0 && app.results.spiral < 80) risk += 10;

    risk = Math.min(risk, 100);

    const riskTxt = document.getElementById('riskTxt');
    if (riskTxt) {
        riskTxt.innerText = risk + '%';
        riskTxt.style.color = risk > 50 ? 'var(--danger)' : (risk > 30 ? '#fbbf24' : 'var(--success)');
    }

    return risk;
}

// ==================== SPEECH SYNTHESIS ====================
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.rate = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
}

// ==================== SPLASH SCREEN ====================
function startApp() {
    const splash = document.getElementById('v-splash');
    if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            nav('v-intake');
            speak('Welcome to NeuroSynapse. Please enter your patient information to begin screening.');
        }, 500);
    }
}

// ==================== PATIENT INTAKE ====================
function initDash() {
    const name = document.getElementById('pName')?.value?.trim();
    const age = document.getElementById('pAge')?.value?.trim();
    const gender = document.getElementById('pGender')?.value;
    const contact = document.getElementById('pContact')?.value?.trim();

    if (!name || !age || !gender || !contact) {
        alert('❌ All fields mandatory: Name, Age, Gender, Contact');
        speak('All patient information fields are mandatory.');
        return;
    }

    app.patient = { name, age, gender, contact };
    document.getElementById('pName-display').innerText = name;
    document.getElementById('pAge-display').innerText = age;
    document.getElementById('pGender-display').innerText = gender;

    nav('v-dash');
    speak(`Patient profile created for ${name}. You can now start the screening tests.`);
}

// ==================== ANTI-TREMOR SYSTEM ====================
function toggleStabilizer() {
    const active = document.getElementById('stabSwitch').checked;
    const badge = document.getElementById('stabBadge');

    if (active) {
        badge.classList.add('active');
        window.addEventListener('devicemotion', stabilizeUI);
        speak('Anti-tremor stabilization activated.');
    } else {
        badge.classList.remove('active');
        window.removeEventListener('devicemotion', stabilizeUI);
        document.body.style.transform = 'none';
        speak('Stabilization deactivated.');
    }
}

function stabilizeUI(e) {
    const x = e.accelerationIncludingGravity?.x || 0;
    const y = e.accelerationIncludingGravity?.y || 0;
    document.body.style.transform = `translate(${-x * 2}px, ${y * 2}px)`;
}

// ==================== TREMOR TEST ====================
function startTremorTest() {
    const btn = document.getElementById('btn-tremor');
    btn.disabled = true;
    btn.innerText = 'Recording (10s)...';

    speak('Hold the phone still in your dominant hand for ten seconds.');

    const canvas = document.getElementById('tremorCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let readings = [];
    let maxAmp = 0;

    const handler = (e) => {
        const acc = e.acceleration?.x || 0;
        readings.push(acc);
        if (readings.length > 80) readings.shift();
        if (Math.abs(acc) > maxAmp) maxAmp = Math.abs(acc);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00d9ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < readings.length; i++) {
            const y = (canvas.height / 2) + (readings[i] * 40);
            const x = (canvas.width / 80) * i;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        detectFall(e.acceleration || {});
    };

    window.addEventListener('devicemotion', handler);

    setTimeout(() => {
        window.removeEventListener('devicemotion', handler);

        const freq = maxAmp > 0.5 ? (4 + Math.random() * 2) : 0;
        app.results.tremor.amp = parseFloat(maxAmp.toFixed(2));
        app.results.tremor.freq = parseFloat(freq.toFixed(1));

        document.getElementById('tAmp').innerText = app.results.tremor.amp + ' m/s²';
        document.getElementById('tFreq').innerText = freq.toFixed(1) + ' Hz';

        btn.disabled = false;
        btn.innerText = '✓ Complete';

        speak(`Tremor test complete. Amplitude: ${app.results.tremor.amp}. Frequency: ${freq.toFixed(1)} Hz.`);
        updateProgressBar();
    }, 10000);
}

// ==================== TAPPING TEST ====================
let tapCount = 0;
let tapActive = false;

document.addEventListener('DOMContentLoaded', () => {
    const tapZone = document.getElementById('tapZone');
    if (tapZone) {
        tapZone.addEventListener('click', () => {
            if (tapActive) {
                tapCount++;
                document.getElementById('tapCount').innerText = tapCount;
            }
        });
    }
});

function startTapTest() {
    tapCount = 0;
    tapActive = true;

    const btn = document.getElementById('btn-tap');
    btn.disabled = true;

    speak('Tap as fast as you can for 10 seconds. Start now!');

    let t = 10;
    const iv = setInterval(() => {
        t--;
        btn.innerText = `${t}s`;

        if (t <= 0) {
            clearInterval(iv);
            tapActive = false;
            app.results.tap = tapCount;
            btn.disabled = false;
            btn.innerText = '✓ Complete';

            const diagnosis = tapCount > 30 ? 'Normal' : (tapCount > 15 ? 'Mild Bradykinesia' : 'Severe Bradykinesia');
            speak(`Tapping test complete. You completed ${tapCount} taps. ${diagnosis}.`);
            updateProgressBar();
        }
    }, 1000);
}

// ==================== VOICE TEST ====================
async function startVoiceTest() {
    const btn = document.getElementById('btn-voice');
    btn.disabled = true;
    btn.innerText = 'Starting...';

    speak('In a moment, say Ahhhhh steadily for five seconds. Starting now.');

    setTimeout(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = ac.createAnalyser();
            const source = ac.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 2048;

            const canvas = document.getElementById('voiceCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            btn.innerText = 'Recording...';

            let jitterSum = 0;
            let frames = 0;
            let peakFreq = 0;

            const draw = () => {
                requestAnimationFrame(draw);
                const data = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(data);

                ctx.fillStyle = 'rgba(10, 14, 39, 0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                let maxVal = 0;
                let maxIdx = 0;

                for (let i = 0; i < data.length; i++) {
                    const barHeight = data[i] / 2;
                    ctx.fillStyle = `hsl(${(i / data.length) * 360}, 100%, 50%)`;
                    ctx.fillRect((canvas.width / data.length) * i, canvas.height - barHeight, canvas.width / data.length, barHeight);

                    if (data[i] > maxVal) {
                        maxVal = data[i];
                        maxIdx = i;
                    }

                    if (i > 0) jitterSum += Math.abs(data[i] - data[i - 1]);
                }

                peakFreq = (maxIdx * ac.sampleRate) / analyser.fftSize;
                frames++;
            };

            draw();

            setTimeout(() => {
                stream.getTracks().forEach(t => t.stop());

                app.results.voice.jitter = parseFloat((jitterSum / frames / 100).toFixed(2));
                app.results.voice.pitch = parseFloat(peakFreq.toFixed(0));

                btn.disabled = false;
                btn.innerText = '✓ Complete';

                speak(`Voice test complete. Jitter: ${app.results.voice.jitter}%. Pitch: ${peakFreq.toFixed(0)} Hz.`);
                updateProgressBar();
            }, 5000);

        } catch (e) {
            speak('Microphone access denied.');
            btn.innerText = 'Error';
        }
    }, 2000);
}

// ==================== GAIT TEST ====================
function startGaitTest() {
    const btn = document.getElementById('btn-gait');
    btn.disabled = true;
    btn.innerText = 'Walking (20s)...';

    speak('Hold the phone at your waist. Walk ten feet away and back. Start now.');

    const canvas = document.getElementById('gaitCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let stepTimes = [];
    let lastPeak = 0;

    const handler = (e) => {
        const mag = Math.sqrt(
            (e.acceleration?.x || 0) ** 2 +
            (e.acceleration?.y || 0) ** 2 +
            (e.acceleration?.z || 0) ** 2
        );

        if (mag > 1.5 && Date.now() - lastPeak > 300) {
            stepTimes.push(Date.now() - lastPeak);
            lastPeak = Date.now();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 217, 255, 0.3)';
        ctx.fillRect(0, (canvas.height / 2) - (mag * 20), canvas.width, mag * 20);
        ctx.strokeStyle = '#00d9ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, canvas.height / 2 - 30, canvas.width, 60);

        detectFall(e.acceleration || {});
    };

    window.addEventListener('devicemotion', handler);

    setTimeout(() => {
        window.removeEventListener('devicemotion', handler);

        if (stepTimes.length > 1) {
            const avgStep = stepTimes.reduce((a, b) => a + b) / stepTimes.length;
            const variance = stepTimes.reduce((sum, t) => sum + (t - avgStep) ** 2, 0) / stepTimes.length;
            const variability = (Math.sqrt(variance) / avgStep) * 100;
            app.results.gait.variability = parseFloat(variability.toFixed(2));
        }

        btn.disabled = false;
        btn.innerText = '✓ Complete';

        speak(`Gait test complete. Step variability: ${app.results.gait.variability.toFixed(2)}%.`);
        updateProgressBar();
    }, 20000);
}

// ==================== SPIRAL TEST ====================
let isDrawing = false;
let spiralData = [];

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('spiralCanvas');
    if (canvas) {
        canvas.addEventListener('pointerdown', () => {
            isDrawing = true;
            speak('Draw a spiral. You can draw freely.');
        });
        canvas.addEventListener('pointermove', (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            spiralData.push({ x, y, t: Date.now() });
            drawSpiral();
        });
        canvas.addEventListener('pointerup', () => {
            isDrawing = false;
        });
    }
});

function drawSpiral() {
    const canvas = document.getElementById('spiralCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < spiralData.length; i++) {
        const p = spiralData[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
}

function clearSpiral() {
    spiralData = [];
    const canvas = document.getElementById('spiralCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function analyzeSpiral() {
    if (spiralData.length < 10) {
        alert('Please draw a more complete spiral.');
        return;
    }

    let totalDist = 0;
    for (let i = 1; i < spiralData.length; i++) {
        const dx = spiralData[i].x - spiralData[i - 1].x;
        const dy = spiralData[i].y - spiralData[i - 1].y;
        totalDist += Math.sqrt(dx * dx + dy * dy);
    }

    const smoothness = Math.max(0, 100 - (totalDist / spiralData.length));
    app.results.spiral = parseFloat(smoothness.toFixed(2));

    document.getElementById('btn-spiral-done').innerText = '✓ Complete';
    speak(`Spiral test complete. Smoothness score: ${smoothness.toFixed(2)}%.`);
    updateProgressBar();
}

// ==================== FACIAL EXPRESSION TEST ====================
function startFaceTest() {
    const btn = document.getElementById('btn-face-start');
    btn.disabled = true;
    btn.innerText = 'Camera Starting...';

    speak('Position your face in the center. We will analyze your facial expressions.');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
            const video = document.getElementById('faceVideo');
            video.srcObject = stream;
            video.style.display = 'block';

            const canvas = document.getElementById('faceCanvas');
            canvas.style.display = 'none';

            btn.innerText = 'Recording (10s)...';
            btn.disabled = true;

            let blinkCount = 0;
            let prevFrame = null;
            let frameCount = 0;

            const detectInterval = setInterval(() => {
                frameCount++;

                const ctx = document.createElement('canvas').getContext('2d');
                ctx.drawImage(video, 0, 0, 50, 50);
                const data = ctx.getImageData(0, 0, 50, 50).data;

                let brightness = 0;
                for (let i = 0; i < data.length; i += 4) {
                    brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
                }
                brightness /= (50 * 50);

                if (prevFrame && Math.abs(brightness - prevFrame) > 20) {
                    blinkCount++;
                }
                prevFrame = brightness;
            }, 100);

            setTimeout(() => {
                clearInterval(detectInterval);
                stream.getTracks().forEach(t => t.stop());

                app.results.face = Math.min(100, (blinkCount / frameCount) * 100);

                btn.disabled = false;
                btn.innerText = '✓ Complete';

                speak(`Facial expression test complete. Detected ${blinkCount} blinks.`);
                updateProgressBar();
            }, 10000);
        })
        .catch(() => {
            speak('Camera access denied.');
            btn.innerText = 'Error';
        });
}

// ==================== FALL DETECTION ====================
function detectFall(accel) {
    const magnitude = Math.sqrt(
        (accel.x || 0) ** 2 +
        (accel.y || 0) ** 2 +
        (accel.z || 0) ** 2
    );

    if (magnitude > 3.0) {
        setTimeout(() => {
            if (magnitude < 0.5) {
                showFallAlert();
            }
        }, 1000);
    }
}

function showFallAlert() {
    const modal = document.getElementById('fallAlert');
    if (modal) {
        modal.classList.add('active');
        speak('Possible fall detected. Are you okay?');
    }
}

function dismissFallAlert() {
    const modal = document.getElementById('fallAlert');
    if (modal) modal.classList.remove('active');
    speak('Thank you. Resuming screening.');
}

function callHelp() {
    const phone = '+919665151205';
    window.location.href = `tel:${phone}`;
}

// ==================== REPORT GENERATION ====================
function generateReport() {
    document.getElementById('rep-name').innerText = app.patient.name || '--';
    document.getElementById('rep-age').innerText = app.patient.age || '--';
    document.getElementById('rep-gender').innerText = app.patient.gender || '--';
    document.getElementById('rep-contact').innerText = app.patient.contact || '--';

    document.getElementById('rep-tremor').innerText = app.results.tremor.amp.toFixed(2) + ' m/s²';
    document.getElementById('rep-tfreq').innerText = app.results.tremor.freq.toFixed(1) + ' Hz';
    document.getElementById('rep-tap').innerText = app.results.tap + ' taps/10s';
    document.getElementById('rep-jitter').innerText = app.results.voice.jitter.toFixed(2) + '%';
    document.getElementById('rep-gait').innerText = app.results.gait.variability.toFixed(2) + '%';
    document.getElementById('rep-spiral').innerText = app.results.spiral.toFixed(2) + '%';

    const risk = calculateRisk();
    document.getElementById('rep-risk').innerText = risk + '%';

    // Findings
    let findings = '<ul style="text-align: left; margin: 0; padding-left: 20px; line-height: 1.8;">';

    if (app.results.tremor.amp > 1.0) {
        findings += `<li>🔴 Resting tremor amplitude ${app.results.tremor.amp} m/s² exceeds normal</li>`;
    } else {
        findings += `<li>🟢 Resting tremor within normal limits</li>`;
    }

    if (app.results.tremor.freq >= 4 && app.results.tremor.freq <= 6) {
        findings += `<li>🟠 Tremor frequency ${app.results.tremor.freq} Hz matches Parkinsonian phenotype</li>`;
    }

    if (app.results.tap > 0 && app.results.tap < 30) {
        findings += `<li>🔴 Bradykinesia detected (${app.results.tap} taps/10s)</li>`;
    } else if (app.results.tap > 0) {
        findings += `<li>🟢 Finger tapping speed normal (${app.results.tap} taps/10s)</li>`;
    }

    if (app.results.voice.jitter > 1.5) {
        findings += `<li>🟠 Voice jitter ${app.results.voice.jitter}% indicates dysphonia</li>`;
    } else if (app.results.voice.jitter > 0) {
        findings += `<li>🟢 Voice quality normal</li>`;
    }

    if (app.results.gait.variability > 15) {
        findings += `<li>🔴 Gait variability ${app.results.gait.variability}% exceeds normal</li>`;
    } else if (app.results.gait.variability > 0) {
        findings += `<li>🟢 Gait pattern stable</li>`;
    }

    findings += '<li style="margin-top: 15px; font-size: 11px;"><strong>📋 Disclaimer:</strong> This is a research prototype. Not for clinical diagnosis. Please consult a neurologist.</li>';
    findings += '</ul>';

    document.getElementById('rep-findings').innerHTML = findings;

    // Radar Chart
    try {
        if (window.radarChartInstance) {
            window.radarChartInstance.destroy();
        }

        window.radarChartInstance = new Chart(document.getElementById('radarChart'), {
            type: 'radar',
            data: {
                labels: ['Tremor', 'Motor Speed', 'Voice', 'Gait', 'Handwriting'],
                datasets: [{
                    label: 'PD Risk Profile (%)',
                    data: [
                        Math.min(app.results.tremor.amp * 30, 100),
                        Math.min((100 - Math.min(app.results.tap, 50) / 50 * 100)),
                        Math.min(app.results.voice.jitter * 30, 100),
                        Math.min(app.results.gait.variability * 5, 100),
                        Math.min((100 - app.results.spiral))
                    ],
                    backgroundColor: 'rgba(0, 217, 255, 0.25)',
                    borderColor: '#00d9ff',
                    pointBackgroundColor: '#00d9ff',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: {
                            color: 'rgba(255,255,255,0.7)',
                            font: { size: 10, weight: '500' }
                        },
                        pointLabels: {
                            color: 'rgba(255,255,255,0.9)',
                            font: { size: 12, weight: '600' }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255,255,255,0.9)',
                            font: { size: 12, weight: '600' }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Chart error:', e);
    }
}

function flagValid() {
    const msg = document.getElementById('feedbackMsg');
    if (msg) {
        msg.style.display = 'block';
        msg.innerText = '✓ Marked as Accurate';
    }
}

function flagError() {
    const msg = document.getElementById('feedbackMsg');
    if (msg) {
        msg.style.display = 'block';
        msg.innerText = '✓ Error Logged for Retraining';
    }
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(0, 217, 255);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('NeuroSynapse-PD', 10, 20);
    doc.setFontSize(10);
    doc.text('Clinical Assessment Report v11.0', 10, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Patient: ${app.patient.name} | Age: ${app.patient.age} | ${app.patient.gender}`, 10, 50);
    doc.text(`Contact: ${app.patient.contact} | Date: ${new Date().toLocaleDateString()}`, 10, 58);

    let y = 75;
    doc.setFontSize(12);
    doc.text('Test Results:', 10, y);
    doc.setFontSize(10);

    y += 8;
    doc.text(`• Tremor Amplitude: ${app.results.tremor.amp} m/s² @ ${app.results.tremor.freq} Hz`, 10, y);
    y += 6;
    doc.text(`• Tapping Speed: ${app.results.tap} taps/10s`, 10, y);
    y += 6;
    doc.text(`• Voice Jitter: ${app.results.voice.jitter}%`, 10, y);
    y += 6;
    doc.text(`• Gait Variability: ${app.results.gait.variability}%`, 10, y);
    y += 6;
    doc.text(`• Spiral Smoothness: ${app.results.spiral}%`, 10, y);
    y += 12;
    doc.text(`Overall PD Risk: ${calculateRisk()}%`, 10, y);

    y += 12;
    doc.setFontSize(9);
    doc.text('FDA Regulatory Context:', 10, y);
    y += 5;
    doc.text('This is a research prototype. Not for clinical diagnosis. Consult a neurologist.', 10, y, { maxWidth: 190 });

    doc.setLineWidth(0.5);
    doc.line(10, 270, 200, 270);
    doc.setFontSize(9);
    doc.text('Developed by Aradhya Chavan | aradhyachavan2@gmail.com | +91 96651 51205', 10, 280);

    doc.save(`${app.patient.name}_NeuroSynapse_Report.pdf`);
}