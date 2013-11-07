var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var confirmedReportModel = {
	created_date: {type: Date, "default": Date.now},
	updated_date: {type: Date, "default": Date.now},
	alpha_report_id: {type: ObjectId, required: true},
	target_event_id: {type: ObjectId},
	target_event_percentage: {type: Number, "default": 1.0},
	profile_id: {type: ObjectId},
	confirmed_date: {type: Date},
	assertions: [{type: ObjectId}]
};


var ConfirmedReportSchema = new Schema(confirmedReportModel);
var confirmedReport = mongoose.model('ConfirmedReport', ConfirmedReportSchema);

var confirmedReportValidation = {
	properties: {
		created_date: {
			description: 'Date this reporter was created in datastore',
			type: 'object',
			"default": 'Date.now'
		},
		updated_date: {
			description: 'Date this reporter was updated in datastore',
			type: 'object',
			"default": 'Date.now'
		},
		alpha_report_id: {
			description: 'alpha_report from which this confirmed report was derived',
			type: 'string',
			required: true
		},
		target_event_id: {
			description: 'target_event that was considered a match',
			type: 'string'
		},
		target_event_percentage: {
			description: 'percentage match to target event (value between 0.0 and 1. 0)',
			type: 'number',
			"default": 1.0,
			minimum: 0,
			maximum: 1.0,
			messages: {
				minimum: 'Expected number to be >= 0',
				maximum: 'Expected number to be <= 1.0'
			}
		},
		profile_id: {
			description: 'person confirming the report',
			type: 'string'
		},
		confirmed_date: {
			description: 'date the report was confirmed (or re-confirmed)',
			type: 'date'
		},
		assertions: {
			description: '_id list of the assertions that were used as basis for this confirmed_report',
			type: 'objectId'
		}
	}
};

exports.confirmedReport = confirmedReport;
exports.confirmedReportValidation = confirmedReportValidation;