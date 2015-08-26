var serverList = {
servers: []
}; 
var serverTable = [];
var serverCount = 0;
var playerCount = 0;
var gameVersion = 0;
var selectedID = 1;
var selectedIndex = 0;
var controllersOn = false;
var VerifyIPRegex = /^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)(?:\:(?:\d|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/;
$(document).ready(function() {
    buildTable();

    // Add event listener for opening and closing details
    $('#serverTable tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = $('#serverTable').DataTable().row( tr );

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    } );
} );
        
function buildTable(){
	$('#serverTable').on('click', 'tr:not(:first) td:not(".details-control") ', function() {
		/*
		console.log("ip: " + $(this).find('td:eq(0)').text());
		console.log("numplayers: " + $(this).find('td:eq(8)').text());
		console.log("maxplayers: " + $(this).find('td:eq(9)').text());
		console.log("private: " + $(this).find('td:eq(10)').text());
		console.log("version: " + $(this).find('td:eq(11)').text());
		*/
		//joinServer($(this).find('td:eq(0)').text(), $(this).find('td:eq(8)').text(), $(this).find('td:eq(9)').text(), $(this).find('td:eq(10)').text(), $(this).find('td:eq(11)').text());
		var tr = $(this).closest('tr');
		var row = table.row( tr );
		if (row.data()){
			joinServer(row.data()[1]);
			selectedID = jQuery(this).closest('tr').index();
			selectedID++;
			$('#serverTable tr.selected').removeClass('selected');
			$("#serverTable tr:eq(" + selectedID + ")").addClass("selected");
		} else {
            var trChild = $(this).closest('tr').prev();
            var rowChild = table.row(trChild);
            rowChild.child.hide();
            trChild.removeClass('shown');
        }
	});  
	var table = $('#serverTable').DataTable( {
        destroy: true,
		"autoWidth": true,
        "iDisplayLength": 25,
		columns: [
			{
				"className":      'details-control',
				"orderable":      false,
				"data":           null,
				"defaultContent": ''
			},
			{ title: "ID", visible: false},
			{ title: "IP" },
            { title: "Ping", visible: false},
			{ title: "Name"},
			{ title: "Host" },
			{ title: "Map" },
			{ title: "Map File", visible: false},
			{ title: "Variant" },
			{ title: "Variant Type" },
			{ title: "Status", visible: false},
			{ title: "Num Players" },
			{ title: "Max Players" },
			{ title: "Private" },
			{ title: "Version"}
		],
		"order": [[ 0 ]],
		"language": {
			"emptyTable": "No servers found"
		}
	} );

	var jqhxr = $.getJSON( "http://192.99.124.162/list", null)
			.done(function( data ) {
					for(var i = 0; i < data.result.servers.length; i++)
					{
							var serverIP = data.result.servers[i];
							//because sometimes jackasses inject into the server list

							if(VerifyIPRegex.test(serverIP)){
									serverList.servers.push({serverIP, i});
									(function(i, serverIP) {
										/*
										var jqhxrGeoInfo = $.getJSON("http://www.telize.com/geoip/" + serverIP.substr(0, serverIP.indexOf(':')), null )
										.done(function(data) {
												if(data.region){
												$("#region" + i).html(data.region + ", " + data.country);
												}else{
												$("#region" + i).html(data.country);
												}                                                       
											});
										*/
										var jqhrxServerInfo = $.getJSON("http://" + serverIP, null )
										.done(function(serverInfo) {
												serverInfo["serverId"] = i;
												serverInfo["serverIP"] = serverIP;
												if (serverInfo.maxPlayers <= 16 ) {
													if(serverInfo.map.length > 0){ //blank map means glitched server entry
														//var html = serverListInfoTemplate(serverInfo);
														//$("#serverid" + i).html(html);
														for (var j = 0; j < serverList.servers.length; j++)
														{
															if (serverList.servers[j]["i"] == i)
															{
																	serverList.servers[j] = serverInfo;
																	serverCount++;
																	playerCount+=serverInfo.numPlayers;
																	$('.serverCount').html(serverCount + " servers");
																	//console.log(serverCount);
																	$('.playerCount').html(playerCount + " players");
																	//console.log(playerCount);
															}
														}
														console.log(serverInfo);
														if(!serverInfo.hasOwnProperty("passworded")){
															serverInfo["passworded"] = false;
														};
														table.row.add([
															null,
															serverInfo.serverId,
															serverInfo.serverIP,
                                                            null,
															serverInfo.name,
															serverInfo.hostPlayer,
															serverInfo.map,
															serverInfo.mapFile,
															capitalizeFirstLetter(serverInfo.variant),
															capitalizeFirstLetter(serverInfo.variantType),
															serverInfo.status,
															serverInfo.numPlayers,
															serverInfo.maxPlayers,
															serverInfo.passworded,
															serverInfo.eldewritoVersion
														]).draw();
														table.columns.adjust().draw();
													} else {
														console.log(serverInfo.serverIP + " is glitched");
													}
												} else {
													console.log(serverInfo.serverIP + " is hacked (maxPlayers over 16)");
												}
										});
									})(i, serverIP);
							} else {
								console.log("Invalid IP, skipping.");
							}
					}  
			for (var j = 0; j < serverList.servers.length; j++)
			{
					//console.log(serverList.servers[j]);
			}
		}
	);
}

function joinServer(i) {
	//console.log(serverList.servers[i].serverIP);
    if(dewRconConnected){
        if(serverList.servers[i].numPlayers < serverList.servers[i].maxPlayers) {
            if(serverList.servers[i].eldewritoVersion === gameVersion) {
                if(serverList.servers[i].passworded){
                    sweetAlert({   
                    title: "Private Server",   
                    text: "Please enter password",   
                    type: "input", 
                    inputType: "password",
                    showCancelButton: true,   
                    closeOnConfirm: false,
                    inputPlaceholder: "Password goes here" 
                    }, 
                    function(inputValue){
                        if (inputValue === false) return false;      
                        if (inputValue === "") {     
                         sweetAlert.showInputError("Passwords are never blank");     
                         return false   
                        } else {
                            dewRcon.send('connect ' + serverList.servers[i].serverIP + ' ' + inputValue);
                            setTimeout(function() {
                                if (dewRcon.lastMessage === "Incorrect password specified.") {
                                    sweetAlert.showInputError(dewRcon.lastMessage);
                                    return false
                                }else {
                                    sweetAlert.close();
                                    closeBrowser();
                                }
                            }, "400");
                        }
                    });
                } else {
                    dewRcon.send('connect ' + serverList.servers[i].serverIP);
                    closeBrowser();
                }
            } else {
                    sweetAlert({
                    title:"Error", 
                    text:"Host running different version.<br /> Unable to join!", 
                    type:"error",
                    html: true
                    });
            }
        } else {
                sweetAlert("Error", "Game is full or unavailable!", "error");
        }
    } else {
        sweetAlert("Error", "dewRcon is not connected!", "error");        
    }
}

function connectionTrigger(){
    $('.closeButton').show();
	$('#serverTable_filter').css("right","125");
    dewRcon.send('game.version');
    setTimeout(function() {
        if (dewRcon.lastMessage.length > 0) {
            gameVersion = dewRcon.lastMessage;
            //console.log(gameVersion);
        }
    }, "200");
}

function closeBrowser() {
    setTimeout(function() {
        dewRcon.send('menu.show');
        dewRcon.send('Game.SetMenuEnabled 0');
    }, "1000");
}

function updateSelection(){
	$('#serverTable tr.selected').removeClass('selected');
	$("#serverTable tr:eq(" + selectedID + ")").addClass("selected");
}

function joinSelected(){
	var row = $('#serverTable').dataTable().fnGetData(selectedID-1);
	//console.log(row[1]);
	joinServer(row[1]);
}

function toggleDetails(){
    //$('#serverTable tr.selected td.details-control').trigger( "click" );
            console.log(selectedID-1);
            //if($('#serverTable tr td.').eq(row).hasClass('shown')){
            //    console.log("yay");
            //}
            //if(selectedID > 1){
 
                //if($("#serverTable tr:eq(" + selectedID + ")").hasClass("shown")){
                    $('#serverTable tr:eq(' + selectedID + ') td.details-control').trigger( "click" );
                //} else if($("#serverTable tr:eq(" + selectedID-1 + ")").hasClass("shown")){
                //     $('#serverTable tr:eq(' + selectedID-1 + ') td.details-control').trigger( "click" ); 
                //}  else{ 
                 // $('#serverTable tr.selected td.details-control').trigger( "click" );
                //}                  
            //}
            
}

function pingList(){ 
    $('#serverTable').dataTable().api().column( 3 ).visible( true );
    var rowNum = 0;
    var rowData = "";
    var ip = "";
    var ping = "";
    //loop here
    while(rowNum <= $("#serverTable tbody tr").length){
        rowData = $('#serverTable').dataTable().fnGetData(rowNum);
        ip = rowData[2].split(":")[0];
        //console.log(ip);
        dewRcon.send('ping ' + ip);
        if (dewRcon.lastMessage.length > 0 && dewRcon.lastMessage.contains("PONG "+ip)) {
            ping = dewRcon.lastMessage.split(" ")[3];
        } else {
            ping = "?";
        }
        $('#serverTable').dataTable().fnUpdate(ping, rowNum, 3);  
        rowNum++;
    }
}

Mousetrap.bind('f11', function() {
    closeBrowser();
});

Mousetrap.bind('space', function() {
    pingList();
});

var gamepad = new Gamepad();

gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
    console.log("a new gamepad connected");
    setTimeout(function() {
        $('.controllerButton').show();
        updateSelection();
        controllersOn = true;
    }, "400");
});

gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
    console.log("gamepad disconnected");
    $('.controllerButton').hide();
    $('#serverTable tr.selected').removeClass('selected');
    controllersOn = false;
});

gamepad.bind(Gamepad.Event.UNSUPPORTED, function(device) {
    //console.log("an unsupported gamepad connected (add new mapping)");
});

gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
    if (controllersOn){
        //console.log(e.control + " of gamepad " + e.gamepad + " pressed down");
        if (e.control == "FACE_1"){
            //console.log("A");
            if($('.sweet-overlay').is(':visible')){
                sweetAlert.close();   
            } else {
                joinSelected();
            }
        }else if (e.control == "FACE_2"){
            //console.log("B");
            sweetAlert.close();   
        }else if (e.control == "FACE_3"){
            //console.log("X");
            toggleDetails();
        }else if (e.control == "FACE_4"){
           //console.log("Y");
           window.location.reload();
        }else if (e.control == "DPAD_UP"){
            //console.log("UP");
            if (selectedID > 1) {
                selectedID--;
                updateSelection();
            }
        }else if (e.control == "DPAD_DOWN"){
            //console.log("DOWN");
            if (selectedID < ($("#serverTable tbody tr").length)){
                selectedID++;
                updateSelection();
            }
        }else if (e.control == "DPAD_LEFT"){
            //console.log("LEFT");
        }else if (e.control == "DPAD_RIGHT"){
            //console.log("RIGHT");
        }else if (e.control == "SELECT_BACK"){
            //console.log("BACK");
            closeBrowser();
        }else if (e.control == "START_FORWARD"){
            //console.log("START");
        }else if (e.control == "RIGHT_TOP_SHOULDER"){
            //console.log("RIGHT BUMPER");   
        }else if (e.control == "LEFT_TOP_SHOULDER "){
            //console.log("LEFT BUMPER");
        }else if (e.control == "LEFT_STICK"){
            //console.log("LEFT STICK");
            //Because I use weird mapping.
            toggleDetails();
        }          
    }
});

if (!gamepad.init()) {
    // Your browser does not support gamepads, get the latest Google Chrome or Firefox
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function format ( d ) {
    var output = "";
    output += '<div id="leftside"><img id="mapPic" src="images/maps/' + serverList.servers[d[1]].mapFile + '.png">'+
    '<h4 id="gameName">'+serverList.servers[d[1]].name+'</h3>'+
    '<h3 id="hostName">'+serverList.servers[d[1]].hostPlayer+'</h2>'+
    '<h4 id="gameStatus">Status: '+serverList.servers[d[1]].status+'</h4></div>';
    if(!serverList.servers[d[1]].passworded){ 
        output += '<div id="rightside"><table class="statBreakdown"><thead class="tableHeader">'+
            '<th>Name</th>'+
            '<th><center>Score</center></th>'+
            '<th><center>K</center></th>'+
            '<th><center>D</center></th>'+
            '<th><center>A</center></th>'+
            '<th><center>Ratio</center></th>'+
            '</thead><tbody>';
        var playerNum = 0;
            while (playerNum < serverList.servers[d[1]].players.length) {
                var playerList = serverList.servers[d[1]].players;
                playerList = sortByKey(playerList, 'score');
                var ratio = 0;
                if(playerList[playerNum].name){
                    if(playerList[playerNum].kills>0){
                        ratio = ((playerList[playerNum].kills+(playerList[playerNum].assists/3))/playerList[playerNum].deaths).toFixed(2);
                    }
                    output +=  '<tr>'+
                        '<td class="statLines">'+playerList[playerNum].name+'</td>'+
                        '<td class="statLines"><center>'+playerList[playerNum].score+'</center></td>'+
                        '<td class="statLines"><center>'+playerList[playerNum].kills+'</center></td>'+
                        '<td class="statLines"><center>'+playerList[playerNum].deaths+'</center></td>'+
                        '<td class="statLines"><center>'+playerList[playerNum].assists+'</center></td>'+
                        '<td class="statLines"><center>'+ratio+'</center></td>'+

                    '</tr>';
                }
                playerNum++;
            }
        output += '</tbody></table></div>';  
    }   else {
    output += "<div id='rightside'><center><h3 id='privateGame'>Private Game</h3><br /><img id='privateGame' src='images/error.png'></center></div>";
    }
    return output;
}

function sortByKey(array, key) {
    return array.sort(function(b, a) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function refreshTable(){
    serverList = {
        servers: []
    };
    serverTable = [];
    serverCount = 0;
    playerCount = 0;
    $('.serverCount').html(serverCount + " servers");
    $('.playerCount').html(playerCount + " players");
    $('#serverTable').DataTable().clear(); 
    buildTable();   
}

String.prototype.contains = function(it) {
	return this.indexOf(it) != -1;
};