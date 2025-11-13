jQuery(document).ready(function($) {
    var mvx_checkout_map_options = distanceShippingFrontend;
    var map, geocoder, marker, infowindow;

    function initialize() {
        var lat = $("#mvx_user_location_lat").val() || mvx_checkout_map_options.default_lat;
        var lng = $("#mvx_user_location_lng").val() || mvx_checkout_map_options.default_lng;
        var address = $("#mvx_user_location").val() || '';

        var latlng = new google.maps.LatLng(lat, lng);

        map = new google.maps.Map(document.getElementById("mvx-user-locaton-map"), {
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: parseInt(mvx_checkout_map_options.default_zoom)
        });

        marker = new google.maps.Marker({
            map: map,
            position: latlng,
            draggable: true
        });

        geocoder = new google.maps.Geocoder();
        infowindow = new google.maps.InfoWindow();

        var mvx_user_location_input = document.getElementById("mvx_user_location");
        var autocomplete = new google.maps.places.Autocomplete(mvx_user_location_input);
        autocomplete.bindTo("bounds", map);

        // ✅ If no address in input, reverse geocode default coordinates
        if (!address) {
            geocoder.geocode({ 'location': latlng }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    $("#mvx_user_location").val(results[0].formatted_address);
                    bindDataToForm(results[0].formatted_address, lat, lng);
                    infowindow.setContent(results[0].formatted_address);
                    infowindow.open(map, marker);
                } else {
                    // fallback if geocode fails
                    $("#mvx_user_location").val('Default Location');
                    bindDataToForm('Default Location', lat, lng);
                    infowindow.setContent('Default Location');
                    infowindow.open(map, marker);
                }
            });
        }

        autocomplete.addListener("place_changed", function() {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) return;

            if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
            else map.setCenter(place.geometry.location);

            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            bindDataToForm(place.formatted_address, place.geometry.location.lat(), place.geometry.location.lng());
            infowindow.setContent(place.formatted_address);
            infowindow.open(map, marker);
        });

        google.maps.event.addListener(marker, "dragend", function() {
            geocoder.geocode({"latLng": marker.getPosition()}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    bindDataToForm(results[0].formatted_address, marker.getPosition().lat(), marker.getPosition().lng());
                    infowindow.setContent(results[0].formatted_address);
                    infowindow.open(map, marker);
                }
            });
        });
    }

    function bindDataToForm(address, lat, lng) {
        $("#mvx_user_location").val(address);
        $("#mvx_user_location_lat").val(lat);
        $("#mvx_user_location_lng").val(lng);
        $(document.body).trigger('update_checkout');
    }

    if ($("#mvx_user_location_lat").length > 0) {
        setTimeout(initialize, 1000);
    }
});
