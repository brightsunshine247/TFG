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
		datas = birAgin(birth['persons'], aging['persons']);
        data = dcFormat(datas);
		
		var mainExample, exampleOne, exampleTwo, exampleThree, test1;

		//var colors = d3.scale.category20().range();

		var test_data = stream_layers(3,20 + Math.random()*50,.1).map(function(data, i) {
			return {
				key: 'Stream' + i
				, values: data
				//, color: colors[i]
			};
		});
		console.log(test_data);

		// --------------------------- MAIN EXAMPLE ---------------------------------

		var dato = [
			{
				values: [{x: 0, y:0},{x: 1, y: -0.4},{x: 2, y: 0.2},{x: 3, y: 0.2},{x: 7, y: 0}],
				key: 'Sine Wave',
				color: '#ff7f0e'
			},
			{
				values: [{x: 0, y:0.3},{x: 1, y: -0.5},{x: 2, y: 1.2},{x: 3, y: -0.2},{x: 7, y: 0.4}],
				key: 'Cosine Wave',
				color: '#2ca02c'
			}
		];
		console.log(dato);
		nv.addGraph(function() {
			var chart = nv.models.multiBarChart()
                .margin({top: 50, bottom: 30, left: 40, right: 10});

			chart.xAxis
				.tickFormat(d3.format(',f'));

			chart.yAxis
				.tickFormat(d3.format(',.1f'));

			d3.select('#mainExample')
				.datum(data)
				.transition().duration(500).call(chart);

			nv.utils.windowResize(chart.update);

			chart.legend.dispatch.on('legendClick.updateExamples', function() {
				setTimeout(function() {
					exampleOne.update();
					exampleTwo.update();
					exampleThree.update();
				//	test1.update();
				}, 100);
			});

			mainExample = chart;

			return chart;
		});



		// --------------------------- EXAMPLE ONE ---------------------------------


		nv.addGraph(function() {  
			var chart = nv.models.lineChart()
				.showLegend(false)
                .margin({top: 10, bottom: 30, left: 40, right: 10})
                .useInteractiveGuideline(true);

			chart.xAxis // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the partent chart, so need to chain separately
				.tickFormat(d3.format(',r'));

			chart.yAxis
				.tickFormat(d3.format(',.1f'));

			d3.select('#exampleOne')
				.datum(test_data)
				.transition().duration(500)
				.call(chart);

			//TODO: Figure out a good way to do this automatically
			nv.utils.windowResize(chart.update);
			//nv.utils.windowResize(function() { d3.select('#chart1 svg').call(chart) });

			exampleOne = chart;

			return chart;
		});


		// --------------------------- EXAMPLE TWO ---------------------------------



		nv.addGraph(function() {
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
				//	test1.update();
				}, 100);
			})

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
				//	test1.update();
				}, 100);
			})

			exampleThree = chart;

			return chart;
		});
  
		
	/*	nv.addGraph(function() {
			var chart = nv.models.pieChart()
				.x(function(d) { return d.age })
				.y(function(d) { return d.one })
				.growOnHover(false)
				.width(350)
				.height(350);

			d3.select("#test1")
			//	.datum(data)
				.transition().duration(1200)
				.attr('width', 350)
				.attr('height', 350)
				.call(chart);

			// update chart data values randomly
	//        setInterval(function() {
	//            testdata2[0].y = Math.floor(Math.random() * 10);
	//            testdata2[1].y = Math.floor(Math.random() * 10);
	//            chart.update();
	//        }, 4000);
			test1 = chart;
			return chart;
		});*/
	});
});
// Valid format for dc.js
function dcFormat(d){
    var array = [];
    var keys = [];
    var value = [];
	var result = [];
    $.each(d, function(key, val){
        keys.push(key);
        value.push(val);
    });
	var stream = 0;
	var max = 0;
	var len = Math.floor(value[0].length/4);
	console.log(value[0].length)
    for (var i=0; i<value[0].length; i++){
        var data = {};
		data["x"] = max;
        for (var j=0; j<keys.length; j++){
        //    data[keys[j]] = value[j][i];
			data["y"] = value[0][i];
        }
		
        array.push(data);
		if (max == len){
			result[stream] = {"key": "Stream"+stream, "values": array, seriesIndex: stream};
			array = [];
			max = 0;
			stream += 1;
		}
		max += 1;
    }
	console.log(result);
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