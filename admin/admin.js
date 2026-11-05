(function () {
  "use strict";
  var S = window.SITE, C = window.CATALOGO;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var nz = function (s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\b(corvim|curvim)\b/g, "courvim").replace(/\s+/g, " ").trim(); };
  if (!window.supabase || !window.supabase.createClient) { var bt = $("#boot"); bt.textContent = "Não foi possível carregar o painel. Atualize a página; se continuar, avise quem mantém o site."; bt.hidden = false; return; }
  var sb = window.supabase.createClient(S.supabaseUrl, S.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });

  var FAMS = C.familias, FAMN = {}; FAMS.forEach(function (f) { FAMN[f.id] = f.nome; });
  var BASE = {}; C.itens.forEach(function (i) { BASE[i.c] = i; });
  var GROUPS = [
    { id: "tecidos", nome: "Tecidos", fams: ["tecidos"], by: "s" },
    { id: "courvim", nome: "Courvim e corano", fams: ["courvim"], by: "s" },
    { id: "acoplados", nome: "Acoplados", fams: ["acoplados"] },
    { id: "tetos", nome: "Tetos e feltros", fams: ["tetos"] },
    { id: "carpetes", nome: "Carpetes", fams: ["carpetes"] },
    { id: "espumas", nome: "Espumas", fams: ["espumas"] },
    { id: "aviamentos", nome: "Aviamentos e ferragens", fams: ["linhas", "grampos", "colas", "acabamentos", "ferragens", "ferramentas", "outros"], by: "f" }
  ];
  var famG = {}; GROUPS.forEach(function (g) { g.fams.forEach(function (f) { famG[f] = g.id; }); });
  var SUBS = {}; C.itens.forEach(function (i) { SUBS[i.c] = i.s || ""; });
  var cat = "", sub = "";
  var rows = {};            // codigo -> linha do banco
  var vis = { disponivel: true, sob_consulta: true, oculto: true }, onlyNew = false, q = "", shown = 40, pendingCode = null;
  var STATUS = [["disponivel", "Disponível"], ["sob_consulta", "Sob consulta"], ["oculto", "Oculto"]];

  function show(id, on) { $(id).hidden = !on; }
  function say(el, msg, err) { el.textContent = msg; el.className = "msg" + (err ? " err" : ""); el.hidden = false; }
  var gmT; function gsay(msg, err) { clearTimeout(gmT); say($("#gm"), msg, err); $("#gm").classList.add("fixo"); if (!err && !/…$/.test(msg)) gmT = setTimeout(function () { $("#gm").hidden = true; }, 5000); }
  function trad(e) {
    var m = (e && e.message) || String(e);
    if (/row-level security|permission|not authorized|403/i.test(m)) return "Sem permissão. Entre com a conta de administrador.";
    if (/Invalid login/i.test(m)) return "E-mail ou senha incorretos.";
    if (/Email not confirmed/i.test(m)) return "Confirme o e-mail pelo link que o Supabase enviou, depois entre.";
    if (/already registered/i.test(m)) return "Esse e-mail já tem acesso. Use \"Entrar\".";
    if (/Failed to fetch|NetworkError/i.test(m)) return "Sem conexão com a internet.";
    return m;
  }

  $("#gm").addEventListener("click", function () { this.hidden = true; });

  /* ---------- login ---------- */
  $("#fl").addEventListener("submit", function (ev) {
    ev.preventDefault();
    sb.auth.signInWithPassword({ email: $("#em").value.trim(), password: $("#pw").value }).then(function (r) {
      if (r.error) return say($("#lm"), trad(r.error), true);
      start();
    });
  });
  $("#reg").addEventListener("click", function () {
    if (!$("#em").value.trim() || $("#pw").value.length < 8) return say($("#lm"), "Preencha o e-mail e uma senha de pelo menos 8 caracteres.", true);
    sb.auth.signUp({ email: $("#em").value.trim(), password: $("#pw").value }).then(function (r) {
      if (r.error) return say($("#lm"), trad(r.error), true);
      say($("#lm"), "Acesso criado. Confirme o e-mail (link enviado pelo Supabase) e avise quem mantém o site para liberar o painel.");
    });
  });
  $("#out").addEventListener("click", function () { sb.auth.signOut().then(function () { location.reload(); }); });

  function start() {
    sb.auth.getSession().catch(function () { return { data: { session: null } }; }).then(function (r) {
      if (!r.data.session) { show("#login", true); show("#app", false); show("#out", false); return; }
      show("#login", false); show("#app", true); show("#out", true);
      $("#nf").innerHTML = '<option value="">Escolha…</option>' + FAMS.map(function (f) { return '<option value="' + f.id + '">' + esc(f.nome) + "</option>"; }).join("");
      load();
    });
  }
  function load() {
    sb.from("itens").select("*").then(function (r) {
      if (r.error) return gsay(trad(r.error), true);
      rows = {}; r.data.forEach(function (x) { rows[x.codigo] = x; });
      render();
    });
  }

  /* ---------- lista ---------- */
  function all() {
    var out = C.itens.map(function (i) {
      var r = rows[i.c] || {};
      return { c: i.c, n: i.n, f: i.f, g: famG[i.f], s: i.s || "", u: i.u, st: r.status || "disponivel", foto: r.foto || (i.p ? "../img/" + i.p[0] : ""), novo: false };
    });
    Object.keys(rows).forEach(function (k) {
      var r = rows[k]; if (r.novo) out.push({ c: r.codigo, n: r.nome, f: r.familia, g: famG[r.familia], s: "", u: r.unidade, st: r.status, foto: r.foto || "", novo: true });
    });
    return out;
  }
  function subKey(i, g) { return g.by === "f" ? i.f : (i.s || "Outros"); }
  function render() {
    var terms = nz(q).split(" ").filter(Boolean), num = /^\d+$/.test(nz(q));
    var everything = all(), G = GROUPS.filter(function (g) { return g.id === cat; })[0];
    var list = everything.filter(function (i) {
      if (cat && i.g !== cat) return false;
      if (sub && G && subKey(i, G) !== sub) return false;
      if (!vis[i.st]) return false;
      if (onlyNew && !i.novo) return false;
      if (!terms.length) return true;
      if (num) return String(i.c).indexOf(terms[0]) === 0;
      var k = nz(i.n + " " + i.c + " " + (FAMN[i.f] || ""));
      return terms.every(function (t) { return k.indexOf(t) > -1; });
    });
    $("#cats").innerHTML = [{ id: "", nome: "Todas", n: everything.length }].concat(GROUPS.map(function (g) { return { id: g.id, nome: g.nome, n: everything.filter(function (i) { return i.g === g.id; }).length }; }))
      .map(function (g) { return '<button class="tab" type="button" role="tab" data-cat="' + g.id + '" aria-selected="' + (cat === g.id) + '">' + esc(g.nome) + "<small>" + g.n + "</small></button>"; }).join("");
    if (G && G.by) {
      var cnt = {}, ord = [];
      everything.filter(function (i) { return i.g === G.id; }).forEach(function (i) { var k = subKey(i, G); if (!cnt[k]) { cnt[k] = 0; ord.push(k); } cnt[k]++; });
      if (G.by === "f") ord.sort(function (x, y) { return G.fams.indexOf(x) - G.fams.indexOf(y); });
      else ord.sort(function (x, y) { return x === "Outros" ? 1 : y === "Outros" ? -1 : cnt[y] - cnt[x]; });
      $("#subs").innerHTML = [["", "Todos", cnt && Object.keys(cnt).reduce(function (s, k) { return s + cnt[k]; }, 0)]].concat(ord.map(function (k) { return [k, G.by === "f" ? FAMN[k] : k, cnt[k]]; }))
        .map(function (x) { return '<button class="tab" type="button" data-sub="' + esc(x[0]) + '" aria-selected="' + (sub === x[0]) + '">' + esc(x[1]) + "<small>" + x[2] + "</small></button>"; }).join("");
      $("#subs").hidden = false;
    } else { $("#subs").hidden = true; }
    var all_ = everything, c = function (f) { return all_.filter(f).length; };
    var cs = function (st) { return everything.filter(function (i) { return i.st === st; }).length; };
    $("#flt").innerHTML = [["disponivel", "Disponíveis", cs("disponivel")], ["sob_consulta", "Sob consulta", cs("sob_consulta")], ["oculto", "Ocultos", cs("oculto")]]
      .map(function (x) { return '<button class="chip" type="button" data-vis="' + x[0] + '" aria-pressed="' + vis[x[0]] + '">' + (vis[x[0]] ? "✓ " : "") + x[1] + " " + x[2] + "</button>"; }).join("") +
      '<button class="chip" type="button" data-new="1" aria-pressed="' + onlyNew + '">Só itens novos ' + everything.filter(function (i) { return i.novo; }).length + "</button>";
    $("#cnt").textContent = list.length + (list.length === 1 ? " item" : " itens");
    $("#list").innerHTML = list.slice(0, shown).map(function (i) {
      return '<div class="it" data-c="' + i.c + '"><div class="th">' + (i.foto ? '<img src="' + esc(i.foto) + '" alt="" loading="lazy">' : "sem foto") + "</div><div>" +
        "<b>" + esc(i.n) + "</b><small>cód. " + i.c + " · " + esc(FAMN[i.f] || "") + (i.novo ? " · novo" : "") + "</small>" +
        '<div class="seg" role="group" aria-label="Situação">' + STATUS.map(function (s) { return '<button type="button" class="s-' + s[0] + '" data-st="' + s[0] + '" aria-pressed="' + (i.st === s[0]) + '">' + s[1] + "</button>"; }).join("") + "</div>" +
        '<div class="row2"><button type="button" class="btn btn-line btn-sm" data-ph="1">' + (i.foto ? "Trocar foto" : "Tirar foto") + "</button>" +
        (i.novo ? '<button type="button" class="btn btn-line btn-sm" data-del="1">Excluir item</button>' : "") + "</div></div></div>";
    }).join("");
    $("#more").hidden = list.length <= shown;
  }
  $("#q").addEventListener("input", function () { q = this.value; shown = 40; render(); });
  $("#more").addEventListener("click", function () { shown += 60; render(); });
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    var tc = t.closest("[data-cat]"); if (tc) { cat = tc.getAttribute("data-cat"); sub = ""; shown = 40; render(); return; }
    var ts = t.closest("[data-sub]"); if (ts) { sub = ts.getAttribute("data-sub"); shown = 40; render(); return; }
    var tv = t.closest("[data-vis]"); if (tv) { var k = tv.getAttribute("data-vis"); vis[k] = !vis[k]; shown = 40; render(); return; }
    if (t.closest("[data-new]")) { onlyNew = !onlyNew; shown = 40; render(); return; }
    var it = t.closest(".it"); if (!it) return;
    var code = +it.getAttribute("data-c");
    var st = t.closest("[data-st]");
    if (st) return setStatus(code, st.getAttribute("data-st"));
    if (t.closest("[data-ph]")) { pendingCode = code; $("#pf").value = ""; $("#pf").click(); return; }
    if (t.closest("[data-del]")) {
      if (!confirm("Excluir este item novo do site?")) return;
      sb.from("itens").delete().eq("codigo", code).then(function (r) { if (r.error) return gsay(trad(r.error), true); delete rows[code]; render(); gsay("Item excluído."); });
    }
  });

  function setStatus(code, st) {
    var prev = rows[code] ? rows[code].status : "disponivel";
    rows[code] = Object.assign({ codigo: code }, rows[code], { status: st }); render();
    sb.from("itens").upsert({ codigo: code, status: st }, { onConflict: "codigo" }).then(function (r) {
      if (r.error) { rows[code].status = prev; render(); return gsay(trad(r.error), true); }
      gsay("Salvo. Aparece no site em instantes.");
    });
  }

  /* ---------- foto: reduz no aparelho (640 px, WebP) e envia ---------- */
  function shrink(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var w = Math.min(640, im.naturalWidth), h = Math.round(im.naturalHeight * w / im.naturalWidth);
        var cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d").drawImage(im, 0, 0, w, h);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) {
          if (b && b.type === "image/webp") return res(b);
          cv.toBlob(function (j) { if (j) res(j); else rej(new Error("Não foi possível processar a foto.")); }, "image/jpeg", 0.82); // iPhone/Safari não gera WebP
        }, "image/webp", 0.78);
      };
      im.onerror = function () { rej(new Error("Não foi possível abrir a foto. Tente tirar outra.")); }; im.src = url;
    });
  }
  function upload(code, file) {
    return shrink(file).then(function (blob) {
      var path = code + "-" + Date.now() + (blob.type === "image/webp" ? ".webp" : ".jpg");
      return sb.storage.from("fotos").upload(path, blob, { contentType: blob.type, upsert: false }).then(function (r) {
        if (r.error) throw r.error;
        return sb.storage.from("fotos").getPublicUrl(path).data.publicUrl;
      });
    });
  }
  $("#pf").addEventListener("change", function () {
    var f = this.files[0]; if (!f || !pendingCode) return; var code = pendingCode; pendingCode = null;
    gsay("Enviando foto…");
    upload(code, f).then(function (url) {
      return sb.from("itens").upsert({ codigo: code, foto: url }, { onConflict: "codigo" }).then(function (r) {
        if (r.error) throw r.error; rows[code] = Object.assign({ codigo: code, status: "disponivel" }, rows[code], { foto: url }); render(); gsay("Foto salva.");
      });
    }).catch(function (e) { gsay(trad(e), true); });
  });

  /* ---------- item novo ---------- */
  $("#novo").addEventListener("click", function () { show("#fn", true); $("#novo").hidden = true; $("#nc").focus(); });
  $("#ncancel").addEventListener("click", function () { $("#fn").reset(); $("#npv").hidden = true; show("#fn", false); $("#novo").hidden = false; });
  $("#np").addEventListener("change", function () {
    var f = this.files[0]; if (!f) { $("#npv").hidden = true; return; }
    $("#npv").src = URL.createObjectURL(f); $("#npv").hidden = false;
  });
  $("#fn").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var code = parseInt($("#nc").value, 10), nome = $("#nn").value.trim();
    if (!code || !nome || !$("#nf").value) return gsay("Preencha código, nome e categoria.", true);
    if (BASE[code] || rows[code]) return gsay("Já existe um item com o código " + code + ".", true);
    var btn = this.querySelector("[type=submit]"); btn.disabled = true; gsay("Salvando…");
    var f = $("#np").files[0];
    (f ? upload(code, f) : Promise.resolve(null)).then(function (url) {
      var row = { codigo: code, nome: nome, familia: $("#nf").value, unidade: $("#nu").value, status: $("#ns").value, foto: url, novo: true };
      return sb.from("itens").insert(row).then(function (r) {
        if (r.error) throw r.error; rows[code] = row; onlyNew = true; cat = ""; sub = ""; render();
        $("#fn").reset(); $("#npv").hidden = true; show("#fn", false); $("#novo").hidden = false; gsay("Item cadastrado. Já aparece no site.");
      });
    }).catch(function (e) { gsay(trad(e), true); }).then(function () { btn.disabled = false; });
  });

  start();
})();
