const fs = require('fs');
const term = require( 'terminal-kit' ).terminal;
const writeGood = require('write-good');
const yargs = require('yargs');
const {Nodehun} = require('nodehun');
const affbuf = fs.readFileSync('en_US.aff');
const dictbuf = fs.readFileSync('en_US.dic');
const nodehun = new Nodehun(affbuf, dictbuf)
const Player = require('./Player');
const {calculateScore, test, matrixConcat, rerollMax, rollD6, getKeyTotal} = require('./utils');

let rawdata = fs.readFileSync('data.json');
let data = JSON.parse(rawdata);
let player;
term.clear() ;
let history = [] ;
let autoComplete = [] ;

async function confirm(question = 'confirm your selection') {
	term( '\nDo you %s? [Y|n]\n', question ) ;
	return await term.yesOrNo( { yes: [ 'y' , 'ENTER' ] , no: [ 'n' ] }  ).promise;
}

async function selection(what, items, desc){
    let answer = '';
    do {
        term( '\nSelect %s: ', what);
        answer = await term.singleColumnMenu( items ).promise;
        term.blue( "\nSelected '%s'\n" , answer.selectedText ) ;
        term.wrap.green( "\n%s\n",desc[answer.selectedText].desc) ;
        term.cyan( "\n%s\n",desc[answer.selectedText].detail) ;
    } while (!await confirm());
    return answer.selectedText;
}

function printDice(die){
    die.forEach(r => term.yellow('%s\n',r));
}

function printAllDice(results){
    let matrixAscii = results.map(x =>  data.dice[x]).reduce(matrixConcat, data.dice[0]);
    printDice(matrixAscii);
}

function testReroll(scene,test){
    return data.scenarios[scene].reroll.includes(test);
}

async function rollDice(n, name, scene){
    term.yellow('\nTest %s\n',name.replace(/^./, name[0].toUpperCase()));
    let results = Array.apply(null, Array(n)).map( _ =>  rollD6());
    if (testReroll(scene, name)){
        results = rerollMax(results)
    }
    printAllDice(results);
    max = Math.max(...results);
    esito = test(max);
    term.yellow('Result: %s %s\n',max, esito ? 'success' : 'failure')
    if(!esito && player.target === name && !player.usedSkill){
        let skill = await confirm(`whish to Use ${player.skill}`);
        if (skill){
            let extra = rollD6();
            results.push(extra);
            max = Math.max(...results);
            esito = test(max);
            printDice(data.dice[extra]);
            player.usedSkill = true;
            term.yellow('\nResult: %s %s\n',max, esito ? 'success' : 'failure')
        }
    }
    return esito;
}

async function checkText(input){
    let suggestions = writeGood(input, data.writeGood) || [];
    term('\n');
    var regExp = /(\w+)/g;
    let words = input.match(regExp);
    for(let i = 0; i < words.length; i++){
        let suggest = await nodehun.suggest(words[i]);
        if(suggest) {
            suggestions.push({reason: `Word '${words[i]}' not recognized. Suggestions: ${suggest}`});
        }
    }
    if(suggestions.length === 0){
        term.red('No Suggestions available.\n');
        } else {
        suggestions.forEach(s => term.red('- %s\n',s.reason));
    }
}

async function paragraph(n, scene, selected){
    if(await confirm('want to clear the screen')){
        term.clear();
    }
    term.red( '\n\n** Starting New Paragraph ** \n') ;
    let flourish = await confirm('whish to Use Flourishes');
    let heart = false;
    if (flourish){
        heart = await rollDice(player.heart, 'heart', scene)
    }
    let language = await rollDice(player.language, 'language', scene)
    let type = language ? 'Superior' : 'Inferior';
    let words = data.scenarios[scene].InkPot.map(e => e[type]).filter(w => !selected.includes(w) )
    term( '\nSelect the Word from the Ink Pot: \n');
    let word = await term.singleColumnMenu( words ).promise;
    autoComplete.push(word.selectedText);
    //autoComplete.push(word.selectedText.replace(/^\w/, function (chr) {
    //    return chr.toLowerCase();
    //}));
    var marked = data.scenarios[scene].InkPot.filter(obj => {
        return obj[type] === word.selectedText
    })
    selected.push(marked[0]['Superior']);
    selected.push(marked[0]['Inferior']);
    let augment = flourish && heart ? ' - Flourished' :'';
    let step = {selectedText:"Cancel"};
    let input = "";
    do {
        switch(step.selectedText){
            case "Profile":
                data.scenarios[scene].Profile.forEach(e => term.green('%s\n',e))
                break;
            case "Suggestions":
                await checkText(input);
                break;
            default:
                term.blue('\n\nInk Pot word: "%s" (%s%s)', word.selectedText, type, augment );
                term.red( '\nParagraph %s: \n',n ) ;
                input = await term.inputField(
                    { history: history , autoComplete: autoComplete , autoCompleteMenu: true }
                ).promise ;
                history.push(input);
                break;
        }
        term('\n\nParagraph completed?');
        step = await term.singleColumnMenu( data.scene ).promise;
    }while(step.selectedText !== "Continue")
    term('\n');
    let penmanship = await rollDice(player.penmanship, 'penmanship', scene)
    let bonus = 0;
    if(data.scenarios[scene].hasOwnProperty('code') && data.scenarios[scene].code){
        term.yellow('Extra Test Scenario\n');
        let extraPenmanship = await rollDice(player.penmanship, 'penmanship', scene)
        bonus += extraPenmanship ? 2 : -2;
    } 
    let score = calculateScore(flourish, heart, language, penmanship, bonus);
    term.red("Score:", score)
    player.total += score;
    return input;
}

function finalLetter(letter, scene){
    term.blue(`\nPlayer: ${player}`);
    term.blue('\nYour letter:\n\n');
    letter.forEach(p => term.green('%s\n\n',p));
    term.red('\nTotal score: %s\n', player.total);
    term.blue('Consequences\n')
    let key = getKeyTotal(data.scenarios[scene].Consequences, player.total);
    term.green('%s\n\n',data.scenarios[scene].Consequences[key])
    let date = new Date();
    let ts = [
        date.getFullYear(),
        date.getMonth()+1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
     ].join('');
    var dir = './letters';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    let filename =  `${dir}/${scene}_${player.character}_${ts}.md`
    fs.writeFile(filename.replace(/\s/g,''), [ 
        `# ${scene}`, 
        `> ${player.character}`, 
        '\n## Profile\n', 
        ...data.scenarios[scene].Profile.map(e => `* ${e.substring(2)}`),
        '\n## Correspondence\n', 
        ...letter,
        '\n## Consequences\n', 
        data.scenarios[scene].Consequences[key]
    ].join('\n'), function (err) {
        if (err) throw err;
    });
}

async function scenario(){
    let answer = '';
    do {
        autoComplete = [];
        term( '\nSelect the Scenario: ');
        answer = await term.singleColumnMenu( Object.keys(data.scenarios) ).promise;
        term.blue( "\nSelected '%s'\n" , answer.selectedText ) ;
        term.cyan('\nProfile\n\n');
        data.scenarios[answer.selectedText].Profile.forEach(p => term.green('%s\n',p));
        term.cyan('\n\nRules of Correspondence\n\n');
        data.scenarios[answer.selectedText].Rules.forEach(p => term.green('%s\n',p));
        term.cyan('\n');
    } while (!await confirm());
    return answer.selectedText;
}

async function session(){
    let usedWords = [];
    let letter = ["","","","", ""];
    let character = await selection('character', data.characters, data.description);
    let skill = await selection('skill', data.skills, data.description);
    let scene = await scenario();
    player = new Player(character, skill, data, scene);
    term.blue(`\nPlayer created: ${player}\n`);
    let i;
    for (i = 0; i < letter.length; i++) {
       letter[i] = await paragraph(i+1, scene, usedWords);
    }
    finalLetter(letter, scene);
}

async function main(){
    term.cyan('');
    term.cyan('      ____       _ _ _ \n');
    term.cyan('     /___ \\_   _(_) | |\n');
    term.cyan('    //  / / | | | | | |\n');
    term.cyan('   / \\_/ /| |_| | | | |\n');
    term.cyan('   \\___,_\\ \\__,_|_|_|_|\n\n');
    term.wrap.cyan('A letter-writing roleplaying game for a single player\n\n');
    term.wrap.blue('Rules Summary\n');
    term.wrap.cyan('❖ Select a character, skill and scenario.\n');
    term.wrap.cyan('❖ Read the Profile and Rules of Correspondence.\n');
    term.wrap.cyan('❖ (Optional) Use Flourishes to augment words.\n');
    term.wrap.cyan('❖ Write your letter using one Ink Pot word per paragraph. \n');
    term.wrap.cyan('❖ Use a skill once per scenario.\n');
    term.wrap.cyan('❖ The letter ends after the fifth paragraph.\n\n');
    while(await confirm('want to play')){
        await session();
    }
    process.exit();
}

const argv = yargs
    .option('classic', {
        alias: 'c',
        description: 'Start a Classic game of Quill',
        type: 'boolean',
    })
    .help()
    .alias('help', 'h')
    .argv;/*
    .option('dwarves', { // to-do
        alias: 'd',
        description: 'Start a Coal & Parchmen game of Quill',
        type: 'boolean',
    })
    .option('quest', { // to-do
        alias: 'q',
        description: 'Start a Quest game of Quill',
        type: 'boolean',
    })
    .option('whitebox', { // to-do
        alias: 'w',
        description: 'Start a White-Box game of Quill',
        type: 'boolean',
    })*/

//if (argv.classic) {
//    main();
//}

function terminate() {
    term.clear();
    term.grabInput( false ) ;
	setTimeout( function() { process.exit() } , 100 ) ;
}

term.on( 'key' , function( name , matches , data ) {
	if ( name === 'CTRL_C' ) { 
        terminate() ; 
    }
} ) ;

main();