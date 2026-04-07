/**
 * SolarSpec Proposal HTML Template
 *
 * Architecture rule: lives exclusively in /src/templates/proposal.js.
 * Receives a single data object and returns an HTML string.
 * Zero React code — this is a pure function.
 * The output is passed to react-native-html-to-pdf for PDF generation.
 *
 * Fonts: system sans-serif (no Google Fonts CDN in PDF context).
 * Colours: hardcoded inline — these are intentionally white-paper colours,
 *           not dark-theme tokens. The proposal is a LIGHT document.
 */

/**
 * Formats a number as a Nigerian Naira string with comma separators.
 * @param {number} value
 * @returns {string} e.g. "₦8,800,000.00"
 */
function formatNaira(value) {
  if (!value || isNaN(value)) return '—';
  return '₦' + Number(value).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a Date object as "Month DD, YYYY".
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
  try {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

/**
 * Builds the appliance table rows HTML from the appliances array.
 * @param {Array<{ label: string, watts: number, quantity: number, dailyHours: number }>} appliances
 * @returns {string} HTML <tr> rows
 */
function buildApplianceRows(appliances) {
  if (!appliances || appliances.length === 0) {
    return '<tr><td colspan="4" style="padding:16px;text-align:center;color:#9f8e7a;">No appliances added.</td></tr>';
  }
  return appliances.map((a, i) => {
    const bg = i % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
    return `
      <tr style="background:${bg};border-bottom:1px solid #E5E2E1;">
        <td style="padding:12px 16px;font-weight:600;font-size:13px;">${a.label || a.name || 'Unknown'}</td>
        <td style="padding:12px 16px;font-size:13px;">${a.quantity || 1}</td>
        <td style="padding:12px 16px;font-size:13px;">${a.watts || 0}W</td>
        <td style="padding:12px 16px;text-align:right;font-size:13px;">${a.dailyHours || 0} hrs</td>
      </tr>`;
  }).join('');
}

/**
 * Builds the component list rows HTML from the component items + prices.
 * @param {Array<{ id, name, qty, sku }>} components
 * @param {object} prices - keyed by component id
 * @param {string} currencySymbol
 * @returns {string} HTML component rows
 */
function buildComponentRows(components, prices, currencySymbol = '₦') {
  if (!components || components.length === 0) return '';
  return components.map((c) => {
    const unitPrice = parseFloat((prices?.[c.id] || '0').replace(/,/g, '')) || 0;
    const totalPrice = unitPrice * (c.qty || 1);
    const priceStr = unitPrice > 0 ? formatNaira(totalPrice) : '—';
    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;
                  padding:14px 0;border-bottom:1px solid rgba(229,226,225,0.5);">
        <div style="flex:1;">
          <div style="font-weight:700;font-size:13px;color:#131313;">${c.name || '—'} × ${c.qty || 1}</div>
          <div style="font-size:11px;color:#524534;margin-top:2px;">${c.sku || ''}</div>
        </div>
        <div style="font-weight:700;font-size:13px;color:#131313;margin-left:16px;white-space:nowrap;">
          ${priceStr}
        </div>
      </div>`;
  }).join('');
}

/**
 * Builds a complete HTML proposal document string from the proposal data object.
 * This is the ONLY function — it must receive everything it needs as data.
 *
 * @param {{
 *   proposalRef: string,
 *   proposalDate: Date|string,
 *   businessName: string,
 *   technicianName: string,
 *   clientInfo: {
 *     name: string,
 *     address: string,
 *     phone: string,
 *     email: string,
 *     installDate: Date|string,
 *   },
 *   systemConfig: {
 *     isHybrid: boolean,
 *     systemVoltageV: number,
 *     batteryChemistry: { label: string },
 *   },
 *   sizing: {
 *     inverterSizeVA: number,
 *     batteryCapacityAh: number,
 *     panelArray: { panelCount: number, totalPanelWattsW: number },
 *     backupHours: number,
 *     dailyYieldKwh: number,
 *   },
 *   appliances: Array,
 *   componentItems: Array,
 *   componentPrices: object,
 *   totalCost: number,
 * }} data
 * @returns {string} Complete HTML document string
 */
export function buildProposalHTML(data) {
  const {
    proposalRef = 'SS-0000-001',
    proposalDate = new Date(),
    businessName = 'SolarSpec',
    technicianName = '',
    clientInfo = {},
    systemConfig = {},
    sizing = {},
    appliances = [],
    componentItems = [],
    componentPrices = {},
    totalCost = 0,
  } = data;

  const isHybrid = systemConfig.isHybrid ?? true;
  const inverterKva = sizing.inverterSizeVA
    ? (sizing.inverterSizeVA / 1000).toFixed(1)
    : '—';
  const solarKwp = sizing.panelArray?.totalPanelWattsW
    ? (sizing.panelArray.totalPanelWattsW / 1000).toFixed(1)
    : '—';
  const batteryKwh = sizing.batteryCapacityAh && systemConfig.systemVoltageV
    ? ((sizing.batteryCapacityAh * systemConfig.systemVoltageV) / 1000).toFixed(1)
    : '—';
  const systemLabel = `${inverterKva}kVA ${isHybrid ? 'Hybrid' : 'Off-Grid'} Solar System`;
  const chemLabel = systemConfig.batteryChemistry?.label ?? 'Lithium (LiFePO4)';

  const applianceRowsHTML = buildApplianceRows(appliances);
  const componentRowsHTML = buildComponentRows(componentItems, componentPrices);
  const totalStr = totalCost > 0 ? formatNaira(totalCost) : '—';

  const installDateStr = clientInfo.installDate
    ? formatDate(clientInfo.installDate)
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SolarSpec Proposal ${proposalRef}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      background: #FFFFFF;
      color: #131313;
      font-size: 14px;
      line-height: 1.5;
    }
    .page {
      max-width: 794px;
      margin: 0 auto;
      padding: 48px 56px;
      background: #FFFFFF;
    }
    /* HEADER */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #E5E2E1;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .brand-icon {
      background: #F5A623;
      width: 36px; height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-icon span {
      color: #452B00;
      font-size: 20px;
      font-weight: 900;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #131313;
    }
    .brand-subtitle {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #9f8e7a;
    }
    .doc-meta { text-align: right; }
    .doc-meta h2 {
      font-size: 16px;
      font-weight: 800;
      color: #131313;
    }
    .doc-meta p {
      font-size: 13px;
      color: #524534;
      margin-top: 4px;
    }
    /* SECTION LABEL */
    .section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #9f8e7a;
      margin-bottom: 12px;
    }
    /* CLIENT + SYSTEM GRID */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .client-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .client-detail { font-size: 13px; color: #524534; }
    /* SYSTEM REC BOX */
    .system-rec-box {
      border: 1px solid rgba(82,69,52,0.2);
      border-radius: 8px;
      padding: 16px;
      background: rgba(245,166,35,0.03);
    }
    .system-rec-box h3 { font-size: 15px; font-weight: 700; color: #F5A623; margin-bottom: 4px; }
    .system-rec-box p { font-size: 12px; color: #524534; }
    /* TABLE */
    .section { margin-bottom: 40px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: rgba(245,166,35,0.05); }
    th {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #9f8e7a;
      padding: 10px 16px;
      text-align: left;
    }
    th:last-child { text-align: right; }
    /* KEY METRICS ROW */
    .metrics-row {
      display: flex;
      gap: 0;
      margin-bottom: 40px;
      border: 1px solid rgba(82,69,52,0.12);
      border-radius: 8px;
      overflow: hidden;
    }
    .metric-cell {
      flex: 1;
      padding: 16px;
      border-right: 1px solid rgba(82,69,52,0.12);
      text-align: center;
    }
    .metric-cell:last-child { border-right: none; }
    .metric-cell .label {
      font-size: 9px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.12em;
      color: #9f8e7a; margin-bottom: 4px;
    }
    .metric-cell .value {
      font-size: 16px; font-weight: 800; color: #F5A623;
    }
    .metric-cell .sub {
      font-size: 10px; color: #524534; margin-top: 2px;
    }
    /* TOTAL */
    .total-section {
      border-top: 2px solid #131313;
      padding-top: 24px;
      text-align: right;
      margin-top: 8px;
      margin-bottom: 32px;
    }
    .total-section .label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.15em; color: #9f8e7a;
    }
    .total-section .amount {
      font-size: 40px; font-weight: 900;
      color: #F5A623; letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .total-section .note {
      font-size: 10px; color: #524534; font-style: italic; margin-top: 4px;
    }
    /* FOOTER */
    .doc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20px;
      border-top: 1px solid #E5E2E1;
      margin-top: 8px;
    }
    .doc-footer .footer-label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.15em; color: #9f8e7a;
    }
    .color-chips { display: flex; gap: 6px; }
    .chip { height: 4px; width: 28px; border-radius: 2px; }
  </style>
</head>
<body>
<div class="page">
  <!-- Document Header -->
  <div class="doc-header">
    <div>
      <div class="brand-row">
        <div class="brand-icon"><span>☀</span></div>
        <span class="brand-name">SolarSpec</span>
      </div>
      <p class="brand-subtitle">Technical Solar Solutions</p>
      ${businessName && businessName !== 'SolarSpec'
        ? `<p style="font-size:12px;color:#524534;margin-top:6px;">${businessName}${technicianName ? ` · ${technicianName}` : ''}</p>`
        : ''}
    </div>
    <div class="doc-meta">
      <h2>${proposalRef}</h2>
      <p>${formatDate(proposalDate)}</p>
      ${installDateStr ? `<p style="margin-top:2px;font-size:11px;color:#9f8e7a;">Install: ${installDateStr}</p>` : ''}
    </div>
  </div>

  <!-- Client + System Recommendation -->
  <div class="two-col">
    <div>
      <p class="section-label">Client Details</p>
      <div class="client-name">${clientInfo.name || '—'}</div>
      <p class="client-detail">${(clientInfo.address || '').replace(/\n/g, '<br/>')}</p>
      ${clientInfo.phone ? `<p class="client-detail" style="margin-top:4px;">${clientInfo.phone}</p>` : ''}
      ${clientInfo.email ? `<p class="client-detail">${clientInfo.email}</p>` : ''}
    </div>
    <div>
      <p class="section-label">System Recommendation</p>
      <div class="system-rec-box">
        <h3>${systemLabel}</h3>
        <p>Designed for maximum energy independence with peak efficiency.</p>
      </div>
    </div>
  </div>

  <!-- Key Metrics -->
  <div class="metrics-row">
    <div class="metric-cell">
      <div class="label">Inverter</div>
      <div class="value">${inverterKva} kVA</div>
      <div class="sub">${isHybrid ? 'Hybrid MPPT' : 'Off-Grid'}</div>
    </div>
    <div class="metric-cell">
      <div class="label">Solar Array</div>
      <div class="value">${solarKwp} kWp</div>
      <div class="sub">${sizing.panelArray?.panelCount ?? 0}× panels</div>
    </div>
    <div class="metric-cell">
      <div class="label">Battery</div>
      <div class="value">${batteryKwh} kWh</div>
      <div class="sub">${chemLabel.split(' ')[0]}</div>
    </div>
    <div class="metric-cell">
      <div class="label">Backup</div>
      <div class="value">${sizing.backupHours?.toFixed(1) ?? '—'} hrs</div>
      <div class="sub">at avg load</div>
    </div>
  </div>

  <!-- Appliance Table -->
  <div class="section">
    <p class="section-label">Appliance Table &amp; Load Analysis</p>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Watts</th>
          <th style="text-align:right;">Daily Usage</th>
        </tr>
      </thead>
      <tbody>${applianceRowsHTML}</tbody>
    </table>
  </div>

  <!-- System Components -->
  <div class="section">
    <p class="section-label">System Components</p>
    ${componentRowsHTML || '<p style="color:#9f8e7a;font-size:13px;">No components specified.</p>'}
  </div>

  <!-- Total Investment -->
  <div class="total-section">
    <p class="label">Total System Investment</p>
    <div class="amount">${totalStr}</div>
    <p class="note">*Prices are estimates. Final quote subject to site survey.</p>
  </div>

  <!-- Document Footer -->
  <div class="doc-footer">
    <span class="footer-label">Generated with SolarSpec</span>
    <div class="color-chips">
      <div class="chip" style="background:#F5A623;"></div>
      <div class="chip" style="background:#26A37A;"></div>
      <div class="chip" style="background:#3AC2FF;"></div>
    </div>
  </div>
</div>
</body>
</html>`;
}
