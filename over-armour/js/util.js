/**
* Global utitlity functions.
* the following functions are loosely coupled and can be used under any context,
* Given that the right parameters are used (if any).
**/

// Inspired from : http://stackoverflow.com/a/901144
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
/**
* home
* This function will redirect to main (landing) page
**/
function home() {
  var re = /^https?:\/\/[^/]+/i;
  window.location.href = re.exec(window.location.href)[0];
}

/**
* slide_down_slow
* This function will slide down an item.
* @param {object} item - item object handle.
**/
function slide_down_slow(item) {
  item.slideDown("slow");
}

/**
* open_a_parent_tab
* This function will open a url in a parent page (triggered from a popup).
* @param {string} url - url link.
**/
function open_a_parent_tab(url) {
    window.opener.location=url;
}
/**
* add_to_local_storage
* This function will store an object to 'localstorage'.
* It requires HTML5 browsers.
* @param {string} key - Key of item in the storage hashmap.
* @param {string} value - value to be stored (we stringify to be able to store objects instead of a string).
**/
function add_to_local_storage(key, value) {
   localStorage.setItem(key , JSON.stringify(value));
}

/**
* get_from_local_storage
* This function will get an object from 'localstorage'.
* It requires HTML5 browsers.
* @param {string} key - Key of item in the storage hashmap.
**/
function get_from_local_storage(key) {
   var value = JSON.parse(localStorage.getItem(key));
   return value;
}

/**
* close_popup
* This function will close an open popup.
* @param {string} popup_name - Key name of popup.
**/
function close_popup(popup_name){
  myWindow = window.open("", popup_name);
  myWindow.close();
}

function hasClass(DOMElement, className) {
    return DOMElement.className.indexOf(className) > -1;
}

function addClass(DOMElement, className) {
    DOMElement.className += " " + className;
}

function removeClass(DOMElement, className) {
    var classes = DOMElement.className.split(" ");
    for (var i = 0; i < classes.length; i++) {
        if (classes[i] === className) {
            classes.splice(i, 1);
            break;
        }
    }
    DOMElement.className = classes.join(" ");
}

function toggleClass(DOMElement, className) {
    if (hasClass(DOMElement, className)) {
        removeClass(DOMElement, className)
    } else {
        addClass(DOMElement, className);
    }
}

function getQueryParams() {
    var queryObject = {};
    var queryString = location.search;
    //Remove the ?
    queryString = queryString.substring(1);
    //Split by &
    queryString = queryString.split("&");
    //Create key value pairs
    for (var i=0; i < queryString.length; i++) {
        var element = queryString[i].split("=");
        queryObject[element[0]] = element[1];
    }

    return queryObject;
}