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
  import SuperAdminDssPage from './pages/superadmin/SuperAdminDssPage.svelte';
  import SuperAdminReportsPage from './pages/superadmin/SuperAdminReportsPage.svelte';
  import SuperAdminUsersPage from './pages/superadmin/SuperAdminUsersPage.svelte';
  import SuperAdminFleetPage from './pages/superadmin/SuperAdminFleetPage.svelte';
  import SuperAdminDistributionPage from './pages/superadmin/SuperAdminDistributionPage.svelte';
  import SuperAdminSettingsPage from './pages/superadmin/SuperAdminSettingsPage.svelte';
  import SupervisorCatalogPage from './pages/supervisor/SupervisorCatalogPage.svelte';
  import RiderDashboardPage from './pages/rider/RiderDashboardPage.svelte';
  import NotFoundPage from './pages/error/NotFoundPage.svelte';
  import ForbiddenPage from './pages/error/ForbiddenPage.svelte';
  import ServerErrorPage from './pages/error/ServerErrorPage.svelte';

  function resolveRoute(path: string): string {
    if (path === '/register' || path === '/activate') return '/register';
    if (path === '/forgot-password') return '/forgot-password';
    if (path === '/reset-password') return '/reset-password';
    if (path === '/login') return '/login';
    if (path === '' || path === '/') return '/dashboard';
    return path;
  }

  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
  let currentRoute = $state<string>(resolveRoute(initialPath));
  let globalError = $state<{ msg?: string; stack?: string } | null>(null);

  const navigate = (route: string) => {
    currentRoute = route;
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
    }
  };

  onMount(async () => {
    // If local session exists, validate it with the backend in background
    if (authStore.isAuthenticated) {
      await authStore.validateSession();
    }

    // Determine current route from URL after validating session
    const pathname = window.location.pathname;
    const isPublicAuthRoute = ['/register', '/activate', '/forgot-password', '/reset-password', '/login'].includes(pathname);

    if (!isPublicAuthRoute && !authStore.isAuthenticated) {
      currentRoute = '/login';
    } else {
      currentRoute = resolveRoute(pathname);
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      const p = window.location.pathname || '/login';
      currentRoute = resolveRoute(p);
    });
  });
</script>

{#if authStore.loading}
  <div class="min-h-screen bg-[#09090B] pattern-dots-dark flex flex-col items-center justify-center space-y-4 font-outfit-400">
    <div class="relative">
      <div class="w-12 h-12 border-3 border-[#FF634A]/30 border-t-[#FF634A] rounded-full animate-spin"></div>
      <div class="absolute inset-0 bg-[#FF634A]/20 blur-xl rounded-full"></div>
    </div>
    <span class="text-xs font-outfit-600 text-[#A1A1AA] tracking-wider uppercase">Memuat sesi COZIS...</span>
  </div>
{:else if currentRoute === '/register' || currentRoute === '/activate'}
  <!-- Activation & Registration View -->
  <RegisterPage onNavigate={navigate} />
{:else if currentRoute === '/forgot-password'}
  <ForgotPasswordPage onNavigate={navigate} />
{:else if currentRoute === '/reset-password'}
  <ResetPasswordPage onNavigate={navigate} />
{:else if !authStore.isAuthenticated || currentRoute === '/login'}
  <!-- Login View -->
  <LoginPage onNavigate={navigate} />
{:else if authStore.user?.role === 'RIDER' || currentRoute.startsWith('/rider')}
  <!-- Dedicated Mobile-first Rider View -->
  <RiderDashboardPage onNavigate={navigate} />
{:else}
  <!-- Authenticated Views with AppShell -->
  <AppShell 
    {currentRoute} 
    onNavigate={navigate}
    compactSidebar={currentRoute === '/map'}
  >
    {#if globalError}
      <ServerErrorPage 
        errorMsg={globalError.msg} 
        errorStack={globalError.stack} 
        onNavigate={navigate}
        onRetry={() => { globalError = null; window.location.reload(); }}
      />
    {:else if currentRoute === '/map' || currentRoute === '/superadmin/map'}
      <SuperAdminMapPage onNavigate={navigate} />
    {:else if currentRoute === '/zones' || currentRoute === '/superadmin/zones'}
      <SuperAdminZonesPage onNavigate={navigate} />
    {:else if currentRoute === '/users' || currentRoute === '/superadmin/users'}
      {#if authStore.user?.role === 'SUPERADMIN' || authStore.user?.role === 'MANAGEMENT'}
        <SuperAdminUsersPage onNavigate={navigate} />
      {:else}
        <ForbiddenPage 
          onNavigate={navigate} 
          attemptedRoute={currentRoute}
          requiredRole="SUPERADMIN / MANAGEMENT" 
        />
      {/if}
    {:else if currentRoute === '/fleet' || currentRoute === '/superadmin/fleet'}
      <SuperAdminFleetPage onNavigate={navigate} />
    {:else if currentRoute === '/distribution' || currentRoute === '/superadmin/distribution'}
      {#if authStore.user?.role === 'SUPERADMIN' || authStore.user?.role === 'MANAGEMENT' || authStore.user?.role === 'SUPERVISOR'}
        <SuperAdminDistributionPage onNavigate={navigate} />
      {:else}
        <ForbiddenPage 
          onNavigate={navigate} 
          attemptedRoute={currentRoute}
          requiredRole="SUPERADMIN / SUPERVISOR / MANAGEMENT" 
        />
      {/if}
    {:else if currentRoute === '/dss' || currentRoute === '/superadmin/dss'}
      {#if authStore.user?.role === 'SUPERADMIN' || authStore.user?.role === 'MANAGEMENT' || authStore.user?.role === 'SUPERVISOR'}
        <SuperAdminDssPage onNavigate={navigate} />
      {:else}
        <ForbiddenPage 
          onNavigate={navigate} 
          attemptedRoute={currentRoute}
          requiredRole="SUPERADMIN / SUPERVISOR" 
        />
      {/if}
    {:else if currentRoute === '/reports' || currentRoute === '/superadmin/reports'}
      <SuperAdminReportsPage onNavigate={navigate} />
    {:else if currentRoute === '/settings' || currentRoute === '/superadmin/settings'}
      {#if authStore.user?.role === 'SUPERADMIN' || authStore.user?.role === 'MANAGEMENT'}
        <SuperAdminSettingsPage onNavigate={navigate} />
      {:else}
        <ForbiddenPage 
          onNavigate={navigate} 
          attemptedRoute={currentRoute}
          requiredRole="SUPERADMIN / MANAGEMENT" 
        />
      {/if}
    {:else if currentRoute === '/catalog' || currentRoute === '/superadmin/catalog'}
      {#if authStore.user?.role === 'SUPERVISOR'}
        <SupervisorCatalogPage onNavigate={navigate} />
      {:else}
        <SuperAdminCatalogPage onNavigate={navigate} />
      {/if}
    {:else if currentRoute === '/dashboard' || currentRoute === '/superadmin/dashboard' || currentRoute === '/'}
      <SuperAdminDashboardPage onNavigate={navigate} />
    {:else if currentRoute === '/403' || currentRoute === '/forbidden'}
      <ForbiddenPage onNavigate={navigate} attemptedRoute={currentRoute} />
    {:else if currentRoute === '/500' || currentRoute === '/server-error'}
      <ServerErrorPage onNavigate={navigate} />
    {:else}
      <!-- 404 Not Found Page for all unregistered routes -->
      <NotFoundPage onNavigate={navigate} attemptedRoute={currentRoute} />
    {/if}
  </AppShell>
{/if}
