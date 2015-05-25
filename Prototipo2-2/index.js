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
			d.total = 1;
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
				d.retained = 1;
				d.nretained = 0;
			} else {
				d.nretained = 1;
				d.retained = 0;
			}
			
		});
console.log(data)

		
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
//			if (d.retained == 1){
				var age = Math.floor((new Date(d.end.getFullYear(), d.end.getMonth(), d.end.getUTCDate())-new Date(d.start.getFullYear(), d.start.getMonth(), d.start.getUTCDate()))/(1000*60*60*24));
				var i = Math.floor(age/181);
				axisR[i]=((181*i)+'-'+((i+1)*181));
				return axisR[i];
//			} else {
//				return 'No Retained';
//			}
		});
		var retainedGrp = retainedDim.group().reduceSum(function(d){
			return d.retained;
		});;
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
			var age = Math.floor((new Date(d.end.getFullYear(), d.end.getMonth(), d.end.getUTCDate())-new Date(d.start.getFullYear(), d.start.getMonth(), d.start.getUTCDate()))/(1000*60*60*24));
			var i = Math.floor(age/181);
			axisN[i]=((181*i)+'-'+((i+1)*181));
			return axisN[i];
		});
		var nRetainedGrp = nRetainedDim.group().reduceSum(function(d){
			return d.nretained;
		});
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


		dc.dataCount('.dc-data-count')
            .dimension(ndx)
            .group(all)
            .html({
                some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                    ' | <a onclick="resetAll()">Reset All</a>',
                all:'All records selected. Please click on the graph to apply filters.'	
            });
/*********************************************************************************************************************************
**************************************************************** Table ***********************************************************
*********************************************************************************************************************************/
		var nameDim = ndx.dimension(function (d) {
            return d.name;
        });
        table
            .dimension(demoDim)
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

		$("#table-search").on('input',function(){
			text_filter(nameDim, this.value);
			function text_filter(dim, q){
				table.filterAll();
				var re = new RegExp(q,"i")
				if (q != '') {
					dim.filter(function(d) {
						return 0 == d.search(q);
					});
				}else{
					dim.filterAll();
				}
				dc.redrawAll();
			}
		});
/*********************************************************************************************************************************
************************************************************** SLider ************************************************************
*********************************************************************************************************************************/
		sliderDate.sort(function(a, b){return a-b});
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
				dc.redrawAll();
			}
		});

		function updateDim(dim, type, from, to){
			var axis = [];
			if (type == 'total'){
				dim = ndx.dimension(function(d){
					d.total = 0;
					if ((d.end.getFullYear() >= from) && (d.start.getFullYear() <= to)){
						d.total = 1;
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
				grp = dim.group().reduceSum(function(d){
					return d.total;
				});
				demographChart
					.dimension(dim)
					.group(grp)
					.ordering(function(d) {
						return -d.key.split('-')[0];
					})
					.title(function(d) { return d.key+' -> '+d.value})

				table
		            .dimension(dim)
		            .group(function (d) {return d.start.getFullYear();})
			} else if (type == 'retained'){
				dim = ndx.dimension(function(d){
					if (d.end.getFullYear() == to){
						d.retained = 0;
						if ((d.end.getFullYear() >= from) && (d.start.getFullYear() <= to)){
							d.retained = 1;
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
						d.retained = 0;
						return axis[0];
					}
				});
				grp = dim.group().reduceSum(function (d){
					return d.retained;
				});
				retainedChart
					.dimension(dim)
					.group(grp)
					.ordering(function(d) {
						return -d.key.split('-')[0];
					})
					.title(function(d) { return d.key+' -> '+d.value})
			} else {
				dim = ndx.dimension(function(d){
					if (d.end.getFullYear() != to){
						d.nretained = 0;
						if ((d.end.getFullYear() >= from) && (d.start.getFullYear() <= to)){
							d.nretained = 1;
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
						d.nretained = 0;
						return axis[0];
					}
				});
				grp = dim.group().reduceSum(function(d){
					return d.nretained;
				});
				noretainedChart
					.dimension(dim)
					.group(grp)
					.ordering(function(d) {
						return -d.key.split('-')[0];
					})
					.title(function(d) { return d.key+' -> '+d.value})
			}
		}

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
