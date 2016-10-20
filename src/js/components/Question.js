import {
    select,
    selectAll,
    selection
} from "d3-selection"
import {
	range
} from 'd3-array'
import {
	line as d3_line,
	curveCardinal as curve,
	curveBasis,
	arc as d3_arc
} from "d3-shape"

import roundPathCorners from "../lib/SVGPathRounding";

import Candidate from "./Candidate"

import arms from  '../../assets/imgs/arms.svg!text';

export default function Question(question_data,options) {

	console.log("QUESTION",question_data,options)

	

	let question_text=question_data.summary;

	let margins=options.margins;

	let container=select(options.container)
					
						

	let answers=question_data.answers
					//.filter(a=>(a.type!=='question'))
					.map(d=>{
						d.side=0;
						if(d.from==="clinton") {
							d.party="dem";
							d.side=1 + (d.evasive?1:0);
						}
						if(d.from==="trump") {
							d.party="gop"
							d.side=-1 - (d.evasive?1:0);
						}
						return d;
					})

	let INTRO_HEIGHT=42,
		ANSWER_HEIGHT=42,
		CURVE_DISTANCE=1/2.5;
	if(!options.sample) {
		container.append("h2")
							.attr("class","question-title")
							.html(question_text || "Lorem ipsum dolor sit amet, consectetur adipisicing elit.")
		container.append("p")
							.attr("class","question-summary")
							.html("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa ullam, corporis dicta dolor deserunt voluptate, possimus accusamus eligendi.")
	}
	container=container.append("div").attr("class","dialogue");
	
	let svg=container.append("svg")
					//.attr("width",options.width)
					.attr("height",INTRO_HEIGHT+answers.length*ANSWER_HEIGHT+(margins.top+margins.bottom))

	let box = svg.node().getBoundingClientRect();


	let arms_g=svg
		.append("g")
		.attr("transform","translate(-200,-200)");

	arms_g.node().innerHTML=arms;

	let trump_arm=arms_g.select("#trump-arm").attr("transform","scale(0.5)translate(5,0)"),
		clinton_arm=arms_g.select("#clinton-arm").attr("transform","scale(0.5)translate(-6,0)");


	let WIDTH=box.width;
	options.xscale.range([
		0,
		WIDTH - (margins.left+margins.right)
	]);

	let defs=svg.append("defs");
	if(options.sample) {
		addArrowDefs(defs);	
	}
	
	addShadow(defs);
	addGradient(defs);
	addArms(defs);
	arms_g.remove();

	let axes=svg.append("g")
			.attr("class","axes")
			.attr("transform",`translate(${margins.left},${margins.top})`)

	

	let candidates=svg.append("g")
			.attr("class","candidates")
			.attr("transform",`translate(${margins.left},${margins.top})`)
	
	let main_line=d3_line()
                    .x(d=>(d.x))
                    .y(d=>(d.y))
                    //.curve(curve.tension(0.95))//.alpha(0.5)
   
    let arrow_line=d3_line()
                    .x(d=>(d.x))
                    .y(d=>(d.y))
                    .curve(curveBasis)

    let drawMainLine=(data)=>{
    	let points=[];
    	let start=[
    			{
    	    		x:options.xscale(0),
    	    		y:data[0].y - ANSWER_HEIGHT
    	    	},
    	    	{
    	    		x:options.xscale(0),
    	    		y:data[0].y - ANSWER_HEIGHT + ANSWER_HEIGHT*CURVE_DISTANCE
    	    	}
    	    ];

    	data.forEach((d,i)=>{
    		points.push({
    			x:d.x,
    			y:d.y-ANSWER_HEIGHT*CURVE_DISTANCE
    		});
    		points.push(d);
    		if(i<data.length-1) {
    			points.push({
	    			x:d.x,
	    			y:d.y+ANSWER_HEIGHT*CURVE_DISTANCE
	    		});
    		}
    	})
    	
    	let p=main_line(start.concat(points)),
    		p_space=p.replace(/[,]/gi," ").replace(/L/gi," L ").replace(/M/gi,"M "),
    		n_p=roundPathCorners(p_space,5);

    	// console.log(p);
    	// console.log(p_space);
    	// console.log(n_p);

    	return n_p;
    }

	/*let answer_path=candidates.append("path")
						.attr("class","main")
						.attr("d",()=>{
							console.log("ANSWER",answers)
							return drawMainLine(answers.map((d,i)=>{
								//console.log(d,d.side,options.xscale(d.side),i)
								//console.log(options.xscale(d.side),i*ANSWER_HEIGHT)
								return {
									x:options.xscale(d.side),
									y:i*ANSWER_HEIGHT+INTRO_HEIGHT
								}
							}))
						})*/

	let answer=candidates.selectAll("g.answer")
					.data(answers)
					.enter()
					.append("g")
						.attr("class",d=>`answer side${Math.abs(d.side)}`)
						.classed("dem",d=>d.from==="clinton")
						.classed("gop",d=>d.from==="trump")
						.classed("quest",d=>(d.from!=="trump" && d.from!=="clinton"))
						.attr("rel",d=>d.from)
						.each((d,i)=>{
							let x=options.xscale(d.side),
								y=i*ANSWER_HEIGHT+INTRO_HEIGHT;
							d.left=x;
							d.top=y;
						})
						
	function drawArc(d,next_answer,n=1,f=1/3,direction=1) {
		
		let x1=0,
			y1=0,
			x2=next_answer.left-d.left,
			y2=next_answer.top-d.top;

		let k=Math.sqrt(x2*x2+y2*y2)*f;

		if(direction<0) {
			x1=next_answer.left-d.left;
			y1=next_answer.top-d.top;
			x2=0;
			y2=0;

			k=Math.sqrt(x1*x1+y1*y1)*f;
		}
		
		let dir=x1+x2;
		
		x1+=d.left;
		y1+=d.top;
		x2+=d.left;
		y2+=d.top;
		

		var cx = (x1+x2)/2;
		var cy = (y1+y2)/2;
		var dx = (x2-x1)/2;
		var dy = (y2-y1)/2;
		var i;


		let dd = Math.sqrt(dx*dx+dy*dy);
		let ex = cx + dy/dd * k * (dir<0?-1:1)*(1-(n-1)/2)*direction;
		let ey = cy - dx/dd * k * (dir<0?-1:1)*(1-(n-1)/2)*direction;
		//dwg.path("M"+x1+" "+y1+"Q"+ex+" "+ey+" "+x2+" "+y2).stroke({width:1}).fill('none');
		console.log("path","M"+x1+" "+y1+"Q"+ex+" "+ey+" "+x2+" "+y2)
			
		return "M"+x1+" "+y1+"Q"+ex+" "+ey+" "+x2+" "+y2
	}
	answer.filter((d,i)=>{
			return i<answers.length-1
		})
		.append("path")
			.attrs({
				"class":"shadow",
				d:(d,i)=>{
					let next_answer=answers[i+1];
					if(
						(next_answer.from==="clinton" && d.from==="trump")
						||
						(next_answer.from==="trump" && d.from==="clinton")
					) {
						d.middle={
							x:(next_answer.left+d.left)/2,
							y:(next_answer.top+d.top)/2
						};
						return drawArc(d,answers[i+1],1,0.05);	
					} else {
						return ""
					}
					
				},
				filter:"url(#dropShadow)"
			})
	if(options.sample) {
		answer.filter((d,i)=>{
				if(i>=answers.length-1) {
					return false;
				}
				let next_answer=answers[i+1];
				return (next_answer.from==="clinton" && d.from==="trump") || (next_answer.from==="trump" && d.from==="clinton")
			})
			.append("text")
				.attrs({
					"class":"sample-text bypass",
					"transform":d=>`translate(${d.middle.x-(d.middle.x-d.left)/2},${d.middle.y-15})`
				})
				.selectAll("tspan")
					.data(["They bypass","the moderator"])
					.enter()
					.append("tspan")
						.attrs({
							x:0,
							y:(d,i)=>i*16
						})
						.text(d=>d)
				
	}
	

	answer.filter((d,i)=>{
			return i<answers.length-1
		})
		.append("path")
			.attrs({
				"class":"arrow",
				"d":(d,i)=>{
					let points=[];
					let next_answer=answers[i+1];
					
					if(
						(next_answer.from==="clinton" && d.from==="trump")
						||
						(next_answer.from==="trump" && d.from==="clinton")
					) {
						return drawArc(d,next_answer,1,1/3,1) + (drawArc(d,next_answer,1,1/3.7,-1).replace(/M/,"L"))
					} else {
						let a=next_answer.left-d.left,
							b=next_answer.top-d.top;

						

						let points=[];
						points.push({
							x:d.left,
							y:d.top
						})
						points.push({
							x:d.left,
							y:d.top+ANSWER_HEIGHT*CURVE_DISTANCE
						})
						points.push({
							x:a+d.left,
							y:b-ANSWER_HEIGHT*CURVE_DISTANCE+d.top
						})
						points.push({
							x:a+d.left,
							y:b+d.top
						})
						let p=main_line(points),
			    			p_space=p.replace(/[,]/gi," ").replace(/L/gi," L ").replace(/M/gi,"M "),
			    			n_p=roundPathCorners(p_space,5);
			    		return n_p;
					}
				}
			})
			//.style("stroke","url(#linearGradient)")
			.classed("jump",(d,i)=>{
				let next_answer=answers[i+1];
				return ((next_answer.from==="clinton" && d.from==="trump")
						||
						(next_answer.from==="trump" && d.from==="clinton"))
			})
			.classed("left",(d,i)=>{
				let next_answer=answers[i+1];
				return next_answer.from==="trump"
			})
			.classed("right",(d,i)=>{
				let next_answer=answers[i+1];
				return next_answer.from==="clinton"
			})
	if(options.sample) {
		answer
			.filter(d=>((d.from==="clinton" || d.from==="trump") && (d.text)))
			.append("path")
				.attrs({
					"class":"sample-arrow",
					"d":(d)=>{
						return `M${d.left},0L${d.left},${d.top-35}`;
					},
					"marker-end": "url(#arrow-sample)"
				})
		answer
			.filter(d=>((d.from==="clinton" || d.from==="trump") && (d.text)))
			.append("text")
				.attrs({
					"class":d=>(`sample-text ${d.from} ${d.evasive?"evasive":""}`),
					"transform":d=>{
						let delta=5;
						if(d.from==="clinton" && d.evasive) {
							delta=-5;
						}
						if(d.from==="trump" && !d.evasive) {
							delta=-5;
						}
						return `translate(${d.left+delta},${d.top-70})`
					}
				})
				.selectAll("tspan")
					.data(d=>d.text)
					.enter()
					.append("tspan")
						.attrs({
							x:0,
							y:(d,i)=>(i*16)
						})
						.text(d=>d)
	}
	

	
	let arm=answer
				.filter(d=>(d.toc && d.toc.indexOf("against")>-1))
					.append("g")
						.attrs({
							"class":"arm",
							"transform":d=>`translate(${d.left},${d.top})`
						})
	if(!arm.empty()){
		// arm.select(function(d) {
		// 	if(d.from==="trump") {
		// 		return this.appendChild(trump_arm.node().cloneNode(true))
		// 	}
		// 	if(d.from==="clinton") {
		// 		return this.appendChild(clinton_arm.node().cloneNode(true))
		// 	}
		//   //return this.appendChild(document.createElement("line"));
		// });
		arm.append("use")
				.attrs({
					x:0,
					y:0,
					"xlink:href":d=>`#${d.from}-arm`
				})
		if(options.sample) {
			arm.append("text")
					.attrs({
						"class":"sample-text arm",
						"x":65,
						"y":5
					})
					.text("Refers to Clinton")

		}
	}

	answer.append("circle")
				.attrs({
					cx:d=>d.left,
					cy:d=>d.top,
					r:5
				})
	if(options.sample) {
		answer
			.filter(d=>(d.from!=="clinton" && d.from!=="trump"))
			.append("text")
				.attrs({
					"class":"sample-text moderator",
					x:d=>d.left,
					y:d=>d.top-10
				})
				.text("Moderator")
	}
	answer.append("circle")
				.attrs({
					"class":"big",
					cx:d=>d.left,
					cy:d=>d.top,
					r:10
				})

	
	if(!options.sample) {
		let axis=axes.selectAll("g.axis")
				.data([-2,-1,0,1,2])
				.enter()
				.append("g")
					.attr("class","axis");
		axis.append("line")
				.attrs({
					x1:d=>options.xscale(d),
					y1:answers[0].top,
					x2:d=>options.xscale(d),
					y2:answers[answers.length-1].top
				})	
	}
	

	let key_concepts=container.append("div")
					.attr("class","key-concepts");


	let face=key_concepts
						.append("div")
						.attr("class","face-container")
							.append("div")
								.attr("class","face hidden");
	let kc;
	if(!options.sample) {
		kc=key_concepts.selectAll("div.key-concept")
								.data(answers)
								.enter()
								.append("div")
									.attr("class","key-concept")
									.classed("dem",d=>d.from==="clinton")
									.classed("gop",d=>d.from==="trump")
									.classed("quest",d=>(d.from!=="trump" && d.from!=="clinton"))
									.classed("evasive",d=>d.evasive)
									.classed("left",(d,i)=>{
										if(d.from==="trump" || d.from==="clinton") {
											return false;
										}
										if(d.from!=="trump" && d.from!=="clinton" && answers[i+1] && answers[i+1].from==="clinton") {
											return true;	
										}
										return false;
									})
									.classed("right",(d,i)=>{
										if(d.from==="trump" || d.from==="clinton") {
											return false;
										}
										if(d.from!=="trump" && d.from!=="clinton" && answers[i+1] && answers[i+1].from==="trump") {
											return true;
										} else if(d.from!=="trump" && d.from!=="clinton" && answers[i+1] && answers[i+1].from==="clinton"){
											return false;
										}
										return true;
									})
									.style("top",(d,i)=>{
										return d.top+"px";
									})
		kc.append("p")
			.append("span")
			.attr("class","highlight highlight--wrapping")
			.html(d=>`${(d.key || d.text).slice(0,150)}`);

		kc
			.style("margin-top",function(d){
				let box=this.getBoundingClientRect();
				d.text_height=box.height;
				return (-box.height/2)+"px";
			})
			.select("p")
				.style("margin-top",(d)=>{
					if(d.evasive && d.from==="trump") {
						return (d.text_height/2 + 45)+"px";
					}
					return (d.text_height/2 + 35)+"px";
				})
	}
	function addArrowDefs(defs) {
		let marker=defs.selectAll("marker")
  					.data(["sample"])
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
  								"class":(d)=>(`marker-arrow`)
  							})
	}
	function addArms(defs) {
		//defs.append(trump_arm);
		//defs.append(clinton_arm);
		defs.select(function(d) {
				return this.appendChild(trump_arm.node().cloneNode(true))
			});
		defs.select(function(d) {
				return this.appendChild(clinton_arm.node().cloneNode(true))
			});
	}
	function addShadow(defs) {
		
  		let shadow=defs
  						.append("filter")
  							.attr("id","dropShadow")
  							.html(`<feGaussianBlur in="SourceGraphic" stdDeviation="2" />`);
	}

	function addGradient(defs) {

		let stops=[
			{
				offset:"0%",
				color:"#AF0C53"
			},
			{
				offset:"50%",
				color:"#fc3b1e"
			},
			{
				offset:"50%",
				color:"#3fa9f5"
			},
			{
				offset:"100%",
				color:"#002E5B"
			}
		]

		let gradients=[
			{
				id:"left",
				x1:0,
				x2:(WIDTH-(margins.left+margins.right))/2,
				stops:[
					stops[0],
					stops[1]
				]
			},
			{
				id:"right",
				x1:(WIDTH-(margins.left+margins.right))/2,
				x2:WIDTH-(margins.left+margins.right),
				stops:[
					stops[2],
					stops[3]
				]
			},
			{
				id:"jump",
				x1:0,
				x2:WIDTH-(margins.left+margins.right),
				stops:stops
			}
		]
		
		defs.selectAll("linearGradient")
							.data(gradients)
							.enter()
							.append("linearGradient")
								.attrs({
									id:d=>d.id,
									"gradientUnits":"userSpaceOnUse",
									x1:d=>d.x1,
									x2:d=>d.x2,
									y1:0,
									y2:0
								})
								.selectAll("stop")
									.data(d=>d.stops)
									.enter()
									.append("stop")
										.attrs({
											offset:d=>d.offset,
											"stop-color":d=>d.color
										})
	}
	this.getTop=()=>{
		return container.node().getBoundingClientRect();
	}
	let playing_clip;
	this.showElement=(top)=>{
		//console.log(question_text);
		let selected=answers[0];
		answers.forEach(q=>{
			if(q.top-(INTRO_HEIGHT+ANSWER_HEIGHT*2)<=top) {
				selected=q;
			}
		})
		//console.log(selected)
		answer.classed("selected",d=>{
			return d.top===selected.top;
		})
		kc.classed("selected",d=>{
			return d.top===selected.top;
		})
		face
			.classed("hidden",false)
			.classed("dem",()=>(selected.party==="dem"))
			.classed("gop",()=>(selected.party==="gop"))
			.classed("evasive",(d)=>selected.evasive)
			.styles({
				top:selected.top+"px",
				left:selected.left+"px"
			})
		/*if(!options.audio.playing() || playing_clip!==selected.clip_id) {
			options.audio.stop();
			playing_clip=selected.clip_id;
			options.audio.play(selected.clip_id);
		}*/
		
	}
	this.hideElement=()=>{
		answer.classed("selected",false)
		kc.classed("selected",false)
	}
}