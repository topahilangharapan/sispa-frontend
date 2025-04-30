import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from '../../stores/auth.ts'

export const roleGuard = (to: RouteLocationNormalized, _: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore();

  const savedAuth = localStorage.getItem("auth");
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  const userRole = authStore.user?.role?.toLowerCase() ?? null;
  const userToken = authStore.token ?? null;

  // 👇 Validasi halaman login dan register freelancer
  const isAuthPage = to.path === "/auth/login" || to.path.startsWith("/auth/register/freelancer") || to.path.startsWith("/component") ;

  // Jika user sudah login (punya token valid), jangan izinkan akses auth pages
  if (userToken && userRole && isAuthPage) {
    next("/dashboard"); // redirect ke dashboard sesuai role
    return;
  }

  // Jika belum login dan menuju login atau register freelancer → izinkan
  if (!userToken && isAuthPage) {
    next();
    return;
  }

  // Jika tidak ada token, arahkan ke login
  if (!userToken || !userRole) {
    next("/auth/login");
    return;
  }

  // Daftar akses per role
  const rolePermissions: Record<string, string[]> = {
    marketing: ["/dashboard", "/marketing"],
    finance: ["/dashboard", "/finance"],
    purchasing: ["/dashboard", "/purchasing"],
    freelancer: ["/dashboard"],
  };

  const allowedRoutes = rolePermissions[userRole.toLowerCase()] || [];

  if (userRole === "admin" || userRole == "manajemen" || userRole == "finance" || userRole == "marketing" || userRole == "purchasing") {
    next();
    return;
  }

  if (to.path === "/" && rolePermissions[userRole]) {
    next("/dashboard");
    return;
  }

  // Jika role tidak memiliki izin untuk halaman yang dituju, arahkan ke home
  if (!allowedRoutes.some(route => to.path.startsWith(route))) {
    next("/dashboard");
    return;
  }

  // Jika semua aman, lanjutkan ke halaman tujuan
  next();
  return
};
