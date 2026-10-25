/* ACCN – scripts du site (sans dépendance) */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIGURATION DES FORMULAIRES
     Renseigner ici l'adresse du service qui recevra les formulaires
     (Formspree, Web3Forms, script PHP de l'hébergeur…).
     Tant qu'elle est vide, la demande est préparée dans WhatsApp et
     le visiteur n'a plus qu'à l'envoyer au cabinet.
     ------------------------------------------------------------------ */
  var FORM_ENDPOINT = "";
  var WHATSAPP_NUMBER = "237675780245";

  /* ---------- En-tête : ombre au défilement ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menu mobile ---------- */
  var body = document.body;
  var navToggle = document.querySelector(".nav-toggle");
  var navClose = document.querySelector(".nav-close");
  var overlay = document.querySelector(".nav-overlay");

  function setNav(open) {
    body.classList.toggle("nav-open", open);
    if (navToggle) navToggle.setAttribute("aria-expanded", String(open));
    if (open && navClose) navClose.focus();
  }
  if (navToggle) navToggle.addEventListener("click", function () { setNav(true); });
  if (navClose) navClose.addEventListener("click", function () { setNav(false); navToggle && navToggle.focus(); });
  if (overlay) overlay.addEventListener("click", function () { setNav(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (body.classList.contains("nav-open")) { setNav(false); navToggle && navToggle.focus(); }
    document.querySelectorAll(".has-sub.open").forEach(function (li) { closeSub(li); });
  });

  /* ---------- Sous-menus ---------- */
  function closeSub(li) {
    li.classList.remove("open");
    var b = li.querySelector(".sub-toggle");
    if (b) b.setAttribute("aria-expanded", "false");
  }
  document.querySelectorAll(".sub-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.closest(".has-sub");
      var open = !li.classList.contains("open");
      document.querySelectorAll(".has-sub.open").forEach(function (other) { if (other !== li) closeSub(other); });
      li.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-sub")) {
      document.querySelectorAll(".has-sub.open").forEach(function (li) {
        if (window.matchMedia("(min-width: 992px)").matches) closeSub(li);
      });
    }
  });

  /* ---------- Formulaire de devis : parcours Particulier / Professionnel ---------- */
  var params = new URLSearchParams(window.location.search);

  document.querySelectorAll("[data-quote-form]").forEach(function (form) {
    var profilInputs = form.querySelectorAll('input[name="profil"]');
    var groups = form.querySelectorAll("[data-produits]");

    function syncGroups() {
      var checked = form.querySelector('input[name="profil"]:checked');
      var profil = checked ? checked.value : "";
      groups.forEach(function (g) {
        var active = g.getAttribute("data-produits") === profil;
        g.hidden = !active;
        g.querySelectorAll("input").forEach(function (i) {
          i.disabled = !active;
          if (!active) i.checked = false;
        });
      });
    }
    profilInputs.forEach(function (i) { i.addEventListener("change", syncGroups); });

    // Présélection depuis l'adresse : devis.html?profil=Professionnel&produit=Flotte%20Automobile
    var p = params.get("profil");
    var prod = params.get("produit");
    if (p) profilInputs.forEach(function (i) { if (i.value === p) i.checked = true; });
    syncGroups();
    if (prod) form.querySelectorAll('input[name="produit"]').forEach(function (i) { if (!i.disabled && i.value === prod) i.checked = true; });
  });

  /* ---------- Questions conditionnelles (« Si oui… », « Autre, précisez ») ---------- */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var deps = form.querySelectorAll("[data-show-if]");
    if (!deps.length) return;
    function sync() {
      deps.forEach(function (el) {
        var cond = el.getAttribute("data-show-if").split("|");
        var checked = form.querySelector('[name="' + cond[0] + '"]:checked');
        var show = !!checked && checked.value === cond[1];
        el.hidden = !show;
        el.querySelectorAll("input, select, textarea").forEach(function (i) { i.disabled = !show; });
      });
    }
    form.addEventListener("change", sync);
    form.addEventListener("reset", function () { setTimeout(sync, 0); });
    sync();
  });

  /* ---------- Validation et envoi ---------- */
  var MESSAGES = {
    valueMissing: "Ce champ est obligatoire.",
    typeMismatch: "Merci d'indiquer une adresse e-mail valide.",
    patternMismatch: "Merci d'indiquer un numéro de téléphone valide."
  };

  function fieldMessage(field) {
    var max = Number(field.getAttribute("data-max-size"));
    if (field.type === "file" && max && field.files.length && field.files[0].size > max) {
      return "Le fichier dépasse " + Math.round(max / 1048576) + " Mo.";
    }
    var v = field.validity;
    if (v.valueMissing) return field.type === "radio" ? "Merci de choisir une option." : MESSAGES.valueMissing;
    if (v.typeMismatch) return MESSAGES.typeMismatch;
    if (v.patternMismatch) return MESSAGES.patternMismatch;
    return "";
  }

  function showError(field, msg) {
    var holder = field.type === "radio" ? field.closest("fieldset") : field.parentElement;
    var err = holder.querySelector(".field-error");
    if (!msg) {
      if (err) err.remove();
      field.removeAttribute("aria-invalid");
      return;
    }
    if (!err) {
      err = document.createElement("span");
      err.className = "field-error";
      err.id = (field.name || "champ") + "-erreur-" + Math.random().toString(36).slice(2, 7);
      holder.appendChild(err);
    }
    err.textContent = msg;
    if (field.type !== "radio") {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", err.id);
    }
  }

  function validate(form) {
    var firstInvalid = null;
    var seenRadio = {};
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (field.disabled || field.type === "hidden" || field.type === "submit") return;
      if (field.type === "radio" || field.type === "checkbox") {
        if (seenRadio[field.name]) return;
        seenRadio[field.name] = true;
      }
      var msg = fieldMessage(field);
      showError(field, msg);
      if (msg && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function labelFor(form, field) {
    if (field.dataset.label) return field.dataset.label;
    var l = form.querySelector('label[for="' + field.id + '"]');
    return l ? l.textContent.replace("*", "").trim() : field.name;
  }

  // Résumé lisible de la demande : une ligne par question, les cases cochées
  // d'une même question regroupées, un intertitre par section du questionnaire.
  function summary(form) {
    var lines = [form.getAttribute("data-subject") || "Demande depuis le site ACCN"];
    var index = {};
    var section = null;
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (field.disabled || !field.name || field.type === "submit") return;
      var value;
      if (field.type === "radio" || field.type === "checkbox") {
        if (!field.checked) return;
        value = field.value;
      } else if (field.type === "file") {
        if (!field.files.length) return;
        value = Array.prototype.map.call(field.files, function (f) { return f.name; }).join(", ");
      } else {
        value = field.value.trim();
      }
      if (!value) return;
      if (field.name in index) {
        lines[index[field.name]] += ", " + value;
        return;
      }
      var holder = field.closest("[data-section]");
      var title = holder ? holder.getAttribute("data-section") : "";
      if (title !== section) {
        section = title;
        lines.push("", title ? "— " + title + " —" : "");
      }
      index[field.name] = lines.length;
      lines.push(labelFor(form, field) + " : " + value);
    });
    return lines.join("\n").replace(/\n{3,}/g, "\n\n");
  }

  function attachedFiles(form) {
    return Array.prototype.filter.call(form.querySelectorAll('input[type="file"]'), function (i) {
      return !i.disabled && i.files.length;
    }).map(function (i) { return i.getAttribute("data-label") || "document"; });
  }

  function setStatus(form, type, html) {
    var box = form.querySelector(".form-status");
    if (!box) return;
    box.className = "form-status is-visible is-" + type;
    box.innerHTML = html;
    box.setAttribute("tabindex", "-1");
    box.focus();
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.setAttribute("novalidate", "");

    var note = form.querySelector("[data-form-note]");
    if (note && !FORM_ENDPOINT) note.textContent = "Votre demande sera transmise à un conseiller ACCN via WhatsApp.";

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("change", function () {
        if (form.querySelector(".field-error")) showError(field, fieldMessage(field));
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;

      var text = summary(form);
      var waLink = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);

      if (!FORM_ENDPOINT) {
        window.open(waLink, "_blank", "noopener");
        var files = attachedFiles(form);
        setStatus(form, "success",
          "Votre demande est prête dans WhatsApp : il ne vous reste plus qu'à l'envoyer. " +
          (files.length ? "<strong>Pensez à joindre dans la conversation : " + files.join(", ").toLowerCase() + ".</strong> " : "") +
          'Si WhatsApp ne s\'est pas ouvert, <a href="' + waLink + '" target="_blank" rel="noopener">cliquez ici</a>.');
        return;
      }

      var btn = form.querySelector('[type="submit"]');
      var label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "Envoi en cours…"; }

      var data = new FormData(form);
      data.append("_subject", form.getAttribute("data-subject") || "Demande depuis le site ACCN");

      fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          form.querySelectorAll('input[name="profil"]').forEach(function (i) { i.dispatchEvent(new Event("change")); });
          setStatus(form, "success", "Merci ! Votre demande a bien été envoyée. Un conseiller ACCN vous recontacte très vite.");
        })
        .catch(function () {
          setStatus(form, "error",
            "L'envoi n'a pas abouti. Vous pouvez réessayer ou " +
            '<a href="' + waLink + '" target="_blank" rel="noopener">nous écrire sur WhatsApp</a>.');
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.innerHTML = label; }
        });
    });
  });
})();
