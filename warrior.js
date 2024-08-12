class Warrior {
    constructor(other) {
        this.radius = 5;
    
        this.health = 10;

        this.maxSpeed = 50;
        this.maxForce = 5;

        this.genes = [];
        for(let i = 0; i < 10; i++) {
            this.genes.push(new RealGene(other.genes[i]));
        }

        // visual radiuses
        this.cohesionRadius = this.genes[0].value * 200;
        this.alignmentRadius = this.genes[1].value * 200;
        this.separationRadius = this.genes[2].value * 200;
        this.chargeRadius = this.genes[3].value * 200;
        this.fleeRadius = this.genes[4].value * 200;
    
        // movement weights
        this.cohesionWeight = this.genes[5].value * 10;
        this.alignmentWeight = this.genes[6].value * 10;
        this.separationWeight = this.genes[7].value * 10;
        this.chargeWeight = this.genes[8].value * 10;
        this.fleeWeight = this.genes[9].value * 10;

        this.accelerationScale = 1;
        
        this.target = null;
        this.fleeing = false;
        this.aggression = 0.5;
        
    


    }

    pullWeightsFromHTML() {
        this.cohesionWeight = parseFloat(document.getElementById("cohesion").value);
        this.alignmentWeight = parseFloat(document.getElementById("alignment").value);
        this.separationWeight = parseFloat(document.getElementById("separation").value);
    }

    collide(other) {
        return distance(this, other) < this.radius + other.radius;
    }
    collideLeft() {
        return (this.x + this.radius) < 0;
    }
    collideRight() {
        return (this.x - this.radius) > PARAMS.worldWidth;
    }
    collideTop() {
        return (this.y + this.radius) < 0;
    }
    collideBottom() {
        return (this.y - this.radius) > PARAMS.worldHeight;
    }

    fled() {
        return this.collideBottom() || this.collideLeft() || this.collideTop() || this.collideRight();
    }

    mutate() {
        for(let i = 0; i < 10; i++) {
            this.genes[i].mutate();
        }
    }

    reset(team) {
        this.team = team;
        this.health = 10;
        this.target = null;
        this.fleeing = false;
        this.color = this.team ? "Red" : "Blue";
        this.fleecolor = this.team ? "Pink" : "Lightblue";
        this.x = Math.random() * PARAMS.worldWidth / 16;
        if(this.team) this.x = PARAMS.worldWidth - this.x;
        this.y = Math.random() * PARAMS.worldHeight;
        // this.velocity = { x: 0, y: 0 }; // no velocity
        // this.velocity = { x: Math.random() * this.maxSpeed * randomSign(), y: Math.random()* this.maxSpeed * randomSign() }; // random velocity
        this.velocity = { // move roughly toward each other
            x: this.team ? - Math.random() * this.maxSpeed : Math.random() * this.maxSpeed, 
            y: Math.random() * this.maxSpeed /2 * randomSign()
        }
        limit(this.velocity, this.maxSpeed);
    }

    hit() {
        this.health--;
        if(this.health === 0) {
            this.removeFromWorld = true;
            gameEngine.combatManager.dead(this.team);
        }
        if(this.willFlee() && !this.fleeing) {
            this.fleeing = true;
            gameEngine.combatManager.flee(this.team);
        }
    }

    willFlee() {
        return Math.random() > this.aggression;
    }

    update() {    
        var cohesionCount = 0;
        var alignmentCount = 0;
        
        var cohesion = { x: 0, y: 0 };
        var alignment = { x: 0, y: 0 };
        var separation = { x: 0, y: 0 };
        var repulsion = { x: 0, y: 0 };
        var charge = { x: 0, y: 0 };
    
        var entities = gameEngine.entities;
    
        this.target = null;

        for (var i = 0; i < entities.length - 1; i++) {
            var ent = entities[i];
            if (ent === this) continue;

            var dist = distance(this, ent);

            // If entities collide
            if (this.collide(ent)) {
                if (this.team === ent.team) {
                    // bump an ally
                    // repulsion.x += (this.x - ent.x) * 0.5;
                    // repulsion.y += (this.y - ent.y) * 0.5;
                } else {
                    // Battle logic
                    if (this.team) gameEngine.combatManager.combats.push([this, ent]); // only one member adds combat
                }
            }


            // Herding if agents are the same type
            if (this.team === ent.team) {
                if (dist < this.cohesionRadius) {
                    cohesionCount++;

                    // Cohesion
                    cohesion.x += ent.x;
                    cohesion.y += ent.y;
                }

                if (dist < this.alignmentRadius) {
                    alignmentCount++;

                    // Alignment
                    alignment.x += ent.velocity.x;
                    alignment.y += ent.velocity.y;
                }

                if (dist < this.separationRadius) {
                    // Separation
                    // separation.x += (this.x - ent.x);
                    // separation.y += (this.y - ent.y);
                    // separation.x += (this.x - ent.x) / dist;
                    // separation.y += (this.y - ent.y) / dist;  
                    separation.x += (this.x - ent.x) / dist / dist;
                    separation.y += (this.y - ent.y) / dist / dist;
                }
            } else {
                if (!this.fleeing && dist < this.chargeRadius) {
                    if (!this.target || distance(this, this.target) > dist) {
                        this.target = ent;
                    }
                } else if(this.fleeing && dist < this.fleeRadius) {
                    if (!this.target || distance(this, this.target) > dist) {
                        this.target = ent;
                    }
                }
            }
        }
    
        if (cohesionCount > 0) {
            cohesion.x = (cohesion.x / cohesionCount) - this.x;
            cohesion.y = (cohesion.y / cohesionCount) - this.y;
        }

        if (alignmentCount > 0) {
            alignment.x = (alignment.x / alignmentCount) - this.velocity.x;
            alignment.y = (alignment.y / alignmentCount) - this.velocity.y;
        }

        if (this.target) {
            if(!this.fleeing) {
                charge.x = this.target.x - this.x;
                charge.y = this.target.y - this.y;
            } else {
                charge.x = this.x - this.target.x;
                charge.y = this.y - this.target.y;        
            }
        }

        normalize(cohesion);
        normalize(alignment);
        normalize(separation);
        normalize(charge);

        if (document.getElementById("pullweights").checked && this.team) this.pullWeightsFromHTML();

        var steeringVector = this.fleeing ? 
        {
            x: (charge.x * this.fleeWeight),
            y: (charge.y * this.fleeWeight)
        } :
        {
            x: (cohesion.x * this.cohesionWeight) + (alignment.x * this.alignmentWeight) + (separation.x * this.separationWeight) + (charge.x * this.chargeWeight),
            y: (cohesion.y * this.cohesionWeight) + (alignment.y * this.alignmentWeight) + (separation.y * this.separationWeight) + (charge.y * this.chargeWeight)
        };
    
        normalize(steeringVector);

        steeringVector.x *= this.accelerationScale;
        limit(steeringVector, this.maxForce);

        this.velocity.x += steeringVector.x;
        this.velocity.y += steeringVector.y;
    
        limit(this.velocity, this.maxSpeed);

        // Update position based on current velocity
        this.x += this.velocity.x * gameEngine.clockTick;
        this.y += this.velocity.y * gameEngine.clockTick;

        if(this.fled()) this.removeFromWorld = true;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.fleeing ? this.fleecolor : this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();

        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        ctx.beginPath();
        ctx.strokeStyle = "Black";
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.velocity.x / speed * this.radius, this.y + this.velocity.y / speed * this.radius);
        ctx.stroke();
        ctx.closePath();
    }
};








