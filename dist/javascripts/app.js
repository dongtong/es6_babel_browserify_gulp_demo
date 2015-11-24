(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
* @module App
*/

'use strict';

var _controllersTodos_ctrl = require('./controllers/todos_ctrl');

//var todosCtrl = new TodosCtrl();

//todosCtrl.initList()

(function () {
  var todosCtrl = new _controllersTodos_ctrl.TodosCtrl();
  todosCtrl.initList();

  $('.todos-list li').on('mouseover', function () {
    $(this).find('.actions').show();
  }).on('mouseout', function () {
    $(this).find('.actions').hide();
  });

  $('.todos-list .action').on('click', function () {
    if ($(this).hasClass('edit')) {
      alert('edit');
    } else {
      alert('remove');
    }
  });
})();

},{"./controllers/todos_ctrl":4}],2:[function(require,module,exports){
/*
* Const
*/
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Const = {
  RETRY_TIMES: 3, //default request three times when ajax request timeout
  TIME_OUT: 3000, //timeout is 3s
  ERR_CODE: {
    ONE: '1', //timeout
    TWO: '2' //system error
  }
};

exports.Const = Const;

},{}],3:[function(require,module,exports){
/*
* Common util object
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _const = require('./const');

var Util = {
    /*
    * @function ajaxReq
    * @param {object} options - ajax request params object
    * @example Util.ajaxReq(object)
    */
    ajaxReq: function ajaxReq(options) {
        var retryTimes = _const.Const.RETRY_TIMES;

        function req() {
            $.ajax({
                type: options.type || "GET",
                url: options.url,
                data: options.data || {},
                cache: false,
                timeout: _const.Const.TIME_OUT,
                crossDomain: true,
                dataType: "jsonp",
                jsonpCallback: options.jsonpCallback || null,
                contentType: "application/json;utf-8",
                success: function success(data, status, xhr) {
                    if (typeof options.successFn === 'function') {
                        options.successFn(data);
                    }
                },
                error: function error(xhr, status, errorThrown) {
                    //timeout异常交给complete处理
                    if (status !== 'timeout' && !options.observeRes()) {
                        if (typeof options.errorFn === 'function') {
                            options.errorFn();
                        } else {
                            Util.redirectToErr('0');
                        }
                    }
                },
                complete: function complete(xhr, status) {
                    //status: success,notmodified,nocontent,error,timeout,abort,parsererror
                    if (status === 'timeout' && !options.observeRes()) {
                        //console.log('retry-',retryTimes)
                        if (options.retry === undefined || options.retry) {
                            if (retryTimes > 0) {
                                retryTimes = retryTimes - 1;
                                req();
                            } else {
                                if (options.timeoutFn) {
                                    options.timeoutFn();
                                } else {
                                    Util.redirectToErr('1');
                                }
                            }
                        } else {
                            if (options.timeoutFn) {
                                options.timeoutFn();
                            } else {
                                Util.redirectToErr('1');
                            }
                        }
                    }
                }
            });
        }

        req();
    },

    redirectToErr: function redirectToErr(errType) {
        switch (errType) {
            case _const.Const.ERR_CODE.ONE:
                console.error('timeout error');
                break;
            case _const.Const.ERR_CODE.TWO:
                console.error('timeout error');
                break;
            default:
                console.error('other error');
        }
    }
};

exports.Util = Util;

},{"./const":2}],4:[function(require,module,exports){
/*
* @class TodosCtrl
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _modelsTodo = require('../models/todo');

var _commonUtil = require('../common/util');

var TodosCtrl = (function () {
  function TodosCtrl() {
    _classCallCheck(this, TodosCtrl);
  }

  _createClass(TodosCtrl, [{
    key: 'initList',
    value: function initList() {
      var hasResult = false;

      var gotTodos = function gotTodos(data) {
        hasResult = true;
      };

      var todos = _commonUtil.Util.ajaxReq({
        url: 'http://localhost:3000/api/v1/todos',
        jsonpCallback: 'gotTodos',
        observeRes: function observeRes() {
          return hasResult;
        }
      });
    }
  }, {
    key: 'create',
    value: function create(params) {
      var todoItem = new _modelsTodo.Todo(params);
      if (todoItem.save) {
        return { success: true };
      } else {
        return { success: false };
      }
    }
  }, {
    key: 'edit',
    value: function edit(params) {}
  }, {
    key: 'update',
    value: function update(params) {}
  }, {
    key: 'destroy',
    value: function destroy(options) {
      var result = _commonUtil.Util.ajaxReq({
        type: 'DELETE',
        data: options.params["id"]
      }).done(function (data) {
        options.done(data);
      }).fail(function () {
        if (options.fail) {
          options.fail();
        } else {
          _commonUtil.Util.ajaxFailCallbak();
        }
      });
    }
  }]);

  return TodosCtrl;
})();

exports.TodosCtrl = TodosCtrl;

},{"../common/util":3,"../models/todo":5}],5:[function(require,module,exports){
/*
* @class Todo
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Todo = function Todo() {
  _classCallCheck(this, Todo);
};

exports.Todo = Todo;

},{}]},{},[1]);
