/*
 *  DECLARATION BLOCK STARTS
 */
var view_width = document.getElementById("histogram").clientWidth;
var view_height = document.getElementById("histogram").clientHeight;
var margin = {top: 50, bottom: 50, left: 70, right: 50};
var width = view_width - margin.left - margin.right;
var height = view_height - margin.top - margin.bottom;

var x_scale = d3.scaleLinear()
    .range([0, width]);
var y_scale = d3.scaleLinear()
    .range([height, 0]);

var formatCount = d3.format(",.0f");

var svg_hist = d3.select('#histogram')
    .append('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var t = d3.transition()
    .duration(800);

svg_hist.append("text")
    .attr("transform", "translate(-50," + height/3 + ")rotate(-90)")
    .attr("text-anchor", "end")
    .text("Frequency");

svg_hist.append("text")
    .attr("transform", "translate(" + width/2 + "," + (height+30) + ")")
    .attr("text-anchor", "end")
    .text("Waiting Time");

/*
 *  DECLARATION BLOCK ENDS
 */

function update_hist() {
    /*
        Update function reads the input values, creates random data, and updates the visualisation accordingly
    */
    var t = d3.transition()
        .duration(2000);

    var num_nodes = parseInt(sessionStorage.getItem('Number_of_nodes'))
    var num_classes = parseInt(sessionStorage.getItem('Number_of_classes'))
    var num_trials = parseInt(sessionStorage.getItem('Number_of_trials'))

    var numberofbins = parseInt(d3.select('#numbins').node().value);
    var warmup = parseInt(d3.select('#warmup').node().value);
    var trialnumber = parseInt(d3.select('#trial_hist').node().value);
    var allon = document.getElementById('all_hist');
    var meanson = document.getElementById('means_hist');
    var trialon = document.getElementById('trialon_hist');

    var validNodes = {}
    var validClasses = {}

    for (i=1; i<=num_nodes; i++){
        if (document.getElementById('node' + i + 'hist').checked) { validNodes[i] = true }
    };
    for (i=0; i<num_classes; i++){
        if (document.getElementById('class' + i + 'hist').checked) { validClasses[i] = true }
    };

    var histdatafile = choosefile('waitingdata.json')
    const histfileReader = new FileReader();
    histfileReader.onload = event => {
        const contentsOfFile = event.target.result;
        var mydataraw = JSON.parse(contentsOfFile);

    var mydataintermediate = mydataraw.filter(function (d) {
      return d.Node in validNodes &&
             d.Customer_class in validClasses &&
             d.Arrival_date >= warmup;
    });

    if (allon.checked){ mydata = mydataintermediate;};
    if (meanson.checked){ mydata = meanwait(mydataintermediate, num_trials);};
    if (trialon.checked){ mydata = mydataintermediate.filter(function(d) { return d.Trial == trialnumber; });};

    var maxValue = d3.max(mydata, function(d){ return d.Waiting_time; });

    var x_scale = d3.scaleLinear()
        .range([0, width]);
    x_scale.domain([0, maxValue]);

    var binedges = [];
    for (i = 0; i < numberofbins + 1; i++) {
        var s = i*(maxValue/numberofbins);
        binedges.push(s)
    };

    var bins = d3.histogram()
    .domain(x_scale.domain())
    .thresholds(binedges)
    (mydata.map(function(d) {return d.Waiting_time;}));

    var y_scale = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height, 0]);

    svg_hist.selectAll(".bar")
        .remove();

    var bar = svg_hist.selectAll(".bar")
        .data(bins);

    bar
        .exit()
        .remove();

    var newbar = bar
        .enter()
        .append("g")
        .attr("height", 0)
        .attr("y", 0)
        .attr("class", "bar");

    newbar.merge(bar)
        .append("rect")
        .attr("x", function(d) { return (d.x0*width)/maxValue; })
        .attr("fill", "#ff6600")
        .attr("width", x_scale(bins[0].x1) - x_scale(bins[0].x0) - 1)
        .attr("height", function(d) { return height - y_scale(d.length); })
        .attr("y", function(d) { return y_scale(d.length); })
        .on("mouseover", function(d) {
            d3.select(this)
                .attr("fill", "#ff9900");
            var tooltip = svg_hist
                .append('g')
                .attr('id', 'tooltip');
            tooltip
                .append("rect")
                .attr('x', d3.mouse(this)[0]-80)
                .attr('width', 160)
                .attr('y', d3.mouse(this)[1]-70)
                .attr('height', 55)
                .attr('fill', '#FFF3D1')
                .attr('stroke', '#ff9900')
                .attr('rx', 10)
                .attr('ry', 10);
            tooltip
                .append('text')
                .append('tspan')
                .attr('id', 'tspantop')
                .attr('x', d3.mouse(this)[0]-70)
                .attr('y', d3.mouse(this)[1]-50)
                .text('Count: ' + d.length)
                .append('tspan')
                .attr('id', 'tspanbottom')
                .attr('x', d3.mouse(this)[0]-70)
                .attr('y', d3.mouse(this)[1]-30)
                .text('Interval: (' + d.x0.toFixed(2) + ', ' + d.x1.toFixed(2) + ')');

        })
        .on("mousemove", function(d){
            svg_hist.select("#tooltip")
                .select('rect')
                    .attr('x', d3.mouse(this)[0]-80)
                    .attr('y', d3.mouse(this)[1]-70);
            svg_hist.select("#tooltip")
                .select('text').select('#tspantop')
                    .attr('x', d3.mouse(this)[0]-70)
                    .attr('y', d3.mouse(this)[1]-50);
            svg_hist.select("#tooltip")
                .select('text').select('#tspanbottom')
                    .attr('x', d3.mouse(this)[0]-70)
                    .attr('y', d3.mouse(this)[1]-30);
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("fill", "#ff6600");
            svg_hist.select("#tooltip").remove();
        });

    svg_hist.selectAll(".axis")
        .remove()
    svg_hist.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y_scale));
    svg_hist.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis axis--x")
        .call(d3.axisBottom(x_scale).tickValues(binedges));



    }
    histfileReader.readAsText(histdatafile);
}


function meanwait(data, num_trials) {
    var meanwaits = []
    for (t=0; t<num_trials; t++){
        var trialmean = jStat.mean(data.filter(function(d) { return d.Trial == t; }).map(function(d) { return d.Waiting_time; }))
        var point = {'Waiting_time': trialmean}
        meanwaits.push(point)
    };
    return meanwaits
};



update_hist()