class Player {
    constructor(character, skill, data, scene) {
        this.character = character;
        this.skill = skill;

        let dataSkill = data.description[skill].detail;
        
        this.target = dataSkill.match(/dice to a ([\w]+) Test/i)[1].toLowerCase();
        this.usedSkill = false;

        let dataChar = data.description[character].detail;

        this.penmanship= data.attribute[dataChar.match(/penmanship: ([\w]+)/i)[1]];
        this.language = data.attribute[dataChar.match(/language: ([\w]+)/i)[1]];
        this.heart = data.attribute[dataChar.match(/heart: ([\w]+)/i)[1]];

        this.total = 0;
        console.log(scene)
        let bonus = data.scenarios[scene].bonus;
        if(bonus.hasOwnProperty('All')){
            this[bonus.All] += 1;
        }
        if (Object.keys(bonus).includes(character)){
            this[bonus[character]]+=1;
        }
    }
    toString() {
        return `${this.character} - ${this.skill}`;
    }
}


module.exports = Player;