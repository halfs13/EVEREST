var events = require('events');
var util = require('util');

var Eventer = function(){
	events.EventEmitter.call(this);

	//TO CREATE A NEW EVENT JUST ADD THE EVENT AS A STRING TO THE FOLLOWING ARRAY.
	//The event should be named following the convention <eventname>Event"
	this.eventList = ["sampleListEvent", "saveAlphaReportEvent", "updateAlphaReportEvent",
	"validateAlphaReportEvent","twitterDataRecievedEvent", "saveFeedEvent", "rawFeedParseEvent"];

	function baseEvent(eventName) {
		return function() {
			this.emit(eventName, arguments);
		};
	}
	for(var i =0; i < this.eventList.length; i++) {
		this[this.eventList[i]] = baseEvent(this.eventList[i]);
	}
};


util.inherits(Eventer, events.EventEmitter);
var eventer = new Eventer();
module.exports = eventer;