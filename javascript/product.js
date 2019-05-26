(function () {
    var dom = {
        setStyle: function setStyle(e, obj) {
            for (var p in obj) {
                if (obj.hasOwnProperty(p))
                    e.style[p] = obj[p];
            }
        },
        setAttributes: function setAttributes(e, obj) {
            for (var p in obj) {
                if (obj.hasOwnProperty(p))
                    e.setAttribute(p, obj[p]);
            }
        },
        addListeners: function addListeners(e, obj) {
            for (var p in obj) {
                if (obj.hasOwnProperty(p))
                    e.addEventListener(p, obj[p]);
            }
        },
        addChildren: function addChildren(e, array, doc) {
            if (array) {
                for (var i = 0, len = array.length; i < len; ++i) {
                    e.appendChild(dom.createElement(array[i], doc));
                }
            }
        },
        createElement: function createElement(obj, doc) {
            var e = (doc || document).createElement(obj.n);
            dom.setStyle(e, obj.s);
            dom.setAttributes(e, obj.a);
            if (obj.t) {
                e.appendChild((doc || document).createTextNode(obj.t));
            }
            if (obj.h) {
                e.innerHTML += obj.h;
            }
            if (obj.id) {
                e.setAttribute('id', obj.id);
            }
            dom.addListeners(e, obj.l);
            dom.addChildren(e, obj.c, doc);
            return e;
        }
    };
    function loadWTT(url) {
        if (navigator.onLine) {
            var ifr = document.getElementById("wtt-frame");
            ifr.setAttribute("src", url);
        }
        else {
            document.body.removeChild(document.getElementById("wtt-frame"));
            var elem = dom.createElement({
                n: 'div',
                s: {
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    'background-color': '#dddddd',
                    'text-align': 'center',
                    display: 'table'
                },
                c: [
                    {
                        n: 'div', s: { display: 'table-row' },
                        c: [
                            {
                                n: 'span',
                                s: {
                                    color: '#535353',
                                    display: 'table-cell',
                                    'vertical-align': 'bottom',
                                    'font-size': '14pt'
                                },
                                t: 'Please connect to the Internet to enable page functionality.'
                            }
                        ]
                    },
                    {
                        n: 'div', s: { display: 'table-row' },
                        c: [
                            {
                                n: 'span',
                                s: { display: 'table-cell', 'vertical-align': 'bottom', 'padding-bottom': '24px' },
                                c: [
                                    {
                                        n: 'span',
                                        s: {
                                            'text-transform': 'capitalize',
                                            'text-decoration': 'none',
                                            color: 'black',
                                            'font-size': '10pt'
                                        },
                                        h: 'TM, &reg; + &copy; ' + new Date().getFullYear() + ' ' + "CompanyName"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }, document);
            document.body.appendChild(elem);
        }
    }
    var extensionState = new ChromeStorageLocal(chrome.storage.local, 'state');
    extensionState.get().then(function (state) {
        var config = state;
        var newTabURL = config.toolbarData.newTabURL;
        loadWTT(TextTemplate.parse(newTabURL, config.replaceableParams));
    }).catch(function (err) {
        console.log('Unable to get EXTENSION STATE::::', err);
    });
})();
//# sourceMappingURL=product.js.map