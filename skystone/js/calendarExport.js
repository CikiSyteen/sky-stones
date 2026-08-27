// 导出模块：动态克隆并截图，固定宽度800px，完整显示所有日期的详细信息
// 非本月格子保持灰色背景，红黑石信息仅以文字显示
window.CalendarExport = {
  async exportAsImage(instance) {
    if (instance.mobileDetailModal) instance.mobileDetailModal.classList.remove('show');

    // 动态加载 html2canvas（如果尚未加载）
    if (typeof html2canvas === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('html2canvas 加载失败'));
        document.head.appendChild(script);
      });
    }

    // 1. 创建离屏克隆容器
    const cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'fixed';
    cloneContainer.style.top = '-9999px';
    cloneContainer.style.left = '-9999px';
    cloneContainer.style.width = '800px';
    cloneContainer.style.backgroundColor = '#FAFAFA';
    cloneContainer.style.padding = '20px';
    cloneContainer.style.borderRadius = '12px';
    cloneContainer.style.boxSizing = 'border-box';
    document.body.appendChild(cloneContainer);

    // 2. 生成当前月份的完整日历（PC样式，不包含“今日”标记）
    const year = instance.currentDate.getFullYear();
    const month = instance.currentDate.getMonth();
    const monthName = `${year}年${month + 1}月`;

    // 标题
    const titleHtml = `<div style="text-align:center; margin-bottom:20px;">
      <h1 style="font-size:28px; font-weight:bold; color:#D05D5A; margin:0 0 8px 0;">光遇国服红黑石日历</h1>
      <div style="font-size:20px; font-weight:600; color:#333;">${monthName}</div>
    </div>`;

    // 星期行
    const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const weekRow = `<div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:8px;">
      ${weekdays.map(d => `<div style="text-align:center; padding:6px 0; font-weight:500; ${d === '周五' || d === '周六' || d === '周日' ? 'color:#D05D5A;' : 'color:#4B5563;'}">${d}</div>`).join('')}
    </div>`;

    // 计算日历格子
    const firstDay = new Date(year, month, 1).getDay();
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let gridHtml = '<div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px;">';

    // 上月（灰色背景）
    for (let i = 0; i < firstDayAdjusted; i++) {
      const day = daysInPrevMonth - firstDayAdjusted + i + 1;
      const date = new Date(year, month - 1, day);
      const hasRed = instance.hasRedStone(date);
      const hasBlack = instance.hasBlackStone(date);
      const bgStyle = 'background:#F3F4F6; color:#9CA3AF;';
      let detailsHtml = '';
      if (hasRed || hasBlack) {
        const map = instance.getMap(day);
        const area = instance.getArea(map, date.getDay());
        const timeSlots = instance.getTimeSlots(date.getDay());
        detailsHtml = `<div style="font-size:12px; margin-top:6px; line-height:1.4;">${map}·${area}<br>${timeSlots.join('<br>')}</div>`;
      }
      gridHtml += `<div style="${bgStyle} border-radius:8px; padding:8px; text-align:center; min-height:110px; display:flex; flex-direction:column; justify-content:center;">
        <div style="font-size:18px; font-weight:bold;">${day}</div>
        ${detailsHtml}
      </div>`;
    }

    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      const hasRed = instance.hasRedStone(date);
      const hasBlack = instance.hasBlackStone(date);
      let bgStyle = '';
      if (hasRed) bgStyle = 'background:#D05D5A; color:white;';
      else if (hasBlack) bgStyle = 'background:#6B6B6B; color:white;';
      else bgStyle = 'background:white; border:1px solid #E5E7EB; color:#1F2937;';

      let detailsHtml = '';
      if (hasRed || hasBlack) {
        const map = instance.getMap(d);
        const area = instance.getArea(map, dayOfWeek);
        const timeSlots = instance.getTimeSlots(dayOfWeek);
        detailsHtml = `<div style="font-size:12px; margin-top:6px; line-height:1.4;">${map}·${area}<br>${timeSlots.join('<br>')}</div>`;
      }

      const dayHtml = `<div style="${bgStyle} border-radius:8px; padding:8px; text-align:center; min-height:110px; display:flex; flex-direction:column; justify-content:center;">
        <div style="font-size:18px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:4px; flex-wrap:wrap;">
          <span>${d}</span>
          ${hasRed ? '<span style="font-size:11px; background:rgba(255,255,255,0.25); padding:2px 6px; border-radius:12px;">红石</span>' : (hasBlack ? '<span style="font-size:11px; background:rgba(255,255,255,0.25); padding:2px 6px; border-radius:12px;">黑石</span>' : '')}
        </div>
        ${detailsHtml}
      </div>`;
      gridHtml += dayHtml;
    }

    // 下月（灰色背景）
    const totalDays = firstDayAdjusted + daysInMonth;
    const nextMonthDays = 42 - totalDays;
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      const hasRed = instance.hasRedStone(date);
      const hasBlack = instance.hasBlackStone(date);
      const bgStyle = 'background:#F3F4F6; color:#9CA3AF;';
      let detailsHtml = '';
      if (hasRed || hasBlack) {
        const map = instance.getMap(i);
        const area = instance.getArea(map, date.getDay());
        const timeSlots = instance.getTimeSlots(date.getDay());
        detailsHtml = `<div style="font-size:12px; margin-top:6px; line-height:1.4;">${map}·${area}<br>${timeSlots.join('<br>')}</div>`;
      }
      gridHtml += `<div style="${bgStyle} border-radius:8px; padding:8px; text-align:center; min-height:110px; display:flex; flex-direction:column; justify-content:center;">
        <div style="font-size:18px; font-weight:bold;">${i}</div>
        ${detailsHtml}
      </div>`;
    }
    gridHtml += '</div>';

    cloneContainer.innerHTML = titleHtml + weekRow + gridHtml;

    // 等待DOM渲染
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 100)));

    // 截图
    const canvas = await html2canvas(cloneContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FAFAFA',
      width: 800,
      height: cloneContainer.scrollHeight,
      logging: false,
    });

    // 移除克隆容器
    document.body.removeChild(cloneContainer);

    const imageUrl = canvas.toDataURL('image/png', 1.0);
    instance.exportedImage.src = imageUrl;
    instance.downloadBtn.href = imageUrl;
    instance.downloadBtn.download = `${year}年${month + 1}月光遇红黑石日历.png`;
    instance.exportModal.classList.remove('hidden');

    // 移动端优化预览：点击图片在应用内全屏查看，避免 window.open(dataURI) 在移动端白屏/卡死
    if (instance.isMobile) {
      instance.exportedImage.style.maxWidth = '100%';
      instance.exportedImage.style.height = 'auto';
      instance.exportedImage.style.cursor = 'zoom-in';

      // 复用同一个全屏查看层，避免多次导出重复绑定监听/打开多个标签页
      if (!instance._exportImgViewer) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);display:none;align-items:center;justify-content:center;z-index:60;cursor:zoom-out;';
        const bigImg = document.createElement('img');
        bigImg.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';
        overlay.appendChild(bigImg);
        overlay.addEventListener('click', () => { overlay.style.display = 'none'; });
        document.body.appendChild(overlay);
        instance._exportImgViewer = { overlay, bigImg };
      }
      instance._exportImgViewer.bigImg.src = imageUrl;
      instance.exportedImage.onclick = () => {
        instance._exportImgViewer.overlay.style.display = 'flex';
      };
    }
  },

  closeExportModal(instance) {
    instance.exportModal.classList.add('hidden');
  },

  shareImage(instance) {
    if (navigator.share) {
      fetch(instance.exportedImage.src)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], `${instance.currentDate.getFullYear()}年${instance.currentDate.getMonth() + 1}月光遇红黑石日历.png`, { type: 'image/png' });
          navigator.share({ title: '光遇红黑石日历', text: `${instance.currentDate.getFullYear()}年${instance.currentDate.getMonth() + 1}月光遇红黑石日历`, files: [file] }).catch(() => {});
        });
    } else {
      alert('您的浏览器不支持分享功能，请手动下载图片分享');
    }
  }
};