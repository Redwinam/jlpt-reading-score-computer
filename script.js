document.addEventListener("DOMContentLoaded", () => {
  // 问题配置
  const questionGroups = [
    { id: 8, pointsPerQuestion: 2 },
    { id: 9, pointsPerQuestion: 2 },
    { id: 10, pointsPerQuestion: 3 },
    { id: 11, pointsPerQuestion: 3 },
    { id: 12, pointsPerQuestion: 3 },
    { id: 13, pointsPerQuestion: 2 },
  ];

  // 计时器数据
  const timers = {};
  questionGroups.forEach((group) => {
    timers[group.id] = {
      isRunning: false,
      startTime: 0,
      elapsedTime: 0,
      intervalId: null,
    };
  });

  // 初始化所有控件和显示
  initializeControls();

  // 计算按钮点击事件
  const calculateBtn = document.getElementById("calculateBtn");
  calculateBtn.addEventListener("click", calculateScore);

  // 添加点击分数复制到剪贴板功能
  const totalScoreElement = document.querySelector(".total-score");
  totalScoreElement.addEventListener("click", copyScoreToClipboard);
  totalScoreElement.style.cursor = "pointer";
  totalScoreElement.setAttribute("title", "点击复制分数到剪贴板");

  // 初始化计时器按钮
  initializeTimers();

  // 复制分数到剪贴板
  function copyScoreToClipboard() {
    const score = document.getElementById("score").textContent;
    const totalPossibleScore = document.getElementById("totalPossibleScore").textContent;
    const scoreText = `${score}/${totalPossibleScore}`;

    navigator.clipboard
      .writeText(scoreText)
      .then(() => {
        // 显示复制成功提示
        showCopyFeedback(totalScoreElement, "已复制到剪贴板!");
      })
      .catch((err) => {
        console.error("复制失败:", err);
        showCopyFeedback(totalScoreElement, "复制失败");
      });
  }

  // 显示复制反馈
  function showCopyFeedback(element, message) {
    // 创建提示元素
    const feedback = document.createElement("div");
    feedback.className = "copy-feedback";
    feedback.textContent = message;

    // 设置样式
    feedback.style.position = "absolute";
    feedback.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    feedback.style.color = "#fff";
    feedback.style.width = "115px";
    feedback.style.textAlign = "center";
    feedback.style.padding = "6px 10px";
    feedback.style.borderRadius = "4px";
    feedback.style.fontSize = "12px";
    feedback.style.zIndex = "1000";
    feedback.style.opacity = "0";
    feedback.style.transition = "opacity 0.3s";

    // 插入到元素附近
    element.style.position = "relative";
    element.appendChild(feedback);

    // 计算位置 - 在元素下方居中
    const rect = element.getBoundingClientRect();
    feedback.style.top = "100%";
    feedback.style.left = "50%";
    feedback.style.transform = "translateX(-50%)";
    feedback.style.marginTop = "5px";

    // 显示提示
    setTimeout(() => {
      feedback.style.opacity = "1";
    }, 10);

    // 2秒后隐藏并移除提示
    setTimeout(() => {
      feedback.style.opacity = "0";
      setTimeout(() => {
        element.removeChild(feedback);
      }, 300);
    }, 2000);

    // 添加动画效果
    totalScoreElement.classList.add("pulse-animation");
    setTimeout(() => {
      totalScoreElement.classList.remove("pulse-animation");
    }, 1000);
  }

  // 初始化计时器
  function initializeTimers() {
    const timerBtns = document.querySelectorAll(".timer-btn");
    const resetBtns = document.querySelectorAll(".timer-reset-btn");

    timerBtns.forEach((btn) => {
      const groupId = btn.getAttribute("data-group");
      if (!groupId) return;

      btn.addEventListener("click", () => {
        toggleTimer(groupId);
      });
    });

    // 初始化复原按钮
    resetBtns.forEach((btn) => {
      const groupId = btn.getAttribute("data-group");
      if (!groupId) return;

      btn.addEventListener("click", () => {
        resetTimer(groupId);
      });
    });
  }

  // 切换计时器状态（开始/暂停）
  function toggleTimer(groupId) {
    const timer = timers[groupId];
    const timerBtn = document.querySelector(`.timer-btn[data-group="${groupId}"]`);
    let timerDisplay = document.querySelector(`.timer-container[data-group="${groupId}"] .timer-display`);
    if (!timerDisplay) {
      // 如果找不到使用上面的选择器，尝试使用父元素关系找到对应元素
      const timerContainer = timerBtn.closest(".timer-container");
      if (timerContainer) {
        timerDisplay = timerContainer.querySelector(".timer-display");
      }
    }
    const timerEl = document.querySelector(`.timer[data-group="${groupId}"]`);

    // 检查元素是否存在
    if (!timerBtn || !timerEl) {
      console.error(`找不到计时器元素，groupId: ${groupId}`);
      return;
    }

    if (timer.isRunning) {
      // 暂停计时器
      clearInterval(timer.intervalId);
      timer.elapsedTime += Date.now() - timer.startTime;
      timer.isRunning = false;

      // 更新UI
      timerBtn.innerHTML = '<i class="fas fa-play"></i>';
      timerBtn.classList.remove("active");
      if (timerDisplay) timerDisplay.classList.remove("active");
    } else {
      // 开始计时器
      timer.startTime = Date.now();
      timer.isRunning = true;

      // 更新UI
      timerBtn.innerHTML = '<i class="fas fa-pause"></i>';
      timerBtn.classList.add("active");
      if (timerDisplay) timerDisplay.classList.add("active");

      // 设置定时器
      timer.intervalId = setInterval(() => {
        const currentTime = Date.now();
        const totalElapsed = timer.elapsedTime + (currentTime - timer.startTime);
        updateTimerDisplay(groupId, totalElapsed);
      }, 1000);

      // 立即更新一次显示
      updateTimerDisplay(groupId, timer.elapsedTime);
    }
  }

  // 复原计时器
  function resetTimer(groupId) {
    const timer = timers[groupId];
    const timerEl = document.querySelector(`.timer[data-group="${groupId}"]`);
    const timerBtn = document.querySelector(`.timer-btn[data-group="${groupId}"]`);
    let timerDisplay = document.querySelector(`.timer-container[data-group="${groupId}"] .timer-display`);

    if (!timerEl) {
      console.error(`找不到计时器元素，groupId: ${groupId}`);
      return;
    }

    // 如果计时器正在运行，先停止它
    if (timer.isRunning) {
      clearInterval(timer.intervalId);
      timer.isRunning = false;

      // 更新UI状态
      timerBtn.innerHTML = '<i class="fas fa-play"></i>';
      timerBtn.classList.remove("active");
      if (timerDisplay) timerDisplay.classList.remove("active");
    }

    // 重置计时器数据
    timer.elapsedTime = 0;
    timer.startTime = 0;

    // 更新显示
    updateTimerDisplay(groupId, 0);

    // 添加一个简单的动画效果提示重置成功
    timerEl.classList.add("reset-animation");
    setTimeout(() => {
      timerEl.classList.remove("reset-animation");
    }, 500);
  }

  // 更新计时器显示
  function updateTimerDisplay(groupId, elapsedTime) {
    const timerEl = document.querySelector(`.timer[data-group="${groupId}"]`);
    if (!timerEl) return;

    // 将毫秒转换为分钟和秒
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // 格式化显示
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    timerEl.textContent = formattedTime;
  }

  // 初始化控件和事件监听
  function initializeControls() {
    // 初始化每组问题的控件
    questionGroups.forEach((group) => {
      const groupId = group.id;

      // 获取元素
      const correctSlider = document.querySelector(`.correct-slider[data-group="${groupId}"]`);
      const totalInput = document.getElementById(`total${groupId}`);
      const correctInput = document.getElementById(`correct${groupId}`);
      const correctDisplay = document.querySelector(`#group${groupId} .correct-display`);

      // 设置初始显示
      updateGroupScore(groupId);

      // 答对题数滑块事件
      correctSlider.addEventListener("input", () => {
        const value = parseInt(correctSlider.value);
        correctInput.value = value;
        correctDisplay.textContent = value;
        updateGroupScore(groupId);
      });

      // 总题数输入框事件
      totalInput.addEventListener("change", () => {
        let value = parseInt(totalInput.value) || 0;
        if (value < 0) value = 0;

        totalInput.value = value;

        // 更新答对题数滑块最大值
        correctSlider.max = value;

        // 自动设置答对题数等于总题数
        correctInput.value = value;
        correctSlider.value = value;
        correctDisplay.textContent = value;

        updateGroupScore(groupId);
      });

      // 答对题数输入框事件
      correctInput.addEventListener("change", () => {
        let value = parseInt(correctInput.value) || 0;
        const totalValue = parseInt(totalInput.value) || 0;

        if (value < 0) value = 0;
        if (value > totalValue) value = totalValue;

        correctInput.value = value;
        correctSlider.value = value;
        correctDisplay.textContent = value;

        updateGroupScore(groupId);
      });
    });

    // 获取所有加减按钮并添加事件监听
    const decrementBtns = document.querySelectorAll(".decrement-btn");
    const incrementBtns = document.querySelectorAll(".increment-btn");

    decrementBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-for");
        if (!targetId) return;

        const input = document.getElementById(targetId);
        if (!input) return;

        let value = parseInt(input.value) - 1;
        if (value < 0) value = 0;
        input.value = value;

        // 如果是更改总题数，且总题数小于答对题数，则自动调整答对题数
        if (targetId.startsWith("total")) {
          const groupId = targetId.replace("total", "");
          const correctInput = document.getElementById(`correct${groupId}`);
          const correctSlider = document.querySelector(`.correct-slider[data-group="${groupId}"]`);
          const correctDisplay = document.querySelector(`#group${groupId} .correct-display`);

          // 设置最大值
          correctSlider.max = value;

          // 如果答对题数大于总题数，调整为总题数
          if (parseInt(correctInput.value) > value) {
            correctInput.value = value;
            correctSlider.value = value;
            correctDisplay.textContent = value;
          }
        }

        // 触发change事件以更新其他相关元素
        const event = new Event("change");
        input.dispatchEvent(event);
      });
    });

    incrementBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-for");
        if (!targetId) return;

        const input = document.getElementById(targetId);
        if (!input) return;

        let value = parseInt(input.value) + 1;
        const max = parseInt(input.getAttribute("max") || "999");
        if (value > max) value = max;

        input.value = value;

        // 如果是更改总题数，则自动增加答对题数
        if (targetId.startsWith("total")) {
          const groupId = targetId.replace("total", "");
          const correctInput = document.getElementById(`correct${groupId}`);
          const correctSlider = document.querySelector(`.correct-slider[data-group="${groupId}"]`);
          const correctDisplay = document.querySelector(`#group${groupId} .correct-display`);

          // 设置最大值并将答对题数设置为总题数
          correctSlider.max = value;
          correctInput.value = value;
          correctSlider.value = value;
          correctDisplay.textContent = value;
        }

        // 触发change事件以更新其他相关元素
        const event = new Event("change");
        input.dispatchEvent(event);
      });
    });

    // 初始化总分显示
    updateTotalScore();
  }

  // 更新单个问题组的分数显示
  function updateGroupScore(groupId) {
    const group = questionGroups.find((g) => g.id === parseInt(groupId));
    const totalInput = document.getElementById(`total${groupId}`);
    const correctInput = document.getElementById(`correct${groupId}`);
    const groupScoreElement = document.querySelector(`#group${groupId} .group-score`);
    const scoreBar = document.querySelector(`#group${groupId} .score-bar`);

    const totalQuestions = parseInt(totalInput.value) || 0;
    const correctQuestions = parseInt(correctInput.value) || 0;
    const maxScore = totalQuestions * group.pointsPerQuestion;
    const score = correctQuestions * group.pointsPerQuestion;

    groupScoreElement.textContent = `${score}/${maxScore}`;

    // 更新进度条
    const percentage = totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0;
    scoreBar.style.width = `${percentage}%`;

    // 根据百分比更改颜色
    if (percentage < 40) {
      scoreBar.style.backgroundColor = "var(--warning-color)";
    } else if (percentage < 70) {
      scoreBar.style.backgroundColor = "#ffbf69";
    } else {
      scoreBar.style.backgroundColor = "var(--success-color)";
    }

    // 更新总分
    updateTotalScore();
  }

  // 更新总分和进度条
  function updateTotalScore() {
    let totalScore = 0;
    let totalPossibleScore = 0;

    questionGroups.forEach((group) => {
      const totalInput = document.getElementById(`total${group.id}`);
      const correctInput = document.getElementById(`correct${group.id}`);

      const totalQuestions = parseInt(totalInput.value) || 0;
      const correctQuestions = parseInt(correctInput.value) || 0;

      totalScore += correctQuestions * group.pointsPerQuestion;
      totalPossibleScore += totalQuestions * group.pointsPerQuestion;
    });

    // 更新分数显示
    document.getElementById("score").textContent = totalScore;
    document.getElementById("totalPossibleScore").textContent = totalPossibleScore;

    // 更新总进度条
    const percentage = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
    const progressBar = document.getElementById("total-progress-bar");
    progressBar.style.width = `${percentage}%`;
    document.getElementById("percentage").textContent = `${Math.round(percentage)}%`;

    // 根据百分比更改总进度条颜色
    if (percentage < 40) {
      progressBar.style.backgroundColor = "var(--warning-color)";
    } else if (percentage < 70) {
      progressBar.style.backgroundColor = "#ffbf69";
    } else {
      progressBar.style.backgroundColor = "var(--success-color)";
    }
  }

  // 计算并显示总分
  function calculateScore() {
    updateTotalScore();

    // 添加动画效果，让用户知道触发了计算
    const totalScoreElement = document.querySelector(".total-score");
    totalScoreElement.classList.add("pulse-animation");

    setTimeout(() => {
      totalScoreElement.classList.remove("pulse-animation");
    }, 1000);
  }
});
