var Bvalidator = require('../../models/alpha_report/bvalidator.js');
var revalidator = require('revalidator');
var RawFeedService = require('./raw_feed');
var actionEmitter = require('../action_emitter.js');
var paramHandler = require('../list_default_handler.js');
var async = require('async');

module.exports = function(models, io, logger) {
	var me = this;

	var validationModel = models.alphaReportValidation;

	var services = {
		alphaReportService: me,
		rawFeedService: new RawFeedService(models, io, logger)
	};
	var bvalidator = new Bvalidator(services, logger);

	/**
	 *	Returns a list of all the alpha reports
	 */
	me.list = function(req, callback){
		paramHandler.handleDefaultParams(req, function(params){
			if (params !== null){
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;
				
				var config = {
					createdDate : {
						$gte: params.start,
						$lte: params.end
					}
				};
				
				models.alphaReport.find(config).skip(params.offset).sort(sortObject).limit(params.count).execFind(function(error, response){
					callback(error, response, config);
				});
			} else {
				models.alphaReport.find({}, function(error, response){
					callback(error, response, {});
				});
			}
		});
	};
	
	me.getIndexes = function(req, callback){
		var keys = Object.keys(models.alphaReport.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++){
			if (models.alphaReport.schema.paths[keys[i]]._index){
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};

	me.findDates = function(callback) {
		models.alphaReport.find({},{_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get feed Dates: " + err);
			if(err) {
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err,results) {
					if(err) {
						callback(errorMsg);
					} else {
						callback(results);
					}
				});
			}
		});
	};

	me.flattenArray = function (string, callback) {
		callback(null, Date.parse(string.createdDate));
	};
	
	me.getTotalCount = function(config, callback){
		models.alphaReport.count(config, callback);
	};

	me.listFields = function(params, field_string, callback) {
		models.alphaReport.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of AlphaReport data
	 * 
	 * saveAlphaReport calls the validateAlphaReport module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form of  function(err, valid object, AlphaReport object)
	 */
	me.create = function(data, saveCallback) {
		me.validateAlphaReport(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid AlphaReport");
				var newAlphaReport = new models.alphaReport(data);
				newAlphaReport.save(function(err){
					if(err){
						logger.error('Error saving AlphaReport ', err);
					} else {
						actionEmitter.saveAlphaReportEvent(newAlphaReport);
					}
					saveCallback(err, valid, newAlphaReport);

				});
			}
			else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateAlphaReport validates an AlphaReport object against the AlphaReport semantic rules
	 * and the business rules associated with an AlphaReport
	 *
	 * validateAlphaReport calls the JSON validation module  revalidator and
	 * calls the business validation module bvalidator for the AlphaReport object

	 * data is the object being validated
	 * 
	 * valCallback takes the form of  function(valid structure)
	 */
	me.validateAlphaReport = function(data, valCallback) {
		// is the JSON semantically valid for the location object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the location object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		}
		else {

			valCallback(valid);
		}
	};

	/**
	 * Returns the alpha report object with id specified in URL
	 */
	me.get = function(id, callback){
		me.findWhere({_id: id}, callback);
	};

	/**
	 * readAlphaReportByProperty is a generic read method to return all of
	 * documents that have a property value that matches.
	 */
	me.findWhere = function(config, callback){
		models.alphaReport.find(config, callback);
	};

	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs){
			if(err) {
				logger.info("Error getting AlphaReport "+err);
				updCallback(err, null, data);
			} else if(docs) {
				docs = docs[0];//There will only be one alpha report from the get
				for(var e in data){
					if(e !== '_id') {
						docs[e] = data[e];
					}
				}
				docs.updatedDate = new Date();
				me.validateAlphaReport(docs, function(valid){
					if (valid.valid) {
						docs.save(function(err){
							if(err){
								updCallback(err, valid, data);
							} else {
								updCallback(err, valid, docs);
							}
						});
					} else {
						valid.valid = false;
						valid.errors = {expected: id, message: "Updated Alpha Report information not valid"};
						updCallback(err, valid, data);
					}
				});
			} else {
					var errorMSG = new Error("Could not find Alpha Report to Update");
					updCallback(errorMSG, null, data);
			}
		});
	};

	me.del = function(config, callback){
		models.alphaReport.remove(config, callback);
	};
};