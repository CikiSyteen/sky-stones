// 带超时的fetch封装
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchServerTime() {
  const endpoints = [
    { url: "https://ip.ddnspod.com/timestamp", parser: (text) => parseInt(text.trim()) },
    { url: "http://mshopact.vivo.com.cn/tool/config", parser: (data) => data.success && data.data && data.data.nowTime ? data.data.nowTime : null },
    { url: "https://tptm.hd.mi.com/gettimestamp", parser: (text) => { const parts = text.split("="); return parts.length === 2 ? parseInt(parts[1].trim()) : null; } },
    { url: "https://quan.suning.com/getSysTime.do", parser: (data) => data.sysTime2 ? new Date(data.sysTime2.replace(" ", "T")).getTime() : null },
    { url: "https://cn.apihz.cn/api/time/getapi.php?id=88888888&key=88888888&type=1", parser: (data) => data.code === 200 && data.msg ? parseInt(data.msg) * 1000 : null }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetchWithTimeout(ep.url, 3000);
      let parsed;
      if (ep.url.includes('.txt') || ep.url.includes('gettimestamp')) {
        const text = await res.text();
        parsed = ep.parser(text);
      } else {
        const json = await res.json();
        parsed = ep.parser(json);
      }
      if (parsed && parsed > 0) return parsed;
    } catch (e) { console.warn(`时间接口失败: ${ep.url}`, e); }
  }
  return null;
}

async function checkTimeOffset() {
  const serverTime = await fetchServerTime();
  if (!serverTime) return;

  const localTime = Date.now();
  const diffSeconds = Math.abs(localTime - serverTime) / 1000;
  const diffMinutes = Math.round(diffSeconds / 60);

  const statusBox = document.getElementById('statusInfoBox');
  let warningElement = document.getElementById('timeWarning');

  if (diffSeconds > 300) {
    if (!warningElement) {
      warningElement = document.createElement('div');
      warningElement.id = 'timeWarning';
      warningElement.className = 'text-xs text-red-600 mt-2 font-medium';
      statusBox.appendChild(warningElement);
    }
    warningElement.textContent = `设备时间偏差较大（约 ${diffMinutes} 分钟），请校准后再使用`;
  } else if (diffSeconds > 30) {
    if (!warningElement) {
      warningElement = document.createElement('div');
      warningElement.id = 'timeWarning';
      warningElement.className = 'text-xs text-yellow-600 mt-2 font-medium';
      statusBox.appendChild(warningElement);
    }
    warningElement.textContent = `设备时间可能有轻微偏差（约 ${diffMinutes} 分钟）`;
  } else {
    if (warningElement) warningElement.remove();
  }
}