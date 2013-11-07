var Bvalidator = require('../../models/confirmed_report/bvalidator.js');
var revalidator = require('revalidator');
var AlphaReportService = require('./alpha_report.js');
var ProfileService = require('./profile.js');
var TargetEventService = require('./target_event.js');
var actionEmitter = require('../action_emitter.js');
var paramHandler = require('../list_default_handler.js');
var async = require('async');

module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.confirmedReportValidation;
	
	var services = {
		confirmedReportService: me,
		alphaReportService: new AlphaReportService(models, io, logger),
		profileService: ProfileService,		//TODO change this
		targetEventService: new TargetEventService(models, io, logger)
	};
	
	var bvalidator = new Bvalidator(services, logger);

	me.list = function(req, callback) {
		paramHandler.handleDefaultParams(req, function(params) {
			if (params !== null) {
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;
				
				var config = {
					createdDate: {
						$gte: params.start,
						$lte: params.end
					}
				};
				
				models.confirmedReport.find({}).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res){
					callback(err, res, config);
				});
			} else {
				models.confirmedReport.find({}, function(err, res){
					callback(err, res, {});
				});
			}
		});
	};
		
	me.listFlattened = function(params, callback) {
		me.list(params, function(err, res) {
			if (err) {
				logger.error("Error listing Confirmed Reports", err);
				callback(err, res);
			} else {
				async.each(res, function(report, callback) {
					me.flattenConfirmedReport(report, function(err, updatedReport) {
						if(!err) {
							report = updatedReport;
						}
						callback(err);
					});
				}, function(err) {
					callback(err, res);
				});
			}
		});
	};
	
	me.getFlattened = function(id, callback) {
		me.get(id, function(err, report) {
			//FIXME handle err
			me.flattenConfirmedReport(report, callback);
		});
	};
	
	me.flattenConfirmedReport = function(report, callback) {
		var fieldsToFlatten = ['alpha_report_id'/*, 'target_event_id'*/, 'profile_id', 'assertions'];
	
		async.each(fieldsToFlatten, function(field, fieldCallback) {
			console.log(fieldCallback);
			if (field === 'assertions' && report.assertions.length > 0) {
				var flattenedAssertions = [];
				async.each(report.assertions, function(assertion, assertionCallback) {
					me.flattenField(report, assertion, function(err, flattenedField) {
						if (err) {
							assertionCallback(err);
						} else {
							flattenedAssertions.put(flattenedField);
							assertionCallback();
						}
					});
				}, function(err) {
					report.assertions = flattenedAssertions;
					fieldCallback(err);
				});
			} else {
				if (typeof(report[field]) !== 'undefined' && report[field] !== null) {
					me.flattenField(report, field, function(err, flattenedField) {
						if (err) {
							fieldCallback(err);
						} else {
							report[field] = flattenedField[0];
							fieldCallback();
						}
					});
				} else {
					callback();
				}
			}
		}, function(err) {
			console.log('end');
			callback(err, report);
		});
	};
	
	me.flattenField = function(report, field, callback) {
		if (field === 'alpha_report_id') {
			services.alphaReportService.get(report.alpha_report_id, callback);
		} else if(field === 'target_event_id') {
			services.targetEventService.get(report.target_event_id, callback);
		} else if(field === 'profile_id') {
			services.profileService.get(report.profile_id, callback);
		}
	};
	
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.confirmedReport.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.confirmedReport.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}
		
		callback(indexes);
	};
	
	me.findDates = function(callback) {
		models.confirmedReport.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get Confirmed Report Dates: " + err);
			if (err) {
				callback(errorMsg);
			} else {
				async.map(dates, me.flattenArray, function(err, results) {
					if (err) {
						callback(errorMsg);
					} else {
						callback(results);
					}
				});
			}
		});
	};
	
	me.flattenArray = function(string, callback) {
		callback(null, Date.parse(string.createdDate));
	};
	
	me.getTotalCount = function(config, callback) {
		models.confirmedReport.count(config, callback);
	};
	
	me.listFields = function(params, field_string, callback) {
		models.confirmedReport.find(params, field_string, callback);
	};
	
	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population of Confirmed Report data
	 * 
	 * saveConfirmedReport calls the validateConfirmedReport module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 * 
	 * saveCallback takes the form function(err, valid object, Confirmed Report object)
	 */
	me.create = function(data, saveCallback) {
		me.validateConfirmedReport(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Confirmed Report");
				
				var newConfirmedReport = new models.confirmedReport(data);
				newConfirmedReport.createdDate = new Date();
				newConfirmedReport.updatedDate = new Date();
				newConfirmedReport.save(function(err){
					if (err){
						logger.error('Error saving Confirmed Report ', err);
					} else {
						//actionEmitter.saveConfirmedReportEvent(newConfirmedReport);
					}

					saveCallback(err, valid, newConfirmedReport);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};
	
	/**
	 * validateConfirmedReport validates an Confirmed Report object against the Confirmed Report
	 * semantic rules and the business rules associated with an Confirmed Report
	 *
	 * validateConfirmedReport calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the Confirmed Report object

	 * data is the object being validated
	 * 
	 * valCallback takes the form function(valid structure)
	 */
	me.validateConfirmedReport = function(data, valCallback) {
		// is the JSON semantically valid for the Confirmed Report object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Confirmed Report object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}
	};
	
	/**
	 * Returns the Confirmed Report object with id specified in URL
	 */
	me.get = function(id, callback){
		me.findWhere({_id: id}, callback);
	};

	/**
	 * generic read method to return all documents that have a matching
	 * set of key, value pairs specified by config
	 * 
	 * callback takes the form function(err, docs)
	 */
	me.findWhere = function(config, callback){
		models.confirmedReport.find(config, callback);
	};
	
	/**
	 * update calls validateConfirmedReport then updates the object
	 *
	 * callback takes the form function(err, valid object, Confirmed Report object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.info("Error getting Confirmed Report "+err);
				updCallback(err, null, data);
			} else if (docs) {
				docs = docs[0]; //There will only be one Confirmed Report from the get
				for (var e in data) {
					if (e !== '_id') {
						docs[e] = data[e];
					}
				}
				
				docs.updatedDate = new Date();
				me.validateConfirmedReport(docs, function(valid) {
					if (valid.valid) {
						docs.save(function(err) {
							if (err) {
								updCallback(err, valid, data);
							} else {
								updCallback(err, valid, docs);
							}
						});
					} else {
						valid.valid = false;
						valid.errors = {expected: id, message: "Updated Confirmed Report information not valid"};
						updCallback(err, valid, data);
					}
				});
			} else {
				var errorMSG = new Error("Could not find Confirmed Report to update");
				updCallback(errorMSG, null, data);
			}
		});
	};
	
	me.del = function(config, callback){
		models.confirmedReport.remove(config, callback);
	};
};