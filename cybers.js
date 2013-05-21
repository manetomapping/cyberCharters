var map;


  function init(){
    //initiate variables
	var bins = {};
	var title = '';
	
	// clear all items from any previous intances
	function legendClear(){
		$("#legend").empty()
	};
	
	function searchBoxClear(){
		$("#tags").empty();
	};
	
	function infoTableClear(){
		$("#infoTable").empty();
	};
	
	function infoContainerClear(){
		$("#infocontainer").empty();
	};

	//Clear everything
	//infoContainerClear();
	infoTableClear();
	searchBoxClear();
	
    // initiate leaflet map
    map = new L.Map('map', { 
      center: [ 39.9,-77.7],
      zoom: 7
    })

	bins_pCyber = {
  		  "#6b1e1b": "+101% or more",
          "#f0433c": "+51 to 100%",
		  "#f79e9b": "+1 to 50%",
		  "#ccc": "No change/decline"
        };

	var title_pCyber = 'KEY: Percent change in estimated payments to cyber charters <span id="infolink"><a href="http://www.manetomapping.com/clients/newsworks/cybers/RFA_dataInfo.pdf" target="_blank"> More about this map</a></span>'; 

    L.tileLayer('http://{s}.tile.cloudmade.com/15ff4c5331ce43558da101738bb53492/72990/256/{z}/{x}/{y}.png', {
      attribution: 'Map by <a href="http://www.manetomapping.com">Michelle Schmitt</a> and Todd Vachon for <a href="http://www.newsworks.org">NewsWorks.org</a>;Data Analysis by <a href="http://www.researchforaction.org">Research for Action</a>', key: '15ff4c5331ce43558da101738bb53492'
    }).addTo(map);
	
	var layerUrl_cybers = 'http://manetomapping.cartodb.com/api/v1/viz/cybercharters/viz.json';
	
    var layerOptions_cybers = {
            query: "SELECT * FROM cybercharters",
            tile_style: "#cybercharters{line-color: #666;line-opacity: .5;line-width: .5; polygon-opacity: 0.6;}#cybercharters [ pct_change_10_13 <= 600.0] {polygon-fill: #6b1e1b;}#cybercharters [ pct_change_10_13 <= 100] {polygon-fill: #f0433c;}#cybercharters [ pct_change_10_13 <= 50] {polygon-fill: #f79e9b;}#cybercharters [ pct_change_10_13 <= 0] { polygon-fill: #ccc;}",
			interactivity: "labelname",
			infowindow: false,
			cartodb_logo: false	
	}

	
    var layers = [];

	
	function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
		document.body.style.cursor = "pointer";
		hideTooltip();
	})
	  .on('featureClick', function(e, latlng, pos, data) {
  			document.body.style.cursor = "pointer";
			$('resultTable').empty();
			$('#resultTable_container').html("");
			var searchstring = data["labelname"]; 
		
		$.getJSON("http://manetomapping.cartodb.com/api/v2/sql?q=SELECT labelname, geoid, Total_Exp_Cyber_10, Total_Exp_Cyber_13, PCT_exp_change_10_13, Total_Cyber_10, Total_Cyber_13, Pct_change_10_13, Exp_reg13, Exp_spc13, PCT_enroll_13  FROM cybercharters WHERE labelname ='" +searchstring+ "' LIMIT 1", function(data) {
			
			$table += "<div id = 'SDName'><p><strong>" + data.rows[0].labelname + ":</strong></p></div>";
			$table += "<table id ='resultTable' ><tr><td></td><td><strong>2010</strong></td><td><strong>2013</strong></td><td><strong>Change</strong></td></tr>";
			$table += "<tr><td>Estimated payments to cyber charters</td>";
			$table += "<td>$" + numberWithCommas(Math.round(data.rows[0].total_exp_cyber_10))  + "</td>";
			$table += "<td>$" + numberWithCommas(Math.round(data.rows[0].total_exp_cyber_13)) + "</td>";
			$table += "<td><strong>" + Number((data.rows[0].pct_exp_change_10_13).toFixed(1)) + "%</strong></td>";
			$table += "</tr><tr>";
			$table += "<td>Cyber charter enrollment</td>";
			$table += "<td>" + data.rows[0].total_cyber_10  + "</td>";
			$table += "<td>" + data.rows[0].total_cyber_13 + "</td>";
			$table += "<td><strong>" + Number((data.rows[0].pct_change_10_13).toFixed(1)) + "%</strong></td>";
			$table += "</tr></table>";
			$table += "<div id='admstuff'>";
			$table += "2013 percent of all public school students attending cybers: <strong>" + Number((data.rows[0].pct_enroll_13).toFixed(1)) + "%</strong><br />";
			$table += "2013 per-pupil payment to charters/cybers, regular education: <strong>$" + numberWithCommas(Math.round(data.rows[0].exp_reg13)) + "</strong><br />";
			$table += "2013 per-pupil payment to charters/cybers, special education: <strong>$" + numberWithCommas(Math.round(data.rows[0].exp_spc13))+ "</strong></div>";
			$table += "</div>";
			$('#infoTable').empty();
			$('#infoTable').append($table);
			$table = "";
			$('#tags').val(""); 
			//$table = "<table id = 'resultTable'><td>2010</td><td>2013</td><td>% change</td><tr>";
		});
  
     });
	  

	});
	

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
	
   

//$table = "<table id = 'resultTable'><td>2010</td><td>2013</td><td>% change</td><tr>"
$table = "<div id = 'resultTable_container'>";




		$('#searchbutton').click(function(){
		
			//$('#infoTable').html("");
			$('resultTable').empty();
			$('#resultTable_container').html("");
			//$('#tags').val(""); 
			var searchstring = $('#tags').val(); 
		$.getJSON("http://manetomapping.cartodb.com/api/v2/sql?q=SELECT labelname, geoid, Total_Exp_Cyber_10, Total_Exp_Cyber_13, PCT_exp_change_10_13, Total_Cyber_10, Total_Cyber_13, Pct_change_10_13, Exp_reg13, Exp_spc13, pct_enroll_13  FROM cybercharters WHERE labelname ='" +searchstring+ "' LIMIT 1", function(data) {
			
			$table += "<div id = 'SDName'><p><strong>" + data.rows[0].labelname + "</strong></p></div>";
			$table += "<table id ='resultTable' ><tr><td></td><td><strong>2010</strong></td><td><strong>2013</strong></td><td><strong>Change</strong></td></tr>";
			$table += "<tr><td>Estimated payments to cyber charters</td>";
			$table += "<td>$" + numberWithCommas(Math.round(data.rows[0].total_exp_cyber_10)) + "</td>";
			$table += "<td>$" + numberWithCommas(Math.round(data.rows[0].total_exp_cyber_13)) + "</td>";
			$table += "<td><strong>" + Number((data.rows[0].pct_exp_change_10_13).toFixed(1)) + "%</strong></td>";
			$table += "</tr><tr>";
			$table += "<td>Cyber charter enrollment</td>";
			$table += "<td>" + data.rows[0].total_cyber_10  + "</td>";
			$table += "<td>" + data.rows[0].total_cyber_13 + "</td>";
			$table += "<td><strong>" +  Number((data.rows[0].pct_change_10_13).toFixed(1)) + "%</strong></td>";
			$table += "</tr></table>";
			$table += "<div id='admstuff'>";
			$table += "2013 Pct. of all public school students attending cybers:" + Number((data.rows[0].pct_enroll_13).toFixed(1)) + "%<br />";
			$table += "2013 per-pupil payment to charters/cybers, regular education: $" + numberWithCommas(Math.round(data.rows[0].exp_reg13)) + "<br />";
			$table += "2013 per-pupil payment to charters/cybers, special education: $" + numberWithCommas(Math.round(data.rows[0].exp_spc13)) + "</div>";
			$table += "</div>";
			$('#infoTable').empty();
			$('#infoTable').append($table);
			$table = "";
			$('#tags').val(""); 
			//$table = "<table id = 'resultTable'><td>2010</td><td>2013</td><td>% change</td><tr>";
		});
	 
		});


//Hover event to show name of school district using the map
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



//Autocomplete for school district search
 $(function() {
	var availableSDs = [
		"Abington Heights School District",
		"Abington School District",
		"Albert Gallatin Area School District",
		"Aliquippa School District",
		"Allegheny Valley School District",
		"Allegheny-Clarion Valley School District",
		"Allentown City School District",
		"Altoona Area School District",
		"Ambridge Area School District",
		"Annville-Cleona School District",
		"Antietam School District",
		"Apollo-Ridge School District",
		"Armstrong School District",
		"Athens Area School District",
		"Austin Area School District",
		"Avella Area School District",
		"Avon Grove School District",
		"Avonworth School District",
		"Bald Eagle Area School District",
		"Baldwin-Whitehall School District",
		"Bangor Area School District",
		"Beaver Area School District",
		"Bedford Area School District",
		"Belle Vernon Area School District",
		"Bellefonte Area School District",
		"Bellwood-Antis School District",
		"Bensalem Township School District",
		"Benton Area School District",
		"Bentworth School District",
		"Berlin Brothersvalley School District",
		"Bermudian Springs School District",
		"Berwick Area School District",
		"Bethel Park School District",
		"Bethlehem Area School District",
		"Bethlehem-Center School District",
		"Big Beaver Falls Area School District",
		"Big Spring School District",
		"Blackhawk School District",
		"Blacklick Valley School District",
		"Blairsville-Saltsburg School District",
		"Bloomsburg Area School District",
		"Blue Mountain School District",
		"Blue Ridge School District",
		"Boyertown Area School District",
		"Bradford Area School District",
		"Brandywine Heights Area School District",
		"Brentwood Borough School District",
		"Bristol Borough School District",
		"Bristol Township School District",
		"Brockway Area School District",
		"Brookville Area School District",
		"Brownsville Area School District",
		"Bryn Athyn School District",
		"Burgettstown Area School District",
		"Burrell School District",
		"Butler Area School District",
		"California Area School District",
		"Cambria Heights School District",
		"Cameron County School District",
		"Camp Hill School District",
		"Canon-McMillan School District",
		"Canton Area School District",
		"Carbondale Area School District",
		"Carlisle Area School District",
		"Carlynton School District",
		"Carmichaels Area School District",
		"Catasauqua Area School District",
		"Centennial School District",
		"Central Bucks School District",
		"Central Cambria School District",
		"Central Columbia School District",
		"Central Dauphin School District",
		"Central Fulton School District",
		"Central Greene School District",
		"Central Valley School District",
		"Central York School District",
		"Chambersburg Area School District",
		"Charleroi School District",
		"Chartiers Valley School District",
		"Chartiers-Houston School District",
		"Cheltenham Township School District",
		"Chester-Upland School District",
		"Chestnut Ridge School District",
		"Chichester School District",
		"Clairton City School District",
		"Clarion Area School District",
		"Clarion-Limestone Area School District",
		"Claysburg-Kimmel School District",
		"Clearfield Area School District",
		"Coatesville Area School District",
		"Cocalico School District",
		"Colonial School District",
		"Columbia Borough School District",
		"Commodore Perry School District",
		"Conemaugh Township Area School District",
		"Conemaugh Valley School District",
		"Conestoga Valley School District",
		"Conewago Valley School District",
		"Conneaut School District",
		"Connellsville Area School District",
		"Conrad Weiser Area School District",
		"Cornell School District",
		"Cornwall-Lebanon School District",
		"Corry Area School District",
		"Coudersport Area School District",
		"Council Rock School District",
		"Cranberry Area School District",
		"Crawford Central School District",
		"Crestwood School District",
		"Cumberland Valley School District",
		"Curwensville Area School District",
		"Dallas School District",
		"Dallastown Area School District",
		"Daniel Boone Area School District",
		"Danville Area School District",
		"Deer Lakes School District",
		"Delaware Valley School District",
		"Derry Area School District",
		"Derry Township School District",
		"Donegal School District",
		"Dover Area School District",
		"Downingtown Area School District",
		"DuBois Area School District",
		"Dunmore School District",
		"Duquesne City School District",
		"East Allegheny School District",
		"East Lycoming School District",
		"East Penn School District",
		"East Pennsboro Area School District",
		"East Stroudsburg Area School District",
		"Eastern Lancaster County School District",
		"Eastern Lebanon County School District",
		"Eastern York School District",
		"Easton Area School District",
		"Elizabeth Forward School District",
		"Elizabethtown Area School District",
		"Elk Lake School District",
		"Ellwood City Area School District",
		"Ephrata Area School District",
		"Erie City School District",
		"Everett Area School District",
		"Exeter Township School District",
		"Fairfield Area School District",
		"Fairview School District",
		"Fannett-Metal School District",
		"Farrell Area School District",
		"Ferndale Area School District",
		"Fleetwood Area School District",
		"Forbes Road School District",
		"Forest Area School District",
		"Forest City Regional School District",
		"Forest Hills School District",
		"Fort Cherry School District",
		"Fort LeBoeuf School District",
		"Fox Chapel Area School District",
		"Franklin Area School District",
		"Franklin Regional School District",
		"Frazier School District",
		"Freedom Area School District",
		"Freeport Area School District",
		"Galeton Area School District",
		"Garnet Valley School District",
		"Gateway School District",
		"General McLane School District",
		"Gettysburg Area School District",
		"Girard School District",
		"Glendale School District",
		"Governor Mifflin School District",
		"Great Valley School District",
		"Greater Johnstown School District",
		"Greater Latrobe School District",
		"Greater Nanticoke Area School District",
		"Greencastle-Antrim School District",
		"Greensburg Salem School District",
		"Greenville Area School District",
		"Greenwood School District",
		"Grove City Area School District",
		"Halifax Area School District",
		"Hamburg Area School District",
		"Hampton Township School District",
		"Hanover Area School District",
		"Hanover Public School District",
		"Harbor Creek School District",
		"Harmony Area School District",
		"Harrisburg City School District",
		"Hatboro-Horsham School District",
		"Haverford Township School District",
		"Hazleton Area School District",
		"Hempfield Area School District",
		"Hempfield School District",
		"Hermitage School District",
		"Highlands School District",
		"Hollidaysburg Area School District",
		"Homer-Center School District",
		"Hopewell Area School District",
		"Huntingdon Area School District",
		"Indiana Area School District",
		"Interboro School District",
		"Iroquois School District",
		"Jamestown Area School District",
		"Jeannette City School District",
		"Jefferson-Morgan School District",
		"Jenkintown School District",
		"Jersey Shore Area School District",
		"Jim Thorpe Area School District",
		"Johnsonburg Area School District",
		"Juniata County School District",
		"Juniata Valley School District",
		"Kane Area School District",
		"Karns City Area School District",
		"Kennett Consolidated School District",
		"Keystone Central School District",
		"Keystone Oaks School District",
		"Keystone School District",
		"Kiski Area School District",
		"Kutztown Area School District",
		"Lackawanna Trail School District",
		"Lakeland School District",
		"Lake-Lehman School District",
		"Lakeview School District",
		"Lampeter-Strasburg School District",
		"Lancaster School District",
		"Laurel Highlands School District",
		"Laurel School District",
		"Lebanon School District",
		"Leechburg Area School District",
		"Lehighton Area School District",
		"Lewisburg Area School District",
		"Ligonier Valley School District",
		"Line Mountain School District",
		"Littlestown Area School District",
		"Lower Dauphin School District",
		"Lower Merion School District",
		"Lower Moreland Township School District",
		"Loyalsock Township School District",
		"Mahanoy Area School District",
		"Manheim Central School District",
		"Manheim Township School District",
		"Marion Center Area School District",
		"Marple Newtown School District",
		"Mars Area School District",
		"McGuffey School District",
		"McKeesport Area School District",
		"Mechanicsburg Area School District",
		"Mercer Area School District",
		"Methacton School District",
		"Meyersdale Area School District",
		"Mid Valley School District",
		"Middletown Area School District",
		"Midd-West School District",
		"Midland Borough School District",
		"Mifflin County School District",
		"Mifflinburg Area School District",
		"Millcreek Township School District",
		"Millersburg Area School District",
		"Millville Area School District",
		"Milton Area School District",
		"Minersville Area School District",
		"Mohawk Area School District",
		"Monessen City School District",
		"Moniteau School District",
		"Montgomery Area School District",
		"Montour School District",
		"Montoursville Area School District",
		"Montrose Area School District",
		"Moon Area School District",
		"Morrisville Borough School District",
		"Moshannon Valley School District",
		"Mount Carmel Area School District",
		"Mount Pleasant Area School District",
		"Mount Union Area School District",
		"Mountain View School District",
		"Mt. Lebanon School District",
		"Muhlenberg School District",
		"Muncy School District",
		"Nazareth Area School District",
		"Neshaminy School District",
		"Neshannock Township School District",
		"New Brighton Area School District",
		"New Castle Area School District",
		"New Hope-Solebury School District",
		"New Kensington-Arnold School District",
		"Newport School District",
		"Norristown Area School District",
		"North Allegheny School District",
		"North Clarion County School District",
		"North East School District",
		"North Hills School District",
		"North Penn School District",
		"North Pocono School District",
		"North Schuylkill School District",
		"North Star School District",
		"Northampton Area School District",
		"Northeast Bradford School District",
		"Northeastern York School District",
		"Northern Bedford County School District",
		"Northern Cambria School District",
		"Northern Lebanon School District",
		"Northern Lehigh School District",
		"Northern Potter School District",
		"Northern Tioga School District",
		"Northern York County School District",
		"Northgate School District",
		"Northwest Area School District",
		"Northwestern Lehigh School District",
		"Northwestern School District",
		"Norwin School District",
		"Octorara Area School District",
		"Oil City Area School District",
		"Old Forge School District",
		"Oley Valley School District",
		"Oswayo Valley School District",
		"Otto-Eldred School District",
		"Owen J. Roberts School District",
		"Oxford Area School District",
		"Palisades School District",
		"Palmerton Area School District",
		"Palmyra Area School District",
		"Panther Valley School District",
		"Parkland School District",
		"Pen Argyl Area School District",
		"Penn Cambria School District",
		"Penn Hills School District",
		"Penn Manor School District",
		"Penncrest School District",
		"Penn-Delco School District",
		"Pennridge School District",
		"Penns Manor Area School District",
		"Penns Valley Area School District",
		"Pennsbury School District",
		"Penn-Trafford School District",
		"Pequea Valley School District",
		"Perkiomen Valley School District",
		"Peters Township School District",
		"Philadelphia City School District",
		"Philipsburg-Osceola Area School District",
		"Phoenixville Area School District",
		"Pine Grove Area School District",
		"Pine-Richland School District",
		"Pittsburgh School District",
		"Pittston Area School District",
		"Pleasant Valley School District",
		"Plum Borough School District",
		"Pocono Mountain School District",
		"Port Allegany School District",
		"Portage Area School District",
		"Pottsgrove School District",
		"Pottstown School District",
		"Pottsville Area School District",
		"Punxsutawney Area School District",
		"Purchase Line School District",
		"Quaker Valley School District",
		"Quakertown Community School District",
		"Radnor Township School District",
		"Reading School District",
		"Red Lion Area School District",
		"Redbank Valley School District",
		"Reynolds School District",
		"Richland School District",
		"Ridgway Area School District",
		"Ridley School District",
		"Ringgold School District",
		"Riverside Beaver County School District",
		"Riverside School District",
		"Riverview School District",
		"Rochester Area School District",
		"Rockwood Area School District",
		"Rose Tree Media School District",
		"Saint Clair Area School District",
		"Salisbury Township School District",
		"Salisbury-Elk Lick School District",
		"Saucon Valley School District",
		"Sayre Area School District",
		"School District Not Defined",
		"Schuylkill Haven Area School District",
		"Schuylkill Valley School District",
		"Scranton School District",
		"Selinsgrove Area School District",
		"Seneca Valley School District",
		"Shade-Central City School District",
		"Shaler Area School District",
		"Shamokin Area School District",
		"Shanksville-Stonycreek School District",
		"Sharon City School District",
		"Sharpsville Area School District",
		"Shenandoah Valley School District",
		"Shenango Area School District",
		"Shikellamy School District",
		"Shippensburg Area School District",
		"Slippery Rock Area School District",
		"Smethport Area School District",
		"Solanco School District",
		"Somerset Area School District",
		"Souderton Area School District",
		"South Allegheny School District",
		"South Butler County School District",
		"South Eastern School District",
		"South Fayette Township School District",
		"South Middleton School District",
		"South Park School District",
		"South Side Area School District",
		"South Western School District",
		"South Williamsport Area School District",
		"Southeast Delco School District",
		"Southeastern Greene School District",
		"Southern Columbia Area School District",
		"Southern Fulton School District",
		"Southern Huntingdon County School District",
		"Southern Lehigh School District",
		"Southern Tioga School District",
		"Southern York County School District",
		"Southmoreland School District",
		"Spring Cove School District",
		"Spring Grove Area School District",
		"Springfield School District",
		"Springfield Township School District",
		"Spring-Ford Area School District",
		"St. Marys Area School District",
		"State College Area School District",
		"Steel Valley School District",
		"Steelton-Highspire School District",
		"Sto-Rox School District",
		"Stroudsburg Area School District",
		"Sullivan County School District",
		"Susquehanna Community School District",
		"Susquehanna Township School District",
		"Susquenita School District",
		"Tamaqua Area School District",
		"Titusville Area School District",
		"Towanda Area School District",
		"Tredyffrin-Easttown School District",
		"Trinity Area School District",
		"Tri-Valley School District",
		"Troy Area School District",
		"Tulpehocken Area School District",
		"Tunkhannock Area School District",
		"Turkeyfoot Valley Area School District",
		"Tuscarora School District",
		"Tussey Mountain School District",
		"Twin Valley School District",
		"Tyrone Area School District",
		"Union Area School District",
		"Union City Area School District",
		"Union School District",
		"Uniontown Area School District",
		"Unionville-Chadds Ford School District",
		"United School District",
		"Upper Adams School District",
		"Upper Darby School District",
		"Upper Dauphin Area School District",
		"Upper Dublin School District",
		"Upper Merion Area School District",
		"Upper Moreland Township School District",
		"Upper Perkiomen School District",
		"Upper Saint Clair School District",
		"Valley Grove School District",
		"Valley View School District",
		"Wallenpaupack Area School District",
		"Wallingford-Swarthmore School District",
		"Warren County School District",
		"Warrior Run School District",
		"Warwick School District",
		"Washington School District",
		"Wattsburg Area School District",
		"Wayne Highlands School District",
		"Waynesboro Area School District",
		"Weatherly Area School District",
		"Wellsboro Area School District",
		"West Allegheny School District",
		"West Branch Area School District",
		"West Chester Area School District",
		"West Greene School District",
		"West Jefferson Hills School District",
		"West Middlesex Area School District",
		"West Mifflin Area School District",
		"West Perry School District",
		"West Shore School District",
		"West York Area School District",
		"Western Beaver County School District",
		"Western Wayne School District",
		"Westmont Hilltop School District",
		"Whitehall-Coplay School District",
		"Wilkes-Barre Area School District",
		"Wilkinsburg Borough School District",
		"William Penn School District",
		"Williams Valley School District",
		"Williamsburg Community School District",
		"Williamsport Area School District",
		"Wilmington Area School District",
		"Wilson Area School District",
		"Wilson School District",
		"Windber Area School District",
		"Wissahickon School District",
		"Woodland Hills School District",
		"Wyalusing Area School District",
		"Wyoming Area School District",
		"Wyoming Valley West School District",
		"Wyomissing Area School District",
		"York City School District",
		"York Suburban School District",
		"Yough School District"

	];
	$( "#tags" ).autocomplete({
	source: availableSDs
	});
});

	
  }

	
	
  
