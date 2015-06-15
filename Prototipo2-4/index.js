var table;
var yearChart;
var monthChart;
var dayOfWeekChart;
var companyChart;
var companySliderChart;
var repoChart;
var repoSliderChart;
var tzChart;
var tzSliderChart;
var commitChart;
var commitSliderChart;
var compTimeChart;
var compTimeSliderChart;
var repoTimeChart;
var repoTimeSliderChart;
var scmCompany;
var scmRepo;
var scmCommit;
var sliderDate = [];
var dates = [];
var fullDateDim;
$(document).ready(function(){
	monthChart = dc.pieChart('#month-chart');
    dayOfWeekChart = dc.pieChart('#day-Of-Week');
	yearChart = dc.pieChart('#year-chart');
	companyChart = dc.barChart('#company-chart');
	compSliderChart = dc.barChart('#comp-slider-chart');
	repoChart = dc.barChart('#repo-chart');
	repoSliderChart = dc.barChart('#repo-slider-chart');
	tzChart = dc.barChart('#tz-chart');
	tzSliderChart = dc.barChart('#tz-slider-chart');
	commitChart = dc.lineChart('#commit-chart');
	commitSliderChart = dc.barChart('#commit-slider-chart');
	compTimeChart = dc.lineChart('#comp-time-chart');
	compTimeSliderChart = dc.barChart('#comp-time-slider-chart');
	repoTimeChart = dc.lineChart('#repo-time-chart');
	repoTimeSliderChart = dc.barChart('#repo-time-slider-chart');
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
		$('#load').hide();
        var data = dcFormat(scmCommit);
        var ndx = crossfilter(data);
		var all = ndx.groupAll();
		// Add date for each data
		var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
        data.forEach(function (d) {
			d.dd = dateFormat.parse(d.date);
			d.month = d3.time.month(d.dd);
			if (sliderDate.indexOf(d.dd) == -1){
				sliderDate.push(d.dd);
			}
		});
		fullDateDim = ndx.dimension(function(d) {
			return d.dd;
		});
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
		    .brushOn(true)
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
		    .brushOn(true)
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
		    .brushOn(true)
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
************************************************************ Calendar ************************************************************
**********************************************************************************************************************************/
		sliderDate.sort(function(a, b){return a-b});
		for (i=0; i<sliderDate.length; i++){
			var year = sliderDate[i].getFullYear();
			var month = sliderDate[i].getMonth()+1;
			var day = sliderDate[i].getUTCDate();
			if (dates.indexOf(year+'/'+month+'/'+day) == -1){
				dates.push(year+'/'+month+'/'+day);
			}
		};
		var from;
		var to;
		$( "#from" ).datepicker({
			changeMonth: true,
			changeYear: true,
			numberOfMonths: 1,
			onClose: function( selectedDate ) {
				$( "#to" ).datepicker( "option", "minDate", selectedDate );
				from = new Date(parseInt(selectedDate.split('/')[2]), parseInt(selectedDate.split('/')[0])-1, parseInt(selectedDate.split('/')[1]));
				if (to == undefined){
					to = new Date(parseInt(dates[dates.length-1].split('/')[0]), parseInt(dates[dates.length-1].split('/')[1])-1, parseInt(dates[dates.length-1].split('/')[2]));
				}
				var yearF = from.getFullYear();
				var monthF = from.getMonth()+1;
				var dayF = from.getUTCDate();
				var yearT = to.getFullYear();
				var monthT = to.getMonth()+1;
				var dayT = to.getUTCDate();
				if (yearF < 2010) {
					yearF = 2010;
					monthF = 6;
					dayF = 10;
				} else if ((yearF == 2010) && (monthF < 6)) {
					monthF = 6;
					dayF = 10;
				} else if ((yearF == 2010) && (monthF == 6) && (dayF < 10)) {
					dayF = 10;
				}
				if (yearT > 2015){
					yearT = 2015;
				} else if ((yearT == 2015) && (monthT > 5)) {
					monthT = 5;
					dayT = 1;
				} else if ((yearT == 2015) && (monthT == 5) && (dayT != 1)) {
					dayT = 1;
				}
				for(var i=0; i<31; i++){
					if (i == 30) {
						monthF++;
						i = 0;
					}
					if (dates.indexOf(yearF+'/'+monthF+'/'+dayF) != -1){
						var fromDate = dates.indexOf(yearF+'/'+monthF+'/'+dayF);
						break;
					} else {
						dayF++;
					}
				}
				for(var i=0; i<31; i++){
					if (i == 30) {
						monthT++;
						i = 0;
					}
					if (dates.indexOf(yearT+'/'+monthT+'/'+dayT) != -1){
						var toDate = dates.indexOf(yearT+'/'+monthT+'/'+dayT); 
						break;
					} else {
						dayT++;
					}
				}
				$("#slider-range").slider("option", "values", [fromDate, toDate]);
				calendarFilter(from, to);
			}
		});
		$( "#to" ).datepicker({
			changeMonth: true,
			changeYear: true,
			numberOfMonths: 1,
			onClose: function( selectedDate ) {
				$( "#from" ).datepicker( "option", "maxDate", selectedDate );
				if (from == undefined){
					from = new Date(parseInt(dates[0].split('/')[0]), parseInt(dates[0].split('/')[1])-1, parseInt(dates[0].split('/')[2]));
				}
				to = new Date(parseInt(selectedDate.split('/')[2]), parseInt(selectedDate.split('/')[0])-1, parseInt(selectedDate.split('/')[1]));
				var yearF = from.getFullYear();
				var monthF = from.getMonth()+1;
				var dayF = from.getUTCDate();
				var yearT = to.getFullYear();
				var monthT = to.getMonth()+1;
				var dayT = to.getUTCDate();
				if (yearF < 2010) {
					yearF = 2010;
					monthF = 6;
					dayF = 10;
				} else if ((yearF == 2010) && (monthF < 6)) {
					monthF = 6;
					dayF = 10;
				} else if ((yearF == 2010) && (monthF == 6) && (dayF < 10)) {
					dayF = 10;
				}
				if (yearT > 2015){
					yearT = 2015;
				} else if ((yearT == 2015) && (monthT > 5)) {
					monthT = 5;
					dayT = 1;
				} else if ((yearT == 2015) && (monthT == 5) && (dayT != 1)) {
					dayT = 1;
				}
				for(var i=0; i<31; i++){
					if (i == 30) {
						monthF++;
						i = 0;
					} 
					if (dates.indexOf(yearF+'/'+monthF+'/'+dayF) != -1){
						var fromDate = dates.indexOf(yearF+'/'+monthF+'/'+dayF);
						break;
					} else {
						dayF++;
					}
				}
				for(var i=0; i<31; i++){
					if (i == 30) {
						monthT++;
						i = 0;
					} 
					if (dates.indexOf(yearT+'/'+monthT+'/'+dayT) != -1){
						var toDate = dates.indexOf(yearT+'/'+monthT+'/'+dayT); 
						break;
					} else {
						dayT++;
					}
				}
				$("#slider-range").slider("option", "values", [fromDate, toDate]);
				//to = selectedDate;
				calendarFilter(from, to);
			}
		});
/*********************************************************************************************************************************
************************************************************** SLider ************************************************************
*********************************************************************************************************************************/
		$( "#slider-range" ).slider({
			range: true,
			min: 0,
			max: dates.length-1,
			values: [0, dates.length-1],
			slide: function( event, ui ) {
				var from = dates[ui.values[0]];
				var to = dates[ui.values[1]];
				var fromDate = new Date(parseInt(from.split('/')[0]), parseInt(from.split('/')[1])-1, parseInt(from.split('/')[2]));
				var toDate = new Date(parseInt(to.split('/')[0]), parseInt(to.split('/')[1])-1, parseInt(to.split('/')[2]));
				$('#from').val(from);
				$('#to').val(to);
				calendarFilter(fromDate, toDate)
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
                some:'<strong>%filter-count</strong> developer shows from a total for <strong>%total-count</strong> developers' +
                ' | <a onclick="resetAll()">Show all</a>',
            	all:'<strong>%filter-count</strong> developer shows from a total for <strong>%total-count</strong> developers' +
                ' | <a onclick="resetAll()">Show all</a>'
            });
/*********************************************************************************************************************************
**************************************************************** Table ***********************************************************
*********************************************************************************************************************************/
		var nameDim = ndx.dimension(function (d) {
            return d.name;
        });
        table
            .dimension(nameDim)
            .group(function (d) {return "";})
            .size(20)
            .columns([
				{
					label: 'Commit Id',
					format: function (d) {
						return d.id;	
					} 
				},
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

			$(window).bind('scroll', function(){
//console.log($(window).scrollTop()+' = '+($('body').outerHeight() - $(window).innerHeight()))
				if($(this).scrollTop() == ($('body').outerHeight() - $(window).innerHeight())) {
				    var size = table.size();
					var numero = $('.dc-data-count.dc-chart').html().split('<strong>')[1].split('</strong>')[0];
					var total = parseInt(numero);
					if (numero.split(',')[1] != undefined){
						total = parseInt(numero.split(',')[0]+numero.split(',')[1]);
					}
//console.log(size+' '+total)
					if (size < total){
						table.size(size+5);
						dc.redrawAll();
					}
				}
			});
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
/*********************************************************************************************************************************
*********************************************************** Reset All ************************************************************
*********************************************************************************************************************************/
function resetAll(){
	fullDateDim.filterAll();
	dc.filterAll();
	dc.renderAll();
	$('#from').val(" ");
	$('#to').val(" ");
	$("#slider-range").slider("option", "values", [0, dates.length-1]);
}
