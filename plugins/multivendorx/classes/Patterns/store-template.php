<?php
return array(
    'name' => 'basic-store-template',
    'title' => __('Basic Store Template', 'multivendorx'),
    'description' => __('A simple starter layout for a store page.', 'multivendorx'),
    'keywords' => array('store', 'basic', 'layout'),
    'content' => '
       <!-- wp:group {"className":"is-style-default","style":{"dimensions":{"minHeight":"1px"},"spacing":{"margin":{"top":"0","bottom":"0"},"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group is-style-default" style="min-height:1px;margin-top:0;margin-bottom:0"><!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:group {"style":{"color":{"background":"#d2d2d2"},"spacing":{"padding":{"top":"80px","bottom":"80px"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-group has-background" style="background-color:#d2d2d2;padding-top:80px;padding-bottom:80px"><!-- wp:heading {"style":{"typography":{"fontSize":"45px"}}} -->
<h2 class="wp-block-heading" style="font-size:45px">1900 x 600</h2>
<!-- /wp:heading --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-group"><!-- wp:group {"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical","justifyContent":"right"}} -->
<div class="wp-block-group has-base-background-color has-background"><!-- wp:heading {"className":"is-style-default","style":{"typography":{"fontSize":"21px"},"color":{"background":"#aca9a9"}}} -->
<h2 class="wp-block-heading is-style-default has-background" style="background-color:#aca9a9;font-size:21px">400 x 400</h2>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"0px","bottom":"0px"},"blockGap":"10px","margin":{"top":"20px","bottom":"20px"}}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-group has-base-background-color has-background" style="margin-top:20px;margin-bottom:20px;padding-top:0px;padding-bottom:0px"><!-- wp:heading -->
<h2 class="wp-block-heading">Store 1</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"17px"}}} -->
<p class="has-text-align-center" style="font-size:17px">Welcome to WordPress. This is your first post. Edit or delete it, then start writing!</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-fill","style":{"border":{"radius":{"topLeft":"0px","topRight":"0px","bottomLeft":"0px","bottomRight":"0px"}}}} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button" style="border-top-left-radius:0px;border-top-right-radius:0px;border-bottom-left-radius:0px;border-bottom-right-radius:0px">Follow</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"17px"}}} -->
<p class="has-text-align-center" style="font-size:17px">0 Followers</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
    ',
);
