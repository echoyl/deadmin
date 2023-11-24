@inject('ms', 'Echoyl\Sa\Services\WebMenuService')
@php $sibling_menus = $ms->siblings();@endphp
<!-- header -->
	<div class="banner_sub shzr" style=""><img src="{{toImageUrl($menu,'banner',true)}}" /></div>
	<div class="av-container av-visible">
		<div class="nav_sub aniview fast animated fadeInUp" av-animation="fadeInUp" style="opacity: 1;">
			<div class="w1200 clearfix">
				<div class="nav fl">
					<div class="s_nav clearfix">
						@foreach ($sibling_menus as $val)
						<div class="item">
							<h6><a href="{{$val['href']}}" class="{{$val['selected']?'on':''}}">{{$val['title']}}</a></h6>
						</div>
						@endforeach
					</div>
				</div>
				<div class="path fr">
					<p><a href="/" class="home"><img src="{{$pstatic}}/img/icon_03.png" alt="">
					</a>
						@foreach($bread as $key=>$val)@if($key > 0)&gt;@endif<a href="{{$val['href']}}">{{$val['title']}}</a>@endforeach&gt;<a href="javascript:;">{{$category['title']}}</a>
					</p>
				</div>
			</div>
		</div>
	</div>