
function calculateScore(flourish, heart, language, penmanship, bonus = 0){
    let score = (language ? 1 : 0) + (penmanship ? 1 : 0) + bonus;
    if (flourish && heart){
        score += (language ? 1 : -1)
    }
    return score;
}

const test = (n) => n >= 5;

function matrixConcat(a, b){
    return a.map(function(n, i){
        return n.concat(b[i]);
    });
}

function randomRange(min, max){
    return  Math.floor(Math.random() * (max - min) + min);
}

function rollD6(){
    return randomRange(1,6);
}

function rerollMax(results){
    let i = results.indexOf(Math.max(...results));
    results[i] = rollD6();
    return results;
}

function getKeyTotal(object, roll){
    let keys = Object.keys(object);
    let i = 0;
    for (i = 0; i < keys.length; i++) {
        if (keys[i] == "Dice") continue;
        let key = keys[i];
        let delims = key.split("-");
        if(delims.length == 2){
            if(delims[0] == ""){ 
                if(roll <= delims[1]) return key;
            }
            else{ 
                if(roll >= delims[0] && roll <= delims[1]) return key;
            }
        }
        else if(delims.length == 1){
            if(delims[0].includes("+")){
                if (roll >= parseInt(delims[0].replace("+",""))) return key;
            }
            else if(roll == parseInt(delims[0]))  return key; 
        }
    }
    return "";
}



module.exports = { 
    calculateScore, 
    test,
    matrixConcat,
    rerollMax,
    randomRange,
    rollD6,
    getKeyTotal
 };