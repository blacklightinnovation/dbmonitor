/**
 * MySQL Replication | Slow Query Monitor 
 * 
 * Author: jearly@blacklightinnovation.com
 */
var DBM = function(){
	var that = this;
	this.minThreshold = $('#min-threshold').val();
	this.medThreshold = $('#med-threshold').val();
	this.maxThreshold = $('#max-threshold').val();
	
	this.processList = $('#processList');
	var _init = function(){
		var params = {};
		params.kill = 0;
		
		$('#thresh-button')
			.button({label: 'Set'})
			.click(function(){
				if (that.checkThresholds() === true){
					that.minThreshold = $('#min-threshold').val();
					that.medThreshold = $('#med-threshold').val();
					that.maxThreshold = $('#max-threshold').val();
					var params = that.getParams();
					that.update(params);
				}
				else{
					return false;
				}
			});
		
		$('#set-interval').button({
			icons: {
				primary: "ui-icon-extlink"
			},
			label: 'Set'
		})
		.click(function(){
			setInterval(that.refresh, $('#refresh').val() * 1000);
		});
		
		$(function() {
			$('.popout-side-bar-holder').css('right', '-226px')
			$('.popout-side-bar-button').toggle(function() {
				$(this).parent().animate({right:'0px'}, {queue:false, duration: 500});
			}, function() {
				$(this).parent().animate({right:'-226px'}, {queue:false, duration: 500});
			});
		});
		
		that.update(params);
		setInterval(that.refresh, $('#refresh').val() * 1000);
	};
	
	this.refresh = function(){
		var params = that.getParams();
		that.update(params);
	}
	
	this.killQuery = function(params){
		window.location.hash = JSON.stringify(params);
		var url = 'class/monitor.php?' + $.param(params);
		$.ajax({url: url,
			error: function(jqXHR, textStatus, errorThrown) {
				alert("Error killing query! \n" + "Error: " + errorThrown + "\n" + "Status: " + textStatus);
			},
			success: function(data, textStatus, jqXHR) {
				params = that.getParams();
				that.update(params);
			}
		});
	};
	
	this.update = function(params){
		window.location.hash = JSON.stringify(params);
		var url = 'class/monitor.php?' + $.param(params);
		$.ajax({url: url,
			error: function(jqXHR, textStatus, errorThrown) {
				alert("Error getting data! \n" + "Error: " + errorThrown + "\n" + "Status: " + textStatus);
			},
			success: function(data, textStatus, jqXHR) {
				$('#slowQueryRows').html('');
				$('#slaveStatusRows').html('');
				$(data.slowQueries).each(function(idx, value){
					var hostname = value.dbhost;
					// Loop through list of slow querues and append them to the slow query table
					$(value.queries).each(function(idx, val){
						$(val).each(function(idx, v){
							var state = v.State;
							(null == state) ? state = 'N/A' : state;
							if((v.Time > parseInt(that.minThreshold)) 
								&& (v.User != 'system user') 
								&& (v.Command != 'Sleep') 
								&& (!state.match(/\/binlog\//)) 
								&& (!state.match(/\/\ net\//)) 
								|| (state == 'Locked'))
							{
								// Call slowQueryRow to append the rows
								var tr = that.slowQueryRow(v, hostname, state);
								$('#slowQueryRows').append(tr);
							}
						});
					});
				});
				$(data.slaveStatus).each(function(idx, host){
					//alert(JSON.stringify(host));
					$(host).each(function(idx, value){
						var hostname = value.host;
						$(value.data).each(function(idx, v){
							var tr = that.slaveStatusRow(hostname, v);
							$('#slaveStatusRows').append(tr);
						});
					});
				});
			}
		});
	};
	
	this.checkThresholds = function(){
		var min = $('#min-threshold').val();
		var med = $('#med-threshold').val();
		var max = $('#max-threshold').val();
		var msg = '';
		if (parseInt(min) > parseInt(med)) {
			msg += '<p>Your Minimum Threshold value(' + min + ') is larger than the Medium(Yellow) Threshold value(' + med + '). Please correct your values and try again.</p>';
		}
		if (parseInt(min) > parseInt(max)) {
			msg += '<p>Your Minimum Threshold value(' + min + ') is larger than the Maximum(Critical) Threshold value(' + max + '). Please correct your values and try again.</p>';
		}
		if (parseInt(med) > parseInt(max)) {
			msg += '<p>Your Medium Threshold value(' + med + ') is larger than the Maximum(Critical) Threshold value(' + max + '). Please correct your values and try again.</p>';
		}
		if (msg != ''){
			$('#warning').html(msg)
				.dialog({
					resizable: false,
					height:300,
					width:600,
					modal: true,
					buttons: {
						"OK": function() {
							$( this ).dialog( "close" );
						},
					}
				});
		}
		else {
			return true;
		}
	};
	
	this.slowQueryRow = function(v, hostname, state){
		if (v.Time > parseInt(that.maxThreshold)) {
			var bgColor = '#E30000';
			var txtColor = '#FFFFFF';
		}
		if ((v.Time > parseInt(that.medThreshold)) && (v.Time < parseInt(that.maxThreshold))) {
			var bgColor = '#FADF2D';
			var txtColor = '#000000';
		}
		if ((v.Time > parseInt(that.minThreshold)) && (v.Time < parseInt(that.medThreshold))) {
			var bgColor = '#FFFFFF';
			var txtColor = '#666699';
		}
		
		var button = $("<a/>").button({
			icons: {
				primary: "ui-icon-extlink"
			},
			label: 'Kill Query'
		})
		.attr('pid', v.Id)
		.attr('srv', hostname)
		.click(function(){
			params = {};
			params.srv = $(this).attr('srv');
			params.pid = $(this).attr('pid') 
			$( "#confirm-kill").html("<p>Are you sure you would like to kill the following query?<br/><br/>" 
					+ "Server: " 
					+  $(this).attr('srv') 
					+ "<br/>"
					+ "Process ID: " 
					+  $(this).attr('pid') 
					+ "</p>").dialog({
					resizable: false,
					height:300,
					width:400,
					modal: true,
					buttons: {
						"Kill Query": function() {
							params.kill = 1;
							that.killQuery(params);
							$( this ).dialog( "close" );
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				}
			});
		});
		
		var tr = $('<tr/>')
			.append($('<td/>').text(hostname))
			.append($('<td/>').text(v.Id))
			.append($('<td/>').text(v.User))
			.append($('<td/>').text(v.Host))
			.append($('<td/>').text(v.db))
			.append($('<td/>').text(v.Time))
			.append($('<td/>').text(state))
			.append($('<td/>').text(v.Info).expander({
				 slicePoint:       80,  // default is 100
				 expandPrefix:     ' ', // default is '... '
				 expandText:       '[...]', // default is 'read more'
				 //collapseTimer:    5000, // re-collapses after 5 seconds; default is 0, so no re-collapsing
				 userCollapseText: '[^]'  // default is 'read less'
			 }))
			.append($('<td/>').append(button));
		return tr.css('background', bgColor)
				 .css('opacity', '0.6')
				 .css('color', txtColor);
	};
	
	this.slaveStatusRow = function(host, v){
		var tr = $('<tr/>')
			.append($('<td/>').text(host))
			.append($('<td/>').text(v.server))
			.append($('<td/>').text(v.IP))
			.append($('<td/>').text(v.Master_Host))
			.append($('<td/>').text(v.Relay_Master_Log_File))
			.append($('<td/>').html(v.Slave_IO_Running))
			.append($('<td/>').html(v.Slave_SQL_Running))
			.append($('<td/>').text((v.Last_Error != '') ? v.Last_Error : 'N/A'))
			.append($('<td/>').text((v.Seconds_Behind_Master != '') ? v.Seconds_Behind_Master : 0));
		return tr.css('color','#666699');
	};
	
	this.getParams = function(){
		var params = {};
		params.kill = 0;
		params.pid = null;
		params.srv = null;
		
		return params;
	}
	
	_init();
};