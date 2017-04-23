const API_URL = 'https://deckofcardsapi.com/api/deck/';

export default class Http{
	get(url){
        return new Promise(function(resolve, reject) {
            let req = new XMLHttpRequest();
            req.open('GET', API_URL + url);
            req.onload = function() {
                if (req.status === 200) {
                    resolve(req.response);
                } else {
                    reject(new Error(req.statusText));
                }
            };

            req.onerror = function() {
                reject(new Error('Network error'));
            };

            req.send();
        });
    }
}