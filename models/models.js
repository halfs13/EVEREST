/*global require*/
// require is a node.js keyword, not a part of standard JavaScript

//alpha report
var alphaReportModel = require('./alpha_report/model.js');
exports.alphaReport = alphaReportModel.alphaReport;
exports.alphaReportValidation = alphaReportModel.alphaReportValidation;

//assertion
var assertionModel = require('./assertion/model.js');
exports.assertion = assertionModel.assertion;
exports.assertionValidation = assertionModel.assertionValidation;

//assertion
var atomRssModel = require('./atom_rss/model.js');
exports.atomRss = atomRssModel.atomRss;

//comment
var commentModel = require('./comment/model.js');
exports.comment = commentModel.comment;
exports.commentValidatoin = commentModel.commentValidatoin;

//confirmed report
var confirmedReportModel = require('./confirmed_report/model.js');
exports.confirmedReport = confirmedReportModel.confirmedReport;
exports.confirmedReportValidation = confirmedReportModel.confirmedReportValidation;

//event
var eventModel = require('./event/model.js');
exports.event = eventModel.event;
exports.eventValidation = eventModel.eventValidation;

//incident
var incidentModel = require('./incident/model.js');
exports.incident = incidentModel.incident;
exports.incidentValidation = incidentModel.incidentValidation;

//location
var locationModel = require('./location/model.js');
exports.location = locationModel.location;
exports.locationValidation = locationModel.locationValidation;

//profile
var profileModel = require('./profile/model.js');
exports.profile = profileModel.profile;
exports.profileValidation = profileModel.profileValidation;

//raw feed
var rawFeedModel = require('./raw_feed/model.js');
exports.rawFeed = rawFeedModel.rawFeed;
exports.rawFeedValidation = rawFeedModel.rawFeedValidation;

//reporter
var reporterModel = require('./reporter/model.js');
exports.reporter = reporterModel.reporter;
exports.reporterValidation = reporterModel.reporterValidation;

//target_assertion
var targetAssertionModel = require('./target_assertion/model.js');
exports.targetAssertion = targetAssertionModel.targetAssertion;
exports.targetAssertionValidation = targetAssertionModel.targetAssertionValidation;

//target_event
var targetEventModel = require('./target_event/model.js');
exports.targetEvent = targetEventModel.targetEvent;
exports.targetEventValidation = targetEventModel.targetEventValidation;

var twitterKeyModel = require('./twitter_key/model.js');
exports.twitterKey = twitterKeyModel.twitterKey;

var patientModel = require('./patient/model.js');
exports.patient = patientModel.patient;

var reminderModel = require('./reminder/model.js');
exports.reminder = reminderModel.reminder;