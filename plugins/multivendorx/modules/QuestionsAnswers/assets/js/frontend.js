/* global qnaFrontend */
jQuery( document ).ready( function ( $ ) {
	const $cta = $( '.qna-cta' ); // wrapper of "Post your Question"
	const $list = $( '#qna-list' ); // the list of questions

	function updatePostButton() {
		const count = $list.find( '.qna-item' ).length;
		if ( count === 0 ) {
			$cta.show(); // no results → show button
		} else {
			$cta.hide(); // has results → hide button
		}
	}
	// Show hidden form when clicking "Post your Question"
	$( document ).on( 'click', '#qna-show-form', function () {
		$( '#qna-form' ).slideDown();
		$( this ).hide();
	} );

	// Submit new question
	$( document ).on( 'click', '#qna-submit', function () {
		let question = $( '#qna-question' ).val();
		let productId = $( '#product-qna' ).data( 'product' );
		if ( ! question.trim() ) return;

		$.post(
			qnaFrontend.ajaxurl,
			{
				action: 'qna_submit',
				product_id: productId,
				question: question,
				nonce: qnaFrontend.nonce,
			},
			function ( res ) {
				if ( res.success ) {
					let q = res.data;
					$( '#qna-question' ).val( '' );
					$( '#qna-form' ).slideUp();
					$( '#qna-show-form' ).show();
				} else {
					alert( res.data.message );
				}
			}
		);
	} );

	$( document ).on( 'keyup', '#qna-search', function () {
		let keyword = $( this ).val().trim();
		let productId = $( '#product-qna' ).data( 'product' );

		if ( ! keyword ) {
			$( '#qna-direct-submit' ).hide();
		}

		$.post(
			qnaFrontend.ajaxurl,
			{
				action: 'qna_search',
				product_id: productId,
				search: keyword,
				nonce: qnaFrontend.nonce,
			},
			function ( res ) {
				if ( res.success ) {
					$( '#qna-list' ).html( res.data.html );

					const count = $( '#qna-list .qna-item' ).length;

					if ( count === 0 && keyword !== '' ) {
						$( '#qna-direct-submit' ).show(); // show submit button
						$( '#qna-direct-submit' ).data( 'question', keyword );
					} else {
						$( '#qna-direct-submit' ).hide(); // hide button if results exist
					}
				}
			}
		);
	} );

	// Voting
	$( document ).on( 'click', '#qna-direct-submit', function () {
		let question = $( this ).data( 'question' );
		let productId = $( '#product-qna' ).data( 'product' );

		$.post(
			qnaFrontend.ajaxurl,
			{
				action: 'qna_submit',
				product_id: productId,
				question: question,
				nonce: qnaFrontend.nonce,
			},
			function ( res ) {
				if ( res.success ) {
					location.reload();
				} else {
					alert( res.data.message );
				}
			}
		);
	} );
} );
