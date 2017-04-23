import {$sel} from './helpers';

export default class domEvents {
    
    constructor(){
        this.playerCardBlock = $sel('.player__card');
        this.playerCardFront =  $sel('.player__card--back');
        this.playerWarCardBlock =  $sel('.player__war-card');
        this.playerResultBlock =  $sel('.result-block__player');
        this.views =  $sel('section');
    }

    showView(view){
        [].map.call(this.views, (el) => el.classList.add('hidden'));
        $sel('#' + view).classList.remove('hidden');
    }

    createCard(src){
        let elem = document.createElement('img');
        elem.setAttribute('src', src);
        elem.className = 'player__card--image';
        return elem;
    }

    showCards(cards){
        let that = this;
        if(window.DEBUG){
            console.log(cards.length + ' karty', cards);
        } 
        // pokazanie kart wojny
        if(cards.length === 4){
            for(let i = 0; i < this.playerWarCardBlock.length; i++){
                // i + 2 bo mamy pokazać dwie ostatnie karty
                this.playerWarCardBlock[i].appendChild(this.createCard(cards[i+2].image));
            }
            return false;
        }
        // dodanie tylu kart, ilu graczów
        for(let i = 0; i < this.playerCardFront.length; i++){
            this.playerCardFront[i].appendChild(this.createCard(cards[i].image));
        }
        // dodanie animacji
        setTimeout(function(){
            [].map.call(that.playerCardBlock, (el) => el.classList.add('flipped'));
        }, 500);
        
    }

    // usunięcie kart ze stołu
    removeCards(){
        [].map.call(this.playerCardBlock, (el) => el.classList.remove('flipped'));
        [].map.call(this.playerCardFront, (el) =>  el.innerHTML = '');
        [].map.call(this.playerWarCardBlock, (el) => el.innerHTML = '');
    }

    // zmiana wyniku w widoku
    updateResult(){
        let diff = (window.storage.players[0].cards.length - window.storage.players[1].cards.length) / 2;

        // aktualizacja wyniku (26 - połowa talii)
        [].map.call(this.playerResultBlock, (el) => {
            el.innerHTML = 26 + diff;
            diff = -diff;
        });

        if(window.DEBUG){
            console.log('Wynik: ', $sel('#result-player-1').innerHTML + ' vs ' + $sel('#result-player-2').innerHTML);
        }
        $sel('#result-rounds').innerHTML = window.storage.rounds;
    }

    hideElement(selector){
        [].map.call($sel(selector), (el) => el.classList.add('hidden')); 
    }

    showElement(selector){
        [].map.call($sel(selector), (el) => el.classList.remove('hidden'));
    }

}
