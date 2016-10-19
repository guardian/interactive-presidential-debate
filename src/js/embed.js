import iframeMessenger from 'guardian/iframe-messenger'
import embedHTML from './text/embed.html!text'

//import Gooey from "./components/Gooey";
//import MultipleFocus from "./components/MultipleFocus"

import debate_data from  '../assets/data/debate.json!json';


import Debate from "./components/Debate"

import {cancelAnimFrame, requestAnimFrame} from './lib/raf'

import {
	selection
} from "d3-selection-multi"
import {
	extent
} from "d3-array"

import howler from "howler";

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML;
    let candidates=["trump","clinton"],
    	types=["pro","against","defend"],
    	topics=["taxes","email","tax_return","war","jobs","obama","iraq","syria","immigration"];



	//audio.play();

    let prev={};
    /*let data=(()=>{
    				let data=[];
    				for(let i=1;i<200;i++) {
    					let type=types[Math.floor(Math.random()*types.length)];
    					let datum={
    						candidate:candidates[Math.floor(Math.random()*candidates.length)],
    						type:type,
    						topic:topics[Math.floor(Math.random()*topics.length)],
    						time:i,
    						energy:Math.floor(Math.random()*10)//type==="pro"?0:Math.floor(Math.random()*10)
    					}
    					data.push(datum)
    					prev=datum;
    				}
    				return data;
    			}());*/

    
    console.log(debate_data)
    let clip_counter=0;
    debate_data.forEach((question)=>{
    	question.answers.forEach(answer=>{
    		answer.clip_id="s"+clip_counter;
    		clip_counter++;
    	})
    })

   	let extents={
   		w:extent(debate_data,d=>d.energy)
   	}
   	console.log("EXTENTS",extents);

   	let clips=[
   		{	
   			i:0,
   			offset:(2*60+21.5)*1000,
   			duration:4.45*1000
   		},
   		{
   			i:1,
   			offset:(3*60+32.8)*1000,
   			duration:3*1000
   		},
   		{
   			i:2,
   			offset:(5*60+5.7)*1000,
   			duration:4.5*1000
   		},
   		{
   			i:3,
   			offset:(6*60+2.8)*1000,
   			duration:3.2*1000
   		},
   		{
   			i:4,
   			offset:(6*60+50)*1000,
   			duration:4.7*1000
   		},
   		{
   			i:5,
   			offset:(7*60+10)*1000,
   			duration:1.2*1000
   		},
   		{
   			i:6,
   			offset:(7*60+10.5)*1000,
   			duration:4*1000
   		},
   		{
   			i:7,
   			offset:(7*60+18.5)*1000,
   			duration:4.7*1000
   		},
   		{
   			i:8,
   			offset:(7*60+23)*1000,
   			duration:4*1000
   		},
   		{
   			i:9,
   			offset:(7*60+27)*1000,
   			duration:1.8*1000
   		},
   		{
   			i:10,
   			offset:(7*60+29.5)*1000,
   			duration:7.4*1000
   		},
   		{
   			i:11,
   			offset:(7*60+36.8)*1000,
   			duration:1.7*1000
   		},
   		{
   			i:12,
   			offset:(7*60+37.2)*1000,
   			duration:3.5*1000
   		}

   	];

   	/*let audio = new howler.Howl({
		src:[config.assetPath+ "/assets/audio/debate.mp3"],
		sprite:(function(){
			let sprites={};
			clips.forEach((clip,i)=>{
				sprites["s"+i]=[clip.offset,clip.duration]
			});
			return sprites;
		}()),
		onload:function(){
			console.log("AUDIO LOADED",this)

			//let _this=this;//.play("s1");

			let debate=new Debate(
		    	debate_data,{
		    	container:el.querySelector(".presidential-debate"),
		    	extents:extents,
		    	audio:this
		    })
		}
	});*/
	//console.log(arms)
	let debate=new Debate(
		    	debate_data,{
		    	container:el.querySelector(".presidential-debate"),
		    	extents:extents//,
		    	//audio:this
		    })
    

    /*window.gooey=new Gooey([],{
		container:el.querySelector(".presidential-debate")
    })
    

    window.mf=new MultipleFocus([],{
    	container:el.querySelector(".presidential-debate")
    })*/

};
