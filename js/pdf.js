/*
 *  DECLARATION BLOCK STARTS
 */
var view_width = document.getElementById("pdf").clientWidth;
var view_height = document.getElementById("pdf").clientHeight;
var margin = {top: 50, bottom: 50, left: 70, right: 50};
var width = view_width - margin.left - margin.right;
var height = view_height - margin.top - margin.bottom;

var x_scale = d3.scaleLinear()
    .range([0, width]);
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


    var x_scale = d3.scaleLinear()
        .range([0, width])
    	.domain([0, maxValue]);

    var y_scale = d3.scaleLinear()
        .domain([0, d3.max(mydata, function(d) { return d.Probability; })])
        .range([height, 0]);

    svg_pdf.selectAll(".bar")
        .remove();

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
        .attr("x", function(d) { return x_scale(d.State-0.2); })
        .attr("fill", "#ff6600")
        .attr("width", x_scale(0.4))
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

