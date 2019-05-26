'use strict';
var Dlp;
(function (Dlp) {
    Dlp.dataSourceLocalStorage = "DLP local storage";
    Dlp.dataSourceCookies = "DLP cookies";
    function getDataFromLocalStorage(request) {
        var _this = this;
        var url = request.url, timeout = request.timeout, keys = request.keys;
        this.deferred = [];
        this.defer = function (f) { return _this.deferred.push(f); };
        this.cleanUp = function () {
            while (_this.deferred.length) {
                try {
                    (_this.deferred.pop())();
                }
                catch (ex) {
                    Logger.log('DLP:GetLocalStorage:', ex);
                }
            }
        };
        return new Promise(function (resolve, reject) {
            var that = _this;
            if (timeout) {
                timeout = setTimeout(function () {
                    timeout = undefined;
                    that.cleanUp();
                    reject(new Error("Load content timeout: \"" + url + "\""));
                }, timeout);
                that.defer(function () { !timeout || clearTimeout(timeout); timeout = undefined; });
            }
            DlpHelper.openDLPDomain.call(that, url, getLocalStorage, parseLocalStorage, resolve, reject);
        });
    }
    Dlp.getDataFromLocalStorage = getDataFromLocalStorage;
    function getLocalStorage(port, keys) {
        return new Promise(function (resolve) {
            var request = { name: 'getLocalStorage', reply: Util.guid('getLocalStorage.response'), data: { keys: keys } };
            port.onMessage.addListener(function (message) {
                if (message.name === request.reply) {
                    resolve(message.data);
                }
            });
            port.postMessage(request);
        });
    }
    function parseLocalStorage(data) {
        var parsedData = {};
        try {
            var toolbarData = data.toolbarData;
            while (typeof toolbarData === 'string') {
                toolbarData = JSON.parse(toolbarData);
            }
            parsedData.toolbarData = cleanToolbarData(toolbarData);
            parsedData.toolbarData.dataSource = Dlp.dataSourceLocalStorage;
        }
        catch (ex) {
            Logger.log('Dlp: parseLocalStorage:', ex);
        }
        Logger.log("Dlp: parseLocalStorage: The fetched DLP data looks like: " + JSON.stringify(parsedData));
        return parsedData;
    }
    function getDataFromCookies(domain) {
        return new Promise(function (resolve, reject) {
            chrome.cookies.getAll({ domain: domain }, function (cookies) {
                if (cookies.some(function (cookie) { return cookie.name === "toolbarId"; })) {
                    Logger.log("Dlp: getDataFromCookies: Found DLP data cookies in domain: " + domain);
                    resolve(parseCookies(cookies));
                }
                else {
                    reject(new Error("Dlp: getDataFromCookies: FAILED to find DLP data cookies in domain: " + domain));
                }
            });
        });
    }
    Dlp.getDataFromCookies = getDataFromCookies;
    function parseCookies(cookies) {
        var parsedData = {};
        var cookiesObj = cookies.reduce(function (obj, cookie) {
            obj[cookie.name] = cookie.value;
            return obj;
        }, {});
        parsedData.toolbarData = cleanToolbarData(cookiesObj);
        parsedData.toolbarData.dataSource = Dlp.dataSourceCookies;
        Logger.log("Dlp: parseCookies: The fetched DLP data looks like: " + JSON.stringify(parsedData));
        return parsedData;
    }
    function cleanToolbarData(dirty) {
        Logger.log("Dlp: cleanToolbarData has just been invoked.");
        return Object.keys(new SkeletonToolbarData()).reduce(function (clean, key) {
            if (dirty[key]) {
                var typeConflictExists = (typeof clean[key] === "boolean" && typeof dirty[key] !== "boolean");
                clean[key] = typeConflictExists ? (dirty[key] === "true") : dirty[key];
            }
            return clean;
        }, new SkeletonToolbarData());
    }
    var SkeletonToolbarData = (function () {
        function SkeletonToolbarData() {
            this.language = "";
            this.partnerId = "";
            this.installDate = "";
            this.ttabFirstInstall = false;
            this.coId = "";
            this.npsSurveyUrl = "";
            this.toolbarId = "";
            this.partnerSubId = "";
            this.dlput = "";
            this.installType = "";
            this.successUrl = "";
            this.chromeShowToolbar = "";
            this.ChromeExtensionCopies = "";
            this.newTabURL = "";
            this.productDeliveryOption = "";
            this.newTabCache = false;
            this.newTabBubbleURL = "";
            this.newTabInstructURL = "";
            this.newTabSuccessURL = "";
            this.dynamicKeyword = "";
            this.dynamicImageUrl = "";
            this.pixelUrl = "";
            this.defaultSearchOption = "";
            this.defaultSearch = "";
            this.homePageOption = "";
            this.homePage = "";
            this.countryCode = "";
            this.originKey = "";
            this.ACLGroupCode = "";
            this.campaign = "";
            this.cobrand = "";
            this.userSegment = "";
            this.uninstallSurveyUrl = "";
            this.chromeSearchExtensionEnabled = "";
            this.chromeSearchExtensionURL = "";
            this.dataSource = "";
        }
        return SkeletonToolbarData;
    }());
    Dlp.SkeletonToolbarData = SkeletonToolbarData;
})(Dlp || (Dlp = {}));
//# sourceMappingURL=dlp.js.map