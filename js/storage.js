// storage.js

const STORAGE_KEY = "typingGame_scores";

/**
 * スコアを保存（既存の配列に追加して保存）
 * @param {number} score
 */
export function saveScore(score) {
    const existing = loadScores(); // 既存のスコア一覧を読み込み
    const now = Date.now(); // 現在時刻（ユニークID代わり）
    const newEntry = { score, timestamp: now }; // スコアのオブジェクトを作る

    existing.push(newEntry); // 配列に追加
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing)); // 保存（文字列化して保存）
}

// スコア配列で一括置き換えよう
export function saveScores(scoreArray) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scoreArray));
}

/**
 * 保存されたスコア一覧を取得（なければ空配列）
 * @returns {Array<{score: number, timestamp: number}>}
 */
export function loadScores() {
    const json = localStorage.getItem(STORAGE_KEY);
    const rawData = json ? JSON.parse(json) : [];

    const now = Date.now();
    const oneHour = 1000 * 60 * 60;

    // 1時間以内のデータだけを返す
    const recentData = rawData.filter(entry => now - entry.timestamp <= oneHour);

    // データを上書きしてクリーンにする（ここが重要）
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentData));

    return recentData;

}


export function clearScores() {
    localStorage.removeItem(STORAGE_KEY);
  }