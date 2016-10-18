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
	container.append("h2")
						.attr("class","question-title")
						.html(question_text || "Lorem ipsum dolor sit amet, consectetur adipisicing elit.")
	container.append("p")
						.attr("class","question-summary")
						.html("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa ullam, corporis dicta dolor deserunt voluptate, possimus accusamus eligendi.")

	container=container.append("div").attr("class","dialogue");
	
	let svg=container.append("svg")
					//.attr("width",options.width)
					.attr("height",INTRO_HEIGHT+answers.length*ANSWER_HEIGHT+(margins.top+margins.bottom))

	let box = svg.node().getBoundingClientRect();



	let WIDTH=box.width;
	options.xscale.range([
		0,
		WIDTH - (margins.left+margins.right)
	]);

	let defs=svg.append("defs");
	//addArrowDefs(defs);
	addShadow(defs);
	addGradient(defs);

	

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
    let curly_line=d3_line()
                    .x(d=>(d.x))
                    .y(d=>(d.y))
                    .curve(curveBasis)
    let arrow_line=d3_line()
                    .x(d=>(d.x))
                    .y(d=>(d.y))
                    .curve(curveBasis)

    let wave=(data,height=20) => {
    			
    			let step=data[1],
    				inner_points=range(4).map(d=>{
    					return {
    						x:d*(step/4),
    						alpha:d*(2*Math.PI/4),
    						y:Math.sin(d*(2*Math.PI/4))*height
    					}
    				});
    			let new_data=[
    				{
    					x:0,
    					y:0
    				}
    			];
    			
    			data.forEach(d=>{

    				inner_points.forEach(p=>{
    					new_data.push({
    						x:p.x+d+step,
    						alpha:p.alpha,
    						y:p.y
    					})
    				})

    			})

    			new_data.push({
    				x:new_data[new_data.length-1].x+step/4,
    				y:0
    			})
    			new_data.push({
    				x:new_data[new_data.length-1].x+step,
    				y:0	
    			})

		    	return curly_line(new_data);
    		};

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
						return drawArc(d,answers[i+1],1,0.05);	
					} else {
						return ""
					}
					
				},
				filter:"url(#dropShadow)"
			})


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

	answer.append("circle")
				.attrs({
					cx:d=>d.left,
					cy:d=>d.top,
					r:5
				})
	answer.append("circle")
				.attrs({
					"class":"big",
					cx:d=>d.left,
					cy:d=>d.top,
					r:10
				})

	/*answer
		.filter(d=>(d.toc && d.toc.indexOf("against")>-1))
				.append("path")
						.attrs({
							"class":"against",
							"d":(d)=>{
								let step=((options.xscale(0) - options.xscale(d.side))/2)/10,
									data=range(3).map((d)=>{
										return d*step;
									})
								return wave(data,4);
							},
							"marker-end":(d)=>(`url(#arrow-${d.party})`)
						})*/

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

	let key_concepts=container.append("div")
					.attr("class","key-concepts");


	let face=key_concepts
						.append("div")
						.attr("class","face-container")
							.append("div")
								.attr("class","face");

	let kc=key_concepts.selectAll("div.key-concept")
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
		.html(d=>`${(d.key || d.text)}`);

	kc
		.style("margin-top",function(d){
			let box=this.getBoundingClientRect();
			d.text_height=box.height;
			return (-box.height/2)+"px";
		})
		.select("p")
			.style("margin-top",(d)=>{
				return (d.text_height/2 + 20)+"px";
			})

	function addArrowDefs(defs) {
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
				color:"#7ac943"
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
		console.log(question_text);
		let selected=answers[0];
		answers.forEach(q=>{
			if(q.top-(INTRO_HEIGHT+ANSWER_HEIGHT*2)<=top) {
				selected=q;
			}
		})
		console.log(selected)
		answer.classed("selected",d=>{
			return d.top===selected.top;
		})
		kc.classed("selected",d=>{
			return d.top===selected.top;
		})
		face
			.classed("dem",()=>(selected.party==="dem"))
			.classed("gop",()=>(selected.party==="gop"))
			.styles({
				top:selected.top+"px",
				left:selected.left+"px"
			})
		// if(!options.audio.playing() || playing_clip!==selected.clip_id) {
		// 	options.audio.stop();
		// 	playing_clip=selected.clip_id;
		// 	options.audio.play(selected.clip_id);
		// }
		
	}
}