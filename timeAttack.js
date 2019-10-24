(function init(){
    ///////////////Initialize//////////////
    $(document).ready(function() {
		$('.player_button').on({
			mouseenter: function() {
				toggleColor(this, 'btn-primary', 'btn-warning');
			},
			mouseleave: function() {
				toggleColor(this, 'btn-warning', 'btn-primary');
			},
			click: async function() {
				toggleColor(this, 'btn-warning', 'btn-danger');
				await delay(300);
				$(this).removeClass('btn-danger');
				if ($(this).is(':hover') === true) {
					$(this).addClass('btn-warning');
				} else {
					$(this).addClass('btn-primary');
				}
			},
			//add logic to input data into the array.
		});
		document.onkeyup = press;
    });
    //for drawing game button
	var p1 = '';
	//create player game button
	for (i = 1; i <= 7; i++) {
		p1 += "<button id='playerbtn_" + i + "' class='btn btn-primary player_button'>" + i + '</button>';
	}
	document.getElementById('player').innerHTML = p1;
	//god has granted us the delay function, praise the sun.
	function delay(time) {
		return new Promise(resolve => setTimeout(resolve, time));
    }
    for (let j = 1; j <= 7; j++) {
        $(`#playerbtn_${j}`).on('click', function() {
            playBtnSound(j);
        });
    }

	//remove class and add class to animate the color change.
	function toggleColor(obj, remove, changeTo) {
		$(obj).removeClass(remove);
		$(obj).addClass(changeTo);
    }
	//timer
	var Stopwatch = function(elem, options) {
		var timer = createTimer(),
			offset,
			clock,
			interval;

		// default options
		options = options || {};
		options.delay = options.delay || 1;
		// append elements
		elem.appendChild(timer);
		// initialize
		reset();

		// private functions
		function createTimer() {
			return document.createElement('span');
		}

		function createButton(action, handler) {
			var a = document.createElement('a');
			a.href = '#' + action;
			a.innerHTML = action;
			a.addEventListener('click', function(event) {
				handler();
				event.preventDefault();
			});
			return a;
		}
		function stop() {
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		}
		function reset() {
			clock = 0;
			render();
		}
		function render() {
			timer.innerHTML = clock / 1000;
		}

		function delta() {
			var now = Date.now(),
				d = now - offset;

			offset = now;
			return d;
		}

		function timeDecrease() {
			if (!interval) {
				offset = Date.now();
				interval = setInterval(unupdate, options.delay);
			}
		}

		function giveMeTime() {
			return clock / 1000;
		}

		function setTime(time) {
			clock = time;
			render();
		}

		function unupdate() {
			clock -= delta();
			render();
		}

		// public API
		this.start = start;
		this.stop = stop;
		this.reset = reset;
		this.timeDecrease = timeDecrease;
		this.giveMeTime = giveMeTime;
		this.setTime = setTime;
    };
    
    var elems = document.getElementsByClassName('stopwatch');
	var timerAnimate;
	for (var i = 0, len = elems.length; i < len; i++) {
		timerAnimate = new Stopwatch(elems[i]);
    }
    var reset;
    class Timer {
		constructor() {
            this.time = 90;
         
		}
		stopAndReset() {
			timerAnimate.reset();
			timerAnimate.stop();
			this.reset();
		}
		startTimer(time) {
			// timerAnimate.start();
			this.time = time;
			this.startTimerCountDown(time);
			reset = window.setTimeout(this.doWhenTimeOut.bind(this), this.time);
		}
		startTimerCountDown(time) {
			timerAnimate.setTime(time);
			timerAnimate.timeDecrease();
		}
		reset() {
			if (typeof reset != 'undefined') {
				window.clearTimeout(reset);
			}
		}
		doWhenTimeOut() {
            this.stopAndReset();
            playing = false;
            
			}
	}


    /////////////////////
    timer = new Timer();
    var combo = 0;
    var points = 0;
    var playing = false;
    var randomizer = '0';
    function timeAttackHandler(){
        const button = this.id.split('_')[1];
        if(playing){
            if(button==randomizer){
                randomizer = ''+(Math.floor(Math.random() * 7)+1);
                $('#replicate').text(randomizer);
                points+=50+combo*10;
                combo++;
                $('#score').text(points);
                $('#combo').text(combo);
            }else{
                combo=0;
                randomizer = ''+(Math.floor(Math.random() * 7)+1);
                $('#replicate').text(randomizer);
                $('#combo').text(combo);
            }
        }else{
            console.log('press the start button');
            
        }
    }
    for (let j = 1; j <= 7; j++) {
        $(`#playerbtn_${j}`).on('click', timeAttackHandler);
    }
    $('#start').on('click',function(){
        playing = true;
        timer.startTimer(30000);
        console.log('you can now play the game');
        points = 0;
        combo=0;
        $('#score').text(points);
        randomizer = ''+(Math.floor(Math.random() * 7)+1);
        $('#replicate').text(randomizer);
    })
    $('#reset').on('click',function(){
        playing = false;
        timer.stopAndReset();
    })
    //////////////////////
    function setSeqAndContent(seqNum,content){
        $('#sequenceNo').text(seqNum);
        $('#sequenceText').text(content);
    }
    var sound_do = new Howl({
		src: ['sfx/do.wav'],
	});
	var sound_re = new Howl({
		src: ['sfx/re.wav'],
	});
	var sound_mi = new Howl({
		src: ['sfx/mi.wav'],
	});
	var sound_fa = new Howl({
		src: ['sfx/fa.wav'],
	});
	var sound_sol = new Howl({
		src: ['sfx/sol.wav'],
	});
	var sound_la = new Howl({
		src: ['sfx/la.wav'],
	});
	var sound_si = new Howl({
		src: ['sfx/si.wav'],
	});

	function playBtnSound(num) {
		switch (num) {
			case 1:
				sound_do.play();
				break;
			case 2:
				sound_re.play();
				break;
			case 3:
				sound_mi.play();
				break;
			case 4:
				sound_fa.play();
				break;
			case 5:
				sound_sol.play();
				break;
			case 6:
				sound_la.play();
				break;
			case 7:
				sound_si.play();
				break;
		}
	}
	//for keypressed function
	async function press(e) {
		console.log(`${e.key}`);
		switch (e.key) {
			case 'q':
				toggleColor('#playerbtn_1', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_1', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_1').click();
				break;
			case 'w':
				toggleColor('#playerbtn_2', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_2', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_2').click();
				break;
			case 'e':
				toggleColor('#playerbtn_3', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_3', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_3').click();
				break;
			case 'r':
				toggleColor('#playerbtn_4', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_4', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_4').click();
				break;
			case 't':
				toggleColor('#playerbtn_5', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_5', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_5').click();
				break;
			case 'y':
				toggleColor('#playerbtn_6', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_6', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_6').click();
				break;
			case 'u':
				toggleColor('#playerbtn_7', 'btn-primary', 'btn-danger');
				await delay(200);
				toggleColor('#playerbtn_7', 'btn-danger', 'btn-primary');
				document.getElementById('playerbtn_7').click();
				break;
		}
	}
    
}());