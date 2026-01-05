jQuery(document).ready(function ($) {
    var opts = distanceShippingFrontend;
    console.log('opt',opts)
    if ($('#multivendorx_user_location_lat').length === 0) {
        return;
    }

    if (opts.map_provider === 'google_map_set') {
        initGoogleMap(opts);
    } else if (opts.map_provider === 'mapbox_api_set') {
        initMapboxMap(opts);
    }

    /* -----------------------------
     * GOOGLE MAPS (UNCHANGED LOGIC)
     * ----------------------------- */
    function initGoogleMap(opts) {
        var lat = $('#multivendorx_user_location_lat').val() || opts.default_lat;
        var lng = $('#multivendorx_user_location_lng').val() || opts.default_lng;
        var latlng = new google.maps.LatLng(lat, lng);

        var map = new google.maps.Map(
            document.getElementById('mvx-user-locaton-map'),
            {
                center: latlng,
                zoom: parseInt(opts.default_zoom),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
        );

        var marker = new google.maps.Marker({
            map: map,
            position: latlng,
            draggable: true
        });

        var geocoder = new google.maps.Geocoder();
        var autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('mvx_user_location')
        );

        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', function () {
            var place = autocomplete.getPlace();
            if (!place.geometry) return;

            map.setCenter(place.geometry.location);
            marker.setPosition(place.geometry.location);

            bindData(
                place.formatted_address,
                place.geometry.location.lat(),
                place.geometry.location.lng()
            );
        });

        google.maps.event.addListener(marker, 'dragend', function () {
            geocoder.geocode({ location: marker.getPosition() }, function (res, status) {
                if (status === 'OK' && res[0]) {
                    bindData(
                        res[0].formatted_address,
                        marker.getPosition().lat(),
                        marker.getPosition().lng()
                    );
                }
            });
        });
    }

    /* -----------------------------
     * MAPBOX (NEW)
     * ----------------------------- */
    function initMapboxMap(opts) {
        mapboxgl.accessToken = opts.mapbox_token;

        var lat = $('#multivendorx_user_location_lat').val() || opts.default_lat;
        var lng = $('#multivendorx_user_location_lng').val() || opts.default_lng;

        var map = new mapboxgl.Map({
            container: 'mvx-user-locaton-map',
            style: opts.mapbox_style,
            center: [lng, lat],
            zoom: opts.default_zoom
        });

        var marker = new mapboxgl.Marker({ draggable: true })
            .setLngLat([lng, lat])
            .addTo(map);

        marker.on('dragend', function () {
            var pos = marker.getLngLat();
            reverseGeocodeMapbox(pos.lat, pos.lng);
        });

        $('#mvx_user_location').on('change', function () {
            geocodeMapbox($(this).val(), map, marker);
        });
    }

    function geocodeMapbox(query, map, marker) {
        $.get(
            'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                encodeURIComponent(query) + '.json',
            {
                access_token: opts.mapbox_token,
                limit: 1
            },
            function (res) {
                if (!res.features || !res.features.length) return;

                var c = res.features[0].center;
                marker.setLngLat(c);
                map.flyTo({ center: c });

                bindData(res.features[0].place_name, c[1], c[0]);
            }
        );
    }

    function reverseGeocodeMapbox(lat, lng) {
        $.get(
            'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                lng + ',' + lat + '.json',
            {
                access_token: opts.mapbox_token,
                limit: 1
            },
            function (res) {
                if (res.features && res.features.length) {
                    bindData(res.features[0].place_name, lat, lng);
                }
            }
        );
    }

    /* -----------------------------
     * SHARED DATA PIPELINE
     * ----------------------------- */
    function bindData(address, lat, lng) {
        $('#multivendorx_user_location').val(address);
        $('#multivendorx_user_location_lat').val(lat);
        $('#multivendorx_user_location_lng').val(lng);
        $(document.body).trigger('update_checkout');
    }
});
