const DATA_KEYS = {
    QUESTIONS: 'geg_v2_questions',
    RESULTS: 'geg_v2_results'
};

const DEFAULT_QUESTIONS = [
    { text: "「抱持不同性別者應能享有平等權利之理念」是性別差異與尊重同理中的積極適應性作為。", answer: "O", explanation: "正確！這展現了對性別平等的尊重與理解。" },
    { text: "性教育是生物、社會技能、愛和關懷的態度及人生見解等之組合。", answer: "O", explanation: "正確！性教育涵蓋了生理、心理及社會等多個層面。" },
    { text: "「性別平等是一種價值，而非福利」是性別主流化的基本概念之一。", answer: "O", explanation: "正確！性別平等是普世價值，不是少數人的福利。" },
    { text: "在家中實施性教育應要留意：少批評、多論述。", answer: "O", explanation: "正確！開放且正向的溝通有助於建立良好的家庭性教育環境。" },
    { text: "「重視對方所做的自我決定」是在人我關係中「尊重」的運用。", answer: "O", explanation: "正確！尊重對方的自主權是良好人際關係的基石。" },
    { text: "與性教育實施相關的面向也包含了法律、環境。", answer: "O", explanation: "正確！性教育不僅是個人知識，也涉及社會法律與環境的支持。" },
    { text: "性癖好是指一個人對另一個在情感上有持續浪漫愛、性慾或情感的吸引，用來描述一個人性渴望、幻想和感覺的趨向。", answer: "X", explanation: "錯誤。題目描述的是「性傾向」（Sexual Orientation），而非性癖好。" },
    { text: "注意個體自我概念的完整與正向發展，也是性別平等在家庭教育上的作法之一。", answer: "O", explanation: "正確！培養孩子正向的自我概念有助於建立自信與平等的性別觀念。" },
    { text: "透過權威分配不同性別家人的家事的分工，是性別平等在家庭中推動的第一步。", answer: "X", explanation: "錯誤。應透過溝通與協商，打破傳統性別刻板印象，共同分擔家務，而非權威分配。" },
    { text: "在家庭中對孩子進行性教育時為免尷尬，溝通時盡量避免面對面。", answer: "X", explanation: "錯誤。真誠、自然的「面對面」溝通能讓孩子感受到父母的關心與開放態度。" }
];

const DataManager = {
    init: function() {
        if (!localStorage.getItem(DATA_KEYS.QUESTIONS)) {
            localStorage.setItem(DATA_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
        }
        if (!localStorage.getItem(DATA_KEYS.RESULTS)) {
            localStorage.setItem(DATA_KEYS.RESULTS, JSON.stringify([]));
        }
    },

    getQuestions: function() {
        this.init();
        return JSON.parse(localStorage.getItem(DATA_KEYS.QUESTIONS));
    },

    saveQuestions: function(questions) {
        localStorage.setItem(DATA_KEYS.QUESTIONS, JSON.stringify(questions));
    },

    getResults: function() {
        this.init();
        return JSON.parse(localStorage.getItem(DATA_KEYS.RESULTS));
    },

    saveResult: function(userResult) {
        const results = this.getResults();
        userResult.timestamp = new Date().toISOString();
        results.push(userResult);
        localStorage.setItem(DATA_KEYS.RESULTS, JSON.stringify(results));
    }
};
DataManager.init();
