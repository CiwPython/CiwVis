/*
 *  DECLARATION BLOCK STARTS
 */
var view_width = document.getElementById("pdf").clientWidth;
var view_height = document.getElementById("pdf").clientHeight;
var margin = {top: 50, bottom: 50, left: 70, right: 50};
var width = view_width - margin.left - margin.right;
var height = view_height - margin.top - margin.bottom;

var y_scale = d3.scaleLinear()
    .range([height, 0]);

var formatCount = d3.format(",.0f");

var svg_pdf = d3.select('#pdf')
    .append('svg')
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var t = d3.transition()
    .duration(800);

svg_pdf.append("text")
    .attr("transform", "translate(-50," + height/3 + ")rotate(-90)")
    .attr("text-anchor", "end")
    .text("Probability");

svg_pdf.append("text")
    .attr("transform", "translate(" + width/2 + "," + (height+30) + ")")
    .attr("text-anchor", "end")
    .text("Number of Customers in the System");

/*
 *  DECLARATION BLOCK ENDS
 */

function update_pdf() {
    /*
        Update function reads the input values, creates random data, and updates the visualisation accordingly
    */
    var t = d3.transition()
        .duration(2000);

    var datasource = document.getElementById('dataselect-formcontrol').value;

    d3.json(datasource + '/metadata.json', function(metadata) {
        meta = metadata;

    var warmup = parseInt(d3.select('#warmup_pdf').node().value);
    var trialnumber = parseInt(d3.select('#trial_pdf').node().value);
    var allon = document.getElementById('all_pdf');
    var trialon = document.getElementById('trialon_pdf');
    var cumulative = document.getElementById('pdfcum');

    for (i=1; i<=meta.Number_of_nodes; i++){
        if (document.getElementById('node' + i + 'pdf').checked) { var node = i; }
    };

    d3.json(datasource + '/pdf.json', function(data) {
        mydataraw = data;

    var mydataintermediate = mydataraw.filter(function (d) {
      return d.Node == node;
    });

    if (allon.checked){ mydata = mydataintermediate.filter(function(d) {return d.Trial == 'Mean'});};
    if (trialon.checked){ mydata = mydataintermediate.filter(function(d) { return d.Trial == trialnumber; });};

    var maxValue = d3.max(mydata, function(d){ return d.State; });

    var halfbar = (width / mydata.length)*0.5;
    var barWidth = (width / mydata.length)*0.7;

    var x_scale = d3.scaleBand()
        .domain(mydata.map(function(d) { return d.State; }))
        .range([0, width]);

    var y_scale = d3.scaleLinear()
        .domain([0, d3.max(mydata, function(d) { return d.Probability; })])
        .range([height, 0]);

    var valueline = d3.line()
        .x(function(d) { return x_scale(d.State) + halfbar; })
        .y(function(d) { return y_scale(d.Probability); });

    svg_pdf.selectAll(".bar")
        .remove();
    svg_pdf.selectAll(".dot")
        .remove();
    svg_pdf.selectAll(".line")
        .remove();

    if (cumulative.checked){
        y_scale.domain([0, 1.05])
    };

    var bar = svg_pdf.selectAll(".bar")
        .data(mydata);

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
        .attr("x", function(d) { return x_scale(d.State) + 0.3*halfbar; })
        .attr("fill", "#ff6600")
        .attr("width", barWidth)
        .attr("height", function(d) { return height - y_scale(d.Probability); })
        .attr("y", function(d) { return y_scale(d.Probability); })
        .on("mouseover", function(d) {
            d3.select(this)
                .attr("fill", "#ff9900");
            var tooltip = svg_pdf
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
                .text('State: ' + d.State)
                .append('tspan')
                .attr('id', 'tspanbottom')
                .attr('x', d3.mouse(this)[0]-70)
                .attr('y', d3.mouse(this)[1]-30)
                .text('Probability = ' + d.Probability.toFixed(5));

        })
        .on("mousemove", function(d){
            svg_pdf.select("#tooltip")
                .select('rect')
                    .attr('x', d3.mouse(this)[0]-80)
                    .attr('y', d3.mouse(this)[1]-70);
            svg_pdf.select("#tooltip")
                .select('text').select('#tspantop')
                    .attr('x', d3.mouse(this)[0]-70)
                    .attr('y', d3.mouse(this)[1]-50);
            svg_pdf.select("#tooltip")
                .select('text').select('#tspanbottom')
                    .attr('x', d3.mouse(this)[0]-70)
                    .attr('y', d3.mouse(this)[1]-30);
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("fill", "#ff6600");
            svg_pdf.select("#tooltip").remove();
        });


    if (cumulative.checked){
        var cumdata = cumulativedata(mydata, maxValue)
        svg_pdf.append('path')
            .datum(cumdata)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#ff9900")
            .attr("stroke-width", 2)
            .style("stroke-dasharray", ("3, 3"))
            .attr('d', valueline);
        svg_pdf.selectAll('.dot')
            .data(cumdata)
            .enter()
            .append('circle')
            .attr("class", "dot")
            .attr("stroke", "#ff9900")
            .attr("fill", "#FFD18B")
            .attr("r", Math.max(0.15*barWidth, width/200))
            .attr("cx", function(d) {return x_scale(d.State) + halfbar;})
            .attr("cy", function(d) {return y_scale(d.Probability);})
            .on("mouseover", function(d) {
                d3.select(this)
                    .attr('fill', '#ff6600');
                var tooltip = svg_pdf
                    .append('g')
                    .attr('id', 'tooltipline');
                tooltip
                    .append("line")
                    .attr('class', 'line')
                    .attr('id', 'vline')
                    .attr("fill", "none")
                    .attr("stroke", "#B7B7B7")
                    .attr("stroke-width", 0.8)
                    .style("stroke-dasharray", ("2, 2"))
                    .attr("x1", x_scale(d.State) + halfbar)
                    .attr("x2", x_scale(d.State) + halfbar)
                    .attr("y1", y_scale(0))
                    .attr("y2", y_scale(d.Probability));
                tooltip
                    .append("line")
                    .attr('class', 'line')
                    .attr('id', 'vline')
                    .attr("fill", "none")
                    .attr("stroke", "#B7B7B7")
                    .attr("stroke-width", 0.8)
                    .style("stroke-dasharray", ("2, 2"))
                    .attr("x1", x_scale(d.State) + halfbar)
                    .attr("x2", 0)
                    .attr("y1", y_scale(d.Probability))
                    .attr("y2", y_scale(d.Probability));
                tooltip
                    .append("rect")
                    .attr('x', x_scale(d.State) + halfbar - 70)
                    .attr('width', 140)
                    .attr('y', y_scale(d.Probability) - 40)
                    .attr('height', 28)
                    .attr('fill', '#FFF3D1')
                    .attr('stroke', '#ff9900')
                    .attr('rx', 10)
                    .attr('ry', 10);
                tooltip
                    .append('text')
                    .attr('x', x_scale(d.State) + halfbar - 60)
                    .attr('y', y_scale(d.Probability) - 20)
                    .text('P(q ≤ ' + d.State + ') = ' + d.Probability.toFixed(5));
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .attr('fill', '#FFD18B');
                svg_pdf.select('#tooltipline')
                    .remove();
            });
    };


    svg_pdf.selectAll(".axis")
        .remove()
    svg_pdf.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y_scale));
    svg_pdf.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis axis--x")
        .call(d3.axisBottom(x_scale).ticks(maxValue));



    });
    });
}



function cumulativedata(data, maxValue) {
    var cum_data = [];
    var cum = 0;
    for (i=0; i<=maxValue; i++){
        cum += data[i].Probability
        point = {"State":i, "Probability":cum}
        cum_data.push(point)
    };
    return cum_data
}
