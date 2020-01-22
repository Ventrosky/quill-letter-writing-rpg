
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

function rerollMax(results){
    let i = results.indexOf(Math.max(...results));
    results[i] = Math.floor(Math.random() * 6)+1;
    return results;
}

function rollD6(){
    return Math.floor(Math.random() * 6)+1;
}

function totalToKey(total){
    let key = "";
    if(total < 5){
        key = "Less than 5 points";
    }else if(total >= 5 && total <= 7){
        key = "5 to 7 points";
    }else if(total >= 8 && total <= 10){
        key = "8 to 10 points";
    }else{
        key = "11+ points";
    }
    return key;
}


module.exports = { 
    calculateScore, 
    test,
    matrixConcat,
    rerollMax,
    rollD6,
    totalToKey
 };