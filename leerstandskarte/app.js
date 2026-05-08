(function () {
  "use strict";

  const DEBUG = false;

  var CENTER = [48.7994, 9.7978];
  var ZOOM = 14;

  var STATUS = {
    leer: { color: "#c62828", label: "Komplett leer" },
    teilweise: { color: "#ef6c00", label: "Teilweise leer" },
    sanierung: { color: "#1565c0", label: "In Sanierung" },
  };

  var map = L.map("map", { scrollWheelZoom: true }).setView(CENTER, ZOOM);

  var layerRuhig = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
    {
      subdomains: "abcd",
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    }
  );

  var layerBeschriftet = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    {
      subdomains: "abcd",
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    }
  );

  var layerOSM = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }
  );

  var baseLayers = {
    Ruhig: layerRuhig,
    Beschriftet: layerBeschriftet,
    Detailliert: layerOSM,
  };

  layerRuhig.addTo(map);

  L.control
    .layers(baseLayers, {}, { position: "topright" })
    .addTo(map);

  var selectStadtteil = document.getElementById("filter-stadtteil");

  var allItems = [];
  var layerById = {};
  var markersLayer = L.layerGroup().addTo(map);
  var activeListBtn = null;

  function statusKey(raw) {
    var s = String(raw || "").toLowerCase();
    if (s === "leer" || s === "teilweise" || s === "sanierung") return s;
    return "leer";
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  /**
   * Nur alphanumerische Zeichen und Bindestriche – sicher für data-entry-id / CSS-Selektor.
   */
  function isSafeEntryId(id) {
    return /^[0-9A-Za-z-]+$/.test(String(id));
  }

  function houseIconHtml(color) {
    var c = escapeHtml(color);
    return (
      '<div class="house-marker">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">' +
      "<path " +
      'fill="' +
      c +
      '" ' +
      'stroke="#ffffff" stroke-width="2" stroke-linejoin="round" ' +
      'd="M18 5 L31 17 L27 17 L27 30 L9 30 L9 17 L5 17 Z"/>' +
      '<rect x="13" y="22" width="10" height="8" rx="1" fill="#ffffff" fill-opacity="0.92"/>' +
      "</svg></div>"
    );
  }

  function makeHouseIcon(color) {
    return L.divIcon({
      className: "leaflet-div-icon marker-house-wrap",
      html: houseIconHtml(color),
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -34],
    });
  }

  function houseMarker(lat, lng, color) {
    return L.marker([lat, lng], {
      icon: makeHouseIcon(color),
      zIndexOffset: 650,
    });
  }

  function popupHtml(item) {
    var sk = statusKey(item.status);
    var st = STATUS[sk] || STATUS.leer;
    return (
      '<div class="popup-addr">' +
      escapeHtml(item.adresse) +
      ", " +
      escapeHtml(item.ort || "Schwäbisch Gmünd") +
      "</div>" +
      (item.stadtteil
        ? '<p class="popup-row"><strong>Stadtteil:</strong> ' +
          escapeHtml(item.stadtteil) +
          "</p>"
        : "") +
      '<p class="popup-row"><strong>Status:</strong> ' +
      escapeHtml(st.label) +
      "</p>" +
      '<p class="popup-row"><strong>Wohneinheiten:</strong> ' +
      escapeHtml(item.wohneinheiten) +
      "</p>" +
      (item.leer_seit
        ? '<p class="popup-row"><strong>Leer seit:</strong> ' +
          escapeHtml(item.leer_seit) +
          "</p>"
        : "") +
      (item.notiz
        ? '<p class="popup-row"><strong>Notiz:</strong> ' +
          escapeHtml(item.notiz) +
          "</p>"
        : "")
    );
  }

  function uniqueStadtteile(items) {
    var set = {};
    items.forEach(function (item) {
      var s = item.stadtteil;
      if (s != null && String(s).trim() !== "") set[String(s).trim()] = true;
    });
    return Object.keys(set).sort(function (a, b) {
      return a.localeCompare(b, "de");
    });
  }

  function fillStadtteilSelect(items) {
    if (!selectStadtteil) return;
    var current = selectStadtteil.value;
    var districts = uniqueStadtteile(items);
    selectStadtteil.innerHTML = "";
    var optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = "Alle Stadtteile";
    selectStadtteil.appendChild(optAll);
    districts.forEach(function (name) {
      var opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      selectStadtteil.appendChild(opt);
    });
    if (districts.indexOf(current) !== -1) selectStadtteil.value = current;
    else selectStadtteil.value = "";
  }

  function getFilterStadtteil() {
    if (!selectStadtteil) return "";
    var v = selectStadtteil.value;
    return v == null ? "" : String(v);
  }

  function getFilteredItems() {
    var f = getFilterStadtteil();
    if (!f) return allItems.slice();
    return allItems.filter(function (item) {
      return String(item.stadtteil || "").trim() === f;
    });
  }

  function updateStats(items) {
    var totalEl = document.getElementById("stat-total");
    var breakdownEl = document.getElementById("stat-breakdown");
    var counts = { leer: 0, teilweise: 0, sanierung: 0 };
    items.forEach(function (item) {
      var k = statusKey(item.status);
      if (counts[k] !== undefined) counts[k]++;
    });
    totalEl.textContent = String(items.length);
    breakdownEl.innerHTML = "";
    ["leer", "teilweise", "sanierung"].forEach(function (k) {
      var li = document.createElement("li");
      li.setAttribute("data-status", k);
      li.innerHTML =
        "<span>" +
        STATUS[k].label +
        '</span> <span class="stats__count">' +
        counts[k] +
        "</span>";
      breakdownEl.appendChild(li);
    });
  }

  function focusItem(id, openPopup) {
    var layer = layerById[id];
    if (!layer) return;
    map.setView(layer.getLatLng(), Math.max(map.getZoom(), 15), {
      animate: true,
    });
    if (openPopup !== false) layer.openPopup();
  }

  function setActiveButton(btn) {
    if (activeListBtn) activeListBtn.classList.remove("is-active");
    activeListBtn = btn;
    if (btn) btn.classList.add("is-active");
  }

  function buildList(items) {
    var ul = document.getElementById("object-list");
    ul.innerHTML = "";
    items.forEach(function (item) {
      var sk = statusKey(item.status);
      var st = STATUS[sk] || STATUS.leer;
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-entry-id", String(item.id));
      var meta =
        escapeHtml(st.label) +
        " · " +
        escapeHtml(item.wohneinheiten) +
        " WE";
      if (item.stadtteil)
        meta =
          escapeHtml(String(item.stadtteil)) + " · " + meta;
      btn.innerHTML =
        '<span class="object-list__addr">' +
        escapeHtml(item.adresse) +
        '</span><span class="object-list__meta">' +
        meta +
        "</span>";
      btn.addEventListener("click", function () {
        setActiveButton(btn);
        focusItem(item.id, true);
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  function renderMarkers(items) {
    markersLayer.clearLayers();
    layerById = {};
    items.forEach(function (item) {
      var sk = statusKey(item.status);
      var color = (STATUS[sk] || STATUS.leer).color;
      var m = houseMarker(item.lat, item.lng, color);
      m.bindPopup(popupHtml(item));
      m.on("click", function () {
        if (!isSafeEntryId(item.id)) {
          if (DEBUG) {
            console.error(
              "Unzulässige Eintrags-ID für Selektor, übersprungen:",
              item.id
            );
          }
          return;
        }
        var btn = document.querySelector(
          '#object-list button[data-entry-id="' + item.id + '"]'
        );
        if (btn) setActiveButton(btn);
      });
      m.addTo(markersLayer);
      layerById[item.id] = m;
    });
  }

  function refreshView() {
    var filtered = getFilteredItems();
    updateStats(filtered);
    buildList(filtered);
    renderMarkers(filtered);
  }

  function onStadtteilChange() {
    setActiveButton(null);
    refreshView();
  }

  if (selectStadtteil) {
    selectStadtteil.addEventListener("change", onStadtteilChange);
  }

  fetch("data/leerstände.json")
    .then(function (r) {
      if (!r.ok) throw new Error("Daten konnten nicht geladen werden");
      return r.json();
    })
    .then(function (data) {
      var items = Array.isArray(data) ? data : data.entries || [];
      allItems = items;
      fillStadtteilSelect(allItems);
      refreshView();
    })
    .catch(function (err) {
      if (DEBUG) console.error(err);
      document.getElementById("stat-total").textContent = "–";
      document.getElementById("object-list").innerHTML =
        '<li><p style="padding:0 0.75rem;color:#94a3b8;font-size:0.85rem;">' +
        escapeHtml(err.message || "Fehler beim Laden") +
        "</p></li>";
    });
})();
