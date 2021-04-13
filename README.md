[![NPM Package][npm]][npm-url]
[![Build Size][build-size]][build-size-url]

# Darwin

Flexible genetic algorithm implementation in TypeScript.

## Installation

```bash
npm install charles.darwin
```

Darwin is compatible with ES6 modules

### Demos

- [Smart Eaters](https://nathsou.github.io/Darwin/SmartEaters/) inspired by [Mat Buckland](http://www.ai-junkie.com/ann/evolved/nnt1.html)
- [Typing Monkeys](https://nathsou.github.io/Darwin/TypingMonkeys/) inspired by [Daniel Shiffman](http://natureofcode.com/book/chapter-9-the-evolution-of-code/)
- [Traveling Salesman](https://nathsou.github.io/Darwin/TSP/)
- [Text Deblurring](https://nathsou.github.io/Darwin/DeblurText/)

## Usage

One must first choose a way of encoding the desired behavior as an array of some type (a chromosome) and of evaluating the fitness of any such chromosome.

For instance the 'Typing Monkeys' demo tries to evolve towards a target string, the fitness is simply the number of correct characters present in the randomly generated string.

On the other hand, the 'Smart Eaters' demo evolves the weights and biases of an artificial neural network, the fitness of an 'Eater' is the number of nutriments it eats in one generation (2000 ticks).

```typescript
  const population = new Darwin<T>({
    populationSize: number,
    chromosomeLength: number,
    randomGene: () => T,
    crossoverRate?: number = 0.7,
    mutationRate?: number = 1 / populationSize,
    crossoverMethod?: CrossoverFunction<T> = crossoverMethod.singlePoint,
    mutationMethod?: MutationFunction<T> = mutationMethod.flip,
    eliteCount?: number = Math.ceil(populationSize / 25),
    eliteCopies?: number = 1,
    randomNumber?: () => number = Math.random
  });
```

The constructor of the Darwin class initializes a population of random chromosomes, we can now assign a score (or fitness) to each of those chromosomes based on their genes represented by an array of the type returned by the randomGene function :

```typescript
  for (const chromo of population.getPopulation()) {
    chromo.setFitness(evalFitness(chromo.getGenes()));
  }

  // shorthand:
  population.updateFitness(genes => evalFitness(genes));
```

A new generation can then be generated by calling the mate() method:

```typescript
  population.mate();
```

To observe the evolution of the population, one can call:

```typescript
  const {
    fittest,
    fittestIndex,
    averageFitness,
    totalFitness
  } = population.updateStats();
```

[npm]: https://img.shields.io/npm/v/charles.darwin
[npm-url]: https://www.npmjs.com/package/charles.darwin
[build-size]: https://badgen.net/bundlephobia/minzip/charles.darwin
[build-size-url]: https://bundlephobia.com/result?p=charles.darwin