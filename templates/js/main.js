var last = {
	'current': '[]',

	'update': function(){
		$.getJSON({
			url: '/engine/ajax.php?type=donaters',
			success: function(data){
				var str = JSON.stringify(data);

				if(last.current === str){
					return;
				}

				var donaters = $('#donaters');

				donaters.html('');

				last.current = str;

				$.each(data, function(k, v){
					donaters.append('<div class="donate-id" title="'+v.date+'">' +
							'<div class="avatar" style="background-image:url('+v.avatar+')"></div>' +
							'<div class="username">'+v.nick+'</div>' +
							'<div class="group">['+v.group+']</div>' +
						'</div>');
				});
			},
			complete: function(){ setTimeout(function(){ last.update(); }, 3000); }
		});
	}
};

function updateGroups(){
	var group = $('#group');

	group.html('<option value="-1" disabled selected>Выберите товар</option>');

	var selected = $('.buyform #server').val();

	var hidden = $('#hiddengroup optgroup[data-server="'+selected+'"]').clone();

	group.append(hidden);
}

function submitForm(){
	if(typeof timer_key != 'undefined'){
		clearTimeout(timer_key);
	}

	var form = $('.buyform');

	var button = form.find('#buy');

	var nick = form.find('[name="nick"]').val().trim();
	var server = form.find('[name="server"]').val().trim();
	var vk = form.find('[name="vk"]').val().trim();
	var group = form.find('[name="group"]').val().trim();
	var method = form.find('[name="method"]').val().trim();
	var contact = form.find('[name="contact"]').val().trim();

	timer_key = setTimeout(function() {
		$.post('/engine/ajax.php?type=view', {
			type: 'view',
			nick: nick,
			server: server,
			vk: vk,
			buy: true,
			group: group,
			method: method,
			contact: contact
		}, function(data) {
			var explode = data.split('|');

			if(explode[0] == 'error'){
				button.text(explode[2]);
				//pipui.alert.open('Внимание!', explode[1], 'bottom-right');
			}else if(explode[0] == 'ok'){
				button.text(explode[1]);
			}else{
				$('body').append(data);
			}
		});
	}, 500);
}

function price(complete, timeout, check){
	if(typeof timeout == 'undefined'){
		timeout = 500;
	}

	if(typeof check == 'undefined'){
		check = false;
	}

	if(typeof timer_key != 'undefined'){
		clearTimeout(timer_key);
	}

	var form = $('.buyform');

	var button = form.find('#buy');

	var nick = form.find('[name="nick"]').val().trim();

	if(form.find('[name="group"] option:selected').attr('data-field') === 'true'){
		form.find('.form-group-vk').show('fast');
	}else{
		form.find('.form-group-vk').hide('fast');
	}

	//if(nick === ''){ return; }

	timer_key = setTimeout(function() {
		$.get('/engine/ajax.php', {
			type: 'view',
			nick: nick,
			server: form.find('[name="server"]').val(),
			vk: form.find('[name="vk"]').val(),
			group: form.find('[name="group"]').val()
		}, function(data) {
			var explode = data.split('|');
			button.text(explode[1]);
			if(explode[0] == 'error'){
				/*if(check){
					pipui.alert.open('Внимание!', explode[1], 'bottom-right');
				}*/
			}else if(typeof complete == 'function'){
				complete(data);
			}
		});
	}, timeout);
}

$(function() {

	setTimeout(function(){
		updateGroups();
	}, 0);

	$('body').on('input', '.buyform input[name="nick"]', function(){
		$('.buyform input[name="nick"]').val($(this).val());
	}).on('input', '#server, #group, #nick', function() {

		price();

	}).on('change', '#server', function() {

		updateGroups();

	}).on('change', '.buyform select', function() {

		price();

	}).on('click', '[data-id="method"] #methods [type="button"]', function(e){
		e.preventDefault();

		var that = $(this);

		var method = that.attr('data-type');

		$('.buyform').find('[name="method"]').val(method);

		if(method == 'yookassa'){
			pipui.modal.close('method');
			pipui.modal.open('contact');
		}else{
			submitForm();

			pipui.modal.close('method');
		}

	}).on('click', '[data-id="contact"] [type="button"]', function(e){
		e.preventDefault();

		var value = $('#contact-form').val();

		$('.buyform [name="contact"]').val(value);

		submitForm();

		pipui.modal.close('contact');

	}).on('submit', '.buyform', function(e){
		e.preventDefault();

		price(function(){
			pipui.modal.open('method');
		}, 10, true);

	}).on('click', '#buy', function(e){
		e.preventDefault();

		price(function(){
			pipui.modal.open('method');
		}, 10, true);

	}).on('click', '#recall-form [type="submit"]', function(e){
		e.preventDefault();

		var that = $(this);

		that.prop('disabled', true);

		var search = that.closest('form').find('[name="search"]').val();

		$.getJSON({
			url: '/engine/ajax.php?type=orders/list',
			success: function(data){
				var list = $('#recall-form .search-orders .table-body');

				list.html('');

				var none = $('#recall-form .search-orders .order-none');

				if(Object.keys(data).length){
					none.hide();
				}else{
					none.show();
				}

				$.each(data, function(k, v){
					list.append('<div class="table-row order-id" data-id="'+v.id+'">' +
							'<div class="table-cell-resp">Ник</div>' +
							'<div class="table-cell">'+v.nick+'</div>' +
							'<div class="table-cell-resp">Покупка</div>' +
							'<div class="table-cell">'+v.group+'</div>' +
							'<div class="table-cell-resp">Сервер</div>' +
							'<div class="table-cell">'+v.server+'</div>' +
							'<div class="table-cell-resp">Дата</div>' +
							'<div class="table-cell">'+v.date+'</div>' +
							'<div class="table-cell-resp">Действие</div>' +
							'<div class="table-cell"><button type="button" class="btn lh-24 h-24px order-recall">Выдать повторно</button></div>' +
						'</div>');
				});
			},

			complete: function(){
				that.prop('disabled', false);
			}
		}, {'search':search});
	}).on('click', '#recall-form .order-recall', function(e){
		e.preventDefault();

		var that = $(this);

		that.prop('disabled', true);

		var id = that.closest('.order-id').attr('data-id');

		$.post('/engine/ajax.php?type=orders/get', {'id':id}, function(data) {
			that.html(data);

			setTimeout(function(){
				that.prop('disabled', false).html('Выдать повторно');
			}, 2000);
		});
	}).on('click', '.slide#cover .ips > .ips-open', function(e){
		e.preventDefault();

		var ips = $(this).closest('.ips');

		ips.children('.ips-wrapper').scrollTop(0);

		ips.toggleClass('active');
	}).on('click', '.copyto', function(){
		var that = $(this);

		that.html('Скопировано!');

		setTimeout(function(){
			that.html('Скопировать адрес');
		}, 1000);
	}).on('click', '.copyblock > [data-modal="ip"]', function(){
		window.location.href = 'minecraft://?addExternalServer=HypeGO|'+$(this).attr('data-clipboard-text');
	}).on('click', '.slide > .slide-up-target, .slide > .slide-down-target', function(e){
		e.preventDefault();

		var that = $(this);

		var slide = that.closest('.slide');

		var next = that.hasClass('slide-up-target') ? slide.prev('.slide') : slide.next('.slide');

		if(!next.length){ return; }

		$('html,body').stop().animate({
			scrollTop: next.position().top
		}, 500, 'swing');
	}).on('click', '.slide > .slide-top-target', function(e){
		e.preventDefault();

		$('html,body').stop().animate({
			scrollTop: 0
		}, 500, 'swing');
	});

	new ClipboardJS('.copyto');

	last.update();
});

$.post('/engine/ajax.php?type=stat/online', {}, function(data) {
	$('#online').html(data);
});

$.post('/engine/ajax.php?type=stat/slots', {}, function(data) {
	$('#slots').html(data);
});