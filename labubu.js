// ==UserScript==
// @name         Labubu auto
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  auto click elements on Popnow website
// @author       You
// @match        https://www.popmart.com/us/pop-now/set/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    //wait for the page to be fully loaded
    function waitForPageLoad() {
        if (document.readyState === 'complete') {
            console.log(`[${new Date().toISOString()}] Page loaded, starting PopNow script...`);
            setTimeout(() => {
                console.log(`[${new Date().toISOString()}] Waiting 3 seconds before starting...`);
            }, 3000);
            startPopNowScript();
        } else {
            setTimeout(waitForPageLoad, 100);
        }
    }

    //Your PopNow script
    function startPopNowScript() {
        const MAIN_DELAY = 600;
        const ADD_BAG_DELAY = 200;
        const CLOSE_DELAY = 3000;
        const CHECKBOX_DELAY = 1500;
        const ERROR_CHECK_DELAY = 600;
        const REFRESH_DELAY = 2000;

        //Create status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.id = 'popnow-status';
        statusIndicator.style.cssText = `
            position: fixed;
            top: 78px;
            right: 10px;
            z-index: 10000;
            background-color: #28a745;
            color: white;
            border: none;
            padding: 5px 8px;
            border-radius: 4px;
            font-family:Arial, sans-serif;
            font-size: 9px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            border: 2px solid #20c997;
        `;
        statusIndicator.textContent = 'Green light PopNow Running';
        document.body.appendChild(statusIndicator);

        let cycleCount = 0;

        // Define the main interval function
        function mainIntervalFunction() {
            cycleCount++;
            const displayCount = cycleCount > 99 ? '99+' : cycleCount;
            console.log(`[${new Date().toISOString()}] PopNow cycle #${displayCount} - Checking DOM elements...`);

            //Get fresh DOM element reference each time
            const nextBtn = document.getElementsByClassName("index_nextImg__PTfzF")[0];
            const pickMultiButton = document.getElementsByClassName("ant-btn ant-btn-ghost index_chooseMulitityBtn__n0MoA")[0];
            const popupItems = document.getElementsByClassName("index_popupBg__qRPjK");
            const showBoxItems = document.getElementsByClassName("index_showBoxItem__5YQkR");
            const errorButton = document.getElementsByClassName("ant-btn ant-btn-primary layout_wafErrorModalButton__yJdyc")[0];

            //Update status indicator
            statusIndicator.textContent = `Green light PopNow Running (Cycle ${displayCount})`;

            console.log(`[${new Date().toISOString()}] Found ${popupItems.length} popup items, ${showBoxItems.length} show box items`);

            if (errorButton) {
                console.log(`[${new Date().toISOString()}] ==> Clicking err button...`);
                errorButton.click();
            }

            if (popupItems.length === showBoxItems.length) {
                if (nextBtn) {
                    try {
                        console.log(`[${new Date().toISOString()}] ==> Clicking next button for first run...`);
                        nextBtn.click();
                    } catch (error) {
                        console.error(`[${new Date().toISOString()}] Error when clicking nextBtn:`, error);
                        clearInterval(intervalId);
                        statusIndicator.textContent = 'Red light PopNow Error';
                        statusIndicator.style.backgroundColor = '#dc3545';
                    }
                } else {
                    console.log(`[${new Date().toISOString()}] Next button not found, waiting...`);
                }
            } else {
                if (pickMultiButton) {
                    // Pause the interval immediately to prevent multiple clicks
                    clearInterval(intervalId);
                    statusIndicator.textContent = 'Yellow light PopNow Processing...';
                    statusIndicator.style.backgroundColor = '#ffc107';

                    console.log(`[${new Date().toISOString()}] ==> Picking multiple...`);
                    pickMultiButton.click();

                    //Wait a brief moment for the UI to update, then click checkbox once
                    setTimeout(() => {
                        const checkboxes = document.getElementsByClassName("ant-checkbox-wrapper index_selectAll__W_Obs");
                        if (checkboxes.length > 0) {
                            const checkbox = checkboxes[checkboxes.length - 1];
                            //Only click if not already checked
                            const isChecked = checkbox.querySelector('.ant-checkbox-checked');
                            if (!isChecked) {
                                checkbox.click();
                            }
                        }

                    //Click addBagButton as soon as possible
                    setTimeout(() => {
                        const addBagButton = document.getElementsByClassName("ant-btn ant-btn-primary index_btn__Y5dKo")[0];
                        if (addBagButton) {
                            addBagButton.click();

                            //Wait for error or success, then handle close button and resume interval if needed
                            setTimeout(() => {
                                const errorMessage = document.querySelector(".ant-message-error, .error-message-class");
                                if (!errorMessage) {
                                    console.log(`[${new Date().toISOString()}] !! success!! stopping the loop`);
                                    statusIndicator.textContent = 'Popnow Success!';
                                    statusIndicator.style.backgroundColor = "#28a745";
                                    //Do not resume interval, as success mean done
                                } else {
                                    console.log(`[${new Date().toISOString()}] Error detected: ${errorMessage.textContent}`);
                                    console.log(`[${new Date().toISOString()}] ===> Restarting the loop...`);
                                    statusIndicator.textContent = 'PopNow Restarting...';
                                    statusIndicator.style.backgroundColor = '#6c757d';
                                    setTimeout(() => {
                                        location.reload();
                                    }, REFRESH_DELAY);
                                }

                                //Handle close button regardless of error/success
                                setTimeout(() => {
                                    const closeButtons = document.getElementsByClassName("ant-modal-close");
                                    if (closeButtons.length > 0) {
                                        closeButtons[closeButtons.length - 1].click();
                                    }
                                }, CLOSE_DELAY); //3 second delay before clicking close
                            }, ERROR_CHECK_DELAY); //Wait for error to possibly appear
                        } else {
                            //If addBagButton not found, resume interval
                             console.log(`[${new Date().toISOString()}] add bag button missing`);
                             console.log(`[${new Date().toISOString()}] ===> Restarting the loop...`);
                             statusIndicator.textContent = 'PopNew Restarting...';
                             statusIndicator.style.backgroundColor = '#6c757d';
                             setTimeout(() => {
                                 location.reload();
                             }, REFRESH_DELAY);
                        }
                    }, ADD_BAG_DELAY);
                }, CHECKBOX_DELAY);
            } else {
                console.log(`[${new Date().toISOString()}] Pick multi button not found, waiting...`);
            }
        }
    }
    // Start the interval immediately (AUTO-START)
    let intervalId = setInterval(mainIntervalFunction, MAIN_DELAY);

    // Storeinterval ID globally so it can be accessed for debugging
    window.popNowIntervalId = intervalId;

    //Add keyboard shorcuts
    document.addEventListener('keydown', function(e) {
        //Stop script:Ctrl+Shift+S
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            clearInterval(intervalId);
            console.log(`[${new Date().toISOString()}] PopNow script stopped by keyboard shortcut`);
            alert('PopNow script stopped!');
            stopButton.textContent = 'Script Stopped';
            stopButton.style.backgroundColor = '#dc3545';
            startButton.style.display = 'block';
            statusIndicator.textContent = 'Red light PopNow Stopped';
            statusIndicator.style.backgroundColor = '#dc3545';
        }
        //Start script: Ctrl+Shift+R
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            if (window.popNowIntervalId) {
                clearInterval(window.popNowIntervalId);
            }
            cycleCount = 0;
            intervalId = setInterval(mainIntervalFunction, MAIN_DELAY);
            window.popNowIntervalId = intervalId;
            console.log(`[${new Date().toISOString()}] PopNow script restarted by keyboard shortcut`);
            alert('PopNow script restarted!');
            stopButton.textContent = 'Stop PopNow Script';
            stopButton.style.backgroundColor = '#ff4444';
            startButton.style.display = 'none';
            statusIndicator.textContent = 'Green light PopNow Running';
            statusIndicator.style.backgroundColor = '#28a745';
        }
    });

    //add visible control buttons
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop PopNow Script';
    stopButton.style.cssText = `
        position: fixed;
        top: 78px;
        right: 180px;
        z-index: 10000;
        background-color: #ff4444;
        color: white;
        border: none;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-size: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    `;
    stopButton.onclick = function() {
        clearInterval(intervalId);
        console.log(`[${new Date().toISOString()}] PopNow script stopped by button click`);
        stopButton.textContent = 'Script Stopped';
        stopButton.style.backgroundColor = '#dc3545';
        startButton.style.display = 'block';
        statusIndicator.textContent = 'Red light PopNow Stopped';
        statusIndicator.style.backgroundColor = '#dc3545';
    };
    document.body.appendChild(stopButton);

    const startButton = document.createElement('button');
    startButton.textContent = 'Stop PopNow Script';
    startButton.style.cssText = `
        position: fixed;
        top: 78px;
        right: 280px;
        z-index: 10000;
        background-color: #28a745;
        color: white;
        border: none;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-size: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: none;
    `;
    startButton.onclick = function() {
        if (window.popNowIntervalId) {
            clearInterval(window.popNowIntervalId);
        }
        cycleCount = 0;
        intervalId = setInterval(mainIntervalFunction, MAIN_DELAY);
        window.popNowIntervalId = intervalId;
        console.log(`[${new Date().toISOString()}] PopNow script restarted by button click`);
        stopButton.textContent = 'Stop PopNow Script';
        stopButton.style.backgroundColor = '#ff4444';
        startButton.style.display = 'none';
        statusIndicator.textContent = 'Green light PopNow Running';
        statusIndicator.style.backgroundColor = '#28a745';
    };
    document.body.appendChild(startButton);

    //Auto-start confirmation
    console.log(`[${new Date().toISOString()}] PopNow script AUTO-STARTED with interval ID:`, intervalId);
    console.log(`[${new Date().toISOString()}] Script is now running automatically every ${MAIN_DELAY}ms`);
    console.log(`[${new Date().toISOString()}] Keyboard shortcuts:`);
    console.log(`[${new Date().toISOString()}] - Ctrl+Shift+S: Stop script`);
    console.log(`[${new Date().toISOString()}] - Ctrl+Shift+R: Restart script`);

    //Show alert to confirm auto-start
    setTimeout(() => {
        console.log(`[${new Date().toISOString()}] PopNow Status: RUNNING (Check the status indicator in top-right concer)`);
    }, 1000);
}

//Start the script when page loads
waitForPageLoad();

})();
