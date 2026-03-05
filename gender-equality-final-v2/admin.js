function initAdmin() {
    renderResults();
    renderQuestions();
}

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-pane`).classList.add('active');
    });
});

// Results
function renderResults() {
    const results = DataManager.getResults();
    const body = document.getElementById('results-body');
    body.innerHTML = results.reverse().map(r => `
        <tr>
            <td>${new Date(r.timestamp).toLocaleString()}</td>
            <td>${r.name}</td>
            <td>${r.id}</td>
            <td>${r.score}</td>
        </tr>
    `).join('');
}

document.getElementById('export-csv').addEventListener('click', () => {
    const results = DataManager.getResults();
    if (results.length === 0) return alert('目前沒有成績紀錄');

    let csv = "\uFEFF時間,姓名,ID,得分\n";
    results.forEach(r => {
        csv += `${new Date(r.timestamp).toLocaleString()},${r.name},${r.id},${r.score}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `性別平等遊戲成績_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
});

// Questions
function renderQuestions() {
    const qs = DataManager.getQuestions();
    const body = document.getElementById('questions-body');
    body.innerHTML = qs.map((q, i) => `
        <tr>
            <td>${q.text}</td>
            <td>${q.answer}</td>
            <td>
                <button class="btn-sm btn-edit" onclick="editQ(${i})">編輯</button>
                <button class="btn-sm btn-del" onclick="deleteQ(${i})">刪除</button>
            </td>
        </tr>
    `).join('');
}

window.editQ = function (i) {
    const qs = DataManager.getQuestions();
    const q = qs[i];
    document.getElementById('edit-idx').value = i;
    document.getElementById('q-text').value = q.text;
    document.getElementById('q-ans').value = q.answer;
    document.getElementById('q-exp').value = q.explanation;
    document.getElementById('form-title').textContent = "編輯題目";
    document.getElementById('cancel-edit').style.display = "inline-block";
};

window.deleteQ = function (i) {
    if (!confirm("確定刪除此題目？")) return;
    const qs = DataManager.getQuestions();
    qs.splice(i, 1);
    DataManager.saveQuestions(qs);
    renderQuestions();
};

document.getElementById('save-q').addEventListener('click', () => {
    const idx = parseInt(document.getElementById('edit-idx').value);
    const text = document.getElementById('q-text').value.trim();
    const answer = document.getElementById('q-ans').value;
    const explanation = document.getElementById('q-exp').value.trim();

    if (!text || !explanation) return alert('請填寫完整內容');

    const qs = DataManager.getQuestions();
    if (idx === -1) {
        qs.push({ text, answer, explanation });
    } else {
        qs[idx] = { text, answer, explanation };
    }

    DataManager.saveQuestions(qs);
    resetForm();
    renderQuestions();
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

initAdmin();
