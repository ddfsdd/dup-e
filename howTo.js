(function init(){
    ///////////////Initialize//////////////
    async function animateAndSetReceiver(array,playerOrOpp) {
		for (i = 0; i < array.length; i++) {
			let ani_id = '#'+playerOrOpp+'btn_' + array[i];
			toggleColor(ani_id, 'btn-primary', 'btn-danger');
			await delay(400);
			toggleColor(ani_id, 'btn-danger', 'btn-primary');
			await delay(250);
		}
    }

    $(`#animate`).on('click',function(){animateHowToPlay();});

    //for drawing game button
	var p1 = '';
	var p2 = '';
	//create player game button
	for (i = 1; i <= 5; i++) {
		p1 += "<button id='playerbtn_" + i + "' class='btn btn-primary player_button'>" + i + '</button>';
	}
	document.getElementById('player').innerHTML = p1;
	//create opponent game button
	for (i = 1; i <= 5; i++) {
		p2 +=
			"<button id='oppbtn_" +
			i +
			"' class='btn btn-primary disabled opponent_button' style='cursor: not-allowed'>" +
			i +
			'</button>';
	}
	document.getElementById('opponentPlayer').innerHTML = p2;

	//god has granted us the delay function, praise the sun.
	function delay(time) {
		return new Promise(resolve => setTimeout(resolve, time));
	}

	//remove class and add class to animate the color change.
	function toggleColor(obj, remove, changeTo) {
		$(obj).removeClass(remove);
		$(obj).addClass(changeTo);
    }
    /////////////////////
    function setSeqAndContent(seqNum,content){
        $('#sequenceNo').text(seqNum);
        $('#sequenceText').text(content);
    }
    async function animateHowToPlay(){
        document.getElementById("animate").disabled = true;
       
        setSeqAndContent('1','At the start of the game the first player makes the moves');
        await animateAndSetReceiver([4,3,3,2,1],'player');
        setSeqAndContent('2','The other player then gets the message and follows the move');
        await animateAndSetReceiver([4,3,3,2,1],'opp');
        setSeqAndContent('3','The point will increase based on correct move and combo. They then make a move back');
        $('#score_opp').text('350');
        await animateAndSetReceiver([2,3,5,1,2],'opp');
        setSeqAndContent('4','You then follow the moves and reply back');
        await animateAndSetReceiver([2,4,4,4,4],'player');
        setSeqAndContent('5','You make a move again and the loop continues..., 10 secs to make, 20 secs to follow');
        $('#score').text('50');
        await delay(2000);
        setSeqAndContent('6','Have fun :)');
        await delay(2000);
        $('#score_opp').text('0');
        $('#score').text('0');
        document.getElementById("animate").disabled = false;
    }
    
}());