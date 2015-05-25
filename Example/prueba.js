var data;
var ndx;
var all;
$(document).ready(function(){
    chart = dc.barChart('#chart');
    $.when(
		// Load agin json file
		
        $.getJSON('scm-static.json', function (d) {
            data = dcFormat(d);
            ndx= crossfilter(data)
            all = ndx.groupAll();
        })
		
    ).done(function(){
    	var dim = ndx.dimension(function(d){
    		return d.key;
    	})
		var grp = dim.group().reduceSum(function(d){
			return d.value
		});
    	chart
    	.width(990)
    	.height(990)
    	.dimension(dim)
    	.group(grp)
        .x(d3.scale.ordinal().domain([""])) // Need empty val to offset first value
			.xUnits(dc.units.ordinal)
			.elasticX(true)
			.centerBar(true)
			.elasticY(true)
			.brushOn(true)
			.renderHorizontalGridLines(true)
			.margins({top: 0, right: 50, bottom: 20, left: 40});

    })
});
/*********************************************************************************************************************************
***************************************************** Valid format for dc.js *****************************************************
*********************************************************************************************************************************/
function dcFormat(d){
	var keys= Object.keys(d)
    var array = [];
    keys.forEach(function(element){
    	array.push({"key":element,"value":d[element]})
    })
    return array;
}
