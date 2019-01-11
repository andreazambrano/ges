function dairy_farm_googlemap_init(dom_obj, coords) {
	"use strict";
	if (typeof DAIRY_FARM_STORAGE['googlemap_init_obj'] == 'undefined') dairy_farm_googlemap_init_styles();
	DAIRY_FARM_STORAGE['googlemap_init_obj'].geocoder = '';
	try {
		var id = dom_obj.id;
		DAIRY_FARM_STORAGE['googlemap_init_obj'][id] = {
			dom: dom_obj,
			markers: coords.markers,
			geocoder_request: false,
			opt: {
				zoom: coords.zoom,
				center: null,
				scrollwheel: false,
				scaleControl: false,
				disableDefaultUI: false,
				panControl: true,
				zoomControl: true, //zoom
				mapTypeControl: false,
				streetViewControl: false,
				overviewMapControl: false,
				styles: DAIRY_FARM_STORAGE['googlemap_styles'][coords.style ? coords.style : 'default'],
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
		};
		
		dairy_farm_googlemap_create(id);

	} catch (e) {
		
		dcl(DAIRY_FARM_STORAGE['strings']['googlemap_not_avail']);

	};
}

function dairy_farm_googlemap_create(id) {
	"use strict";

	// Create map
	DAIRY_FARM_STORAGE['googlemap_init_obj'][id].map = new google.maps.Map(DAIRY_FARM_STORAGE['googlemap_init_obj'][id].dom, DAIRY_FARM_STORAGE['googlemap_init_obj'][id].opt);

	// Add markers
	for (var i in DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers)
		DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].inited = false;
	dairy_farm_googlemap_add_markers(id);
	
	// Add resize listener
	jQuery(window).resize(function() {
		if (DAIRY_FARM_STORAGE['googlemap_init_obj'][id].map)
			DAIRY_FARM_STORAGE['googlemap_init_obj'][id].map.setCenter(DAIRY_FARM_STORAGE['googlemap_init_obj'][id].opt.center);
	});
}

function dairy_farm_googlemap_add_markers(id) {
	"use strict";
	for (var i in DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers) {
		
		if (DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].inited) continue;
		
		if (DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].latlng == '') {
			
			if (DAIRY_FARM_STORAGE['googlemap_init_obj'][id].geocoder_request!==false) continue;
			
			if (DAIRY_FARM_STORAGE['googlemap_init_obj'].geocoder == '') DAIRY_FARM_STORAGE['googlemap_init_obj'].geocoder = new google.maps.Geocoder();
			DAIRY_FARM_STORAGE['googlemap_init_obj'][id].geocoder_request = i;
			DAIRY_FARM_STORAGE['googlemap_init_obj'].geocoder.geocode({address: DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].address}, function(results, status) {
				"use strict";
				if (status == google.maps.GeocoderStatus.OK) {
					var idx = DAIRY_FARM_STORAGE['googlemap_init_obj'][id].geocoder_request;
					if (results[0].geometry.location.lat && results[0].geometry.location.lng) {
						DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = '' + results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					} else {
						DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = results[0].geometry.location.toString().replace(/\(\)/g, '');
					}
					DAIRY_FARM_STORAGE['googlemap_init_obj'][id].geocoder_request = false;
					setTimeout(function() { 
						dairy_farm_googlemap_add_markers(id); 
						}, 200);
				} else
					dcl(DAIRY_FARM_STORAGE['strings']['geocode_error'] + ' ' + status);
			});
		
		} else {
			
			// Prepare marker object
			var latlngStr = DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].latlng.split(',');
			var markerInit = {
				map: DAIRY_FARM_STORAGE['googlemap_init_obj'][id].map,
				position: new google.maps.LatLng(latlngStr[0], latlngStr[1]),
				clickable: DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].description!=''
			};
			if (DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].point) markerInit.icon = DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].point;
			if (DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].title) markerInit.title = DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].title;
			DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].marker = new google.maps.Marker(markerInit);
			
			// Set Map center
			if (DAIRY_FARM_STORAGE['googlemap_init_obj'][id].opt.center == null) {
				DAIRY_FARM_STORAGE['googlemap_init_obj'][id].opt.center = markerInit.position;
				DAIRY_FARM_STORAGE['googlemap_init_obj'][id].map.setCenter(DAIRY_FARM_STORAGE['googlemap_init_obj'][id].opt.center);				
			}
			
			// Add description window
			if (DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].description!='') {
				DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].infowindow = new google.maps.InfoWindow({
					content: DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].description
				});
				google.maps.event.addListener(DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].marker, "click", function(e) {
					var latlng = e.latLng.toString().replace("(", '').replace(")", "").replace(" ", "");
					for (var i in DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers) {
						if (latlng == DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].latlng) {
							DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].infowindow.open(
								DAIRY_FARM_STORAGE['googlemap_init_obj'][id].map,
								DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].marker
							);
							break;
						}
					}
				});
			}
			
			DAIRY_FARM_STORAGE['googlemap_init_obj'][id].markers[i].inited = true;
		}
	}
}

function dairy_farm_googlemap_refresh() {
	"use strict";
	for (id in DAIRY_FARM_STORAGE['googlemap_init_obj']) {
		dairy_farm_googlemap_create(id);
	}
}

function dairy_farm_googlemap_init_styles() {
	"use strict";
	// Init Google map
	DAIRY_FARM_STORAGE['googlemap_init_obj'] = {};
	DAIRY_FARM_STORAGE['googlemap_styles'] = {
		'default': []
	};
	if (window.dairy_farm_theme_googlemap_styles!==undefined)
		DAIRY_FARM_STORAGE['googlemap_styles'] = dairy_farm_theme_googlemap_styles(DAIRY_FARM_STORAGE['googlemap_styles']);
}