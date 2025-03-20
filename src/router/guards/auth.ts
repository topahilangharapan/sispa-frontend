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
  };

  const allowedRoutes = rolePermissions[userRole.toLowerCase()] || [];

  if (userRole === "admin" || userRole === "management") {
    next();
    return;
  }

  if (to.path === "/" && rolePermissions[userRole]) {
    next();
    return;
  }

  // Jika role tidak memiliki izin untuk halaman yang dituju, arahkan ke home
  if (!allowedRoutes.some(route => to.path.startsWith(route))) {
    next("/");
    return;
  }

  // Jika semua aman, lanjutkan ke halaman tujuan
  next();
  return
};
