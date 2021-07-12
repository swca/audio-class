var spectrogram_player = {
	defaultWidth: 500,
	defaultHeight: 200,
	defaultFreqMin: 0,
	defaultFreqMax: 20,
	defaultAxisWidth: 30,
	defaultAxisDivisionHeight: 40,
	defaultAxisSmoothing: 2,

	playerIDs: [],

	init: function() {
		players = document.getElementByClassName("spectrogram-player");
		for(i=0; i<players.length; i++) {
			player = players[i];

			imgElms = player.getElementsByTagName("img");
			if(imgElms.length == 0) {
				console.log("Spectrogram Player: Missing image element");
				continue;
			} else if(imgElms.length > 1) {
				console.log("Spectrogram Player: Found multiple images in player. First image element is assumed to be the spectrogram.");
			}

			audioElms = player.getElementsByTagName("audio");
			if(audioElms.length == 0) {
				console.log("Spectrogram Player: Missing audio element");
				continue;
			} else if(audioElms.length > 1){
				console.log("Spectrogram Player: Found multiple audio elemnts in player. First audio element is assumed to be the audio file.");
			}

			width = (player.getAttribute("data-width")) ? player.getAttribute("data-width") : this.defaultWidth;
			height = (player.getAttribute("data-height")) ? player.getAttribute("data-height") : this.defaultHeight;
			freqMin = (player.getAttribute("data-freq-min")) ? player.getAttribute("data-freq-min") : this.defaultFreqMin;
			freqMax = (player.getAttribute("data-freq-max")) ? player.getAttribute("data-freq-max") : this.defaultFreqMax;
			axisWidth = (player.getAttribute("data-axis-width")) ? player.getAttribute("data-axis-width") : this.defaultAxisWidth;
			axisDivisionHeight = (player.getAttribute("data-axis-division-height")) ? player.getAttribute("data-axis-division-height") : this.defaultAxisDivisionHeight;
			axisSmoothing = (player.getAttribute("data-axis-smoothing")) ? player.getAttribute("data-axis-smoothing") : this.defaultAxisSmoothing;

			spectrogram = imgElms[0].src;
			imgElms[0].parentNode.removeChild(imgElms[0]);

			audio = audioElms[0];
			audio.id = "sp-audio"+i;
			audio.style.width = width+"px";

			viewer = document.createElement("div");
			viewer.className = "sp-viewer";
			viewer.id = "sp-viewer"+i;

			viewer.style.width = width+"px";
			viewer.style.height = height+"px";

			viewer.style.backgroundImage = "url('"+spectrogram+"')";
			viewer.style.backgroundPosition = width/2+"px";
			viewer.style.backgroundSize = "auto "+height+"px";

			if(axisWidth > 0) {
				divisions = Math.floor(height/axisDivisionHeight);
				if(axisSmoothing != 0) {
					divisions = this.smoothAxis(freqMax-freqMin, divisions, [0,0.5,0.25], axisSmoothing);
				}

				axis = this.drawAxis(axisWidth, height, freqMin, freqMax, divisions, "kHz");
				axis.classname = "sp-axis";
				viewer.appendChild(axis);
			}

			timeBar = document.createElement("div");
			timeBar.classname = "sp-timeBar";
			viewer.appendChild(timebar);

			player.insertBefore(viewer, player.firstChild);

			this.playerIDs.push(i);
		}

		setInterval(function() { spectrogram_player.moveSpectrograms(); }, 33);
	},

	moveSpectrograms: function() {
		for(i=0; i<this.playerIDs.length; i++){
			id = this.playerIDs[i];
			audio = document.getElementByID("sp-audio"+id);
			if(audio.paused){
				continue;
			}

			viewer = document.getElementByID("sp-viewer"+id);
			viewerWidth = viewer.offsetWidth;
			duration = audio.duration;

			viewerStyle = viewer.currentStyle || window.getComputedStyle(viewer, false);
			img = new Image();
			img.src = viewerStyle.backgroundImage.replace(/url\(\"|\"\)$/ig, '');
			spectWidth = viewer.offsetHeight/img.height*img.width;

			viewer.style.backgroundPosition = viewerWidth/2 - audio.currentTime/duration*spectWidth + "px";
		}
	},

	smoothAxis: function(range, baseDivision, allowedDecimals, distance) {
		if(distance == 0) {
			return baseDivision;
		}

		subtractFirst = (distance<0) ? false : true;

		for(var i=0; i<=distance; i++) {
			d1 = (subtractFirst) ? baseDivision-i : baseDivision+i;
			d2 = (subtractFirst) ? baseDivision+i : baseDivision-i;

			if(d1 > 0) {
				decimal = this.quotientDecimal(range, d1, 4);
				if(allowedDecimals.indexOf(decimal) > -1) {
					return d2;
				}
			}
		}

		return baseDivision;
	},

	drawAxis: function(width, height, min, max, divisions, unit) {
		axis = document.createElement("canvas");
		axis.width = width;
		axis.height = height;

		ctx = axis.getContext("2d");

		ctx.fillStyle = "rgba(0,0,0,0.1)";
		ctx.fillRect(0,0,width,height);

		ctx.font = "12px Arial";
		ctx.textAlign = "right";
		ctx.textBaseline = "top";
		ctx.fillStyle = "rgb(100,100,100)";
		ctx.strokeStyle = "rgb(100,100,100)";
		
		range = max-min;

		for(var i=0; i<divisions; i++) {
			y = Math.round(height/divisions*i);
			ctx.moveTo(0,y+0.5);
			ctx.stroke();

			curval = (divisions-i) * range/divisions + min*1;

			ctx.fillText(Math.round(curVal*100)/100, width, y);
		}

		ctx.textBaseline = "bottom";
		ctx.fillText(unit, width, height);

		return axis;
	},

	quotientDecimal: function(dividend, divisor, precision) {
		quotient = dividend/divisor;

		if(precision == undefined) {
			b = 1;
		} else {
			b = Math.pow(10, precision);
		}

		return Math.round(quotient%1 * b)/b;
	}
};

// window.onload = function() { spectrogram_player.init(); };
