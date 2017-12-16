import express from 'express';
import Memo from '../models/memo';
import mongoose from 'mongoose';

const router = express.Router();
let multer = require('multer');
let path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img');
    },
    filename: function (req, file, cb) {
        cb(null, 'img_' + Date.now() + path.extname(file.originalname));
    }
});

/*
    WRITE MEMO: POST /api/memo
    BODY SAMPLE: { contents: "sample "}
    ERROR CODES
        1: NOT LOGGED IN
        2: EMPTY CONTENTS
*/

router.post('/', multer({storage: storage}).single('file'), (req, res) => {
    // CHECK LOGIN STATUS
    if (typeof req.session.loginInfo === 'undefined') {
        return res.status(403).json({
            error: "NOT LOGGED IN",
            code: 1
        });
    }

    // CHECK CONTENTS VALID
    if (typeof req.body.contents !== 'string') {
        return res.status(400).json({
            error: "EMPTY CONTENTS",
            code: 2
        });
    }

    if (req.body.contents === "") {
        return res.status(400).json({
            error: "UNSUPPORT FILE EXT",
            code: 3
        });
    }
    if (path.extname(req.file.filename) !== ".jpg"
        && path.extname(req.file.filename) !== ".png"
        && path.extname(req.file.filename) !== ".jpeg") {
        return res.status(400).json({
            error: "NOT A IMAGE FILE",
            code: 2
        });
    }

    // CREATE NEW MEMO
    let memo = new Memo({
        writer: req.session.loginInfo.username,
        nickname: req.session.loginInfo.nickname,
        postedBy: req.session.loginInfo._id,
        contents: req.body.contents,
        image: req.file.filename
    });

    // SAVE IN DATABASE
    memo.save(err => {
        if (err) {
            throw err;
        } else {
            return res.json({success: true});
        }
    });
});

/*
    MODIFY MEMO: PUT /api/memo/:id
    BODY SAMPLE: { contents: "sample "}
    ERROR CODES
        1: INVALID ID,
        2: EMPTY CONTENTS
        3: NOT LOGGED IN
        4: NO RESOURCE
        5: PERMISSION FAILURE
*/
router.put('/:id', (req, res) => {

    // CHECK MEMO ID VALIDITY
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: "INVALID ID",
            code: 1
        });
    }

    // CHECK CONTENTS VALID
    if (typeof req.body.contents !== 'string') {
        return res.status(400).json({
            error: "EMPTY CONTENTS",
            code: 2
        });
    }

    if (req.body.contents === "") {
        return res.status(400).json({
            error: "EMPTY CONTENTS",
            code: 2
        });
    }

    // CHECK LOGIN STATUS
    if (typeof req.session.loginInfo === 'undefined') {
        return res.status(403).json({
            error: "NOT LOGGED IN",
            code: 3
        });
    }

    // FIND MEMO
    Memo.findById(req.params.id, (err, memo) => {
        if (err) throw err;

        // IF MEMO DOES NOT EXIST
        if (!memo) {
            return res.status(404).json({
                error: "NO RESOURCE",
                code: 4
            });
        }

        // IF EXISTS, CHECK WRITER
        if (memo.writer !== req.session.loginInfo.username) {
            return res.status(403).json({
                error: "PERMISSION FAILURE",
                code: 5
            });
        }

        // MODIFY AND SAVE IN DATABASE
        memo.contents = req.body.contents;
        memo.date.edited = new Date();
        memo.is_edited = true;

        memo.save((err, memo) => {
            if (err) throw err;

            Memo.findOne({_id: memo._id})
                .populate('postedBy', 'username nickname created')
                .populate('comments.postedBy', 'username nickname created')
                .exec((err, memo) => {
                    if (err) throw err;
                    return res.json({
                        success: true,
                        memo
                    });
                })
        });

    });
});

/*
    DELETE MEMO: DELETE /api/memo/:id
    ERROR CODES
        1: INVALID ID
        2: NOT LOGGED IN
        3: NO RESOURCE
        4: PERMISSION FAILURE
*/
router.delete('/:id', (req, res) => {

    // CHECK MEMO ID VALIDITY
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: "INVALID ID",
            code: 1
        });
    }

    // CHECK LOGIN STATUS
    if (typeof req.session.loginInfo === 'undefined') {
        return res.status(403).json({
            error: "NOT LOGGED IN",
            code: 2
        });
    }

    // FIND MEMO AND CHECK FOR WRITER
    Memo.findById(req.params.id, (err, memo) => {
        if (err) throw err;

        if (!memo) {
            return res.status(404).json({
                error: "NO RESOURCE",
                code: 3
            });
        }
        if (memo.writer != req.session.loginInfo.username) {
            return res.status(403).json({
                error: "PERMISSION FAILURE",
                code: 4
            });
        }

        // REMOVE THE MEMO
        Memo.remove({_id: req.params.id}, err => {
            if (err) throw err;
            res.json({success: true});
        });
    });

});

/*
    READ MEMO: GET /api/memo
*/
router.get('/', (req, res) => {
    Memo.find()
        .sort({"_id": -1})
        .limit(6)
        .populate('postedBy', 'username nickname created')
        .populate('comments.postedBy', 'username nickname created')
        .exec((err, memos) => {
            if (err) throw err;

            res.json(memos);
        });
});

/*
    READ ADDITIONAL (OLD/NEW) MEMO: GET /api/memo/:listType/:id
*/
router.get('/:listType/:id', (req, res) => {
    let listType = req.params.listType;
    let id = req.params.id;

    // CHECK LIST TYPE VALIDITY
    if (listType !== 'old' && listType !== 'new') {
        return res.status(400).json({
            error: "INVALID LISTTYPE",
            code: 1
        });
    }

    // CHECK MEMO ID VALIDITY
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "INVALID ID",
            code: 2
        });
    }

    let objId = new mongoose.Types.ObjectId(req.params.id);

    if (listType === 'new') {
        // GET NEWER MEMO
        Memo.find({_id: {$gt: objId}})
            .sort({_id: -1})
            .limit(6)
            .populate('postedBy', 'username nickname created')
            .populate('comments.postedBy', 'username nickname created')
            .exec((err, memos) => {
                if (err) throw err;
                return res.json(memos);
            });
    } else {
        // GET OLDER MEMO
        Memo.find({_id: {$lt: objId}})
            .sort({_id: -1})
            .limit(6)
            .populate('postedBy', 'username nickname created')
            .populate('comments.postedBy', 'username nickname created')
            .exec((err, memos) => {
                if (err) throw err;
                return res.json(memos);
            });
    }
});


/*
    TOGGLES STAR OF MEMO: POST /api/memo/star/:id
    ERROR CODES
        1: INVALID ID
        2: NOT LOGGED IN
        3: NO RESOURCE
*/
router.post('/star/:id', (req, res) => {
    // CHECK MEMO ID VALIDITY
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: "INVALID ID",
            code: 1
        });
    }

    // CHECK LOGIN STATUS
    if (typeof req.session.loginInfo === 'undefined') {
        return res.status(403).json({
            error: "NOT LOGGED IN",
            code: 2
        });
    }

    // FIND MEMO
    Memo.findById(req.params.id, (err, memo) => {
        if (err) throw err;

        // MEMO DOES NOT EXIST
        if (!memo) {
            return res.status(404).json({
                error: "NO RESOURCE",
                code: 3
            });
        }

        // GET INDEX OF USERNAME IN THE ARRAY
        let index = memo.starred.indexOf(req.session.loginInfo.username);

        // CHECK WHETHER THE USER ALREADY HAS GIVEN A STAR
        let hasStarred = (index === -1) ? false : true;

        if (!hasStarred) {
            // IF IT DOES NOT EXIST
            memo.starred.push(req.session.loginInfo.username);
        } else {
            // ALREADY starred
            memo.starred.splice(index, 1);
        }

        // SAVE THE MEMO
        memo.save((err, memo) => {
            if (err) throw err;

            Memo.findOne({_id: memo._id})
                .populate('postedBy', 'username nickname created')
                .populate('comments.postedBy', 'username nickname created')
                .exec((err, memo) => {
                    if (err) throw err;
                    res.json({
                        success: true,
                        'has_starred': !hasStarred,
                        memo
                    });
                });
        });
    });
});

/*
    READ MEMO OF A USER: GET /api/memo/:username
*/
router.get('/:username', (req, res) => {
    Memo.find({writer: req.params.username})
        .sort({"_id": -1})
        .limit(6)
        .populate('postedBy', 'username nickname created')
        .populate('comments.postedBy', 'username nickname created')
        .exec((err, memos) => {
            if (err) throw err;
            res.json(memos);
        });
});


/*
    READ ADDITIONAL (OLD/NEW) MEMO OF A USER: GET /api/memo/:username/:listType/:id
*/
router.get('/:username/:listType/:id', (req, res) => {
    let listType = req.params.listType;
    let id = req.params.id;

    // CHECK LIST TYPE VALIDITY
    if (listType !== 'old' && listType !== 'new') {
        return res.status(400).json({
            error: "INVALID LISTTYPE",
            code: 1
        });
    }

    // CHECK MEMO ID VALIDITY
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "INVALID ID",
            code: 2
        });
    }

    let objId = new mongoose.Types.ObjectId(req.params.id);

    if (listType === 'new') {
        // GET NEWER MEMO
        Memo.find({writer: req.params.username, _id: {$gt: objId}})
            .sort({_id: -1})
            .limit(6)
            .populate('postedBy', 'username nickname created')
            .populate('comments.postedBy', 'username nickname created')
            .exec((err, memos) => {
                if (err) throw err;
                return res.json(memos);
            });
    } else {
        // GET OLDER MEMO
        Memo.find({writer: req.params.username, _id: {$lt: objId}})
            .sort({_id: -1})
            .limit(6)
            .populate('postedBy', 'username nickname created')
            .populate('comments.postedBy', 'username nickname created')
            .exec((err, memos) => {
                if (err) throw err;
                return res.json(memos);
            });
    }
});

router.post('/comment/:id', (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: "INVALID ID",
            code: 1
        });
    }

    // CHECK LOGIN STATUS
    if (typeof req.session.loginInfo === 'undefined') {
        return res.status(403).json({
            error: "NOT LOGGED IN",
            code: 2
        });
    }

    Memo.findById(req.params.id, (err, memo) => {
        if (err) throw err;

        // MEMO DOES NOT EXIST
        if (!memo) {
            return res.status(404).json({
                error: "NO RESOURCE",
                code: 3
            });
        }

        let newComment = {
            postedBy: req.session.loginInfo._id,
            text: req.body.comment,
            starred: []
        };

        memo.comments.push(newComment);

        // SAVE THE MEMO
        memo.save((err, memo) => {
            if (err) throw err;

            Memo.findOne({_id: memo._id})
                .populate('postedBy', 'username nickname created')
                .populate('comments.postedBy', 'username nickname created')
                .exec((err, memo) => {
                    if (err) throw err;
                    res.json({
                        success: true,
                        memo
                    });
                });
        });
    });
});


router.post('/comment/remove/:id', (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: "INVALID ID",
            code: 1
        });
    }

    // CHECK LOGIN STATUS
    if (typeof req.session.loginInfo === 'undefined') {
        return res.status(403).json({
            error: "NOT LOGGED IN",
            code: 2
        });
    }

    Memo.findById(req.params.id, (err, memo) => {
        if (err) throw err;

        // MEMO DOES NOT EXIST
        if (!memo) {
            return res.status(404).json({
                error: "NO RESOURCE",
                code: 3
            });
        }
        memo.comments.splice(req.body.index, 1);

        // SAVE THE MEMO
        memo.save((err, memo) => {
            if (err) throw err;

            Memo.findOne({_id: memo._id})
                .populate('postedBy', 'username nickname created')
                .populate('comments.postedBy', 'username nickname created')
                .exec((err, memo) => {
                    if (err) throw err;
                    res.json({
                        success: true,
                        memo
                    });
                });
        });
    });
});

export default router;
