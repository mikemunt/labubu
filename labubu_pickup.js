// ==UserScript==
// @name         Labubu Store Pickup Auto
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Auto monitor and click buttons on POPMART Store Pickup page
// @author       You
// @match        https://www.popmart.com/us/store-pickup/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    function waitForPageLoad() {
        if (document.readyState === 'complete') {
            console.log(`[${new Date().toISOString()}] Page fully loaded.`);
            setTimeout(startScript, 3000);
        } else {
            setTimeout(waitForPageLoad, 100);
        }
    }

    function startScript() {
        const MAIN_DELAY = 1500;
        const REFRESH_DELAY = 3000;
        let cycle = 0;

        const status = document.createElement('div');
        status.id = 'pickup-status';
        status.style.cssText = `
            position: fixed;
            top: 80px;
            right: 10px;
            background: #28a745;
            color: white;
            padding: 5px 10px;
            font-size: 11px;
            border-radius: 4px;
            box-shadow: 0 0 5px rgba(0,0,0,0.3);
            z-index: 9999;
        `;
        status.textContent = 'Pickup script running...';
        document.body.appendChild(status);

        function checkAndClick() {
            cycle++;
            console.log(`[Cycle ${cycle}] Scanning...`);

            const qty = document.querySelector('.ant-input-number-input');
            const plusBtn = document.querySelector('.ant-input-number-handler-up');
            const addToCartBtn = document.querySelector('button:enabled span')?.textContent?.includes("NOTIFY ME") ?
                null :
                document.querySelector('button:enabled');

            if (qty && plusBtn && parseInt(qty.value) === 0) {
                plusBtn.click();
                console.log("Clicked quantity +");
            }

            if (addToCartBtn) {
                console.log("Trying to click purchase/add-to-cart button...");
                document.querySelector('button:enabled')?.click();
                status.textContent = 'Clicked add-to-cart!';
                status.style.backgroundColor = '#ffc107';
                clearInterval(intervalId);
            } else {
                status.textContent = `Cycle ${cycle}: Not in stock.`;
            }
        }

        let intervalId = setInterval(checkAndClick, MAIN_DELAY);
        window.pickupIntervalId = intervalId;

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                clearInterval(intervalId);
                console.log("Script stopped.");
                status.textContent = 'Script stopped.';
                status.style.backgroundColor = '#dc3545';
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                clearInterval(intervalId);
                cycle = 0;
                intervalId = setInterval(checkAndClick, MAIN_DELAY);
                console.log("Script restarted.");
                status.textContent = 'Script restarted.';
                status.style.backgroundColor = '#28a745';
            }
        });
    }

    waitForPageLoad();
})();
