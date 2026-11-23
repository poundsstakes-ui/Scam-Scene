// 首批30个故事均绑定本地素材包中的南京反诈中心公众号原文链接。
// 只有已审核的事实链才能进入正式关卡；本工程将互动对白与原文事实分开保存。
const source = '南京反诈中心公众号 2024-2026 素材包'
const cases = [
  ['兼职群里的提现门','兼职刷单','微信群里的一张图片让他蒙受损失','2026-10-16','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509877&idx=1&sn=7710e28eb4fcfcc89b79e43e2bc841c3'],
  ['退费群中的另一个人','退费刷单','反诈最前沿丨群里除了当事人全是骗子 起底“假退款真骗钱”诈骗套路','2026-04-30','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247508936&idx=1&sn=5129d9414777b8cd1a1c40197591979b'],
  ['内部票的另一张账单','演出票','付款容易退款难！警惕二手交易平台“内部票”诈骗套路','2026-01-04','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247508459&idx=1&sn=a99dd3bbb141b57845356ef8ca46b420'],
  ['起飞前的陌生来电','航班改签','反诈最前沿丨女子轻信“航班改签”来电 被骗43万元','2026-02-12','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247508659&idx=1&sn=ded976cbea8808ab50d3ee29eed4e848'],
  ['同事发来的补贴','冒充同事','点击“同事”发来的“高温补贴”链接后……','2026-08-06','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509490&idx=1&sn=589cc1b1437f3ed184ae57fa90ce34a2'],
  ['游戏里的交易窗口','游戏交易','游戏玩家们请注意','2026-09-30','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509697&idx=1&sn=2327b53d43fbaf1999af8ab11ad37a3c'],
  ['评论区的投资邀请','投资理财','评论区里暗藏的投资陷阱','2026-07-30','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509457&idx=1&sn=da5b2ee95d872d94a6c4480e186f848e'],
  ['特殊交友的聊天记录','交友诈骗','反诈最前沿丨小心“特殊交友”诈骗！','2026-10-19','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509889&idx=1&sn=91829693b85ad81ca8744dfb9ec62b8c'],
  ['快递包裹里的二维码','快递引流','反诈最前沿丨快递包裹夹带“扶贫二维码” 每发出一份涉诈传单 可获取5元钱','2026-10-26','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509932&idx=1&sn=539896657677d0795e109e2e2318b9c4'],
  ['高薪招聘的远方','求职','警惕境外高薪招聘陷阱','2026-10-10','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509857&idx=1&sn=25f2c98fc779aa85fdfff2141eadd267'],
  ['七万门票的诱饵','演出票','一张价值7万多元的门票','2026-09-11','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509615&idx=1&sn=0067e48ac0cb47c1e9206fad086868f3'],
  ['找兼职的朋友','兼职','转给在找兼职的朋友，这些全是坑！','2026-08-13','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509492&idx=1&sn=f063b000b5391105b1e262c78daf629c'],
  ['假客服的企业账号','冒充客服','抖音客服不会让您添加“企业账号” ！这个最新的诈骗套路请转发！','2026-05-06','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247508940&idx=1&sn=f656162b1de7e50395ef12f390d4832c'],
  ['仿冒安全中心来电','冒充客服','警惕仿冒微信安全中心客服的诈骗电话','2026-05-25','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247509052&idx=1&sn=ce088ca654fdcfd428c6dd3c48ab4f8c'],
  ['房客的投资建议','租房投资','租房是假，骗钱是真！ 警惕新型“杀猪盘”骗局','2024-01-27','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247502357&idx=1&sn=d4b15e5eae9e0ba906ee84957b27935c'],
  ['直播培训的退款承诺','直播培训','抖音涨粉带货能赚钱？南京多位老人被骗！','2024-01-26','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247502336&idx=1&sn=cc3b4b902f525bf33fd4c618c8837ef0'],
  ['投资群的最后一课','投资理财','反诈最前沿丨执意投资50万 昔日被害人现身劝阻点醒梦中人','2026-04-07','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247508890&idx=1&sn=cf73f553b8ef81510f25805721356547'],
  ['学生群的陌生老师','校园','骗子混进学生群 冒充老师骗多人','2025-12-05','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247508342&idx=1&sn=742b527efb5db0e3497d5aaead1c7d96'],
  ['快递取件码的谜团','快递诈骗','莫名收到“快递取件码”？别信！','2025-05-09','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247507347&idx=1&sn=f79ef478ba0aa4ca0e545b469c809da3'],
  ['闲置交易的陷阱','二手交易','二手交易平台“陷阱”大揭秘！卖闲置化妆品竟被骗！','2025-05-06','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247507327&idx=1&sn=847b356a978ed253095db873f12e312a'],
  ['兼职电话的选择','学生兼职','学生兼职接打电话，你做吗？','2025-04-23','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247507277&idx=1&sn=2dbd0e266840c5184f20b6786e533028'],
  ['扫码领补贴','补贴诈骗','扫码领“财政补贴”“薪资补贴”？这是诈骗！扩散周知→','2025-04-17','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247507264&idx=1&sn=4570e2e4c336d73001a8d9fb462be72b'],
  ['屏幕共享的邀约','冒充客服','“抖音客服”来电邀请您开启屏幕共享~当心诈骗！','2025-04-10','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247507225&idx=1&sn=ec34ec57c6cb6021b73f9ed70bc14fbf'],
  ['熟人拉群领补贴','冒充熟人','同事账号拉你入群领取补贴，当心有诈！','2025-03-31','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247507172&idx=1&sn=1d179f3244ef0a9d9e7926daaa88a938'],
  ['百万保障的倒计时','冒充客服','防诈关键词丨“百万保障”不关就扣钱？有人险些被骗300万','2025-07-18','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247507862&idx=1&sn=25a118e5410b16171350a5a03349b7a4'],
  ['相亲对象的投资账号','交友投资','相亲对象让你帮忙操作投资账号 看他赚钱要加入吗？是诈骗！','2025-07-01','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247507784&idx=1&sn=dc6338da47eccf87931e692be77e4d7a'],
  ['回拨快递电话','快递诈骗','回拨快递电话陷骗局？“双11”临近 警惕诈骗新套路','2025-11-07','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247508133&idx=1&sn=be91de07a91cc233e28303b925686f53'],
  ['演出门票的高价','演出票','买张演出门票，竟被骗40余万元','2025-09-18','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247508026&idx=1&sn=a5de9eb85c8fc21b6f075b9c6d5dd81f'],
  ['退费群的国库券','培训退费','买“国库券”可退培训费？小心诈骗！','2024-02-01','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247502441&idx=2&sn=776c0b2c3918e9630f444b2153c48e1e'],
  ['导师的稳赚建议','投资理财','跟“导师”炒股稳赚不赔？老人取现50万元牵出投资诈骗案','2025-06-30','https://mp.weixin.qq.com/s?__biz=Mzk0MjI4NTU5OA%3D%3D&mid=2247507783&idx=1&sn=3d6187165918ca23ede4bbd6b879b2d4']
].map((item, index) => ({
  id: index + 1, name: item[0], scene: item[1], sourceTitle: item[2], sourceDate: item[3], sourceUrl: item[4], source,
  status: index < 10 ? '独立关卡已编排' : '样例关卡待事实审校',
  summary: index === 0 ? '兼职图片、扫码入群、任务支出与提现受阻，哪一步最该按下暂停？' : index < 10 ? '每个故事均有独立事实链、线索、分支与虚拟损失复盘。' : '已完成可玩样例；事实细节待逐条回填审核。'
}))

module.exports = { cases }
