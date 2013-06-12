/**
 * Runs while connected to a database
 */
var winston = require('winston');
var general = require('../wizard_service');
var models = require('../../models/models');

var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

/**
 * This gets the comments for the event wit the ID specified in the URL.
 * By default it returns 10, but can be overridden with ?count=#, up to 100
 */
this.getComments = function(index, opts, res){
	var count = 10;
	if(opts.count){
		count = opts.count;
		//Limit to 100
		if(count > 100){
			count = 100;
		}
	}
	models.event.find({_id:index}, 'comments', {sort: {timestamp: -1}}, function(err, docs){
		if(err){
			logger.error('Error getting comments',err);
			general.send500(res);
		} else if(docs.length > 0){
			//Comments are sorted newest first
			if(opts.after){
				//They are requesting only comments after a certain ID, so
				//send all the comments until you hit that ID or you hit $count
				//comments processed
				var comments = [];
				var i = 0;
				while(i < docs[0].comments.length && docs[0].comments[i]._id != opts.after && i < count){
					comments.push(docs[0].comments[i]);
					i++;
				}
				res.json(comments);
			} else {
				//Just return the last $count comments
				res.json(docs[0].comments.slice(0,count));
			}
			res.end();			
		} else {
			general.send404(res);
		}//;
	});
};

/**
 * Adds a comment to the event with the id in the URL.
 * On success, it returns status:'Success', and it emits a
 * Socket.io message with the id of the event.
 */
this.addComment = function(id, req, res, io){
	models.event.find({_id:id}, 'comments GID', {sort: {timestamp: 1}}, function(err,docs){
		if(err || docs.length === 0){
			logger.error('Error adding comment',err);
			general.send500(res);
		} else {
			var newComment = new models.comment(req);
			docs[0].comments.push(newComment);
			docs[0].comments.sort(function(a,b){
				if(a.timestmp > b.timestmp){
					return -1;
				} else if(a.timestmp < b.timestmp){
					return 1;
				} else {
					return 0;
				}
			});
			docs[0].save(function(err){
				if(err){
					general.send500(res,err);
				} else {
					res.json({status: 'OK'});
					res.end();
					io.sockets.emit('comment', {'id':docs[0]._id});
				}
			});
		}//;
	});
};