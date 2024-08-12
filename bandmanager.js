class BandManager {
    constructor() {
        this.bands = [];

        this.bandIndex = 0;

        this.band1 = [];
        this.band2 = [];

        this.zGenes = this.zeroGenes();
        this.pGenes = this.presetGenes();

        for(let i = 0; i < PARAMS.numBands; i++) {
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
        for(let i = 0; i < 10; i++) {
            genes.push(new RealGene({ value: 0 }));
        }
        return genes;
    }
    
    randomGenes() {
        let genes = [];
        for(let i = 0; i < 10; i++) {
            genes.push(new RealGene());
        }
        return genes;
    }

    createBand(loadStyle) {
        let band = [];
    
        if (loadStyle === 0) {
            // zero genes
            let warrior = new Warrior({ genes: this.zGenes });
            warrior.mutate();
            for (let i = 0; i < PARAMS.bandSize; i++) {
                band.push(warrior);
                warrior = new Warrior(warrior);
                warrior.mutate();
            }
        } else if (loadStyle === 1) {
            // random genes
            let warrior = new Warrior({ genes: this.randomGenes() });
            warrior.mutate();
            for (let i = 0; i < PARAMS.bandSize; i++) {
                band.push(warrior);
                warrior = new Warrior(warrior);
                warrior.mutate();
            }
        } else {
            // preset genes
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
        gameEngine.entities = [];
        
        for(let i = 0; i < band1.length; i++) {
            band1[i].reset(true); 
            gameEngine.addEntity(band1[i]);
        }

        for(let i = 0; i < band2.length; i++) {
            band2[i].reset(false); 
            gameEngine.addEntity(band2[i]);
        }
    }

    combatOver() {
        let ents = gameEngine.entities;
        if (ents.length === 0) return true;
        let team = ents[0].team;
        for(let ent of ents) {
            if(ent.team != team) return false;
        }
        return true;
    }

    update() {    
        if(this.combatOver()) {
            gameEngine.combatManager.reset();
            this.prepareBandsForCombat(this.bands[this.bandIndex++], this.bands[this.bandIndex++]);
            this.bandIndex %= this.bands.length;
        }
    }
    
    draw(ctx) {

    }

};








