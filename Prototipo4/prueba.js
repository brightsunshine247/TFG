var aging = {};
var birth = {};
var originalNdx;
var chart_year;
var chart_month;
var chart_demograph;
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
		originalNdx = cf;
		var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
		cf.forEach(function (d) {
			d.one = 1; // value 1 for each data
			d.dd = dateFormat.parse(birth['date']);
			d.day = 16469-d.age;
			d.date = dateFormat.parse(dateFormat(new Date(1970, 0, d.day)));
		});
		var ndx = crossfilter(cf);
		
		var year_data = yearBar_data(ndx);
		draw_yearBar(year_data, ndx);
		var month_data = monthPie_data(ndx);
		draw_monthPie(month_data, ndx);
		var demo_data = demograph_data(ndx);
		draw_demograph(demo_data, cf);
		
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
function yearBar_data(ndx){
	//console.log('yearBar: '+ndx.length)
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
// ------------------------------------- YEAR BAR DRAW -------------------------------------------------
function draw_yearBar(year_data, ndx){
	chart_year = c3.generate({
		data: {
			//x: 'x',
			columns: year_data,
			type: 'bar',
			//labels: true,
			onclick: function (d, i) {
				var aux = refresh(ndx, d.id, 'monthPie');
				var new_data = c3Format('month', aux);
				//var i = year_data[0].indexOf(d.x.getFullYear()+'-01-01');
				//year_data[0].splice(i, 1);
				//year_data[1].splice(i, 1);
				if (d.id == 2001){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000'),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2002){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000'),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2003){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000'),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2004){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000'),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2005){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000'),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2006){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000'),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2007){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000'),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2008){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000'),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2009){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000'),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2010){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000'),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2011){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000'),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2012){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000'),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2013){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000'),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2014){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000'),
						2015: d3.rgb('#ff0000').darker(2),
					});
				}else if (d.id == 2015){
					chart_year.data.colors({
						2001: d3.rgb('#ff0000').darker(2),
						2002: d3.rgb('#ff0000').darker(2),
						2003: d3.rgb('#ff0000').darker(2),
						2004: d3.rgb('#ff0000').darker(2),
						2005: d3.rgb('#ff0000').darker(2),
						2006: d3.rgb('#ff0000').darker(2),
						2007: d3.rgb('#ff0000').darker(2),
						2008: d3.rgb('#ff0000').darker(2),
						2009: d3.rgb('#ff0000').darker(2),
						2010: d3.rgb('#ff0000').darker(2),
						2011: d3.rgb('#ff0000').darker(2),
						2012: d3.rgb('#ff0000').darker(2),
						2013: d3.rgb('#ff0000').darker(2),
						2014: d3.rgb('#ff0000').darker(2),
						2015: d3.rgb('#ff0000'),
					});
				}
				chart_month.load({
					columns: new_data
				});
			}
		},
		tooltip: {
			grouped: false
		},
		/*axis: {
			x: {
				type: 'category',
				tick: {
					rotate: 0,
					multiline: false
				},
				height: 130
			}
		},*/
		/*subchart: {
			show: true
		},*/
		size: {
			height: 400,
			width: 600
		},
		bindto: d3.select('#year')
	});
}
// --------------------------------------------- MONTH PIE DATA -----------------------------------
function monthPie_data(ndx){
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
// ------------------------------------------ MONTH PIE DRAW ------------------------------------------
function draw_monthPie(month_data, ndx){
	chart_month = c3.generate({
		data: {
			columns: month_data,
			type : 'pie',
			onclick: function (d, i) {
				//console.log("onclick", d, i);
				var aux = refresh(ndx, d.index, 'yearBar');
				//console.log(d);
				//console.log(i);
				chart_month.toggle(d.name);
				var new_data = yearBar_data(aux);
				console.log(new_data);
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
// ----------------------------------------------- DEMOGRAPH DATA ---------------------------
function demograph_data(ndx){
	var axis = [];
	var demograB = ndx;
	demograB.dim = ndx.dimension(function(d){
		var i = Math.floor(d.age/181);
		axis[i]=((181*i)+'-'+((i+1)*181));
		return axis[i];
	});
	demograB.grp = demograB.dim.group();
	
	var dcA = cfFormat(aging['persons']);
	var demograA = crossfilter(dcA);
	demograA.dim = demograA.dimension(function(d){
		var i = Math.floor(d.age/181);
		axis[i]=((181*i)+'-'+((i+1)*181));
		return axis[i];
	})
	demograA.grp = demograA.dim.group();
	var data = c3Format('demograph', [demograA, demograB]);
	return data;
}
// ------------------------------------------------ DEMOGRAPH DRAW ---------------------------
function draw_demograph(data, cf){
	chart_demograph = c3.generate({
		data: {
			x: 'x',
			columns: data,
			type: 'bar',
			onclick: function (d, i) {
				console.log(d);
			}
		},
		legend: {
			item: {
				onclick: function (d) {
					if (d == "Still"){
						chart_demograph.toggle("No still");
					}else{
						chart_demograph.toggle("Still");
					}
				}
			}
		},
		axis: {
			x: {
				type: 'category',
				tick: {
					rotate: 90,
					multiline: false
				},
				height: 130
			}
		},
		/*
		subchart: {
			show: true
		},*/
		size: {
			height: 400,
			width: 600
		},
		bindto: d3.select('#demograph')
	});
}
// ----------------------------------------------- CFFORMAT ------------------------------------
// Valid format for crossfilter.js
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
// --------------------------------------------------- C3 FORMAT ------------------------------------------
// Valid format for c3, type is the type of chart and d is the data.
function c3Format(type, d){
	var result = [];
	if (type == 'demograph'){
		var x = ['x'];
		var d1 = ['No Still'];
		var d2 = ['Still'];
		var data1 = d[0].grp.top(Infinity);
		$.each(data1, function(index, d0){
			x[index+1] = d0.key;
			d2[index+1] = d0.value;
		});
		var data2 = d[1].grp.top(Infinity);
		$.each(data2, function(index, d0){
			d1[index+1] = d0.value;
		});
		result.push(x);
		result.push(d1);
		result.push(d2);
	}else{
		var data = d.grp.top(Infinity);
		
		if (type == 'year'){
			/*var x = ['x'];
			var year = ['year'];
			$.each(data, function(index, d){
				var i = d.key - 2000;
				x[i] = d.key;
				year[i] = d.value;
			});
			result.push(x);
			result.push(year);*/
			$.each(data, function(index, d){
				result.push([d.key.toString(), d.value]);
			});
			//console.log(result);
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
		}
	}
	//console.log(result)
    return result;
}
// ------------------------------------------- BIRH AND AGING ------------------------------------
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

// --------------------------------------REFRESH -------------------------------
// Update data after click
function refresh(data, selectData, opt){
	var result = data;
	/*data.forEach(function(d){
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
	});*/
	if (opt == 'monthPie'){
		result.dim = data.dimension(function(d){
			if (d.date.getFullYear() != selectData){
				return d.date.getMonth()+1;
			}
		});
		result.grp = result.dim.group().reduceSum(function(d) {
			return d.one;
		});
	}else if (opt == 'yearBar'){
		result.dim = data.dimension(function(d){
			if (d.date.getMonth()+1 != selectData){
				return d.date.getFullYear();
			}
		});
		result.grp = result.dim.group().reduceSum(function(d) {
			return d.one;
		});
	}
//	console.log(result);
	return result;
}
//--------------------------------- RESET ----------------------------------------------
// Return original data
function reset(){
	//console.log(originalNdx.length);
	var year_data = yearBar_data(originalNdx);
	chart_year.load({
		columns: year_data
	});
	var month_data = monthPie_data(originalNdx);
	chart_month.load({
		columns: month_data
	});
}