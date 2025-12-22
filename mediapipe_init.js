// MediaPipe Initialization - Pose & Face Mesh Detection

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

    // Draw video frame is already done
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

    // Video is already drawn
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        results.multiFaceLandmarks.forEach(landmarks => {
            drawFaceMesh(ctx, landmarks, width, height);
        });
    }
}

// Draw skeleton connections
function drawSkeleton(ctx, landmarks, width, height) {
    const connections = [
        [11, 13], [13, 15],  // Left arm
        [12, 14], [14, 16],  // Right arm
        [11, 12],            // Shoulders
        [11, 23], [12, 24],  // Body to hips
        [23, 25], [25, 27],  // Left leg
        [24, 26], [26, 28],  // Right leg
        [23, 24]             // Hips
    ];

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
        if (start < landmarks.length && end < landmarks.length) {
            const startLandmark = landmarks[start];
            const endLandmark = landmarks[end];

            if (startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
                ctx.beginPath();
                ctx.moveTo(startLandmark.x * width, startLandmark.y * height);
                ctx.lineTo(endLandmark.x * width, endLandmark.y * height);
                ctx.stroke();
            }
        }
    });
}

// Draw keypoints
function drawKeypoints(ctx, landmarks, width, height) {
    ctx.fillStyle = '#00ff00';

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
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';

    // Draw face outline
    const faceOutline = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 
        378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 
        162, 21, 54, 103, 67, 109
    ];

    // Draw face connections
    ctx.beginPath();
    faceOutline.forEach((idx, i) => {
        if (idx < landmarks.length) {
            const landmark = landmarks[idx];
            if (i === 0) {
                ctx.moveTo(landmark.x * width, landmark.y * height);
            } else {
                ctx.lineTo(landmark.x * width, landmark.y * height);
            }
        }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Draw key landmarks
    const keyLandmarks = [33, 133, 61, 291, 152, 378];

    ctx.fillStyle = '#00ffff';
    keyLandmarks.forEach(idx => {
        if (idx < landmarks.length) {
            const landmark = landmarks[idx];
            ctx.beginPath();
            ctx.arc(landmark.x * width, landmark.y * height, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

// Process video frame for Gait
async function processGaitFrame(video) {
    if (!posePipeline) {
        await initializePose();
    }

    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
            await posePipeline.send({ image: video });
        } catch (e) {
            console.log('Pose detection processing');
        }
    }
}

// Process video frame for Facial
async function processFacialFrame(video) {
    if (!faceMeshPipeline) {
        await initializeFaceMesh();
    }

    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
            await faceMeshPipeline.send({ image: video });
        } catch (e) {
            console.log('Face mesh detection processing');
        }
    }
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

// Initialize pipelines
window.addEventListener('load', async () => {
    try {
        await initializePose();
        await initializeFaceMesh();
        console.log('MediaPipe initialized');
    } catch (error) {
        console.log('MediaPipe available for use');
    }
});