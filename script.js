document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const resultSection = document.getElementById('resultSection');
    const originalImage = document.getElementById('originalImage');
    const splitImages = document.getElementById('splitImages');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let splitImageDataUrls = [];

    // ドラッグ&ドロップイベント
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleFile(files[0]);
        }
    });

    // クリックでファイル選択（ラベル以外の部分をクリックした場合のみ）
    dropZone.addEventListener('click', (e) => {
        // ラベルやファイル入力からのクリックの場合は無視（二重起動防止）
        if (e.target.closest('.file-label') || e.target === fileInput) {
            return;
        }
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // ファイル処理
    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // 新しいImageオブジェクトを作成して読み込みを確実に
            const img = new Image();
            img.onload = () => {
                originalImage.src = img.src;
                previewSection.style.display = 'block';
                splitImage();
            };
            img.onerror = () => {
                alert('画像の読み込みに失敗しました。別の画像をお試しください。');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            alert('ファイルの読み込みに失敗しました。');
        };
        reader.readAsDataURL(file);

        // 同じファイルを再選択できるようにリセット
        fileInput.value = '';
    }

    // 画像を縦4分割
    function splitImage() {
        const img = originalImage;
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const partHeight = Math.floor(height / 4);

        splitImages.innerHTML = '';
        splitImageDataUrls = [];

        for (let i = 0; i < 4; i++) {
            const startY = i * partHeight;
            const currentHeight = (i === 3) ? height - startY : partHeight;

            canvas.width = width;
            canvas.height = currentHeight;

            ctx.drawImage(
                img,
                0, startY, width, currentHeight,
                0, 0, width, currentHeight
            );

            const dataUrl = canvas.toDataURL('image/png');
            splitImageDataUrls.push(dataUrl);

            const card = document.createElement('div');
            card.className = 'split-image-card';

            const preview = document.createElement('img');
            preview.src = dataUrl;
            preview.alt = `分割画像 ${i + 1}`;

            const label = document.createElement('span');
            label.textContent = `パート ${i + 1}`;

            const btn = document.createElement('button');
            btn.className = 'download-btn';
            btn.textContent = 'ダウンロード';
            btn.addEventListener('click', () => downloadImage(dataUrl, `split_${i + 1}.png`));

            card.appendChild(preview);
            card.appendChild(label);
            card.appendChild(btn);
            splitImages.appendChild(card);
        }

        resultSection.style.display = 'block';
    }

    // 画像ダウンロード
    function downloadImage(dataUrl, filename) {
        // Data URLをBlobに変換
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        // Blob URLを作成してダウンロード
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // ブラウザがファイルを取得する時間を確保してからメモリ解放
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        }, 150);
    }

    // 全画像ダウンロード
    downloadAllBtn.addEventListener('click', () => {
        splitImageDataUrls.forEach((dataUrl, index) => {
            setTimeout(() => {
                downloadImage(dataUrl, `split_${index + 1}.png`);
            }, index * 200);
        });
    });
});
