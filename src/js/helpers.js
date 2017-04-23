export function $sel(selector, context){
    'use strict';
    if(selector.indexOf('#') >= 0){
        return document.getElementById(selector.substr(1));
    } else if(selector.indexOf('.') >= 0){
        return document.getElementsByClassName(selector.substr(1));
    } else {
        return (context || document).querySelectorAll(selector);
    }

}