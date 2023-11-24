	@inject('ms', 'Echoyl\Sa\Services\WebMenuService')
	@inject('ws', 'Echoyl\Sa\Services\WebsiteService')
	@php 
		$webset = $ws->webset();
		$allMenu = $ms->getAll();
	@endphp
	
	<div class="bl-footer">

        <div class="bl-footer-body">
            <div class="bl-footer-body-left">
                <img class="bl-footer-body-left-logo" src="{{toImageUrl($webset,'logo')}}" />
                <div class="bl-footer-body-left-text">
                    <p>电话：{{$webset['tel']}}</p>
                    <p>地址：{{$webset['address']}}</p>
                </div>
            </div>
            <div class="bl-header-pc-bottom-menulist">
				@foreach ($allMenu as $key=>$val) 
                <div class="bl-header-pc-bottom-menuitem" href="/">
                    <span class="menuitem-title">{{$val['title']}}</span>
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
            <div class="bl-footer-body-right">
                <img class="bl-footer-body-right-qr" src="{{toImageUrl($webset['more']['value'],'weixin')}}" />
                <div class="bl-footer-body-right-txt">微信公众号</div>
            </div>
        </div>
        <div class="bl-footer-fb">
            {{$webset['author']}} {!! $webset['beian'] !!}
        </div>
    </div>