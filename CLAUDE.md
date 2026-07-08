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
   北投健行等內容,已有 GitHub Pages 部署紀錄),絕對不要把這個專案的
   `index.html` 等檔案推到 `lifebread` 的根目錄,會直接覆蓋掉別人正在用
   的首頁。
5. **重複 Edit/Write 同一個檔名可能導致「檔案實際內容跟工具顯示內容不同步」**
   (在 2026-07-08 的除錯中實際發生過:index.html / style.css / app.js /
   firebase-config.js / README.md / CLAUDE.md / INSTRUCTIONS.md / MEMORY.md
   都曾經發生「Read 工具顯示的內容是新的,但 bash 指令或上傳到 GitHub 後
   看到的卻是舊版、被截斷」的狀況)。**修改完重要檔案、且要交付/上傳前,
   務必用 bash 的 `wc -c` / `tail -c` 直接檢查實際位元組數與結尾內容**,
   不要只信任 Write/Edit 工具回傳「成功」。如果 bash 看到的內容跟預期不符,
   解法是:把完整內容寫到一個新檔名,用 bash 確認新檔名內容正確,再用
   `mv` 蓋掉原本的檔名,重新確認一次,才算真的修好。

## 常見任務的做法

- **使用者要求「更新可報名時段」**:
  查詢 Google Calendar(平日 10:00-12:00 區間),找出實際有會議衝突的
  日期,只更新 `app.js` 的 `SLOTS` 陣列中對應項目的 `status`
  (`"open"` → `"full"`),不要重新產生整個陣列。更新後在 `MEMORY.md`
  補一筆記錄(更新日期、哪些日期變動)。
- **使用者要求「加開新的一批時段」**:在 `SLOTS` 陣列尾端加上新日期,
  格式與現有項目一致,並同步更新 `MEMORY.md`。
- **交付檔案**一律用 `present_files` 分享,不要只在對話裡貼程式碼。
- **任何檔案改完要上傳 GitHub 前**,先照上面第 5 點用 bash 驗證過,
  確定內容完整才上傳,避免重複發生半個檔案被截斷的問題。


---

## 2026-07-08 更新:時段機制改版(取代上面「常見任務的做法」裡關於 SLOTS 的部分)

`app.js` 已移除 `SLOTS` 陣列與 `renderSlotList`/`renderSlotCheckboxes` 這套邏輯,不再自動列出行事曆日期清單。現況:

- `index.html` 的「分享時段」區塊改成放一個連結,導到分享者的 Google 行事曆(`https://calendar.google.com/calendar/u/0/r?pli=1`),使用者自行確認平日 10:00–12:00 是否有空。
- 報名表單的日期欄位改成 `<input type="date" name="preferredDate">`,由使用者自行輸入,不再是每週一組 radio button。
  - `app.js` 送出 Firestore 時仍使用 `preferredSlots` 這個 key(值為 `[preferredDate]` 單一元素陣列),刻意維持 key 名稱不變以相容既有 Firestore 規則(規則要求文件需包含 `preferredSlots`),避免使用者要重新修改、發布規則。
   
    - 之後若使用者要求「更新可報名時段」,不再是查 Google Calendar 改 `SLOTS` 的 `status`,而是視需求調整 `index.html` 的說明文字或 Google 行事曆連結本身即可。
    - 
