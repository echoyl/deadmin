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