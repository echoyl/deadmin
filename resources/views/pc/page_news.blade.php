
@if ($paginator->hasPages())
	<div class="case-btngrou">
		<div data-aos="fade-up" data-aos-anchor-placement="bottom-bottom" class="anlv-more dhb-ani page-disable aos-init aos-animate">
			@if ($paginator->onFirstPage())
				<a href="javascript:;"><span class="iconfont icon-arrow-left"></span>上一页</a><i></i>
            @else
				<a href="{{ $paginator->previousPageUrl() }}"><span class="iconfont icon-arrow-left"></span>上一页</a><i></i>
            @endif
			
		</div> 
		
		{{-- Pagination Elements --}}
		@foreach ($elements as $element)
			{{-- "Three Dots" Separator --}}
			@if (is_string($element))
				<div data-aos="fade-up" data-aos-anchor-placement="bottom-bottom" class="anlv-more dhb-ani active aos-init aos-animate"><a href="javascript:;">{{ $element }}</a><i></i></div>
			@endif

			{{-- Array Of Links --}}
			@if (is_array($element))
				@foreach ($element as $page => $url)
					@if ($page == $paginator->currentPage())
						<div data-aos="fade-up" data-aos-anchor-placement="bottom-bottom" class="anlv-more dhb-ani active aos-init aos-animate"><a href="javascript:;">{{ $page }}</a><i></i></div>
					@else
						<div data-aos="fade-up" data-aos-anchor-placement="bottom-bottom" class="anlv-more dhb-ani aos-init aos-animate"><a href="{{ $url }}">{{ $page }}</a><i></i></div>
					@endif
				@endforeach
			@endif
		@endforeach
	
		
		<div data-aos="fade-up" data-aos-anchor-placement="bottom-bottom" class="anlv-more dhb-ani aos-init aos-animate">
			@if ($paginator->hasMorePages())
				<a href="{{ $paginator->nextPageUrl() }}">下一页<span class="iconfont icon-arrow-right"></span></a><i></i>
            @else
				<a href="javascript:;">下一页<span class="iconfont icon-arrow-right"></span></a><i></i>
            @endif
			
		</div>
	</div>
	
@endif