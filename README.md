# Darwin

Flexible genetic algorithm implementation in TypeScript.

### Demos

- [Smart Eaters](https://nathsou.github.io/Darwin/Demos/SmartEaters/) inspired by [Mat Buckland](http://www.ai-junkie.com/ann/evolved/nnt1.html)
- [Typing Monkeys](https://nathsou.github.io/Darwin/Demos/TypingMonkeys/) inspired by [Daniel Shiffman](http://natureofcode.com/book/chapter-9-the-evolution-of-code/)
- [Traveling Salesman](https://nathsou.github.io/Darwin/Demos/TravelingSalesman/)

## Usage

One must first choose a way of encoding the desired behavior as an array of some type and of evaluating the fitness of any such array.

For instance the 'Typing Monkeys' demo tries to evolve toward a target string, the fitness is simply the number of correct characters present in the randomly generated string.

On the other hand, the 'Smart Eaters' demo evolves the weights and biases of an artificial neural network, the fitness of a 'Eater' is the number of nutriments he eats in one generation.

```javascript
  let genetics = new Darwin<T>({
    population_size: number,
    chromosome_length: number,
    rand_func: () => T,
    crossover_rate?: number,
    mutation_rate?: number,
    crossover_method?: CrossoverMethod,
    mutation_method?: MutationMethod,
    elite_count?: number,
    elite_copies?: number
  });
```

The constructor of the Darwin class initializes a population of random chromosomes, we can now assign a score (or fitness) to each of those chromosomes based on their genes (Chromosome<T>.getBits()):

```javascript
  for (let chromo of genetics.getPopulation()) {
    chromo.setFitness(...);
  }
```

A new generation can then be generated:

```javascript
  genetics.mate();
```

To observe the evolution of the population, one can call:

```javascript
  let avg = genetics.getAverageFitness();
  let max = genetics.getFittest().getFitness();
```
