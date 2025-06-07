// timer.js

let timerId = null; // setIntervalのID（停止に使う）
let remainingTime = 10; // 初期時間（秒）

/**
 * タイマーを開始する関数
 * @param {function} onTimeUp - 時間切れ時に呼び出すコールバック関数
 */

export function startTimer(onTimeUp) {
    remainingTime = 20; // カウントのリセット
    updateTimeUI(); // 最初の表示更新

    // 1秒ごとにこの関数が呼ばれる
    timerId = setInterval(() => {
        remainingTime--; // 時間を1秒減らす
        updateTimeUI(); // 表示を更新

        if (remainingTime <= 0) {
            stopTimer(); // タイマーを停止
            onTimeUp();  // 時間切れコールバックを実行（ゲームを終了する処理）
        }
    }, 1000);
}

/**
 * タイマーを停止する関数（明示的な終了用）
 */
export function stopTimer() {
    clearInterval(timerId);
}


/**
* 現在の残り時間をUIに表示する
*/
function updateTimeUI() {
    const timerDisplay = document.getElementById("timer");
    timerDisplay.textContent = `残り時間: ${remainingTime}秒`;
}