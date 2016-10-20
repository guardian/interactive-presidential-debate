import {
    select,
    selectAll,
    selection
} from "d3-selection"
import {
	scaleLinear
} from "d3-scale"


import {cancelAnimFrame, requestAnimFrame} from '../lib/raf';


import Question from "./Question"


export default function Debate(data,options) {

	console.log(data,options)

	let container=select(options.container)
			.append("div")
			.attr("class","debate");

	let box = container.node().getBoundingClientRect();
	let WIDTH=box.width;

	let margins={
		top:0,
		left:20,
		right:20,
		bottom:0
	}

	let xscale=scaleLinear().domain([-2,2])
					.range([
						(box.width)/4,
						(box.width)/4+(box.width/2)
					]);

	let questions=[];
	

	container.selectAll("div.question")
					.data(data)
					.enter()
					.append("div")
					.attr("class","question")
					.each(function(d){
						questions.push({
							el:new Question(d,{
									container:this,
									margins:margins,
									xscale:xscale,
									audio:options.audio,
									sample:options.sample
								}),
							position:0
						});
						questions[questions.length-1].position=questions[questions.length-1].el.getTop();

						console.log(questions[questions.length-1].position)
					})
	/*let status={
		selected:findQuestion(document.scrollingElement.scrollTop),
		scroll_top:document.scrollingElement.scrollTop
	}*/
	function findQuestion(scroll_top) {
		//console.log("findQuestion",scroll_top)
		//let scroll_top=e.target.scrollingElement.scrollTop;
		//console.log(scroll_top)
		let selected=questions[0];

		questions.forEach((q,i)=>{
			if(q.position.top-100<=scroll_top) {
				//console.log("found question",i,q.position.top,"-100<=",scroll_top)
				selected=q;
			}
		});
		//console.log("FOUND",selected)
		return selected;
	}
	if(!options.sample) {
		setTimeout(function(){
			let status={
				selected:findQuestion(document.scrollingElement.scrollTop),
				scroll_top:document.scrollingElement.scrollTop
			}
			document.addEventListener("scroll",function(e){
				let scroll_top=e.target.scrollingElement.scrollTop,
					selected=findQuestion(scroll_top);

				status={
					selected:selected,
					scroll_top:scroll_top
				}
			},false);

			let frameRequest = requestAnimFrame(function showSelectedElement(time) {
		        if(status) {
		        	status.selected.el.showElement(status.scroll_top - status.selected.position.top);
					questions.forEach(q=>{
						if(q.position.top!==status.selected.position.top) {
							q.el.hideElement();
						}
					})	
		        }
		        

		        frameRequest = requestAnimFrame(showSelectedElement);
		    });
		},1000)
	}
	
	

}