window.CalendarUI = {
  bindEvents(instance) {
    instance.prevMonthBtn.addEventListener('click', () => instance.changeMonth(-1));
    instance.nextMonthBtn.addEventListener('click', () => instance.changeMonth(1));
    instance.todayBtn.addEventListener('click', () => instance.goToToday());
    instance.toggleTodayBtn.addEventListener('click', () => instance.toggleTodayElements());
    instance.exportBtn.addEventListener('click', () => CalendarExport.exportAsImage(instance));
    instance.closeModal.addEventListener('click', () => CalendarExport.closeExportModal(instance));
    instance.shareBtn.addEventListener('click', () => CalendarExport.shareImage(instance));

    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeInfoModal = document.getElementById('closeInfoModal');
    const tabUsage = document.getElementById('tab-usage'), tabMechanics = document.getElementById('tab-mechanics'), tabAbout = document.getElementById('tab-about');
    const contentUsage = document.getElementById('content-usage'), contentMechanics = document.getElementById('content-mechanics'), contentAbout = document.getElementById('content-about');

    infoBtn.addEventListener('click', () => { infoModal.classList.add('show'); instance.showTodayElements = false; instance.updateButtonVisibility(); });
    closeInfoModal.addEventListener('click', () => { infoModal.classList.remove('show'); instance.showTodayElements = true; instance.updateButtonVisibility(); });
    infoModal.addEventListener('click', (e) => { if (e.target === infoModal) { infoModal.classList.remove('show'); instance.showTodayElements = true; instance.updateButtonVisibility(); } });

    const switchTab = (activeTab, content) => {
      [tabUsage, tabMechanics, tabAbout].forEach(t => { t.classList.remove('active', 'border-primary', 'text-primary'); t.classList.add('border-transparent', 'text-gray-500'); });
      activeTab.classList.remove('border-transparent', 'text-gray-500'); activeTab.classList.add('active', 'border-primary', 'text-primary');
      [contentUsage, contentMechanics, contentAbout].forEach(c => c.classList.add('hidden'));
      content.classList.remove('hidden');
    };
    tabAbout.addEventListener('click', () => switchTab(tabAbout, contentAbout));
    tabUsage.addEventListener('click', () => switchTab(tabUsage, contentUsage));
    tabMechanics.addEventListener('click', () => switchTab(tabMechanics, contentMechanics));

    const devModeBtn = document.getElementById('devModeBtn');
    const devModePanel = document.getElementById('devModePanel');
    const applyDevTime = document.getElementById('applyDevTime');
    const resetDevTime = document.getElementById('resetDevTime');
    const devModeToggle = document.getElementById('devModeToggle');

    if (devModeToggle) {
      devModeToggle.addEventListener('change', (e) => { if (e.target.checked) devModePanel.classList.remove('hidden'); else { devModePanel.classList.add('hidden'); instance.devMode = false; instance.timeOffset = 0; document.getElementById('devDateTime').value = ''; instance.refreshStatus(); } });
    }
    devModeBtn.addEventListener('click', () => devModePanel.classList.toggle('hidden'));
    applyDevTime.addEventListener('click', () => {
      const devDateTime = document.getElementById('devDateTime');
      if (devDateTime.value) { instance.devMode = true; instance.timeOffset = new Date(devDateTime.value).getTime() - Date.now(); instance.refreshStatus(); }
      else alert('请选择一个有效的时间');
    });
    resetDevTime.addEventListener('click', () => { instance.devMode = false; instance.timeOffset = 0; document.getElementById('devDateTime').value = ''; instance.refreshStatus(); });

    if (instance.isMobile) {
      instance.closeDetailModal.addEventListener('click', () => instance.closeMobileDetailModal());
      instance.closeDetailBtn.addEventListener('click', () => instance.closeMobileDetailModal());
      instance.mobileDetailModal.addEventListener('click', (e) => { if (e.target === instance.mobileDetailModal) instance.closeMobileDetailModal(); });
    }

    instance.addTouchEvents();
    const modalCopyBtn = document.getElementById('modalCopyBtn');
    if (modalCopyBtn) modalCopyBtn.addEventListener('click', () => instance.copyModalInfo());
    window.addEventListener('resize', () => { const wasMobile = instance.isMobile; instance.isMobile = window.innerWidth <= 640; if (wasMobile !== instance.isMobile) { CalendarRenderer.renderCalendar(instance, 'calendarGrid'); if (instance.mobileDetailModal) instance.mobileDetailModal.classList.remove('show'); } });
  },

  showMobileDetailModal(instance, date, hasRed, hasBlack) {
    if (!instance.isMobile) return;
    instance.modalTitle.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    const stoneType = hasRed ? '红石' : '黑石';
    instance.modalStoneType.textContent = stoneType;
    instance.modalStoneType.className = hasRed ? 'text-2xl font-bold mb-3 text-primary' : 'text-2xl font-bold mb-3 text-blackstone';
    const map = instance.getMap(date.getDate());
    const area = instance.getArea(map, date.getDay());
    instance.modalArea.textContent = `${map}·${area}`;
    instance.modalTimeSlots.innerHTML = '';
    instance.getTimeSlots(date.getDay()).forEach(time => { const li = document.createElement('li'); li.textContent = time; instance.modalTimeSlots.appendChild(li); });
    instance.mobileDetailModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  closeMobileDetailModal(instance) {
    if (instance.mobileDetailModal) { instance.mobileDetailModal.classList.remove('show'); document.body.style.overflow = ''; }
  },

  copyModalInfo(instance) {
    const title = document.getElementById('modalTitle').textContent;
    const type = document.getElementById('modalStoneType').textContent;
    const area = document.getElementById('modalArea').textContent;
    const timeSlots = Array.from(document.getElementById('modalTimeSlots').querySelectorAll('li')).map(li => li.textContent).join('\n');
    const dateMatch = title.match(/(\d+)年(\d+)月(\d+)日/);
    if (!dateMatch) return;
    const [, , month, day] = dateMatch;
    const infoText = `${month}月${day}日红黑石信息\n----------------------\n类型：${type}\n地点：${area}\n时间：${timeSlots}\n----------------------\nBy光遇国服红黑石日历\nsky-stones.pages.dev`;
    navigator.clipboard.writeText(infoText).then(() => {
      const notification = document.createElement('div');
      notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = '信息已复制到剪贴板！';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    }).catch(() => alert('复制失败，请手动复制'));
  }
};