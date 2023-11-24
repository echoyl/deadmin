	@inject('url', 'Echoyl\Sa\Services\web\UrlService')
	@inject('ms', 'Echoyl\Sa\Services\WebMenuService')
	@inject('ws', 'Echoyl\Sa\Services\WebsiteService')
	@php 
		$webset = $ws->webset();
		$allMenu = $ms->getAll('首页');
	@endphp
		<!-- pc端菜单 加上类 static 就是详情的头 -->
		<div class="bl-header-web {{$static?'static':''}}">
			<div class="bl-header-pc ">
				<div class="bl-header-pc-top">
					<div class="bl-header-pc-top-menu">
						<a class="bl-header-pc-top-menu-item" href="javascript:;">
							<i class="ri-wechat-line"></i>
							<div class="bl-header-pc-top-menu-hoverMenu">
								<img src="{{toImageUrl($webset['more']['value'],'weixin')}}" />
							</div>
						</a>
						<a class="bl-header-pc-top-menu-item" href="{{$url->url('search')}}"><i class="ri-search-2-line"></i></a>
						<!-- <a class="bl-header-pc-top-menu-item" href="#"><i class="ri-menu-line"></i></a> -->
					</div>
				</div>
				<div class="bl-header-pc-bottom">
					<div class="bl-header-pc-bottom-left">
						<a href="/" class="bl-header-pc-bottom-left-logoImg">
							<img src="{{toImageUrl($webset,'logo')}}" />
						</a>
						<img class="bl-header-pc-bottom-left-logoText" src="{{toImageUrl($webset,'logo_text')}}" />
					</div>
					<div class="bl-header-pc-bottom-right">

						<div class="bl-header-pc-bottom-menulist">
							@foreach ($allMenu as $key=>$val) 
							<div class="bl-header-pc-bottom-menuitem {{$val['selected']?'hover':''}}">
								
								@if(!empty($val['children']))
									<span class="menuitem-title">{{$val['title']}}</span>
									<div class="menuitem-hover-chilcd">
										@foreach($val['children'] as $child)
										@if($child['top'])
										<a class="menuitem-hover-chilcd-item {{$child['selected']?'hover':''}}" href="{{$child['href']}}" target="{{$child['blank']?'_blank':'_self'}}">{{$child['title']}}</a>
										@endif
										@endforeach
									</div>
								@else
									<a href="{{$val['selected']?'javascript:;':$val['href']}}" target="{{$val['blank']?'_blank':'_self'}}" class="menuitem-title">{{$val['title']}}</a>
								@endif
							</div>
							@endforeach
						</div>

						<div class="bl-header-pc-bottom-menuBg">

						</div>
					</div>
					<div class="bl-header-pc-bottom-mobilemenu">
						<a class="bl-header-pc-top-menu-item" href="#"><i class="ri-search-2-line"></i></a>
						<span class="bl-header-pc-top-menu-item bl-mobile-menuTrggile">
							<i class="ri-menu-line"></i>
							<i class="ri-close-fill"></i>
						</span>
					</div>
				</div>
			</div>
			<div class="bl-header-web-static"></div>
		</div>
		
		<!-- 移动端菜单 加上类 static 就是详情的头 -->
		<div class="bl-header-ml ">
			<div class="bl-mobile-menu">
				<div class="bl-header-pc-bottom-menulist">
				
					@foreach ($allMenu as $key=>$val) 
					<div class="bl-header-pc-bottom-menuitem ">
						<div class="menuitem-box">
							<span class="menuitem-title">{{$val['title']}}</span>
							<i class="ri-add-line"></i>
							<i class="ri-subtract-line"></i>
						</div>
						@if(!empty($val['children']))
						<div class="menuitem-hover-chilcd">
							@foreach($val['children'] as $child)
							<a class="menuitem-hover-chilcd-item" href="{{$child['href']}}">{{$child['title']}}</a>
							@endforeach
						</div>
						@endif
					</div>
					@endforeach
				</div>
			</div>
			<div class="bl-header-web-static"></div>
		</div>
	