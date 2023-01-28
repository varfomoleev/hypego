<?php
  $name = $_POST['name']; // input name="name"
  $phone = $_POST['phone']; // input name="phone"

  $message = "Новый заказ на сайте".PHP_EOL."Имя: ".$name.PHP_EOL."Телефон: ".$phone; //Обрабатываем данные из формы, для передачи их в письме PHP_EOL - это перенос на другую стороку

  send(549260145,$message); // id страницы на которую будут отправляться заявки

  function send($id , $message) {
    $url = 'https://api.vk.com/method/messages.send';
    $params = array(
      'user_id' => $id,    // Кому отправляем
      'message' => $message,   // Что отправляем
      'access_token' => 'vk1.a.HgT9zQK_J19DOg_z_R6cv9ZyIYdinGQvjsOTvv66mPy6MMOs30TjbEHvFjLXbYQDMGCzGIBCfZhYzytZYC2gmyRmjrrL8dAM9fFLCnUtIvvWxLwwLJsJoBG2WH2mv1TL00MPfK828hR4NmyqNGKPbpfWdEbGLp8AMmqbztQYp5hBEMjjAoLj0-Xm8zhmAUhyW9d5tJj_K2_twRV5YpxF4Q',
      'v' => '5.62',
    );

    $result = file_get_contents($url, false, stream_context_create(array(
        'http' => array(
          'method'  => 'POST',
          'header'  => 'Content-type: application/x-www-form-urlencoded',
          'content' => http_build_query($params)
        )
    )));
  }
?>


<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Отправка формы</title>
</head>
<body>
	<div class="loader">
		<div class="center">
			<h1 style="text-align: center;">Всё ок!</h1>
		</div>
	</div>
</body>
</html>


