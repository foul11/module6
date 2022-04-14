import { UCanvas } from "../_helpers/UCanvas.js";
import { Random } from "../_helpers/Random.js";
const beautify = require('../_helpers/js-beautify.js').js_beautify;
const beautify_settings = {
	"indent_size": 4,
	"indent_char": " ",
	"indent_with_tabs": false,
	"editorconfig": false,
	"eol": "\n",
	"end_with_newline": false,
	"indent_level": 0,
	"preserve_newlines": true,
	"max_preserve_newlines": 10,
	"space_in_paren": false,
	"space_in_empty_paren": false,
	"jslint_happy": false,
	"space_after_anon_function": false,
	"space_after_named_function": false,
	"brace_style": "collapse",
	"unindent_chained_methods": false,
	"break_chained_methods": false,
	"keep_array_indentation": false,
	"unescape_strings": false,
	"wrap_line_length": 0,
	"e4x": false,
	"comma_first": false,
	"operator_position": "before-newline",
	"indent_empty_lines": false,
	"templating": ["auto"]
};

export class Algo_Super_Genetics{
	static QTYPE = {
		GENETIC: 1,
	}
	
	constructor(){
		this.onstart = null;
		this.onend = null;
		this.ondraw = null;
		
		this.speedMul = 1;
		this.epoch = 1000;
		
		this.queue = [];
	}
	
	*update(UCvs, UCvsUpdater){
		if(this.onstart instanceof Function)
			this.onstart.call(this);
		
		let deltaT = 0;
		let i = 0;
		
		while(true){
			if(!(++i % this.speedMul)){
				deltaT = yield;
				UCvsUpdater(deltaT);
			}
			
			if (this.queue.length == 0)
				continue;
			
			this.forceStop = false;
			
			let curr = this.queue.splice(0, 1)[0];
			let next;
			
			switch (curr.type) {
				case Algo_Super_Genetics.QTYPE.GENETIC:
					
					while(!(next = curr.gen.next()).done){
						if(!(++i % this.speedMul))
							deltaT = yield;
						
						if(this.forceStop)
							break;
						
						this.curr_out_population = next.value;
						
						if(!(i % this.speedMul))
							UCvsUpdater(deltaT);
					}
					break;
					
				default:
					throw Error('QTYPE Error');
					break;
			}
			
			if(this.ondraw instanceof Function)
				this.ondraw.call(this, deltaT, null);
		}
		
		if(this.onend instanceof Function)
			this.onend.call(this);
	}
	
	start(){
		this.queue.push({ type: Algo_Super_Genetics.QTYPE.GENETIC, gen: this.genetic(), args: arguments });
	}
	
	*genetic(megas = false, individ_chm_len = 128, individ_start_count = 5000){
		let selection_count = individ_start_count;
		
		let chm_vars = [
			'a', 'b', 'c', 'd', 'e',
		];
		
		if(megas)
			chm_vars.push('f', 'g', 'h', 'j', 'k', 'l', 'z', 'x');
		
		function _check_out(individ, i){
			if(i < individ.chm.length) return false;
			return true;
		}
		
		let chm_ops_a = [];
		
		let chm_ops = {
			math: function(individ, i){
				if(_check_out(individ, ++i)) return ['', 0];
				let chr;
				
				switch(individ.chm[i] % 2){
					case 0: chr = '+'; break;
					case 1: chr = '-'; break;
				}
				
				let op1 = chm_ops.expEM(individ, i);
				let op2 = chm_ops.expEM(individ, i + op1[1]);
				
				return [`(${op1[0]} ${chr} ${op2[0]})`, op1[1] + op2[1] + 1];
			}, /* (exp [operation] exp) */
			
			MegaMath: function(individ, i){
				if(_check_out(individ, ++i)) return ['', 0];
				let chr;
				
				switch(individ.chm[i] % 13){
					case 0: chr = '+'; break;
					case 1: chr = '-'; break;
					case 2: chr = '=='; break;
					case 3: chr = '<'; break;
					case 4: chr = '>'; break;
					case 5: chr = '+='; break;
					case 6: chr = '-='; break;
					case 7: chr = '<='; break;
					case 8: chr = '>='; break;
					case 9: chr = '/'; break;
					case 10: chr = '*'; break;
					case 11: chr = '/='; break;
					case 12: chr = '*='; break;
				}
				
				let op1 = chm_ops.exp(individ, i);
				let op2 = chm_ops.exp(individ, i + op1[1]);
				
				return [`(${op1[0]} ${chr} ${op2[0]})`, op1[1] + op2[1] + 1];
			}, /* (exp [operation] exp) */
			
			binary: function(individ, i){
				if(_check_out(individ, ++i)) return ['', 0];
				let op1 = chm_ops.exp(individ, i);
				
				switch(individ.chm[i] % 3){
					case 0: return [`!${op1[0]}`, op1[1] + 1]; break;
					case 1: return [`${op1[0]}++`, op1[1] + 1]; break;
					case 2: return [`${op1[0]}--`, op1[1] + 1]; break;
				}
			}, /* binary from exp */
			
			exp: function(individ, i){
				if(_check_out(individ, ++i)) return ['', 0];
				
				let op1;
				
				switch(individ.chm[i] % 3){
					case 0: op1 = chm_ops.var(individ, i); break;
					case 1: op1 = chm_ops.num(individ, i); break;
					case 2: op1 = chm_ops.math(individ, i); break;
				}
				
				return [op1[0], op1[1] + 1];
			}, /* (number | var | math) */
			
			MegaExp: function(individ, i){
				if(_check_out(individ, ++i)) return ['', 0];
				
				let op1;
				
				switch(individ.chm[i] % 3){
					case 0: op1 = chm_ops.var(individ, i); break;
					case 1: op1 = chm_ops.num(individ, i); break;
					case 2: op1 = chm_ops.MegaMath(individ, i); break;
				}
				
				return [op1[0], op1[1] + 1];
			}, /* (number | var | math) */
			
			expEM: function(individ, i){
				if(_check_out(individ, ++i)) return ['', 0];
				
				let op1;
				
				switch(individ.chm[i] % 1){
					case 0: op1 = chm_ops.var(individ, i); break;
				}
				
				return [op1[0], op1[1] + 1];
			}, /* (number | var) */
			
			num: function(individ, i){
				if(_check_out(individ, ++i)) return ['', 0];
				let number = individ.chm[i] % 10;
				return [`${number}`, 1];
			}, /* number */
			
			var: function(individ, i){
				if(_check_out(individ, ++i)) return ['', 0];
				let var_name = chm_vars[individ.chm[i] % chm_vars.length];
				return [`${var_name}`, 1];
			}, /* var */
			
			new_var: function(individ, i){
				let op1 = chm_ops.var(individ, i);
				let op2 = chm_ops.num(individ, i + op1[1]);
				return [`let ${op1[0]} = ${op2[0]};`, op1[1] + op2[1]];
			}, /* new_var */
			
			set_var: function(individ, i){
				let op1 = chm_ops.var(individ, i);
				let op2 = chm_ops.exp(individ, i + op1[1]);
				
				return [`${op1[0]} = ${op2[0]};`, op1[1] + op2[1]];
			}, /* set_var */
			
			var_less_in: function(individ, i){
				let op1 = chm_ops.var(individ, i);
				return [`(${op1[0]} < a)`, op1[1]];
			},
			
			for: function(individ, i){
				let op1 = chm_ops.var(individ, i);
				let op2 = chm_ops.var_less_in(individ, i + op1[1]);
				let op3 = chm_ops.swap(individ, i + op1[1] + op2[1]);
				
				return [`for(let ${op1[0]} = 0; ${op2[0]}; ${op1[0]} ++){ yield; ${op3[0]} }`, op1[1] + op2[1] + op3[1]];
			}, /* for(set_var; exp; binary){ op } */
			
			MegaFor: function(individ, i){
				let op1 = chm_ops.set_var(individ, i);
				let op2 = chm_ops.MegaExp(individ, i + op1[1]);
				let op3 = chm_ops.binary(individ, i + op1[1] + op2[1]);
				let op4 = chm_ops.get_r_ops(individ, i + op1[1] + op2[1] + op3[1]);
				
				op1[0] = op1[0].substring(0, op1[0].length - 1);
				
				return [`for(${op1[0]}; ${op2[0]}; ${op3[0]}){ yield; ${op4[0]} }`, op1[1] + op2[1] + op3[1] + op4[1]];
			}, /* for(set_var; exp; binary){ op } */
			
			get_r_ops: function(individ, i){
				if(_check_out(individ, ++i)) return ['', 0];
				
				let op1 = chm_ops_a[i % chm_ops_a.length](individ, i);
				
				return [`${op1[0]}`, op1[1] + 1];
			}, /* any */
			
			double: function(individ, i){
				let op1 = chm_ops.get_r_ops(individ, i);
				let op2 = chm_ops.get_r_ops(individ, i + op1[1]);
				
				return [`${op1[0]} ${op2[0]}`, op1[1] + op2[1]];
			}, /* any any */
			
			triple: function(individ, i){
				let op1 = chm_ops.get_r_ops(individ, i);
				let op2 = chm_ops.get_r_ops(individ, i + op1[1]);
				let op3 = chm_ops.get_r_ops(individ, i + op1[1] + op2[1]);
				
				return [`${op1[0]} ${op2[0]} ${op3[0]}`, op1[1] + op2[1] + op3[1]];
			}, /* any any any */
			
			// foter: function(individ, i){
				// let op1 = chm_ops.get_r_ops(individ, i);
				// let op2 = chm_ops.get_r_ops(individ, i + op1[1]);
				// let op3 = chm_ops.get_r_ops(individ, i + op1[1] + op2[1]);
				// let op4 = chm_ops.get_r_ops(individ, i + op1[1] + op2[1] + op3[1]);
				
				// return [`${op1[0]} ${op2[0]} ${op3[0]} ${op4[0]}`, op1[1] + op2[1] + op3[1] + op4[1]];
			// }, /* any any any any */
			
			swap: function(individ, i){
				let op1 = chm_ops.var(individ, i);
				let op2 = chm_ops.var(individ, i + op1[1]);
				let op3 = chm_ops.var(individ, i + op1[1] + op2[1]);
				let op4 = chm_ops.exp(individ, i + op1[1] + op2[1] + op3[1]);
				
				return [`[b, ${op2[0]}] = [${op3[0]}, ${op4[0]}];`, op1[1] + op2[1] + op3[1] + op4[1]];
			},
			
			MegaSwap: function(individ, i){
				let op1 = chm_ops.var(individ, i);
				let op2 = chm_ops.var(individ, i + op1[1]);
				let op3 = chm_ops.MegaExp(individ, i + op1[1] + op2[1]);
				let op4 = chm_ops.MegaExp(individ, i + op1[1] + op2[1] + op3[1]);
				
				return [`[${op1[0]}, ${op2[0]}] = [${op3[0]}, ${op4[0]}];`, op1[1] + op2[1] + op3[1] + op4[1]];
			},
		};
		
		for(let func in chm_ops)
			chm_ops_a.push(chm_ops[func]);
		
		let chm_code = [
			chm_ops.new_var,
			chm_ops.set_var,
			chm_ops.for,
			'', '', '', '','', '', '', '','', '', '', '','', '', '', '','', '', '', '','', '', '', '',
			
			// 'let b = 0, c = 1;\n',
			// 'for(let i = 0; i < a; i++)\n',
			// '[b, c] = [c, b + c];\n',
		];
		
		if(megas)
			chm_code.push(chm_ops.MegaFor, chm_ops.MegaSwap);
		
		for(let i=0; i < 4; i++)
			chm_code.push(...chm_code);
		
		let chm_max = chm_code.length;
		
		function chm_random(individ, chm_max){
			for(let i = 0; i < individ.chm.length; i++){
				individ.chm[i] = Random.randI(chm_max);
			}
		}
		
		let STATIC_ID = 0;
		function new_individ(individ_chm_len){
			return {
				chm: new Uint32Array(individ_chm_len),
				fit: null,
				code: null,
				id: STATIC_ID++,
			};
		}
		
		function crossover(individ1, individ2, individ_chm_len){
			let individ = new_individ(individ_chm_len);
			
			let randCenter = Random.randI(individ_chm_len + 1);
			let parent1_chm = individ1.chm.subarray(0, randCenter);
			let parent2_chm = individ2.chm.subarray(randCenter);
			
			individ.chm.set(parent1_chm);
			individ.chm.set(parent2_chm, randCenter);
			
			return individ;
		}
		
		
		function mutation(individ1, chm_max, k = 1){
			let individ = new_individ(individ1.chm.length);
			
			individ.chm.set(individ1.chm);
			
			for(let i = 0; i < k; i++)
				individ.chm[Random.randI(individ.chm.length)] = Random.randI(chm_max);
			
			return individ;
		}
		
		function mutation_relactive(individ1, chm_max, k = 1){
			let individ = new_individ(individ1.chm.length);
			
			individ.chm.set(individ1.chm);
			
			for(let i = 0; i < k; i++){
				let index = Random.randI(individ.chm.length);
				
				individ.chm[index] = Math.max(Math.min(chm_max, individ.chm[index] + Math.sign(Math.random() - 0.5)), 0);
			}
			
			return individ;
		}
		
		function clone(individ1){
			let individ = new_individ(individ1.chm.length);
			
			individ.chm.set(individ1.chm);
			
			return individ;
		}
		
		function fitness(n){
			let a = 0, b = 1;
			
			for(let i = 0; i < n; i++)
				[a, b] = [b, a + b];
			
			return a;
		}
		
		let _fitness_cache;
		function fitness_cache(func, n = 30){
			_fitness_cache = new Uint32Array(n);
			
			for(let i = 0; i < n; i++)
				_fitness_cache[i] = func(i);
		}
		
		function fitness_check(func, to = 30){
			for(let i = 0; i < to; i++)
				if(_fitness_cache[i] !== func(i))
					return i;
			
			return to;
		}
		
		function individ_check_fitness(individ, to = 30){
			if(individ.fit !== null) return individ.fit ?? -1;
			
			let code = '';
			let zero_sum = 0;
			
			for(let i = 0; i < individ.chm.length; i++){
				if(individ.chm[i] === 0) continue;
				
				let chmsm = chm_code[individ.chm[i] - 1];
				
				if(chmsm === '')
					zero_sum -= 0.01;
				
				if(chmsm instanceof Function){
					let [str, shift] = chmsm.call(this, individ, i);
					
					code += str;
					i += shift;
				}else
					code += chmsm;
			}
			
			individ.code = code;
			
			let gen_f = null;
			try{
				gen_f = eval(`(function*(a){
					${code}
					return b;
				})`);
				
				return (individ.fit = fitness_check(function(...arg){
					let whileProtFunc = gen_f(...arg);
					let maxIterate = 100;
					let next, i = 0;
					
					while(!(next = whileProtFunc.next()).done)
						if(i++ > maxIterate)
							return -1;
						
					return next.value;
				}, to)) + (individ.fit === 30 ? zero_sum : 0);
			}catch(e){ }
			
			return -1;
		}
		
		function selection(population, max = 1000, to = 30){
			let ret = [];
			let fit = [];
			
			for(let i = 0; i < population.length; i++){
				let individ = population[i];
				let indiFit = individ_check_fitness(individ, to);
				
				if(indiFit === -1) continue;
				
				fit.push([individ, indiFit]);
			}
			
			fit.sort((a, b) => { return b[1] - a[1] == 0 ? b[0].id - a[0].id : b[1] - a[1]; });
			
			let forTo = Math.min(max, fit.length);
			
			for(let i = 0; i < forTo; i++)
				ret.push(fit[i][0]);
			
			return ret;
		}
		
		fitness_cache(fitness);
		
		let population = [];
		
		for(let i = 0; i < individ_start_count; i++){
			let individ = new_individ(individ_chm_len);
			
			chm_random(individ, chm_max);
			population.push(individ);
		}
		
		for(let i = 0; i < selection_count; i++){
			let iterate = population.length;
			
			switch(i % 3){
				case 0:
					for(let j = 0; j < iterate; j++){
						let p1 = population[Random.randI(population.length)];
						let p2 = population[Random.randI(population.length)];
						
						let child1 =  crossover(p1, p2, individ_chm_len);
						let child2 =  crossover(p1, child1, individ_chm_len);
						let child3 =  crossover(child1, p2, individ_chm_len);
						
						// let child4 = crossover(child1, child2, individ_chm_len);
						// let child5 = crossover(child1, child3, individ_chm_len);
						let child6 = crossover(child2, child3, individ_chm_len);
						
						population.push(child1, child2, child3, /*child4, child5,*/ child6);
					}
					break;
				
				case 1:
					for(let j = 0; j < iterate * 2; j++){
						let mutation1 = mutation_relactive(population[Random.randI(population.length)], chm_max, 1);
						let mutation2 = mutation_relactive(population[Random.randI(population.length)], chm_max, 20);
						let mutation3 = mutation_relactive(population[Random.randI(population.length)], chm_max, 10);
						
						population.push(mutation1, mutation2, mutation3);
					}
					break;
					
				case 2:
					for(let j = 0; j < 300; j++){
						let individ = new_individ(individ_chm_len);
						chm_random(individ, chm_max);
						population.push(individ);
					}
					break;
			}
			
			
			population = selection(population, megas ? 3000 : 300);
			
			if(!(i % 50))
				population = population.slice(0, 30);
			
			if(!(i % 111) && !megas && population[0] && (population[0].fit ?? 0) < 8)
				population = [];
			
			yield population;
		}
	}
	
	individ_code(individ){
		return beautify(individ.code, beautify_settings)
	}
}