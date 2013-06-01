var Utils = {
	decimalToOctal: function (nr) {
		return parseInt(nr,10).toString(8);
	},
	decimalToSixth: function (nr) {
		return parseInt(nr,10).toString(6);
	},
	sixthToDecimal: function (nr) {
		return parseInt(nr,6).toString(10);
	},
	octalToDecimal: function (nr) {
		return parseInt(nr,8).toString(10);
	}
}