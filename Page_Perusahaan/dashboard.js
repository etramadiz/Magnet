// dashboard.js - Versi Firebase (FINAL)
import { auth } from '../Page_Login_Register/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getJobsByCompany, deleteJob as deleteJobFirebase, getCompanyProfile } from './firebase-company.js';

let jobs = [];
let companyId = null;

const logoColors = ['#3B2A8E','#E53935','#1E88E5','#43A047','#FB8C00','#8E24AA','#00897B','#6D4C41','#D81B60'];

function statusBadge(s) {
  const cls = s === 'Buka' ? 'badge-open' : 'badge-closed';
  return `<span class="badge ${cls}">${s}</span>`;
}

function renderJobs(list) {
  const grid = document.getElementById('jobGrid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = '<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:40px 0">Tidak ada lowongan ditemukan.</p>';
    return;
  }
  grid.innerHTML = list.map((j, i) => `
    <div class="job-card" data-id="${j.id}">
      <div class="job-card-header">
        <div class="job-logo" style="background:${logoColors[i % logoColors.length]}">
          ${j.companyName?.charAt(0) || '?'}
        </div>
        <div class="job-title-wrap">
          <div class="job-name">${j.title || j.name}</div>
          <div class="job-company">${j.companyName || j.company}</div>
        </div>
        ${statusBadge(j.status)}
      </div>

      <div class="job-details">
        <div class="job-detail-row">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
          ${j.type || '-'}
        </div>
        <div class="job-detail-row">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
          ${j.duration || '-'}
        </div>
        <div class="job-detail-row">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/></svg>
          ${j.description?.substring(0,50) || '-'}
        </div>
        <div class="job-detail-row">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/></svg>
          Rp ${j.salary || '0'}/bln
        </div>
      </div>

      <div class="job-card-actions">
        <a href="lihat-pelamar.html?id=${j.id}" class="btn btn-outline btn-view">Lihat Pelamar</a>
        <a href="tambah-lowongan.html?id=${j.id}" class="btn btn-outline">Edit</a>
        <button class="btn btn-danger" onclick="deleteJobHandler('${j.id}')">Hapus</button>
      </div>
    </div>
  `).join('');
}

async function deleteJobHandler(jobId) {
  if (confirm('Hapus lowongan ini?')) {
    await deleteJobFirebase(jobId);
    await loadJobs();
  }
}

async function loadJobs() {
  if (!companyId) return;
  jobs = await getJobsByCompany(companyId);
  renderJobs(jobs);
}

// Update avatar dan nama perusahaan di navbar
async function updateNavbarProfile(user) {
  const data = await getCompanyProfile(user.uid);
  const userAvatarDiv = document.querySelector('.user-avatar');
  if (data?.logo && userAvatarDiv) {
    userAvatarDiv.innerHTML = `<img src="${data.logo}" alt="Logo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    userAvatarDiv.style.background = 'transparent';
  } else if (userAvatarDiv) {
    userAvatarDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>`;
    userAvatarDiv.style.background = '';
  }
  const navUserName = document.getElementById('navUserName');
  if (navUserName && data?.nama) navUserName.textContent = data.nama;
  else if (navUserName && user.displayName) navUserName.textContent = user.displayName;
}

// Inisialisasi
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../Page_Login_Register/login-perusahaan.html';
    return;
  }
  companyId = user.uid;
  await loadJobs();
  await updateNavbarProfile(user);
});

// Fungsi sidebar toggle (pertahankan dari versi lama)
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar) return;
  const isMobile = window.innerWidth <= 900;
  if (isMobile) {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('visible');
  } else {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    localStorage.setItem('sidebar_collapsed', isCollapsed ? '1' : '0');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
}

function restoreSidebarState() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (window.innerWidth > 900) {
    const collapsed = localStorage.getItem('sidebar_collapsed') === '1';
    if (collapsed) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);
  restoreSidebarState();
});

window.deleteJobHandler = deleteJobHandler;