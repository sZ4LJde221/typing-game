// main.js
import { startGame, endGame, score } from "./gameLogic.js";
import { resetUI, setupRankingToggle, showOnlineRanking } from "./ui.js";
import { clearScores } from "./storage.js";
import { submitScore } from "./db.js";
import { deleteScoresByName } from "./db.js";



document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startButton");
    const restartButton = document.getElementById("restartButton");
    const nameInput = document.getElementById("playerName");
    const savedName = localStorage.getItem("playerName");
    let isChangingNameInGameOver = false; // ゲーム終了後の名前変更かどうか

    if (savedName) {
        nameInput.value = savedName;
    }

    // スタートボタン
    startButton.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (!name) {
            alert("名前を入力してください");
            return;
        }
        // 名前更新
        localStorage.setItem("playerName", name);
        updateCurrentNameDisplay();

        console.log("スタートボタンが押されました");
        resetUI();

        // スタートボタン非表示
        document.getElementById("nameSetupArea").style.display = "none";
        document.getElementById("controlArea").style.display = "none";

        startGame();
    });

    restartButton.addEventListener("click", () => {
        console.log("リスタートボタンが押されました");
        resetUI();
        startGame();
    });

    // 削除
    // const clearButton = document.getElementById("clearButton");
    // clearButton.addEventListener("click", () => {
    //     clearScores();
    //     alert("保存データを削除しました。");
    // });

    setupRankingToggle(); // ← ランキング切り替え機能を初期化

    // 送信
    const submitButton = document.getElementById("submitScoreButton");
    submitButton.addEventListener("click", () => {
        // const nameInput = document.getElementById("playerName");
        // const name = nameInput && nameInput.value.trim() !== "" ? nameInput.value.trim() : "匿名";
        const name = localStorage.getItem("playerName") || "匿名";

        submitScore(score, name);     // Supabaseに送信
        showOnlineRanking();          // 送信後にランキング更新
    });

    //   オンライン削除
    // オンラインスコア削除ボタンのイベント
    const deleteOnlineButton = document.getElementById("deleteOnlineScoresButton");
    if (deleteOnlineButton) {
        deleteOnlineButton.addEventListener("click", () => {
            const nameInput = document.getElementById("playerName");
            const name = nameInput && nameInput.value.trim() !== "" ? nameInput.value.trim() : "匿名";

            const confirmDelete = confirm(`オンライン上の「${name}」名義のスコアを削除しますか？`);
            if (confirmDelete) {
                deleteScoresByName(name);
            }
        });
    }

    // 名前表示
    function updateCurrentNameDisplay() {
        const name = localStorage.getItem("playerName");
        const display = document.getElementById("currentNameDisplay");
        display.textContent = name ? `名前：${name}` : "名前：未設定";
    }
    updateCurrentNameDisplay();

    // 名前変更処理
    const changeNameButton = document.getElementById("changeNameButton");
    changeNameButton.addEventListener("click", () => {
        isChangingNameInGameOver = true;
        document.getElementById("nameSetupArea").style.display = "block";
        document.getElementById("controlArea").style.display = "none";

        document.getElementById("confirmNameButton").style.display = "inline-block";
        document.getElementById("cancelNameEditButton").style.display = "inline-block";
    });

    // 名前変更完了
    const confirmNameButton = document.getElementById("confirmNameButton");
    confirmNameButton.addEventListener("click", () => {
        const nameInput = document.getElementById("playerName");
        const newName = nameInput.value.trim();

        if (!newName) {
            alert("名前を入力してください");
            return;
        }

        localStorage.setItem("playerName", newName);
        updateCurrentNameDisplay();
        document.getElementById("nameSetupArea").style.display = "none";
        document.getElementById("confirmNameButton").style.display = "none";
        document.getElementById("cancelNameEditButton").style.display = "none";

        if (!isChangingNameInGameOver) {
            document.getElementById("controlArea").style.display = "block";
        }

        isChangingNameInGameOver = false; // フラグをリセット

        alert(`名前を「${newName}」に変更しました`);
    });
    // キャンセル
    const cancelNameEditButton = document.getElementById("cancelNameEditButton");

    cancelNameEditButton.addEventListener("click", () => {
        document.getElementById("nameSetupArea").style.display = "none";
        document.getElementById("confirmNameButton").style.display = "none";
        document.getElementById("cancelNameEditButton").style.display = "none";

        if (!isChangingNameInGameOver) {
            document.getElementById("controlArea").style.display = "block";
        }

        isChangingNameInGameOver = false; // フラグをリセット
    });




    // 名前処理
    // function setupNameInput() {
    //     const nameInput = document.getElementById("playerName");
    //     const savedName = localStorage.getItem("playerName");

    //     if (savedName) {
    //         nameInput.value = savedName;
    //     }

    //     const startButton = document.getElementById("startButton");
    //     startButton.addEventListener("click", () => {
    //         const name = nameInput.value.trim();
    //         if (!name) {
    //             alert("名前を入力してください");
    //             return;
    //         }
    //         localStorage.setItem("playerName", name); // 名前を保存
    //         startGame(); // ←既存のゲームスタート処理をここで呼ぶ
    //     });
    // }
    // setupNameInput();

});
