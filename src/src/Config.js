export class Config{
	static ctx = 'main';
	static idPref = this._cyrb53(this._randomStr(10)) + '_';
	
	// constructor(){
		
	// }
	
	static _randomStr(length){
		let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let charactersLength = characters.length;
		let result = '';
		
		for(let i = 0; i < length; i++){
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		
		return result;
	}
	
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
	
	static add(conf, name = null, to = null, radio = null, onExtends = {}){
		if(!to){
			to = $('.config_box > .inputs');
			
			if(!name) name = this._cyrb53(this._randomStr(10));
			let nameId = this.idPref + this._cyrb53(this.ctx) + '_' + name
			
			if($('block#'+ nameId, to).length)
				return null;
			
			to.append($('<block id="'+ nameId +'" ctx="'+ this.ctx +'">'));
			to = $('block#'+ nameId, to);
		}
		
		for(let i in conf){
			let obj = conf[i];
			let insertObj;
			let propObj;
			
			switch(obj.type){
				case 'vert':
				case 'horz':
				case 'pad0125em':
				case 'pad025em':
				case 'pad05em':
				case 'pad1em':
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
					
					if(radio !== null) insertObj.attr('name', this._cyrb53(this.ctx + (obj.radio || radio)));
					break;
				
				case 'color':
					insertObj = $('<input type="color">');
					propObj = insertObj;
					break;
					
				case 'file':
					insertObj = $('<input type="file">');
					propObj = insertObj;
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
				if(prop === 'class'){
					propObj.addClass(obj[prop]);
					continue;
				}
				if(obj.type === 'string' && prop === 'value') continue;
				if(prop === 'id') obj[prop] = this.ctx +'-'+ obj[prop];
				
				propObj.attr(prop, obj[prop]);
			}
			
			if(obj.type === 'range'){
				let span = $('span', insertObj);
				
				span.html(span.data('text') + ' ('+ propObj.val() +')');
			}
			
			let CreateFunc = null;
			
			if(obj.on !== undefined)
				for(let event in obj.on){
					if(!(obj.on[event] instanceof Function)){
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
				this.add(obj.child, name, insertObj, obj.radio || radio, onExtends);
			
			to.append(insertObj);
			propObj.triggerHandler('Config:create');
		}
		
		return name;
	}
	
	static getForName(name){
		return $('.config_box > .inputs > block#'+ this.idPref + this._cyrb53(this.ctx) + '_' + name);
	}
	
	static remove(name){
		$('.config_box > .inputs > block#'+ this.idPref + this._cyrb53(this.ctx) + '_'  + name).remove();
	}
	
	static clear(){
		$('.config_box > .inputs [ctx="'+ this.ctx +'"]').remove();
	}
	
	static clearAll(){
		$('.config_box > .inputs').children().remove();
	}
	
	static setCtx(ctx = 'main'){
		this.ctx = ctx;
		
		$('.config_box > .inputs').children().each((i, v) => {
			v = $(v);
			
			if(v.attr('ctx') === this.ctx)
				v.show();
			else
				v.hide();
		});
	}
}