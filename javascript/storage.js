'use strict';
var ChromeStorageLocal = (function () {
    function ChromeStorageLocal(storage, key) {
        this.store = storage;
        this.key = key;
    }
    ChromeStorageLocal.prototype.set = function (state) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var item = {};
            item[_this.key] = state;
            _this.store.set(item, function () {
                var err = chrome.runtime.lastError;
                if (err) {
                    reject(err);
                }
                else {
                    resolve(state);
                }
            });
        });
    };
    ChromeStorageLocal.prototype.get = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.store.get(_this.key, function (result) {
                var err = chrome.runtime.lastError;
                if (err) {
                    reject(err);
                }
                else {
                    var state = void 0;
                    if (result && Object.keys(result).length) {
                        state = result[_this.key];
                    }
                    resolve(state);
                }
            });
        });
    };
    ChromeStorageLocal.prototype.update = function (newState) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.get().then(function (state) {
                _this.set(Util.mergeObjects(state, newState)).then(resolve).catch(reject);
            }).catch(reject);
        });
    };
    return ChromeStorageLocal;
}());
//# sourceMappingURL=storage.js.map