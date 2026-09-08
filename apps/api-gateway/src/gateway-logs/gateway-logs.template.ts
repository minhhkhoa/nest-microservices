//- giao diện web dashboard hiển thị log và trace thời gian thực
export const getLogsDashboardHtml = (): string => `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Microservices Log & Trace Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-main: #0b0f19;
      --bg-surface: #111827;
      --bg-surface-elevated: #1e293b;
      --border-color: #1e293b;
      --border-highlight: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --accent-primary: #38bdf8;
      --accent-success: #10b981;
      --accent-warning: #f59e0b;
      --accent-danger: #ef4444;
      --accent-purple: #a855f7;
      --accent-indigo: #6366f1;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-main);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    header {
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      padding: 0.85rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, #0284c7, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
    }

    .brand h1 {
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .brand p {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .connection-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-success);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-success);
      box-shadow: 0 0 10px var(--accent-success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    /* Guide Bar */
    .guide-bar {
      background: rgba(56, 189, 248, 0.06);
      border-bottom: 1px solid rgba(56, 189, 248, 0.15);
      padding: 0.55rem 1.5rem;
      font-size: 0.8rem;
      color: #7dd3fc;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Toolbar */
    .toolbar {
      padding: 0.85rem 1.5rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
    }

    .filters-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      flex: 1;
    }

    .search-box {
      position: relative;
      min-width: 300px;
      flex: 1;
      max-width: 450px;
    }

    .search-box input {
      width: 100%;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.5rem 1rem 0.5rem 2.25rem;
      color: #fff;
      font-size: 0.85rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-box input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-dim);
      font-size: 0.85rem;
    }

    .pill-group {
      display: flex;
      background: var(--bg-surface-elevated);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      gap: 2px;
    }

    .pill-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.35rem 0.7rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .pill-btn:hover { color: #fff; }
    .pill-btn.active {
      background: #0284c7;
      color: #fff;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
    }

    .actions-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn {
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      border: 1px solid var(--border-color);
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      transition: all 0.2s;
    }

    .btn:hover { background: #334155; border-color: #475569; }
    .btn-danger { color: #f87171; }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; }

    /* Trace Banner */
    .trace-banner {
      display: none;
      background: linear-gradient(90deg, rgba(14, 165, 233, 0.12), rgba(99, 102, 241, 0.12));
      border-bottom: 1px solid rgba(56, 189, 248, 0.3);
      padding: 0.75rem 1.5rem;
      align-items: center;
      justify-content: space-between;
    }

    .trace-banner.visible { display: flex; }

    .trace-chain {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }

    /* Main Log Container */
    main {
      flex: 1;
      padding: 1.25rem 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .empty-state {
      margin: auto;
      text-align: center;
      padding: 4rem 1rem;
      color: var(--text-dim);
    }

    .empty-state-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.6; }

    /* Log Item Card */
    .log-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      transition: all 0.15s ease;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .log-card:hover {
      border-color: var(--border-highlight);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    .log-card.level-error {
      border-left: 4px solid var(--accent-danger);
      background: rgba(239, 68, 68, 0.02);
    }

    .log-card.level-warn {
      border-left: 4px solid var(--accent-warning);
    }

    .log-card.level-info {
      border-left: 4px solid var(--accent-primary);
    }

    .log-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .badge {
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .badge-service {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .badge-api-gateway { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); }
    .badge-order-service { background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3); }
    .badge-inventory-service { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); }
    .badge-notification-service { background: rgba(236, 72, 153, 0.15); color: #f472b6; border-color: rgba(236, 72, 153, 0.3); }
    .badge-auth-service { background: rgba(129, 140, 248, 0.15); color: #818cf8; border-color: rgba(129, 140, 248, 0.3); }

    .badge-level-info { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .badge-level-warn { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .badge-level-error { background: rgba(239, 68, 68, 0.15); color: #f87171; }

    .badge-correlation {
      background: rgba(234, 179, 8, 0.12);
      color: #facc15;
      border: 1px dashed rgba(234, 179, 8, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: all 0.15s;
    }

    .badge-correlation:hover {
      background: rgba(234, 179, 8, 0.25);
      border-color: #facc15;
      transform: scale(1.02);
    }

    .log-time { color: var(--text-dim); font-size: 0.75rem; margin-left: auto; }

    .log-body {
      color: var(--text-main);
      font-size: 0.85rem;
      line-height: 1.45;
      word-break: break-all;
    }

    /* Details Panel */
    .details-toggle-btn {
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.25);
      color: #38bdf8;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      align-self: flex-start;
      margin-top: 0.2rem;
      transition: all 0.15s;
    }

    .details-toggle-btn:hover {
      background: rgba(56, 189, 248, 0.18);
      border-color: #38bdf8;
    }

    .details-panel {
      display: none;
      margin-top: 0.5rem;
      padding: 0.85rem;
      border-radius: 8px;
      background: #0d131f;
      border: 1px solid var(--border-highlight);
      font-size: 0.78rem;
    }

    .details-panel.open { display: block; }

    .data-section {
      margin-bottom: 0.85rem;
    }

    .data-section:last-child { margin-bottom: 0; }

    .data-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .data-title.input { color: #38bdf8; }
    .data-title.output { color: #34d399; }
    .data-title.meta { color: #c084fc; }
    .data-title.error { color: #f87171; }

    .json-box {
      background: #080c14;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 0.6rem 0.75rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      color: #e2e8f0;
      line-height: 1.4;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Footer */
    footer {
      padding: 0.75rem 1.5rem;
      border-top: 1px solid var(--border-color);
      background: var(--bg-surface);
      font-size: 0.75rem;
      color: var(--text-dim);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <header>
    <div class="brand">
      <div class="brand-icon">⚡</div>
      <div>
        <h1>Microservices Log & Trace Hub</h1>
        <p>Realtime Distributed Observability Dashboard</p>
      </div>
    </div>
    <div class="connection-badge" id="connectionStatus">
      <div class="pulse-dot"></div>
      <span>Realtime Stream Active</span>
    </div>
  </header>

  <!-- Guide Banner -->
  <div class="guide-bar">
    <span>💡 <strong>Hướng dẫn xem Data:</strong> Bấm nút <strong>[🔍 Xem Data & Payload]</strong> trên bất kỳ dòng log nào để mở xem toàn bộ dữ liệu Request Body và Response Data. Click vào mã màu vàng <strong>🔗 Correlation ID</strong> để gom nhóm toàn bộ chuỗi request!</span>
  </div>

  <!-- Toolbar Controls -->
  <div class="toolbar">
    <div class="filters-group">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" placeholder="Lọc theo Correlation ID hoặc từ khóa bất kỳ...">
      </div>

      <!-- Service Filter -->
      <div class="pill-group" id="serviceFilter">
        <button class="pill-btn active" data-service="ALL">Tất cả services</button>
        <button class="pill-btn" data-service="api-gateway">api-gateway</button>
        <button class="pill-btn" data-service="order-service">order-service</button>
        <button class="pill-btn" data-service="inventory-service">inventory-service</button>
        <button class="pill-btn" data-service="notification-service">notification-service</button>
        <button class="pill-btn" data-service="auth-service">auth-service</button>
      </div>

      <!-- Level Filter -->
      <div class="pill-group" id="levelFilter">
        <button class="pill-btn active" data-level="ALL">Tất cả levels</button>
        <button class="pill-btn" data-level="info">INFO</button>
        <button class="pill-btn" data-level="warn">WARN</button>
        <button class="pill-btn" data-level="error">ERROR</button>
      </div>
    </div>

    <div class="actions-group">
      <button class="btn" id="pauseBtn">⏸️ Tạm dừng stream</button>
      <button class="btn btn-danger" id="clearBtn">🗑️ Xóa danh sách</button>
    </div>
  </div>

  <!-- Active Trace Flow Banner -->
  <div class="trace-banner" id="traceBanner">
    <div class="trace-chain" id="traceChain">
      <span>Đang lọc theo Trace:</span>
      <strong id="activeTraceId"></strong>
    </div>
    <button class="btn" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" id="clearTraceFilterBtn">✕ Bỏ lọc trace</button>
  </div>

  <!-- Log Entries Feed -->
  <main id="logContainer">
    <div class="empty-state" id="emptyState">
      <div class="empty-state-icon">📡</div>
      <h3>Đang lắng nghe log mới từ các Microservices...</h3>
      <p>Thực hiện bất kỳ request nào qua API Gateway để quan sát dấu vết luồng xử lý thời gian thực.</p>
    </div>
  </main>

  <!-- Status Bar -->
  <footer>
    <span id="logCount">Hiển thị: 0 logs</span>
    <span>Redis Stream Connected (Cổng 6380)</span>
  </footer>

  <script>
    let logs = [];
    let isPaused = false;
    let selectedService = 'ALL';
    let selectedLevel = 'ALL';
    let searchQuery = '';
    const MAX_DISPLAY = 300;

    const logContainer = document.getElementById('logContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const logCountSpan = document.getElementById('logCount');
    const traceBanner = document.getElementById('traceBanner');
    const activeTraceIdSpan = document.getElementById('activeTraceId');
    const clearTraceFilterBtn = document.getElementById('clearTraceFilterBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const clearBtn = document.getElementById('clearBtn');
    const connectionStatus = document.getElementById('connectionStatus');

    // Khởi tạo SSE (Server-Sent Events) kết nối stream realtime
    function initEventSource() {
      const eventSource = new EventSource('/logs/stream');

      eventSource.onmessage = (event) => {
        if (isPaused) return;
        try {
          const logItem = JSON.parse(event.data);
          addLog(logItem);
        } catch (err) {
          console.error('Lỗi phân tích log data:', err);
        }
      };

      eventSource.onerror = () => {
        connectionStatus.innerHTML = '<span style="color: #f87171;">⚠️ Đang kết nối lại...</span>';
      };

      eventSource.onopen = () => {
        connectionStatus.innerHTML = '<div class="pulse-dot"></div><span>Realtime Stream Active</span>';
      };
    }

    // Tải trước 100 log lịch sử từ Redis khi mở trang
    async function loadHistory() {
      try {
        const res = await fetch('/logs/history');
        if (res.ok) {
          const history = await res.json();
          if (Array.isArray(history)) {
            history.forEach(item => addLog(item, false));
            renderLogs();
          }
        }
      } catch (err) {
        console.warn('Không tải được log lịch sử:', err);
      }
    }

    function addLog(item, shouldRender = true) {
      logs.unshift(item);
      if (logs.length > MAX_DISPLAY) {
        logs.pop();
      }
      if (shouldRender) {
        renderLogs();
      }
    }

    function filterLogs() {
      return logs.filter(item => {
        if (selectedService !== 'ALL' && item.service !== selectedService) return false;
        if (selectedLevel !== 'ALL' && item.level !== selectedLevel) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCorr = item.correlationId && item.correlationId.toLowerCase().includes(q);
          const matchMsg = item.message && item.message.toLowerCase().includes(q);
          const matchSvc = item.service && item.service.toLowerCase().includes(q);
          if (!matchCorr && !matchMsg && !matchSvc) return false;
        }
        return true;
      });
    }

    function renderLogs() {
      const filtered = filterLogs();
      logCountSpan.textContent = \`Hiển thị: \${filtered.length} / \${logs.length} logs\`;

      if (filtered.length === 0) {
        logContainer.innerHTML = '';
        logContainer.appendChild(emptyState);
        return;
      }

      logContainer.innerHTML = '';
      filtered.forEach((log, index) => {
        const card = document.createElement('div');
        card.className = \`log-card level-\${log.level || 'info'}\`;

        const serviceClass = \`badge-\${log.service || 'unknown'}\`;
        const timeFormatted = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';

        const corrBadge = log.correlationId
          ? \`<span class="badge badge-correlation" onclick="filterByCorrelation('\${log.correlationId}')" title="Click để lọc toàn bộ chuỗi trace này">🔗 \${log.correlationId}</span>\`
          : '';

        // Xây dựng các khối dữ liệu Data chi tiết
        const d = log.details || {};
        const inputData = d.requestBody || d.payload;
        const outputData = d.responseData || d.result;
        const hasDetails = inputData || outputData || d.durationMs !== undefined || log.stack || Object.keys(d).length > 0;

        let sectionsHtml = '';
        if (inputData) {
          sectionsHtml += \`
            <div class="data-section">
              <div class="data-title input">📥 Dữ liệu gửi lên (Request Body / Payload)</div>
              <div class="json-box">\${escapeHtml(JSON.stringify(inputData, null, 2))}</div>
            </div>
          \`;
        }

        if (outputData) {
          sectionsHtml += \`
            <div class="data-section">
              <div class="data-title output">📤 Dữ liệu kết quả (Response Data / Output)</div>
              <div class="json-box">\${escapeHtml(JSON.stringify(outputData, null, 2))}</div>
            </div>
          \`;
        }

        // Thông số kỹ thuật
        const metaInfo = {
          duration: d.durationMs !== undefined ? \`+\${d.durationMs}ms\` : undefined,
          statusCode: d.statusCode,
          ip: d.ip,
          pattern: d.pattern,
          transport: d.transport,
          success: d.success,
          type: log.type || d.type,
        };
        const cleanMeta = Object.fromEntries(Object.entries(metaInfo).filter(([_, v]) => v !== undefined));

        if (Object.keys(cleanMeta).length > 0) {
          sectionsHtml += \`
            <div class="data-section">
              <div class="data-title meta">⏱️ Thông số kỹ thuật & Metadata</div>
              <div class="json-box">\${escapeHtml(JSON.stringify(cleanMeta, null, 2))}</div>
            </div>
          \`;
        }

        if (log.stack || d.error) {
          sectionsHtml += \`
            <div class="data-section">
              <div class="data-title error">❌ Chi tiết lỗi & Stack Trace</div>
              <div class="json-box" style="color: #f87171; border-color: rgba(239, 68, 68, 0.4);">\${escapeHtml(d.error || '')}\${log.stack ? '\\n\\n' + escapeHtml(log.stack) : ''}</div>
            </div>
          \`;
        }

        const detailsButtonHtml = hasDetails
          ? \`<button class="details-toggle-btn" onclick="toggleDetails(this)">🔍 Xem Data & Payload</button>
             <div class="details-panel">\${sectionsHtml}</div>\`
          : '';

        card.innerHTML = \`
          <div class="log-header">
            <span class="badge badge-service \${serviceClass}">\${log.service || 'service'}</span>
            <span class="badge badge-level-\${log.level}">\${(log.level || 'INFO').toUpperCase()}</span>
            \${log.context ? \`<span style="color: var(--text-dim);">[\${log.context}]</span>\` : ''}
            \${corrBadge}
            <span class="log-time">\${timeFormatted}</span>
          </div>
          <div class="log-body">\${escapeHtml(log.message || '')}</div>
          \${detailsButtonHtml}
        \`;

        logContainer.appendChild(card);
      });
    }

    function escapeHtml(text) {
      if (typeof text !== 'string') return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    window.toggleDetails = function(btn) {
      const panel = btn.nextElementSibling;
      if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        btn.innerHTML = '🔍 Xem Data & Payload';
      } else {
        panel.classList.add('open');
        btn.innerHTML = '✕ Ẩn Data & Payload';
      }
    };

    window.filterByCorrelation = function(corrId) {
      searchInput.value = corrId;
      searchQuery = corrId;
      traceBanner.classList.add('visible');
      activeTraceIdSpan.textContent = corrId;
      renderLogs();
    };

    clearTraceFilterBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      traceBanner.classList.remove('visible');
      renderLogs();
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (!searchQuery) {
        traceBanner.classList.remove('visible');
      }
      renderLogs();
    });

    // Service Filters
    document.querySelectorAll('#serviceFilter .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#serviceFilter .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedService = btn.getAttribute('data-service');
        renderLogs();
      });
    });

    // Level Filters
    document.querySelectorAll('#levelFilter .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#levelFilter .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLevel = btn.getAttribute('data-level');
        renderLogs();
      });
    });

    // Pause / Resume
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? '▶️ Tiếp tục stream' : '⏸️ Tạm dừng stream';
      pauseBtn.style.color = isPaused ? '#38bdf8' : 'inherit';
    });

    // Clear
    clearBtn.addEventListener('click', async () => {
      logs = [];
      renderLogs();
      try {
        await fetch('/logs/history', { method: 'DELETE' });
      } catch {}
    });

    // Khởi chạy khi load trang
    loadHistory().then(() => initEventSource());
  </script>
</body>
</html>`;
