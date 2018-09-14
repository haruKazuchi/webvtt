(function($){
	Main = {
		init: function(){
			this.window      = $(window);
			this.html        = $('html');
			this.body        = $('body');
			this.device      = '';

			this.resize();
			this.videoSrc();
			this.trackVtt();
			// this.addText();
		},
		resize: function(){
			this.window.on('load resize',function(){
				var breakpoint = 767;
				this.windowWidth = window.innerWidth;
				this.windowWidth <= breakpoint ? this.device = 'SP' : this.device = 'PC';

				this.responImg(this.device);
			}.bind(this))
		},
		responImg: function(device){
			var suffix = '';
			$('.responImg').each(function(){
				if (device == 'SP') {
					if (!$(this).attr('src').match(new RegExp('\.sp.(png|jpg|gif|svg)$'))) {
						suffix = $(this).attr('src').match(new RegExp('\.(png|jpg|gif|svg)$'))[0];
						$(this).attr('src', $(this).attr('src').replace(new RegExp('\.(png|jpg|gif|svg)$'), '.sp' + suffix));
					}
				}
				else{
					suffix = $(this).attr('src').match(new RegExp('\.(png|jpg|gif|svg)$'))[0];
              		$(this).attr('src', $(this).attr('src').replace(new RegExp('\.sp.(png|jpg|gif|svg)$'), suffix));
				}
			})
		},
		videoSrc: function(){
			$('#file-video').on('change',function(event){
				var source = URL.createObjectURL(this.files[0]);
				document.querySelector('video').src = source;
			})
		},
		parse_timestamp: function(s){
			//var match = s.match(/^(?:([0-9]{2,}):)?([0-5][0-9]):([0-5][0-9][.,][0-9]{0,3})/);
			// Relaxing the timestamp format:
			var match = s.match(/^(?:([0-9]+):)?([0-5][0-9]):([0-5][0-9](?:[.,][0-9]{0,3})?)/);
			if (match == null) {
				throw 'Invalid timestamp format: ' + s;
			}
			var hours = parseInt(match[1] || "0", 10);
			var minutes = parseInt(match[2], 10);
			var seconds = parseFloat(match[3].replace(',', '.'));
			return seconds + 60 * minutes + 60 * 60 * hours;
		},
		loadVtt: function(vtt){
			var lines = vtt.trim().replace('\r\n', '\n').split(/[\r\n]/).map(function(line) {
				return line.trim();
			});
			var cues = [];
			var start = null;
			var end = null;
			var payload = null;
			for (var i = 0; i < lines.length; i++) {
				if (lines[i].indexOf('-->') >= 0) {
					var splitted = lines[i].split(/[ \t]+-->[ \t]+/);
					if (splitted.length != 2) {
						throw 'Error when splitting "-->": ' + lines[i];
					}
					// Already ignoring anything past the "end" timestamp (i.e. cue settings).
					start = this.parse_timestamp(splitted[0]);
					end = this.parse_timestamp(splitted[1]);
				} else if (lines[i] == '') {
					if (start && end) {
						var cue = new VTTCue(start, end, payload);
						cues.push(cue);
						start = null;
						end = null;
						payload = null;
					}
				} else if(start && end) {
					if (payload == null) {
						payload = lines[i];
					} else {
						payload += '\n' + lines[i];
					}
				}
			}
			if (start && end) {
				var cue = new VTTCue(start, end, payload);
				cues.push(cue);
			}
			return cues;
		},
		trackVtt: function(){
			var video = document.querySelector('video');
			var subtitles = document.getElementsByTagName('script');
			var nowTrack;
			var $vtt = $('#vtt');
			Array.prototype.slice.call(subtitles)
				.filter(node => node.type === "text/vtt")
				.map(subtitle => {
					// console.log(subtitle);
					var track = video.addTextTrack('subtitles', subtitle.dataset.label, subtitle.dataset.lang);
					// console.log(track);
					// console.log(subtitle.dataset.label);
					track.mode = "showing";
					nowTrack = subtitle.innerHTML;
					$vtt.val(nowTrack.trim());
					this.loadVtt(subtitle.innerHTML).map(function(cue) {
						// console.log(cue);
						track.addCue(cue);
					});
				});
			// console.log(video.textTracks);

		},
		reloadVtt : function(event){
			var subtitle = $('#vtt').val().trim();
			var video = document.querySelector('video');
			var track = '';
			track = video.addTextTrack('subtitles', 'English', 'en');

			console.log(subtitle);
			this.loadVtt(subtitle).map(function(cue) {
				track.addCue(cue);
			});
			track.mode = "showing";
			console.log(video.textTracks[0].mode = "disable");
			for (var i = 0; i < video.textTracks.length - 1; i++) {
				video.textTracks[i].mode = "hidden";
			}
			document.querySelector('video').load();
		},
		loadVideoData : function(){
			var $video = document.querySelector('video');
			var height = 400;
			var duration = $video.duration;
			// var durationPercent = duration
			// console.log(video.duration);
		},
		addText: function(){
			var error = false;
			var text = '';
			var $vtt = $('#vtt');
			$('input').css({'border-color': '#ccc'});
			$('textarea').css({'border-color': '#ccc'});
			console.log("A");
			if($('#start').val() == "" ){
				$('#start').css({'border-color': '#ad0132'});
				error = true;
			}
			if ($('#end').val() == "") {
				$('#end').css({'border-color': '#ad0132'});
				error = true;
			}
			if ($('#text').val() == "") {
				$('#text').css({'border-color': '#ad0132'});
				error = true;
			}

			if (error) {
				return
			}
			text = $('#start').val() + ' --> ' + $('#end').val() + '\r\n' + $('#text').val() + '\r\n' + '\r\n';

			$('#start').val("");
			$('#end').val("");
			$('#text').val("");

			$vtt.val($vtt.val() + '\r\n' + text);
			// this.loadVtt(text);
		},
		downloadVtt: function(){
			var $vtt = $('#vtt');
			var a = document.createElement("a");
			//念の為local storageに一旦保存する
			localStorage.setItem("webvtt", $vtt.val());
			//念の為

			blob = new Blob([$vtt.val()], {type: "octet/stream"}),
			url = window.URL.createObjectURL(blob);

			a.href = url;
			a.target = '_blank';
			a.download = 'webvtt.vtt';
			a.click();
		}

	}

	$(function(){
		Main.init();
	})
})(jQuery)