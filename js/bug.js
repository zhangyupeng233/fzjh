var tiaozhan = [
    "950",
    "450",
    "1000",
    "800",
    "850",
];

var fb = [
    "02", "04","07", "14","15", "20", "22","25", "26", "27", "200"
];

var users = [
    //自用
    '81317', '36648',
    //小白
    '4279', '72460',
    //范时进
    '79237','77629',
    //不弱
    '79159',
    //谷虚子
    '4243','4280',
    //斧头
    '72457'
];

var merchantList, items ,interval;;

var getApiBase = function(){
    return $("#userArea").val().split(';')[1]
};

var getHttpBase = function(){
    return $("#userArea").val().split(';')[2]
};

var checkUser = function(){
    var id = $("#userId").val();
    console.log(users.indexOf(id));
    if(users.indexOf(id)>=0){
        return true
    }else{
        return false
    }
};


var getItemJson = function(type){
    $.ajax({
        type: "GET",
        url: "https://cdn.mkjump.com/fzjh/0.118/res/Json/item.json",
        success: function(result) {
            items = result;
            getItemStoreJson()
        }
    });
};

var getItemStoreJson = function(type){
    $.ajax({
        type: "GET",
        url: "https://cdn.mkjump.com/fzjh/0.120/res/Json/itemEquip.json",
        success: function(result) {
            $.extend(items, result)
        }
    });
};
getItemJson();




var  setHeader = function (request) {
    request.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
    request.setRequestHeader('userid', $("#userId").val());
    request.setRequestHeader('channel', $("#userArea").val().split(';')[0]);
    request.setRequestHeader('session', $("#userSession").val());
    request.setRequestHeader('Accept', '*/*');
    request.setRequestHeader('Accept-Language', 'zh-CN,zh;q=0.9');
};

//统一调用的post请求
var httpPost = function(cmd, data, callBack){
    if(!checkUser()){
        return
    };
    $.ajax({
        type: "POST",
        url: "https://"+ getHttpBase() +".mkjump.com/" + getApiBase() +"/api/h5/" + cmd,
        data: JSON.stringify(data),
        beforeSend: function(request) {
            setHeader(request);
        },
        success: function(result) {
            $("#result").text(result);
            callBack(result);
        }
    });
};


var getEncryptedData = function(rltId, fbId){

    var fb_id, rlt_id;
    if (fbId){
        fb_id = fbId;
    }else{
        fb_id = $("#fbId").val();
    }

    if (rltId){
        rlt_id = rltId;
    }else{
        rlt_id = $("#rltId").val();
    }

    var data = {
        rlt_id: rlt_id,
        userid: $("#userId").val(),
        fb_id: fb_id,
        session: $("#userSession").val(),
        channel: $("#userArea").val().split(';')[0],
        time: Date.parse(new Date())
    };
    // 进行RSA加密
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey('MFswDQYJKoZIhvcNAQEBBQADSgAwRwJAa4OR+lsJwHqLL/1yODqxNSjLVrkkjsTG\n' +
      'ktnGIPxtunGHtPz8GYcKen/khFNNiBoN2mFHjvcCT8Oi72OREfsBKQIDAQAB');

    // 超长加密
    var encrypted = encrypt.encryptLong(JSON.stringify(data));
    var result = {"data":encrypted};
    return result
};


var checkRlt = function(rltId, fbId){

    var data = getEncryptedData(rltId, fbId);
    var timesRun = 0;

    clearTimer();
    interval = setInterval(function(){
        timesRun += 1;
        $("#runTimes").text(timesRun + "/" + $("#checkNum").val());
        if(timesRun == $("#checkNum").val()){
            window.clearTimeout(interval);
            $("#result").text("执行完毕");
        }
        httpPost("check_rlt", data, function(){})
    }, 200);

    };

var clearTimer = function(){
    window.clearTimeout(interval);
    console.log('clear')
};

var tzCelue = function(){

    for(var i=0; i<tiaozhan.length; i++){
        for(var j=0; j<fb.length; j++){
            var data = getEncryptedData("rlt_tiaozhancelue"+tiaozhan[i], 'fb'+fb[j]);
            httpPost("check_rlt", data, function(result){
                var ret = JSON.parse(result);
                if (ret.data && ret.data.length>0){
                    console.log(ret.data)
                }
            })
        }
    };
};

//南阳任务
var startMission = function(){
    var data = {"type":3};
    httpPost("finish_mission", data, function(){

    })
};

//看广告
var getYB = function(){
    var data = {"ad":1};
    httpPost("share_reward", data, function(){

    })
};

//学习技能
var learnSkill = function(){
    var data = {"level": 10,"skill_id": $("#skillId").val()};
    httpPost("learn_skill", data, function(){

    })

};

//拜师
var changeTeacher = function(){
    var data = {"teacher_id": $("#teacherId").val()};
    httpPost("baishi", data, function(){

    })

};

//拾取物品
var getItem = function(){
    var data = {"itemId": $("#itemId").val(), "count": 10};
    httpPost("get_item", data, function(){

    })

};


//查看黑商
var getMerchant = function(){
    var data = {"merchantId" : "BM", "type" : 1};
    httpPost("get_merchant_list", data, function(result){
        merchantList = JSON.parse(result).data.list;
        for(var i=0; i<merchantList.length;i++){
            merchantList[i]["name"] = items[merchantList[i].itemId].name;
            delete merchantList[i].type;
            delete merchantList[i].count;

        }
        $("#result").text(JSON.stringify(merchantList));
    });

};

//购买黑商
var buyMerchant = function(){

    var data = {
        "itemId" : $("#merchantItemId").val(),
        "loc" : 1,
        "type" : 1,
        "merchantId" : "BM"
    };
    httpPost("buy_merchant_item", data, function(result){

    });

};

//使用背包道具
var useItem = function(){
    var data = {
        "id" : $("#merchantItemId").val()
    };
    httpPost("use_item", data, function(result){

    });
};
