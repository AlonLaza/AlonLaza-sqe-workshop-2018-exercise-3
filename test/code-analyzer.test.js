import assert from 'assert';
import {checkparseCode, checkSubt, parseStringNodes,parseCode} from '../src/js/code-analyzer';
import * as escodegen from 'escodegen';
import * as esprima from 'esprima';

describe('The javascript parser', () => {
    let vector = {'x':1,'y':2,'z':3};
    let subCode = 'x';
    let subCode2 = 'x+a+1';
    let subCode3 = '1';
    let subCode4 = '(1+a)+2';


    let code =
        'function foo(x, y, z){\n' +
        '    let a = x + 1;\n' +
        '    let b = a + y;\n' +
        '    let c = 0;\n' +
        '    \n' +
        '    if (b < z) {\n' +
        '        c = c + 5;\n' +
        '    } else if (b < z * 2) {\n' +
        '        c = c + x + 5;\n' +
        '    } else {\n' +
        '        c = c+z+5;\n' +
        '    }\n' +
        '\n' +
        ' while (a < z) {\n' +
        '       a++,b++;\n' +
        '   }\n' +
        '    if (b < z) {\n' +
        '        c = c + 5;\n' +
        '    }\n' +
        '    return c;\n' +
        '}\n'
    ;

    let parsedCode = parseCode(code);
    let nodesParsedCode = parseStringNodes(parsedCode, vector);
    let nodesParsedCodeAsArray = nodesParsedCode.split('\n');




    /* let afterParsedCode =
         parseCode('let t=5;\n' +
             'function foo(x, y, z, w){\n' +
             '    let a = x + 1;\n' +
             '    let b = a + y;\n' +
             '    let c = 0;\n' +
             '    while(x<2){\n' +
             '\ta++;\n' +
             '\t}\n' +
             '    if (b < z) {\n' +
             '        c = c + 5;\n' +
             '        return x + y + z + c;\n' +
             '    } else if (b < z * 2) {\n' +
             '        c = c + x + 5;\n' +
             '        return x + y + z + c;\n' +
             '    } else {\n' +
             '        c = c + z + 5;\n' +
             '        return x + y + z + c;\n' +
             '    }\n' +
             '}');
     let output= task2(afterParsedCode,vector);
     let lines=(escodegen.generate(output)).split('\n');*/


    it('check the subtituion method for simpleExp', () => {
        assert.equal(
            checkSubt(subCode,vector),
            '(1)'
        );
    });

    it('check the subtituion method for binaryExp', () => {
        assert.equal(
            checkSubt(subCode2,vector),
            '(1)+a+1'
        );
    });

    it('check the subtituion method for binaryExp', () => {
        assert.equal(
            checkSubt(subCode3,vector),
            '1'
        );
    });

    it('check the subtituion method for leftBinaryExp', () => {
        assert.equal(
            checkSubt(subCode4,vector),
            '(1+a)+2'
        );
    });




    it('check the parser function1', () => {
        assert.equal(
            nodesParsedCodeAsArray[0],
            'st=>start: Start'
        );
    });

    it('check the parser function2', () => {
        assert.equal(
            nodesParsedCodeAsArray[1],
            'node1=>operation: #1'
        );
    });

    it('check the parser function3', () => {
        assert.equal(
            nodesParsedCodeAsArray[2],
            'let a = x + 1;'
        );
    });

    it('check the parser function4', () => {
        assert.equal(
            nodesParsedCodeAsArray[3],
            'let b = a + y;'
        );
    });

    it('check the parser function5', () => {
        assert.equal(
            nodesParsedCodeAsArray[4],
            'let c = 0;|green'
        );
    });

    it('check the parser function6', () => {
        assert.equal(
            nodesParsedCodeAsArray[5],
            'node2=>condition: #2'
        );
    });

    /*it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });*/
});

