function Utilities() {

}

Utilities.prototype.generateLocalId = function() {
	return new Date().getTime().toString();
}

var utilities = new Utilities();