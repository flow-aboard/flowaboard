import {ElementGroup} from '../element-group/group.js'
import {Element} from '../element/element.js'
import '../../../node_modules/d3/dist/d3.js'
//import 'https://cdn.jsdelivr.net/npm/d3@6.6.0/dist/d3.min.js'
import { Next } from '../element-group/next.js'
//import '../../node_modules/d3-3d/src/3d.js'


import * as architecture from '../../data/architecture/architecture.js';

class FlowUtility{

    static getEvenlySpaced(length){
        var evenlySpaced=[]
        if(length==1){
            //console.log(0,0)
            evenlySpaced.push(0)
        }
        if(length%2==0){
            //console.log('even')
            for(var j=0;j<length;j++){
                if(j<length/2){
                    //console.log(j,Math.trunc(j+1-(i)/2)-1)
                    evenlySpaced.push(Math.trunc(j+1-(length)/2)-1)
                }
                if(j>=length/2){
                    //console.log(j,Math.trunc(j+1-(i)/2))
                    evenlySpaced.push(Math.trunc(j+1-(length)/2))
                }  
            }
        }
        if(length!=1&&length%2==1){
            //console.log('odd')
            for(j=0;j<length;j++){
                //console.log(i,j,(j)-((i-1)/2))
                evenlySpaced.push((j)-((length-1)/2))
            }
        }
        return evenlySpaced;
    }

    static getEvenlySpacedFromCenter(totalValue,divisions,divisionLength,minseparation){
        var coordinates=[]
        var maxDivisionLengthPossible=totalValue/divisions;
        var divisionLengthWithSeperation=divisionLength+2*(minseparation);
        var wastageLength=maxDivisionLengthPossible-divisionLengthWithSeperation;
        if(wastageLength>0){
            var totalWastageLength=wastageLength*divisions
            var requiredTotalValue=totalValue-totalWastageLength
            for(var i=0;i<divisions;i++){
                coordinates.push(totalWastageLength/2+(divisionLengthWithSeperation*i)+(divisionLengthWithSeperation*0.5))
            }
            return {coordinates,divisionLength}
        }else{
            divisionLength=maxDivisionLengthPossible-2*(minseparation)-20;
            coordinates=FlowUtility.getEvenlySpacedFromCenter(totalValue,divisions,divisionLength,minseparation)
            return {coordinates,divisionLength}
        }
    }

}


class FlowElement extends Element{
    
    constructor() {
        super();
    }
    
    
    static getSample(){
        const flowElement=document.createElement('ui-flow-element')
        return flowElement
    }  

    get placeholder(){
        return this.getAttribute('placeholder')
    }
    get showLabel(){
        return !!this.getAttribute('showlabel')
    }
    set showLabel(value){
        return this.setAttribute('showlabel','true')
    }
    get showAction(){
        return !!this.getAttribute('showaction')
    }
    set showAction(value){
        return this.setAttribute('showaction','true')
    }

    type;
    parentFlow;

    beforeRender(){
        super.beforeRender()
        this.showLabel=true
    }
    get CSS(){
        return `
        :host{
            display:flex;
            width: 100%;
        }
        :host.active>span{
            margin: 0;
            margin-top: 4rem;
            margin-bottom: 5rem;
            overflow: hidden;
            
        }        
        .content{
            width: 100%;
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            text-transform: capitalize;
        }
        :host(.active) .content{
            width: 100%;
            height: 100%;
            background: darkviolet;
            color: whitesmoke;
            padding: 1rem;
            border-radius: 0.5rem;
            justify-content: center;
            align-items: center;
            display: flex;
        }
        .action{
            position: absolute;
            left: -40px;
            top: 50%;
            border-radius: 50%;
            font-weight: bold;
            font-size: 1.2rem;
            border: 0;
            background: cornflowerblue;
            color: currentcolor;
            line-height: 1.2rem;
            padding: 0.25rem 0.3rem;
            z-index: 10;
            box-shadow: 1px 1px 5px 1px #223556;
            visibility: hidden;
        }   
        .action:hover{
            visibility: visible;
        }    
        `
    }
    get HTML(){
        return `
            <button class="action add-previous" value="add-previous">+</button>
            <div class="content ${this.type}">
                
                    ${this.value.label}
                
            </div> 
            <button class="action add-next" value="add-next" >+</button>    
        `
        
    }

    attachEventHandlers(){
        this.shadowRoot.querySelector('.add-previous').onclick = this.handleAdd.bind(this);
        this.shadowRoot.querySelector('.add-next').onclick = this.handleAdd.bind(this);

        if(!this.isActive)     
        this.attachInactiveEventHandlers()
    }
    removeEventHandlers(){
        if(this.isActive)
        this.removeInactiveEventHandlers()
    }

    afterRender(){
        this.currentView=this.shadowRoot.querySelector('.content')
    }
    attachInactiveEventHandlers(){
        this.addEventListener("mousedown",  this.handleMouseDown);
        this.addEventListener("mouseenter",  this.handleMouseEnter);
        this.addEventListener("mouseleave",  this.handleMouseLeave);
        this.addEventListener("transitionend",  this.handleTransitionEnd);
        this.addEventListener("animationend",  this.handleAnimationEnd);
    }
    removeInactiveEventHandlers(){
        this.removeEventListener("mousedown",  this.handleMouseDown);
        this.removeEventListener("mouseenter",  this.handleMouseEnter);
        this.removeEventListener("mouseleave",  this.handleMouseLeave);
        this.removeEventListener("transitionend",  this.handleTransitionEnd);
        this.removeEventListener("animationend",  this.handleAnimationEnd);
    }  
    handleAdd(e){
        console.log(e.value)
    }
    handleValueChange(){
        this._value='';//this.shadowRoot.querySelector('input').value
        const changeEvent = new CustomEvent('change', {
            bubbles: true,
            composed:true,
            detail: { value: () => this.value }
        });
        this.dispatchEvent(changeEvent)
        

    }
    handleMouseDown(){
        this.active()
    }

    handleMouseEnter(){
        this.focus()      
    }
    handleMouseLeave(){
        this.blur()       
    }
    handleTransitionEnd(){
        this.updateLink()
    }
    handleAnimationEnd(){
        this.updateLink()
    }

    width;
    height;

    dimensions(width,height,depth){
        this.width=width;
        this.height=height;
        this.depth=depth;

        this.style.width=width;
        this.style.height=height;

        if(!this.isActive)
        this.inactiveState={...this.inactiveState,...{
            width:width,
            height:height,
            depth:depth,
        }}
        
    }

    coordinates(x,y,z){
        this.x=x
        this.y=y
        this.z=z

        this.style.left=x-this.getBoundingClientRect().width/2;//center the component
        this.style.top=y-this.getBoundingClientRect().height/2;//center the component;

        //console.log(this.style.left,x-this.getBoundingClientRect().width)

        if(this.style.top>this.parentFlow.height/2)
        this.style.transformOrigin="left center"

        if(!this.isActive)
        this.inactiveState={...this.inactiveState,...{
            x:x,
            y:y,
            z:z
        }}
    }

    next(){
        return [...this.outLinks].map((link)=>link.headFlowElement)
    }
    previous(){
        return [...this.inLinks].map((link)=>link.tailFlowElement)
    }

    inLinks=new Set();
    outLinks=new Set();
    addInLink(link){
        link.headFlowElement=this
        this.inLinks.add(link)
        this.updateLinkHead()
    }
    addOutLink(link){
        link.tailFlowElement=this
        this.outLinks.add(link)
        this.updateLinkTail()
    }

    updateLink(){
        this.animate({
            duration: 600,
            timing: function(timeFraction) {
                return timeFraction;
            },
            draw: (progress)=>{                
                this.updateLinkHead();
                this.updateLinkTail();
            }
        });
    }

    updateLinkHead(){
        var inLinksSize=this.inLinks.size
        var inlinkCenter=this.inLinks.size/2;
        var isEven=this.inLinks.size%2==0;
         
        [...this.inLinks].forEach((link,i)=>{
           
            var x2 = this.getBoundingClientRect().x;
            var y2 = this.getBoundingClientRect().y;
            var width2=this.getBoundingClientRect().width;
            var height2=this.getBoundingClientRect().height;
            link.setAttribute("x2", x2-8);
            link.setAttribute("y2", (y2 + height2 / 2)+(inLinksSize==1?0:10*(i+1-inlinkCenter))+(isEven?(-5):0));
        })
    }

    updateLinkTail(){
        [...this.outLinks].forEach((link)=>{
            var x1 = this.getBoundingClientRect().x;
            var y1 = this.getBoundingClientRect().y;
            
            var width1=this.getBoundingClientRect().width;
            var height1=this.getBoundingClientRect().height;

            
            link.setAttribute("x1", x1 + width1);
            link.setAttribute("y1", y1 + height1 / 2);
        })
    }

    focus(){
        //this.style.transformOrigin="left center"
        this.classList.add('focus')
        var event = new CustomEvent("focus");
        this.dispatchEvent(event);
        
        this.updateLink() 
    }
    blur(){
        this.classList.remove('focus')

        //this.style.transformOrigin=null
        
        var event = new CustomEvent("blur");
        this.dispatchEvent(event);        
        this.updateLink() 
    }
    focusNext(index){
        this.blur();
        this.next()[index].focus()
    }
    focusPrevious(index){
        this.blur();
        this.previous()[index].focus()
    }

    inactiveState={}

    active(){

        this.blur()
        this.removeInactiveEventHandlers()
        this.isActive=true
        this.classList.add("active")
        
        this.dimensions( this.parentFlow.active.width,this.parentFlow.active.height)
        this.animate({
            duration: 600,
            timing: function(timeFraction) {
                return timeFraction;
            },
            draw: (progress)=>{                 
                this.coordinates(this.parentFlow.active.x, this.parentFlow.active.y)
            }
        });  
        this.updateView('active')

        var event = new CustomEvent("active");
        this.dispatchEvent(event);
        
    }

    inactive(){
        this.attachInactiveEventHandlers()
        this.isActive=false
        this.classList.remove("active")  
        
        //console.log(this.inactiveState)        
        
        this.dimensions( this.inactiveState.width,this.inactiveState.height,this.inactiveState.depth)
        this.animate({
            duration: 600,
            timing: function(timeFraction) {
                return timeFraction;
            },
            draw: (progress)=>{                 
                this.coordinates(this.inactiveState.x,this.inactiveState.y,this.inactiveState.z)
            }
        });  
        
        this.updateView('inactive')
        
        this.blur()
        var event = new CustomEvent("inactive");
        this.dispatchEvent(event);
        
    }

    currentView
    updateView(state){
        
        const content=this.value.getUi(state)
        if(content && this.currentView){
            this.shadowRoot.replaceChild(content,this.currentView)  
            this.currentView=content
        }else{            
            this.render()
            this.currentView=this.shadowRoot.querySelector('.content')
        }
        

    }

    hide(){
        this.removeInactiveEventHandlers()
        this.classList.add('hidden');
        [...this.inLinks,...this.outLinks].forEach((link)=>{
            link.classList.add('hidden')
        })
        this.updateLink()
    }
    show(){
        this.attachInactiveEventHandlers()
        this.classList.remove('hidden');
        [...this.inLinks,...this.outLinks].forEach((link)=>{
            link.classList.remove('hidden')
        })
        this.updateLink()
    }
    animate({duration, draw, timing}) {

        let start = performance.now();

        requestAnimationFrame(function animate(time) {
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            let progress = timing(timeFraction)

            draw(progress);

            if (timeFraction < 1) {
            requestAnimationFrame(animate);
            }

        });
    }
    


    
}
Element.register('ui-flow-element', FlowElement);


class Flow extends ElementGroup{
    tags=['processes','inputs','outputs']
    link={}
    myObserver;
    active={}
    constructor() {
        super();        
        this.handleActiveListner = this.handleActive.bind(this)
        this.handleInactiveListner = this.handleInactive.bind(this)
        this.handleFocusListner = this.handleFocus.bind(this)
        
    }
    get CSS(){
        return `
        :host {
            display: block;
            height:100%;
            transform-style: preserve-3d;
        }
        #svg{
            width:100%;
            height: 100%;
        }
        svg{
            height: 100%;
        }
        
        .flowElement{
            
            position:absolute;            
            transition: all 300ms;
        }
        
        .flowElement:not(.active){
            border-radius: 4px;
            border: 2px solid #0c9ebf;
            transform: scale(1);            
            -webkit-filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
            filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
        }

        .flowElement:not(.active).focus {            
            transform: scale(1.5);
            -background-color: #185765;
            z-index:100;
            
        }
        .flowElement:not(.active).blur {
            -webkit-filter: blur(2px);
            filter: blur(2px);
            transform: scale(0.8);            
        }        
        .flowElement:not(.active).hidden {
           visibility:visible;
           opacity:0.3;
           transform: scale(0.8);          
        }
        
        svg line{
            transition: all 300ms;
        }
        svg line.hidden {
           visibility:visible;
           opacity:0.3;
           ttransform: scale(0.8); 
                    
        }
        
        
        
        .button {
            background-color: #96b4ce40;
            border: none;
            color: black;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
            color: #1a73e8;
            box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 2px 6px 2px rgb(60 64 67 / 15%);
            font: 500 14px Google Sans,Noto Sans,Noto Sans JP,Noto Sans KR,Noto Naskh Arabic,Noto Sans Thai,Noto Sans Hebrew,Noto Sans Bengali,sans-serif;
            letter-spacing: .6px;
            line-height: 24px;
            padding: 6px 24px;
            pointer-events: auto;
            text-transform: none;
            text-decoration: none;
            -webkit-transition: -webkit-transform .3s ease-in-out;
            transition: -webkit-transform .3s ease-in-out;
            transition: transform .3s ease-in-out;
            transition: transform .3s ease-in-out,-webkit-transform .3s ease-in-out;
            -webkit-transform: scale(1);
            transform: scale(1);
        }
        
        .button:hover {
            background-color: #f1f1f1;
        }
        .actions{
            position: fixed;
            bottom: 0;
            width: 100%;
            display: flex;
            justify-content: flex-end;
            height:3em;
            z-index: 1000;
        }
        .bbutton:not(:hover) {
            display: none;
        }
        .actions:hover + .hide {
            display: block;
        }

        `

    }
    get HTML(){
        return `
            <slot style="
            position: relative;
            width: 100%;
            height: 100%;
            display: block;
            ">
                <svg></svg>
            </slot>
            <slot name="actions">
                <div class="actions">
                    <button class="button close" id="close"><i class="fas fa-times"></i></button>
                </div>
            </slot>
        `
    }
    attachEventHandlers(){
        document.body.onresize = this.handleSVGResize.bind(this)
          
        this.shadowRoot.querySelector('#close').onclick = this.handleClose.bind(this);        
        document.onkeydown = (e)=>{this.checkKey(e)};
        this.myObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                // console.log('width', entry.contentRect.width);
                // console.log('height', entry.contentRect.height);
                // console.log('x',entry.contentRect.top)
                // console.log('y',entry.contentRect.bottom)
            });
        });
    }
    afterRender(){
        
        this.active.width="60%",
        this.active.height="60%"
        this.active.x=this.clientWidth/2
        this.active.y=this.clientHeight/2

        if(this.value){
            this.updateSVG()         
        }else{

        }
    }  
    
    handleValueChange(e){
        this.updateSVG() 
    }
    
    checkKey(e) {

        e = e || window.event;
        if (e.keyCode == '13') {
            this.setActiveByEnterKey()
        }
        if (e.keyCode == '38') {
            // up arrow
            this.focusFEByKeyBoard('UP')
        }
        else if (e.keyCode == '40') {
            // down arrow
            this.focusFEByKeyBoard('DOWN')
        }
        else if (e.keyCode == '37') {
            // left arrow
            this.focusFEByKeyBoard('LEFT')
        }
        else if (e.keyCode == '39') {
            // right arrow
            this.focusFEByKeyBoard('RIGHT')
        }

    }   

    _focusByKeyBoardIndex=0;
    _focusByKeyBoardDir=0;
    focusFEByKeyBoard(dir){
        var focused=this.shadowRoot.querySelector('.focus')
        if(!focused){
            this.shadowRoot.querySelector('.'+this.tags[0]).focus()

        }
        switch (dir) {
            case 'RIGHT':
                this._focusByKeyBoardIndex=0;
                this._focusByKeyBoardDir=1;
                focused.focusNext(this._focusByKeyBoardIndex) 
                break;
            case 'LEFT':
                this._focusByKeyBoardIndex=0;
                this._focusByKeyBoardDir=-1;
                focused.focusPrevious(this._focusByKeyBoardIndex) 
                break;
            case 'DOWN':
                this._focusByKeyBoardIndex+=1;
                ( this._focusByKeyBoardDir>0?focused.previous()[0].focusNext(this._focusByKeyBoardIndex) :focused.next()[0].focusPrevious(this._focusByKeyBoardIndex) )
                break;

            case 'UP':
                this._focusByKeyBoardIndex-=1;
                (this._focusByKeyBoardDir>0?focused.previous()[0].focusNext(this._focusByKeyBoardIndex) :focused.next()[0].focusPrevious(this._focusByKeyBoardIndex) )
                break;
        
            default:
                this._focusByKeyBoardDir=0;
                this._focusByKeyBoardIndex=0;
                this.shadowRoot.querySelector('.'+this.tags[0]).focus()
                break;
        }
        
    }
    setActiveByEnterKey(){
        var focused=this.shadowRoot.querySelector('.focus')
        focused.active()
    }

    handleClose(){
        this.activeFlowElement.inactive()
    }   
      
    //Create SVG Container
    createSVG() {
        if(this._svg){
            return this._svg
        }
        var svg = this.shadowRoot.querySelector('svg')
        var d3svg = d3.select(svg)
            //.append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")

        d3svg.append("svg:defs")
            .append("filter")
            .attr("id", "blurEdge")
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", "2")
        

        d3svg.append("svg:defs").append("svg:marker")
            .attr("id", "triangle-outline")
            .attr("viewBox","0 0 10 10")
            .attr("refX", 3)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .style("fill", "black");

        

        d3svg.append("svg:defs").append("svg:marker")
            .attr("id", "triangle-fill")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 -5 10 10")
            .style("stroke", "black");

        // svg.call(d3.zoom()
        //     .extent([[0, 0], [width, height]])
        //     .scaleExtent([1, 8])
        //     .on("zoom", zoomed));
      
        // function zoomed() {
        //     this.value.inputs[0].flowElement.attr("transform", d3.event.transform);
        // }

        // // Create scale
        // var scale = d3.scaleLinear()  
        //             .domain([0, this.clientWidth])                  
        //             .range([0, this.clientWidth]);

        // // Add scales to axis
        // var x_axis = d3.axisBottom()
        //             .scale(scale);

        // //Append group and insert axis
        // d3svg.append("g")
        // .call(x_axis);
        

        this._svg = d3svg
        return this._svg
    }

    //Update flowElments and their links
    async updateSVG() {
        if(this.activeFlowElement){            
            return
        }

        const width = this.clientWidth
        const height = this.clientHeight



        this.flowElementWidth = this.clientWidth/6
        this.flowElementHeight = this.clientHeight/6

        var svg = this.createSVG()
        svg.attr("viewBox", `0 0 ${width} ${height}`)


        var startTime=performance.now()

        
            
        const xoffset = (width / 2)
        var xEvenelySpaced=FlowUtility.getEvenlySpacedFromCenter(width,this.tags.length,this.flowElementWidth,this.flowElementWidth*0.4)

        this.tags.forEach((tag,tagIndex)=>{
            var evenlySpaced=FlowUtility.getEvenlySpaced(this.value[tag].length);
            
            this.value[tag].forEach((functionUnit, functionUnitIndex) => {
                var flowElement = this.getFlowElement(functionUnit)
                flowElement.dimensions(xEvenelySpaced.divisionLength, this.flowElementHeight);
                flowElement.coordinates(xEvenelySpaced.coordinates[1],(height / 2))
                flowElement.basedOnELment=flowElement.basedOnELment||this
                flowElement.classList.add(tag)
                this.myObserver.observe(flowElement);

                //Create FE for Each next FU
                Array.from([...functionUnit.next()]).forEach(identifier => {
                    var nextFU = this.value.getFunctionalUnit(identifier)
                    if (nextFU && nextFU.flowElement) {
                        var link = this.getLink(functionUnit.id, identifier)
                        flowElement.addOutLink(link)
                        nextFU.flowElement.addInLink(link)
                        if(tagIndex!=0){
                            var previouses=nextFU.flowElement.previous()
                            var {coordinates,divisionLength}=FlowUtility.getEvenlySpacedFromCenter(height,previouses.length,this.flowElementHeight,this.flowElementHeight*0.2)
                            previouses.forEach((fe,i)=>{
                                fe.basedOnELment=flowElement
                                fe.dimensions(xEvenelySpaced.divisionLength, divisionLength);  
                                fe.coordinates(xEvenelySpaced.coordinates[0],coordinates)
                            })
                        }
                    }
                })
                //Create FE for Each previous FU
                Array.from([...functionUnit.previous()]).forEach(identifier => {
                    var previousFU = this.value.getFunctionalUnit(identifier)
                    if (previousFU && previousFU.flowElement) {
                        var link = this.getLink(identifier,functionUnit.id)
                        flowElement.addInLink(link)
                        previousFU.flowElement.addOutLink(link)

                        if(tagIndex!=0){
                            var nexts=previousFU.flowElement.next()

                            var {coordinates,divisionLength}=FlowUtility.getEvenlySpacedFromCenter(height,nexts.length,this.flowElementHeight,this.flowElementHeight*0.2)
                                 
                            nexts.forEach((fe,i)=>{
                                fe.basedOnELment=flowElement
                                fe.dimensions(xEvenelySpaced.divisionLength, divisionLength);                                
                                fe.coordinates(xEvenelySpaced.coordinates[2],coordinates[i])
                            })
                        }
                    }
                })
            });
        })

        console.warn(`Processing flowElements took ${performance.now() - startTime}ms`);





    }


    handleSVGResize() {
        this.updateSVG()        
    }

    //Create or use cached flowelements
    getFlowElement(functionUnit) {
        if(functionUnit.flowElement){
            return functionUnit.flowElement
        }
        var flowElement=document.createElement('ui-flow-element')
        flowElement.type=functionUnit.type
        flowElement.value=functionUnit
        functionUnit.flowElement=flowElement;
        flowElement.parentFlow=this

        this.shadowRoot.querySelector('slot').append(flowElement)

        this.addFlowElementEventListeners(flowElement)
        
        return flowElement
    }
    //Create or use cached flowelement links
    getLink(sourceFlowElementIndentifier,destinationFlowElementIndentifier) {
        var link = this.link[sourceFlowElementIndentifier + "->" + destinationFlowElementIndentifier] 
        if(!link){
            link = this._svg.append("line")
                .style("stroke", "black")
                .attr("stroke-width", 2)
                .attr("marker-end", "url(#triangle-outline)")
            this.link[sourceFlowElementIndentifier+ "->" + destinationFlowElementIndentifier] = link
        }
        return link.node();
    }


    handleActive(event){
        this.activeFlowElement=event.target; 
        this.removeFlowElementEventListeners(this.activeFlowElement);        
          
        [...this.shadowRoot.querySelector('slot').querySelectorAll(".flowElement:not(.active)")].forEach(notActiveFE=>{
            notActiveFE.hide()
            this.removeFlowElementEventListeners(notActiveFE)
        })      
        
        //this._svg.attr("viewBox", `0 0 ${this.clientWidth} ${this.clientHeight}`) 
    }

    handleInactive(event){
        [...this.shadowRoot.querySelector('slot').querySelectorAll(".flowElement:not(.active)")].forEach(notActiveFE=>{
            notActiveFE.show()
            this.addFlowElementEventListeners(notActiveFE)
        })    
        this.addFlowElementEventListeners(event.target)
        this.activeFlowElement=null   
         

    }

    handleFocus(event){
        var prevousFocused=[...this.shadowRoot.querySelectorAll('.focus')].find(focused=>focused !=event.target)
        if(prevousFocused)
            prevousFocused.blur()
       
    }

    removeFlowElementEventListeners(flowElement){
        flowElement.removeEventListener('active',this.handleActiveListner)
        flowElement.addEventListener('inactive',this.handleInactiveListner)
        flowElement.removeEventListener('focus', this.handleFocusListner, true);
        
    }
    addFlowElementEventListeners(flowElement){
        flowElement.addEventListener('active', this.handleActiveListner)
        flowElement.removeEventListener('inactive',this.handleInactiveListner)
        flowElement.addEventListener('focus', this.handleFocusListner, true);
        
    }

    

    log(msg) {//See https://stackoverflow.com/a/27074218/470749
        var e = new Error();
        if (!e.stack)
            try {
                // IE requires the Error to actually be thrown or else the 
                // Error's 'stack' property is undefined.
                throw e;
            } catch (e) {
                if (!e.stack) {
                    //return 0; // IE < 10, likely
                }
            }
        var stack = e.stack.toString().split(/\r\n|\n/);
        if (msg === '') {
            msg = '""';
        }
        console.log(msg, '          [' + stack[1] + ']');        
    }

    

    static getSample(){
        const listElement=document.createElement(ElementGroup.elementRegistry[this])
        listElement.value=['Item 1','Item 2','Item 3']
        return listElement
    }  
    
}
ElementGroup.register('ui-flow', Flow);
export { Flow };