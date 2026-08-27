class SkyStoneCalendar {
  constructor() {
    this.today = new Date();
    this.currentDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.isMobile = window.innerWidth <= 640;
    this.devMode = false;
    this.timeOffset = 0;
    this.stoneConfig = STONE_CONFIG;
    this.calendarGrid = document.getElementById('calendarGrid');
    this.exportCalendarGrid = document.getElementById('exportCalendarGrid');
    this.currentMonthEl = document.getElementById('currentMonth');
    this.exportMonthEl = document.getElementById('exportMonth');
    this.prevMonthBtn = document.getElementById('prevMonth');
    this.nextMonthBtn = document.getElementById('nextMonth');
    this.todayBtn = document.getElementById('todayBtn');
    this.toggleTodayBtn = document.getElementById('toggleTodayBtn');
    this.exportBtn = document.getElementById('exportBtn');
    this.exportModal = document.getElementById('exportModal');
    this.exportedImage = document.getElementById('exportedImage');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.closeModal = document.getElementById('closeModal');
    this.shareBtn = document.getElementById('shareBtn');
    this.mobileDetailModal = document.getElementById('mobileDetailModal');
    this.closeDetailModal = document.getElementById('closeDetailModal');
    this.closeDetailBtn = document.getElementById('closeDetailBtn');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalStoneType = document.getElementById('modalStoneType');
    this.modalArea = document.getElementById('modalArea');
    this.modalTimeSlots = document.getElementById('modalTimeSlots');
    this.screenshotTarget = document.getElementById('screenshotTarget');
    this.statusBar = new StatusBarManager(this.stoneConfig, (day) => this.getMap(day), (map, dow) => this.getArea(map, dow), (dow) => this.getTimeSlots(dow));
    this.showTodayElements = true;
    this.achievementEgg = document.getElementById('achievementEgg');
    this.eggTriggered = false;
    
    this.updateButtonVisibility();
    CalendarUI.bindEvents(this);
    
    // 绑定复制按钮事件
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyTodayInfo());
    }
    
    this.renderCalendar();
    this.renderExportCalendar();
    this.refreshStatus();
    this.statusUpdateInterval = null;
    this.startStatusScheduler();
    setTimeout(() => checkTimeOffset(), 100);
  }

  startStatusScheduler() {
    if (this.statusUpdateInterval) clearInterval(this.statusUpdateInterval);
    this.refreshStatus();
    this.statusUpdateInterval = setInterval(() => this.refreshStatus(), 500);
  }

  refreshStatus() {
    const now = this.devMode ? new Date(Date.now() + this.timeOffset) : new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    this.statusBar.update(now, this.hasRedStone(today), this.hasBlackStone(today));
  }

  changeMonth(step) {
    this.calendarGrid.classList.add('calendar-exit');
    setTimeout(() => {
      this.currentDate.setMonth(this.currentDate.getMonth() + step);
      this.checkEggTrigger();
      this.renderCalendar();
      this.renderExportCalendar();
      setTimeout(() => this.calendarGrid.classList.remove('calendar-exit'), 50);
    }, 300);
  }

  checkEggTrigger() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    if (year === 2019 && month === 5 && !this.eggTriggered) {
      this.triggerAchievementEgg();
      this.eggTriggered = true;
    }
  }

  triggerAchievementEgg() {
    this.achievementEgg.classList.add('show');
    setTimeout(() => {
      this.achievementEgg.classList.remove('show');
      setTimeout(() => { this.eggTriggered = false; }, 1000);
    }, 5000);
  }

  toggleTodayElements() {
    this.showTodayElements = !this.showTodayElements;
    this.updateButtonVisibility();
    this.renderCalendar();
  }

  updateButtonVisibility() {
    const copyBtn = document.getElementById('copyBtn');
    const infoBtn = document.getElementById('infoBtn');
    if (this.showTodayElements) {
      this.todayBtn.style.display = 'block';
      this.exportBtn.style.display = 'flex';
      if (copyBtn) copyBtn.style.display = 'flex';
      if (infoBtn) infoBtn.style.display = 'flex';
      this.toggleTodayBtn.innerHTML = '<i class="fa fa-eye"></i>';
    } else {
      this.todayBtn.style.display = 'none';
      this.exportBtn.style.display = 'none';
      if (copyBtn) copyBtn.style.display = 'none';
      if (infoBtn) infoBtn.style.display = 'none';
      this.toggleTodayBtn.innerHTML = '<i class="fa fa-eye-slash"></i>';
    }
  }

  goToToday() {
    this.calendarGrid.classList.add('calendar-exit');
    setTimeout(() => {
      this.currentDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
      this.renderCalendar();
      this.renderExportCalendar();
      setTimeout(() => this.calendarGrid.classList.remove('calendar-exit'), 50);
    }, 300);
  }

  renderCalendar() { CalendarRenderer.renderCalendar(this, 'calendarGrid', false); }
  renderExportCalendar() { CalendarRenderer.renderCalendar(this, 'exportCalendarGrid', true); }

addTouchEvents() {
  let startX = 0;
  let startY = 0;
  let touchMoved = false;
  const calendarEl = document.getElementById('calendarGrid').parentElement;

  calendarEl.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    touchMoved = false;
  }, { passive: false });

  calendarEl.addEventListener('touchmove', (e) => {
    if (!startX) return;
    const diffX = e.touches[0].clientX - startX;
    const diffY = e.touches[0].clientY - startY;
    // 只有水平滑动明显大于垂直滑动时，才认为是切换月份意图
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 15) {
      if (e.cancelable) {
        e.preventDefault();   // 阻止滚动，仅当事件可取消时
      }
      touchMoved = true;
    }
  }, { passive: false });

  calendarEl.addEventListener('touchend', (e) => {
    if (!startX || !touchMoved) {
      startX = 0;
      startY = 0;
      return;
    }
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - startX;
    if (diffX > 50) this.changeMonth(-1);
    else if (diffX < -50) this.changeMonth(1);
    startX = 0;
    startY = 0;
  });
}

  copyTodayInfo() {
    const now = this.devMode ? new Date(Date.now() + this.timeOffset) : new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const hasRed = this.hasRedStone(today);
    const hasBlack = this.hasBlackStone(today);

    if (!hasRed && !hasBlack) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = '今日无红黑石';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
        return;
    }

    let type = hasRed ? '红石' : '黑石';
    const dayOfWeek = today.getDay();
    const location = `${this.getMap(day)}·${this.getArea(this.getMap(day), dayOfWeek)}`;
    const time = this.getTimeSlots(dayOfWeek).join('\n');

    const infoText = `${month}月${day}日红黑石信息\n----------------------\n类型：${type}\n地点：${location}\n时间：${time}\n----------------------\nBy光遇国服红黑石日历\nsky-stones.pages.dev`;

    navigator.clipboard.writeText(infoText).then(() => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = '今日信息已复制到剪贴板！';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }).catch(() => alert('复制失败，请手动复制'));
  }

  // 数据方法
  hasRedStone(date) {
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const cfg = this.stoneConfig;
    if (day <= cfg.halfMonthBoundary) return cfg.redStoneDays.firstHalf.includes(dayOfWeek);
    else return cfg.redStoneDays.secondHalf.includes(dayOfWeek);
  }
  hasBlackStone(date) {
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const cfg = this.stoneConfig;
    if (this.isCrossMonthHalf(date)) return false;
    if (day <= cfg.halfMonthBoundary) return cfg.blackStoneDays.firstHalf.includes(dayOfWeek);
    else return cfg.blackStoneDays.secondHalf.includes(dayOfWeek);
  }
  isCrossMonthHalf(date) {
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    // 仅在「跨月」时取消：周二与周三分属不同月份（如 12月31日周二 / 1月1日周三）。
    // 同一月份内的 15/16 分界线（如 15号周二、16号周三）各自独立成立，不取消。
    if (dayOfWeek === 2) {
      const wednesday = new Date(year, month, day + 1);
      return wednesday.getMonth() !== month;
    }
    if (dayOfWeek === 3) {
      const tuesday = new Date(year, month, day - 1);
      return tuesday.getMonth() !== month;
    }
    return false;
  }
  getTimeSlots(dayOfWeek) { return this.stoneConfig.timeSlots[dayOfWeek] || []; }
  getMap(day) { return this.stoneConfig.maps[day % 5]; }
  getArea(map, dayOfWeek) { return this.stoneConfig.areas[map][dayOfWeek] || ''; }
  isSameDay(date1, date2) { return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate(); }

  showMobileDetailModal(date, hasRed, hasBlack) { CalendarUI.showMobileDetailModal(this, date, hasRed, hasBlack); }
  closeMobileDetailModal() { CalendarUI.closeMobileDetailModal(this); }
  copyModalInfo() { CalendarUI.copyModalInfo(this); }
}