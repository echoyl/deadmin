@extends('layouts/defaultbgfooter')
@section('content')
		
		

		@include('components.bread')
<div class="page_warp jtyw-xqy">
		<div class="w1200">
			<div class="box">
				<style>
					articl_box p {
						float: left
					}

					.page_warp.jtyw-xqy .articl_box p {
						margin-bottom: 0px !important;
						font-size: 18px !important;
						line-height: 32px !important;
					}
				</style>
				<div class="article_box">
					<div class="article_box_title">
						<h2>{{$detail['title']}}</h2>
						<span><i>2023-07-10</i><em>新闻来源：{{$detail['author']}}</em></span>
					</div>
					<div class="articl_box" style="font-size: 18px; line-height: 32px;" deep="4">


					{!! $detail['content'] !!}


					</div>
				</div>
			</div>
		</div>
	</div>
@endsection