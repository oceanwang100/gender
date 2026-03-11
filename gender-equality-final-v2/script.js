let questions = [];
let currentIdx = 0;
let userScore = 0;
let currentUser = { name: '', id: '' };

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen'),
    certificate: document.getElementById('certificate-screen')
};

const progressBar = document.getElementById('progress-bar');
const currentQSpan = document.getElementById('current-q');
const tempScoreSpan = document.getElementById('temp-score');
const qTextSpan = document.getElementById('question-text');
const feedbackOverlay = document.getElementById('feedback-overlay');

// Sound API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(isCorrect) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (isCorrect) {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1); // C6
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    }
}

// Logic
function showScreen(key) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[key].classList.add('active');
}

async function initGame() {
    const name = document.getElementById('user-name').value.trim();
    const id = document.getElementById('user-id').value.trim();
    if (!name || !id) {
        alert('請填寫姓名與 ID');
        return;
    }
    currentUser = { name, id };

    // 顯示讀取中提示
    const startBtn = document.getElementById('start-btn');
    startBtn.disabled = true;
    startBtn.textContent = '題目載入中…';

    // 初始化 Firebase 連線偵測（含 fallback）
    await DataManager.init();

    // 取得題目（Firebase 可用時從雲端取，否則用內建題目）
    const allQ = await DataManager.getQuestions();
    questions = allQ.sort(() => Math.random() - 0.5).slice(0, 10);

    startBtn.disabled = false;
    startBtn.textContent = '開始挑戰';

    currentIdx = 0;
    userScore = 0;
    updateUI();
    showScreen('game');
    loadQuestion();
}

function loadQuestion() {
    const q = questions[currentIdx];
    qTextSpan.textContent = q.text;
    currentQSpan.textContent = currentIdx + 1;
    progressBar.style.width = ((currentIdx) / 10 * 100) + '%';
}

function checkAnswer(answer) {
    const q = questions[currentIdx];
    const isCorrect = answer === q.answer;

    if (isCorrect) userScore += 10;
    playSound(isCorrect);

    document.getElementById('feedback-title').textContent = isCorrect ? "回答正確！🎉" : "太可惜了... 😿";
    document.getElementById('feedback-title').style.color = isCorrect ? "#2b8a3e" : "#c92a2a";
    document.getElementById('feedback-msg').textContent = q.explanation;

    feedbackOverlay.classList.add('active');
    updateUI();
}

function updateUI() {
    tempScoreSpan.textContent = userScore;
}

function nextQuestion() {
    feedbackOverlay.classList.remove('active');
    currentIdx++;
    if (currentIdx < 10) {
        loadQuestion();
    } else {
        finishGame();
    }
}

async function finishGame() {
    progressBar.style.width = '100%';
    document.getElementById('final-score').textContent = userScore;
    try {
        await DataManager.saveResult({
            name: currentUser.name,
            id: currentUser.id,
            score: userScore
        });
    } catch (e) {
        console.warn('成績上傳失敗（可能是離線狀態）：', e);
    }
    showScreen('result');
}

function showCertificate() {
    const today = new Date().toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    // 填入網頁版獎狀
    document.getElementById('cert-name-display').textContent = currentUser.name;
    document.getElementById('cert-id-display').textContent = currentUser.id;
    document.getElementById('cert-score-display').textContent = userScore;
    document.getElementById('cert-date-display').textContent = today;
    // 同步填入隱藏的 PDF 用獎狀
    document.getElementById('cert-name').textContent = currentUser.name;
    document.getElementById('cert-id').textContent = currentUser.id;
    document.getElementById('cert-score').textContent = userScore;
    document.getElementById('cert-date').textContent = today;

    showScreen('certificate');
}

// PDF Export
async function downloadPDF() {
    const btn = document.getElementById('pdf-btn');
    btn.disabled = true;
    btn.textContent = "正在製作獎狀...";

    document.getElementById('cert-name').textContent = currentUser.name;
    document.getElementById('cert-id').textContent = currentUser.id;
    document.getElementById('cert-score').textContent = userScore;
    document.getElementById('cert-date').textContent = new Date().toLocaleDateString('zh-TW');

    const certArea = document.getElementById('cert-preview');
    certArea.style.display = 'block';

    try {
        const canvas = await html2canvas(certArea, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`性別平等獎狀_${currentUser.name}.pdf`);
    } catch (e) {
        console.error(e);
        alert('PDF 匯出失敗，請重試。');
    } finally {
        certArea.style.display = 'none';
        btn.disabled = false;
        btn.textContent = "下載獎狀 PDF";
    }
}

// ========== Share & Save Image Functions ==========

function showToast(msg) {
    let toast = document.getElementById('share-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'share-toast';
        toast.className = 'share-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

async function saveImage() {
    const btn = document.getElementById('save-img-btn');
    btn.disabled = true;
    btn.textContent = '正在產生圖片...';
    const certArea = document.getElementById('cert-preview');
    certArea.style.display = 'block';
    try {
        const canvas = await html2canvas(certArea, { scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.download = `性別平等獎狀_${currentUser.name}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('✅ 獎狀圖片已儲存！');
    } catch (e) {
        alert('圖片別存失敗，請重試。');
    } finally {
        certArea.style.display = 'none';
        btn.disabled = false;
        btn.textContent = '📸 儲存獎狀圖片';
    }
}

function getShareText() {
    return `我完成了「性別平等小學堂」闖關遊戲，獲得 ${userScore} 分！🌸 一起來挑戰看看吧！`;
}

function shareToLine() {
    const text = encodeURIComponent(getShareText());
    window.open(`https://line.me/R/msg/text/?${text}`, '_blank');
}

function shareToFacebook() {
    const text = getShareText();
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ 分享文字已複製！請貼到 Facebook');
        window.open('https://www.facebook.com/', '_blank');
    }).catch(() => {
        showToast('請手動複製：' + text);
    });
}

async function copyShareText() {
    const text = getShareText();
    try {
        await navigator.clipboard.writeText(text);
        showToast('✅ 分享文字已複製到剪貼簿！');
        const btn = document.getElementById('share-copy-btn');
        btn.textContent = '✔️ 已複製！';
        setTimeout(() => { btn.textContent = '📋 複製文字'; }, 2000);
    } catch (e) {
        prompt('請手動複製以下文字：', getShareText());
    }
}

async function nativeShare() {
    const certArea = document.getElementById('cert-preview');
    certArea.style.display = 'block';
    try {
        const canvas = await html2canvas(certArea, { scale: 2, useCORS: true });
        certArea.style.display = 'none';
        canvas.toBlob(async (blob) => {
            const file = new File([blob], `獎狀_${currentUser.name}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: '性別平等小學堂 獎狀',
                    text: getShareText(),
                    files: [file]
                });
            } else {
                await navigator.share({ title: '性別平等小學堂 獎狀', text: getShareText() });
            }
        }, 'image/png');
    } catch (e) {
        certArea.style.display = 'none';
        if (e.name !== 'AbortError') showToast('分享失敗，請重試');
    }
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', initGame);
document.querySelectorAll('.choice-btn').forEach(b => {
    b.addEventListener('click', () => checkAnswer(b.dataset.answer));
});
document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('user-name').value = '';
    document.getElementById('user-id').value = '';
    showScreen('start');
});
document.getElementById('view-cert-btn').addEventListener('click', showCertificate);
document.getElementById('print-cert-btn').addEventListener('click', () => window.print());
document.getElementById('pdf-btn').addEventListener('click', downloadPDF);
document.getElementById('save-img-btn').addEventListener('click', saveImage);
document.getElementById('share-line-btn').addEventListener('click', shareToLine);
document.getElementById('share-fb-btn').addEventListener('click', shareToFacebook);
document.getElementById('share-copy-btn').addEventListener('click', copyShareText);
document.getElementById('restart-btn-cert').addEventListener('click', () => {
    document.getElementById('user-name').value = '';
    document.getElementById('user-id').value = '';
    showScreen('start');
});

// 支援 Web Share API 時顯示原生分享按鈕
if (navigator.share) {
    const nativeBtn = document.getElementById('share-native-btn');
    nativeBtn.style.display = 'inline-flex';
    nativeBtn.addEventListener('click', nativeShare);
}
