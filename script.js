// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const resultSection = document.getElementById('resultSection');
const originalImage = document.getElementById('originalImage');
const splitBtn = document.getElementById('splitBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const splitGrid = document.getElementById('splitGrid');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// State
let currentImage = null;
let splitImages = [];

// ===== Event Listeners =====

// Click to upload
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

// Split button
splitBtn.addEventListener('click', () => {
    splitImage();
});

// Reset button
resetBtn.addEventListener('click', () => {
    resetApp();
});

// Download all button
downloadAllBtn.addEventListener('click', () => {
    downloadAll();
});

// ===== Functions =====

function handleFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            originalImage.src = e.target.result;

            // Show preview section
            uploadSection.classList.add('hidden');
            previewSection.classList.remove('hidden');
            previewSection.classList.add('fade-in');

            // Hide result section if visible
            resultSection.classList.add('hidden');
            splitImages = [];
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function splitImage() {
    if (!currentImage) return;

    const width = currentImage.width;
    const height = currentImage.height;
    const splitHeight = Math.floor(height / 4);

    splitImages = [];
    splitGrid.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        // Calculate crop dimensions (縦方向に分割)
        const startY = i * splitHeight;
        const cropHeight = (i === 3) ? (height - startY) : splitHeight; // Last piece gets remainder

        // Set canvas size
        canvas.width = width;
        canvas.height = cropHeight;

        // Clear and draw
        ctx.clearRect(0, 0, width, cropHeight);
        ctx.drawImage(
            currentImage,
            0, startY, width, cropHeight,  // Source
            0, 0, width, cropHeight         // Destination
        );

        // Get data URL
        const dataUrl = canvas.toDataURL('image/png');
        splitImages.push(dataUrl);

        // Create grid item
        const item = document.createElement('div');
        item.className = 'split-item fade-in';
        item.style.animationDelay = `${i * 0.1}s`;

        item.innerHTML = `
            <div class="split-item-header">パート ${i + 1}</div>
            <div class="split-item-image">
                <img src="${dataUrl}" alt="パート ${i + 1}">
            </div>
            <div class="split-item-footer">
                <button class="btn btn-download" onclick="downloadImage(${i})">
                    📥 ダウンロード
                </button>
            </div>
        `;

        splitGrid.appendChild(item);
    }

    // Show result section
    resultSection.classList.remove('hidden');
    resultSection.classList.add('fade-in');

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function downloadImage(index) {
    if (!splitImages[index]) return;

    const link = document.createElement('a');
    link.download = `split_part_${index + 1}.png`;
    link.href = splitImages[index];
    link.click();
}

function downloadAll() {
    splitImages.forEach((dataUrl, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.download = `split_part_${index + 1}.png`;
            link.href = dataUrl;
            link.click();
        }, index * 200); // Stagger downloads
    });
}

function resetApp() {
    // Clear state
    currentImage = null;
    splitImages = [];
    fileInput.value = '';

    // Reset UI
    uploadSection.classList.remove('hidden');
    previewSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    splitGrid.innerHTML = '';

    // Clear preview
    originalImage.src = '';
}

// Make downloadImage available globally for onclick
window.downloadImage = downloadImage;
