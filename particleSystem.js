import { THEMES } from './themes.js';

const PHI = 1.618033988749895; // Golden ratio
const INV_PHI = 1 / PHI;

class Particle {
    constructor(x, y, index, total) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.targetX = x;
        this.targetY = y;
        this.index = index;
        this.total = total;
        this.trail = [];
        this.maxTrailLength = 8;
    }

    update(targetX, targetY, mode, speed = 0.15) {
        this.targetX = targetX;
        this.targetY = targetY;

        // Calculate distance to target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (mode === 'attract') {
            // Attract mode: move towards target
            const force = Math.min(distance * 0.01, 1);
            this.vx += dx * speed * force;
            this.vy += dy * speed * force;
        } else {
            // Repel mode: push away from target
            if (distance < 200) {
                const force = (200 - distance) / 200;
                this.vx -= dx * 0.05 * force;
                this.vy -= dy * 0.05 * force;
            }
        }

        // Apply velocity with damping
        this.vx *= 0.85;
        this.vy *= 0.85;

        // Update trail
        if (this.trail.length === 0 ||
            Math.abs(this.x - this.trail[0].x) > 2 ||
            Math.abs(this.y - this.trail[0].y) > 2) {
            this.trail.unshift({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.pop();
            }
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx, theme) {
        const color = THEMES[theme].getColor(this.index, this.total);

        // Draw trail
        for (let i = 1; i < this.trail.length; i++) {
            const alpha = (1 - i / this.trail.length) * 0.3;
            const size = (1 - i / this.trail.length) * 1.5;

            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw particle
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.targets = [];
        this.mode = 'attract'; // 'attract' or 'repel'
        this.theme = 'Rainbow';
        this.particleCount = 12000;

        this.resize();
        this.initParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    initParticles() {
        this.particles = [];

        // Initialize particles in a golden spiral pattern
        for (let i = 0; i < this.particleCount; i++) {
            const angle = i * PHI * Math.PI * 2;
            const radius = Math.sqrt(i / this.particleCount) * Math.min(this.width, this.height) * 0.4;

            const x = this.width / 2 + Math.cos(angle) * radius;
            const y = this.height / 2 + Math.sin(angle) * radius;

            this.particles.push(new Particle(x, y, i, this.particleCount));
        }
    }

    setTargets(targets) {
        this.targets = targets;
    }

    toggleMode() {
        this.mode = this.mode === 'attract' ? 'repel' : 'attract';
        return this.mode;
    }

    setTheme(theme) {
        this.theme = theme;
    }

    distributeParticles() {
        if (this.targets.length === 0) return;

        // Distribute particles among targets based on their weights
        let currentParticleIndex = 0;

        this.targets.forEach(target => {
            const particlesForTarget = Math.floor(this.particleCount * target.weight);

            for (let i = 0; i < particlesForTarget && currentParticleIndex < this.particles.length; i++) {
                const particle = this.particles[currentParticleIndex];

                // Use golden ratio for smooth distribution
                const t = i / particlesForTarget;
                const goldenAngle = t * PHI * Math.PI * 2;

                // Apply spread radius based on target type and position
                const spread = target.spread * (0.5 + Math.sqrt(t) * 0.5);
                const offsetX = Math.cos(goldenAngle) * spread;
                const offsetY = Math.sin(goldenAngle) * spread;

                // Calculate target position with depth
                const targetX = target.x + offsetX;
                const targetY = target.y + offsetY;

                particle.update(targetX, targetY, this.mode);
                currentParticleIndex++;
            }
        });
    }

    update() {
        this.distributeParticles();
    }

    render() {
        // Clear with fade effect for trails
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw all particles
        for (const particle of this.particles) {
            particle.draw(this.ctx, this.theme);
        }
    }

    animate() {
        this.update();
        this.render();
    }
}

// Helper function to create targets from landmarks with golden ratio distribution
export function createTargetsFromLandmarks(landmarks, type, canvasWidth, canvasHeight, videoWidth, videoHeight) {
    const targets = [];

    if (type === 'hand') {
        // Hand landmarks with tapered spread
        const connections = [
            // Wrist to palm
            [0, 1], [0, 5], [0, 9], [0, 13], [0, 17],
            // Thumb
            [1, 2], [2, 3], [3, 4],
            // Index finger
            [5, 6], [6, 7], [7, 8],
            // Middle finger
            [9, 10], [10, 11], [11, 12],
            // Ring finger
            [13, 14], [14, 15], [15, 16],
            // Pinky
            [17, 18], [18, 19], [19, 20]
        ];

        connections.forEach(([start, end]) => {
            const startLm = landmarks[start];
            const endLm = landmarks[end];

            // Calculate spread based on position (fingertips narrow, palm wide)
            let spread;
            if (end === 4 || end === 8 || end === 12 || end === 16 || end === 20) {
                spread = 3; // Fingertips
            } else if (end > 5) {
                spread = 6; // Finger segments
            } else {
                spread = 12; // Palm area
            }

            // Create multiple target points along the bone using golden ratio
            const steps = Math.floor(10 * PHI);
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const goldenT = t * INV_PHI + (1 - t) * t; // Golden ratio interpolation

                const x = (startLm.x * (1 - goldenT) + endLm.x * goldenT) * canvasWidth;
                const y = (startLm.y * (1 - goldenT) + endLm.y * goldenT) * canvasHeight;

                targets.push({
                    x,
                    y,
                    spread: spread * (0.8 + Math.random() * 0.4),
                    weight: 0.3 / connections.length / steps
                });
            }
        });
    } else if (type === 'face') {
        // Face landmarks with very tight clustering
        landmarks.forEach((lm, index) => {
            const x = lm.x * canvasWidth;
            const y = lm.y * canvasHeight;

            // Add depth boost for nose, cheekbones, eye sockets
            let depth = 0;
            if (index >= 1 && index <= 4) depth = 5; // Nose
            if (index >= 234 && index <= 454) depth = 3; // Cheekbones
            if ((index >= 33 && index <= 133) || (index >= 362 && index <= 263)) depth = 4; // Eyes

            targets.push({
                x: x,
                y: y - depth,
                spread: 1.5, // Very tight clustering
                weight: 0.7 / landmarks.length
            });
        });
    }

    return targets;
}
