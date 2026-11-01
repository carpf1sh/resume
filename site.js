// Domain / skill filter chips for the timeline, plus the light/dark toggle.
// Without JavaScript every item stays visible and the controls stay hidden.
(function () {
  "use strict";

  var root = document.documentElement;
  var themeBtn = document.querySelector(".theme");
  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  var saved = storedTheme();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  if (themeBtn) {
    themeBtn.hidden = false;
    themeBtn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark" ||
        (!root.hasAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    });
  }

  var filters = document.querySelector(".filters");
  if (!filters) return;
  filters.hidden = false;

  var active = { domain: "", skill: "" };
  var items = Array.prototype.slice.call(document.querySelectorAll(".timeline .item"));
  var roles = Array.prototype.slice.call(document.querySelectorAll(".timeline .role"));
  var status = filters.querySelector(".filter-status");

  function matches(item) {
    var domains = (item.getAttribute("data-domains") || "").split(" ");
    var skills = (item.getAttribute("data-skills") || "").split(" ");
    return (!active.domain || domains.indexOf(active.domain) !== -1) &&
           (!active.skill || skills.indexOf(active.skill) !== -1);
  }

  function apply() {
    var filtering = active.domain || active.skill;
    var shown = 0;
    items.forEach(function (item) {
      var ok = matches(item);
      item.classList.toggle("filtered-out", !ok);
      if (ok) shown += 1;
    });
    roles.forEach(function (role) {
      var visible = role.querySelectorAll(".item:not(.filtered-out)").length;
      role.classList.toggle("filtered-out", Boolean(filtering) && visible === 0);
    });
    status.textContent = filtering ? shown + " of " + items.length + " highlights match" : "";
  }

  var more = filters.querySelector(".chip-more");
  var moreLabel = more ? more.textContent : "";
  if (more) more.parentNode.classList.add("collapsed");

  filters.addEventListener("click", function (ev) {
    var chip = ev.target.closest(".chip");
    if (!chip) return;
    if (chip === more) {
      var collapsed = more.parentNode.classList.toggle("collapsed");
      more.setAttribute("aria-expanded", String(!collapsed));
      more.textContent = collapsed ? moreLabel : "Fewer";
      return;
    }
    var kind = chip.getAttribute("data-kind");
    var value = chip.getAttribute("data-value");
    // Clicking the active chip again clears that filter.
    active[kind] = active[kind] === value ? "" : value;
    filters.querySelectorAll('.chip[data-kind="' + kind + '"]').forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.getAttribute("data-value") === active[kind]));
    });
    apply();
  });
})();
