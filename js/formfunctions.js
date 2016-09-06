function choosefile(selected){
    const fileInput = document.getElementById('fileInput');
    const chosenFiles = fileInput.files;
    for (i = 0; i < chosenFiles.length; i++){
        if (chosenFiles[i].name == selected){
            var chosenFile = chosenFiles[i]
        }
    }
    return chosenFile
}




function makecheckboxes(nodes, classes, divid, idid){
    var num_nodes = sessionStorage.getItem('Number_of_nodes')
    var num_classes = sessionStorage.getItem('Number_of_classes')

        var inputsnd = 'Node:<br>'
        var inputscls = 'Class:<br>'

        if (nodes){
        for (i = 1; i <= num_nodes; i++){
            inputsnd += '<label class="checkbox-inline"><input type="checkbox" checked="checked" onchange="update_' + idid + '()" name="Node' + i + '" id="node' + i + idid + '"/>' + i + '</label>'
        };};

        if (classes){
        for (i = 0; i < num_classes; i++){
            inputscls += '<label class="checkbox-inline"><input type="checkbox" checked="checked" onchange="update_' + idid + '()" name="Class' + i + '" id="class' + i + idid + '"/>' + i + '</label>'
        };};

        if (nodes){
            $( divid ).append(inputsnd);};
        if (nodes && classes){
            $( divid ).append('<br>');};
        if (classes){
            $( divid ).append(inputscls);};
}


function maketrialselection(divid, idid){
    var num_trials = sessionStorage.getItem('Number_of_trials')

    var dropdown = 'Trial #: <select disabled="true" class="form-control" id="trial_' + idid + '" onchange="update_' + idid + '()">'
    for (i=0; i<num_trials; i++){
        dropdown += '<option>' + i + '</option>'
    };
    dropdown += '</select>'
    $( divid ).append(dropdown);
}




function refresh_page(){
    sessionStorage.clear();

    var metafile = choosefile('metadata.json')
    const fileReader = new FileReader();
    fileReader.onload = event => {
        const contentsOfFile = event.target.result;
        var meta = JSON.parse(contentsOfFile);
        var ks = Object.keys(meta)
        for (i in ks){
             sessionStorage.setItem(ks[i], meta[ks[i]]);
        }
    }
    fileReader.readAsText(metafile)

    jQuery('#histholder').append( jQuery('<div>').load('hist.html') );
    jQuery('#tsholder').append( jQuery('<div>').load('ts.html') );
    jQuery('#tsqlholder').append( jQuery('<div>').load('tsql.html') );
    jQuery('#pdfholder').append( jQuery('<div>').load('pdf.html') );
    jQuery('#bpndholder').append( jQuery('<div>').load('bpnd.html') );
    jQuery('#bpclsholder').append( jQuery('<div>').load('bpcls.html') );
}




function makenoderadios(divid, idid){
    var num_nodes = sessionStorage.getItem('Number_of_nodes')

    var inputsnd = 'Node:<br>'
    for (i = 1; i <= num_nodes; i++){
        inputsnd += '<label class="radio-inline"><input type="radio" onchange="update_' + idid + '()" name="Node' + idid + '" id="node' + i + idid + '"/>' + i + '</label>'
    };
    
    $( divid ).append(inputsnd);

    document.getElementById("node1" + idid).checked = true;
}