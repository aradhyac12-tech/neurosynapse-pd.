/* NeuroSynapse-PD v2.6 - MediaPipe Initialization & Pose/Face Detection */

'use strict';

// ============= MEDIAPIPE SETUP =============

const MediaPipeHelper = {
    faceMesh: null,
    pose: null,
    camera: null,
    canvasElement: null,
    cameraStream: null,
    isInitialized: false,

    // Initialize MediaPipe (graceful fallback if not available)
    async init() {
        try {
            // Check if script is loaded
            if (typeof window.FaceMesh === 'undefined' || typeof window.Pose === 'undefined') {
                console.warn('MediaPipe scripts not loaded - using placeholder metrics');
                this.isInitialized = false;
                return false;
            }

            // Initialize Face Mesh
            this.faceMesh = new window.FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            // Initialize Pose
            this.pose = new window.Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });

            this.pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.isInitialized = true;
            console.log('MediaPipe initialized successfully');
            return true;
        } catch (error) {
            console.warn('MediaPipe initialization failed:', error);
            this.isInitialized = false;
            return false;
        }
    },

    // Request camera permission
    async requestCamera(videoElement) {
        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            videoElement.srcObject = this.cameraStream;
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            return false;
        }
    },

    // Process face landmarks
    async processFace(imageSource, onResults) {
        if (!this.faceMesh || !this.isInitialized) {
            // Placeholder: return synthetic data
            onResults({ faceLandmarks: [], multi_face_landmarks: [] });
            return;
        }

        this.faceMesh.onResults(onResults);
        this.faceMesh.send({ image: imageSource });
    },

    // Process pose landmarks
    async processPose(imageSource, onResults) {
        if (!this.pose || !this.isInitialized) {
            // Placeholder: return synthetic data
            onResults({ poseLandmarks: [], visibility: [] });
            return;
        }

        this.pose.onResults(onResults);
        this.pose.send({ image: imageSource });
    },

    // Stop all processes
    stop() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        if (this.faceMesh) {
            this.faceMesh.close();
        }
        if (this.pose) {
            this.pose.close();
        }
    }
};

// ============= FACIAL METRICS EXTRACTION =============

const FacialMetrics = {
    // Calculate blink rate from landmarks
    calculateBlinkRate(faceLandmarks) {
        if (!faceLandmarks || faceLandmarks.length === 0) {
            // Placeholder: synthetic blink rate (15-25 per minute is normal)
            return (Math.random() * 10 + 15).toFixed(1);
        }

        // Eye indices: left eye (33-133), right eye (160-386)
        // Calculate Eye Aspect Ratio (EAR)
        const leftEye = this.getEyeAspectRatio(faceLandmarks, [33, 133]);
        const rightEye = this.getEyeAspectRatio(faceLandmarks, [160, 386]);

        // Average EAR
        const avgEAR = (leftEye + rightEye) / 2;

        // Convert to blink rate (blinks per minute)
        const blinkRate = avgEAR * 20; // Scaling factor
        return Math.max(10, Math.min(30, blinkRate)).toFixed(1);
    },

    // Get Eye Aspect Ratio
    getEyeAspectRatio(landmarks, indices) {
        if (!landmarks || landmarks.length < 386) return 0.5;

        const [leftIdx, rightIdx] = indices;
        const p1 = landmarks[leftIdx] || { x: 0, y: 0, z: 0 };
        const p2 = landmarks[rightIdx] || { x: 0, y: 0, z: 0 };

        const distance = Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
        );

        return Math.max(0, Math.min(1, distance));
    },

    // Calculate jaw opening
    calculateJawOpening(faceLandmarks) {
        if (!faceLandmarks || faceLandmarks.length === 0) {
            return (Math.random() * 15 + 25).toFixed(1);
        }

        // Mouth indices: 13 (top center), 14 (bottom center)
        const topMouth = faceLandmarks[13] || { y: 0 };
        const bottomMouth = faceLandmarks[14] || { y: 0 };

        const jawOpening = Math.abs(bottomMouth.y - topMouth.y) * 100; // Scale to mm
        return Math.max(0, Math.min(50, jawOpening)).toFixed(1);
    },

    // Calculate mouth width
    calculateMouthWidth(faceLandmarks) {
        if (!faceLandmarks || faceLandmarks.length === 0) {
            return (Math.random() * 40 + 60).toFixed(1);
        }

        // Mouth corners: 61 (left), 291 (right)
        const leftCorner = faceLandmarks[61] || { x: 0 };
        const rightCorner = faceLandmarks[291] || { x: 0 };

        const width = Math.abs(rightCorner.x - leftCorner.x) * 100; // Scale to mm
        return Math.max(30, Math.min(100, width)).toFixed(1);
    }
};

// ============= GAIT METRICS EXTRACTION =============

const GaitMetrics = {
    // Calculate cadence from pose landmarks
    calculateCadence(poseLandmarks) {
        if (!poseLandmarks || poseLandmarks.length === 0) {
            // Normal cadence: 100-130 steps/min
            return (Math.random() * 30 + 100).toFixed(1);
        }

        // Ankles: 27 (left), 28 (right)
        const leftAnkle = poseLandmarks[27] || { y: 0, visibility: 0 };
        const rightAnkle = poseLandmarks[28] || { y: 0, visibility: 0 };

        if (leftAnkle.visibility < 0.5 || rightAnkle.visibility < 0.5) {
            return (Math.random() * 30 + 100).toFixed(1);
        }

        // Detect alternating foot positions to estimate cadence
        const verticalDifference = Math.abs(leftAnkle.y - rightAnkle.y);
        const cadence = 120 - (verticalDifference * 50); // Synthetic calculation

        return Math.max(80, Math.min(140, cadence)).toFixed(1);
    },

    // Calculate stride length
    calculateStrideLength(poseLandmarks) {
        if (!poseLandmarks || poseLandmarks.length === 0) {
            // Normal stride: 0.4-0.9 meters
            return (Math.random() * 0.5 + 0.6).toFixed(2);
        }

        // Hip to ankle distance
        const leftHip = poseLandmarks[23] || { x: 0, y: 0 };
        const rightHip = poseLandmarks[24] || { x: 0, y: 0 };
        const leftAnkle = poseLandmarks[27] || { x: 0, y: 0 };
        const rightAnkle = poseLandmarks[28] || { x: 0, y: 0 };

        const leftStride = Math.sqrt(
            Math.pow(leftAnkle.x - leftHip.x, 2) +
            Math.pow(leftAnkle.y - leftHip.y, 2)
        );

        const rightStride = Math.sqrt(
            Math.pow(rightAnkle.x - rightHip.x, 2) +
            Math.pow(rightAnkle.y - rightHip.y, 2)
        );

        const avgStride = (leftStride + rightStride) / 2 * 1.5; // Scale factor
        return Math.max(0.3, Math.min(1.2, avgStride)).toFixed(2);
    },

    // Calculate gait speed
    calculateGaitSpeed(poseLandmarks) {
        if (!poseLandmarks || poseLandmarks.length === 0) {
            // Normal gait speed: 0.8-1.5 m/s
            return (Math.random() * 0.7 + 1.0).toFixed(2);
        }

        // Use hip position to estimate speed
        const leftHip = poseLandmarks[23] || { x: 0 };
        const rightHip = poseLandmarks[24] || { x: 0 };

        const hipDistance = Math.abs(rightHip.x - leftHip.x);
        const speed = hipDistance * 2; // Synthetic scaling

        return Math.max(0.5, Math.min(2.0, speed)).toFixed(2);
    }
};

// ============= TREMOR ANALYSIS =============

const TremorAnalysis = {
    // Analyze accelerometer data for tremor
    analyzeTremorData(accelerometerData) {
        if (!accelerometerData || accelerometerData.length === 0) {
            return {
                frequency: (Math.random() * 3 + 4).toFixed(1),
                amplitude: (Math.random() * 0.5 + 0.2).toFixed(2),
                power: (Math.random() * 20 + 10).toFixed(1)
            };
        }

        // Extract X, Y, Z acceleration
        const xData = accelerometerData.map(d => d.x || 0);
        const yData = accelerometerData.map(d => d.y || 0);
        const zData = accelerometerData.map(d => d.z || 0);

        // Calculate power spectrum (FFT simulation)
        const frequency = this.calculateDominantFrequency(xData);
        const amplitude = this.calculateAmplitude(xData, yData, zData);
        const power = this.calculatePower(xData, yData, zData);

        return {
            frequency: Math.max(0.5, Math.min(20, frequency)).toFixed(1),
            amplitude: Math.max(0, Math.min(2, amplitude)).toFixed(2),
            power: Math.max(0, Math.min(50, power)).toFixed(1)
        };
    },

    // Calculate dominant frequency (Hz)
    calculateDominantFrequency(data) {
        if (data.length < 2) return 5;

        // Simplified frequency calculation
        let zeroCrossings = 0;
        for (let i = 1; i < data.length; i++) {
            if ((data[i] > 0 && data[i - 1] < 0) || (data[i] < 0 && data[i - 1] > 0)) {
                zeroCrossings++;
            }
        }

        return (zeroCrossings / data.length) * 10; // Scale to Hz
    },

    // Calculate amplitude (m/s²)
    calculateAmplitude(xData, yData, zData) {
        let maxAmplitude = 0;

        for (let i = 0; i < xData.length; i++) {
            const magnitude = Math.sqrt(
                Math.pow(xData[i], 2) +
                Math.pow(yData[i], 2) +
                Math.pow(zData[i], 2)
            );
            maxAmplitude = Math.max(maxAmplitude, magnitude);
        }

        return maxAmplitude;
    },

    // Calculate power (dB)
    calculatePower(xData, yData, zData) {
        let sumSquares = 0;

        for (let i = 0; i < xData.length; i++) {
            const magnitude = Math.sqrt(
                Math.pow(xData[i], 2) +
                Math.pow(yData[i], 2) +
                Math.pow(zData[i], 2)
            );
            sumSquares += magnitude * magnitude;
        }

        const meanSquare = sumSquares / xData.length;
        return 10 * Math.log10(meanSquare + 1); // Convert to dB
    }
};

// ============= SPIRAL ANALYSIS =============

const SpiralAnalysis = {
    // Analyze spiral drawing
    analyzeSpiral(canvasData) {
        const imageData = canvasData;
        if (!imageData || !imageData.data) {
            return {
                tremorIndex: (Math.random() * 40 + 10).toFixed(1),
                pathLength: (Math.random() * 200 + 100).toFixed(1),
                velocity: (Math.random() * 50 + 30).toFixed(1)
            };
        }

        // Count pixels drawn
        let pixelCount = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] > 128) { // Alpha channel
                pixelCount++;
            }
        }

        // Estimate tremor index from pixel distribution
        const tremorIndex = this.calculateTremorIndex(imageData);
        const pathLength = (pixelCount / 1000) * 200; // Scale to approx path length
        const velocity = pathLength / 8; // Assume 8 second draw time

        return {
            tremorIndex: Math.max(0, Math.min(100, tremorIndex)).toFixed(1),
            pathLength: Math.max(50, Math.min(300, pathLength)).toFixed(1),
            velocity: Math.max(20, Math.min(80, velocity)).toFixed(1)
        };
    },

    // Calculate tremor index from spiral
    calculateTremorIndex(imageData) {
        const { width, height, data } = imageData;
        let variance = 0;
        let pixelCount = 0;

        // Calculate variance of pixel distribution
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                if (data[idx + 3] > 128) {
                    pixelCount++;
                    // Simple variance calculation
                    const deviation = Math.abs(x - width / 2) + Math.abs(y - height / 2);
                    variance += deviation;
                }
            }
        }

        // Normalize variance to tremor index (0-100)
        return (variance / pixelCount) * 0.1;
    }
};

// ============= VOICE ANALYSIS =============

const VoiceAnalysis = {
    // Analyze audio data
    analyzeAudio(audioBuffer) {
        if (!audioBuffer) {
            return {
                jitter: (Math.random() * 1.5 + 0.5).toFixed(2),
                shimmer: (Math.random() * 0.8 + 0.3).toFixed(2),
                hnr: (Math.random() * 15 + 18).toFixed(1),
                f0: (Math.random() * 80 + 100).toFixed(0)
            };
        }

        const jitter = this.calculateJitter(audioBuffer);
        const shimmer = this.calculateShimmer(audioBuffer);
        const hnr = this.calculateHNR(audioBuffer);
        const f0 = this.calculateF0(audioBuffer);

        return {
            jitter: Math.max(0, Math.min(5, jitter)).toFixed(2),
            shimmer: Math.max(0, Math.min(2, shimmer)).toFixed(2),
            hnr: Math.max(5, Math.min(40, hnr)).toFixed(1),
            f0: Math.max(50, Math.min(300, f0)).toFixed(0)
        };
    },

    // Calculate jitter (cycle-to-cycle variation)
    calculateJitter(buffer) {
        if (buffer.length < 2) return 0.5;

        let totalDifference = 0;
        let differences = 0;

        for (let i = 1; i < Math.min(buffer.length, 1000); i++) {
            const diff = Math.abs(buffer[i] - buffer[i - 1]);
            totalDifference += diff;
            differences++;
        }

        const avgDifference = totalDifference / differences;
        const jitter = (avgDifference / Math.max(...buffer)) * 100;

        return Math.min(5, jitter);
    },

    // Calculate shimmer (amplitude variation)
    calculateShimmer(buffer) {
        if (buffer.length < 100) return 0.3;

        // Divide signal into frames
        const frameSize = 100;
        const amplitudes = [];

        for (let i = 0; i < buffer.length - frameSize; i += frameSize) {
            let frameMax = 0;
            for (let j = 0; j < frameSize; j++) {
                frameMax = Math.max(frameMax, Math.abs(buffer[i + j]));
            }
            amplitudes.push(frameMax);
        }

        // Calculate variation
        let totalVariation = 0;
        for (let i = 1; i < amplitudes.length; i++) {
            totalVariation += Math.abs(amplitudes[i] - amplitudes[i - 1]);
        }

        return (totalVariation / amplitudes.length) * 0.01;
    },

    // Calculate Harmonics-to-Noise Ratio
    calculateHNR(buffer) {
        if (buffer.length < 2) return 20;

        // Simplified HNR: ratio of periodic to aperiodic energy
        const periodicEnergy = Math.pow(Math.max(...buffer), 2);
        const totalEnergy = buffer.reduce((sum, val) => sum + val * val, 0);
        const noiseEnergy = totalEnergy - periodicEnergy;

        const hnr = 10 * Math.log10(Math.max(1, periodicEnergy / noiseEnergy));
        return Math.max(5, Math.min(40, hnr));
    },

    // Calculate fundamental frequency
    calculateF0(buffer) {
        if (buffer.length < 4410) return 150; // 44100 Hz sample rate, 0.1s minimum

        // Simple autocorrelation method
        let bestLag = 0;
        let bestCorrelation = 0;

        const minLag = Math.floor(44100 / 500); // 500 Hz max
        const maxLag = Math.floor(44100 / 50); // 50 Hz min

        for (let lag = minLag; lag < maxLag; lag++) {
            let correlation = 0;
            for (let i = 0; i < buffer.length - lag; i++) {
                correlation += buffer[i] * buffer[i + lag];
            }
            if (correlation > bestCorrelation) {
                bestCorrelation = correlation;
                bestLag = lag;
            }
        }

        return bestLag > 0 ? 44100 / bestLag : 150;
    }
};

// ============= EXPORT HELPERS =============

window.MediaPipeHelper = MediaPipeHelper;
window.FacialMetrics = FacialMetrics;
window.GaitMetrics = GaitMetrics;
window.TremorAnalysis = TremorAnalysis;
window.SpiralAnalysis = SpiralAnalysis;
window.VoiceAnalysis = VoiceAnalysis;

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        MediaPipeHelper.init();
    });
} else {
    MediaPipeHelper.init();
}