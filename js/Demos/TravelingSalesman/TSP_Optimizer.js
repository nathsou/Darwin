class TSP_Optimizer {
    constructor(cities = []) {
        this.shuffled = [];
        this.model = [];
        this.cities = cities;
        this.CITY_COUNT = cities.length;
        this.tsp = new TSP(cities);
        for (let i = 0; i < this.CITY_COUNT; i++)
            this.model[i] = i;
        this.genetics = new Darwin({
            population_size: 200,
            chromosome_length: this.CITY_COUNT,
            rand_func: (() => {
                if (this.shuffled.length === 0)
                    this.shuffled = TSP_Optimizer.shuffle(this.model.slice());
                return this.shuffled.pop();
            }).bind(this),
            crossover_method: CrossoverMethod.ORDERED,
            mutation_method: MutationMethod.SWAP
        });
    }
    static shuffle(a) {
        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }
        return a;
    }
    newGen() {
        for (let path of this.genetics.getPopulation())
            path.setFitness(Math.exp(10000000 / this.tsp.distance_squared(path.getBits())));
        if (this.genetics.generation % 100 === 0)
            console.log(`generation ${this.genetics.generation},
                            fittest: ${this.genetics.getFittest().getFitness().toFixed(4)}
                            avg: ${this.genetics.getAverageFitness().toFixed(4)}`);
        this.genetics.mate();
    }
    optimize(ctx) {
        let fittest = 0, count = 0;
        if (ctx) {
            let update = () => {
                if (count === 10 || this.genetics.generation === 1000)
                    return;
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
        }
        else {
            while (this.genetics.generation !== 1000 && count !== 10) {
                this.newGen();
                if (fittest === this.genetics.getFittest().getFitness())
                    count++;
                else {
                    fittest = this.genetics.getFittest().getFitness();
                    count = 0;
                    this.drawShortestPath(ctx);
                }
            }
        }
        return this.genetics.getFittest().getBits();
    }
    drawShortestPath(ctx) {
        this.tsp.draw(ctx, this.genetics.getFittest().getBits());
    }
}
