const STORAGE_KEY = "jenny-memory-adventure-v1";

const chapters = [
  {
    id: "hongdae",
    title: "弘大初见",
    kicker: "小姚明登场",
    emoji: "👟",
    x: 20, y: 9,
    subtitle: "故事开始的地方",
    story: "第一次见面是在弘大。阿迪店的镜子前，两个人一本正经地比身高。后来，你还帮他挑了戒指——当时谁也不知道，这会成为一场很长很长的冒险。",
    type: "quiz",
    question: "他当时最出名的江湖外号是？",
    choices: ["光云大学小姚明", "弘大第一帅", "首尔英语教父"],
    answer: 0,
    wrong: "身高提示已经这么明显了，老婆再想想！",
    letterTitle: "第一封信 · 初见",
    letter: "宝宝，我一直觉得第一次见你时，命运已经偷偷给了我提示。镜子里比的不只是身高，也是我后来每次回忆起我们时，嘴角会上扬的高度。谢谢那一天的你，走进了我的生活。"
  },
  {
    id: "myeongdong",
    title: "明洞支线",
    kicker: "英语老师的秘密",
    emoji: "📚",
    x: 72, y: 20,
    subtitle: "两位演员的专业表演",
    story: "正式谈恋爱之前，有人装模作样教了好多天英语；另一个人也装模作样认真学了好多天。关系变亲昵的那天，他给你送了衣服穿。",
    type: "quiz",
    question: "这门英语课真正的课程目标是什么？",
    choices: ["通过雅思考试", "学习过去完成时", "找理由多见宝宝几次"],
    answer: 2,
    wrong: "花生摇头：这明显不是一门正经英语课。",
    letterTitle: "第二封信 · 笨拙的靠近",
    letter: "那些英语课，我讲得也许并没有多好。可我很庆幸我们都默契地把戏演了下去。喜欢一个人的时候，连找借口靠近都显得那么认真。"
  },
  {
    id: "aquarium",
    title: "海洋馆",
    kicker: "第一次约会",
    emoji: "🐠",
    x: 47, y: 30,
    subtitle: "在蓝色世界里收集心动",
    story: "第一次约会去了海洋馆。现在，藏在水里的五颗心动泡泡又飘回来了。",
    type: "bubbles",
    letterTitle: "第三封信 · 第一次约会",
    letter: "那天的海洋馆很蓝，鱼群从我们身边游过。但我记得最清楚的，还是站在我旁边的你。后来见过很多风景，我还是最喜欢和你一起看的那些。"
  },
  {
    id: "lucky",
    title: "首尔好运街",
    kicker: "幸运女孩事件簿",
    emoji: "🎟️",
    x: 20, y: 46,
    subtitle: "抽一次属于你的签",
    story: "Lotte 超市一等奖、假装上厕所去买的 Hello Kitty、十五块钱的超长冰淇淋，还有一起染得一块亮一块暗的黄头发……请验证一下你是不是 the luckiest guy。",
    type: "lottery",
    letterTitle: "第四封信 · 幸运",
    letter: "你总说自己抽中了一等奖，可我心里最幸运的人其实是我。因为那么多普通又好笑的日子，身边都有你。至于那颗假装掉在地上的 Hello Kitty——现在正式归还失主。"
  },
  {
    id: "campus",
    title: "校园日常",
    kicker: "咖啡、篮球与自习",
    emoji: "☕",
    x: 72, y: 59,
    subtitle: "最普通，也最珍贵",
    story: "一起去咖啡店上自习，在你的学校一起学习；你陪他打篮球、给他捡球。还有情侣装、人生四格，以及一录视频就笑个不停的两个人。",
    type: "quiz",
    question: "如果只能给这些日常起一个名字，它应该叫？",
    choices: ["浪费时间", "普通的一天", "想重复一辈子的日子"],
    answer: 2,
    wrong: "花生：提示一下，这道题没有任何难度。",
    letterTitle: "第五封信 · 平凡日子",
    letter: "以前总觉得要带你去很好的地方、给你很好的东西，才算爱你。可后来我明白，真正让我舍不得的，是咖啡店、篮球场、人生四格，是我们笑到录不好一段视频的普通一天。我想和你重复很多很多这样的日子。"
  },
  {
    id: "shenzhen",
    title: "深圳补给站",
    kicker: "打折食品大作战",
    emoji: "🛒",
    x: 31, y: 73,
    subtitle: "用 30 元准备一顿晚餐",
    story: "在深圳逛沃尔玛，等晚上的打折食物，然后两个人饱餐一顿。请选择至少两样食物，总价不能超过 30 元。",
    type: "shopping",
    letterTitle: "第六封信 · 一起生活",
    letter: "我们吃过 unlimited BBQ，也吃过沃尔玛晚上的打折食物；去过蛙来哒和老船长肉蟹煲。昂贵不昂贵，从来不是我记得一顿饭的原因。我记得，是因为坐在对面的人一直是你。以后我想慢慢把曾经没能给你的，都补给你。"
  },
  {
    id: "confession",
    title: "航大站台",
    kicker: "花与真正的答案",
    emoji: "💐",
    x: 61, y: 85,
    subtitle: "故事最重要的一站",
    story: "韩国航空大学地铁站，他拿着花给你惊喜、向你表白。虽然早在圣水洞的阿迪店里，他已经忍不住口头表白过一次了。",
    type: "quiz",
    question: "后来一次次送你回宿舍时，他在心里做了什么决定？",
    choices: ["下次早点回家", "以后永远在一起，不分离", "少吃一点五花肉"],
    answer: 1,
    wrong: "这一次，请认真听听他的心。",
    letterTitle: "第七封信 · 我的决定",
    letter: "老婆，我永远忘不了一次次在你宿舍楼下送你回去。每次转身，我都在心里更确定一点：我想和你永远在一起，不分离。以前没能带你享受特别好的生活，是我心里一直记着的遗憾。但请相信，我想给你的未来，从来不只是礼物，而是我全部的认真。"
  },
  {
    id: "final",
    title: "生日终点",
    kicker: "10.25",
    emoji: "🎂",
    x: 70, y: 96,
    subtitle: "只有收齐七封信才能进入",
    type: "final"
  }
];

const defaultState = { started: false, playerName: "Jenny", completed: [] };
let state = loadState();
let currentChapter = null;

const intro = document.querySelector("#intro");
const game = document.querySelector("#game");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const mapNodes = document.querySelector("#map-nodes");
const token = document.querySelector("#player-token");
const toast = document.querySelector("#toast");

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showScreen() {
  intro.classList.toggle("active", !state.started);
  game.classList.toggle("active", state.started);
  if (state.started) renderMap();
}

function renderMap() {
  mapNodes.innerHTML = "";
  const completedCount = state.completed.length;
  chapters.forEach((chapter, index) => {
    const unlocked = chapter.type === "final" ? completedCount === 7 : index <= completedCount;
    const completed = state.completed.includes(chapter.id);
    const node = document.createElement("div");
    node.className = `map-node ${unlocked ? "" : "locked"} ${completed ? "completed" : ""} ${unlocked && !completed && index === completedCount ? "current" : ""}`;
    node.style.left = `${chapter.x}%`;
    node.style.top = `${chapter.y}%`;
    node.innerHTML = `
      <button class="node-button" ${unlocked ? "" : "disabled"} aria-label="${chapter.title}${unlocked ? "" : "，尚未解锁"}">
        ${unlocked ? chapter.emoji : "🔒"}<span class="node-check">✓</span>
      </button>
      <span class="node-title">${chapter.title}</span>
      <span class="node-kicker">${unlocked ? chapter.kicker : "尚未解锁"}</span>`;
    if (unlocked) node.querySelector("button").addEventListener("click", () => openChapter(chapter));
    mapNodes.appendChild(node);
  });

  const activeIndex = Math.min(completedCount, chapters.length - 1);
  const active = chapters[activeIndex];
  token.style.left = `calc(${active.x}% + 32px)`;
  token.style.top = `calc(${active.y}% - 52px)`;
  document.querySelector("#letter-count").textContent = `${completedCount} / 7`;
  document.querySelector("#guide-message").textContent = completedCount === 7
    ? "七封信都找到了。生日终点已经亮起来啦！"
    : `下一站：${chapters[completedCount].title}。${chapters[completedCount].kicker}！`;
}

function openChapter(chapter) {
  currentChapter = chapter;
  if (chapter.type === "final") return renderFinal();
  if (state.completed.includes(chapter.id)) return revealLetter(chapter, false);

  modalContent.innerHTML = `
    <div class="stage-emoji">${chapter.emoji}</div>
    <p class="eyebrow">MEMORY ${chapters.indexOf(chapter) + 1} / 7</p>
    <h3 id="modal-title">${chapter.title}</h3>
    <p class="stage-subtitle">${chapter.subtitle}</p>
    <div class="story-box">${chapter.story}</div>
    <div id="stage-task"></div>`;

  const task = document.querySelector("#stage-task");
  if (chapter.type === "quiz") renderQuiz(task, chapter);
  if (chapter.type === "bubbles") renderBubbles(task, chapter);
  if (chapter.type === "lottery") renderLottery(task, chapter);
  if (chapter.type === "shopping") renderShopping(task, chapter);
  openModal();
}

function renderQuiz(container, chapter) {
  container.innerHTML = `
    <h4 class="task-title">${chapter.question}</h4>
    <div class="choice-grid">${chapter.choices.map((choice, index) => `<button class="choice-button" data-index="${index}">${choice}</button>`).join("")}</div>
    <p class="mini-hint" aria-live="polite"></p>`;
  const hint = container.querySelector(".mini-hint");
  container.querySelectorAll(".choice-button").forEach(button => {
    button.addEventListener("click", () => {
      if (Number(button.dataset.index) === chapter.answer) {
        completeChapter(chapter);
      } else {
        button.classList.remove("wrong");
        void button.offsetWidth;
        button.classList.add("wrong");
        hint.textContent = chapter.wrong;
      }
    });
  });
}

function renderBubbles(container, chapter) {
  const positions = [[12,55],[31,22],[49,61],[68,29],[81,66]];
  container.innerHTML = `
    <h4 class="task-title">戳破五颗心动泡泡</h4>
    <div class="collect-area">${positions.map((p, i) => `<button class="bubble" style="left:${p[0]}%;top:${p[1]}%;animation-delay:${i * .2}s" aria-label="心动泡泡">💙</button>`).join("")}</div>
    <p class="progress-line">已收集 <b id="bubble-count">0</b> / 5</p>`;
  let count = 0;
  container.querySelectorAll(".bubble").forEach(bubble => bubble.addEventListener("click", () => {
    if (bubble.classList.contains("collected")) return;
    bubble.classList.add("collected");
    count += 1;
    container.querySelector("#bubble-count").textContent = count;
    if (count === 5) setTimeout(() => completeChapter(chapter), 350);
  }));
}

function renderLottery(container, chapter) {
  container.innerHTML = `
    <h4 class="task-title">点击奖箱，抽取今天的运气</h4>
    <div class="lucky-box"><button class="lottery-button" aria-label="抽奖">🎁</button></div>
    <p class="mini-hint">据说真正的幸运女孩一抽就中。</p>`;
  container.querySelector(".lottery-button").addEventListener("click", (event) => {
    event.currentTarget.textContent = "🏆";
    event.currentTarget.disabled = true;
    container.querySelector(".mini-hint").textContent = "一等奖：和光云大学小姚明续约一辈子！";
    setTimeout(() => completeChapter(chapter), 1000);
  });
}

function renderShopping(container, chapter) {
  const foods = [
    { name: "打折寿司", price: 12, emoji: "🍣" },
    { name: "草莓牛奶", price: 7, emoji: "🥛" },
    { name: "小蛋糕", price: 9, emoji: "🍰" },
    { name: "豪华肉蟹煲", price: 38, emoji: "🦀" }
  ];
  container.innerHTML = `
    <h4 class="task-title">今晚吃什么？</h4>
    <div class="shopping-grid">${foods.map((food, i) => `<button class="food-card" data-index="${i}"><span>${food.emoji}</span><b>${food.name}</b><small>¥${food.price}</small></button>`).join("")}</div>
    <div class="budget-row"><span>预算：¥30</span><b>已选：¥<span id="total">0</span></b></div>
    <button class="primary-button" id="checkout">装进购物袋</button>
    <p class="mini-hint"></p>`;
  const selected = new Set();
  const totalEl = container.querySelector("#total");
  container.querySelectorAll(".food-card").forEach(card => card.addEventListener("click", () => {
    const index = Number(card.dataset.index);
    selected.has(index) ? selected.delete(index) : selected.add(index);
    card.classList.toggle("selected");
    totalEl.textContent = [...selected].reduce((sum, i) => sum + foods[i].price, 0);
  }));
  container.querySelector("#checkout").addEventListener("click", () => {
    const total = [...selected].reduce((sum, i) => sum + foods[i].price, 0);
    const hint = container.querySelector(".mini-hint");
    if (selected.size < 2) return hint.textContent = "至少选两样，两个人才吃得饱。";
    if (total > 30) return hint.textContent = "超预算啦！肉蟹煲留到下次正式约会。";
    completeChapter(chapter);
  });
}

function completeChapter(chapter) {
  if (!state.completed.includes(chapter.id)) {
    state.completed.push(chapter.id);
    saveState();
  }
  revealLetter(chapter, true);
}

function revealLetter(chapter, newlyFound) {
  modalContent.innerHTML = `
    <div class="letter-reveal">
      <div class="envelope">${newlyFound ? "💌" : "✉️"}</div>
      <p class="eyebrow">${newlyFound ? "发现一封信" : "已收藏的信"}</p>
      <h3 id="modal-title">${chapter.letterTitle}</h3>
      <div class="letter-paper"><p>${chapter.letter}</p><span class="letter-sign">—— 永远爱你的他</span></div>
      <button class="primary-button continue-button">${state.completed.length === 7 ? "前往生日终点" : "继续寻找下一封"}</button>
    </div>`;
  modalContent.querySelector(".continue-button").addEventListener("click", () => {
    closeModal();
    renderMap();
    if (newlyFound) showToast(`已收藏：${chapter.letterTitle}`);
    setTimeout(() => document.querySelector(`.map-node.current`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
  });
  openModal();
}

function renderJournal() {
  modalContent.innerHTML = `
    <div class="stage-emoji">💌</div>
    <p class="eyebrow">MEMORY JOURNAL</p>
    <h3 id="modal-title">回忆信箱</h3>
    <p class="stage-subtitle">已经找到 ${state.completed.length} / 7 封信</p>
    <div class="journal-list">${chapters.slice(0, 7).map((chapter, i) => {
      const found = state.completed.includes(chapter.id);
      return `<div class="journal-entry ${found ? "" : "locked"}" data-id="${chapter.id}"><b>${found ? chapter.letterTitle : `第${i + 1}封信 · 尚未找到`}</b><span>${found ? chapter.title : "继续沿着地图寻找"}</span></div>`;
    }).join("")}</div>`;
  modalContent.querySelectorAll(".journal-entry:not(.locked)").forEach(entry => entry.addEventListener("click", () => {
    const chapter = chapters.find(item => item.id === entry.dataset.id);
    revealLetter(chapter, false);
  }));
  openModal();
}

function renderFinal() {
  const videoMarkup = `
    <div class="video-frame">
      <video id="birthday-video" controls playsinline preload="metadata" poster="assets/video-poster.jpg">
        <source src="assets/birthday-video.mp4" type="video/mp4" />
      </video>
      <div class="video-placeholder" id="video-placeholder"><span>🎬</span><b>最后一份礼物</b><small>生日视频将在这里播放</small></div>
    </div>`;
  modalContent.innerHTML = `
    <div class="final-card">
      <div class="stage-emoji">🎂</div>
      <p class="eyebrow">HAPPY BIRTHDAY · 10.25</p>
      <h3 id="modal-title">生日快乐，${escapeHtml(state.playerName)}</h3>
      <p class="stage-subtitle">七封信已经全部找到了</p>
      ${videoMarkup}
      <div class="final-quote">老婆，谢谢你陪我从弘大、明洞、航大，一路走到深圳，也走到今天。以前的我可能没能带你享受那些特别好的，但我会一直努力，把以后的每一个普通日子都过成值得收藏的回忆。<br /><br /><b>我好爱你。生日快乐，我的宝宝。</b></div>
    </div>`;
  const video = modalContent.querySelector("video");
  const placeholder = modalContent.querySelector("#video-placeholder");
  video.addEventListener("loadeddata", () => { placeholder.style.display = "none"; });
  video.addEventListener("error", () => { video.style.display = "none"; });
  openModal();
}

function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => modal.querySelector(".modal-close")?.focus(), 50);
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

document.querySelector("#start-button").addEventListener("click", () => {
  state.started = true;
  state.playerName = document.querySelector("#player-name").value.trim() || "Jenny";
  saveState();
  showScreen();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector("#journal-button").addEventListener("click", renderJournal);
document.querySelector("#reset-button").addEventListener("click", () => {
  if (!window.confirm("要清空已经收集的信件，重新开始冒险吗？")) return;
  state = { ...defaultState };
  saveState();
  showScreen();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

document.querySelector("#player-name").value = state.playerName;
showScreen();
