$(function(){
   $('.lists').show();
    setListStyle(); //设置列表动画
});

Vue.use(Vue.lazyimg,{
    fadein: true,
    speed: 40
});

/** 格式化持续时间,秒时间戳--> 01:10:20 **/
Vue.filter('formatDuration', function (value) {
    var seconds = parseInt(value);
    var h = parseInt(seconds / 3600);
    var min = parseInt((seconds - h * 3600) / 60);
    var s = parseInt(seconds - h * 3600 - min * 60);
    var string = '';
    h.toString().length == 1 ? string += '0' : '';
    string += h.toString();
    string += ':';
    min.toString().length == 1 ? string += '0' : '';
    string += min.toString();
    string += ':';
    s.toString().length == 1 ? string += '0' : '';
    string += s.toString();
    return string;
});

/** 速度(m/s)-->配速(时间/km) **/
Vue.filter('speedToPace', function (value) {
    if (isNaN(parseInt(value)) || value == 0) {
        return "-";
    }
    var time = 1 / (parseFloat(value) / 1000);
    var min = parseInt(time / 60);
    var s = parseInt(time - min * 60);
    var str = '';
    min.toString().length == 1 ? str += '0' : '';
    str += min;
    str += "'";
    s.toString().length == 1 ? str += '0' : '';
    str += s;
    str += "''";
    return str;
});

/** 截取字符, 一个汉字等于两个字符, ("我是oulafen", 6)=>"我是ou" **/
Vue.filter('subString', function (s, n) {
    return s.replace(/([^x00-xff])/g, "$1a").slice(0, n).replace(/([^x00-xff])a/g, "$1");
});

/** 重置自己的排名, <101=>不变, 5000=>5k+, 10000=>1w+ **/
Vue.filter('resetSelfPlace', function (value) {
    if(value <= 100){
        return value;
    }
    if( 100 < value < 9999 ){
        return '5k+';
    }
    if( value >=10000){
        return '1w+';
    }
});

var list_vue = new Vue({
    el: '.ranking-list-content',
    data: {
        popShow: false,
        lists: [
            //{avatar: "/images/avatar/avatar.png", name: "欧阳", sex: 1, time: "00:27:41" },
            //{avatar: "/images/avatar/avatar1.png", name: "搭搭撒撒", sex: 0, time: "00:26:35" },
            //{avatar: "/images/avatar/avatar2.png", name: "红舞鞋", sex: 0, time: "00:29:59" }
        ],
        user: false,
        listStyle: []
    },
    methods: {
        showRulePop : function(){
            this.popShow = true;
        },
        hideRulePop : function(){
            this.popShow = false;
        }
    }
});

function setListStyle(){

    // Trigger fade in as window scrolls
    $(document).on('scroll load', function(){
        scrollListStyle();
    });
    //console.log('in loaded')
    //var myScroll = new IScroll('#wrapper', { probeType: 3 , mouseWheel: true });
    //myScroll.on('scroll', scrollListStyle);
    //myScroll.on('scrollEnd', scrollListStyle);
}

function scrollListStyle(){
    //console.log('in scrollListStyle')
    $('ul > *').each( function(i){
        var bottom_of_object = $(this).offset().top + $(this).height() * 0.25;
        var bottom_of_window = $(window).scrollTop() + $(window).height();
        if( bottom_of_window > bottom_of_object ){
            list_vue.listStyle.$set(i, 'li-restore');
        } else {
            list_vue.listStyle.$set(i, 'li-moving');
        }
    });
}

var loadMore = {
    counter : 0,
    num : 20,   // 每页展示4个
    pageStart : 0,
    pageEnd : 0,
    moreNum: 100,
    init: function () {

        $('.ranking-list-content').dropload({
            scrollArea: window,
            domDown: {
                domClass: 'dropload-down',
                domRefresh: '<div class="load-refresh">加载更多</div>',
                domLoad: '<div class="load-load"><span class="loading"></span>加载中</div>',
                domNoData: '<div class="load-noData">没有更多数据了</div>'
            },
            loadDownFn: function (me) {
                var self = this;
                if(list_vue.lists.length >= self.moreNum ){
                    me.lock();
                    me.noData();
                    me.resetload();
                    return;
                }
                $.ajax({
                    type: 'GET',
                    url: 'ranking-3k.json',
                    data:{},
                    dataType: 'json',
                    success: function (data) {
                        if(data.error_code == 0){
                            if(typeof data.data.user === "object"){
                                list_vue.user = data.data.user;
                            }
                            //模拟加载时间
                            setTimeout(function(){
                                loadMore.ajaxSuccess(me, data.data.list);
                            }, 800);
                        }
                    },
                    error: function (xhr, type) {
                        console.log('Ajax error!');
                        // 即使加载出错，也得重置
                        me.resetload();
                    }
                });
            },
            threshold: 50
        });
    },

    ajaxSuccess: function(me,lists){
        var self = this;
        self.counter++;
        self.pageEnd = self.num * self.counter;
        self.pageStart = self.pageEnd - self.num;
        for(var i = self.pageStart; i < self.pageEnd; i++){
            if(lists[i]){
                list_vue.lists.push(lists[i]);
            }else {
                me.lock();
                me.noData();
                me.resetload();
                return;
            }
        }
        // 每次数据加载完，必须重置
        me.resetload();
    }
};