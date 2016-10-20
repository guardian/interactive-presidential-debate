import mainHTML from './text/main.html!text'

import debate_data from  '../assets/data/debate.json!json';
import debate_sample from  '../assets/data/sample.json!json';

import Debate from "./components/Debate"

import {cancelAnimFrame, requestAnimFrame} from './lib/raf'

import {
	selection
} from "d3-selection-multi"
import {
	extent
} from "d3-array"

export function init(el, context, config, mediator) {
    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    let candidates=["trump","clinton"],
    	types=["pro","against","defend"],
    	topics=["taxes","email","tax_return","war","jobs","obama","iraq","syria","immigration"];

    console.log(debate_data)

   	let extents={
   		w:extent(debate_data,d=>d.energy)
   	}
   	console.log("EXTENTS",extents);

   	let container=el.querySelector(".presidential-debate");
   	console.log(container)
	let frameRequest = requestAnimFrame(function checkInnerHTML(time) {
        //////console.log(time)
        
        if(container && container.getBoundingClientRect().height) {
            cancelAnimFrame(checkInnerHTML);
           	
            let sample_debate=new Debate(
				debate_sample,{
					container:el.querySelector(".sample-debate"),
					extents:extents,
					sample:true
				
			})

			let debate=new Debate(
		    	debate_data,{
		    	container:el.querySelector(".real-debate"),
		    	extents:extents//,
		    	//audio:this
		    })

            return; 
        }
        frameRequest = requestAnimFrame(checkInnerHTML);
    });

	
    
}
