//- template giao diện web dashboard hiển thị log và trace thời gian thực nâng cao
export const getLogsDashboardHtml = (): string => `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Microservices Log & Trace Observability Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-main: #090d16;
      --bg-surface: #0f172a;
      --bg-surface-elevated: #1e293b;
      --bg-surface-hover: #26354a;
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
      --accent-pink: #ec4899;
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

    /* Top Header */
    header {
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      padding: 0.85rem 1.75rem;
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
    }

    .brand h1 {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(90deg, #f8fafc, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand p {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .connection-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--accent-success);
      font-weight: 600;
    }

    .connection-badge.paused {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
      color: var(--accent-warning);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 10px currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }

    /* Live Metrics Cards Bar */
    .metrics-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.85rem;
      padding: 0.85rem 1.75rem;
      background: rgba(15, 23, 42, 0.5);
      border-bottom: 1px solid var(--border-color);
    }

    .metric-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: border-color 0.2s;
    }

    .metric-card:hover {
      border-color: var(--border-highlight);
    }

    .metric-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .metric-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .metric-value {
      font-size: 1.35rem;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
    }

    .metric-icon {
      font-size: 1.5rem;
      opacity: 0.8;
    }

    /* Toolbar Controls */
    .toolbar {
      padding: 0.85rem 1.75rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .toolbar-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      justify-content: space-between;
    }

    .filters-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      align-items: center;
      flex: 1;
    }

    .search-box {
      position: relative;
      min-width: 280px;
      flex: 1;
      max-width: 420px;
    }

    .search-box input {
      width: 100%;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.5rem 1rem 0.5rem 2.25rem;
      color: #fff;
      font-size: 0.82rem;
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
      flex-wrap: wrap;
    }

    .pill-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.35rem 0.7rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .pill-btn:hover { color: #fff; }
    .pill-btn.active {
      background: #0284c7;
      color: #fff;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
    }

    .pill-btn.danger.active {
      background: #ef4444;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    }

    .pill-btn.warn.active {
      background: #f59e0b;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    }

    .actions-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.78rem;
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

    .btn:hover { background: var(--bg-surface-hover); border-color: var(--border-highlight); }
    .btn-primary { background: #0284c7; border-color: #0369a1; color: #fff; }
    .btn-primary:hover { background: #0369a1; }
    .btn-danger { color: #f87171; }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; }

    /* Trace Banner */
    .trace-banner {
      display: none;
      background: linear-gradient(90deg, rgba(14, 165, 233, 0.12), rgba(99, 102, 241, 0.12));
      border-bottom: 1px solid rgba(56, 189, 248, 0.3);
      padding: 0.65rem 1.75rem;
      align-items: center;
      justify-content: space-between;
    }

    .trace-banner.visible { display: flex; }

    .trace-chain {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }

    /* Main Log Container */
    main {
      flex: 1;
      padding: 1.25rem 1.75rem;
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

    .empty-state-icon { font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.5; }

    /* Log Item Card */
    .log-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0.85rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      transition: all 0.15s ease;
      animation: fadeIn 0.18s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .log-card:hover {
      border-color: var(--border-highlight);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    }

    //- kiểu dáng khi dòng log có chi tiết data và payload để click mở rộng
    .log-card.has-details {
      cursor: pointer;
    }

    .log-card.has-details:hover {
      border-color: var(--border-highlight);
      background: rgba(30, 41, 59, 0.45);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    }

    .log-card.has-details.is-open {
      border-color: rgba(56, 189, 248, 0.45);
      background: rgba(15, 23, 42, 0.7);
    }

    .log-card-expand-indicator {
      font-size: 0.68rem;
      color: var(--text-dim);
      margin-left: 0.4rem;
      transition: transform 0.2s ease, color 0.15s ease;
      display: inline-flex;
      align-items: center;
      user-select: none;
    }

    .log-card.has-details:hover .log-card-expand-indicator {
      color: #38bdf8;
    }

    .log-card.has-details.is-open .log-card-expand-indicator {
      transform: rotate(180deg);
      color: #38bdf8;
    }

    .log-card.level-error {
      border-left: 4px solid var(--accent-danger);
      background: rgba(239, 68, 68, 0.025);
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
      padding: 0.18rem 0.55rem;
      border-radius: 5px;
      font-size: 0.7rem;
      font-weight: 700;
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

    .badge-level-info { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-level-warn { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-level-error { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

    .badge-status {
      font-weight: 700;
    }
    .badge-status-2xx { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .badge-status-4xx { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .badge-status-5xx { background: rgba(239, 68, 68, 0.2); color: #f87171; }

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
      font-size: 0.84rem;
      line-height: 1.45;
      word-break: break-all;
    }

    .log-actions-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.2rem;
      flex-wrap: wrap;
    }

    /* Details Panel */
    .details-toggle-btn {
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.25);
      color: #38bdf8;
      padding: 0.28rem 0.65rem;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s;
    }

    .details-toggle-btn:hover {
      background: rgba(56, 189, 248, 0.2);
      border-color: #38bdf8;
    }

    .btn-copy-curl {
      background: rgba(168, 85, 247, 0.08);
      border: 1px solid rgba(168, 85, 247, 0.25);
      color: #c084fc;
      padding: 0.28rem 0.65rem;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s;
    }

    .btn-copy-curl:hover {
      background: rgba(168, 85, 247, 0.2);
      border-color: #c084fc;
    }

    .details-panel {
      display: none;
      margin-top: 0.5rem;
      padding: 1rem;
      border-radius: 8px;
      background: #080d1a;
      border: 1px solid var(--border-highlight);
      font-size: 0.78rem;
      cursor: default;
    }

    .details-panel.open { display: block; }

    .data-section {
      margin-bottom: 1rem;
    }

    .data-section:last-child { margin-bottom: 0; }

    .data-section-header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: #080d1a;
      padding: 0.45rem 0.5rem;
      border-radius: 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .data-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .data-title.input { color: #38bdf8; }
    .data-title.output { color: #34d399; }
    .data-title.meta { color: #c084fc; }
    .data-title.error { color: #f87171; }

    .json-tools {
      display: flex;
      gap: 0.35rem;
    }

    .json-tool-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--text-muted);
      padding: 0.18rem 0.45rem;
      border-radius: 4px;
      font-size: 0.68rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .json-tool-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }

    /* JSON Tree View Component Styles - Thiết kế theo phong cách Postman */
    .json-tree-container {
      background: #1e1e24;
      border: 1px solid #2d3748;
      border-radius: 8px;
      padding: 0.85rem 1.1rem;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 0.81rem;
      line-height: 1.6;
      color: #abb2bf;
    }

    .json-block {
      display: block;
      position: relative;
    }

    .json-block.collapsed > .json-expanded-header,
    .json-block.collapsed > .json-body,
    .json-block.collapsed > .json-line-footer {
      display: none !important;
    }

    .json-block.collapsed > .json-collapsed-header {
      display: flex !important;
    }

    .json-block.expanded > .json-expanded-header {
      display: flex !important;
    }

    .json-block.expanded > .json-collapsed-header {
      display: none !important;
    }

    .json-block.expanded > .json-body {
      display: block !important;
    }

    .json-block.expanded > .json-line-footer {
      display: flex !important;
    }

    .json-line-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.2rem;
      padding: 2px 6px;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease;
      min-height: 24px;
    }

    .json-line-header:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .json-line-footer {
      display: flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease;
    }

    .json-line-footer:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    /* Nút dấu trừ [-] để thu gọn */
    .json-fold-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #cbd5e1;
      font-family: inherit;
      font-size: 0.72rem;
      font-weight: 700;
      line-height: 1;
      width: 17px;
      height: 16px;
      border-radius: 3px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 0 0.35rem;
      padding: 0;
      user-select: none;
      transition: all 0.15s ease;
    }

    .json-fold-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #f87171;
      color: #f87171;
      transform: scale(1.08);
    }

    /* Thẻ [{...}] hoặc {...} khi thu gọn */
    .json-collapsed-tag {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #f6ad55;
      font-family: inherit;
      font-size: 0.76rem;
      font-weight: 600;
      padding: 1px 7px;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      margin: 0 0.3rem;
      user-select: none;
      transition: all 0.15s ease;
      letter-spacing: 0.03em;
    }

    .json-collapsed-tag:hover {
      background: rgba(56, 189, 248, 0.22);
      border-color: #38bdf8;
      color: #38bdf8;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
      transform: scale(1.04);
    }

    .json-entries-badge {
      color: #64748b;
      font-size: 0.72rem;
      margin-left: 0.35rem;
      user-select: none;
    }

    .json-body {
      margin-left: 0.85rem;
      padding-left: 0.85rem;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      transition: border-color 0.2s;
    }

    .json-body:hover {
      border-left-color: rgba(56, 189, 248, 0.4);
    }

    .json-prop-row {
      display: flex;
      align-items: baseline;
      padding: 1px 6px;
      border-radius: 4px;
      min-height: 22px;
      word-break: break-all;
      transition: background-color 0.15s ease;
    }

    .json-prop-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .json-key {
      color: #e06c75;
      font-weight: 500;
    }

    .json-colon {
      color: #94a3b8;
      margin-right: 0.35rem;
    }

    .json-bracket {
      color: #abb2bf;
      font-weight: 600;
    }

    .json-value-string { color: #98c379; word-break: break-all; }
    .json-value-number { color: #61afef; font-weight: 500; }
    .json-value-boolean { color: #e5c07b; font-weight: 600; }
    .json-value-null { color: #7c8594; font-style: italic; }
    .json-comma { color: #64748b; margin-left: 0.15rem; }

    .json-close-bracket {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 1px 5px;
      border-radius: 4px;
      transition: all 0.15s;
    }

    .json-close-bracket:hover {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
    }

    .json-close-bracket:hover .json-collapse-bottom-btn {
      opacity: 1;
      color: #f87171;
    }

    .json-collapse-bottom-btn {
      font-size: 0.65rem;
      color: #64748b;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.05rem 0.35rem;
      border-radius: 3px;
      opacity: 0.45;
      transition: all 0.15s;
    }

    /* Pagination Bar */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1.75rem;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .pagination-info {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .page-btn {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .page-btn:hover:not(:disabled) {
      background: var(--bg-surface-hover);
      border-color: var(--accent-primary);
    }

    .page-btn.active {
      background: #0284c7;
      border-color: #0284c7;
      color: #fff;
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .page-size-selector select {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-color);
      color: #fff;
      padding: 0.3rem 0.5rem;
      border-radius: 6px;
      font-size: 0.78rem;
      outline: none;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #1e293b;
      border: 1px solid var(--accent-primary);
      color: #fff;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.82rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      z-index: 100;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.25s ease;
      pointer-events: none;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* Footer */
    footer {
      padding: 0.65rem 1.75rem;
      border-top: 1px solid var(--border-color);
      background: #0b1120;
      font-size: 0.72rem;
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
        <h1>Microservices Observability Hub</h1>
        <p>Realtime Distributed Logging, Tracing & Metrics Dashboard</p>
      </div>
    </div>
    <div class="header-actions">
      <div class="connection-badge" id="connectionStatus">
        <div class="pulse-dot"></div>
        <span id="connectionText">Realtime Stream Active</span>
      </div>
      <button class="btn" id="pauseBtn">⏸️ Tạm dừng</button>
      <button class="btn btn-primary" id="exportBtn">📥 Xuất JSON</button>
      <button class="btn btn-danger" id="clearBtn">🗑️ Xóa sạch</button>
    </div>
  </header>

  <!-- Live Metrics Bar -->
  <div class="metrics-bar">
    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">Tổng số Logs</span>
        <span class="metric-value" id="metricTotal" style="color: var(--accent-primary);">0</span>
      </div>
      <div class="metric-icon">📊</div>
    </div>
    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">Lỗi Hệ Thống (5xx/Error)</span>
        <span class="metric-value" id="metricErrors" style="color: var(--accent-danger);">0</span>
      </div>
      <div class="metric-icon">❌</div>
    </div>
    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">Cảnh Báo (4xx/Warn)</span>
        <span class="metric-value" id="metricWarns" style="color: var(--accent-warning);">0</span>
      </div>
      <div class="metric-icon">⚠️</div>
    </div>
    <div class="metric-card">
      <div class="metric-info">
        <span class="metric-label">Độ Trễ TB (Avg Latency)</span>
        <span class="metric-value" id="metricLatency" style="color: var(--accent-success);">0ms</span>
      </div>
      <div class="metric-icon">⚡</div>
    </div>
  </div>

  <!-- Toolbar Filters -->
  <div class="toolbar">
    <div class="toolbar-row">
      <div class="filters-group">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="searchInput" placeholder="Tìm theo Correlation ID, Message, URL, Method, IP...">
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
      </div>
    </div>

    <div class="toolbar-row">
      <div class="filters-group">
        <!-- Level Filter -->
        <div class="pill-group" id="levelFilter">
          <button class="pill-btn active" data-level="ALL">Tất cả levels</button>
          <button class="pill-btn" data-level="info">INFO</button>
          <button class="pill-btn warn" data-level="warn">WARN</button>
          <button class="pill-btn danger" data-level="error">ERROR</button>
        </div>

        <!-- Type / Protocol Filter -->
        <div class="pill-group" id="typeFilter">
          <button class="pill-btn active" data-type="ALL">Tất cả giao thức</button>
          <button class="pill-btn" data-type="HTTP">🌐 HTTP Gateway</button>
          <button class="pill-btn" data-type="RPC">⚡ RPC Microservices</button>
        </div>

        <!-- Status Filter -->
        <div class="pill-group" id="statusFilter">
          <button class="pill-btn active" data-status="ALL">Tất cả status</button>
          <button class="pill-btn" data-status="2xx">2xx Thành công</button>
          <button class="pill-btn warn" data-status="4xx">4xx Lỗi client</button>
          <button class="pill-btn danger" data-status="5xx">5xx Lỗi server</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Active Trace Flow Banner -->
  <div class="trace-banner" id="traceBanner">
    <div class="trace-chain" id="traceChain">
      <span>Đang lọc chuỗi vết (Correlation Trace):</span>
      <strong id="activeTraceId" style="color: #facc15;"></strong>
    </div>
    <button class="btn" style="padding: 0.25rem 0.65rem; font-size: 0.74rem;" id="clearTraceFilterBtn">✕ Bỏ lọc trace</button>
  </div>

  <!-- Log Entries Feed -->
  <main id="logContainer">
    <div class="empty-state" id="emptyState">
      <div class="empty-state-icon">📡</div>
      <h3>Đang lắng nghe log mới từ các Microservices...</h3>
      <p>Thực hiện bất kỳ request nào qua API Gateway để quan sát dấu vết luồng xử lý thời gian thực.</p>
    </div>
  </main>

  <!-- Pagination Bar -->
  <div class="pagination-bar">
    <div class="pagination-info" id="paginationInfo">
      Hiển thị: 0 - 0 / 0 logs
    </div>

    <div class="pagination-controls" id="paginationControls">
      <button class="page-btn" id="btnFirstPage" title="Trang đầu">«</button>
      <button class="page-btn" id="btnPrevPage" title="Trang trước">‹</button>
      <div id="pageNumbers" style="display: flex; gap: 0.25rem;"></div>
      <button class="page-btn" id="btnNextPage" title="Trang tiếp">›</button>
      <button class="page-btn" id="btnLastPage" title="Trang cuối">»</button>
    </div>

    <div class="page-size-selector">
      <span>Mỗi trang:</span>
      <select id="pageSizeSelect">
        <option value="10">10 dòng</option>
        <option value="25" selected>25 dòng</option>
        <option value="50">50 dòng</option>
        <option value="100">100 dòng</option>
      </select>
    </div>
  </div>

  <!-- Status Bar -->
  <footer>
    <span id="logSummary">Hệ thống đang hoạt động bình thường</span>
    <span>Redis Pub/Sub & SSE Channel: microservices:logs (Redis 6380)</span>
  </footer>

  <!-- Toast Element -->
  <div class="toast" id="toast">Đã sao chép!</div>

  <script>
    //- lưu trữ danh sách logs và trạng thái ứng dụng
    let logs = [];
    let isPaused = false;
    let selectedService = 'ALL';
    let selectedLevel = 'ALL';
    let selectedType = 'ALL';
    let selectedStatus = 'ALL';
    let searchQuery = '';
    let currentPage = 1;
    let pageSize = 25;
    const MAX_DISPLAY = 1000;

    // DOM Elements
    const logContainer = document.getElementById('logContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const traceBanner = document.getElementById('traceBanner');
    const activeTraceIdSpan = document.getElementById('activeTraceId');
    const clearTraceFilterBtn = document.getElementById('clearTraceFilterBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    const connectionStatus = document.getElementById('connectionStatus');
    const connectionText = document.getElementById('connectionText');
    const paginationInfo = document.getElementById('paginationInfo');
    const pageNumbers = document.getElementById('pageNumbers');
    const btnFirstPage = document.getElementById('btnFirstPage');
    const btnPrevPage = document.getElementById('btnPrevPage');
    const btnNextPage = document.getElementById('btnNextPage');
    const btnLastPage = document.getElementById('btnLastPage');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const toast = document.getElementById('toast');

    // Metrics Elements
    const metricTotal = document.getElementById('metricTotal');
    const metricErrors = document.getElementById('metricErrors');
    const metricWarns = document.getElementById('metricWarns');
    const metricLatency = document.getElementById('metricLatency');

    //- hiển thị thông báo toast
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    }

    //- sao chép nội dung vào clipboard
    function copyToClipboard(text, successMsg = 'Đã sao chép vào bộ nhớ đệm!') {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(successMsg);
      });
    }

    //- cập nhật các thông số metrics thời gian thực
    function updateMetrics() {
      metricTotal.textContent = logs.length;
      const errors = logs.filter(l => l.level === 'error' || (l.details && l.details.statusCode >= 500)).length;
      const warns = logs.filter(l => l.level === 'warn' || (l.details && l.details.statusCode >= 400 && l.details.statusCode < 500)).length;
      metricErrors.textContent = errors;
      metricWarns.textContent = warns;

      const latencyLogs = logs.filter(l => l.details && typeof l.details.durationMs === 'number');
      if (latencyLogs.length > 0) {
        const totalDuration = latencyLogs.reduce((acc, cur) => acc + cur.details.durationMs, 0);
        const avg = Math.round(totalDuration / latencyLogs.length);
        metricLatency.textContent = avg + 'ms';
      } else {
        metricLatency.textContent = '0ms';
      }
    }

    //- khởi tạo kết nối Server-Sent Events để nhận log realtime từ api gateway
    function initEventSource() {
      const eventSource = new EventSource('/logs/stream');

      eventSource.onmessage = (event) => {
        try {
          const logItem = JSON.parse(event.data);
          addLog(logItem);
        } catch (err) {
          console.error('Lỗi phân tích log SSE:', err);
        }
      };

      eventSource.onerror = () => {
        connectionStatus.className = 'connection-badge paused';
        connectionText.textContent = 'Đang kết nối lại...';
      };

      eventSource.onopen = () => {
        if (!isPaused) {
          connectionStatus.className = 'connection-badge';
          connectionText.textContent = 'Realtime Stream Active';
        }
      };
    }

    //- tải lịch sử 1000 logs từ redis khi mở trang
    async function loadHistory() {
      try {
        const res = await fetch('/logs/history');
        if (res.ok) {
          const raw = await res.json();
          const history = Array.isArray(raw) ? raw : (Array.isArray(raw && raw.data) ? raw.data : []);
          if (Array.isArray(history) && history.length > 0) {
            //- gán trực tiếp mảng history để giữ nguyên thứ tự log mới nhất nằm trên cùng
            logs = history.slice(0, MAX_DISPLAY);
            updateMetrics();
            renderLogs();
          }
        }
      } catch (err) {
        console.warn('Không tải được log lịch sử:', err);
      }
    }

    //- thêm log mới vào mảng
    function addLog(item, shouldRender = true) {
      logs.unshift(item);
      if (logs.length > MAX_DISPLAY) {
        logs.pop();
      }
      updateMetrics();
      if (shouldRender && !isPaused) {
        //- nếu người dùng đang ở trang 1 thì tự động re-render mượt mà
        if (currentPage === 1) {
          renderLogs();
        }
      }
    }

    //- lọc danh sách logs theo các tiêu chí đã chọn
    function filterLogs() {
      return logs.filter(item => {
        if (selectedService !== 'ALL' && item.service !== selectedService) return false;
        if (selectedLevel !== 'ALL' && item.level !== selectedLevel) return false;

        // Lọc theo giao thức
        if (selectedType === 'HTTP') {
          if (item.type !== 'HTTP_REQUEST' && item.context !== 'HTTP') return false;
        } else if (selectedType === 'RPC') {
          if (item.type !== 'RPC_REQUEST' && item.context !== 'RPC') return false;
        }

        // Lọc theo HTTP Status Code
        if (selectedStatus !== 'ALL') {
          const code = item.details && item.details.statusCode;
          if (!code) return false;
          if (selectedStatus === '2xx' && (code < 200 || code >= 300)) return false;
          if (selectedStatus === '4xx' && (code < 400 || code >= 500)) return false;
          if (selectedStatus === '5xx' && code < 500) return false;
        }

        // Tìm kiếm toàn văn
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCorr = item.correlationId && item.correlationId.toLowerCase().includes(q);
          const matchMsg = item.message && item.message.toLowerCase().includes(q);
          const matchSvc = item.service && item.service.toLowerCase().includes(q);
          const matchUrl = item.details && item.details.url && String(item.details.url).toLowerCase().includes(q);
          const matchMethod = item.details && item.details.method && String(item.details.method).toLowerCase().includes(q);
          const matchPattern = item.details && item.details.pattern && String(item.details.pattern).toLowerCase().includes(q);
          const matchIp = item.details && item.details.ip && String(item.details.ip).toLowerCase().includes(q);
          if (!matchCorr && !matchMsg && !matchSvc && !matchUrl && !matchMethod && !matchPattern && !matchIp) {
            return false;
          }
        }
        return true;
      });
    }

    //- hiển thị giá trị nguyên thủy với màu sắc cú pháp
    function renderJsonPrimitive(val) {
      if (val === null) {
        return '<span class="json-value-null">null</span>';
      }
      if (typeof val === 'boolean') {
        return '<span class="json-value-boolean">' + val + '</span>';
      }
      if (typeof val === 'number') {
        return '<span class="json-value-number">' + val + '</span>';
      }
      if (typeof val === 'string') {
        return '<span class="json-value-string">"' + escapeHtml(val) + '"</span>';
      }
      return escapeHtml(String(val));
    }

    //- format tên trường không bọc ngoặc kép nếu là ký tự an toàn giống postman
    function formatJsonKey(key) {
      if (/^[a-zA-Z_$][a-zA-Z0-9_$-]*$/.test(key)) {
        return '<span class="json-key">' + escapeHtml(key) + '</span><span class="json-colon">:</span> ';
      }
      return '<span class="json-key">"' + escapeHtml(key) + '"</span><span class="json-colon">:</span> ';
    }

    //- kiểm tra object phẳng ngắn để hiển thị inline gọn gàng trên 1 dòng như ảnh mẫu
    function isInlineFlatObject(obj) {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;
      const entries = Object.entries(obj);
      if (entries.length === 0 || entries.length > 5) return false;
      for (const [_, v] of entries) {
        if (v !== null && typeof v === 'object') return false;
      }
      return JSON.stringify(obj).length <= 90;
    }

    //- thư viện hiển thị cây json tương tác thu gọn và mở rộng chuẩn postman
    function renderJsonTree(data, defaultExpandedLevel, currentLevel, keyName, isLast) {
      if (defaultExpandedLevel === undefined) defaultExpandedLevel = 3;
      if (currentLevel === undefined) currentLevel = 0;
      if (keyName === undefined) keyName = null;
      if (isLast === undefined) isLast = true;

      if (data === null || typeof data !== 'object') {
        const comma = isLast ? '' : '<span class="json-comma">,</span>';
        const kHtml = keyName !== null ? formatJsonKey(keyName) : '';
        return '<div class="json-prop-row">' + kHtml + renderJsonPrimitive(data) + comma + '</div>';
      }

      const isArray = Array.isArray(data);
      const keys = Object.keys(data);
      const commaHtml = isLast ? '' : '<span class="json-comma">,</span>';
      const keyHtml = keyName !== null ? formatJsonKey(keyName) : '';

      //- nếu là mảng rỗng hoặc object rỗng
      if (keys.length === 0) {
        const emptyBracket = isArray ? '[]' : '{}';
        return '<div class="json-prop-row">' + keyHtml + '<span class="json-bracket">' + emptyBracket + '</span>' + commaHtml + '</div>';
      }

      //- nếu là object phẳng ngắn ở các cấp con thì hiển thị inline gọn gàng như ảnh mẫu
      if (currentLevel > 0 && isInlineFlatObject(data)) {
        let inlineInner = '<span class="json-bracket">{</span> ';
        keys.forEach(function(k, idx) {
          inlineInner += formatJsonKey(k) + renderJsonPrimitive(data[k]);
          if (idx < keys.length - 1) inlineInner += '<span class="json-comma">, </span>';
        });
        inlineInner += ' <span class="json-bracket">}</span>';
        return '<div class="json-prop-row">' + keyHtml + inlineInner + commaHtml + '</div>';
      }

      //- xác định trạng thái mặc định mở hay đóng
      const isCollapsed = currentLevel >= defaultExpandedLevel;
      const openBracket = isArray ? '[' : '{';
      const closeBracket = isArray ? ']' : '}';

      //- nhãn số lượng phần tử (entries)
      const countLabel = keys.length + (keys.length === 1 ? ' entry' : ' entries');

      //- xác định thẻ thu gọn: nếu là mảng chứa object thì [{...}], nếu mảng thường thì [...], nếu object thì {...}
      let collapsedTagText = '{...}';
      if (isArray) {
        const firstChild = keys.length > 0 ? data[keys[0]] : null;
        if (firstChild !== null && typeof firstChild === 'object') {
          collapsedTagText = '[{...}]';
        } else {
          collapsedTagText = '[...]';
        }
      }

      let html = '<div class="json-block ' + (isCollapsed ? 'collapsed' : 'expanded') + '">';

      //- dòng header khi mở (expanded): có dấu trừ [-] để thu gọn lại
      html += '<div class="json-line-header json-expanded-header" onclick="handleJsonLineClick(this, event)">';
      html += keyHtml;
      html += '<span class="json-bracket">' + openBracket + '</span>';
      html += '<button class="json-fold-btn" onclick="toggleJsonBlock(this, event)" title="Thu gọn khối này">-</button>';
      html += '<span class="json-entries-badge">' + countLabel + '</span>';
      html += '</div>';

      //- dòng header khi thu gọn (collapsed): hiện thẻ [{...}] hoặc {...} bấm vào là mở ra
      html += '<div class="json-line-header json-collapsed-header" onclick="handleJsonLineClick(this, event)">';
      html += keyHtml;
      html += '<span class="json-collapsed-tag" onclick="toggleJsonBlock(this, event)" title="Bấm vào để mở rộng khối này">' + collapsedTagText + '</span>';
      html += '<span class="json-entries-badge">' + countLabel + '</span>';
      html += commaHtml;
      html += '</div>';

      //- nội dung các phần tử con bên trong
      html += '<div class="json-body">';
      keys.forEach(function(key, idx) {
        const val = data[key];
        const isChildLast = idx === keys.length - 1;
        if (val !== null && typeof val === 'object') {
          html += renderJsonTree(val, defaultExpandedLevel, currentLevel + 1, !isArray ? key : null, isChildLast);
        } else {
          html += '<div class="json-prop-row">';
          if (!isArray) {
            html += formatJsonKey(key);
          }
          html += renderJsonPrimitive(val);
          if (!isChildLast) html += '<span class="json-comma">,</span>';
          html += '</div>';
        }
      });
      html += '</div>';

      //- dấu đóng ngoặc ở chân khối
      html += '<div class="json-line-footer" onclick="handleJsonLineClick(this, event)">';
      html += '<span class="json-bracket json-close-bracket" onclick="collapseFromFooter(this, event)" title="Bấm vào đây để thu gọn khối">' + closeBracket + ' <span class="json-collapse-bottom-btn">▲ Thu gọn</span></span>';
      html += commaHtml;
      html += '</div>';

      html += '</div>';

      return html;
    }

    //- đóng hoặc mở khối json khi bấm vào nút trừ [-] hoặc thẻ [{...}]
    window.toggleJsonBlock = function(targetEl, event) {
      if (event) {
        event.stopPropagation();
      }
      const block = targetEl.closest('.json-block');
      if (!block) return;
      const isCollapsed = block.classList.contains('collapsed');
      if (isCollapsed) {
        block.classList.remove('collapsed');
        block.classList.add('expanded');
      } else {
        block.classList.remove('expanded');
        block.classList.add('collapsed');
      }
    };

    //- cho phép click vào bất kỳ đâu trên dòng header hoặc footer để đóng mở khối
    window.handleJsonLineClick = function(lineEl, event) {
      if (
        event.target.closest('.json-fold-btn') ||
        event.target.closest('.json-collapsed-tag') ||
        event.target.closest('.json-close-bracket') ||
        event.target.tagName === 'BUTTON'
      ) {
        return;
      }
      //- nếu đang bôi đen văn bản để sao chép thì không toggle
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }
      const block = lineEl.closest('.json-block');
      if (!block) return;
      const isCollapsed = block.classList.contains('collapsed');
      if (isCollapsed) {
        block.classList.remove('collapsed');
        block.classList.add('expanded');
      } else {
        block.classList.remove('expanded');
        block.classList.add('collapsed');
      }
    };

    //- thu gọn khối từ dấu đóng ngoặc ở dưới chân và cuộn nhẹ lên đầu khối
    window.collapseFromFooter = function(bracketEl, event) {
      if (event) {
        event.stopPropagation();
      }
      const block = bracketEl.closest('.json-block');
      if (!block) return;
      block.classList.remove('expanded');
      block.classList.add('collapsed');
      block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    //- mở rộng toàn bộ cây json trong một container
    window.expandAllJson = function(btn) {
      const container = btn.closest('.data-section').querySelector('.json-tree-container');
      if (!container) return;
      container.querySelectorAll('.json-block').forEach(function(b) {
        b.classList.remove('collapsed');
        b.classList.add('expanded');
      });
    };

    //- thu gọn toàn bộ cây json trong một container
    window.collapseAllJson = function(btn) {
      const container = btn.closest('.data-section').querySelector('.json-tree-container');
      if (!container) return;
      container.querySelectorAll('.json-block').forEach(function(b) {
        b.classList.remove('expanded');
        b.classList.add('collapsed');
      });
    };
    function generateCurl(log) {
      const d = log.details || {};
      const method = (d.method || 'GET').toUpperCase();
      const url = d.url || '/';
      const fullUrl = url.startsWith('http') ? url : ('http://localhost:3000' + url);
      let curl = 'curl -X ' + method + ' "' + fullUrl + '"';

      curl += ' -H "Content-Type: application/json"';
      if (log.correlationId) {
        curl += ' -H "x-correlation-id: ' + log.correlationId + '"';
      }
      if (d.requestBody && Object.keys(d.requestBody).length > 0) {
        curl += " -d '" + JSON.stringify(d.requestBody) + "'";
      }
      return curl;
    }

    //- sao chép lệnh curl của log
    window.copyCurlCommand = function(idx) {
      const log = window.currentRenderedLogs[idx];
      if (log) {
        const curl = generateCurl(log);
        copyToClipboard(curl, 'Đã sao chép lệnh cURL!');
      }
    };

    //- hiển thị logs ra giao diện kèm phân trang
    function renderLogs() {
      const filtered = filterLogs();
      const totalFiltered = filtered.length;
      const totalPages = Math.ceil(totalFiltered / pageSize) || 1;

      // Đảm bảo trang hiện tại hợp lệ
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalFiltered);
      const pageLogs = filtered.slice(startIndex, endIndex);
      window.currentRenderedLogs = pageLogs;

      // Cập nhật thông tin phân trang
      paginationInfo.textContent = totalFiltered > 0
        ? ('Hiển thị: ' + (startIndex + 1) + ' - ' + endIndex + ' trên ' + totalFiltered + ' logs (Tổng lưu: ' + logs.length + ')')
        : 'Hiển thị: 0 - 0 / 0 logs';

      renderPaginationControls(totalPages);

      if (totalFiltered === 0) {
        logContainer.innerHTML = '';
        logContainer.appendChild(emptyState);
        return;
      }

      logContainer.innerHTML = '';
      pageLogs.forEach(function(log, index) {
        const d = log.details || {};
        const inputData = d.requestBody || d.payload;
        const outputData = d.responseData || d.result;
        const hasDetails = inputData || outputData || d.durationMs !== undefined || log.stack || d.error || Object.keys(d).length > 0;

        const card = document.createElement('div');
        card.className = 'log-card level-' + (log.level || 'info') + (hasDetails ? ' has-details' : '');
        if (hasDetails) {
          card.setAttribute('title', 'Bấm vào dòng này để mở / đóng chi tiết Data & Payload');
          //- cho phép click vào toàn bộ dòng card để mở hoặc đóng chi tiết
          card.onclick = function(e) {
            handleCardRowClick(e, card);
          };
        }

        const serviceClass = 'badge-' + (log.service || 'unknown');
        const timeFormatted = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';
        const expandIndicator = hasDetails
          ? '<span class="log-card-expand-indicator" title="Bấm vào dòng để xem chi tiết">▼</span>'
          : '';

        const corrBadge = log.correlationId
          ? ('<span class="badge badge-correlation" onclick="filterByCorrelation(&quot;' + log.correlationId + '&quot;)" title="Click để gom nhóm toàn bộ chuỗi request này">🔗 ' + log.correlationId + '</span>')
          : '';

        let statusBadge = '';
        if (d.statusCode) {
          const statusClass = d.statusCode >= 500 ? 'badge-status-5xx' : d.statusCode >= 400 ? 'badge-status-4xx' : 'badge-status-2xx';
          statusBadge = '<span class="badge ' + statusClass + '">HTTP ' + d.statusCode + '</span>';
        } else if (d.transport) {
          const statusClass = d.success ? 'badge-status-2xx' : 'badge-status-5xx';
          statusBadge = '<span class="badge ' + statusClass + '">[' + d.transport + '] ' + (d.success ? 'SUCCESS' : 'FAILED') + '</span>';
        }

        let sectionsHtml = '';

        if (inputData) {
          const rawInputStr = JSON.stringify(inputData, null, 2);
          sectionsHtml += '<div class="data-section">' +
            '<div class="data-section-header">' +
              '<div class="data-title input">📥 Dữ liệu gửi lên (Request Body / Payload)</div>' +
              '<div class="json-tools">' +
                '<button class="json-tool-btn" onclick="expandAllJson(this)">[+] Mở hết</button>' +
                '<button class="json-tool-btn" onclick="collapseAllJson(this)">[-] Thu gọn</button>' +
                '<button class="json-tool-btn" data-raw-json="' + escapeAttr(rawInputStr) + '" onclick="copySectionJson(this)">📋 Copy</button>' +
              '</div>' +
            '</div>' +
            '<div class="json-tree-container">' + renderJsonTree(inputData, 3) + '</div>' +
          '</div>';
        }

        if (outputData) {
          const rawOutputStr = JSON.stringify(outputData, null, 2);
          sectionsHtml += '<div class="data-section">' +
            '<div class="data-section-header">' +
              '<div class="data-title output">📤 Dữ liệu phản hồi (Response Data / Output)</div>' +
              '<div class="json-tools">' +
                '<button class="json-tool-btn" onclick="expandAllJson(this)">[+] Mở hết</button>' +
                '<button class="json-tool-btn" onclick="collapseAllJson(this)">[-] Thu gọn</button>' +
                '<button class="json-tool-btn" data-raw-json="' + escapeAttr(rawOutputStr) + '" onclick="copySectionJson(this)">📋 Copy</button>' +
              '</div>' +
            '</div>' +
            '<div class="json-tree-container">' + renderJsonTree(outputData, 3) + '</div>' +
          '</div>';
        }

        const metaInfo = {
          duration: d.durationMs !== undefined ? ('+' + d.durationMs + 'ms') : undefined,
          statusCode: d.statusCode,
          ip: d.ip,
          userAgent: d.userAgent,
          pattern: d.pattern,
          transport: d.transport,
          type: log.type || d.type,
        };
        const cleanMeta = Object.fromEntries(Object.entries(metaInfo).filter(function(entry) { return entry[1] !== undefined; }));

        if (Object.keys(cleanMeta).length > 0) {
          const rawMetaStr = JSON.stringify(cleanMeta, null, 2);
          sectionsHtml += '<div class="data-section">' +
            '<div class="data-section-header">' +
              '<div class="data-title meta">⏱️ Thông số kỹ thuật & Metadata</div>' +
              '<div class="json-tools">' +
                '<button class="json-tool-btn" data-raw-json="' + escapeAttr(rawMetaStr) + '" onclick="copySectionJson(this)">📋 Copy</button>' +
              '</div>' +
            '</div>' +
            '<div class="json-tree-container">' + renderJsonTree(cleanMeta, 3) + '</div>' +
          '</div>';
        }

        if (log.stack || d.error) {
          const errData = { error: d.error || log.message, stack: log.stack };
          const rawErrStr = JSON.stringify(errData, null, 2);
          sectionsHtml += '<div class="data-section">' +
            '<div class="data-section-header">' +
              '<div class="data-title error">❌ Chi tiết lỗi & Stack Trace</div>' +
              '<div class="json-tools">' +
                '<button class="json-tool-btn" data-raw-json="' + escapeAttr(rawErrStr) + '" onclick="copySectionJson(this)">📋 Copy</button>' +
              '</div>' +
            '</div>' +
            '<div class="json-tree-container" style="color: #f87171; border-color: rgba(239, 68, 68, 0.35);">' +
              renderJsonTree(errData, 3) +
            '</div>' +
          '</div>';
        }

        let actionsRowHtml = '';
        if (hasDetails) {
          actionsRowHtml += '<button class="details-toggle-btn" onclick="toggleDetails(this)">🔍 Xem Data & Payload</button>';
        }
        if (d.url || d.method) {
          actionsRowHtml += '<button class="btn-copy-curl" onclick="copyCurlCommand(' + index + ')">📋 Copy cURL</button>';
        }

        const detailsPanelHtml = hasDetails ? ('<div class="details-panel" onclick="event.stopPropagation()">' + sectionsHtml + '</div>') : '';

        card.innerHTML = '<div class="log-header">' +
          '<span class="badge badge-service ' + serviceClass + '">' + (log.service || 'service') + '</span>' +
          '<span class="badge badge-level-' + log.level + '">' + (log.level || 'INFO').toUpperCase() + '</span>' +
          statusBadge +
          (log.context ? ('<span style="color: var(--text-dim);">[' + log.context + ']</span>') : '') +
          corrBadge +
          '<span class="log-time">' + timeFormatted + ' ' + expandIndicator + '</span>' +
        '</div>' +
        '<div class="log-body">' + escapeHtml(log.message || '') + '</div>' +
        '<div class="log-actions-row">' + actionsRowHtml + '</div>' +
        detailsPanelHtml;

        logContainer.appendChild(card);
      });
    }

    //- hiển thị các nút điều hướng trang
    function renderPaginationControls(totalPages) {
      btnFirstPage.disabled = currentPage <= 1;
      btnPrevPage.disabled = currentPage <= 1;
      btnNextPage.disabled = currentPage >= totalPages;
      btnLastPage.disabled = currentPage >= totalPages;

      pageNumbers.innerHTML = '';
      const maxButtons = 5;
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxButtons - 1);
      if (end - start + 1 < maxButtons) {
        start = Math.max(1, end - maxButtons + 1);
      }

      for (let p = start; p <= end; p++) {
        const btn = document.createElement('button');
        btn.className = \`page-btn \${p === currentPage ? 'active' : ''}\`;
        btn.textContent = p;
        btn.addEventListener('click', () => {
          currentPage = p;
          renderLogs();
        });
        pageNumbers.appendChild(btn);
      }
    }

    function escapeHtml(text) {
      if (typeof text !== 'string') return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function escapeAttr(text) {
      if (typeof text !== 'string') return '';
      return text.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    }

    //- xử lý khi click vào bất kỳ đâu trên dòng log card để mở hoặc đóng chi tiết
    window.handleCardRowClick = function(event, cardEl) {
      //- nếu click vào bên trong details panel, nút copy curl, badge correlation hoặc các nút tương tác thì không toggle
      if (
        event.target.closest('.details-panel') ||
        event.target.closest('.badge-correlation') ||
        event.target.closest('.btn-copy-curl') ||
        event.target.closest('.details-toggle-btn') ||
        event.target.closest('.json-tool-btn') ||
        event.target.tagName === 'BUTTON' ||
        event.target.tagName === 'A' ||
        event.target.tagName === 'INPUT'
      ) {
        return;
      }

      //- nếu người dùng đang bôi đen văn bản để sao chép thì không toggle
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }

      const panel = cardEl.querySelector('.details-panel');
      const toggleBtn = cardEl.querySelector('.details-toggle-btn');
      if (!panel) return;

      const isOpen = panel.classList.contains('open');
      if (isOpen) {
        panel.classList.remove('open');
        cardEl.classList.remove('is-open');
        if (toggleBtn) toggleBtn.innerHTML = '🔍 Xem Data & Payload';
      } else {
        panel.classList.add('open');
        cardEl.classList.add('is-open');
        if (toggleBtn) toggleBtn.innerHTML = '✕ Ẩn Data & Payload';
      }
    };

    //- đóng mở khung chi tiết khi ấn nút toggle trực tiếp
    window.toggleDetails = function(btn) {
      const card = btn.closest('.log-card');
      const panel = card ? card.querySelector('.details-panel') : btn.parentElement.nextElementSibling;
      if (panel && panel.classList.contains('open')) {
        panel.classList.remove('open');
        if (card) card.classList.remove('is-open');
        btn.innerHTML = '🔍 Xem Data & Payload';
      } else if (panel) {
        panel.classList.add('open');
        if (card) card.classList.add('is-open');
        btn.innerHTML = '✕ Ẩn Data & Payload';
      }
    };

    window.filterByCorrelation = function(corrId) {
      searchInput.value = corrId;
      searchQuery = corrId;
      traceBanner.classList.add('visible');
      activeTraceIdSpan.textContent = corrId;
      currentPage = 1;
      renderLogs();
    };

    clearTraceFilterBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      traceBanner.classList.remove('visible');
      currentPage = 1;
      renderLogs();
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (!searchQuery) {
        traceBanner.classList.remove('visible');
      }
      currentPage = 1;
      renderLogs();
    });

    // Xử lý nút phân trang
    btnFirstPage.addEventListener('click', () => { currentPage = 1; renderLogs(); });
    btnPrevPage.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderLogs(); } });
    btnNextPage.addEventListener('click', () => { currentPage++; renderLogs(); });
    btnLastPage.addEventListener('click', () => {
      const filtered = filterLogs();
      currentPage = Math.ceil(filtered.length / pageSize) || 1;
      renderLogs();
    });

    pageSizeSelect.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value, 10) || 25;
      currentPage = 1;
      renderLogs();
    });

    // Service Filters
    document.querySelectorAll('#serviceFilter .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#serviceFilter .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedService = btn.getAttribute('data-service');
        currentPage = 1;
        renderLogs();
      });
    });

    // Level Filters
    document.querySelectorAll('#levelFilter .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#levelFilter .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLevel = btn.getAttribute('data-level');
        currentPage = 1;
        renderLogs();
      });
    });

    // Type Filters
    document.querySelectorAll('#typeFilter .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#typeFilter .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedType = btn.getAttribute('data-type');
        currentPage = 1;
        renderLogs();
      });
    });

    // Status Filters
    document.querySelectorAll('#statusFilter .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#statusFilter .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedStatus = btn.getAttribute('data-status');
        currentPage = 1;
        renderLogs();
      });
    });

    // Pause / Resume Stream
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      if (isPaused) {
        pauseBtn.textContent = '▶️ Tiếp tục';
        pauseBtn.style.color = '#38bdf8';
        connectionStatus.className = 'connection-badge paused';
        connectionText.textContent = 'Stream Paused';
        showToast('Đã tạm dừng nhận log mới');
      } else {
        pauseBtn.textContent = '⏸️ Tạm dừng';
        pauseBtn.style.color = 'inherit';
        connectionStatus.className = 'connection-badge';
        connectionText.textContent = 'Realtime Stream Active';
        showToast('Đã tiếp tục stream log');
        renderLogs();
      }
    });

    // Xuất dữ liệu JSON
    exportBtn.addEventListener('click', () => {
      const filtered = filterLogs();
      if (filtered.length === 0) {
        showToast('Không có dữ liệu log để xuất!');
        return;
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = \`microservices-logs-\${new Date().toISOString().replace(/[:.]/g, '-')}.json\`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(\`Đã xuất \${filtered.length} logs ra file JSON!\`);
    });

    // Xóa sạch danh sách
    clearBtn.addEventListener('click', async () => {
      logs = [];
      currentPage = 1;
      updateMetrics();
      renderLogs();
      showToast('Đã làm sạch danh sách log!');
      try {
        await fetch('/logs/history', { method: 'DELETE' });
      } catch {}
    });

    // Khởi chạy khi load trang
    loadHistory().then(() => initEventSource());
  </script>
</body>
</html>`;
