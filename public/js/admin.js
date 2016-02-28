$(function () {
	$('.del').click(function (e) {
		console.log('hehe');
		var target = $(e.target);
		var id = target.data('id');
		// 拿到表格的一行，当删除的时候，希望这一行被删除
		var tr = $('.item-id-' + id);

		$.ajax({
			type: 'DELETE',
			url: '/admin/movie/list?id=' + id
		}).done(function (results) {
			if (results.success == 1) {
				if (tr.length > 0) {
					tr.remove();
				}
			}
		});
	});
	$('#douban').blur(function() {
		var douban = $(this);
		var id = douban.val();

		if (id) {
			$.ajax({
				url: 'https://api.douban.com/v2/movie/subject/' + id,
				cache: true,
				type: 'get',
				dataType: 'jsonp',
				// 跨域
				crossDomain: true,
				// jsonp用来回传的参数名字
				jsonp: 'callback',
				// 与豆瓣的字段一一对应
				success: function(data) {
					$('#inputTitle').val(data.title);
					$('#inputDoctor').val(data.directors[0].name);
					$('#inputCountry').val(data.countries[0]);
					$('#inputPoster').val(data.images.large);
					$('#inputYear').val(data.year);
					$('#inputSummary').val(data.summary);
				}
			});
		}
	});
});