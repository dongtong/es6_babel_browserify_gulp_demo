/*
* @class TodosCtrl
*/

import {Todo} from '../models/todo';
import {Util} from '../common/util';
import Edit from '../views/todos/edit';


class TodosCtrl {
  constructor() {
    //define current class namespace
    window.todosNS = window.todosNs || {};
  }

  initList() {
    var hasResult = false,
        that = this;

    todosNS.gotTodos = function(res) {
      hasResult = true;
      if(res.data.length) {
          res.data.map((item) => {
              $('.todos-list').append(
                  '<li data-id="' + item.id + '"><span>' + item.content + '</span>' +
                    '<span class="actions">' +
                      '<span class="action edit glyphicon glyphicon-pencil" id="eidt_'+item.id+'"></span>' +
                      '<span class="action remove glyphicon glyphicon-remove" id="remove_'+item.id+'"></span>' +
                    '</span>' +
                  '</li>'
              );
          });
          that.observeTodoList();
      }else{
          $('.todos-list').append('<li>没有待办事项...</li>');
      }

    }

    Util.ajaxReq({
      url: 'http://localhost:3000/api/v2/todos',
      jsonpCallback: 'todosNS.gotTodos',
      observeRes: function(){return hasResult;}
    })
  }

  observeTodoList() {
    let $this = this;
    $('.todos-list li').on('mouseover', function(){
      $(this).find('.actions').show();
    }).on('mouseout', function(){
      $(this).find('.actions').hide();
    });

    $('.todos-list').on('click', '.edit', function(){ // can not use () =>
        $this.edit({
          id: $(this).attr('id'),
          value: $(this).parent().prev().text()
        });
    }).on('click', '.remove', () => {
        $this.remove($(this).attr('id'))
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
    let $this = this,
        $li = $('#' + params.id).parents('li');

    $li.html(Edit(params))
       .find('input').on('keyup', function(e){
           let newContent = $(this).val();
           if(e.which == 13) {
               $this.update({
                   url: 'http://localhost:3000/api/v2/todos/' + params.id.split('_')[1] + '/update?content=' + encodeURIComponent(newContent),
                   done: function(res){
                       if(res.success) {
                           $li.html(
                             '<span>' + res.content + '</span>' +
                               '<span class="actions">' +
                                 '<span class="action edit glyphicon glyphicon-pencil" id="eidt_'+res.id+'"></span>' +
                                 '<span class="action remove glyphicon glyphicon-remove" id="remove_'+res.id+'"></span>' +
                             '</span>'
                           );
                       }else{
                         alert('更新失败')
                       }

                   }
               });
            }
    });
  }

  update(params) {
    let hasResult = false;

    todosNS.updatedTodo = function(res) {
        hasResult = true;
        params.done(res);
    }

    Util.ajaxReq({
      type: 'PATCH',
      url: params.url,
      jsonpCallback: 'todosNS.updatedTodo',
      observeRes: function(){return hasResult;}
    });
  }

  remove(options) {
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
