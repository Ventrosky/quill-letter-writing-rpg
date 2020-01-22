const assert = require('assert');

const {calculateScore} = require('../utils');


describe('Score Points', function() {
    let flourish = true;
    let heart = true;
    let language = true;
    let penmanship = true;
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
        it('A successful Penmanship test is worth 1 point.', function() {
            assert.equal(calculateScore(!flourish, !heart, !language, !penmanship), 0);
            assert.equal(calculateScore(!flourish, !heart, !language, penmanship), 1);
        });
    });
    describe('A Superior Word is worth 1 point.', function() {
        it('A successful Penmanship test is worth 1 point.', function() {
            assert.equal(calculateScore(!flourish, !heart, language, !penmanship), 1);
            assert.equal(calculateScore(!flourish, !heart, !language, !penmanship), 0);
        });
    });
});