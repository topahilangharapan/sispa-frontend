import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

// Simulasi role user (diambil dari localStorage atau Vuex/Pinia dalam real case)
const getUserRole = () => localStorage.getItem("userRole") || "guest";

// Daftar akses per role
const rolePermissions: Record<string, string[]> = {
  admin: ["/dashboard", "/inventory", "/finance", "/client", "/vendor", "/staff-freelancer"],
  staff: ["/dashboard", "/inventory"],
  guest: ["/"]
};

// Guard untuk mengecek akses berdasarkan role
export const roleGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const userRole = getUserRole();
  const allowedRoutes = rolePermissions[userRole] || [];

  if (allowedRoutes.includes(to.path)) {
    next();
  } else {
    next("/"); // Redirect ke home jika tidak punya akses
  }
};
