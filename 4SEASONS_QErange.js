//JavaScript code for calculating accessible Q-E ranges for 4SEASONS
// programed by T. Nakajima (ISSP-NSL) Nov. 11, 2019.
var Ei_numMax=5;
var Ei = new Array(Ei_numMax);
var decimal_digit = 1000;
var isOptimumEi= (new Array(Ei_numMax)).fill(true);

var DetBankNum = 12;

var tth_Max = new Array(DetBankNum);
var tth_Min = new Array(DetBankNum);
var eps=1e-6;

var T0_Chop_Const = 84.0/(2.0*Math.PI*300.0)*1000;     // (ms/Hz) cited from S. Itoh et al. Nuc. Inst. Methods in Phys. Research A61 86-92 (2012).

function draw() {

    draw_TOF();

    draw_Qxy();

    drawQELineCuts();
}

function draw_TOF(){

    var marginX = 50;
    var marginY = 20;

    var TOFscale = 10.0;    // ms to pixel
    var Lscale=10.0;        // meter to pixel

    var inputL1 = Number(document.getElementById('input_L1').value);
    var inputL2 = Number(document.getElementById('input_L2').value);
    var inputL3 = Number(document.getElementById('input_L3').value);

    var Ltotal_R = inputL1+inputL2;      // Real source to detector (m)
    var Lsc_R = inputL1-inputL3;        // Real sample chopper distance  (m)
    var L1_R = inputL1;          // Real source to sample distance (m)
    var TOF_len_R = 40;       // Real TOF max (ms)
    var TOFconst = 2.286;       // TOF at 1 m is 2.286/sqrt(E)
    var upperLimitEi = 300;    // upper limit of Ei 300 meV

    var Ltotal=Ltotal_R*Lscale;
    var Lsc = Lsc_R*Lscale;
    var L1 = L1_R*Lscale;
    var TOF_len = TOF_len_R*TOFscale;

    var TextSize = 10;      // pixel
    var ChopperOpen = 4;    // pixel


    var TickL = 8;

    var TOF_at_Chopper = new Array(50);

    //get elements from the document
    var canvas2 = document.getElementById('CanvasTOF');
    var context2 = canvas2.getContext('2d');


    var freq = Number(document.getElementById('freq').value);
    var ChopPeriod_R = 1.0/freq*1000.0/2.0;     // factor 1/2 is necessary for Fermi chopper
    var ChopPeriod = ChopPeriod_R*TOFscale;
    var ChopRept = TOF_len_R/ChopPeriod_R;

    var TargetEi = Number(document.getElementById('targetEi').value);
    var TargetTOF_at_Chopper=(TOFconst*(Lsc_R)/Math.sqrt(TargetEi));

    var upperLimitEi = Number(document.getElementById('upperLimitEi').value);


    var ChopOfst_R =0;      //Real chopper offset (ms)

    // find ChopOfst_R for targetEi
    for (var tt=0;tt<=ChopRept;tt+=1){
        var t1=(tt)*ChopPeriod_R;
        var t3=(tt+1.0)*ChopPeriod_R;

        if ((TargetTOF_at_Chopper >= t1) && (TargetTOF_at_Chopper < t3) ){
            ChopOfst_R=TargetTOF_at_Chopper-t1;
        }
    }

    var displayChopperOfst = ChopOfst_R;

    document.getElementById('offset').value=Math.round(displayChopperOfst*decimal_digit)/decimal_digit;

    var ChopOfst = ChopOfst_R*TOFscale;

    var temp = document.getElementById('Ei_Num_ofst');
    var Ei_num_ofst = Number(temp.value);


    //refresh
    context2.clearRect(0, 0, canvas2.width, canvas2.height);
    context2.strokeStyle = "rgb(0, 0, 0)";
    context2.lineWidth=1;

    //for debug
//    context2.fillText(ChopPeriod_R, marginX,marginY);
//    context2.fillText(TargetTOF_at_Chopper, marginX,marginY);

    //text labels
    context2.font = "italic 10px sans-serif";
    context2.fillText("Chopper", 1, marginY+(Ltotal-Lsc)+TextSize/2);
    context2.fillText("Sample", 1, marginY+(Ltotal-L1)+TextSize/2);
    context2.fillText("Source", 1, marginY+(Ltotal)+TextSize/2);
    context2.fillText("Detector", 1, marginY+TextSize/2);


    // x axis
    context2.beginPath();
    context2.moveTo(marginX, (Ltotal)+marginY);
    context2.lineTo(marginX, marginY);
    context2.stroke();

    // x ticks
    context2.font = " 10px sans-serif";
    for (var i=0;i<=4;i+=1){
        context2.beginPath();
        context2.moveTo(marginX+TOF_len/4*i, marginY+Ltotal);
        context2.lineTo(marginX+TOF_len/4*i, marginY+Ltotal-TickL);
        context2.stroke();
        context2.fillText(i*10, marginX+TOF_len/4*i-TextSize/2, marginY+Ltotal+TextSize*1.5);
    }

    // x label
    context2.fillText("Time (ms)", marginX+TOF_len/2-TextSize, marginY+Ltotal+TextSize*3);

    // y axis
    context2.beginPath();
    context2.moveTo(marginX, Ltotal+marginY);
    context2.lineTo(marginX+TOF_len, Ltotal+marginY);
    context2.stroke();

    // sample position
    context2.strokeStyle = "rgb(180, 180, 180)";
    context2.beginPath();
    context2.moveTo(marginX, Ltotal+marginY-L1);
    context2.lineTo(marginX+TOF_len, Ltotal+marginY-L1);
    context2.stroke();

    // det position
    context2.strokeStyle = "rgb(180, 180, 180)";
    context2.beginPath();
    context2.moveTo(marginX, marginY);
    context2.lineTo(marginX+TOF_len, marginY);
    context2.stroke();


    //chopper
    context2.lineWidth=4;
    context2.strokeStyle = "rgb(100, 100, 100)";
    context2.beginPath();
    context2.moveTo(marginX, Ltotal+marginY-Lsc);
    context2.lineTo(marginX-ChopperOpen/2+ChopOfst, Ltotal+marginY-Lsc);
    context2.stroke();
    TOF_at_Chopper[0]=(ChopOfst_R);    

    for (var i = 1; i < ChopRept+1; i += 1) {
        context2.beginPath();
        context2.moveTo(marginX+ChopPeriod*(i-1)+ChopperOpen/2+ChopOfst, Ltotal+marginY-Lsc);
        context2.lineTo(marginX+ChopPeriod*(i)-ChopperOpen/2+ChopOfst, Ltotal+marginY-Lsc);
        context2.stroke();
        TOF_at_Chopper[i]=(ChopPeriod_R*(i)+ChopOfst_R);    
    }

    // Determine Ei num offset
    Ei_num_ofst=0;
    for (var i=0;i<ChopRept;i+=1){
        var testE =(TOFconst/TOF_at_Chopper[i]*(Lsc_R))**2.0 ;
        if (testE > upperLimitEi){
            Ei_num_ofst += 1;
        }    
    }
    document.getElementById('Ei_Num_ofst').value=Ei_num_ofst;

    for(var i=0;i<Ei_numMax;i+=1){
        var idE='E'+(i+1);
        document.getElementById(idE).value = Math.round((TOFconst/TOF_at_Chopper[Ei_num_ofst+i]*(Lsc_R))**2.0*decimal_digit)/decimal_digit ;
        Ei[i]=(TOFconst/TOF_at_Chopper[Ei_num_ofst+i]*(Lsc_R))**2.0 ;
    }

    context2.lineWidth=1;
    for (var i = 0; i < Ei_numMax; i += 1) {
        context2.strokeStyle = "rgb(255, 0, 0)";
        context2.lineWidth=2;
        context2.beginPath();
        context2.moveTo(marginX, marginY+Ltotal);
//        context2.lineTo(marginX+TOF_at_Chopper[Ei_num_ofst+i]*10.0*Ltotal/Lsc, marginY);
        context2.lineTo(marginX+TOF_at_Chopper[Ei_num_ofst+i]*TOFscale*Ltotal/Lsc, marginY);
        context2.stroke();
    }
    context2.lineWidth=1;

}


function draw_Qxy(){

    var canvas3 = new Array(Ei_numMax);
    var context3 = new Array(Ei_numMax);

    var radius = 3; // radius for each reciprocal lattice point

    var scale0 = 1.0;       // 2ki = canvas.width/2 when scale0=1.0

    var scale = new Array(Ei_numMax);
    var ki = new Array(Ei_numMax);
    var frac_hbw = new Array(5);

    for (var j=0;j<Ei_numMax;j+=1){
        var labelCanvasQxy='CanvasQxy'+(Math.round(j+1));
        canvas3[j] = document.getElementById(labelCanvasQxy);
        context3[j] = canvas3[j].getContext('2d');

        ki[j]=Math.sqrt(Ei[j]/2.072);
        scale[j] = canvas3[j].width/2.0/(2.0*ki[j])*scale0;

        var labelFrac_hbw='frac_hbw'+(Math.round(j+1));
        frac_hbw[j] = Number(document.getElementById(labelFrac_hbw).value);

        var labelHbw='hbw'+(Math.round(j+1));
        document.getElementById(labelHbw).value = Math.round(Ei[j]*frac_hbw[j]*decimal_digit)/decimal_digit;

        var labelEicalc='E'+(Math.round(1+j))+'_calc';
        document.getElementById(labelEicalc).innerHTML = Math.round(Ei[j]*decimal_digit)/decimal_digit;
    }

    var omg1 = Number(document.getElementById('omega1').value);
    var omg2 = Number(document.getElementById('omega2').value);

    if (omg2 < omg1){
        var temp_omg2 = omg2;
        omg2=omg1;
        omg1=temp_omg2;
    }

    var a_star = Number(document.getElementById('a_star').value);
    var b_star = Number(document.getElementById('b_star').value);
    var gamma = Number(document.getElementById('gamma').value); 

    var qh = new Array(3);
    var qk = new Array(3);
    qh[0] = Number(document.getElementById('qh1').value);
    qk[0] = Number(document.getElementById('qk1').value);
    qh[1] = Number(document.getElementById('qh2').value);
    qk[1] = Number(document.getElementById('qk2').value);
    qh[2] = Number(document.getElementById('qh3').value);
    qk[2] = Number(document.getElementById('qk3').value);

    tth_Max[0] = Number(document.getElementById('D0_tth_max').value);
    tth_Min[0] = Number(document.getElementById('D0_tth_min').value);
    tth_Max[1] = Number(document.getElementById('D1_tth_max').value);
    tth_Min[1] = Number(document.getElementById('D1_tth_min').value);
    tth_Max[2] = Number(document.getElementById('D2a_tth_max').value);
    tth_Min[2] = Number(document.getElementById('D2a_tth_min').value);
    tth_Max[3] = Number(document.getElementById('D2b_tth_max').value);
    tth_Min[3] = Number(document.getElementById('D2b_tth_min').value);
    tth_Max[4] = Number(document.getElementById('D3_tth_max').value);
    tth_Min[4] = Number(document.getElementById('D3_tth_min').value);
    tth_Max[5] = Number(document.getElementById('D4_tth_max').value);
    tth_Min[5] = Number(document.getElementById('D4_tth_min').value);
    tth_Max[6] = Number(document.getElementById('D5_tth_max').value);
    tth_Min[6] = Number(document.getElementById('D5_tth_min').value);
    tth_Max[7] = Number(document.getElementById('D6_tth_max').value);
    tth_Min[7] = Number(document.getElementById('D6_tth_min').value);
    tth_Max[8] = Number(document.getElementById('D7_tth_max').value);
    tth_Min[8] = Number(document.getElementById('D7_tth_min').value);
    tth_Max[9] = Number(document.getElementById('D8_tth_max').value);
    tth_Min[9] = Number(document.getElementById('D8_tth_min').value);
    tth_Max[10] = Number(document.getElementById('D9_tth_max').value);
    tth_Min[10] = Number(document.getElementById('D9_tth_min').value);
    tth_Max[11] = Number(document.getElementById('D10_tth_max').value);
    tth_Min[11] = Number(document.getElementById('D10_tth_min').value);

    var originX = canvas3[0].width/2.0;
    var originY = canvas3[0].height/2.0;

    //accessible area  :   Note that for omega > 0, sample rotation is CCW, the accessible area rotates CW
    var cosOmg1 = Math.cos(-Math.PI/180.0*omg1);
    var sinOmg1 = Math.sin(-Math.PI/180.0*omg1);

    var cosOmg2 = Math.cos(-Math.PI/180.0*omg2);
    var sinOmg2 = Math.sin(-Math.PI/180.0*omg2);


    for(var p=0;p<Ei_numMax;p+=1){      // for loop for five Eis

    //refresh
    context3[p].clearRect(0, 0, canvas3[p].width, canvas3[p].height);
    context3[p].strokeStyle = "rgb(0, 0, 0)";
    context3[p].lineWidth=1;

    var kf = Math.sqrt(Ei[p]*(1.0-frac_hbw[p])/2.072);


    for(i_tth=0;i_tth<DetBankNum;i_tth+=1){

        context3[p].beginPath();
        context3[p].lineWidth=1;

        var dX=-(Math.cos(Math.PI/180.0*tth_Min[i_tth])*kf-1.0*ki[p])*scale[p];
        var dY=(Math.sin(Math.PI/180.0*tth_Min[i_tth]))*kf*scale[p];

        var tempX = cosOmg1*dX - sinOmg1*dY;
        var tempY = sinOmg1*dX + cosOmg1*dY;

        var dX = tempX;
        var dY = tempY;


        context3[p].moveTo(originX+dX, originY-dY);
        for (var tth= tth_Min[i_tth]; tth <= tth_Max[i_tth]; tth += 0.5) {
            var dX=-(Math.cos(Math.PI/180.0*tth)*kf-1.0*ki[p])*scale[p];
            var dY=(Math.sin(Math.PI/180.0*tth))*kf*scale[p];

            var tempX = cosOmg1*dX - sinOmg1*dY;
            var tempY = sinOmg1*dX + cosOmg1*dY;

            var dX = tempX;
            var dY = tempY;

            context3[p].lineTo(originX+dX , originY - dY);
        }
        for (var omg= omg1; omg < omg2; omg += 0.5) {
            var dX=-(Math.cos(Math.PI/180.0*tth_Max[i_tth])*kf-1.0*ki[p])*scale[p];
            var dY=(Math.sin(Math.PI/180.0*tth_Max[i_tth]))*kf*scale[p];

            var tempX = Math.cos(-Math.PI/180.0*omg)*dX - Math.sin(-Math.PI/180.0*omg)*dY;
            var tempY = Math.sin(-Math.PI/180.0*omg)*dX + Math.cos(-Math.PI/180.0*omg)*dY;

            var dX = tempX;
            var dY = tempY;

            context3[p].lineTo(originX+dX , originY - dY);
        }
        for (var i= tth_Max[i_tth]; i >= tth_Min[i_tth]; i -= 0.5) {
            var dX=-(Math.cos(Math.PI/180.0*i)*kf-1.0*ki[p])*scale[p];
            var dY=(Math.sin(Math.PI/180.0*i))*kf*scale[p];

            var tempX = cosOmg2*dX - sinOmg2*dY;
            var tempY = sinOmg2*dX + cosOmg2*dY;

            var dX = tempX;
            var dY = tempY;
            context3[p].lineTo(originX+dX , originY - dY);
        }
        for (var omg= omg2; omg > omg1; omg -= 0.5) {
            var dX=-(Math.cos(Math.PI/180.0*tth_Min[i_tth])*kf-1.0*ki[p])*scale[p];
            var dY=(Math.sin(Math.PI/180.0*tth_Min[i_tth]))*kf*scale[p];

            var tempX = Math.cos(-Math.PI/180.0*omg)*dX - Math.sin(-Math.PI/180.0*omg)*dY;
            var tempY = Math.sin(-Math.PI/180.0*omg)*dX + Math.cos(-Math.PI/180.0*omg)*dY;

            var dX = tempX;
            var dY = tempY;

            context3[p].lineTo(originX+dX , originY - dY);
        }
        context3[p].fillStyle="rgb(220, 230, 250)";
        context3[p].fill();
        context3[p].strokeStyle="rgb(0, 0, 250)";
        context3[p].stroke();

    }

    //R-lattice
    var cosGamma = Math.cos(Math.PI/180.0*gamma);
    var sinGamma = Math.sin(Math.PI/180.0*gamma);

    var Hmax = parseInt(2.0*ki[p]/a_star*2);
    var Kmax = parseInt(2.0*ki[p]/b_star*2);

    //q-vector 1
    context3[p].fillStyle="rgb(50, 220, 50)";
    for (var h=-Hmax;h<=Hmax;h+=1){
        for (var k=-Kmax;k<=Kmax;k+=1){
            //hkl+q
            var PosX = originX-((h+qh[0])*a_star+(k+qk[0])*b_star*cosGamma)*scale[p];
            var PosY = originY-(-(k+qk[0])*b_star*sinGamma)*scale[p];
            if ((Math.abs(PosX-originX)<canvas3[p].width/2.0)&&(Math.abs(PosY-originY)<canvas3[p].height/2.0)){
                context3[p].beginPath();
                context3[p].arc(PosX,PosY, radius, 0, 2 * Math.PI);
                context3[p].fill();
            }
            //hkl-q
            PosX = originX-((h-qh[0])*a_star+(k-qk[0])*b_star*cosGamma)*scale[p];
            PosY = originY-(-(k-qk[0])*b_star*sinGamma)*scale[p];
            if ((Math.abs(PosX-originX)<canvas3[p].width/2.0)&&(Math.abs(PosY-originY)<canvas3[p].height/2.0)){
                context3[p].beginPath();
                context3[p].arc(PosX,PosY, radius, 0, 2 * Math.PI);
                context3[p].fill();
            }
        }
    }

    //q-vector 2
    context3[p].fillStyle="rgb(50, 150, 250)";
    for (var h=-Hmax;h<=Hmax;h+=1){
        for (var k=-Kmax;k<=Kmax;k+=1){
            //hkl+q
            var PosX = originX-((h+qh[1])*a_star+(k+qk[1])*b_star*cosGamma)*scale[p];
            var PosY = originY-(-(k+qk[1])*b_star*sinGamma)*scale[p];
            if ((Math.abs(PosX-originX)<canvas3[p].width/2.0)&&(Math.abs(PosY-originY)<canvas3[p].height/2.0)){
                context3[p].beginPath();
                context3[p].arc(PosX,PosY, radius, 0, 2 * Math.PI);
                context3[p].fill();
            }
            //hkl-q
            PosX = originX-((h-qh[1])*a_star+(k-qk[1])*b_star*cosGamma)*scale[p];
            PosY = originY-(-(k-qk[1])*b_star*sinGamma)*scale[p];
            if ((Math.abs(PosX-originX)<canvas3[p].width/2.0)&&(Math.abs(PosY-originY)<canvas3[p].height/2.0)){
                context3[p].beginPath();
                context3[p].arc(PosX,PosY, radius, 0, 2 * Math.PI);
                context3[p].fill();
            }
        }
    }

    //q-vector 3
    context3[p].fillStyle="rgb(250, 150, 100)";
    for (var h=-Hmax;h<=Hmax;h+=1){
        for (var k=-Kmax;k<=Kmax;k+=1){
            //hkl+q
            var PosX = originX-((h+qh[2])*a_star+(k+qk[2])*b_star*cosGamma)*scale[p];
            var PosY = originY-(-(k+qk[2])*b_star*sinGamma)*scale[p];
            if ((Math.abs(PosX-originX)<canvas3[p].width/2.0)&&(Math.abs(PosY-originY)<canvas3[p].height/2.0)){
                context3[p].beginPath();
                context3[p].arc(PosX,PosY, radius, 0, 2 * Math.PI);
                context3[p].fill();
            }
            //hkl-q
            PosX = originX-((h-qh[2])*a_star+(k-qk[2])*b_star*cosGamma)*scale[p];
            PosY = originY-(-(k-qk[2])*b_star*sinGamma)*scale[p];
            if ((Math.abs(PosX-originX)<canvas3[p].width/2.0)&&(Math.abs(PosY-originY)<canvas3[p].height/2.0)){
                context3[p].beginPath();
                context3[p].arc(PosX,PosY, radius, 0, 2 * Math.PI);
                context3[p].fill();
            }

        }
    }

    //R-lattice
    context3[p].fillStyle="rgb(150, 150, 150)";

    for (var h=-Hmax;h<=Hmax;h+=1){
        for (var k=-Kmax;k<=Kmax;k+=1){
            var PosX = originX-(h*a_star+k*b_star*cosGamma)*scale[p];
            var PosY = originY-(-k*b_star*sinGamma)*scale[p];
            if ((Math.abs(PosX-originX)<canvas3[p].width/2.0)&&(Math.abs(PosY-originY)<canvas3[p].height/2.0)){
                context3[p].beginPath();
                context3[p].arc(PosX,PosY, radius, 0, 2 * Math.PI);
                context3[p].fill();
            }
        }
    }

    // draw a star
    context3[p].beginPath();
    context3[p].strokeStyle="rgb(250, 100, 100)";
    context3[p].lineWidth=2;
    context3[p].moveTo(originX,originY);
    context3[p].lineTo(originX+a_star*scale[p] , originY);
    context3[p].stroke();

    var arrow_head = 12;
    var font_size = 14;
    context3[p].beginPath();
    context3[p].lineWidth=1;
    context3[p].fillStyle="rgb(250, 100, 100)";
    //context3[p].moveTo(originX-a_star*scale[p] , originY);
    context3[p].moveTo(originX+a_star*scale[p] , originY-arrow_head/2);
    context3[p].lineTo(originX+a_star*scale[p]+arrow_head*0.7 , originY);
    context3[p].lineTo(originX+a_star*scale[p] , originY+arrow_head/2);
    context3[p].fill();
    context3[p].font = "italic 14px sans-serif";
    context3[p].fillText("a*", originX+a_star*scale[p]/2+font_size , originY-font_size/3 )

    // draw b star
    context3[p].beginPath();
    context3[p].strokeStyle="rgb(250, 100, 100)";
    context3[p].lineWidth=2;
    context3[p].moveTo(originX,originY);
    context3[p].lineTo(originX+b_star*cosGamma*scale[p], originY-b_star*sinGamma*scale[p]);
    context3[p].stroke();

    context3[p].beginPath();
    context3[p].lineWidth=1;
    context3[p].fillStyle="rgb(250, 100, 100)";

    var arrow_head_X = Array(3);
    var arrow_head_Y = Array(3);
    arrow_head_X[0]=b_star*scale[p];
    arrow_head_Y[0]=arrow_head/2.0;

    arrow_head_X[1]=b_star*scale[p]+arrow_head*0.7;
    arrow_head_Y[1]=0.0;

    arrow_head_X[2]=+b_star*scale[p];
    arrow_head_Y[2]=-arrow_head/2.0;

    for (var l=0;l<3;l+=1){
        var tempX=cosGamma*arrow_head_X[l]-sinGamma*arrow_head_Y[l];
        var tempY=sinGamma*arrow_head_X[l]+cosGamma*arrow_head_Y[l];
        arrow_head_X[l]=tempX;
        arrow_head_Y[l]=tempY;

    }
    context3[p].moveTo(originX+arrow_head_X[0] , originY-arrow_head_Y[0]);
    context3[p].lineTo(originX+arrow_head_X[1] , originY-arrow_head_Y[1]);
    context3[p].lineTo(originX+arrow_head_X[2] , originY-arrow_head_Y[2]);
    context3[p].fill();
    context3[p].font = "italic 14px sans-serif";
    context3[p].fillText("b*", originX+arrow_head_X[1]/2-font_size*1.4, originY-arrow_head_Y[1]/2-font_size );

    //draw scan range
    var labelStartH = 'startH'+(Math.round(p+1));
    var labelStartK = 'startK'+(Math.round(p+1));
    var startH = Number(document.getElementById(labelStartH).value);
    var startK = Number(document.getElementById(labelStartK).value);

    var scanStartPosX = originX+(startH*a_star+startK*b_star*cosGamma)*scale[p];
    var scanStartPosY = originY-(startK*b_star*sinGamma)*scale[p];

    var labelEndH = 'endH'+(Math.round(p+1));
    var labelEndK = 'endK'+(Math.round(p+1));
    var endH = Number(document.getElementById(labelEndH).value);
    var endK = Number(document.getElementById(labelEndK).value);

    var scanEndPosX = originX+(endH*a_star+endK*b_star*cosGamma)*scale[p];
    var scanEndPosY = originY-(endK*b_star*sinGamma)*scale[p];

    context3[p].beginPath();
    context3[p].lineWidth=2;
    context3[p].strokeStyle="rgb(200, 50, 250)";
    context3[p].moveTo(scanStartPosX , scanStartPosY);
    context3[p].lineTo(scanEndPosX , scanEndPosY);
    context3[p].stroke();

    }


}


function drawQELineCuts() {

    var canvas4 = new Array(Ei_numMax);
    var context4 = new Array(Ei_numMax);

    for(var ii=0;ii<Ei_numMax;ii+=1){
        var canvasName='CanvasQE'+(Math.round(ii+1));
        canvas4[ii] = document.getElementById(canvasName);
        context4[ii] = canvas4[ii].getContext('2d');    
    }

    var omg1 = Number(document.getElementById('omega1').value);
    var omg2 = Number(document.getElementById('omega2').value);

    // to aboid zero-division
    if((omg1==0)||(Math.abs(omg1)==90)){
        omg1+=0.1;
    }
    // to aboid zero-division
    if((omg2==0)||(Math.abs(omg2)==90)){
        omg2+=0.1;
    }
   
    var ki = new Array(Ei_numMax);
    for (var j=0;j<Ei_numMax;j+=1){
        ki[j]=Math.sqrt(Ei[j]/2.072);
    }


    var omgRept=2;
    var cosOmg = new Array(omgRept);
    var sinOmg = new Array(omgRept);

    cosOmg[0] = Math.cos(Math.PI/180.0*omg1);
    sinOmg[0] = Math.sin(Math.PI/180.0*omg1);

    cosOmg[1] = Math.cos(Math.PI/180.0*omg2);
    sinOmg[1] = Math.sin(Math.PI/180.0*omg2);

    var a_star = Number(document.getElementById('a_star').value);
    var b_star = Number(document.getElementById('b_star').value);
    var gamma = Number(document.getElementById('gamma').value);

    var cosGamma = Math.cos(Math.PI/180.0*gamma);
    var sinGamma = Math.sin(Math.PI/180.0*gamma);

    var OriginX = 30;
    var OriginY = 270;


    for(var ii=0;ii<Ei_numMax;ii+=1){   // for loop for five Eis.
        //refresh
        context4[ii].clearRect(0, 0, canvas4[ii].width, canvas4[ii].height);
        context4[ii].strokeStyle = "rgb(0, 0, 0)";
        context4[ii].lineWidth=1;

        var labelStartH = 'startH'+(Math.round(ii+1));
        var labelStartK = 'startK'+(Math.round(ii+1));
        var startH = Number(document.getElementById(labelStartH).value);
        var startK = Number(document.getElementById(labelStartK).value);
        var startQx = (startH*a_star+startK*b_star*cosGamma);
        var startQy = (startK*b_star*sinGamma);

        var labelEndH = 'endH'+(Math.round(ii+1));
        var labelEndK = 'endK'+(Math.round(ii+1));
        var endH = Number(document.getElementById(labelEndH).value);
        var endK = Number(document.getElementById(labelEndK).value);
        var endQx = (endH*a_star+endK*b_star*cosGamma);
        var endQy = (endK*b_star*sinGamma);

        var fullQLength=Math.sqrt((endQx-startQx)**2.0+(endQy-startQy)**2.0);
        var fullScanX=endQx-startQx;
        var fullScanY=endQy-startQy;
    
        for(var m=0;m<DetBankNum;m+=1){
        for(var sign =-1;sign<2;sign+=2){
        for(var kk=0;kk<omgRept;kk+=1){
        
            var rotStartQx=cosOmg[kk]*startQx - sinOmg[kk]*startQy;
            var rotStartQy=sinOmg[kk]*startQx + cosOmg[kk]*startQy;
    
            var rotEndQx=cosOmg[kk]*endQx - sinOmg[kk]*endQy;
            var rotEndQy=sinOmg[kk]*endQx + cosOmg[kk]*endQy;
    
            var A1=(rotEndQy-rotStartQy)/(rotEndQx-rotStartQx);
            var B1=rotEndQy-A1*rotEndQx;
        
            context4[ii].beginPath();
            context4[ii].strokeStyle="rgb(0, 0, 250)";
            context4[ii].lineWidth=1;
    
            var isFirstPoint=true;
            var Ystep=canvas4[ii].height;
            
            for(var jj=0;jj<=Ystep;jj+=1){
                var Ef=1.4*Ei[ii]-((1.3)*Ei[ii])/Ystep*jj;
                var kf = Math.sqrt(Ef/2.072);

                var limQxMax = 0;
                var limQxMin = 0;
                //limQxMin=-(Math.cos(Math.PI/180.0*tth_Min[m])*kf-1.0*ki[ii]);
                //limQxMax=-(Math.cos(Math.PI/180.0*tth_Max[m])*kf-1.0*ki[ii]);
                if(m<3){
                    limQxMin=-(Math.cos(Math.PI/180.0*tth_Max[m])*kf-1.0*ki[ii]);
                    limQxMax=-(Math.cos(Math.PI/180.0*tth_Min[m])*kf-1.0*ki[ii]);
                }
                else{
                    limQxMin=-(Math.cos(Math.PI/180.0*tth_Min[m])*kf-1.0*ki[ii]);
                    limQxMax=-(Math.cos(Math.PI/180.0*tth_Max[m])*kf-1.0*ki[ii]);
                }

                var aa=(1+1/(A1*A1));
                var bb=-2.0*(B1/(A1**2.0)+ki[ii]/A1);
                var cc=(B1/A1+ki[ii])**2.0-kf**2.0;

                if ((bb**2.0-4.0*aa*cc)>0){
            
                    var QyEdge1=(-bb+sign*Math.sqrt(bb**2.0-4.0*aa*cc))/(2.0*aa);
                    var QxEdge1=(QyEdge1-B1)/A1;
    
                    var drawFlag=false;

                    if((QxEdge1>=limQxMin)&&(QxEdge1<=limQxMax)){
                        if((QyEdge1>=0)&&(m>=3)){
                            drawFlag=true;
                        }
                        else if((QyEdge1<=0)&&(m<3)){
                            drawFlag=true;
                        }
                        else{
                            drawFlag=false;
                        }
                    }

                    if(drawFlag==true){
                        var rotBackQxEdge1=cosOmg[kk]*QxEdge1+sinOmg[kk]*QyEdge1;
                        var rotBackQyEdge1=-sinOmg[kk]*QxEdge1+cosOmg[kk]*QyEdge1;
    
                        var distQx=rotBackQxEdge1-startQx;
                        var distQy=rotBackQyEdge1-startQy;
    
                        var productQ = fullScanX*distQx+fullScanY*distQy;
                        
                        if(isFirstPoint==true){
                            context4[ii].moveTo(OriginX+productQ/fullQLength**2.0*(canvas4[ii].width-OriginX*3),canvas4[ii].height-jj*1);
                            isFirstPoint=false;
                        }
                        else{
                            context4[ii].lineTo(OriginX+productQ/fullQLength**2.0*(canvas4[ii].width-OriginX*3),canvas4[ii].height-jj*1);
                        }    
                    }
                
                }
            }        
            context4[ii].stroke();
        }   // end of omgRept loop
        }   // end of sign loop
        }   // end of DetBankNum loop


        for (var m=0;m<DetBankNum;m+=1){
        for(var TTHsign =0;TTHsign<2;TTHsign+=1){
        for(var sign =-1;sign<2;sign+=2){

            context4[ii].beginPath();
            context4[ii].strokeStyle="rgb(0, 0, 250)";
            context4[ii].lineWidth=1;

            var isFirstPoint=true;
            var Ystep=canvas4[ii].height;
            
            for(var jj=0;jj<=Ystep;jj+=1){
                var Ef=1.4*Ei[ii]-((1.3)*Ei[ii])/Ystep*jj;
                var kf = Math.sqrt(Ef/2.072);
                var TTH_lim = 0;
                if (TTHsign==0){
                    TTH_lim=tth_Min[m];
                }
                else{
                    TTH_lim=tth_Max[m];
                }

                var QlimSq = (kf*Math.sin(Math.PI/180.0*TTH_lim))**2.0+(kf*Math.cos(Math.PI/180*TTH_lim)-ki[ii])**2.0;
                var OmgZero = Math.atan2(kf*Math.sin(Math.PI/180.0*TTH_lim),-kf*Math.cos(Math.PI/180.0*TTH_lim)+ki[ii]);//0;
                /*if(OmgZero<0){
                    OmgZero=OmgZero+2*Math.PI;
                }*/
                var OmgMin = OmgZero-omg2/180.0*Math.PI;
                var OmgMax = OmgZero-omg1/180.0*Math.PI;
                
                /*if(OmgMax<OmgMin){
                    OmgMax=OmgMax+2.0*Math.PI;
                }*/

                var QyEdge1=0;
                var QxEdge1=0;
                var drawFlag=false;
                if(Math.abs(startQx-endQx)<eps){
                    if(QlimSq-startQx**2.0 > 0){
                        QyEdge1=sign*Math.sqrt(QlimSq-startQx**2.0);
                        QxEdge1=startQx;
                        drawFlag=true;
                    }
                }
                else if (Math.abs(startQy-endQy)<eps){
                    if(QlimSq-startQy**2.0 >= 0){
                        QxEdge1=sign*Math.sqrt(QlimSq-startQy**2.0);
                        QyEdge1=startQy;
                        drawFlag=true;
                    }
                }
                else{
                    var A1=(endQy-startQy)/(endQx-startQx);
                    var B1=endQy-A1*endQx;

                    var aa=(1+A1*A1);
                    var bb=2.0*A1*B1;
                    var cc=B1*B1-QlimSq;
        
                    if ((bb*bb-4.0*aa*cc)>0){
                        QxEdge1=(-bb+sign*Math.sqrt(bb*bb-4.0*aa*cc))/(2.0*aa);
                        QyEdge1=A1*QxEdge1+B1;
                        drawFlag=true;
                    }
                }

                if(drawFlag==true){
                    var distQx=QxEdge1-startQx;
                    var distQy=QyEdge1-startQy;
    
                    var productQ = fullScanX*distQx+fullScanY*distQy;
    
                    OmgTgt=Math.atan2(QyEdge1,QxEdge1);
    
                    /*if(OmgTgt<0){
                        OmgTgt=OmgTgt+2.0*Math.PI;
                    }*/
    
                    if((OmgTgt>=OmgMin)&&(OmgTgt<=OmgMax)){
                        if(isFirstPoint==true){
                            context4[ii].moveTo(OriginX+productQ/fullQLength**2.0*(canvas4[ii].width-OriginX*3),canvas4[ii].height-jj*1);
                            isFirstPoint=false;
                        }
                        else{
                            context4[ii].lineTo(OriginX+productQ/fullQLength**2.0*(canvas4[ii].width-OriginX*3),canvas4[ii].height-jj*1);
                        }    
                    } 
                    else{
                        isFirstPoint=true;
                    }   
                }
                else{
                    isFirstPoint=true;
                }

            }        
            context4[ii].stroke();

        }   // end of sign loop            
        }   // end of TTHsign loop
        }   // end of DetBankNum loop*/

        context4[ii].beginPath();
        context4[ii].strokeStyle="rgb(150, 150, 150)";
        context4[ii].lineWidth=1;
        context4[ii].moveTo(OriginX,canvas4[ii].height);
        context4[ii].lineTo(OriginX,0);
        context4[ii].stroke();

        context4[ii].beginPath();
        context4[ii].moveTo(OriginX,OriginY);
        context4[ii].lineTo(OriginX+canvas4[ii].width,OriginY);
        context4[ii].stroke();

        context4[ii].beginPath();
        context4[ii].moveTo(canvas4[ii].width-OriginX*2,canvas4[ii].height);
        context4[ii].lineTo(canvas4[ii].width-OriginX*2,0);
        context4[ii].stroke();

        // x ticks
        context4[ii].font = " 12px sans-serif";
        var EthickBar=5;
        var Espacing=20;
        var TextSize=20;
        if(Ei[ii]>100){
            Espacing=20;
            TextSize=25;
        }
        else if (Ei[ii]>50){
            Espacing=10;
            TextSize=20;
        }
        else if(Ei[ii]>10){
            Espacing=2;
            TextSize=20;
        }
        else if(Ei[ii]>5){
            Espacing=1;
            TextSize=20;
        }
        else {
            Espacing=0.5;
            TextSize=25;
        }

        var Estep= ((1.3)*Ei[ii])/canvas4[ii].height;  // energy (meV) per pixel

        // tick marks for y(energy)axis
        for (var i=-10;i<20;i+=1){
            context4[ii].beginPath();
            context4[ii].moveTo(OriginX, OriginY-Espacing/Estep*i);
            context4[ii].lineTo(OriginX+EthickBar, OriginY-Espacing/Estep*i);
            context4[ii].stroke();
            context4[ii].fillText(i*Espacing,OriginX-TextSize, OriginY-Espacing/Estep*i);
        }
        //*/
        // tick marks for x(q)axis
        var qTickBar=10;
        var tickSpan=(canvas4[ii].width-OriginX*3)/10;
        for (var i=1;i<10;i+=1){
            context4[ii].beginPath();
            if(i==5){
                context4[ii].moveTo(OriginX+tickSpan*i, OriginY-qTickBar);
                context4[ii].lineTo(OriginX+tickSpan*i, OriginY+qTickBar);    
            }
            else{
                context4[ii].moveTo(OriginX+tickSpan*i, OriginY-qTickBar/2);
                context4[ii].lineTo(OriginX+tickSpan*i, OriginY+qTickBar/2);    
            }
            context4[ii].stroke();
        }

        var startHK = '('+startH+','+startK+')';
        var padding1=4;
        var lineHeight=15;
        context4[ii].fillText(startHK,OriginX+padding1, OriginY+lineHeight);

        var endHK = '('+endH+','+endK+')';
        var padding1=4;
        var lineHeight=15;
        context4[ii].fillText(endHK,canvas4[ii].width-OriginX*2+padding1, OriginY+lineHeight);

        //horizontal bar showing the energy transfer
        var labelFracHbw = 'frac_hbw'+Math.round(ii+1);
        var frac_hbw = Number(document.getElementById(labelFracHbw).value);
        context4[ii].beginPath();
        context4[ii].strokeStyle="rgb(255, 0, 0)";
        context4[ii].lineWidth=1;
        context4[ii].moveTo(0, OriginY-Ei[ii]*frac_hbw/Estep);
        context4[ii].lineTo(canvas4[ii].width, OriginY-Ei[ii]*frac_hbw/Estep);    
        context4[ii].stroke();


    }   // end of for-loop for five Eis


}
