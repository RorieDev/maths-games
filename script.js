let currentQuestion = 1;
let score = 0;
let correctAnswer = 0;
const totalQuestions = 10;

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

// Three.js 3D Stage Variables
let scene, camera, renderer, characterGroup, spotlight;
let isDancing = false;
let fireworks = [];

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

    if (characterGroup && !isDancing) {
        // Princess Breathing & Swaying
        const time = Date.now() * 0.002;
        characterGroup.position.y = Math.sin(time) * 0.05;
        head.rotation.z = Math.sin(time * 0.5) * 0.05;

        // Eyes follow subtle movement
        leftEye.rotation.y = Math.sin(time * 0.5) * 0.1;
        rightEye.rotation.y = Math.sin(time * 0.5) * 0.1;
    }

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
    currentQuestion = 1;
    score = 0;
    updateProgress();
    generateQuestion();
    overlay.classList.add('hidden');
    if (!scene) init3D();
}

function generateQuestion() {
    const isAddition = Math.random() > 0.5;
    let n1, n2;
    if (isAddition) {
        n1 = Math.floor(Math.random() * 10) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = n1 + n2;
        operatorElement.textContent = '+';
    } else {
        n1 = Math.floor(Math.random() * 10) + 5;
        n2 = Math.floor(Math.random() * n1) + 1;
        correctAnswer = n1 - n2;
        operatorElement.textContent = '-';
    }
    num1Element.textContent = n1;
    num2Element.textContent = n2;
    answerSlot.textContent = '?';
    answerSlot.style.color = '#ccc';
    generateChoices();
}

function generateChoices() {
    choicesArea.innerHTML = '';
    const choices = [correctAnswer];
    while (choices.length < 4) {
        let wrong = Math.floor(Math.random() * (correctAnswer > 5 ? 20 : 10));
        if (!choices.includes(wrong) && wrong >= 0) choices.push(wrong);
    }
    choices.sort(() => Math.random() - 0.5);
    choices.forEach(val => {
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
            e.preventDefault(); // Stop page scrolling while dragging
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
            const dropZone = document.getElementById('answer-slot');
            const rect = dropZone.getBoundingClientRect();

            // Check if touch is inside the answer slot boundaries
            if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                handleDrop(val);
            }
        });

        // Simple Click Fallback (Tap number, then it fills)
        choiceBox.addEventListener('click', () => {
            handleDrop(val);
        });

        choicesArea.appendChild(choiceBox);
    });
}

answerSlot.addEventListener('dragover', (e) => { e.preventDefault(); answerSlot.classList.add('drag-over'); });
answerSlot.addEventListener('dragleave', () => answerSlot.classList.remove('drag-over'));
answerSlot.addEventListener('drop', (e) => {
    e.preventDefault();
    answerSlot.classList.remove('drag-over');
    handleDrop(e.dataTransfer.getData('text/plain'));
});

function handleDrop(selectedAnswer) {
    const val = parseInt(selectedAnswer);
    answerSlot.textContent = val;
    answerSlot.style.color = 'var(--text-color)';
    if (val === correctAnswer) {
        score++;
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
    overlay.classList.remove('hidden');

    if (score === totalQuestions) {
        modalText.textContent = `PERFECT! Luna is a Math Legend! 🏆👑`;
        startFireworks();
    } else {
        modalText.textContent = `Great Job! Princess Luna is proud! 🌟`;
    }

    playCelebration();
}

function startFireworks() {
    let count = 0;
    const interval = setInterval(() => {
        fireworks.push(new Firework());
        count++;
        if (count > 15) clearInterval(interval);
    }, 300);
}

function resetGame() {
    location.reload();
}

document.addEventListener('DOMContentLoaded', initGame);
