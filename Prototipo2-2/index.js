var table;
var demographChart;
var datas;
$(document).ready(function(){
    demographChart = dc.rowChart('#demograph-chart');
    retainedChart = dc.rowChart('#retained-chart');
	noretainedChart = dc.rowChart('#noretained-chart');
	table = dc.dataTable('.dc-data-table');
    $.when(
		// Load agin json file
        $.getJSON('scm-demographics-activity.json', function (d) {
            datas = d;
        })
    ).done(function(){
        var data = dcFormat(datas);
        var ndx = crossfilter(data);
		var all = ndx.groupAll();
		var sliderDate = [];
		var final = [];
		// Add date for each data
		var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
        data.forEach(function (d) {
			d.one = 1;
			d.start = dateFormat.parse(d.start);
		    d.end = dateFormat.parse(d.end);
			if (sliderDate.indexOf(d.start.getFullYear()) == -1){
				sliderDate.push(d.start.getFullYear());
			}
			if (sliderDate.indexOf(d.end.getFullYear()) == -1){
				sliderDate.push(d.end.getFullYear());
			}
			if (d.end.getFullYear() == 2014){
				final.push(d.end);
			}
		});

/*********************************************************************************************************************************
******************************************************* Total -> Demograph *******************************************************
*********************************************************************************************************************************/
		var axisY = [];
		var demoDim = ndx.dimension(function(d){
			var age = Math.floor((new Date(d.end.getFullYear(), d.end.getMonth(), d.end.getUTCDate())-new Date(d.start.getFullYear(), d.start.getMonth(), d.start.getUTCDate()))/(1000*60*60*24));
			var i = Math.floor(age/181);
			axisY[i]=((181*i)+'-'+((i+1)*181));
			return axisY[i];
		});
		var demoGrp = demoDim.group();
		demographChart
			.width(450).height(400)
			.margins({top: 0, right: 50, bottom: 20, left: 40})
			.elasticX(true)
			.dimension(demoDim)
			.group(demoGrp)
			.elasticX(true)
			.ordering(function(d) {
				return -d.key.split('-')[0];
			})
			.title(function(d) { return d.key+' -> '+d.value})

/*********************************************************************************************************************************
******************************************************* Total -> Demograph *******************************************************
*********************************************************************************************************************************/
		var axisR = [];
		var retainedDim = ndx.dimension(function(d){
			if (d.end.getFullYear() == 2014){
				var age = Math.floor((new Date(d.end.getFullYear(), d.end.getMonth(), d.end.getUTCDate())-new Date(d.start.getFullYear(), d.start.getMonth(), d.start.getUTCDate()))/(1000*60*60*24));
				var i = Math.floor(age/181);
				axisR[i]=((181*i)+'-'+((i+1)*181));
				return axisR[i];
			} else {
				return 'No Retained';
			}
		});
		var retainedGrp = retainedDim.group();
		retainedChart
			.width(450).height(400)
			.margins({top: 0, right: 50, bottom: 20, left: 40})
			.elasticX(true)
			.dimension(retainedDim)
			.group(retainedGrp)
			.elasticX(true)
			.ordering(function(d) {
				return -d.key.split('-')[0];
			})
			.title(function(d) { return d.key+' -> '+d.value})
/*********************************************************************************************************************************
******************************************************* Total -> Demograph *******************************************************
*********************************************************************************************************************************/
		var axisN = [];
		var nRetainedDim = ndx.dimension(function(d){
			if (d.end.getFullYear() != 2014){
				var age = Math.floor((new Date(d.end.getFullYear(), d.end.getMonth(), d.end.getUTCDate())-new Date(d.start.getFullYear(), d.start.getMonth(), d.start.getUTCDate()))/(1000*60*60*24));
				var i = Math.floor(age/181);
				axisN[i]=((181*i)+'-'+((i+1)*181));
				return axisN[i];
			} else {
				return 'Retained';
			}
		});
		var nRetainedGrp = nRetainedDim.group();
		noretainedChart
			.width(450).height(400)
			.margins({top: 0, right: 50, bottom: 20, left: 40})
			.elasticX(true)
			.dimension(nRetainedDim)
			.group(nRetainedGrp)
			.elasticX(true)
			.ordering(function(d) {
				return -d.key.split('-')[0];
			})
			.title(function(d) { return d.key+' -> '+d.value})
//	var retainedDim = dc.filters.TwoDimensionalFilter(demoGrp.top(Infinity), retained.group());
console.log(demoGrp.top(Infinity))
console.log(retainedDim.group().top(Infinity))
console.log(nRetainedDim.group().top(Infinity))
/*********************************************************************************************************************************
************************************************************** SLider ************************************************************
*********************************************************************************************************************************/
		sliderDate.sort(function(a, b){return a-b});
//console.log(sliderDate)
		$( "#slider-range" ).slider({
			range: true,
			min: sliderDate[0],
			max: sliderDate[sliderDate.length-1],
			values: [sliderDate[0], sliderDate[sliderDate.length-1]],
			slide: function( event, ui ) {
				var from = ui.values[0];
				var to = ui.values[1];
				$('#from').val(from);
				$('#to').val(to);
				updateDim(demoDim, 'total', from, to);
				updateDim(retainedDim, 'retained', from, to);
				updateDim(nRetainedDim, 'no', from, to);
				dc.renderAll();
				dc.redrawAll();
			}
		});

		function updateDim(dim, type, from, to){
			var axis = [];
			if (type == 'total'){
				dim = ndx.dimension(function(d){
					if ((d.end.getFullYear() >= from) && (d.start.getFullYear() <= to)){
						if (d.start.getFullYear() >= from){
							start = new Date(d.start.getFullYear(), d.start.getMonth(), d.start.getUTCDate());
						}else{
							start = new Date(from, 0, 1);
						}

						if (d.end.getFullYear() <= to){
							end = new Date(d.end.getFullYear(), d.end.getMonth(), d.end.getUTCDate());
						}else{
							end = new Date(to, 11, 31);
						}
						
						var age = Math.floor((end-start)/(1000*60*60*24));
						var i = Math.floor(age/181);
						axis[i]=((181*i)+'-'+((i+1)*181));
						return axis[i];
					}
				});
				grp = dim.group();
				demographChart
					.dimension(dim)
					.group(grp)
					.ordering(function(d) {
						return -d.key.split('-')[0];
					})
					.title(function(d) { return d.key+' -> '+d.value})
			} else if (type == 'retained'){
				
				dim = ndx.dimension(function(d){
					if (d.end.getFullYear() == 2014){
						if ((d.end.getFullYear() >= from) && (d.start.getFullYear() <= to)){
							if (d.start.getFullYear() >= from){
								start = new Date(d.start.getFullYear(), d.start.getMonth(), d.start.getUTCDate());
							}else{
								start = new Date(from, 0, 1);
							}

							if (d.end.getFullYear() <= to){
								end = new Date(d.end.getFullYear(), d.end.getMonth(), d.end.getUTCDate());
							}else{
								end = new Date(to, 11, 31);
							}
					
							var age = Math.floor((end-start)/(1000*60*60*24));
							var i = Math.floor(age/181);
							axis[i]=((181*i)+'-'+((i+1)*181));
							return axis[i];
						}
					
					} else {
						return "No Retained";
					}
				});
				grp = dim.group();
				retainedChart
					.dimension(dim)
					.group(grp)
					.ordering(function(d) {
						return -d.key.split('-')[0];
					})
					.title(function(d) { return d.key+' -> '+d.value})
			} else {
				dim = ndx.dimension(function(d){
					if (d.end.getFullYear() != 2014){
						if ((d.end.getFullYear() >= from) && (d.start.getFullYear() <= to)){
							if (d.start.getFullYear() >= from){
								start = new Date(d.start.getFullYear(), d.start.getMonth(), d.start.getUTCDate());
							}else{
								start = new Date(from, 0, 1);
							}

							if (d.end.getFullYear() <= to){
								end = new Date(d.end.getFullYear(), d.end.getMonth(), d.end.getUTCDate());
							}else{
								end = new Date(to, 11, 31);
							}
					
							var age = Math.floor((end-start)/(1000*60*60*24));
							var i = Math.floor(age/181);
							axis[i]=((181*i)+'-'+((i+1)*181));
							return axis[i];
						}
					
					} else {
						return "Retained";
					}
				});
				grp = dim.group();
				noretainedChart
					.dimension(dim)
					.group(grp)
					.ordering(function(d) {
						return -d.key.split('-')[0];
					})
					.title(function(d) { return d.key+' -> '+d.value})
			}
		}
/*********************************************************************************************************************************
**************************************************************** Table ***********************************************************
*********************************************************************************************************************************/
		var nameDim = ndx.dimension(function (d) {
            return d.name;
        });
        table
            .dimension(nameDim)
            .group(function (d) {return d.start.getFullYear();})
            .size(20)
            .columns([
                'id',
				'name',
				'start',
				'end'
			])
			.sortBy(function (d) {
                return d.start;
            })
            .order(d3.ascending);
		table.on('renderlet', function(table) {
			table.selectAll('.dc-table-group').classed('info', true);
		 });
        dc.renderAll();
    });
});
/*********************************************************************************************************************************
***************************************************** Valid format for dc.js *****************************************************
*********************************************************************************************************************************/
function dcFormat(d){
    var array = [];
    $.each(d, function(key, val){
        array.push({'id': val.id, 'name': val.name, 'start': val.period.start, 'end': val.period.end});
    });
    return array;
}
/*********************************************************************************************************************************
****************************************** Combine two JSON file(Birth, Aging) into one ******************************************
*********************************************************************************************************************************/
function birAgin(d1, d2){
	var value1 = [];
	var value2 = [];
	var tz = [];
	var companies = ['IBM', 'Oracle', 'Wikipedia', 'Libresoft', 'HP', 'Nebula'];
	var company =  [];
	$.each(d1, function(key, val){
		if (key == 'id'){
			value1.push(val);
		}
	});
	for (var i=0; i<value1[0].length; i++){
		var TZ = Math.floor(Math.random() * (13 + 12) - 12);
		tz.push(TZ);
		var index = Math.floor(Math.random()*6);
		company.push(companies[index]);
	}
	d1['TZ'] = tz;
	d1['company'] = company;
	d1['retained'] = still;
	d1['noretained'] = nostill;
	return d1
}
