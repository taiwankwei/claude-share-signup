import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// -----------------------------------------------------------------
// 可報名時段清單
// 依 Google 行事曆狀態產生(產生日期:2026-07-08),固定為平日 10:00-12:00。
// 之後若行事曆有新的會議衝突,請把該筆的 status 改成 "full" 即可自動從
// 「可報名」清單與表單勾選中移除。
// -----------------------------------------------------------------
const WEEKDAY_LABEL = ["日", "一", "二", "三", "四", "五", "六"];

const SLOTS = [
  "2026-07-08", "2026-07-09", "2026-07-10",
  "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17",
  "2026-07-20", "2026-07-21", "2026-07-22", "2026-07-23", "2026-07-24",
  "2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30", "2026-07-31",
  "2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07",
  "2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14",
  "2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21",
].map((date) => {
  const d = new Date(date + "T10:00:00+08:00");
  return {
    date,
    label: `${date}(週${WEEKDAY_LABEL[d.getDay()]})10:00-12:00`,
    status: "open", // "open" | "full" — 有會議衝突時手動改成 "full"
  };
});

function renderSlotList() {
  const grid = document.getElementById("slot-list");
  grid.innerHTML = SLOTS.map(
    (s) =>
      `<div class="slot-pill ${s.status === "full" ? "full" : ""}">${s.label}${
        s.status === "full" ? "(不可報名)" : ""
      }</div>`
  ).join("");
}

function renderSlotCheckboxes() {
  const wrap = document.getElementById("signup-slot-checkboxes");
  wrap.innerHTML = SLOTS.filter((s) => s.status === "open")
    .map(
      (s) => `
      <label>
        <input type="checkbox" name="slots" value="${s.date}" />
        ${s.label}
      </label>`
    )
    .join("");
}

renderSlotList();
renderSlotCheckboxes();

// -----------------------------------------------------------------
// 表單送出 -> 寫入 Firestore
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
  const chosenSlots = formData.getAll("slots");

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
  if (chosenSlots.length === 0) {
    statusEl.textContent = "請至少勾選一個希望參加的時段。";
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
      preferredSlots: chosenSlots,
      agreedMotivation: true,
      agreedTasks: true,
      agreedPayment: true,
      agreedTime: true,
      createdAt: serverTimestamp(),
    });

    form.reset();
    renderSlotCheckboxes();
    statusEl.textContent = "報名成功!我會透過 Email 與你確認時段,謝謝你的參與意願。";
    statusEl.classList.add("ok");
  } catch (err) {
    console.error(err);
    statusEl.textContent = "送出時發生錯誤,請稍後再試,或直接寫信給我。";
    statusEl.classList.add("err");
  } finally {
    submitBtn.disabled = fa