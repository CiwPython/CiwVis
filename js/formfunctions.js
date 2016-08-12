function makecheckboxes(nodes, classes, divid, idid){

    var datasource = document.getElementById('dataselect-formcontrol').value;

    d3.json(datasource + '/metadata.json', function(data) { meta = data;

        var inputsnd = 'Node:<br>'
        var inputscls = 'Class:<br>'

        if (nodes){
        for (i = 1; i <= meta.Number_of_nodes; i++){
            inputsnd += '<label class="checkbox-inline"><input type="checkbox" checked="checked" onchange="update_' + idid + '()" name="Node' + i + '" id="node' + i + idid + '"/>' + i + '</label>'
        };};

        if (classes){
        for (i = 0; i < meta.Number_of_classes; i++){
            inputscls += '<label class="checkbox-inline"><input type="checkbox" checked="checked" onchange="update_' + idid + '()" name="Class' + i + '" id="class' + i + idid + '"/>' + i + '</label>'
        };};

        if (nodes){
            $( divid ).append(inputsnd);};
        if (nodes && classes){
            $( divid ).append('<br>');};
        if (classes){
            $( divid ).append(inputscls);};
    });
}


function maketrialselection(divid, idid){
    var datasource = document.getElementById('dataselect-formcontrol').value;
    d3.json(datasource + '/metadata.json', function(data) { meta = data;
        var dropdown = 'Trial #: <select disabled="true" class="form-control" id="trial_' + idid + '" onchange="update_' + idid + '()">'
        for (i=0; i<meta.Number_of_trials; i++){
            dropdown += '<option>' + i + '</option>'
        };
        dropdown += '</select>'
        $( divid ).append(dropdown);
    });
}


window.onbeforeunload = function() {
    sessionStorage.setItem('dataname', $('#dataselect-formcontrol').val());
}



function refresh_page(){
    window.onload = function() {
        update_hist();
        update_ts();
        update_bpnd();
        update_bpcls();
        update_pdf();
        update_tsql();
      }}

function makenoderadios(divid, idid){
    var datasource = document.getElementById('dataselect-formcontrol').value;
    d3.json(datasource + '/metadata.json', function(data) { meta = data;
        var inputsnd = 'Node:<br>'
        for (i = 1; i <= meta.Number_of_nodes; i++){
            inputsnd += '<label class="radio-inline"><input type="radio" onchange="update_' + idid + '()" name="Node' + idid + '" id="node' + i + idid + '"/>' + i + '</label>'
        };
        
        $( divid ).append(inputsnd);

        document.getElementById("node1" + idid).checked = true;
    })}
