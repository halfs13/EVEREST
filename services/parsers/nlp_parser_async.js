var java = require('java');
var async = require('async');
var actionEmitter = require('../action_emitter.js');

module.exports = function(models, io, logger) {
	var me = this;

	//java.classpath.push('./java_lib/Triplet_Extraction.jar');
	
	var Parser = java.import('com.nextcentury.TripletExtraction.CoreNlpParser');
	var parser = new Parser();
	
	var PosTagger = java.import('com.nextcentury.TripletExtraction.CoreNlpPOSTagger');
	var posTagger = new PosTagger();

	var ArrayList = java.import('java.util.ArrayList');
	var Triplet = java.import('com.nextcentury.TripletExtraction.Triplet');

	//var assertion_service = services.assertionService;
	
	/*me.parseAndSave = function(alpha_report_object){
		logger.info('Attempting to parse alpha_report_object with id ' + alpha_report_object._id);		
		var assertion_object = {};
		if(alpha_report_object.message_body){
			parser.parseAndRemovePeriods(alpha_report_object.message_body, function(err, tree) {
				async.forEach(tree, function(leaf, callback) {
					extractor.extractTriplet(leaf, function (err, output) {
						if(err) {
							logger.error("Error occurred while extracting triplets", err);
							callback(err, output);
						} else if(output) {
							if(alpha_report_object._id) {
								assertion_object.alpha_report_id = alpha_report_object._id.toString();
							}
							if(alpha_report_object.reporter_id) {
								assertion_object.reporter_id = alpha_report_object.reporter_id.toString();
							}
							assertion_object.entity1 = output.getEntity1StringSync().toString();
							assertion_object.relationship = output.getRelationStringSync().toString();
							assertion_object.entity2 = output.getEntity2StringSync().toString();
							assertion_service.saveAssertion(assertion_object, callback);
						} else {
							logger.error("No Triplet was able to be extracted", err);
							callback(err, output);
						}
					});
				});
			});
		} else {
			var errorMsg = new Error("Alpha Report Not valid");
			logger.error(errorMsg);
		}
	};*/
	me.parseAndSave = function(alpha_report_object) {
		logger.info('Attempting to parse alpha_report_object with id ' + alpha_report_object._id);
		if(alpha_report_object.message_body) {
			
			parser.parseText(alpha_report_object.message_body, function(err, results) {
				var tuples = results.toArraySync();

				if(err) {
					logger.error("An error occurred while extracting triplets", err);
				}
				if(tuples.length === 0) {
					logger.error("No triplets were able to be extracted", err);
				} else {
					if(!Array.isArray(tuples)) {
						logger.debug("Converting tuple result to array for handling");
						tuples = [results];
					}
					
					async.each(tuples, function(tuple, callback) {
						var assertion_object = {};

						if(alpha_report_object._id) {
								assertion_object.alpha_report_id = alpha_report_object._id.toString();
						}
						if(alpha_report_object.reporter_id) {
							assertion_object.reporter_id = alpha_report_object.reporter_id.toString();
						}



						assertion_object.entity1 = tuple.getEntity1StringSync().toString();
						assertion_object.relationship = tuple.getRelationStringSync().toString();
						assertion_object.entity2 = tuple.getEntity2StringSync().toString();
						
						console.log("calling the built");

						actionEmitter.assertionBuiltEvent(assertion_object, callback);
					});
				}
			});
		}
	};

	/**
	 * callback signature  function(tuple object(s))
	 */
	me.parseToTuples = function(textData, callback) {

		parser.parseText(textData, function(err, results) {
			var tuples = results;
			if(err) {
				logger.error("An error occurred while extracting triplets", err);
			}
			if(tuples.length === 0) {
				logger.error("No triplets were able to be extracted", err);
				callback(err, tuples);
			} else {
				callback(null, tuples);
			}
		});
	};

	me.posTagSentences = function(sentence, callback) {
		posTagger.getTaggedSentencesString(sentence, callback);
	};

	me.parseToAnnotationGraphs = function(sentence, callback) {
		parser.getTextAnnotatedTree(sentence, callback);
	};

	me.parseToDependencyGraphs = function(sentence, callback) {
		parser.getTextDependencyTree(sentence, callback);
	};

	me.parseRootChildData = function(sentence, callback) {
		parser.getRootChildrenAsString(sentence, callback);
	};

	me.parseToDotProductGraph = function(sentence, callback) {
		parser.getDotNotation(sentence, callback);
	};

	me.parseToEdgeVertex = function(sentence, callback) {
		parser.getEdgeVertexNotationAsString(sentence, callback);
	};
};
