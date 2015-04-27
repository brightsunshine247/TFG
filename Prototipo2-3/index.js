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
