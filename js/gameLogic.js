// ✅ js/gameLogic.js

import {
    updateScore,
    updateWordDisplay,
    showResultArea,
    showLocalRanking,
    showOnlineRanking,
    renderKeyboard
} from "./ui.js";
import { startTimer, stopTimer } from "./timer.js";
import { saveScore } from "./storage.js";

let currentWord = "";
let userInput = "";
export let score = 0;
let isLocked = false;
let words = []; 

// 🔁 単語リスト読み込みと開始処理
export async function loadWordsAndStartGame() {
    const startBtn = document.getElementById("startButton");
    const controlArea = document.getElementById("controlArea");

    try {
        const res = await fetch("./assets/wordlist.json");
        if (!res.ok) throw new Error("単語リスト読み込み失敗");
        words = await res.json();
        console.log("📘 単語リスト読み込み完了:", words.length, "語");
        startGame(); // 単語ロード後に開始
    } catch (err) {
        console.error("❌ 単語ファイル読み込みエラー:", err.message);
        alert("単語リストの読み込みに失敗しました");
        if (controlArea) controlArea.style.display = "block";     // ← 親ブロックを表示
        if (startBtn) startBtn.style.display = "inline-block";
    }
}

// ✅ ゲーム開始時に呼び出される
export function startGame() {
    score = 0;
    userInput = "";
    updateScore(score);
    setNewWord();

    // ✅ 旧 input欄を無効化（存在していれば）
    // const input = document.getElementById("inputField");
    // if (input) {
    //   input.disabled = true;
    //   input.style.display = "none";
    // }

    // ✅ キーボード入力を監視して処理
    document.removeEventListener("keydown", handleTyping);
    document.addEventListener("keydown", handleTyping);
    renderKeyboard();

    startTimer(endGame);
}

// ✅ キー入力で正誤判定・進行
function handleTyping(e) {
    if (isLocked) return;

    const key = e.key.toLowerCase();
    const expected = currentWord.charAt(userInput.length).toLowerCase();
    const keyEl = document.querySelector(`.key[data-key="${key}"]`);

    if (/^[a-z]$/.test(key)) {
        if (key === expected) {
            userInput += key;
            updateWordDisplay(styleWord(currentWord, userInput));
            if (keyEl) keyEl.classList.add("active");

            if (userInput === currentWord) {
                score++;
                updateScore(score);
                userInput = "";
                setNewWord();
            }
        } else {
            showError();
            if (keyEl) keyEl.classList.add("wrong");
        }

        // 色を200ms後にリセット
        setTimeout(() => {
            if (keyEl) keyEl.classList.remove("active", "wrong");
        }, 500);
    }
}


// ✅ 単語をセット
function setNewWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    updateWordDisplay(styleWord(currentWord, ""));
}

// ✅ 赤く1秒間表示する
function showError() {
    if (isLocked) return;
    isLocked = true;

    updateWordDisplay(styleWord(currentWord, userInput, true));
    setTimeout(() => {
        updateWordDisplay(styleWord(currentWord, userInput));
        isLocked = false;
    }, 300);
}

// ✅ 強調表示
function styleWord(word, input, isError = false) {
    const index = input.length;
    return word
        .split("")
        .map((char, i) => {
            if (i === index) {
                const color = isError ? "red" : "blue";
                return `<span style="color:${color}; font-size:1.5em;">${char}</span>`;
            }
            return char;
        })
        .join("");
}

// ✅ ゲーム終了時処理
export function endGame() {
    document.removeEventListener("keydown", handleTyping);

    const nameInput = document.getElementById("playerName");
    const name = nameInput && nameInput.value.trim() !== "" ? nameInput.value.trim() : "匿名";

    stopTimer();
    saveScore(score);
    showResultArea(score);
    showLocalRanking();
    showOnlineRanking();
}
