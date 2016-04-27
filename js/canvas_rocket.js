//javascript

window.addEventListener('load', eventWindowLoaded, false);

function eventWindowLoaded(){
    
}

var audioType;

function supportedAudioFormat(audio){
    var returnExtension = "";
    if(audio.canPlayType("audio/mp3")=="probably"||audio.canPlayType("audio/mp3")=="maybe"){
        returnExtension = "mp3";
    }else if(audio.canPlayType("audio/wav")=="probably"||audio.canPlayType("audio/wav")=="maybe"){
        returnExtension = "wav";
    }else if(audio.canPlayType("audio/ogg")=="probably"||audio.canPlayType("audio/ogg")=="maybe"){
        returnExtension = "ogg";
    }
    
    return returnExtension;
}




var canvasApp = (function(){
    
    
    var sourceSounds = [{name:'fire2', src:'images/blow'},
                        {name:'fire', src:'images/fire'},
                       {name:'explode', src:'images/explode1'}];
    var sounds = new Array();
    var soundIndi = 0;
    
    
    
    var sourceImgs = [{name:'earth', src:'images/earth_bg.png'},
                      {name:'rocket', src:'images/rocket.png'},
                      {name:'fire', src:'images/fire.png'},
                      {name:'fire2', src:'images/fire_2.png'},
                      {name:'explode', src:'images/explode.png'},
                      {name:'satellite', src:'images/satellite.png'}
                     ];
    var imgs = new Object();
    var imgIndi = 0;
    
    
    
    var canvas;
    var ctx;
    var canvasWidth, canvasHeight;
    
    var clientWidth = document.documentElement.clientWidth;
    var clientHeight = document.documentElement.clientHeight;
    canvas = document.getElementById("main_canvas");
    ctx = canvas.getContext("2d");
    canvas.width = clientWidth;
    canvas.height = clientHeight;
    canvasWidth = canvas.offsetWidth;
    canvasHeight = canvas.offsetHeight;
    
    const FRAME_RATE = 30;  //帧率
    
    const FORCE_G = 1000;
    
    
    const DIR_UP = 270;
    const DIR_RIGHT = 0;
    const DIR_DOWN= 90;
    const DIR_LEFT = 180;
    var GAME_STATE_READY = 0;
    var GAME_STATE_LAUNCH = 1;
    var GAME_STATE_SPLIT = 2;
    var GAME_STATE_CIRCLE = 3;
    var current_state = 0;
    
    var earth = {};
    earth.width = 200;
    earth.height = 200;
    earth.radius = 100;
    earth.halfWidth = 100;
    earth.halfHeight = 100;
    earth.x = canvasWidth*0.5;
    earth.y = canvasHeight*0.5;
    earth.rotation = 270;
    earth.rotationVelocity = 0.4;
    
    
    var rocket = {};
    rocket.width = 50;
    rocket.height = 10;
    rocket.angle = 0;    //与地心连线成的角度。
    rocket.halfWidth = 25;
    rocket.halfHeight = 5;
    rocket.angleVelocity = 2;
    rocket.velocityX = 0;
    rocket.velocityY = 0;
    rocket.thrustPower = 0.1;
    rocket.tracks = [];
    rocket.trackFrame = 0;
    rocket.trackFrameMax = 5;
    rocket.isLive = true;
    
    satellites = [];
    
    satelliteWidth = 18;
    satelliteHeight = 21;
    satelliteHalfWidth = 9;
    satelliteHalfHeight = 10;
    satelliteThrustPower = 0.01;
    sateWait = 0;
    sateWaitMax = 20;
    
    var explodes = [];
    var explodePool = [];
    
    var gamePrepared = false;
    
    var currentObjectNo = 0;
    var currentObject = rocket;
    
    trackFrameMax = 5;
    
    var messages = [{txt:'向上键推进，左右键转变方向',type:'tip'}, 
                    {txt:'火箭发射后，按空格键释放卫星。'},
                    {txt:'按 0选择火箭，1-9选择对应卫星'}
                   ];
    var messageMax = 5;
    
    //游戏对象和数组
    
    
    var gameLoopHandle = null;
    

    
    var keyPressList = new Array();
    

    var init = function(){
        
        var offset = $(canvas).offset();
        canvasOffsetLeft = offset.left;
        canvasOffsetTop = offset.top;
        $(document.body).bind('keydown', eventKeyDown)
            .bind('keyup',eventKeyUp);
        loadImgs();
        frameRateCounter = new FrameRateCounter(FRAME_RATE);
        
        var intervalTime = 1000/FRAME_RATE;
        gameLoopHandle = setInterval(runGame,intervalTime);
    }
    function eventKeyDown(e){
        e = window.event?window.event:e;
        keyPressList[e.keyCode] = true;
        
        if(current_state==GAME_STATE_LAUNCH){
            if(e.keyCode>47&&e.keyCode<58){
                currentObjectNo = e.keyCode - 48;
                console.log(currentObjectNo);
                if(currentObjectNo==0){
                    currentObject = rocket;
                }else if(currentObjectNo <= satellites.length){
                    currentObject = satellites[currentObjectNo-1];
                }
                
                
            }
        }
        
        console.log('keydown'+e.keyCode);
    }
    function eventKeyUp(e){
        e = window.event?window.event:e;
        keyPressList[e.keyCode] = false;
        console.log('keyup');
    }
    
    
    
    function loadImgs(){
        var img;
        for(var i=0; i<sourceImgs.length; i++){
            img = new Image();
            img.imgName = sourceImgs[i].name;
            img.onload = function(e){
                var tar = window.event?window.event.srcElement:e.target;
                console.log(tar.imgName);
                imgs[tar.imgName] = tar;
                imgIndi++;
                if(imgIndi==sourceImgs.length){
                    loadSounds();
                }
            };
            img.src = sourceImgs[i].src;
        }
    }
    
    function loadSounds(){
        var sound;
        for(var i=0; i<sourceSounds.length; i++){
            sound = document.createElement("audio");
            document.body.appendChild(sound);
            if(i==0){
                audioType = supportedAudioFormat(sound);
            }
            sound.setAttribute("src",sourceSounds[i].src+"."+audioType);
            sound.soundName = sourceSounds[i].name;
            sound.addEventListener('canplaythrough', function(e){
                var tar = window.event?window.event.srcElement:e.target;
                console.log(tar.soundName);
                sounds[tar.soundName] = tar;
                soundIndi++;
                if(soundIndi==sourceSounds.length){
                    gameReady();
                }
            }, false);
        }
    }
    function runGame(){
        checkKeys();
        fillBackground();
        update();
        checkCollisions();
        render();
    }
    function gameReady(){
        //资源加载完成
        
    }

    function gameStateLoading(){
        fillBackground();
        ctx.fillStyle = "#ffffff";
        var percent = Math.round((imgIndi+soundIndi)/(sourceImgs.length+sourceSounds.length)*100);
        ctx.fillText("游戏加载中..."+percent+"%", 10, 50);
        console.log("游戏加载中..."+percent+"%");
    }
    
    function sendMessage(_msgTxt, _type){
        messages.push({txt:_msgTxt, type:_type});
        if(messages.length>messageMax){
            messages.shift();
        }
    }


    function fillBackground(){
        ctx.fillStyle= "#000000";
        ctx.fillRect(0,0, canvasWidth, canvasHeight);
    }
    function setTextStyle(size){
        if(!size){
            ctx.fillStyle = "#ffffff";
            ctx.font = "15px _sans";
            ctx.textBaseline = 'top';
            ctx.textAlign = "left";
        }else if(size=="big"){
            ctx.font = "22px _sans"
            ctx.fillStyle = "#ffffff";
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
        }else if(size=="middle"){
            ctx.font = "18px _sans"
            ctx.fillStyle = "#ffffff";
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
        }else if(size=="tiny"){
            ctx.font = "10px arial"
            ctx.fillStyle = "#ffffff";
            ctx.textBaseline = "top";
            ctx.textAlign = "left";
        }
    }
    function checkKeys(){
        //检查按键操作
        rocket.thrust = false;
        for(var i=0; i<satellites.length ; i++){
            satellites[i].thrust = false;
        }
        if(current_state==GAME_STATE_READY){
            if(keyPressList[38]==true){
                //推进
                rocket.thrust = true;
                //初始化火箭运行状态
                //待写
                var velocity = 2*Math.PI*(earth.radius+rocket.halfWidth)/360*earth.rotationVelocity;
                console.log(velocity);
                var angle = 90 + earth.rotation;
                var angleInRadians = Math.PI*angle/180;
                rocket.velocityX = velocity*Math.cos(angleInRadians);
                rocket.velocityY = velocity*Math.sin(angleInRadians);
                rocket.angle = rocket.rotationInRadians*180/Math.PI;
                current_state = GAME_STATE_LAUNCH;
                rocket.thrust = true;
            }
        }else if(current_state == GAME_STATE_LAUNCH){
            if(keyPressList[38]==true){
                //推进
                currentObject.thrust = true;
            }
            if(keyPressList[37]==true){
                //向左
                currentObject.angle -= currentObject.angleVelocity;
                currentObject.rotationInRadians = currentObject.angle*Math.PI/180;
            }
            if(keyPressList[39]==true){
                //向右
                currentObject.angle += currentObject.angleVelocity;
                currentObject.rotationInRadians = currentObject.angle*Math.PI/180;
            }
            sateWait++;
            if(keyPressList[32]==true&&currentObject==rocket){
                //分离
                if(sateWait>sateWaitMax){
                    sateWait=0;
                    var newSate = {};
                    var radius = rocket.halfWidth-satelliteHalfHeight;
                    newSate.x = rocket.x + radius*Math.cos(rocket.rotationInRadians);
                    newSate.y = rocket.y + radius*Math.sin(rocket.rotationInRadians);
                    newSate.angle = rocket.angle;
                    newSate.rotationInRadians = rocket.rotationInRadians;
                    newSate.velocityX = rocket.velocityX;
                    newSate.velocityY = rocket.velocityY;
                    newSate.thrustPower = satelliteThrustPower;
                    newSate.width = satelliteWidth;
                    newSate.height = satelliteHeight;
                    newSate.halfWidth = satelliteHalfWidth;
                    newSate.halfHeight = satelliteHalfHeight;
                    newSate.G = 0;
                    newSate.antiG = 0;
                    newSate.thrust = false;
                    newSate.tracks = [];
                    newSate.trackFrame = 0;
                    newSate.angleVelocity = 2;
                    satellites.push(newSate);
                }
                
                
                
                
            }
            
            
        }
        
        
    }
    
    
    function checkCollisions(){

        //卫星跟火箭还有其它卫星之间的碰撞
        var tempSate;
        var satellitesLength = satellites.length-1;
        
        for(var satelliteCtr = satellitesLength; satelliteCtr>=0; satelliteCtr--){
            tempSate = satellites[satelliteCtr];
            
            for(var i=satelliteCtr-1; i>=0; i--){
                if(boundingBoxCollide(tempSate, satellites[i])){
                    createExplode(tempSate.x, tempSate.y);
                    createExplode(satellites[i].x, satellites[i].y);
                    satellites.splice(satelliteCtr,1);
                    satellites.splice(i,1);
                    sendMessage('system: you lost 2 satellites.','warning');
                    if(currentObject==tempSate||currentObject==satellites[i]){
                        currentObject = rocket;
                        currentObjectNo = 0;
                    }
                    satelliteCtr--;
                    break;
                }
            }
            
            
//            //卫星和火箭
//            if(rocket.isLive&&boundingBoxCollide(rocket, tempSate)){
//                createExplode(rocket.x, rocket.y);
//                createExplode(tempSate.x, tempSate.y);
//                rocketDie();
//                
//                //去除卫星
//                satellites.splice(satelliteCtr,1);
//                sendMessage('system: you lost 1 satellites.', 'warning');
//                break;
//            }
//            
            
            /*卫星和地球的碰撞*/
            var disX = earth.x - tempSate.x;
            var disY = earth.y - tempSate.y;
            var dis = Math.sqrt(disX*disX + disY*disY);
            if(dis<earth.radius+tempSate.halfWidth){
                //火箭撞到地球
                createExplode(tempSate.x, tempSate.y);
                satellites.splice(satelliteCtr,1);
                if(currentObject==tempSate){
                    currentObject = rocket;
                    currentObjectNo = 0;
                }
                sendMessage('system: you lost 1 satellites.','warning');
                break;
            }

        }
        
        
        if(rocket.isLive&&current_state == GAME_STATE_LAUNCH){
            /*火箭和地球的碰撞*/
            var disX = earth.x - rocket.x;
            var disY = earth.y - rocket.y;
            var dis = Math.sqrt(disX*disX + disY*disY);
            if(dis<earth.radius+rocket.halfWidth-5){
                //火箭撞到地球
                createExplode(rocket.x, rocket.y);
                rocketDie();
            }
        }
        
    }
    function rocketDie(){
        rocket.isLive = false;
        rocket.tracks.splice(0, rocket.tracks.length);
        sendMessage("system: your rocket crushed. ", 'error');
    }

    function update(){
        updateEarth();
        if(rocket.isLive){
            updateRocket();
        }
        updateSatellites();
        updateExplodes();
//		updateParticles();
    }

    function updateSatellites(){
        var tempSate;
        for(var i=0; i<satellites.length; i++){
            tempSate = satellites[i];
            
            var disX = tempSate.x - earth.x;
            var disY = tempSate.y - earth.y;
            var disAngle = Math.atan2(disY, disX);
            var dis_x2 = (tempSate.x-earth.x)*(tempSate.x-earth.x) + (tempSate.y-earth.y)*(tempSate.y-earth.y);
            if(dis_x2<2500){
                dis_x2 = 2500;
            }
            tempSate.G = FORCE_G/dis_x2;
            tempSate.GAngle = disAngle+Math.PI*0.5;
            var velocityAntiG= Math.cos(tempSate.GAngle)*tempSate.velocityX+Math.cos(Math.PI*0.5 - tempSate.GAngle)*tempSate.velocityY;
            tempSate.antiG = velocityAntiG*velocityAntiG/Math.sqrt(dis_x2);
            
            
            //
            var mixG = tempSate.antiG - tempSate.G;
            //这是离心力和向心力的合力。然后再拆分到rocket.x, rocket.y上去
            var facingX = mixG*Math.cos(disAngle);
            var facingY = mixG*Math.sin(disAngle);
            
            var thrustX = 0;
            var thrustY = 0;
            if(tempSate.thrust==true){
                thrustX = tempSate.thrustPower*Math.cos(tempSate.rotationInRadians);
                thrustY = tempSate.thrustPower*Math.sin(tempSate.rotationInRadians);
            }
            
            tempSate.velocityX = tempSate.velocityX + facingX + thrustX;
            tempSate.velocityY = tempSate.velocityY + facingY + thrustY;
            tempSate.x += tempSate.velocityX;
            tempSate.y += tempSate.velocityY;
            
            tempSate.trackFrame++;
            if(tempSate.trackFrame>trackFrameMax){
                tempSate.trackFrame = 0;
                tempSate.tracks.push({x:tempSate.x, y:tempSate.y});
                if(tempSate.tracks.length>500){
                    tempSate.tracks.shift();
                }
            }
        }
    }
    
    function updateRocket(){
        var x, y;
        var earthAngleInRadians = earth.rotation*Math.PI/180;
        if(current_state == GAME_STATE_READY){
            //这时没有向心力跟地面支持力抵消
            //火箭跟随地球运动
            var radius = rocket.halfWidth + earth.radius;
            x = radius*Math.cos(earthAngleInRadians);   //这个是相对于地球中心的坐标
            y = radius*Math.sin(earthAngleInRadians);
            x = earth.x+x;  //火箭重心 在画布中的坐标
            y = earth.y+y;
            
            rocket.x = x;
            rocket.y = y;
            rocket.rotationInRadians = earthAngleInRadians;
        }else if(current_state = GAME_STATE_LAUNCH){
            var disX = rocket.x - earth.x;
            var disY = rocket.y - earth.y;
            var disAngle = Math.atan2(disY, disX);
            var dis_x2 = (rocket.x-earth.x)*(rocket.x-earth.x) + (rocket.y-earth.y)*(rocket.y-earth.y);
            if(dis_x2<2500){
                dis_x2 = 2500;
            }
            rocket.G = FORCE_G/dis_x2;
            rocket.GAngle = disAngle+Math.PI*0.5;
            var velocityAntiG= Math.cos(rocket.GAngle)*rocket.velocityX+Math.cos(Math.PI*0.5 - rocket.GAngle)*rocket.velocityY;
            rocket.antiG = velocityAntiG*velocityAntiG/Math.sqrt(dis_x2);
            
            
            //
            var mixG = rocket.antiG - rocket.G;
            //这是离心力和向心力的合力。然后再拆分到rocket.x, rocket.y上去
            var facingX = mixG*Math.cos(disAngle);
            var facingY = mixG*Math.sin(disAngle);
            
            var thrustX = 0;
            var thrustY = 0;
            if(rocket.thrust==true){
                thrustX = rocket.thrustPower*Math.cos(rocket.rotationInRadians);
                thrustY = rocket.thrustPower*Math.sin(rocket.rotationInRadians);
            }
            
            rocket.velocityX = rocket.velocityX + facingX + thrustX;
            rocket.velocityY = rocket.velocityY + facingY + thrustY;
            
            //
            
            rocket.x += rocket.velocityX;
            rocket.y += rocket.velocityY;
            
            rocket.trackFrame++;
            if(rocket.trackFrame > trackFrameMax){
                rocket.trackFrame = 0;
                rocket.tracks.push({x:rocket.x, y:rocket.y});
                if(rocket.tracks.length>1000){
                    rocket.tracks.shift();
                }
            }
            
        }
    }
 
    function updateExplodes(){
        var tempExplode;
        for(var i = explodes.length -1; i>=0; i--){
            tempExplode = explodes[i];
            tempExplode.lifeIndex++;
            if(tempExplode.lifeIndex >= tempExplode.lifeLength){
                explodes.splice(i,1);
                explodePool.push(tempExplode);
            }
        }
    }
    


    function render(){
        renderEarth();
        renderTrack();
        if(rocket.isLive){
            renderRocket();
        }
        renderBoard();
        renderSatellites();
        renderExplodes();
        renderWindow();
    }
    function renderWindow(){
        //画右上角的飞船姿态
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#027107";
        ctx.fillRect(canvasWidth-100, 0, 100, 100);
        
        ctx.translate(canvasWidth-50, 50);
        ctx.rotate(currentObject.rotationInRadians);
        if(currentObjectNo==0){
            ctx.drawImage(imgs['rocket'], -1*rocket.halfWidth, -1*rocket.halfHeight, rocket.width, rocket.height);
            if(rocket.thrust==true){
                ctx.drawImage(imgs['fire'], -1*rocket.halfWidth-20, -4);
            }
        }else{
            //卫星
            ctx.drawImage(imgs['satellite'], -1*currentObject.halfWidth, -1*currentObject.halfHeight, currentObject.width, currentObject.height);
            if(currentObject.thrust==true){
                ctx.drawImage(imgs['fire2'], -1*currentObject.halfWidth-16, -3);
            }
        }
            
        
        ctx.restore();
        
        var vectorAngle = Math.atan2(currentObject.velocityY, currentObject.velocityX);
        var arrowDisX = 45*Math.cos(vectorAngle);
        var arrowDisY = 45*Math.sin(vectorAngle);
        var arrowX = canvasWidth - 50 + arrowDisX;
        var arrowY = 50 + arrowDisY;
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(arrowX, arrowY, 2, 2);
    }
    function renderSatellites(){
        var tempSate;
        var sateThrust = false;
        for(var i=0; i<satellites.length; i++){
            tempSate = satellites[i];
            ctx.save();
            ctx.translate(tempSate.x, tempSate.y);
            ctx.rotate(tempSate.rotationInRadians);
            ctx.drawImage(imgs['satellite'], -1*tempSate.halfWidth, -1*tempSate.halfHeight, tempSate.width, tempSate.height);
            if(tempSate.thrust==true){
                ctx.drawImage(imgs['fire2'], -1*currentObject.halfWidth-16, -3);
                sateThrust = true;
                playSoundSatellite();
            }
            ctx.restore();
            if(currentObjectNo - 1==i){
                //给当前卫星加框
                ctx.save();
                ctx.strokeStyle = "#38fd11";
                ctx.lineWidth = 2;
                ctx.translate(currentObject.x, currentObject.y);
                var half = currentObject.halfHeight;
                ctx.beginPath();
                ctx.moveTo(half-5, -half);
                ctx.lineTo(half, -half);
                ctx.lineTo(half, -half+5);
                
                ctx.moveTo(half, half-5);
                ctx.lineTo(half, half);
                ctx.lineTo(half-5, half);
                
                ctx.moveTo(-half, half-5);
                ctx.lineTo(-half, half);
                ctx.lineTo(-half+5, half);
                
                ctx.moveTo(-half+5, -half);
                ctx.lineTo(-half, -half);
                ctx.lineTo(-half, -half+5);
                ctx.stroke();
                
                ctx.restore();
            }
        }
        
        if(sateThrust==false){
            playSoundSatelliteEnd();
        }
        
        
    }

    
    function renderRocket(){
        ctx.save();
        ctx.translate(rocket.x, rocket.y);
        ctx.rotate(rocket.rotationInRadians);
        ctx.drawImage(imgs['rocket'], -1*rocket.halfWidth, -1*rocket.halfHeight, rocket.width, rocket.height);
        if(rocket.thrust==true){
            ctx.drawImage(imgs['fire'], -1*rocket.halfWidth-20, -3);
            playSoundRocket();
        }else if(current_state == GAME_STATE_LAUNCH){
            playSoundRocketEnd();
        }
        ctx.restore();   
    }
    function playSoundRocket(){
        var sound = sounds['fire'];
        if(sound.currentTime>6){
            sound.currentTime = 4;
        }
        sound.play();
    }
    function playSoundRocketEnd(){
        var sound = sounds['fire'];
        sound.currentTime = 4;
        sound.pause();
    }
    function playSoundSatellite(){
        var sound = sounds['fire2'];
        if(sound.currentTime>4){
            sound.currentTime = 1;
        }
        sound.play();
    }
    function playSoundSatelliteEnd(){
        var sound = sounds['fire2'];
        sound.currentTime = 1;
        sound.pause();
    }
    
    
    function renderTrack(){
        //画轨迹
        ctx.fillStyle = "#ff0000";
        var tempSpot;
        var count = 0;
        var tracks = currentObject.tracks;
        for(var i = tracks.length-1; i>=0; i--){
            count++;
            if(count==100){
                ctx.fillStyle = "#dc0d0d";
            }else if(count==200){
                ctx.fillStyle = "#c51818";
            }else if(count==300){
                ctx.fillStyle = "#a82727";
            }else if(count==400){
                ctx.fillStyle = "#863232";
            }else if(count==500){
                ctx.fillStyle = "#753c3c";
            }else if(count==600){
                ctx.fillStyle = "#674242";
            }else if(count==700){
                ctx.fillStyle = "#5c4646";
            }else if(count==800){
                ctx.fillStyle = "#554b4b";
            }else if(count==900){
                ctx.fillStyle = "#3b3a3a";
            }
            
            tempSpot = tracks[i];
            ctx.fillRect(tempSpot.x, tempSpot.y, 2,2);
        }
    }
    
    function renderBoard(){
        setTextStyle();
        if(current_state ==  GAME_STATE_LAUNCH){
            var angle = currentObject.GAngle/Math.PI * 180;
            ctx.fillText('earth & object dis angle:'+angle, 5, 10);
        }
        ctx.fillText("object position:"+Math.floor(currentObject.x)+", "+Math.floor(currentObject.y), 5, 25);
        ctx.fillText("object antiG:"+currentObject.antiG, 5, 40);
        ctx.fillText("object G:"+currentObject.G, 5, 55);
        var currentObjectTxt;
        if(currentObjectNo ==0){
            currentObjectTxt = "Rocket";
        }else{
            currentObjectTxt = "S atellite No. "+currentObjectNo;
            if(currentObjectNo>satellites.length){
                ctx.fillStyle = "#f7d203";
                currentObjectTxt += " undefined";
            }
        }
        ctx.fillText("currentObject:"+currentObjectTxt, 5, canvasHeight - 20);
        ctx.fillStyle = "#41cc03";
        ctx.fillText("VX:"+currentObject.velocityX, canvasWidth - 100, 110);
        ctx.fillText("VY:"+currentObject.velocityY, canvasWidth - 100, 130);
        
        //显示右下角的系统通知
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#888888";
        ctx.fillRect(canvasWidth - 202, canvasHeight - 87, 200, 85);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(canvasWidth - 202, canvasHeight - 87, 200, 85);
        ctx.globalAlpha = 1;
        setTextStyle('tiny');
        var baseY = canvasHeight - 82;
        var baseX = canvasWidth - 197;
        var tempMessage;
        for(var i=0; i<messages.length; i++){
            tempMessage = messages[i];
            if(tempMessage.type == "error"){
                ctx.fillStyle = "#ff3535";
            }else if(tempMessage.type == "warning"){
                ctx.fillStyle = "#ffee35";
            }else if(tempMessage.type=="tip"){
                ctx.fillStyle = "#79ff3e";
            }
            ctx.fillText(tempMessage.txt, baseX, baseY);
            baseY += 15;
        }
        
        
        ctx.restore();
    }
    
    
    function renderExplodes(){
        var tempExplode;
        var explodeLength = explodes.length -1;
        for(var i=explodeLength; i>=0; i--){
            tempExplode = explodes[i];
            var sourceX = tempExplode.lifeIndex*32;
            var sourceY = 0;
            ctx.drawImage(imgs['explode'], sourceX, sourceY, 32, 32, tempExplode.x -16, tempExplode.y-16, 32, 32);
        }
    }

    function updateEarth(){
        earth.rotation += earth.rotationVelocity;
        if(earth.rotation>360){
            earth.rotation -= 360;
        }
    }
    function renderEarth(){
        var angleInRadians = earth.rotation*Math.PI/180;
        
        ctx.save();
        ctx.translate(earth.x, earth.y);
        ctx.rotate(angleInRadians);
        ctx.drawImage(imgs['earth'], -1*earth.halfWidth, -1*earth.halfHeight, earth.width, earth.height);
        
        ctx.restore();
    }
    

    function createExplode(x,y){
        if(explodePool.length>0){
            var newExplode = explodePool.pop();
            newExplode.x= x;
            newExplode.y = y;
            newExplode.lifeIndex = 0;
        }else{
            var newExplode = {x:x, y:y, lifeIndex:0, lifeLength: 3};
        }
        playSound(sounds['explode'], 0.8);
        explodes.push(newExplode);
        
    }
    
    function boundingBoxCollide(object1, object2){
        var left1 = object1.x;
        var left2 = object2.x;
        var right1 = object1.x + object1.width;
        var right2 = object2.x + object2.width;
        var top1 = object1.y;
        var top2 = object2.y;
        var bottom1 = object1.y+object1.height;
        var bottom2 = object2.y+object2.height;
        
        if(bottom1<top2) return false;
        if(bottom2<top1) return false;
        
        if(right1<left2) return false;
        if(right2<left1) return false;
        return true;
    }
    
    function playSound(sound, volume, startTime){
        if(!!startTime){
            sound.currentTime = startTime;
        }else{
            sound.currentTime = 0;
        }
        
        sound.volume = volume;
        sound.play();
    }
    function togglePause(){
        if(gameLoopHandle==null){
            var intervalTime = 1000/FRAME_RATE;
            gameLoopHandle = setInterval(runGame,intervalTime);
        }else{
            clearInterval(gameLoopHandle);
            gameLoopHandle =null;
        }
    }
        
    init();
    return {togglePause:togglePause};
})();


//帧率计算器:原理就是每帧发生时+1, 然后每秒钟清空一度计数据并输出一次数据。
function FrameRateCounter(fps){
    if(fps == undefined){
        this.fps = 40;
    }else{
        this.fps = fps;
    }
    this.lastFrameCount = 0;
    var dateTemp = new Date();
    this.frameLast = dateTemp.getTime();
    this.frameCtr = 0;
    this.lastTime = dateTemp.getTime();
    this.step = 1;
    delete dateTemp;
}
FrameRateCounter.prototype.counterFrames = function(){
    var dateTemp = new Date();
    var timeDifference = dateTemp.getTime() - this.lastTime;
    this.step = (timeDifference/1000)*this.fps;
    this.lastTime = dateTemp.getTime();
    this.frameCtr++;
    
    if(dateTemp.getTime() >= this.frameLast+1000){
        //console.log("frame event");
        this.lastFrameCount = this.frameCtr;
        this.frameLast = dateTemp.getTime();
        this.frameCtr = 0;
    }
    delete dateTemp;
}