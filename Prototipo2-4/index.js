var table;
//var demographChart;
var yearChart;
var monthChart;
var dayOfWeekChart;
var companyChart;
var scmCompany;
var scmRepo;
var scmCommit;

$(document).ready(function(){
//    demographChart = dc.rowChart('#demograph-chart');
	monthChart = dc.pieChart('#month-chart');
    dayOfWeekChart = dc.pieChart('#day-Of-Week');
	yearChart = dc.pieChart('#year-chart');
	companyChart = dc.lineChart('#company-chart');
	var compSliderChart = dc.barChart('#comp-slider-chart');
	table = dc.dataTable('.dc-data-table');
    $.when(
		// Load agin json file
		
        $.getJSON('scm-companies.json', function (d) {
            scmCompany = d;
        }),

		$.getJSON('scm-repos.json', function (d) {
            scmRepo = d;
        }),

		$.getJSON('scm-commits-distinct.json', function (d) {
            scmCommit = d;
        })
    ).done(function(){
        var data = dcFormat(scmCommit);
        var ndx = crossfilter(data);
		var all = ndx.groupAll();
//		var sliderDate = [];
//		var final = [];
		// Add date for each data
		var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
        data.forEach(function (d) {
			d.one = 1;
			d.date = dateFormat.parse(d.date);
//			var age = Math.floor((new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getUTCDate())- new Date(1970, 0, 1))/(1000*60*60*24));
//			if (sliderDate.indexOf(age) == -1){sliderDate.push(age)}
		});
/*		fullDateDim = ndx.dimension(function(d) {
			return d.date;
		});*/
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


		
/*********************************************************************************************************************************
************************************************************** Company ***********************************************************
*********************************************************************************************************************************/
		var compDim = ndx.dimension(function(d){
			return d.company;
		})

		var compGrp = compDim.group();
		compSliderChart
			.width(990).height(40)
            .dimension(compDim)
            .group(compGrp)
			.gap(1)
//            .x(d3.scale.linear().domain([0,32]))
			.x(d3.scale.ordinal().domain([""])) // Need empty val to offset first value
			.xUnits(dc.units.ordinal)
			.centerBar(true)
			.elasticX(true)
			.centerBar(true)
			.elasticY(true)
			.renderHorizontalGridLines(true)
			.alwaysUseRounding(true)
			.margins({top: 0, right: 50, bottom: 20, left: 40});
        compSliderChart.xAxis().tickFormat(function(d) {return ''});
		compSliderChart.yAxis().tickFormat(function(d) {return ''});
//        companyChart.yAxis().ticks(15);

		companyChart
		    .renderArea(true)
		    .width(990)
		    .height(200)
		    .transitionDuration(1000)
		    .margins({top: 30, right: 50, bottom: 25, left: 40})
		    .dimension(compDim)
		    .mouseZoomable(true)
		    // Specify a range chart to link the brush extent of the range with the zoom focue of the current chart.
		    .rangeChart(compSliderChart)
		    .x(d3.scale.ordinal().domain([""])) // Need empty val to offset first value
			.xUnits(dc.units.ordinal)
//			.x(d3.scale.ordinal().domain([""])) // Need empty val to offset first value
//			.xUnits(dc.units.ordinal)
//		    .elasticY(true)
		    .renderHorizontalGridLines(true)
		    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
		    .brushOn(false)
		    // Add the base layer of the stack with group. The second parameter specifies a series name for use in the
		    // legend
		    // The `.valueAccessor` will be used for the base layer
		    .group(compGrp, 'Monthly Index Average');
//		    .valueAccessor(function (d) {
//		        return d.value.avg;
//		    })
		    // stack additional layers with `.stack`. The first paramenter is a new group.
		    // The second parameter is the series name. The third is a value accessor.
//		    .stack(monthlyMoveGroup, 'Monthly Index Move', function (d) {
//		        return d.value;
//		    })
		    // title can be called by any stack layer.
//		    .title(function (d) {
//		        var value = d.value.avg ? d.value.avg : d.value;
//		        if (isNaN(value)) {
//		            value = 0;
//		        }
//		        return dateFormat(d.key) + '\n' + numberFormat(value);
//		    });

/*		compSliderChart
			.width(990)
		    .height(40)
		    .margins({top: 0, right: 50, bottom: 20, left: 40})
		    .dimension(compDim)
			.group(compGrp)
		    .centerBar(true)
		    .gap(1)
		    .x(d3.time.scale().domain([new Date(2009, 0, 1), new Date(2015, 11, 31)]))
		    .round(d3.time.month.round)
		    .alwaysUseRounding(true)
		    .xUnits(d3.time.months);
//			.x(d3.scale.ordinal().domain([""])) // Need empty val to offset first value
//			.xUnits(dc.units.ordinal);
/*********************************************************************************************************************************
************************************************************** SLider ************************************************************
*********************************************************************************************************************************/
/*		sliderDate.sort(function(a, b){return a-b});
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
		});*/
/*
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
}*/
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
            .dimension(nameDim)
            .group(function (d) {return d.date.getFullYear();})
            .size(20)
            .columns([
                'id',
				'date',
				'person_id',
				'name',
				{
					label: 'Company',
					format: function (d) {
						return d.company;	
					} 
				},
				{
					label: 'Repository',
					format: function (d) {
						return d.repo;	
					} 
				},
				'tz',
				'tz_orig'
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
	var names = d['names'];
	var values = d['values'];
    $.each(values, function(index, val){
		var dic = {};
		dic[names[0]] = val[0];
		dic[names[1]] = val[1];
		dic[names[2]] = val[2];
		dic[names[3]] = val[3];
		dic[names[4]] = val[4];
		dic[names[5]] = val[5];
		dic[names[6]] = val[6];
		dic[names[7]] = val[7];
		if (val[4] == 261){
			dic['company'] = 'No Company';
		} else if (val[4] > 261){
			dic['company'] = scmCompany['values'][val[4]-2][1];
		} else {
			dic['company'] = scmCompany['values'][val[4]-1][1];
		}
		dic['repo'] = scmRepo['values'][val[5]-1][1];
        array.push(dic);
    });
    return array;
}
