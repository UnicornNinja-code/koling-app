<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore, getRoleLandingPath } from './lib/stores/auth.svelte';
  import LoginPage from './pages/auth/LoginPage.svelte';
  import RegisterPage from './pages/auth/RegisterPage.svelte';
  import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.svelte';
  import ResetPasswordPage from './pages/auth/ResetPasswordPage.svelte';
  import AppShell from './components/layout/AppShell.svelte';
  import SuperAdminDashboardPage from './pages/superadmin/SuperAdminDashboardPage.svelte';
  import SuperAdminMapPage from './pages/superadmin/SuperAdminMapPage.svelte';
  import SuperAdminCatalogPage from './pages/superadmin/SuperAdminCatalogPage.svelte';
  import SuperAdminZonesPage from './pages/superadmin/SuperAdminZonesPage.svelte';
  import SupervisorCatalogPage from './pages/supervisor/SupervisorCatalogPage.svelte';

  let currentRoute = $state<string>('/login');

  const navigate = (route: string) => {
    currentRoute = route;
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
    }
  };

  onMount(async () => {
    await authStore.validateSession();

    // Determine initial route from URL
    const pathname = window.location.pathname;
    if (pathname === '/register' || pathname === '/activate') {
      currentRoute = '/register';
    } else if (pathname === '/forgot-password') {
      currentRoute = '/forgot-password';
    } else if (pathname === '/reset-password') {
      currentRoute = '/reset-password';
    } else if (authStore.isAuthenticated) {
      if (pathname === '/map' || pathname === '/superadmin/map') {
        currentRoute = '/map';
      } else if (pathname === '/catalog' || pathname === '/superadmin/catalog') {
        currentRoute = '/catalog';
      } else if (pathname === '/zones' || pathname === '/superadmin/zones') {
        currentRoute = '/zones';
      } else {
        currentRoute = '/dashboard';
      }
    } else {
      currentRoute = '/login';
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      currentRoute = window.location.pathname || '/login';
    });
  });
</script>

{#if authStore.loading}
  <div class="min-h-screen bg-[#F4F4F6] flex flex-col items-center justify-center space-y-3">
    <div class="w-10 h-10 border-4 border-[#FF634A] border-t-transparent rounded-full animate-spin"></div>
    <span class="text-xs font-semibold text-[#52525B]">Memuat sesi COZIS...</span>
  </div>
{:else if !authStore.isAuthenticated}
  <!-- Unauthenticated Views: Auth Flow -->
  {#if currentRoute === '/register'}
    <RegisterPage onNavigate={navigate} />
  {:else if currentRoute === '/forgot-password'}
    <ForgotPasswordPage onNavigate={navigate} />
  {:else if currentRoute === '/reset-password'}
    <ResetPasswordPage onNavigate={navigate} />
  {:else}
    <LoginPage onNavigate={navigate} />
  {/if}
{:else}
  <!-- Authenticated Views with AppShell -->
  <AppShell 
    {currentRoute} 
    onNavigate={navigate}
    compactSidebar={currentRoute === '/map'}
  >
    {#if currentRoute === '/map' || currentRoute === '/superadmin/map'}
      <SuperAdminMapPage onNavigate={navigate} />
    {:else if currentRoute === '/zones' || currentRoute === '/superadmin/zones'}
      <SuperAdminZonesPage onNavigate={navigate} />
    {:else if currentRoute === '/catalog' || currentRoute === '/superadmin/catalog'}
      {#if authStore.user?.role === 'SUPERVISOR'}
        <SupervisorCatalogPage onNavigate={navigate} />
      {:else}
        <SuperAdminCatalogPage onNavigate={navigate} />
      {/if}
    {:else if currentRoute === '/dashboard' || currentRoute === '/superadmin/dashboard' || currentRoute === '/'}
      <SuperAdminDashboardPage onNavigate={navigate} />
    {:else}
      <!-- Placeholder for upcoming modules -->
      <div class="bg-white rounded-2xl border border-[#D2D2D4] p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <div class="w-12 h-12 rounded-2xl bg-[#FFF2EF] text-[#FF634A] flex items-center justify-center mx-auto">
          <span class="text-xl font-bold">🚧</span>
        </div>
        <h3 class="text-base font-extrabold text-[#18181B]">Modul Sedang Dalam Persiapan</h3>
        <p class="text-xs text-[#52525B]">
          Halaman <code>{currentRoute}</code> sedang disiapkan untuk tahap implementasi berikutnya.
        </p>
        <button
          onclick={() => navigate('/dashboard')}
          class="px-4 py-2 rounded-xl bg-[#FF634A] text-white text-xs font-bold hover:bg-[#E54E36] transition-all cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </div>
    {/if}
  </AppShell>
{/if}
