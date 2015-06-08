var table;
var yearChart;
var monthChart;
var dayOfWeekChart;
var companyChart;
var repoChart;
var tzChart;
var commitChart;
var compTimeChart;
var repoTimeChart;
var scmCompany;
var scmRepo;
var scmCommit;

$(document).ready(function(){
	monthChart = dc.pieChart('#month-chart');
    dayOfWeekChart = dc.pieChart('#day-Of-Week');
	yearChart = dc.pieChart('#year-chart');
	companyChart = dc.barChart('#company-chart');
	var compSliderChart = dc.barChart('#comp-slider-chart');
	repoChart = dc.barChart('#repo-chart');
	var repoSliderChart = dc.barChart('#repo-slider-chart');
	tzChart = dc.barChart('#tz-chart');
	var tzSliderChart = dc.barChart('#tz-slider-chart');
	commitChart = dc.lineChart('#commit-chart');
	var commitSliderChart = dc.barChart('#commit-slider-chart');
	compTimeChart = dc.lineChart('#comp-time-chart');
	var compTimeSliderChart = dc.barChart('#comp-time-slider-chart');
	repoTimeChart = dc.lineChart('#repo-time-chart');
	var repoTimeSliderChart = dc.barChart('#repo-time-slider-chart');
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
			d.dd = dateFormat.parse(d.date);
			d.month = d3.time.month(d.dd); 
		});
//console.log(data)
/*		fullDateDim = ndx.dimension(function(d) {
			return d.date;
		});*/
/*********************************************************************************************************************************
*********************************************************** Pie -> Year **********************************************************
*********************************************************************************************************************************/
		yearDim = ndx.dimension(function(d) {
            return d.dd.getFullYear();
        });
        var yearGrp = yearDim.group();

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
            return d.dd.getMonth()+1;
        });
        var monthGrp = monthDim.group();

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
			if (d.dd.getDay() == 1){
				name = 'Monday';
			} else if (d.dd.getDay() == 2){
				name = 'Tuesday';
			} else if (d.dd.getDay() == 3){
				name = 'Wednesday';
			} else if (d.dd.getDay() == 4){
				name = 'Thursday';
			} else if (d.dd.getDay() == 5){
				name = 'Friday';
			} else if (d.dd.getDay() == 6){
				name = 'Saturday';
			} else if (d.dd.getDay() == 0){
				name = 'Sunday';
			}
            return name;
        });

        var dayOfWeekGrp = dayOfWeekDim.group();

        dayOfWeekChart.width(180)
            .height(180)
            .radius(80)
            .innerRadius(30)
            .dimension(dayOfWeekDim)
            .group(dayOfWeekGrp);
/*********************************************************************************************************************************
************************************************************** Company ***********************************************************
*********************************************************************************************************************************/
		var compDim = ndx.dimension(function(d){
			return d.org_id;
		})

		var compGrp = compDim.group();

		var domain = [];

		compGrp.top(Infinity).forEach(function(d) {
			domain[domain.length] = d.key;
		});

		var repoDim = ndx.dimension(function(d){
			return d.repo_id;
		})

		var repoGrp = repoDim.group();

		var domainRepo = [];

		repoGrp.top(Infinity).forEach(function(d) {
			domainRepo[domainRepo.length] = d.key;
		});

		data.forEach(function (d) {
			d.order_company = domain.indexOf(d.org_id);
			d.order_repo = domainRepo.indexOf(d.repo_id)
		});

		var companyDim = ndx.dimension(function(d){
			return d.order_company;
		});
		var companyGrp = companyDim.group();
/*
.x(d3.scale.ordinal())
		    .xUnits(dc.units.ordinal)
*/
		companyChart
		    .width(990)
		    .height(300)
		    .transitionDuration(1000)
		    .margins({top: 30, right: 50, bottom: 25, left: 50})
		    .dimension(companyDim)
		    .rangeChart(compSliderChart)
		    //.x(d3.scale.ordinal().domain(domain))
    		//.xUnits(dc.units.ordinal)
			.x(d3.scale.linear().domain([-1,382]))
			.elasticY(true)
			.centerBar(true)
		    .renderHorizontalGridLines(true)
		    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
		    .brushOn(false)
		    .group(companyGrp, 'Companies')
			.ordering(function(d) { return -d.value })
		    .title(function (d) {
				var comp;
				if (domain[d.key] == 261){
					comp = 'No Company';
				} else if (domain[d.key] > 261){
					comp = scmCompany['values'][domain[d.key]-2][1];
				} else {
					comp = scmCompany['values'][domain[d.key]-1][1];
				}
				return comp + ': ' + d.value;
		    });
			

		compSliderChart
			.width(990).height(40)
			.margins({top: 0, right: 50, bottom: 20, left: 50})
            .dimension(companyDim)
            .group(companyGrp)
			.centerBar(true)
			.gap(1)
			//.x(d3.scale.ordinal().domain(domain))
    		//.xUnits(dc.units.ordinal)
			.x(d3.scale.linear().domain([-1,382]))
			.brushOn(true)
			.alwaysUseRounding(true);
		compSliderChart.yAxis().tickFormat(function(d) {return ''});


/*********************************************************************************************************************************
************************************************************** Repo ***********************************************************
*********************************************************************************************************************************/
		var repoOrderDim = ndx.dimension(function(d){
			return d.order_repo;
		});
		var repoOrderGrp = repoOrderDim.group();


		repoChart
		    .width(990)
		    .height(300)
		    .transitionDuration(1000)
		    .margins({top: 30, right: 50, bottom: 25, left: 50})
		    .dimension(repoOrderDim)
		    .rangeChart(repoSliderChart)
		    .x(d3.scale.linear().domain([-1,182]))
			.elasticY(true)
			.centerBar(true)
		    .renderHorizontalGridLines(true)
		    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
		    .brushOn(true)
		    .group(repoOrderGrp, 'Repo')
			.title(function (d) {
				return scmRepo['values'][domainRepo[d.key]-1][1] + ': ' + d.value;
		    });

		repoSliderChart
			.width(990).height(40)
			.margins({top: 0, right: 50, bottom: 20, left: 50})
            .dimension(repoOrderDim)
            .group(repoOrderGrp)
			.centerBar(true)
			.gap(1)
			.x(d3.scale.linear().domain([-1,182]))
			.brushOn(true)
			.alwaysUseRounding(true);
			
		repoSliderChart.yAxis().tickFormat(function(d) {return ''});

/*********************************************************************************************************************************
************************************************************ Time Zone ***********************************************************
*********************************************************************************************************************************/
		var tzDim = ndx.dimension(function(d){
			return d.tz;
		})

		var tzGrp = tzDim.group();
		

		tzChart
		    .width(990)
		    .height(300)
		    .transitionDuration(1000)
		    .margins({top: 30, right: 50, bottom: 25, left: 50})
		    .dimension(tzDim)
		    .rangeChart(tzSliderChart)
		    .x(d3.scale.linear().domain([-13,13]))
			.elasticY(true)
			.centerBar(true)
		    .renderHorizontalGridLines(true)
		    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
		    .brushOn(false)
		    .group(tzGrp, 'Time Zone');

		tzSliderChart
			.width(990).height(40)
			.margins({top: 0, right: 50, bottom: 20, left: 50})
            .dimension(tzDim)
            .group(tzGrp)
			.centerBar(true)
			.gap(1)
			.x(d3.scale.linear().domain([-13,13]))
			.brushOn(true)
			.alwaysUseRounding(true);
			
		tzSliderChart.yAxis().tickFormat(function(d) {return ''});

/*********************************************************************************************************************************
************************************************************ Commit ***********************************************************
*********************************************************************************************************************************/
		var compDic = {};
		var repoDic = {};
		var monthDim = ndx.dimension(function(d){
			compDic[d.month] = [];
			repoDic[d.month] = [];
			return d.month;
		});

		var commitGrp = monthDim.group();
		

		commitChart
		    .renderArea(true)
		    .width(990)
		    .height(300)
		    .transitionDuration(1000)
		    .margins({top: 30, right: 50, bottom: 25, left: 50})
		    .dimension(monthDim)
		    .rangeChart(commitSliderChart)
		    .x(d3.time.scale().domain([new Date(2010, 0, 1), new Date(2015, 11, 31)]))
        	.round(d3.time.month.round)
        	.xUnits(d3.time.months)
			.elasticY(true)
		    .renderHorizontalGridLines(true)
		    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
		    .brushOn(true)
		    .group(commitGrp, 'Commit');

		commitSliderChart
			.width(990).height(40)
			.margins({top: 0, right: 50, bottom: 20, left: 50})
            .dimension(monthDim)
            .group(commitGrp)
			.centerBar(true)
			.gap(1)
			.x(d3.time.scale().domain([new Date(2010, 0, 1), new Date(2015, 11, 31)]))
        	.round(d3.time.month.round)
        	.xUnits(d3.time.months)
			.brushOn(true)
			.alwaysUseRounding(true);
		commitSliderChart.yAxis().tickFormat(function(d) {return ''});

/*********************************************************************************************************************************
******************************************************** Company by Date *********************************************************
*********************************************************************************************************************************/

		var compTGrp = monthDim.group().reduceSum(function(d){
			if (compDic[d.month].indexOf(d.org_id) == -1){
				compDic[d.month].push(d.org_id);
				return 1;
			} else {
				return 0;
			}
		});

		var repoTGrp = monthDim.group().reduceSum(function(d){
			if (repoDic[d.month].indexOf(d.repo_id) == -1){
				repoDic[d.month].push(d.repo_id);
				return 1;
			} else {
				return 0;
			}
		});

		compTimeChart
		    .renderArea(true)
		    .width(450)
		    .height(300)
		    .transitionDuration(1000)
		    .margins({top: 30, right: 50, bottom: 25, left: 50})
		    .dimension(monthDim)
		    .rangeChart(compTimeSliderChart)
		    .x(d3.time.scale().domain([new Date(2010, 0, 1), new Date(2015, 11, 31)]))
        	.round(d3.time.month.round)
        	.xUnits(d3.time.months)
			.elasticY(true)
		    .renderHorizontalGridLines(true)
		    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
		    .brushOn(true)
		    .group(compTGrp, 'Company')

		compTimeSliderChart
			.width(450).height(40)
			.margins({top: 0, right: 50, bottom: 20, left: 50})
            .dimension(monthDim)
            .group(compTGrp)
			.centerBar(true)
			.gap(1)
			.x(d3.time.scale().domain([new Date(2010, 0, 1), new Date(2015, 11, 31)]))
        	.round(d3.time.month.round)
        	.xUnits(d3.time.months)
			.brushOn(true)
			.alwaysUseRounding(true);
		compTimeSliderChart.yAxis().tickFormat(function(d) {return ''});

/*********************************************************************************************************************************
******************************************************** Repo by Date *********************************************************
*********************************************************************************************************************************/
		var repoTGrp = monthDim.group().reduceSum(function(d){
			if (repoDic[d.month].indexOf(d.repo_id) == -1){
				repoDic[d.month].push(d.repo_id);
				return 1;
			} else {
				return 0;
			}
		});

		repoTimeChart
		    .renderArea(true)
		    .width(450)
		    .height(300)
		    .transitionDuration(1000)
		    .margins({top: 30, right: 50, bottom: 25, left: 50})
		    .dimension(monthDim)
		    .rangeChart(repoTimeSliderChart)
		    .x(d3.time.scale().domain([new Date(2010, 0, 1), new Date(2015, 11, 31)]))
        	.round(d3.time.month.round)
        	.xUnits(d3.time.months)
			.elasticY(true)
		    .renderHorizontalGridLines(true)
		    .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
		    .brushOn(false)
		    .group(repoTGrp, 'Repository by Date');

		repoTimeSliderChart
			.width(450).height(40)
			.margins({top: 0, right: 50, bottom: 20, left: 50})
            .dimension(monthDim)
            .group(repoTGrp)
			.centerBar(true)
			.gap(1)
			.x(d3.time.scale().domain([new Date(2010, 0, 1), new Date(2015, 11, 31)]))
        	.round(d3.time.month.round)
        	.xUnits(d3.time.months)
			.brushOn(true)
			.alwaysUseRounding(true);
		repoTimeSliderChart.yAxis().tickFormat(function(d) {return ''});
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
            .group(function (d) {return d.dd.getFullYear();})
            .size(20)
            .columns([
                'id',
				{
					label: 'Date',
					format: function (d) {
						var formato = d3.format('02d');
						return d.date;
					} 
				},
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
