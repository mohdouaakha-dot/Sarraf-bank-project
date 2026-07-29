// Global logout handler accessible everywhere
window.logoutAdmin = function(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  console.log("Logging out admin...");

  // 1. Clear all local & session storage keys
  localStorage.removeItem("sarraf_session");
  localStorage.removeItem("token");
  localStorage.removeItem("sarraf_token");
  localStorage.removeItem("user");
  localStorage.clear();
  sessionStorage.clear();

  // 2. Clear auth cookie if present
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "sarraf_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // 3. Force redirect back to root login
  window.location.replace("/index.html");
};

// Wire automatically on page load as backup
document.addEventListener("DOMContentLoaded", () => {
  const logoutButtons = document.querySelectorAll('#logoutBtn, [data-action="logout"], a[href*="logout"]');
  logoutButtons.forEach(btn => {
    btn.onclick = window.logoutAdmin;
  });
});
