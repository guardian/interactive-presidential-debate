import {
    select,
    selectAll,
    selection
} from "d3-selection"

import {
	line as d3_line
} from "d3-shape"

export default function Candidate(candidata,options) {

	console.log("Candidate",candidata.name,candidata.data,options)
	
	candidata.data=([{
		candidate:candidata.data[0].candidate,
		type:"start",
		topic:"none",
		time:0,
		energy:0
	}]).concat(candidata.data);

	let yscale=options.yscale;

	//buildVisual
	;(()=>{
		
		let candidate_g=select(options.container)
							.attr("class",d=>`candidate ${d.party} ${d.side>-1?"left":"right"}`)
							//.attr("transform",`translate(${options.position[0]},${options.position[1]})`);
		
		let timeline=candidate_g.append("g")
						//.attr("filter","url(#gooey)");

		/*timeline.append("rect")
						.attr("class","main")
						.attrs({
							x:options.position[0]-4,
							y:options.yscale.range()[0],
							width:8,
							height:options.yscale.range()[1]-options.yscale.range()[0]
						})*/

		timeline
				.selectAll("circle.pro")
				.data(candidata.data.filter(d=>(d.toc && d.toc.indexOf("pro")>-1)))
				.enter()
				.append("circle")
						.attr("class","pro")
						.attrs({
							cx:(d) => (options.position[0]),
							cy:(d)=>(options.yscale(d.time)),
							r:(d)=>{
								return 5;
								return options.wscale(d.energy)
							}
						})

		candidate_g.append("path")
						.attr("class","main")						
						.attr("d",()=>{
							return options.main_line(candidata.data.map(d=>{
								//console.log(d.time,options.yscale(d.time))
								return {
									x:options.position[0],// + (candidata.side * options.wscale(d.energy)),
									y:options.yscale(d.time)
								}
							}))
						});


		timeline
				.selectAll("line.against")
				.data(candidata.data.filter(d=>(d.toc && d.toc.indexOf("against")>-1)))
				.enter()
				.append("line")
						.attr("class","against")
						.attrs({
							x1:(d) => (options.position[0]),
							x2:(d) => (options.position[1] + options.position[0])/2 + (candidata.side*10),//(options.position[1]) + candidata.side*(10),
							y1:(d)=>(options.yscale(d.time)),
							y2:(d)=>(options.yscale(d.time)),
							"marker-end":(d)=>(`url(#arrow-${options.party})`)
						})

		timeline
				.selectAll("text.time")
				.data(candidata.data.filter(d=>(d.toc)))
				.enter()
				.append("text")
						.attr("class",`time`)
						.attrs({
							x:options.xscale(candidata.side),
							y:(d)=>options.yscale(d.time)
						})
						.text(d=>d.str_time)



	}());

	


}