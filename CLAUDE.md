# CLAUDE.md

這份檔案給 Claude(Claude Code / Cowork)在 `claude-share-signup` 這個資料夾
工作時參考,說明專案背景、技術棧與應遵守的規則。

## 專案是什麼

「Claude 學習經驗分享」報名網站 —— 一個單頁式靜態網站,介紹分享會內容、
列出報名條件與可報名時段,並提供報名表單。使用者填完表單後資料直接寫入
Firebase Firestore,不透過 Google 表單。

## 技術棧

- 純 HTML/CSS/JS,無框架,`<script type="module">` 載入
- 資料庫:Firebase Firestore(共用專案 `mydesignproject-f22d5`,裡面還有
  `beitou_registrations`、`lifebread` 等其他不相關的 collection),
  本專案 collection 名稱為 `claude_share_registrations`(刻意加前綴,
  避免跟同一個 Firebase 專案裡其他 collection 混淆)
- 部署:GitHub Pages(靜態託管)
- 時段資料來源:使用者的 Google Calendar(平日 10:00-12:00 是否有會議衝突)

## 檔案結構

| 檔案 | 用途 |
|---|---|
| `index.html` | 頁面結構:介紹 / 報名條件 / 時段清單 / 報名表單 |
| `style.css` | 樣式 |
| `app.js` | `SLOTS` 時段陣列(含 open/full 狀態)+ 表單送出邏輯(寫入 Firestore) |
| `firebase-config.js` | Firebase 專案金鑰(正式金鑰,非機密但不可改寬安全規則) |
| `README.md` | 給使用者看的建置步驟(建立 Firebase 專案、設定安全規則、推上 GitHub、開啟 GitHub Pages) |
| `INSTRUCTIONS.md` | 可貼到 Cowork「Project Instructions」欄位的精簡版本 |
| `MEMORY.md` | 專案決策與現況記錄(見該檔案) |

## 重要限制(必讀)

1. **沙箱與使用者本機是分開的環境**:這裡執行的 `git` 指令不會出現在
   使用者的真實電腦上,也無法使用使用者本機已登入的 `gh` CLI。任何
   git init / commit / push,一律只能在 README.md 裡寫成「使用者自己
   在本機執行」的步驟,不要假裝已經完成推送或部署。
2. **修改檔案前先讀取現有內容**,不要整份覆寫,尤其是 `app.js` 的
   `SLOTS` 陣列與 `firebase-config.js`。
3. **`firebase-config.js` 的金鑰只是識別用,不是密碼**,但 Firestore
   安全規則(在 Firebase 主控台設定,不在這個 repo 裡)才是真正的防護。
   Claude 不會、也不應該自己去 Firebase 主控台發布規則變更(這屬於
   security settings,一律由使用者自己貼上、自己按發布),Claude 只
   負責提供規則內容文字。
4. **這個網站部署在獨立的 GitHub repo**(不是 `taiwankwei/lifebread`)。
   `lifebread` repo 根目錄已經有另一個正在使用中的網站(九州旅遊 /
   北投健行等內容,已有 GitHub Pages 部