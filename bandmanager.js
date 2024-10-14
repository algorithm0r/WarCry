// BandManager.js

class BandManager {
    constructor() {
        this.bands = [];
        this.bandIndex = 0;
        this.currentBand1 = null;
        this.currentBand2 = null;

        this.zGenes = this.zeroGenes();
        this.pGenes = this.presetGenes();

        for (let i = 0; i < PARAMS.numBands; i++) {
            this.bands.push(this.createBand(2));
        }
    }

    presetGenes() {
        let genes = [];

        genes.push(new RealGene({ value: 0 })); // cohesionRadius
        genes.push(new RealGene({ value: 0 })); // alignmentRadius
        genes.push(new RealGene({ value: 0 })); // separationRadius
        genes.push(new RealGene({ value: 0.25 })); // chargeRadius
        genes.push(new RealGene({ value: 0.25 })); // fleeRadius

        genes.push(new RealGene({ value: 0 })); // cohesionWeight
        genes.push(new RealGene({ value: 0 })); // alignmentWeight
        genes.push(new RealGene({ value: 0 })); // separationWeight
        genes.push(new RealGene({ value: 1 })); // chargeWeight
        genes.push(new RealGene({ value: 1 })); // fleeWeight

        return genes;
    }

    zeroGenes() {
        let genes = [];
        for (let i = 0; i < 10; i++) {
            genes.push(new RealGene({ value: 0 }));
        }
        return genes;
    }

    randomGenes() {
        let genes = [];
        for (let i = 0; i < 10; i++) {
            genes.push(new RealGene());
        }
        return genes;
    }

    createBand(loadStyle) {
        let band = [];

        if (loadStyle === 0) {
            // Zero genes
            let warrior = new Warrior({ genes: this.zGenes });
            warrior.mutate();
            for (let i = 0; i < PARAMS.bandSize; i++) {
                band.push(warrior);
                warrior = new Warrior(warrior);
                warrior.mutate();
            }
        } else if (loadStyle === 1) {
            // Random genes
            let warrior = new Warrior({ genes: this.randomGenes() });
            warrior.mutate();
            for (let i = 0; i < PARAMS.bandSize; i++) {
                band.push(warrior);
                warrior = new Warrior(warrior);
                warrior.mutate();
            }
        } else {
            // Preset genes
            let warrior = new Warrior({ genes: this.pGenes });
            warrior.mutate();
            for (let i = 0; i < PARAMS.bandSize; i++) {
                band.push(warrior);
                warrior = new Warrior(warrior);
                warrior.mutate();
            }
        }

        return band;
    }

    prepareBandsForCombat(band1, band2) {
        this.currentBand1 = band1;
        this.currentBand2 = band2;

        gameEngine.entities = [];

        for (let i = 0; i < band1.length; i++) {
            band1[i].reset(true);
            gameEngine.addEntity(band1[i]);
        }

        for (let i = 0; i < band2.length; i++) {
            band2[i].reset(false);
            gameEngine.addEntity(band2[i]);
        }
    }

    combatOver() {
        let ents = gameEngine.entities;
        if (ents.length === 0) return true;
        let team = ents[0].team;
        for (let ent of ents) {
            if (ent.team !== team) return false;
        }
        return true;
    }

    update() {
        if (this.combatOver()) {
            // Evolutionary process
            this.evolveBands();

            gameEngine.combatManager.reset();
            this.prepareBandsForCombat(
                this.bands[this.bandIndex++],
                this.bands[this.bandIndex++]
            );
            this.bandIndex %= this.bands.length;
        }
    }

    // Added by Reis
    evolveBands() {
        // Collect surviving warriors
        let survivingWarriors = gameEngine.entities;

        // Separate them into two teams
        let survivingBand1 = survivingWarriors.filter(
            (warrior) => warrior.team === true
        );
        let survivingBand2 = survivingWarriors.filter(
            (warrior) => warrior.team === false
        );

        // Now process currentBand1 and currentBand2
        let totalBandSize = PARAMS.bandSize;

        // Process Band1
        let newBand1 = this.generateNewBand(
            this.currentBand1,
            survivingBand1,
            true
        );

        // Process Band2
        let newBand2 = this.generateNewBand(
            this.currentBand2,
            survivingBand2,
            false
        );

        // Update bands
        let index1 = this.bands.indexOf(this.currentBand1);
        let index2 = this.bands.indexOf(this.currentBand2);

        this.bands[index1] = newBand1;
        this.bands[index2] = newBand2;
    }

    // Added by Reis, change logic to have parents survive
    generateNewBand(oldBand, survivingWarriors, team) {
        let newBand = [];

        let numSurvivors = survivingWarriors.length;
        let numDead = PARAMS.bandSize - numSurvivors;

        // If there are no survivors, generate random new warriors
        if (numSurvivors === 0) {
            for (let i = 0; i < PARAMS.bandSize; i++) {
                let warrior = new Warrior();
                warrior.mutate();
                warrior.team = team;
                newBand.push(warrior);
            }
            return newBand;
        }

        // Clone surviving warriors
        for (let warrior of survivingWarriors) {
            let clone = new Warrior(warrior);
            clone.team = team;
            newBand.push(clone);
        }

        // Generate new warriors to replace the dead ones
        for (let i = 0; i < numDead; i++) {
            // Randomly select two parents from surviving warriors
            let parent1 = survivingWarriors[randomInt(numSurvivors)];
            let parent2 = survivingWarriors[randomInt(numSurvivors)];

            // Create new warrior via crossover and mutation
            let child = this.crossoverWarriors(parent1, parent2);
            child.team = team;

            newBand.push(child);
        }

        return newBand;
    }

    // Added by Reis
    crossoverWarriors(parent1, parent2) {
        // Create a new Warrior
        let child = new Warrior();

        // For each gene, apply crossover
        for (let i = 0; i < parent1.genes.length; i++) {
            let gene1 = parent1.genes[i];
            let gene2 = parent2.genes[i];

            let childGene = new RealGene();
            childGene.value = gene1.value;

            // Apply crossover with the other parent's gene
            childGene.crossover(gene2);

            child.genes[i] = childGene;
        }

        // Mutate the child's genes and update properties
        child.mutate();

        return child;
    }

    draw(ctx) {
        // Implement any drawing logic if needed
    }
}
