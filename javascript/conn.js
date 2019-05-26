// If IE is used, create a wrapper for the XMLHttpRequest object
if ( typeof XMLHttpRequest == "undefined" )
XMLHttpRequest = function(){
// Internet Explorer uses an ActiveXObject to create a new
// XMLHttpRequest object
return new ActiveXObject(
// IE 5 uses a different XMLHTTP object from IE 6
navigator.userAgent.indexOf("MSIE 5") >= 0 ?
"Microsoft.XMLHTTP" : "Msxml2.XMLHTTP"
);
};
// Create the request object
var xml = new XMLHttpRequest();
// Open the socket
xml.open("GET", "/some/url.cgi", true);
// Establish the connection to the server and send any additional data
xml.send();

// A simple object holding key/value pairs
{
name: "John",
last: "Resig",
city: "Cambridge",
zip: 02140
}
// Serialized form
name=John&last=Resig&city=Cambridge&zip=02140
// Another set of data, with multiple values
[
{ name: "name", value: "John" },
{ name: "last", value: "Resig" },
{ name: "lang", value: "JavaScript" },
{ name: "lang", value: "Perl" },
{ name: "lang", value: "Java" }
]


// Finally, lets find some input elements (using the id() method that
// we made in the DOM chapter)
[
id( "name" ),
id( "last" ),
id( "username" ),
id( "password" )
]

// Serialize a set of data. It can take two different types of objects:
// - An array of input elements.
// - A hash of key/value pairs
// The function returns a serialized string
function serialize(a) {
// The set of serialize results
var s = [];
// If an array was passed in, assume that it is an array
// of form elements
if ( a.constructor == Array ) {
// Serialize the form elements
for ( var i = 0; i < a.length; i++ )
s.push( a[i].name + "=" + encodeURIComponent( a[i].value ) );
// Otherwise, assume that it's an object of key/value pairs
} else {
// Serialize the key/values
for ( var j in a )
s.push( j + "=" + encodeURIComponent( a[j] ) );
}
// Return the resulting serialization
return s.join("&");
}

// Create the request object
var xml = new XMLHttpRequest();
// Open the asynchronous GET request
xml.open("GET", "/some/url.cgi?" + serialize( data ), true);
// Establish the connection to the server
xml.send();

// Create the request object
var xml = new XMLHttpRequest();
// Open the asynchronous POST request
xml.open("POST", "/some/url.cgi", true);
// Set the content-type header, so that the server
// knows how to interpret the data that we're sending
xml.setRequestHeader(
"Content-Type", "application/x-www-form-urlencoded");

// Make sure the browser sends the right content length of the serialized data –
// Mozilla-based browsers sometimes have trouble with this
if ( xml.overrideMimeType )
xml.setRequestHeader("Connection", "close");
// Establish the connection to the server and send the serialized data
xml.send( serialize( data ) );
To expand on the previous point, let’s look at a case were you send data to the server that
is not in your “serialized” format. You can see an example of this in Listing 10-6.
Listing 10-6. An Example of POSTing XML Data to a Server
// Create the request object
var xml = new XMLHttpRequest();
// Open the asynchronous POST request
xml.open("POST", "/some/url.cgi", true);
// Set the content-type header, so that the server
// knows how to interpret the XML data that we're sending
xml.setRequestHeader( "Content-Type", "text/xml");
// Make sure the browser sends the right content length of the serialized data –
// Mozilla-based browsers sometimes have trouble with this
if ( xml.overrideMimeType )
xml.setRequestHeader("Connection", "close");
// Establish the connection to the server and send the serialized data
xml.send( "<items><item id='one'/><item id='two'/></items>" );

// Create the request object
var xml = new XMLHttpRequest();
// Open the asynchronous POST request
xml.open("GET", "/some/url.cgi", true);
// Watch for when the state of the document gets updated
xml.onreadystatechange = function(){
// Wait until the data is fully loaded
if ( xml.readyState == 4 ) {
// xml.responseXML contains the XML Document (if one was returned)
// xml.responseText contains the response text
// (if no XML document was provided)
// Clean up after ourselves, to avoid memory leaks
xml = null;
}
};
// Establish the connection to the server
xml.send();

// Check to see if an XMLHttpRequest object has a 'Success' state, or not.
// The function takes one argument, the XMLHttpRequest object
function httpSuccess(r) {
try {
// If no server status is provided, and we're actually
// requesting a local file, then it was successful
return !r.status && location.protocol == "file:" ||
// Any status in the 200 range is good
( r.status >= 200 && r.status < 300 ) ||
// Successful if the document has not been modified
r.status == 304 ||
// Safari returns an empty status if the file has not been modified
navigator.userAgent.indexOf("Safari") >= 0 &&
typeof r.status == "undefined";
} catch(e){}
// If checking the status failed, then assume that the request failed too
return false;
}

// Create the request object
var xml = new XMLHttpRequest();
// Open the asynchronous POST request
xml.open("GET", "/some/url.cgi", true);
// We're going to wait for a request for 5 seconds, before giving up
var timeoutLength = 5000;
// Keep track of when the request has been succesfully completed
var requestDone = false;
// Initalize a callback which will fire 5 seconds from now, cancelling
// the request (if it has not already occurred).
setTimeout(function(){
requestDone = true;
}, timeoutLength);
// Watch for when the state of the document gets updated
xml.onreadystatechange = function(){
// Wait until the data is fully loaded,
// and make sure that the request hasn't already timed out
if ( xml.readyState == 4 && !requestDone ) {
// xml.responseXML contains the XML Document (if one was returned)
// xml.responseText contains the response text
// (if no XML document was provided)
// Clean up after ourselves, to avoid memory leaks
xml = null;
}
};
// Establish the connection to the server
xml.send();
