/**
 * Runs while connected to a database
 */
var winston = require('winston');
var general = require('../wizard_service');
var models = require('../../models/models');

//Load and set up the logger
var logger = new (winston.Logger)({
	//Make it log to both the console and a file 
	transports : [new (winston.transports.Console)(),
		new (winston.transports.File)({filename: 'logs/general.log'})] //,
});

/**
 * Returns a general options message
 */
this.getOptions = function(res){
	general.getOptions(res);
};