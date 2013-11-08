var AssertionService = require('../database/assertion.js');
var responseHandler = require('../general_response');
var histogramDataModule = require('../modules/histogramDataModule.js');

module.exports = function(app, models, io, logger) {
	var assertionService = new AssertionService(models, io, logger);
<<<<<<< Updated upstream

	app.get('/assertion/?', function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Request for Assertion list");
=======
	var assertionHistogram = new histogramDataModule(models.assertion);
	//list - lists full object
	app.get('/assertion/?', function(req,res){
		if(logger.DO_LOG){
			logger.info("Request for assertion list");
>>>>>>> Stashed changes
		}
		
		assertionService.list(req.query, function(err, docs, config) {
			if (err) {
				logger.error("Error listing Assertions " + err);
				responseHandler.send500(res, "Error listing Assertions");
			} else {
				assertionService.getTotalCount(config, function(err, count) {
					if (err) {
						logger.error("Assertion: " + err, err);
						responseHandler.send500(res, "Error getting count of Assertions");
					} else {
						res.jsonp({docs: docs, total_count: count});
						res.end();
					}
				});
			}
		});
	});

	app.get('/assertion/indexes', function(req, res) {
		if (logger.DO_LOG) {
			logger.info('Request for list of indexes for Assertion');
		}
		
		assertionService.getIndexes(function(indexes) {
			if (!indexes) {
				responseHandler.send500(res, 'Error getting indexes of Assertions');
			} else {
				res.jsonp(indexes);
				res.end();
			}
		});
	});

<<<<<<< Updated upstream
	app.get('/assertion/dates', function(req, res) {
		if (logger.DO_LOG) { 
			logger.info('Request for list of dates for Assertion');
=======
	app.get('/assertion/dates/?', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for list of dates');
>>>>>>> Stashed changes
		}
		
		assertionService.findDates(function(dates) {
			if (!dates){
				responseHandler.send500(res, "Error getting dates of Assertions");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});

	//A mode and base date are passed in, the will return the dates that fall within that mode,
	//given the basedate.
	app.get('/assertion/dates/:mode/:date/?', function(req, res){
		if(logger.DO_LOG){ 
			logger.info('Request for list of dates');
		}
		assertionHistogram.findDatesByFrequency(req.params.mode, req.params.date, function(dates){
			if (!dates){
				responseHandler.send500(res, "Error getting dates of raw feeds");
			} else {
				res.jsonp(dates);
				res.end();
			}
		});
	});
	
	/**
	 * Create a new Assertion
	 */
	app.post('/assertion/?', function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Receiving new Assertion ", req.body);
		}

		assertionService.create(req.body, function(err, val, newAssertion) {
			if (err) {
				logger.error('Error saving Assertion', err);
				responseHandler.send500(res, 'Error saving Assertion');
			} else if (!val.valid) {
				logger.info('Invalid Assertion ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid Assertion');
			} else {
				logger.info('Assertion saved ' + JSON.stringify(newAssertion));
				res.json({id: newAssertion._id});
				res.end();
			}
		});
	});

	/**
	 * Review Assertion by id
	 */
	app.get('/assertion/:id([0-9a-f]+)', function(req,res) {
		if (logger.DO_LOG) {
			logger.info("Request for Assertion " + req.params.id);
		}
		
		assertionService.get(req.params.id, function(err, docs) {
			if (err) {
				logger.error('Error getting Assertion ', err);
				responseHandler.send500(res, 'Error getting Assertion');
			} else if (docs[0]) {
				res.json(docs[0]);
				res.end();
			} else {
				responseHandler.send404(res);
			}
		});
	});
	
	/**
	 * Update Assertion by id
	 */
	app.post('/assertion/:id([0-9a-f]+)', function(req, res) {
		if (logger.DO_LOG) {
			logger.info("Update Assertion " + req.params.id);
		}
		
		assertionService.update(req.params.id, req.body, function(err, val, updated) {
			if (err) {
				logger.error('Error updating Assertion ', err);
				responseHandler.send500(res, 'Error updating Assertion');
			} else if (!val.valid) {
				logger.info('Invalid Assertion ' + JSON.stringify(val.errors));
				responseHandler.send500(res, 'Invalid Assertion');
			} else {
				logger.info('Assertion updated ' + JSON.stringify(updated));
				res.jsonp({id:updated._id});
				res.end();
			}
		});
	});
	
	/**
	 * Delete a single Assertion with specified id
	 */
	app.del('/assertion/:id([0-9a-f]+)', function(req, res) {
		if (logger.DO_LOG) {
			logger.info('Deleting Assertion with id: ' + req.params.id);
		}
		
		assertionService.del({_id: req.params.id}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
	
	/**
	 * Delete all Assertions
	 */
	app.del('/assertion/', function(req, res){
		if (logger.DO_LOG) {
			logger.info('Deleting all Assertions');
		}
		
		assertionService.del({}, function(err, count) {
			res.json({deleted_count: count});
			res.end();
		});
	});
};
