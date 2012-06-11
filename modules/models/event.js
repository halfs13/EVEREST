/**
 * Model for an event
 */


function Event(id, title, message, location, time){
	this.id = id;
	this.title = title;
	this.message = message;
	this.location = location;
	this.time = time;
};

var events = [new Event(0, 'Fire', 'Fire in building A', 'Building A', '12:00pm'),
              new Event(1, 'Flood', 'Flod in building B', 'Building B', '12:01pm'),
              new Event(2, 'Traffic', 'Heavy traffic on Drewry Lane', 'Drewry Lane', '12:02pm')
              ];

this.listEvents = function(res){
	var array = [];
	for(cur in events)
		array.push(cur[0]);
	res.json({events: array});
};

this.getEvent = function(index, res){
	if(index < events.length){
		res.json(events[index]);
	} else {
		console.log("Out of range, redirecting to list");
		res.redirect('/events');
	}
};

this.createEvent = function(id, title, message, location, time){
	events.push(new Event(id, title, message, location, time));
};

this.addEvent = function(event){
	events.push(event);
};

this.deleteEvent = function(id){
	var tmpEvents = [];
	var i=0;
	for(i =0; i< events.length; i++){
		console.log(events[i].id);
		if(events[i].id != id){
			tmpEvents.push(events[i]);
		}
	}
	events = tmpEvents;
};