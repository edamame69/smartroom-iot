(() => {
  if (!Auth.requireLogin()) return;
  Layout.mount({ active: "action-history.html" });
  Utils.hydrateIcons();
  const $ = (id) => document.getElementById(id);
  const state = { actuator: "", action: "", status: "", time: "", page: 1, limit: 10 };
  function load() {
    const res = Api.actions(state);
    $("tbody").innerHTML = res.items.length
      ? res.items
          .map((row) => {
            return `<tr>
        <td class="row-id">#${String(row.id).padStart(3, "0")}</td>
        <td><span class="sensor-name"><span class="sensor-icon sensor-${row.actuatorType.toLowerCase()}">
          ${Utils.icon(row.actuatorType === "FAN" ? "fan" : "bulb")}</span>${Utils.esc(row.actuatorName)}</span></td>
        <td><span class="action-tag ${row.action === "ON" ? "tag-on" : ""}">${Utils.ACTION_LABEL[row.action]}</span></td>
        <td><span class="status-badge ${Utils.STATUS_CLASS[row.status]}">${Utils.STATUS_LABEL[row.status]}</span></td>
        <td class="date-cell">${Utils.timeWithCopy(row.createdAt)}</td>
        <td><span class="response-time">${row.status === "PENDING" ? "Đang xử lý" : row.responseTimeMs == null ? "—" : (row.responseTimeMs / 1000).toFixed(1) + " giây"}</span></td>
      </tr>`;
          })
          .join("")
      : '<tr><td class="empty" colspan="6">Không tìm thấy hành động phù hợp.</td></tr>';
    const from = res.total ? (res.page - 1) * res.limit + 1 : 0;
    $("count-text").textContent = `${res.total} hành động phù hợp`;
    $("total-chip").textContent = `${Api.counts().actions} hành động`;
    $("range-text").textContent =
      `Hiển thị ${from}–${Math.min(res.page * res.limit, res.total)} / ${res.total}`;
    Pager.render(
      $("pager"),
      res.page,
      Math.ceil(res.total / res.limit),
      (page) => {
        state.page = page;
        load();
      },
    );
  }
  Utils.bindTimeCopy($("tbody"));
  $("f-time").addEventListener("input", () => {
    const parsed = Utils.parseSmartDatetime($("f-time").value);
    $("precision-hint").textContent = parsed ? parsed.label : "";
  });
  $("filter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const time = $("f-time").value.trim();
    if (time && !Utils.parseSmartDatetime(time)) {
      Utils.setFieldError(
        "f-time",
        "Nhập thời gian từ năm đến giây, ví dụ 2026-10-15 10:30",
      );
      return;
    }
    Utils.setFieldError("f-time", "");
    Object.assign(state, {
      time,
      actuator: $("f-actuator").value,
      action: $("f-action").value,
      status: $("f-status").value,
      page: 1,
    });
    load();
  });
  $("btn-reset").addEventListener("click", () => {
    ["f-time", "f-actuator", "f-action", "f-status"].forEach((id) => {
      $(id).value = "";
    });
    $("precision-hint").textContent = "";
    Utils.setFieldError("f-time", "");
    Object.assign(state, { time: "", actuator: "", action: "", status: "", page: 1 });
    load();
  });
  $("page-size").addEventListener("change", () => {
    const input = $("page-size"),
      limit = Number(input.value);
    if (
      !input.validity.valid ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      input.reportValidity();
      return;
    }
    state.limit = limit;
    state.page = 1;
    load();
  });
  $("page-size").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  });
  document.addEventListener("backend:data", load);
  Api.refresh().catch(error => Utils.toast(error.message, 'error'));
  setInterval(() => Api.refresh().catch(() => {}), 5000);
})();
