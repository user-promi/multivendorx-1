jQuery(document).ready(function ($) {

    $( '#mvx-edit-product-form' ).on( 'click', '#mvx_frontend_dashboard_product_submit, #mvx_frontend_dashboard_product_draft', function (e) {
        var status = ( e.target.id === 'mvx_frontend_dashboard_product_submit' ) ? 'publish' : ( e.target.id === 'mvx_frontend_dashboard_product_draft' ) ? 'draft' : '';
        $( 'input:hidden[name="status"]' ).val( status );
    });

    var featuredImageFrame = null;
    var galleryImagesFrame = null;
    var $imageGalleryIDs = $( '#product_image_gallery' );

    $( '.featured-img' ).on( 'click', '.upload_image_button:not(.remove)', function ( event ) {
        var $button = $( this ),
            $parent = $button.closest( '.upload_image' );

        event.preventDefault();

        // If the media frame already exists, reopen it.
        if ( featuredImageFrame ) {
            featuredImageFrame.open();
            return;
        }

        // Create the media frame.
        featuredImageFrame = wp.media.frames.featured_image = wp.media( {
            // Set the title of the modal.
            title: $button.data( 'title' ),
            button: {
                text: $button.data( 'button' )
            },
            states: [
                new wp.media.controller.Library( {
                    title: $button.data( 'title' ),
                    filterable: 'all'
                } )
            ]
        } );

        // When an image is selected, run a callback.
        featuredImageFrame.on( 'select', function () {

            var attachment = featuredImageFrame.state().get( 'selection' ).first().toJSON(),
                url = attachment.sizes && attachment.sizes.medium ? attachment.sizes.medium.url : attachment.url;

            $( '.upload_image_id', $parent ).val( attachment.id ).change();
            $parent.find( '.upload_image_button' ).addClass( 'remove' );
            $parent.find( 'img' ).eq( 0 ).attr( 'src', url );
        } );

        // Finally, open the modal.
        featuredImageFrame.open();
    });

    $( '.featured-img' ).on( 'click', '.upload_image_button.remove', function ( event ) {
        event.preventDefault();

        var $parent = $( this ).closest( '.upload_image' );

        $( '.upload_image_id', $parent ).val( '' ).change();
        // $parent.find( 'img' ).eq( 0 ).attr( 'src', mvx_advance_product_params.woocommerce_placeholder_img_src );
        $parent.find( '.upload_image_button' ).removeClass( 'remove' );
    } );
            
    $( '#product_images_container' ).on( 'click', '.add_product_images a', function ( event ) {
        var $el = $( this );
        var $productImages = $( '#product_images_container' ).find( 'ul.product_images' );

        event.preventDefault();

        // If the media frame already exists, reopen it.
        if ( galleryImagesFrame ) {
            galleryImagesFrame.open();
            return;
        }

        // Create the media frame.
        galleryImagesFrame = wp.media.frames.product_gallery = wp.media( {
            // Set the title of the modal.
            title: $el.data( 'choose' ),
            button: {
                text: $el.data( 'update' )
            },
            states: [
                new wp.media.controller.Library( {
                    title: $el.data( 'choose' ),
                    filterable: 'all',
                    multiple: true
                } )
            ]
        } );

        // When an image is selected, run a callback.
        galleryImagesFrame.on( 'select', function () {
            var selection = galleryImagesFrame.state().get( 'selection' ),
                attachmentIDs = $imageGalleryIDs.val();

            selection.map( function ( attachment ) {
                attachment = attachment.toJSON();

                if ( attachment.id ) {
                    attachmentIDs = attachmentIDs ? attachmentIDs + ',' + attachment.id : attachment.id;
                    var attachment_image = attachment.sizes && attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url;

                    $productImages.append( '<li class="image" data-attachment_id="' + attachment.id + '"><img src="' + attachment_image + '" /><ul class="actions"><li><a href="#" class="delete" title="' + $el.data( 'delete' ) + '">' + $el.data( 'text' ) + '</a></li></ul></li>' );
                }
            } );

            $imageGalleryIDs.val( attachmentIDs );
        } );

        // Finally, open the modal.
        galleryImagesFrame.open();
    } );


    $( '#product_images_container' ).on( 'click', '.product_images a.delete', function ( ) {
        $( this ).closest( 'li.image' ).remove();

        var attachmentIDs = '';

        $( '#product_images_container' ).find( 'ul li.image' ).css( 'cursor', 'default' ).each( function () {
            var attachmentID = $( this ).attr( 'data-attachment_id' );
            attachmentIDs = attachmentIDs + attachmentID + ',';
        } );

        $imageGalleryIDs.val( attachmentIDs );

        return false;
    } );

     $( '#product_images_container' )
        .find( 'ul.product_images' )
        .sortable( {
            items: 'li.image',
            cursor: 'move',
            scrollSensitivity: 40,
            forcePlaceholderSize: true,
            forceHelperSize: false,
            helper: 'clone',
            opacity: 0.65,
            placeholder: 'product-image-gallery-placeholder',
            start: function ( event, ui ) {
                ui.item.css( 'background-color', '#f6f6f6' );
            },
            stop: function ( event, ui ) {
                ui.item.removeAttr( 'style' );
            },
            update: function () {
                var attachmentIDs = '';

                $( '#product_images_container' ).find( 'ul li.image' ).css( 'cursor', 'default' ).each( function () {
                    var attachmentID = $( this ).attr( 'data-attachment_id' );
                    attachmentIDs = attachmentIDs + attachmentID + ',';
                } );

                $imageGalleryIDs.val( attachmentIDs );
            }
        } );
});