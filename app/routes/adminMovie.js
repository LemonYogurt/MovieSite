var express = require('express');
var validator = require('../config/validator');
var Category = require('../models/category');
var Movie = require('../models/movie');
var _ = require('underscore');
var router = express.Router();

/**
 * 以下两个路由将会渲染admin_movie_add.jade页面
 */
router.get('/add', validator.signinRequired, validator.adminRequired, function (req, res, next) {
	Category.find({}, function (err, categories) {
		res.render('admin_movie_add', {
			title: '电影网后台录入页面',
			categories: categories,
			movie: {}
		});
	});
});
router.get('/update/:id', function (req, res, next) {
	var id = req.params.id;

	if (id) {
		Movie.findById(id, function (err, movie) {
			Category.find({}, function (err, categories) {
				res.render('admin_movie_add', {
					title: '电影网后台更新页面',
					movie: movie,
					categories: categories
				});
			});
		});
	}
});

/**
 * 对应admin_movie_add.jade页面
 * 首先是验证是否登录和是否有权限访问
 * 第二步：解析表单数据中的file，并保存下来
 * 第三步：更新电影或者保存电影（分类）
 */
router.post('/add', validator.signinRequired, validator.adminRequired, function (req, res, next) {
	var posterData = req.files.uploadPoster;
	var filePath = posterData.path;
	var originalFilename = posterData.originalFilename;

	if (originalFilename) {
		fs.readFile(filePath, function (err, data) {
			var timestamp = Date.now();
			// type的内容为：image/jpeg
			var type = posterData.type.split('/')[1];
			var poster = timestamp + '.' + type;
			var newPath = path.join(__dirname, '../../', 'public/upload/' + poster);

			fs.writeFile(newPath, data, function (err) {
				req.poster = poster;
				next();
			});
		});
	} else {
		next();
	}

}, function (req, res, next) {
	/**
	 * 如果有id，表示是需要更新的movie
	 */
	var id = req.body.movie._id;
	var movieObj = req.body.movie;
	var _movie = null;

	/**
	 * 存储海报的地址
	 */
	if (req.poster) {
		movieObj.poster = poster;
	}

	/**
	 * 更新电影内容
	 */
	if (id) {
		Movie.findById(id, function (err, movie) {
			if (err) {
				console.log(err);
			}

			/**
			 * 将movieObj对象中的新字段替换掉movie中的老字段
			 */
			_movie = _.extend(movie, movieObj);
			_movie.save(function (err, movie) {
				if (err) {
					console.log(err);
				}

				res.redirect('/movie/' + movie._id);
			});
		});
	} else { // 新增电影
		_movie = new Movie(movieObj);
		/**
		 * 这是选择的单选按钮
		 */
		var categoryId = movieObj.category;
		/**
		 * 这是填写的新的分类列表
		 */
		var categoryName = movieObj.categoryName;

		_movie.save(function (err, movie) {
			if (err) {
				console.log(err);
			}

			if (categoryId) {
				Category.findById(categoryId, function (err, category) {
					/**
					 * 这里的movie是存储成功后的movie
					 */
					category.movies.push(movie._id);
					category.save(function (err, category) {
						res.redirect('/movie/' + movie._id);
					});
				});
			} else if (categoryName) {
				var category = new Category({
					name: categoryName,
					movies: [movie._id]
				});

				category.save(function (err, category) {
					/**
					 * movie模型的category字段存储的是_id
					 */
					movie.category = category._id;
					movie.save(function (err, movie) {
						res.redirect('/movie/' + movie._id);
					});
				});
			}
		});
	}
});

/**
 * 对应的页面：admin_movie_list.jade页面
 */

router.get('/list', validator.signinRequired, validator.adminRequired, function (req, res, next) {
	Movie.fetch(function (err, movies) {
		if (err) {
			console.log(err);
		}

		res.render('admin_movie_list', {
			title: '电影列表页',
			movies: movies
		});
	});
});

/**
 * 对应admin_movie_list.jade页面的删除按钮
 * 也对应着admin.js
 */
router.delete('/list', validator.signinRequired, validator.adminRequired, function (req, res, next) {
	var id = req.query.id;
	if (id) {
		Movie.remove({_id: id}, function (err, movie) {
			if (err) {
				console.log(err);
			} else {
				res.json({success: 1})
			}
		});
	}
});

module.exports = router;
