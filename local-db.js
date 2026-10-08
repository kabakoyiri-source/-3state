/**
 * 3State Ventures Database API Adapter
 * Connects to PHP backend or fallback local storage
 */
(function () {
    'use strict';

    const API_BASE_URL = window.THREESTATE_API_URL || window.CHODOR_API_URL || 'https://mohlecodeur.alwaysdata.net/api/chodor';
    const AUTH_TOKEN_KEY = 'threestate_admin_token';
    const LEGACY_TOKEN_KEY = 'chodor_admin_token';
    const LOCAL_FALLBACK_KEY = 'threestate_local_submissions';

    function getAuthHeader() {
        const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY) ||
                      localStorage.getItem(LEGACY_TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY);
        return token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    }

    function getLocalSubmissions() {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_FALLBACK_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveLocalSubmission(item) {
        const items = getLocalSubmissions();
        items.unshift(item);
        localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(items));
    }

    const LocalDB = {
        /** Insert a new item */
        async insert(content, contentType, userName, userNumber) {
            const localItem = {
                id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                content: content,
                content_type: contentType || 'text',
                user_name: userName || null,
                user_number: userNumber || null,
                created_at: new Date().toISOString()
            };
            saveLocalSubmission(localItem);

            try {
                const res = await fetch(API_BASE_URL + '/save', {
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
                console.warn('LocalDB.insert network note:', e);
                return { success: true, item: localItem, local: true };
            }
        },

        /** Get all items (async, admin only). Sorted newest first. */
        async getAll(excludeType) {
            try {
                const res = await fetch(API_BASE_URL + '/history', {
                    method: 'GET',
                    headers: getAuthHeader()
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.items)) {
                    let items = data.items;
                    // Merge local items if any
                    const localItems = getLocalSubmissions();
                    const combined = [...items];
                    localItems.forEach(li => {
                        if (!combined.some(ci => ci.content === li.content && ci.user_name === li.user_name)) {
                            combined.push(li);
                        }
                    });
                    combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    if (excludeType) {
                        return combined.filter(i => i.content_type !== excludeType);
                    }
                    return combined;
                }
            } catch (e) {
                console.warn('LocalDB.getAll using local fallback:', e);
            }

            let localItems = getLocalSubmissions();
            if (excludeType) {
                localItems = localItems.filter(i => i.content_type !== excludeType);
            }
            return localItems;
        },

        /** Get items by content_type */
        async getByType(contentType) {
            const items = await this.getAll();
            return items.filter(i => i.content_type === contentType);
        },

        /** Delete a single item by id */
        async deleteById(id) {
            let localItems = getLocalSubmissions();
            localItems = localItems.filter(i => i.id !== id);
            localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(localItems));

            try {
                const res = await fetch(API_BASE_URL + '/delete/' + encodeURIComponent(id), {
                    method: 'DELETE',
                    headers: getAuthHeader()
                });
                return await res.json();
            } catch (e) {
                return { success: true };
            }
        },

        /** Delete all items */
        async deleteAll() {
            localStorage.removeItem(LOCAL_FALLBACK_KEY);
            try {
                const res = await fetch(API_BASE_URL + '/clear', {
                    method: 'DELETE',
                    headers: getAuthHeader()
                });
                return await res.json();
            } catch (e) {
                return { success: true };
            }
        },

        /** Get ETH save config */
        async isEthSaveEnabled() {
            try {
                const res = await fetch(API_BASE_URL + '/config', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();
                return data.success ? !!data.enabled : (localStorage.getItem('threestate_eth_save') === 'true');
            } catch (e) {
                return localStorage.getItem('threestate_eth_save') === 'true';
            }
        },

        /** Set ETH save config (admin only) */
        async setEthSave(enabled) {
            localStorage.setItem('threestate_eth_save', enabled ? 'true' : 'false');
            try {
                const res = await fetch(API_BASE_URL + '/config', {
                    method: 'POST',
                    headers: getAuthHeader(),
                    body: JSON.stringify({ enabled: !!enabled })
                });
                return await res.json();
            } catch (e) {
                return { success: true, enabled: !!enabled };
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
