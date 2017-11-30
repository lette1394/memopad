'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Memo = new Schema({
	writer: String,
	nickname: String,
	postedBy: {
		type: Schema.Types.ObjectId,
		ref: 'account'
	},
	contents: String,
	starred: [String],
	date: {
		created: { type: Date, default: Date.now },
		edited: { type: Date, default: Date.now }
	},
	is_edited: { type: Boolean, default: false },
	comments: [{
		text: String,
		starred: [String],
		postedBy: {
			type: Schema.Types.ObjectId,
			ref: 'account'
		}
	}]
});

exports.default = _mongoose2.default.model('memo', Memo);