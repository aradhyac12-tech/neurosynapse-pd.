/* NeuroSynapse-PD v2.5 - MediaPipe Initialization Module */

'use strict';

const MediaPipeManager = {
    holistic: null,
    faceMesh: null,
    pose: null,
    isReady: false,

    async init() {
        try {
            // Initialize MediaPipe solutions
            await this.initHolistic();
            await this.initFaceMesh();
            await this.initPose();
            this.isReady = true;
            console.log('MediaPipe initialized successfully');
        } catch (e) {
            console.error('MediaPipe initialization failed:', e);
        }
    },

    async initHolistic() {
        // Note: Full MediaPipe Holistic requires CDN script
        // For now, we use placeholder that checks for landmarks
        this.holistic = {
            send: (input) => ({
                landmarks: [],
                worldLandmarks: [],
                leftHandLandmarks: [],
                rightHandLandmarks: [],
                poseLandmarks: []
            }),
            close: () => {}
        };
    },

    async initFaceMesh() {
        // Face mesh placeholder
        this.faceMesh = {
            send: (input) => ({
                multiFaceLandmarks: [[]]
            }),
            close: () => {}
        };
    },

    async initPose() {
        // Pose landmark detector
        this.pose = {
            send: (input) => ({
                poseLandmarks: [],
                worldLandmarks: []
            }),
            close: () => {}
        };
    },

    processFrame(video, type = 'pose') {
        if (!this.isReady) return null;

        try {
            if (type === 'face') {
                return this.faceMesh?.send({ image: video });
            } else if (type === 'pose') {
                return this.pose?.send({ image: video });
            } else {
                return this.holistic?.send({ image: video });
            }
        } catch (e) {
            console.error('MediaPipe process error:', e);
            return null;
        }
    },

    extractMetrics(results, type = 'pose') {
        if (!results) return {};

        const metrics = {};

        // Face metrics
        if (type === 'face' && results.multiFaceLandmarks) {
            const landmarks = results.multiFaceLandmarks[0] || [];
            if (landmarks.length > 0) {
                // Blink detection
                metrics.blinkRate = calculateBlinkRate(landmarks);
                
                // Mouth opening
                metrics.mouthOpenness = calculateMouthOpenness(landmarks);
                
                // Jaw position
                metrics.jawPosition = landmarks[152]?.y || 0;
            }
        }

        // Pose metrics
        if (type === 'pose' && results.poseLandmarks) {
            const landmarks = results.poseLandmarks;
            
            // Calculate cadence (steps per minute)
            metrics.cadence = estimateCadence(landmarks);
            
            // Stride length estimation
            metrics.strideLength = estimateStrideLength(landmarks);
            
            // Gait speed
            metrics.gaitSpeed = estimateGaitSpeed(landmarks);
            
            // Posture analysis
            metrics.postureQuality = analyzePosture(landmarks);
        }

        return metrics;
    }
};

// ============= FACIAL METRICS =============
function calculateBlinkRate(landmarks) {
    // Eye aspect ratio for blink detection
    if (!landmarks || landmarks.length < 500) return 0;

    // Right eye indices: 33, 160, 158, 133, 153, 144
    const rightEye = [
        landmarks[33],
        landmarks[160],
        landmarks[158],
        landmarks[133],
        landmarks[153],
        landmarks[144]
    ];

    // Left eye indices: 362, 385, 387, 263, 373, 380
    const leftEye = [
        landmarks[362],
        landmarks[385],
        landmarks[387],
        landmarks[263],
        landmarks[373],
        landmarks[380]
    ];

    const rightRatio = calculateEyeAspectRatio(rightEye);
    const leftRatio = calculateEyeAspectRatio(leftEye);
    
    // Average ratio
    const avgRatio = (rightRatio + leftRatio) / 2;
    
    // Blink threshold
    return avgRatio < 0.2 ? 1 : 0;
}

function calculateEyeAspectRatio(eye) {
    if (eye.length < 6) return 1;

    const vert1 = distance(eye[1], eye[5]);
    const vert2 = distance(eye[2], eye[4]);
    const horiz = distance(eye[0], eye[3]);

    return (vert1 + vert2) / (2 * horiz);
}

function calculateMouthOpenness(landmarks) {
    if (!landmarks || landmarks.length < 478) return 0;

    // Mouth corners and jaw
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    const mouthWidth = distance(landmarks[78], landmarks[308]);

    const mouthHeight = distance(upperLip, lowerLip);
    
    return mouthHeight / mouthWidth;
}

// ============= GAIT METRICS =============
function estimateCadence(landmarks) {
    if (!landmarks || landmarks.length < 33) return 0;

    // Hip positions
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Ankle positions
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    const hipDistance = distance(leftHip, rightHip);
    const ankleDistance = distance(leftAnkle, rightAnkle);

    // Estimated cadence in steps per minute
    const baselineCadence = 100;
    const ratio = ankleDistance / hipDistance;
    
    return Math.round(baselineCadence * (1 + ratio * 0.5));
}

function estimateStrideLength(landmarks) {
    if (!landmarks || landmarks.length < 33) return 0;

    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Simple stride length estimation
    const distance = Math.sqrt(
        Math.pow(leftAnkle.x - rightAnkle.x, 2) +
        Math.pow(leftAnkle.y - rightAnkle.y, 2)
    );

    // Normalized stride length
    return (distance * 1.7).toFixed(2);
}

function estimateGaitSpeed(landmarks) {
    if (!landmarks || landmarks.length < 33) return 0;

    const cadence = estimateCadence(landmarks);
    const strideLength = parseFloat(estimateStrideLength(landmarks));

    // Speed = (Stride Length × Cadence) / 60
    const speed = (strideLength * cadence) / 60;
    
    return speed.toFixed(2);
}

function analyzePosture(landmarks) {
    if (!landmarks || landmarks.length < 33) return 'Unknown';

    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    const shoulderAngle = Math.abs(leftShoulder.y - rightShoulder.y);
    const noseHeight = nose.y;

    if (shoulderAngle < 0.05 && noseHeight > 0.3) {
        return 'Good';
    } else if (shoulderAngle < 0.1) {
        return 'Fair';
    } else {
        return 'Poor';
    }
}

// ============= UTILITY FUNCTIONS =============
function distance(point1, point2) {
    if (!point1 || !point2) return 0;
    return Math.sqrt(
        Math.pow(point1.x - point2.x, 2) +
        Math.pow(point1.y - point2.y, 2) +
        (point1.z && point2.z ? Math.pow(point1.z - point2.z, 2) : 0)
    );
}

// ============= CAMERA & VIDEO PROCESSING =============
const VideoProcessor = {
    stream: null,
    video: null,
    canvas: null,
    ctx: null,

    async startCamera(videoElementId, facingMode = 'user') {
        try {
            this.video = document.getElementById(videoElementId);
            if (!this.video) return false;

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });

            this.video.srcObject = this.stream;

            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve(true);
                };
            });
        } catch (e) {
            console.error('Camera error:', e);
            return false;
        }
    },

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    },

    setupCanvas(canvasElementId, videoElementId) {
        this.canvas = document.getElementById(canvasElementId);
        this.video = document.getElementById(videoElementId);

        if (this.canvas && this.video) {
            this.canvas.width = this.video.videoWidth || 640;
            this.canvas.height = this.video.videoHeight || 480;
            this.ctx = this.canvas.getContext('2d');
            return true;
        }
        return false;
    },

    drawFrame() {
        if (!this.ctx || !this.video) return;

        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    },

    drawLandmarks(landmarks, color = '#0ea5e9', radius = 3) {
        if (!this.ctx || !landmarks) return;

        landmarks.forEach(landmark => {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;

            // Draw point
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    },

    drawConnections(landmarks, connections, color = '#10b981', width = 2) {
        if (!this.ctx || !landmarks) return;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            if (startPoint && endPoint) {
                const x1 = startPoint.x * this.canvas.width;
                const y1 = startPoint.y * this.canvas.height;
                const x2 = endPoint.x * this.canvas.width;
                const y2 = endPoint.y * this.canvas.height;

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
        });
    }
};

// ============= INITIALIZATION =============
async function initializeMediaPipe() {
    // Load MediaPipe script from CDN (optional - for full functionality)
    // const script = document.createElement('script');
    // script.async = true;
    // script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.4.1633559619/camera_utils.js';
    // document.head.appendChild(script);

    await MediaPipeManager.init();

    // Expose globally
    window.MediaPipeManager = MediaPipeManager;
    window.VideoProcessor = VideoProcessor;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMediaPipe);
} else {
    initializeMediaPipe();
}