/*
* @class TodosCtrl
*/

import {Todo} from '../models/todo';
import {Util} from '../common/util';

class TodosCtrl {
  constructor() {

  }

  initList() {
    var hasResult = false;

    let gotTodos = function(data) {
      hasResult = true;
    }

    let todos = Util.ajaxReq({
      url: 'http://localhost:3000/api/v1/todos',
      jsonpCallback: 'gotTodos',
      observeRes: function(){return hasResult;}
    })
  }

  create(params) {
    let todoItem = new Todo(params);
    if(todoItem.save){
      return {success: true};
    }else{
      return {success: false};
    }
  }

  edit(params) {

  }

  update(params) {

  }

  destroy(options) {
    let result = Util.ajaxReq({
      type: 'DELETE',
      data: options.params["id"]
    }).done(function(data){
      options.done(data);
    }).fail(function(){
      if(options.fail){
        options.fail();
      }else{
        Util.ajaxFailCallbak();
      }
    })
  }
}

export {TodosCtrl};
