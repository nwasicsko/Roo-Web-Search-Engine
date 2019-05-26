var ask;
(function (ask) {
    var apps;
    (function (apps) {
        var ul;
        (function (ul) {
            function createStandardData(eventName, config) {
                return {
                    anxa: 'CAPNative',
                    anxv: config.buildVars.version,
                    anxe: eventName,
                    anxt: config.state.toolbarData.toolbarId,
                    anxtv: config.buildVars.version,
                    anxp: config.state.toolbarData.partnerId,
                    anxsi: config.state.toolbarData.partnerSubId,
                    anxd: config.buildVars.buildDate,
                    f: '00400000',
                    anxr: +new Date(),
                    coid: config.state.toolbarData.coId || config.buildVars.coId,
                    userSegment: config.state.toolbarData.userSegment
                };
            }
            function fireToolbarActiveEvent(url, eventSpecificData, config) {
                return fireEvent('ToolbarActive', url, eventSpecificData, config);
            }
            ul.fireToolbarActiveEvent = fireToolbarActiveEvent;
            function fireCEDisableEvent(url, eventSpecificData, config) {
                return fireEvent('CEDisable', url, eventSpecificData, config);
            }
            ul.fireCEDisableEvent = fireCEDisableEvent;
            function fireCEUninstallEvent(url, eventSpecificData, config) {
                return fireEvent('CEUninstall', url, eventSpecificData, config);
            }
            ul.fireCEUninstallEvent = fireCEUninstallEvent;
            function fireEvent(eventName, url, eventSpecificData, config) {
                var standardData = createStandardData(eventName, config);
                var combinedData = Util.mergeObjects(standardData, eventSpecificData);
                return AJAX.get({ url: url, data: combinedData, responseType: 'text/plain' });
            }
            function firePixel(request) {
                return loadContent(request).then(function (respose) {
                    respose.close();
                    return Promise.resolve({ success: true });
                });
            }
            ul.firePixel = firePixel;
            function loadContent(request) {
                var url = request.url, timeout = request.timeout;
                if (window.location.href.indexOf(request.url) >= 0) {
                    Promise.reject(new Error("Cannot load \"" + url + "\" inside \"" + window.location.href + "\""));
                }
                return new Promise(function (resolve, reject) {
                    var iframe = document.createElement('iframe');
                    if (timeout) {
                        timeout = setTimeout(function () {
                            if (iframe) {
                                iframe.parentNode.removeChild(iframe);
                            }
                            reject(new Error("Load content timeout: \"" + url + "\""));
                        }, timeout);
                    }
                    iframe.addEventListener('load', function (e) {
                        !timeout || clearTimeout(timeout);
                        resolve({
                            url: url,
                            parentUrl: window.location.href,
                            timedout: false,
                            close: function () {
                                iframe.parentNode.removeChild(iframe);
                            }
                        });
                    }, true);
                    iframe.setAttribute('src', url);
                    document.body.appendChild(iframe);
                });
            }
        })(ul = apps.ul || (apps.ul = {}));
    })(apps = ask.apps || (ask.apps = {}));
})(ask || (ask = {}));
//# sourceMappingURL=ul.js.map