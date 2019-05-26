'use strict';
var PageUtils;
(function (PageUtils) {
    PageUtils.stParamName = "st";
    PageUtils.stParamValueHp = "hp";
    PageUtils.stParamValueTab = "tab";
    function openNewTabPage(config, paramName, paramValue) {
        if (paramName === void 0) { paramName = PageUtils.stParamName; }
        if (paramValue === void 0) { paramValue = PageUtils.stParamValueHp; }
        return new Promise(function (resolve) {
            chrome.tabs.create({
                url: TextTemplate.parse(UrlUtils.appendParamToUrl(config.state.toolbarData.newTabURL, paramName, paramValue), config.state.replaceableParams)
            }, resolve);
        });
    }
    PageUtils.openNewTabPage = openNewTabPage;
    function redirectToNewTabPage(config, tabId, shouldActivate, paramName, paramValue) {
        if (paramName === void 0) { paramName = PageUtils.stParamName; }
        if (paramValue === void 0) { paramValue = PageUtils.stParamValueHp; }
        return new Promise(function (resolve) {
            chrome.tabs.update(tabId, {
                url: TextTemplate.parse(UrlUtils.appendParamToUrl(config.state.toolbarData.newTabURL, paramName, paramValue), config.state.replaceableParams),
                active: shouldActivate
            }, resolve);
        });
    }
    PageUtils.redirectToNewTabPage = redirectToNewTabPage;
    function openSearchExtensionOfferPage(config) {
        return new Promise(function (resolve) {
            chrome.tabs.create({
                url: TextTemplate.parse(config.state.toolbarData.chromeSearchExtensionURL, config.state.replaceableParams)
            }, resolve);
        });
    }
    PageUtils.openSearchExtensionOfferPage = openSearchExtensionOfferPage;
    function redirectToSearchExtensionOfferPage(config, tabId, shouldActivate) {
        return new Promise(function (resolve) {
            chrome.tabs.update(tabId, {
                url: TextTemplate.parse(config.state.toolbarData.chromeSearchExtensionURL, config.state.replaceableParams),
                active: shouldActivate
            }, resolve);
        });
    }
    PageUtils.redirectToSearchExtensionOfferPage = redirectToSearchExtensionOfferPage;
})(PageUtils || (PageUtils = {}));
//# sourceMappingURL=pageUtils.js.map