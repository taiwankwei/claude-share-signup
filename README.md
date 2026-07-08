# Claude 學習經驗分享 — 報名網站

單頁式靜態網站,介紹分享會、列出報名條件與可報名時段,報名表單直接寫入
Firebase Firestore(不使用 Google 表單)。

## 專案結構

```
claude-share-signup/
├── index.html          # 頁面內容(介紹 / 條件 / 時段 / 表單)
├── style.css           # 樣式
├── firebase-config.js  # Firebase 設定(需依下方步驟填入你的專案金鑰)
├── app.js              # 時段清單 + 表單送出邏輯(寫入 Firestore)
└── README.md
```

---

## 第一步:Firebase 專案(已建立,**apiKey 需要你自己貼上**)

專案:`mydesignproject-f22d5`
(https://console.firebase.google.com/project/mydesignproject-f22d5/overview)

`firebase-config.js` 裡的 `authDomain` / `projectId` / `storageBucket` /
`messagingSenderId` / `appId` 都已經是真實值,**只有 `apiKey` 還是
placeholder(`PASTE_YOUR_API_KEY_HERE`)**——這不是漏做,是 Claude 的
檔案寫入工具偵測到真實 Google API 金鑰字串時會擋下完整寫入(安全機制),
所以這一格只能由你自己貼上。步驟:

1. 開啟 https://console.firebase.google.com/project/mydesignproject-f22d5/settings/general
2. 往下捲到「你的應用程式」→ 網頁應用程式「北投走走」→ SDK 設定和配置 → 選「設定」
3. 複製顯示出來的 `apiKey`,貼到 `firebase-config.js` 取代
   `PASTE_YOUR_API_KEY_HERE`

**在你貼上真正的 apiKey 之前,報名表單會因為 Firebase 初始化失敗而無法
送出報名**(這跟 Firestore 規則是否發布是兩件獨立的事,兩個都要完成)。

⚠️ **另外提醒**:先前有一次上傳因為檔案被截斷,導致這把 apiKey 的完整
字串曾經被 commit 進這個公開 repo 的歷史紀錄,GitHub Secret Scanning
已經抓到並標記為 alert(可以到
https://github.com/taiwankwei/claude-share-signup/security/secret-scanning
查看)。Firebase 網頁 apiKey 本身不是傳統意義的機密(真正的存取控制是靠
Firestore 安全規則),但如果你想更保險,可以考慮:
- 到 Google Cloud Console 幫這把 API 金鑰加上「HTTP 參照網址限制」,
  只允許從 `https://taiwankwei.github.io/*` 使用;或
- 直接重新產生一把新的 apiKey 取代舊的。

這兩個都是帳號安全設定,需要你自己操作。

**注意**:這是一個共用的 Firebase 專案,裡面還有 `beitou_registrations`、
`lifebread` 等其他不相關的 collection(分別對應你其他的專案)。本網站
的報名資料會寫進獨立的 `claude_share_registrations` collection,不會
互相干擾,但也代表你之後在 Firestore 主控台會同時看到好幾個 collection,
要看對名字。

## 第二步:設定 Firestore 安全規則(需要你自己操作)

Claude 不會、也不應該自己去 Firebase 主控台發布安全規則變更,這一步
一定要你自己做:

1. 開啟 https://console.firebase.google.com/project/mydesignproject-f22d5/firestore/databases/-default-/security/rules
2. 目前的規則只開放 `wordcloud_words` 這個 collection,其餘一律
   `allow read, write: if false`(包含我們的 collection)。在
   `match /{document=**} { allow read, write: if false; }` 那個區塊
   **之前**,加入下面這段(只允許新增一筆報名資料,禁止公開讀取/修改/刪除):

```
match /claude_share_registrations/{docId} {
  allow create: if request.resource.data.keys().hasAll(
    ['name', 'email', 'motivation', 'preferredSlots']
  );
  allow read, update, delete: if false;
}
```

3. 按「發布」。

之後你自己要查看報名名單,直接到 Firebase 主控台的 Firestore Database
頁面看 `claude_share_registrations` collection 即可。

## 第三步:本機測試

因為使用 ES module(`type="module"`),不能直接用瀏覽器打開 `index.html`
(file:// 會被瀏覽器擋下跨來源請求),需要用簡單的本機伺服器:

```bash
cd claude-share-signup
python3 -m http.server 8000
# 或用 npx serve .
```

打開 http://localhost:8000 測試表單送出,確認 Firestore 有收到資料。

## 第四步:GitHub(已完成 ✅)

已建立獨立的新 repo `taiwankwei/claude-share-signup`(**不是**
`lifebread`,避免覆蓋掉 lifebread 根目錄那個正在使用中的九州旅遊/北投
健行網站),檔案已推送,GitHub Pages 已啟用。

網站網址:**https://taiwankwei.github.io/claude-share-signup/**

之後如果要更新程式碼(例如調整 `SLOTS` 時段),可以直接在 GitHub 網頁上
編輯檔案並 commit,或是在本機 clone 這個 repo 後用 git 操作:

```bash
git clone https://github.com/taiwankwei/claude-share-signup.git
```

---

## 之後每週要做的事

`app.js` 裡的 `SLOTS` 陣列列出了近 7 週平日 10:00-12:00 的時段
(依 2026-07-08 的行事曆狀態產生,目前全部開放)。如果之後你的行事曆
新增了衝突的會議,只要把對應那一筆的 `status: "open"` 改成
`status: "full"`,存檔後重新推上 GitHub,該時段就會自動從清單與
報名表單的勾選選項中移除(顯示為「不可報名」但保留讓人知道時段存在)。
