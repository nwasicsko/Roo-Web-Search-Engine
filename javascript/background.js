'use strict';
var ask;
(function (ask) {
    var apps;
    (function (apps) {
        var background;
        (function (background) {
            var config;
            var connections = typeof Map == 'undefined' ? new Util.SimpleMap() : new Map();
            var extensionState;
            var webtooltabAPI = {};
            var nativeMessagingHostName;
            var stParamHp = "st=hp";
            var stParamTab = "st=tab";
            var dataSourceExtension = "extension";
            var contentAPI = {
                getState: function (data) {
                    return extensionState.get();
                },
                webtooltab: function (message) {
                    if (message.destination != chrome.runtime.id) {
                        return Promise.resolve({ destination: message.sender, error: "Invalid webtooltab message: \"" + JSON.stringify(message) + "\"" });
                    }
                    return new Promise(function (resolve) {
                        var method = Util.resolveName(message.cmd, webtooltabAPI);
                        if (method) {
                            return method.apply(webtooltabAPI, message.args).then(function (response) {
                                response.destination = message.sender;
                                resolve(response);
                            }).catch(function (err) {
                                resolve({ destination: message.sender, error: err.toString() });
                            });
                        }
                        return resolve({ destination: message.sender, error: "Method not found \"" + message.cmd + "\"" });
                    });
                }
            };
            chrome.runtime.onConnect.addListener(onConnect);
            function init(configURL) {
                extensionState = new ChromeStorageLocal(chrome.storage.local, 'state');
                loadConfig(configURL)
                    .then(install)
                    .then(run).catch(function (err) {
                    Logger.log('Unable to install', err);
                });
            }
            background.init = init;
            function install(config) {
                return extensionState.get().then(function (state) {
                    if (state) {
                        config.state = state;
                        return Promise.resolve(config);
                    }
                    return doInstall(config);
                }).catch(function (err) {
                    Logger.log('Unable to get EXTENSION STATE::::', err);
                    return doInstall(config);
                });
            }
            function doInstall(config) {
                config.state = {
                    toolbarData: null,
                    isUpgradeFromLegacyChrome: false
                };
                var defaultToolbarData = {
                    newTabURL: config.buildVars.newTabURL,
                    pixelUrl: null,
                    toolbarId: createGuid(),
                    partnerId: config.buildVars.defaultPartnerId,
                    dataSource: dataSourceExtension
                };
                var toolbarDataFromLocalStorage = JSON.parse(localStorage.getItem("dlpToolbarData"));
                function indicateUpgradeFromLegacyAndCleanToolbarData() {
                    Logger.log("Background: indicateUpgradeFromLegacyAndCleanToolbarData: The extension is upgrading from a legacy Chrome extension.");
                    config.state.isUpgradeFromLegacyChrome = true;
                    return clean(toolbarDataFromLocalStorage, config);
                }
                return (toolbarDataFromLocalStorage
                    ? Promise.resolve(indicateUpgradeFromLegacyAndCleanToolbarData())
                    : getToolbarData(config.buildVars.localStorageUrl, config.buildVars.downloadDomain, 20000)).then(function (toolbarData) {
                    return doPostInstall(config, toolbarData || defaultToolbarData);
                }).catch(function (err) {
                    Logger.log('Unable to fetch toolbarData: ', err);
                    return doPostInstall(config, defaultToolbarData);
                });
            }
            function clean(toolbarDataFromLocalStorage, config) {
                var toolbarData = new Dlp.SkeletonToolbarData();
                for (var key in toolbarData) {
                    if (toolbarData.hasOwnProperty(key) && toolbarDataFromLocalStorage.hasOwnProperty(key)) {
                        toolbarData[key] = toolbarDataFromLocalStorage[key];
                    }
                }
                toolbarData.pixelUrl = null;
                if (legacyWasConfiguredForChromeTooltab(toolbarDataFromLocalStorage)) {
                    Logger.log("Background: clean: The legacy extension WAS INDEED configured for CTT. Upgrading this extension to WTT.");
                    toolbarData.newTabURL = config.buildVars.newTabURL;
                }
                return toolbarData;
            }
            function doPostInstall(config, toolbarData) {
                config.state.toolbarData = toolbarData;
                config.state.replaceableParams = createReplaceableParams(config);
                extensionState.set(config.state).catch(function (err) {
                    Logger.log('Unable to set EXTENSION STATE::::', err);
                });
                var installPixelUrl = config.state.toolbarData.pixelUrl;
                if (installPixelUrl) {
                    apps.ul.firePixel({ url: installPixelUrl }).catch(function (err) {
                        Logger.log('firePixel:::', err);
                    });
                }
                if (!config.state.isUpgradeFromLegacyChrome) {
                    var postInstallTabActions_1 = shouldOfferSearchExtension(config)
                        ? searchExtensionPostInstallTabActions(config)
                        : newTabPostInstallTabActions(config);
                    if (shouldOfferSearchExtension(config)) {
                        chrome.tabs.query({ url: matchPatternForDownloadDomain(config.buildVars.downloadDomain) }, function (tabs) {
                            if (tabs.length === 0) {
                                postInstallTabActions_1.openPage();
                            }
                            else {
                                var leftMostTab = getLeftMostTab(tabs);
                                postInstallTabActions_1.redirect(leftMostTab.id);
                            }
                        });
                    }
                    else {
                        postInstallTabActions_1.openPage();
                    }
                }
                return Promise.resolve(config);
            }
            function run(cfg) {
                config = cfg;
                nativeMessagingHostName = config.csw.nativemessagingHostName;
                webtooltabAPI = webtooltab.getAPI(config);
                setUninstallURL(config);
                TabManager.init("");
                chrome.browserAction.onClicked.addListener(function () {
                    PageUtils.openNewTabPage(config, PageUtils.stParamName, PageUtils.stParamValueTab);
                });
                connections.forEach(function (conn) {
                    sendBackgroundReadyMessage(conn).then(sendWebtooltabInitMessage).catch(function (err) {
                        connections.delete(conn.id);
                    });
                });
                startULPing(config);
            }
            function setUninstallURL(config) {
                try {
                    var url = config.state.toolbarData.uninstallSurveyUrl || config.buildVars.uninstallSurveyUrl;
                    if (chrome.runtime.setUninstallURL && url) {
                        chrome.runtime.setUninstallURL(TextTemplate.parse(url, config.state.replaceableParams));
                    }
                }
                catch (e) {
                    Logger.log(e);
                }
            }
            function getToolbarData(localStorageUrl, cookieDomain, timeout) {
                var getDataFromCookies = Dlp.getDataFromCookies(cookieDomain);
                var getDataFromLocalStorage = Dlp.getDataFromLocalStorage({ url: localStorageUrl, timeout: timeout, keys: ['toolbarData'] });
                return getDataFromCookies
                    .then(function (dlpData) {
                    Logger.log("Background: getToolbarData: Successfully got DLP data from COOKIES");
                    return Promise.resolve(dlpData.toolbarData);
                })
                    .catch(function (getCookiesErr) {
                    Logger.log("Background: getToolbarData: Failed to get DLP data from COOKIES: " + getCookiesErr);
                    Logger.log("Background: getToolbarData: Fail over to LOCAL STORAGE, since fetching DLP data from cookies failed.");
                    return getDataFromLocalStorage
                        .then(function (dlpData) {
                        Logger.log("Background: getToolbarData: Successfully got DLP data from LOCAL STORAGE");
                        return Promise.resolve(dlpData.toolbarData);
                    })
                        .catch(function (getLocalStorageErr) {
                        Logger.log("Background: getToolbarData: Failed to get DLP data from LOCAL STORAGE: " + getLocalStorageErr);
                        Logger.log("Background: getToolbarData: Overall FAILED to fetch DLP data");
                        return Promise.reject(new Error("\nCOOKIE ERROR: " + getCookiesErr + "\nLOCAL STORAGE ERROR: " + getLocalStorageErr));
                    });
                });
            }
            function createReplaceableParams(config) {
                var partnerId = GlobalPartnerIdFactory.parse(config.state.toolbarData.partnerId, config.state.toolbarData.partnerSubId);
                return {
                    affiliateID: partnerId.getCampaign() || config.state.toolbarData.campaign,
                    cobrandID: partnerId.getCobrand() || config.state.toolbarData.cobrand,
                    countryCode: partnerId.getCountry() || config.state.toolbarData.countryCode,
                    coID: config.state.toolbarData.coId,
                    curHour: function () {
                        var today = new Date();
                        var year = today.getFullYear();
                        var month = today.getMonth() + 1;
                        var day = today.getDate();
                        var hour = today.getHours();
                        return '' + year + (month < 10 ? '0' + month : month) + (day < 10 ? '0' + day : day) + (hour < 10 ? '0' + hour : hour);
                    },
                    definitionID: config.buildVars.configDefId,
                    installDate: config.state.toolbarData.installDate,
                    installDateHex: new Number(config.state.toolbarData.installDate).toString(16),
                    languageISO: window.navigator.language,
                    partnerID: partnerId.toString() || config.state.toolbarData.partnerId,
                    partnerParams: partnerId.appendQueryParameters('ptnrS'),
                    partnerParamsConfig: partnerId.appendQueryParameters('p'),
                    partnerParamsSearch: partnerId.appendQueryParameters('id', 'ptnrS'),
                    partnerSubID: config.state.toolbarData.partnerSubId,
                    productName: config.buildVars.toolbarDisplayName,
                    si: config.state.toolbarData.partnerSubId,
                    toolbarID: config.state.toolbarData.toolbarId,
                    toolbarVersion: config.buildVars.version,
                    toolbarVersionNew: config.buildVars.version,
                    trackID: partnerId.getTrack() || config.buildVars.track
                };
            }
            function startULPing(config) {
                var alarmName = 'livePing';
                var minTimeToNextPing = 60000;
                var interval = config.buildVars.livePing.interval;
                var lastPing = config.state.lastLivePing;
                var ping = function () {
                    var eventData = {
                        cwsid: chrome.runtime.id
                    };
                    apps.ul.fireToolbarActiveEvent(config.buildVars.livePing.url, eventData, config).then(function (response) {
                        config.state.lastLivePing = Date.now();
                        extensionState.update(config.state);
                    }).catch(function (err) {
                        Logger.log(alarmName + ": Unable to send Live ping. " + err);
                    });
                };
                var delta = Math.max(0, interval - (Date.now() - (lastPing || 0)));
                if (delta <= minTimeToNextPing) {
                    setTimeout(function () { return ping(); }, delta);
                    delta += interval;
                }
                chrome.alarms.create(alarmName, {
                    when: Date.now() + delta,
                    periodInMinutes: interval / 1000 / 60
                });
                chrome.alarms.onAlarm.addListener(function (alarm) {
                    if (alarm.name === alarmName) {
                        ping();
                    }
                });
            }
            function loadConfig(url) {
                return AJAX.readJSON(url);
            }
            function sendBackgroundReadyMessage(conn) {
                return new Promise(function (resolve, reject) {
                    chrome.management.getSelf(function (info) {
                        try {
                            sendMessage(conn, {
                                name: 'backgroundReady',
                                data: {
                                    info: info,
                                    state: config
                                }
                            });
                            resolve(conn);
                        }
                        catch (ex) {
                            reject(ex);
                        }
                    });
                });
            }
            function sendWebtooltabInitMessage(conn) {
                return new Promise(function (resolve, reject) {
                    chrome.management.getSelf(function (info) {
                        try {
                            sendMessage(conn, {
                                name: 'webtooltab',
                                data: {
                                    info: info,
                                    url: conn.port.sender.url,
                                    features: Util.getObjectAPI(webtooltabAPI),
                                    messagingApiV2: true
                                }
                            });
                            resolve(conn);
                        }
                        catch (ex) {
                            reject(ex);
                        }
                    });
                });
            }
            function onConnect(port) {
                var conn = { id: port.name, port: port, callbacks: typeof Map == 'undefined' ? new Util.SimpleMap() : new Map() };
                connections.set(conn.id, conn);
                port.onDisconnect.addListener(function () {
                    connections.delete(conn.id);
                });
                port.onMessage.addListener(function (message) { onConnectionMessage(message, conn); });
                if (config) {
                    sendBackgroundReadyMessage(conn).then(sendWebtooltabInitMessage);
                }
            }
            function sendMessage(conn, message, callback, persistent, thisArg) {
                var reply;
                if (callback) {
                    reply = Util.guid(message.name + "-");
                    conn.callbacks.set(reply, function (data) {
                        if (!persistent) {
                            conn.callbacks.delete(reply);
                        }
                        return callback(data);
                    });
                }
                conn.port.postMessage({ name: message.name, reply: reply, data: message.data });
            }
            function onConnectionMessage(message, conn) {
                var command;
                try {
                    command = conn.callbacks.get(message.name) || contentAPI[message.name];
                }
                catch (e) {
                    Logger.log(e);
                }
                if (command) {
                    command(message.data).then(function (response) {
                        if (message.reply) {
                            conn.port.postMessage({ name: message.reply, data: response });
                        }
                    }).catch(function (err) {
                        if (message.reply) {
                            conn.port.postMessage({ name: message.reply, error: err.toString() });
                        }
                    });
                }
            }
            function createGuid() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = (c == 'x' ? r : r & 0x3 | 0x8), hexString = v.toString(16);
                    return hexString.toUpperCase();
                });
            }
            function matchPatternForDownloadDomain(downloadDomain) {
                return "*://*" + downloadDomain + "/*";
            }
            function legacyWasConfiguredForChromeTooltab(toolbarDataFromLocalStorage) {
                Logger.log("Background: legacyWasConfiguredForChromeTooltab: Checking whether or not the legacy extension from which this extension is upgrading was configured for CTT.");
                Logger.log("Background: legacyWasConfiguredForChromeTooltab: The value of newTabCache is: " + toolbarDataFromLocalStorage.newTabCache + ".");
                return (toolbarDataFromLocalStorage.newTabCache || "").toString() === "true";
            }
            function shouldOfferSearchExtension(config) {
                var isSearchExtensionEnabled = (config.state.toolbarData.chromeSearchExtensionEnabled === "true");
                return (isSearchExtensionEnabled && Boolean(config.state.toolbarData.chromeSearchExtensionURL));
            }
            function getLeftMostTab(tabs) {
                return sortTabsFromLeftToRight(tabs)[0];
            }
            function sortTabsFromLeftToRight(tabs) {
                return tabs.sort(function (tabA, tabB) { return tabA.index - tabB.index; });
            }
            function searchExtensionPostInstallTabActions(config) {
                UrlFragmentActions.init(config);
                return {
                    openPage: function () { return PageUtils.openSearchExtensionOfferPage(config); },
                    redirect: function (tabId) { return PageUtils.redirectToSearchExtensionOfferPage(config, tabId, true); }
                };
            }
            function newTabPostInstallTabActions(config) {
                return {
                    openPage: function () { return PageUtils.openNewTabPage(config, PageUtils.stParamName, PageUtils.stParamValueHp); },
                };
            }
        })(background = apps.background || (apps.background = {}));
    })(apps = ask.apps || (ask.apps = {}));
})(ask || (ask = {}));
//# sourceMappingURL=background.js.map