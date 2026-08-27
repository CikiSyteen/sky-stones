// 渲染相关函数
window.CalendarRenderer = {
  createDayElement(instance, day, isCurrentMonth, isToday, date, forcePcStyle = false) {
    const dayEl = document.createElement('div');
    const dayOfWeek = date.getDay();
    const hasRed = instance.hasRedStone(date);
    const hasBlack = instance.hasBlackStone(date);

    const useMobile = !forcePcStyle && instance.isMobile;

    if (useMobile) {
      dayEl.className = 'mobile-day-cell rounded-md relative';
      if (isCurrentMonth && (hasRed || hasBlack)) dayEl.classList.add('hover:opacity-90');
    } else {
      dayEl.className = 'pc-day-cell rounded-md calendar-day-hover relative';
    }

    if (!isCurrentMonth) {
      dayEl.classList.add('text-gray-400', 'bg-neutral');
    } else if (hasRed) {
      dayEl.classList.add('redstone-bg');
    } else if (hasBlack) {
      dayEl.classList.add('blackstone-bg');
    } else {
      dayEl.classList.add('text-gray-800', 'bg-white');
    }

    if (useMobile) {
      this.createMobileDayContent(dayEl, day, hasRed, hasBlack);
      if (isCurrentMonth && (hasRed || hasBlack)) {
        dayEl.addEventListener('click', () => instance.showMobileDetailModal(date, hasRed, hasBlack));
      }
    } else {
      this.createPcDayContent(dayEl, day, date, hasRed, hasBlack, dayOfWeek, instance);
    }

    // 今日标记（确保父容器relative，标记绝对定位且不溢出）
    if (instance.showTodayElements && isToday) {
      const todayBadge = document.createElement('div');
      todayBadge.className = 'today-badge';
      todayBadge.textContent = '今日';
      dayEl.appendChild(todayBadge);
    }

    return dayEl;
  },

  createMobileDayContent(dayEl, day, hasRed, hasBlack) {
    const dateNum = document.createElement('div');
    dateNum.className = 'mobile-date-num';
    dateNum.textContent = day;
    dayEl.appendChild(dateNum);
    if (hasRed || hasBlack) {
      const typeTag = document.createElement('div');
      typeTag.className = 'mobile-stone-type';
      typeTag.textContent = hasRed ? '红石' : '黑石';
      dayEl.appendChild(typeTag);
    }
  },

  createPcDayContent(dayEl, day, date, hasRed, hasBlack, dayOfWeek, instance) {
    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';
    const headerRow = document.createElement('div');
    headerRow.className = 'flex items-center header-row justify-center';
    const dateNum = document.createElement('div');
    dateNum.className = 'text-lg font-semibold date-num';
    dateNum.textContent = day;
    headerRow.appendChild(dateNum);
    if (hasRed || hasBlack) {
      const typeTag = document.createElement('div');
      typeTag.className = 'stone-type';
      typeTag.textContent = hasRed ? '红石' : '黑石';
      headerRow.appendChild(typeTag);
    }
    contentContainer.appendChild(headerRow);
    if (hasRed || hasBlack) {
      const map = instance.getMap(day);
      const area = instance.getArea(map, dayOfWeek);
      const areaEl = document.createElement('div');
      areaEl.className = 'stone-area';
      areaEl.textContent = `${map}·${area}`;
      contentContainer.appendChild(areaEl);
      const timeSlots = instance.getTimeSlots(dayOfWeek);
      const timesContainer = document.createElement('div');
      timesContainer.className = 'stone-time';
      timeSlots.forEach(time => {
        const timeEl = document.createElement('div');
        timeEl.textContent = time;
        timesContainer.appendChild(timeEl);
      });
      contentContainer.appendChild(timesContainer);
    }
    dayEl.appendChild(contentContainer);
  },

  renderCalendar(instance, targetGridId, isExport = false) {
    const year = instance.currentDate.getFullYear();
    const month = instance.currentDate.getMonth();
    if (!isExport) {
      instance.currentMonthEl.innerHTML = `${year}年${month + 1}月`;
      instance.calendarGrid.innerHTML = '';
    } else {
      instance.exportMonthEl.innerHTML = `${year}年${month + 1}月`;
      instance.exportCalendarGrid.innerHTML = '';
    }

    const firstDay = new Date(year, month, 1).getDay();
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const container = isExport ? instance.exportCalendarGrid : instance.calendarGrid;
    const forcePcStyle = isExport;  // 导出时强制PC样式

    for (let i = 0; i < firstDayAdjusted; i++) {
      const day = daysInPrevMonth - firstDayAdjusted + i + 1;
      const dayDate = new Date(year, month - 1, day);
      const isToday = instance.isSameDay(dayDate, instance.today);
      container.appendChild(this.createDayElement(instance, day, false, isToday, dayDate, forcePcStyle));
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const isToday = instance.isSameDay(dayDate, instance.today);
      container.appendChild(this.createDayElement(instance, i, true, isToday, dayDate, forcePcStyle));
    }
    const totalDays = firstDayAdjusted + daysInMonth;
    for (let i = 1; i <= 42 - totalDays; i++) {
      const dayDate = new Date(year, month + 1, i);
      const isToday = instance.isSameDay(dayDate, instance.today);
      container.appendChild(this.createDayElement(instance, i, false, isToday, dayDate, forcePcStyle));
    }
  }
};