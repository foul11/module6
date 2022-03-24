export class Config{
	// constructor(){
		
	// }
	
	static _cyrb53(str, seed = 0){
		let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
		
		for(let i = 0, ch; i < str.length; i++){
			ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		
		h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
		h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
		
		return 4294967296 * (2097151 & h2) + (h1>>>0);
	}
	
	static add(conf, to = null, radio = null, onExtends = {}){
		if(!to) to = $('.config_box > .inputs');
		
		for(let i in conf){
			let obj = conf[i];
			let insertObj;
			let propObj;
			
			switch(obj.type){
				case 'vert':
				case 'horz':
					insertObj = $('<div class="'+ obj.type +' noWrapper">');
					propObj = insertObj;
					break;
					
				case 'text':
				case 'number':
					insertObj = $('<input type="'+ obj.type +'">');
					propObj = insertObj;
					break;
					
				case 'range':
					insertObj = $('<label><span></span><input type="range"></label>');
					propObj = $('input', insertObj);
					
					let span = $('span', insertObj);
					
					span.data('text', obj.value);
					propObj.on('input', () => { span.html(span.data('text') + ' ('+ propObj.val() +')'); });
					break;
					
				case 'button':
					insertObj = $('<button>');
					propObj = insertObj;
					break;
					
				case 'checkbox':
					insertObj = $('<label class="inline"><input type="checkbox"></label>');
					propObj = $('input', insertObj);
					break;
					
				case 'radio':
					insertObj = $('<input type="radio">');
					propObj = insertObj;
					
					if(radio !== null) insertObj.attr('name', this._cyrb53(obj.radio || radio));
					break;
					
				case 'string':
					insertObj = $('<span class="string">');
					propObj = insertObj;
					
					insertObj.html(obj.value);
					break;
					
				case 'wrapper-vert':
					insertObj = $('<div class="vert"/>');
					propObj = insertObj;
					break;
					
				case 'wrapper':
				default:
					insertObj = $('<div/>');
					propObj = insertObj;
					break;
			}
			
			for(let prop in obj){
				if(prop === 'radio') continue;
				if(prop === 'child') continue;
				if(prop === 'type') continue;
				if(prop === 'on') continue;
				if(obj.type === 'range'){
					if(prop === 'value') continue;
					if(prop === 'init'){
						propObj.attr('value', obj[prop]);
						continue;
					}
				}
				if(obj.type === 'string' && prop === 'value') continue;
				
				propObj.attr(prop, obj[prop]);
			}
			
			if(obj.type === 'range'){
				let span = $('span', insertObj);
				
				span.html(span.data('text') + ' ('+ propObj.val() +')');
			}
			
			if(obj.on !== undefined)
				for(let event in obj.on){
					if(	event === 'text' ||
						event === 'number' ||
						event === 'range' ||
						event === 'button' ||
						event === 'checkbox' ||
						event === 'radio' ||
						event === 'span'){
						onExtends = $.extend(true, {}, onExtends, { [event]: obj.on[event] });
						continue;
					};
					
					propObj.on(event, obj.on[event]);
				}
			
			for(let trg in onExtends)
				if(obj.type == trg)
					for(let event in onExtends[trg])
						propObj.on(event, onExtends[trg][event]);
			
			if(obj.child !== undefined)
				this.add(obj.child, insertObj, obj.radio || radio, onExtends);
			
			to.append(insertObj);
		}
	}
	
	static clear(){
		$('.config_box > .inputs').children().remove();
	}
}