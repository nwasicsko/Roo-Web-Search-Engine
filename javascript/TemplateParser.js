var TextTemplate;
(function (TextTemplate) {
    var Type;
    (function (Type) {
        Type[Type["Any"] = 0] = "Any";
        Type[Type["Null"] = 1] = "Null";
        Type[Type["Undefined"] = 2] = "Undefined";
        Type[Type["Function"] = 3] = "Function";
        Type[Type["RegExp"] = 4] = "RegExp";
    })(Type || (Type = {}));
    function kind(obj) {
        return Type[String(Object.prototype.toString.call(obj).slice(8, -1))] || Type.Any;
    }
    function findParent(data, namespace) {
        var tokens = String(namespace).split('.');
        if (data && tokens.length > 1) {
            return tokens.slice(0, tokens.length - 1).reduce(function (p, c) {
                if (p) {
                    return p[c];
                }
                return p;
            }, data) || null;
        }
        return data || null;
    }
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function (predicate) {
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }
                var o = Object(this);
                var len = o.length >>> 0;
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }
                var thisArg = arguments[1];
                var k = 0;
                while (k < len) {
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    k++;
                }
                return undefined;
            }
        });
    }
    function parse(input, data, regexp) {
        if (kind(regexp) !== Type.RegExp) {
            regexp = [
                /\${\s*([a-zA-Z0-9\-_\.]+)\s*}/g,
                /{{2}\s*([a-zA-Z0-9\-_\.]+)\s*}{2}/g,
                /<!--\s*([a-zA-Z0-9\-_\.]+)\s*-->/g
            ].find(function (r) { return r.test(input); });
        }
        if (!regexp) {
            return input;
        }
        return String(input).replace(regexp, function (m, token) {
            var result = token.split('.').reduce(function (p, c) {
                switch (kind(p)) {
                    case Type.Undefined:
                    case Type.Null:
                        return '';
                    default:
                        return p[c];
                }
            }, data);
            switch (kind(result)) {
                case Type.Null:
                case Type.Undefined:
                    result = '';
                case Type.Function:
                    try {
                        result = result.call(findParent(data, token)) || '';
                    }
                    catch (ex) {
                        result = '';
                    }
            }
            return encodeURIComponent(result);
        });
    }
    TextTemplate.parse = parse;
})(TextTemplate || (TextTemplate = {}));
//# sourceMappingURL=TemplateParser.js.map