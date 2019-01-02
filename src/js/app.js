import $ from 'jquery';
/*import * as escodegen from 'escodegen';
import * as esgraph from 'esgraph';
import * as d3graphviz from 'd3-graphviz';*/
import * as esprima from 'esprima';
import * as flowchart from 'flowchart.js';




import {parseStringNodes} from './code-analyzer';
//const esgraph = require('esgraph');


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let vectorToParse = $('#inputVector').val();
        let vector = JSON.parse(vectorToParse);
        let parsedCode = esprima.parseScript(codeToParse);

        let nodesParsedCode = parseStringNodes(parsedCode, vector);
        alert(nodesParsedCode);
        let diagramOptions = getDiagramOptions();
        let myDiagram = flowchart.parse(nodesParsedCode);
        myDiagram.drawSVG(myDiagram, diagramOptions);

    });
});


const getDiagramOptions = () =>{
    return  {
        'x': 0,'y': 10,'line-width': 3,'line-length': 50,
        'text-margin': 10,
        'font-size': 14,'font-color': 'black','line-color': 'black',
        'element-color': 'black','fill': 'white',
        'yes-text': 'T','no-text': 'F',
        'arrow-end': 'block','scale': 1,
        'symbols': {
            'start': {
                'font-color': 'black',
                'element-color': 'green',
                'fill': 'yellow'},
            'end':{ 'class': 'end-element' }
        },
        'flowstate' : {
            'green' : { 'fill' : '#A7D38C'}
        }
    };
};












/*   alert('7a');
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
     /!*   let vector = $('#vector').val();
        var vectorDict = JSON.parse(vector);*!/
       /!* let parsedCode = parseCode(codeToParse);
        let cfg = esgraph(parsedCode['body'][0]['body']);
        alert(cfg[0]);
        alert(cfg[0].type);

        let dot = esgraph.dot(cfg);
/!*alert(cfg[2][0]);
        alert('my '+dot[3]);
        alert(dot);*!/
        let str = 'digraph G {' + dot + '}';
        alert('a');*!/
     //     d3graphviz.graphviz( $('#parsedCode')).renderDot(str);

     //      $('#parsedCode').html(d3graphviz.graphviz(,renderDot(str));

      //  var cfg = esgraph(parsedCode);
        //var graph = esgraph.dot(cfg);
        //alert(graph);
       //  const cfg = esgraph(esprima.parse(codeToParse, { range: true }));
      //  const dot = esgraph.dot(cfg, { counter: 0, source: cfg });

     /!*   alert('b');
        alert(cfg);*!/

      //  let qua2 = task2(parsedCode,vectorDict);
       // let literalCode = escodegen.generate(qua2);
     //   let lines = literalCode.split('\n');
     //   let finalCode = makingFinalCodeString(lines);



        //var myList = createMyList(parsedCode);
        //   var htmlTableString= makingHtmlStringTable(myList);
        /!*$('#parsedCode').val(JSON.stringify(myList, null, 2));*!/
        // $('#dataTable').html(finalString);
          $('#codePlaceholder').val(JSON.stringify(parsedCode, null, 2));
        // $('#parsedCode').val(JSON.stringify(literalCode, null, 2));
 //       $('#parsedCode').html(finalCode);
    });
});

const makingFinalCodeString =(list)=> {
    let counterIf=0;
    let str='';
    for(var i=0;i<list.length;i++){
        if(list[i].indexOf('if')>-1){
            if(paintArray.includes(counterIf)) {
                str = str + '<div style="background: green;">' + list[i] + '</div>';
            }
            else {
                str = str + '<div style="background: red;">' + list[i] + '</div>';
            }
            counterIf++;
        }
        else{
            str=str+'<div >' + list[i] + '</div>';
        }
    }
    return str;
};
*/
/*
const makingHtmlStringTable =(list)=> {
    var str= '<tr> <td> Line </td> <td> Type </td> <td> Name </td> <td> Condition </td> <td> Value </td> </tr> ';
    var line,type,name,cond,value,tempLine;
    for(var i=0;i<list.length;i++){
        line=list[i].line;
        type=list[i].type;
        name=list[i].name;
        cond=list[i].condition;
        value=list[i].value;
        tempLine='<tr> ' + '<td> ' + line + '</td> ' + '<td> ' + type + '</td> ' + '<td> ' + name +  '</td> ' + '<td> ' + cond + '</td> ' + '<td> ' + value + '</td> </tr> ';
        str=str+tempLine;
    }
    return str;
};*/
