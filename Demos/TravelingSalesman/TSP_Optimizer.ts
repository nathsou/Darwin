
class TSP_Optimizer {

    private cities: Point[];
    private CITY_COUNT: number;
    private genetics: Darwin<number>;
    private tsp: TSP;
    private shuffled = [];
    private model = [];
    private convergence_treshold = 20;
    private max_generation = 5000;
    private fitness_k = 15;

    constructor(cities: Point[] = []) {
        this.cities = cities;
        this.CITY_COUNT = cities.length;
        this.tsp = new TSP(cities);

        for (let i = 0; i < this.CITY_COUNT; i++)
            this.model[i] = i;

        this.genetics = new Darwin<number>({
            population_size: 500,
            chromosome_length: this.CITY_COUNT,
            rand_func: (() => {
                if (this.shuffled.length === 0)
                    this.shuffled = TSP_Optimizer.shuffle(this.model.slice());
                
                return this.shuffled.pop();
            }).bind(this),
            crossover_method: CrossoverMethod.ORDERED,
            mutation_method: MutationMethod.SWAP  
        });

         let rect_w = cities.reduce((a: number, b: Point) => a > b.x ? a : b.x, 0),
             rect_h = cities.reduce((a: number, b: Point) => a > b.y ? a : b.y, 0);

        this.fitness_k *= avg_dist_rect(rect_w, rect_h) * this.CITY_COUNT;
    }

    static shuffle(a: number[]) : number[] {

        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }

        return a;
    }

    private newGen() : void {

        for (let path of this.genetics.getPopulation()) {
            let d = this.tsp.distance(path.getBits());
            path.setFitness(2 ** ((this.fitness_k / d)));
        }

        if (this.genetics.generation % 100 === 0) 
            console.log(`generation ${this.genetics.generation},
                            fittest: ${this.genetics.getFittest().getFitness().toFixed(4)}
                            avg: ${this.genetics.getAverageFitness().toFixed(4)}`
            );

            this.genetics.mate();

    }

    public optimize(ctx?: CanvasRenderingContext2D) : number[] { //returns the shortest path found

        let fittest = 0, count = 0;

        if (ctx) { //animate

            let update = () => {

                if (count === this.convergence_treshold || this.genetics.generation === this.max_generation) return;

                this.newGen();
                if (fittest === this.genetics.getFittest().getFitness())
                    count++;
                else {
                    fittest = this.genetics.getFittest().getFitness();
                    count = 0;
                    this.drawShortestPath(ctx);
                }

                requestAnimationFrame(update);
            };

            update();

        } else {
            while(this.genetics.generation !== this.max_generation && count !== this.convergence_treshold) {
                this.newGen();

                if (fittest === this.genetics.getFittest().getFitness())
                    count++;
                else {
                    fittest = this.genetics.getFittest().getFitness();
                    count = 0;
                }
            }
        }


        return this.genetics.getFittest().getBits();

    }

    public drawShortestPath(ctx: CanvasRenderingContext2D) : void {
        this.tsp.draw(ctx, this.genetics.getFittest().getBits());

        ctx.fillStyle = 'black';
        ctx.fillText(`generation ${this.genetics.generation}`, 5, 15);
    }

}

//http://www.math.uni-muenster.de/reine/u/burgstal/d18.pdf
function avg_dist_rect(w, h) {
	
  let w2 = w ** 2,
  	  w3 = w ** 3,
      h2 = h ** 2,
      h3 = h ** 3,
      d = (w2 + h2) ** 0.5;
      
      return (1 / 15) * (w3 / h2 + h3 / w2 + d *
              (3 - w2 / h2 - h2 / w2) + 2.5 * ((h2 / w) *
      Math.log((w + d) / h) + (w2 / h) * Math.log((h + d) / w)));
}