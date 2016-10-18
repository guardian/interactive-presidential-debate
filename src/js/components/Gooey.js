import {
    select,
    selectAll,
    selection
}
from 'd3-selection';

import {
    easeLinear
}
from 'd3-ease';

import {
	timer
}
from 'd3-timer';
import {
    range,
    extent
} from 'd3-array';
import {
    line as d3_line,
    curveCardinalClosed,
    curveBasisClosed
} from 'd3-shape'
import {
    transition
} from 'd3-transition';
import {
    interpolateString
} from 'd3-interpolate';
import {
    forceSimulation as d3_forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    forceCollide,
    forceX,
    forceY
} from 'd3-force'

export default function Gooey(data,options) {

	console.log(options)

    let container=select(options.container).append("div").attr("class","debate")
    let box = container.node().getBoundingClientRect();

	let svg = container
        		.append("svg")
        		.attr("width",box.width)
        		.attr("height",box.height)
                .on("click",function(){
                    launchBall("right");
                })

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

    let shapes=svg.append("g")
                    .attr("class","shapes")
    				.attr("filter","url(#gooey)")
    let balls=svg.append("g")
                    .attr("class","balls")
    let debug=svg.append("g")
                    .attr("class","debug")

    let X=box.width/2,
    	Y=box.height/2,
    	R=60;

    // shapes.append("circle")
    // 		.attr("cx",X)
    // 		.attr("cy",Y)
    // 		.attr("r",R)

    let side=100,
        diag=100*Math.sqrt(2),
        dist=[diag/2,diag/2]

    let line=d3_line()
                .x(d=>(d.x))
                .y(d=>(d.y))
                
    let line_path=d3_line()
                    .x(d=>(d.x))
                    .y(d=>(d.y))
                    //.curve(curveCardinalClosed.tension(1))

    

    function Blob(numPoints=5,options) {

        var radius = options.radius || 200;
        let nodes = range(numPoints)
                        .map(function(d) {
                            return {
                                id: d,
                                x: options.width / 2 + radius * Math.cos(Math.PI * 2 / numPoints * d) + Math.random() * 30 - 15,
                                y: options.height / 2 + radius * Math.sin(Math.PI * 2 / numPoints * d) + Math.random() * 30 - 15
                            };
                        });

        let links = nodes.map(function(n) {
          return {
            source: n.id,
            target: n.id + 1 === nodes.length ? 0 : n.id + 1
          }
        });

        let border;

        let ball=debug.selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r",3)

        let drawShape = d3_line()
                            .x(function(d) { return d.x; })
                            .y(function(d) { return d.y; })
                            .curve(curveBasisClosed)
                            
        var simulation = d3_forceSimulation()
                            .stop()
                            
                            //.force("link", forceLink().id(function(d) { return d.id; }))
                            //.force("charge", forceManyBody())
                            .velocityDecay(0.95)
                            .force("center", forceCenter(options.width / 2, options.height / 2))

                            .force("link", forceLink().id(function(d) { return d.id; }).strength(0.1))
                            .force("charge", forceManyBody().strength(0.5))
                            //.force("collide",forceCollide().radius(15).iterations(2))
                            .on("tick",tick)
                            .on("end",()=>{
                                console.log("END")
                            })

        restart();

        function tick() {
            //console.log("TICK TICK TICK")
            
            shape.attr("d",drawShape(nodes))

            // ball
            //     .attr("cx",d=>d.x)
            //     .attr("cy",d=>d.y)
        }

        this.getNodes=()=>{
            return nodes;
        }

        this.removeNode=()=>{
            let node=nodes.pop();
            console.log(nodes)
            links = nodes.map(function(n) {
                return {
                    source: n.id,
                    target: n.id + 1 === nodes.length ? 0 : n.id + 1
                }
            });
            

            var _ball=ball
                        .data(nodes);

            _ball.exit().remove();

            // console.log(simulation.nodes())
            // console.log(simulation.force("link").links())

            restart();
        }

        function restart() {
            simulation.nodes(nodes);
            simulation.force("link").links(links)

            border=extent(nodes,d=>d.x);

            simulation.alpha(0.3).restart();
        }

        this.restart=()=>{
            restart();
        }

        this.getBorder=()=>{
            return border;
        }
    }

    let shape=shapes.append("path")
            .attr("class","shape")
            //.attr("d",line(blob.getNodes()))
            /*.attr("d",line([
                {
                    x:X+diag/2,
                    y:Y
                },
                {
                    x:X,
                    y:Y+diag/2
                },
                {
                    x:X-diag/2,
                    y:Y
                },
                {
                    x:X,
                    y:Y-diag/2
                }
            ]))*/

    let blob=new Blob(15,{
        width:box.width,
        height:box.height,
        radius:100,
        shape:shape
    })

    data=[
        {
            direction:"left",
            points:[
                {
                    x:X,
                    y:Y//+diag/8
                },
                // {
                //     x:X-dist[0]*3/4,
                //     y:Y+diag/8
                // },
                {
                    x:X-dist[0],
                    y:Y
                }
            ]
        },
        {
            direction:"right",
            points:[
                {
                    x:X,
                    y:Y//-diag/8
                },
                // {
                //     x:X+dist[1]*3/4,
                //     y:Y-diag/8
                // },
                {
                    x:X+dist[1],
                    y:Y
                }
            ]
        }
    ];

    /*let runaway=shapes.selectAll("path.path-to-follow")
                        .data(data)
                        .enter()
                        .append("path")
                        .attr("class","path-to-follow")
                        .attr("d",d=>{
                            return line_path(d.points);
                        })  */      

    let ball_shape=shapes
                .selectAll("circle.ball")
                .data(data)
                .enter()
                    .append("circle")
                    .attr("class","ball-shape")
                    .attr("cx",X)
                    .attr("cy",Y)
                    .attr("r",16)

    let ball=balls
                .selectAll("circle.ball")
                .data(data)
                .enter()
                    .append("circle")
                    .attr("class","ball")
                    .attr("cx",X)
                    .attr("cy",Y)
                    .attr("r",12)

    let circle_time=2000;
	//let l=circle_path.node().getTotalLength();
    
    //ball.attr("transform","translate(" + (R) + "," + Y + ")")

    function launchBall(direction) {

        let _ball_shape=ball_shape.filter(d=>d.direction===direction);
        let _ball=ball.filter(d=>d.direction===direction);

        let border=blob.getBorder();
        let out=false;
        _ball_shape
            .attr("cx",X)
            .transition()
            .duration(circle_time)
            .attrTween("cx", myTween(direction,border))
            .on("end",()=>{
                if(direction=="right") {
                    //dist[1]+=13;    
                } else {
                    //dist[0]+=13;
                }
                //let _nodes=blob.removeNode();//.getNodes();
                //console.log(_nodes)
                //console.log(line(_nodes))

                //let _node=blob.removeNode();
                //console.log(_node);
                //blob.render();


                //shape
                    //.transition()
                    //.duration(5000)
                    //.attr("d",line(_nodes))
                    /*.attr("d",line([
                        {
                            x:X+dist[1],
                            y:Y
                        },
                        {
                            x:X,
                            y:Y+diag/2
                        },
                        {
                            x:X-dist[0],
                            y:Y
                        },
                        {
                            x:X,
                            y:Y-diag/2
                        }
                    ]));*/
                if(blob.getNodes().length>2) {
                    //launchBall(direction)    
                }
                
            })

        function myTween(direction,border) {
            //console.log("-----")
            return function(d) {
                //console.log(this)
                function ƒ(t) {
                    //console.log(d,t)
                    let l=direction=="left"?dist[0]:dist[1]+50,
                        x=X+(l*t);
                    
                    if(x>border[1]+8 && !out) {
                        console.log("OUUUUT")
                        blob.removeNode();
                        out=true;
                    }

                    if((l*t)>dist[1]-15 && (l*t)<=(dist[1])) {
                        //console.log("change shape now",(l*t),">",dist[1])
                        //console.log("===>",X+((l*t)+15))
                        /*shape
                            .attr("d",line([
                                {
                                    x:X+((l*t)+15),
                                    y:Y
                                },
                                {
                                    x:X,
                                    y:Y+diag/2
                                },
                                {
                                    x:X-dist[0],
                                    y:Y
                                },
                                {
                                    x:X,
                                    y:Y-diag/2
                                }
                            ]))*/

                    }
                    
                    let opacity=1 - ((l*t)-50)/dist[1]
                    //console.log(opacity)
                    _ball.attr("cx",x);//.style("fill-opacity",opacity)
                    //_ball_shape.style("fill-opacity",opacity)
                    return x;
                }
                return ƒ.bind(this);
            }
        }
            /*
            .attr("cx",d=>{
                console.log(d)
                if(d.direction=="left") {
                    return X-(dist[0]-5)
                } else {
                    return X+(dist[1]-5)
                }
            })
            .on("end",(d)=>{

                if(d.direction=="left") {
                    dist[0]+=(5+15);
                } else {
                    dist[1]+=(5+15);
                }

                console.log(X+dist[1])
                shape
                    .transition()
                    .duration(500)
                        .attr("d",line([
                        {
                            x:X+dist[1],
                            y:Y
                        },
                        {
                            x:X,
                            y:Y+diag/2
                        },
                        {
                            x:X-dist[0],
                            y:Y
                        },
                        {
                            x:X,
                            y:Y-diag/2
                        }
                    ]))
                    .on("end",()=>{
                        //launchBall("right");        
                    })
                
            })
            */


    }

    launchBall("right");

    /*
    let direction="left",
        prev_direction="left",
        prev_x=X;
   	var t = timer(function(elapsed) {		
		let p=circle_path.node().getPointAtLength(((elapsed%circle_time)/circle_time)*l);
		ball.attr("transform","translate(" + (p.x) + "," + Y + ")")

        direction=(p.x-prev_x>0)?"right":"left";


        if(direction!=prev_direction) {
            console.log("TOUCH",prev_direction);
            if(prev_direction=="left") {
                dist[0]+=0;
            }
            if(prev_direction=="right") {
                dist[1]+=2;
            }

            shape.attr("d",line([
                {
                    x:X+dist[1],
                    y:Y
                },
                {
                    x:X,
                    y:Y+diag/2
                },
                {
                    x:X-dist[0],
                    y:Y
                },
                {
                    x:X,
                    y:Y-diag/2
                }
            ]));

        }

        prev_x=p.x;
        prev_direction=direction;

	});
    */
    this.restart=()=>{
        blob.restart();
    }
    this.render=()=>{
        blob.render();
    }
    this.removeNode=()=>{
        blob.removeNode();
    }
    this.launchBall=(direction)=>{
        launchBall(direction);
    }

}