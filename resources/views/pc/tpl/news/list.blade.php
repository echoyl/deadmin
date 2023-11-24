@extends('layouts/defaultbgfooter')
@section('content')
		
		

		@include('components.bread')
	<div class="page_warp jtjx jtyw">
		<div class="w1200">
			<div class="box" av-animation="fadeInUp">
				<div class="jtjx_left">

				</div>
				<div class="jtjx_right load_more">
					<ul id="list_con">
					@foreach ($list as $val)
						<li style="display: list-item;">
							<div class="av-container av-visible"><a class="aniview fast animated fadeInUp"
									av-animation="fadeInUp" href="{{$val['href']}}" style="opacity: 1;">
									<span class="liT">
										<b>{{$val['title']}}</b>
										<i>　
											{{$val['desc']}}
										</i>
									</span>
									<em class="txt-c liB" style="display: block;height:auto;"><img src="{{$val['titlepic']['url']}}"></em>
									<span class="circle">
										<em class="top">{{date("m/d",strtotime($val['created_at']))}}</em>
										<em>{{date("Y",strtotime($val['created_at']))}}</em>
									</span>
								</a></div>
						</li>
					@endforeach
					</ul>
					<!-- 加载更多 -->
					<!-- <div class="jtjx_move">
						<i>下拉查看更多新闻</i>
						<a href="#">﹀</a>
					</div> -->
				</div>
				<!-- 加载更多 -->
				@include('components.loadmore',['loadmore_con_id'=>'list_con','loadmore_list'=>$list])
			</div>
		</div>

	</div>
	<script type="text/javascript" src="{{$pstatic}}/js/jquery.aniview.js"></script>
	<script>
		var options = {
			animateThreshold: 100,
			scrollPollInterval: 50
		}
		$('.aniview').AniView(options);
	</script>
@endsection