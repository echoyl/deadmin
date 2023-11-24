			@if(!empty($loadmore_list))	
				<!--
				<div class="loadMore" id="loadmore" style="display: flex;justify-content: center;align-items: center;z-index: 10;position: relative;padding: 2rem 0 ;">
					<a  target="_blank" id="loadmore_text">
						<div id="loading_con" style="display:none;"><img  width="40px" height="40px" src="{{$pstatic}}/images/loading.png" /></div>
						<span>加载更多</span>
					</a>
				</div>
				-->
				<div class="jtjx_move" id="loadmore">
					<i id="loadmore_text">点击查看更多</i>
					<a href="javascript:;" class="btn_bottom">﹀</a>
				</div>
	<script>
			$(()=>{
				var page = 1;
				var is_loading = false;
				var has_more = true;
				$("#loadmore").click(()=>{
					if(is_loading || !has_more)return;
					is_loading = true;
					$("#loading_con").show();
					$("#loadmore").addClass('hover');
					page++;
					$.ajax({
						type: 'get',
						url: location.href,
						dateType:'json',
						data:{page},
						success: function (data) {
							$("#loading_con").hide();
							$("#loadmore").removeClass('hover');
							is_loading = false;
							if(!data.list.length)
							{
								has_more = false;
								$("#loadmore_text").html('已全部加载完毕');
							}
							if(!data.code)
							{
								$("#{{$loadmore_con_id}}").append(data.html);
							}
						}
					});
				})
			});
		</script>
		@endif