# Particle Face & Hand Tracker

An immersive real-time particle simulator that uses MediaPipe to track your hands and face, with thousands of particles flowing to form your shape on screen.

## Features

### Tracking
- **Hand Tracking**: Detects up to 2 hands with all 21 landmarks per hand
- **Face Tracking**: Uses FaceMesh with 468 landmarks and refined facial features
- **Real-time Overlays**: Skeleton visualization for hands (cyan/pink) and mesh for face (teal/pink/cyan)

### Particle System
- **8,000-15,000 particles** that dynamically flow to form tracked shapes
- **Golden ratio distribution** for smooth, organic particle arrangement
- **Tapered spread**: Fingertips narrow, finger segments medium, palm areas wider
- **Tight face clustering**: 1-2 pixel precision for dense mesh effect
- **Depth boost**: Enhanced 3D pop for nose, cheekbones, and eye sockets
- **Particle trails**: Semi-transparent fade effects for fluid motion

### Interaction Modes
- **Attract Mode**: Particles flow toward your hands and face
- **Repel Mode**: Particles push away from detected landmarks
- Toggle between modes with SPACE or the UI button

### Color Themes
Five stunning themes that cycle when you make a fist gesture:
- **Rainbow**: Full spectrum gradient
- **Fire**: Red to yellow flames
- **Ocean**: Deep blue to turquoise waves
- **Galaxy**: Midnight blue to hot pink nebula
- **Matrix**: Green digital rain

### UI Elements
- Clean intro screen with camera permission prompt
- 256x144 camera preview overlay at top center
- Mode toggle buttons (top left)
- Status indicator (top right) showing detection state
- Keyboard shortcuts panel (bottom right)

### Controls
- **SPACE**: Toggle between Attract and Repel modes
- **V**: Toggle camera preview visibility
- **T**: Change color theme
- **Fist Gesture**: Cycle through color themes

## Getting Started

1. Clone this repository
2. Serve the files using a local web server (required for MediaPipe):
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```
3. Open `http://localhost:8000` in your browser
4. Click "Enable Camera" and grant camera permissions
5. Show your hands or face to see particles flow!

## Browser Requirements

- Modern browser with WebGL support
- Camera access
- WebRTC support
- Recommended: Chrome or Edge for best MediaPipe performance

## Project Structure

```
particle_playground/
├── index.html          # Main HTML structure
├── styles.css          # All styling and UI design
├── main.js             # Application entry point and coordination
├── particleSystem.js   # Particle physics and rendering
├── tracking.js         # MediaPipe integration for hands and face
├── gestures.js         # Fist gesture detection
└── themes.js           # Color theme definitions
```

## Technical Details

- **Particle Count**: 12,000 default (configurable 8k-15k)
- **Golden Ratio Math**: Uses φ (1.618...) for natural distribution
- **Performance**: Optimized for 60fps rendering
- **Trail System**: 8-frame history with fade
- **Detection**: Alternates between hand and face processing for efficiency

## Credits

Built with:
- [MediaPipe](https://google.github.io/mediapipe/) for hand and face tracking
- Canvas API for particle rendering
- Golden ratio mathematics for organic distribution
