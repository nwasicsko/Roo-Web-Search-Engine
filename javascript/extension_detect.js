var ExtensionDetect;
(function (ExtensionDetect) {
    var fromExtension = 'EXTENSION';
    function init() {
        var configReady = getConfigWhenReady();
        var domLoad = listenForDomLoad();
        configReady.then(function (configData) {
            setInstalledCookies(configData.buildVars.configDefId);
        }).catch(Logger.log);
        Promise.all([configReady, domLoad]).then(function (values) {
            var configData = values[0];
            initListeners(configData);
        }).catch(Logger.log);
    }
    function listenForDomLoad() {
        return new Promise(function (resolve, reject) {
            try {
                window.addEventListener('DOMContentLoaded', function loadListener(e) {
                    window.removeEventListener('DOMContentLoaded', loadListener);
                    resolve(e);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    function getConfigWhenReady() {
        var configPromise = new Promise(function (resolve, reject) {
            try {
                var port_1 = chrome.runtime.connect({
                    name: Util.guid("extensionDetect-" + chrome.runtime.id + "-")
                });
                function backgroundReadyListener(message) {
                    if (message.name === 'backgroundReady') {
                        port_1.onMessage.removeListener(backgroundReadyListener);
                        port_1.disconnect();
                        resolve(message.data.state);
                    }
                }
                port_1.onMessage.addListener(backgroundReadyListener);
            }
            catch (err) {
                reject(err);
            }
        });
        return configPromise;
    }
    function initListeners(configData) {
        var commands = getCommands(configData);
        var messenger = createMessenger(parseInt(configData.buildVars.configDefId));
        function messageListener(message) {
            var data;
            if (typeof message.data === 'string') {
                try {
                    data = JSON.parse(message.data);
                }
                catch (e) {
                    Logger.log('error parsing JSON in DLP message: %o', e);
                    return;
                }
            }
            else {
                data = message.data;
            }
            if (data.from !== fromExtension && commands.hasOwnProperty(data.status)) {
                commands[data.status](messenger.bindToStatus(data.status), data);
            }
        }
        window.addEventListener('message', messageListener);
        messenger.send('TOOLBAR_READY');
    }
    function createMessenger(toolbarId) {
        var msgTarget = document.location.origin;
        function send(status, data) {
            var message = {
                toolbarId: toolbarId,
                status: status,
                from: fromExtension,
                message: data
            };
            window.postMessage(JSON.stringify(message), msgTarget);
        }
        ;
        function bindToStatus(status) {
            return send.bind(null, status);
        }
        return {
            send: send,
            bindToStatus: bindToStatus
        };
    }
    function getCommands(configData) {
        return {
            GET_INFO: function (reply) {
                reply({
                    toolbarId: configData.state.toolbarData.toolbarId,
                    partnerId: configData.state.toolbarData.partnerId,
                    partnerSubId: configData.state.toolbarData.partnerSubId,
                    installDate: configData.state.toolbarData.installDate,
                    toolbarVersion: configData.buildVars.version,
                    toolbarBuildDate: configData.buildVars.buildDate,
                });
            }
        };
    }
    function setInstalledCookies(toolbarId) {
        var hourFromNow = new Date(Date.now() + (1 * 60 * 60 * 1000)).toUTCString();
        document.cookie = "mindsparktb_" + toolbarId + "=true; expires=" + hourFromNow + "; path=/";
        document.cookie = "mindsparktbsupport_" + toolbarId + "=true; expires=" + hourFromNow + "; path=/";
    }
    init();
})(ExtensionDetect || (ExtensionDetect = {}));
//# sourceMappingURL=extension_detect.js.map