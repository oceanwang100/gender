// Firebase 設定檔
// 請勿隨意修改此檔案，若需更換 Firebase 專案，請更新以下設定

const firebaseConfig = {
    apiKey: "AIzaSyBrQ8EZuYC62pAwNA5JUdOvVlmTaPy_ARo",
    authDomain: "gender-equality-game.firebaseapp.com",
    // 注意：databaseURL 格式為 https://<projectId>-default-rtdb.firebaseio.com
    // 若資料庫建立於亞洲區，請至 Firebase Console > Realtime Database 查看正確 URL
    databaseURL: "https://gender-equality-game-default-rtdb.firebaseio.com",
    projectId: "gender-equality-game",
    storageBucket: "gender-equality-game.firebasestorage.app",
    messagingSenderId: "407617077929",
    appId: "1:407617077929:web:1475a82b6a27d8bc20dfb8",
    measurementId: "G-36Z7HSX1TC"
};

// 初始化 Firebase App（compat 版）
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
