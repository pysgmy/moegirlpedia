/*
*名称：VC Editor Plus (简称VCEP)
*原作者：商火
*现修改者：喵萝酱
*版本号：Beta 1.2
*功能描述：辅助VC编辑者的工具集合
*安装方法：在个人js页添加代码 mw.loader.load('/index.php?title=User:喵萝酱/vcep.js&action=raw&ctype=text/javascript');
*/
//VC Editor Plus 辅助功能部分
//增强搜索栏
$('#p-search').after('<div id="search" style="z-index:10;position:absolute;top:155px;right:75px"><form action="https://api.bilibili.com/x/web-interface/view" ><input type="number" name="aid" size="20" placeholder="输入av番号获取B站数据">&nbsp;<input type="submit" formtarget="_blank" value="提交"></form></div><div id="search" style="z-index:10;position:absolute;top:130px;right:75px"><form action="https://api.bilibili.com/x/web-interface/view?" ><input type="text" name="bvid" size="20" placeholder="输入BV番号获取B站数据">&nbsp;<input type="submit" formtarget="_blank" value="提交"></form></div><div id="search" style="z-index:10;position:absolute;top:105px;right:75px"><form action="https://search.bilibili.com/all" ><input type="text" name="keyword" size="20" placeholder="搜索Bilibili">&nbsp;<input type="submit" formtarget="_blank" value="提交"></form></div>');
//监视器页面
$('#n-recentchanges').after('<li id="vcpatroller"><a href="https://zh.moegirl.org.cn/index.php?target=VOCALOID中文殿堂曲&showlinkedto=1&title=Special:%E7%9B%B8%E5%85%B3%E6%9B%B4%E6%94%B9" title="查看大部分VC相关页面的更改">VC巡查</a></li>');
$('#n-recentchanges').after('<li id="svpatroller"><a href="https://zh.moegirl.org.cn/index.php?title=Special:%E9%93%BE%E5%87%BA%E6%9B%B4%E6%94%B9&target=Synthesizer%20V%E6%AE%BF%E5%A0%82%E6%9B%B2&showlinkedto=1" title="查看大部分SV相关页面的更改">SV巡查</a></li>');
//即时数据查看
function imitateData(){
	$('.bilibiliCount').each(function(){
		var biliAid = $(this).data("bilibili-count-id");
		$(this).html('<a target="_blank" href="https://api.bilibili.com/archive_stat/stat?aid=' + biliAid + '">' + $(this).html() + '</a>');
	});
}
//VC Editor Plus 代码合成器部分
//主页面
$('#footer').after('<div id="vcep" style="z-index:10"></div><div id="vcep_toggle" style="z-index:11;transition:.37s all ease-in-out;width:20px;padding:5px 0;background-color:#000;color:#fff;font-size:8px;text-align:center;position:fixed;left:0;top:200px;cursor:pointer;opacity:.6;" onclick="vcepmainpage()">启<br/>动<br/>V<br/>C<br/>E<br/>P</div>');
function vcepmainpage(){
	document.getElementById('vcep_toggle').innerHTML="重<br/>启<br/>V<br/>C<br/>E<br/>P</div>";
	document.getElementById('vcep').innerHTML='<div style="z-index:1001;position:fixed; top:50px; right:calc(50% - 450px); width:860px; background:#fff; border:solid 1px; padding:20px" id="vcepmainpage"><h2 align="center">欢迎使用VC Editor Plus</h2><p>VC Editor Plus（以下简称VCEP）是<a href="/User:%E7%A9%BA%E7%BF%8A/%E8%90%8C%E7%99%BEVC%E7%BC%96%E8%BE%91%E5%9B%A2%E9%98%9F" title="User:空翊/萌百VC编辑团队">萌百VC区编辑组</a>成员<a href="/User:商火" title="User:商火">商火</a>开发，第二代维护者<a href="/User:喵萝酱" title="User:喵萝酱">喵萝酱</a>进行更新和维护（我就是个菜鸡呜呜呜），面向VC区编辑者进行泛VC（中文歌声合成软件）条目等相关工作的辅助工具，目前仍处于开发与测试状态。</p><p>VCEP工具基于JavaScript语言，请确保您的浏览器支持基础的JavaScript。</p><p>如果在使用过程中有任何问题或意见（程序或是界面观感），请<a href="/User_talk:喵萝酱" title="User_talk:喵萝酱">联系本人</a>提出，本人将尽力解决。同时由于维护者是不如开发者的一个基本什么都不会的新手，希望各位大佬多多指教呀喵~</p><p>测试与完善中的功能：<li><button onclick="temple()">添加殿堂（生成用于殿堂曲一览的wiki代码）</button></li><li>即时数据查看（自动启用）</li><li><button onclick="href()">快速访问/常用链接合集</button></li></p><p>开发中的功能：<ul><li>P主作品更新（用于P主作品一览表）</li><li>创建新曲词条</li></ul></div><div style="z-index:1003;position:fixed; top:50px; left:calc(50% - 450px);"><button onclick="lazy()"><span style="font-size:70%" title="改为懒人版">切换为懒人版</span></button></div><div style="z-index:1003;position:fixed; top:50px; right:calc(50% - 430px);" title="隐藏VCEP"><button onclick="hidevcep()" style="border:transparent; background:transparent;"><span style="font-size:150%">×</span></button></div>';
	imitateData();
}
function exitvcep(){
	document.getElementById('vcep').innerHTML="";
}
function hidevcep(){
	$('#vcep').hide();
	$('#vcep_toggle').attr("onclick", "showvcep()").html("显<br/>示<br/>V<br/>C<br/>E<br/>P</div");
}
function showvcep(){
	$('#vcep').show();
	$('#vcep_toggle').attr("onclick", "vcepmainpage()").html("重<br/>启<br/>V<br/>C<br/>E<br/>P</div");
}
//殿堂曲添加页面（普通）
function temple(){
	document.getElementById("vcep").innerHTML='<div style="z-index:10; position:fixed; top:50px; right:calc(50% - 450px); width:860px; height:545px; overflow:auto; background:#fff; border:solid 1px; padding:18px" class="layui-form-item" id="vceptemple"><h2 align="center">欢迎使用VC Editor Plus，您现在使用的功能是：添加殿堂</h2><form id="templeform" class="layui-form">　*曲名：<input type="text" placeholder="输入歌曲名" name="keyword"/> <input type="submit" value="搜索bilibili" formtarget="_blank" formaction="https://search.bilibili.com/all"/>　　　　　　　　　　　　<input type="reset" /><fieldset><legend>歌曲信息调查（将鼠标移到部分文本上可查看详细说明）：</legend><span title="“手动检查”将打开番号对应的视频页，三个番号只能填写一个，优先级为从左到右">*番号</span>：<input type="text" name="aid" placeholder="输入带av、BV的番号(Bilibili)" /> <input type="button" onclick="checkpic1()" value="bilibili手动检查"/> <input type="text"name="Vid" placeholder="只填写v=后文段(YouTube)" />  <input type="text" name="smid" placeholder="输入带sm的番号(niconico)" /><br/><br/>*UP主：<input type="text" name="uploader" placeholder="输入UP主ID" /> *投稿时间：<input type="text" name="time" size="19" placeholder="格式：2012-07-13 00:00"/>  是否为代投<input type="radio" name="originalproducer" value="是" />是 <input type="radio" name="originalproducer" value="否" />否<br/><br/>*第一歌姬：<select name="firstcolor" lay-verify="required" lay-search><option value ="#66CCFF">洛天依</option><option value ="#EE0000">乐正绫</option><option value ="#00FFCC">言和</option><option value ="#EE82EE">心华</option><option value ="#9999FF">星尘</option><option value ="#006666">乐正龙牙</option><option value ="#FFFF00">墨清弦</option><option value ="#0080FF">徵羽摩柯</option><option value ="#FF4004">赤羽</option><option value ="#f6be71">诗岸</option><option value ="#8bc0b5">苍穹</option><option value ="#3399ff">海伊</option><option value ="#3B5183">牧心</option><option value ="#613C8A">Minus</option><option value ="#FDD000">艾可</option><option value ="#E5A7E3">暗音Renri</option><option value ="#BECEEC">小春六花</option><option value ="#ECEBF0">爱莲娜·芙缇</option><option value ="#777777">多人／其他</option></select> 第二歌姬：<select name="secondcolor" lay-verify="required" lay-search><option value="0">(none)</option><option value ="#66CCFF">洛天依</option><option value ="#EE0000">乐正绫</option><option value ="#00FFCC">言和</option><option value ="#EE82EE">心华</option><option value ="#9999FF">星尘</option><option value ="#006666">乐正龙牙</option><option value ="#FFFF00">墨清弦</option><option value ="#0080FF">徵羽摩柯</option><option value ="#FF4004">赤羽</option><option value ="#f6be71">诗岸</option><option value ="#8bc0b5">苍穹</option><option value ="#3399ff">海伊</option><option value ="#3B5183">牧心</option><option value ="#613C8A">Minus</option><option value ="#FDD000">艾可</option><option value ="#E5A7E3">暗音Renri</option><option value ="#BECEEC">小春六花</option><option value ="#ECEBF0">爱莲娜·芙缇</option><option value ="#777777">多人／其他</option></select> <span title="当原曲目属于萌百收录范围时，直接填入曲目名（带消歧义）；当不属于时，填入“none”。原创曲勿填此项。">原曲条目：</span><input type="text" size="13" name="originalsong" placeholder="选填，翻唱时使用"/>消歧义：<input type="text" size="18" name="disambig" placeholder="选填，条目名括号中内容" /> <br/><br/><span title="“检查图片”用于确认文件是否存在且确为视频封面">封面文件：</span><input type="text" name="covera" size="20" placeholder="输入萌娘共享文件名" /> <input type="button" onclick="checkpic2()" value="检查图片"/> 封面网址：</span><input type="text" name="image" size="30" placeholder="输入图片网址，带后缀（优先项）" /> <input type="button" onclick="checkpic3()" value="检查图片"/></fieldset><input type="button" style="border-style:outset; color:red; border-color:red; background:transparent; padding:5px; width:100%; float:right;" value="确认并提交" onclick="composer()"></form><br/><div id="newwikitext" style="margin-top:20px; border:dashed 1px; max-height:200px; overflow:auto; padding:10px; font-size:14px;">Wiki代码将于此处输出</div></div><div style="z-index:1003;position:fixed; top:50px; left:calc(50% - 450px);"><button onclick="vcepmainpage()" style="border:transparent; background:transparent;"><span style="font-size:200%" title="返回主界面">⇦</span></button></div><div style="z-index:1003;position:fixed; top:50px; right:calc(50% - 430px);"  title="隐藏VCEP"><button onclick="hidevcep()" style="border:transparent; background:transparent;"><span style="font-size:150%">×</span></button></div>';
}
function checkpic1(){
	var fm = document.getElementById('templeform');
	var apiname = fm.elements.aid.value;
	window.open('https://www.bilibili.com/video/' + apiname);
}
function checkpic2(){
	var fm = document.getElementById('templeform');
	var imagename2 = fm.elements.covera.value;
	window.open('https://commons.moegirl.org.cn/File:' + imagename2);
}
function checkpic3(){
	var fm = document.getElementById('templeform');
	var imagename3 = fm.elements.image.value;
	window.open(imagename3);
}
 
//殿堂曲代码合成器
function composer(){
	var fm = document.getElementById('templeform');
	var songname = fm.elements.keyword.value;
	var aid = fm.elements.aid.value;
	var Vid = fm.elements.Vid.value;
	var smid = fm.elements.smid.value;
	var uploadtime = fm.elements.time.value;
	var uploader = fm.elements.uploader.value;
	var firstcolor = fm.elements.firstcolor.value;
	var secondcolor = fm.elements.secondcolor.value;
	var colortext = "";
	if (secondcolor !== '0') {
		colortext = "|First color = " + firstcolor + "<br />|Second color = " + secondcolor + "<br/>";
	}
		else {
			colortext = "|color = " + firstcolor + "<br/>";
		}
	var designation = "";
		if (aid) {
		designation = "|bb_id = " + aid + "<br/>";
		}
		else if (Vid) {
		designation = "|yt_id = " + Vid + "<br/>";
		}
		else if (smid) {
		designation = "|nc_id = " + smid + "<br/>";
		}
	
	var originalsong = fm.elements.originalsong.value;
	var originaltext = "";
	if (originalsong) {
		if (originalsong == "none") {
			originaltext = " (翻)";
		}
		else {
			originaltext = " ([[" + originalsong + "|翻]])";
		}
	}
	var disambig = fm.elements.disambig.value;
	var songnametext = "";
	if (disambig) {
		songnametext = "[[" + songname + "(" + disambig + ")|" + songname + "]]";
	}
	else {
		songnametext = "[[" + songname + "]]";
	}
	var originalproducer = fm.elements.originalproducer.value;
	var uploadertext = "";
	if (originalproducer == '是') {
		uploadertext = "[[" + uploader + "]](代投)";
	}
	else {
		uploadertext = "[[" + uploader + "]]";
	}
	var image = fm.elements.image.value;
	var covera = fm.elements.covera.value;
	var covername = "";
	if (image) {
		covername = image;
	}
	else {
		covername = "{{filepath:" + covera + "}}";
	}
	var text = "{{China Temple Song<br/>" + colortext + designation + "|曲目 = " + songnametext + originaltext + "<br />|UP主 = " + uploadertext + "<br />|投稿时间 = " + uploadtime + "<br />|再生数量 = {{BilibiliCount|id=" + aid + "}}<br />|image link = " + covername + "}}";
	document.getElementById('newwikitext').innerHTML = text;
}
//VC Editor Plus 懒人版部分
function lazy(){
	document.getElementById("vcep").innerHTML='<div style="z-index:10; position:fixed; top:50px; right:calc(50% - 450px); width:860px; background:#fff; border:solid 1px; padding:18px" id="vceptemple"><h2 align="center">欢迎使用VC Editor Plus懒人版∠(ᐛ」∠)＿</h2>啊你说这里为啥啥都没有，那是因为喵萝懒啊……<br /><div style="z-index:1003;position:fixed; top:50px; left:calc(50% - 450px);"><button onclick="vcepmainpage()"><span style="font-size:70%" title="返回主界面">切换为普通版</span></button></div><div style="z-index:1003;position:fixed; top:50px; right:calc(50% - 450px);"  title="隐藏VCEP"><button onclick="hidevcep()" style="border:transparent; background:transparent;"><span style="font-size:150%">×</span></button></div>';
}
//快速访问链接合集
function href(){
	document.getElementById("vcep").innerHTML='<div style="z-index:10; position:fixed; top:50px; right:calc(50% - 450px); width:860px; overflow:auto; height:545px; background:#fff; border:solid 1px; padding:18px" id="vceptemple"><h2 align="center">欢迎使用VC Editor Plus，您现在使用的功能是：快速访问</h2><div class="columns-list" style="column-count:2;column-width:;column-gap:;column-rule-color:;column-rule-style:none;column-rule-width:;"> <ul><li><a href="/Special:%E7%89%B9%E6%AE%8A%E9%A1%B5%E9%9D%A2" title="Special:特殊页面">Special:特殊页面</a></li><li><a href="/Category:%E5%B8%AE%E5%8A%A9" title="Category:帮助">Category:帮助</a></li><li><a href="/Category:%E6%A0%BC%E5%BC%8F%E6%A8%A1%E6%9D%BF" title="Category:格式模板">Category:格式模板</a></li><li><b>api</b>-B站数据获得网址（<a href="https://www.mywiki.cn/dgck81lnn/index.php/%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9API%E8%AF%A6%E8%A7%A3" title="API详解">食用说明</a>）</li><ul><li><a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://api.bilibili.com/archive_stat/stat?aid=">B站数据获得网址(av版，请输入纯数字)</a></li><li><a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://api.bilibili.com/archive_stat/stat?bvid=">B站数据获得网址(BV版)</a></li></ul></li><li>相关<b>讨论页面</b><ul><li><a href="/Talk:VOCALOID%E4%B8%AD%E6%96%87%E6%AE%BF%E5%A0%82%E6%9B%B2" title="Talk:VOCALOID中文殿堂曲">VOCALOID中文殿堂曲</a><br />[<span class="actionText plainlinks"><a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://zh.moegirl.org.cn/index.php?title=Talk:VOCALOID%E4%B8%AD%E6%96%87%E6%AE%BF%E5%A0%82%E6%9B%B2&amp;action=edit&amp;section=new"> 开会</a> &#124; <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://zh.moegirl.org.cn/index.php?title=Talk:VOCALOID%E4%B8%AD%E6%96%87%E6%AE%BF%E5%A0%82%E6%9B%B2&amp;action=watch">监视 </a></span>]</li><li><a href="/Talk:VOCALOID%E4%B8%AD%E6%96%87%E6%AE%BF%E5%A0%82%E6%9B%B2/VC%E7%BC%96%E8%BE%91%E6%8C%87%E5%BC%95" title="Talk:VOCALOID中文殿堂曲/VC编辑指引">VOCALOID中文殿堂曲/VC编辑指引</a><br />[<span class="actionText plainlinks"><a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://zh.moegirl.org.cn/index.php?title=Talk:VOCALOID%E4%B8%AD%E6%96%87%E6%AE%BF%E5%A0%82%E6%9B%B2/VC%E7%BC%96%E8%BE%91%E6%8C%87%E5%BC%95&amp;action=edit&amp;section=new"> 开会</a> &#124; <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://zh.moegirl.org.cn/index.php?title=Talk:VOCALOID%E4%B8%AD%E6%96%87%E6%AE%BF%E5%A0%82%E6%9B%B2/VC%E7%BC%96%E8%BE%91%E6%8C%87%E5%BC%95&amp;action=watch">监视 </a></span>]</li><li><a href="/%E8%90%8C%E5%A8%98%E7%99%BE%E7%A7%91_talk:%E6%9D%A1%E7%9B%AE%E6%A0%BC%E5%BC%8F/VOCALOID%E9%9F%B3%E4%B9%90" title="萌娘百科_talk:条目格式/VOCALOID音乐">萌娘百科:条目格式/VOCALOID音乐</a><br />[<span class="actionText plainlinks"><a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://zh.moegirl.org.cn/index.php?title=%E8%90%8C%E5%A8%98%E7%99%BE%E7%A7%91_talk:%E6%9D%A1%E7%9B%AE%E6%A0%BC%E5%BC%8F/VOCALOID%E9%9F%B3%E4%B9%90&amp;action=edit&amp;section=new"> 开会</a> &#124; <a target="_blank" rel="nofollow noreferrer noopener" class="external text" href="https://zh.moegirl.org.cn/index.php?title=%E8%90%8C%E5%A8%98%E7%99%BE%E7%A7%91_talk:%E6%9D%A1%E7%9B%AE%E6%A0%BC%E5%BC%8F/VOCALOID%E9%9F%B3%E4%B9%90&amp;action=watch">监视 </a></span>]</li></ul></ul><ul><li><b>导航/题头模板</b></li><ul>VOCALOID中文<ul><li><a href="/Template:VOCALOID中文殿堂曲导航" title="Template:VOCALOID中文殿堂曲导航">殿堂曲导航</a>／<a href="/Template:VOCALOID中文殿堂曲题头" title="Template:VOCALOID中文殿堂曲题头">殿堂曲题头</a></li><li><a href="/Template:VOCALOID中文传说曲导航" title="Template:VOCALOID中文传说曲导航">传说曲导航</a>／<a href="/Template:VOCALOID中文传说曲题头" title="Template:VOCALOID中文传说曲题头">传说曲题头</a></li><li><a href="/Template:VOCALOID中文神话曲导航" title="Template:VOCALOID中文神话曲导航">神话曲导航</a>／<a href="/Template:VOCALOID中文神话曲题头" title="Template:VOCALOID中文神话曲题头">神话曲题头</a></li></ul></ul><ul>UTAU中文<ul><li><a href="/Template:UTAU中文殿堂曲导航" title="Template:UTAU中文殿堂曲导航">殿堂曲导航</a>／<a href="/Template:UTAU中文殿堂曲题头" title="Template:UTAU中文殿堂曲题头">殿堂曲题头</a></li><li><a href="/Template:UTAU中文传说曲导航" title="Template:UTAU中文传说曲导航">传说曲导航</a>／<a href="/Template:UTAU中文传说曲题头" title="Template:UTAU中文传说曲题头">传说曲题头</a></li></ul></ul><ul>Synthesizer V<ul><li><a href="/Template:Synthesizer V殿堂曲导航" title="Template:Synthesizer V殿堂曲导航">殿堂曲导航</a>／<a href="/Template:Synthesizer V殿堂曲题头" title="Template:Synthesizer V殿堂曲题头">殿堂曲题头</a></li><li><a href="/Template:Synthesizer V传说曲导航" title="Template:Synthesizer V传说曲导航">传说曲导航</a>／<a href="/Template:Synthesizer V传说曲题头" title="Template:Synthesizer V传说曲题头">传说曲题头</a></li></ul></ul><li><a href="/User:%E5%95%86%E7%81%AB/%E8%AF%BE%E5%AE%A4" title="User:商火/课室">Wiki语言进阶教程</a></li><li><a href="/User:JackBlock/%E6%B8%90%E5%8F%98%E8%89%B2%E4%BD%BF%E7%94%A8" title="User:JackBlock/渐变色使用">渐变色使用整理</a></li><li><a href="/User:%E5%96%B5%E8%90%9D%E9%85%B1/P%E4%B8%BB%E9%A2%9C%E8%89%B2" title="User:喵萝酱/P主颜色">P主模板颜色汇整</a></li><li><a href="/VOCALOID%E4%B8%AD%E6%96%87%E6%AE%BF%E5%A0%82%E6%9B%B2/VC%E7%BC%96%E8%BE%91%E6%8C%87%E5%BC%95" title="VOCALOID中文殿堂曲/VC编辑指引">VC编辑指引</a></li><ul><li><a href="/VOCALOID%E4%B8%AD%E6%96%87%E6%AE%BF%E5%A0%82%E6%9B%B2/VC%E7%BC%96%E8%BE%91%E6%8C%87%E5%BC%95/VC%E4%B9%8BP%E4%B8%BB%E7%9B%B8%E5%85%B3%E6%94%B6%E5%BD%95%E8%A7%84%E5%88%99" title="VOCALOID中文殿堂曲/VC编辑指引/VC之P主相关收录规则">VC之P主相关收录规则</a></li></ul><li><b>歌姬模板</b></li><ul>VOCALOID<ul><li><a href="/Template:洛天依" title="Template:洛天依">Template:洛天依</a></li><li><a href="/Template:言和" title="Template:言和">Template:言和</a></li><li><a href="/Template:乐正绫" title="Template:乐正绫">Template:乐正绫</a></li><li><a href="/Template:乐正龙牙" title="Template:乐正龙牙">Template:乐正龙牙</a></li><li><a href="/Template:徵羽摩柯" title="Template:徵羽摩柯">Template:徵羽摩柯</a></li><li><a href="/Template:墨清弦" title="Template:墨清弦">Template:墨清弦</a></li><li><a href="/Template:初音未来(中文)" title="Template:初音未来(中文)">Template:初音未来(中文)</a></li><li><a href="/Template:心华" title="Template:心华">Template:心华</a></li><li><a href="/Template:星尘" title="Template:星尘">Template:星尘</a></li><li><a href="/Template:悦成" title="Template:悦成">Template:悦成</a></li><li><a href="/Template:章楚楚" title="Template:章楚楚">Template:章楚楚</a></li></ul>Synthesizer V<ul><li><a href="/Template:艾可" title="Template:艾可">Template:艾可</a></li><li><a href="/Template:赤羽" title="Template:赤羽">Template:赤羽</a></li><li><a href="/Template:诗岸" title="Template:诗岸">Template:诗岸</a></li><li><a href="/Template:苍穹(平行四界)" title="Template:苍穹">Template:苍穹</a></li><li><a href="/Template:海伊" title="Template:海伊">Template:海伊</a></li><li><a href="/Template:牧心" title="Template:牧心">Template:牧心</a></li><li><a href="/Template:Minus" title="Template:Minus">Template:Minus</a></li></ul>Sharpkey<ul><li><a href="/Template:幻晓伊" title="Template:幻晓伊">Template:幻晓伊</a></li><li><a href="/Template:%E7%90%AA%E4%BA%9A%E5%A8%9C%C2%B7%E5%8D%A1%E6%96%AF%E5%85%B0%E5%A8%9C" title="Template:琪亚娜 卡斯兰娜">Template:琪亚娜·卡斯兰娜</a></li><li><a href="/Template:元筱" title="Template:元筱">Template:元筱</a></li></ul>MUTA<ul><li><a href="/Template:嫣汐" title="Template:嫣汐">Template:嫣汐</a></li><li><a href="/Template:琥珀虚颜" title="Template:琥珀虚颜">Template:琥珀虚颜</a></li><li><a href="/Template:未央(MUTA)" title="Template:未央">Template:未央</a></li></ul></ul></ul></div></div><div style="z-index:1003;position:fixed; top:50px; left:calc(50% - 450px);"><button onclick="vcepmainpage()" style="border:transparent; background:transparent;"><span style="font-size:200%" title="返回主界面">⇦</span></button></div><div style="z-index:1003;position:fixed; top:50px; right:calc(50% - 430px);"  title="隐藏VCEP"><button onclick="hidevcep()" style="border:transparent; background:transparent;"><span style="font-size:150%">×</span></button></div>';
}
