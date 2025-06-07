// ui.js
import { loadScores, saveScores } from "./storage.js";
import { getScores, deleteScoreByTimestamp } from "./db.js";

// スコア表示
export function showResultArea(finalScore) {
    const resultArea = document.getElementById("resultArea");
    const finalScoreDisplay = document.getElementById("finalScore");

    finalScoreDisplay.textContent = `あなたのスコアは ${finalScore} 点です`;
    resultArea.style.display = "block";
}

// キーボード
export function renderKeyboard() {
    const layout = [
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["z", "x", "c", "v", "b", "n", "m"]
    ];

    const keyboard = document.getElementById("virtualKeyboard");
    if (!keyboard) return;
    keyboard.innerHTML = "";

    layout.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "key-row";

        row.forEach(char => {
            const key = document.createElement("div");
            key.className = "key";
            key.dataset.key = char;
            key.textContent = char.toUpperCase();
            rowDiv.appendChild(key);
        });

        keyboard.appendChild(rowDiv);
    });
}


// 全体状態を完全初期化する
export function resetAll({ isRestart = false } = {}) {

    // スコア・タイマー表示リセット
    document.getElementById("score").textContent = "スコア: 0";
    document.getElementById("timer").textContent = "残り時間: 20秒";
    document.getElementById("wordDisplay").textContent = "";

    // 結果画面を隠す
    document.getElementById("resultArea").style.display = "none";

    // ランキング領域を非表示に（残ってたら消す）
    document.getElementById("rankingArea").style.display = "none";

    // プレイ後の「名前を変える」ボタンを非表示に
    const nameLabel = document.getElementById("currentNameLabel");
    if (nameLabel) nameLabel.textContent = "";

    // 名前入力エリア制御
    const nameSetupArea = document.getElementById("nameSetupArea");
    const confirmButton = document.getElementById("confirmNameButton");
    const cancelButton = document.getElementById("cancelNameEditButton");
    const controlArea = document.getElementById("controlArea");

    if (isRestart) {
        nameSetupArea.style.display = "none";
        controlArea.style.display = "none";
    } else {
        nameSetupArea.style.display = "block";
        controlArea.style.display = "block";
    }

    if (confirmButton) confirmButton.style.display = "none";
    if (cancelButton) cancelButton.style.display = "none";

    // リスト初期化
    document.getElementById("localRanking").innerHTML = "";
    document.getElementById("onlineRankingList").innerHTML = "";
}

// 問題文更新
export function updateWordDisplay(word) {
    const display = document.getElementById("wordDisplay");
    display.innerHTML = word;
}

// 現在の進行状態に応じて文字装飾されたHTML文字列を返す
export function getStyledWord(word, userInput, isError = false) {
    if (isError) {
        return `<span style="color:red;">${word}</span>`;
    }

    const currentIndex = userInput.length;
    return word
        .split("")
        .map((char, i) => {
            if (i === currentIndex) {
                return `<span style="color:blue;font-size:1.5em;">${char}</span>`;
            }
            return char;
        })
        .join("");
}


// スコア更新
export function updateScore(score) {
    const scoreArea = document.getElementById("score");
    scoreArea.textContent = `スコア: ${score}`;
}

/**
* ローカルストレージからスコアを読み取り、上位5件を表示
*/
let localRankingDisplayLimit = 10;

export function showLocalRanking() {
    const list = document.getElementById("localRanking");
    const moreBtn = document.getElementById("showMoreLocalRanking");
    list.innerHTML = "";

    const scores = loadScores();
    if (!scores || scores.length === 0) {
        const li = document.createElement("li");
        li.textContent = "まだローカルスコアは登録されていません。";
        list.appendChild(li);
        if (moreBtn) moreBtn.style.display = "none";
        return;
    }

    scores.sort((a, b) => b.score - a.score);


    scores
        .slice(0, localRankingDisplayLimit)
        .forEach((entry, index) => {
            const li = document.createElement("li");
            const date = new Date(entry.timestamp).toLocaleString();
            const text = document.createElement("span");
            text.textContent = `${index + 1}位: ${entry.score}点（${date}）`;

            const delBtn = document.createElement("button");
            delBtn.textContent = "☓";
            delBtn.style.marginLeft = "10px";
            delBtn.addEventListener("click", () => {
                const filtered = scores.filter(s => s.timestamp !== entry.timestamp);
                saveScores(filtered);
                localRankingDisplayLimit = 10; // リセット
                showLocalRanking();
            });

            li.appendChild(text);
            li.appendChild(delBtn);
            list.appendChild(li);
        });

    // ✅ 「もっと見る」ボタン制御
    if (moreBtn) {
        if (scores.length > localRankingDisplayLimit) {
            moreBtn.style.display = "block";
        } else {
            moreBtn.style.display = "none";
        }
    }
}



/**
 * オンラインランキングを取得して表示
 */
let onlineRankingDisplayLimit = 10;

export function showOnlineRanking() {
    const allrankingArea = document.getElementById("rankingArea");
    const onlineArea = document.getElementById("onlineRankingArea");
    const localArea = document.getElementById("localRankingArea");
    const list = document.getElementById("onlineRankingList");
    const onlineBtn = document.getElementById("onlineTabButton");
    const localBtn = document.getElementById("localTabButton");
    const moreBtn = document.getElementById("showMoreOnlineRanking");

    allrankingArea.style.display = "block";
    onlineArea.style.display = "block";
    localArea.style.display = "none";

    onlineBtn.classList.add("active");
    localBtn.classList.remove("active");

    list.innerHTML = "";

    const currentName = localStorage.getItem("playerName") || "匿名";

    getScores((scores) => {
        if (scores.length === 0) {
            const li = document.createElement("li");
            li.textContent = window.SUPABASE_CONFIG?.url ? "まだスコアが登録されていません。" : "オンラインスコアは取得できません（接続情報なし）";
            list.appendChild(li);
            if (moreBtn) moreBtn.style.display = "none";
            return;
        }

        scores.sort((a, b) => b.score - a.score); // スコア降順

        scores
            .slice(0, onlineRankingDisplayLimit)
            .forEach((item, index) => {
                const li = document.createElement("li");
                const date = new Date(item.timestamp).toLocaleString();
                li.textContent = `${index + 1}位: ${item.score}点（${date})`;

                if (item.name === currentName) {
                    const delBtn = document.createElement("button");
                    delBtn.textContent = "☓";
                    delBtn.style.marginLeft = "10px";
                    delBtn.addEventListener("click", () => {
                        const confirmDelete = confirm("このスコアを削除しますか？");
                        if (confirmDelete) {
                            deleteScoreByTimestamp(item.timestamp).then(() => {
                                onlineRankingDisplayLimit = 10; // 初期化
                                showOnlineRanking();
                            });
                        }
                    });
                    li.appendChild(delBtn);
                }

                list.appendChild(li);
            });

        if (moreBtn) {
            moreBtn.style.display = scores.length > onlineRankingDisplayLimit ? "block" : "none";
        }
    });
}

// ✅ 「もっと見る」ボタンのイベント登録（オンライン用）
export function setupMoreOnlineRankingButton() {
    const moreBtn = document.getElementById("showMoreOnlineRanking");
    if (!moreBtn) return;

    moreBtn.addEventListener("click", () => {
        onlineRankingDisplayLimit += 10;
        showOnlineRanking();
    });
}



//   結果切り替え
export function setupRankingToggle() {
    const localButton = document.getElementById("localTabButton");
    const onlineButton = document.getElementById("onlineTabButton");
    const localArea = document.getElementById("localRankingArea");
    const onlineArea = document.getElementById("onlineRankingArea");

    localButton.addEventListener("click", () => {
        localArea.style.display = "block";
        onlineArea.style.display = "none";
        localButton.classList.add("active");
        onlineButton.classList.remove("active");
    });

    onlineButton.addEventListener("click", () => {
        localArea.style.display = "none";
        onlineArea.style.display = "block";
        localButton.classList.remove("active");
        onlineButton.classList.add("active");
    });
}


// ランキング更新
export function updateRankingView() {
    showLocalRanking();
    showOnlineRanking();
}

// ローカルランキング更に表示
export function setupMoreLocalRankingButton() {
    const moreBtn = document.getElementById("showMoreLocalRanking");
    if (!moreBtn) return;

    moreBtn.addEventListener("click", () => {
        localRankingDisplayLimit += 10;
        showLocalRanking();
    });
}
