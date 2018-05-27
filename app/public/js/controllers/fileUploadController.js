function fileUploadController(){


	var that = this;
	$('#btn-upload-back').click(function(){ window.location.href = '/home';});
	$('#btn-fileUpload').click(function(){ window.location.href = '/home';});
	$('#show-btn').click(function(){ window.location.href = '/showfiles';});



	this.showUploadAlert = function(msg){
		//$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h4').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/home';})
		setTimeout(function(){window.location.href = '/home';}, 3000);
	}
}


