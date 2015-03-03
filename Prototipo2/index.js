var aging = {};
var birth = {};
$(document).ready(function(){
    var gainOrLossChart = dc.pieChart('#gain-loss-chart');
    var quarterChart = dc.pieChart('#quarter-chart');
    var barChart = dc.barChart('#fluctuation-chart');
    var rowChart = dc.rowChart('#day-of-week-chart');
	var yearChart = dc.pieChart('#year');
    var lineCharts = dc.compositeChart('#monthly-move-chart');
	var combined = dc.compositeChart('#combine');
	var subRowChart = dc.barChart('#subRow');
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
        var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
        data.forEach(function (d) {
            d.one = 1; // value 1 for each data
            d.dd = dateFormat.parse(birth['date']);
			d.currentDay = ((new Date(d.dd.getFullYear(), d.dd.getMonth(), d.dd.getDay())-new Date(1970, 0, 1))/(1000*60*60*24))+1;
            d.day = d.currentDay - d.age;
            d.date = dateFormat.parse(dateFormat(new Date(1970, 0, d.day)));
        });
        //-------------------------------- Donuts ------------------------------------
        var quarterDim = ndx.dimension(function(d) {
            return d.date.getMonth()+1;
        });
        var quarterGrp = quarterDim.group().reduceSum(function(d) {
            return d.one;
        });
        quarterChart.width(180)
            .height(180)
            .radius(80)
            .innerRadius(30)
            .dimension(quarterDim)
            .group(quarterGrp);

        //--------------------------------- Bar --------------------------------------
        var barDim = ndx.dimension(function(d) {
            return (d.date.getDay());
        });
        var barGrp = barDim.group();

        barChart
            .width(600).height(500)
            .dimension(barDim)
            .group(barGrp)
            .x(d3.scale.linear().domain([1,31]))
			.elasticX(true)
			.centerBar(false)
			.elasticY(true)
			.brushOn(true)
			.renderHorizontalGridLines(true)
			.margins({
				top: 10,
				right: 10,
				bottom: 75,
				left: 100
			})
        barChart.xAxis().tickFormat(function(d) {return d});
        barChart.yAxis().ticks(15);

        //----------------------------------- Row -------------------------------------------
		var axisY = [];
		var rowDim = ndx.dimension(function(d){
			var i = Math.floor(d.age/181);
			axisY[i]=((181*i)+'-'+((i+1)*181));
			return axisY[i];
		})
		var rowGrp = rowDim.group();
		rowChart
			.width(700).height(500)
			.margins({top: 0, right: 50, bottom: 20, left: 40})
			.elasticX(true)
			.dimension(rowDim)
			.group(rowGrp)
			.elasticX(true)
			.ordering(function(d) {
				return -d.key.split('-')[0];
			})
			.title(function(d) { return d.key+' -> '+d.value})

		//-------------------------------------- Bar subchart --------------------------------
		var axisYear = [];
		var subDim = ndx.dimension(function(d) {
			var i = d.date.getFullYear()-2001;
			axisYear[i] = d.date.getFullYear();
            return d.date.getFullYear();
        }).dispose();
		var subGrp = subDim.group();
		subRowChart
			.width(700)
			.height(100)
		//	.margins({top: 0, right: 50, bottom: 20, left: 40})
			.dimension(subDim)
			.group(subGrp)
			.centerBar(true)
			.gap(1)
			.x(d3.scale.linear().domain([2001, 2015]))
			.alwaysUseRounding(true);

			
		//---------------------------------------- Pie per Year -----------------------------
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

			
        dc.dataCount('.dc-data-count')
            .dimension(ndx)
            .group(all)
            .html({
                some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                    ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
                all:'All records selected. Please click on the graph to apply filters.'
            });

        //--------------------------------------- Tabla -------------------------------------------------------------
        var dateDimension = ndx.dimension(function (d) {
            return d.dd;
        });
        table
            .dimension(dateDimension)
            .group(function (d) {
                var format = d3.format('02d');
                return d.date.getFullYear() + ' / ' + format((d.date.getMonth() + 1));
            })
            .size(data.length/10)
            .columns([
                {
                    label: 'date', // desired format of column name 'Change' when used as a label with a function.
                    format: function (d) {
                        var formato = d3.format('02d');
						return d.date.getFullYear() + ' / ' + formato((d.date.getMonth() + 1)) + ' / ' + formato(d.date.getDay());
                    }
                },
                'id',
                'name',
				{
					label: 'sigue',
					format: function (d) {
						if (d.sigue == 1){
							return 'SI';
						}else{
							return 'NO';
						};
					}
				}
				
            ])
            .sortBy(function (d) {
                return d.dd;
            })
            .order(d3.ascending);
            /*.renderlet(function (table) {
                
            });*/
		table.on('renderlet', function(table) {
			table.selectAll('.dc-table-group').classed('info', true);
			table.selectAll(".dc-table-row").on("click", function(d){selection(d.date, d.id, d.name, d.sigue)});
		});
		
        //------------------------------------------------ Line ----------------------------------------------
		
        var lineDim = ndx.dimension(function (d) {
            return d.age;
        });
		var lineDim2 = ndx.dimension(function (d) {
            return d.age/31;
        });
        var lineGrp = lineDim.group().reduceSum(function (d) {
            return d.sigue;
        });
		var lineGrp2 = lineDim.group().reduceSum(function (d){
			return d.nosigue;
		})
        lineCharts
            .width(1000)
            .height(350)
            .transitionDuration(1000)
            .margins({top: 30, right: 50, bottom: 25, left: 40})
            .mouseZoomable(true)
       	//	.x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 11, 31)]))
			.x(d3.scale.linear().domain([0,50]))
//            .round(d3.time.month.round)
//       		.xUnits(d3.time.months)
			.elasticX(true)
            .elasticY(true)
            .renderHorizontalGridLines(true)
            .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
            .brushOn(true)
			.compose([
				dc.lineChart(lineCharts)
					.dimension(lineDim)
					.colors('red')
					.group(lineGrp, "Birth")
					.dashStyle([0,0]),
				dc.lineChart(lineCharts)
					.dimension(lineDim2)
					.colors('blue')
					.group(lineGrp2, "Aging")
					.dashStyle([1,2])
            ])

        //-------------------------------------------------------- Gain and Lost ----------------------------------------------
        var gainOrLoss = ndx.dimension(function (d) {
            return d.nosigue > d.sigue ?  'No': 'Si';
        });
        var gainOrLossGroup = gainOrLoss.group();
        gainOrLossChart
            .width(180) // (optional) define chart width, :default = 200
            .height(180) // (optional) define chart height, :default = 200
            .radius(80) // define pie radius
            .dimension(gainOrLoss) // set dimension
            .group(gainOrLossGroup)
			.label(function (d) {
				if (gainOrLossChart.hasFilter() && !gainOrLossChart.hasFilter(d.key)) {
					return d.key + '(0%)';
				}
				var label = d.key;
				if (all.value()) {
					label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
				}
				return label;
			})
		
		//---------------------------------------------- Bar combine -------------------------------------------
		var combDim = ndx.dimension(function (d) {
			var i = Math.floor(d.age/181);
			return axisY[i];
		});
		var combGrp = combDim.group().reduceSum(function (d){
			return d.one;
		});
		var combGrp2 = combDim.group().reduceSum(function (d){
			return d.sigue;
		});
		combined
			.width(1100)
			.height(500)
			//  .colors( d3.scale.category10() )
			//  .shareColors(true)
			.brushOn(true)
			.elasticY(true)
			.x(d3.scale.ordinal().domain(axisY))
			.xUnits(dc.units.ordinal)
//			.xUnits( function() { return 20; } )
//			.margins({top: 15, right: 10, bottom: 20, left: 40});
			.renderHorizontalGridLines(true)
			.margins({
				top: 10,
				right: 10,
				bottom: 75,
				left: 100
			})
			.legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
			.compose([
				dc.barChart(combined)
					.dimension(combDim)
					.colors('red')
					.group(combGrp, 'Birth')
					.centerBar(true)
					.barPadding(0.2),

				dc.barChart(combined)
					.dimension(combDim)
					.colors('blue')
					.group(combGrp2, 'Aging')
					.centerBar(true)
					.barPadding(0.3)
			])

        dc.renderAll();
    });
});
//--------------------------------------- Valid format for dc.js ----------------------------------------
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
//--------------------------------------------- Combine two JSON file(Birth, Aging) into one ----------------------
function birAgin(d1, d2){
	var value1 = [];
	var value2 = [];
	var sigue = [];
	var nosigue = [];
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
		var yes = 0;
		var no = 1;
		if(value2[0].indexOf(value1[0][i]) != -1){
			yes = 1;
			no = 0;
		}
		sigue.push(yes);
		nosigue.push(no);
	}
	d1['sigue'] = sigue;
	d1['nosigue'] = nosigue;
	return d1
}
//------------------------------------------------- Selection on the table -------------------------------------
function selection(date, id, name, still){
	alert(date+' '+id+' '+name+' '+still);
}