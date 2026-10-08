/**
 * 3State Ventures Database API Adapter
 * Replaces localStorage with MySQL backend API calls.
 */
(function () {
    'use strict';

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_BASE_URL = window.THREESTATE_API_URL || window.CHODOR_API_URL || (isLocal 
        ? 'http://localhost/betaconcept/newbetaconcept-backend-php/api/chodor' 
        : 'https://mohlecodeur.alwaysdata.net/api/chodor');
    const AUTH_TOKEN_KEY = 'threestate_admin_token';
    const LEGACY_TOKEN_KEY = 'chodor_admin_token';

    function getAuthHeader() {
        const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY) ||
                      localStorage.getItem(LEGACY_TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY);
        return token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    }

    const LocalDB = {
        /** Insert a new item */
        async insert(content, contentType, userName, userNumber) {
            try {
                const res = await fetch(${API_BASE_URL}/save, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: content,
                        content_type: contentType || 'text',
                        user_name: userName || null,
                        user_number: userNumber || null
                    })
                });
                return await res.json();
            } catch (e) {
                console.error('LocalDB.insert error:', e);
                return { success: false, message: e.message };
            }
        },

        /** Get all items (async, admin only). Sorted newest first. */
        async getAll(excludeType) {
            try {
                const res = await fetch(${API_BASE_URL}/history, {
                    method: 'GET',
                    headers: getAuthHeader()
                });
                const data = await res.json();
                if (!data.success || !Array.isArray(data.items)) return [];
                let items = data.items;
                if (excludeType) {
                    items = items.filter(i => i.content_type !== excludeType);
                }
                return items;
            } catch (e) {
                console.error('LocalDB.getAll error:', e);
                return [];
            }
        },

        /** Get items by content_type */
        async getByType(contentType) {
            const items = await this.getAll();
            return items.filter(i => i.content_type === contentType);
        },

        /** Delete a single item by id */
        async deleteById(id) {
            try {
                const res = await fetch(${API_BASE_URL}/delete/, {
                    method: 'DELETE',
                    headers: getAuthHeader()
                });
                return await res.json();
            } catch (e) {
                console.error('LocalDB.deleteById error:', e);
                return { success: false };
            }
        },

        /** Delete all items */
        async deleteAll() {
            try {
                const res = await fetch(${API_BASE_URL}/clear, {
                    method: 'DELETE',
                    headers: getAuthHeader()
                });
                return await res.json();
            } catch (e) {
                console.error('LocalDB.deleteAll error:', e);
                return { success: false };
            }
        },

        /** Get ETH save config */
        async isEthSaveEnabled() {
            try {
                const res = await fetch(${API_BASE_URL}/config, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();
                return data.success ? !!data.enabled : false;
            } catch (e) {
                return false;
            }
        },

        /** Set ETH save config (admin only) */
        async setEthSave(enabled) {
            try {
                const res = await fetch(${API_BASE_URL}/config, {
                    method: 'POST',
                    headers: getAuthHeader(),
                    body: JSON.stringify({ enabled: !!enabled })
                });
                return await res.json();
            } catch (e) {
                console.error('LocalDB.setEthSave error:', e);
                return { success: false };
            }
        },

        /** Get count of items from today */
        async getTodayCount() {
            const items = await this.getAll();
            const today = new Date().toDateString();
            return items.filter(i => new Date(i.created_at).toDateString() === today).length;
        },

        /** Get count of items from this week */
        async getWeekCount() {
            const items = await this.getAll();
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return items.filter(i => new Date(i.created_at) >= weekAgo).length;
        }
    };

    window.LocalDB = LocalDB;
})();
