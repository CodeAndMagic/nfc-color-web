var Camera = {
	ANALYSE_INTERVAL: 500,

	start: function(elementToAppendTo, analyseFrameFunc){
		var self = this;
		this.createWebcamVideo(elementToAppendTo,function(video){
			self.startVideoTracking(video, analyseFrameFunc, self.ANALYSE_INTERVAL);  
		});
	},

	createWebcamVideo: function(elementToAppendTo, func){
		if(typeof elementToAppendTo === "string"){
			elementToAppendTo = document.getElementById(elementToAppendTo);
		}
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia({video: true}, 
			function(localMediaStream) { 
				var video = document.createElement("video");
				video.autoplay = true;
				video.src = window.URL.createObjectURL(localMediaStream);
				elementToAppendTo.appendChild(video);
				func(video);
			}, function(error) {
				console.log(error);
			}
		);
	},

	startVideoTracking: function(video, analyseFrameFunc, analyseInterval){
		if(!video || !analyseFrameFunc){
			throw "Need video, grid and analyseFrameFunc parameters!";
			return;
		}
		if(!analyseInterval){
			analyseInterval = 1000;
		}
		video.addEventListener("canplay",function(){
			var videoWidth = video.videoWidth;
			var videoHeight = video.videoHeight; 
			var canvasWidth = videoWidth;// > 320 ? 320 : videoWidth;
			var canvasHeight = videoHeight;// > 240 ? 240 : videoHeight;
			var imageCnvs = document.createElement("canvas");
			imageCnvs.width = canvasWidth;
			imageCnvs.height = canvasHeight;
			var imageCtx = imageCnvs.getContext("2d");
			var currentImageData = imageCtx.createImageData(canvasWidth, canvasHeight);

			window.analyseLoop = setInterval( function(){			  
			  imageCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvasWidth, canvasHeight);
			  //var deSaturated = deSaturate(greyscaleCtx.getImageData(0, 0, canvasWidth, canvasHeight));
			  //currentImageData = deSaturated.pop();
			  analyseFrameFunc(imageCtx.getImageData(0, 0, canvasWidth, canvasHeight));

			}, analyseInterval);
		});
	}
}


