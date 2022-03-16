#!env php
<?php

if($argc < 3){
	echo <<<HELP
	help:
	
	php '{$argv[0]}' {dir} {url} [site]
	
HELP;
	exit();
}

$dir = $argv[1];
$url = $argv[2];
$from = $argv[3] ?? '';

$fontFace = file_get_contents($url, false, stream_context_create([
    "http" => [
        "method" => "GET",
        "header" => "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"
    ]
]));

if(!file_exists($dir)){
	mkdir($dir);
}

$fontFace = explode("\n", $fontFace);

foreach($fontFace as $k => $val){
	if(preg_match('/\s*src:\s*url\("?([^\)"]+)"?\).+/', $val, $matches)){
		print('Geting font from: ' .$from.$matches[1]. PHP_EOL);
		$file = basename($matches[1]);
		file_put_contents("$dir/". $file, file_get_contents($from . $matches[1]));
		
		$fontFace[$k] = "	src: url(../fonts/$dir/$file) format('". pathinfo($file, PATHINFO_EXTENSION) ."');";
	}
}

file_put_contents("$dir.css", implode("\n", $fontFace));