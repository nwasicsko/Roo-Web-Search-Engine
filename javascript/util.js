'use strict';
var Util;
(function (Util) {
    function mergeObjects() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        if (params.some(function (param) { return Array.isArray(param); })) {
            throw "This method DOES NOT support array inputs.";
        }
        return params.reduce(function (prev, current) {
            return mergeTwoObjects(prev, current);
        }, {});
    }
    Util.mergeObjects = mergeObjects;
    function mergeTwoObjects(left, right) {
        if (typeOf(left) === typeOf(right) && typeOf(right) === "object") {
            return Object.keys(right).reduce(function (result, rightKey) {
                result[rightKey] = mergeTwoObjects(result[rightKey], right[rightKey]);
                return result;
            }, left);
        }
        else {
            if (typeOf(right) === "null") {
                return (typeOf(left) === "undefined") ? right : left;
            }
            else {
                return right;
            }
        }
    }
    function typeOf(value) {
        return (value === null) ? "null" : typeof value;
    }
    function guid(prefix, length) {
        return (prefix || '') + Array.prototype.reduce.call((crypto).getRandomValues(new Uint32Array(length || 4)), function (p, i) {
            return (p.push(i.toString(36)), p);
        }, []).join('-');
    }
    Util.guid = guid;
    function getObjectAPI(obj, prefix) {
        function ns(obj, px) {
            var keys = Object.keys(obj);
            if (keys.length == 0) {
                if (px.length) {
                    return [px.join('.')];
                }
                return [];
            }
            return keys.reduce(function (p, key) {
                return p.concat(ns(obj[key], px.concat([key])));
            }, []);
        }
        return ns(obj, prefix ? [prefix] : []);
    }
    Util.getObjectAPI = getObjectAPI;
    function resolveName(name, obj) {
        return name.split('.').reduce(function (p, n) {
            return p && p[n];
        }, obj);
    }
    Util.resolveName = resolveName;
    function SimpleMap() {
        this.obj = {};
        this.get = function (key) { return this.obj[key]; };
        this.set = function (key, value) { this.obj[key] = value; };
        this.delete = function (key) { delete this.obj[key]; };
        this.forEach = function () {
            var obj = this.obj, itemKeys = Object.keys(obj).map(function (key) { return [key, obj[key]]; });
            return itemKeys.forEach.apply(itemKeys, arguments);
        };
    }
    Util.SimpleMap = SimpleMap;
    var ConnectionManager = (function () {
        function ConnectionManager() {
            var _this = this;
            this.connections = typeof Map == 'undefined' ? new Util.SimpleMap() : new Map();
            chrome.runtime.onConnect.addListener(function (port) {
                var conn = { id: (+new Date).toString(36), port: port, callbacks: typeof Map == 'undefined' ? new Util.SimpleMap() : new Map() };
                _this.add(conn);
            });
        }
        ConnectionManager.prototype.add = function (conn) {
            var _this = this;
            this.connections.set(conn.id, conn);
            conn.port.onDisconnect.addListener(function () {
                _this.remove(conn.id);
            });
        };
        ConnectionManager.prototype.remove = function (id) {
            return this.connections.delete(id);
        };
        ConnectionManager.prototype.all = function () {
            var r = [];
            this.connections.forEach(function (conn) {
                r.push(conn);
            });
            return r;
        };
        return ConnectionManager;
    }());
})(Util || (Util = {}));
//# sourceMappingURL=util.js.map