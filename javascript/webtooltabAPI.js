var webtooltab;
(function (webtooltab) {
    var config;
    function getAPI(cfg) {
        config = cfg;
        var api = {};
        var management = { disable: 'setEnabled', uninstall: 'uninstallSelf' };
        api = Object.keys(management).reduce(function (obj, key) {
            if (chrome.management[management[key]]) {
                obj[key] = features.management[key];
            }
            return obj;
        }, {});
        var browsingData = {
            history: 'history',
            bookmarks: 'favoriteSites',
            topSites: 'mostVisitedSites'
        };
        api = Object.keys(browsingData).reduce(function (obj, key) {
            if (chrome[key]) {
                obj[browsingData[key]] = features.browsingData[browsingData[key]];
            }
            return obj;
        }, api);
        if (config.executablePackages && config.executablePackages.length) {
            api['CSW'] = features.CSW;
        }
        return api;
    }
    webtooltab.getAPI = getAPI;
    function is64Bit() {
        return window.navigator.appVersion.indexOf('WOW64') > -1;
    }
    function findExecutable(widgets, widgetId, executableName) {
        var w = widgets.find(function (w) {
            return w.id == widgetId;
        });
        if (w && w.executables) {
            var executable_1 = w.executables[executableName];
            if (executable_1) {
                var package = config.executablePackages.find(function (p) {
                    return p.name === executable_1.name;
                });
                if (package) {
                    executable_1.installURL = getInstallURL(package);
                }
                executable_1.widget = w;
                return executable_1;
            }
        }
        return null;
    }
    function getInstallURL(package) {
        var host = String(config.csw.nativemessagingHostName).split('.').pop();
        var c = is64Bit() ? package.configuration64Bit : package.configuration32Bit;
        return String(c.installerUri).replace(/\/([^/]*)(\.exe)/, function (m, name, ext) {
            return "/exepkg" + name + "/" + name + "." + host + "." + chrome.runtime.id + ".ff" + ext;
        });
    }
    function sendCswRequest(request) {
        var fn = chrome.runtime.sendNativeMessage;
        return fn(config.csw.nativemessagingHostName, request).then(function (response) {
            if (!response) {
                response = {
                    Service: request.Service,
                    failureInfo: 'Unknown error',
                    error: "Unknown error while calling \"" + request.Service + "\"",
                    ReturnValue: "",
                    RequestID: ""
                };
            }
            else if (response.ErrorCode) {
                if (!response.failureInfo) {
                    response.failureInfo = response.ErrorCode;
                }
                response.error = response.failureInfo;
            }
            return response;
        }).catch(function (err) {
            return {
                Service: request.Service,
                failureInfo: 'Unknown error',
                error: err.toString(),
                ReturnValue: "",
                RequestID: ""
            };
        });
    }
    function handleCswResponse(response, request, exe) {
        var error;
        if (response.error) {
            error = { message: response.error, installURL: exe.installURL };
        }
        return Promise.resolve({ data: response, error: error });
    }
    var features = {
        management: {
            disable: function () {
                return new Promise(function (resolve, reject) {
                    var initiatedEventData = {
                        state: "initiated"
                    };
                    ask.apps.ul.fireCEDisableEvent(config.buildVars.unifiedLoggingUrl, initiatedEventData, config).then(function () {
                        try {
                            var result = chrome.management.setEnabled(chrome.runtime.id, false);
                            if (result) {
                                return result.catch(reject);
                            }
                        }
                        catch (ex) {
                            var exceptionEventData = {
                                state: "exception",
                                message: ex.message
                            };
                            ask.apps.ul.fireCEDisableEvent(config.buildVars.unifiedLoggingUrl, exceptionEventData, config);
                            return reject(ex);
                        }
                    });
                });
            },
            uninstall: function (options) {
                return new Promise(function (resolve, reject) {
                    var initiatedEventData = {
                        state: "initiated"
                    };
                    ask.apps.ul.fireCEUninstallEvent(config.buildVars.unifiedLoggingUrl, initiatedEventData, config).then(function () {
                        try {
                            var result = chrome.management.uninstallSelf(options);
                            if (result) {
                                return result.catch(reject);
                            }
                        }
                        catch (ex) {
                            var exceptionEventData = {
                                state: "exception",
                                message: ex.message
                            };
                            ask.apps.ul.fireCEUninstallEvent(config.buildVars.unifiedLoggingUrl, exceptionEventData, config);
                            return reject(ex);
                        }
                    });
                });
            }
        },
        browsingData: {
            favoriteSites: function () {
                return Promise.reject('Not implemented');
            },
            mostVisitedSites: function () {
                return Promise.reject('Not implemented');
            },
            history: function () {
                return Promise.reject('Not implemented');
            }
        },
        CSW: {
            launchExe: function (options) {
                var uri = String(options.uri);
                var _a = uri.split('/'), id = _a[0], app = _a[1], executableName = _a[2];
                var exec = findExecutable(config.widgets || [], id, executableName);
                if (exec) {
                    var request_1 = {
                        Service: 'sendLaunchExe',
                        RequestID: 1,
                        ProviderID: '1',
                        Inputs: {
                            url: exec.widget.basepath + 'manifest.json',
                            template: executableName,
                            commandLine: options.params
                        }
                    };
                    return sendCswRequest(request_1).then(function (response) {
                        return handleCswResponse(response, request_1, exec);
                    });
                }
                return Promise.resolve({ data: null, error: { message: "Invalid request \"" + uri + "\"" } });
            },
            detectExe: function (options) {
                var uri = String(options.uri);
                var _a = uri.split('/'), id = _a[0], app = _a[1], executableName = _a[2];
                var exec = findExecutable(config.widgets || [], id, executableName);
                if (exec) {
                    var request_2 = {
                        Service: 'sendDetectExe',
                        RequestID: 1,
                        ProviderID: '1',
                        Inputs: {
                            url: exec.widget.basepath + 'manifest.json',
                            template: executableName,
                        }
                    };
                    return sendCswRequest(request_2).then(function (response) {
                        return handleCswResponse(response, request_2, exec);
                    });
                }
                return Promise.resolve({ data: null, error: { message: "Invalid request \"" + uri + "\"" } });
            }
        }
    };
})(webtooltab || (webtooltab = {}));
//# sourceMappingURL=webtooltabAPI.js.map