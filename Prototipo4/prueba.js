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
		
		
		
		
		
		/*var chart = c3.generate({
			data: {
				columns: [
					['data1', 30, 200, 100, 400, 150, 250],
					['data2', 50, 20, 10, 40, 15, 25]
				],
				axes: {
					data1: 'y',
					data2: 'y2',
				}
			},
			axis: {
				x: {
					label: 'X Label'
				},
				y: {
					label: {
						text: 'Y Axis Label',
						position: 'outer-middle'
					}
				},
				y2: {
					show: true,
					label: {
						text: 'Y2 Axis Label',
						position: 'outer-middle'
					}
				}
			},
			tooltip: {
				enabled: true
			},
			zoom: {
				enabled: true
			},
			subchart: {
				show: true
			}
		});*/
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
// Valid format for c3, type is the type of chart and d is the data.
function c3Format(type, d){
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