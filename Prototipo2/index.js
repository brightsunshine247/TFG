var aging = {};
var birth = {};
var check = [];
$(document).ready(function(){
    var stillNoStillChart = dc.pieChart('#still-nostill-chart');
    var monthChart = dc.pieChart('#month-chart');
    var dayChart = dc.barChart('#day-chart');
    var demographChart = dc.rowChart('#demograph-chart');
	var yearChart = dc.pieChart('#year-chart');
    var tzCharts = dc.rowChart('#time-zone-chart');
	var companyChart = dc.barChart('#company-chart');
	var table = dc.dataTable('.dc-data-table');
    $.when(
		// Load agin json file
        $.getJSON('its-demographics-aging.json', function (data) {
            aging = data;
        }),
		// Load birth json file
        $.getJSON('its-demographics-birth.json', function (data) {
            birth = data;
        })
    ).done(function(){
        datas = birAgin(birth['persons'], aging['persons']);
        data = dcFormat(datas);
        var ndx = crossfilter(data);
		var all = ndx.groupAll();

		// Add date for each data
		var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
		var format = dateFormat.parse(birth['date']);
		var initDate = ((new Date(format.getFullYear(), format.getMonth(), format.getDay())-new Date(1970, 0, 0))/(1000*60*60*24));
        data.forEach(function (d) {
		    d.one = 1; // value 1 for each data
			d.day = initDate-d.age;
		    d.date = dateFormat.parse(dateFormat(new Date(1970, 0, d.day)));
		});
/*********************************************************************************************************************************
****************************************************** Pie (Donuts) -> Month *****************************************************
*********************************************************************************************************************************/
        var monthDim = ndx.dimension(function(d) {
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
***************************************************** Pie (Donuts) -> Month ******************************************************
*********************************************************************************************************************************/
        var dayDim = ndx.dimension(function(d) {
            return (d.date.getDay()+1);
        });
        var dayGrp = dayDim.group();

        dayChart
            .width(450).height(300)
            .dimension(dayDim)
            .group(dayGrp)
            .x(d3.scale.linear().domain([0,32]))
			.centerBar(true)
//			.elasticX(true)
			.centerBar(true)
			.elasticY(true)
			.brushOn(true)
			.renderHorizontalGridLines(true)
			.margins({top: 0, right: 50, bottom: 20, left: 40});
        dayChart.xAxis().tickFormat(function(d) {return d});
        dayChart.yAxis().ticks(15);
/*********************************************************************************************************************************
********************************************************* Row -> Demograph *******************************************************
*********************************************************************************************************************************/
		var axisY = [];
		var demoDim = ndx.dimension(function(d){
			var i = Math.floor(d.age/181);
			axisY[i]=((181*i)+'-'+((i+1)*181));
			return axisY[i];
		})
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
*********************************************************** Pie -> Year **********************************************************
*********************************************************************************************************************************/
		var yearDim = ndx.dimension(function(d) {
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
******************************************************** Row -> Time Zone ********************************************************
*********************************************************************************************************************************/
		var tzDim = ndx.dimension(function(d) {
            return d.TZ;
        });
        var tzGrp = tzDim.group().reduceSum(function(d) {
            return d.one;
        });
        tzCharts.width(450).height(400)
			.margins({top: 0, right: 50, bottom: 20, left: 40})
			.elasticX(true)
			.dimension(tzDim)
			.group(tzGrp)
			.elasticX(true)
			.ordering(function(d) {
				return d.key;
			})
			.title(function(d) { return d.key+' -> '+d.value})
/*********************************************************************************************************************************
**************************************************** Pie -> Still VS No Still ****************************************************
*********************************************************************************************************************************/
        var sNsDim = ndx.dimension(function (d) {
            return d.nostill > d.still ?  'No': 'Yes';
        });
        var sNsGrp = sNsDim.group();
        stillNoStillChart
            .width(180) // (optional) define chart width, :default = 200
            .height(180) // (optional) define chart height, :default = 200
            .radius(80) // define pie radius
            .dimension(sNsDim) // set dimension
            .group(sNsGrp)
			.label(function (d) {
				if (stillNoStillChart.hasFilter() && !stillNoStillChart.hasFilter(d.key)) { // show %
					return d.key + '(0%)';
				}
				var label = d.key;
				if (all.value()) {
					label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
				}
				return label;
			})
/*********************************************************************************************************************************
********************************************************* Bar -> Company *********************************************************
*********************************************************************************************************************************/
		var compDim = ndx.dimension(function(d) {
			return d.company;
        }).dispose();
		var compGrp = compDim.group().reduceSum(function(d){
			return d.one;
		});
		companyChart
			.width(450)
			.height(300)
			.margins({top: 0, right: 50, bottom: 20, left: 40})
			.dimension(compDim)
			.group(compGrp)
			.centerBar(true)
			.gap(1)
			.x(d3.scale.linear().domain([-1, 7]))
			.elasticY(true)
			.alwaysUseRounding(true);
		// ---------------------------- Reset All charts and dataTable -------------------------------------
        dc.dataCount('.dc-data-count')
            .dimension(ndx)
            .group(all)
            .html({
                some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                    ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
                all:'All records selected. Please click on the graph to apply filters.'	
            });
/*********************************************************************************************************************************
************************************************************ DataTable ***********************************************************
**********************************************************************************************************************************/
        var nameDimension = ndx.dimension(function (d) {
            return d.name;
        });
		
        table
            .dimension(nameDimension)
            .group(function (d) {return "";})
            .size(20)
            .columns([
                {
                    label: 'Date', // desired format of column name 'Change' when used as a label with a function.
                    format: function (d) {
            			var formato = d3.format('02d');
						return d.date.getFullYear() + ' / ' + formato((d.date.getMonth() + 1)) + ' / ' + formato(d.date.getDay()+1);
                    }
                },
                'id',
                'name',
				{
					label: 'Still',
					format: function (d) {
						if (d.still == 1){
							return 'YES';
						}else{
							return 'NO';
						};
					}
				},
				'company',
				'TZ',
				{
					label: 'Select',
					format: function (d) {
						return '<input class="checktable" type="checkbox" id="'+d.id+'">'
					}
				}
            ])
            .sortBy(function (d) {
                return d.date;
            })
            .order(d3.ascending);

		table.on('renderlet', function(table) {
			table.selectAll('.dc-table-group').classed('info', true);
			// ---------------------------- Sort ---------------------------------------------------
			table.selectAll('.dc-table-head').on("click", function(d){
				table.filterAll();
				if (d.label == "Date"){
					table.sortBy(function (d2){
						return d2.date;
					});
				}else if (d == "id"){
					table.sortBy(function (d2){
						return d2.id;
					});
				}else if (d == "name"){
					table.sortBy(function (d2){
						return d2.name;
					});
				}else if (d == "company"){
					table.sortBy(function (d2){
						return d2.company;
					});
				}else if (d == "TZ"){
					table.sortBy(function (d2){
						return d2.TZ;
					});
				}else if (d.label == "Still"){
					table.sortBy(function(d2){
						return d2.still;
					});
				}
				dc.redrawAll();
			}); 
			// ---------------------------- First column, Date -------------------------------------
			table.selectAll(".dc-table-column._0").on("click", function(d){
				var year = d.date.getFullYear();
				var month = d.date.getMonth()+1;
				var day = d.date.getDay()+1;
				$('#show-date').show();
				$("#show-date").html('<div>Year: <span id="clickYear">'+year+'</span><br>Month: <span id="clickMonth">'+month+'</span><br>Day: <span id="clickDay">'+day+'</span><br><button onclick="closeDate()">Close</button>');
			});
			// ---------------------------- Third column, Name ---------------------------------------
			table.selectAll(".dc-table-column._2").on("click", function(d){
				clickRow(d.date, d.id, d.name, d.still, d.TZ, d.company);
			});
			// ---------------------------- Fourth column, Still -------------------------------------
			table.selectAll(".dc-table-column._3").on("click", function(d){
				var still = d.still;
				var dim = ndx.dimension(function(d2) {
					return d2.still.toString();
				});
				select_filter(dim, still);
			});
			// ---------------------------- Fifth column, Company ------------------------------------
			table.selectAll(".dc-table-column._4").on("click", function(d){
				var company = d.company;
				var dim = ndx.dimension(function(d2) {
					return d2.company.toString();
				});
				select_filter(dim, company);
			});
			// ---------------------------- Sixth column, Time zone ----------------------------------
			table.selectAll(".dc-table-column._5").on("click", function(d){
				var tz = d.TZ;
				var dim = ndx.dimension(function(d2) {
					return d2.TZ.toString();
				});
				select_filter(dim, tz);
			});
			// ---------------------------- Seventh column, CheckBox ---------------------------------
			$(".checktable").each(function(index, d){
				$('#'+d.id).click(function() {
					if ($(this).is(':checked')) {
						check.push(d.id);
//						return "";
					}else{
						var i = check.indexOf(d.id);
						check.splice(i, 1)
//						return "";
					}
					console.log(check);
				});
			});
		});
		// ---------------------------- Column select filter function for dataTable -------------------------------------
		function select_filter(dim, data){
			table.filterAll();
			dim.filter(function(d){
				return 0 == d.search(data);
			});
			dc.redrawAll();
		}
		$("#filt").on("click", function(){
			
		});
/*********************************************************************************************************************************
********************************************************** Table Search **********************************************************
*********************************************************************************************************************************/
		$("#table-search").on('input',function(){
			text_filter(nameDimension, this.value);
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
    var keys = [];
    var value = [];
    $.each(d, function(key, val){
        keys.push(key);
        value.push(val);
    });
    for (var i=0; i<value[0].length; i++){
        var data = {};
        for (var j=0; j<keys.length; j++){
            data[keys[j]] = value[j][i];
        }
        array.push(data);
    }
    return array;
}
/*********************************************************************************************************************************
****************************************** Combine two JSON file(Birth, Aging) into one ******************************************
*********************************************************************************************************************************/
function birAgin(d1, d2){
	var value1 = [];
	var value2 = [];
	var sigue = [];
	var nosigue = [];
	var tz = [];
	var company =  [];
	$.each(d1, function(key, val){
		if (key == 'id'){
			value1.push(val);
		}
	});
	$.each(d2, function(key, val){
		if (key == 'id'){
			value2.push(val);
		}
	});
	for (var i=0; i<value1[0].length; i++){
		var TZ = Math.floor(Math.random() * (13 + 12) - 12);
		tz.push(TZ);
		var Company = Math.floor(Math.random()*7);
		company.push(Company);
		var yes = 0;
		var no = 1;
		if(value2[0].indexOf(value1[0][i]) != -1){
			yes = 1;
			no = 0;
		}
		sigue.push(yes);
		nosigue.push(no);
	}
	d1['TZ'] = tz;
	d1['company'] = company;
	d1['still'] = sigue;
	d1['nostill'] = nosigue;
	return d1
}
/*********************************************************************************************************************************
*********************************************** close profile or close "show date" ***********************************************
*********************************************************************************************************************************/
function closeProfile(){
	dc.filterAll();
	dc.renderAll();
	dc.redrawAll();
	$('#profile').hide();
}
function closeDate(){
	$('#show-date').hide();
}
/*********************************************************************************************************************************
**************************************************** Onclick on the table row ****************************************************
*********************************************************************************************************************************/
function clickRow(date, id, name, still, TZ, company){
	var aux;
	if (still == 0){
		aux = "NO";
	}else{
		aux = "YES";
	}
	$('#profile').show();
	$("#profile").html('Name: '+name+' Id: '+id+'<br>Company: '+company+' Still: '+aux+'<br>Date: '+date.toString().split("00:00")[0]+' TZ: '+TZ+'<br><button onclick="closeProfile()">Close</button>');
}
