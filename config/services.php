<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'simpeg' => [
        'url' => env('SIMPEG_API_URL'),
        'token' => env('SIMPEG_API_TOKEN'),
    ],

    'firebase' => [
        'api_key' => env('FIREBASE_API_KEY', 'AIzaSyB8ly4Suc5D7jaBc0lm8K9Cb02626xDRTw'),
        'auth_domain' => env('FIREBASE_AUTH_DOMAIN', 'pilkb-bkpsdm.firebaseapp.com'),
        'database_url' => env('FIREBASE_DATABASE_URL', 'https://pilkb-bkpsdm-default-rtdb.asia-southeast1.firebasedatabase.app'),
        'project_id' => env('FIREBASE_PROJECT_ID', 'pilkb-bkpsdm'),
        'storage_bucket' => env('FIREBASE_STORAGE_BUCKET', 'pilkb-bkpsdm.firebasestorage.app'),
        'messaging_sender_id' => env('FIREBASE_MESSAGING_SENDER_ID', '1064671001480'),
        'app_id' => env('FIREBASE_APP_ID', '1:1064671001480:web:2289b0ea3655eae271583d'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model'   => env('GEMINI_MODEL', 'gemini-3.5-flash-lite'),
    ],

];
