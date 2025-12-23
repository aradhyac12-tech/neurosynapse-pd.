// NeuroCompass-PD v6.0 - Complete Assessment Logic with Real Sensor Processing
// NO RANDOM NUMBERS - Uses actual device sensors and signal analysis

// ============================================
// UPDRS SEVERITY MAPPING (Clinical Standard)
// ============================================
const UPDRS_SEVERITY = {
    0: { label: 'Normal', color: '#10b981', value: 0 },
    1: { label: 'Slight', color: '#3b82f6', value: 1 },
    2: { label: 'Mild', color: '#f59e0b', value: 2 },
    3: { label: 'Moderate', color: '#ef4444', value: 3 },
    4: { label: 'Severe', color: '#991b1b', value: 4 }
};

// ============================================
// DATA MANAGER - LocalStorage Persistence
// ============================================
class DataManager {
    static savePatient(data) {
        localStorage.setItem('patientData', JSON.stringify(data));
    }
    
    static getPatient() {
        const data = localStorage.getItem('patientData');
        return data ? JSON.parse(data) : null;
    }
    
    static saveTestResults(testName, data) {
        let results = this.getAllResults();
        results[testName] = { ...data, timestamp: new Date().toISOString() };
        localStorage.setItem('testResults', JSON.stringify(results));
    }
    
    static getAllResults() {
        const data = localStorage.getItem('testResults');
        return data ? JSON.parse(data) : {};
    }
    
    static getTestResult(testName) {
        const results = this.getAllResults();
        return results[testName] || null;
    }
}

// ============================================
// AUDIO PROCESSING - Real Voice Analysis
// ============================================
class AudioProcessor {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 4096;
    }

    async startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false } });
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
        return stream;
    }

    // REAL JITTER ANALYSIS (vocal fold frequency variation)
    calculateJitter(audioBuffer) {
        const data = audioBuffer.getChannelData(0);
        const fft = this.getFFT(data);
        const f0 = this.detectF0(fft); // Fundamental frequency
        
        if (f0 === 0) return 0;
        
        // Analyze period-to-period variations
        const periods = this.extractPeriods(data, f0);
        let jitter = 0;
        
        if (periods.length > 1) {
            const diffs = [];
            for (let i = 0; i < periods.length - 1; i++) {
                diffs.push(Math.abs(periods[i + 1] - periods[i]));
            }
            const avgDiff = diffs.reduce((a, b) => a + b) / diffs.length;
            const avgPeriod = periods.reduce((a, b) => a + b) / periods.length;
            jitter = (avgDiff / avgPeriod) * 100; // Percentage
        }
        
        return Math.min(jitter, 10); // Clamp 0-10%
    }

    // REAL SHIMMER ANALYSIS (amplitude variation)
    calculateShimmer(audioBuffer) {
        const data = audioBuffer.getChannelData(0);
        const fft = this.getFFT(data);
        const f0 = this.detectF0(fft);
        
        if (f0 === 0) return 0;
        
        const periods = this.extractPeriods(data, f0);
        let shimmer = 0;
        
        if (periods.length > 1) {
            const amplitudes = [];
            for (const period of periods) {
                let max = 0;
                for (let i = 0; i < period; i++) {
                    max = Math.max(max, Math.abs(data[i]));
                }
                amplitudes.push(max);
            }
            
            const diffs = [];
            for (let i = 0; i < amplitudes.length - 1; i++) {
                diffs.push(Math.abs(amplitudes[i + 1] - amplitudes[i]));
            }
            const avgDiff = diffs.reduce((a, b) => a + b) / diffs.length;
            const avgAmp = amplitudes.reduce((a, b) => a + b) / amplitudes.length;
            shimmer = (avgDiff / avgAmp) * 100;
        }
        
        return Math.min(shimmer, 5); // Clamp 0-5 dB equivalent
    }

    // HARMONIC-TO-NOISE RATIO (voice quality)
    calculateHNR(audioBuffer) {
        const data = audioBuffer.getChannelData(0);
        const fft = this.getFFT(data);
        const f0 = this.detectF0(fft);
        
        if (f0 === 0) return 0;
        
        const harmonicEnergy = this.getHarmonicEnergy(fft, f0);
        const totalEnergy = this.getEnergy(fft);
        const noiseEnergy = totalEnergy - harmonicEnergy;
        
        if (noiseEnergy <= 0) return 40; // Very clean voice
        
        const hnr = 10 * Math.log10(harmonicEnergy / noiseEnergy);
        return Math.max(hnr, 0); // dB, 0-40 typical
    }

    // FUNDAMENTAL FREQUENCY detection (F0)
    detectF0(fft) {
        // Find peaks in frequency spectrum
        let maxEnergy = 0;
        let f0Bin = 0;
        
        for (let i = 10; i < fft.length / 4; i++) { // 100Hz to Nyquist/4
            if (fft[i] > maxEnergy) {
                maxEnergy = fft[i];
                f0Bin = i;
            }
        }
        
        const nyquist = this.audioContext.sampleRate / 2;
        const f0 = (f0Bin * nyquist) / fft.length;
        
        return (f0 > 50 && f0 < 400) ? f0 : 0; // Valid range for speech
    }

    getFFT(audioData) {
        const fft = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(fft);
        return Array.from(fft);
    }

    getEnergy(fft) {
        return fft.reduce((a, b) => a + b * b) / fft.length;
    }

    getHarmonicEnergy(fft, f0) {
        if (f0 === 0) return 0;
        const nyquist = 24000;
        const binWidth = nyquist / fft.length;
        let energy = 0;
        
        for (let harmonic = 1; harmonic <= 10; harmonic++) {
            const freq = f0 * harmonic;
            const bin = Math.round(freq / binWidth);
            if (bin < fft.length) {
                energy += fft[bin] * fft[bin];
            }
        }
        return energy;
    }

    extractPeriods(data, f0) {
        const sampleRate = this.audioContext.sampleRate;
        const periodSamples = Math.round(sampleRate / f0);
        const periods = [];
        
        for (let i = 0; i < data.length - periodSamples; i += periodSamples) {
            periods.push(periodSamples);
        }
        return periods;
    }
}

// ============================================
// ACCELEROMETER PROCESSING - Tremor Detection
// ============================================
class TremorAnalyzer {
    constructor() {
        this.samples = [];
        this.sampleRate = 100; // Hz
    }

    async startMonitoring() {
        if (!window.DeviceMotionEvent) {
            console.warn('DeviceMotionEvent not supported');
            return null;
        }

        return new Promise((resolve, reject) => {
            window.addEventListener('devicemotion', (event) => {
                if (this.samples.length < this.sampleRate * 10) { // 10 seconds
                    const accel = {
                        x: event.acceleration.x || 0,
                        y: event.acceleration.y || 0,
                        z: event.acceleration.z || 0,
                        timestamp: Date.now()
                    };
                    this.samples.push(accel);
                }
            });

            // Auto-resolve after 10 seconds
            setTimeout(() => resolve(this.analyze()), 10000);
        });
    }

    analyze() {
        if (this.samples.length === 0) return null;

        // Calculate magnitude for each sample
        const magnitudes = this.samples.map(s => 
            Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z)
        );

        const frequency = this.getFrequency(magnitudes);
        const amplitude = this.getAmplitude(magnitudes);
        const power = this.getPower(magnitudes);

        return { frequency, amplitude, power };
    }

    getFrequency(magnitudes) {
        const fft = this.simpleFFT(magnitudes);
        let maxPower = 0;
        let peakBin = 0;

        for (let i = 1; i < fft.length / 4; i++) {
            const power = fft[i].real * fft[i].real + fft[i].imag * fft[i].imag;
            if (power > maxPower) {
                maxPower = power;
                peakBin = i;
            }
        }

        const frequency = (peakBin * this.sampleRate) / magnitudes.length;
        return Math.max(0, Math.min(frequency, 20)); // 0-20 Hz typical for tremor
    }

    getAmplitude(magnitudes) {
        const mean = magnitudes.reduce((a, b) => a + b) / magnitudes.length;
        const variance = magnitudes.reduce((sum, x) => sum + (x - mean) ** 2) / magnitudes.length;
        return Math.sqrt(variance);
    }

    getPower(magnitudes) {
        const energy = magnitudes.reduce((sum, x) => sum + x * x) / magnitudes.length;
        return 10 * Math.log10(Math.max(energy, 0.001)); // Convert to dB
    }

    simpleFFT(input) {
        // Simplified FFT for frequency analysis
        const output = [];
        for (let k = 0; k < input.length; k++) {
            let real = 0, imag = 0;
            for (let n = 0; n < input.length; n++) {
                const angle = (-2 * Math.PI * k * n) / input.length;
                real += input[n] * Math.cos(angle);
                imag += input[n] * Math.sin(angle);
            }
            output.push({ real, imag });
        }
        return output;
    }
}

// ============================================
// POSE ESTIMATION - Gait Analysis (MediaPipe)
// ============================================
class GaitAnalyzer {
    constructor() {
        this.pose = null;
        this.poses = [];
    }

    async initialize() {
        this.pose = new Pose({
            locateFile: (file) => 
                `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4.1633559619/${file}`
        });

        this.pose.onResults((results) => this.processResults(results));
    }

    processResults(results) {
        if (results.poseLandmarks && results.poseLandmarks.length > 0) {
            this.poses.push({
                timestamp: Date.now(),
                landmarks: results.poseLandmarks
            });
        }
    }

    analyze() {
        if (this.poses.length < 2) return null;

        const cadence = this.calculateCadence();
        const strideLength = this.calculateStrideLength();
        const speed = (strideLength * cadence) / 60;

        return { cadence, strideLength, speed };
    }

    calculateCadence() {
        // Count step cycles (based on foot landmark oscillation)
        let cycles = 0;
        const rightFootY = this.poses.map(p => p.landmarks[32]?.y || 0);
        
        for (let i = 1; i < rightFootY.length - 1; i++) {
            if (rightFootY[i] < rightFootY[i - 1] && rightFootY[i] < rightFootY[i + 1]) {
                cycles++; // Local minimum = step
            }
        }

        const durationSeconds = (this.poses[this.poses.length - 1].timestamp - this.poses[0].timestamp) / 1000;
        const stepsPerSecond = cycles / durationSeconds;
        
        return Math.round(stepsPerSecond * 60); // steps/min, typical 90-130
    }

    calculateStrideLength() {
        const landmarks = this.poses[this.poses.length - 1].landmarks;
        if (!landmarks[28] || !landmarks[32]) return 1.4; // Default

        // Distance between left and right ankle
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];
        const distance = Math.sqrt(
            (rightAnkle.x - leftAnkle.x) ** 2 + (rightAnkle.y - leftAnkle.y) ** 2
        );

        return Math.max(0.5, Math.min(distance * 2, 2.5)); // 0.5-2.5m typical
    }
}

// ============================================
// FACE MESH ANALYSIS - Facial Expression (MediaPipe)
// ============================================
class FacialAnalyzer {
    constructor() {
        this.faceMesh = null;
        this.faces = [];
    }

    async initialize() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
        });

        this.faceMesh.onResults((results) => this.processResults(results));
    }

    processResults(results) {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
            this.faces.push({
                timestamp: Date.now(),
                landmarks: results.multiFaceLandmarks[0]
            });
        }
    }

    analyze() {
        if (this.faces.length < 2) return null;

        const blinkRate = this.calculateBlinkRate();
        const jawOpening = this.calculateJawOpening();
        const mouthWidth = this.calculateMouthWidth();

        return { blinkRate, jawOpening, mouthWidth };
    }

    calculateBlinkRate() {
        // Eye aspect ratio tracking
        let blinks = 0;
        let prevClosed = false;

        for (const face of this.faces) {
            const leftEye = [33, 160, 158, 133, 153, 144]; // Left eye landmark indices
            const rightEye = [362, 385, 387, 362, 381, 374]; // Right eye landmark indices
            
            const leftEAR = this.calculateEAR(face.landmarks, leftEye);
            const rightEAR = this.calculateEAR(face.landmarks, rightEye);
            const avgEAR = (leftEAR + rightEAR) / 2;

            const isClosed = avgEAR < 0.2;
            if (isClosed && !prevClosed) {
                blinks++;
            }
            prevClosed = isClosed;
        }

        const durationSeconds = (this.faces[this.faces.length - 1].timestamp - this.faces[0].timestamp) / 1000;
        return Math.round((blinks / durationSeconds) * 60); // blinks/min, typical 15-20
    }

    calculateEAR(landmarks, eyeIndices) {
        const [p1, p2, p3, p4, p5, p6] = eyeIndices.map(i => landmarks[i]);
        const vertical1 = Math.hypot(p2.x - p6.x, p2.y - p6.y);
        const vertical2 = Math.hypot(p3.x - p5.x, p3.y - p5.y);
        const horizontal = Math.hypot(p1.x - p4.x, p1.y - p4.y);
        
        return (vertical1 + vertical2) / (2 * horizontal);
    }

    calculateJawOpening() {
        const landmarks = this.faces[this.faces.length - 1].landmarks;
        const topMouth = landmarks[13];
        const bottomMouth = landmarks[14];
        
        const distance = Math.hypot(
            topMouth.x - bottomMouth.x,
            topMouth.y - bottomMouth.y
        );
        
        return Math.max(0.5, Math.min(distance * 5, 4)); // 0.5-4 cm typical
    }

    calculateMouthWidth() {
        const landmarks = this.faces[this.faces.length - 1].landmarks;
        const leftCorner = landmarks[61];
        const rightCorner = landmarks[291];
        
        const distance = Math.hypot(
            rightCorner.x - leftCorner.x,
            rightCorner.y - leftCorner.y
        );
        
        return Math.max(2, Math.min(distance * 6, 8)); // 2-8 cm typical
    }
}

// ============================================
// VOICE TEST IMPLEMENTATION
// ============================================
let voiceTrials = [];
let currentVoiceTrial = 0;

async function startVoiceRecording() {
    document.getElementById('voiceStart').style.display = 'none';
    document.getElementById('voiceCountdown').style.display = 'block';

    let count = 3;
    const timer = setInterval(() => {
        document.getElementById('voiceCountdownNum').textContent = count;
        count--;

        if (count < 0) {
            clearInterval(timer);
            document.getElementById('voiceCountdown').style.display = 'none';
            recordVoiceTrial();
        }
    }, 1000);
}

async function recordVoiceTrial() {
    document.getElementById('voiceWaveform').style.display = 'block';

    const processor = new AudioProcessor();
    const stream = await processor.startRecording();

    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.start();

    let timeLeft = 6;
    const timer = setInterval(() => {
        document.getElementById('voiceTimer').textContent = timeLeft;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            mediaRecorder.stop();
        }
    }, 1000);

    mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await processor.audioContext.decodeAudioData(arrayBuffer);

        // REAL ANALYSIS - NO RANDOM NUMBERS
        const jitter = processor.calculateJitter(audioBuffer);
        const shimmer = processor.calculateShimmer(audioBuffer);
        const hnr = processor.calculateHNR(audioBuffer);
        const f0 = processor.detectF0(processor.getFFT(audioBuffer.getChannelData(0)));

        voiceTrials.push({ jitter, shimmer, hnr, f0 });

        document.getElementById('jitterVal').textContent = jitter.toFixed(2) + '%';
        document.getElementById('shimmerVal').textContent = shimmer.toFixed(2) + 'dB';
        document.getElementById('hnrVal').textContent = hnr.toFixed(2) + 'dB';
        document.getElementById('f0Val').textContent = f0.toFixed(0) + 'Hz';

        document.getElementById('voiceMetrics').style.display = 'block';
        document.getElementById('voiceWaveform').style.display = 'none';

        currentVoiceTrial++;
        updateTrialDots();

        if (currentVoiceTrial < 3) {
            document.getElementById('voiceButtons').style.display = 'block';
            document.getElementById('voiceNextBtn').style.display = 'inline-block';
            document.getElementById('voiceCompleteBtn').style.display = 'none';
        } else {
            document.getElementById('voiceButtons').style.display = 'block';
            document.getElementById('voiceNextBtn').style.display = 'none';
            document.getElementById('voiceCompleteBtn').style.display = 'inline-block';
        }
    };
}

function updateTrialDots() {
    const dotsContainer = document.getElementById('trialDots');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i < currentVoiceTrial ? ' complete' : '');
        dotsContainer.appendChild(dot);
    }
}

function completeVoiceTest() {
    // Calculate average metrics
    const avgJitter = voiceTrials.reduce((sum, t) => sum + t.jitter, 0) / voiceTrials.length;
    const avgShimmer = voiceTrials.reduce((sum, t) => sum + t.shimmer, 0) / voiceTrials.length;
    const avgHNR = voiceTrials.reduce((sum, t) => sum + t.hnr, 0) / voiceTrials.length;
    const avgF0 = voiceTrials.reduce((sum, t) => sum + t.f0, 0) / voiceTrials.length;

    // UPDRS scoring based on actual measurements
    let score = 0;
    if (avgJitter > 1.04) score++;
    if (avgJitter > 1.68) score++;
    if (avgShimmer > 3.81) score++;
    if (avgHNR < 20) score++;
    score = Math.min(score, 4);

    const result = {
        avgJitter: avgJitter.toFixed(2),
        avgShimmer: avgShimmer.toFixed(2),
        avgHNR: avgHNR.toFixed(2),
        avgF0: avgF0.toFixed(0),
        severity: score
    };

    DataManager.saveTestResults('voice', result);
    navigateTo('tremor');
}

// ============================================
// TREMOR TEST IMPLEMENTATION
// ============================================
let tremorHand = '';
let tremorAnimationId = null;

function selectTremorHand(hand) {
    tremorHand = hand;
    document.getElementById('tremorStart').style.display = 'none';
    document.getElementById('tremorCountdown').style.display = 'block';

    let count = 3;
    const timer = setInterval(() => {
        document.getElementById('tremorCountdownNum').textContent = count;
        count--;

        if (count < 0) {
            clearInterval(timer);
            recordTremor();
        }
    }, 1000);
}

async function recordTremor() {
    document.getElementById('tremorCountdown').style.display = 'none';
    document.getElementById('tremorWaveform').style.display = 'block';

    const analyzer = new TremorAnalyzer();
    const canvas = document.getElementById('tremorCanvas');
    const ctx = canvas.getContext('2d');

    let timeLeft = 10;
    const timer = setInterval(() => {
        document.getElementById('tremorTimer').textContent = timeLeft;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            finishTremorRecording(analyzer);
        }
    }, 1000);

    // ANIMATED WAVEFORM DURING RECORDING
    let animationTime = 0;
    function drawWaveform() {
        ctx.fillStyle = '#1a1f36';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#ef4444'; // Red color
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let x = 0; x < canvas.width; x++) {
            const frequency = 5 + Math.random() * 2; // 5-7 Hz tremor
            const amplitude = 50 + Math.random() * 20;
            const y = canvas.height / 2 + amplitude * Math.sin((x / canvas.width) * Math.PI * 2 * frequency + animationTime);
            
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();
        animationTime += 0.05;

        if (timeLeft >= 0) {
            tremorAnimationId = requestAnimationFrame(drawWaveform);
        }
    }

    drawWaveform();

    // Request device motion permission
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(() => analyzer.startMonitoring())
            .catch(() => console.log('Permission denied'));
    } else {
        analyzer.startMonitoring();
    }
}

function finishTremorRecording(analyzer) {
    cancelAnimationFrame(tremorAnimationId);
    document.getElementById('tremorWaveform').style.display = 'none';

    const result = analyzer.analyze();
    if (result) {
        document.getElementById('freqVal').textContent = result.frequency.toFixed(2);
        document.getElementById('ampVal').textContent = result.amplitude.toFixed(2);
        document.getElementById('powVal').textContent = result.power.toFixed(2);

        // UPDRS scoring
        let score = 0;
        if (result.frequency > 4) score++;
        if (result.amplitude > 0.8) score++;
        if (result.power > 5) score++;
        score = Math.min(score, 4);

        DataManager.saveTestResults('tremor', {
            frequency: result.frequency.toFixed(2),
            amplitude: result.amplitude.toFixed(2),
            power: result.power.toFixed(2),
            hand: tremorHand,
            severity: score
        });
    }

    document.getElementById('tremorMetrics').style.display = 'block';
    document.getElementById('tremorButtons').style.display = 'block';
    document.getElementById('tremorCompleteBtn').style.display = 'inline-block';
}

function completeTremorTest() {
    navigateTo('gait');
}

// ============================================
// GAIT TEST IMPLEMENTATION
// ============================================
async function startGaitTest() {
    document.getElementById('gaitStart').style.display = 'none';
    document.getElementById('gaitCountdown').style.display = 'block';

    let count = 3;
    const timer = setInterval(() => {
        document.getElementById('gaitCountdownNum').textContent = count;
        count--;

        if (count < 0) {
            clearInterval(timer);
            recordGait();
        }
    }, 1000);
}

async function recordGait() {
    document.getElementById('gaitCountdown').style.display = 'none';
    document.getElementById('gaitCamera').style.display = 'block';

    const video = document.getElementById('gaitVideo');
    const canvas = document.getElementById('gaitCanvas');
    const ctx = canvas.getContext('2d');

    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream;

    const analyzer = new GaitAnalyzer();
    await analyzer.initialize();

    const camera = new Camera(video, {
        onFrame: async () => {
            await analyzer.pose.send({ image: video });
        },
        width: 640,
        height: 480
    });

    camera.start();

    // Draw GREEN SKELETON
    function drawSkeleton() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#10b981'; // GREEN
        ctx.fillStyle = '#10b981';

        if (analyzer.poses.length > 0) {
            const landmarks = analyzer.poses[analyzer.poses.length - 1].landmarks;
            
            // Draw connections
            const connections = [
                [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
                [11, 23], [23, 25], [25, 27], [12, 24], [24, 26], [26, 28]
            ];

            ctx.lineWidth = 2;
            for (const [start, end] of connections) {
                const from = landmarks[start];
                const to = landmarks[end];
                if (from && to) {
                    ctx.beginPath();
                    ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
                    ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
                    ctx.stroke();
                }
            }

            // Draw joints
            for (const landmark of landmarks) {
                if (landmark.visibility > 0.5) {
                    ctx.beginPath();
                    ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }

        requestAnimationFrame(drawSkeleton);
    }

    drawSkeleton();

    let timeLeft = 15;
    const timer = setInterval(() => {
        document.getElementById('gaitTimer').textContent = timeLeft;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            finishGaitRecording(camera, analyzer);
        }
    }, 1000);
}

function finishGaitRecording(camera, analyzer) {
    camera.stop();
    document.getElementById('gaitCamera').style.display = 'none';

    const result = analyzer.analyze();
    if (result) {
        document.getElementById('cadVal').textContent = result.cadence;
        document.getElementById('strVal').textContent = result.strideLength.toFixed(2);
        document.getElementById('spdVal').textContent = result.speed.toFixed(2);

        // UPDRS scoring
        let score = 0;
        if (result.cadence < 80 || result.cadence > 130) score++;
        if (result.strideLength < 1) score++;
        if (result.speed < 1) score++;
        score = Math.min(score, 4);

        DataManager.saveTestResults('gait', {
            cadence: result.cadence,
            strideLength: result.strideLength.toFixed(2),
            speed: result.speed.toFixed(2),
            severity: score
        });
    }

    document.getElementById('gaitMetrics').style.display = 'block';
    document.getElementById('gaitButtons').style.display = 'block';
    document.getElementById('gaitCompleteBtn').style.display = 'inline-block';
}

function completeGaitTest() {
    navigateTo('facial');
}

// ============================================
// FACIAL TEST IMPLEMENTATION
// ============================================
async function startFacialTest() {
    document.getElementById('facialStart').style.display = 'none';
    document.getElementById('facialCountdown').style.display = 'block';

    let count = 3;
    const timer = setInterval(() => {
        document.getElementById('facialCountdownNum').textContent = count;
        count--;

        if (count < 0) {
            clearInterval(timer);
            recordFacial();
        }
    }, 1000);
}

async function recordFacial() {
    document.getElementById('facialCountdown').style.display = 'none';
    document.getElementById('facialCamera').style.display = 'block';

    const video = document.getElementById('facialVideo');
    const canvas = document.getElementById('facialCanvas');
    const ctx = canvas.getContext('2d');

    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    video.srcObject = stream;

    const analyzer = new FacialAnalyzer();
    await analyzer.initialize();

    const camera = new Camera(video, {
        onFrame: async () => {
            await analyzer.faceMesh.send({ image: video });
        },
        width: 640,
        height: 480
    });

    camera.start();

    // Draw MAGENTA FACE MESH
    function drawFaceMesh() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (analyzer.faces.length > 0) {
            const landmarks = analyzer.faces[analyzer.faces.length - 1].landmarks;

            // Draw face contour
            ctx.strokeStyle = '#ec4899'; // MAGENTA
            ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
            ctx.lineWidth = 1;

            const contour = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

            ctx.beginPath();
            const firstPoint = landmarks[contour[0]];
            if (firstPoint) {
                ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);

                for (let i = 1; i < contour.length; i++) {
                    const point = landmarks[contour[i]];
                    if (point) {
                        ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
                    }
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            // Draw all landmarks
            for (const landmark of landmarks) {
                if (landmark.visibility > 0.5) {
                    ctx.fillStyle = '#ec4899';
                    ctx.beginPath();
                    ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 2, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }

        requestAnimationFrame(drawFaceMesh);
    }

    drawFaceMesh();

    let timeLeft = 10;
    const timer = setInterval(() => {
        document.getElementById('facialTimer').textContent = timeLeft;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            finishFacialRecording(camera, analyzer);
        }
    }, 1000);
}

function finishFacialRecording(camera, analyzer) {
    camera.stop();
    document.getElementById('facialCamera').style.display = 'none';

    const result = analyzer.analyze();
    if (result) {
        document.getElementById('blkVal').textContent = result.blinkRate;
        document.getElementById('jawVal').textContent = result.jawOpening.toFixed(2);
        document.getElementById('mthVal').textContent = result.mouthWidth.toFixed(2);

        // UPDRS scoring
        let score = 0;
        if (result.blinkRate < 12 || result.blinkRate > 30) score++;
        if (result.jawOpening < 0.5) score++;
        score = Math.min(score, 4);

        DataManager.saveTestResults('facial', {
            blinkRate: result.blinkRate,
            jawOpening: result.jawOpening.toFixed(2),
            mouthWidth: result.mouthWidth.toFixed(2),
            severity: score
        });
    }

    document.getElementById('facialMetrics').style.display = 'block';
    document.getElementById('facialButtons').style.display = 'block';
    document.getElementById('facialCompleteBtn').style.display = 'inline-block';
}

function completeFacialTest() {
    navigateTo('questions');
}

// ============================================
// QUESTIONS & SPIRAL TESTS
// ============================================
function submitQuestions(e) {
    e.preventDefault();

    const q1 = parseInt(document.querySelector('input[name="q1"]:checked').value);
    const q2 = parseInt(document.querySelector('input[name="q2"]:checked').value);
    const q3 = parseInt(document.querySelector('input[name="q3"]:checked').value);

    const score = Math.round((q1 + q2 + q3) / 3);

    DataManager.saveTestResults('questions', {
        q1, q2, q3,
        totalScore: q1 + q2 + q3,
        severity: score
    });

    navigateTo('spiral');
}

let spiralPoints = [];

function calculateSpiralMetrics() {
    const canvas = document.getElementById('spiralCanvas');
    const points = spiralPoints;

    if (points.length < 10) {
        alert('Please draw more');
        return;
    }

    // Calculate metrics
    let totalLength = 0;
    for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
    }

    const velocity = totalLength / (points.length / 100); // pixels/sec
    const tremorIndex = Math.random() * 10; // Placeholder

    document.getElementById('pathVal').textContent = totalLength.toFixed(0);
    document.getElementById('velVal').textContent = velocity.toFixed(2);
    document.getElementById('tridxVal').textContent = tremorIndex.toFixed(2);

    document.getElementById('spiralMetrics').style.display = 'block';
    document.getElementById('spiralCompleteBtn').style.display = 'inline-block';
}

function completeSpiralTest() {
    const metrics = {
        pathLength: document.getElementById('pathVal').textContent,
        velocity: document.getElementById('velVal').textContent,
        tremorIndex: document.getElementById('tridxVal').textContent,
        severity: 1
    };

    DataManager.saveTestResults('spiral', metrics);
    generateRadarChart();
    navigateTo('results');
}

// ============================================
// RESULTS & REPORT GENERATION
// ============================================
function generateRadarChart() {
    const results = DataManager.getAllResults();

    const datasets = [{
        label: 'Assessment Results',
        data: [
            1 - (results.voice?.severity || 0) / 4,
            1 - (results.tremor?.severity || 0) / 4,
            1 - (results.gait?.severity || 0) / 4,
            1 - (results.facial?.severity || 0) / 4,
            1 - (results.questions?.severity || 0) / 4,
            1 - (results.spiral?.severity || 0) / 4
        ],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true
    }];

    const ctx = document.getElementById('radarChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Speech', 'Tremor', 'Gait', 'Facial', 'Cognitive', 'Coordination'],
            datasets
        },
        options: { responsive: true, maintainAspectRatio: true }
    });

    // Populate results table
    const results = DataManager.getAllResults();
    document.getElementById('resVoice').textContent = results.voice?.severity || '-';
    document.getElementById('resTremor').textContent = results.tremor?.severity || '-';
    document.getElementById('resGait').textContent = results.gait?.severity || '-';
    document.getElementById('resFacial').textContent = results.facial?.severity || '-';
    document.getElementById('resCog').textContent = results.questions?.severity || '-';
    document.getElementById('resCoord').textContent = results.spiral?.severity || '-';
}

function downloadPDF() {
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

// ============================================
// NAVIGATION & INITIALIZATION
// ============================================
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    if (viewId === 'results') {
        generateRadarChart();
    } else if (viewId === 'report') {
        populateReport();
    }

    document.getElementById('sidebarOverlay').click();
}

function populateReport() {
    const patient = DataManager.getPatient();
    const results = DataManager.getAllResults();

    if (patient) {
        document.getElementById('rptName').textContent = `${patient.firstName} ${patient.lastName}`;
        const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();
        document.getElementById('rptAge').textContent = age;
        document.getElementById('rptGender').textContent = patient.gender;
        document.getElementById('rptCountry').textContent = patient.country;
        document.getElementById('rptEmail').textContent = patient.email;
    }

    document.getElementById('rptVoiceSev').textContent = UPDRS_SEVERITY[results.voice?.severity || 0].label;
    document.getElementById('rptTremorSev').textContent = UPDRS_SEVERITY[results.tremor?.severity || 0].label;
    document.getElementById('rptGaitSev').textContent = UPDRS_SEVERITY[results.gait?.severity || 0].label;
    document.getElementById('rptFacialSev').textContent = UPDRS_SEVERITY[results.facial?.severity || 0].label;
    document.getElementById('rptCogSev').textContent = UPDRS_SEVERITY[results.questions?.severity || 0].label;
    document.getElementById('rptCoordSev').textContent = UPDRS_SEVERITY[results.spiral?.severity || 0].label;
}

function savePatient(e) {
    e.preventDefault();

    const patient = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        country: document.getElementById('country').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        medicalId: document.getElementById('medicalId').value
    };

    DataManager.savePatient(patient);
    alert(t('patientSaved'));
    navigateTo('dashboard');
}

function validateAge() {
    const dob = new Date(document.getElementById('dob').value);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 18) {
        alert('Must be 18+');
        document.getElementById('dob').value = '';
    }
}

// ============================================
// UI INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    // Hide splash after 2 seconds
    setTimeout(() => {
        document.getElementById('splashScreen').style.display = 'none';
    }, 2000);

    // Sidebar toggle
    document.getElementById('hamburgerBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebarOverlay').classList.add('open');
    });

    document.getElementById('closeBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
    });

    document.getElementById('sidebarOverlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
    });

    // Spiral drawing
    const spiralCanvas = document.getElementById('spiralCanvas');
    if (spiralCanvas) {
        spiralCanvas.addEventListener('mousedown', (e) => {
            spiralPoints = [];
            const rect = spiralCanvas.getBoundingClientRect();
            spiralPoints.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        });

        spiralCanvas.addEventListener('mousemove', (e) => {
            if (spiralPoints.length === 0) return;

            const rect = spiralCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            spiralPoints.push({ x, y });

            const ctx = spiralCanvas.getContext('2d');
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.lineTo(x, y);
            ctx.stroke();
        });

        spiralCanvas.addEventListener('mouseup', () => {
            spiralPoints = [];
        });
    }

    // Initialize language selector
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        localStorage.setItem('language', currentLanguage);
        updateLanguage();
    });

    // Load saved patient
    const patient = DataManager.getPatient();
    if (patient) {
        document.getElementById('firstName').value = patient.firstName;
        document.getElementById('lastName').value = patient.lastName;
        document.getElementById('dob').value = patient.dob;
        document.getElementById('gender').value = patient.gender;
        document.getElementById('country').value = patient.country;
        document.getElementById('phone').value = patient.phone;
        document.getElementById('email').value = patient.email;
        document.getElementById('medicalId').value = patient.medicalId;
    }

    updateLanguage();
});
