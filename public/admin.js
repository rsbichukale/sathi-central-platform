/**
 * SATHI Admin Portal Script
 */
let allClients = [];
let allFarmers = [];
let allDealers = [];

document.addEventListener('DOMContentLoaded', () => {
  const loginPass = document.getElementById('login-pass');
  const loginBtn = document.getElementById('btn-login');
  const loginErr = document.getElementById('login-err');
  const logoutBtn = document.getElementById('btn-logout');

  if (loginBtn) {
    loginBtn.onclick = async () => {
      const pass = (loginPass.value || 'admin123').trim();
      loginErr.textContent = '';
      try {
        const res = await fetch('/api/v1/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem('adminToken', data.token);
          document.getElementById('login-overlay').style.display = 'none';
          loadDashboardData();
        } else {
          loginErr.textContent = data.error || 'Login failed';
        }
      } catch (e) {
        loginErr.textContent = 'Server connection error';
      }
    };
  }

  if (loginPass) {
    loginPass.onkeyup = (e) => {
      if (e.key === 'Enter') loginBtn.click();
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      sessionStorage.removeItem('adminToken');
      location.reload();
    };
  }

  if (sessionStorage.getItem('adminToken')) {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';
    loadDashboardData();
  }

  // Bind tab switching
  const tabClientsBtn = document.getElementById('btn-tab-clients');
  const tabFarmersBtn = document.getElementById('btn-tab-farmers');
  const tabDealersBtn = document.getElementById('btn-tab-dealers');

  if (tabClientsBtn) tabClientsBtn.onclick = () => switchTab('tab-clients', tabClientsBtn);
  if (tabFarmersBtn) tabFarmersBtn.onclick = () => switchTab('tab-farmers', tabFarmersBtn);
  if (tabDealersBtn) tabDealersBtn.onclick = () => switchTab('tab-dealers', tabDealersBtn);

  // Bind search handlers
  const searchClientsInput = document.getElementById('search-clients');
  const searchFarmersInput = document.getElementById('search-farmers');
  const searchDealersInput = document.getElementById('search-dealers');

  if (searchClientsInput) searchClientsInput.oninput = filterClients;
  if (searchFarmersInput) searchFarmersInput.oninput = filterFarmers;
  if (searchDealersInput) searchDealersInput.oninput = filterDealers;

  // Bind key modal handlers
  const openKeyModalBtn = document.getElementById('btn-open-key-modal');
  const closeKeyModalBtn = document.getElementById('btn-close-key-modal');
  const cancelKeyModalBtn = document.getElementById('btn-cancel-key-modal');
  const submitGenerateKeyBtn = document.getElementById('btn-generate-key');

  if (openKeyModalBtn) openKeyModalBtn.onclick = () => openKeyModal();
  if (closeKeyModalBtn) closeKeyModalBtn.onclick = () => closeKeyModal();
  if (cancelKeyModalBtn) cancelKeyModalBtn.onclick = () => closeKeyModal();
  if (submitGenerateKeyBtn) submitGenerateKeyBtn.onclick = () => submitGenerateKey();
});

function switchTab(tabId, activeBtn) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.style.display = 'block';
  if (activeBtn) activeBtn.classList.add('active');
}

async function loadDashboardData() {
  fetchStats();
  fetchClients();
  fetchFarmers();
  fetchDealers();
}

async function fetchStats() {
  try {
    const res = await fetch('/api/v1/admin/dashboard-stats');
    const data = await res.json();
    if (data.success) {
      document.getElementById('stat-clients').textContent = data.stats.totalClients;
      document.getElementById('stat-paid').textContent = data.stats.activePaid;
      document.getElementById('stat-trials').textContent = data.stats.activeTrials;
      document.getElementById('stat-farmers').textContent = data.stats.totalFarmers;
      document.getElementById('stat-dealers').textContent = data.stats.totalDealers;
    }
  } catch (e) {}
}

async function fetchClients() {
  try {
    const res = await fetch('/api/v1/admin/clients');
    const data = await res.json();
    if (data.success) {
      allClients = data.clients || [];
      renderClients(allClients);
    }
  } catch (e) {}
}

function renderClients(list) {
  const tbody = document.getElementById('clients-tbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No client records found.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(c => {
    let badgeClass = 'badge-expired';
    if (c.status === 'ACTIVE') badgeClass = 'badge-active';
    else if (c.status === 'TRIAL') badgeClass = 'badge-trial';

    return `
      <tr>
        <td>
          <strong style="color: #fff; font-size: 15px;">${c.firmName}</strong><br>
          <span style="color: var(--text-muted); font-size: 12px;">📱 ${c.mobileNo} ${c.ownerName ? '(' + c.ownerName + ')' : ''}</span>
        </td>
        <td><code style="font-family: monospace; font-weight: 700; color: var(--primary);">${c.requestCode}</code></td>
        <td style="font-size: 12px; color: var(--text-muted);">${c.tallySerial || '-'}</td>
        <td><span class="badge ${badgeClass}">${c.status}</span></td>
        <td><strong>${c.daysRemaining} Days</strong></td>
        <td><code style="font-family: monospace; font-weight: 700; color: #fff;">${c.activationKey}</code></td>
        <td>
          <button class="btn btn-sec btn-renew-key" data-reqcode="${c.requestCode}" style="padding: 6px 12px; font-size: 11px;">Renew Key</button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach renew key button listeners
  tbody.querySelectorAll('.btn-renew-key').forEach(btn => {
    btn.onclick = () => openKeyModal(btn.dataset.reqcode);
  });
}

function filterClients() {
  const q = document.getElementById('search-clients').value.toLowerCase();
  const filtered = allClients.filter(c => 
    c.firmName.toLowerCase().includes(q) ||
    c.mobileNo.includes(q) ||
    c.requestCode.toLowerCase().includes(q) ||
    c.activationKey.toLowerCase().includes(q)
  );
  renderClients(filtered);
}

async function fetchFarmers() {
  try {
    const res = await fetch('/api/v1/admin/farmers');
    const data = await res.json();
    if (data.success) {
      allFarmers = data.farmers || [];
      renderFarmers(allFarmers);
    }
  } catch (e) {}
}

function renderFarmers(list) {
  const tbody = document.getElementById('farmers-tbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No shared farmers found.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(f => `
    <tr>
      <td><strong style="color: #fff;">${f.farmer_name}</strong></td>
      <td>${f.mobile_no}</td>
      <td>${f.village_name || '-'}</td>
      <td>${f.block_name || '-'} / ${f.district_name || '-'}</td>
      <td>${f.state_name || '-'} ${f.pincode ? '(' + f.pincode + ')' : ''}</td>
      <td style="font-size: 12px; color: var(--text-muted);">${f.updated_at || '-'}</td>
    </tr>
  `).join('');
}

function filterFarmers() {
  const q = document.getElementById('search-farmers').value.toLowerCase();
  const filtered = allFarmers.filter(f => 
    (f.farmer_name || '').toLowerCase().includes(q) ||
    (f.mobile_no || '').includes(q) ||
    (f.village_name || '').toLowerCase().includes(q)
  );
  renderFarmers(filtered);
}

async function fetchDealers() {
  try {
    const res = await fetch('/api/v1/admin/dealers');
    const data = await res.json();
    if (data.success) {
      allDealers = data.dealers || [];
      renderDealers(allDealers);
    }
  } catch (e) {}
}

function renderDealers(list) {
  const tbody = document.getElementById('dealers-tbody');
  if (!tbody) return;
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No shared dealers found.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(d => `
    <tr>
      <td><strong style="color: #fff;">${d.dealer_name || d.firm_name}</strong></td>
      <td><code>${d.gstin || '-'}</code></td>
      <td>${d.mobile_no || '-'}</td>
      <td>${d.city_village || '-'}</td>
      <td>${d.district_name || '-'} / ${d.state_name || '-'}</td>
      <td style="font-size: 12px; color: var(--text-muted);">${d.updated_at || '-'}</td>
    </tr>
  `).join('');
}

function filterDealers() {
  const q = document.getElementById('search-dealers').value.toLowerCase();
  const filtered = allDealers.filter(d => 
    (d.dealer_name || d.firm_name || '').toLowerCase().includes(q) ||
    (d.gstin || '').toLowerCase().includes(q) ||
    (d.mobile_no || '').includes(q)
  );
  renderDealers(filtered);
}

function openKeyModal(reqCode = '') {
  document.getElementById('modal-req-code').value = reqCode;
  document.getElementById('modal-res-box').style.display = 'none';
  document.getElementById('key-modal').style.display = 'flex';
}

function closeKeyModal() {
  document.getElementById('key-modal').style.display = 'none';
}

async function submitGenerateKey() {
  const reqCode = document.getElementById('modal-req-code').value.trim();
  const days = parseInt(document.getElementById('modal-valid-days').value);
  const resBox = document.getElementById('modal-res-box');

  if (!reqCode) {
    alert('Please enter a Request Code');
    return;
  }

  try {
    const res = await fetch('/api/v1/admin/generate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestCode: reqCode, validDays: days })
    });
    const data = await res.json();
    if (data.success) {
      resBox.style.display = 'block';
      resBox.innerHTML = `🔑 ${data.activationKey}<br><span style="font-size: 12px; color: var(--text-muted); font-weight: 400;">Valid for ${days} days</span>`;
      loadDashboardData();
    } else {
      alert(data.error || 'Failed to generate key');
    }
  } catch (e) {
    alert('Server error');
  }
}
