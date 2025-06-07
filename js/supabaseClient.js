import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// デフォルトはnullクライアント（失敗時にもゲーム続行できるようにする）
let supabase = {
    from: () => ({
        insert: () => Promise.resolve({ error: { message: "Supabase無効" } }),
        select: () => Promise.resolve({ data: [], error: { message: "Supabase無効" } }),
        delete: () => ({
            eq: () => Promise.resolve({ error: { message: "Supabase無効" } }),
        }),
    }),
};

if (
    window.SUPABASE_CONFIG &&
    window.SUPABASE_CONFIG.url &&
    window.SUPABASE_CONFIG.key
) {
    supabase = createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.key);
    console.log("✅ Supabase接続成功");
} else {
    console.warn("⚠️ Supabase設定が見つかりません（config.js未読み込みまたは不正）。オンライン機能は無効化されます。");
}

export { supabase };


// ✅ 接続テスト（例：空のselectを1回だけ実行）
(async () => {
    try {
        const { error } = await supabase
            .from("scores")
            .select("id")
            .limit(1);

        if (error) {
            console.log("❌ Supabase接続エラー:", error.message);
        } else {
            console.log("✅ Supabase接続成功（テスト通過）");
        }
    } catch (e) {
        console.error("❌ Supabase接続時の例外:", e);
    }
})();