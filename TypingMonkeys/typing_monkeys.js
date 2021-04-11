(()=>{"use strict";var e={446:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Chromosome=void 0;const n=s(348),o=s(660),i=s(666);class r extends o.default{constructor(e,t){super(),this.genes=[],this.fitness=0,this.randGene=t,this.genes=e,this.length=e.length}static generate(e,t){const s=[];for(let n=0;n<e;n++)s.push(t());return new r(s,t)}getFitness(){return this.fitness}setFitness(e){this.fitness=e,this.emit("update_fitness",e)}compare(e){let t=0;for(let s=0;s<Math.min(this.length,e.length);s++)t+=this.genes[s]!==e.genes[s]?1:0;return t}mutateFlip(e){for(let t=0;t<this.length;t++)Math.random()<e&&(this.genes[t]=this.randGene())}mutateSwap(e){for(let t=0;t<this.length;t++)if(Math.random()<e){const e=Math.floor(Math.random()*this.length),s=this.genes[t];this.genes[t]=this.genes[e],this.genes[e]=s}}mutate(e=1/this.length,t){if("number"==typeof t)switch(t){case i.MutationMethod.FLIP:this.mutateFlip(e);break;case i.MutationMethod.SWAP:this.mutateSwap(e)}else this.setGenes(t(this.getGenes()))}crossoverSinglePoint(e){const t=Math.floor(Math.random()*this.length);return[[...this.genes.slice(0,t),...e.genes.slice(t)],[...e.genes.slice(0,t),...this.genes.slice(t)]]}crossoverTwoPoint(e){const t=[],s=[];let n=Math.floor(Math.random()*this.length),o=Math.floor(Math.random()*this.length);n>o&&([n,o]=[o,n]);for(let i=0;i<this.length;i++)t.push(i<n?this.genes[i]:i<o?e.genes[i]:this.genes[i]),s.push(i<n?e.genes[i]:i<o?this.genes[i]:e.genes[i]);return[t,s]}crossoverUniform(e){const t=[],s=[];for(let n=0;n<this.length;n++){let o=Math.random()<.5;t.push(o?e.genes[n]:this.genes[n]),s.push(o?this.genes[n]:e.genes[n])}return[t,s]}crossoverHalfUniform(e){let t=[],s=[];const n=[];for(let t=0;t<this.length;t++)this.genes[t]!==e.genes[t]&&n.push(t);const o=n.length;t=this.genes.slice(),s=e.genes.slice();for(let i=0;i<o/2;i++){let o=Math.floor(Math.random()*n.length);t[n[o]]=e.genes[n[o]],s[n[o]]=this.genes[n[o]],n.splice(o,1)}return[t,s]}crossoverOrdered(e){const t=[],s=[];let n=Math.floor(Math.random()*this.length),o=Math.floor(Math.random()*this.length),i=n;n=Math.min(n,o),o=Math.max(i,o);for(let i=n;i<o;i++)t[i]=e.genes[i],s[i]=this.genes[i];for(let n=0;n<this.length;n++){if(-1===t.indexOf(this.genes[n]))t[n]=this.genes[n];else for(let e=0;e<this.length;e++)-1===t.indexOf(this.genes[e])&&(t[n]=this.genes[e]);if(-1===s.indexOf(e.genes[n]))s[n]=e.genes[n];else for(let t=0;t<this.length;t++)-1===s.indexOf(e.genes[t])&&(s[n]=e.genes[t])}return[t,s]}crossover(e,t){if("number"==typeof t)switch(t){case n.CrossoverMethod.SINGLE_POINT:return this.crossoverSinglePoint(e);case n.CrossoverMethod.TWO_POINT:return this.crossoverTwoPoint(e);case n.CrossoverMethod.UNIFORM:return this.crossoverUniform(e);case n.CrossoverMethod.HALF_UNIFORM:return this.crossoverHalfUniform(e);case n.CrossoverMethod.ORDERED:return this.crossoverOrdered(e);default:throw new Error(`Unimplemented CrossoverMethod: ${t} (${n.CrossoverMethod[t]})`)}return t(e)}setGenes(e){this.genes=[...e]}getGenes(){return this.genes}copy(e){this.genes=e.genes.slice(),this.length=e.length,this.randGene=e.randGene,this.fitness=e.fitness}clone(){const e=r.generate(this.length,this.randGene);return e.copy(this),e}}t.Chromosome=r},348:(e,t)=>{var s;Object.defineProperty(t,"__esModule",{value:!0}),t.CrossoverMethod=void 0,(s=t.CrossoverMethod||(t.CrossoverMethod={}))[s.SINGLE_POINT=0]="SINGLE_POINT",s[s.TWO_POINT=1]="TWO_POINT",s[s.UNIFORM=2]="UNIFORM",s[s.HALF_UNIFORM=3]="HALF_UNIFORM",s[s.ORDERED=4]="ORDERED"},803:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Darwin=void 0;const n=s(446),o=s(348),i=s(666),r=s(675);t.Darwin=class{constructor(e){this.population=[],this.generation=0;const t=()=>{this.stats.needsUpdate=!0};for(let s=0;s<e.populationSize;s++){const s=n.Chromosome.generate(e.chromosomeLength,e.randGene);s.on("update_fitness",t),this.population.push(s)}this.params=Object.assign({crossoverRate:.7,mutationRate:1/e.populationSize,crossoverMethod:o.CrossoverMethod.SINGLE_POINT,mutationMethod:i.MutationMethod.FLIP,eliteCount:Math.ceil(e.populationSize/25),eliteCopies:1},e),this.stats={fittest:this.population[0],averageFitness:0,totalFitness:0,fittestIndex:0,needsUpdate:!0}}duplicateElite(e){const{eliteCount:t,eliteCopies:s}=this.params;if(t>0){const n=this.getTopChromosomes(t);e.push(...n);for(let o=0;o<t;o++)for(let t=0;t<s;t++)e.push(n[o].clone())}}crossover(e){const{populationSize:t,crossoverRate:s,crossoverMethod:o,randGene:i}=this.params;for(;e.length<t;)if(Math.random()<s){const t=this.getRandomChromosome(),s=this.getRandomChromosome(),[r,a]=t.crossover(s,o);e.push(new n.Chromosome(r,i),new n.Chromosome(a,i))}this.params.populationSize%2==1&&e.pop()}mutate(e){for(const t of e)t.mutate(this.params.mutationRate,this.params.mutationMethod)}updateFitness(e){for(let t=0;t<this.population.length;t++){const s=this.population[t];s.setFitness(e(s.getGenes()))}this.stats.needsUpdate=!0}mate(){const e=[];this.duplicateElite(e),this.crossover(e),this.mutate(e),this.population=e,this.generation+=1,this.updateStats(!0)}getPopulation(){return this.population}getChromosomeAt(e){return this.population[e]}getRandomChromosome(){if(this.updateStats(),0===this.stats.totalFitness)return this.population[Math.floor(Math.random()*this.population.length)];const e=Math.random()*this.stats.totalFitness;let t=0;for(let s=0;s<this.population.length;s++)if(t+=this.population[s].getFitness(),t>e)return this.population[s];return this.population[0]}getTopChromosomes(e){return r.selectKBest(this.population,e)}getAverageFitness(){return this.updateStats(),this.stats.averageFitness}getFittest(){return this.updateStats(),this.stats.fittest}getParams(){return this.params}getGeneration(){return this.generation}getStats(){return this.stats}updateStats(e=!1){if(e||this.stats.needsUpdate){let e=0,t=0,s=0;for(let n=0;n<this.population.length;n++){const o=this.population[n].getFitness();e+=o,o>t&&(t=o,s=n)}this.stats.totalFitness=e,this.stats.averageFitness=e/this.params.populationSize,this.stats.fittest=this.population[s].clone(),this.stats.fittestIndex=s,this.stats.needsUpdate=!1}}}},24:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.MonkeyFactory=t.randChar=t.alphabet=void 0;const n=s(803);function o(){return t.alphabet[Math.floor(Math.random()*t.alphabet.length)]}function i(e,t){let s=0,n=Math.max(e.length,t.length)-Math.min(e.length,t.length);for(let n=0;n<Math.min(e.length,t.length);n++)s+=Number(e[n]!==t[n]);return s+n}t.alphabet=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"," ","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","?","!",".","#","@","&","*","$","%","+","-","/","=","0","1","2","3","4","5","6","7","8","9","(",")",",","'",'"',":","_","-"],t.randChar=o,t.MonkeyFactory=class{constructor(e){this.params=Object.assign(Object.assign({},e),{randGene:o})}*search(e){this.params.chromosomeLength=e.length;const t=new n.Darwin(this.params);for(;;){for(const s of t.getPopulation()){const n=i(s.getGenes().join(""),e);if(s.setFitness(Math.pow(2,e.length-n)),0===n)return{generation:t.getGeneration(),averageFitness:t.getAverageFitness(),fittest:s}}t.mate(),yield{averageFitness:t.getAverageFitness(),fittest:t.getFittest(),generation:t.getGeneration()}}}}},660:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=class{constructor(){this.eventHandlers=new Map}on(e,t){var s;this.isListening(e)||this.eventHandlers.set(e,[]),null===(s=this.eventHandlers.get(e))||void 0===s||s.push(t)}isListening(e){return this.eventHandlers.has(e)}emit(e,t,s){var n;if(this.isListening(e))for(const o of null!==(n=this.eventHandlers.get(e))&&void 0!==n?n:[])o.call(s,t)}bindEvent(e,t){e.on(t,(e=>this.emit(t,e)))}removeListener(e){this.eventHandlers.delete(e)}removeListeners(){this.eventHandlers.clear()}}},666:(e,t)=>{var s;Object.defineProperty(t,"__esModule",{value:!0}),t.MutationMethod=void 0,(s=t.MutationMethod||(t.MutationMethod={}))[s.FLIP=0]="FLIP",s[s.SWAP=1]="SWAP"},675:(e,t)=>{function s(e,t=0,o=e.length-1){const i=e[Math.floor((t+o)/2)].getFitness();if(t<o){const r=n(e,t,o,i);s(e,t,r-1),s(e,r,o)}}function n(e,t,s,n){for(;t<=s;){for(;e[t].getFitness()>n;)t++;for(;e[s].getFitness()<n;)s--;t<=s&&([e[t],e[s]]=[e[s],e[t]],t++,s--)}return t}Object.defineProperty(t,"__esModule",{value:!0}),t.selectKBest=void 0,t.selectKBest=function(e,t){return function(e,t,o=0,i=e.length-1){const r=e[Math.floor((o+i)/2)].getFitness();if(o<i){const a=n(e,o,i,r);s(e,o,a-1),a<t&&s(e,a,i)}}(e,t),e.slice(0,t)}}},t={};function s(n){var o=t[n];if(void 0!==o)return o.exports;var i=t[n]={exports:{}};return e[n](i,i.exports,s),i.exports}(()=>{const e=s(24),t=(e,t={},s={})=>{const n=document.createElement(e);for(const[e,s]of Object.entries(t))n[e]=s;for(const e in s){const t=s[e];void 0!==t&&(n.style[e]=t)}return n},n=(e,t)=>{for(const s of t)e.appendChild(s);return e},o=()=>t("br"),i=(e,s)=>{const o=t("input",s);var i;return{elem:n(t("div"),[(i=e,t("span",{textContent:i})),o]),value:()=>o.value}},r=t("input",{type:"text",value:"https://en.wikipedia.org/wiki/Genetic_algorithm"},{width:"400px"}),a=t("button",{textContent:"Go"}),h=t("p",{},{fontSize:"24px"}),l=t("div",{},{fontSize:"24px"}),u=i("Population",{type:"number",value:"200"}),g=i("Crossover rate",{type:"number",value:"0.7",min:"0",max:"1",step:"0.01"}),p=i("Mutation rate",{type:"number",value:"0.02",min:"0",max:"1",step:"0.01"}),c=i("Elite count",{type:"number",value:"15"}),d=i("Elite copies",{type:"number",value:"2"}),m=n(t("div",{},{width:"350px"}),[u.elem,g.elem,p.elem,c.elem,d.elem]);n(document.body,[r,a,o(),h,o(),l,o(),m]),a.addEventListener("click",(()=>{const t=r.value,s=t.split("").find((t=>!e.alphabet.includes(t)));if(s)alert(`The character '${s}' cannot be used`);else{const s=new e.MonkeyFactory({populationSize:parseInt(u.value()),chromosomeLength:t.length,crossoverRate:parseFloat(g.value()),mutationRate:parseFloat(p.value()),eliteCount:parseInt(c.value(),10),eliteCopies:parseInt(d.value(),10)}).search(t),n=()=>{const e=s.next();h.textContent=e.value.fittest.getGenes().join("");const o=Math.log2(e.value.fittest.getFitness())/t.length,i=Math.log2(e.value.averageFitness)/t.length;l.innerHTML=`generation: ${e.value.generation}</br>\n                average fitness: ${(100*i).toFixed(4)}% </br>\n                max fitness: ${(100*o).toFixed(4)}% `,e.done||requestAnimationFrame(n)};n()}}))})()})();