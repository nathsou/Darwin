(()=>{"use strict";var t={446:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Chromosome=void 0;class s{constructor(t,e,s){this.genes=[],this.fitness=0,this.randGene=e,this.randNum=s,this.genes=t,this.length=t.length}static generate(t,e,i){const n=[];for(let s=0;s<t;s++)n.push(e());return new s(n,e,i)}getFitness(){return this.fitness}setFitness(t){this.fitness=t}compare(t){let e=0;for(let s=0;s<Math.min(this.length,t.length);s++)e+=this.genes[s]!==t.genes[s]?1:0;return e}mutateWith(t=1/this.length,e){e(this,t)}crossoverWith(t,e){return e(this,t)}setGenes(t){this.genes=[...t]}getGenes(){return this.genes}copy(t){this.genes=t.genes.slice(),this.length=t.length,this.randGene=t.randGene,this.fitness=t.fitness}clone(){const t=s.generate(this.length,this.randGene,this.randNum);return t.copy(this),t}randomGene(){return this.randGene()}randomNumber(){return this.randNum()}}e.Chromosome=s},348:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.crossoverMethod=void 0,e.crossoverMethod={singlePoint:(t,e)=>{const s=Math.floor(t.randomNumber()*t.getGenes().length);return[[...t.getGenes().slice(0,s),...e.getGenes().slice(s)],[...e.getGenes().slice(0,s),...t.getGenes().slice(s)]]},twoPoint:(t,e)=>{const s=[],i=[],n=t.getGenes(),o=e.getGenes(),r=t.getGenes().length;let h=Math.floor(t.randomNumber()*r),a=Math.floor(t.randomNumber()*r);h>a&&([h,a]=[a,h]);for(let t=0;t<r;t++)s.push(t<h?n[t]:t<a?o[t]:n[t]),i.push(t<h?o[t]:t<a?n[t]:o[t]);return[s,i]},uniform:(t,e)=>{const s=[],i=[],n=t.getGenes(),o=e.getGenes(),r=t.getGenes().length;for(let e=0;e<r;e++){let r=t.randomNumber()<.5;s.push(r?o[e]:n[e]),i.push(r?n[e]:o[e])}return[s,i]},halfUniform:(t,e)=>{let s=[],i=[];const n=t.getGenes(),o=e.getGenes(),r=t.getGenes().length,h=[];for(let t=0;t<r;t++)n[t]!==o[t]&&h.push(t);const a=h.length;s=n.slice(),i=o.slice();for(let e=0;e<a/2;e++){let e=Math.floor(t.randomNumber()*h.length);s[h[e]]=o[h[e]],i[h[e]]=n[h[e]],h.splice(e,1)}return[s,i]},ordered:(t,e)=>{const s=[],i=[],n=t.getGenes(),o=e.getGenes(),r=t.getGenes().length;let h=Math.floor(t.randomNumber()*r),a=Math.floor(t.randomNumber()*r),l=h;h=Math.min(h,a),a=Math.max(l,a);for(let t=h;t<a;t++)s[t]=o[t],i[t]=n[t];for(let t=0;t<r;t++){if(-1===s.indexOf(n[t]))s[t]=n[t];else for(let e=0;e<r;e++)-1===s.indexOf(n[e])&&(s[t]=n[e]);if(-1===i.indexOf(o[t]))i[t]=o[t];else for(let e=0;e<o.length;e++)-1===i.indexOf(o[e])&&(i[t]=o[e])}return[s,i]}}},803:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.Darwin=void 0;const i=s(446),n=s(348),o=s(666),r=s(675);e.Darwin=class{constructor(t){this.population=[],this.generation=0,this.params=Object.assign({crossoverRate:.7,mutationRate:1/t.populationSize,crossoverMethod:n.crossoverMethod.singlePoint,mutationMethod:o.mutationMethod.flip,eliteCount:Math.ceil(t.populationSize/25),eliteCopies:1,randomNumber:Math.random},t);for(let e=0;e<t.populationSize;e++){const t=i.Chromosome.generate(this.params.chromosomeLength,this.params.randomGene,this.params.randomNumber);this.population.push(t)}this.stats={fittest:this.population[0],averageFitness:0,totalFitness:0,fittestIndex:0,needsUpdate:!0}}duplicateElite(t){const{eliteCount:e,eliteCopies:s}=this.params;if(e>0){const i=this.getTopChromosomes(e);t.push(...i);for(let n=0;n<e;n++)for(let e=0;e<s;e++)t.push(i[n].clone())}}crossover(t){const{populationSize:e,crossoverRate:s,crossoverMethod:n,randomGene:o,randomNumber:r}=this.params;for(;t.length<e;)if(this.params.randomNumber()<s){const e=this.getRandomChromosome(),s=this.getRandomChromosome(),[h,a]=e.crossoverWith(s,n);t.push(new i.Chromosome(h,o,r),new i.Chromosome(a,o,r))}this.params.populationSize%2==1&&t.pop()}mutate(t){for(const e of t)e.mutateWith(this.params.mutationRate,this.params.mutationMethod)}updateFitness(t){for(let e=0;e<this.population.length;e++){const s=this.population[e];s.setFitness(t(s.getGenes()))}this.stats.needsUpdate=!0}mate(){const t=[];this.duplicateElite(t),this.crossover(t),this.mutate(t),this.population=t,this.generation+=1,this.updateStats(!0)}getPopulation(){return this.population}getChromosomeAt(t){return this.population[t]}getRandomChromosome(){if(this.updateStats(),0===this.stats.totalFitness)return this.population[Math.floor(this.params.randomNumber()*this.population.length)];const t=this.params.randomNumber()*this.stats.totalFitness;let e=0;for(let s=0;s<this.population.length;s++)if(e+=this.population[s].getFitness(),e>t)return this.population[s];return this.population[0]}getTopChromosomes(t){return r.selectKBest(this.population,t)}getAverageFitness(){return this.updateStats(),this.stats.averageFitness}getFittest(){return this.updateStats(),this.stats.fittest}getParams(){return this.params}getGeneration(){return this.generation}getStats(){return this.stats}updateStats(t=!0){if(t||this.stats.needsUpdate){let t=0,e=0,s=0;for(let i=0;i<this.population.length;i++){const n=this.population[i].getFitness();t+=n,n>e&&(e=n,s=i)}this.stats.totalFitness=t,this.stats.averageFitness=t/this.params.populationSize,this.stats.fittest=this.population[s].clone(),this.stats.fittestIndex=s,this.stats.needsUpdate=!1}}}},124:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.TSP=void 0,e.TSP=class{constructor(t){this.cities=t,this.distMap=new Map}dist2D(t,e){return Math.pow(this.dist2DSquared(t,e),.5)}dist2DSquared(t,e){let s,i;e>t?(s=t,i=e):(s=e,i=t);const n=`${s}->${i}`;if(this.distMap.has(n))return this.distMap.get(n);{let s=this.cities[t],i=this.cities[e];const o=Math.pow(s.x-i.x,2)+Math.pow(s.y-i.y,2);return this.distMap.set(n,o),o}}checkPathValidity(t){if(t.length!==this.cities.length)return!1;let e=t.slice().sort(),s=e[0];for(let t=1;t<e.length;t++){if(s===e[t])return!1;s=e[t]}return!0}distance(t){if(!this.checkPathValidity(t))throw new Error("Invalid path: Each city must be visited exactly once.");let e=0;for(let s=1;s<t.length;s++)e+=this.dist2D(t[s-1],t[s]);return e}distanceSquared(t){if(!this.checkPathValidity(t))throw new Error("Invalid path: Each city must be visited exactly once.");let e=0;for(let s=1;s<t.length;s++)e+=this.dist2DSquared(t[s-1],t[s]);return e}getCities(){return this.cities}getCity(t){return this.cities[t]}draw(t,e){if(e.length!==this.cities.length)throw new Error("Each city must be visited");t.clearRect(0,0,t.canvas.width,t.canvas.height);const s=window.devicePixelRatio;t.strokeStyle="#555555",t.lineWidth=2;for(let i=1;i<e.length;i++)t.beginPath(),t.moveTo(this.cities[e[i-1]].x/s,this.cities[e[i-1]].y/s),t.lineTo(this.cities[e[i]].x/s,this.cities[e[i]].y/s),t.closePath(),t.stroke();t.fillStyle="#01cc33";for(const e of this.cities)t.beginPath(),t.arc(e.x/s,e.y/s,4,0,2*Math.PI),t.closePath(),t.fill()}}},331:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.TSPOptimizer=void 0;const i=s(803),n=s(666),o=s(124),r=s(348),h=s(905);e.TSPOptimizer=class{constructor(t=[]){this.shuffled=[],this.model=[],this.convergenceThreshold=30,this.maxGenerations=5e3,this.fitnessFactor=15,this.CITY_COUNT=t.length,this.tsp=new o.TSP(t);for(let t=0;t<this.CITY_COUNT;t++)this.model[t]=t;this.genetics=new i.Darwin({populationSize:500,chromosomeLength:this.CITY_COUNT,randomGene:(()=>(0===this.shuffled.length&&(this.shuffled=h.shuffle(this.model)),this.shuffled.pop())).bind(this),crossoverMethod:r.crossoverMethod.ordered,mutationMethod:n.mutationMethod.swap,eliteCount:5});const e=t.reduce(((t,e)=>t>e.x?t:e.x),0),s=t.reduce(((t,e)=>t>e.y?t:e.y),0);this.fitnessFactor*=function(t,e){const s=Math.pow(t,2),i=Math.pow(t,3),n=Math.pow(e,2),o=Math.pow(e,3),r=Math.pow(s+n,.5);return 1/15*(i/n+o/s+r*(3-s/n-n/s)+2.5*(n/t*Math.log((t+r)/e)+s/e*Math.log((e+r)/t)))}(e,s)*this.CITY_COUNT,this.bestPath=this.genetics.getFittest().getGenes()}pathFitness(t){return Math.pow(2,this.fitnessFactor/this.tsp.distance(t))}distanceFromFitness(t){return this.fitnessFactor/Math.log2(t)}newGen(){this.genetics.updateFitness((t=>this.pathFitness(t))),this.genetics.mate()}*optimize(){let t=1/0,e=0;for(;this.genetics.getGeneration()!==this.maxGenerations&&e!==this.convergenceThreshold;){this.newGen();const s=this.genetics.getFittest(),i=this.tsp.distanceSquared(s.getGenes());i>=t?e++:(t=i,this.bestPath=[...s.getGenes()],e=0),yield this.bestPath}return this.bestPath}drawShortestPath(t){this.tsp.draw(t,this.bestPath),t.fillStyle="black",t.fillText(`generation : ${this.genetics.getGeneration()}`,5,15),t.fillText(`avg dist : ${this.distanceFromFitness(this.genetics.getAverageFitness()).toFixed(0)}`,5,30)}getGeneration(){return this.genetics.getGeneration()}}},905:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.shuffle=void 0,e.shuffle=function(t){const e=[...t];for(let t=e.length-1;t>0;t--){const s=Math.floor(Math.random()*(t+1));[e[t],e[s]]=[e[s],e[t]]}return e}},666:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.mutationMethod=void 0,e.mutationMethod={flip:(t,e)=>{const s=t.getGenes(),i=s.length;for(let n=0;n<i;n++)t.randomNumber()<e&&(s[n]=t.randomGene())},swap:(t,e)=>{const s=t.getGenes(),i=s.length;for(let n=0;n<i;n++)if(t.randomNumber()<e){const t=Math.floor(Math.random()*i);[s[n],s[t]]=[s[t],s[n]]}}}},675:(t,e)=>{function s(t,e=0,n=t.length-1){const o=t[Math.floor((e+n)/2)].getFitness();if(e<n){const r=i(t,e,n,o);s(t,e,r-1),s(t,r,n)}}function i(t,e,s,i){for(;e<=s;){for(;t[e].getFitness()>i;)e++;for(;t[s].getFitness()<i;)s--;e<=s&&([t[e],t[s]]=[t[s],t[e]],e++,s--)}return e}Object.defineProperty(e,"__esModule",{value:!0}),e.selectKBest=void 0,e.selectKBest=function(t,e){return function(t,e,n=0,o=t.length-1){const r=t[Math.floor((n+o)/2)].getFitness();if(n<o){const h=i(t,n,o,r);s(t,n,h-1),h<e&&s(t,h,o)}}(t,e),t.slice(0,e)}}},e={};function s(i){var n=e[i];if(void 0!==n)return n.exports;var o=e[i]={exports:{}};return t[i](o,o.exports,s),o.exports}(()=>{const t=s(331),e=document.createElement("canvas"),i=e.getContext("2d");if(null===i)throw new Error("Could not get a 2d canvas context");const n=window.devicePixelRatio;e.width=window.innerWidth*n,e.height=window.innerHeight*n,e.style.width=`${window.innerWidth}px`,e.style.height=`${window.innerHeight}px`,i.scale(n,n),document.body.style.padding="0",document.body.style.margin="0",document.body.appendChild(e);const o=[];for(let t=0;t<40;t++)o.push({x:Math.floor(Math.random()*e.width),y:Math.floor(Math.random()*e.height)});const r=new t.TSPOptimizer(o),h=r.optimize(),a=()=>{const t=h.next();r.drawShortestPath(i),t.done||requestAnimationFrame(a)};a(),r.drawShortestPath(i)})()})();