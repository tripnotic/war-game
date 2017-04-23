import Http from './http';
import DomEvents from './domEvents';
import {$sel} from './helpers';

const $http = new Http();
const domEvents = new DomEvents();


export default class game{
    constructor(){
        this.storageInit();
        this.bindEvents();

        this.figures = {
            'JACK': 11, 
            'QUEEN': 12, 
            'KING': 13, 
            'ACE': 14
        };

        this.nicknameInput = $sel('#nickname');
        this.nicknameFields = $sel('.your-nickname');
    }
    
    storageInit(){
        window.storage = {
            rounds: 0,
            players: [
                {name: 'Computer', cards: []}, 
                {name: 'Player', cards: []}
            ]
        };
    }

    bindEvents(){ 
        let that = this;   
        $sel('#start-game').addEventListener('click', e => this.startNewGame(e));
        $sel('#end-game').addEventListener('click', e => this.endGame(e));
        $sel('#restart-game').addEventListener('click', e => this.restartGame(e));

        $sel('.player__pile')[1].addEventListener('click', () => {
            window.storage.rounds++;
            if(that.warMode){
                that.getCards(4, that.deckId);
            } else {
                that.getCards(2, that.deckId);
            }
        });
    }

    getNickname(){
        return this.nicknameInput.value || 'You';
    }

    startNewGame(e){
        let that = this;
        e.preventDefault();
        $http.get('new/shuffle/?deck_count=1').then(function(result){
            that.deckId = JSON.parse(result).deck_id;
            if(window.DEBUG){
                console.log(that.deckId);
            }
            domEvents.showView('game');
            [].forEach.call(that.nicknameFields, (el) => el.innerHTML = that.getNickname());
        });
        
    }

    restartGame(e){
        e.preventDefault();
        this.storageInit();
        domEvents.removeCards();
        domEvents.updateResult();
        domEvents.showView('intro');
    }

    endGame(e){
        e.preventDefault();
        domEvents.showView('outro');
        [].forEach.call($sel('.outro__summary'), (el) => el.classList.add('hidden'));
        // pokaż odpowiednie info w zależności od wyniku
        if(window.storage.players[0].cards > window.storage.players[1].cards){
            $sel('#outro-failed').classList.remove('hidden');
        } else if(window.storage.players[0].cards < window.storage.players[1].cards){
            $sel('#outro-success').classList.remove('hidden');
        } else {
            $sel('#outro-draw').classList.remove('hidden');
        }
    }

    getCards(number, deckId){
        let that = this;
        // w momencie gdy braknie kart w talii
        if(!deckId){
            if(number === 2){
                this.beginBattle(this.getCardsFromPile(2));
            } else {
                this.beginBattle(this.getCardsFromPile(4));
            }
            return;
        }
        // pobieraj karty z API - dopóki ich nie braknie
        $http.get(`${deckId}/draw/?count=${number}`).then(function(result){
            let parsedResult = JSON.parse(result);
            // !parsedResult.success - gdy pobiera
            if(parsedResult.remaining === 0){
                // skasowanie deckId = pobieranie kart z obecnych już na stole
                that.setDeckId(undefined);
            }
            return that.beginBattle(parsedResult.cards);          
        });

    }

    getCardsFromPile(number){
        let player = 0,
            cards = [];
        for(let i = 0; i < number; i++){
            cards.push(window.storage.players[player].cards.splice(0,1)[0]);
            player = player ? 0 : 1;
        }
        if(window.DEBUG){
            console.log('Biorę z kupek graczy', cards);
        }
        
        return cards;
    }

    beginBattle(cards){
        if(window.DEBUG){
            console.log('Karty graczy:', window.storage.players);
        } 

        if(cards.slice(-2)[0].value === cards.slice(-1)[0].value){
            if(window.DEBUG){
                console.log('WOJNA rozpoczęta:', cards);
            } 
            domEvents.removeCards();
            domEvents.showCards(cards);
            // zaczyna się wojna
            this.warMode = true;
            // zapamiętaj ostatnie karty (te "remisowe")
            this.prevCards = cards;
        } else {
            if(window.DEBUG){
                console.log('Bitwa rozpoczęta:', cards.slice(-2)[0].value + ' vs ' + cards.slice(-1)[0].value);
            } 
            // ukryj karty wojny
            domEvents.hideElement('.player__war-card');
            if(!this.warMode){
                domEvents.removeCards();
            } else {
                // jeżeli wojna - pokaż karty wojny
                domEvents.showElement('.player__war-card');
            }
            // pokaż karty na stole
            domEvents.showCards(cards);
            // dodaj poprzednie karty (remisowe do liczby kart zdobytych w wojnie)
            if(this.prevCards){
                cards.unshift(...this.prevCards);
                // wyczyść karty "remisowe"
                this.prevCards = undefined;
            }
            this.updateUserCards(cards);
            // wyłącz tryb wojny
            this.warMode = false;
        }       
    }

    getBattleWinner(cards){
        let that = this;
        return Object.keys(cards).reduce(function(a, b){ 
            return that.getFigureValue(cards[a].value) > that.getFigureValue(cards[b].value) ? parseInt(a): parseInt(b); 
        });
    }

    getFigureValue(figure){
        return isNaN(+figure) ? this.figures[figure] : parseInt(figure);
    }

    updateUserCards(cards){
        // wybranie zwycięzcy na podstawie ostatniej pary kart
        let index = this.getBattleWinner(cards.slice(-2));

        // dodanie kart do kolekcji zwycięzcy
        window.storage.players[index].cards.push(...cards);
        domEvents.updateResult();
        
        if(window.storage.players[0].cards.length === 52 || window.storage.players[1].cards.length === 52){
            this.endGame();
        }
    }

    setDeckId(id){
        this.deckId = id;
    }

}