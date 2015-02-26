var aging = {};
var birth = {};
$(document).ready(function(){
	$.when(
        $.getJSON('its-demographics-aging.json', function (data) {
            aging = data;
        }),
        $.getJSON('its-demographics-birth.json', function (data) {
            birth = data;
        })
    ).done(function(){
		var datas = birAgin(birth['persons'], aging['persons']);
        var dc = dcFormat(datas);
		var ndx = crossfilter(dc);
		var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
        dc.forEach(function (d) {
            d.one = 1; // value 1 for each data
            d.dd = dateFormat.parse(birth['date']);
            d.day = 16469-d.age;
            d.date = dateFormat.parse(dateFormat(new Date(1970, 0, d.day)));
        });
		
		var mainExample, exampleOne, exampleTwo, exampleThree, test1;

		//var colors = d3.scale.category20().range();

		var test_data = stream_layers(3,20 + Math.random()*50,.1).map(function(data, i) {
			return {
				key: 'Stream' + i
				, values: data
				//, color: colors[i]
			};
		});

		// --------------------------- YEAR MULTIBAR ---------------------------------

		nv.addGraph(function() {
			var year = ndx;
			year.dim = ndx.dimension(function(d) {
				return d.date.getFullYear();
			});
			year.grp = year.dim.group().reduceSum(function(d) {
				return d.one;
			});
			var data = nvd3Format('year', year);
			
			var chart = nv.models.multiBarChart()
                .margin({top: 50, bottom: 30, left: 40, right: 10});

			chart.xAxis
				.tickFormat(d3.format(',f'));

			chart.yAxis
				.tickFormat(d3.format(',f'));

			d3.select('#mainExample')
				.datum(data)
				.transition().duration(500).call(chart);

			nv.utils.windowResize(chart.update);

			chart.legend.dispatch.on('legendClick.updateExamples', function() {
				setTimeout(function() {
					exampleOne.update();
					exampleTwo.update();
					exampleThree.update();
					test1.update();
				}, 100);
			});
			chart.multibar.dispatch.on('elementClick.updateExamples', function(e) {
				setTimeout(function() {
					alert('year: '+e.point.x+' - value: '+e.point.y);
					exampleOne.update();
					exampleTwo.update();
					exampleThree.update();
					test1.update();
				}, 100);
			});
			mainExample = chart;
			alert('asd');
			return chart;
		});



		// --------------------------- MONTH LINE ---------------------------------
		
		nv.addGraph(function() {  
			var month = ndx;
			month.dim = ndx.dimension(function(d) {
				return d.date.getMonth()+1;
			});
			month.grp = month.dim.group().reduceSum(function(d) {
				return d.one;
			});
			var month_data = nvd3Format('month', month);
		
			var chart = nv.models.lineChart()
				.showLegend(false)
                .margin({top: 10, bottom: 30, left: 40, right: 10})
                .useInteractiveGuideline(true);

			chart.xAxis // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the partent chart, so need to chain separately
				.tickFormat(d3.format(',f'));

			chart.yAxis
				.tickFormat(d3.format(',f'));

			d3.select('#exampleOne')
				.datum(month_data)
				.transition().duration(500)
				.call(chart);

			//TODO: Figure out a good way to do this automatically
			nv.utils.windowResize(chart.update);
			//nv.utils.windowResize(function() { d3.select('#chart1 svg').call(chart) });

			exampleOne = chart;

			return chart;
		});


		// --------------------------- STILL VS NO STILL MULTIBARHORIZONTAL ---------------------------------

		
		nv.addGraph(function() {
			var axisY = [];
			var demograB = ndx;
			demograB.dim = ndx.dimension(function(d){
				var i = Math.floor(d.age/181);
				axisY[i]=((181*i)+'-'+((i+1)*181));
				return axisY[i];
			});
			demograB.grp = demograB.dim.group();
			
			var dcA = dcFormat(aging['persons']);
			var demograA = crossfilter(dcA);
			demograA.dim = demograA.dimension(function(d){
				var i = Math.floor(d.age/181);
				axisY[i]=((181*i)+'-'+((i+1)*181));
				return axisY[i];
			})
			demograA.grp = demograA.dim.group();
			var demogra_data = nvd3Format('hbar', [demograB, demograA]);
			
			var chart = nv.models.multiBarHorizontalChart()
				.x(function(d) { return d.label })
				.y(function(d) { return d.value })
				.margin({top: 30, right: 20, bottom: 50, left: 175})
				.showValues(true)
				.tooltips(false)
				.showControls(false);

			chart.yAxis
				.tickFormat(d3.format(',f'));

			d3.select('#exampleTwo')
				.datum(demogra_data)
				.transition().duration(500)
				.call(chart);

			nv.utils.windowResize(chart.update);
				
			chart.legend.dispatch.on('legendClick', function() {
				setTimeout(function() {
					mainExample.update();
					exampleOne.update();
				//	exampleTwo.update();
					exampleThree.update();
					test1.update();
				}, 100);
			});
			/*
			var chart = nv.models.stackedAreaChart()
                .margin({top: 10, bottom: 30, left: 40, right: 10})
                .showControls(false)
                .showLegend(false)
                .useInteractiveGuideline(true)
                .style('stream');

			chart.yAxis
				.showMaxMin(false)
				.tickFormat(d3.format(',.1f'));

			d3.select("#exampleTwo")
				.datum(test_data)
				.transition().duration(500).call(chart);

			nv.utils.windowResize(chart.update);


			chart.stacked.dispatch.on('areaClick.updateExamples', function(e) {
				setTimeout(function() {
					mainExample.update();
					exampleOne.update();
					//exampleTwo.update();
					exampleThree.update();
					test1.update();
				}, 100);
			})
			*/
			exampleTwo = chart;

			return chart;
		});



		// --------------------------- EXAMPLE THREE ---------------------------------


		nv.addGraph(function() {
			var chart = nv.models.stackedAreaChart()
                .margin({top: 10, bottom: 30, left: 40, right: 10})
                .showControls(false)
                .showLegend(false)
                .useInteractiveGuideline(true)
                .style('stacked');

			chart.yAxis
				.tickFormat(d3.format(',.1f'));

			d3.select("#exampleThree")
				.datum(test_data)
			.transition().duration(500).call(chart);

			nv.utils.windowResize(chart.update);


			chart.stacked.dispatch.on('areaClick.updateExamples', function(e) {
				setTimeout(function() {
					mainExample.update();
					exampleOne.update();
					exampleTwo.update();
					//exampleThree.update();
					test1.update();
				}, 100);
			})

			exampleThree = chart;

			return chart;
		});
  
		//-------------------------------------- STILL VS NO STILL SUM Pie Chart -----------------------------------------------
		
		nv.addGraph(function() {
			var YoN = ndx;
			YoN.dim = ndx.dimension(function (d) {
				return d.nosigue > d.sigue ?  'No': 'Si';
			});
			YoN.grp = YoN.dim.group();
			var YoN_data = nvd3Format('YoN', YoN);
			
			var chart = nv.models.pieChart()
				.x(function(d) { return d.key })
				.y(function(d) { return d.y })
				.growOnHover(false)
				.width(350)
				.height(350);

			d3.select("#pie")
				.datum(YoN_data)
				.transition().duration(1200)
				.attr('width', 350)
				.attr('height', 350)
				.call(chart);
			nv.utils.windowResize(chart.update);
			chart.legend.dispatch.on('legendClick', function(e){
				setTimeout(function() {
					mainExample.update();
					exampleOne.update();
					exampleTwo.update();
					exampleThree.update();
				//	test1.update();
				}, 100);
			});
			// update chart data values randomly
	//        setInterval(function() {
	//            testdata2[0].y = Math.floor(Math.random() * 10);
	//            testdata2[1].y = Math.floor(Math.random() * 10);
	//            chart.update();
	//        }, 4000);
/*			chart.pie.dispatch.on('areaClick.updateExamples', function(e) {
				setTimeout(function() {
					mainExample.update();
					exampleOne.update();
					exampleTwo.update();
					exampleThree.update();
				//	test1.update();
				}, 100);
			})*/
			test1 = chart;
			return chart;
		});
	});
});
// Valid format for dc.js
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
// Valid format for nvd3, type is the type of chart and d is the data.
function nvd3Format(type, d){
    var values = [];
	var result = [];
	if (type == 'hbar'){
		var data = d[0].grp.top(Infinity);
		$.each(data, function(index, d){
			var i = d.key.split('-')[0]/181;
			values[i] = {label: d.key, value: d.value};
		});
		var values2 = [];
		var data1 = d[1].grp.top(Infinity);
		$.each(data1, function(index, d){
			var i = d.key.split('-')[0]/181;
			values2[i] = {label: d.key, value: d.value};
		});
		for (var i=0; i<values.length; i++){
			var val = values[i].value - values2[i].value;
			values[i].value = val;
		}
		
		result.push({key: 'Not Still', values: values.reverse()},{key: 'Still', values: values2.reverse()});
	}else{
		var data = d.grp.top(Infinity);
		if (type == 'year'){
			$.each(data, function(index, d){
				var i = d.key - 2001;
				values[i] = {x: d.key, y: d.value};
			});
			result.push({key: 'Year', values: values});
		}else if (type == 'month'){
			$.each(data, function(index, d){
				values[d.key-1] = {x: d.key, y: d.value};
			});
			result.push({key: 'Month', values: values});
		}else if (type == 'YoN'){
			$.each(data, function(index, d){
				result[index] = {key: d.key, y: d.value};
			});
		}
	}
    return result;
}
// Combine two JSON file into one
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