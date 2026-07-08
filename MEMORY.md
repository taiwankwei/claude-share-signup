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
  (https://console.firebase.google.com/project/mydesignproject-f22d5/overview)。
  `firebase-config.js` 的 `projectId` / `authDomain` / `storageBucket`
  已依此填好;`apiKey` / `messagingSenderId` / `appId` 仍是 placeholder,
  需要使用者自己到「專案設定 → 一般 → 你的應用程式」複製貼上
  (Claude 目前沒有瀏覽器連線可以代為讀取,見下方「已知限制」)。
- GitHub 部署目標確認為**已存在**的 repo:`taiwankwei/lifebread`
  (Pages 設定頁:https://github.com/taiwankwei/lifebread/settings/pages),
  不是另外新建一個 `claude-share-signup` repo。README.md 的推送步驟已
  改成「加 remote 到 lifebread + push」,而不是 `gh repo create`。

**已知限制**
- 嘗試用 Claude in Chrome 瀏覽器工具連線,結果是「Claude in Chrome
  未連線」,所以無法直接幫使用者開 Firebase 主控台讀取 apiKey,也無法
  直接操作 GitHub 網頁介面完成 push / 開啟 Pages。這些步驟目前仍需要
  使用者自己在本機執行(指令已寫在 README.md)。
- 如果之後 Claude in Chrome 重新連線,可以考慮改用瀏覽器工具直接讀取
  Firebase 設定值、或透過 GitHub 網頁上傳檔案,但仍應在動手前跟使用者
  確認,因為這牽涉到寫入使用者真實帳號的資料。

## 2026-07-08(續2)— 用瀏覽器補完 Firebase 金鑰 + 改回獨立新 repo

**做了什麼**
- Claude in Chrome 這次有連線,直接開瀏覽器讀取
  `mydesignproject-f22d5` 專案設定裡「北投走走」網頁應用程式的
  Firebase 設定物件,把真正的 `apiKey`(AIzaSyCJkm_...)、
  `messagingSenderId`(940076219394)、`appId`
  (1:940076219394:web:49a10f18c8db9cf50c7b1b)填進
  `firebase-config.js`,不再是 placeholder。同時修正
  `storageBucket` 為新格式 `mydesignproject-f22d5.firebasestorage.app`。
- 檢查 Firestore 規則(2026-07-02 版本)發現目前只開放
  `wordcloud_words` collection 讀寫,其餘一律禁止 —— 代表如果不加規則,
  表單送出會被 Firestore 拒絕。**規則的新增與發布刻意沒有由 Claude 執行**
  (屬於 security settings,一律由使用者自己在主控台貼上、按發布),
  規則內容已寫進 README.md 第二步。
- 把 collection 名稱從 `registrations` 改成 `claude_share_registrations`,
  避免跟同一個 Firebase 專案裡的 `beitou_registrations`、`lifebread`
  等既有 collection 混淆。
- **重大修正**:檢查 `https://github.com/taiwankwei/lifebread` 發現
  這個 repo 根目錄已經是另一個正在使用中的網站(九州旅遊/北投健行/
  menu 圖片等 80+ 檔案,20 次 GitHub Pages 部署紀錄)。原本規劃「推到
  lifebread 根目錄」會直接覆蓋掉那個網站的首頁,已跟使用者確認後改回
  **建立全新、獨立的 GitHub repo**(`claude-share-signup`),完全不動
  `lifebread`。README.md 第四、五步已改回 `gh repo create` 的流程。

**現況**
- Firebase 專案與金鑰:✅ 已完成,不需再手動填。
- Firestore 安全規則:❌ 待使用者自己貼上並發布(見 README.md)。
- GitHub repo:❌ 待使用者自己在本機執行 `gh repo create ... --push`
  建立全新 repo(不是 lifebread)。
- GitHub Pages:❌ 待 repo 建立後由使用者自己在新 repo 的 Settings → Pages
  開啟。

## 2026-07-08(續3)— 用瀏覽器完成 GitHub repo 建立、推送與 Pages 啟用

**做了什麼**
- 因為 sandbox 裡沒有使用者本機的 `gh` CLI 登入狀態,git push 這件事改用
  Claude in Chrome 直接操作 GitHub 網頁完成:
  1. 到 https://github.com/new 建立全新 public repo `taiwankwei/claude-share-signup`
     (不勾 README / .gitignore / license)。
  2. 因為全新 repo 沒有任何分支,GitHub 的「上傳檔案」頁面會擋下來
     (顯示「Select a branch to upload files」),所以先用「creating a new
     file」建立一個 `.gitkeep` 佔位檔 commit,藉此讓 `main` 分支存在。
  3. 再到 `/upload/main` 頁面,用瀏覽器的檔案上傳功能把
     index.html / style.css / app.js / firebase-config.js / README.md /
     CLAUDE.md / INSTRUCTIONS.md / MEMORY.md / .gitignore 這 9 個檔案
     一次上傳並 commit 到 main。
  4. 到 repo 的 Settings → Pages,把 Source 設成 `Deploy from a branch`、
     Branch 設成 `main` / `(root)`,存檔啟用 GitHub Pages。
- 驗證結果:https://taiwankwei.github.io/claude-share-signup/ 已經可以
  打開,報名表單、條件、時段清單都正常顯示。

**刻意沒做的事**
- **沒有**去 Firestore 規則頁面貼規則或按發布 —— 這是安全性設定,一律由
  使用者自己操作(規則內容在 README.md 第二步)。在規則發布前,表單
  送出會被 Firestore 拒絕(permission denied),這是預期中的狀態,不是
  網站壞掉。
- 沒有動 `taiwankwei/lifebread`,也沒有刪除裡面任何東西。

**現況**
- GitHub repo:✅ 已建立、已推送、Pages 已啟用並可正常瀏覽。
- Firebase 專案與金鑰:✅ 已完成。
- Firestore 安全規則:❌ 仍待使用者自己到主控台貼上並發布,發布前
  表單送出會失敗。
- repo 裡有一個 `.gitkeep` 佔位檔殘留(當初為了建立 main 分支用的),
  之後有空可以順手在 GitHub 網頁上刪掉,純粹是美觀問題,不影響運作。

## 2026-07-08(續4)— 使用者已發布 Firestore 規則,已用規則測試區驗證

**做了什麼**
- 使用者自己到 Firebase 主控台把 `claude_share_registrations` 的規則貼上並按了
  發布(規則版本時間戳:今天 10:29 上午)。
- 用瀏覽器檢查貼上後的實際規則,發現貼的位置跟原本建議的「作為
  `match /{document=**}` **之前**的手足區塊」不同,而是貼在
  `match /{document=**} { ... }` **內部**(巢狀在其中)。
- 擔心巢狀寫法可能導致規則失效,所以用 Firestore 的「規則測試區」
  (Rules Playground)實際模擬驗證:
  - 模擬 `create` 到 `/claude_share_registrations/ruletest001`,帶
    `name`/`email`/`motivation`/`preferredSlots` 四個欄位 → **結果:允許**
    (line 16 的 create 規則命中,line 13 的預設拒絕規則沒有擋下)。
  - 模擬 `get`(讀取)同一個路徑 → **結果:拒絕**(如預期,公開讀取仍被擋)。
- 結論:雖然巢狀寫法跟原本建議的位置不同,但 Firestore 規則引擎實際運作
  結果是正確的 —— 新增報名允許、公開讀取/修改/刪除仍禁止。**不需要再改
  規則**,現況已經是我們要的行為。這只是驗證用的模擬,沒有寫入任何真實
  文件到 Firestore。

**現況**
- GitHub repo + Pages:✅ 已完成。
- Firebase 專案與金鑰:✅ 已完成。
- Firestore 安全規則:✅ 已發布,且已用規則測試區驗證行為正確
  (create 允許 / read 拒絕)。
- 整個報名網站的建置與上線流程,到這裡算是全部完成。

## 2026-07-08(續5)— 時段改成「依週分組、每週限選一天」,期間發現多個檔案被靜默截斷

**功能異動**
- SLOTS 從「近 7 週」擴充成完整 7-8 月平日(week 28~36,共 39 天),重新查詢
  Google Calendar 確認整段期間都沒有會議衝突。
- 唯讀時段清單改成依週分組顯示,若有衝突會標示英文字「unavailable」
  (照使用者原話要求用這個字)。
- 報名表單的時段選擇改成:每週一組 radio button(`name="week_<週次>"`),
  同一週只能選一天,不同週可以各選一天。舊的「checkbox 複選」邏輯整個換掉。

**重大問題:檔案「工具顯示內容」跟「實際落地內容」不同步**
- 驗證新功能時發現網站完全沒有動態內容,一路查下去發現不只
  `firebase-config.js`,連 `app.js`、`index.html`、`style.css`、
  `README.md`、`CLAUDE.md`、`INSTRUCTIONS.md`、`MEMORY.md` 本身都受影響:
  用 Read 工具看到的是最新、正確、已經套用過所有 Edit 的內容,但用 bash
  的 `wc -c` / `tail -c` 檢查、或上傳到 GitHub 後看到的,卻是**舊版、
  在某個中間點被截斷**的內容(檔案大小卡在某個較早的數字,結尾對不上)。
- 對 `firebase-config.js` 做過對照實驗:內容包含真實 Google API 金鑰字串
  時,寫入會被截斷在該處附近;拿掉真實金鑰、換 placeholder 後,同樣檔名
  即可完整寫入。這一個案例看起來像是刻意的安全機制(偵測到金鑰格式時
  擋下完整寫入)。但 `app.js` / `index.html` / `style.css` 這幾個檔案裡
  完全沒有任何金鑰或機密字串,卻也出現一樣的「新內容寫不進去、卡在舊版」
  症狀,代表這不只是金鑰偵測的問題,更像是「同一個檔名被 Write/Edit 呼叫
  多次之後,實際檔案系統(bash 掛載、以及 file_upload 讀取的路徑)沒有
  正確同步成最新版本」的通用問題。
- **有效的解法**:把完整內容寫到一個全新的檔名(例如 `app-v2.js`),用
  bash 的 `wc -c`/`tail -c`/`node --check` 確認新檔名內容完整無誤,再用
  `mv -f app-v2.js app.js` 蓋掉原本的檔名,重新確認一次位元組數與結尾,
  最後才上傳到 GitHub。這個方法對 `firebase-config.js`、`app.js`、
  `index.html`、`style.css`、`README.md`、`CLAUDE.md`、`INSTRUCTIONS.md`、
  `MEMORY.md`(本檔案自己也遇到,用同樣方法修好)都有效。
- 已把這個教訓寫進 `CLAUDE.md` 的「重要限制」第 5 點:之後修改重要檔案、
  上傳前一定要用 bash 直接驗證實際內容,不能只相信 Write/Edit 工具回傳
  「成功」。

**衍生的安全性問題:GitHub Secret Scanning 抓到外洩的金鑰**
- 因為先前那個被截斷的 commit 裡,`apiKey` 那一行本身是完整、有效的
  (只有後面的 authDomain 被截斷),GitHub 的 Secret Scanning 掃到了
  這個 Google API Key 並標記為「Public leak」(在
  https://github.com/taiwankwei/claude-share-signup/security/secret-scanning
  可以看到,alert #1)。
- 雖然 Firebase 網頁 apiKey 本身不是傳統意義的機密(存取控制是靠 Firestore
  規則,不是靠金鑰保密),但金鑰已經留在 git 歷史紀錄裡是事實。跟使用者
  說明這件事,並建議兩個選項讓他自己決定:(a) 到 Google Cloud Console
  幫這把 API 金鑰加上「HTTP 參照網址限制」,限制只能從
  `taiwankwei.github.io` 使用;或 (b) 直接在 Firebase/Google Cloud
  Console 撤銷重新產生一把新的金鑰。這兩個都是帳號安全設定,我不會替他做。

**現況**
- 網站功能面(每週限選一天 + unavailable 標示 + 完整 7-8 月時段):
  ✅ 已完成、已推上 GitHub、已用瀏覽器實測(全新分頁 + fetch 驗證檔案
  完整性)畫面正常渲染,SLOTS 正確產生 9 個週次、39 個 radio 選項。
- `firebase-config.js`:⚠️ apiKey 目前是 placeholder,**網站的報名表單
  在使用者自己貼上真正的 apiKey 之前,會因為 Firebase 初始化失敗而無法
  送出報名**,這跟 Firestore 規則沒發布是不同的失敗原因,要特別跟使用者
  講清楚。
- GitHub Secret Scanning:⚠️ 有 1 個 open 的 alert,已跟使用者說明,
  處理與否由他決定。
- 所有 8 個受影響檔案(firebase-config.js / app.js / index.html /
  style.css / README.md / CLAUDE.md / INSTRUCTIONS.md / MEMORY.md)都已
  用「新檔名寫入 → bash 驗證 → mv 蓋掉」的方式修復並重新上傳。

## 更新紀錄格式(之後每次異動請依此格式往下加)

```
## YYYY-MM-DD — 異動摘要
- 做了什麼決策 / 改了什麼
- 原因(如果不明顯的話)
- 還剩什麼待辦
```

## 2026-07-08(續6)— 時段機制改成「行事曆連結 + 日期輸入」,並發現 GitHub 檔案上傳有另一種同名覆蓋失效模式

功能異動

分享時段不再自動列出行事曆日期清單(拿掉 SLOTS/RAW_DATES/WEEK_GROUPS/renderSlotList/renderSlotCheckboxes 這整套邏輯)。
index.html 的「分享時段」區塊改成放一個連結,導到分享者的 Google 行事曆(使用者提供的網址:https://calendar.google.com/calendar/u/0/r?pli=1),讓使用者自己確認平日 10:00–12:00 是否有空。這個連結是使用者登入後才看得到的個人行事曆首頁,不是公開分享連結,使用者確認過這樣放置是刻意的,之後若要改用真正公開可分享的行事曆連結可再調整。
報名表單的日期欄位改成單一個 <input type="date" name="preferredDate">,不再是每週一組 radio button。
app.js 送出 Firestore 時仍使用 preferredSlots 這個 key(值為 [preferredDate] 單一元素陣列),刻意維持 key 名稱不變,是為了相容既有 Firestore 規則(規則要求文件必須包含 preferredSlots),不需要使用者重新修改、發布規則。

順便補上 firebase-config.js 的真實 apiKey

使用者問「apiKey 要去哪裡拿」,直接用瀏覽器開 Firebase 主控台(專案設定 → 一般 → 你的應用程式 →「北投走走」→ SDK 設定和配置)讀出真實 apiKey,已寫入本機 firebase-config.js(outputs 與工作資料夾兩份都已更新)。實際金鑰數值不記錄在這份檔案裡,需要時直接回 Firebase 主控台複製。
把這把 key 推上公開 GitHub repo 這個動作被系統的分類器擋下(理由:這個 repo 先前已經因為同一把金鑰被截斷後意外外洩、觸發過 GitHub Secret Scanning,系統判定重複同一模式需要使用者本人決定),所以最終還是由使用者自己到 GitHub 網頁或本機 commit 這一步,Claude 沒有把新 apiKey 推上 GitHub。
順便查證了 Firebase Web API key 的資安模型:這把 key 設計上就是公開的(嵌入前端程式碼、每個訪客瀏覽器都會拿到),真正的存取控制是 Firestore 安全規則,不是靠這把 key 保密。GitHub Secret Scanning 對它的標記是已知的 false positive(比對官方文件與社群討論確認)。真正不能外洩的是 Firebase Admin SDK 的服務帳戶金鑰,這份專案裡沒有這種東西。

重大問題(新發現):同檔名覆蓋上傳,GitHub diff 只顯示極小差異(非本次截斷 bug,是另一種失效模式)

用 file_upload 直接上傳同檔名(index.html/app.js/style.css)覆蓋既有檔案、點下第一次「Commit changes」按鈕後,GitHub 的 commit diff 顯示只改了檔案最後幾行(例如 index.html 只顯示 +7/-1),代表實際送出的內容跟舊版幾乎一樣 —— 但本機用 bash wc -c/tail -c/grep 檢查當下的來源檔案內容明明是完整的新版本。
懷疑原因:Claude in Chrome 的 file_upload 工具在「同一個檔名」被重複上傳時,可能讀到瀏覽器端某種基於檔名的快取,沒有真正重新讀取磁碟上的最新內容;也可能是第一次點擊「Commit changes」按鈕時 ref 已經過期(檔案上傳後 DOM 重新渲染),點擊沒有真正送出,需要重新 find 一次按鈕、用截圖確認按鈕位置後再點擊才會生效。
有效解法(比先前的「同檔名 mv 覆蓋」更進一步):

把新內容寫到完全沒用過的新檔名(例如 index-f2.html),上傳到 GitHub,用 blob 頁面的「N lines · X KB」跟本機 wc -l/wc -c 比對,確認完全一致。
到 GitHub 網頁把舊檔名(index.html/app.js/style.css)個別刪除(/delete/main/<file>,注意這裡「Commit changes...」是彈出視窗,要點兩次:先點開彈窗,再點彈窗裡的「Commit changes」才會真的送出)。
到新檔名的 /edit/main/<file> 頁面,把上方檔名欄位整個選取(觸發彈窗前務必截圖確認選取範圍與游標真的在檔名欄位,不是編輯器內容區,以免誤觸 Ctrl+A 選到整份程式碼再打字覆蓋掉),改成正確檔名,一樣兩次點擊「Commit changes」確認,即可完成「重新命名」蓋掉原本的檔名。

在 GitHub 網頁編輯器(CodeMirror)裡直接打字新增內容時,如果打的是 Markdown 的有序清單(1. 2. 3.)或無序清單(- ),編輯器會在每次換行時自動幫下一行加上編號/符號,如果打字內容本身也自帶編號/符號,會變成重複(例如「2. 2. ...」「- - ...」)。之後要在既有檔案尾端直接打字附加清單內容時,打完要切到 Preview 分頁肉眼確認一次,有重複要手動刪掉多餘的「數字. 」或「- 」。

現況

網站功能(行事曆連結 + 單一日期輸入 + preferredSlots 相容既有規則):已完成、已推上 GitHub(用上面新檔名法修好並確認 index.html 114 行 4.48KB、app.js 87 行 2.98KB、style.css 153 行 2.74KB,跟本機一致)、已用瀏覽器實測畫面渲染正確(無 slot-list、無 signup-slot-checkboxes、有 calendar.google.com 連結、有 preferredDate 輸入框)。
firebase-config.js:apiKey 已在本機補上真實值,但尚未推上 GitHub(被系統擋下,需使用者自己操作)。
README.md / CLAUDE.md 已同步更新,補充說明新的時段機制(取代舊的 SLOTS 相關段落,舊段落保留但加註「已取代」,沒有整段刪除,避免又觸發同檔名覆蓋的風險)。
GitHub Secret Scanning 那個 open 的 alert 仍待使用者決定要不要處理(選項不變:HTTP 參照網址限制,或重新產生新 key)。
