// import { Vector } from './Vector.js';

/*
[
	{
		value: 'da',
		child: [
			{
				value: 'da',
			},
			{
				value: 'da',
			},
			{
				value: 'da',
			},
		],
	},
]
*/

export function TreeImage(TreeNode){
	function treeHtml(node, to = null){
		let toUL;
		
		if(!to){
			to = $('<ul class="tree">');
			toUL = to;
		}else
			toUL = $('<ul>');
		
		for(let i in node){
			let obj = node[i];
			let insertObj = $('<li>');
			
			insertObj.append($('<span>'+ obj.value +'</span>'));
			
			if(obj.child !== undefined)
				treeHtml(obj.child, insertObj);
			
			toUL.append(insertObj);
		}
		
		to.append(toUL);
		
		return to;
	}
	
	let css = `
.tree, .tree ul, .tree li {
    list-style: none;
    margin: 0;
    padding: 0 0 0 2px;
    position: relative;
}

.tree {
    margin: 0 0 1em;
    text-align: center;
	
	color: white;
}

.tree, .tree ul {
	display: table;
}

.tree ul {
	width: 100%;
}

.tree li {
	display: table-cell;
	padding: .5em 0;
	vertical-align: top;
}

.tree li:before {
	outline: solid 1px #666;
	content: "";
	left: 0;
	position: absolute;
	right: 0;
	top: 0;
}

.tree li:first-child:before {left: 50%;}
.tree li:last-child:before {right: 50%;}

.tree code, .tree span {
	border: solid .1em #666;
	border-radius: .2em;
	display: inline-block;
	margin: 0 .2em .5em;
	padding: .2em .5em;
	position: relative;
}

.tree code {
	font-family: monaco, Consolas, 'Lucida Console', monospace;
}

.tree ul:before,
.tree code:before,
.tree span:before {
	outline: solid 1px #666;
	content: "";
	height: .45em;
	left: 50.5%;
	position: absolute;
}

.tree ul:before {
	top: -.5em;
}

.tree code:before,
.tree span:before {
	top: -.55em;
}

.tree > li {margin-top: 0;}
.tree > li:before,
.tree > li:after,
.tree > li > code:before,
.tree > li > span:before {
	outline: none;
}
	`;
	
	let svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
	<foreignObject width="100%" height="100%">
		<div xmlns="http://www.w3.org/1999/xhtml">
			<style>
				${css}
			</style>
			
			${treeHtml(TreeNode)[0].outerHTML}
		</div>
	</foreignObject>
</svg>
	`;
	
	return new Promise((resolve) => {
		let img = new Image();
		let url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
		
		img.src = url;
		img.onload = function(){
			URL.revokeObjectURL(url);
			resolve(img);
		};
	});
};