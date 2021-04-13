(()=>{"use strict";var e={446:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Chromosome=void 0;class n{constructor(e,t,n){this.genes=[],this.fitness=0,this.randGene=t,this.randNum=n,this.genes=e,this.length=e.length}static generate(e,t,s){const o=[];for(let n=0;n<e;n++)o.push(t());return new n(o,t,s)}getFitness(){return this.fitness}setFitness(e){this.fitness=e}compare(e){let t=0;for(let n=0;n<Math.min(this.length,e.length);n++)t+=this.genes[n]!==e.genes[n]?1:0;return t}mutateWith(e=1/this.length,t){t(this,e)}crossoverWith(e,t){return t(this,e)}setGenes(e){this.genes=[...e]}getGenes(){return this.genes}copy(e){this.genes=e.genes.slice(),this.length=e.length,this.randGene=e.randGene,this.fitness=e.fitness}clone(){const e=n.generate(this.length,this.randGene,this.randNum);return e.copy(this),e}randomGene(){return this.randGene()}randomNumber(){return this.randNum()}}t.Chromosome=n},348:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.crossoverMethod=void 0,t.crossoverMethod={singlePoint:(e,t)=>{const n=Math.floor(e.randomNumber()*e.getGenes().length);return[[...e.getGenes().slice(0,n),...t.getGenes().slice(n)],[...t.getGenes().slice(0,n),...e.getGenes().slice(n)]]},twoPoint:(e,t)=>{const n=[],s=[],o=e.getGenes(),r=t.getGenes(),a=e.getGenes().length;let i=Math.floor(e.randomNumber()*a),h=Math.floor(e.randomNumber()*a);i>h&&([i,h]=[h,i]);for(let e=0;e<a;e++)n.push(e<i?o[e]:e<h?r[e]:o[e]),s.push(e<i?r[e]:e<h?o[e]:r[e]);return[n,s]},uniform:(e,t)=>{const n=[],s=[],o=e.getGenes(),r=t.getGenes(),a=e.getGenes().length;for(let t=0;t<a;t++){const a=e.randomNumber()<.5;n.push(a?r[t]:o[t]),s.push(a?o[t]:r[t])}return[n,s]},halfUniform:(e,t)=>{let n=[],s=[];const o=e.getGenes(),r=t.getGenes(),a=e.getGenes().length,i=[];for(let e=0;e<a;e++)o[e]!==r[e]&&i.push(e);const h=i.length;n=o.slice(),s=r.slice();for(let t=0;t<h/2;t++){let t=Math.floor(e.randomNumber()*i.length);n[i[t]]=r[i[t]],s[i[t]]=o[i[t]],i.splice(t,1)}return[n,s]},ordered:(e,t)=>{const n=[],s=[],o=e.getGenes(),r=t.getGenes(),a=e.getGenes().length;let i=Math.floor(e.randomNumber()*a),h=Math.floor(e.randomNumber()*a),l=i;i=Math.min(i,h),h=Math.max(l,h);for(let e=i;e<h;e++)n[e]=r[e],s[e]=o[e];for(let e=0;e<a;e++){if(-1===n.indexOf(o[e]))n[e]=o[e];else for(let t=0;t<a;t++)-1===n.indexOf(o[t])&&(n[e]=o[t]);if(-1===s.indexOf(r[e]))s[e]=r[e];else for(let t=0;t<r.length;t++)-1===s.indexOf(r[t])&&(s[e]=r[t])}return[n,s]}}},803:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Darwin=void 0;const s=n(446),o=n(348),r=n(666),a=n(675);t.Darwin=class{constructor(e){this.population=[],this.statsNeedUpdate=!0,this.generation=0,this.params=Object.assign({crossoverRate:.7,mutationRate:1/e.populationSize,crossoverMethod:o.crossoverMethod.singlePoint,mutationMethod:r.mutationMethod.flip,eliteCount:Math.ceil(e.populationSize/25),eliteCopies:1,randomNumber:Math.random},e);for(let t=0;t<e.populationSize;t++){const e=s.Chromosome.generate(this.params.chromosomeLength,this.params.randomGene,this.params.randomNumber);this.population.push(e)}this.stats={fittest:this.population[0],averageFitness:0,totalFitness:0,fittestIndex:0}}duplicateElite(e){const{eliteCount:t,eliteCopies:n}=this.params;if(t>0){const s=this.getTopChromosomes(t);e.push(...s);for(let o=0;o<t;o++)for(let t=0;t<n;t++)e.push(s[o].clone())}}crossover(e){const{populationSize:t,crossoverRate:n,crossoverMethod:o,randomGene:r,randomNumber:a}=this.params;for(;e.length<t;)if(this.params.randomNumber()<n){const t=this.getRandomChromosome(),n=this.getRandomChromosome(),[i,h]=t.crossoverWith(n,o);e.push(new s.Chromosome(i,r,a),new s.Chromosome(h,r,a))}this.params.populationSize%2==1&&e.pop()}mutate(e){for(const t of e)t.mutateWith(this.params.mutationRate,this.params.mutationMethod)}updateFitness(e){for(let t=0;t<this.population.length;t++){const n=this.population[t];n.setFitness(e(n.getGenes(),t))}}mate(){const e=[];this.duplicateElite(e),this.crossover(e),this.mutate(e),this.population=e,this.generation+=1,this.statsNeedUpdate=!0}getPopulation(){return this.population}getChromosomeAt(e){return this.population[e]}getRandomChromosome(){if(this.updateStats(),0===this.stats.totalFitness)return this.population[Math.floor(this.params.randomNumber()*this.population.length)];const e=this.params.randomNumber()*this.stats.totalFitness;let t=0;for(let n=0;n<this.population.length;n++)if(t+=this.population[n].getFitness(),t>e)return this.population[n];return this.population[0]}getTopChromosomes(e){return a.selectKBest(this.population,e)}getParams(){return this.params}getGeneration(){return this.generation}getStats(){return this.stats}updateStats(e=!1){if(e||this.statsNeedUpdate){let e=0,t=0,n=0;for(let s=0;s<this.population.length;s++){const o=this.population[s].getFitness();e+=o,o>t&&(t=o,n=s)}this.stats.totalFitness=e,this.stats.averageFitness=e/this.params.populationSize,this.stats.fittest=this.population[n].clone(),this.stats.fittestIndex=n,this.statsNeedUpdate=!1}return this.stats}}},24:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.MonkeyFactory=void 0;const s=n(803),o=n(147);function r(e,t){let n=0,s=Math.max(e.length,t.length)-Math.min(e.length,t.length);for(let s=0;s<Math.min(e.length,t.length);s++)n+=Number(e[s]!==t[s]);return n+s}t.MonkeyFactory=class{constructor(e){this.params=Object.assign(Object.assign({},e),{randomGene:o.randChar})}*search(e){this.params.chromosomeLength=e.length;const t=new s.Darwin(this.params);for(;;){for(const n of t.getPopulation()){const s=r(n.getGenes().join(""),e);if(n.setFitness(Math.pow(2,e.length-s)),0===s)return{generation:t.getGeneration(),averageFitness:t.getStats().averageFitness,fittest:n}}t.mate();const{averageFitness:n,fittest:s}=t.getStats();yield{averageFitness:n,fittest:s,generation:t.getGeneration()}}}}},147:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.randChar=t.alphabet=void 0,t.alphabet=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"," ","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","?","!",".","#","@","&","*","$","%","+","-","/","=","0","1","2","3","4","5","6","7","8","9","(",")",",","'",'"',":","_","-"],t.randChar=function(){return t.alphabet[Math.floor(Math.random()*t.alphabet.length)]}},799:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.namedInput=t.appendChildren=t.createCanvas=t.h=void 0,t.h=(e,t={},n={})=>{const s=document.createElement(e);for(const[e,n]of Object.entries(t))s[e]=n;for(const e in n){const t=n[e];void 0!==t&&(s.style[e]=t)}return s},t.createCanvas=(e={},n={})=>{const s=t.h("canvas",e,n),o=s.getContext("2d");if(null===o)throw new Error("Could not create a 2d canvas");return[s,o]},t.appendChildren=(e,t)=>{for(const n of t)e.appendChild(n);return e},t.namedInput=(e,n)=>{const s=t.h("input",n),o=t.h("span",{textContent:"range"===n.type?`${e} : ${s.value}`:e}),r=t.appendChildren(t.h("div"),[o,s]);return s.addEventListener("change",(()=>{"range"===n.type&&(o.textContent=`${e} : ${s.value}`)})),{elem:r,value:()=>s.value}}},666:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.mutationMethod=void 0,t.mutationMethod={flip:(e,t)=>{const n=e.getGenes(),s=n.length;for(let o=0;o<s;o++)e.randomNumber()<t&&(n[o]=e.randomGene())},swap:(e,t)=>{const n=e.getGenes(),s=n.length;for(let o=0;o<s;o++)if(e.randomNumber()<t){const e=Math.floor(Math.random()*s);[n[o],n[e]]=[n[e],n[o]]}}}},675:(e,t)=>{function n(e,t=0,o=e.length-1){const r=e[Math.floor((t+o)/2)].getFitness();if(t<o){const a=s(e,t,o,r);n(e,t,a-1),n(e,a,o)}}function s(e,t,n,s){for(;t<=n;){for(;e[t].getFitness()>s;)t++;for(;e[n].getFitness()<s;)n--;t<=n&&([e[t],e[n]]=[e[n],e[t]],t++,n--)}return t}Object.defineProperty(t,"__esModule",{value:!0}),t.selectKBest=void 0,t.selectKBest=function(e,t){return function(e,t,o=0,r=e.length-1){const a=e[Math.floor((o+r)/2)].getFitness();if(o<r){const i=s(e,o,r,a);n(e,o,i-1),i<t&&n(e,i,r)}}(e,t),e.slice(0,t)}}},t={};function n(s){var o=t[s];if(void 0!==o)return o.exports;var r=t[s]={exports:{}};return e[s](r,r.exports,n),r.exports}(()=>{const e=n(24),t=n(147),s=n(799),o=()=>s.h("br"),r=s.h("input",{type:"text",value:"https://en.wikipedia.org/wiki/Genetic_algorithm"},{width:"400px"}),a=s.h("button",{textContent:"Go"}),i=s.h("p",{},{fontSize:"24px"}),h=s.h("div",{},{fontSize:"24px"}),l=s.namedInput("Population",{type:"number",value:"200"}),u=s.namedInput("Crossover rate",{type:"number",value:"0.7",min:"0",max:"1",step:"0.01"}),p=s.namedInput("Mutation rate",{type:"number",value:"0.02",min:"0",max:"1",step:"0.01"}),m=s.namedInput("Elite count",{type:"number",value:"15"}),d=s.namedInput("Elite copies",{type:"number",value:"2"}),c=s.appendChildren(s.h("div",{},{width:"350px"}),[l.elem,u.elem,p.elem,m.elem,d.elem]);s.appendChildren(document.body,[r,a,o(),i,o(),h,o(),c]),a.addEventListener("click",(()=>{const n=r.value,s=n.split("").find((e=>!t.alphabet.includes(e)));if(s)alert(`The character '${s}' cannot be used`);else{const t=new e.MonkeyFactory({populationSize:parseInt(l.value()),chromosomeLength:n.length,crossoverRate:parseFloat(u.value()),mutationRate:parseFloat(p.value()),eliteCount:parseInt(m.value(),10),eliteCopies:parseInt(d.value(),10)}).search(n),s=()=>{const e=t.next();i.textContent=e.value.fittest.getGenes().join("");const o=Math.log2(e.value.fittest.getFitness())/n.length,r=Math.log2(e.value.averageFitness)/n.length;h.innerHTML=`generation: ${e.value.generation}</br>\n                average fitness: ${(100*r).toFixed(4)}% </br>\n                max fitness: ${(100*o).toFixed(4)}% `,e.done||requestAnimationFrame(s)};s()}}))})()})();