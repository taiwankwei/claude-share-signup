import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// -----------------------------------------------------------------
// 可報名時段清單
// 依 Google 行事曆狀態產生(查詢日期:2026-07-08,查詢範圍 2026-07-08 ~
// 2026-08-31 的平日),固定為平日 10:00-12:00。這段範圍目前完全沒有
// 衝突的會議,所以全部標成 "open"。
//
// 之後若行事曆有新的會議衝突,把該筆的 status 改成 "full" 即可:
//   - 唯讀清單會顯示該日期為「unavailable」
//   - 報名表單會自動移除該日期的選項
//
// 每一筆都帶 week(ISO 週次),表單會依 week 分組,同一週只能單選一天。
// -----------------------------------------------------------------
const WEEKDAY_LABEL = ["日", "一", "二", "三", "四", "五", "六"];

const RAW_DATES = [
  { date: "2026-07-08", week: 28 },
  { date: "2026-07-09", week: 28 },
  { date: "2026-07-10", week: 28 },
  { date: "2026-07-13", week: 29 },
  { date: "2026-07-14", week: 29 },
  { date: "2026-07-15", week: 29 },
  { date: "2026-07-16", week: 29 },
  { date: "2026-07-17", week: 29 },
  { date: "2026-07-20", week: 30 },
  { date: "2026-07-21", week: 30 },
  { date: "2026-07-22", week: 30 },
  { date: "2026-07-23", week: 30 },
  { date: "2026-07-24", week: 30 },
  { date: "2026-07-27", week: 31 },
  { date: "2026-07-28", week: 31 },
  { date: "2026-07-29", week: 31 },
  { date: "2026-07-30", week: 31 },
  { date: "2026-07-31", week: 31 },
  { date: "2026-08-03", week: 32 },
  { date: "2026-08-04", week: 32 },
  { date: "2026-08-05", week: 32 },
  { date: "2026-08-06", week: 32 },
  { date: "2026-08-07", week: 32 },
  { date: "2026-08-10", week: 33 },
  { date: "2026-08-11", week: 33 },
  { date: "2026-08-12", week: 33 },
  { date: "2026-08-13", week: 33 },
  { date: "2026-08-14", week: 33 },
  { date: "2026-08-17", week: 34 },
  { date: "2026-08-18", week: 34 },
  { date: "2026-08-19", week: 34 },
  { date: "2026-08-20", week: 34 },
  { date: "2026-08-21", week: 34 },
  { date: "2026-08-24", week: 35 },
  { date: "2026-08-25", week: 35 },
  { date: "2026-08-26", week: 35 },
  { date: "2026-08-27", week: 35 },
  { date: "2026-08-28", week: 35 },
  { date: "2026-08-31", week: 36 },
];

const SLOTS = RAW_DATES.map(({ date, week }) => {
  const d = new Date(date + "T10:00:00+08:00");
  return {
    date,
    week,
    label: `${date}(週${WEEKDAY_LABEL[d.getDay()]})`,
    status: "open", // "open" | "full" — 有會議衝突時手動改成 "full"
  };
});

// 依週次分組,並附上該週的日期範圍字串,方便顯示週標題
function groupByWeek(slots) {
  const map = new Map();
  for (const s of slots) {
    if (!map.has(s.week)) map.set(s.week, []);
    map.get(s.week).push(s);
  }
  return [...map.entries()].map(([week, items]) => {
    const first = items[0].date;
    const last = items[items.length - 1].date;
    return { week, items, rangeLabel: `${first} ~ ${last}` };
  });
}

const WEEK_GROUPS = groupByWeek(SLOTS);

function renderSlotList() {
  const grid = document.getElementById("slot-list");
  grid.innerHTML = WEEK_GROUPS.map((group) => {
    const pills = group.items
      .map(
        (s) =>
          `<div class="slot-pill ${s.status === "full" ? "full" : ""}">${
            s.label
          }${s.status === "full" ? "(unavailable)" : ""}</div>`
      )
      .join("");
    return `
      <div class="week-block">
        <div class="week-heading">第 ${group.week} 週(${group.rangeLabel})</div>
        <div class="slot-grid">${pills}</div>
      </div>`;
  }).join("");
}

// 表單的時段選擇:依週分組,每週用 radio(同一週最多選一天)
function renderSlotCheckboxes() {
  const wrap = document.getElementById("signup-slot-checkboxes");
  wrap.innerHTML = WEEK_GROUPS.map((group) => {
    const options = group.items
      .map((s) => {
        if (s.status === "full") {
          return `<label class="slot-option full">
            <input type="radio" disabled />
            ${s.label}(unavailable)
          </label>`;
        }
        return `<label class="slot-option">
          <input type="radio" name="week_${group.week}" value="${s.date}" />
          ${s.label}
        </label>`;
      })
      .join("");
    return `
      <fieldset class="week-fieldset">
        <legend>第 ${group.week} 週(${group.rangeLabel})— 最多選一天</legend>
        <div class="slot-checkboxes">${options}</div>
      </fieldset>`;
  }).join("");
}

renderSlotList();
renderSlotCheckboxes();

// -----------------------------------------------------------------
// 表單送出 -> 寫入 Firestore
// -----------------------------------------------------------------
const form = document.getElementById("signup-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

function getChosenSlots(formData) {
  return WEEK_GROUPS.map((group) => formData.get(`week_${group.week}`)).filter(
    (v) => v
  );
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form-status";

  const formData = new FormData(form);
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const motivation = formData.get("motivation")?.toString().trim();
  const chosenSlots = getChosenSlots(formData);

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
    statusEl.textContent = "請至少選一個希望參加的日期(每週最多選一天)。";
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
    submitBtn.disabled = false;
  }
});
