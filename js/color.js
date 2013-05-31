function RGB(r,g,b,name){
	this.r = r;
	this.g = g;
	this.b = b;
	if(name) this.name = name;
	this.css = 'rgb('+r+','+g+','+b+')';
}

RGB.prototype.toXYZ = function() {
	var var_R = this.r / 255;        //R from 0 to 255
    var var_G = this.g / 255;        //G from 0 to 255
    var var_B = this.b / 255;        //B from 0 to 255

    if (var_R > 0.04045) var_R = Math.pow(((var_R + 0.055) / 1.055), 2.4);
    else var_R = var_R / 12.92;
    if (var_G > 0.04045) var_G = Math.pow(((var_G + 0.055) / 1.055), 2.4);
    else var_G = var_G / 12.92;
    if (var_B > 0.04045) var_B = Math.pow(((var_B + 0.055) / 1.055), 2.4);
    else var_B = var_B / 12.92;

    var_R = var_R * 100;
    var_G = var_G * 100;
    var_B = var_B * 100;

    //Observer. = 2°, Illuminant = D65
    var X = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805;
    var Y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722;
    var Z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505;
    
    return new XYZ(X, Y, Z);
}

RGB.prototype.toLAB = function(){
	return this.toXYZ().toLAB();
}

RGB.prototype.closest = function(){
	return this.toLAB().closest();
}

function XYZ(x,y,z){
	this.x = x;
	this.y = y;
	this.z = z; 
}

var ref_X = 95.047;  //Observer= 2°, Illuminant= D65
var ref_Y = 100.000;
var ref_Z = 108.883;
var const1 = 1.00 / 3;
var const2 = 16.00 / 116;

XYZ.prototype.toLAB = function(){
    var var_X = this.x / ref_X;
    var var_Y = this.y / ref_Y;
    var var_Z = this.z / ref_Z;

    if (var_X > 0.008856) var_X = Math.pow(var_X, const1);
    else var_X = (7.787 * var_X) + const2;
    if (var_Y > 0.008856) var_Y = Math.pow(var_Y, const1);
    else var_Y = (7.787 * var_Y) + const2;
    if (var_Z > 0.008856) var_Z = Math.pow(var_Z, const1);
    else var_Z = (7.787 * var_Z) + const2;

    var L = (116 * var_Y) - 16;
    var A = 500 * (var_X - var_Y);
    var B = 200 * (var_Y - var_Z);
    return new LAB(L, A, B);
    
}

function LAB(l,a,b){
	this.l = l;
	this.a = a;
	this.b = b;
}

LAB.prototype.delta =function(lab2){
	return ColorUtils.calculateDeltaE(this.l,this.a,this.b,lab2.l,lab2.a,lab2.b);
}

LAB.prototype.closest = function(){
	var closest = -1;
    var minDiff = 999999999;
    for (var i = 0; i < ColorUtils.COLORS_LAB.length; ++i) {
        var diff = this.delta(ColorUtils.COLORS_LAB[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closest = i;
        }
    }
    return ColorUtils.COLORS[closest];
}

var ColorUtils = {
	COLORS: [
        new RGB(0,0,0,"black"),
        new RGB(255,0,0,"red"),
        new RGB(255,127,0,"orange"),
        new RGB(255,255,0,"yellow"),
        new RGB(0,255,0,"green"),
        new RGB(0,255,0,"blue"),
        new RGB(75,0,130,"indigo"),
        new RGB(143,0,255,"violet"),
        new RGB(255,255,255,"white")
    ],

    COLORS_LAB: [
    	new RGB(0,0,0,"black").toLAB(),
        new RGB(255,0,0,"red").toLAB(),
        new RGB(255,127,0,"orange").toLAB(),
        new RGB(255,255,0,"yellow").toLAB(),
        new RGB(0,255,0,"green").toLAB(),
        new RGB(0,255,0,"blue").toLAB(),
        new RGB(75,0,130,"indigo").toLAB(),
        new RGB(143,0,255,"violet").toLAB(),
        new RGB(255,255,255,"white").toLAB()
    ],

	averageColor: function(imgData){
		var totalRed = 0;
        var totalGreen = 0;
        var totalBlue = 0;
        var data = imgData.data;
        var bytes = data.length;
        for (var i=0;i<bytes;i+=4){
            totalRed += data[i];  
            totalGreen += data[i+1];
            totalBlue += data[i+2];
        }
        var len = bytes/4;
        return new RGB(Math.round(totalRed / len), Math.round(totalGreen / len), Math.round(totalBlue / len));
	},

    calculateDeltaE: function(L1, a1, b1, L2, a2, b2) {
        var Lmean = (L1 + L2) / 2.0; 
        var C1 =  Math.sqrt(a1*a1 + b1*b1); 
        var C2 =  Math.sqrt(a2*a2 + b2*b2); 
        var Cmean = (C1 + C2) / 2.0; 

        var G =  ( 1 - Math.sqrt( Math.pow(Cmean, 7) / (Math.pow(Cmean, 7) + Math.pow(25, 7)) ) ) / 2; 
        var a1prime = a1 * (1 + G); 
        var a2prime = a2 * (1 + G); 

        var C1prime =  Math.sqrt(a1prime*a1prime + b1*b1); 
        var C2prime =  Math.sqrt(a2prime*a2prime + b2*b2); 
        var Cmeanprime = (C1prime + C2prime) / 2; 

        var h1prime =  Math.atan2(b1, a1prime) + 2*Math.PI * (Math.atan2(b1, a1prime)<0 ? 1 : 0);
        var h2prime =  Math.atan2(b2, a2prime) + 2*Math.PI * (Math.atan2(b2, a2prime)<0 ? 1 : 0);
        var Hmeanprime =  ((Math.abs(h1prime - h2prime) > Math.PI) ? (h1prime + h2prime + 2*Math.PI) / 2 : (h1prime + h2prime) / 2); 

        var T =  1.0 - 0.17 * Math.cos(Hmeanprime - Math.PI/6.0) + 0.24 * Math.cos(2*Hmeanprime) + 0.32 * Math.cos(3*Hmeanprime + Math.PI/30) - 0.2 * Math.cos(4*Hmeanprime - 21*Math.PI/60); //ok

        var deltahprime =  ((Math.abs(h1prime - h2prime) <= Math.PI) ? h2prime - h1prime : (h2prime <= h1prime) ? h2prime - h1prime + 2*Math.PI : h2prime - h1prime - 2*Math.PI); 

        var deltaLprime = L2 - L1; 
        var deltaCprime = C2prime - C1prime; 
        var deltaHprime =  2.0 * Math.sqrt(C1prime*C2prime) * Math.sin(deltahprime / 2.0); 
        var SL =  1.0 + ( (0.015*(Lmean - 50)*(Lmean - 50)) / (Math.sqrt( 20 + (Lmean - 50)*(Lmean - 50) )) ); 
        var SC =  1.0 + 0.045 * Cmeanprime; 
        var SH =  1.0 + 0.015 * Cmeanprime * T; 

        var deltaTheta =  (30 * Math.PI / 180) * Math.exp(-((180/Math.PI*Hmeanprime-275)/25)*((180/Math.PI*Hmeanprime-275)/25));
        var RC =  (2 * Math.sqrt(Math.pow(Cmeanprime, 7) / (Math.pow(Cmeanprime, 7) + Math.pow(25, 7))));
        var RT =  (-RC * Math.sin(2 * deltaTheta));

        var KL = 1;
        var KC = 1;
        var KH = 1;

        var deltaE = Math.sqrt(
                ((deltaLprime/(KL*SL)) * (deltaLprime/(KL*SL))) +
                        ((deltaCprime/(KC*SC)) * (deltaCprime/(KC*SC))) +
                        ((deltaHprime/(KH*SH)) * (deltaHprime/(KH*SH))) +
                        (RT * (deltaCprime/(KC*SC)) * (deltaHprime/(KH*SH)))
        );

        return deltaE;
    }

};