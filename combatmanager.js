class CombatManager {
    constructor() {
        this.combats = [];
        this.teamOne = {
            alive: PARAMS.bandSize,
            dead: 0,
            fleeing: 0
        }
        this.teamTwo = {
            alive: PARAMS.bandSize,
            dead: 0,
            fleeing: 0
        }

    }

    reset() {
        this.teamOne = {
            alive: PARAMS.bandSize,
            dead: 0,
            fleeing: 0
        }
        this.teamTwo = {
            alive: PARAMS.bandSize,
            dead: 0,
            fleeing: 0
        }
    }

    flee(team) {
        if(team) {
            this.teamOne.fleeing++;
        } else {
            this.teamTwo.fleeing++;
        }
    }

    dead(team) {
        if(team) {
            this.teamOne.dead++;
            this.teamOne.alive--;
        } else {
            this.teamTwo.dead++;
            this.teamTwo.alive--;
        }
    }

    update() {    
        shuffleArray(this.combats);

        for(let i = 0; i < this.combats.length; i++) {
            let combat = this.combats[i];
            if(!combat[0].removeFromWorld && !combat[1].removeFromWorld) {
                let loser = randomInt(2);
                combat[loser].hit();
            }
        }

        this.combats = [];
    }
    
    draw(ctx) {
        this.drawTeamBars(ctx, this.teamOne, 800, 0, "Red");
        this.drawTeamBars(ctx, this.teamTwo, 800, 60, "Blue");
    }

    drawTeamBars(ctx, team, startX, startY, borderColor) {
        const barHeight = 10;
        const barSpacing = 5;
        const barWidth = 200;
        const totalSize = PARAMS.bandSize;

        // Draw border rectangle
        ctx.strokeStyle = borderColor;
        ctx.strokeRect(startX - barSpacing * 0.5, startY, barWidth + barSpacing, 3 * barHeight + barSpacing * 3);

        // Draw alive bar
        this.drawBar(ctx, startX, startY + barSpacing * 0.5, barWidth, barHeight, team.alive, totalSize, "Lightgreen", "Alive");

        // Draw dead bar
        this.drawBar(ctx, startX, startY + barHeight + barSpacing * 1.5, barWidth, barHeight, team.dead, totalSize, "Lightgrey", "Dead");

        // Draw fleeing bar
        this.drawBar(ctx, startX, startY + barHeight * 2 + barSpacing * 2.5, barWidth, barHeight, team.fleeing, totalSize, "Pink", "Fleeing");
    }

    drawBar(ctx, x, y, width, height, value, totalSize, color, label) {
        const barLength = (value / totalSize) * width;

        // Draw the bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barLength, height);

        // Draw the label
        ctx.fillStyle = "Black";
        ctx.fillText(`${label}: ${value}`, x + 5, y + height / 2 + 3);
    }
};








