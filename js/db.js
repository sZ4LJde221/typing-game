// db.js
import { supabase } from "./supabaseClient.js";

/**
 * Supabaseでスコアを保存する
 * @param {number} score
 */
export async function submitScore(score, name = "匿名") {
    try {
        const { error } = await supabase
            .from("scores")
            .insert([{ score, timestamp: Date.now(), name }]);

        if (error) throw error;

        console.log("スコア送信成功");
    } catch (err) {
        console.warn("スコア送信失敗（オフラインまたはAPI障害）:", err.message);
        // エラーが出てもゲームは止めない
    }
}

/**
 * Supabaseからスコア一覧を取得する（降順）
 * @param {(scores: Array<{score: number, timestamp: number}>) => void} callback
 */
export async function getScores(callback) {
    try {
        const { data, error } = await supabase
            .from("scores")
            .select("*")
            .gte("timestamp", Date.now() - 3600000)
            .order("score", { ascending: false })
            .limit(50);

        if (error) {
            console.warn("⚠️ スコア取得失敗:", error.message);
            callback([]);
            return;
        }

        console.log("スコア取得成功:", data);
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const recentScores = data.filter(item => item.timestamp >= oneHourAgo);
        callback(recentScores);
    } catch (err) {
        console.warn("⚠️ Supabase接続エラー:", err.message);
        callback([]);
    }
}



/**
 * Supabaseで自分のスコア（同じ名前のもの）を削除する
 * @param {string} name
 */
export async function deleteScoresByName(name) {
    try {
        const { data, error } = await supabase
            .from("scores")
            .delete()
            .eq("name", name)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            console.warn("一致するスコアが見つかりませんでした");
        } else {
            console.log(`スコア削除成功（${data.length}件）`);
        }
    } catch (err) {
        console.warn("スコア削除失敗（通信エラーまたは障害）:", err.message);
    }
}

/**
 * Supabaseで timestamp 一致のスコアを削除する（1件だけ）
 * @param {number} timestamp
 */
export async function deleteScoreByTimestamp(timestamp) {
    try {
        const { error } = await supabase
            .from("scores")
            .delete()
            .eq("timestamp", timestamp);

        if (error) throw error;

        console.log("スコア削除成功（timestamp:", timestamp, "）");
    } catch (err) {
        console.warn("スコア削除失敗（通信エラーまたは障害）:", err.message);
    }
}
