var express = require('express');
var User = require('../models/user');
var Comment = require('../models/comment');
var validator = require('../config/validator');
var fs = require('fs');
var path = require('path');

var router = express.Router();

/**
 * 注册路由，对应的页面：signup.jade
 */
router.post('/signup', function (req, res, next) {
	/**
	 * 注意：这里要获取req.files中的内容，必须在表单处声明属性：
	 * enctype="multipart/form-data"
	 */
	var avatarData = req.files.avatar;
	var filePath = avatarData.path;
	var originalFilename = avatarData.originalFilename;

	if (originalFilename) {
		fs.readFile(filePath, function (err, data) {
			var timestamp = Date.now();
			// type的内容为：image/jpeg
			var type = avatarData.type.split('/')[1];
			var avatar = timestamp + '.' + type;
			var newPath = path.join(__dirname, '../../', 'public/upload/' + avatar);

			fs.writeFile(newPath, data, function (err) {
				req.body.user.avatar = '/upload/' + avatar;
				next();
			});
		});
	} else {
		next();
	}
}, function (req, res, next) {
	var _user = req.body.user;

	User.findOne({name: _user.name}, function (err, user) {
		if (err) {
			console.log(err);
		}
		// 如果是find的话，返回的是一个空数组，如果是findOne的话，返回的是null
		/**
		 * 如果user已经存在了，则重定向到登录页面
		 */
		if (user) {
			return res.redirect('/user/signin');
		} else {
			var user = new User(_user);
			/**
			 * 存储之后，此时user中的密码已经是经过加盐加密的
			 */
			user.save(function (err, user) {
				if (err) {
					console.log(err);
				}
				/**
				 * 重定向之后，将会失去请求中的数据
				 */
				res.redirect('/');
			});
		}
	});
});

/**
 * 登录路由，对应的页面：signin.jade
 */
router.post('/signin', function (req, res, next) {
	var _user = req.body.user;
	var name = _user.name;
	var password = _user.password;

	User.findOne({name: name}, function (err, user) {
		if (err) {
			console.log(err);
		}

		/**
		 * 当用户不存在的话
		 * 重定向到注册页面
		 */
		if (!user) {
			return res.redirect('/user/signup');
		}

		/**
		 * 该方法使用bcrypto的compare方法，将数据库中已经加密过的密码与输入的密码进行匹配
		 * 如果匹配成功，则isMatch返回true
		 */
		user.comparePassword(password, function (err, isMatch) {
			if (err) {
				console.log(err);
			}

			if (isMatch) {
				req.session.user = user;
				return res.redirect('/');
			} else {
				return res.redirect('/user/signin');
			}
		});
	});
});

/**
 * 退出路由，对应的页面：content.jade
 */
router.get('/logout', function (req, res, next) {
	delete req.session.user;
	res.redirect('/');
});

/**
 * get请求的/user/signin路由，渲染signin.jade页面
 */
router.get('/signin', function (req, res, next) {
	res.render('signin', {
		title: '登录页面'
	});
});

/**
 * get请求的/user/signup路由，渲染signup.jade页面
 */
router.get('/signup', function (req, res, next) {
	res.render('signup', {
		title: '注册页面'
	});
});

// /user/comment路由，对应的页面：movie_detail.jade
// 保存评论的内容
router.post('/comment', validator.signinRequired, function (req, res, next) {
	var _comment = req.body.comment;
	var movieId = _comment.movie;

	/**
	 * 如果是回复评论，则将评论的内容保存在reply的数组中
	 */
	if (_comment.cid) {
		Comment.findById(_comment.cid, function (err, comment) {
			/**
			 * 存储的时候，存的是id
			 * @type {{from: *, to: *, content: *}}
			 */
			var reply = {
				from: _comment.from,
				to: _comment.tid,
				content: _comment.content
			};

			comment.reply.push(reply);

			comment.save(function (err, comment) {
				if (err) {
					console.log(err);
				}
				// 希望页面刷新之后，还能回到之前的movie中去
				res.redirect('/movie/' + movieId);
			});
		});
	} else {
		var comment = new Comment(_comment);
		comment.save(function (err, comment) {
			if (err) {
				console.log(err);
			}
			// 希望页面刷新之后，还能回到之前的movie中去
			res.redirect('/movie/' + movieId);
		});
	}
});

module.exports = router;