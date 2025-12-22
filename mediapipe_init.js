// MediaPipe Initialization - Pose & Face Mesh Detection
// For Gait and Facial expression assessment

let posePipeline = null;
let faceMeshPipeline = null;

// Initialize Pose Detection for Gait Test
async function initializePose() {
    const pose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469541/${file}`;
        }
    });

    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(onPoseResults);
    posePipeline = pose;
    return pose;
}

// Initialize Face Mesh for Facial Test
async function initializeFaceMesh() {
    const faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559686/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onFaceMeshResults);
    faceMeshPipeline = faceMesh;
    return faceMesh;
}

// Handle Pose Detection Results (Gait)
function onPoseResults(results) {
    const gaitCanvas = document.getElementById('gaitCanvas');
    if (!gaitCanvas) return;

    const ctx = gaitCanvas.getContext('2d');
    const width = gaitCanvas.width;
    const height = gaitCanvas.height;

    // Draw video frame
    const video = document.getElementById('gaitVideo');
    ctx.drawImage(video, 0, 0, width, height);

    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
        // Draw skeleton
        drawSkeleton(ctx, results.poseLandmarks, width, height);
        
        // Draw keypoints
        drawKeypoints(ctx, results.poseLandmarks, width, height);
    }
}

// Handle Face Mesh Results (Facial)
function onFaceMeshResults(results) {
    const facialCanvas = document.getElementById('facialCanvas');
    if (!facialCanvas) return;

    const ctx = facialCanvas.getContext('2d');
    const width = facialCanvas.width;
    const height = facialCanvas.height;

    // Draw video frame
    const video = document.getElementById('facialVideo');
    ctx.drawImage(video, 0, 0, width, height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        results.multiFaceLandmarks.forEach(landmarks => {
            // Draw face mesh
            drawFaceMesh(ctx, landmarks, width, height);
        });
    }
}

// Draw skeleton connections
function drawSkeleton(ctx, landmarks, width, height) {
    const connections = [
        // Body
        [11, 13], [13, 15],  // Left arm
        [12, 14], [14, 16],  // Right arm
        [11, 12],            // Shoulders
        [11, 23], [12, 24],  // Body to hips
        [23, 25], [25, 27],  // Left leg
        [24, 26], [26, 28],  // Right leg
        [23, 24]             // Hips
    ];

    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
        const startLandmark = landmarks[start];
        const endLandmark = landmarks[end];

        if (startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
            ctx.beginPath();
            ctx.moveTo(startLandmark.x * width, startLandmark.y * height);
            ctx.lineTo(endLandmark.x * width, endLandmark.y * height);
            ctx.stroke();
        }
    });
}

// Draw keypoints
function drawKeypoints(ctx, landmarks, width, height) {
    ctx.fillStyle = '#10b981';

    landmarks.forEach(landmark => {
        if (landmark.visibility > 0.5) {
            const x = landmark.x * width;
            const y = landmark.y * height;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

// Draw face mesh
function drawFaceMesh(ctx, landmarks, width, height) {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';

    // Draw face outline
    const faceOutline = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 
        378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 
        162, 21, 54, 103, 67, 109
    ];

    // Draw face connections
    ctx.beginPath();
    faceOutline.forEach((idx, i) => {
        const landmark = landmarks[idx];
        if (i === 0) {
            ctx.moveTo(landmark.x * width, landmark.y * height);
        } else {
            ctx.lineTo(landmark.x * width, landmark.y * height);
        }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Draw key landmarks
    const keyLandmarks = [
        33, 133,  // Eyes
        61, 291,  // Mouth corners
        152, 378  // Face sides
    ];

    ctx.fillStyle = '#0ea5e9';
    keyLandmarks.forEach(idx => {
        const landmark = landmarks[idx];
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Process video frame for Gait
async function processGaitFrame(video) {
    if (!posePipeline) {
        await initializePose();
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        await posePipeline.send({ image: canvas });
    }
}

// Process video frame for Facial
async function processFacialFrame(video) {
    if (!faceMeshPipeline) {
        await initializeFaceMesh();
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        await faceMeshPipeline.send({ image: canvas });
    }
}

// Gait metrics calculation from pose landmarks
function calculateGaitFromPose(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    // Get hip and ankle landmarks
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftHip || !rightHip || !leftAnkle || !rightAnkle) {
        return null;
    }

    // Calculate stride length from hip distance
    const hipDistance = Math.sqrt(
        Math.pow(leftHip.x - rightHip.x, 2) + 
        Math.pow(leftHip.y - rightHip.y, 2)
    );

    // Calculate vertical movement (for cadence estimation)
    const leftVerticalMovement = Math.abs(leftHip.y - leftAnkle.y);
    const rightVerticalMovement = Math.abs(rightHip.y - rightAnkle.y);

    return {
        hipDistance: hipDistance,
        leftVertical: leftVerticalMovement,
        rightVertical: rightVerticalMovement,
        stability: (leftVerticalMovement + rightVerticalMovement) / 2
    };
}

// Facial metrics calculation from face mesh
function calculateFacialFromMesh(landmarks) {
    if (!landmarks || landmarks.length === 0) return null;

    // Eye landmarks
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    
    // Mouth landmarks
    const mouthTop = landmarks[13];
    const mouthBottom = landmarks[14];
    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];

    if (!leftEye || !rightEye || !mouthTop || !mouthBottom) {
        return null;
    }

    // Calculate mouth opening
    const mouthOpening = Math.abs(mouthTop.y - mouthBottom.y);
    
    // Calculate mouth width
    const mouthWidth = Math.abs(mouthLeft.x - mouthRight.x);

    // Estimate blink rate from eye landmarks (simplified)
    const eyeDistance = Math.abs(leftEye.y - rightEye.y);

    return {
        mouthOpening: mouthOpening,
        mouthWidth: mouthWidth,
        eyeDistance: eyeDistance,
        facialSymmetry: Math.abs(leftEye.x - rightEye.x)
    };
}

// Start processing for Gait
function startGaitProcessing() {
    const video = document.getElementById('gaitVideo');
    if (!video) return;

    const process = async () => {
        await processGaitFrame(video);
        requestAnimationFrame(process);
    };

    process();
}

// Start processing for Facial
function startFacialProcessing() {
    const video = document.getElementById('facialVideo');
    if (!video) return;

    const process = async () => {
        await processFacialFrame(video);
        requestAnimationFrame(process);
    };

    process();
}

// Initialize all pipelines on load
window.addEventListener('load', async () => {
    try {
        await initializePose();
        await initializeFaceMesh();
        console.log('MediaPipe models loaded successfully');
    } catch (error) {
        console.error('Error initializing MediaPipe:', error);
    }
});

// Export functions for use in assessment.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializePose,
        initializeFaceMesh,
        startGaitProcessing,
        startFacialProcessing,
        calculateGaitFromPose,
        calculateFacialFromMesh
    };
}