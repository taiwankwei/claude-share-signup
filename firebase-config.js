// ---------------------------------------------------------------
// Firebase 設定檔
// 專案:mydesignproject-f22d5 (https://console.firebase.google.com/project/mydesignproject-f22d5/overview)
// 對應網頁應用程式:「北投走走」(專案裡目前唯一的網頁應用程式)。
//
// apiKey 這一格請你自己手動貼上真正的值,其餘欄位都已經是真實值。
// ---------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCJkm_eA-BJtFzbxO1CyxwK8PbmgHmqq7U",
  authDomain: "mydesignproject-f22d5.firebaseapp.com",
  projectId: "mydesignproject-f22d5",
  storageBucket: "mydesignproject-f22d5.firebasestorage.app",
  messagingSenderId: "940076219394",
  appId: "1:940076219394:web:49a10f18c8db9cf50c7b1b",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
