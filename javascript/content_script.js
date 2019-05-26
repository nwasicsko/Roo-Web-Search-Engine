var ask;
(function (ask) {
    var apps;
    (function (apps) {
        var WebTooltabAPIProxy;
        (function (WebTooltabAPIProxy) {
            var channel;
            var contents = typeof Map == 'undefined' ? new Util.SimpleMap() : new Map();
            var commands = {
                backgroundReady: function (data) {
                    sendMessage(channel, { name: 'getState' }, function (state) {
                        return Promise.resolve(void 1);
                    });
                    return Promise.resolve(void 1);
                },
                loadContent: function (data) {
                    return loadContent(data.url, data.timeout);
                },
                removeContent: function (data) {
                    var content = contents.get(data.id);
                    if (content) {
                        content.close();
                        return Promise.resolve({ success: true });
                    }
                    return Promise.reject(new Error("\"" + data.id + "\" not found"));
                },
                getLocalStorage: function (data) {
                    var storage = window.localStorage;
                    var keys = data && data.keys && data.keys.length ? data.keys : Object.keys(storage);
                    return Promise.resolve(keys.reduce(function (p, key) {
                        p[key] = storage.getItem(key);
                        return p;
                    }, {}));
                },
                webtooltab: function (response) {
                    if (response) {
                        response.url = window.location.href;
                        postMessage(JSON.stringify(response), response.url);
                    }
                    return Promise.resolve(void 1);
                }
            };
            window.addEventListener('message', handleWebTooltabMessageEvent);
            function loadContent(url, timeout) {
                return new Promise(function (resolve, reject) {
                    if (window.location.href.indexOf(url) >= 0) {
                        reject(new Error("Cannot load \"" + url + "\" inside \"" + window.location.href + "\""));
                    }
                    else {
                        var iframe_1 = document.createElement('iframe');
                        if (timeout) {
                            timeout = setTimeout(function () {
                                if (iframe_1) {
                                    iframe_1.parentNode.removeChild(iframe_1);
                                }
                                reject(new Error("Load content timeout: \"" + url + "\""));
                            }, timeout);
                        }
                        iframe_1.addEventListener('load', function (e) {
                            !timeout || clearTimeout(timeout);
                            resolve({
                                url: url,
                                id: url,
                                parentUrl: window.location.href,
                                timedout: false,
                                close: function () {
                                    iframe_1.parentNode.removeChild(iframe_1);
                                }
                            });
                        }, true);
                        iframe_1.setAttribute('src', url);
                        document.body.appendChild(iframe_1);
                    }
                });
            }
            function init() {
                var port = chrome.runtime.connect({ name: Util.guid("contentScript-" + chrome.runtime.id + "-") });
                channel = {
                    id: port.name,
                    port: port,
                    callbacks: typeof Map == 'undefined' ? new Util.SimpleMap() : new Map()
                };
                port.onMessage.addListener(onConnectMessage);
            }
            WebTooltabAPIProxy.init = init;
            function onConnectMessage(message) {
                var command = commands[message.name] || channel.callbacks.get(message.name);
                if (command) {
                    command(message.data || message.error).then(function (response) {
                        if (message.reply) {
                            channel.port.postMessage({ name: message.reply, data: response });
                        }
                    }).catch(function (err) {
                        if (message.reply) {
                            channel.port.postMessage({ name: message.reply, error: err });
                        }
                    });
                }
            }
            function isWebTooltabMessage(message) {
                return String(message).indexOf("\"destination\":\"" + chrome.runtime.id + "\"") > -1;
            }
            function handleWebTooltabMessageEvent(e) {
                if (isWebTooltabMessage(e.data)) {
                    sendMessage(channel, { name: 'webtooltab', data: JSON.parse(e.data) }, commands.webtooltab);
                }
            }
            function sendMessage(conn, message, callback, persistent) {
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
        })(WebTooltabAPIProxy = apps.WebTooltabAPIProxy || (apps.WebTooltabAPIProxy = {}));
    })(apps = ask.apps || (ask.apps = {}));
})(ask || (ask = {}));
ask.apps.WebTooltabAPIProxy.init();
//# sourceMappingURL=content_script.js.map