    var testdata = stream_layers(7,10+Math.random()*100,.1).map(function(data, i) {
        return {
            key: 'Stream' + i,
            values: data.map(function(a){a.y = a.y * (i <= 1 ? -1 : 1); return a})
        };
    });

	console.log(testdata);
	
    testdata[0].type = "area";
    testdata[0].yAxis = 1;
    testdata[1].type = "area";
    testdata[1].yAxis = 1;
    testdata[2].type = "line";
    testdata[2].yAxis = 1;
    testdata[3].type = "line";
    testdata[3].yAxis = 2;
    testdata[4].type = "bar";
    testdata[4].yAxis = 2;
    testdata[5].type = "bar";
    testdata[5].yAxis = 2;
    testdata[6].type = "bar";
    testdata[6].yAxis = 2;

    nv.addGraph(function() {
        var chart = nv.models.multiChart()
            .margin({top: 30, right: 60, bottom: 50, left: 70})
            .color(d3.scale.category10().range());

        chart.xAxis.tickFormat(d3.format(',f'));
        chart.yAxis1.tickFormat(d3.format(',.1f'));
        chart.yAxis2.tickFormat(d3.format(',.1f'));

        d3.select('#chart1 svg')
            .datum(testdata)
            .transition().duration(500).call(chart);

        return chart;
    });
	// PIE data
	var testdata1 = [
        {key: "One", y: 5},
        {key: "Two", y: 2},
        {key: "Three", y: 9},
        {key: "Four", y: 7},
        {key: "Five", y: 4},
        {key: "Six", y: 3},
        {key: "Seven", y: 0.5}
    ];
    var testdata2 = [
        {key: "One", y: 5},
        {key: "Two", y: 2},
        {key: "Three", y: 9},
        {key: "Four", y: 7},
        {key: "Five", y: 4},
        {key: "Six", y: 3},
        {key: "Seven", y: 0.5}
    ];

    var height = 350;
    var width = 350;
	var ndx = crossfilter(testdata1);
	ndx.dim = ndx.dimension(function(d) {
		return d.key; 
	});
	ndx.grp = ndx.dim.group(function(d) {
		return d; 
	});
	// Pie chart1
    nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) { return d.key })
            .y(function(d) { return d.y })
            .width(width)
			.growOnHover(false)
            .height(height);

        d3.select("#test1")
            .datum(testdata1)
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

        // update chart data values randomly
//        setInterval(function() {
//            testdata2[0].y = Math.floor(Math.random() * 10);
//            testdata2[1].y = Math.floor(Math.random() * 10);
//            chart.update();
//        }, 4000);

        return chart;
    });
	// Pie chart2
    nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) { return d.key })
            .y(function(d) { return d.y })
            //.labelThreshold(.08)
            //.showLabels(false)
            .color(d3.scale.category20().range().slice(8))
            .growOnHover(false)
            .tooltipContent(function(key, y, e, graph) {
                return '<h3 style="padding: 5px; background-color: '
                        + e.color + '"><strong>Yo, the value is</strong></h3>'
                        + '<p style="padding:5px;">' +  y + '</p>';
            })
            .width(width)
            .height(height);

        // make it a half circle
        chart.pie
            .startAngle(function(d) { return d.startAngle/2 -Math.PI/2 })
            .endAngle(function(d) { return d.endAngle/2 -Math.PI/2 });

        // MAKES LABELS OUTSIDE OF DONUT
        //chart.pie.donutLabelsOutside(true).donut(true);

        d3.select("#test2")
            .datum(testdata1)
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

        // disable and enable some of the sections
//        var is_disabled = false;
//        setInterval(function() {
//            chart.dispatch.changeState({disabled: {2: !is_disabled, 4: !is_disabled}});
//            is_disabled = !is_disabled;
//        }, 3000);

        return chart;
	
    });
	
	// Crossfilter with lineChart
extend = function(destination, source) {
    for (var property in source) {
    if (property in destination) { 
      if ( typeof source[property] === "object" && 
        typeof destination[property] === "object") {
          destination[property] = extend(destination[property], source[property]);
      } else {
        continue; 
      } 
    } else {
      destination[property] = source[property];
    };
    }
    return destination;
};
	nv.addGraph(function() {
  var chart = nv.models.lineWithFocusChart();

  chart.xAxis
      .tickFormat(d3.format(',f'));
  chart.x2Axis
      .tickFormat(d3.format(',f'));

  chart.yAxis
      .tickFormat(d3.format(',.2f'));
  chart.y2Axis
      .tickFormat(d3.format(',.2f'));

	var rawData = testCrossfilterData();  
	var data = normalizeData(rawData.datum, 
        [
			{ 
			  name: 'Stream #1',
			  key: 'stream1'
			},
			{ 
			  name: 'Stream #2',
			  key: 'stream2'
			},
			{ 
			  name: 'Stream #3',
			  key: 'stream3'
			}
        ]
	);
	d3.select('#chart svg')
		.datum(data)
		.transition().duration(500)
		.call(chart);

	nv.utils.windowResize(chart.update);

	return chart;
});

function normalizeData(data, series){
    var sort = crossfilter.quicksort.by(function(d) { return d.key; });
    var result = [];
    
    for (var i = 0; i < series.length; i++)
    {
		var seriesData = data.top(Infinity);
		var sorted = sort(seriesData, 0, seriesData.length);
		var values = [];


		seriesData.forEach(function(item, index){
			values.push({x: item.key,  y: item.value[series[i].key]});
		});

		result.push({key: series[i].name, values: values, color: series[i].color});
    };
    return result;
};

function testCrossfilterData() {
	var data = crossfilter(testData());

	try {
		data.data = data.dimension(function(d) { return d.x; });
		data.datum = data.data.group(function(d) { return d; });
		data.datum.reduce(function (p, v) { 
			p.count++;
			p.stream1 += v.stream1; 
			p.stream2 += v.stream2;
			p.stream3 += v.stream3;
			return p;
		}, 
		function (p, v) { 
			p.count--;
			p.stream1 -= v.stream1; 
			p.stream2 -= v.stream2;
			p.stream3 -= v.stream3;
			return p;
		},
		function () { return {count: 0, stream1: 0, stream2: 0, stream3: 0}; });    
	} catch (e) {
		console.log(e.stack);
	}

	return data;
}

function testData() {
  
	var data1 = [];
	var data2 = [];
	var data3 = [];
  
    stream_layers(3,10,.1).map(function(layer, index) {
		layer.forEach(function(item, i) {
			var object = { x: item.x };
			object['stream' + (index + 1)] = item.y;
			eval('data' + (index + 1)).push(object);
	    });
    });
	var data = extend(data1, data2);
	var result = extend(data, data3);
return result;
}