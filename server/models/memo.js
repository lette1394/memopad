import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const Memo = new Schema({
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

export default mongoose.model('memo', Memo);

