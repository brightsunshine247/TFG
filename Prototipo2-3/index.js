var table;
var demographChart;
var yearChart;
var monthChart;
var dayOfWeekChart;
var datas;
$(document).ready(function(){
    demographChart = dc.rowChart('#demograph-chart');
	monthChart = dc.pieChart('#month-chart');
    dayOfWeekChart = dc.pieChart('#day-Of-Week');
	yearChart = dc.pieChart('#year-chart');
	companyChart = dc.barChart('#company-chart');
	table = dc.dataTable('.dc-data-table');
    $.when(
		// Load agin json file
		
        $.getJSON('scm-commits-100000.json', function (d) {
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
			d.date = dateFormat.parse(d.date);
			var age = Math.floor((new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getUTCDate())- new Date(1970, 0, 1))/(1000*60*60*24));
			if (sliderDate.indexOf(age) == -1){sliderDate.push(age)}
		});

		fullDateDim = ndx.dimension(function(d) {
			return d.date;
		});
/*********************************************************************************************************************************
*********************************************************** Pie -> Year **********************************************************
*********************************************************************************************************************************/
		yearDim = ndx.dimension(function(d) {
            return d.date.getFullYear();
        });
        var yearGrp = yearDim.group().reduceSum(function(d) {
            return d.one;
        });
        yearChart.width(180)
            .height(180)
            .radius(80)
            .innerRadius(30)
            .dimension(yearDim)
            .group(yearGrp);
/*********************************************************************************************************************************
****************************************************** Pie (Donuts) -> Month *****************************************************
*********************************************************************************************************************************/
        monthDim = ndx.dimension(function(d) {
            return d.date.getMonth()+1;
        });
        var monthGrp = monthDim.group().reduceSum(function(d) {
            return d.one;
        });
        monthChart.width(180)
            .height(180)
            .radius(80)
            .innerRadius(30)
            .dimension(monthDim)
            .group(monthGrp);
/*********************************************************************************************************************************
*************************************************** Pie (Donuts) -> Day of Week **************************************************
*********************************************************************************************************************************/
        var dayOfWeekDim = ndx.dimension(function(d) {
			var name;
			if (d.date.getDay() == 1){
				name = 'Monday';
			} else if (d.date.getDay() == 2){
				name = 'Tuesday';
			} else if (d.date.getDay() == 3){
				name = 'Wednesday';
			} else if (d.date.getDay() == 4){
				name = 'Thursday';
			} else if (d.date.getDay() == 5){
				name = 'Friday';
			} else if (d.date.getDay() == 6){
				name = 'Saturday';
			} else if (d.date.getDay() == 0){
				name = 'Sunday';
			}
            return name;
        });
        var dayOfWeekGrp = dayOfWeekDim.group().reduceSum(function(d) {
            return d.one;
        });
        dayOfWeekChart.width(180)
            .height(180)
            .radius(80)
            .innerRadius(30)
            .dimension(dayOfWeekDim)
            .group(dayOfWeekGrp);
/*********************************************************************************************************************************
******************************************************* Total -> Demograph *******************************************************
*********************************************************************************************************************************/
		var axisY = [];
		var demoDim = ndx.dimension(function(d){
			var age = Math.floor((new Date() - new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getUTCDate()))/(1000*60*60*24));
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
************************************************************** Company ***********************************************************
*********************************************************************************************************************************/
		var compDim = ndx.dimension(function(d){
			return d.company;
		})
		var compGrp = compDim.group();

		companyChart
			.width(1050).height(300)
            .dimension(compDim)
            .group(compGrp)
//            .x(d3.scale.linear().domain([0,32]))
			.x(d3.scale.ordinal().domain([""])) // Need empty val to offset first value
			.xUnits(dc.units.ordinal)
			.centerBar(true)
			.elasticX(true)
			.centerBar(true)
			.elasticY(true)
			.brushOn(true)
			.renderHorizontalGridLines(true)
			.margins({top: 0, right: 50, bottom: 20, left: 40});
        companyChart.xAxis().tickFormat(function(d) {return d});
        companyChart.yAxis().ticks(15);
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
				var from = new Date(1970, 0, ui.values[0]);
				var to = new Date(1970, 0, ui.values[1]);
				$('#from').val(from);
				$('#to').val(to);
				calendarFilter(from, to)
			}
		});

function calendarFilter(from, to){
	fullDateDim.filter(function (d){
		// FromYear < YEAR > ToYear
		if ((d.getFullYear() > from.getFullYear()) && (d.getFullYear() < to.getFullYear())){
			return d;
		// "YEAR = FromYear" and "MONTH >= fromMonth"
		} else if ((d.getFullYear() == from.getFullYear()) &&
					(d.getUTCDate() >= from.getUTCDate())){
			return d;
		// "YEAR = FromYear" and "MONTH = FromMonth" and "DAY >= FromDay"
		} else if ((d.getFullYear() == from.getFullYear()) && 
					(d.getMonth() == from.getMonth()) &&
					(d.getUTCDate() >= from.getUTCDate())){
			return d;
		// "YEAR = ToYear" and "MONTH <= ToMonth"
		} else if ((d.getFullYear() == to.getFullYear()) &&
					(d.getMonth() <= to.getMonth())){
			return d;
		// "YEAR = ToYear" and "MONTH = ToMonth" and "DAY <= ToDay"
		} else if ((d.getFullYear() == to.getFullYear()) && 
					(d.getMonth() == to.getMonth()) &&
					(d.getUTCDate() <= to.getUTCDate())){
			return d;
		}
	});
	dc.redrawAll();
}
		dc.dataCount('.dc-data-count')
            .dimension(ndx)
            .group(all)
            .html({
                some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                    ' | <a href="javascript:dc.filterAll(); dc.renderAll();">Reset All</a>',
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
            .group(function (d) {return d.date.getFullYear();})
            .size(20)
            .columns([
                'id',
				'date',
				'hexaId',
				'name',
				'companyId',
				'company'
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
        dc.renderAll();
    });
});
/*********************************************************************************************************************************
***************************************************** Valid format for dc.js *****************************************************
*********************************************************************************************************************************/
function dcFormat(d){
    var array = [];
    $.each(d, function(key, val){
        array.push({'id': val[0], 'date': val[1], 'hexaId': val[2], 'name': val[3], 'companyId': val[4], 'company': val[5]});
    });
    return array;
}
