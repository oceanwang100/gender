// ============================================================
// admin.js — Firebase Realtime Database 版本
// 成績與題目均從 Firebase 雲端讀寫，支援跨裝置同步
// ============================================================

// ---------- 分頁切換 ----------
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-pane`).classList.add('active');
    });
});

// ---------- 成績列表 ----------
async function renderResults() {
    const body = document.getElementById('results-body');
    body.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#aaa;">載入中…</td></tr>';
    try {
        const results = await DataManager.getResults();
        if (results.length === 0) {
            body.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#aaa;">目前尚無成績紀錄</td></tr>';
            return;
        }
        // 依時間倒序排列
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        body.innerHTML = results.map(r => `
            <tr>
                <td>${new Date(r.timestamp).toLocaleString('zh-TW')}</td>
                <td>${r.name}</td>
                <td>${r.id}</td>
                <td>${r.score}</td>
            </tr>
        `).join('');
    } catch (e) {
        body.innerHTML = '<tr><td colspan="4" style="text-align:center;color:red;">載入失敗，請重新整理頁面</td></tr>';
        console.error(e);
    }
}

document.getElementById('export-csv').addEventListener('click', async () => {
    try {
        const results = await DataManager.getResults();
        if (results.length === 0) return alert('目前沒有成績紀錄');

        let csv = "\uFEFF時間,姓名,ID,得分\n";
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        results.forEach(r => {
            csv += `${new Date(r.timestamp).toLocaleString('zh-TW')},${r.name},${r.id},${r.score}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `性別平等遊戲成績_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    } catch (e) {
        alert('匯出失敗，請重試');
    }
});

// ---------- 題庫管理 ----------
// 儲存目前題目陣列（用於編輯/刪除操作）
let currentQuestions = [];

async function renderQuestions() {
    const body = document.getElementById('questions-body');
    body.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#aaa;">載入中…</td></tr>';
    try {
        currentQuestions = await DataManager.getQuestions();
        body.innerHTML = currentQuestions.map((q, i) => `
            <tr>
                <td>${q.text}</td>
                <td style="text-align:center;font-weight:bold;">${q.answer}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editQ(${i})">編輯</button>
                    <button class="btn-sm btn-del" onclick="deleteQ(${i})">刪除</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        body.innerHTML = '<tr><td colspan="3" style="text-align:center;color:red;">載入失敗，請重新整理頁面</td></tr>';
        console.error(e);
    }
}

window.editQ = function (i) {
    const q = currentQuestions[i];
    document.getElementById('edit-idx').value = i;
    document.getElementById('q-text').value = q.text;
    document.getElementById('q-ans').value = q.answer;
    document.getElementById('q-exp').value = q.explanation;
    document.getElementById('form-title').textContent = "編輯題目";
    document.getElementById('cancel-edit').style.display = "inline-block";
    // 捲動到表單
    document.getElementById('form-title').scrollIntoView({ behavior: 'smooth' });
};

window.deleteQ = async function (i) {
    if (!confirm(`確定刪除第 ${i + 1} 題？`)) return;
    try {
        currentQuestions.splice(i, 1);
        await DataManager.saveQuestions(currentQuestions);
        await renderQuestions();
    } catch (e) {
        alert('刪除失敗，請重試');
    }
};

document.getElementById('save-q').addEventListener('click', async () => {
    const btn = document.getElementById('save-q');
    const idx = parseInt(document.getElementById('edit-idx').value);
    const text = document.getElementById('q-text').value.trim();
    const answer = document.getElementById('q-ans').value;
    const explanation = document.getElementById('q-exp').value.trim();

    if (!text || !explanation) return alert('請填寫完整內容');

    btn.disabled = true;
    btn.textContent = '儲存中…';

    try {
        if (idx === -1) {
            currentQuestions.push({ text, answer, explanation });
        } else {
            currentQuestions[idx] = { text, answer, explanation };
        }
        await DataManager.saveQuestions(currentQuestions);
        resetForm();
        await renderQuestions();
    } catch (e) {
        alert('儲存失敗，請重試');
    } finally {
        btn.disabled = false;
        btn.textContent = '儲存題目';
    }
});

function resetForm() {
    document.getElementById('edit-idx').value = "-1";
    document.getElementById('q-text').value = "";
    document.getElementById('q-ans').value = "O";
    document.getElementById('q-exp').value = "";
    document.getElementById('form-title').textContent = "新增題目";
    document.getElementById('cancel-edit').style.display = "none";
}

document.getElementById('cancel-edit').addEventListener('click', resetForm);

// ---------- 初始化 ----------
async function initAdmin() {
    await renderResults();
    await renderQuestions();
}

initAdmin();
