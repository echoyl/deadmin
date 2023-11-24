
@if ($paginator->hasPages())
	<div class="pages  wow animate__animated animate__fadeInUp">
            {{-- Previous Page Link --}}
            @if ($paginator->onFirstPage())
				<li style="display:none"><a href="javascript:;">&#xeb7f;</a></li>
            @else
				<li><a href="{{ $paginator->previousPageUrl() }}" title="上一页">上一页</a></li>
            @endif

            {{-- Pagination Elements --}}
            @foreach ($elements as $element)
                {{-- "Three Dots" Separator --}}
                @if (is_string($element))
					<li><a href="javascript:;" class="page_on">{{ $element }}</a></li>
                @endif

                {{-- Array Of Links --}}
                @if (is_array($element))
                    @foreach ($element as $page => $url)
                        @if ($page == $paginator->currentPage())
							<li><a href="javascript:;"  class="page_on">{{ $page }}</a></li>
                        @else
							<li><a href="{{ $url }}">{{ $page }}</a></li>
                        @endif
                    @endforeach
                @endif
            @endforeach

            {{-- Next Page Link --}}
            @if ($paginator->hasMorePages())
				<li><a title='下一页' href="{{ $paginator->nextPageUrl() }}">下一页</a></li>
            @else
				<li style="display:none"><a href="javascript:;">下一页</a></li>
            @endif
	</div>
	
@endif