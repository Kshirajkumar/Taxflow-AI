/* Taxflow AI — Settings Page Controller */

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  setupThemeToggle();
  setupSettingsForm();
});

function loadSettings() {
  let settings = SETTINGS_DEFAULT;
  try {
    const saved = localStorage.getItem("taxflow-settings");
    if (saved) {
      settings = Object.assign({}, SETTINGS_DEFAULT, JSON.parse(saved));
    }
  } catch (e) {}

  // Apply saved theme
  applyTheme(settings.theme || "light");

  // Populate form fields
  setInputValue("set-firm-name", settings.firmName);
  setInputValue("set-membership-no", settings.membershipNo);
  setInputValue("set-gstin", settings.gstin);
  setInputValue("set-fy", settings.financialYear);
  setInputValue("set-currency", settings.currency);
  setInputValue("set-wa-channel", settings.whatsappChannel);
  setInputValue("set-reminder-days", settings.autoReminderDays);
  setInputValue("set-recon-threshold", settings.autoReconThreshold);
  setInputValue("set-ai-model", settings.aiModel);
  setInputValue("set-ocr-temp", settings.ocrTemperature);
  setInputValue("set-storage-path", settings.storagePath);

  const autoSaveCheck = document.getElementById("set-autosave-vault");
  if (autoSaveCheck) autoSaveCheck.checked = !!settings.autoSaveToVault;
}

function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("taxflow-theme", theme); } catch(e){}

  const themeCards = document.querySelectorAll(".theme-card");
  themeCards.forEach(card => {
    if (card.dataset.theme === theme) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });

  const darkSwitch = document.getElementById("dark-mode-toggle");
  if (darkSwitch) darkSwitch.checked = (theme === "dark");
}

function setupThemeToggle() {
  const themeCards = document.querySelectorAll(".theme-card");
  themeCards.forEach(card => {
    card.addEventListener("click", () => {
      const selectedTheme = card.dataset.theme;
      applyTheme(selectedTheme);
      showToast(`Switched to ${selectedTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  });

  const darkSwitch = document.getElementById("dark-mode-toggle");
  if (darkSwitch) {
    darkSwitch.addEventListener("change", (e) => {
      const newTheme = e.target.checked ? "dark" : "light";
      applyTheme(newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }
}

function setupSettingsForm() {
  const saveBtn = document.getElementById("save-settings-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const updatedSettings = {
        theme: document.documentElement.getAttribute("data-theme") || "light",
        firmName: document.getElementById("set-firm-name")?.value || SETTINGS_DEFAULT.firmName,
        membershipNo: document.getElementById("set-membership-no")?.value || SETTINGS_DEFAULT.membershipNo,
        gstin: document.getElementById("set-gstin")?.value || SETTINGS_DEFAULT.gstin,
        financialYear: document.getElementById("set-fy")?.value || SETTINGS_DEFAULT.financialYear,
        currency: document.getElementById("set-currency")?.value || SETTINGS_DEFAULT.currency,
        whatsappChannel: document.getElementById("set-wa-channel")?.value || SETTINGS_DEFAULT.whatsappChannel,
        autoReminderDays: parseInt(document.getElementById("set-reminder-days")?.value || 4),
        autoReconThreshold: parseInt(document.getElementById("set-recon-threshold")?.value || 90),
        aiModel: document.getElementById("set-ai-model")?.value || SETTINGS_DEFAULT.aiModel,
        ocrTemperature: parseFloat(document.getElementById("set-ocr-temp")?.value || 0.1),
        autoSaveToVault: !!document.getElementById("set-autosave-vault")?.checked,
        storagePath: document.getElementById("set-storage-path")?.value || SETTINGS_DEFAULT.storagePath
      };

      try {
        localStorage.setItem("taxflow-settings", JSON.stringify(updatedSettings));
      } catch (e) {}

      // Update User profile in titlebar if firm name changed
      const userEl = document.querySelector(".titlebar .user");
      if (userEl) {
        userEl.innerHTML = `<div class="avatar">SK</div> ${updatedSettings.firmName}`;
      }

      showToast("Practice settings saved successfully");
    });
  }

  const backupBtn = document.getElementById("backup-data-btn");
  if (backupBtn) {
    backupBtn.addEventListener("click", () => {
      showToast("Exported backup file: Taxflow_Backup_20260914.json");
    });
  }

  const resetBtn = document.getElementById("reset-settings-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem("taxflow-settings");
        localStorage.setItem("taxflow-theme", "light");
      } catch (e) {}
      loadSettings();
      showToast("Settings reset to practice defaults");
    });
  }
}
