var express = require('express');
var validator = require('../config/validator');
var Category = require('../models/category');
var router = express.Router();

/**
 * 渲染admin_category_add页面
 */
router.get('/add', validator.signinRequired, validator.adminRequired, function (req, res, next) {
	res.render('admin_category_add', {
		title: '后台分类录入页',
		category: {}
	});
});
router.post('/add', validator.signinRequired, validator.adminRequired, function (req, res, next) {
	var _category = req.body.category;
	var category = new Category(_category);

	category.save(function (err, category) {
		if (err) {
			console.log(err);
		}

		res.redirect('/admin/category/list');
	});
});

/**
 * 渲染category_list.jade页面
 */
router.get('/list', validator.signinRequired, validator.adminRequired, function (req, res, next) {
	Category.fetch(function (err, categories) {
		if (err) {
			console.log(err);
		}

		res.render('admin_category_list', {
			title: '分类列表页',
			categories: categories
		});
	});
});

module.exports = router;