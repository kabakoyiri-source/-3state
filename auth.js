/**
 * 3State Ventures Authentication System
 * Connects to PHP backend /api/chodor/login or configured endpoint
 */

(function () {
    'use strict';

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE_URL = window.THREESTATE_API_URL || window.CHODOR_API_URL || (isLocal 
        ? 'http://localhost/betaconcept/newbetaconcept-backend-php/api/chodor' 
        : 'https://mohlecodeur.alwaysdata.net/api/chodor');
    const AUTH_KEY = 'threestate_auth_user';
    const AUTH_TOKEN_KEY = 'threestate_admin_token';
    const LEGACY_AUTH_KEY = 'chodor_auth_user';
    const LEGACY_TOKEN_KEY = 'chodor_admin_token';

    async function login(username, password) {
        try {
            const res = await fetch(${API_BASE_URL}/login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success && data.token) {
                const userData = {
                    username: username,
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
        } catch (e) {
            console.error('Auth login error:', e);
            // Fallback demo user check
            const validUsers = ['3State', 'admin@3state.com', 'info@3state.com', 'Chodor', 'info@chodor.co'];
            const validPasswords = ['Singapore2026', 'Dubai2026', 'W529hS621pL3s4Zk279@', '3state2026'];
            
            if (validUsers.includes(username) && validPasswords.includes(password)) {
                const userData = { username, role: 'admin', loginTime: new Date().toISOString() };
                localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
                localStorage.setItem(AUTH_TOKEN_KEY, 'demo_token');
                localStorage.setItem(LEGACY_TOKEN_KEY, 'demo_token');
                sessionStorage.setItem(AUTH_TOKEN_KEY, 'demo_token');
                sessionStorage.setItem(LEGACY_TOKEN_KEY, 'demo_token');
                return { success: true, user: userData };
            }
            return { success: false, message: 'Server connection error.' };
        }
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
