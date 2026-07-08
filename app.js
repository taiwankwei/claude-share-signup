import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// -----------------------------------------------------------------
// 時段選擇邏輯(2026-07-08 改版)
// 不再由網站自動列出行事曆日期清單,改成:
//   1. 在「分享時段」區塊提供連結,使用者自行點開分享者的 Google 行事曆
//      查看平日上午 10:00–12:00 是否有空
//   2. 使用者直接在報名表單填入自己希望參加的日期(<input type="date">)
// 固定規則仍是:平日(一至五)上午 10:00–12:00,7 月到 8 月。
//
// 注意:Firestore 安全規則要求送出的文件一定要包含 preferredSlots 這個
// 欄位(key)才允許 create,所以這裡把使用者填的單一日期包成陣列
// [preferredDate] 寫入,欄位名稱維持不變,避免使用者要重新修改、
// 發布一次 Firestore 規則。
// -----------------------------------------------------------------

const form = document.getElementById("signup-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form-status";

  const formData = new FormData(form);
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const motivation = formData.get("motivation")?.toString().trim();
  const preferredDate = formData.get("preferredDate")?.toString().trim();

  const agreements = [
    "agree_motivation",
    "agree_tasks",
    "agree_payment",
    "agree_time",
  ];
  const allAgreed = agreements.every((key) => formData.get(key) === "on");

  if (!name || !email || !motivation) {
    statusEl.textContent = "請完整填寫姓名、Email 與參與動機。";
    statusEl.classList.add("err");
    return;
  }
  if (!preferredDate) {
    statusEl.textContent = "請填寫希望參加的日期。";
    statusEl.classList.add("err");
    return;
  }
  if (!allAgreed) {
    statusEl.textContent = "請勾選全部四項報名前確認,才能送出報名。";
    statusEl.classList.add("err");
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = "送出中…";

  try {
    await addDoc(collection(db, "claude_share_registrations"), {
      name,
      email,
      motivation,
      preferredSlots: [preferredDate],
      agreedMotivation: true,
      agreedTasks: true,
      agreedPayment: true,
      agreedTime: true,
      createdAt: serverTimestamp(),
    });

    form.reset();
    statusEl.textContent = "報名成功!我會透過 Email 與你確認時段,謝謝你的參與意願。";
    statusEl.classList.add("ok");
  } catch (err) {
    console.error(err);
    statusEl.textContent = "送出時發生錯誤,請稍後再試,或直接寫信給我。";
    statusEl.classList.add("err");
  } finally {
    submitBtn.disabled = false;
  }
});
