(()=>{"use strict";var t={446:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Chromosome=void 0;class s{constructor(t,e,s){this.genes=[],this.fitness=0,this.randGene=e,this.randNum=s,this.genes=t,this.length=t.length}static generate(t,e,i){const o=[];for(let s=0;s<t;s++)o.push(e());return new s(o,e,i)}getFitness(){return this.fitness}setFitness(t){this.fitness=t}compare(t){let e=0;for(let s=0;s<Math.min(this.length,t.length);s++)e+=this.genes[s]!==t.genes[s]?1:0;return e}mutateWith(t=1/this.length,e){e(this,t)}crossoverWith(t,e){return e(this,t)}setGenes(t){this.genes=[...t]}getGenes(){return this.genes}copy(t){this.genes=t.genes.slice(),this.length=t.length,this.randGene=t.randGene,this.fitness=t.fitness}clone(){const t=s.generate(this.length,this.randGene,this.randNum);return t.copy(this),t}randomGene(){return this.randGene()}randomNumber(){return this.randNum()}}e.Chromosome=s},348:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.crossoverMethod=void 0,e.crossoverMethod={singlePoint:(t,e)=>{const s=Math.floor(t.randomNumber()*t.getGenes().length);return[[...t.getGenes().slice(0,s),...e.getGenes().slice(s)],[...e.getGenes().slice(0,s),...t.getGenes().slice(s)]]},twoPoint:(t,e)=>{const s=[],i=[],o=t.getGenes(),n=e.getGenes(),r=t.getGenes().length;let h=Math.floor(t.randomNumber()*r),a=Math.floor(t.randomNumber()*r);h>a&&([h,a]=[a,h]);for(let t=0;t<r;t++)s.push(t<h?o[t]:t<a?n[t]:o[t]),i.push(t<h?n[t]:t<a?o[t]:n[t]);return[s,i]},uniform:(t,e)=>{const s=[],i=[],o=t.getGenes(),n=e.getGenes(),r=t.getGenes().length;for(let e=0;e<r;e++){let r=t.randomNumber()<.5;s.push(r?n[e]:o[e]),i.push(r?o[e]:n[e])}return[s,i]},halfUniform:(t,e)=>{let s=[],i=[];const o=t.getGenes(),n=e.getGenes(),r=t.getGenes().length,h=[];for(let t=0;t<r;t++)o[t]!==n[t]&&h.push(t);const a=h.length;s=o.slice(),i=n.slice();for(let e=0;e<a/2;e++){let e=Math.floor(t.randomNumber()*h.length);s[h[e]]=n[h[e]],i[h[e]]=o[h[e]],h.splice(e,1)}return[s,i]},ordered:(t,e)=>{const s=[],i=[],o=t.getGenes(),n=e.getGenes(),r=t.getGenes().length;let h=Math.floor(t.randomNumber()*r),a=Math.floor(t.randomNumber()*r),l=h;h=Math.min(h,a),a=Math.max(l,a);for(let t=h;t<a;t++)s[t]=n[t],i[t]=o[t];for(let t=0;t<r;t++){if(-1===s.indexOf(o[t]))s[t]=o[t];else for(let e=0;e<r;e++)-1===s.indexOf(o[e])&&(s[t]=o[e]);if(-1===i.indexOf(n[t]))i[t]=n[t];else for(let e=0;e<n.length;e++)-1===i.indexOf(n[e])&&(i[t]=n[e])}return[s,i]}}},803:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Darwin=void 0;const i=s(446),o=s(348),n=s(666),r=s(675);e.Darwin=class{constructor(t){this.population=[],this.statsNeedUpdate=!0,this.generation=0,this.params=Object.assign({crossoverRate:.7,mutationRate:1/t.populationSize,crossoverMethod:o.crossoverMethod.singlePoint,mutationMethod:n.mutationMethod.flip,eliteCount:Math.ceil(t.populationSize/25),eliteCopies:1,randomNumber:Math.random},t);for(let e=0;e<t.populationSize;e++){const t=i.Chromosome.generate(this.params.chromosomeLength,this.params.randomGene,this.params.randomNumber);this.population.push(t)}this.stats={fittest:this.population[0],averageFitness:0,totalFitness:0,fittestIndex:0}}duplicateElite(t){const{eliteCount:e,eliteCopies:s}=this.params;if(e>0){const i=this.getTopChromosomes(e);t.push(...i);for(let o=0;o<e;o++)for(let e=0;e<s;e++)t.push(i[o].clone())}}crossover(t){const{populationSize:e,crossoverRate:s,crossoverMethod:o,randomGene:n,randomNumber:r}=this.params;for(;t.length<e;)if(this.params.randomNumber()<s){const e=this.getRandomChromosome(),s=this.getRandomChromosome(),[h,a]=e.crossoverWith(s,o);t.push(new i.Chromosome(h,n,r),new i.Chromosome(a,n,r))}this.params.populationSize%2==1&&t.pop()}mutate(t){for(const e of t)e.mutateWith(this.params.mutationRate,this.params.mutationMethod)}updateFitness(t){for(let e=0;e<this.population.length;e++){const s=this.population[e];s.setFitness(t(s.getGenes()))}}mate(){const t=[];this.duplicateElite(t),this.crossover(t),this.mutate(t),this.population=t,this.generation+=1,this.statsNeedUpdate=!0}getPopulation(){return this.population}getChromosomeAt(t){return this.population[t]}getRandomChromosome(){if(this.updateStats(),0===this.stats.totalFitness)return this.population[Math.floor(this.params.randomNumber()*this.population.length)];const t=this.params.randomNumber()*this.stats.totalFitness;let e=0;for(let s=0;s<this.population.length;s++)if(e+=this.population[s].getFitness(),e>t)return this.population[s];return this.population[0]}getTopChromosomes(t){return r.selectKBest(this.population,t)}getParams(){return this.params}getGeneration(){return this.generation}getStats(){return this.stats}updateStats(t=!1){if(t||this.statsNeedUpdate){let t=0,e=0,s=0;for(let i=0;i<this.population.length;i++){const o=this.population[i].getFitness();t+=o,o>e&&(e=o,s=i)}this.stats.totalFitness=t,this.stats.averageFitness=t/this.params.populationSize,this.stats.fittest=this.population[s].clone(),this.stats.fittestIndex=s,this.statsNeedUpdate=!1}return this.stats}}},598:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.createEater=void 0;const i=s(157);e.createEater=(t,e,s)=>({closestFood:new i.Vector2D(0,0),foodDir:new i.Vector2D(0,0),lookat:new i.Vector2D(0,0),position:t,angle:e,getChromosomeIndex:()=>s})},835:(t,e)=>{var s;Object.defineProperty(e,"__esModule",{value:!0}),e.MathUtils=void 0,(s=e.MathUtils||(e.MathUtils={})).clamp=(t,e,s)=>t>=e&&t<=s?t:t<e?e:s,s.map=(t,e,s,i,o)=>(t-e)/(s-e)*(o-i)+i,s.TWO_PI=2*Math.PI},105:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.NeuralNet=void 0;class s{constructor(){this.weightsAndBiases=[]}getWeight(t,e,s){return this.weightsAndBiases[this.offsets[t-1]+e*(this.numNeuronsPerLayer[t-1]+1)+s+1]}getBias(t,e){return this.weightsAndBiases[this.offsets[t-1]+e*(this.numNeuronsPerLayer[t-1]+1)]}feedforward(t){if(0===this.weightsAndBiases.length)throw new Error("Cannot feedforward before 'putWeights' or 'fromJSON' was called.");if(t.length!==this.numNeuronsPerLayer[0])throw new Error(`Expected ${this.numNeuronsPerLayer[0]} inputs, got ${t.length}.`);let e=t,s=[];for(let t=1;t<this.numNeuronsPerLayer.length;t++){s=[];for(let i=0;i<this.numNeuronsPerLayer[t];i++){let o=this.getBias(t,i);for(let s=0;s<this.numNeuronsPerLayer[t-1];s++)o+=this.getWeight(t,i,s)*e[s];s[i]=1/(1+Math.exp(-o))}e=s}return s}run(...t){return this.feedforward(t)}computeOffsets(){this.offsets=[0];let t=0;for(let e=1;e<this.numNeuronsPerLayer.length-1;e++)this.offsets.push(t+=this.numNeuronsPerLayer[e-1]*(this.numNeuronsPerLayer[e]+1))}putWeights(t,e){this.numNeuronsPerLayer=t,this.computeOffsets();const i=s.weightsCount(t);if(i!==e.length)throw new Error(`The number of weights do not match the given architecture, expected ${i}, got ${e.length}.`);this.weightsAndBiases=e}static weightsCount(t){let e=0;for(let s=1;s<t.length;s++)e+=t[s]*(t[s-1]+1);return e}toJSON(){return{weights_and_biases:this.weightsAndBiases,layers:this.numNeuronsPerLayer}}static fromJSON(t){const e=new s;return e.putWeights(t.layers,t.weightsAndbiases),e}static fromWeights(t,e){const i=new s;return i.putWeights(t,e),i}}e.NeuralNet=s},872:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.SmartEaters=e.DPR=void 0;const i=s(348),o=s(803),n=s(598),r=s(105),h=s(157),a=s(835);e.DPR=window.devicePixelRatio,e.SmartEaters=class{constructor(t,s){this.ticks=0,this.selectedIndex=-1,this.followFittest=!1,this.paused=!1,this.fastMode=!1,this.fastModeRefreshRate=2,this.statsRefreshRate=20,this.showLines=!1,this.hideNonSelected=!1,this.stopMating=!1,this.cnv=t;const l=this.cnv.getContext("2d");if(null===l)throw new Error("Could not get a 2d canvas context");this.ctx=l,this.params=Object.assign({populationSize:30,hiddenLayersSizes:[6],foodCount:40,crossoverRate:.7,mutationRate:.1,eliteCount:4,eliteCopies:1,maxSpeed:2,maxTurnRate:.3,ticksPerGen:1e3,crossoverMethod:i.crossoverMethod.singlePoint,eaterSize:12,foodSize:5,wrapBorders:!0},s),this.layerSizes=[4,...this.params.hiddenLayersSizes,2],this.brain=new r.NeuralNet,this.genetics=new o.Darwin({populationSize:this.params.populationSize,randomGene:()=>2*Math.random()-1,chromosomeLength:r.NeuralNet.weightsCount(this.layerSizes)}),this.population=this.genetics.getPopulation().map(((t,e)=>n.createEater(this.randomPos(),Math.random()*a.MathUtils.TWO_PI,e))),this.cnv.addEventListener("click",(t=>{const s=new h.Vector2D(t.clientX*e.DPR,t.clientY*e.DPR);let i=0,o=1/0;for(let t=0;t<this.population.length;t++){const e=this.population[t].position.distSq(s);e<o&&(o=e,i=t)}Math.pow(o,.5)<2*this.params.eaterSize*e.DPR?this.setSelected(i):this.selectedIndex=-1})),this.spawnFood()}spawnFood(){this.food=[];for(let t=0;t<this.params.foodCount;t++)this.food.push(this.randomPos())}randomPos(){return h.Vector2D.rand().hadamard([this.cnv.width,this.cnv.height])}getClosestFood(t){let e=0,s=1/0;for(let i=0;i<this.food.length;i++){const o=t.position.distSq(this.food[i]);o<s&&(s=o,e=i)}return{index:e,dist:Math.pow(s,.5)}}tick(){if(!this.paused){++this.ticks>this.params.ticksPerGen&&(this.nextGeneration(),this.ticks=0);for(const t of this.population){const s=this.genetics.getChromosomeAt(t.getChromosomeIndex());this.brain.putWeights(this.layerSizes,s.getGenes());const i=this.getClosestFood(t);t.closestFood=h.Vector2D.clone(this.food[i.index]);const[o,n]=this.food[i.index].sub(t.position).normalize().toArray();if(i.dist<(this.params.eaterSize+this.params.foodSize)/2){const t=s.getFitness();s.setFitness(2*(0===t?1:t)),this.food[i.index]=this.randomPos()}const r=[Math.cos(t.angle),Math.sin(t.angle)],[l,d]=this.brain.run(...r,o,n),c=a.MathUtils.clamp(l-d,-this.params.maxTurnRate,this.params.maxTurnRate);t.angle+=c,t.lookat=new h.Vector2D(r[0],r[1]),t.foodDir=new h.Vector2D(o,n),t.position.plus(t.lookat.times(this.params.maxSpeed*e.DPR));const u=t.position;this.params.wrapBorders?(u.x>this.cnv.width&&(u.x=0),u.x<0&&(u.x=this.cnv.width),u.y>this.cnv.height&&(u.y=0),u.y<0&&(u.y=this.cnv.height)):(u.x>this.cnv.width&&(u.x=this.cnv.width),u.x<0&&(u.x=0),u.y>this.cnv.height&&(u.y=this.cnv.height),u.y<0&&(u.y=0))}}}pause(){this.paused=!this.paused}nextGeneration(){if(!this.stopMating){this.genetics.mate(),this.genetics.updateStats();for(const t of this.genetics.getPopulation())t.setFitness(0);this.spawnFood();for(const t of this.population)t.position=this.randomPos();this.selectedIndex=-1}}run(){const t=()=>{this.tick(),this.render(),this.fastMode?setTimeout(t,0):requestAnimationFrame(t)};t()}render(){this.fastMode&&this.ticks%this.fastModeRefreshRate!=0||(this.ticks%this.statsRefreshRate==0&&this.genetics.updateStats(!0),this.ctx.clearRect(0,0,this.cnv.width,this.cnv.height),this.drawFood(),this.drawEaters(),this.highlightSelectedEater(),this.drawGenerationInfo())}drawGenerationInfo(){const{fittest:t}=this.genetics.getStats(),e=0!==t.getFitness()?Math.log2(t.getFitness()):0;this.ctx.fillStyle="black",this.ctx.fillText(`Generation: ${this.genetics.getGeneration()}`,5,10),this.ctx.fillText(`avg: ${Math.log2(1+this.genetics.getStats().averageFitness).toFixed(3)}`,5,25),this.ctx.fillText(`best: ${e}`,5,40),this.ctx.fillText(`ticks: ${this.ticks} / ${this.params.ticksPerGen}`,5,55)}highlightSelectedEater(){if(this.followFittest&&(this.selectedIndex=this.genetics.getStats().fittestIndex),-1!==this.selectedIndex&&!this.hideNonSelected){this.ctx.lineWidth=2,this.ctx.strokeStyle="red",this.ctx.beginPath();const t=this.population[this.selectedIndex],s=t.position;this.ctx.arc(s.x/e.DPR,s.y/e.DPR,2*this.params.eaterSize,0,a.MathUtils.TWO_PI),this.ctx.stroke(),this.ctx.closePath(),this.ctx.beginPath(),this.ctx.lineWidth=1,this.ctx.strokeStyle="black",this.ctx.moveTo(s.x/e.DPR,s.y/e.DPR);const i=s.add(t.foodDir.times(2*this.params.eaterSize*e.DPR));this.ctx.lineTo(i.x/e.DPR,i.y/e.DPR),this.ctx.stroke()}}drawEaters(){const t=[46,204,113],s=[255,0,0],i=Math.log2(this.genetics.getStats().fittest.getFitness());let o=0;for(const n of this.population){if(this.showLines){this.ctx.beginPath(),this.ctx.lineWidth=1,this.ctx.strokeStyle="black",this.ctx.moveTo(n.position.x/e.DPR,n.position.y/e.DPR);const t=n.position.add(n.foodDir.times(n.position.dist(n.closestFood)));this.ctx.lineTo(t.x/e.DPR,t.y/e.DPR),this.ctx.stroke()}if(!this.hideNonSelected||void 0===this.selectedIndex||o++===this.selectedIndex){const o=Math.log2(this.genetics.getChromosomeAt(n.getChromosomeIndex()).getFitness()),[r,l,d]=[a.MathUtils.clamp(a.MathUtils.map(o,0,i,t[0],s[0]),Math.min(t[0],s[0]),Math.max(t[0],s[0])),a.MathUtils.clamp(a.MathUtils.map(o,0,i,t[1],s[1]),Math.min(t[1],s[1]),Math.max(t[1],s[1])),a.MathUtils.clamp(a.MathUtils.map(o,0,i,t[2],s[2]),Math.min(t[2],s[2]),Math.max(t[2],s[2]))];this.ctx.lineWidth=4,this.ctx.fillStyle=`rgb(\n                    ${Math.floor(r)},\n                    ${Math.floor(l)},\n                    ${Math.floor(d)}\n                )`,this.ctx.beginPath();const c=n.lookat.times(this.params.eaterSize*e.DPR).add(n.position),u=c.sub(n.position).angle(),p=Math.PI/1.3,m=new h.Vector2D(Math.cos(u+p),Math.sin(u+p)),g=new h.Vector2D(Math.cos(u-p),Math.sin(u-p)),f=n.position.add(m.times(this.params.eaterSize*e.DPR)),x=n.position.add(g.times(this.params.eaterSize*e.DPR));this.ctx.moveTo(f.x/e.DPR,f.y/e.DPR),this.ctx.lineTo(c.x/e.DPR,c.y/e.DPR),this.ctx.lineTo(x.x/e.DPR,x.y/e.DPR),this.ctx.fill()}}}drawFood(){this.ctx.fillStyle="rgb(52, 73, 94)";const t=this.params.foodSize;for(const s of this.food)this.ctx.beginPath(),this.ctx.fillRect((s.x-t/2)/e.DPR,(s.y-t/2)/e.DPR,t,t),this.ctx.fill()}setSelected(t){this.followFittest=!1,this.selectedIndex=t}getSelected(){return this.population[this.selectedIndex]}getEater(t){return this.population[t]}toggleFastMode(){this.fastMode=!this.fastMode}getDarwinInstance(){return this.genetics}toggleMating(){this.stopMating=!this.stopMating}getSelectedIndex(){return this.selectedIndex}getParameters(){return this.params}}},157:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Vector2D=void 0;class s{constructor(t,e){this.x=t,this.y=e}add(t){return new s(this.x+t.x,this.y+t.y)}sub(t){return new s(this.x-t.x,this.y-t.y)}plus(t){this.x+=t.x,this.y+=t.y}minus(t){this.x-=t.x,this.y-=t.y}dot(t){return this.x*t.x+this.y*t.y}hadamard(t){return t instanceof s?new s(this.x*t.x,this.y*t.y):new s(this.x*t[0],this.y*t[1])}norm(){return Math.pow(this.dot(this),.5)}normSq(){return this.dot(this)}times(t){return new s(this.x*t,this.y*t)}normalize(){return this.times(1/this.norm())}dist(t){return this.sub(t).norm()}distSq(t){return this.sub(t).normSq()}map(t){return new s(t(this.x),t(this.y))}angle(){return Math.atan2(this.y,this.x)}toArray(){return[this.x,this.y]}fromTuple([t,e]){return new s(t,e)}static fill(t){return new s(t,t)}static zeroes(){return s.fill(0)}static ones(){return s.fill(1)}static rand(t=Math.random){return new s(t(),t())}static clone(t){return new s(t.x,t.y)}}e.Vector2D=s},666:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.mutationMethod=void 0,e.mutationMethod={flip:(t,e)=>{const s=t.getGenes(),i=s.length;for(let o=0;o<i;o++)t.randomNumber()<e&&(s[o]=t.randomGene())},swap:(t,e)=>{const s=t.getGenes(),i=s.length;for(let o=0;o<i;o++)if(t.randomNumber()<e){const t=Math.floor(Math.random()*i);[s[o],s[t]]=[s[t],s[o]]}}}},675:(t,e)=>{function s(t,e=0,o=t.length-1){const n=t[Math.floor((e+o)/2)].getFitness();if(e<o){const r=i(t,e,o,n);s(t,e,r-1),s(t,r,o)}}function i(t,e,s,i){for(;e<=s;){for(;t[e].getFitness()>i;)e++;for(;t[s].getFitness()<i;)s--;e<=s&&([t[e],t[s]]=[t[s],t[e]],e++,s--)}return e}Object.defineProperty(e,"__esModule",{value:!0}),e.selectKBest=void 0,e.selectKBest=function(t,e){return function(t,e,o=0,n=t.length-1){const r=t[Math.floor((o+n)/2)].getFitness();if(o<n){const h=i(t,o,n,r);s(t,o,h-1),h<e&&s(t,h,n)}}(t,e),t.slice(0,e)}}},e={};function s(i){var o=e[i];if(void 0!==o)return o.exports;var n=e[i]={exports:{}};return t[i](n,n.exports,s),n.exports}(()=>{const t=s(348),e=s(872),i=document.createElement("canvas"),o=i.getContext("2d");i.width=window.innerWidth*e.DPR,i.height=window.innerHeight*e.DPR,i.style.width=`${window.innerWidth}px`,i.style.height=`${window.innerHeight}px`,null==o||o.scale(e.DPR,e.DPR),document.body.style.margin="0",document.body.style.overflow="hidden",document.body.appendChild(i);const n=new e.SmartEaters(i,{eliteCount:5,eliteCopies:2,ticksPerGen:2e3,populationSize:100,foodCount:120,crossoverMethod:t.crossoverMethod.twoPoint,wrapBorders:!0,mutationRate:.02,hiddenLayersSizes:[8]});n.run(),window.addEventListener("resize",(()=>{i.style.width=`${window.innerWidth}px`,i.style.height=`${window.innerHeight}px`,i.width=window.innerWidth*e.DPR,i.height=window.innerHeight*e.DPR,null==o||o.scale(e.DPR,e.DPR)})),window.addEventListener("keypress",(t=>{switch(t.key){case" ":n.pause();break;case"f":n.followFittest=!n.followFittest;break;case"p":n.fastModeRefreshRate+=2;break;case"m":n.fastModeRefreshRate=Math.max(n.fastModeRefreshRate-2,1);break;case"l":n.showLines=!n.showLines;break;case"h":n.hideNonSelected=!n.hideNonSelected;break;default:n.toggleFastMode()}}))})()})();