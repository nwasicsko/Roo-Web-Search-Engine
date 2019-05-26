function httpSuccess(r) {
try {
return !r.status && location.protocol == "file:" ||
( r.status >= 200 && r.status < 300 ) ||
r.status == 304 ||
navigator.userAgent.indexOf("Safari") >= 0 &&
typeof r.status == "undefined";
} catch(e){}
return false;
}

function httpData(r, type) {

var ct = r.getResponseHeader("content-type");

var data = !type && ct && ct.indexOf("xml") >= 0;

data = type == "xml" || data ? r.responseXML : r.responseText;

if ( type == "script" )
eval.call( window, data );

return data;
}
