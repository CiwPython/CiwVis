/*
 *  DECLARATION BLOCK STARTS
 */
var view_width = document.getElementById("timeseries").clientWidth;
var view_height = document.getElementById("timeseries").clientHeight;
var margin = {top: 50, bottom: 50, left: 50, right: 50};
var width = view_width - margin.left - margin.right;
var height = view_height - margin.top - margin.bottom;

var svg_ts = d3.select('#timeseries')
    .append('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var x_scale = d3.scaleLinear()
    .range([0, width]);
var y_scale = d3.scaleLinear()
    .range([height, 0]);
var y_axis = d3.axisLeft(y_scale);
var x_axis = d3.axisBottom(x_scale);

var t = d3.transition()
    .duration(800);


svg_ts.append("g")
    .attr("class", "y axis")

svg_ts.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height) + ")");

svg_ts.append("text")
    .attr("transform", "translate(-30," + height/3 + ")rotate(-90)")
    .attr("text-anchor", "end")
    .text("Average Waiting Time");

svg_ts.append("text")
    .attr("transform", "translate(" + width/2 + "," + (height+30) + ")")
    .attr("text-anchor", "end")
    .text("Time Units");

/*
 *  DECLARATION BLOCK ENDS
 */



function update_ts() {
    /*
        Update function reads the input values, creates random data, and updates the visualisation accordingly
    */

    var num_nodes = parseInt(sessionStorage.getItem('Number_of_nodes'))
    var num_classes = parseInt(sessionStorage.getItem('Number_of_classes'))
    var num_trials = parseInt(sessionStorage.getItem('Number_of_trials'))
    var weeksstr = sessionStorage.getItem('Weeks')
    var weeks = weeksstr.split(",").map(Number)

    var casecode = 'Value'

    for (i=1; i<=num_nodes; i++){
        if (document.getElementById('node' + i + 'ts').checked) { casecode += '1' } else { casecode += '0' }
    };
    for (i=0; i<num_classes; i++){
        if (document.getElementById('class' + i + 'ts').checked) { casecode += '1' } else { casecode += '0' }
    };

    var raw = document.getElementById('raw_ts');
    var means = document.getElementById('means_ts');
    var conf_on = document.getElementById('confidenceinterval_ts');
    var conf = document.getElementById('confidence').value;
    
    var valueline = d3.line()
        .x(function(d) { return x_scale(d.Week); })
        .y(function(d) { return y_scale(d[casecode]); });

    var confArea = d3.area()
        .x(function(d) { return x_scale(d.Week); })
        .y0(function(d) { return y_scale(d.LowerConf)})
        .y1(function(d) { return y_scale(d.UpperConf); });


    var tsdatafile = choosefile('time_series_data.json')
    const tsfileReader = new FileReader();
    tsfileReader.onload = event => {
        const contentsOfFile = event.target.result;
        var mydata = JSON.parse(contentsOfFile);
        
    x_scale.domain([0, d3.max(mydata, function(d){ return d.Week; })]);
    y_scale.domain([0, d3.max(mydata, function(d){ return d[casecode]; })]);

    svg_ts.selectAll("path").remove();

    if (conf_on.checked){
        var meandata = findmeandata(mydata, casecode, weeks);
        var confdata = confidenceinterval(mydata, meandata, conf, casecode, num_trials, weeks)
        svg_ts.append("path")
          .datum(confdata)
          .attr("class", "area")
          .attr("d", confArea)
          .attr("fill", "#ff6600")
          .style("opacity", 0.25);
    };

    if (raw.checked) {
        for (t=0; t<num_trials; t++){
            thisdata = mydata.filter(function (d) {return d.Trial == t;});
            svg_ts.append('path')
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
                    var tooltip = svg_ts
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
                    svg_ts.select("#tooltip")
                        .select('rect')
                            .attr('x', d3.mouse(this)[0] - 35)
                            .attr('y', d3.mouse(this)[1] - 30)
                    svg_ts.select("#tooltip")
                        .select('text')
                            .attr('x', d3.mouse(this)[0] - 25)
                            .attr('y', d3.mouse(this)[1] - 15)

                })
                .on("mouseout", function(d) {
                    d3.select(this)
                        .attr('stroke', "#E0E0E0")
                        .attr("stroke-width", 1);
                    svg_ts.select("#tooltip").remove();
                });
    };};



    if (means.checked) {
        var meandata = findmeandata(mydata, casecode, weeks);
        svg_ts.append('path')
            .datum(meandata)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#ff6600")
            // .style("stroke-dasharray", ("3, 3"))
            .attr("stroke-width", 2)
            .transition(t)
            .attr('d', valueline);

    };


    d3.select('.x.axis')
        .transition(t)
        .call(d3.axisBottom(x_scale).ticks(10));
    d3.select('.y.axis')
        .transition(t)
        .call(d3.axisLeft(y_scale).ticks(10));

    }
    tsfileReader.readAsText(tsdatafile);

    }



function findmeandata(data, casecode, weeks){
    var meandata = [];
    for (w in weeks) {
        var weekdata = data.filter(function (d) {return d.Week == weeks[w];})
        var value = d3.mean(weekdata.map(function(d) {return d[casecode]; }));
        var point = {'Week':weeks[w]}
        point[casecode] = value
        meandata.push(point)
    };
    return meandata
}

function confidenceinterval(data, meandata, conf, casecode, num_trials, weeks){
    confdata = []
    if (num_trials < 100) {
        var z = jStat.normal.inv(conf, 0, 1)
        for (w in weeks){
            var xbar = meandata.filter(function(d) {return d.Week == weeks[w]})[0][casecode]
            var weekdata = data.filter(function(d) {return d.Week == weeks[w]}).map(function(d) {return d[casecode];})
            var sigma = jStat.stdev(weekdata)
            var lowerconf = xbar - z*(sigma/Math.sqrt(num_trials))
            var upperconf = xbar + z*(sigma/Math.sqrt(num_trials))
            var point = {'Week':weeks[w], 'UpperConf':upperconf, 'LowerConf':lowerconf}
            confdata.push(point)
        };
    } else {
        var z = jStat.studentt.inv(conf, num_trials - 1)
        for (w in weeks){
            var xbar = meandata.filter(function(d) {return d.Week == weeks[w]})[0][casecode]
            var weekdata = data.filter(function(d) {return d.Week == weeks[w]}).map(function(d) {return d[casecode];})
            var sigma = jStat.stdev(weekdata)
            var lowerconf = xbar - z*(sigma/Math.sqrt(num_trials))
            var upperconf = xbar + z*(sigma/Math.sqrt(num_trials))
            var point = {'Week':weeks[w], 'UpperConf':upperconf, 'LowerConf':lowerconf}
            confdata.push(point)
        };
    }
    return confdata
}

update_ts()