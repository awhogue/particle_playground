// Gesture detection for hand tracking

export class GestureDetector {
    constructor() {
        this.lastFistDetected = false;
        this.fistCooldown = false;
        this.cooldownTime = 1000; // 1 second cooldown
    }

    detectFist(landmarks) {
        if (!landmarks || landmarks.length !== 21) return false;

        // Get key landmarks
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        const indexBase = landmarks[5];
        const middleBase = landmarks[9];
        const ringBase = landmarks[13];
        const pinkyBase = landmarks[17];

        // Calculate distances from wrist to fingertips
        const thumbDist = this.distance3D(wrist, thumbTip);
        const indexDist = this.distance3D(wrist, indexTip);
        const middleDist = this.distance3D(wrist, middleTip);
        const ringDist = this.distance3D(wrist, ringTip);
        const pinkyDist = this.distance3D(wrist, pinkyTip);

        // Calculate distances from wrist to finger bases
        const indexBaseDist = this.distance3D(wrist, indexBase);
        const middleBaseDist = this.distance3D(wrist, middleBase);
        const ringBaseDist = this.distance3D(wrist, ringBase);
        const pinkyBaseDist = this.distance3D(wrist, pinkyBase);

        // Check if fingers are curled (fingertip close to base relative to wrist)
        const indexCurled = indexDist < indexBaseDist * 1.3;
        const middleCurled = middleDist < middleBaseDist * 1.3;
        const ringCurled = ringDist < ringBaseDist * 1.3;
        const pinkyCurled = pinkyDist < pinkyBaseDist * 1.3;

        // Fist is detected when all four fingers are curled
        const isFist = indexCurled && middleCurled && ringCurled && pinkyCurled;

        return isFist;
    }

    distance3D(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = (point1.z || 0) - (point2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    checkFistGesture(handResults, onFistDetected) {
        if (!handResults || !handResults.multiHandLandmarks) return;

        if (this.fistCooldown) return;

        // Check each hand for fist gesture
        for (const landmarks of handResults.multiHandLandmarks) {
            const isFist = this.detectFist(landmarks);

            // Trigger on fist detection (rising edge)
            if (isFist && !this.lastFistDetected) {
                this.lastFistDetected = true;
                this.fistCooldown = true;

                if (onFistDetected) {
                    onFistDetected();
                }

                // Reset cooldown after delay
                setTimeout(() => {
                    this.fistCooldown = false;
                }, this.cooldownTime);

                return;
            }

            if (!isFist) {
                this.lastFistDetected = false;
            }
        }
    }
}
