let game = {}

let cards,
    currentCards = [];

function makeTimeStr(time) {
    return time < 10 ? `0${time}` : time;
}

//settings and starting 
let container, gameContainer, settingsBox, selectFieldInput, startGameBtn, turnTimer, selectTime;

function initialization() {
    game = {
        field: 0,
        values: [],
        points: 0,
        counter: 0,
        gameTime: {
            interval: null,
            func: countingTime,
            minutes: 0,
            seconds: 0
        },
        turnTimer: false,
        timerStart: 0
    }

    container = document.querySelector('.container'),
    settingsBox = document.querySelector('.settings-box'),
    selectFieldInput = document.querySelectorAll('.select-field'),
    startGameBtn = document.querySelector('.start-game-btn');

    gameContainer = document.createElement('div');
    container.append(gameContainer);
    gameContainer.classList.add('game-container', 'hidden');

    settingsBox.classList.remove('hidden');

    selectFieldInput.forEach(input => {
        input.addEventListener('click', (e) => {
            selectFieldInput.forEach(i => i == e.target 
                                        ? i.classList.add('selected') 
                                        : i.classList.remove('selected'));
            game.field = +e.target.textContent;
            startGameBtn.classList.remove('not-vis');
        });
    })

    turnTimer = document.querySelector('.turn-timer'),
    selectTime = document.querySelector('.timer-select');
    let timerMinutes, timerSeconds;

    turnTimer.addEventListener('click', () => {
        if (!game.turnTimer) {
            game.turnTimer = true;
            turnTimer.classList.add('selected');
            selectTime.classList.remove('not-vis');

            timerMinutes = document.querySelector('.timer-min');
            timerSeconds = document.querySelector('.timer-sec');

            if (!game.gameTime.seconds && !game.gameTime.minutes) {
                game.gameTime.seconds = 30;
            }

            timerMinutes.textContent = makeTimeStr(game.gameTime.minutes);
            timerSeconds.textContent = makeTimeStr(game.gameTime.seconds);
      
        } else if (game.turnTimer) {
            game.turnTimer = false;
            turnTimer.classList.remove('selected');
            selectTime.classList.add('not-vis'); 
        }
    })

    let timerPlus = document.querySelector('.timer-plus');
    timerPlus.addEventListener('click', () => {
        
        if (game.gameTime.seconds === 30) {
            game.gameTime.minutes += 1;
            game.gameTime.seconds = 0;
        } else {
            game.gameTime.seconds += 30;
        }
        timerMinutes.textContent = makeTimeStr(game.gameTime.minutes);
        timerSeconds.textContent = makeTimeStr(game.gameTime.seconds);   
    });

    let timerMinus = document.querySelector('.timer-minus');
    timerMinus.addEventListener('click', () => {
        if (game.gameTime.minutes === 0 && game.gameTime.seconds === 30) {
            return
        } else if (game.gameTime.seconds === 0) {
            game.gameTime.minutes -= 1;
            game.gameTime.seconds = 30;   
        } else {
            game.gameTime.seconds -= 30;
        }
        timerMinutes.textContent = makeTimeStr(game.gameTime.minutes);
        timerSeconds.textContent = makeTimeStr(game.gameTime.seconds);
    })

    startGameBtn.addEventListener('click', () => {
        if (!game.field) return;

        selectFieldInput.forEach(i => i.classList.remove('selected'));
        turnTimer.classList.remove('selected');
        selectTime.classList.add('not-vis');
        settingsBox.classList.add('hidden');

        for (let i = 1; i < game.field + 1; i++) {
            game.values.push(i, i);
        }
        settingsBox.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        createCards (game.values.length, gameContainer);
        cards = document.querySelectorAll('.card');
        setValues(cards, game.values);
        addListeners(cards);

        game.gameTime.func = game.turnTimer ? timerFunc : game.gameTime.func;
        game.gameTime.interval = setInterval(game.gameTime.func.bind(game.gameTime), 1000); 

        if (game.turnTimer) {
            game.timerStart = Date.now();
        }else if (!game.turnTimer) {
            game.gameTime.minutes = 0; game.gameTime.seconds = 0;
        }
    
        initialScoreboard();
        showOrHideScoreboard();
    });
}

//time

let secondsOutput, minutesOutput;

//when the timer is off
function countingTime() {
    minutesOutput.textContent = makeTimeStr(this.minutes);
    secondsOutput.textContent = makeTimeStr(this.seconds);

    if (this.seconds === 59) {
        this.minutes++;
        this.seconds = 0;
    } else {
        this.seconds++;
    }
}
// when the timer is on
function timerFunc() {
    minutesOutput.textContent = makeTimeStr(this.minutes);
    secondsOutput.textContent = makeTimeStr(this.seconds);

    if (this.seconds === 0) {
        if (this.minutes === 0) {
            losing()
        } else {
            this.minutes--;
            this.seconds = 59;
        } 
    } else {
        this.seconds--;
    }
}

//scoreboard

let scoreboard, counterOutput, pointsOutput;

function initialScoreboard() {
    scoreboard = document.querySelector('.scoreboard'),
    counterOutput = document.querySelector('.counter'),
    pointsOutput = document.querySelector('.points'),
    secondsOutput = document.querySelector('.game-time__seconds'),
    minutesOutput = document.querySelector('.game-time__minutes');

    counterOutput.textContent = game.counter;
    pointsOutput.textContent = game.points;

    game.gameTime.func();
}

function showOrHideScoreboard() {
    scoreboard.classList.toggle('hidden');
}

//functions for actions with cards

function createCards(num, container) {
    const styles = 'card back-side unselectable';
    for (let i = 0; i < num; i++) {
        container.innerHTML += `
            <div class="card-wrappper">
                <div class="${styles}"></div>
            </div>`
    }
}

function setValues(cards, values) {
    cards.forEach(card => {
    let indexOfValue = Math.floor(Math.random() * values.length),
        value = values[indexOfValue];

    values.splice(indexOfValue, 1);
    
    card.innerHTML = `<span class="card-content">${value}</span>`;
  });
}

function addListeners (cards) {    
    cards.forEach(card => {
        card.addEventListener('click', handler);
    });   
}

function removeListeners (cards) {
    cards.forEach(card => {
        card.removeEventListener('click', handler);
    }); 
}

// handle user's actions with cards

function handler (e) {
    const curCard = e.target.tagName === "SPAN" ? e.currentTarget : e.target; 
    
    currentCards.push(curCard);
      
    currentCards[currentCards.length - 1].classList.remove('back-side');

    // if user clicked on the same card
    if (currentCards[0] === currentCards[1]) {
        currentCards[0].classList.add('back-side');
        currentCards = [];
        game.counter++;
        counterOutput.textContent = game.counter;
    }
    
    if (currentCards[0] && currentCards[1]){

        if (currentCards[0].textContent !== currentCards[1].textContent){
            setTimeout( () => {
                currentCards[0].classList.add('back-side');
                currentCards[1].classList.add('back-side');
                currentCards = [];
                addListeners(cards);
            }, 500);

            removeListeners(cards);

        } else {
            setTimeout( () => {
                currentCards[0].remove();
                currentCards[1].remove();
                currentCards = [];
                addListeners(cards);
                checkTheWin();
            }, 500);

            removeListeners(cards);
            game.points++;
            pointsOutput.textContent = game.points;
        }

        game.counter++;
        counterOutput.textContent = game.counter;
    }    
}

function checkTheWin() {
    if (game.points === game.field) {
        gameContainer.remove();
        let timeSec, timeMin;
        if (!game.turnTimer) {
            let {seconds, minutes} = game.gameTime;
            timeSec = makeTimeStr(seconds)
            timeMin = makeTimeStr(minutes)
        } else {
            let totalSeconds = (Date.now() - game.timerStart) / 1000;
            seconds = Math.floor(totalSeconds % 60);
            minutes = Math.floor(totalSeconds / 60);
            timeSec = makeTimeStr(seconds)
            timeMin = makeTimeStr(minutes)
        }
        
        container.innerHTML += `
            <div class="win-container end-container">
                <h1 class="win-title">Congratulations!</h1>
                <p class="win-text">Your score:</p>
                <p class="win-text">actions <b>${game.counter}</b> time <b>${timeMin}:${timeSec}</b></p>
                <button class="btn play-again-btn">Play again</button>
            </div>`;
        
        clearInterval(game.gameTime.interval);
        game.gameTime.seconds = 0, game.gameTime.minutes = 0;

        showOrHideScoreboard(); 

        const playAgainBtn = document.querySelector('.play-again-btn');
        playAgainBtn.addEventListener('click', () => {
            game.field = 0, game.points = 0; game.counter = 0;
            document.querySelector('.win-container').remove();
            initialization();
        })
    }
}

function losing() {
    gameContainer.remove();

    container.innerHTML += `
        <div class="lose-container end-container">
            <h1 class="lose-title">Time is over!</h1>
            
            <button class="btn play-again-btn">Play again</button>
        </div>`;
    
    clearInterval(game.gameTime.interval);
    game.gameTime.seconds = 0, game.gameTime.minutes = 0;

    showOrHideScoreboard(); 

    const playAgainBtn = document.querySelector('.play-again-btn');
    playAgainBtn.addEventListener('click', () => {
        game.field = 0, game.points = 0; game.counter = 0;
        document.querySelector('.lose-container').remove();
        initialization();
    })
}

initialization();