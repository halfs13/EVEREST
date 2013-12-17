var Bvalidator = require("../../models/alpha_report/bvalidator.js");
var revalidator = require("revalidator");
var RawFeedService = require("./raw_feed");
var actionEmitter = require("../action_emitter.js");
var paramHandler = require("../list_default_handler.js");
var async = require("async");

/**
 * Alpha Report service to perform necessary actions against the database models
 * @class AlphaReportService
 * @param {Object} models The models database models which are available
 * @param {Object} io Socket io listener instance to be used by the application
 * @param {Object} logger Winston logger instance to be used by the appliaction
 */
module.exports = function(models, io, logger) {
	var me = this;
	var validationModel = models.alphaReportValidation;

	var services = {
		alphaReportService: me,
		rawFeedService: new RawFeedService(models, io, logger)
	};

	var bvalidator = new Bvalidator(services, logger);

	/**
     * A callback function to be executed upon completion of the list function.
     * @callback AlphaReportService~listCallback
     * @param err {Object} Error resulting from the list function execution
     * @param result {Object[]} The documents resulting from the list function, limited and sorted based on the list parameters.
     * @param config {Object} The cofigurations which resulted in the returned results; combination of list config parameters
     *		and default configs.
     * @memberof AlphaReportService
     */

	/**
	 * Returns a list of all Alpha Reports
	 * @method list
	 * @param req {Object} Express request query parameters object
	 * @param [req.count] {int} The number of results to return
	 * @param [req.offset] {int} The number of results to skip before returning the count
	 * @param [req.sort] {String} "asc"|"desc" Whether the results should be sorted in ascending or decending order
	 * @param [req.sortKey] {String} The model field to sort on
	 * @param [req.startDate] {(String|Date)} Only results after this date should be returned
	 * @param [req.endDate] {(String|Date)} Only results before this date should be returned
	 * @param [req.date] {(String|Date)} Only results for this date should be returned
	 * @param {AlphaReportService~listCallback} callback Callback function for the list function to call upon completion of execution
	 * @memberof AlphaReportService#
	 */
	me.list = function(req, callback) {
		paramHandler.handleDefaultParams(req, function(params) {
			if (params !== null) {
				var sortObject = {};
				sortObject[params.sortKey] = params.sort;

				var config = {};
				config[params.date] = {
					$gte: params.start,
					$lte: params.end
				};

				models.alphaReport.find(config).skip(params.offset).sort(sortObject).limit(params.count).exec(function(err, res) {
					callback(err, res, config);
				});
			} else {
				models.alphaReport.find({}, function(err, res) {
					callback(err, res, {});
				});
			}
		});
	};

	/**
	 * A callback function to be executed upon completion of the getTags method
	 * @callback AlphaReportService~getTagsCallback
	 * //FIXME what are the params on this callback
	 */

	/**
	 * Get the count of the words in the alpha report message bodies
	 * @method getTags
	 * @param {AlphaReportService~getTagsCallback} callback Callback function to execute
	 * 		upon completion of totaling the word counts.
	 * @memberof AlphaReportService#
	 */
	me.getTags = function(callback) {
		var o = {
			map : function () {
				if (!this.message_body) { return; }
				var words = this.message_body.split(' ');
				for (index in words) {
					emit( words[index], 1);
				}
			},
			reduce: function(k, vals) {
				var count = 0;
				for (index in vals){
					count += vals[index]
				}

				return count;
			},
		};

		models.alphaReport.mapReduce(o, callback);
	};

	/**
	 * A callback function to be executed upon completion of the getIndexes function
	 * @callback AlphaReportService~getIndexesCallback
	 * @param {String[]} indexes The indexes available for the Alpha report domain model
	 * @memberof AlphaReportService
	 */

	/**
	 * Returns a list of indexed attributes for Alpha Report
	 * @method getIndexes
	 * @param {AlphaReportService~getIndexesCallback} callback The callback to be executed after the getIndexes function completes
	 * @memberof AlphaReportService#
	 */
	me.getIndexes = function(callback) {
		var keys = Object.keys(models.alphaReport.schema.paths);
		var indexes = ["_id"];
		for (var i = 0; i < keys.length; i++) {
			if (models.alphaReport.schema.paths[keys[i]]._index) {
				indexes.push(keys[i].toString());
			}
		}

		callback(indexes);
	};


	/**
	 * Callback to be executed upon completion of getDataTypes method
	 * @callback AlphaReportService~getDateTypesCallback
	 * //FIXME what are the params
	 */

	/**
	* Returns a list of date attributes for Alpha Report
	* @method getDateTypes
	* @param {AlphaReportService~getDateTypesCallback}
	* @memberof AlphaReportService#
	*/
	me.getDateTypes = function(callback) {
		var keys = Object.keys(models.alphaReport.schema.paths);
		var dateTypes = [];
		for (var i = 0; i < keys.length; i++) {
			if (models.alphaReport.schema.tree[keys[i]].type === Date) {
				dateTypes.push(keys[i].toString());
			}
		}

		callback(dateTypes);
	};

	/**
	 *	Returns a sorted list containing _id and createdDate for all Alpha Reports
	 */
	me.findDates = function(callback) {
		models.alphaReport.find({}, {_id: 0, createdDate:1}, function(err, dates) {
			var errorMsg = new Error("Could not get Alpha Report Dates: " + err);
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

	/**
	 *	Returns the Date version of parameter string.createdDate
	 */
	me.flattenArray = function (string, callback) {
		callback(null, Date.parse(string.createdDate));
	};

	/**
	 *	Returns the number of Alpha Reports that fit the specified config
	 */
	me.getTotalCount = function(config, callback) {
		models.alphaReport.count(config, callback);
	};

	/**
	 * Returns only the fields specified in field_string for each Alpha Report
	 */
	me.listFields = function(params, field_string, callback) {
		models.alphaReport.find(params, field_string, callback);
	};

	/**
	 * create is a "generic" save method callable from both
	 * request-response methods and parser-type methods for population
	 * of Alpha Report data
	 *
	 * create calls the validateAlphaReport module to ensure that the
	 * data being saved to the database is complete and has integrity.
	 *
	 * saveCallback takes the form function(err, valid object, Alpha Report object)
	 */
	me.create = function(data, saveCallback) {
		me.validateAlphaReport(data, function(valid) {
			if (valid.valid) {
				logger.info("Valid Alpha Report");

				var newAlphaReport = new models.alphaReport(data);
				newAlphaReport.save(function(err) {
					if (err) {
						logger.error("Error saving Alpha Report ", err);
					} else {
						actionEmitter.saveAlphaReportEvent(newAlphaReport);
					}

					saveCallback(err, valid, newAlphaReport);
				});
			} else {
				saveCallback(undefined, valid, data);
			}
		});
	};

	/**
	 * validateAlphaReport validates an Alpha Report object against the Alpha Report
	 * semantic rules and the business rules associated with an AlphaReport
	 *
	 * validateAlphaReport calls the JSON validation module revalidator and
	 * calls the business validation module bvalidator for the AlphaReport object

	 * data is the object being validated
	 *
	 * valCallback takes the form function(valid structure)
	 */
	me.validateAlphaReport = function(data, valCallback) {
		// is the JSON semantically valid for the Alpha Report object?
		var valid = revalidator.validate(data, validationModel);
		if (valid.valid) {
			// does the Alpha Report object comply with business validation logic
			bvalidator.validate(data, function(valid) {
				valCallback(valid);
			});
		} else {
			valCallback(valid);
		}
	};

	/**
	 * Returns the Alpha Report object with the specified id
	 */
	me.get = function(id, callback) {
		me.findWhere({_id: id}, callback);
	};

	/**
	 * generic read method to return all documents that have a matching
	 * set of key, value pairs specified by config
	 *
	 * callback takes the form function(err, docs)
	 */
	me.findWhere = function(config, callback) {
		models.alphaReport.find(config, callback);
	};

	/**
	 * update gets the Alpha Report by the specified id then calls validateAlphaReport
	 *
	 * callback takes the form function(err, valid object, Alpha Report object)
	 */
	me.update = function(id, data, updCallback) {
		me.get(id, function(err, docs) {
			if (err) {
				logger.error("Error getting Alpha Report", err);
				updCallback(err, null, data);
			} else if (docs[0]) {
				docs = docs[0]; //There will only be one Alpha Report from the get
				for (var e in data) {
					if (e !== "_id") {
						docs[e] = data[e];
					}
				}

				docs.updatedDate = new Date();
				me.validateAlphaReport(docs, function(valid) {
					if (valid.valid) {
						docs.save(function(err) {
							if (err) {
								updCallback(err, valid, data);
							} else {
								updCallback(err, valid, docs);
							}
						});
					} else {
						//valid.valid = false;
						//valid.errors = {expected: id, message: "Updated Alpha Report information not valid"};
						updCallback(err, valid, data);
					}
				});
			} else {
				var errorMSG = new Error("Could not find Alpha Report to update");
				updCallback(errorMSG, null, data);
			}
		});
	};

	/**
	 * Remove all Alpha Reports that match the parameter config
	 */
	me.del = function(config, callback) {
		models.alphaReport.remove(config, callback);
	};
};