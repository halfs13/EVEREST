/*global require */
// require is a global node function/keyword

this.load = function(app, io, gcm, logger){
	require('./rest/alpha_report.js').load(app, io, gcm, logger);
	require('./rest/assertion.js').load(app, io, gcm, logger);
	require('./rest/confirmed_report.js').load(app, io, gcm, logger);
	require('./rest/comment.js').load(app, io, gcm, logger);
	require('./rest/event.js').load(app, io, gcm, logger);
	require('./rest/incident.js').load(app, io, gcm, logger);
	require('./rest/location.js').load(app, io, gcm, logger);
	require('./rest/nlp_parser_service.js').load(app, io, gcm, logger);
	require('./rest/options.js').load(app, io, gcm, logger);
	require('./rest/raw_feed.js').load(app, io, gcm, logger);
	require('./rest/reporter.js').load(app, io, gcm, logger);
	require('./rest/twitter_ingest_service.js').load(app, io, gcm, logger);
	
	
	app.get('/', function(req, res){
		res.redirect('/events');
	});
};