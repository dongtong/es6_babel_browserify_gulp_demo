(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
* @module App
*/

'use strict';

var _controllersTodos_ctrl = require('./controllers/todos_ctrl');

(function () {
    var todosCtrl = new _controllersTodos_ctrl.TodosCtrl();
    todosCtrl.initList();
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _modelsTodo = require('../models/todo');

var _commonUtil = require('../common/util');

var _viewsTodosEdit = require('../views/todos/edit');

var _viewsTodosEdit2 = _interopRequireDefault(_viewsTodosEdit);

var TodosCtrl = (function () {
    function TodosCtrl() {
        _classCallCheck(this, TodosCtrl);

        //define current class namespace
        window.todosNS = window.todosNs || {};
    }

    _createClass(TodosCtrl, [{
        key: 'initList',
        value: function initList() {
            var hasResult = false,
                that = this;

            that.observeNew();

            todosNS.gotTodos = function (res) {
                hasResult = true;
                if (res.data.length) {
                    res.data.map(function (item) {
                        $('.todos-list').append('<li data-id="' + item.id + '"><span>' + item.content + '</span>' + '<span class="actions">' + '<span class="action edit glyphicon glyphicon-pencil" id="eidt_' + item.id + '"></span>' + '<span class="action remove glyphicon glyphicon-remove" id="remove_' + item.id + '"></span>' + '</span>' + '</li>');
                    });
                    that.observeTodoList();
                } else {
                    $('.todos-list').append('<li>没有待办事项...</li>');
                }
            };

            _commonUtil.Util.ajaxReq({
                url: 'http://localhost:3000/api/v2/todos',
                jsonpCallback: 'todosNS.gotTodos',
                observeRes: function observeRes() {
                    return hasResult;
                }
            });
        }
    }, {
        key: 'observeTodoList',
        value: function observeTodoList() {
            var $this = this;
            $('.todos-list li').on('mouseover', function () {
                $(this).find('.actions').show();
            }).on('mouseout', function () {
                $(this).find('.actions').hide();
            });

            $('.todos-list').on('click', '.edit', function () {
                // can not use () =>
                $this.edit({
                    id: $(this).attr('id'),
                    value: $(this).parent().prev().text()
                });
            }).on('click', '.remove', function () {
                $this.remove($(this).attr('id').split('_')[1]);
            });
        }
    }, {
        key: 'observeNew',
        value: function observeNew() {
            var $this = this;
            $('form').on('submit', function (e) {
                e.preventDefault();
                $this.create($('#new_todo').val());
                return false;
            });
        }
    }, {
        key: 'create',
        value: function create(content) {
            var $this = this,
                hasResult = false;

            todosNS.addedTodo = function (res) {
                hasResult = true;
                if (res.success) {
                    $('#new_todo').val("");
                    var newItem = '<li data-id="' + res.id + '"><span>' + res.content + '</span>' + '<span class="actions">' + '<span class="action edit glyphicon glyphicon-pencil" id="eidt_' + res.id + '"></span>' + '<span class="action remove glyphicon glyphicon-remove" id="remove_' + res.id + '"></span>' + '</span>' + '</li>';

                    if ($('.todos-list span').length) {
                        $('.todos-list').append(newItem);
                    } else {
                        $('.todos-list').html(newItem);
                    }
                    $this.observeAddedItem();
                } else {
                    alert('添加失败!');
                }
            };

            _commonUtil.Util.ajaxReq({
                url: 'http://localhost:3000/api/v2/todos/add?content=' + content,
                jsonpCallback: 'todosNS.addedTodo',
                observeRes: function observeRes() {
                    return hasResult;
                }
            });
        }
    }, {
        key: 'observeAddedItem',
        value: function observeAddedItem() {
            $('.todos-list li:last-child').on('mouseover', function () {
                $(this).find('.actions').show();
            }).on('mouseout', function () {
                $(this).find('.actions').hide();
            }).on('click', '.edit', function () {
                // can not use () =>
                $this.edit({
                    id: $(this).attr('id'),
                    value: $(this).parent().prev().text()
                });
            }).on('click', '.remove', function () {
                $this.remove($(this).attr('id').split('_')[1]);
            });
        }
    }, {
        key: 'edit',
        value: function edit(params) {
            //TODO move to model
            var $this = this,
                $li = $('#' + params.id).parents('li');

            $li.html((0, _viewsTodosEdit2['default'])(params)).find('input').on('keyup', function (e) {
                var newContent = $(this).val();
                if (e.which == 13) {
                    $this.update({
                        url: 'http://localhost:3000/api/v2/todos/' + params.id.split('_')[1] + '/update?content=' + encodeURIComponent(newContent),
                        done: function done(res) {
                            if (res.success) {
                                $li.html('<span>' + res.content + '</span>' + '<span class="actions">' + '<span class="action edit glyphicon glyphicon-pencil" id="eidt_' + res.id + '"></span>' + '<span class="action remove glyphicon glyphicon-remove" id="remove_' + res.id + '"></span>' + '</span>');
                            } else {
                                alert('更新失败');
                            }
                        }
                    });
                }
            });
        }
    }, {
        key: 'update',
        value: function update(params) {
            var hasResult = false;

            todosNS.updatedTodo = function (res) {
                hasResult = true;
                params.done(res);
            };

            _commonUtil.Util.ajaxReq({
                type: 'PATCH',
                url: params.url,
                jsonpCallback: 'todosNS.updatedTodo',
                observeRes: function observeRes() {
                    return hasResult;
                }
            });
        }
    }, {
        key: 'remove',
        value: function remove(id) {
            var $this = this,
                hasResult = false,
                $li = $('#remove_' + id).parents('li');

            todosNS.removedTodo = function (res) {
                hasResult = true;
                if (res.success) {
                    if ($('.todos-list li').length == 1) {
                        $li.replaceWith('<li>没有待办事项...</li>');
                    } else {
                        $li.remove();
                    }
                } else {
                    alert('删除失败!');
                }
            };

            _commonUtil.Util.ajaxReq({
                url: 'http://localhost:3000/api/v2/todos/' + id + '/delete',
                jsonpCallback: 'todosNS.removedTodo',
                observeRes: function observeRes() {
                    return hasResult;
                }
            });
        }
    }]);

    return TodosCtrl;
})();

exports.TodosCtrl = TodosCtrl;

},{"../common/util":3,"../models/todo":5,"../views/todos/edit":6}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (options) {
  return "<input id=\"" + options.id + "_input\" class=\"edit_input\" value=\"" + options.value + "\"></input>";
};

module.exports = exports["default"];

},{}]},{},[1]);
