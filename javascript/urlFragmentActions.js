'use strict';
var UrlFragmentActions;
(function (UrlFragmentActions) {
    var config;
    var tabsCalledFrom = [];
    var cobrand;
    function fragmentMatches(url) {
        var fragmentId = UrlUtils.parseUrl(url).getFragmentId();
        console.log('uFA: fragmentId::::', fragmentId);
        var parsedFragment = UrlUtils.parseQueryString(fragmentId);
        console.log('uFA: parsedFragment::::', parsedFragment);
        return parsedFragment.getParam('command') === 'showNewTab'
            && parsedFragment.getParam('cobrand') === cobrand;
    }
    function navListener(details) {
        console.debug('uFA: navListener, details: %o', details);
        if (tabsCalledFrom.indexOf(details.tabId) === -1 && fragmentMatches(details.url)) {
            console.debug('uFA: opening the new tab');
            chrome.tabs.create({});
            tabsCalledFrom.push(details.tabId);
        }
        else {
            console.debug('uFA: command didn\'t match or tab already opened');
        }
    }
    function removedListener(tabId) {
        console.log('uFA: removing listener');
        var index = tabsCalledFrom.indexOf(tabId);
        if (index !== -1) {
            console.debug('uFA: removing tabId: %s from tabsCalledFrom', tabId);
            tabsCalledFrom.splice(index, 1);
        }
        else {
            console.debug('uFA: unable to find tabId: %s to remove from tabsCalledFrom', tabId);
        }
    }
    function init(cfg) {
        config = cfg;
        var secondaryOfferParsedUrl = UrlUtils.parseUrl(config.state.toolbarData.chromeSearchExtensionURL);
        console.debug('uFA: secondaryOfferUrl domain: %s', secondaryOfferParsedUrl.getDomain());
        var partnerId = GlobalPartnerIdFactory.parse(config.state.toolbarData.partnerId, config.state.toolbarData.partnerSubId);
        cobrand = partnerId.getCobrand() || config.state.toolbarData.cobrand;
        var filter = {
            url: [
                { hostContains: secondaryOfferParsedUrl.getDomain() }
            ]
        };
        if (!secondaryOfferParsedUrl.getDomain()) {
            return;
        }
        chrome.webNavigation.onReferenceFragmentUpdated.addListener(navListener, filter);
        chrome.webNavigation.onBeforeNavigate.addListener(navListener, filter);
        chrome.tabs.onRemoved.addListener(removedListener);
        console.log('uFA: done');
    }
    UrlFragmentActions.init = init;
})(UrlFragmentActions || (UrlFragmentActions = {}));
//# sourceMappingURL=urlFragmentActions.js.map