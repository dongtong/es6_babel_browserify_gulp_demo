/*
* Common util object
*/
import {Const} from './const';

let Util = {
  /*
  * @function ajaxReq
  * @param {object} options - ajax request params object
  * @example Util.ajaxReq(object)
  */
  ajaxReq: function(options){
      var retryTimes = Const.RETRY_TIMES;

      function req(){
            $.ajax({
                type: options.type || "GET",
                url: options.url,
                data: options.data || {},
                cache: false,
                timeout: Const.TIME_OUT,
                crossDomain: true,
                dataType: "jsonp",
                jsonpCallback: options.jsonpCallback || null,
                contentType: "application/json;utf-8",
                success: function(data, status, xhr){
                    if(typeof options.successFn === 'function') {
                        options.successFn(data);
                    }
                },
                error: function(xhr, status, errorThrown){
                    //timeout异常交给complete处理
                    if(status !== 'timeout' && !options.observeRes()) {
                        if(typeof options.errorFn === 'function') {
                            options.errorFn();
                        }else{
                            Util.redirectToErr('0');
                        }
                    }
                },
                complete: function(xhr, status) {
                    //status: success,notmodified,nocontent,error,timeout,abort,parsererror
                    if(status === 'timeout' && !options.observeRes()) {
                        //console.log('retry-',retryTimes)
                        if(options.retry === undefined || options.retry) {
                            if(retryTimes > 0) {
                                retryTimes = retryTimes - 1;
                                req();
                            } else {
                                if(options.timeoutFn){
                                    options.timeoutFn();
                                }else{
                                    Util.redirectToErr('1');
                                }
                            }
                        } else {
                            if(options.timeoutFn){
                                options.timeoutFn();
                            }else{
                                Util.redirectToErr('1');
                            }
                        }

                    }

                }
            });
      }

      req();
  },

  redirectToErr: function(errType){
    switch(errType) {
        case Const.ERR_CODE.ONE:
            console.error('timeout error');
            break;
        case Const.ERR_CODE.TWO:
            console.error('timeout error');
            break;
        default:
            console.error('other error');
    }
  }
}

export {Util};
