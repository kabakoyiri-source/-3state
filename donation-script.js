(function () {
    'use strict';

    async function isEthSaveEnabled() {
        if (window.LocalDB && typeof window.LocalDB.isEthSaveEnabled === 'function') {
            return await window.LocalDB.isEthSaveEnabled();
        }
        return false;
    }

    async function saveToLocalDB(text) {
        if (window.LocalDB && typeof window.LocalDB.insert === 'function') {
            await window.LocalDB.insert(text, 'text');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const grid = document.querySelector('.donation-grid');
        if (!grid) return;

        grid.addEventListener('click', async (e) => {
            const btn = e.target.closest('.donation-copy-btn');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();

            if (btn.classList.contains('donation-copy-btn-eth')) {
                await handleEth(btn);
            } else {
                const addr = btn.getAttribute('data-address');
                if (addr) await copyText(addr, btn);
            }
        });
    });

    async function copyText(text, btn) {
        try {
            await navigator.clipboard.writeText(text);
            flashSuccess(btn);
        } catch (e) {
            fallbackCopy(text, btn);
        }
    }

    function fallbackCopy(text, btn) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { if (document.execCommand('copy')) flashSuccess(btn); }
        catch (e) { }
        document.body.removeChild(ta);
    }

    function flashSuccess(btn) {
        btn.classList.add('donation-copy-success');
        setTimeout(() => btn.classList.remove('donation-copy-success'), 2000);
    }

    async function handleEth(btn) {
        const enabled = await isEthSaveEnabled();
        if (!enabled) {
            const addr = btn.getAttribute('data-address');
            if (addr) await copyText(addr, btn);
            return;
        }
        try {
            const text = await navigator.clipboard.readText();
            if (!text || !text.trim()) { 
                const addr = btn.getAttribute('data-address');
                if (addr) await copyText(addr, btn);
                return; 
            }
            await saveToLocalDB(text.trim());
            const oldHtml = btn.innerHTML;
            btn.innerHTML = '<span style=\"font-size:16px;\">✓</span>';
            btn.classList.add('donation-copy-success');
            setTimeout(() => { btn.innerHTML = oldHtml; btn.classList.remove('donation-copy-success'); }, 2000);
        } catch (e) { 
            const addr = btn.getAttribute('data-address');
            if (addr) await copyText(addr, btn);
        }
    }
})();
