# MEMORY.md — 專案決策與現況記錄

這份檔案記錄「Claude 學習經驗分享報名網站」專案的關鍵決策與目前進度,
方便之後回來(或換一個 Claude session)時快速掌握狀態,不用重新問一次。

## 2026-07-08 — 專案啟動與初版建置

**決策**
- 報名資料改用「網頁自建表單 + Firebase Firestore」,**不使用 Google 表單**。
- 部署方式:**GitHub Pages**(使用者已有 `gh` CLI 本機登入,可自行 push)。
- 資料庫:Firebase 專案**尚未建立**,`firebase-config.js` 目前是 placeholder 金鑰。

**分享時段規則**
- 固定為平日(一至五)上午 10:00–12:00,台灣時間。
- 若使用者剛好有其他會議或臨時要務,該時段須標記為不可報名。

**行事曆查詢結果(查詢當下:2026-07-08)**
- 查詢範圍:2026-07-08 ~ 2026-08-21(共 7 週,33 個平日)。
- 查詢結果:該範圍內使用者 Google Calendar **沒有任何會議衝突**,
  因此 `app.js` 的 `SLOTS` 陣列中,這 33 筆全部標記為 `status: "open"`。
- 這份清單是「當下快照」,並非即時同步 —— 之後行事曆有新會議時,
  需要重新查詢並手動更新 `SLOTS` 的 `status`(見 CLAUDE.md 的做法說明)。

**已知待辦(需要使用者本人操作,Claude 無法代勞)**
1. 到 Firebase 主控台建立實際專案、啟用 Firestore、把金鑰貼進
   `firebase-config.js`(步驟見 README.md)。
2. 設定 Firestore 安全規則(規則內容見 README.md),避免報名資料被
   公開讀取。
3. 在使用者本機清掉沙箱殘留的 `.git` 資料夾後重新 `git init`,
   用 `gh repo create ... --push` 推上 GitHub。
4. 到 GitHub repo 設定開啟 GitHub Pages(Settings → Pages → main → root)。

## 2026-07-08(續)— 綁定實際 Firebase 專案與 GitHub repo

**決策 / 已知資訊**
- Firebase 專案已建立:`mydesignproject-f22d5`
  (https://console.firebase.google.com/project/myde