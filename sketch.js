let agents;
let newSize=100
let colors
let initialColor

function setup() {
  agents=[]
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER)
  colorMode(HSB)
  initialColor=color(348,81,96)
  colors=[color(212,95,37),color(198,100,47),color(164,96,65),color(50,43,84),color(40,97,95)]

  
  let x = floor((ceil((width)/400)+ceil((height)/400))/2)
  for (i=0;i<x;i++){
    for (j=0;j<x;j++){
    let newX=random(newSize+(width/x)*i,(width/x)*(i+1)-newSize)
    let newY=random(newSize+(height/x)*j,+(height/x)*(j+1)-newSize)
   
    agents.push(new Agent(newX,newY,newSize))
    }
  }
  

  noStroke()
  background(10);
}




function draw() {
  background(10,0.01);
  let a=0
  for(let i=0;i<agents.length;i++){
    const agent = agents[i]
    a=a || agent.update(i)
    
    agent.draw()
  }
  if (a==1){
      background(10,0.015);
    }
}

function getIndex(a,x){
  for(let i=0;i<a.length;i++){
    if (a[i]==x){
      return i
    }
  }
  return -1
}

function keyPressed() {
  if (keyCode === ENTER) {
    
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
      let fs = fullscreen();
      fullscreen(!fs);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup()
}

function mouseClicked() {
  agents.push(new Agent(mouseX,mouseY,newSize))
}

class Agent{
  constructor(x,y,size){
    this.pos = createVector(x,y);
    this.velocity=p5.Vector.random2D().mult(1.5);
    this.size = size;
    this.r=this.size/2;
    this.col=initialColor;
    this.absorbCount=0
    this.splitCount=0
    this.reversed=0
    this.reversedC=[]
  }
  
  draw(){
    
    // stroke(80)
    // strokeWeight(1)
    fill(this.col)
    circle(this.pos.x,this.pos.y,this.size)
    

    
  }
  
  drawShadow(){
    strokeWeight(1.5)
    stroke(this.col)
    fill(this.col)
    circle(this.pos.x,this.pos.y,this.size)
  }
  
  changeVelocity(agent){
    let newVelocity= p5.Vector.random2D();
   if (agent.velocity.x>0 && newVelocity.x>0){
     newVelocity.x*=-1;
   }
   if (agent.velocity.x<0 && newVelocity.x<0){
     newVelocity.x*=-1;
   }
   if (agent.velocity.y>0 && newVelocity.y>0){
     newVelocity.y*=-1;
   }
   if (agent.velocity.y>0 && newVelocity.y>0){
     newVelocity.y*=-1;
   }
   agent.velocity=newVelocity.mult(random(1,1.5))
  }
  
  avoid(x,y){
    
      let mousePos =createVector(x,y)
      

      let distanceVect = p5.Vector.sub(this.pos, mousePos);

      let distanceVectMag = distanceVect.mag();

      // Minimum distance before they are touching
       if (distanceVectMag <= 100) {
         
         if (this.reversed==0){
           this.changeVelocity(this)
           this.reversed=1
         }
    }
    if (distanceVectMag > 100){
          this.reversed=0
        }
  }
  
  splitC(i){
    if (this.splitCount>=15){
      agents.splice(i,1)
    }
  }
  
  absorbed(){
    if (this.absorbCount>=15){
      let f=0
      let x
      let y
      while(f!=1){
        x=random(newSize/2,width-newSize/2)
        y=random(newSize/2,height-newSize/2)
        let newMiddle=createVector(x,y)
        for(let j=0;j<agents.length;j++){
          
          const other = agents[j]

          // Get distances between the balls components
          let distanceVect = p5.Vector.sub(other.pos, newMiddle);

          // Calculate magnitude of the vector separating the balls
          let distanceVectMag = distanceVect.mag();

          // Minimum distance before they are touching
          let minDistance = newSize/4 + other.r;
           if (distanceVectMag > minDistance) {
             f=1
           }
          if (distanceVectMag <= minDistance) {
             f=0
            break
           }
        }   
      }
      this.absorbCount=0
      agents.push(new Agent(x,y,newSize/2))
        
    }
  }
  
  combine(other,vec,i,j){
    let middle=this.pos.add(vec.mult(0.5))
    let newR=this.r+other.r
    if (newR>75) newR =75
    
    if(middle.x+newR>width)newR=newR-(middle.x+newR-width)
    if(middle.y+newR>height)newR=newR-(middle.y+newR-height)
    if(middle.x-newR<0)newR=newR+(middle.x-newR)
    if(middle.y-newR<0)newR=newR+(middle.y-newR)
    
    for(let k=0;k<agents.length;k++){
      if (i!=k && j!=k){
        const next = agents[k]

        // Get distances between the balls components
        let distanceVect = p5.Vector.sub(next.pos, middle);

        // Calculate magnitude of the vector separating the balls
        let distanceVectMag = distanceVect.mag();

        // Minimum distance before they are touching
        let minDistance = newR + next.r;
        if (minDistance>=distanceVectMag){
          newR=distanceVectMag-next.r-2
        }
      }
    }
    if (newR>75) newR =75
    let a=new Agent(middle.x,middle.y,newR*2)
    if (this.r>other.r){
      a.velocity=this.velocity
    }else{
      a.velocity=other.velocity
    }
    
    a.absorbCount=this.absorbCount+other.absorbCount+1
    agents.push(a)
    if(i>j){
      agents.splice(i,1)
      agents.splice(j,1)
    }
    if(i<j){
      agents.splice(j,1)
      agents.splice(i,1)
    }
  }
  
  checkCollision(i){
  for(let j=0;j<agents.length;j++){
      if (i!=j){
        const other = agents[j]

        // Get distances between the balls components
        let distanceVect = p5.Vector.sub(this.pos, other.pos);

        // Calculate magnitude of the vector separating the balls
        let distanceVectMag = distanceVect.mag();

        // Minimum distance before they are touching
        let minDistance = this.r + other.r;
         if (distanceVectMag < minDistance) {

            if(getIndex(this.reversedC,other)<0 && getIndex(other.reversedC,this)<0){
             this.changeVelocity(this)
             this.changeVelocity(other)

             if (this.col==initialColor && other.col==initialColor){
               this.col=random(colors)
               other.col=random(colors)
             }
             else if (this.col!=initialColor && other.col==initialColor){
               this.col=random(colors)
             }
             else if (this.col==initialColor && other.col!=initialColor){
               other.col=random(colors)
             }
             else if (this.col!=initialColor && other.col!=initialColor){
               this.combine(other,distanceVect,i,j)

             }

             this.reversedC.push(other)
             other.reversedC.push(this)
           }
         }
         

         if (distanceVectMag > minDistance){
           if(getIndex(this.reversedC,other)!=-1 && getIndex(other.reversedC,this)!=-1){
            this.reversedC.splice(getIndex(this.reversedC,other),1)
            other.reversedC.splice(getIndex(other.reversedC,this),1)
          }
         }
      }
    }
    
  }
  
  update(i){
    this.pos.add(this.velocity)
    let a=0
    //circle collision
    
    this.checkCollision(i)
    //boundary collision

    if (this.pos.x+this.r > width) {
      this.velocity.x *=-1
      if(this.size/2-2>10){
        let agent1=new Agent(this.pos.x,this.pos.y+this.r/2,this.size/2-2)
        if (agent1.velocity.x>0)agent1.velocity.x*=-1
        agent1.absorbCount=this.absorbCount
        agent1.splitCount=this.splitCount+1
        agent1.velocity.mult(1.5)
        agents.push(agent1)
        let agent2=new Agent(this.pos.x,this.pos.y-this.r/2,this.size/2-2)
        if (agent2.velocity.x>0)agent2.velocity.x*=-1
        agent2.absorbCount=this.absorbCount
        agent2.splitCount=this.splitCount+1
        agent2.velocity.mult(1.5)
        agents.push(agent2)
        agents.splice(i,1)
        a=1
      }
      
      
    }
    if (this.pos.x < this.r) {
      this.velocity.x *=-1
      if(this.size/2-2>10){
        let agent1=new Agent(this.pos.x,this.pos.y+this.r/2,this.size/2-2)
        if (agent1.velocity.x<0)agent1.velocity.x*=-1
        agent1.absorbCount=this.absorbCount
        agent1.splitCount=this.splitCount+1
        agent1.velocity.mult(1.5)

        agents.push(agent1)
        let agent2=new Agent(this.pos.x,this.pos.y-this.r/2,this.size/2-2)
        if (agent2.velocity.x<0)agent2.velocity.x*=-1
        agent2.absorbCount=this.absorbCount
        agent2.splitCount=this.splitCount+1
        agent2.velocity.mult(1.5)

        agents.push(agent2)
        agents.splice(i,1)
        a=1
      }
    }
    if (this.pos.y > height-this.r) {
      this.velocity.y *=-1
      if(this.size/2-2>10){
        let agent1=new Agent(this.pos.x+this.r/2,this.pos.y,this.size/2-2)
        if (agent1.velocity.y>0)agent1.velocity.y*=-1
        agent1.absorbCount=this.absorbCount
        agent1.splitCount=this.splitCount+1
        agent1.velocity.mult(1.5)

        agents.push(agent1)
        let agent2=new Agent(this.pos.x-this.r/2,this.pos.y,this.size/2-2)
        if (agent2.velocity.y>0)agent2.velocity.y*=-1
        agent2.absorbCount=this.absorbCount
        agent2.splitCount=this.splitCount+1
        agent2.velocity.mult(1.5)

        agents.push(agent2)
        agents.splice(i,1)
        a=1
      }
    }
    if (this.pos.y < this.r){
      this.velocity.y *=-1
      if(this.size/2-2>10){
        let agent1=new Agent(this.pos.x+this.r/2,this.pos.y,this.size/2-2)
        if (agent1.velocity.y<0)agent1.velocity.y*=-1
        agent1.absorbCount=this.absorbCount
        agent1.splitCount=this.splitCount+1
        agent1.velocity.mult(1.5)

        agents.push(agent1)
        let agent2=new Agent(this.pos.x-this.r/2,this.pos.y,this.size/2-2)
        if (agent2.velocity.y<0)agent2.velocity.y*=-1
        agent2.absorbCount=this.absorbCount
        agent2.splitCount=this.splitCount+1
        agent2.velocity.mult(1.5)

        agents.push(agent2)
        agents.splice(i,1)
        a=1
      }
    }
 
    this.absorbed()
    this.splitC(i)
    this.avoid(mouseX,mouseY)
    return a
  }
    
    
}
