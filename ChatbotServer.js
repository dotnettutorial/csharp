const {
    WebSocket,
    WebSocketServer
} = require('ws')
const express = require('express');
const cors = require('cors');
const sql = require("mssql");
var _ = require("underscore");
const {
    RtcTokenBuilder,
    RtcRole,
    RtmTokenBuilder,
    RtmRole
} = require('agora-access-token');

const APP_ID = 'a7a69524c08f4c9aa925b7d5de4a127b';
const APP_CERTIFICATE = '97b57b57986746d1bdcaf213494f349d';
const {
    v4: uuidv4,
} = require('uuid');
const PORT = process.env.PORT || 8081;
//const dbconfig = "Server=192.168.1.209,8512;Database=SheetalERP;User Id=sa;Password=Dsubn#@!123;Encrypt=false";
const dbconfig = "Server=10.0.11.154;Database=SheetalERP;User Id=sa;Password=iO^MM2QleR^y5GPz@a5fG4DJ;Encrypt=false";


async function checkConnection() {
    try {
        let pool = await sql.connect(dbconfig);
        console.log("sql server connected...");
    } catch (error) {
        console.log(" mathus-error :" + error);
    }
}
checkConnection();

async function getUnReadCount(to) {
    try {
        let pool = await sql.connect(dbconfig);
        let res = await pool.query("exec UnReadCount_Chat @ToUser='" + to + "'");
        return res.recordset[0]["ChatCount"];
    } catch (error) {
        console.log("getUnReadCount : mathus-error :" + error);
    }
}

async function Save_Chat(from, to, message) {
    try {
        let pool = await sql.connect(dbconfig);
        await pool.query("exec Save_Chat @FromUser='" + from + "',@ToUser='" + to + "',@Message=N'" + message + "'");
    } catch (error) {
        console.log("Save_Chat : mathus-error :" + error);
    }
}


async function Read_Chat(from, to) {
    try {
        let pool = await sql.connect(dbconfig);
        await pool.query("exec Read_Chat @FromUser='" + from + "',@ToUser='" + to + "'");
    } catch (error) {
        console.log("Read_Chat : mathus-error :" + error);
    }
}


async function Call_StartEnd(from, to, Status, channel, appid) {
    console.log("call-> " + from + "->" + to + "->" + Status);
    try {
        let pool = await sql.connect(dbconfig);
        await pool.query("exec Call_StartEnd @FromUser='" + from + "',@ToUser='" + to + "',@Status='" + Status + "',@Channel='" + channel + "',@AppId='" + appid + "'");
    } catch (error) {
        console.log("Call_StartEnd : mathus-error :" + error);
    }
}



//ws = new WebSocket("wss://chatbot.sheetalgroup.com");

//#region VideoCalling


const generateRTCToken = (req, resp) => {
    // get channel name

    const channelName = req.params.channel;
    if (!channelName) {
        return {
            'error': 'channel is required'
        };
    }
    // get uid
    let uid = req.params.uid;
    if (!uid || uid === '') {
        return {
            'error': 'uid is required'
        };
    }
    // get role
    let role;
    if (req.params.role === 'publisher') {
        role = RtcRole.PUBLISHER;
    } else if (req.params.role === 'audience') {
        role = RtcRole.SUBSCRIBER
    } else {
        return {
            'error': 'role is incorrect'
        };
    }
    // get the expire time
    let expireTime = req.query.expiry;
    if (!expireTime || expireTime === '') {
        expireTime = (60 * 60 * 24);
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    let token;
    if (req.params.tokentype === 'userAccount') {
        token = RtcTokenBuilder.buildTokenWithAccount(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    } else if (req.params.tokentype === 'uid') {
        token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    } else {
        return {
            'error': 'token type is invalid'
        };
    }
    // return the token
    return {
        'rtcToken': token
    };
}

const generateRTMToken = (req, resp) => {
    // set response header

    // get uid
    let uid = req.params.uid;
    if (!uid || uid === '') {
        return {
            'error': 'uid is required'
        };
    }
    // get role
    let role = RtmRole.Rtm_User;
    // get the expire time
    let expireTime = req.query.expiry;
    if (!expireTime || expireTime === '') {
        expireTime = 3600;
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    console.log(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime)
    const token = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
    // return the token
    return {
        'rtmToken': token
    };
}

const generateRTEToken = (req, resp) => {
    // set response header

    // get channel name
    const channelName = req.params.channel;
    if (!channelName) {
        return resp.status(400).json({
            'error': 'channel is required'
        });
    }
    // get uid
    let uid = req.params.uid;
    if (!uid || uid === '') {
        return {
            'error': 'uid is required'
        };
    }
    // get role
    let role;
    if (req.params.role === 'publisher') {
        role = RtcRole.PUBLISHER;
    } else if (req.params.role === 'audience') {
        role = RtcRole.SUBSCRIBER
    } else {
        return {
            'error': 'role is incorrect'
        };
    }
    // get the expire time
    let expireTime = req.query.expiry;
    if (!expireTime || expireTime === '') {
        expireTime = 3600;
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    const rtmToken = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
    // return the token
    return {
        'rtcToken': rtcToken,
        'rtmToken': rtmToken
    };
}

// app.options('*', cors());
// app.get('/ping', nocache, ping)
// app.get('/rtc/:channel/:role/:tokentype/:uid', nocache, generateRTCToken);
// app.get('/rtm/:uid/', nocache, generateRTMToken);
// app.get('/rte/:channel/:role/:tokentype/:uid', nocache, generateRTEToken);

//#endregion Video calling

// app.listen(PORT, () => {
//     console.log(`Listening on port: ${PORT}`);
// });

var _Users = [];
var _UserCalls = [];


const wss = new WebSocketServer({
    port: PORT
});
console.log(`Listening on port: ${PORT}`);
wss.on("connection", async function connection(ws) {
    ws.on("message", async function message(message) {
        const data = JSON.parse(message);
        try {
            switch (data.type) {
                case 'RTCtoken':
                    var _token = generateRTCToken({
                        params: data.params,
                        query: data.query
                    });
                    ws.send(JSON.stringify({
                        type: "rtctoken",
                        data: {
                            token: _token,
                            appid: APP_ID
                        }
                    }));
                    break;
                case 'CloseAll':
                    _Users = [];
                    _UserCalls = [];
                    break;
                case 'ConnectedList':
                    ws.send(JSON.stringify({
                        type: "ConnectedList",
                        data: {
                            Users: _Users,
                            UserCalls: _UserCalls
                        }
                    }));
                    break;
                case 'ping':
                    ws.send(JSON.stringify({
                        type: "pong",
                        data: {
                            message: "connected.."
                        }
                    }));
                    break;
                case 'Join':
                    _Users.push({
                        Username: data.params.username,
                        Name: data.params.name,
                        ConnectionId: ws,
                        Sellername: data.params.seller,
                        IsSeller: false,
                    });
                    ws.send(JSON.stringify({
                        type: "pong",
                        data: {
                            message: "User joined.."
                        }
                    }));
                    _.each(_.where(_Users, {
                        Username: data.params.seller,
                        IsSeller: true
                    }), function(item) {
                        var _UpdateUserList = [];
                        _.each(_.where(_Users, {
                            Sellername: item.Username
                        }), function(item1) {
                            if (_.filter(_UpdateUserList, function(item2) {
                                    return item2.Username == item1.Username && item2.Name == item1.Name
                                }).length == 0) {
                                _UpdateUserList.push({
                                    "Username": item1.Username,
                                    "Name": item1.Name
                                })
                            }
                        })
                        item.ConnectionId.send(JSON.stringify({
                            type: "UpdateUserList",
                            data: {
                                data: _UpdateUserList
                            }
                        }))
                    });
                    break;
                case 'JoinSeller':
                    _Users.push({
                        Username: data.params.username,
                        Name: data.params.name,
                        ConnectionId: ws,
                        Sellername: "",
                        IsSeller: true,
                    });
                    ws.send(JSON.stringify({
                        type: "pong",
                        data: {
                            message: "Seller joined.."
                        }
                    }));
                    _.each(_.where(_Users, {
                        Sellername: data.params.username
                    }), function(item) {
                        if (item.ConnectionId != null) {
                            item.ConnectionId.send(JSON.stringify({
                                type: "UserAvailability",
                                data: {
                                    message: "online"
                                }
                            }))
                        }
                    });
                    break;
                case "Send":
                    if (data.params.to != "" && data.params.message != "") {
                        var _FromUser = _.where(_Users, {
                            ConnectionId: ws
                        });
                        var _from = _FromUser[0].Username;
                        await Save_Chat(_from, data.params.to, data.params.message);
                        _.each(_.where(_Users, {
                            Username: data.params.to
                        }), function(item) {
                            if (item.ConnectionId != null) {
                                item.ConnectionId.send(JSON.stringify({
                                    type: "ReceiveMessage",
                                    data: {
                                        message: data.params.message,
                                        from: _from
                                    }
                                }))
                            }
                        });
                        _.each(_.where(_Users, {
                            Username: _from
                        }), function(item) {
                            if (item.ConnectionId != null && item.ConnectionId != ws) {
                                item.ConnectionId.send(JSON.stringify({
                                    type: "SendMessageFrom",
                                    data: {
                                        message: data.params.message,
                                        to: data.params.to
                                    }
                                }))
                            }
                        });
                    }
                    break;
                case "SendFile":
                    if (data.params.from != "" && data.params.to != "") {
                        _.each(_.where(_Users, {
                            Username: data.params.to
                        }), function(item) {
                            if (item.ConnectionId != null) {
                                item.ConnectionId.send(JSON.stringify({
                                    type: "SendFile",
                                    data: {
                                        from: data.params.from,
                                        type: 'peer',
                                        data: data.params.data
                                    }
                                }))
                            }
                        });
                        _.each(_.where(_Users, {
                            Username: data.params.from
                        }), function(item) {
                            if (item.ConnectionId != null && item.ConnectionId != ws) {
                                item.ConnectionId.send(JSON.stringify({
                                    type: "SendFile",
                                    data: {
                                        to: data.params.to,
                                        type: 'self',
                                        data: data.params.data
                                    }
                                }))
                            }
                        });
                    }
                    break;
                case "ReadMessage":
                    if (data.params.from != "" && data.params.to != "") {
                        await Read_Chat(data.params.from, data.params.to)
                        _.each(_.where(_Users, {
                            Username: data.params.to
                        }), function(item) {
                            if (item.ConnectionId != null) {
                                item.ConnectionId.send(JSON.stringify({
                                    type: "UpdateReceiveMessageCount",
                                    data: {
                                        from: data.params.from
                                    }
                                }))
                            }
                        })
                        _.each(_.where(_Users, {
                            Username: data.params.from
                        }), function(item) {
                            if (item.ConnectionId != null) {
                                item.ConnectionId.send(JSON.stringify({
                                    type: "UpdateMessageRead",
                                    data: {
                                        to: data.params.to
                                    }
                                }))
                            }
                        })
                    }
                    break;
                case "UnReadCount":
                    var _count = await getUnReadCount(data.params.to);
                    ws.send(JSON.stringify({
                        type: "UnReadCount",
                        data: {
                            count: _count
                        }
                    }))
                    break;
                case "CheckUser":
                    if (_.where(_Users, {
                            Username: data.params.to
                        }).length > 0) {
                        ws.send(JSON.stringify({
                            type: "UserAvailability",
                            data: {
                                message: "online"
                            }
                        }));				
						
                    } else {
                        ws.send(JSON.stringify({
                            type: "UserAvailability",
                            data: {
                                message: "offline"
                            }
                        }))
                    }
                    break;
                case "UpdateUserList":
                    _.each(_.where(_Users, {
                        ConnectionId: ws
                    }), function(item) {
                        var _UpdateUserList = [];
                        _.each(_.where(_Users, {
                            Sellername: item.Username
                        }), function(item1) {						
                            if (_.filter(_UpdateUserList, function(item2) {
                                    return item2.Username == item1.Username && item2.Name == item1.Name
                                }).length == 0) {
                                _UpdateUserList.push({
                                    "Username": item1.Username,
                                    "Name": item1.Name
                                })
                            }
                        })
                        if (item.ConnectionId != null) {
                            item.ConnectionId.send(JSON.stringify({
                                type: "UpdateUserList",
                                data: {
                                    data: _UpdateUserList
                                }
                            }))
                        }
                    });
                    break;
                case "CheckInCall":
                    if (data.params.from != "" && data.params.to != "" && data.params.toname != "") {
                        var NotInCall = true;
                        _.each(_UserCalls, function(item) {
                            if (item.Caller.uid == data.params.from || item.Callee.uid == data.params.from) {
                                ws.send(JSON.stringify({
                                    type: "AlreadyInCall",
                                    data: {}
                                }));
                                NotInCall = false;
                                return;
                            }
                            if (item.Caller.uid == data.params.to || item.Callee.uid == data.params.to) {
                                ws.send(JSON.stringify({
                                    type: "UserInCall",
                                    data: {}
                                }));
                                Call_StartEnd(data.params.from, data.params.to, 'Missed Call', uuidv4(), APP_ID);
                                NotInCall = false;
                                return;
                            }
                        })
                        if (NotInCall) {
                            ws.send(JSON.stringify({
                                type: "CallUser",
                                data: {
                                    data: data.params
                                }
                            }));
                        }
                    }
                    break;
                case "CallUser":
                    if (data.params.from != "" && data.params.to != "" && data.params.toname != "") {
                        var NotInCall = true;
                        _.each(_UserCalls, function(item) {
                            if (item.Caller.uid == data.params.from || item.Callee.uid == data.params.from) {
                                ws.send(JSON.stringify({
                                    type: "AlreadyInCall",
                                    data: {}
                                }));
                                NotInCall = false;
                                return;
                            }
                            if (item.Caller.uid == data.params.to || item.Callee.uid == data.params.to) {
                                ws.send(JSON.stringify({
                                    type: "UserInCall",
                                    data: {}
                                }));
                                Call_StartEnd(data.params.from, data.params.to, 'Missed Call', uuidv4(), APP_ID);
                                NotInCall = false;
                                return;
                            }
                        })

                        if (NotInCall) {
                            var _channel = uuidv4();
                            if (data.params.channel != undefined) {
                                _channel = data.params.channel;
                            }
                            var _fromtoken = generateRTCToken({
                                params: {
                                    channel: _channel,
                                    role: "publisher",
                                    tokentype: "uid",
                                    uid: data.params.from,

                                },
                                query: {
                                    expiry: ''
                                }
                            });

                            var _totoken = generateRTCToken({
                                params: {
                                    channel: _channel,
                                    role: "audience",
                                    tokentype: "uid",
                                    uid: data.params.to,

                                },
                                query: {
                                    expiry: ''
                                }
                            });


                            var _Caller = {
                                appid: APP_ID,
                                token: _fromtoken,
                                uid: data.params.from,
                                channel: _channel,
                                tokentype: "uid",
                                IsVideo: data.params.IsVideo,
                                ConnectionId: ws,
                                name: data.params.fromname
                            }


                            var _Callee = {
                                appid: APP_ID,
                                token: _totoken,
                                uid: data.params.to,
                                channel: _channel,
                                tokentype: "uid",
                                IsVideo: data.params.IsVideo,
                                ConnectionId: null,
                                name: data.params.toname
                            }
                            _UserCalls.push({
                                Caller: _Caller,
                                Callee: _Callee
                            })
                            ws.send(JSON.stringify({
                                type: "CallUser",
                                data: {
                                    to: data.params.to,
                                    toname: data.params.toname
                                }
                            }))
                            _.each(_Users, function(item) {
                                if (item.ConnectionId != null && item.Username == data.params.to) {
                                    item.ConnectionId.send(JSON.stringify({
                                        type: "IncommingCall",
                                        data: {
                                            from: data.params.from,
                                            fromname: data.params.fromname
                                        }
                                    }))
                                }
                            });

                            Call_StartEnd(_Caller.uid, _Callee.uid, 'Start', _Caller.channel, _Caller.appid);
                        }
                    }
                    break;
                case 'RejectCall':
                    var objeIndex = -1;
                    _.each(_UserCalls, function(item, index) {
                        if (item.Caller.uid == data.params.from) {
                            if (item.Caller.ConnectionId != null) {
                                item.Caller.ConnectionId.send(JSON.stringify({
                                    type: "callrejected",
                                    data: {}
                                }));
                            }
                            if (item.Callee.ConnectionId != null) {
                                item.Callee.ConnectionId.send(JSON.stringify({
                                    type: "RejectCall",
                                    data: {}
                                }));
                            }
                            objeIndex = index;
                            return;
                        }
                        if (item.Callee.uid == data.params.from) {
                            if (item.Callee.ConnectionId != null) {
                                item.Callee.ConnectionId.send(JSON.stringify({
                                    type: "callrejected",
                                    data: {}
                                }));
                            }
                            if (item.Caller.ConnectionId != null) {
                                item.Caller.ConnectionId.send(JSON.stringify({
                                    type: "RejectCall",
                                    data: {}
                                }));
                            }
                            objeIndex = index;
                            return;
                        }
                    })
                    if (objeIndex > -1) {
                        var _Caller = _UserCalls[objeIndex].Caller;
                        var _Callee = _UserCalls[objeIndex].Callee;
                        _.each(_Users, function(item) {
                            if (item.ConnectionId != null && (item.Username == _Caller.uid || item.Username == _Callee.uid) && (item.ConnectionId != _Caller.ConnectionId && item.ConnectionId != _Callee.ConnectionId)) {
                                item.ConnectionId.send(JSON.stringify({
                                    type: "callrejected",
                                    data: {}
                                }));
                            }
                        });
                        Call_StartEnd(_Caller.uid, _Callee.uid, 'End', _Caller.channel, _Caller.appid);
                        _UserCalls.splice(objeIndex, 1);
                    }
                    break;
                case 'AcceptCall':
                    _.each(_UserCalls, function(item, index) {
                        if (item.Callee.uid == data.params.from) {
                            item.Callee.ConnectionId = ws;
                            if (item.Caller.ConnectionId != null) {
                                item.Caller.ConnectionId.send(JSON.stringify({
                                    type: "AcceptCall",
                                    data: item.Caller
                                }));
                            }
                            if (item.Callee.ConnectionId != null) {
                                item.Callee.ConnectionId.send(JSON.stringify({
                                    type: "AcceptCall",
                                    data: item.Callee
                                }));
                            }
                            objeIndex = index;
                            return;
                        }
                    })
                    var _Caller = _UserCalls[objeIndex].Caller;
                    var _Callee = _UserCalls[objeIndex].Callee;

                    _.each(_Users, function(item) {
                        if (item.ConnectionId != null && (item.Username == _Caller.uid || item.Username == _Callee.uid)) {
                            item.ConnectionId.send(JSON.stringify({
                                type: "CallAccepted",
                                data: {}
                            }));
                        }
                    });
                    break;
                case 'Callping':
                    _.each(_UserCalls, function(item, index) {
                        if (item.Callee.uid == data.params.from && item.Callee.ConnectionId == null) {
                            ws.send(JSON.stringify({
                                type: "IncommingCall",
                                data: {
                                    from: item.Caller.uid,
                                    fromname: item.Caller.name
                                }
                            }))
                            return;
                        }
                        if ((item.Caller.ConnectionId != null && item.Callee.ConnectionId != null)) {
                            if (item.Caller.ConnectionId != null && item.Caller.ConnectionId == ws) {
                                ws.send(JSON.stringify({
                                    type: "RunningCall",
                                    data: {
                                        from: item.Callee.uid,
                                        fromname: item.Callee.name
                                    }
                                }))
                            }
                            if (item.Callee.ConnectionId != null && item.Callee.ConnectionId == ws) {
                                ws.send(JSON.stringify({
                                    type: "RunningCall",
                                    data: {
                                        from: item.Caller.uid,
                                        fromname: item.Caller.name
                                    }
                                }))
                            }
                        }
                    })
                    break;
            }
        } catch (error) {
            console.log("error :" + error);
        }
    });
    ws.on("close", () => {
        try {
            var current_user = _.filter(_Users, function(item) {
                return item.ConnectionId == ws
            });
			
			
            _Users = _.filter(_Users, function(item) {
                return item.ConnectionId != ws
            });
            if (current_user.length > 0 && current_user[0].IsSeller) {
                if (_.where(_Users, {
                        Username: current_user[0].Username
                    }).length == 0) {
                    _.each(_.where(_Users, {
                        Sellername: current_user[0].Username
                    }), function(item) {
                        if (item.ConnectionId != null) {
                            item.ConnectionId.send(JSON.stringify({
                                type: "UserAvailability",
                                data: {
                                    message: "offline"
                                }
                            }))
                        }
                    })
                }
            } else {
                _.each(_.where(_Users, {
                    Username: current_user[0].Sellername
                }), function(item) {
                    var _UpdateUserList = [];
                    _.each(_.where(_Users, {
                        Sellername: item.Username
                    }), function(item1) {
                        if (_.filter(_UpdateUserList, function(item2) {
                                return item2.Username == item1.Username && item2.Name == item1.Name
                            }).length == 0) {
                            _UpdateUserList.push({
                                "Username": item1.Username,
                                "Name": item1.Name
                            })
                        }
                    })
                    if (item.ConnectionId != null) {
                        item.ConnectionId.send(JSON.stringify({
                            type: "UpdateUserList",
                            data: {
                                data: _UpdateUserList
                            }
                        }))
                    }
                })
            }

            var objeIndex = -1;
            _.each(_UserCalls, function(item, index) {
                if (item.Caller.ConnectionId != null && item.Caller.ConnectionId == ws) {
                    if (item.Callee.ConnectionId != null) {
                        item.Callee.ConnectionId.send(JSON.stringify({
                            type: "RejectCall",
                            data: {}
                        }));
                    }
                    if (item.Caller.ConnectionId != null) {
                        item.Caller.ConnectionId.send(JSON.stringify({
                            type: "RejectCall",
                            data: {}
                        }));
                    }
                    objeIndex = index;
                    return;
                }
                if (item.Callee.ConnectionId != null && item.Callee.ConnectionId == ws) {
                    if (item.Caller.ConnectionId != null) {
                        item.Caller.ConnectionId.send(JSON.stringify({
                            type: "RejectCall",
                            data: {}
                        }));
                    }
                    if (item.Callee.ConnectionId != null) {
                        item.Caller.ConnectionId.send(JSON.stringify({
                            type: "RejectCall",
                            data: {}
                        }));
                    }
                    objeIndex = index;
                    return;
                }
            })
            if (objeIndex > -1) {
                var _Caller = _UserCalls[objeIndex].Caller;
                var _Callee = _UserCalls[objeIndex].Callee;
                _.each(_Users, function(item) {
                    if (item.ConnectionId != null && (item.Username == _Caller.uid || item.Username == _Callee.uid)) {
                        item.ConnectionId.send(JSON.stringify({
                            type: "RejectCall",
                            data: {}
                        }));
                    }
                });
                Call_StartEnd(_Caller.uid, _Callee.uid, 'End', _Caller.channel, _Caller.appid);
                _UserCalls.splice(objeIndex, 1);
            }
        } catch (error) {
            console.log(error)
        }
    });
});
