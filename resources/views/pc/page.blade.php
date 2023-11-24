
@if ($paginator->hasPages())
	<div class="uni-flex uni-row uni-justifyC">
		@if ($paginator->onFirstPage())
			
		@else
			<a target="_self" href="{{ $paginator->previousPageUrl() }}" title="上一页"><div class="pagesList uni-justifyC"> < </div></a>
		@endif
		
		@foreach ($elements as $element)
			{{-- "Three Dots" Separator --}}
			@if (is_string($element))
				<div class="pagesList uni-justifyC active">{{ $element }}</div>
			@endif

			{{-- Array Of Links --}}
			@if (is_array($element))
				@foreach ($element as $page => $url)
					@if ($page == $paginator->currentPage())
						<div class="pagesList uni-justifyC active">{{ $page }}</div>
					@else
						<a target="_self" href="{{ $url }}"><div class="pagesList uni-justifyC">{{ $page }}</div></a>
					@endif
				@endforeach
			@endif
		@endforeach
		
		@if ($paginator->hasMorePages())
			<a title='下一页' target="_self" href="{{ $paginator->nextPageUrl() }}"><div class="pagesList uni-justifyC"> > </div></a>
		@else
			
		@endif
	</div>
@endif