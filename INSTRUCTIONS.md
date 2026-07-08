# Cowork Project Instructions — Claude 學習經驗分享報名網站

> 可直接複製貼到 Cowork 專案設定的「Project Instructions」欄位,
> 讓之後每次開啟這個專案時自動套用。

專案:Claude 學習經驗分享 — 報名網站(資料夾:claude-share-signup)

## 技術棧
- 純 HTML/CSS/JS(無框架),ES module 載入
- 表單資料寫入 Firebase Firestore(collection: claude_share_registrations),不使用 Google 表單
- 部署在獨立的新 GitHub repo,絕對不要推到 taiwankwei/lifebread(那個 repo
  根目錄是另一個已上線的網站)
- 靜態網站透過 GitHub Pages 託管;git/GitHub 操作只能在使用者本機執行
  (沙箱環境無法保留 git 狀態,也無法使用本機的 gh CLI 登入)

## 關鍵檔案
- index.html          頁面結構(介紹 / 報名條件 / 時段 / 表單)
- style.css           樣式
- app.js              SLOTS 時段陣列 + 表單送出邏輯(寫入 Firestore)
- firebase-config.js  Firebase 金鑰設定(正式金鑰,勿改成公開讀取規則)
- README.md           Firebase 建立步驟 + GitHub 推送步驟

## 固定工作流程
1. 修改任何檔案前,先 Read 現有內容,不要整份覆寫。
2. 若使用者要求「更新可報名時段」:
   - 先查詢使用者 Google Calendar(平日 10:00-12:00),抓出實際衝突的日期
   - 在 app.js 的 SLOTS 陣列裡,把有衝突日期的 status 改成 "full",其餘維持 "open"
   - 不要重新產生整個陣列,只調整需要變動的項目
3. 任何改動 Firestore 安全規則或 firebase-config.js 的內容,要先跟使用者確認,
   因為這會直接影響報名資料的存取權限。
4. 完成程式碼修改後,提醒使用者:「這些改動只在專案資料夾,需要你自己在本機
   git add / commit / push 才會反映到 Gi