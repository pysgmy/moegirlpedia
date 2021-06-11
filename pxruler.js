/*
*名称：屏幕像素测距器
*作者：商火
*版本号：1.1
*功能描述：就是算两个点的像素差
*安装方法：在个人js页添加代码 mw.loader.load('/index.php?title=User:商火/pxruler.js&action=raw&ctype=text/javascript');
*/
$('#footer').after('<div id="pxrulerpoint"></div><div id="pxruler_toggle" style="transition:.37s all ease-in-out;width:20px;padding:5px 0;background-color:#000;color:#fff;font-size:8px;text-align:center;position:fixed;left:0;top:100px;cursor:pointer;opacity:.6;" onclick="pxruler()">像<br/>素<br/>测<br/>距</div>');
var x1, y1, x2 = null, y2 = null, x3 = null, y3 = null;
//操作页面
function pxruler(){
	document.body.setAttribute("onmousedown", "setpoint1(event)");
	document.body.setAttribute("onmousemove", "selecting(event)");
	document.body.setAttribute("onmousewheel", "selecting(event)");
	document.getElementById('pxrulerpoint').innerHTML='<div id="pxrulertable" style="position:fixed; bottom:30px; left:10px; border:; padding:5px; background:#F6F6F6; opacity:.8;"><p id="point1xy">x1:-- y1:--</p><p id="point2xy">x2:-- y2:--</p><p id="deltaxy">Δx:-- Δy:--</p><hr/><p id="point3xy">x:--　y:--</p></div><div id="point1" style="position:absolute; top:; left:; width:8px; height:8px; background-color:#ee0000; border-radius:50%"></div><div id="point2" style="position:absolute; top:; left:; width:8px; height:8px; background-color:#66ccff; border-radius:50%"></div><div id="point3" style="position:absolute; top:; left:; width:8px;height:8px;background-color:#ee0000;border-radius:50%; opacity:.6"></div>';
	document.getElementById('pxruler_toggle').setAttribute("onclick", "exitpxruler()");
}
function exitpxruler(){
	document.getElementById('pxrulerpoint').innerHTML='';
	document.getElementById('pxruler_toggle').setAttribute("onclick", "pxruler()");
	document.body.removeAttribute("onmousedown");
	document.body.removeAttribute("onmousemove");
	document.body.removeAttribute("onmousewheel");
}
//点击时记录位置，并切换操作点
function selecting(event){
	x3 = event.clientX || window.event.clientX;
	x3 += document.documentElement.scrollLeft || document.body.scrollLeft;
	y3 = event.clientY || window.event.clientY;
	y3 += document.documentElement.scrollTop || document.body.scrollTop;
	document.getElementById("point3").style.left = x3 -4 + "px";
	document.getElementById("point3").style.top = y3 -4 + "px";
	document.getElementById('point3xy').innerHTML='x3:' + x3 + '　y3:' + y3;
}
function setpoint1(event){
	x1 = x3;
	y1 = y3;
	document.getElementById('point1').style.left = x1 - 4 + "px";
	document.getElementById('point1').style.top = y1 - 4 + "px";
	document.getElementById('point3').style.backgroundColor = "#66ccff";
	document.body.setAttribute("onmousedown", "setpoint2(event)");
	document.getElementById('point1xy').innerHTML='x1:' + x1 + ' y1:' + y1;
	document.getElementById('deltaxy').innerHTML='Δx:' + (x2-x1) + ' Δy:'+ (y2-y1);
}
function setpoint2(event){
	x2 = x3;
	y2 = y3;
	document.getElementById('point2').style.left = x2 - 4 + "px";
	document.getElementById('point2').style.top = y2 - 4 + "px";
	document.getElementById('point3').style.backgroundColor = "#ee0000";
	document.body.setAttribute("onmousedown", "setpoint1(event)");
	document.getElementById('point2xy').innerHTML='x2:' + x2 + ' y2:' + y2;
	document.getElementById('deltaxy').innerHTML='Δx:' + (x2-x1) + ' Δy:'+ (y2-y1);
}
