const assert = require('assert');

const {calculateScore, getKeyTotal, randomRange} = require('../utils');


describe('Score Points', function() {
    let flourish = true;
    let heart = true;
    let language = true;
    let penmanship = true;
    let consequences = {
        "-4": "The letter is received unsuccessfully. There will be negative consequences.",
        "5-7": "The letter has a tepid reception. There will be negative and positive consequences.",
        "8-10": "The letter has a favourable reception. There will be positive consequences.",
        "11+": "The letter has an excellent reception. There will be very positive consequences."
    };



    describe('Flourish words', function() {
        it('A Flourished Superior Word is worth 2 points', function() {
            assert.equal(calculateScore(flourish, heart, language, !penmanship), 2);
            assert.equal(calculateScore(flourish, heart, language, penmanship), 3);
        });
        it('A Flourished Inferior Word reduces your final points total by 1', function() {
            assert.equal(calculateScore(flourish, heart, !language, penmanship), 0);
            assert.equal(calculateScore(flourish, heart, !language, !penmanship), -1);
        });
    });
    describe('Penmanship test', function() {
        it('A successful Penmanship test is worth 1 point', function() {
            assert.equal(calculateScore(!flourish, !heart, !language, !penmanship), 0);
            assert.equal(calculateScore(!flourish, !heart, !language, penmanship), 1);
        });
    });
    describe('A Superior Word is worth 1 point', function() {
        it('A successful Penmanship test is worth 1 point', function() {
            assert.equal(calculateScore(!flourish, !heart, language, !penmanship), 1);
            assert.equal(calculateScore(!flourish, !heart, !language, !penmanship), 0);
        });
    });
    describe('Scoring shows how the recipient responds', function() {
        it('Each consequence will be different', function() {
            assert.equal(getKeyTotal(consequences, 0), "-4");
            assert.equal(getKeyTotal(consequences, 1), "-4");
            assert.equal(getKeyTotal(consequences, 2), "-4");
            assert.equal(getKeyTotal(consequences, 3), "-4");
            assert.equal(getKeyTotal(consequences, 4), "-4");
            assert.equal(getKeyTotal(consequences, 5), "5-7");
            assert.equal(getKeyTotal(consequences, 6), "5-7");
            assert.equal(getKeyTotal(consequences, 7), "5-7");
            assert.equal(getKeyTotal(consequences, 8), "8-10");
            assert.equal(getKeyTotal(consequences, 9), "8-10");
            assert.equal(getKeyTotal(consequences, 10), "8-10");
            assert.equal(getKeyTotal(consequences, 11), "11+");
            assert.equal(getKeyTotal(consequences, randomRange(0,4)), "-4");
            assert.equal(getKeyTotal(consequences, randomRange(5,7)), "5-7");
            assert.equal(getKeyTotal(consequences, randomRange(8,10)), "8-10");
            assert.equal(getKeyTotal(consequences, randomRange(11,25)), "11+");
        });
    });
});

/*
When you have finished your letter, total up your Letter Score.
Each scenario will have its own consequences section when it
comes to scoring, showing how the recipient responds to your
letter. Each consequence will be different depending on the
scenario, but the scoring is always the same:

Less than 5 points: 

5 to 7 points: 
8 to 10 points: The letter has a favourable reception. There will
be positive consequences.
11+ points: The letter has an excellent reception. There will be
very positive consequences.
*/