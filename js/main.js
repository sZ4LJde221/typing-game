// main.js
import { setupRankingToggle, setupMoreLocalRankingButton, setupMoreOnlineRankingButton } from "./ui.js";
import { setupEventHandlers } from "./eventHandlers.js";


document.addEventListener("DOMContentLoaded", () => {
    setupRankingToggle();
    setupEventHandlers(); // 🎯 分離したイベント処理を呼び出すだけに簡略化
    setupMoreLocalRankingButton();
    setupMoreOnlineRankingButton();
});