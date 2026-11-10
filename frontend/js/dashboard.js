(() => {
  if (!Auth.requireLogin()) return;
  Layout.mount({ active: "dashboard.html" });
  Utils.hydrateIcons();
  const $ = (id) => document.getElementById(id);
  const chart = new Chart($("live-chart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Nhiệt độ",
          borderColor: Utils.COLORS.TEMPERATURE,
          yAxisID: "y",
        },
        { label: "Độ ẩm", borderColor: Utils.COLORS.HUMIDITY, yAxisID: "y" },
        { label: "Ánh sáng", borderColor: Utils.COLORS.LIGHT, yAxisID: "y1" },
      ].map((d) => ({
        ...d,
        data: [],
        borderWidth: 2.6,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.36,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 6, maxRotation: 0 },
        },
        y: { min: 0, max: 100, grid: { color: "#eef1f6" } },
        y1: { position: "right", min: 0, max: 1023, grid: { display: false } },
      },
    },
  });
  Theme.styleChart(chart);
  document.addEventListener("themechange", () => Theme.styleChart(chart));
  function syncChartControls() {
    const all = chart.data.datasets.every((_, i) => chart.isDatasetVisible(i));
    $("show-all").classList.toggle("active", all);
    document.querySelectorAll(".legend-toggle").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(chart.isDatasetVisible(Number(button.dataset.dataset))),
      );
    });
    chart.options.scales.y1.display = chart.isDatasetVisible(2);
    chart.update();
  }
  document.querySelectorAll(".legend-toggle").forEach((button) =>
    button.addEventListener("click", () => {
      const i = Number(button.dataset.dataset);
      chart.setDatasetVisibility(i, !chart.isDatasetVisible(i));
      syncChartControls();
    }),
  );
  $("show-all").addEventListener("click", () => {
    chart.data.datasets.forEach((_, i) => chart.setDatasetVisibility(i, true));
    syncChartControls();
  });
  const descriptions = {
    temp: (v) =>
      v < 18 ? "Lạnh" : v <= 28 ? "Dễ chịu" : v <= 33 ? "Ấm" : "Nóng",
    hum: (v) => (v < 40 ? "Khô" : v <= 70 ? "Thoải mái" : "Ẩm"),
    light: (v) => (v < 300 ? "Tối" : v < 700 ? "Vừa" : "Sáng"),
  };
  function renderMetric(key, sensor) {
    const value = $("v-" + key),
      note = $("n-" + key);
    if (!sensor) {
      value.textContent = "--";
      note.textContent = "Chưa có dữ liệu";
      return;
    }
    value.innerHTML = `${Utils.fmtNumber(sensor.value)} <small>${Utils.esc(sensor.unit)}</small>`;
    note.textContent = descriptions[key](sensor.value);
  }
  const pendingDevices = new Map();
  function renderDevices(devices) {
    // Tạo 2 công tắc
    $("devices").innerHTML = devices
      .map((d) => {
        const on = d.reportedState === "ON";
        const pendingState = pendingDevices.get(d.type);
        const busy = pendingState !== undefined;
        const stateLabel = busy
          ? pendingState === "ON" ? "ĐANG BẬT…" : "ĐANG TẮT…"
          : on ? "ĐANG BẬT" : "ĐANG TẮT";
        //JavaScript chọn class
        return `<article class="device-tile ${on ? "is-on" : ""} ${busy ? "is-pending" : ""}" data-type="${d.type}" aria-busy="${busy}">
        <div class="device-top"><span class="device-symbol">${Utils.icon(d.type === "FAN" ? "fan" : "bulb")}</span>
          <span class="device-state" role="status">${busy ? '<span class="loading-spinner" aria-hidden="true"></span>' : ""}${stateLabel}</span></div>
        <div><h4>${Utils.esc(d.name)}</h4><p>Phòng khách · ${d.type === "FAN" ? "Thiết bị làm mát" : "Chiếu sáng"}</p></div>
        <div class="device-footer"><span>Trạng thái</span><button type="button" class="switch" role="switch"
          aria-label="${busy ? (pendingState === "ON" ? "Đang bật" : "Đang tắt") : (on ? "Tắt" : "Bật")} ${Utils.esc(d.name)}" aria-checked="${on}" data-type="${d.type}" ${busy ? "disabled" : ""}>
          <span></span></button></div></article>`;
      })
      .join("");
  }
  $("devices").addEventListener("click", async (e) => {
    //Xử lý khi bấm
    const button = e.target.closest(".switch");
    if (!button || button.disabled) return;
    const type = button.dataset.type;
    if (pendingDevices.has(type)) return;
    const device = Api.actuators().find((d) => d.type === type);
    const nextState = device.reportedState === "ON" ? "OFF" : "ON";
    pendingDevices.set(type, nextState);
    renderDevices(Api.actuators());
    try {
      await Api.setDevice(type, nextState);
      Utils.toast(`Đã ${nextState === "ON" ? "bật" : "tắt"} ${device.name}`, "success");
    } catch (error) {
      Utils.toast(error.message || "Không thể điều khiển thiết bị", "error");
    } finally {
      pendingDevices.delete(type);
      renderDevices(Api.actuators());
    }
  });
  function renderRecent(actions) {
    $("recent").innerHTML = actions.length
      ? actions
          .map(
            (a) =>
              `<div class="recent-item"><span class="recent-icon">${Utils.icon(a.actuatorType === "FAN" ? "fan" : "bulb")}</span>
        <span class="recent-main"><strong>${Utils.esc(a.actuatorName)} · ${Utils.ACTION_LABEL[a.action]}</strong>
          <small>${Utils.fmtDateTime(a.createdAt)}</small></span>
        <span class="status-badge ${Utils.STATUS_CLASS[a.status]}">${Utils.STATUS_LABEL[a.status]}</span></div>`,
          )
          .join("")
      : '<p class="empty">Chưa có lịch sử điều khiển</p>';
  }
  function render() {
    const latest = Api.sensorsLatest();
    renderMetric("temp", latest.temperature);
    renderMetric("hum", latest.humidity);
    renderMetric("light", latest.light);
    renderDevices(Api.actuators());
    renderRecent(Api.actions({ limit: 3 }).items);
    const rows = Api.sensorsHistory({ limit: 90 }).chart;
    const grouped = ["TEMPERATURE", "HUMIDITY", "LIGHT"].map((type) =>
      rows.filter((row) => row.type === type).slice(-30),
    );
    chart.data.labels = (grouped.find((rows) => rows.length) || []).map((row) => Utils.fmtTime(row.recordedAt));
    chart.data.datasets.forEach((dataset, i) => {
      dataset.data = grouped[i].map((row) => row.value);
    });
    chart.update();
  }
  document.addEventListener("backend:data", render);
  Api.refresh().catch(error => Utils.toast(error.message, 'error'));
  setInterval(() => Api.refresh().catch(() => {}), 3000);
})();
