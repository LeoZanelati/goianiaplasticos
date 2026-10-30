(function () {
  "use strict";
  var C = window.CATALOGO, S = window.SITE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };
  /* normaliza texto para busca: sem acento, minúsculo, "corvim/curvim" = "courvim" */
  var nz = function (s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]+/g, " ").replace(/\b(corvim|curvim|corvin|courvin)\b/g, "courvim").replace(/\s+/g, " ").trim();
  };

  /* ---------- dados ---------- */
  var FAM = {}; C.familias.forEach(function (f) { FAM[f.id] = f; });
  var ICON_FOAM = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><rect x="8" y="38" width="48" height="14" rx="5"/><rect x="12" y="24" width="40" height="14" rx="5"/><rect x="16" y="10" width="32" height="14" rx="5"/></svg>';
  var ICON_TOOLS = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="22" cy="42" r="12"/><path d="M22 30V18m0 0 8-8m-8 8-8-8M36 36l18-18m-6-2 8 8"/></svg>';
  var GROUPS = [
    { id: "tecidos", nome: "Tecidos", fams: ["tecidos"], txt: "Jacar, nobuck, linho, veludo, chenille e muito mais.", by: "s" },
    { id: "courvim", nome: "Courvim, corano e plásticos", fams: ["courvim"], txt: "Corano, courvim náutico, plástico bagum, napa e toldo.", by: "s" },
    { id: "acoplados", nome: "Acoplados", fams: ["acoplados"], txt: "Malhas e teares acoplados, lisos e desenhados." },
    { id: "tetos", nome: "Tetos e feltros", fams: ["tetos"], txt: "Forrações de teto e feltros." },
    { id: "carpetes", nome: "Carpetes e tapetes", fams: ["carpetes"], txt: "Carpetes com e sem resina e tapetes capacho." },
    { id: "espumas", nome: "Espumas e enchimentos", fams: ["espumas"], txt: "Espumas, mantas, flocos e penas.", icon: ICON_FOAM },
    { id: "aviamentos", nome: "Aviamentos e ferragens", fams: ["linhas", "grampos", "colas", "acabamentos", "ferragens", "ferramentas", "outros"], txt: "Linhas, grampos, colas, zíperes, pés, ferragens e ferramentas.", by: "f", icon: ICON_TOOLS }
  ];
  var G = {}; GROUPS.forEach(function (g) { G[g.id] = g; });
  var BYC = {}, ITEMS = C.itens;
  var famGroup = {}; GROUPS.forEach(function (g) { g.fams.forEach(function (f) { famGroup[f] = g.id; }); });
  ITEMS.forEach(function (it) {
    it.g = famGroup[it.f];
    it.k = nz(it.n + " " + it.c + " " + FAM[it.f].nome + " " + G[it.g].nome);
    BYC[it.c] = it;
  });
  GROUPS.forEach(function (g) { g.items = ITEMS.filter(function (i) { return i.g === g.id; }); });

  /* ---------- minha lista ---------- */
  var lista = [];
  try { lista = JSON.parse(localStorage.getItem("gp_lista") || "[]").filter(function (c) { return BYC[c]; }); } catch (e) { lista = []; }
  var save = function () { try { localStorage.setItem("gp_lista", JSON.stringify(lista)); } catch (e) {} };
  var inList = function (c) { return lista.indexOf(c) > -1; };
  var toast;
  function say(msg) {
    clearTimeout(toast); var t = $("#toast"); t.textContent = msg; t.hidden = false;
    toast = setTimeout(function () { t.hidden = true; }, 2200);
  }
  function toggle(c) {
    var i = lista.indexOf(c);
    if (i > -1) { lista.splice(i, 1); say("Retirado da lista"); } else { lista.push(c); say("Adicionado à lista"); }
    save(); refreshList();
  }
  function refreshList() {
    var n = lista.length;
    $("#nLista").textContent = n; $("#nLista").setAttribute("data-zero", n ? "0" : "1");
    $("#listbar").hidden = !n; document.body.classList.toggle("has-list", !!n);
    $("#lbN").textContent = n + (n === 1 ? " item" : " itens") + " na sua lista";
    $("#lbWa").href = waLink(listMsg());
    document.querySelectorAll(".add[data-c]").forEach(function (b) {
      var on = inList(+b.getAttribute("data-c")); b.setAttribute("aria-pressed", on);
      b.setAttribute("aria-label", (on ? "Retirar da lista: " : "Adicionar à lista: ") + BYC[+b.getAttribute("data-c")].n);
      b.innerHTML = on ? CHECK : "+";
    });
    var ls = $("#sheetLista"); if (ls) renderLista();
  }
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';

  /* ---------- WhatsApp ---------- */
  function waLink(text) { return "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(text); }
  var HEAD = "Olá! Vi o site da Goiânia Plásticos e quero saber o preço e a disponibilidade de:";
  function listMsg() {
    return HEAD + "\n" + lista.slice(0, 40).map(function (c) { var i = BYC[c]; return "• " + i.n + " (cód. " + i.c + ")"; }).join("\n");
  }
  function oneMsg(it) { return HEAD + "\n• " + it.n + " (cód. " + it.c + ")"; }
  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.93 9.93 0 1 0 12.04 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.08.9.92-3-.2-.31a8.2 8.2 0 1 1 6.86 3.74Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.42-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48a.93.93 0 0 0-.67.31c-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.12.16 1.77 2.7 4.3 3.79 1.6.69 2.23.75 3.03.63.49-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z"/></svg>';

  /* ---------- cartões ---------- */
  function img(it, i) { return "img/" + it.p[i || 0]; }
  function card(it) {
    return '<div class="card"><button class="card-open" type="button" data-open="' + it.c + '" style="all:unset;display:flex;flex-direction:column;gap:8px;cursor:pointer;min-width:0" aria-label="Ver ' + esc(it.n) + '">' +
      '<span class="ph"><img src="' + img(it) + '" alt="Amostra: ' + esc(it.n) + '" loading="lazy" decoding="async"></span>' +
      '<span class="nm">' + esc(it.n) + '</span><span class="cd">cód. ' + it.c + '</span></button>' +
      '<button class="add" type="button" data-c="' + it.c + '"></button></div>';
  }
  function row(it) {
    var th = it.p ? '<span class="th"><img src="' + img(it) + '" alt="" loading="lazy" decoding="async"></span>' : "";
    return '<li class="row' + (it.p ? "" : " nophoto") + '">' + th +
      '<button class="tx" type="button" data-open="' + it.c + '"><b>' + esc(it.n) + '</b><span>cód. ' + it.c + ' · ' + esc(FAM[it.f].nome) + '</span></button>' +
      '<button class="add" type="button" data-c="' + it.c + '"></button></li>';
  }

  /* ---------- páginas ---------- */
  var view = $("#view"), state = { chip: {}, q: "", back: "", more: 0 };
  var BRUSH = '<svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9 C26 3 52 12 84 6 S142 10 198 4" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/></svg>';
  var PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>';
  var e = S.endereco;
  var full = e.linha1 + ", " + e.bairro + ", " + e.cidade + " - " + e.uf + ", " + e.cep;
  var pend = function (k) { return S.mostrarPendencias && S.pendente && S.pendente[k] ? '<span class="pend">a confirmar</span>' : ""; };

  function tile(g) {
    var withP = g.items.filter(function (i) { return i.p; });
    var pick = [], step = Math.max(1, Math.floor(withP.length / 4));
    for (var i = 0; i < withP.length && pick.length < 4; i += step) pick.push(withP[i]);
    var m = pick.length >= 4
      ? '<div class="mosaic">' + pick.map(function (i) { return '<img src="' + img(i) + '" alt="" loading="lazy" decoding="async">'; }).join("") + "</div>"
      : '<div class="mosaic plain">' + (g.icon || ICON_FOAM) + "</div>";
    return '<a class="tile" href="#' + g.id + '">' + m + '<div class="t"><h3>' + esc(g.nome) + "</h3><p>" + esc(g.txt) + '</p><span class="go">Ver ' + g.items.length + " itens →</span></div></a>";
  }

  function home() {
    var fan = (C.destaques || []).map(function (c) { return BYC[c]; }).filter(Boolean).slice(0, 6)
      .map(function (i) { return '<figure><img src="' + img(i) + '" alt="" decoding="async"></figure>'; }).join("");
    var addr = esc(e.linha1) + "<br>" + esc(e.complemento) + " · " + esc(e.bairro) + "<br>" + esc(e.cidade) + " – " + esc(e.uf) + " · CEP " + esc(e.cep) + pend("endereco");
    var maps = encodeURIComponent(full);
    view.innerHTML =
      '<section class="hero"><div class="wrap"><div>' +
      '<p class="eyebrow">' + esc(S.slogan) + " · Av. Anhanguera, Goiânia</p>" +
      '<h1>Tecidos, courvim e tudo para <em>tapeçaria' + BRUSH + "</em>.</h1>" +
      '<p class="lead">Veja os materiais com os quais trabalhamos, anote o código e peça pelo WhatsApp. Sem cadastro, sem complicação.</p>' +
      '<div class="acts"><a class="btn btn-main" href="#tecidos">Ver o catálogo</a><a class="btn btn-wa" href="' + waLink("Olá! Vim pelo site da Goiânia Plásticos.") + '" target="_blank" rel="noopener">' + WA_ICON + "Falar no WhatsApp</a></div></div>" +
      '<div class="fan" aria-hidden="true">' + fan + "</div></div></section>" +
      '<section class="steps"><div class="wrap"><ol>' +
      '<li><span class="num">1</span><b>Escolha</b><span>Navegue pelas categorias ou busque pelo nome ou código.</span></li>' +
      '<li><span class="num">2</span><b>Monte sua lista</b><span>Toque no + dos itens que você quer.</span></li>' +
      '<li><span class="num">3</span><b>Peça no WhatsApp</b><span>Mandamos preço e disponibilidade.</span></li></ol></div></section>' +
      '<section class="sec"><div class="wrap"><h2>O que você procura?</h2><p class="sub">Toque em uma categoria para ver as amostras.</p><div class="tiles">' + GROUPS.map(tile).join("") + "</div></div></section>" +
      '<section class="ml"><div class="wrap"><div><h2>Também estamos no Mercado Livre</h2><p>Prefere comprar online? Veja os produtos que temos na nossa loja do Mercado Livre.</p></div>' +
      '<a class="btn btn-dark" href="' + esc(S.mercadoLivre) + '" target="_blank" rel="noopener">Ver loja no Mercado Livre</a></div></section>' +
      '<section class="contact" id="contato"><div class="wrap"><div class="sec" style="padding:0"><h2>Venha nos visitar</h2></div><div class="grid2">' +
      '<dl class="info"><div><dt>Endereço</dt><dd>' + addr + "</dd></div>" +
      '<div><dt>Telefone</dt><dd><a href="tel:+55' + S.telefone.replace(/\D/g, "") + '">' + esc(S.telefone) + "</a></dd></div>" +
      '<div><dt>WhatsApp</dt><dd><a href="' + waLink("Olá! Vim pelo site da Goiânia Plásticos.") + '" target="_blank" rel="noopener">' + esc(S.whatsappExibir) + "</a></dd></div>" +
      '<div><dt>E-mail</dt><dd><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a></dd></div>" +
      (S.horario ? "<div><dt>Horário</dt><dd>" + esc(S.horario) + pend("horario") + "</dd></div>" : "") + "</dl>" +
      '<div class="where">' + PIN + "<p>" + esc(e.linha1) + "<span>" + esc(e.bairro) + ", " + esc(e.cidade) + " – " + esc(e.uf) + "</span></p>" +
      '<div class="acts"><a class="btn btn-wa" href="https://www.google.com/maps/dir/?api=1&destination=' + maps + '" target="_blank" rel="noopener">Como chegar</a>' +
      '<a class="btn btn-line" href="https://www.google.com/maps/search/?api=1&query=' + maps + '" target="_blank" rel="noopener">Abrir no mapa</a></div></div></div></div></section>';
  }

  var PAGE = 36;
  function listPage(g) {
    var key = g.by, chips = "", cur = state.chip[g.id] || "";
    var items = g.items;
    if (key) {
      var cnt = {}, order = [];
      items.forEach(function (i) { var k = key === "f" ? i.f : (i.s || "Outros"); if (!cnt[k]) { cnt[k] = 0; order.push(k); } cnt[k]++; });
      if (key === "f") order.sort(function (a, b) { return g.fams.indexOf(a) - g.fams.indexOf(b); });
      else order.sort(function (a, b) { return a === "Outros" ? 1 : b === "Outros" ? -1 : cnt[b] - cnt[a]; });
      chips = '<div class="chips" role="group" aria-label="Filtrar">' +
        '<button class="chip" type="button" data-chip="" aria-pressed="' + (cur === "") + '">Todos<span class="c">' + items.length + "</span></button>" +
        order.map(function (k) { return '<button class="chip" type="button" data-chip="' + esc(k) + '" aria-pressed="' + (cur === k) + '">' + esc(key === "f" ? FAM[k].nome : k) + '<span class="c">' + cnt[k] + "</span></button>"; }).join("") + "</div>";
      if (cur) items = items.filter(function (i) { return (key === "f" ? i.f : (i.s || "Outros")) === cur; });
    }
    var ph = items.filter(function (i) { return i.p; }), no = items.filter(function (i) { return !i.p; });
    var shown = Math.min(no.length, PAGE + state.more);
    var h = '<div class="wrap page"><div class="crumb"><a class="back" href="#">' + ARROW + "Início</a></div>" +
      "<h1>" + esc(g.nome) + '</h1><p class="count">' + items.length + (items.length === 1 ? " item" : " itens") + (ph.length ? " · " + ph.length + " com foto" : "") + "</p>" + chips;
    if (ph.length) h += '<div class="grid">' + ph.map(card).join("") + "</div>";
    if (no.length) {
      h += (ph.length ? '<h2 class="more-h">Também trabalhamos com</h2><p class="more-p">Ainda sem foto no site. Toque no item para pedir no WhatsApp.</p>' : '<p class="more-p" style="margin-top:18px">Toque no item para pedir preço e disponibilidade no WhatsApp.</p>') +
        '<ul class="rows">' + no.slice(0, shown).map(row).join("") + "</ul>";
      if (shown < no.length) h += '<div class="showmore"><button class="btn btn-line" type="button" id="more">Mostrar mais (' + (no.length - shown) + ")</button></div>";
    }
    view.innerHTML = h + "</div>";
  }

  function search() {
    var terms = nz(state.q).split(" ").filter(Boolean), digits = /^\d+$/.test(nz(state.q));
    var res = ITEMS.filter(function (i) {
      if (digits) return String(i.c).indexOf(terms[0]) === 0;
      return terms.every(function (t) { return i.k.indexOf(t) > -1; });
    });
    res.sort(function (a, b) {
      if (digits) { var ea = String(a.c) === terms[0], eb = String(b.c) === terms[0]; if (ea !== eb) return ea ? -1 : 1; }
      return (b.p ? 1 : 0) - (a.p ? 1 : 0);
    });
    var shown = Math.min(res.length, 40 + state.more);
    var h = '<div class="wrap page"><div class="crumb"><a class="back" href="#' + esc(state.back) + '" id="backSearch">' + ARROW + "Voltar</a></div><h1>Resultado da busca</h1>" +
      '<p class="count">' + res.length + (res.length === 1 ? " item encontrado" : " itens encontrados") + " para “" + esc(state.q.trim()) + "”</p>";
    if (!res.length) h += '<div class="empty"><b>Não encontramos esse item.</b>Confira a escrita ou o código. Se preferir, pergunte pelo WhatsApp: temos muitos materiais que ainda não estão no site.<div style="margin-top:16px"><a class="btn btn-wa" href="' + waLink("Olá! Vim pelo site e procuro: " + state.q.trim()) + '" target="_blank" rel="noopener">' + WA_ICON + "Perguntar no WhatsApp</a></div></div>";
    else {
      h += '<ul class="rows" style="margin-top:18px">' + res.slice(0, shown).map(row).join("") + "</ul>";
      if (shown < res.length) h += '<div class="showmore"><button class="btn btn-line" type="button" id="more">Mostrar mais (' + (res.length - shown) + ")</button></div>";
    }
    view.innerHTML = h + "</div>";
  }

  /* ---------- rotas ---------- */
  function route(keepScroll) {
    var r = location.hash.replace("#", "");
    if (r !== "busca" && state.q) { state.q = ""; $("#q").value = ""; $("#qx").hidden = true; }
    if (r === "busca") search();
    else if (G[r]) listPage(G[r]);
    else if (r === "contato") { home(); var c = $("#contato"); if (c) c.scrollIntoView(); r = "contato"; }
    else home();
    refreshList();
    if (!keepScroll && r !== "contato") window.scrollTo(0, 0);
    document.title = G[r] ? G[r].nome + " · " + S.nome : S.nome + " · " + S.slogan;
  }
  window.addEventListener("hashchange", function () { state.more = 0; route(); });

  /* ---------- busca ---------- */
  var q = $("#q"), qt;
  q.addEventListener("input", function () {
    $("#qx").hidden = !q.value;
    clearTimeout(qt);
    qt = setTimeout(function () {
      state.q = q.value; state.more = 0;
      var cur = location.hash.replace("#", "");
      if (!state.q.trim()) { if (cur === "busca") location.hash = state.back || ""; return; }
      if (cur !== "busca") { state.back = cur; location.hash = "busca"; } else route(true);
    }, 160);
  });
  $("#qx").addEventListener("click", function () { q.value = ""; $("#qx").hidden = true; state.q = ""; q.focus(); if (location.hash === "#busca") location.hash = state.back || ""; });
  $("#searchForm").addEventListener("submit", function (ev) { ev.preventDefault(); q.blur(); });

  /* ---------- cliques ---------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    var add = t.closest(".add[data-c]"); if (add) { toggle(+add.getAttribute("data-c")); return; }
    var op = t.closest("[data-open]"); if (op) { openItem(BYC[+op.getAttribute("data-open")]); return; }
    var chip = t.closest("[data-chip]");
    if (chip) { var id = location.hash.replace("#", ""); state.chip[id] = chip.getAttribute("data-chip"); state.more = 0; var y = window.scrollY; route(true); window.scrollTo(0, y); return; }
    if (t.closest("#more")) { state.more += 60; var y2 = window.scrollY; route(true); window.scrollTo(0, y2); return; }
    if (t.closest("#btnLista, #lbOpen")) { openLista(); return; }
  });

  /* ---------- ficha do item ---------- */
  var opener = null;
  function overlay(html, id) {
    closeOverlay(true);
    opener = document.activeElement;
    var o = document.createElement("div"); o.className = "ovl"; o.id = "ovl";
    o.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" id="' + id + '">' + '<button class="x" type="button" id="ovlx" aria-label="Fechar">×</button>' + html + "</div>";
    document.body.appendChild(o); document.body.style.overflow = "hidden";
    o.addEventListener("click", function (ev) { if (ev.target === o) closeOverlay(); });
    $("#ovlx").addEventListener("click", function () { closeOverlay(); });
    $("#ovlx").focus();
    return o;
  }
  function closeOverlay(silent) {
    var o = $("#ovl"); if (!o) return; o.remove(); document.body.style.overflow = "";
    if (!silent && opener && opener.focus && document.contains(opener)) opener.focus();
  }
  document.addEventListener("keydown", function (ev) {
    if (!$("#ovl")) return;
    if (ev.key === "Escape") closeOverlay();
    if (ev.key === "Tab") {
      var f = $("#ovl").querySelectorAll("button,a[href]"), a = f[0], z = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); z.focus(); }
      else if (!ev.shiftKey && document.activeElement === z) { ev.preventDefault(); a.focus(); }
    }
  });
  function openItem(it) {
    var pos = 0, n = it.p ? it.p.length : 0;
    var big = n
      ? '<div class="big"><img id="bigimg" src="' + img(it, 0) + '" alt="Amostra: ' + esc(it.n) + '">' + (n > 1 ? '<button class="nav p" type="button" id="np" aria-label="Foto anterior">‹</button><button class="nav n" type="button" id="nn" aria-label="Próxima foto">›</button>' : "") + "</div>"
      : '<div class="big"><div class="ph-empty">' + (G[it.g].icon || ICON_FOAM) + "</div></div>";
    var o = overlay(big + '<span class="kind">' + esc(FAM[it.f].nome) + '</span><h2 id="shT">' + esc(it.n) + '</h2><div class="meta"><span>Código <b>' + it.c + "</b></span><span>Vendido por <b>" + esc(it.u) + "</b></span></div>" +
      '<div class="acts"><a class="btn btn-wa" href="' + waLink(oneMsg(it)) + '" target="_blank" rel="noopener">' + WA_ICON + 'Pedir preço no WhatsApp</a>' +
      '<button class="btn btn-line add-big" type="button" id="addBig"></button></div>' +
      '<p class="note">Cores podem variar um pouco na tela. ' + (n ? "" : "Este item ainda não tem foto no site. ") + 'Prefere comprar online? <a href="' + esc(S.mercadoLivre) + '" target="_blank" rel="noopener">Veja nossa loja no Mercado Livre</a>.</p>', "sheetItem");
    $("#sheetItem").setAttribute("aria-labelledby", "shT");
    function addLabel() { $("#addBig").textContent = inList(it.c) ? "✓ Está na sua lista (retirar)" : "+ Adicionar à minha lista"; }
    addLabel();
    $("#addBig").addEventListener("click", function () { toggle(it.c); addLabel(); });
    if (n > 1) {
      var go = function (d) { pos = (pos + d + n) % n; $("#bigimg").src = img(it, pos); };
      $("#np").addEventListener("click", function () { go(-1); }); $("#nn").addEventListener("click", function () { go(1); });
    }
  }

  /* ---------- lista (gaveta) ---------- */
  var confirmClear = false;
  function renderLista() {
    var box = $("#sheetLista"); if (!box) return;
    var body = lista.length
      ? '<ul class="lst">' + lista.map(function (c) { var i = BYC[c]; return "<li><div><b>" + esc(i.n) + "</b><span>cód. " + i.c + '</span></div><button type="button" data-rm="' + c + '" aria-label="Retirar ' + esc(i.n) + '">Retirar</button></li>'; }).join("") + "</ul>" +
        '<div class="acts"><a class="btn btn-wa" id="sendWa" href="' + waLink(listMsg()) + '" target="_blank" rel="noopener">' + WA_ICON + 'Enviar lista no WhatsApp</a><button class="btn btn-line" type="button" id="clr">' + (confirmClear ? "Toque de novo para limpar tudo" : "Limpar lista") + "</button></div>" +
        '<p class="note">Você escolhe os itens aqui e conversa com a loja pelo WhatsApp. Nenhum pedido é feito pelo site.</p>'
      : '<p class="note" style="margin-top:10px">Sua lista está vazia. Toque no + das amostras para montar a lista e enviar tudo de uma vez pelo WhatsApp.</p>';
    box.querySelector(".lbody").innerHTML = body;
    box.querySelectorAll("[data-rm]").forEach(function (b) { b.addEventListener("click", function () { toggle(+b.getAttribute("data-rm")); }); });
    var clr = $("#clr"); if (clr) clr.addEventListener("click", function () {
      if (!confirmClear) { confirmClear = true; renderLista(); return; }
      lista = []; save(); confirmClear = false; refreshList(); say("Lista limpa");
    });
  }
  function openLista() { confirmClear = false; overlay('<h2 class="lh">Minha lista</h2><div class="lbody"></div>', "sheetLista"); renderLista(); }

  /* ---------- partes fixas ---------- */
  $("#fabWa").href = waLink("Olá! Vim pelo site da Goiânia Plásticos.");
  $("#footAddr").textContent = e.linha1 + " · " + e.bairro + ", " + e.cidade + " – " + e.uf;
  $("#year").textContent = new Date().getFullYear();
  $("#footMl").href = S.mercadoLivre;
  route();
})();
