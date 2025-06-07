// ✅ 新規ファイル: js/eventHandlers.js

import { startGame, score, loadWordsAndStartGame } from "./gameLogic.js";
import { resetAll, showOnlineRanking, showLocalRanking, getStyledWord } from "./ui.js";
import { clearScores } from "./storage.js";
import { submitScore, deleteScoresByName } from "./db.js";
import { getSavedName, saveName, preloadNameInput, isValidName } from "./playerName.js";

export function setupEventHandlers() {
    const startButton = document.getElementById("startButton");
    const restartButton = document.getElementById("restartButton");
    const submitButton = document.getElementById("submitScoreButton");
    const deleteOnlineButton = document.getElementById("deleteOnlineScoresButton");
    const deleteLocalButton = document.getElementById("deleteLocalScoresButton");
    const changeNameButton = document.getElementById("changeNameButton");
    const confirmNameButton = document.getElementById("confirmNameButton");
    const cancelNameEditButton = document.getElementById("cancelNameEditButton");
    const nameInput = document.getElementById("playerName");

    //   ゲーム画面の状態
    let isChangingNameInGameOver = false;
    // 
    let userInput = '';
    let currentWord = 'apple';


    preloadNameInput(nameInput);
    updateCurrentNameDisplay();

    startButton.addEventListener("click", () => {
        const name = nameInput.value;
        if (!isValidName(name)) {
            alert("名前を入力してください");
            return;
        }
        saveName(name);
        updateCurrentNameDisplay();
        resetAll();
        document.getElementById("nameSetupArea").style.display = "none";
        document.getElementById("controlArea").style.display = "none";
        loadWordsAndStartGame(); 
    });

    restartButton.addEventListener("click", () => {
        resetAll({ isRestart: true });
        loadWordsAndStartGame(); 
    });

    submitButton.addEventListener("click", () => {
        const name = getSavedName() || "匿名";
        if (!window.SUPABASE_CONFIG?.url || !window.SUPABASE_CONFIG?.key) {
            alert("⚠️ オンライン接続できないため、スコアは送信されません。");
            return;
        }
        submitScore(score, name).then(() => {
            updateRankingView();
        });
    });

    deleteOnlineButton?.addEventListener("click", () => {
        const name = getSavedName() || "匿名";
        if (!window.SUPABASE_CONFIG?.url || !window.SUPABASE_CONFIG?.key) {
            alert("⚠️ オンライン接続できないため、スコアは削除できません。");
            return;
        }
        const confirmDelete = confirm(`オンライン上の「${name}」名義のスコアを削除しますか？`);
        if (confirmDelete) {
            deleteScoresByName(name).then(() => {
                updateRankingView();
            });
        }
    });

    deleteLocalButton.addEventListener("click", () => {
        clearScores();
        updateRankingView();
    });

    changeNameButton.addEventListener("click", () => {
        isChangingNameInGameOver = true;
        document.getElementById("nameSetupArea").style.display = "block";
        document.getElementById("controlArea").style.display = "none";
        confirmNameButton.style.display = "inline-block";
        cancelNameEditButton.style.display = "inline-block";
    });

    confirmNameButton.addEventListener("click", () => {
        const newName = nameInput.value;
        if (!isValidName(newName)) {
            alert("名前を入力してください");
            return;
        }
        saveName(newName);
        updateCurrentNameDisplay();
        document.getElementById("nameSetupArea").style.display = "none";
        confirmNameButton.style.display = "none";
        cancelNameEditButton.style.display = "none";

        if (!isChangingNameInGameOver) {
            document.getElementById("controlArea").style.display = "block";
        }
        isChangingNameInGameOver = false;
        alert(`名前を「${newName}」に変更しました`);
    });

    cancelNameEditButton.addEventListener("click", () => {
        document.getElementById("nameSetupArea").style.display = "none";
        confirmNameButton.style.display = "none";
        cancelNameEditButton.style.display = "none";
        if (!isChangingNameInGameOver) {
            document.getElementById("controlArea").style.display = "block";
        }
        isChangingNameInGameOver = false;
    });
}

function updateRankingView() {
    showOnlineRanking();
    showLocalRanking();
}

function updateCurrentNameDisplay() {
    const name = getSavedName();
    const display = document.getElementById("currentNameDisplay");
    display.textContent = name ? `名前：${name}` : "名前：未設定";
}
