(function init() {
    /////////////INIT////////////////
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
    
    function delay(time) {
		return new Promise(resolve => setTimeout(resolve, time));
	}

	//remove class and add class to animate the color change.
	function toggleColor(obj, remove, changeTo) {
		$(obj).removeClass(remove);
		$(obj).addClass(changeTo);
	}

    	//for drawing game button
	var p1 = '';
	var p2 = '';
	//create player game button
	for (i = 1; i <= 5; i++) {
		p1 += "<button id='playerbtn_" + i + "' class='btn btn-primary player_button'>" + i + '</button>';
	}
    document.getElementById('player').innerHTML = p1;
    ////////////////////////////


    /////////////Button interaction////////////////
    for (let j = 1; j <= 5; j++) {
		$(`#playerbtn_${j}`).on('click', submitHandler);
		$(`#playerbtn_${j}`).on('click', function() {
			playBtnSound(j);
		});
	}
	var text ='';
	function submitHandler() {
		const button = this.id.split('_')[1];
		text=button+' '+text;
		text= text.trim();
		if(text.trim().split(' ').length >11){
			text = text.substring(0,text.length-1);
		}
		$('#display').html('You press button '+text);
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
})();
