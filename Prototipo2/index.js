var aging = {};
var birth = {};
$(document).ready(function(){
    var gainOrLossChart = dc.pieChart('#gain-loss-chart');
    var quarterChart = dc.pieChart('#quarter-chart');
    var barChart = dc.barChart('#fluctuation-chart');
    var rowChart = dc.rowChart('#day-of-week-chart');
    var lineChart = dc.lineChart('#monthly-move-chart');
    $.when(
        $.getJSON('its-demographics-aging.json', function (data) {
            aging = data;
        }),
        $.getJSON('its-demographics-birth.json', function (data) {
            birth = data;
        })
    ).done(function(){
        dato = dcFormat(birth['persons']);
        dato2 = dcFormat(aging['persons']);
        var ndx = crossfilter(dato);
        var ndx2 = crossfilter(dato2);
        var all = ndx.groupAll();
        var all2 = ndx2.groupAll();
        var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
        dato.forEach(function (d) {
            d.uno = 1;
            d.dd = dateFormat.parse(aging['date']);
            d.day = 16469-d.age;
            d.date = dateFormat.parse(dateFormat(new Date(1970, 0, d.day)));
            if (dato2[d.id] != undefined){
                d.sigue = 1;
                d.no = 0;
            }else{
                d.no = 1;
                d,sigue = 0;
            }
            
        });
    
        //Donuts Year per id
        var quarterDim = ndx.dimension(function(d) {
            return d.date.getMonth()+1;
        });
        var quarterGrp = quarterDim.group().reduceSum(function(d) {
            return d.uno;
        });
        quarterChart.width(180)
            .height(180)
            .radius(80)
            .innerRadius(30)
            .dimension(quarterDim)
            .group(quarterGrp);

        // Bar Senders
        var barDim = ndx.dimension(function(d) {
            return (d.day%31);
        });
        var barGrp = barDim.group();

        barChart
            .width(300).height(200)
            .dimension(barDim)
            .group(barGrp)
            .x(d3.scale.linear().domain([1,31]))
            .elasticY(true);

        barChart.xAxis().tickFormat(function(d) {return d});
        barChart.yAxis().ticks(15);

        // Row Month
        var rowDim  = ndx.dimension(function(d) {
            var month = d.date.getMonth();
            var name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dic'];
            return month+1 + '.' + name[month];
        });
        var rowGrp = rowDim.group();
        rowChart
            .width(350).height(200)
            .dimension(rowDim)
            .group(rowGrp)
            .elasticX(true);

        dc.dataCount('.dc-data-count')
            .dimension(ndx)
            .group(all)
            .html({
                some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                    ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
                all:'All records selected. Please click on the graph to apply filters.'
            });

        // Tabla
        var dateDimension = ndx.dimension(function (d) {
            return d.dd;
        });
        dc.dataTable('.dc-data-table')
            .dimension(dateDimension)
            .group(function (d) {
                var format = d3.format('02d');
                return d.date.getFullYear() + ' / ' + format((d.date.getMonth() + 1));
            })
            .size(dato.length)
            .columns([
                {
                    label: 'date', // desired format of column name 'Change' when used as a label with a function.
                    format: function (d) {
                        return d.date;
                    }
                },
                'id',
                'name'
            ])

            .sortBy(function (d) {
                return d.dd;
            })
            .order(d3.ascending)
            .renderlet(function (table) {
                table.selectAll('.dc-table-group').classed('info', true);
            });

        // Line
        var lineDim = ndx.dimension(function (d) {
            return d.day;
        });
        var lineGrp = lineDim.group().reduceSum(function (d) {
            return Math.abs(d.age);
        });

        lineChart
            .renderArea(true)
            .width(990)
            .height(200)
            .transitionDuration(1000)
            .margins({top: 30, right: 50, bottom: 25, left: 40})
            .dimension(lineDim)
            .mouseZoomable(true)
            .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 11, 31)]))
            .round(d3.time.month.round)
            .xUnits(d3.time.months)
            .elasticY(true)
            .renderHorizontalGridLines(true)
            .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
            .brushOn(false)
            .group(lineGrp)

        // Gain and Lost
        var gainOrLoss = ndx.dimension(function (d) {
            return d.no > d.sigue ? 'No' : 'Si';
        });
        var gainOrLossGroup = gainOrLoss.group();
        gainOrLossChart
            .width(180) // (optional) define chart width, :default = 200
            .height(180) // (optional) define chart height, :default = 200
            .radius(80) // define pie radius
            .dimension(gainOrLoss) // set dimension
            .group(gainOrLossGroup)


        dc.renderAll();
    });
});
function dcFormat(d){
    var array = [];
    var clave = [];
    var valor = [];
    $.each(d, function(key, val){
        clave.push(key);
        valor.push(val);
    });
    for (var i=0; i<valor[0].length; i++){
        var dato = {};
        for (var j=0; j<clave.length; j++){
            dato[clave[j]] = valor[j][i];
        }
        array.push(dato);
    }
    return array;
}
