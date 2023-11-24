<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="renderer" content="webkit" />
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
		@inject('ms', 'Echoyl\Sa\Services\WebMenuService')
		@php $seo = $ms->seo($detail??false); @endphp
		<title>{{$seo['seotitle']}}</title>
		<meta name="keywords" content="{{$seo['seokeywords']}}" />
		<meta name="description" content="{{$seo['seodescription']}}" />
		
		<link rel="stylesheet" type="text/css" href="{{$pstatic}}/css/public.css" />
		
		<script type="text/javascript" src="{{$pstatic}}/js/jquery.min.js" charset="utf-8"></script>
	
		<!--<script src="{{$pstatic}}/js/echarts.min.js"></script>-->

		
		<script>
			var _hmt = _hmt || [];
			(function() {
			  {!! $webset['baidu_js']??'' !!}
			})();
		</script>

	</head>
	<body>

		@include('components.topmenu',['static'=>false])

@yield('content')

@include('components.footer')
</body>
</html>