/*
 *  DECLARATION BLOCK STARTS
 */
var view_width = document.getElementById("timeseriesql").clientWidth;
var view_height = document.getElementById("timeseriesql").clientHeight;
var margin = {top: 50, bottom: 50, left: 50, right: 50};
var width = view_width - margin.left - margin.right;
var height = view_height - margin.top - margin.bottom;

var svg_tsql = d3.select('#timeseriesql')
    .append('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var x_scale = d3.scaleLinear()
    .range([0, width]);
var y_scale = d3.scaleLinear()
    .range([height, 0]);
var y_axis_tsql = d3.axisLeft(y_scale);
var x_axis_tsql = d3.axisBottom(x_scale);

var t = d3.transition()
    .duration(800);


svg_tsql.append("g")
    .attr("class", "y axis")

svg_tsql.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height) + ")");

svg_tsql.append("text")
    .attr("transform", "translate(-30," + height/3 + ")rotate(-90)")
    .attr("text-anchor", "end")
    .text("Average Number of Customers");

svg_tsql.append("text")
    .attr("transform", "translate(" + width/2 + "," + (height+30) + ")")
    .attr("text-anchor", "end")
    .text("Time Units");

/*
 *  DECLARATION BLOCK ENDS
 */



function update_tsql() {
    /*
        Update function reads the input values, creates random data, and updates the visualisation accordingly
    */
    var datasource = document.getElementById('dataselect-formcontrol').value;

    d3.json(datasource + '/metadata.json', function(metadata) {
        meta = metadata;

    for (i=1; i<=meta.Number_of_nodes; i++){
        if (document.getElementById('node' + i + 'tsql').checked) { var node = i; }
    };


    var raw = document.getElementById('raw_tsql');
    var means = document.getElementById('means_tsql');
    var conf_on = document.getElementById('confidenceinterval_tsql');
    var conf = document.getElementById('confidence_tsql').value;

    var filename = datasource + '/time_series_data_ql.json'
    
    var valueline = d3.line()
        .x(function(d) { return x_scale(d.Week); })
        .y(function(d) { return y_scale(d.Length); });

    var confArea = d3.area()
        .x(function(d) { return x_scale(d.Week); })
        .y0(function(d) { return y_scale(d.LowerConf)})
        .y1(function(d) { return y_scale(d.UpperConf); });


    d3.json(filename, function(data) {
        mydataraw = data;
    
    mydata = mydataraw.filter(function(d) { return d.Node == node; });
    x_scale.domain([0, d3.max(mydata, function(d){ return d.Week; })]);
    y_scale.domain([0, d3.max(mydata, function(d){ return d.Length; })]);

    svg_tsql.selectAll("path").remove();

    if (conf_on.checked){
        var meandata = findmeandata_ql(mydata, meta);
        var confdata = confidenceinterval_ql(mydata, meandata, conf, meta)
        svg_tsql.append("path")
          .datum(confdata)
          .attr("class", "area")
          .attr("d", confArea)
          .attr("fill", "#ff6600")
          .style("opacity", 0.25);
    };

    if (raw.checked) {
        for (t=0; t<meta.Number_of_trials; t++){
            thisdata = mydata.filter(function (d) {return d.Trial == t;});
            svg_tsql.append('path')
                .datum(thisdata)
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", "#E0E0E0")
                .attr("stroke-width", 1)
                .attr('d', valueline)
                .on("mouseover", function(d) {
                    d3.select(this)
                        .attr('stroke', "#8c8c8c")
                        .attr("stroke-width", 2);
                    var tooltip = svg_tsql
                        .append('g')
                        .attr('id', 'tooltip');
                    tooltip
                        .append("rect")
                        .attr('x', d3.mouse(this)[0] - 35)
                        .attr('width', 75)
                        .attr('y', d3.mouse(this)[1] - 30)
                        .attr('height', 20)
                        .attr('fill', '#FFF3D1')
                        .attr('stroke', '#ff9900')
                        .attr('rx', 10)
                        .attr('ry', 10);
                    tooltip
                        .append('text')
                        .attr('x', d3.mouse(this)[0] - 25)
                        .attr('y', d3.mouse(this)[1] - 15)
                        .text('Trial #' + d[0].Trial)
                })
                .on("mousemove", function(d) {
                    svg_tsql.select("#tooltip")
                        .select('rect')
                            .attr('x', d3.mouse(this)[0] - 35)
                            .attr('y', d3.mouse(this)[1] - 30)
                    svg_tsql.select("#tooltip")
                        .select('text')
                            .attr('x', d3.mouse(this)[0] - 25)
                            .attr('y', d3.mouse(this)[1] - 15)

                })
                .on("mouseout", function(d) {
                    d3.select(this)
                        .attr('stroke', "#E0E0E0")
                        .attr("stroke-width", 1);
                    svg_tsql.select("#tooltip").remove();
                });
    };};



    if (means.checked) {
        var meandata = findmeandata_ql(mydata, meta);
        svg_tsql.append('path')
            .datum(meandata)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#ff6600")
            // .style("stroke-dasharray", ("3, 3"))
            .attr("stroke-width", 2)
            .transition(t)
            .attr('d', valueline);

    };


    svg_tsql.select('.x.axis')
        .transition(t)
        .call(d3.axisBottom(x_scale).ticks(10));
    svg_tsql.select('.y.axis')
        .transition(t)
        .call(d3.axisLeft(y_scale).ticks(10));

    });
    });
    }



function findmeandata_ql(data, meta){
    var meandata = [];
    for (w in meta.Weeks) {
        var weekdata = data.filter(function (d) {return d.Week == meta.Weeks[w];})
        var value = d3.mean(weekdata.map(function(d) {return d.Length; }));
        var point = {'Week':meta.Weeks[w], 'Length':value}
        meandata.push(point)
    };
    return meandata
}

function confidenceinterval_ql(data, meandata, conf, meta){
    confdata = []
    if (meta.Number_of_trials < 100) {
        var z = jStat.normal.inv(conf, 0, 1)
        for (w in meta.Weeks){
            var xbar = meandata.filter(function(d) {return d.Week == meta.Weeks[w]})[0]['Length']
            var weekdata = data.filter(function(d) {return d.Week == meta.Weeks[w]}).map(function(d) {return d.Length;})
            var sigma = jStat.stdev(weekdata)
            var lowerconf = xbar - z*(sigma/Math.sqrt(meta.Number_of_trials))
            var upperconf = xbar + z*(sigma/Math.sqrt(meta.Number_of_trials))
            var point = {'Week':meta.Weeks[w], 'UpperConf':upperconf, 'LowerConf':lowerconf}
            confdata.push(point)
        };
    } else {
        var z = jStat.studentt.inv(conf, meta.Number_of_trials - 1)
        for (w in meta.Weeks){
            var xbar = meandata.filter(function(d) {return d.Week == meta.Weeks[w]})[0]['Length']
            var weekdata = data.filter(function(d) {return d.Week == meta.Weeks[w]}).map(function(d) {return d.Length;})
            var sigma = jStat.stdev(weekdata)
            var lowerconf = xbar - z*(sigma/Math.sqrt(meta.Number_of_trials))
            var upperconf = xbar + z*(sigma/Math.sqrt(meta.Number_of_trials))
            var point = {'Week':meta.Weeks[w], 'UpperConf':upperconf, 'LowerConf':lowerconf}
            confdata.push(point)
        };
    }
    return confdata
}

