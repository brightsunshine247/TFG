$(document).ready(function(){
    var quarterChart = dc.pieChart('#quarter-chart');
    var barChart = dc.barChart('#fluctuation-chart');
    var rowChart = dc.rowChart('#day-of-week-chart');
    var lineChart = dc.lineChart('#monthly-move-chart');
    d3.json('json/dox-irc-rep-evolutionary.json', function (data) {
        dato = dcFormat(data);
        var ndx = crossfilter(dato);
        var all = ndx.groupAll();
        var dateFormat = d3.time.format('%b %Y');
        dato.forEach(function (d) {
            d.uno = 1;
            d.dd = dateFormat.parse(d.date);
            d.year = d3.time.year(d.dd);
            d.month = d3.time.month(d.dd);
        });
        //Donuts Year per id
        var quarterDim = ndx.dimension(function(d) {
            return d.dd.getFullYear();
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
            return Math.floor(d.senders);
        });
        var barGrp = barDim.group();

        barChart
            .width(300).height(200)
            .dimension(barDim)
            .group(barGrp)
            .x(d3.scale.linear().domain([0,9]))
            .elasticY(true);

        barChart.xAxis().tickFormat(function(d) {return d});
        barChart.yAxis().ticks(13);

        // Row Month
        var rowDim  = ndx.dimension(function(d) {
            var month = d.dd.getMonth();
            var name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dic'];
            return month + '.' + name[month];
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

        var dateDimension = ndx.dimension(function (d) {
            return d.dd;
        });
        dc.dataTable('.dc-data-table')
            .dimension(dateDimension)
            .group(function (d) {
                var format = d3.format('02d');
                return d.dd.getFullYear() + ' / ' + format((d.dd.getMonth() + 1));
            })
            .size(dato.length)
            .columns([
                'date',    
                'id',
                'repositories',   
                'senders',   
                'sent',   
                'unixtime',
                'week'
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
            return d.month;
        });
        var lineGrp = lineDim.group().reduceSum(function (d) {
            return Math.abs(d.week);
        });

        lineChart
            .renderArea(true)
            .width(990)
            .height(200)
            .transitionDuration(1000)
            .margins({top: 30, right: 50, bottom: 25, left: 40})
            .dimension(lineDim)
            .mouseZoomable(true)
            .x(d3.time.scale().domain([new Date(2010, 0, 1), new Date(2015, 6, 31)]))
            .round(d3.time.month.round)
            .xUnits(d3.time.months)
            .elasticY(true)
            .renderHorizontalGridLines(true)
            .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
            .brushOn(false)
            .group(lineGrp)

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
