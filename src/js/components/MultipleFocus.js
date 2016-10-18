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
    extent,
    sum,
    max,
    mean
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

export default function MultipleFocus(data,options) {

    
    let radius = options.radius || 200;

    //radius=5;

    let groups=[
        [],
        []
    ];



    let container=select(options.container).append("div").attr("class","debate")
    let box = container.node().getBoundingClientRect();

    let group_length=[10,8]
    let numPoints=sum(group_length);
    let groups_coordinates=[
        {
            x:box.width*0.2,
            y:box.height/2
        },
        {
            x:box.width*0.8,
            y:box.height/2
        }
    ];
    
    /*let nodes = range(numPoints)
                    .map(function(d) {
                        let group=d>=group_length?1:0;
                        let _index=groups[group].length
                        let alpha=(Math.PI * 2) / group_length[group],
                            beta=alpha * _index;
                        let node={
                            id: d,
                            _index:_index,
                            // x: box.width / 2 + radius * Math.cos(Math.PI * 2 / numPoints * d) + Math.random() * 30 - 15,
                            // y: box.height / 2 + radius * Math.sin(Math.PI * 2 / numPoints * d) + Math.random() * 30 - 15,
                            x: groups_coordinates[group].x + radius * Math.cos(beta) + Math.random() * 30,
                            y: groups_coordinates[group].y + radius * Math.sin(beta) + Math.random() * 30,
                            group:group
                        };
                        //console.log(group,groups_coordinates[group],radius,_index,Math.cos(Math.PI*2/_index))
                        groups[group].push(node)
                        return node;
                    });*/
    let nodes=[];
    let i=0;
    group_length.forEach((group_length,g_index)=>{
        
        range(group_length)
            .forEach(d=>{
                let alpha=(Math.PI*2)/group_length
                let beta=alpha*d
                let node= {
                    id:i,
                    radius:radius,
                    x:groups_coordinates[g_index].x + radius*Math.cos(beta) + (0.5-Math.random()) * 30,
                    y:groups_coordinates[g_index].y + radius*Math.sin(beta) + (0.5-Math.random()) * 30,
                    group:g_index
                }
                i++;
                groups[g_index].push(node);
                nodes.push(node);
            })
    })
    //console.log(nodes);
    

    let links=[];
    groups.filter(group=>group.length>0).forEach(group=>{
        links=links.concat(group.map((n,i)=>{
            return {
                source: n.id,
                target: !group[i+1] ? group[0].id : group[i+1].id
              }      
        }),[]);
    })

    console.log(nodes);
    console.log(groups);
    console.log(links)
    //console.log(JSON.stringify(links));
    
    let svg = container
                .append("svg")
                .attr("width",box.width)
                .attr("height",box.height)
                .on("click",d=>{
                    //mf.transferNode(null,0,1)
                    removeNode(0)
                })

    let circles=svg
                    .append("g")
                    .attr("class","balls")
                    .selectAll("circle")
                        .data(nodes)
                        .enter()
                        .append("circle")
                        .attr("cx",d=>{
                            return d.x
                        })
                        .attr("cy",d=>d.y)
                        .attr("r",15)

    let ids=svg.select(".balls")
                    .selectAll("text")
                        .data(nodes)
                        .enter()
                        .append("text")
                        .attr("x",d=>{
                            return d.x
                        })
                        .attr("y",d=>d.y)
                        .text(d=>d.id)

    let lines=svg
                .append("g")
                .attr("class","links")
                .selectAll("line")
                    .data(links)
                    .enter()
                    .append("line")
                    .attr("x1",d=>{
                        return d.source.x
                    })
                    .attr("y1",d=>{
                        return d.source.y
                    })
                    .attr("x2",d=>{
                        return d.target.x
                    })
                    .attr("y2",d=>{
                        return d.target.y
                    })

    let line_path=d3_line()
                    .x(d=>(d.x))
                    .y(d=>(d.y))
                    .curve(curveCardinalClosed.tension(0.25))

    let shape=svg
                .append("g")
                .attr("class","shape")
                .selectAll("path")
                .data(groups)
                .enter()
                .append("path")
                    .attr("d",(group)=>{
                        return line_path(group)
                    })

    let borders=50*max(group_length);

    var simulation = d3_forceSimulation(nodes)
                            .nodes(nodes)
                            .stop()
                            //.force("link", forceLink().id(function(d) { return d.id; }))
                            //.force("charge", forceManyBody())
                            /*.force("center", d=>{
                                 //console.log(d)
                                 return forceCenter(options.width / 2, options.height / 2)
                            })*/

                            //.velocityDecay(0.95)
                            // .force("x", forceX().x(d=>{
                            //     return d.x;//groups_coordinates[d.group].x
                            // }))
                            // .force("y", forceY().y(d=>{
                            //     return d.y;//groups_coordinates[d.group].y
                            // }))
                            .force("link", forceLink().id(function(d) { return d.id; }).strength(0.5))
                            .force("charge", forceManyBody().strength(0.1))
                            .force("collide",forceCollide().radius(d=>{
                                return 15*2;
                                return groups[d.group].length*5;
                                return borders/groups[d.group].length;
                                return 50;
                            }).iterations(2))
                            .on("tick",tick)
                            .on("end",()=>{
                                console.log("END")
                            })

    console.log(links)

    simulation.force("link").links(links)
    
    // links.forEach(d=>{
    //     console.log(d.index,d.source.id,"=>",d.target.id)
    // })

    simulation.restart();




    function tick() {
        

        var k = .1 * simulation.alpha();

        // Push nodes toward their designated focus.
        // nodes.forEach(function(o, i) {
        //     o.y += (groups_coordinates[o.group].y - o.y) * k;
        //     o.x += (groups_coordinates[o.group].x - o.x) * k;
        // });
        let prev_alpha=0;
        circles.data(nodes).attr("cx",d=>d.x).attr("cy",d=>d.y).each(d=>{
            let _x=d.x - groups_coordinates[d.group].x,
                _y=d.y - groups_coordinates[d.group].y,
                _alpha=Math.atan2(_y,_x),
                _radius=Math.sqrt((_x*_x)+(_y*_y))
            
            if(d.id===15) {
                //console.log(d.id,_x,_y,_alpha,_radius)    
            }

            d.alpha=_alpha;
            d.beta=_alpha-prev_alpha;
            d.radius=_radius;
            prev_alpha=_alpha;


            
        });
        ids.data(nodes).attr("x",d=>d.x).attr("y",d=>d.y)

        lines.data(links)
                    .attr("x1",d=>{
                        return d.source.x
                    })
                    .attr("y1",d=>{
                        return d.source.y
                    })
                    .attr("x2",d=>{
                        return d.target.x
                    })
                    .attr("y2",d=>{
                        return d.target.y
                    })

        shape.data(groups)
                    .attr("d",(group)=>{
                        return line_path(group)
                    })
    }

    function transferNode(node,source,target) {
        node = node || groups[source].pop();

        console.log(node);

        node.group=target;
        groups[target].push(node);

        // simulation.force("collide",forceCollide().radius(d=>{
        //                         return groups[d.group].length*5;
        //                         return borders/groups[d.group].length;
        //                     }).iterations(2))

        group_length[source]=groups[source].length;
        group_length[target]=groups[target].length;

        
        groups.forEach((group,g_index)=>{
            let index=0,
                max_group_radius=max(group,d=>d.radius),
                mean_group_radius=mean(group,d=>d.radius);
            group.forEach((_node,node_index)=>{
            
                let alpha=(Math.PI*2)/group_length[g_index];
                let beta=alpha*node_index;



                if(_node.id===node.id) {
                    _node.x=groups_coordinates[g_index].x + max_group_radius*Math.cos(beta) ;//+ (0.5-Math.random())*10;
                    _node.y=groups_coordinates[g_index].y+ max_group_radius*Math.sin(beta) ;//+ (0.5-Math.random())*10;
                } else {
                    _node.x=groups_coordinates[g_index].x + mean_group_radius*Math.cos(beta);
                    _node.y=groups_coordinates[g_index].y+ mean_group_radius*Math.sin(beta);
                    // _node.x=;groups_coordinates[g_index].x + _node.radius*Math.cos(beta) ;
                    // _node.y=groups_coordinates[g_index].y+ _node.radius*Math.sin(beta) ;
                    console.log("setting radius",mean_group_radius,"with angle",(beta/Math.PI*180),"for node",_node.id)
                }
                _node.index=index;

                index++;
            })
        })

        links=[];

        groups.forEach(group=>{
            links=links.concat(group.map((n,i)=>{
                return {
                    source: n.id,
                    target: !group[i+1] ? group[0].id : group[i+1].id
                  }      
            }),[]);
        })

        

        console.log(group_length,groups)
        console.log(links)

        simulation.nodes(nodes).stop();
        simulation.force("link").links(links)

        simulation.alpha(1).restart();

    }

    function removeNode(group_index) {
        let group=groups[group_index];
        let node=group.pop();

        group_length[group_index]=group.length;

        let index=0,
            max_group_radius=max(group,d=>d.radius),
            mean_group_radius=mean(group,d=>d.radius);
        group.forEach((_node,node_index)=>{
        
            let alpha=(Math.PI*2)/group_length[group_index];
            let beta=alpha*node_index;

            if(_node.id===node.id) {
                _node.x=groups_coordinates[group_index].x + max_group_radius*Math.cos(beta) ;//+ (0.5-Math.random())*10;
                _node.y=groups_coordinates[group_index].y+ max_group_radius*Math.sin(beta) ;//+ (0.5-Math.random())*10;
            } else {
                _node.x=groups_coordinates[group_index].x + mean_group_radius*Math.cos(beta);
                _node.y=groups_coordinates[group_index].y+ mean_group_radius*Math.sin(beta);
                // _node.x=;groups_coordinates[group_index].x + _node.radius*Math.cos(beta) ;
                // _node.y=groups_coordinates[group_index].y+ _node.radius*Math.sin(beta) ;
                console.log("setting radius",mean_group_radius,"with angle",(beta/Math.PI*180),"for node",_node.id)
            }
            _node.index=index;

            index++;
        })

        links=[];

        groups.forEach(group=>{
            links=links.concat(group.map((n,i)=>{
                return {
                    source: n.id,
                    target: !group[i+1] ? group[0].id : group[i+1].id
                  }      
            }),[]);
        })

        nodes=nodes.filter(d=>{
            return d.id!=node.id;
        })

        console.log(group_length,groups)
        console.log(links)

        simulation.nodes(nodes).stop();
        simulation.force("link").links(links)

        simulation.alpha(1).restart();

        return node;
    }
    function addNode(node,group) {
        node.group=group;
        groups[group].push(node);

        group_length[target]=groups[target].length;

    }

    function launchBall() {

    }

    this.transferNode=(node,source,target)=>{
        transferNode(node,source,target);
    }

}