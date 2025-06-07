const NAME_KEY = "playerName";

// 保存された名前を取得
export function getSavedName() {
  return localStorage.getItem(NAME_KEY);
}

// 名前を保存
export function saveName(name) {
  localStorage.setItem(NAME_KEY, name);
}

// 名前入力欄に保存された名前を自動入力
export function preloadNameInput(inputElement) {
  const saved = getSavedName();
  if (saved) {
    inputElement.value = saved;
  }
}

// 名前入力が有効か確認（空欄防止）
export function isValidName(name) {
  return name.trim().length > 0;
}
