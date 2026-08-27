document.addEventListener('DOMContentLoaded', () => {
  window.calendarInstance = new SkyStoneCalendar();
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();
  const aboutVersionElement = document.getElementById('aboutVersion');
  if (aboutVersionElement) aboutVersionElement.textContent = APP_VERSION;
  const versionElement = document.getElementById('appVersion');
  if (versionElement) versionElement.textContent = APP_VERSION;
  document.title = `光遇国服红黑石日历 ${APP_VERSION}`;
});