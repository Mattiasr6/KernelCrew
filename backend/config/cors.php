<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:4200',
        'https://mattias.tail09f411.ts.net',
        'http://mattias.tail09f411.ts.net'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];