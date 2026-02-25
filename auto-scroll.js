// ==UserScript==
// @name         自动随机滚动
// @namespace    https://github.com/belingud/GM.search-by-image
// @version      0.4.0
// @description  在指定网站中模拟鼠标滚动，悬浮图标：移入显示开始/停止/配置；配置面板内编辑并保存
// @match        https://linux.do/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(() => {
  "use strict";
  const g = typeof window !== "undefined" ? window : this;

  const K = {
    enabled: "as_enabled",
    stepMin: "as_stepMin",
    stepMax: "as_stepMax",
    intMin: "as_intMin",
    intMax: "as_intMax",
    smooth: "as_smooth",
    stopAfterMin: "as_stopAfterMin",
    autoStop: "as_autoStop",
    bottomWaitSec: "as_bottomWaitSec",
    uiPos: "as_uiPos",
    theme: "as_theme",
  };
  const DEF = {
    stepMin: 8, stepMax: 17, intMin: 30, intMax: 100, smooth: 1, stopAfterMin: 0,
    autoStop: 1, bottomWaitSec: 10,
    uiPos: { right: 18, bottom: 18 },
    theme: "auto",
  };

  const v = (k, d) => GM_getValue(k, d);
  const s = (k, val) => GM_setValue(k, val);
  const r = (a, b) => Math.random() * (b - a) + a;

  const stop = () => {
    clearTimeout(g.__as_t || 0);
    clearTimeout(g.__as_stop || 0);
    g.__as_t = g.__as_stop = null;
    if (g.__as_obs) { g.__as_obs.disconnect(); g.__as_obs = null; }
    s(K.enabled, 0);
    setUiState(false);
  };

  const start = () => {
    clearTimeout(g.__as_t || 0);
    clearTimeout(g.__as_stop || 0);
    if (g.__as_obs) { g.__as_obs.disconnect(); g.__as_obs = null; }

    const stepMin = +v(K.stepMin, DEF.stepMin), stepMax = +v(K.stepMax, DEF.stepMax);
    const intMin = +v(K.intMin, DEF.intMin), intMax = +v(K.intMax, DEF.intMax);
    const smooth = +v(K.smooth, DEF.smooth);
    const stopAfterMin = +v(K.stopAfterMin, DEF.stopAfterMin);
    const autoStop = +v(K.autoStop, DEF.autoStop);
    const bottomWaitSec = +v(K.bottomWaitSec, DEF.bottomWaitSec);

    const a0 = isFinite(stepMin) ? stepMin : DEF.stepMin;
    const b0 = isFinite(stepMax) ? stepMax : DEF.stepMax;
    const c0 = isFinite(intMin) ? intMin : DEF.intMin;
    const d0 = isFinite(intMax) ? intMax : DEF.intMax;

    const stepA = Math.min(a0, b0), stepB = Math.max(a0, b0);
    const intA = Math.min(c0, d0), intB = Math.max(c0, d0);

    let bottomSince = 0;
    let lastMutationTime = Date.now();

    if (autoStop) {
      g.__as_obs = new MutationObserver(() => { lastMutationTime = Date.now(); });
      g.__as_obs.observe(document.body, { childList: true, subtree: true });
    }

    s(K.enabled, 1);
    setUiState(true);

    const waitMs = (isFinite(bottomWaitSec) && bottomWaitSec > 0 ? bottomWaitSec : DEF.bottomWaitSec) * 1000;

    (function tick() {
      scrollBy({ top: r(stepA, stepB), behavior: smooth ? "smooth" : "auto" });

      if (autoStop) {
        const doc = document.documentElement;
        const atBottom = (g.scrollY + g.innerHeight) >= (doc.scrollHeight - 5);
        if (atBottom) {
          if (lastMutationTime > bottomSince) {
            bottomSince = Date.now();
          } else if (bottomSince > 0 && Date.now() - bottomSince >= waitMs) {
            stop();
            return;
          }
        } else {
          bottomSince = 0;
        }
      }

      g.__as_t = setTimeout(tick, r(intA, intB));
    })();

    if (stopAfterMin > 0) g.__as_stop = setTimeout(stop, stopAfterMin * 60000);
  };

  let btn, menu, cfg, hoverTimer = 0, lockCfg = false;

  const css = `
/* 主题变量 - Auto (根据系统偏好) */
#as_btn, #as_menu, #as_cfg {
  --bg-primary: rgba(30,30,40,0.95);
  --bg-secondary: rgba(0,0,0,0.3);
  --text-primary: #ffffff;
  --text-secondary: rgba(255,255,255,0.7);
  --border-color: rgba(255,255,255,0.06);
  --input-border: rgba(255,255,255,0.1);
  --shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset;
}

/* 白色主题 - 苹果白风格 */
#as_btn.light, #as_menu.light, #as_cfg.light {
  --bg-primary: rgba(255,255,255,0.85);
  --bg-secondary: rgba(245,245,247,0.9);
  --text-primary: #1d1d1f;
  --text-secondary: rgba(60,60,67,0.6);
  --border-color: rgba(0,0,0,0.08);
  --input-border: rgba(0,0,0,0.12);
  --shadow: 0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset;
}

/* 深色主题 - Catppuccin Mocha */
#as_btn.mocha, #as_menu.mocha, #as_cfg.mocha {
  --bg-primary: rgba(30,30,46,0.95);
  --bg-secondary: rgba(17,17,27,0.8);
  --text-primary: #cdd6f4;
  --text-secondary: #a6adc8;
  --border-color: rgba(88,91,112,0.3);
  --input-border: rgba(88,91,112,0.4);
  --shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
}

#as_btn{
  position:fixed;z-index:999999;width:48px;height:48px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color:#fff;cursor:pointer;user-select:none;
  box-shadow:0 4px 20px rgba(102,126,234,.4),0 0 0 1px rgba(255,255,255,.1) inset;
  transition:all .25s cubic-bezier(.4,0,.2,1);
  backdrop-filter:blur(10px);
}
#as_btn:hover{
  transform:scale(1.08) translateY(-2px);
  box-shadow:0 8px 30px rgba(102,126,234,.5),0 0 0 1px rgba(255,255,255,.2) inset;
}
#as_btn.running{
  background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow:0 4px 20px rgba(245,87,108,.4),0 0 0 1px rgba(255,255,255,.1) inset;
  animation:pulse 2s ease-in-out infinite;
}
#as_btn.running:hover{
  box-shadow:0 8px 30px rgba(245,87,108,.5),0 0 0 1px rgba(255,255,255,.2) inset;
}
/* 浅色主题按钮 - 苹果蓝 */
#as_btn.light{
  background:linear-gradient(135deg, #0071e3 0%, #00c7be 100%);
  box-shadow:0 4px 20px rgba(0,113,227,.3),0 0 0 1px rgba(0,0,0,.05) inset;
}
#as_btn.light:hover{
  box-shadow:0 8px 30px rgba(0,113,227,.4),0 0 0 1px rgba(0,0,0,.1) inset;
}
#as_btn.light.running{
  background:linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  box-shadow:0 4px 20px rgba(255,107,107,.3),0 0 0 1px rgba(0,0,0,.05) inset;
}
#as_btn.light.running:hover{
  box-shadow:0 8px 30px rgba(255,107,107,.4),0 0 0 1px rgba(0,0,0,.1) inset;
}
/* 深色主题按钮 - Catppuccin Mocha */
#as_btn.mocha{
  background:linear-gradient(135deg, #89b4fa 0%, #cba6f7 100%);
  box-shadow:0 4px 20px rgba(137,180,250,.3),0 0 0 1px rgba(255,255,255,.05) inset;
}
#as_btn.mocha:hover{
  box-shadow:0 8px 30px rgba(137,180,250,.4),0 0 0 1px rgba(255,255,255,.1) inset;
}
#as_btn.mocha.running{
  background:linear-gradient(135deg, #f38ba8 0%, #fab387 100%);
  box-shadow:0 4px 20px rgba(243,139,168,.3),0 0 0 1px rgba(255,255,255,.05) inset;
}
#as_btn.mocha.running:hover{
  box-shadow:0 8px 30px rgba(243,139,168,.4),0 0 0 1px rgba(255,255,255,.1) inset;
}
@keyframes pulse{
  0%,100%{transform:scale(1);}
  50%{transform:scale(1.05);}
}
#as_btn svg{width:22px;height:22px;fill:currentColor;}

#as_menu,#as_cfg{
  position:fixed;z-index:999999;
  background:var(--bg-primary);
  color:var(--text-primary);border-radius:16px;
  box-shadow:var(--shadow);
  font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  display:none;opacity:0;transform:scale(.95) translateY(8px);
  transition:all .2s cubic-bezier(.4,0,.2,1);
  backdrop-filter:blur(20px);
  border:1px solid var(--border-color);
}
#as_menu.show,#as_cfg.show{
  display:block;opacity:1;transform:scale(1) translateY(0);
}

#as_menu{padding:12px;min-width:180px;}
#as_menu .row{display:flex;gap:8px;}
#as_menu button{
  flex:1;padding:10px 8px;border:0;border-radius:12px;
  background:linear-gradient(135deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.04) 100%);
  color:var(--text-primary);font-size:12px;font-weight:500;cursor:pointer;
  transition:all .2s ease;white-space:nowrap;
  box-shadow:0 2px 8px rgba(0,0,0,.2);
}
#as_menu button:hover{
  background:linear-gradient(135deg, rgba(255,255,255,.15) 0%, rgba(255,255,255,.08) 100%);
  transform:translateY(-1px);
}
#as_menu button.primary{
  background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color:#fff;
}
#as_menu button.primary:hover{
  background:linear-gradient(135deg, #7b8ce3 0%, #8a5cb8 100%);
}
/* 浅色主题菜单按钮 - 苹果蓝 */
#as_menu.light button.primary{
  background:linear-gradient(135deg, #0071e3 0%, #00c7be 100%);
}
#as_menu.light button.primary:hover{
  background:linear-gradient(135deg, #0077ed 0%, #00d9c8 100%);
}
/* 深色主题菜单按钮 - Catppuccin Mocha */
#as_menu.mocha button.primary{
  background:linear-gradient(135deg, #89b4fa 0%, #cba6f7 100%);
}
#as_menu.mocha button.primary:hover{
  background:linear-gradient(135deg, #99c4ff 0%, #d4b3ff 100%);
}
#as_menu .hint{
  color:var(--text-secondary);margin-top:10px;padding:0 4px;font-size:11px;text-align:center;
}

#as_cfg{padding:20px;min-width:320px;}
#as_cfg .title{
  font-size:15px;font-weight:600;margin-bottom:16px;
  background:linear-gradient(90deg, #667eea, #f093fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
/* 浅色主题标题 - 苹果蓝 */
#as_cfg.light .title{
  background:linear-gradient(90deg, #0071e3, #00c7be);-webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
/* 深色主题标题 - Catppuccin Mocha */
#as_cfg.mocha .title{
  background:linear-gradient(90deg, #89b4fa, #cba6f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
#as_cfg .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
#as_cfg label{
  display:flex;flex-direction:column;gap:6px;
  font-size:12px;color:var(--text-secondary);
}
#as_cfg input{
  padding:10px 12px;border-radius:10px;
  border:1px solid var(--input-border);
  background:var(--bg-secondary);color:var(--text-primary);font-size:13px;
  transition:all .2s ease;outline:none;
}
#as_cfg input:focus{
  border-color:#667eea;box-shadow:0 0 0 3px rgba(102,126,234,.2);
}
/* 浅色主题输入框焦点 - 苹果蓝 */
#as_cfg.light input:focus{
  border-color:#0071e3;box-shadow:0 0 0 3px rgba(0,113,227,.2);
}
/* 深色主题输入框焦点 - Catppuccin Mocha */
#as_cfg.mocha input:focus{
  border-color:#89b4fa;box-shadow:0 0 0 3px rgba(137,180,250,.2);
}
#as_cfg .full{grid-column:1/-1;}
#as_cfg .full input{width:60px;text-align:center;}
#as_cfg .actions{display:flex;gap:10px;margin-top:18px;}
#as_cfg .actions button{
  flex:1;padding:10px 16px;border:0;border-radius:12px;
  background:linear-gradient(135deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.04) 100%);
  color:var(--text-primary);font-size:13px;font-weight:500;cursor:pointer;
  transition:all .2s ease;
}
#as_cfg .actions button:hover{transform:translateY(-1px);}
#as_cfg .actions button.save{
  background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color:#fff;
}
#as_cfg .actions button.save:hover{
  background:linear-gradient(135deg, #7b8ce3 0%, #8a5cb8 100%);
}
/* 浅色主题保存按钮 - 苹果蓝 */
#as_cfg.light .actions button.save{
  background:linear-gradient(135deg, #0071e3 0%, #00c7be 100%);
}
#as_cfg.light .actions button.save:hover{
  background:linear-gradient(135deg, #0077ed 0%, #00d9c8 100%);
}
/* 深色主题保存按钮 - Catppuccin Mocha */
#as_cfg.mocha .actions button.save{
  background:linear-gradient(135deg, #89b4fa 0%, #cba6f7 100%);
}
#as_cfg.mocha .actions button.save:hover{
  background:linear-gradient(135deg, #99c4ff 0%, #d4b3ff 100%);
}
#as_cfg .small{
  color:var(--text-secondary);margin-top:14px;font-size:11px;text-align:center;line-height:1.5;opacity:0.8;
}

/* 主题选择器 */
#as_cfg .theme-row{
  display:flex;gap:8px;margin-bottom:16px;padding-bottom:16px;
  border-bottom:1px solid var(--border-color);
}
#as_cfg .theme-option{
  flex:1;padding:8px 12px;border-radius:10px;
  border:1px solid var(--input-border);
  background:var(--bg-secondary);color:var(--text-primary);
  font-size:12px;cursor:pointer;text-align:center;transition:all .2s ease;
}
#as_cfg .theme-option:hover{
  border-color:#667eea;
}
#as_cfg .theme-option.active{
  border-color:#667eea;background:rgba(102,126,234,0.15);
}
/* 浅色主题选择器 - 苹果蓝 */
#as_cfg.light .theme-option:hover{
  border-color:#0071e3;
}
#as_cfg.light .theme-option.active{
  border-color:#0071e3;background:rgba(0,113,227,0.1);
}
/* 深色主题选择器 - Catppuccin Mocha */
#as_cfg.mocha .theme-option:hover{
  border-color:#89b4fa;
}
#as_cfg.mocha .theme-option.active{
  border-color:#89b4fa;background:rgba(137,180,250,0.15);
}
`;

  const injectCss = () => {
    const st = document.createElement("style");
    st.textContent = css;
    document.documentElement.appendChild(st);
  };

  const place = () => {
    const pos = v(K.uiPos, DEF.uiPos) || DEF.uiPos;
    const right = (pos.right ?? DEF.uiPos.right);
    const bottom = (pos.bottom ?? DEF.uiPos.bottom);

    btn.style.right = right + "px";
    btn.style.bottom = bottom + "px";

    const baseRight = btn.style.right;
    const baseBottom = btn.style.bottom;
    menu.style.right = baseRight;
    menu.style.bottom = `calc(${baseBottom} + 46px)`;
    cfg.style.right = baseRight;
    cfg.style.bottom = `calc(${baseBottom} + 46px)`;
  };

  const setUiState = (running) => {
    if (!btn) return;
    btn.classList.toggle("running", running);
    btn.innerHTML = running
      ? '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    btn.title = running ? "自动滚动运行中 - 点击停止" : "自动滚动 - 点击开始";
  };

  const applyTheme = () => {
    const theme = v(K.theme, DEF.theme);
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    let actualTheme = theme;
    if (theme === "auto") actualTheme = prefersDark ? "dark" : "light";
    
    const classes = ["light", "mocha"];
    btn?.classList.remove(...classes);
    menu?.classList.remove(...classes);
    cfg?.classList.remove(...classes);
    
    if (actualTheme === "light") {
      btn?.classList.add("light");
      menu?.classList.add("light");
      cfg?.classList.add("light");
    } else if (actualTheme === "mocha") {
      btn?.classList.add("mocha");
      menu?.classList.add("mocha");
      cfg?.classList.add("mocha");
    }
  };
  const showMenu = (on) => { menu.classList.toggle("show", on); };
  const showCfg = (on) => { cfg.classList.toggle("show", on); };

  const fillCfg = () => {
    cfg.querySelector('[name="stepMin"]').value = v(K.stepMin, DEF.stepMin);
    cfg.querySelector('[name="stepMax"]').value = v(K.stepMax, DEF.stepMax);
    cfg.querySelector('[name="intMin"]').value = v(K.intMin, DEF.intMin);
    cfg.querySelector('[name="intMax"]').value = v(K.intMax, DEF.intMax);
    cfg.querySelector('[name="smooth"]').value = v(K.smooth, DEF.smooth);
    cfg.querySelector('[name="stopAfterMin"]').value = v(K.stopAfterMin, DEF.stopAfterMin);
    cfg.querySelector('[name="autoStop"]').value = v(K.autoStop, DEF.autoStop);
    cfg.querySelector('[name="bottomWaitSec"]').value = v(K.bottomWaitSec, DEF.bottomWaitSec);
    // 更新主题选择器状态
    const theme = v(K.theme, DEF.theme);
    cfg.querySelectorAll('.theme-option').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme);
    });
  };

  const saveCfg = () => {
    const getNum = (name, d) => {
      const x = +cfg.querySelector(`[name="${name}"]`).value;
      return isFinite(x) ? x : d;
    };
    s(K.stepMin, getNum("stepMin", DEF.stepMin));
    s(K.stepMax, getNum("stepMax", DEF.stepMax));
    s(K.intMin, getNum("intMin", DEF.intMin));
    s(K.intMax, getNum("intMax", DEF.intMax));
    s(K.smooth, getNum("smooth", DEF.smooth) ? 1 : 0);
    s(K.stopAfterMin, getNum("stopAfterMin", DEF.stopAfterMin));
    s(K.autoStop, getNum("autoStop", DEF.autoStop) ? 1 : 0);
    s(K.bottomWaitSec, getNum("bottomWaitSec", DEF.bottomWaitSec));
    applyTheme();
  };

  const cancelHide = () => { clearTimeout(hoverTimer); };
  const scheduleHide = () => {
    cancelHide();
    if (lockCfg) return; // 配置面板打开时不自动隐藏
    hoverTimer = setTimeout(() => { showMenu(false); showCfg(false); }, 220);
  };

  const initUi = () => {
    injectCss();

    btn = document.createElement("div");
    btn.id = "as_btn";
    document.body.appendChild(btn);

    menu = document.createElement("div");
    menu.id = "as_menu";
    menu.innerHTML = `
      <div class="row">
        <button data-act="start" class="primary">▶ 开始</button>
        <button data-act="stop">■ 停止</button>
        <button data-act="cfg">⚙ 配置</button>
      </div>
    `;
    document.body.appendChild(menu);

    cfg = document.createElement("div");
    cfg.id = "as_cfg";
    cfg.innerHTML = `
      <div class="title">⚙ 滚动配置</div>
      <div class="theme-row">
        <div class="theme-option" data-theme="auto" data-act="theme">🌓 自动</div>
        <div class="theme-option" data-theme="light" data-act="theme">☀ 浅色</div>
        <div class="theme-option" data-theme="mocha" data-act="theme">🌙 深色</div>
      </div>
      <div class="grid">
        <label>最小步长 (px)<input name="stepMin" inputmode="numeric"/></label>
        <label>最大步长 (px)<input name="stepMax" inputmode="numeric"/></label>
        <label>最小间隔 (ms)<input name="intMin" inputmode="numeric"/></label>
        <label>最大间隔 (ms)<input name="intMax" inputmode="numeric"/></label>
        <label>平滑滚动 (1=开启)<input name="smooth" inputmode="numeric"/></label>
        <label>定时停止 (分钟, 0=不停)<input name="stopAfterMin" inputmode="numeric"/></label>
        <label>到底自动停 (1=开启)<input name="autoStop" inputmode="numeric"/></label>
        <label>到底静默等待 (秒)<input name="bottomWaitSec" inputmode="numeric"/></label>
      </div>
      <div class="actions">
        <button data-act="save" class="save">✓ 保存</button>
        <button data-act="close">✕ 关闭</button>
      </div>
      <div class="small">配置保存到 油猴脚本 存储，刷新页面后依然有效</div>
    `;
    document.body.appendChild(cfg);

    place();
    setUiState(+v(K.enabled, 0));
    applyTheme();

    // 监听系统主题变化
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", applyTheme);

    // Hover 展示（按钮/菜单/配置都算 hover 区）
    const onEnter = () => { cancelHide(); if (!lockCfg) { showCfg(false); showMenu(true); } };
    const onLeave = () => { scheduleHide(); };

    btn.addEventListener("mouseenter", onEnter);
    btn.addEventListener("mouseleave", onLeave);
    menu.addEventListener("mouseenter", cancelHide);
    menu.addEventListener("mouseleave", onLeave);

    // 关键修复：配置面板自己也要阻止隐藏计时器
    cfg.addEventListener("mouseenter", cancelHide);
    cfg.addEventListener("mouseleave", onLeave);

    // 菜单操作
    menu.addEventListener("click", (e) => {
      const act = e.target?.getAttribute?.("data-act");
      if (!act) return;
      if (act === "start") start();
      if (act === "stop") stop();
      if (act === "cfg") {
        lockCfg = true;
        cancelHide();
        fillCfg();
        showMenu(false);
        showCfg(true);
      }
    });

    // 配置面板操作
    cfg.addEventListener("click", (e) => {
      const act = e.target?.getAttribute?.("data-act");
      if (!act) return;
      if (act === "theme") {
        const newTheme = e.target?.getAttribute?.("data-theme");
        if (newTheme) {
          s(K.theme, newTheme);
          applyTheme();
          fillCfg();
        }
        return;
      }
      if (act === "save") {
        saveCfg();
        if (+v(K.enabled, 0)) start(); // 运行中则按新配置重启
        lockCfg = false;
        showCfg(false);
      }
      if (act === "close") {
        lockCfg = false;
        showCfg(false);
      }
    });

    // 点击空白关闭（配置打开时也能关闭）
    document.addEventListener("click", (e) => {
      if (btn.contains(e.target) || menu.contains(e.target) || cfg.contains(e.target)) return;
      lockCfg = false;
      showMenu(false);
      showCfg(false);
    });

    // 拖动按钮（保存位置）
    let dragging = false, sx = 0, sy = 0, sr = 0, sb = 0;
    btn.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      const pos = v(K.uiPos, DEF.uiPos) || DEF.uiPos;
      sr = pos.right ?? DEF.uiPos.right;
      sb = pos.bottom ?? DEF.uiPos.bottom;
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      const nr = Math.max(0, sr - dx);
      const nb = Math.max(0, sb - dy);
      s(K.uiPos, { right: Math.round(nr), bottom: Math.round(nb) });
      place();
    });
    document.addEventListener("mouseup", () => { dragging = false; });

    // 控制台入口（可选）
    g.autoScrollStart = start;
    g.autoScrollStop = stop;
  };

  const boot = () => {
    initUi();
    if (+v(K.enabled, 0)) start();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();