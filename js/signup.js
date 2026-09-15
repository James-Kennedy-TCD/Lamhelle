// Business owner signup form: validates required fields, saves the
// submission locally, tries to persist it server-side if a backend is
// reachable, and hands off to the visitor's own email client so the
// application reaches the Lámhelle team either way.

(async function () {
  await hydrateFromApi();

  const SIGNUPS_KEY = "lamhelle_signups";
  const CONTACT_EMAIL = "hello@lamhelle.ie";

  function populateCategorySelect() {
    const select = document.getElementById("category");
    CATEGORIES.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
    const other = document.createElement("option");
    other.value = "Other";
    other.textContent = "Other";
    select.appendChild(other);
  }

  function populateAreaOptions() {
    const list = document.getElementById("areaOptions");
    const areas = [...new Set(BUSINESSES.map((b) => b.area))].sort();
    list.innerHTML = areas.map((a) => `<option value="${escapeHtml(a)}"></option>`).join("");
  }

  function saveSignup(data) {
    let signups = [];
    try {
      signups = JSON.parse(localStorage.getItem(SIGNUPS_KEY)) || [];
    } catch {
      signups = [];
    }
    signups.push({ ...data, submittedAt: new Date().toISOString() });
    try {
      localStorage.setItem(SIGNUPS_KEY, JSON.stringify(signups));
    } catch {
      // localStorage unavailable - the mailto handoff still works.
    }

    // Fire-and-forget: if a backend happens to be running, persist it
    // there too. The localStorage record and mailto link above remain the
    // guaranteed fallback either way, since there's no admin login yet to
    // actually browse what lands in the database.
    fetch("/api/signups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  }

  function buildMailtoUrl(data) {
    const subject = `New business listing: ${data.businessName}`;
    const bodyLines = [
      `Business name: ${data.businessName}`,
      `Category: ${data.category}`,
      `Area: ${data.area}`,
      `Address: ${data.address}`,
      `Contact name: ${data.contactName}`,
      `Email: ${data.email}`,
      data.phone ? `Phone: ${data.phone}` : null,
      data.website ? `Website / Instagram: ${data.website}` : null,
      "",
      "Description:",
      data.description,
    ].filter((line) => line !== null);

    const params = new URLSearchParams({ subject, body: bodyLines.join("\n") });
    return `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, "%20")}`;
  }

  function getFormData(form) {
    const fields = ["businessName", "category", "area", "address", "description", "contactName", "email", "phone", "website"];
    const data = {};
    fields.forEach((name) => {
      data[name] = form.elements[name].value.trim();
    });
    return data;
  }

  function isValid(data) {
    return Boolean(data.businessName && data.category && data.area && data.address && data.description && data.contactName && data.email);
  }

  function showSuccess(data) {
    document.getElementById("signupForm").hidden = true;
    document.getElementById("successName").textContent = data.businessName;
    document.getElementById("emailLink").href = buildMailtoUrl(data);
    const panel = document.getElementById("successPanel");
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setupForm() {
    const form = document.getElementById("signupForm");
    const errorMsg = document.getElementById("formError");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = getFormData(form);

      if (!isValid(data)) {
        errorMsg.hidden = false;
        return;
      }
      errorMsg.hidden = true;

      saveSignup(data);
      showSuccess(data);
    });

    document.getElementById("startOverBtn").addEventListener("click", () => {
      form.reset();
      form.hidden = false;
      document.getElementById("successPanel").hidden = true;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  populateCategorySelect();
  populateAreaOptions();
  setupForm();
})();
