var Logger;
(function (Logger) {
    function log(message) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        var args = ['[' + (new Date()).toISOString() + '] '];
        if (typeof message === 'string') {
            args.unshift('%s' + message);
        }
        else if (message != void 0) {
            args.push(message);
        }
        console.log.apply(console, args.concat(rest));
    }
    Logger.log = log;
})(Logger || (Logger = {}));
//# sourceMappingURL=logger.js.map