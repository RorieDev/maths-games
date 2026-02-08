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

// Body parts for secondary animations
let head, body, dress, leftEye, rightEye, mouth;

// Initialize 3D Engine
function init3D() {
    const container = document.getElementById('three-stage');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 7);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    scene.add(hemiLight);

    spotlight = new THREE.SpotLight(0xffffff, 0.8);
    spotlight.position.set(5, 10, 5);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
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
        color: 0xff0a54,
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

    // 5. Hair (Stylized Princess Hair)
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xf9d71c }); // Blonde hair
    const hairGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const hairTop = new THREE.Mesh(hairGeo, hairMat);
    hairTop.position.z = -0.15;
    hairTop.scale.set(1.0, 1.0, 0.7);
    head.add(hairTop);

    // Long Hair Strands
    const strandGeo = new THREE.CapsuleGeometry(0.2, 1.5, 4, 16);
    const leftStrand = new THREE.Mesh(strandGeo, hairMat);
    leftStrand.position.set(-0.5, -0.6, -0.1);
    leftStrand.rotation.z = 0.1;
    head.add(leftStrand);

    const rightStrand = leftStrand.clone();
    rightStrand.position.set(0.5, -0.6, -0.1);
    rightStrand.rotation.z = -0.1;
    head.add(rightStrand);

    const backHairGeo = new THREE.CapsuleGeometry(0.4, 1.8, 4, 16);
    const backHair = new THREE.Mesh(backHairGeo, hairMat);
    backHair.position.set(0, -0.8, -0.3);
    head.add(backHair);

    // 6. Crown (Golden)
    const crownGeo = new THREE.TorusGeometry(0.2, 0.04, 16, 32);
    const crownMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 1,
        roughness: 0.1
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 0.5;
    head.add(crown);

    // Crown peaks
    const peakGeo = new THREE.ConeGeometry(0.05, 0.15, 16);
    for (let i = 0; i < 5; i++) {
        const peak = new THREE.Mesh(peakGeo, crownMat);
        const angle = (i / 5) * Math.PI * 2;
        peak.position.set(Math.cos(angle) * 0.2, 0.1, Math.sin(angle) * 0.2);
        crown.add(peak);
    }

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
        choiceBox.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', val);
            choiceBox.classList.add('dragging');
        });
        choiceBox.addEventListener('dragend', () => choiceBox.classList.remove('dragging'));
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
    modalText.textContent = `Princess Luna is the Math Star! 👑`;
    playCelebration();
}

function resetGame() {
    location.reload();
}

initGame();
