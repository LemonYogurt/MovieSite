var express = require('express');
var User = require('../models/user');
var validator = require('../config/validator');
var router = express.Router();

/**
 * /admin/user/list路由，将渲染user_list.jade页面
 */
router.get('/list', validator.signinRequired, validator.adminRequired, function (req, res, next) {
	/**
	 * 这里的fetch方法是查询出user集合的所有内容并且按照更新时间排序
	 */
	User.fetch(function (err, results) {
		if (err) {
			console.log(err);
		}

		res.render('admin_user_list', {
			title: '用户列表页',
			users: results
		});
	});
});

module.exports = router;