// Jogo interativo: atravesse as pontes de Königsberg
(function () {
  const svg = document.getElementById("bridge-game");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const statusEl = document.getElementById("game-status");
  const pathEl = document.getElementById("game-path");
  const degreesEl = document.getElementById("game-degrees");
  const resetBtn = document.getElementById("game-reset");
  const extraBtn = document.getElementById("game-extra");

  const COLORS = {
    water: "#1f3550",
    shore: "#3f6ea3",
    land: "#232c3b",
    landHover: "#2b3647",
    bridge: "#d29922",
    available: "#f2cc60",
    used: "#4a5263",
    text: "#e6edf3",
    walker: "#a371f7",
  };

  const regions = {
    A: { shape: "polygon", attrs: { points: "0,0 520,0 520,50 300,100 0,100" }, anchor: [40, 50] },
    B: { shape: "polygon", attrs: { points: "0,220 300,220 520,270 520,320 0,320" }, anchor: [40, 274] },
    C: { shape: "ellipse", attrs: { cx: 160, cy: 160, rx: 85, ry: 32 }, anchor: [160, 160] },
    D: { shape: "polygon", attrs: { points: "340,150 520,100 520,220 340,170" }, anchor: [470, 160] },
  };

  const BRIDGES = [
    { ends: ["A", "C"], line: [110, 94, 110, 140] },
    { ends: ["A", "C"], line: [210, 94, 210, 140] },
    { ends: ["B", "C"], line: [110, 180, 110, 226] },
    { ends: ["B", "C"], line: [210, 180, 210, 226] },
    { ends: ["C", "D"], line: [240, 160, 346, 160] },
    { ends: ["A", "D"], line: [430, 62, 430, 134] },
    { ends: ["B", "D"], line: [430, 186, 430, 258] },
  ];
  const EXTRA = { ends: ["A", "B"], line: [70, 94, 70, 226], extra: true };

  let bridges, used, current, path, extraOn = false;

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // ---------- desenho ----------
  el("rect", { width: 520, height: 320, fill: COLORS.water }, svg);

  for (const [name, r] of Object.entries(regions)) {
    r.node = el(r.shape, { ...r.attrs, fill: COLORS.land, stroke: COLORS.shore, "stroke-width": 2, "stroke-linejoin": "round", class: "game-region" }, svg);
    r.node.addEventListener("click", () => start(name));
  }

  const walker = el("circle", { r: 22, fill: COLORS.walker, opacity: 0, "pointer-events": "none", class: "game-walker" }, svg);
  const bridgeLayer = el("g", {}, svg);

  for (const [name, r] of Object.entries(regions)) {
    const t = el("text", {
      x: r.anchor[0], y: r.anchor[1] + 9, fill: COLORS.text, "font-size": 26, "font-weight": 700,
      "text-anchor": "middle", "font-family": "system-ui, sans-serif", "pointer-events": "none",
    }, svg);
    t.textContent = name;
  }

  function drawBridges() {
    bridgeLayer.replaceChildren();
    bridges.forEach((b, i) => {
      const [x1, y1, x2, y2] = b.line;
      const g = el("g", { class: "game-bridge", tabindex: 0, role: "button", "aria-label": `Ponte ${i + 1}: ${b.ends.join("–")}` }, bridgeLayer);
      b.visible = el("line", { x1, y1, x2, y2, stroke: COLORS.bridge, "stroke-width": 9, "stroke-linecap": "round" }, g);
      el("line", { x1, y1, x2, y2, stroke: "transparent", "stroke-width": 26, "stroke-linecap": "round" }, g);
      g.addEventListener("click", () => cross(i));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); cross(i); }
      });
      b.group = g;
    });
  }

  // ---------- lógica ----------
  function degrees() {
    const d = { A: 0, B: 0, C: 0, D: 0 };
    for (const b of bridges) { d[b.ends[0]]++; d[b.ends[1]]++; }
    return d;
  }

  function available(i) {
    return current && !used.has(i) && bridges[i].ends.includes(current);
  }

  function render() {
    bridges.forEach((b, i) => {
      const color = used.has(i) ? COLORS.used : available(i) ? COLORS.available : COLORS.bridge;
      b.visible.setAttribute("stroke", color);
      b.group.classList.toggle("is-available", available(i));
      b.group.classList.toggle("is-used", used.has(i));
    });

    for (const [name, r] of Object.entries(regions)) {
      r.node.classList.toggle("is-current", name === current);
    }

    if (current) {
      const [x, y] = regions[current].anchor;
      walker.setAttribute("cx", x);
      walker.setAttribute("cy", y);
      walker.setAttribute("opacity", 0.55);
    } else {
      walker.setAttribute("opacity", 0);
    }

    const d = degrees();
    const odd = Object.keys(d).filter((k) => d[k] % 2 === 1);
    degreesEl.innerHTML = Object.keys(d)
      .map((k) => `<span class="deg ${d[k] % 2 ? "odd" : "even"}">${k}: ${d[k]}</span>`)
      .join("") + `<p>Vértices de grau ímpar: <strong>${odd.length}</strong>${
        odd.length <= 2 ? " → o passeio é possível!" : " → o passeio é impossível."
      }</p>`;

    pathEl.textContent = path.length ? path.join(" → ") : "—";
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "game-status" + (kind ? " " + kind : "");
  }

  function start(name) {
    if (current) return;
    current = name;
    path = [name];
    setStatus(`Você está em ${name}. Clique em uma ponte destacada para atravessar.`);
    render();
  }

  function cross(i) {
    if (!current) { setStatus("Primeiro clique em uma região (A, B, C ou D) para começar."); return; }
    if (used.has(i)) { setStatus("Essa ponte já foi atravessada!", "warn"); return; }
    if (!available(i)) { setStatus(`Essa ponte não sai de ${current}.`, "warn"); return; }

    used.add(i);
    const [a, b] = bridges[i].ends;
    current = current === a ? b : a;
    path.push(current);

    const left = bridges.length - used.size;
    const faltam = left === 1 ? "falta 1 ponte" : `faltam ${left} pontes`;
    const stuck = !bridges.some((_, j) => available(j));
    if (left === 0) {
      setStatus(`🎉 Você atravessou todas as ${bridges.length} pontes exatamente uma vez!`, "ok");
    } else if (stuck) {
      setStatus(`Sem saída! Você está em ${current} e ainda ${faltam}.`, "warn");
    } else {
      setStatus(`Você está em ${current}. Ainda ${faltam}.`);
    }
    render();
  }

  function reset() {
    bridges = extraOn ? [...BRIDGES, EXTRA] : [...BRIDGES];
    used = new Set();
    current = null;
    path = [];
    drawBridges();
    setStatus(extraOn
      ? "Com a 8ª ponte, A e B passam a ter grau par. Dica: comece por um vértice de grau ímpar."
      : "Clique em uma região (A, B, C ou D) para escolher onde começar.");
    render();
  }

  resetBtn.addEventListener("click", reset);
  extraBtn.addEventListener("click", () => {
    extraOn = !extraOn;
    extraBtn.textContent = extraOn ? "Remover a 8ª ponte" : "Adicionar uma 8ª ponte (A–B)";
    extraBtn.setAttribute("aria-pressed", extraOn);
    reset();
  });

  reset();
})();
