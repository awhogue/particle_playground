// Color themes for particle system
export const THEMES = {
    Rainbow: {
        name: 'Rainbow',
        colors: [
            { r: 255, g: 0, b: 0 },     // Red
            { r: 255, g: 127, b: 0 },   // Orange
            { r: 255, g: 255, b: 0 },   // Yellow
            { r: 0, g: 255, b: 0 },     // Green
            { r: 0, g: 0, b: 255 },     // Blue
            { r: 75, g: 0, b: 130 },    // Indigo
            { r: 148, g: 0, b: 211 }    // Violet
        ],
        getColor(index, total) {
            const colorIndex = Math.floor((index / total) * this.colors.length);
            return this.colors[colorIndex % this.colors.length];
        }
    },

    Fire: {
        name: 'Fire',
        colors: [
            { r: 255, g: 0, b: 0 },     // Red
            { r: 255, g: 69, b: 0 },    // Orange Red
            { r: 255, g: 140, b: 0 },   // Dark Orange
            { r: 255, g: 165, b: 0 },   // Orange
            { r: 255, g: 215, b: 0 },   // Gold
            { r: 255, g: 255, b: 0 }    // Yellow
        ],
        getColor(index, total) {
            const t = (index / total) * this.colors.length;
            const idx = Math.floor(t);
            const frac = t - idx;

            const c1 = this.colors[idx % this.colors.length];
            const c2 = this.colors[(idx + 1) % this.colors.length];

            return {
                r: Math.floor(c1.r + (c2.r - c1.r) * frac),
                g: Math.floor(c1.g + (c2.g - c1.g) * frac),
                b: Math.floor(c1.b + (c2.b - c1.b) * frac)
            };
        }
    },

    Ocean: {
        name: 'Ocean',
        colors: [
            { r: 0, g: 105, b: 148 },   // Deep Sea Blue
            { r: 0, g: 150, b: 199 },   // Blue
            { r: 0, g: 191, b: 255 },   // Deep Sky Blue
            { r: 64, g: 224, b: 208 },  // Turquoise
            { r: 127, g: 255, b: 212 }, // Aquamarine
            { r: 175, g: 238, b: 238 }  // Pale Turquoise
        ],
        getColor(index, total) {
            const t = (index / total) * this.colors.length;
            const idx = Math.floor(t);
            const frac = t - idx;

            const c1 = this.colors[idx % this.colors.length];
            const c2 = this.colors[(idx + 1) % this.colors.length];

            return {
                r: Math.floor(c1.r + (c2.r - c1.r) * frac),
                g: Math.floor(c1.g + (c2.g - c1.g) * frac),
                b: Math.floor(c1.b + (c2.b - c1.b) * frac)
            };
        }
    },

    Galaxy: {
        name: 'Galaxy',
        colors: [
            { r: 25, g: 25, b: 112 },   // Midnight Blue
            { r: 72, g: 61, b: 139 },   // Dark Slate Blue
            { r: 138, g: 43, b: 226 },  // Blue Violet
            { r: 148, g: 0, b: 211 },   // Dark Violet
            { r: 186, g: 85, b: 211 },  // Medium Orchid
            { r: 255, g: 0, b: 255 },   // Magenta
            { r: 255, g: 105, b: 180 }  // Hot Pink
        ],
        getColor(index, total) {
            const t = (index / total) * this.colors.length;
            const idx = Math.floor(t);
            const frac = t - idx;

            const c1 = this.colors[idx % this.colors.length];
            const c2 = this.colors[(idx + 1) % this.colors.length];

            return {
                r: Math.floor(c1.r + (c2.r - c1.r) * frac),
                g: Math.floor(c1.g + (c2.g - c1.g) * frac),
                b: Math.floor(c1.b + (c2.b - c1.b) * frac)
            };
        }
    },

    Matrix: {
        name: 'Matrix',
        colors: [
            { r: 0, g: 50, b: 0 },      // Very Dark Green
            { r: 0, g: 100, b: 0 },     // Dark Green
            { r: 0, g: 150, b: 0 },     // Medium Green
            { r: 0, g: 200, b: 0 },     // Green
            { r: 0, g: 255, b: 0 },     // Bright Green
            { r: 150, g: 255, b: 150 }  // Light Green
        ],
        getColor(index, total) {
            const t = (index / total) * this.colors.length;
            const idx = Math.floor(t);
            const frac = t - idx;

            const c1 = this.colors[idx % this.colors.length];
            const c2 = this.colors[(idx + 1) % this.colors.length];

            return {
                r: Math.floor(c1.r + (c2.r - c1.r) * frac),
                g: Math.floor(c1.g + (c2.g - c1.g) * frac),
                b: Math.floor(c1.b + (c2.b - c1.b) * frac)
            };
        }
    }
};

export const THEME_NAMES = Object.keys(THEMES);

export function getNextTheme(currentTheme) {
    const currentIndex = THEME_NAMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEME_NAMES.length;
    return THEME_NAMES[nextIndex];
}
