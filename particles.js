import * as THREE from 'three';

/*
  Three.js particle background for the hero section.
  Builds an instanced mesh grid with custom GLSL shaders.
  Particles drift on sine/cosine waves and form a halo ring
  that follows the cursor. Based on the effect at antigravity.google.
*/


const PROFILE_SELECTOR = '#profile';
const CANVAS_ID = 'particle-bg';

const isMobile = window.matchMedia('(max-width: 768px)').matches;
const isTablet = window.matchMedia('(min-width: 769px) and (max-width: 1200px)').matches;
const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

// Grid density per device tier
const countX = isMobile ? 50 : (isTablet ? 85 : 100);
const countY = isMobile ? 35 : (isTablet ? 50 : 55);

// Particle & halo defaults (desktop values scaled down for smaller screens)
const DEFAULTS = {
    cursor: {
        radius: 0.065,
        strength: 3,
        dragFactor: 0.015,
    },
    halo: {
        outerOscFrequency: 2.6,
        outerOscAmplitude: 0.76,
        radiusBase: isMobile ? 1.2 : (isTablet ? 1.6 : 2.4),
        radiusAmplitude: 0.5,
        shapeAmplitude: 0.75,
        rimWidth: isMobile ? 1.0 : (isTablet ? 1.3 : 1.8),
        outerStartOffset: 0.4,
        outerEndOffset: 2.2,
        scaleX: isMobile ? 1.0 : (isTablet ? 1.1 : 1.3),
        scaleY: 1,
        yBias: isMobile ? 1.5 : (isTablet ? 1.0 : 0),
    },
    particles: {
        baseSize: isMobile ? 0.008 : (isTablet ? 0.012 : 0.016),
        activeSize: isMobile ? 0.022 : (isTablet ? 0.032 : 0.044),
        blobScaleX: 1,
        blobScaleY: 0.6,
        rotationSpeed: 0.1,
        rotationJitter: 0.2,
        cursorFollowStrength: 1,
        oscillationFactor: 1,
    }
};

let scene, camera, renderer, instancedMesh, material;
let animationId;
let isPaused = false;
let clock = new THREE.Clock();

let isDarkMode = document.body.classList.contains('dark-mode');

// Mouse tracking
let targetMouseX = null;
let targetMouseY = null;
let isInteracting = false;

function init() {
    const profileSection = document.querySelector(PROFILE_SELECTOR);
    if (!profileSection) return;

    // Clean up leftover canvas (hot reload)
    const existing = document.getElementById(CANVAS_ID);
    if (existing) existing.remove();

    const canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    profileSection.prepend(canvas);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();

    const width = profileSection.clientWidth;
    const height = profileSection.clientHeight;

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Vertex shader: drift, halo ring, cursor interaction
    const vertexShader = `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uOuterOscFrequency;
        uniform float uOuterOscAmplitude;
        uniform float uHaloRadiusBase;
        uniform float uHaloRadiusAmplitude;
        uniform float uHaloShapeAmplitude;
        uniform float uHaloRimWidth;
        uniform float uHaloOuterStartOffset;
        uniform float uHaloOuterEndOffset;
        uniform float uHaloScaleX;
        uniform float uHaloScaleY;
        uniform float uParticleBaseSize;
        uniform float uParticleActiveSize;
        uniform float uBlobScaleX;
        uniform float uBlobScaleY;
        uniform float uParticleRotationSpeed;
        uniform float uParticleRotationJitter;
        uniform float uParticleOscillationFactor;
        
        varying vec2 vUv;
        varying float vSize;
        varying vec2 vPos;
        
        attribute vec3 aOffset; 
        attribute float aRandom;

        #define PI 3.14159265359

        // 2D hash + noise for organic variation
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix( mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
            vUv = uv;
            
            vec3 pos = aOffset;
            float driftSpeed = uTime * 0.15;
            
            // Layered sine drift
            float dx = sin(driftSpeed + pos.y * 0.5) + sin(driftSpeed * 0.5 + pos.y * 2.0);
            float dy = cos(driftSpeed + pos.x * 0.5) + cos(driftSpeed * 0.5 + pos.x * 2.0);
            pos.x += dx * 0.25; 
            pos.y += dy * 0.25;

            // Halo ring around cursor
            vec2 relToMouse = pos.xy - uMouse;
            vec2 haloScale = max(vec2(uHaloScaleX, uHaloScaleY), vec2(0.0001));
            float distFromMouse = length(relToMouse / haloScale);
            vec2 dirToMouse = normalize(relToMouse + vec2(0.0001, 0.0));
            
            float shapeFactor = noise(dirToMouse * 2.0 + vec2(0.0, uTime * 0.1));
            
            float breathCycle = sin(uTime * 0.8);
            float baseRadius = uHaloRadiusBase + breathCycle * uHaloRadiusAmplitude;
            float currentRadius = baseRadius + (shapeFactor * uHaloShapeAmplitude);
            
            // Push particles outward along the ring edge
            float rimInfluence = smoothstep(uHaloRimWidth, 0.0, abs(distFromMouse - currentRadius));
            vec2 pushDir = normalize(relToMouse + vec2(0.0001, 0.0));
            float pushAmt = (breathCycle * 0.5 + 0.5) * 0.5;
            pos.xy += pushDir * pushAmt * rimInfluence;
            pos.z += rimInfluence * 0.3 * sin(uTime);

            // Subtle wave on particles far from the ring
            float outerInfluence = smoothstep(baseRadius + uHaloOuterStartOffset, baseRadius + uHaloOuterEndOffset, distFromMouse);
            float outerOsc = sin(uTime * uOuterOscFrequency + pos.x * 0.6 + pos.y * 0.6);
            pos.xy += normalize(relToMouse + vec2(0.0001, 0.0)) * outerOsc * uOuterOscAmplitude * outerInfluence;

            // Scale up near cursor
            float baseSize = uParticleBaseSize + (sin(uTime + pos.x)*0.003);
            float currentScale = baseSize + (rimInfluence * uParticleActiveSize);
            float stretch = rimInfluence * 0.02;
            
            vec3 transformed = position;
            transformed.x *= (currentScale + stretch) * uBlobScaleX;
            transformed.y *= currentScale * uBlobScaleY; 
            
            vSize = rimInfluence;
            vPos = pos.xy;
            
            // Rotation wobble toward cursor
            float dirLen = max(length(relToMouse), 0.0001);
            vec2 dir = relToMouse / dirLen;
            float oscPhase = aRandom * 6.28318530718;
            float osc = 0.5 + 0.5 * sin(
              uTime * (0.25 + uParticleOscillationFactor * 0.35) + oscPhase
            );
            float speedScale = mix(0.55, 1.35, osc) * (0.8 + uParticleOscillationFactor * 0.2);
            float jitterScale = mix(0.7, 1.45, osc) * (0.85 + uParticleOscillationFactor * 0.15);
            float jitter = sin(
              uTime * uParticleRotationSpeed * speedScale + pos.x * 0.35 + pos.y * 0.35
            ) * (uParticleRotationJitter * jitterScale);
            vec2 perp = vec2(-dir.y, dir.x);
            vec2 jitteredDir = normalize(dir + perp * jitter);
            mat2 rot = mat2(jitteredDir.x, jitteredDir.y, -jitteredDir.y, jitteredDir.x);
            transformed.xy = rot * transformed.xy;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + transformed, 1.0);
        }
    `;

    // Fragment shader: Google-palette coloring + soft edges
    const fragmentShader = `
        uniform float uTime;
        uniform float uDarkMode;
        
        varying vec2 vUv;
        varying float vSize;
        varying vec2 vPos;

        void main() {
            vec2 center = vec2(0.5);
            vec2 pos = abs(vUv - center) * 2.0; 
            
            // Squircle mask
            float d = pow(pow(pos.x, 2.6) + pow(pos.y, 2.6), 1.0/2.6);
            float alpha = 1.0 - smoothstep(0.8, 1.0, d);
            
            if (alpha < 0.01) discard;

            // Color palette
            vec3 baseColor = vec3(0.00, 0.00, 1.00);
            vec3 colorOne = vec3(0.26, 0.52, 0.96);
            vec3 colorTwo = vec3(0.92, 0.26, 0.21);
            vec3 colorThree = vec3(0.98, 0.73, 0.01);
            
            float t = uTime * 1.2;
            float p1 = sin(vPos.x * 0.8 + t);
            float p2 = sin(vPos.y * 0.8 + t * 0.8 + p1);
            
            vec3 activeColor = mix(colorOne, colorTwo, p1 * 0.5 + 0.5);
            activeColor = mix(activeColor, colorThree, p2 * 0.5 + 0.5);
            
            vec3 finalColor = mix(baseColor, activeColor, smoothstep(0.1, 0.8, vSize));
            float finalAlpha = alpha * mix(0.4, 0.95, vSize);

            gl_FragColor = vec4(finalColor, finalAlpha);
        }
    `;

    material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uDarkMode: { value: isDarkMode ? 1.0 : 0.0 },
            uOuterOscFrequency: { value: DEFAULTS.halo.outerOscFrequency },
            uOuterOscAmplitude: { value: DEFAULTS.halo.outerOscAmplitude },
            uHaloRadiusBase: { value: DEFAULTS.halo.radiusBase },
            uHaloRadiusAmplitude: { value: DEFAULTS.halo.radiusAmplitude },
            uHaloShapeAmplitude: { value: DEFAULTS.halo.shapeAmplitude },
            uHaloRimWidth: { value: DEFAULTS.halo.rimWidth },
            uHaloOuterStartOffset: { value: DEFAULTS.halo.outerStartOffset },
            uHaloOuterEndOffset: { value: DEFAULTS.halo.outerEndOffset },
            uHaloScaleX: { value: DEFAULTS.halo.scaleX },
            uHaloScaleY: { value: DEFAULTS.halo.scaleY },
            uParticleBaseSize: { value: DEFAULTS.particles.baseSize },
            uParticleActiveSize: { value: DEFAULTS.particles.activeSize },
            uBlobScaleX: { value: DEFAULTS.particles.blobScaleX },
            uBlobScaleY: { value: DEFAULTS.particles.blobScaleY },
            uParticleRotationSpeed: { value: DEFAULTS.particles.rotationSpeed },
            uParticleRotationJitter: { value: DEFAULTS.particles.rotationJitter },
            uParticleOscillationFactor: { value: DEFAULTS.particles.oscillationFactor },
        },
        transparent: true,
        depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(1, 1);

    const count = countX * countY;
    const offsets = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    // Spawn grid (sized for ultrawide)
    const gridWidth = 60;
    const gridHeight = 22;
    const jitter = 0.25;

    // Stretch horizontally by aspect ratio
    const aspect = profileSection.clientWidth / profileSection.clientHeight;

    let i = 0;
    for (let y = 0; y < countY; y++) {
        for (let x = 0; x < countX; x++) {
            const u = x / (countX - 1);
            const v = y / (countY - 1);

            // Wider spread on narrow screens
            const aspectDivisor = isMobile ? 1.4 : (isTablet ? 1.2 : 1.8);
            let px = (u - 0.5) * gridWidth * (aspect / aspectDivisor);
            let py = (v - 0.5) * gridHeight;

            px += (Math.random() - 0.5) * jitter;
            py += (Math.random() - 0.5) * jitter;

            offsets[i * 3] = px;
            offsets[i * 3 + 1] = py;
            offsets[i * 3 + 2] = 0;

            randoms[i] = Math.random();
            i++;
        }
    }

    geometry.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
    geometry.setAttribute("aRandom", new THREE.InstancedBufferAttribute(randoms, 1));

    instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    scene.add(instancedMesh);

    // Events
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (hasCoarsePointer) {
        profileSection.addEventListener('touchmove', onTouchMove, { passive: true });
        profileSection.addEventListener('touchstart', onTouchMove, { passive: true });
        profileSection.addEventListener('touchend', () => { isInteracting = false; }, { passive: true });
    } else {
        profileSection.addEventListener('mousemove', onMouseMove);
        profileSection.addEventListener('mouseleave', () => { isInteracting = false; targetMouseX = null; targetMouseY = null; });
        profileSection.addEventListener('mouseenter', () => { isInteracting = true; });
    }

    // Track dark mode changes for the shader
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                isDarkMode = document.body.classList.contains('dark-mode');
            }
        });
    });
    observer.observe(document.body, { attributes: true });

    // Pause when hero is off-screen to save GPU
    const onIntersection = (entries) => {
        entries.forEach(entry => {
            isPaused = (!entry.isIntersecting || document.hidden);
        });
    };
    const intersectionObserver = new IntersectionObserver(onIntersection, { threshold: 0 });
    intersectionObserver.observe(profileSection);
    window.__particleIntersectionObserver = intersectionObserver;

    onResize();
    render();
}

// World-space viewport size at z=0
function getViewportAtZ0() {
    const vFov = (camera.fov * Math.PI) / 180;
    const viewportHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
    const viewportWidth = viewportHeight * camera.aspect;
    return { width: viewportWidth, height: viewportHeight };
}

// Screen coords -> world-space position
function updateMouse(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;

    const viewport = getViewportAtZ0();
    targetMouseX = (nx * viewport.width) / 2;
    targetMouseY = (ny * viewport.height) / 2;

    isInteracting = true;
}

function onMouseMove(event) {
    updateMouse(event.clientX, event.clientY);
}

function onTouchMove(event) {
    if (event.touches.length > 0) {
        updateMouse(event.touches[0].clientX, event.touches[0].clientY);
    }
}

function onResize() {
    const profileSection = document.querySelector(PROFILE_SELECTOR);
    if (!profileSection) return;

    const width = profileSection.clientWidth;
    const height = profileSection.clientHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function onVisibilityChange() {
    isPaused = document.hidden;
}

// Render loop
function render() {
    animationId = requestAnimationFrame(render);
    if (isPaused) return;

    const t = clock.getElapsedTime();

    if (material) {
        material.uniforms.uTime.value = t;

        // Lerp dark mode uniform
        const targetDarkMode = isDarkMode ? 1.0 : 0.0;
        material.uniforms.uDarkMode.value += (targetDarkMode - material.uniforms.uDarkMode.value) * 0.05;

        // Cursor trail with some jitter so it feels organic
        let tX = targetMouseX;
        let tY = targetMouseY;

        if (isInteracting || (hasCoarsePointer && !isInteracting)) {
            const viewport = getViewportAtZ0();
            const jitterRadius = Math.min(viewport.width, viewport.height) * DEFAULTS.cursor.radius;
            const jitterX = (Math.sin(t * 0.35) + Math.sin(t * 0.77 + 1.2)) * 0.5;
            const jitterY = (Math.cos(t * 0.31) + Math.sin(t * 0.63 + 2.4)) * 0.5;

            const bX = (hasCoarsePointer && !isInteracting) ? 0 : (targetMouseX || 0);
            const bY = (hasCoarsePointer && !isInteracting) ? 0 : (targetMouseY || 0);

            tX = (bX + jitterX * jitterRadius * DEFAULTS.cursor.strength) * DEFAULTS.particles.cursorFollowStrength;
            tY = (bY + jitterY * jitterRadius * DEFAULTS.cursor.strength) * DEFAULTS.particles.cursorFollowStrength;
        }

        const current = material.uniforms.uMouse.value;
        const dragFactor = DEFAULTS.cursor.dragFactor;
        const yBias = DEFAULTS.halo.yBias;

        if (tX !== null && tY !== null) {
            current.x += (tX - current.x) * dragFactor;
            current.y += ((tY + yBias) - current.y) * dragFactor;
        } else {
            // Ease back to center
            current.x += (0 - current.x) * dragFactor * 0.5;
            current.y += (yBias - current.y) * dragFactor * 0.5;
        }
    }

    renderer.render(scene, camera);
}

// Teardown (if needed)
export function disconnect() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);

    if (window.__particleIntersectionObserver) {
        window.__particleIntersectionObserver.disconnect();
        delete window.__particleIntersectionObserver;
    }

    if (renderer) renderer.dispose();
    if (material) material.dispose();
    if (instancedMesh) instancedMesh.geometry.dispose();
}

// Go
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
