<?php 
require 'src/phpMailer/PHPMailerAutoload.php';
class ResponseError {
	private $status;
	private $messages;

	function __construct($status, $message = null) {
		$this->status = $status;
		if (isset($message)) {
			$this->messages = array(
				'general' => $message
			);
		} else {
			$this->messages = array();
		}
	}

	public function addMessage($key, $message) {
		$this->messages[$key] = $message;
	}

	public function getJsonResponse() {
		$response = (object) [];
		$response->status = $this->status;
		$response->messages = $this->messages;
		return json_encode($response);
	}
}

$subject = '';
$email = '';
$text = '';

if (isset($_POST['subject']) && isset($_POST['email']) && isset($_POST['text'])) {
	$subject = $_POST['subject'];
	$email = $_POST['email'];
	$text = $_POST['text'];
}

if ($subject != '' && $email != '' && $text != '') {
	sendMail($subject, $email, $text);
} else {
	$error = new ResponseError(400, "Los datos enviados contienen errores");
	if ($subject == '') $error->addMessage("subject", "El asunto es obligatorio");
	if ($email == '') $error->addMessage("email", "La dirección de email es obligatoria");
	if ($text == '') $error->addMessage("text", "El mensaje no puede estar vacío");
	header( 'HTTP/1.1 400 BAD REQUEST', true, 400 );
	echo $error->getJsonResponse();
	// http_response_code(404);
}

function sendMail($subject, $email, $text) {
	$mail = new PHPMailer;

	// $mail->SMTPDebug = 3;

	$mail->isSMTP();
	$mail->Host = 'smtp.mailtrap.io';
	$mail->SMTPAuth = true;
	$mail->Username = '2b87694800225f';
	$mail->Password = '9cfd9254785eac';
	$mail->SMTPSecure = 'tls';
	$mail->Port = 2525;

	$mail->setFrom($email);
	$mail->addAddress('torredecontrol@example.net', 'Torre de control');
	$mail->addReplyTo('info@torredecontrol.com', 'Torre de control');
	$mail->isHTML(true);

	$mail->Subject = $subject;
	$mail->Body    = $text;
	$mail->AltBody = $text;

	if(!$mail->send()) {
		$error = new ResponseError(400, "El mensaje no pudo ser enviado");
	    $error->addMessage("message_service", "No pudo enviarse el mensaje");
	    header( 'HTTP/1.1 400 BAD REQUEST', true, 400 );
	    echo $error->getJsonResponse();
	    // http_response_code(404);
	} else {
		$response = (object) [];
		$response->status = "200";
		$response->message = "Mensaje enviado";
	    echo json_encode($response);
	}
}



