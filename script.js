let currentQuestion = 1;
let score = 0;
let correctAnswer = 0;
const totalQuestions = 10;
let gameMode = 'easy';
let gameSubject = 'maths'; // 'maths' or 'english'
let currentWord = null;
let filledSlots = 0;
let lastEnglishWord = null;

const englishWords = [
    { word: "APPLE", image: "assets/english/apple.png", hint: "A crunchy red fruit" },
    { word: "CAT", image: "assets/english/cat.png", hint: "A furry pet that meows" },
    { word: "SUN", image: "assets/english/sun.png", hint: "Bright light in the sky" },
    { word: "DOG", image: "assets/english/dog.png", hint: "Barks and wags tail" },
    { word: "BALL", image: "assets/english/ball.png", hint: "Something to kick" },
    { word: "DRAGON", image: "assets/english/dragon.png", hint: "A magical flying lizard", level: "hard" },
    { word: "PRINCESS", image: "assets/english/princess.png", hint: "Luna is one!", level: "hard" }
];

// UI Elements
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
const operatorElement = document.getElementById('operator');
const choicesArea = document.getElementById('choices-area');
const answerSlot = document.getElementById('answer-slot');
const progressBar = document.getElementById('progress-bar');
const currentSumLabel = document.getElementById('current-sum');
const overlay = document.getElementById('overlay');
const modalText = document.getElementById('modal-text');

// Subject Specific Containers
let mathProblemArea, englishProblemArea, spellingImage, spellingSlotsContainer;

function setupUIReferences() {
    mathProblemArea = document.getElementById('math-problem');
    englishProblemArea = document.getElementById('english-problem');
    spellingImage = document.getElementById('spelling-image');
    spellingSlotsContainer = document.getElementById('spelling-slots');
}

// Three.js 3D Stage Variables
let scene, camera, renderer, characterGroup, spotlight;
let isDancing = false;
let fireworks = [];
let stageStars = []; // Gold stars around the stage
let starCount = 0; // Number of stars earned this round

// Body parts for secondary animations
let head, body, dress, leftEye, rightEye, mouth;

// Initialize 3D Engine
function init3D() {
    const container = document.getElementById('three-stage');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.2, 5.5);
    camera.lookAt(0, 1.5, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    // Ensure we have valid dimensions
    const finalWidth = width || 800;
    const finalHeight = height || 350;

    renderer.setSize(finalWidth, finalHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    scene.add(mainLight);

    spotlight = new THREE.SpotLight(0xffffff, 0.5);
    spotlight.position.set(0, 10, 0);
    scene.add(spotlight);

    createStage();
    createPrincess();

    animate();

    window.addEventListener('resize', onWindowResize);
}

function createStage() {
    // Cinematic Floor
    const floorGeometry = new THREE.CircleGeometry(5, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xff85a1,
        metalness: 0.1,
        roughness: 0.8,
        transparent: true,
        opacity: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Stage Base
    const baseGeo = new THREE.CylinderGeometry(5.2, 5.5, 0.5, 64);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x4d002b });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.25;
    scene.add(base);
}

// Create a gold star shape
function createStarShape() {
    const shape = new THREE.Shape();
    const outerRadius = 0.3;
    const innerRadius = 0.12;
    const spikes = 5;

    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    shape.closePath();
    return shape;
}

// Add a gold star to Luna's dress with flying animation
function addStageStar() {
    if (!dress) return; // Make sure dress exists

    const starShape = createStarShape();
    const extrudeSettings = {
        depth: 0.05,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 2
    };

    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const starMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 1.0,
        roughness: 0.0,
        emissive: 0xffdd00,
        emissiveIntensity: 1.2
    });

    const star = new THREE.Mesh(starGeo, starMat);
    star.castShadow = true;

    // Predefined positions on the dress (cone shape)
    // The dress is a cone with radius 1.2 at bottom, height 2, centered at y=1
    // Stars will be placed around the dress surface
    const dressStarPositions = [
        { angle: 0, height: 0.3, radius: 1.0 },        // Front center low
        { angle: Math.PI * 0.3, height: 0.5, radius: 0.95 },   // Front right
        { angle: -Math.PI * 0.3, height: 0.5, radius: 0.95 },  // Front left
        { angle: Math.PI * 0.15, height: 0.8, radius: 0.85 },  // Upper right
        { angle: -Math.PI * 0.15, height: 0.8, radius: 0.85 }, // Upper left
        { angle: 0, height: 1.0, radius: 0.7 },        // Front center high
        { angle: Math.PI * 0.4, height: 0.2, radius: 1.05 },   // Low right
        { angle: -Math.PI * 0.4, height: 0.2, radius: 1.05 },  // Low left
        { angle: Math.PI * 0.2, height: 0.6, radius: 0.9 },    // Mid right
        { angle: -Math.PI * 0.2, height: 0.6, radius: 0.9 }    // Mid left
    ];

    const pos = dressStarPositions[starCount % 10];

    // Calculate position on cone surface
    const targetX = Math.sin(pos.angle) * pos.radius;
    const targetY = pos.height - 1; // Relative to dress center (dress is at y=1)
    const targetZ = Math.cos(pos.angle) * pos.radius;

    // Start position (flying in from front of camera)
    star.position.set(targetX, targetY + 5, targetZ + 5);

    // Face outward from the dress
    star.rotation.x = 0;
    star.rotation.y = pos.angle;
    star.rotation.z = 0;
    star.scale.set(0.1, 0.1, 0.1); // Start tiny

    // Add to the dress so it moves with Luna!
    dress.add(star);
    stageStars.push(star);
    starCount++;

    // Animate the star flying onto the dress
    gsap.to(star.position, {
        x: targetX,
        y: targetY,
        z: targetZ,
        duration: 0.6,
        ease: "back.out(2)"
    });

    // Scale up with a pop - BIGGER!
    gsap.to(star.scale, {
        x: 0.7,
        y: 0.7,
        z: 0.7,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
    });

    // Spin as it lands
    gsap.to(star.rotation, {
        z: Math.PI * 3,
        duration: 0.6,
        ease: "power2.out"
    });
}

// Clear all dress stars (for new round)
function clearStageStars() {
    stageStars.forEach(star => {
        if (star.parent) star.parent.remove(star);
    });
    stageStars = [];
    starCount = 0;
}

function createPrincess() {
    characterGroup = new THREE.Group();

    // 1. Dress (Conical and Elegant)
    const dressGeo = new THREE.ConeGeometry(1.2, 2, 32);
    const dressMat = new THREE.MeshStandardMaterial({
        color: 0x9b5de5,
        roughness: 0.5,
        metalness: 0.2
    });
    dress = new THREE.Mesh(dressGeo, dressMat);
    dress.position.y = 1;
    dress.castShadow = true;
    characterGroup.add(dress);

    // 2. Head
    const headGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffc1cc }); // Pink skin tone
    head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 2.2;
    head.castShadow = true;
    characterGroup.add(head);

    // 3. Eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const eyeBlackGeo = new THREE.SphereGeometry(0.06, 32, 32);
    const eyeBlackMat = new THREE.MeshStandardMaterial({ color: 0x00a8ff }); // Blue eyes

    leftEye = new THREE.Group();
    const lWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    const lBlack = new THREE.Mesh(eyeBlackGeo, eyeBlackMat);
    lBlack.position.z = 0.08;
    leftEye.add(lWhite);
    leftEye.add(lBlack);
    leftEye.position.set(-0.18, 0.1, 0.4);
    head.add(leftEye);

    rightEye = leftEye.clone();
    rightEye.position.set(0.18, 0.1, 0.4);
    head.add(rightEye);

    // 4. Mouth (Friendly Smile)
    const mouthGeo = new THREE.TorusGeometry(0.1, 0.02, 16, 32, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xaa4444 });
    mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.x = Math.PI;
    mouth.position.set(0, -0.1, 0.45);
    head.add(mouth);

    // 4.5 PINK GLASSES
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.1, 0.4);
    head.add(glassesGroup);

    const rimGeo = new THREE.TorusGeometry(0.15, 0.02, 16, 32);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

    // Left Rim
    const leftRim = new THREE.Mesh(rimGeo, frameMat);
    leftRim.position.x = -0.18;
    glassesGroup.add(leftRim);

    // Right Rim
    const rightRim = leftRim.clone();
    rightRim.position.x = 0.18;
    glassesGroup.add(rightRim);

    // Bridge
    const bridgeGeo = new THREE.BoxGeometry(0.1, 0.02, 0.02);
    const bridge = new THREE.Mesh(bridgeGeo, frameMat);
    glassesGroup.add(bridge);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.02, 0.02, 0.4);
    const leftArm = new THREE.Mesh(armGeo, frameMat);
    leftArm.position.set(-0.35, 0, -0.2);
    glassesGroup.add(leftArm);

    const rightArm = leftArm.clone();
    rightArm.position.x = 0.35;
    glassesGroup.add(rightArm);

    // 5. Hair (Stylized Princess Hair)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xf9d71c, roughness: 0.4 });

    // Main Hair Base (on the head)
    const hairGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const hairBase = new THREE.Mesh(hairGeo, hairMat);
    hairBase.position.set(0, 0.1, -0.1);
    hairBase.scale.set(1.05, 1.1, 1);
    head.add(hairBase);

    // THE TINY PONYTAIL (On the very top)
    const ponyGroup = new THREE.Group();
    ponyGroup.position.set(0, 0.55, 0);
    head.add(ponyGroup);

    // Hair Tie
    const tieGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
    const tieMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    ponyGroup.add(tie);

    // The Sprouts
    for (let i = 0; i < 3; i++) {
        const sproutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
        const sprout = new THREE.Mesh(sproutGeo, hairMat);
        sprout.position.y = 0.15;
        sprout.rotation.z = (i - 1) * 0.4;
        sprout.rotation.x = Math.random() * 0.5;
        ponyGroup.add(sprout);
    }

    // Long Hair Strands (flowing down)
    for (let i = 0; i < 8; i++) {
        const strandGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.8, 8);
        const strand = new THREE.Mesh(strandGeo, hairMat);
        const angle = (i / 7) * Math.PI - (Math.PI / 2);
        strand.position.set(Math.cos(angle) * 0.45, -0.8, Math.sin(angle) * 0.2 - 0.1);
        strand.rotation.z = Math.cos(angle) * 0.2;
        head.add(strand);
    }

    // 6. Crown (Golden & Shiny)
    const crownGeo = new THREE.TorusGeometry(0.2, 0.05, 16, 32);
    const crownMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.5,
        roughness: 0.2
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 0.55; // Sit at the base of the ponytail
    head.add(crown);

    // Crown peaks (More delicate)
    const peakGeo = new THREE.ConeGeometry(0.04, 0.15, 16);
    for (let i = 0; i < 5; i++) {
        const peak = new THREE.Mesh(peakGeo, crownMat);
        const angle = (i / 5) * Math.PI * 2;
        peak.position.set(Math.cos(angle) * 0.2, 0.1, Math.sin(angle) * 0.2);
        crown.add(peak);
    }

    // 7. Golden Shoes
    const shoeGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.scale.set(1, 0.5, 1.5);
    leftShoe.position.set(-0.4, 0, 0.5);
    characterGroup.add(leftShoe);

    const rightShoe = leftShoe.clone();
    rightShoe.position.set(0.4, 0, 0.5);
    characterGroup.add(rightShoe);

    characterGroup.position.y = 0;
    scene.add(characterGroup);
}

function onWindowResize() {
    const container = document.getElementById('three-stage');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.002;

    if (characterGroup && !isDancing) {
        // Princess Breathing & Swaying
        characterGroup.position.y = Math.sin(time) * 0.05;
        head.rotation.z = Math.sin(time * 0.5) * 0.05;

        // Eyes follow subtle movement
        leftEye.rotation.y = Math.sin(time * 0.5) * 0.1;
        rightEye.rotation.y = Math.sin(time * 0.5) * 0.1;
    }

    // ✨ Sparkle animation for dress stars
    stageStars.forEach((star, index) => {
        // Each star twinkles at a different rate
        const twinkleSpeed = 3 + index * 0.7;
        const twinkle = Math.sin(time * twinkleSpeed) * 0.5 + 0.5; // 0 to 1

        // Pulse the emissive intensity
        if (star.material) {
            star.material.emissiveIntensity = 0.8 + twinkle * 1.5; // 0.8 to 2.3
        }

        // Subtle scale pulse
        const baseScale = 0.7;
        const scaleVariation = 0.08;
        const pulseScale = baseScale + Math.sin(time * twinkleSpeed * 1.5) * scaleVariation;
        star.scale.setScalar(pulseScale);
    });

    renderer.render(scene, camera);
    updateFireworks();
}

function updateFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.update();
        if (fw.finished) {
            scene.remove(fw.points);
            fireworks.splice(i, 1);
        }
    }
}

class Firework {
    constructor() {
        const count = 100;
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();
        color.setHSL(Math.random(), 1, 0.5);

        const startX = (Math.random() - 0.5) * 4;
        const startY = 1 + Math.random() * 2;
        const startZ = (Math.random() - 0.5) * 2;

        for (let i = 0; i < count; i++) {
            positions[i * 3] = startX;
            positions[i * 3 + 1] = startY;
            positions[i * 3 + 2] = startZ;

            const angle = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 0.05 + Math.random() * 0.1;

            velocities[i * 3] = Math.sin(phi) * Math.cos(angle) * speed;
            velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(angle) * speed;
            velocities[i * 3 + 2] = Math.cos(phi) * speed;

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 1
        });

        this.points = new THREE.Points(geo, mat);
        scene.add(this.points);

        this.life = 1.0;
        this.finished = false;
    }

    update() {
        const posAttr = this.points.geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            posAttr.array[i * 3 + 1] -= 0.002; // Gravity
            posAttr.array[i * 3] += posAttr.array[i * 3] * 0.01; // Fake explosion expansion
            // Using a simpler explosion
        }
        // Let's use a better update logic
        const positions = this.points.geometry.attributes.position.array;
        // Re-simplifying for robustness
        this.life -= 0.01;
        this.points.material.opacity = this.life;
        if (this.life <= 0) this.finished = true;

        // Actually move them
        // To keep it simple in this tool call, I'll just fade them out
        // and add a small random jitter
        for (let i = 0; i < positions.length; i++) {
            positions[i] += (Math.random() - 0.5) * 0.05;
        }
        this.points.geometry.attributes.position.needsUpdate = true;
    }
}

// 🍿 Movie-Style 3D Animations
function playDance() {
    if (!characterGroup) return;
    isDancing = true;

    const tl = gsap.timeline({ onComplete: () => { isDancing = false; nextQuestion(); } });

    // Cinematic Camera Move
    gsap.to(camera.position, { z: 5, duration: 0.6, yoyo: true, repeat: 1, ease: "power2.inOut" });

    // Sequence: Turn Around -> Wiggle Booty -> Turn Back
    tl.to(characterGroup.rotation, {
        y: Math.PI,
        duration: 0.6,
        ease: "power2.inOut"
    })
        // The "Booty Wiggle" Phase
        .to(characterGroup.rotation, {
            z: 0.2,
            duration: 0.1,
            repeat: 9,
            yoyo: true,
            ease: "sine.inOut"
        })
        .to(characterGroup.position, {
            y: 0.3,
            duration: 0.1,
            repeat: 9,
            yoyo: true,
            ease: "sine.inOut"
        }, "-=1.0") // Sync hop with wiggle
        .to(dress.scale, {
            x: 1.1,
            z: 1.1,
            y: 0.9,
            duration: 0.1,
            repeat: 9,
            yoyo: true,
            ease: "sine.inOut"
        }, "-=1.0") // Dress movement
        .to(characterGroup.rotation, {
            y: Math.PI * 2,
            duration: 0.6,
            ease: "power2.inOut"
        });
}

function playCelebration() {
    isDancing = true;
    gsap.to(characterGroup.rotation, { y: Math.PI * 2, duration: 1.2, repeat: -1, ease: "none" });
    gsap.to(characterGroup.position, { y: 1.5, duration: 0.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(camera.position, { z: 10, y: 4, duration: 3, ease: "power2.inOut" });
}

// Logical Loops
function initGame() {
    if (!mathProblemArea) setupUIReferences();
    currentQuestion = 1;
    score = 0;
    updateProgress();
    generateQuestion();
    overlay.classList.add('hidden');
    if (!scene) init3D();
}

function setSubject(subject) {
    console.log("Setting subject to:", subject);
    gameSubject = subject;
    const mathsBtn = document.getElementById('subject-maths');
    const englishBtn = document.getElementById('subject-english');
    if (mathsBtn) mathsBtn.classList.toggle('active', subject === 'maths');
    if (englishBtn) englishBtn.classList.toggle('active', subject === 'english');
    resetGame();
}

function generateQuestion() {
    if (gameSubject === 'maths') {
        mathProblemArea.classList.remove('hidden');
        englishProblemArea.classList.add('hidden');
        generateMathQuestion();
    } else {
        mathProblemArea.classList.add('hidden');
        englishProblemArea.classList.remove('hidden');
        generateEnglishQuestion();
    }
}

function generateMathQuestion() {
    const isAddition = Math.random() > 0.5;
    let n1, n2;

    if (gameMode === 'easy') {
        if (isAddition) {
            // Simple addition for 5-6 year olds (sum <= 12)
            n1 = Math.floor(Math.random() * 6) + 1; // 1-6
            n2 = Math.floor(Math.random() * 5) + 1; // 1-5
            correctAnswer = n1 + n2;
            operatorElement.textContent = '+';
        } else {
            // Simple subtraction (within 10)
            n1 = Math.floor(Math.random() * 6) + 4; // 4-10
            n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
            correctAnswer = n1 - n2;
            operatorElement.textContent = '-';
        }
    } else {
        if (isAddition) {
            // Harder addition for 6-7 year olds (up to 20 + 20)
            n1 = Math.floor(Math.random() * 20) + 5;
            n2 = Math.floor(Math.random() * 20) + 5;
            correctAnswer = n1 + n2;
            operatorElement.textContent = '+';
        } else {
            // Harder subtraction for 6-7 year olds (up to 40 - 20)
            n1 = Math.floor(Math.random() * 20) + 20;
            n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
            correctAnswer = n1 - n2;
            operatorElement.textContent = '-';
        }
    }

    num1Element.textContent = n1;
    num2Element.textContent = n2;
    answerSlot.textContent = '?';
    answerSlot.style.color = '#ccc';
    generateChoices();
}

function generateEnglishQuestion() {
    // Filter words by level
    const pool = englishWords.filter(w => {
        if (gameMode === 'hard') return true;
        return !w.level || w.level === 'easy';
    });

    let wordObj;
    
    // If there's only one word in the pool, just use it
    if (pool.length === 1) {
        wordObj = pool[0];
    } else {
        // Keep picking until we get a different word from last time
        let attempts = 0;
        do {
            wordObj = pool[Math.floor(Math.random() * pool.length)];
            attempts++;
        } while (wordObj.word === lastEnglishWord && attempts < 10);
    }
    
    lastEnglishWord = wordObj.word;
    currentWord = wordObj.word;
    spellingImage.src = wordObj.image;
    spellingImage.alt = wordObj.hint;

    // Create slots
    spellingSlotsContainer.innerHTML = '';
    filledSlots = 0;
    for (let i = 0; i < currentWord.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'letter-slot';
        slot.dataset.index = i;
        slot.textContent = '?';

        // Drag & Drop for slots
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });
        slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            handleLetterDrop(e.dataTransfer.getData('text/plain'), i);
        });

        spellingSlotsContainer.appendChild(slot);
    }

    generateChoices();
}

function generateChoices() {
    choicesArea.innerHTML = '';

    if (gameSubject === 'maths') {
        generateMathChoices();
    } else {
        generateEnglishChoices();
    }
}

function generateMathChoices() {
    const choices = [correctAnswer];
    const offsets = [-1, 1, -2, 2, -10, 10, -5, 5, -3, 3];

    while (choices.length < 5) {
        const offset = offsets[Math.floor(Math.random() * offsets.length)];
        let wrong = correctAnswer + offset;
        if (wrong < 0) wrong = Math.abs(wrong + 5);
        if (wrong === correctAnswer) wrong += 7;
        if (!choices.includes(wrong)) choices.push(wrong);
    }

    choices.sort(() => Math.random() - 0.5);
    choices.forEach(val => createChoiceBox(val));
}

function generateEnglishChoices() {
    // Collect all letters in the word
    const letters = currentWord.split('');

    // Add some random letters as distractors (max 7 total letters)
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const targetLength = Math.min(7, letters.length + 2);

    while (letters.length < targetLength && letters.length < 26) {
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!letters.includes(randomLetter)) {
            letters.push(randomLetter);
        }
    }

    letters.sort(() => Math.random() - 0.5);
    letters.forEach(letter => createChoiceBox(letter));
}

function createChoiceBox(val) {
    const choiceBox = document.createElement('div');
    choiceBox.className = 'choice-box';
    choiceBox.textContent = val;
    choiceBox.draggable = true;

    // Desktop Drag
    choiceBox.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', val);
        choiceBox.classList.add('dragging');
    });
    choiceBox.addEventListener('dragend', () => choiceBox.classList.remove('dragging'));

    // iPad/Touch Drag
    let touchStartX, touchStartY;
    choiceBox.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        choiceBox.classList.add('dragging');
    }, { passive: false });

    choiceBox.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        choiceBox.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
        choiceBox.style.zIndex = "1000";
    }, { passive: false });

    choiceBox.addEventListener('touchend', (e) => {
        choiceBox.classList.remove('dragging');
        choiceBox.style.transform = '';
        choiceBox.style.zIndex = "";

        const touch = e.changedTouches[0];

        if (gameSubject === 'maths') {
            const dropZone = document.getElementById('answer-slot');
            const rect = dropZone.getBoundingClientRect();
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                handleDrop(val);
            }
        } else {
            // Find which slot was hit
            const slots = document.querySelectorAll('.letter-slot');
            slots.forEach((slot, index) => {
                const rect = slot.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    handleLetterDrop(val, index);
                }
            });
        }
    });

    // Simple Click Fallback
    choiceBox.addEventListener('click', () => {
        if (gameSubject === 'maths') {
            handleDrop(val);
        } else {
            // Find first empty slot
            const slots = document.querySelectorAll('.letter-slot');
            for (let i = 0; i < slots.length; i++) {
                if (slots[i].textContent === '?' || !slots[i].classList.contains('filled')) {
                    handleLetterDrop(val, i);
                    break;
                }
            }
        }
    });

    choicesArea.appendChild(choiceBox);
}

answerSlot.addEventListener('dragover', (e) => { e.preventDefault(); answerSlot.classList.add('drag-over'); });
answerSlot.addEventListener('dragleave', () => answerSlot.classList.remove('drag-over'));
answerSlot.addEventListener('drop', (e) => {
    e.preventDefault();
    answerSlot.classList.remove('drag-over');
    handleDrop(e.dataTransfer.getData('text/plain'));
});

function handleDrop(selectedAnswer) {
    if (gameSubject !== 'maths') return;

    const val = parseInt(selectedAnswer);
    answerSlot.textContent = val;
    answerSlot.style.color = 'var(--text-color)';
    if (val === correctAnswer) {
        score++;
        addStageStar(); // Add a gold star to the stage!
        answerSlot.style.backgroundColor = '#d4edda';
        answerSlot.style.borderColor = 'var(--success-color)';
        gsap.to(answerSlot, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
        playDance();
    } else {
        answerSlot.style.backgroundColor = '#f8d7da';
        answerSlot.style.borderColor = '#dc3545';
        gsap.to(answerSlot, { x: 10, duration: 0.1, yoyo: true, repeat: 3 });
        setTimeout(() => {
            answerSlot.style.backgroundColor = 'white';
            answerSlot.style.borderColor = '#ccc';
            answerSlot.textContent = '?';
            answerSlot.style.color = '#ccc';
        }, 1000);
    }
}

function handleLetterDrop(letter, index) {
    const slots = document.querySelectorAll('.letter-slot');
    const slot = slots[index];

    if (slot.classList.contains('filled')) return;

    slot.textContent = letter;
    slot.classList.add('filled');
    filledSlots++;

    if (filledSlots === currentWord.length) {
        checkEnglishAnswer();
    }
}

function checkEnglishAnswer() {
    const slots = document.querySelectorAll('.letter-slot');
    let spelledWord = "";
    slots.forEach(slot => spelledWord += slot.textContent);

    if (spelledWord === currentWord) {
        score++;
        addStageStar();
        slots.forEach(slot => {
            slot.style.backgroundColor = '#d4edda';
            slot.style.borderColor = 'var(--success-color)';
        });
        playDance();
    } else {
        slots.forEach(slot => {
            slot.style.backgroundColor = '#f8d7da';
            slot.style.borderColor = '#dc3545';
        });
        gsap.to(spellingSlotsContainer, { x: 10, duration: 0.1, yoyo: true, repeat: 3 });

        setTimeout(() => {
            slots.forEach(slot => {
                slot.textContent = '?';
                slot.classList.remove('filled');
                slot.style.backgroundColor = 'white';
                slot.style.borderColor = '#ccc';
            });
            filledSlots = 0;
        }, 1500);
    }
}

function nextQuestion() {
    if (currentQuestion < totalQuestions) {
        currentQuestion++;
        updateProgress();
        generateQuestion();
    } else {
        showEndGame();
    }
}

function updateProgress() {
    progressBar.style.width = `${(currentQuestion / totalQuestions) * 100}%`;
    currentSumLabel.textContent = currentQuestion;
}

function showEndGame() {
    const subjectName = gameSubject === 'maths' ? 'Maths' : 'English';
    if (score === totalQuestions) {
        modalText.textContent = `PERFECT! Luna is an ${subjectName} Genius! 🏆👑`;
        startFireworks(true); // Special finale
        playCelebration();

        // Let the celebration play for a few seconds before showing the modal
        setTimeout(() => {
            overlay.classList.remove('hidden');
            overlay.style.backgroundColor = 'rgba(0,0,0,0.3)'; // Lighter overlay to see celebration
        }, 4500);
    } else {
        modalText.textContent = `Great Job! Princess Luna is proud of your ${subjectName}! 🌟`;
        overlay.classList.remove('hidden');
        playCelebration();
    }
}

function startFireworks(isFinale = false) {
    let count = 0;
    const max = isFinale ? 30 : 15;
    const intervalTime = isFinale ? 200 : 300;

    const interval = setInterval(() => {
        fireworks.push(new Firework());
        count++;
        if (count > max) clearInterval(interval);
    }, intervalTime);
}

function resetGame() {
    score = 0;
    currentQuestion = 1;
    lastEnglishWord = null;
    clearStageStars();
    initGame();
}

function setMode(mode) {
    gameMode = mode;
    document.getElementById('mode-easy').classList.toggle('active', mode === 'easy');
    document.getElementById('mode-hard').classList.toggle('active', mode === 'hard');
    resetGame();
}


function setupToggles() {
    const mathsBtn = document.getElementById('subject-maths');
    const englishBtn = document.getElementById('subject-english');
    const easyBtn = document.getElementById('mode-easy');
    const hardBtn = document.getElementById('mode-hard');

    if (mathsBtn) mathsBtn.addEventListener('click', () => setSubject('maths'));
    if (englishBtn) englishBtn.addEventListener('click', () => setSubject('english'));
    if (easyBtn) easyBtn.addEventListener('click', () => setMode('easy'));
    if (hardBtn) hardBtn.addEventListener('click', () => setMode('hard'));
}

document.addEventListener('DOMContentLoaded', () => {
    setupUIReferences();
    setupToggles();
    initGame();
});

