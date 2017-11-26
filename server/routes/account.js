import express from 'express';
import Account from '../models/account';
import async from 'async';

const router = express.Router();

/*
    ACCOUNT SIGNUP: POST /api/account/signup
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: BAD USERNAME
        2: BAD PASSWORD
				3: USERNAME EXISTS
				4: NICKNAME EXISTS
*/
router.post('/signup', (req, res) => {
	// CHECK USERNAME FORMAT
	let usernameRegex = /^[A-Za-z0-9]+$/;
	let nicknameRegex = /^[가-힣A-Za-z0-9_]+$/;

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
	Account.findOne({ username: req.body.username }, (err, exists) => {
		if (err) throw err;
		if (exists) {
			return res.status(409).json({
				error: "USERNAME EXISTS",
				code: 3
			});
		}

		Account.findOne({ nickname: req.body.nickname }, (err, exists) => {
			if (err) throw err;
			if (exists) {
				return res.status(409).json({
					error: "NICKNAME EXISTS",
					code: 4
				})
			}

			// CREATE ACCOUNT
			let account = new Account({
				username: req.body.username,
				password: req.body.password,
				nickname: req.body.nickname
			});

			account.password = account.generateHash(account.password);

			// SAVE IN THE DATABASE
			account.save(err => {
				if (err) throw err;
				return res.json({ success: true });
			});
		})
	});
});

/*
    ACCOUNT SIGNIN: POST /api/account/signin
    BODY SAMPLE: { "username": "test", "password": "test" }
    ERROR CODES:
        1: LOGIN FAILED
*/
router.post('/signin', (req, res) => {

	if (typeof req.body.password !== "string") {
		return res.status(401).json({
			error: "LOGIN FAILED",
			code: 1
		});
	}

	// FIND THE USER BY USERNAME
	Account.findOne({ username: req.body.username }, (err, account) => {
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
		let session = req.session;
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
router.get('/getinfo', (req, res) => {
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
router.post('/logout', (req, res) => {
	req.session.destroy(err => { if (err) throw err; });
	return res.json({ sucess: true });
});


/*
    SEARCH USER: GET /api/account/search/:username
*/
router.get('/search/:nickname', (req, res) => {
	// SEARCH USERNAMES THAT STARTS WITH GIVEN KEYWORD USING REGEX
	var re = new RegExp('^' + req.params.nickname);
	Account.find({ nickname: { $regex: re } }, { _id: false, username: true, nickname: true })
		.limit(5)
		.sort({ nickname: 1 })
		.exec((err, accounts) => {
			if (err) throw err;
			res.json(accounts);
		});
});

// EMPTY SEARCH REQUEST: GET /api/account/search
router.get('/search', (req, res) => {
	res.json([]);
});


//MODIFY accounts: PUT /api/account/modify

router.put('/modify/:username', (req, res) => {
	Account.findOne({ username: req.params.username }, (err, change) => {
		if (err) return res.status(500).json({ error: 'db fail' })
		if (!change) return res.status(404).json({ erorr: 'account not found' })

		let tempStatus = { success: true };

		//CHECK PASS
		const checkPass = (callback) => {
			if (req.body.password) {
				// CHECK PASS LENGTH
				if (req.body.password.length < 4 || typeof req.body.password !== "string") {
					callback(null, true);		
					tempStatus = {
						error: "BAD PASSWORD",
						code: 2
					}	
				}
				change.password = change.generateHash(req.body.password);
				change.save((err) => {
					if (err) res.status(500).json({ error: "fail to update" })
				})
				callback(null, false);
			}		
		}

		//CHECK NICKNAME
		const checkNick = (callback) => {
			if (req.body.nickname) {
				// CHECK nickname FORMAT
				let nicknameRegex = /^[가-힣A-Za-z0-9_]+$/;
				if (!nicknameRegex.test(req.body.nickname)) {
					callback(null, true);					
					tempStatus = {
						error: "BAD NICKNAME",
						code: 5
					};
				}

				// CHECK NICKNAME EXISTANCE
				Account.findOne({ nickname: req.body.nickname }, (err, exists) => {
					let called = false;

					if (err) throw err;
					if (exists) {
						callback(null, true);			
						called = true;						
						tempStatus = {
							error: "NICKNAME EXISTS",
							code: 4
						}
					}

					change.nickname = req.body.nickname;
					change.save((err) => {
						if (err) res.status(500).json({ error: "fail to update" })
					})
					if (!called) {
						callback(null, false);
					}
				});
			}		
		}

		let tasks = [checkNick, checkPass];
		async.series(tasks, (err, result) => {			
			return res.json(tempStatus);
		})
	});
});

export default router;
