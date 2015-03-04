var aging = {};
var birth = {};
var originalNdx;
var chart_year;
var chart_month;
$(document).ready(function(){
	$.when(
        $.getJSON('its-demographics-aging.json', function (data) {
            aging = data;
        }),
        $.getJSON('its-demographics-birth.json', function (data) {
            birth = data;
        })
    ).done(function(){
		var data = birAgin(birth['persons'], aging['persons']);
        var cf = cfFormat(data);
		originalNdx = cfFormat(data);
		var year_data = yearBar_data(cf);
		draw_yearBar(year_data, cf);
		var month_data = monthPie_data(cf);
		draw_monthPie(month_data, cf);
		
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
//------------------------------------ YEAR BAR DATA -----------------------------------------
function yearBar_data(cf){
	console.log('yearBar: '+cf.length)
	var ndx = crossfilter(cf);
	var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
	cf.forEach(function (d) {
		d.one = 1; // value 1 for each data
		d.dd = dateFormat.parse(birth['date']);
		d.day = 16469-d.age;
		d.date = dateFormat.parse(dateFormat(new Date(1970, 0, d.day)));
	});
	var year = ndx;
	year.dim = ndx.dimension(function(d) {
		return d.date.getFullYear();
	});
	year.grp = year.dim.group().reduceSum(function(d) {
		return d.one;
	});
	var year_data = c3Format('year', year);
	return year_data;
}
// ------------------------------------- YEAR BAR DRAW ------------------------------------------
function draw_yearBar(year_data, cf){
	chart_year = c3.generate({
		data: {
			x: 'x',
			columns: year_data,
			type: 'bar',
			onclick: function (d, i) {
				var aux = refresh(cf, d.x.getFullYear(), 'yearBar');
				var new_data = monthPie_data(aux);
				var i = year_data[0].indexOf(d.x.getFullYear()+'-01-01');
				year_data[0].splice(i, 1);
				year_data[1].splice(i, 1);
				chart_year.load({
					columns: year_data,
					type: 'bar'
				});
				chart_month.load({
					columns: new_data
				});
			}
		},
		axis: {
			x: {
				type: 'timeseries',
				tick: {
					count: year_data[0].length-1,
					format: '%Y'
				}
			}
		},
		subchart: {
			show: true
		},
		size: {
			height: 400,
			width: 600
		},
		bindto: d3.select('#year')
	});
}
// --------------------------------------------- MONTH PIE DATA -----------------------------------
function monthPie_data(cf){
	var ndx = crossfilter(cf);
	var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
	cf.forEach(function (d) {
		d.one = 1; // value 1 for each data
		d.dd = dateFormat.parse(birth['date']);
		d.day = 16469-d.age;
		d.date = dateFormat.parse(dateFormat(new Date(1970, 0, d.day)));
	});
	var month = ndx;
	month.dim = ndx.dimension(function(d) {
		return d.date.getMonth()+1;
	});
	month.grp = month.dim.group().reduceSum(function(d) {
		return d.one;
	});
	var month_data = c3Format('month', month);
	return month_data;
}
// ------------------------------------------ MONTH PIE DRAW -------------------------------------
function draw_monthPie(month_data, cf){
	chart_month = c3.generate({
		data: {
			columns: month_data,
			type : 'pie',
			onclick: function (d, i) {
				//console.log("onclick", d, i);
				var aux = refresh(cf, d.index, 'monthPie');
				console.log(d);
				console.log(i);
				chart_month.toggle(d.name);
				var new_data = yearBar_data(aux);
				chart_year.load({
					columns: new_data,
					type: 'bar'
				});
			},
			//onmouseover: function (d, i) { console.log("onmouseover", d, i); },
			//onmouseout: function (d, i) { console.log("onmouseout", d, i); }
		},
		size: {
			height: 400,
			width: 600
		},
		legend: {
			item: {
				onclick: function (d) {
					chart_month.toggle(d)
				}
			}
		},
		bindto: d3.select('#month')
	});
}

// Valid format for dc.js
function cfFormat(d){
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
			var x = ['x'];
			var year = ['year'];
			$.each(data, function(index, d){
				var i = d.key - 2000;
				x[i] = d.key+'-01-01';
				year[i] = d.value;
			});
			result.push(x);
			result.push(year);
			//result.push({key: 'Year', values: values});
		}else if (type == 'month'){
			//console.log(data);
			$.each(data, function(index, d){
				if (d.key == 1){
					result[d.key-1] = ['january', d.value];
				}else if (d.key == 2){
					result[d.key-1] = ['february', d.value];
				}else if (d.key == 3){
					result[d.key-1] = ['march', d.value];
				}else if (d.key == 4){
					result[d.key-1] = ['april', d.value];
				}else if (d.key == 5){
					result[d.key-1] = ['may', d.value];
				}else if (d.key == 6){
					result[d.key-1] = ['june', d.value];
				}else if (d.key == 7){
					result[d.key-1] = ['july', d.value];
				}else if (d.key == 8){
					result[d.key-1] = ['august', d.value];
				}else if (d.key == 9){
					result[d.key-1] = ['september', d.value];
				}else if (d.key == 10){
					result[d.key-1] = ['october', d.value];
				}else if (d.key == 11){
					result[d.key-1] = ['november', d.value];
				}else if (d.key == 12){
					result[d.key-1] = ['december', d.value];
				}
			});
		}else if (type == 'YoN'){
			$.each(data, function(index, d){
				result[index] = {key: d.key, y: d.value};
			});
		}
	}
	//console.log(result)
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
function refresh(data, removeData, opt){
	var result = data;
	data.forEach(function(d){
		//console.log(d.date);
		if (opt == 'monthPie'){
			if (d.date.getMonth() == removeData){
				//console.log(d);
				var i = result.indexOf(d);
				result.splice(i, 1);
			}
		} else if (opt = 'yearBar'){
			if (d.date.getFullYear() == removeData){
				var i = result.indexOf(d);
				result.splice(i, 1);
			}
		}
	});
	console.log('borrar: '+result.length );
	return result;
}
function reset(){
	console.log(originalNdx.length);
	var year_data = yearBar_data(originalNdx);
	chart_year.load({
		columns: year_data
	});
	var month_data = monthPie_data(originalNdx);
	chart_month.load({
		columns: month_data
	});
}