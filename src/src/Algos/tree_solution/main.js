export class Algo_Tree_Solution{
	predicates = {
		'==': function (a, b) { return a == b },
		'>=': function (a, b) { return a >= b },
	}
	
	constructor(width, height){
		this.width = width;
		this.height = height;
		
		this.root = null;
	}
	
	*update(UCvs, UCvsUpdater){
		if(this.onstart instanceof Function)
			this.onstart.call(this);
		
		let deltaT = 0;
		// let i = 0;
		
		while(true){
			// if(!(++i % this.speedMul)){
				deltaT = yield;
				UCvsUpdater(deltaT);
			// }
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, null);
		}
		
		if(this.onend instanceof Function)
			this.onend.call(this);
	}
	
	gen_new(trainSet, ignore, category, minItemsCount = 1, entropyThrehold = 0.01, maxTreeDepth = 70){
		this.root = this.init(trainSet, this.arrayToHashSet(ignore), category, minItemsCount, entropyThrehold, maxTreeDepth);
	}
	
	init(trainSet, ignore, category, minItemsCount, entropyThrehold, maxTreeDepth) {
		if(maxTreeDepth == 0 || trainSet.length <= minItemsCount)
			return { category: this.mostFrequentValue(trainSet, category) };

		let initEntropy = this.entropy(trainSet, category);

		if(initEntropy <= entropyThrehold)
			return { category: this.mostFrequentValue(trainSet, category) };
		
		let alreadyChecked = {};
		let bestSplit = { gain: 0 };

		for(let i = trainSet.length - 1; i >= 0; i--){
			let item = trainSet[i];
			
			for(let attr in item){
				if(attr == category || ignore[attr])
					continue;
				
				let pivot = item[attr];
				let predicateName;
				
				if(typeof pivot == 'number')
					predicateName = '>=';
				else
					predicateName = '==';

				let attrPredPivot = attr + predicateName + pivot;
				
				if(alreadyChecked[attrPredPivot])
					continue;
				
				alreadyChecked[attrPredPivot] = true;

				let predicate = this.predicates[predicateName];
				let currSplit = this.split(trainSet, attr, predicate, pivot);
				
				let matchEntropy = this.entropy(currSplit.match, category);
				let notMatchEntropy = this.entropy(currSplit.notMatch, category);
				
				let newEntropy = 0;
				
				newEntropy += matchEntropy * currSplit.match.length;
				newEntropy += notMatchEntropy * currSplit.notMatch.length;
				newEntropy /= trainSet.length;
				let currGain = initEntropy - newEntropy;

				if(currGain > bestSplit.gain){
					bestSplit = currSplit;
					bestSplit.predicateName = predicateName;
					bestSplit.predicate = predicate;
					bestSplit.attribute = attr;
					bestSplit.pivot = pivot;
					bestSplit.gain = currGain;
				}
			}
		}

		if(!bestSplit.gain)
			return { category: this.mostFrequentValue(trainSet, category) };
		
		let matchSubTree = this.init(bestSplit.match, ignore, category, minItemsCount, entropyThrehold, maxTreeDepth - 1);
		let notMatchSubTree = this.init(bestSplit.notMatch, ignore, category, minItemsCount, entropyThrehold, maxTreeDepth - 1);

		return {
			attribute: bestSplit.attribute,
			predicate: bestSplit.predicate,
			predicateName: bestSplit.predicateName,
			pivot: bestSplit.pivot,
			match: matchSubTree,
			notMatch: notMatchSubTree,
			matchedCount: bestSplit.match.length,
			notMatchedCount: bestSplit.notMatch.length
		};
	}

	arrayToHashSet(array){
		let hashSet = {};
		
		if(array)
			for(let i in array) {
				let attr = array[i];
				hashSet[attr] = true;
			}
			
		return hashSet;
	}

	countUniqueValues(items, attr){
		let counter = {};
		
		for(let i = items.length - 1; i >= 0; i--)
			counter[items[i][attr]] = 0;
		
		for(let i = items.length - 1; i >= 0; i--)
			counter[items[i][attr]] += 1;

		return counter;
	}

	entropy(items, attr){
		let counter = this.countUniqueValues(items, attr);

		let entropy = 0;
		let p;
		
		for (let i in counter) {
			p = counter[i] / items.length;
			entropy += -p * Math.log(p);
		}

		return entropy;
	}

	split(items, attr, predicate, pivot){
		let match = [];
		let notMatch = [];

		let item,
			attrValue;
		  
		for(let i = items.length - 1; i >= 0; i--){
			item = items[i];
			attrValue = item[attr];
			
			if (predicate(attrValue, pivot))
				match.push(item);
			else
				notMatch.push(item);
		};

		return {
			match: match,
			notMatch: notMatch
		};
	}

	mostFrequentValue(items, attr){
		let counter = this.countUniqueValues(items, attr);

		let mostFrequentCount = 0;
		let mostFrequentValue;

		for(let value in counter){
			if(counter[value] > mostFrequentCount){
				mostFrequentCount = counter[value];
				mostFrequentValue = value;
			}
		};

		return mostFrequentValue;
	}

	predict(item){
		if(!this.root) return;
		
		let tree = this.root;
		let attr,
			value,
			predicate,
			pivot;
		
		while(true){
			if(tree.category)
				return tree.category;

			attr = tree.attribute;
			value = item[attr];

			predicate = tree.predicate;
			pivot = tree.pivot;
			
			if(predicate(value, pivot))
				tree = tree.match;
			else
				tree = tree.notMatch;
		}
	}
}