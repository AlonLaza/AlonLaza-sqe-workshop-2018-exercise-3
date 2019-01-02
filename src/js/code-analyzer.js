import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

/*var table = new Array();
var linesToDelete = [];
var linesToDeleteInnerBlock = [];

var dict = new Array();
var duplicateDict= new Array();
var paintArray = new Array();
var paintCounter=0;*/
var localVars={};
var greenNodes;
var nodesCounter;
var nodes;
var edges;
var nodesArr;
var myVector;
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

export {parseCode,parseStringNodes,checkSubt};


const parseStringNodes = (parsedCode, vector) => {
    nodesCounter=1;
    edges =  '';
    nodes = 'st=>start: Start\n';
    nodesArr = ['st'];
    myVector=vector;

    greenNodes = [];

    getCfgString(parsedCode, 1);

    paintNodesInGreen();
    return nodes + edges;
};

const getCfgString = (ParsedCode, isGreen) => {
    switch(ParsedCode.type){
    case('Program'):  return programCase(ParsedCode,isGreen);
    case('FunctionDeclaration'): return functionCase(ParsedCode,isGreen);
    case('BlockStatement'): return blockCase(ParsedCode,isGreen);
    case('VariableDeclaration'): return varDecCase(ParsedCode/*,isGreen*/);
    default: return getCfgString1(ParsedCode, isGreen);


    }

};

const getCfgString1 = (ParsedCode, isGreen) => {
    switch(ParsedCode.type){
    case('IfStatement'): return ifCase(ParsedCode,isGreen);
    case('ReturnStatement'): return returnCase(ParsedCode,isGreen);
    case('SequenceExpression'): return seqCase(ParsedCode,isGreen);
    case('UpdateExpression'): return updateCase(ParsedCode/*,isGreen*/);
    default: return getCfgString2(ParsedCode, isGreen);
    }
};

const getCfgString2 = (ParsedCode, isGreen) => {
    switch(ParsedCode.type){
    case('ExpressionStatement'): return expStateCase(ParsedCode,isGreen);
    case('AssignmentExpression'): return assignmentCase(ParsedCode/*,isGreen*/);
    case('WhileStatement'): return whileCase(ParsedCode,isGreen);
    }

};

const paintNodesInGreen = () => {
    for(let i=0;i<greenNodes.length;i++){
        let loc = nodes.search(greenNodes[i]);
        let nextNode = nodes.indexOf('node', loc+1);
        let first = nodes.slice(0, nextNode);
        let second = nodes.slice(nextNode);
        first = first.trim(0, -1);
        first += '|green\n';
        nodes = first.concat(second);
    }
};

const getNodeNum = () => {
    let nodeNum = '#' + nodesCounter + '\n';
    nodesCounter++;
    return nodeNum;
};


const getNodeTemplate =  (nodeName,nodeType) => {
    return nodeName + '=>' + nodeType + ': ' + getNodeNum();
};

const createNewNode = (nodeType, isGreen) =>{

    let nodeName = 'node'+ nodesCounter;
    if(isGreen){
        greenNodes.push(nodeName);
    }
    connectNode(nodeName);
    nodesArr=[];
    nodes = nodes + getNodeTemplate(nodeName,nodeType);
    return nodeName;
};

const connectNode =(nodeName) => {
    for(let i=0;i<nodesArr.length;i++){
        edges = edges + nodesArr[i] + '->' + nodeName + '\n';
    }
};

const addContentToNode = (code) => {
    nodes = nodes+ escodegen.generate(code) + '\n';
};

const programCase = (code,isGreen) => {
    code.body.forEach((exp) =>{
        getCfgString(exp, isGreen);
    });
};

const functionCase = (code,isGreen) => {
    getCfgString(code.body, isGreen);
};

const blockCase = (code,isGreen) => {
    let nodeName = createNewNode('operation', isGreen);
    nodesArr.push(nodeName);
    code.body.forEach((exp) =>{
        getCfgString(exp, isGreen);
    });
    return [nodeName];
};

const varDecCase = (code/*,isGreen*/) => {
    addContentToNode(code);
    code.declarations.forEach((exp) => {
        if (exp.init != null) {
            localVars[exp.id.name] = parserForExpStatment(exp.init);
            localVars[exp.id.name] = checkSubt(localVars[exp.id.name],localVars);

        }
    });

};

const ifCase = (code, isGreen) => {
    let condtionNode = createNewNode('condition', isGreen);
    addContentToNode(code.test);
    let temp = checkSubt(code.test,localVars);
    let isTrue = checkColor(temp, myVector);
    nodesArr.push(condtionNode + '(yes)');
    let ifTrueNode = getCfgString(code.consequent, isTrue && isGreen);
    nodesArr = [];
    if (code.alternate != null) {
        nodesArr.push(condtionNode + '(no)');
        let connectToEnd2 = getCfgString(code.alternate, !isTrue && isGreen);
        ifTrueNode = ifTrueNode.concat(connectToEnd2);
    }
    else {
        ifTrueNode.push(condtionNode + '(no)');
    }
    nodesArr = ifTrueNode.slice();
    return ifTrueNode;
};

const returnCase = (code, isGreen) => {
    createNewNode('operation', isGreen);
    addContentToNode(code);
};

const seqCase = (code, isGreen) => {
    for (let i = 0; i < code.expressions.length; i++) {
        getCfgString(code.expressions[i], isGreen);
    }
};

const updateCase = (code/*, isGreen*/) => {
    addContentToNode(code);
};


const expStateCase = (code, isGreen) => {
    getCfgString(code.expression, isGreen);
};

const assignmentCase = (code/*, isGreen*/) => {
    /* if(code.left.type === 'MemberExpression') {
            return ArrayAssign(code);
        }else{*/
    /* let val = handleExp(code.right);
            savedVars[code.left.name] = handleExp(val);*/
//alert(localVars[code.left.name]);
    localVars[code.left.name]=checkSubt(parserForExpStatment(code.right),localVars);

    addContentToNode(code);
    /* }*/
};

const whileCase = (code, isGreen) => {
    let whileName = createNewNode('operation', isGreen);
    nodes = nodes + 'NULL' + '\n';

    let condName = createNewNode('condition', isGreen);
    addContentToNode(code.test);

    let bodyName = getCfgString(code.body, isGreen)[0];
    addWhileEdge(whileName, condName, bodyName);
    nodesArr = [];
    let temp = condName + '(no)';
    nodesArr.push(temp);
    return [temp];
};
const addWhileEdge = (whileName, condName, bodyName) => {
    edges = edges + whileName + '->' + condName + '\n';
    edges = edges + condName + '(yes, right)->' + bodyName + '\n';
    edges = edges + bodyName + '(right)->' + whileName + '\n';
};
    /*const ArrayAssign = (json) =>{
        let arr = savedVars[json.left.object.name];
        let val = handleExp(json.right);
        let index = handleExp(json.left.property);
        switch(arr.type){
            case 'ArrayExpression':  arr.elements[index.value] = val; break;
            case 'SequenceExpression': arr.expressions[index.value] = val; break;
        }
        savedVars[json.left.object.name] = arr;
        nodes += escodegen.generate(json) + '\n';
    };*/

    /*
    const createMyList = (parsedCode) => {
        for (var i = 0; i < parsedCode.body.length; i++) {
            switch(parsedCode.body[i].type){
            case('FunctionDeclaration'): funcDecParser(parsedCode.body[i]);break;
            default: traverseBodyFunc(parsedCode.body[i]);break;
            }
        }
        return table;
    };*/

    /*const traverseBodyFunc = (parsedCode) => {
        switch (parsedCode['type']) {
        case('VariableDeclaration') :  varDecParser( parsedCode); break;
        case('ReturnStatement') :  returnParser(parsedCode);break;
        case('ExpressionStatement') :  expStatement( parsedCode);break;
        default : complexCases(parsedCode);
        }
    };

    const complexCases = (parsedCode) => {
        switch (parsedCode['type']) {
        case('IfStatement') :  ifStatement( parsedCode,0);break;
        case('WhileStatement') :whileStatement(parsedCode, 0);break;
    /!*
        case('ForStatement') :forStatement(parsedCode, 0);break;
    *!/

        }
    };*/


    /*class lineOfTable {
        constructor(line, type, name, condition, value) {
            this.line = line;
            this.type = type;
            this.name = name;
            this.condition = condition;
            this.value = value;
        }
    }*/

    /*const addFunctionParams = (paramsList) => {
        var i;
        for (i=0; i<paramsList.length; i++){
            table.push(new lineOfTable(paramsList[i].loc.start.line,'variable declaration',paramsList[i]['name'],'',''));
        }
    };*/


    /*const funcDecParser = (funcDec) => {
        table.push(new lineOfTable(funcDec['id']['loc']['start']['line'], 'function declaration', funcDec['id']['name'], '', ''));
        addFunctionParams( funcDec['params']);
        var i;
        for (i = 0; i < funcDec['body']['body'].length; i++) {
            traverseBodyFunc(funcDec['body']['body'][i]);
        }
    };*/


    /*const varDecParser = (varDec) => {
        var i;
        for (i=0;i<varDec['declarations'].length;i++){
            var value='';
            if(varDec['declarations'][i]['init']!=null) {
                value = parserForExpStatment(varDec['declarations'][i]['init']);
            }
            table.push(new lineOfTable(varDec['declarations'][i]['id'].loc.start.line,'variable declaration',varDec['declarations'][i]['id']['name'],'',value));
        }


    };*/

    /*const returnParser = (retExp) => {
        table.push(new lineOfTable(retExp.loc.start.line,'return statement','','',parserForExpStatment(retExp['argument'])));

    };*/

    /*
    const expStatement = (expStatement) => {
        switch(expStatement['expression']['type']) {
        case('AssignmentExpression') :
            table.push(new lineOfTable(expStatement.loc.start.line, 'assignment expression', parserForExpStatment(expStatement['expression']['left']), '', parserForExpStatment(expStatement['expression']['right'])));break;
        case('UpdateExpression') :
            table.push(new lineOfTable(expStatement.loc.start.line, 'update expression', parserForExpStatment(expStatement['expression']['argument']), '', (parserForExpStatment(expStatement['expression']['argument'])+ ''+expStatement['expression']['operator'])));break;
        }
    };
    */

const parserForExpStatment = (exp) => {
    switch (exp['type']) {
    case('Identifier') :
        return exp['name'];
    case('Literal') :
        return exp['value'];
    default:
        return parserForComplexExpStatment(exp);
    }
};
    /*
    const handlePsik = (str,exp,i) =>{
        if(i!=exp.length-1)
            str=str+parserForExpStatment([i])+',';
        else
            str=str+parserForExpStatment(exp);
        return str;
    };
    const parserForArrayExpStatment = (exp)=> {
        switch (exp['type']) {
        case('MemberExpression') :{ if(exp['object']['name'].valueOf()=='*') return exp['property'];
            return exp['object']['name'] + '[' + parserForExpStatment(exp['property']) + ']';}
        case('ArrayExpression'): {
            let str='[';
            for(let i=0;i<exp.elements.length;i++){
                str=handlePsik(str,exp.elements[i],i);
            }
            str=str+']';
            return str;
        }
        }
    };
    */
const parserForComplexExpStatment = (exp) => {
    switch (exp['type']) {
    case('BinaryExpression') : {
        var left, right;
        left = needPartLeft(exp);
        right = needPartRight(exp);
        return left + ' ' + exp['operator'] + ' ' + right;
    }
   /* case('UnaryExpression'):
        return exp['operator'] + '' + parserForExpStatment(exp['argument']);*/

    }
};

    /*
    const task2 = (parsedCode,vector) => {

        for(var i=0;i<parsedCode.body.length;i++){
            switch(parsedCode.body[i].type){
            case('FunctionDeclaration'):{
                parsedCode.body[i] = sub(parsedCode.body[i],vector);

                break; }
            case('VariableDeclaration'):{
                vector[parsedCode.body[i].declarations[0].id.name]=parserForExpStatment(parsedCode.body[i].declarations[0].init);
                // alert(vector[parsedCode.body[i].declarations[0].id.name]);
                break;}
            }
        }
        return parsedCode;
    };

    const handleExpressionStatement = (exp,index,vector)=>{
        if(dict[exp.left.name]!=undefined) {
            linesToDelete.push(index);

            dict[exp.left.name] = checkIfContainLocalVarsForSimpleExpression(parserForExpStatment(exp.right), dict);
        }
        else{
            vector[exp.left.name]=checkIfContainLocalVarsForSimpleExpression(parserForExpStatment(exp.right), vector);
        }

    };
    const deletingLines =(parsedCode)=> {
        while (linesToDelete.length) {
            parsedCode.body.body.splice(linesToDelete.pop(), 1);
        }
        return parsedCode;
    };

    const handleIfStatement = (exp,index,vector)=> {
        exp.test = checkSubt(exp.test, dict);
        exp.consequent=handleConsequent(exp.consequent);
        checkColor(exp.test,vector);
        if (exp.alternate!=null&&exp.alternate.type.valueOf() == 'IfStatement') {
            exp.alternate.test = checkSubt(exp.alternate.test, dict);
            exp.alternate.consequent = handleConsequent(exp.alternate.consequent);
            exp.alternate.alternate = handleConsequent(exp.alternate.alternate);
            checkColor(exp.alternate.test,vector);
        }
        else if (exp.alternate!=null){
            exp.alternate=handleConsequent(exp.alternate);
        }
    };

    const handleWhileStatement = (exp) =>{
        exp.test = checkSubt(exp.test, dict);
        exp.body=handleConsequent(exp.body);

    };
    const doIfAndWhile= (exp,index,vector)=>{
        switch(exp.type) {
        case('IfStatement'): {
            handleIfStatement(exp, index, vector);
            break;
        }
        case('WhileStatement'): {
            handleWhileStatement(exp);
            break;
        }
        }
    };
    const sub = (parsedCode,vector) => {
        let funStatementsList = parsedCode.body.body;
        for(var i=0;i<funStatementsList.length;i++) {
            switch (funStatementsList[i].type) {
            case('ExpressionStatement'):{ handleExpressionStatement(funStatementsList[i].expression,i,vector);break;}
            case('VariableDeclaration'): {
                linesToDelete.push(i);
                dict[funStatementsList[i].declarations[0].id.name] = parserForExpStatment(funStatementsList[i].declarations[0].init);
                dict[funStatementsList[i].declarations[0].id.name] = checkSubt(parserForExpStatment(funStatementsList[i].declarations[0].init), dict);
                break;}
            default: doIfAndWhile(funStatementsList[i],i,vector);

            }}
        //delete the declarations lines
        parsedCode=deletingLines(parsedCode);
        return parsedCode;
    };
    */

const checkSubt = (exp, dict) => {
    switch (exp.type) {
    case('BinaryExpression'):
        exp = checkIfContainLocalVarsForBinaryExpression(exp, dict);
        break;
    case('Identifier'):
        exp.name = checkIfContainLocalVarsForSimpleExpression(exp.name, dict);
        break;
    /*case('Literal'):
        break;*/
    default:
        exp = checkIfContainLocalVarsForSimpleExpression(exp, dict);
        break;
    }
    return exp;
};

const checkIfContainLocalVarsForBinaryExpression = (binaryExp, dict) => {
    switch (binaryExp.left.type) {
    /* case('BinaryExpression') :
        binaryExp.left = checkIfContainLocalVarsForBinaryExpression(binaryExp.left, dict);
        break;*/
    case('Identifier') :
        binaryExp.left.name = checkIfContainLocalVarsForSimpleExpression(binaryExp.left.name, dict);
        break;    }
    //case('MemberExpression') :alert('ab'); binaryExp.left.object.name='*';binaryExp.left.property=checkSubt(parserForExpStatment(binaryExp.left),dict);break;
    switch (binaryExp.right.type) {
    case('BinaryExpression') :
        binaryExp.right = checkIfContainLocalVarsForBinaryExpression(binaryExp.right, dict);
        break;
    case('Identifier') :
        binaryExp.right.name = checkIfContainLocalVarsForSimpleExpression(binaryExp.right.name, dict);
        break;
            // case('MemberExpression') : binaryExp.right=checkIfContainLocalVarsForArray(binaryExp.right,dict);break;
    }
    return binaryExp;
};


const checkIfContainLocalVarsForSimpleExpression = (name, dict) => {
    for (var key in dict) {
        if (typeof name.valueOf() == 'string' && name.indexOf(key) > -1) {
            //let index = name.indexOf(key);
            /* if (typeof dict[key] == 'object') {
                let soger = name.indexOf(']');
                let poteach = name.indexOf('[');
                let stringToReplace = name.substring(index, soger + 1);
                let pos = name.substring(poteach + 1, soger);
                let value = dict[key][pos];
                name = name.replace(stringToReplace, value);
            }
            else {*/
            name = name.replace(key, '(' + dict[key] + ')');
            //   }
        }
    }
    return name;
};
    /*
    const handleConsequent = (exp) => {
        for(var key in dict){
            duplicateDict[key]=dict[key];
        }
        if(exp.type.valueOf()=='BlockStatement'){
            for(var i=0;i<exp.body.length;i++){
                exp.body[i]=handleSingleLine(exp.body[i],i);
            }
            //delete the declarations lines
            while(linesToDeleteInnerBlock.length) {
                exp.body.splice(linesToDeleteInnerBlock.pop(), 1);
            }
        }
        else{
            exp=handleSingleLine(exp);
        }
        linesToDeleteInnerBlock=[];
        duplicateDict={};
        return exp;
    };

    const handleUpdateExpression = (exp,line) =>{
        if(duplicateDict[exp.argument.name]!=undefined){
            linesToDeleteInnerBlock.push(line);
        }
    };

    const handleSingleLine = (exp,line) => {
        switch(exp.type){
        case('ExpressionStatement'):
        {
            if(exp.expression.type.valueOf()=='UpdateExpression'){
                handleUpdateExpression(exp.expression,line);return exp;
            }
            if(duplicateDict[exp.expression.left.name]!=undefined){
                linesToDeleteInnerBlock.push(line);
                duplicateDict[exp.expression.left.name]= checkIfContainLocalVarsForSimpleExpression(parserForExpStatment(exp.expression.right), duplicateDict);
            }
            else{
                exp.expression.right=checkSubt(exp.expression.right,duplicateDict);
            }break; }

        case('ReturnStatement'):{
            exp.argument= checkSubt(exp.argument,duplicateDict);
            break; }
        }
        return exp;
    };
    */
const checkColor = (exp, vector) => {
    var temp = JSON.parse(JSON.stringify(exp));
    var newLeft, newRight;
    var leftSide, rightSide;
    //   if(temp.left.type.valueOf()=='MemberExpression'){
    //   newLeft=checkSubt(parserForExpStatment(temp.left),vector);leftSide=eval(newLeft);}
    //  else{
    newLeft = checkSubt(temp.left, vector);
    leftSide = eval(parserForExpStatment(newLeft));
    //}
    /*if(temp.right.type.valueOf()=='MemberExpression') {
            newRight=checkSubt(parserForExpStatment(temp.right),vector);
            rightSide=eval(newRight);}*/
    //else {
    newRight = checkSubt(temp.right, vector);
    rightSide = eval(parserForExpStatment(newRight));
    //}
    var isTrue = (eval(leftSide + exp.operator + rightSide));
    return isTrue;
};
    /*
    /*
    const checkIfContainLocalVars = (simpleExp,dict) => {
        for(var key in dict){
            if( typeof simpleExp.valueOf()=='string'&&simpleExp.indexOf(key) > -1){
                simpleExp=simpleExp.replace(key,dict[key]);
            }
        }
        return simpleExp;
    }
    */
    /*
    const checkForStatement = (ifState,parsedCode,dict)=> {
        if(ifState.test.type.valueOf()=='BinaryExpression'){
            ifState.test.left
        }
    };
    */


    /*const ifStatement = (ifStatementExp,flag) => {
        if(flag.valueOf()=='on'.valueOf()) {
            table.push(new lineOfTable(ifStatementExp.loc.start.line, 'else if statement', '', parserForExpStatment(ifStatementExp['test']), ''));
        }
        else {
            table.push(new lineOfTable(ifStatementExp.loc.start.line, 'if statement', '', parserForExpStatment(ifStatementExp['test']), ''));
        }
        if(ifStatementExp['consequent']['type'].valueOf()!='BlockStatement'.valueOf())
            traverseBodyFunc(ifStatementExp['consequent']);
        else{
            var i;
            for(i=0;i<ifStatementExp['consequent']['body'].length;i++){
                traverseBodyFunc(ifStatementExp['consequent']['body'][i]);
            }
        }
        alterAnalize(ifStatementExp);};*/

    /*const alterAnalize = (ifStatementExp)=>{
        if(ifStatementExp.alternate==null) return;
        if(ifStatementExp.alternate.type.valueOf()!='IfStatement'.valueOf()){
            table.push(new lineOfTable(ifStatementExp.alternate.loc.start.line-1, 'else statement', '', '', ''));

            if(ifStatementExp['alternate']['type'].valueOf()!='BlockStatement'.valueOf())
                traverseBodyFunc(ifStatementExp['alternate']);
            else{
                var j;
                for(j=0;j<ifStatementExp['consequent']['body'].length;j++){
                    traverseBodyFunc(ifStatementExp['consequent']['body'][j]);
                }
            }
        }
        else{
            ifStatement(ifStatementExp.alternate,'on');
        }
    };*/

    /*const whileStatement = (whileStatementExp) => {
        table.push(new lineOfTable(whileStatementExp.loc.start.line,'while statement','',parserForExpStatment(whileStatementExp['test']),''));
        if (whileStatementExp.body.type.valueOf()!='BlockStatement'.valueOf()){
            traverseBodyFunc(whileStatementExp['body']);
        }
        else{
            var i;
            for(i=0;i<whileStatementExp['body']['body'].length;i++){
                traverseBodyFunc(whileStatementExp['body']['body'][i]);
            }

        }
    };*/
    /*const forStatement = (forStatementExp) => {
        var init = '', test = '', update = '';
        //alert(forStatementExp['init']['declarations'][0]['id']['name']);
        if(forStatementExp['init']['type'].valueOf()=='VariableDeclaration'.valueOf()) init = 'let ' +forStatementExp['init']['declarations'][0]['id']['name'] /!*parserForExpStatment(forStatementExp['init']['declarations'][0]['id']['name'])*!/  + '=' +forStatementExp['init']['declarations'][0]['init']['value']/!*parserForExpStatment(forStatementExp['init']['declarations'][0]['init']['value'])*!/;
        else
        if (forStatementExp.init != null) init = parserForExpStatment(forStatementExp['init']['left']) + '=' + parserForExpStatment(forStatementExp['init']['right']);
        if (forStatementExp.test != null) test = parserForExpStatment(forStatementExp['test']);
        if (forStatementExp.update == null) update = null;
        else if (forStatementExp['update']['type'].valueOf() == 'UpdateExpression'.valueOf())
            update = parserForExpStatment(forStatementExp['update']['argument']) + '' + forStatementExp['update']['operator'];
        else
            update = parserForExpStatment(forStatementExp['update']['left']) + '=' + parserForExpStatment(forStatementExp['update']['right']);
        table.push(new lineOfTable(forStatementExp.loc.start.line, 'for statement', '', init + ';' + test + ';' + update, ''));
        addForBody(forStatementExp);
    };*/
    /*const addForBody = (forStatementExp) => {
        if (forStatementExp.body.type.valueOf()!='BlockStatement'.valueOf()){
            traverseBodyFunc(forStatementExp['body']);
        }
        else{
            var i;
            for(i=0;i<forStatementExp['body']['body'].length;i++){
                traverseBodyFunc(forStatementExp['body']['body'][i]);
            }
        }
    };*/

const needPartLeft = (exp) => {
    return exp['left']['type'].valueOf() == 'BinaryExpression'.valueOf() ? '(' + parserForExpStatment(exp['left']) + ')' : parserForExpStatment(exp['left']);
};
const needPartRight = (exp) => {
    return exp['right']['type'].valueOf() == 'BinaryExpression'.valueOf() ? '(' + parserForExpStatment(exp['right']) + ')' : parserForExpStatment(exp['right']);
};
