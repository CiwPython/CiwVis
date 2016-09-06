/*
 *  DECLARATION BLOCK STARTS
 */
var view_width = document.getElementById("boxplotscls").clientWidth;
var view_height = document.getElementById("boxplotscls").clientHeight;
var margin = {top: 50, bottom: 50, left: 50, right: 50};
var width = view_width - margin.left - margin.right;
var height = view_height - margin.top - margin.bottom;

var svg_bxpltcls = d3.select('#boxplotscls')
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

var box_width = 10


svg_bxpltcls.append("g")
    .attr("class", "y axis")

svg_bxpltcls.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height) + ")");

svg_bxpltcls.append("text")
    .attr("transform", "translate(-30," + height/3 + ")rotate(-90)")
    .attr("text-anchor", "end")
    .text("Waiting Time");

svg_bxpltcls.append("text")
    .attr("transform", "translate(" + width/2 + "," + (height+30) + ")")
    .attr("text-anchor", "end")
    .text("Classes");

/*
 *  DECLARATION BLOCK ENDS
 */



function update_bpcls() {
    /*
        Update function reads the input values, creates random data, and updates the visualisation accordingly
    */
    var num_nodes = parseInt(sessionStorage.getItem('Number_of_nodes'))
    var num_classes = parseInt(sessionStorage.getItem('Number_of_classes'))
    var num_trials = parseInt(sessionStorage.getItem('Number_of_trials'))

    var warmup = parseInt(d3.select('#warmupboxcls').node().value);
    var validNodes = {}
    var trialnumber = parseInt(d3.select('#trial_bpcls').node().value);
    var allon = document.getElementById('all_bpcls');
    var meanson = document.getElementById('means_bpcls');
    var trialon = document.getElementById('trialon_bpcls');

    for (i=1; i<=num_nodes; i++){
        if (document.getElementById('node' + i + 'bpcls').checked) { validNodes[i] = true }
    };

    var bpclsdatafile = choosefile('waitingdata.json')
    const bpclsfileReader = new FileReader();
    bpclsfileReader.onload = event => {
        const contentsOfFile = event.target.result;
        var mydataraw = JSON.parse(contentsOfFile);

        var mydataintermediate = mydataraw.filter(function (d) {
            return d.Node in validNodes &&
                d.Arrival_date >= warmup;
            });

        if (allon.checked || meanson.checked){ mydata = mydataintermediate;};
        if (trialon.checked){ mydata = mydataintermediate.filter(function(d) { return d.Trial == trialnumber; });};

        var xaxis_ticks = [];
        var bpdata = []
        for (cls = 0; cls < num_classes; cls++) {
            var dta_raw = mydata.filter(function(d) {return d.Customer_class == cls;});
            if (meanson.checked){
                dta = meanwait_bp(dta_raw, num_trials);
            } else {
                dta = dta_raw.map(function(d) {return d.Waiting_time});
            };
            bpdata.push(boxplotdata_cls(dta, cls));
            xaxis_ticks.push((((cls+1)*1.8) - 0.9)*box_width)
        };

        x_scale.domain([0, 1.8*box_width*num_classes]);
        y_scale.domain([0, d3.max(bpdata, function(d){ return d.tailmax; })]);
        
        svg_bxpltcls.selectAll(".box").remove();

        var bxplt = svg_bxpltcls.selectAll(".box")
            .data(bpdata);

        var newbxplt = bxplt
            .enter()
            .append("g")
            .attr("class", "box");

        newbxplt.merge(bxplt)
            .append("rect")
            .attr("class", "box")
            .attr("x", function(d) {return x_scale((0.4 + (d.Customer_class * 1.8))*box_width);})
            .attr("stroke", "#ff6600")
            .attr("fill", "#ff6600")
            .attr("fill-opacity", 0.2)
            .attr("width", x_scale(box_width))
            .attr("height", function(d) { return height - y_scale(d.Q75 - d.Q25); })
            .attr("y", function(d) { return y_scale(d.Q75);});

        newbxplt.merge(bxplt)
            .append("circle")
            .attr("class", "box")
            .attr("fill", "#ff6600")
            .attr("r", x_scale(0.4))
            .attr("cx", function(d) {return x_scale((0.9 + (1.8*d.Customer_class))*box_width);})
            .attr("cy", function(d) {return y_scale(d.mean);});

        newbxplt.merge(bxplt)
            .append("line")
            .attr("class", "box")
            .attr("fill", "none")
            .attr("stroke", "#ff6600")
            .attr("x1", function(d) {return x_scale((0.4 + (d.Customer_class * 1.8))*box_width);})
            .attr("x2", function(d) {return x_scale((1.4 + (d.Customer_class * 1.8))*box_width);})
            .attr("y1", function(d) {return y_scale(d.Q50);})
            .attr("y2", function(d) {return y_scale(d.Q50);});

        newbxplt.merge(bxplt)
            .append("line")
            .attr("class", "box")
            .attr("fill", "none")
            .attr("stroke", "#ff6600")
            .attr("x1", function(d) {return x_scale((0.9 + (1.8*d.Customer_class))*box_width);})
            .attr("x2", function(d) {return x_scale((0.9 + (1.8*d.Customer_class))*box_width);})
            .attr("y1", function(d) {return y_scale(d.tailmin)})
            .attr("y2", function(d) {return y_scale(d.Q25)});

        newbxplt.merge(bxplt)
            .append("line")
            .attr("class", "box")
            .attr("fill", "none")
            .attr("stroke", "#ff6600")
            .attr("x1", function(d) {return x_scale((0.9 + (1.8*d.Customer_class))*box_width);})
            .attr("x2", function(d) {return x_scale((0.9 + (1.8*d.Customer_class))*box_width);})
            .attr("y1", function(d) {return y_scale(d.Q75)})
            .attr("y2", function(d) {return y_scale(d.tailmax)});

        newbxplt.merge(bxplt)
            .append("line")
            .attr("class", "box")
            .attr("fill", "none")
            .attr("stroke", "#ff6600")
            .attr("x1", function(d) {return x_scale((0.7 + (1.8*d.Customer_class))*box_width);})
            .attr("x2", function(d) {return x_scale((1.1 + (1.8*d.Customer_class))*box_width);})
            .attr("y1", function(d) {return y_scale(d.tailmin)})
            .attr("y2", function(d) {return y_scale(d.tailmin)});

        newbxplt.merge(bxplt)
            .append("line")
            .attr("class", "box")
            .attr("fill", "none")
            .attr("stroke", "#ff6600")
            .attr("x1", function(d) {return x_scale((0.7 + (1.8*d.Customer_class))*box_width);})
            .attr("x2", function(d) {return x_scale((1.1 + (1.8*d.Customer_class))*box_width);})
            .attr("y1", function(d) {return y_scale(d.tailmax)})
            .attr("y2", function(d) {return y_scale(d.tailmax)});

        newbxplt.merge(bxplt)
            .on("mouseover", function(d) {
            d3.select(this)
                .attr("fill", "#ff9900");
            var tooltip = svg_bxpltcls
                .append('g')
                .attr('id', 'tooltip');
            tooltip
                .append("rect")
                .attr('x', d3.mouse(this)[0]-65)
                .attr('width', 125)
                .attr('y', d3.mouse(this)[1]-150)
                .attr('height', 135)
                .attr('fill', '#FFF3D1')
                .attr('stroke', '#ff9900')
                .attr('rx', 10)
                .attr('ry', 10);
            tooltip
                .append('text')
                .append('tspan')
                .attr('id', 'bxcls_min')
                .attr('x', d3.mouse(this)[0]-55)
                .attr('y', d3.mouse(this)[1]-130)
                .text('Min = ' + d.min.toFixed(5))
                .append('tspan')
                .attr('id', 'bxcls_max')
                .attr('x', d3.mouse(this)[0]-55)
                .attr('y', d3.mouse(this)[1]-110)
                .text('Max = ' + d.max.toFixed(5))
                .append('tspan')
                .attr('id', 'bxcls_q25')
                .attr('x', d3.mouse(this)[0]-55)
                .attr('y', d3.mouse(this)[1]-90)
                .text('Q25 = ' + d.Q25.toFixed(5))
                .append('tspan')
                .attr('id', 'bxcls_q50')
                .attr('x', d3.mouse(this)[0]-55)
                .attr('y', d3.mouse(this)[1]-70)
                .text('Q50 = ' + d.Q50.toFixed(5))
                .append('tspan')
                .attr('id', 'bxcls_q75')
                .attr('x', d3.mouse(this)[0]-55)
                .attr('y', d3.mouse(this)[1]-50)
                .text('Q75 = ' + d.Q75.toFixed(5))
                .append('tspan')
                .attr('id', 'bxcls_mean')
                .attr('x', d3.mouse(this)[0]-55)
                .attr('y', d3.mouse(this)[1]-30)
                .text('Mean: ' + d.mean.toFixed(5));

            })
            .on("mousemove", function(d){
                svg_bxpltcls.select("#tooltip")
                    .select('rect')
                        .attr('x', d3.mouse(this)[0]-65)
                        .attr('y', d3.mouse(this)[1]-150);
                svg_bxpltcls.select("#tooltip")
                    .select('text').select('#bxcls_min')
                        .attr('x', d3.mouse(this)[0]-55)
                        .attr('y', d3.mouse(this)[1]-130);
                svg_bxpltcls.select("#tooltip")
                    .select('text').select('#bxcls_max')
                        .attr('x', d3.mouse(this)[0]-55)
                        .attr('y', d3.mouse(this)[1]-110);
                svg_bxpltcls.select("#tooltip")
                    .select('text').select('#bxcls_q25')
                        .attr('x', d3.mouse(this)[0]-55)
                        .attr('y', d3.mouse(this)[1]-90);
                svg_bxpltcls.select("#tooltip")
                    .select('text').select('#bxcls_q50')
                        .attr('x', d3.mouse(this)[0]-55)
                        .attr('y', d3.mouse(this)[1]-70);
                svg_bxpltcls.select("#tooltip")
                    .select('text').select('#bxcls_q75')
                        .attr('x', d3.mouse(this)[0]-55)
                        .attr('y', d3.mouse(this)[1]-50);
                svg_bxpltcls.select('#tooltip')
                    .select('text').select('#bxcls_mean')
                        .attr('x', d3.mouse(this)[0]-55)
                        .attr('y', d3.mouse(this)[1]-30);
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("fill", "#ff6600");
                svg_bxpltcls.select("#tooltip").remove();
            });


        svg_bxpltcls.selectAll(".y.axis")
            .transition(t)
            .call(y_axis);
        svg_bxpltcls.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis axis--x")
            .call(x_axis
                .tickValues(xaxis_ticks)
                .tickFormat(function(d) {return ((d+9)/18)-1;}));


    }
    bpclsfileReader.readAsText(bpclsdatafile);
}


function boxplotdata_cls(data, cls) {
    data.sort(function(a, b){return a-b});
    return bp = {
        'Q25': d3.quantile(data, 0.25),
        'Q75': d3.quantile(data, 0.75),
        'Q50': d3.quantile(data, 0.5),
        'mean': d3.mean(data),
        'IQR': d3.quantile(data, 0.75)-d3.quantile(data, 0.25),
        'max': d3.max(data),
        'min': d3.min(data),
        'tailmin': Math.max(d3.min(data), d3.quantile(data, 0.5) - ((d3.quantile(data, 0.75) - d3.quantile(data, 0.25))*1.5)),
        'tailmax': Math.min(d3.max(data), d3.quantile(data, 0.5) + ((d3.quantile(data, 0.75) - d3.quantile(data, 0.25))*1.5)),
        'Customer_class': cls}

    };


function meanwait_bp(data, num_trials) {
    var meanwaits = []
    for (t=0; t<num_trials; t++){
        var trialmean = jStat.mean(data.filter(function(d) { return d.Trial == t; }).map(function(d) { return d.Waiting_time; }))
        meanwaits.push(trialmean)
    };
    return meanwaits
};


update_bpcls()