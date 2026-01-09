import { createTargetsFromLandmarks } from './particleSystem.js';

export class Tracker {
    constructor(videoElement, overlayCanvas, onResultsCallback) {
        this.video = videoElement;
        this.overlayCanvas = overlayCanvas;
        this.overlayCtx = overlayCanvas.getContext('2d');
        this.onResultsCallback = onResultsCallback;

        this.hands = null;
        this.faceMesh = null;
        this.camera = null;

        this.handResults = null;
        this.faceResults = null;
        this.isDetecting = false;

        // Face mesh contours
        this.FACE_OVAL = [
            10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
            397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
            172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
        ];

        this.LEFT_EYE = [
            33, 7, 163, 144, 145, 153, 154, 155, 133,
            173, 157, 158, 159, 160, 161, 246
        ];

        this.RIGHT_EYE = [
            362, 382, 381, 380, 374, 373, 390, 249,
            263, 466, 388, 387, 386, 385, 384, 398
        ];

        this.LIPS = [
            61, 146, 91, 181, 84, 17, 314, 405, 321, 375,
            291, 409, 270, 269, 267, 0, 37, 39, 40, 185
        ];
    }

    async initialize() {
        try {
            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onHandsResults(results));

            // Initialize MediaPipe Face Mesh
            this.faceMesh = new FaceMesh({
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

            this.faceMesh.onResults((results) => this.onFaceResults(results));

            // Start camera
            await this.startCamera();

            return true;
        } catch (error) {
            console.error('Failed to initialize tracker:', error);
            throw error;
        }
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 360,
                    facingMode: 'user'
                }
            });

            this.video.srcObject = stream;

            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.overlayCanvas.width = 256;
                    this.overlayCanvas.height = 144;
                    resolve();
                };
            });

            // Start processing loop
            this.processFrame();
        } catch (error) {
            console.error('Failed to start camera:', error);
            throw error;
        }
    }

    async processFrame() {
        if (!this.video || !this.hands || !this.faceMesh) return;

        // Alternate between hand and face detection for performance
        const useHands = Math.floor(Date.now() / 50) % 2 === 0;

        try {
            if (useHands && this.hands) {
                await this.hands.send({ image: this.video });
            } else if (this.faceMesh) {
                await this.faceMesh.send({ image: this.video });
            }
        } catch (error) {
            console.error('Error processing frame:', error);
        }

        requestAnimationFrame(() => this.processFrame());
    }

    onHandsResults(results) {
        this.handResults = results;
        this.updateDetectionStatus();
        this.drawOverlay();
        this.updateTargets();
    }

    onFaceResults(results) {
        this.faceResults = results;
        this.updateDetectionStatus();
        this.drawOverlay();
        this.updateTargets();
    }

    updateDetectionStatus() {
        const hasHands = this.handResults && this.handResults.multiHandLandmarks &&
                        this.handResults.multiHandLandmarks.length > 0;
        const hasFace = this.faceResults && this.faceResults.multiFaceLandmarks &&
                       this.faceResults.multiFaceLandmarks.length > 0;

        this.isDetecting = hasHands || hasFace;
    }

    drawOverlay() {
        const ctx = this.overlayCtx;
        ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

        // Save context and mirror for drawing
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-this.overlayCanvas.width, 0);

        // Draw hand skeletons
        if (this.handResults && this.handResults.multiHandLandmarks) {
            this.handResults.multiHandLandmarks.forEach((landmarks, index) => {
                const handedness = this.handResults.multiHandedness[index].label;
                const color = handedness === 'Left' ? '#00ffff' : '#ff00ff'; // Cyan for left, Pink for right
                this.drawHandSkeleton(landmarks, color);
            });
        }

        // Draw face mesh
        if (this.faceResults && this.faceResults.multiFaceLandmarks) {
            this.faceResults.multiFaceLandmarks.forEach((landmarks) => {
                this.drawFaceMesh(landmarks);
            });
        }

        ctx.restore();
    }

    drawHandSkeleton(landmarks, color) {
        const ctx = this.overlayCtx;
        const width = this.overlayCanvas.width;
        const height = this.overlayCanvas.height;

        // Hand connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17] // Palm
        ];

        // Draw connections with glow
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        connections.forEach(([start, end]) => {
            const startLm = landmarks[start];
            const endLm = landmarks[end];

            ctx.beginPath();
            ctx.moveTo(startLm.x * width, startLm.y * height);
            ctx.lineTo(endLm.x * width, endLm.y * height);
            ctx.stroke();
        });

        // Draw landmarks
        ctx.shadowBlur = 10;
        landmarks.forEach((lm, index) => {
            const x = lm.x * width;
            const y = lm.y * height;

            // Larger dots for fingertips and wrist
            const isFingertip = index === 4 || index === 8 || index === 12 || index === 16 || index === 20;
            const isWrist = index === 0;
            const radius = (isFingertip || isWrist) ? 4 : 2;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.shadowBlur = 0;
    }

    drawFaceMesh(landmarks) {
        const ctx = this.overlayCtx;
        const width = this.overlayCanvas.width;
        const height = this.overlayCanvas.height;

        // Draw face oval in cyan
        this.drawContour(landmarks, this.FACE_OVAL, '#00ffff', width, height);

        // Draw eyes in teal
        this.drawContour(landmarks, this.LEFT_EYE, '#00d4aa', width, height);
        this.drawContour(landmarks, this.RIGHT_EYE, '#00d4aa', width, height);

        // Draw lips in pink
        this.drawContour(landmarks, this.LIPS, '#ff00aa', width, height);
    }

    drawContour(landmarks, indices, color, width, height) {
        const ctx = this.overlayCtx;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        ctx.beginPath();
        indices.forEach((index, i) => {
            const lm = landmarks[index];
            const x = lm.x * width;
            const y = lm.y * height;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    updateTargets() {
        const targets = [];
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        const videoWidth = this.overlayCanvas.width;
        const videoHeight = this.overlayCanvas.height;

        // Add hand targets
        if (this.handResults && this.handResults.multiHandLandmarks) {
            this.handResults.multiHandLandmarks.forEach((landmarks) => {
                const handTargets = createTargetsFromLandmarks(
                    landmarks,
                    'hand',
                    canvasWidth,
                    canvasHeight,
                    videoWidth,
                    videoHeight
                );
                targets.push(...handTargets);
            });
        }

        // Add face targets
        if (this.faceResults && this.faceResults.multiFaceLandmarks) {
            this.faceResults.multiFaceLandmarks.forEach((landmarks) => {
                const faceTargets = createTargetsFromLandmarks(
                    landmarks,
                    'face',
                    canvasWidth,
                    canvasHeight,
                    videoWidth,
                    videoHeight
                );
                targets.push(...faceTargets);
            });
        }

        if (this.onResultsCallback) {
            this.onResultsCallback(targets, this.isDetecting);
        }
    }

    getHandResults() {
        return this.handResults;
    }

    toggleCamera() {
        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            return tracks[0].enabled;
        }
        return false;
    }

    dispose() {
        if (this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }

        if (this.hands) {
            this.hands.close();
        }

        if (this.faceMesh) {
            this.faceMesh.close();
        }
    }
}
