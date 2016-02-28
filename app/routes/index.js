var express = require('express');
var Category = require('../models/category');
var Movie = require('../models/movie');
var Comment = require('../models/comment');
var router = express.Router();

router.get('/', function (req, res, next) {
	Category
		.find({})
		.populate({path: 'movies', options: {limit: 5}})
		.exec(function (err, categories) {
			if (err) {
				console.log(err);
			}

			res.render('index', {
				title: '电影网首页',
				categories: categories
			});
		});
});

/**
 * 得到查询的结果，对应的页面是：content.jade的搜索框
 * 和search_results.jade页面
 */
router.get('/results', function (req, res, next) {
	/**
	 * 分页按钮传递过来的数据
	 */
	var catId = req.query.cat;
	/**
	 * 搜索框传来的数据
	 */
	var q = req.query.q;
	/**
	 * 当前页面
	 */
	var page = parseInt(req.query.p, 10) || 0;

	/**
	 * 设置每一页的数据
	 */
	var count = 2;
	var index = page * count;

	/**
	 * catId是点击分页按钮的时候传递过来的内容
	 */
	if (catId) {
		/**
		 * 在mongoose的使用中
		 * 分页查询是有问题的
		 * limit参数是可用的
		 * 但是skip是不可用的
		 * Category
		 *      .find({_id: catId})
		 *      .populate({path: 'movies', select: 'title poster', options: {limit: 2, skip: index}})
		 *      .exec(function (err, categories) {});
		 * 所以自己来实现一下分页的逻辑
		 */

		Category
			.find({_id: catId})
			.populate({path: 'movies', select: 'title poster'})
			.exec(function (err, categories) {
				if (err) {
					console.log(err);
				}

				var category = categories[0] || {};
				var movies = category.movies || [];
				var results = movies.slice(index, index + count);

				res.render('search_results', {
					title: '搜索结果页',
					keyword: category.name,
					currentPage: (page + 1),
					query: 'cat=' + catId,
					totalPage: Math.ceil(movies.length / count),
					movies: results
				});
			});
	} else { // 搜索框提交的内容
		Movie.find({title: new RegExp(q + '.*', 'i')}).exec(function (err, movies) {
			if (err) {
				console.log(err);
			}

			var results = movies.slice(index, index + count);
			res.render('search_results', {
				title: '搜索结果页',
				keyword: q,
				currentPage: (page + 1),
				query: 'q=' + q,
				totalPage: Math.ceil(movies.length / count),
				movies: results
			});
		});
	}
});

router.get('/movie/:id', function (req, res, next) {
	var id = req.params.id;

	Movie.findById(id, function (err, movie) {
		Movie.update({_id: id}, {$inc: {pv: 1}}, function (err) {
			if (err) {
				console.log(err);
			}
		});

		if (err) {
			console.log(err);
		}

		Comment.find({movie: id}).populate('from').populate('reply.from reply.to').exec(function (err, comments) {
			res.render('movie_detail', {
				title: '详情页' + movie.title,
				movie: movie,
				comments: comments
			});
		});
	});
});

module.exports = router;