(function () {
  "use strict";

  const DEBUG = false;

  var DATA_URL = "data/leerstände.json";

  var STATUS_ANZEIGE = {
    leer: "Komplett leer",
    teilweise: "Teilweise leer",
    sanierung: "In Sanierung",
  };

  var items = [];

  var lastCsvPreviewRows = null;

  var NOMINATIM_MS = 1000;

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  /**
   * OpenStreetMap Nominatim. Fair-Use: nicht schneller als 1 Anfrage pro Sekunde (CSV).
   * @param {string} adresse
   * @param {string} ort
   * @returns {Promise<{ ok: true, lat: number, lng: number } | { ok: false, error: 'network' | 'not_found' }>}
   */
  function geocodeAdresse(adresse, ort) {
    var a = adresse == null ? "" : String(adresse).trim();
    var o = ort == null ? "" : String(ort).trim();
    var q = [a, o, "Deutschland"].filter(function (p) {
      return p !== "";
    }).join(" ");
    if (!q.replace(/Deutschland/g, "").trim()) {
      return Promise.resolve({ ok: false, error: "not_found" });
    }
    var url =
      "https://nominatim.openstreetmap.org/search?format=json&q=" +
      encodeURIComponent(q);
    return fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Language": "de",
        /* User-Agent: Browser erlaubt setzbare User-Agent-Header meist nicht; siehe docs/ADR/ADR-006-geocoding.md */
      },
    })
      .then(function (r) {
        if (!r.ok) return { ok: false, error: "network" };
        return r.json().then(function (arr) {
          if (!Array.isArray(arr) || arr.length === 0)
            return { ok: false, error: "not_found" };
          var first = arr[0];
          var lat = parseFloat(first.lat);
          var lon = parseFloat(first.lon);
          if (Number.isNaN(lat) || Number.isNaN(lon))
            return { ok: false, error: "not_found" };
          return { ok: true, lat: lat, lng: lon };
        });
      })
      .catch(function (err) {
        if (DEBUG) console.error(err);
        return { ok: false, error: "network" };
      });
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function formatCoordDe(n) {
    return n.toFixed(6).replace(".", ",");
  }

  function clearGeocodeHighlight() {
    ["neu-lat", "neu-lng"].forEach(function (id) {
      var el = $(id);
      if (el) el.classList.remove("field-geocoded");
    });
  }

  function showGeocodeStatus(text) {
    var el = $("geocode-status");
    if (!el) return;
    if (!text) {
      el.textContent = "";
      el.classList.add("is-hidden");
      return;
    }
    el.textContent = text;
    el.classList.remove("is-hidden");
  }

  function uniqueStadtteile(list) {
    var set = {};
    list.forEach(function (row) {
      var s = row.stadtteil;
      if (s != null && String(s).trim() !== "") set[String(s).trim()] = true;
    });
    return Object.keys(set).sort(function (a, b) {
      return a.localeCompare(b, "de");
    });
  }

  function fillStadtteilSelect() {
    var sel = $("neu-stadtteil");
    if (!sel) return;
    var current = sel.value;
    var opts = uniqueStadtteile(items);
    sel.innerHTML = '<option value="">Bitte wählen</option>';
    opts.forEach(function (name) {
      var o = document.createElement("option");
      o.value = name;
      o.textContent = name;
      sel.appendChild(o);
    });
    if (opts.indexOf(current) !== -1) sel.value = current;
  }

  function showFieldError(id, message) {
    var el = $(id);
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.classList.remove("is-hidden");
    } else {
      el.textContent = "";
      el.classList.add("is-hidden");
    }
  }

  function clearValidationFieldErrors() {
    [
      "err-neu-adresse",
      "err-neu-ort",
      "err-neu-stadtteil",
      "err-neu-status",
      "err-neu-we",
      "err-neu-leer-seit",
      "err-neu-lat",
      "err-neu-lng",
      "err-neu-notiz",
    ].forEach(function (id) {
      showFieldError(id, "");
    });
  }

  function parseKoordinate(raw) {
    if (raw == null || String(raw).trim() === "") return null;
    var s = String(raw).trim().replace(",", ".");
    var n = parseFloat(s);
    if (Number.isNaN(n)) return NaN;
    return n;
  }

  function validateNeuForm() {
    clearValidationFieldErrors();
    var ok = true;

    var adresse = ($("neu-adresse").value || "").trim();
    if (!adresse) {
      showFieldError("err-neu-adresse", "Bitte geben Sie eine Adresse ein.");
      ok = false;
    }

    var ort = ($("neu-ort").value || "").trim();
    if (!ort) {
      showFieldError("err-neu-ort", "Bitte geben Sie einen Ort an.");
      ok = false;
    }

    var st = $("neu-stadtteil").value;
    if (!st) {
      showFieldError(
        "err-neu-stadtteil",
        "Bitte wählen Sie einen Stadtteil aus."
      );
      ok = false;
    }

    var status = $("neu-status").value;
    if (!status) {
      showFieldError("err-neu-status", "Bitte wählen Sie einen Status.");
      ok = false;
    }

    var weRaw = $("neu-we").value;
    var we = parseInt(weRaw, 10);
    if (weRaw === "" || weRaw === undefined) {
      showFieldError(
        "err-neu-we",
        "Bitte geben Sie die Anzahl der Wohneinheiten ein."
      );
      ok = false;
    } else if (Number.isNaN(we) || we < 1) {
      showFieldError(
        "err-neu-we",
        "Bitte eine gültige Zahl ab 1 eingeben."
      );
      ok = false;
    }

    var leerSeit = ($("neu-leer-seit").value || "").trim();
    if (leerSeit && !/^\d{4}-\d{2}$/.test(leerSeit)) {
      showFieldError(
        "err-neu-leer-seit",
        "Format wie 2024-03 (Jahr und Monat mit Bindestrich)."
      );
      ok = false;
    }

    var latS = ($("neu-lat").value || "").trim();
    var lngS = ($("neu-lng").value || "").trim();
    if (latS) {
      var lat = parseKoordinate(latS);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        showFieldError("err-neu-lat", "Bitte einen gültigen Breitengrad eingeben.");
        ok = false;
      }
    }
    if (lngS) {
      var lng = parseKoordinate(lngS);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        showFieldError("err-neu-lng", "Bitte einen gültigen Längengrad eingeben.");
        ok = false;
      }
    }

    return ok;
  }

  function nextId() {
    var m = 0;
    items.forEach(function (it) {
      var id = parseInt(it.id, 10);
      if (!Number.isNaN(id) && id > m) m = id;
    });
    return m + 1;
  }

  function buildPreviewObject() {
    var latS = ($("neu-lat").value || "").trim();
    var lngS = ($("neu-lng").value || "").trim();
    var o = {
      id: nextId(),
      adresse: ($("neu-adresse").value || "").trim(),
      ort: ($("neu-ort").value || "").trim(),
      stadtteil: $("neu-stadtteil").value,
      status: $("neu-status").value,
      wohneinheiten: parseInt($("neu-we").value, 10),
      leer_seit: ($("neu-leer-seit").value || "").trim() || undefined,
      notiz: ($("neu-notiz").value || "").trim() || undefined,
    };
    if (latS) o.lat = parseKoordinate(latS);
    if (lngS) o.lng = parseKoordinate(lngS);
    Object.keys(o).forEach(function (k) {
      if (o[k] === undefined) delete o[k];
    });
    return o;
  }

  function renderUebersicht() {
    var tbody = $("tbody-uebersicht");
    var empty = $("empty-uebersicht");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!items.length) {
      empty.classList.remove("is-hidden");
      return;
    }
    empty.classList.add("is-hidden");

    items.forEach(function (row) {
      var st = row.status;
      var label = STATUS_ANZEIGE[st] || st;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        escapeHtml(row.adresse) +
        "</td><td>" +
        escapeHtml(row.stadtteil || "–") +
        "</td><td>" +
        escapeHtml(label) +
        "</td><td>" +
        escapeHtml(row.wohneinheiten) +
        "</td><td>" +
        escapeHtml(row.leer_seit || "–") +
        "</td>";
      tbody.appendChild(tr);
    });
  }

  function loadData() {
    var errBox = $("load-error");
    return fetch(DATA_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("Datei konnte nicht geladen werden.");
        return r.json();
      })
      .then(function (data) {
        items = Array.isArray(data) ? data : data.entries || [];
        if (errBox) {
          errBox.classList.add("is-hidden");
          errBox.textContent = "";
        }
        renderUebersicht();
        fillStadtteilSelect();
      })
      .catch(function (e) {
        items = [];
        renderUebersicht();
        if (errBox) {
          errBox.textContent =
            "Die Daten konnten nicht geladen werden: " +
            (e.message || "Unbekannter Fehler") +
            " · Bitte Seite über einen kleinen Webserver öffnen (siehe Anleitung).";
          errBox.classList.remove("is-hidden");
        }
      });
  }

  function setTab(name) {
    var tabs = document.querySelectorAll(".tabs__btn");
    var panels = document.querySelectorAll(".panel");

    tabs.forEach(function (btn) {
      var t = btn.getAttribute("data-tab");
      var active = t === name;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.tabIndex = active ? 0 : -1;
    });

    panels.forEach(function (p) {
      var id = p.id;
      var visible =
        (name === "uebersicht" && id === "panel-uebersicht") ||
        (name === "neu" && id === "panel-neu") ||
        (name === "csv" && id === "panel-csv");
      p.classList.toggle("is-visible", visible);
      p.hidden = !visible;
    });

    if (name === "neu") {
      var sb = $("save-success-banner");
      if (sb) sb.classList.add("is-hidden");
    }
  }

  document.querySelectorAll(".tabs__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTab(btn.getAttribute("data-tab"));
    });
  });

  ["neu-lat", "neu-lng"].forEach(function (id) {
    var el = $(id);
    if (el) {
      el.addEventListener("input", function () {
        el.classList.remove("field-geocoded");
      });
    }
  });

  var btnGeocode = $("btn-geocode");
  if (btnGeocode) {
    btnGeocode.addEventListener("click", function () {
      var adresse = ($("neu-adresse").value || "").trim();
      var ort = ($("neu-ort").value || "").trim();
      showGeocodeStatus("");
      clearGeocodeHighlight();
      if (!adresse) {
        showGeocodeStatus("Bitte zuerst eine Adresse eintragen.");
        return;
      }
      if (!ort) {
        showGeocodeStatus("Bitte zuerst einen Ort eintragen.");
        return;
      }
      btnGeocode.disabled = true;
      geocodeAdresse(adresse, ort).then(function (res) {
        btnGeocode.disabled = false;
        if (res.ok) {
          $("neu-lat").value = formatCoordDe(res.lat);
          $("neu-lng").value = formatCoordDe(res.lng);
          $("neu-lat").classList.add("field-geocoded");
          $("neu-lng").classList.add("field-geocoded");
          showGeocodeStatus("");
        } else if (res.error === "network") {
          showGeocodeStatus(
            "Verbindungsfehler – bitte Internetverbindung prüfen."
          );
        } else {
          showGeocodeStatus(
            "Adresse nicht gefunden – bitte Koordinaten manuell prüfen."
          );
        }
      });
    });
  }

  function setSaveButtonEnabled(on) {
    var b = $("btn-save-neu");
    if (!b) return;
    b.disabled = !on;
    b.setAttribute("aria-disabled", on ? "false" : "true");
  }

  function resetNeuForm() {
    var form = $("form-neu");
    if (form) form.reset();
    $("neu-result").classList.add("is-hidden");
    setSaveButtonEnabled(false);
    showGeocodeStatus("");
    clearGeocodeHighlight();
    fillStadtteilSelect();
  }

  function runPreview() {
    if (!validateNeuForm()) {
      $("neu-result").classList.add("is-hidden");
      setSaveButtonEnabled(false);
      return;
    }
    var obj = buildPreviewObject();
    $("neu-json").textContent = JSON.stringify(obj, null, 2);
    $("neu-result").classList.remove("is-hidden");
    $("neu-result").scrollIntoView({ behavior: "smooth", block: "nearest" });
    setSaveButtonEnabled(true);
  }

  function saveNeuEntry() {
    if (!validateNeuForm()) {
      $("neu-result").classList.add("is-hidden");
      setSaveButtonEnabled(false);
      return;
    }
    var obj = buildPreviewObject();
    var copy = JSON.parse(JSON.stringify(obj));
    items.unshift(copy);
    renderUebersicht();
    fillStadtteilSelect();

    var banner = $("save-success-banner");
    if (banner) {
      banner.textContent =
        "✓ Eintrag gespeichert – erscheint jetzt in der Übersicht";
      banner.classList.remove("is-hidden");
    }

    resetNeuForm();
    setTab("uebersicht");
    if (banner) {
      banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  $("btn-preview").addEventListener("click", runPreview);

  $("btn-save-neu").addEventListener("click", saveNeuEntry);

  $("form-neu").addEventListener("submit", function (ev) {
    ev.preventDefault();
    runPreview();
  });

  function parseDelimitedLine(line, delim) {
    var result = [];
    var cur = "";
    var i = 0;
    var inQ = false;
    while (i < line.length) {
      var c = line[i];
      if (c === '"') {
        inQ = !inQ;
        i++;
        continue;
      }
      if (!inQ && c === delim) {
        result.push(cur);
        cur = "";
        i++;
        continue;
      }
      cur += c;
      i++;
    }
    result.push(cur);
    return result.map(function (s) {
      return String(s).trim().replace(/^"|"$/g, "");
    });
  }

  function detectDelimiter(headerLine) {
    var semi = (headerLine.match(/;/g) || []).length;
    var comma = (headerLine.match(/,/g) || []).length;
    return semi >= comma ? ";" : ",";
  }

  function normalizeStatusCsv(s) {
    var t = String(s || "")
      .trim()
      .toLowerCase();
    if (t === "leer" || t === "komplett leer") return "leer";
    if (t === "teilweise" || t === "teilweise leer") return "teilweise";
    if (t === "sanierung" || t === "in sanierung") return "sanierung";
    return null;
  }

  function parseCsvText(text) {
    var lines = text.split(/\r?\n/).filter(function (l) {
      return l.trim() !== "";
    });
    if (lines.length < 2) {
      return { error: "Mindestens eine Überschriftenzeile und eine Datenzeile nötig." };
    }
    var delim = detectDelimiter(lines[0]);
    var headers = parseDelimitedLine(lines[0], delim).map(function (h) {
      return h.trim().toLowerCase();
    });

    var rows = [];
    for (var r = 1; r < lines.length; r++) {
      var cells = parseDelimitedLine(lines[r], delim);
      var obj = {};
      headers.forEach(function (h, idx) {
        obj[h] = cells[idx] != null ? cells[idx] : "";
      });
      rows.push({ line: r + 1, obj: obj, raw: lines[r] });
    }
    return { headers: headers, rows: rows };
  }

  function validateCsvRow(obj) {
    var msgs = [];
    var adresse = (obj.adresse || "").trim();
    if (!adresse) msgs.push("Adresse fehlt");
    var st = normalizeStatusCsv(obj.status);
    if (!st) msgs.push("Status unbekannt oder leer");
    var we = parseInt(obj.wohneinheiten, 10);
    if (
      obj.wohneinheiten === "" ||
      obj.wohneinheiten === undefined ||
      Number.isNaN(we) ||
      we < 1
    )
      msgs.push("Wohneinheiten fehlen oder ungültig");
    return { statusNorm: st, msgs: msgs };
  }

  function csvLatLngMissing(obj) {
    var lat = String(obj.lat != null ? obj.lat : "").trim();
    var lng = String(obj.lng != null ? obj.lng : "").trim();
    return lat === "" || lng === "";
  }

  function csvRowBad(r) {
    var check = validateCsvRow(r.obj);
    var nominatimBad =
      r.nominatimNote &&
      (r.nominatimNote.indexOf("nicht gefunden") !== -1 ||
        r.nominatimNote.indexOf("Verbindungsfehler") !== -1);
    var missingAdrCoord =
      r.nominatimNote &&
      r.nominatimNote.indexOf("Keine Adresse") !== -1;
    return (
      check.msgs.length > 0 || nominatimBad || missingAdrCoord
    );
  }

  function setCsvImportButtonEnabled(on) {
    var b = $("btn-csv-import-all");
    if (!b) return;
    b.disabled = !on;
    b.setAttribute("aria-disabled", on ? "false" : "true");
  }

  /**
   * CSV-Zeile nach Vorschau in das gleiche Format wie `leerstände.json`/`items`.
   * @param {object} o Rohobjekt aus CSV
   * @param {number} id
   */
  function buildItemFromCsvRow(o, id) {
    var check = validateCsvRow(o);
    if (!check.statusNorm) return null;
    var lat = parseKoordinate(o.lat);
    var lng = parseKoordinate(o.lng);
    if (
      lat == null ||
      lng == null ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return null;
    }
    var item = {
      id: id,
      adresse: (o.adresse || "").trim(),
      ort:
        o.ort != null && String(o.ort).trim() !== ""
          ? String(o.ort).trim()
          : "Schwäbisch Gmünd",
      stadtteil: (o.stadtteil || "").trim(),
      status: check.statusNorm,
      wohneinheiten: parseInt(o.wohneinheiten, 10),
      lat: lat,
      lng: lng,
    };
    var ls = (o.leer_seit || "").trim();
    if (ls) item.leer_seit = ls;
    var nz = (o.notiz || "").trim();
    if (nz) item.notiz = nz;
    return item;
  }

  function clearCsvPreviewAfterImport() {
    var cr = $("csv-result");
    if (cr) cr.classList.add("is-hidden");
    var sum = $("csv-summary");
    if (sum) sum.textContent = "";
    var tb = $("tbody-csv");
    if (tb) tb.innerHTML = "";
    var fi = $("csv-file");
    if (fi) fi.value = "";
    var ta = $("csv-text");
    if (ta) ta.value = "";
    lastCsvPreviewRows = null;
    setCsvImportButtonEnabled(false);
  }

  /**
   * @param {Array<{ line: number, obj: object }>} rows
   */
  async function applyCsvGeocoding(rows) {
    var needIndices = [];
    rows.forEach(function (r, idx) {
      if (csvLatLngMissing(r.obj)) {
        var adr = (r.obj.adresse || "").trim();
        if (adr) needIndices.push(idx);
        r.nominatimNote = adr
          ? null
          : "Keine Adresse für Nominatim · Koordinaten fehlen";
      }
    });

    var geoRequests = 0;
    for (var k = 0; k < needIndices.length; k++) {
      var idx = needIndices[k];
      var row = rows[idx];
      if (geoRequests > 0) {
        await sleep(NOMINATIM_MS);
      }
      geoRequests++;
      var ort =
        (row.obj.ort != null && String(row.obj.ort).trim() !== ""
          ? String(row.obj.ort).trim()
          : "Schwäbisch Gmünd");
      var res = await geocodeAdresse(row.obj.adresse, ort);
      if (res.ok) {
        row.obj.lat = formatCoordDe(res.lat);
        row.obj.lng = formatCoordDe(res.lng);
        row.nominatimNote = "Koordinaten per Nominatim ergänzt";
      } else if (res.error === "network") {
        row.nominatimNote =
          "Verbindungsfehler – bitte Internetverbindung prüfen.";
      } else {
        row.nominatimNote =
          "Adresse nicht gefunden – bitte Koordinaten manuell prüfen (Nominatim)";
      }
    }
  }

  function renderCsvPreview(parsed, nominatimCount) {
    var ok = 0;
    var bad = 0;
    var tbody = $("tbody-csv");
    tbody.innerHTML = "";

    parsed.rows.forEach(function (r) {
      var o = r.obj;
      var check = validateCsvRow(o);
      var adresse = (o.adresse || "").trim() || "–";
      var stLabel = check.statusNorm
        ? STATUS_ANZEIGE[check.statusNorm]
        : "–";
      var hinweis =
        check.msgs.length === 0
          ? "Sieht gut aus"
          : check.msgs.join(" · ");
      if (r.nominatimNote) {
        hinweis += (hinweis ? " · " : "") + r.nominatimNote;
      }
      var rowBad = csvRowBad(r);
      if (!rowBad) ok++;
      else bad++;

      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        r.line +
        "</td><td>" +
        escapeHtml(adresse) +
        "</td><td>" +
        escapeHtml(stLabel) +
        '</td><td class="' +
        (rowBad ? "cell-bad" : "cell-ok") +
        '">' +
        escapeHtml(hinweis) +
        "</td>";
      tbody.appendChild(tr);
    });

    var extra = "";
    if (nominatimCount > 0) {
      extra =
        " Es wurden <strong>" +
        nominatimCount +
        "</strong> Anfragen an Nominatim gesendet (max. 1 pro Sekunde).";
    }

    $("csv-summary").innerHTML =
      "Es wurden <strong>" +
      parsed.rows.length +
      "</strong> Zeilen gelesen. " +
      "<span class='cell-ok'>" +
      ok +
      " ohne Beanstandung (Pflichtfelder)</span>, " +
      "<span class='cell-bad'>" +
      bad +
      " mit Hinweisen</span>. Nichts wurde gespeichert." +
      extra;

    $("csv-result").classList.remove("is-hidden");
    $("csv-result").scrollIntoView({ behavior: "smooth", block: "nearest" });

    lastCsvPreviewRows = parsed.rows;
    setCsvImportButtonEnabled(ok > 0);
  }

  async function runParseAsync(content) {
    var parsed = parseCsvText(content);
    if (parsed.error) {
      $("csv-summary").innerHTML =
        '<span class="cell-bad">' + escapeHtml(parsed.error) + "</span>";
      $("csv-result").classList.remove("is-hidden");
      $("tbody-csv").innerHTML = "";
      lastCsvPreviewRows = null;
      setCsvImportButtonEnabled(false);
      return;
    }

    lastCsvPreviewRows = null;
    setCsvImportButtonEnabled(false);

    var needGeo = 0;
    parsed.rows.forEach(function (r) {
      if (csvLatLngMissing(r.obj) && (r.obj.adresse || "").trim()) needGeo++;
    });

    if (needGeo > 0) {
      $("csv-summary").innerHTML =
        "Koordinaten werden abgerufen (<strong>OpenStreetMap Nominatim</strong>) … " +
        needGeo +
        " Adresse(n), bitte kurz warten.";
      $("csv-result").classList.remove("is-hidden");
      $("tbody-csv").innerHTML = "";
    }

    await applyCsvGeocoding(parsed.rows);
    renderCsvPreview(parsed, needGeo);
  }

  $("btn-csv-parse").addEventListener("click", function () {
    var fileInput = $("csv-file");
    var textArea = $("csv-text");
    var text = (textArea.value || "").trim();
    var f = fileInput.files && fileInput.files[0];

    if (f) {
      var reader = new FileReader();
      reader.onload = function () {
        runParseAsync(String(reader.result || "")).catch(function (e) {
          if (DEBUG) console.error(e);
          lastCsvPreviewRows = null;
          setCsvImportButtonEnabled(false);
          $("csv-summary").innerHTML =
            '<span class="cell-bad">' +
            escapeHtml(e.message || "Unbekannter Fehler beim Einlesen.") +
            "</span>";
          $("csv-result").classList.remove("is-hidden");
        });
      };
      reader.onerror = function () {
        $("csv-summary").textContent = "Die Datei konnte nicht gelesen werden.";
        $("csv-result").classList.remove("is-hidden");
        lastCsvPreviewRows = null;
        setCsvImportButtonEnabled(false);
      };
      reader.readAsText(f, "UTF-8");
      return;
    }

    if (!text) {
      $("csv-summary").innerHTML =
        '<span class="cell-bad">Bitte eine Datei wählen oder Text einfügen.</span>';
      $("csv-result").classList.remove("is-hidden");
      $("tbody-csv").innerHTML = "";
      lastCsvPreviewRows = null;
      setCsvImportButtonEnabled(false);
      return;
    }

    runParseAsync(text).catch(function (e) {
      if (DEBUG) console.error(e);
      lastCsvPreviewRows = null;
      setCsvImportButtonEnabled(false);
      $("csv-summary").innerHTML =
        '<span class="cell-bad">' +
        escapeHtml(e.message || "Unbekannter Fehler.") +
        "</span>";
      $("csv-result").classList.remove("is-hidden");
    });
  });

  $("btn-csv-import-all").addEventListener("click", function () {
    if (!lastCsvPreviewRows || !lastCsvPreviewRows.length) return;
    var valid = [];
    lastCsvPreviewRows.forEach(function (r) {
      if (!csvRowBad(r)) valid.push(r);
    });
    if (!valid.length) return;
    var nid = nextId();
    var n = valid.length;
    for (var i = n - 1; i >= 0; i--) {
      var item = buildItemFromCsvRow(valid[i].obj, nid + i);
      if (item) items.unshift(item);
    }
    renderUebersicht();
    fillStadtteilSelect();
    var banner = $("save-success-banner");
    if (banner) {
      banner.textContent =
        n +
        (n === 1 ? " Eintrag importiert" : " Einträge importiert") +
        ". Demo-Modus: Daten werden nach Seiten-Reload zurückgesetzt.";
      banner.classList.remove("is-hidden");
    }
    setTab("uebersicht");
    clearCsvPreviewAfterImport();
    if (banner) {
      banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  /* ——— Guided Tour (Neuer Eintrag) ——— */
  var TOUR_STEPS = [
    {
      selector: "#neu-adresse",
      title: "Adresse",
      body:
        "Die Straße und Hausnummer des leerstehenden Gebäudes.",
      example: "Marktplatz 4",
    },
    {
      selector: "#neu-ort",
      title: "Ort",
      body: "Die Stadt oder Gemeinde.",
      example: "Schwäbisch Gmünd",
    },
    {
      selector: "#neu-stadtteil",
      title: "Stadtteil",
      body: "Wähle den passenden Stadtteil aus der Liste.",
      example: "Innenstadt",
    },
    {
      selector: "#neu-status",
      title: "Status",
      body:
        "Wie stark steht das Gebäude leer? Komplett leer = niemand wohnt mehr drin. Teilweise leer = einzelne Wohnungen sind frei. In Sanierung = wird gerade renoviert.",
      example: null,
    },
    {
      selector: "#neu-we",
      title: "Wohneinheiten",
      body: "Wie viele Wohnungen hat das Gebäude insgesamt?",
      example: "4",
    },
    {
      selector: "#neu-leer-seit",
      title: "Leer seit",
      body:
        "Seit wann steht das Gebäude leer? Ungefähres Datum reicht.",
      example: "März 2022",
    },
    {
      selector: "#neu-notiz",
      title: "Notiz",
      body:
        "Optional: Zusätzliche Infos, z. B. Eigentümer bekannt, Zustand des Gebäudes, Quellen.",
      example:
        "Eigentümer unbekannt, Fenster im EG eingeschlagen",
    },
    {
      selector: "#btn-geocode",
      title: "Koordinaten ermitteln",
      body:
        "Klicke diesen Button damit die App die genaue Position des Gebäudes automatisch auf der Karte findet. Du musst nichts weiter tun.",
      example: null,
    },
  ];

  var tourState = {
    active: false,
    stepIndex: 0,
    tooltip: null,
    onResize: null,
  };

  function ensureTourElements() {
    if (tourState.tooltip) return;

    var tooltip = document.createElement("aside");
    tooltip.id = "tour-tooltip";
    tooltip.className = "tour-tooltip is-hidden";
    tooltip.setAttribute("role", "dialog");
    tooltip.setAttribute("aria-modal", "true");
    tooltip.innerHTML =
      '<div class="tour-tooltip__inner">' +
      '<h3 class="tour-tooltip__title" id="tour-tooltip-heading"></h3>' +
      '<p class="tour-tooltip__body"></p>' +
      '<p class="tour-tooltip__example is-hidden"><strong>Beispiel:</strong> <span class="tour-tooltip__example-text"></span></p>' +
      '<div class="tour-tooltip__actions">' +
      '<button type="button" class="btn btn--primary" id="tour-btn-next" aria-label="Weiter zur nächsten Station der Anleitung">Weiter →</button>' +
      '<button type="button" class="btn tour-tooltip__btn-skip" id="tour-btn-end" aria-label="Tour beenden">Tour beenden</button>' +
      "</div></div>";

    document.body.appendChild(tooltip);

    tourState.tooltip = tooltip;

    $("tour-btn-next").addEventListener("click", function () {
      if (!tourState.active) return;
      if (tourState.stepIndex >= TOUR_STEPS.length - 1) {
        endTour();
        return;
      }
      tourState.stepIndex++;
      showTourStep();
    });

    $("tour-btn-end").addEventListener("click", endTour);
  }

  function positionTourTooltip(anchorEl) {
    var tooltip = tourState.tooltip;
    if (!tooltip || !anchorEl) return;

    tooltip.classList.remove("is-hidden");
    var margin = 12;
    var pad = 16;
    var maxW = Math.min(360, window.innerWidth - 2 * pad);

    tooltip.style.maxWidth = maxW + "px";
    tooltip.style.width = maxW + "px";

    var tr = anchorEl.getBoundingClientRect();
    var tw = tooltip.offsetWidth;
    var th = tooltip.offsetHeight;

    var top = tr.bottom + margin;
    if (top + th > window.innerHeight - pad) {
      top = tr.top - th - margin;
    }
    if (top < pad) top = pad;

    var left = tr.left + tr.width / 2 - tw / 2;
    if (left < pad) left = pad;
    if (left + tw > window.innerWidth - pad) {
      left = window.innerWidth - tw - pad;
    }

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  function clearTourHighlight() {
    document.querySelectorAll(".tour-highlight").forEach(function (el) {
      el.classList.remove("tour-highlight");
    });
  }

  function showTourStep() {
    ensureTourElements();
    clearTourHighlight();

    var step = TOUR_STEPS[tourState.stepIndex];
    if (!step) {
      endTour();
      return;
    }

    var el = document.querySelector(step.selector);
    if (!el) {
      endTour();
      return;
    }

    el.classList.add("tour-highlight");
    el.scrollIntoView({ block: "center", behavior: "smooth" });

    $("tour-tooltip-heading").textContent = step.title;
    var bodyP = tourState.tooltip.querySelector(".tour-tooltip__body");
    bodyP.textContent = step.body;

    var exBlock = tourState.tooltip.querySelector(".tour-tooltip__example");
    var exText = tourState.tooltip.querySelector(".tour-tooltip__example-text");
    if (step.example) {
      exBlock.classList.remove("is-hidden");
      exText.textContent = step.example;
    } else {
      exBlock.classList.add("is-hidden");
    }

    var nextBtn = $("tour-btn-next");
    if (tourState.stepIndex >= TOUR_STEPS.length - 1) {
      nextBtn.textContent = "Fertig ✓";
      nextBtn.setAttribute("aria-label", "Anleitung beenden");
    } else {
      nextBtn.textContent = "Weiter →";
      nextBtn.setAttribute(
        "aria-label",
        "Weiter zur nächsten Station der Anleitung"
      );
    }

    tourState.tooltip.setAttribute("aria-labelledby", "tour-tooltip-heading");

    requestAnimationFrame(function () {
      positionTourTooltip(el);
      setTimeout(function () {
        positionTourTooltip(el);
        var nb = $("tour-btn-next");
        if (nb) nb.focus({ preventScroll: true });
      }, 400);
    });
  }

  function onTourLayout() {
    if (!tourState.active) return;
    var step = TOUR_STEPS[tourState.stepIndex];
    if (!step) return;
    var el = document.querySelector(step.selector);
    if (el) positionTourTooltip(el);
  }

  function startTour() {
    ensureTourElements();
    var tabNeu = document.querySelector('.tabs__btn[data-tab="neu"]');
    if (tabNeu) tabNeu.click();

    tourState.active = true;
    tourState.stepIndex = 0;

    document.body.classList.add("tour-is-active");

    if (!tourState.onResize) {
      tourState.onResize = function () {
        onTourLayout();
      };
      window.addEventListener("resize", tourState.onResize);
      window.addEventListener("scroll", tourState.onResize, true);
    }

    showTourStep();

    document.addEventListener("keydown", tourEscapeHandler);
  }

  function tourEscapeHandler(ev) {
    if (ev.key === "Escape") endTour();
  }

  function endTour() {
    tourState.active = false;
    clearTourHighlight();

    document.removeEventListener("keydown", tourEscapeHandler);

    if (tourState.onResize) {
      window.removeEventListener("resize", tourState.onResize);
      window.removeEventListener("scroll", tourState.onResize, true);
      tourState.onResize = null;
    }

    document.body.classList.remove("tour-is-active");
    if (tourState.tooltip) tourState.tooltip.classList.add("is-hidden");
  }

  var btnTour = $("btn-tour-start");
  if (btnTour) {
    btnTour.addEventListener("click", startTour);
  }

  loadData();
})();
