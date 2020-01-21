class Player {
    constructor(character, skill, data, scene) {
        this.character = character;
        this.skill = skill;

        let dataSkill = data.description[skill].detail;
        
        this.target = dataSkill.match(/to a ([\w]+) Test/i)[1].toLowerCase();
        this.skill_type = dataSkill.match(/^([\w]+) /i)[1].toLowerCase();

        let dataChar = data.description[character].detail;

        this.penmanship= data.attribute[dataChar.match(/penmanship: ([\w]+)/i)[1]];
        this.language = data.attribute[dataChar.match(/language: ([\w]+)/i)[1]];
        this.heart = data.attribute[dataChar.match(/heart: ([\w]+)/i)[1]];

        this.temp_bonus = 0;
        this.total = 0;
        console.log(scene)
        let bonus = data.scenarios[scene].bonus;
        if(bonus.hasOwnProperty('All')){
            this[bonus.All] += 1;
        }
        if (Object.keys(bonus).includes(character)){
            this[bonus[character]]+=1;
        }
        if(data.scenarios[scene].hasOwnProperty('noskills')){
            this.usedSkill = data.scenarios[scene].noskills;
        } else {
            this.usedSkill = false;
        }

        this.extra_word = false;
        this.extra_flourish = false;
    }
    toString() {
        return `${this.character} - ${this.skill}`;
    }
}


module.exports = Player;