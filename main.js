import { ParticleSystem } from './particleSystem.js';
import { Tracker } from './tracking.js';
import { GestureDetector } from './gestures.js';
import { getNextTheme } from './themes.js';

class App {
    constructor() {
        // DOM elements
        this.introScreen = document.getElementById('intro-screen');
        this.appContainer = document.getElementById('app-container');
        this.enableCameraBtn = document.getElementById('enable-camera-btn');
        this.particleCanvas = document.getElementById('particle-canvas');
        this.cameraVideo = document.getElementById('camera-video');
        this.overlayCanvas = document.getElementById('overlay-canvas');
        this.modeToggleBtn = document.getElementById('mode-toggle-btn');
        this.themeBtn = document.getElementById('theme-btn');
        this.statusText = document.getElementById('status-text');
        this.statusIndicator = document.getElementById('status-indicator');

        // Systems
        this.particleSystem = null;
        this.tracker = null;
        this.gestureDetector = new GestureDetector();

        // State
        this.isRunning = false;
        this.currentMode = 'attract';
        this.currentTheme = 'Rainbow';
        this.cameraEnabled = true;

        this.init();
    }

    init() {
        // Setup intro screen
        this.enableCameraBtn.addEventListener('click', () => this.startApp());

        // Setup keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Setup window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    async startApp() {
        try {
            // Hide intro, show app
            this.introScreen.style.display = 'none';
            this.appContainer.classList.remove('hidden');

            // Update status
            this.updateStatus('Initializing camera...', 'loading');

            // Initialize particle system
            this.particleSystem = new ParticleSystem(this.particleCanvas);

            // Initialize tracker
            this.tracker = new Tracker(
                this.cameraVideo,
                this.overlayCanvas,
                (targets, isDetecting) => this.onTrackingResults(targets, isDetecting)
            );

            await this.tracker.initialize();

            // Update status
            this.updateStatus('Show your hands or face', 'prompt');

            // Setup UI controls
            this.modeToggleBtn.addEventListener('click', () => this.toggleMode());
            this.themeBtn.addEventListener('click', () => this.cycleTheme());

            // Start animation loop
            this.isRunning = true;
            this.animate();

        } catch (error) {
            console.error('Failed to start app:', error);
            this.updateStatus('Failed to start camera', 'error');
            alert('Failed to access camera. Please ensure camera permissions are granted.');
        }
    }

    animate() {
        if (!this.isRunning) return;

        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.animate();
        }

        // Check for gestures
        if (this.tracker) {
            const handResults = this.tracker.getHandResults();
            this.gestureDetector.checkFistGesture(handResults, () => {
                this.cycleTheme();
            });
        }

        requestAnimationFrame(() => this.animate());
    }

    onTrackingResults(targets, isDetecting) {
        if (this.particleSystem) {
            this.particleSystem.setTargets(targets);
        }

        // Update status
        if (isDetecting) {
            const handCount = this.tracker.handResults?.multiHandLandmarks?.length || 0;
            const faceCount = this.tracker.faceResults?.multiFaceLandmarks?.length || 0;

            let statusMsg = 'Tracking: ';
            if (handCount > 0) statusMsg += `${handCount} hand${handCount > 1 ? 's' : ''}`;
            if (handCount > 0 && faceCount > 0) statusMsg += ' + ';
            if (faceCount > 0) statusMsg += 'face';

            this.updateStatus(statusMsg, 'detecting');
        } else {
            this.updateStatus('Show your hands or face', 'prompt');
        }
    }

    toggleMode() {
        if (!this.particleSystem) return;

        this.currentMode = this.particleSystem.toggleMode();
        const modeText = this.currentMode.charAt(0).toUpperCase() + this.currentMode.slice(1);
        this.modeToggleBtn.textContent = `Mode: ${modeText}`;
    }

    cycleTheme() {
        if (!this.particleSystem) return;

        this.currentTheme = getNextTheme(this.currentTheme);
        this.particleSystem.setTheme(this.currentTheme);
        this.themeBtn.textContent = `Theme: ${this.currentTheme}`;
    }

    toggleCamera() {
        if (!this.tracker) return;

        this.cameraEnabled = this.tracker.toggleCamera();
        const preview = document.getElementById('camera-preview');

        if (this.cameraEnabled) {
            preview.style.opacity = '1';
        } else {
            preview.style.opacity = '0.3';
        }
    }

    updateStatus(text, type) {
        this.statusText.textContent = text;

        // Update indicator style
        this.statusIndicator.classList.remove('detecting', 'prompt', 'loading');
        if (type) {
            this.statusIndicator.classList.add(type);
        }
    }

    handleKeyPress(e) {
        switch(e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                this.toggleMode();
                break;
            case 'v':
                e.preventDefault();
                this.toggleCamera();
                break;
            case 't':
                e.preventDefault();
                this.cycleTheme();
                break;
        }
    }

    handleResize() {
        if (this.particleSystem) {
            this.particleSystem.resize();
        }
    }

    dispose() {
        this.isRunning = false;

        if (this.tracker) {
            this.tracker.dispose();
        }
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}
