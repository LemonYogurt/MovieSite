$(function () {
	$('.comment').click(function (e) {
		var target = $(this);
		var toId = target.data('tid');
		var commentId = target.data('cid');

		// 在回复评论的时候，如果点击了两次，应该是以最后那个人为回复对象

		if ($('#toId').length > 0) {
			$('#toId').val(toId);
		} else {
			$('<input>').attr({
				type: 'hidden',
				id: 'toId',
				name: 'comment[tid]',
				value: toId
			}).appendTo('#commentForm');
		}

		if ($('#commentId').length > 0) {
			$('#commentId').val(commentId);
		} else {
			$('<input>').attr({
				type: 'hidden',
				id: 'commentId',
				name: 'comment[cid]',
				value: commentId
			}).appendTo('#commentForm');
		}
	});
});