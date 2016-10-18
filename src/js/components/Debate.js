import {
    select,
    selectAll,
    selection
} from "d3-selection"
import {
	sum,
	extent
} from "d3-array"
import {
	scaleLinear,
	scaleSqrt
} from "d3-scale"
import {
	line as d3_line,
	curveBasis as curve
} from "d3-shape"

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
						(box.width)/4+(box.width/2)*0,
						(box.width)/4+(box.width/2)*((0+1)%2)
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
									audio:options.audio
								}),
							position:0
						});
						questions[questions.length-1].position=questions[questions.length-1].el.getTop();

						console.log(questions[questions.length-1].position)
					})
	document.addEventListener("scroll",function(e){
		let scroll_top=e.target.scrollingElement.scrollTop;
		console.log(scroll_top)
		let selected=questions[0];
		questions.forEach(q=>{
			//console.log("CHECK",q.position.top,"<=",scroll_top)
			if(q.position.top-100<=scroll_top) {
				selected=q;
				//console.log("SELECTING",q)
			}
		});
		//console.log("SELECTED",selected)
		selected.el.showElement(scroll_top - selected.position.top);

	},false)
}
/*
function old_Debate(data,options) {

    console.log(data)

	let container=select(options.container)
			.append("div")
			.attr("class","debate");
	let box = container.node().getBoundingClientRect();
	let WIDTH=box.width,
		data_length=sum(data,d=>(d.data.length)),
		HEIGHT=data_length*10;

	let margins={
		top:30,
		left:0,
		right:0,
		bottom:30
	}
	console.log(data_length,options.extents.w[1])
	let xscale=scaleLinear().domain([-1,1]).range([(box.width)/4+(box.width/2)*0,(box.width)/4+(box.width/2)*((0+1)%2)]);
	let wscale=scaleSqrt().domain([0,options.extents.w[1]]).range([0,14]);
	let yscale=scaleLinear().domain(options.extents.time).range([0,HEIGHT-(margins.top+margins.bottom)])

	let main_line=d3_line()
                    .x(d=>(d.x))
                    .y(d=>(d.y))
                    .curve(curve)//.tension(0.25))

	let svg=container.append("svg")
				.attr("width",WIDTH)
				.attr("height",HEIGHT)

	let defs=svg.append("defs");

    let gooey=defs.append("filter")
    		.attr("id","gooey");


    gooey.append("feGaussianBlur")
    		.attr("in","SourceGraphic")
    		.attr("stdDeviation","10")
    		.attr("result","blur");

    gooey.append("feColorMatrix")
    		.attr("in","blur")
    		.attr("mode","matrix")
    		.attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9")
    		.attr("result","gooey")

    gooey.append("feComposite")
    		.attr("in","SourceGraphic")
    		.attr("in2","gooey")
    		.attr("operator","atop")


  	let marker=defs.selectAll("marker")
  					.data(["gop","dem"])
  					.enter()
  						.append("marker")
  						.attrs({
  							id:d=>"arrow-"+d,
  							markerWidth:13,
  							markerHeight:13,
  							refX:0,
  							refY:6.25,
  							orient:"auto",
  							markerUnits:"userSpaceOnUse"
  						})
  						.append("path")
  							.attrs({
  								"d":"M0,2 L0,10 L10,6 z",
  								"class":(d)=>(`marker-arrow ${d}`)
  							})


	let candidates=svg.append("g")
			.attr("class","candidates")
			.attr("transform",`translate(${margins.left},${margins.top})`)

	let candidate=candidates.selectAll("g.candidate")
						.data(data)
						.enter()
						.append("g")
							.attr("class","candidate")
							.each(function(d,i){
								if(d.candidate==="question") {
									new Question(d,{
										container:this,
										width:box.width/2,
										height:HEIGHT,
										xscale:xscale,
										wscale:wscale,
										yscale:yscale,
										main_line:main_line,
										party:d.party,
										x:xscale(0),
										position:[
											(box.width)/4+(box.width/2)*i,
											(box.width)/4+(box.width/2)*((i+1)%2)
										]
									})
								} else {
									new Candidate(d,{
										container:this,
										width:box.width/2,
										height:HEIGHT,
										xscale:xscale,
										wscale:wscale,
										yscale:yscale,
										main_line:main_line,
										party:d.party,
										position:[
											(box.width)/4+(box.width/2)*i,
											(box.width)/4+(box.width/2)*((i+1)%2)
										]
									})
								}
								
							})

}*/