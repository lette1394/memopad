'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _util = require('util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

/*
    ACCOUNT SIGNUP: POST /api/account/signup
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: BAD USERNAME
        2: BAD PASSWORD
				3: USERNAME EXISTS
				4: NICKNAME EXISTS
*/
router.post('/signup', function (req, res) {
	// CHECK USERNAME FORMAT
	var usernameRegex = /^[A-Za-z0-9]+$/;
	var nicknameRegex = /^[가-힣A-Za-z0-9_]+$/;

	if (!usernameRegex.test(req.body.username)) {
		return res.status(400).json({
			error: "BAD USERNAME",
			code: 1
		});
	}

	if (!nicknameRegex.test(req.body.username)) {
		return res.status(400).json({
			error: "BAD NICKNAME",
			code: 5
		});
	}

	// CHECK PASS LENGTH
	if (req.body.password.length < 4 || typeof req.body.password !== "string") {
		return res.status(400).json({
			error: "BAD PASSWORD",
			code: 2
		});
	}

	// CHECK USER EXISTANCE
	_account2.default.findOne({ username: req.body.username }, function (err, exists) {
		if (err) throw err;
		if (exists) {
			return res.status(409).json({
				error: "USERNAME EXISTS",
				code: 3
			});
		}

		_account2.default.findOne({ nickname: req.body.nickname }, function (err, exists) {
			if (err) throw err;
			if (exists) {
				return res.status(409).json({
					error: "NICKNAME EXISTS",
					code: 4
				});
			}

			// CREATE ACCOUNT
			var account = new _account2.default({
				username: req.body.username,
				password: req.body.password,
				nickname: req.body.nickname
			});

			account.password = account.generateHash(account.password);

			// SAVE IN THE DATABASE
			account.save(function (err) {
				if (err) throw err;
				return res.json({ success: true });
			});
		});
	});
});

/*
    ACCOUNT SIGNIN: POST /api/account/signin
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: LOGIN FAILED
*/
router.post('/signin', function (req, res) {

	if (typeof req.body.password !== "string") {
		return res.status(401).json({
			error: "LOGIN FAILED",
			code: 1
		});
	}

	// FIND THE USER BY USERNAME
	_account2.default.findOne({ username: req.body.username }, function (err, account) {
		if (err) throw err;

		// CHECK ACCOUNT EXISTANCY
		if (!account) {
			return res.status(401).json({
				error: "LOGIN FAILED",
				code: 1
			});
		}

		// CHECK WHETHER THE PASSWORD IS VALID
		if (!account.validateHash(req.body.password)) {
			return res.status(401).json({
				error: "LOGIN FAILED",
				code: 1
			});
		}

		// ALTER SESSION
		var session = req.session;
		session.loginInfo = {
			_id: account._id,
			username: account.username,
			nickname: account.nickname
		};

		// RETURN SUCCESS
		return res.json({
			success: true,
			info: req.session.loginInfo
		});
	});
});

/*
    GET CURRENT USER INFO GET /api/account/getInfo
*/
router.get('/getinfo', function (req, res) {
	if (typeof req.session.loginInfo === "undefined") {
		return res.status(401).json({
			error: 1
		});
	}

	res.json({ info: req.session.loginInfo });
});

/*
    LOGOUT: POST /api/account/logout
*/
router.post('/logout', function (req, res) {
	req.session.destroy(function (err) {
		if (err) throw err;
	});
	return res.json({ sucess: true });
});

/*
    SEARCH USER: GET /api/account/search/:username
*/
router.get('/search/:nickname', function (req, res) {
	// SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
	var re = new RegExp('^' + req.params.nickname);
	_account2.default.find({ nickname: { $regex: re } }, { _id: false, username: true, nickname: true }).limit(5).sort({ nickname: 1 }).exec(function (err, accounts) {
		if (err) throw err;
		res.json(accounts);
	});
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/search', function (req, res) {
	res.json([]);
});

//MODIFY accounts: PUT /api/account/modify
router.put('/modify/:username', function (req, res) {
	_account2.default.findOne({ username: req.params.username }, function (err, change) {
		if (err) return res.status(500).json({ error: 'db fail' });
		if (!change) return res.status(404).json({ erorr: 'account not found' });

		var tempStatus = { success: true };

		//CHECK PASS
		var checkPass = function checkPass(callback) {
			var isError = false;

			if (req.body.password) {
				// CHECK PASS LENGTH
				if (req.body.password.length < 4 || typeof req.body.password !== "string") {
					isError = true;
					tempStatus = {
						error: "BAD PASSWORD",
						code: 2
					};
					res.status(500);
				}
				change.password = change.generateHash(req.body.password);
				change.save(function (err) {
					if (err) res.status(500).json({ error: "fail to update" });
				});
			}
			callback(isError, true);
		};

		//CHECK NICKNAME
		var checkNick = function checkNick(callback) {

			var checkReg = function checkReg(callback) {
				var isError = false;

				if (req.body.nickname) {
					// CHECK nickname FORMAT
					var nicknameRegex = /^[가-힣A-Za-z0-9_]+$/;
					if (!nicknameRegex.test(req.body.nickname)) {
						isError = true;
						tempStatus = {
							error: "BAD NICKNAME",
							code: 5
						};
					}
				}
				callback(isError, true);
			};

			// CHECK NICKNAME EXISTANCE
			var checkDuplicate = function checkDuplicate(callback) {
				var isError = false;

				_account2.default.findOne({ nickname: req.body.nickname }, function (err, exists) {
					if (err) throw err;
					if (exists) {
						isError = true;
						console.log("iserror:" + isError);
						tempStatus = {
							error: "NICKNAME EXISTS",
							code: 4
						};
					} else {
						change.nickname = req.body.nickname;
						change.save(function (err) {
							if (err) res.status(500).json({ error: "fail to update" });
						});
					}
					callback(isError, true);
				});
			};

			if (req.body.nickname) {
				var _tasks = [checkReg, checkDuplicate];
				_async2.default.series(_tasks, function (err, result) {
					callback(err, true);
				});
			} else {
				callback(false, true);
			}
		};

		var tasks = [checkNick, checkPass];
		_async2.default.series(tasks, function (err, result) {
			if (!err) {
				console.log('not error');
				console.log(res.statusCode);
				console.log(tempStatus);
				return res.json(tempStatus);
			} else {
				console.log('error');
				res.status(401);
				console.log(res.statusCode);
				console.log(tempStatus);
				return res.json(tempStatus);
			}
		});
	});
});

exports.default = router;