<?php

return [
    'api' => [
        'title' => 'KernelLearn API',
        'version' => '1.0.0',
        'prefix' => 'api',
        'rules' => null,
    ],

    'swagger' => [
        'api',
        'output' => 'storage/api-docs',
        'constants' => [
            'App::VERSION' => '1.0.0',
        ],
    ],

    'generate_annotations' => true,
];