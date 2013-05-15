var map;


  function init(){
    //initiate variables
	var bins = {};
	var title = '';
	
    // initiate leaflet map
    map = new L.Map('map', { 
      center: [ 40.805494,-77.233887],
      zoom: 7
    })

	bins_pCyber = {
		  "#54278F": "6.1 to 18%",
          "#756BB1": "4.1 to 6%",
		  "#9E9AC8": "2.1 to 4%",
		  "#CBC9E2": "1.1 to 2%",
		  "#F2F0F7": "Less than 1%"
        };
	//bins_charter = {
    //       "#2E3F8A": "<strong>High</strong> (32.9 to 100%)",
	//	   "#4A60C3": "<strong>Above average</strong> (26.4 to 32.8%)",
	//	   "#8A98D8": "<strong>Below average</strong> (20.0 to 26.3%)",
	//	   "#CAD0ED": "<strong>Low</strong> (0 to 19.9%)"
    //    };

	//bins_specAdmit = {
	//      "#2E3F8A": "<strong>High</strong> (26.8 to 100%)",
	//	  "#4A60C3": "<strong>Above average</strong> (18.4 to 26.7%)",
	//	  "#8A98D8": "<strong>Below average</strong> (10.0 to 18.3%)",
	//	  "#CAD0ED": "<strong>Low</strong> (0 to 9.9%)"
    //    };
		
	//bins_cityWide = {
    //      "#2E3F8A": "<strong>High</strong> (14.4 to 100%)",
	//	  "#4A60C3": "<strong>Above average</strong> (11.2 to 14.3%)",
	//	  "#8A98D8": "<strong>Below average</strong> (8.1 to 11.1%)",
	//	  "#CAD0ED": "<strong>Low</strong> (0 to 8.0%)" 
    //    };
	
	var title_pCyber = 'Percent of students attending a <span style="text-decoration:underline;">Cyber Charter</span> school'; 
	//var title_charter = 'Percent of students attending a <span style="text-decoration:underline;">charter</span> high school';
	//var title_specAdmit = 'Percent of students attending a <span style="text-decoration:underline;">magnet</span> high school';
	//var title_cityWide = 'Percent of students attending a <span style="text-decoration:underline;">citywide, vo-tech, or military</span> high school';

    L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
      attribution: 'Map by <a href="http://www.manetomapping.com">Michelle Schmitt</a> and Todd Vachon for <a href="http://www.newsworks.org">NewsWorks.org</a>'
    }).addTo(map);
	

    
	var layerUrl_cybers = 'http://manetomapping.cartodb.com/api/v1/viz/cybercharters/viz.json';
	

    var layerOptions_cybers = {
            query: "SELECT * FROM cybercharters",
            tile_style: "#cybercharters{line-color: #FFF;line-opacity: 1;line-width: 1;polygon-opacity: 0.8;}#cybercharters [ pct_enroll_13 <= 18] {polygon-fill: #54278F;}#cybercharters [ pct_enroll_13 <= 7] {polygon-fill: #756BB1;}#cybercharters [ pct_enroll_13 <= 4] {polygon-fill: #9E9AC8;}#cybercharters [ pct_enroll_13 <= 2] { polygon-fill: #CBC9E2;}#cybercharters [ pct_enroll_13 <= 1] {polygon-fill: #F2F0F7;}",
			interactivity: "labelname",
			infowindow: false,
			cartodb_logo: false	
	}

	
    var layers = [];


	CartoDBLegend(bins_pCyber,title_pCyber);

    cartodb.createLayer(map, layerUrl_cybers, layerOptions_cybers)
     .on('done', function(layer) {
      map.addLayer(layer);
      layers.push(layer);
	 layer
	 .on('error', function() {
	})
	  .on('featureOver', function(e, latlng, pos, data) {
		document.body.style.cursor = "pointer";
		showTooltip(data,pos)
	})
	  .on('featureOut', function(e, latlng, pos, data) {
		document.body.style.cursor = "default";
		hideTooltip();
	})
	
	
	});
	
	
	$('#c2').click(function() {
		if ($(this).is(':checked')) {
			layers[2].setQuery("SELECT * FROM philadelphiaschools201201_closures  WHERE action Like '%Close%' AND facil_type = 'School' AND grade_leve like '%High%'");
			layers[2].setCartoCSS("#philadelphiaschools201201_closures  {[mapnik-geometry-type=point] {marker-fill: #FF0000;marker-opacity: 1; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
			return true;
        }
		else{
			layers[2].setQuery("SELECT * FROM philadelphiaschools201201_closures where cartodb_id = 0 ");
			return true;
		}
	});
	
    $('.button').click(function(){
      $('.button').removeClass('selected'); $(this).addClass('selected');
      LayerActions[$(this).attr('id')]();
    })	

	function legendClear(){
		$("#legend").empty();
	};
	
	function CartoDBLegend(bins,title){
	  legendClear();
	  $ = cartodb.$;
      var mapL = $('#legend');
      var title = $('<span>').html(title);
      var holder = $('<div>').attr('class', 'title');
          holder.append(title);
          mapL.append(holder);
      for (i in bins) {
        var key = $('<span>').attr('class', 'box'); // can take 'box', 'line', or 'circle' type here for customizing your legend
            key.css('background', i);
        var val = $('<span>').attr('class', 'value');
            val.html(bins[i]);
        var row = $('<div>').attr('class', 'row');
            row.append(key);
            row.append(val);
        mapL.append(row)
      }
    }
	
   var LayerActions = {
      none: function(){
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FF0000;marker-opacity: 0; marker-line-opacity: 0; }} ");
          return true;
        },
	  pcharter: function(){
          layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: 0.7;line-width: 0.5;polygon-opacity: 0.8;}#newsworks_hscatchment [ pcharterall <= 100] {polygon-fill: #2E3F8A;}#newsworks_hscatchment [ pcharterall <= 32.9] {polygon-fill: #4A60C3;}#newsworks_hscatchment [ pcharterall <= 26.4] {polygon-fill: #8A98D8;}#newsworks_hscatchment [ pcharterall <= 20.0]  {polygon-fill: #CAD0ED;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE instit_typ = 'Charter' AND grade_leve like '%High%' AND facil_type = 'School' AND active = 'y'");
		 layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_charter,title_charter);
		  return true;
        },
	  pneighborhood: function(){
		  layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: 0.7;line-width: 0.5;polygon-opacity: 0.8;}#newsworks_hscatchment [ p_innabe <= 100] {polygon-fill: #2E3F8A;}#newsworks_hscatchment [ p_innabe <= 40.7] {polygon-fill: #4A60C3;} #newsworks_hscatchment [ p_innabe <= 30.7] {polygon-fill: #8A98D8;}#newsworks_hscatchment [ p_innabe <= 20.7]{polygon-fill: #CAD0ED;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE instit_typ = 'District' AND grade_leve like '%High%' AND facil_type = 'School' AND active = 'y' AND type IS NULL ");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_nabe,title_nabe);
		  return true;
        },
	  pSpecAdmit: function(){
		  layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: 0.7;line-width: 0.5;polygon-opacity: 0.8;}#newsworks_hscatchment [ pspecadmit <= 100]{polygon-fill: #2E3F8A;}#newsworks_hscatchment [ pspecadmit <= 26.8] {polygon-fill: #4A60C3;}#newsworks_hscatchment [ pspecadmit <= 18.4] {polygon-fill: #8A98D8;}#newsworks_hscatchment [ pspecadmit <= 10.0] {polygon-fill: #CAD0ED;polygon-opacity: 0.9;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE type = 'Special Admission' AND grade_leve like '%High%' AND facil_type = 'School' AND active = 'y'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_specAdmit,title_specAdmit);
		  return true;
        },		
	  pCitywide: function(){
		  layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: 0.7;line-width: 0.5;polygon-opacity: 0.8;}#newsworks_hscatchment [ pcitymiltcte <= 100] {polygon-fill: #2E3F8A;}#newsworks_hscatchment [ pcitymiltcte <= 14.4] {polygon-fill: #4A60C3;}#newsworks_hscatchment [ pcitymiltcte <= 11.2] {polygon-fill: #8A98D8;}#newsworks_hscatchment [ pcitymiltcte <= 8.1] {polygon-fill: #CAD0ED;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE type = 'Citywide Admission' AND grade_leve like '%High%' AND facil_type = 'School' AND active = 'y'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_cityWide,title_cityWide);
		  return true;
        }	
    }	

 function showTooltip(data,point) {
      var html = "";
     
      var name = (data["labelname"]!="")?data["labelname"]:"Unknown";
      html += "<p>" + name +"</p>";

           
      $("#tooltip").html(html);
      $("#tooltip").css({left: (point.x + 15) + 'px', top: point.y - ($("#tooltip").height()) + 10 + 'px'})
      $("#tooltip").show();
    }
 
    function hideTooltip() {
      $("#tooltip").hide();
    }



	
  }

	
	
  
