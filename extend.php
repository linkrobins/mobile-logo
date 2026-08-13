<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Settings())
        // Which image to use. 'favicon' by default: it is the one image a forum
        // is guaranteed to have in a square-ish shape, which is the shape that
        // fits a navigation bar. A wide wordmark logo does not.
        ->default('linkrobins-mobile-logo.source', 'favicon')
        ->default('linkrobins-mobile-logo.custom_url', '')
        ->default('linkrobins-mobile-logo.position', 'left')
        ->default('linkrobins-mobile-logo.height', '32')
        ->default('linkrobins-mobile-logo.link_home', true)
        ->serializeToForum('linkrobinsMobileLogoSource', 'linkrobins-mobile-logo.source')
        ->serializeToForum('linkrobinsMobileLogoCustomUrl', 'linkrobins-mobile-logo.custom_url')
        ->serializeToForum('linkrobinsMobileLogoPosition', 'linkrobins-mobile-logo.position')
        ->serializeToForum('linkrobinsMobileLogoHeight', 'linkrobins-mobile-logo.height', 'intval')
        ->serializeToForum('linkrobinsMobileLogoLinkHome', 'linkrobins-mobile-logo.link_home', 'boolval'),
];
