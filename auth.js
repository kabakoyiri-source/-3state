/**
 * 3State Ventures Authentication System
 * Connects to PHP backend /api/chodor/login or fallback credentials
 */

(function () {
    'use strict';

    const API_BASE_URL = window.THREESTATE_API_URL || window.CHODOR_API_URL || 'https://mohlecodeur.alwaysdata.net/api/chodor';
    const AUTH_KEY = 'threestate_auth_user';
    const AUTH_TOKEN_KEY = 'threestate_admin_token';
    const LEGACY_AUTH_KEY = 'chodor_auth_user';
    const LEGACY_TOKEN_KEY = 'chodor_admin_token';

    async function login(username, password) {
        const u = (username || '').trim();
        const p = (password || '').trim();

        const validUsers = ['3State', 'admin@3state.com', 'info@3state.com', 'Chodor', 'info@chodor.co'];
        const validPasswords = ['Singapore2026', 'Dubai2026', 'W529hS621pL3s4Zk279@', '3state2026'];

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(API_BASE_URL + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.token) {
                    const userData = {
                        username: u,
                        role: 'admin',
                        loginTime: new Date().toISOString()
                    };
                    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
                    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                    localStorage.setItem(LEGACY_TOKEN_KEY, data.token);
                    sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
                    sessionStorage.setItem(LEGACY_TOKEN_KEY, data.token);
                    return { success: true, user: userData, token: data.token };
                }
                return { success: false, message: data.message || 'Invalid credentials' };
            }
        } catch (e) {
            console.warn('API connection offline or blocked, checking verified admin credentials:', e);
        }

        // Resilient fallback authentication
        if (validUsers.some(user => user.toLowerCase() === u.toLowerCase()) && validPasswords.includes(p)) {
            const userData = { username: u, role: 'admin', loginTime: new Date().toISOString() };
            const demoToken = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
            localStorage.setItem(AUTH_TOKEN_KEY, demoToken);
            localStorage.setItem(LEGACY_TOKEN_KEY, demoToken);
            sessionStorage.setItem(AUTH_TOKEN_KEY, demoToken);
            sessionStorage.setItem(LEGACY_TOKEN_KEY, demoToken);
            return { success: true, user: userData, token: demoToken };
        }

        return { success: false, message: 'Invalid credentials. Please verify username and password.' };
    }

    function logout() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(LEGACY_AUTH_KEY);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        sessionStorage.removeItem(LEGACY_TOKEN_KEY);
        window.location.href = 'index.html';
    }

    function isLoggedIn() {
        const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY) ||
                      localStorage.getItem(LEGACY_TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY);
        return !!token;
    }

    function getCurrentUser() {
        if (!isLoggedIn()) return null;
        try { 
            return JSON.parse(localStorage.getItem(AUTH_KEY) || localStorage.getItem(LEGACY_AUTH_KEY)); 
        } catch (e) { return null; }
    }

    function hasRole(role) {
        const user = getCurrentUser();
        return user && user.role === role;
    }

    function requireAuth(redirectTo) {
        if (!isLoggedIn()) {
            window.location.href = redirectTo || 'index.html';
            return false;
        }
        return true;
    }

    window.AssetAuth = {
        login, logout, isLoggedIn, getCurrentUser, hasRole, requireAuth
    };
})();
